
import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'https://esm.sh/three@0.160.0';
import { GlobeState, FillMode, ArcDistribution, SurfaceStyle, BlendMode } from '../types';
import { GEOJSON_URL, CAPITAL_COORDS } from '../constants';

interface GlobeViewProps {
  state: GlobeState;
  onGlobeUpdate?: (updates: Partial<GlobeState>) => void;
}

const GEOMETRY_CACHE: Record<string, THREE.BufferGeometry> = {};
const getCachedGeometry = (sides: number, size: number, height: number, isDot: boolean) => {
  const key = isDot ? `dot-${size}` : `poly-${sides}-${size}-${height}`;
  if (!GEOMETRY_CACHE[key]) {
    if (isDot) {
      GEOMETRY_CACHE[key] = new THREE.SphereGeometry(size || 0.1, 8, 8);
    } else {
      const h = height || 0.1;
      const s = size || 0.1;
      const geom = new THREE.CylinderGeometry(s, s, h, sides || 6);
      geom.translate(0, h / 2, 0);
      GEOMETRY_CACHE[key] = geom;
    }
  }
  return GEOMETRY_CACHE[key];
};

const MATERIAL_CACHE: Record<string, THREE.Material> = {};
const getCachedMaterial = (d: any) => {
  if (!d) return new THREE.MeshBasicMaterial({ visible: false });
  const key = `mat-${d.color || 'white'}-${d.color2 || 'white'}-${d.opacity || 1}-${d.gridHeight || 0}-${d.gradientAxis || 'Y'}-${d.gridSegments || 1}-${d.gridGap || 0}-${d.pattern || 0}-${d.size || 0}`;
    
  if (!MATERIAL_CACHE[key]) {
    MATERIAL_CACHE[key] = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        color1: { value: new THREE.Color(d.color || '#ffffff') },
        color2: { value: new THREE.Color(d.color2 || '#ffffff') },
        opacity: { value: d.opacity ?? 1.0 },
        height: { value: d.gridHeight || 0.1 },
        size: { value: d.size || 0.1 },
        axis: { value: d.gradientAxis === 'X' ? 0 : (d.gradientAxis === 'Y' ? 1 : 2) },
        segments: { value: d.gridSegments || 1 },
        gap: { value: d.gridGap || 0 },
        pattern: { value: d.pattern || 0 } 
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  }
  return MATERIAL_CACHE[key];
};

const vertexShader = `
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;
  void main() {
    vLocalPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform float opacity;
  uniform float height;
  uniform float size;
  uniform int axis; 
  uniform float segments;
  uniform float gap;
  uniform int pattern;

  void main() {
    if (segments > 1.0) {
      float segmentSize = height / segments;
      float relativeY = vLocalPosition.y;
      float posInSegment = mod(relativeY, segmentSize);
      float gapThreshold = segmentSize * gap;
      if (posInSegment < gapThreshold) discard;
    }
    vec3 finalColor = color1;
    float t = 0.5;
    if (axis == 0) t = (vLocalPosition.x / (size + 0.001)) + 0.5;
    else if (axis == 1) t = clamp(vLocalPosition.y / (height + 0.001), 0.0, 1.0);
    else if (axis == 2) t = (vLocalPosition.z / (size + 0.001)) + 0.5;
    finalColor = mix(color1, color2, clamp(t, 0.0, 1.0));
    gl_FragColor = vec4(finalColor, opacity);
  }
`;

const computeBBox = (geometry: any) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const processPoints = (pts: number[][]) => {
    pts.forEach(([x, y]) => {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    });
  };
  if (geometry.type === 'Polygon') processPoints(geometry.coordinates[0]);
  else if (geometry.type === 'MultiPolygon') geometry.coordinates.forEach((poly: any) => processPoints(poly[0]));
  return { minX, minY, maxX, maxY };
};

function isPointInPoly(pt: [number, number], poly: number[][]) {
  let isInside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

const SAT_IMG_URL = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

const setBlendMode = (ctx: CanvasRenderingContext2D, mode: BlendMode) => {
  if (mode === 'source-over') ctx.globalCompositeOperation = 'source-over';
  else if (mode === 'overlay') ctx.globalCompositeOperation = 'overlay';
  else if (mode === 'multiply') ctx.globalCompositeOperation = 'multiply';
  else if (mode === 'screen') ctx.globalCompositeOperation = 'screen';
  else if (mode === 'darken') ctx.globalCompositeOperation = 'darken';
  else if (mode === 'lighten') ctx.globalCompositeOperation = 'lighten';
  else ctx.globalCompositeOperation = 'source-over';
};

const withOpacity = (colorStr: string, opacity: number) => {
    try {
        const c = new THREE.Color(colorStr);
        return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${opacity.toFixed(3)})`;
    } catch (e) {
        return `rgba(255, 255, 255, ${opacity.toFixed(3)})`;
    }
};

const fetchWithProgress = async (url: string, onProgress: (loaded: number, total: number) => void) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body?.getReader();
    const chunks = [];

    if (reader) {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            loaded += value.length;
            if (total) onProgress(loaded, total);
        }
    } else {
        const blob = await response.blob();
        return new Response(blob);
    }

    const allChunks = new Uint8Array(loaded);
    let position = 0;
    for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
    }
    
    return new Response(allChunks);
};

export const GlobeView = React.memo<GlobeViewProps>(({ state, onGlobeUpdate }) => {
  const globeRef = useRef<any>();
  const [countries, setCountries] = useState<any>({ features: [] });
  const [satImage, setSatImage] = useState<HTMLImageElement | null>(null);
  const [generatedTexture, setGeneratedTexture] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [focalScreenPos, setFocalScreenPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    let frameId: number;
    const updateFocusPos = () => {
      const globe = globeRef.current;
      if (globe && state.postProcessing?.focalLat !== undefined) {
        const pos = globe.getCoords(state.postProcessing.focalLat, state.postProcessing.focalLng, 0);
        if (pos) {
          const vector = new THREE.Vector3(pos.x, pos.y, pos.z);
          vector.project(globe.camera());
          const x = (vector.x * 0.5 + 0.5) * 100;
          const y = (-(vector.y) * 0.5 + 0.5) * 100;
          setFocalScreenPos({ x, y });
        }
      } else {
        setFocalScreenPos({ x: 50, y: state.postProcessing?.focus ?? 50 });
      }
      frameId = requestAnimationFrame(updateFocusPos);
    };
    if (state.postProcessing?.enabled) {
      updateFocusPos();
    }
    return () => cancelAnimationFrame(frameId);
  }, [state.postProcessing?.focalLat, state.postProcessing?.focalLng, state.postProcessing?.enabled, state.postProcessing?.focus]);

  const dofMaskStyles = useMemo(() => {
    if (!state.postProcessing?.enabled || !state.postProcessing.dofEnabled || state.postProcessing.blur <= 0) return { display: 'none' };
    const { blur, fstop, opacity = 100 } = state.postProcessing;
    const range = fstop ?? 30;
    const inner = Math.max(0, range / 2);
    const outer = Math.max(inner + 10, range);
    const effectiveOpacity = opacity / 100;
    
    return {
      backdropFilter: `blur(${(blur / 5) * effectiveOpacity}px)`,
      maskImage: `radial-gradient(circle at ${focalScreenPos.x}% ${focalScreenPos.y}%, transparent ${inner}%, black ${outer}%)`,
      WebkitMaskImage: `radial-gradient(circle at ${focalScreenPos.x}% ${focalScreenPos.y}%, transparent ${inner}%, black ${outer}%)`,
      opacity: effectiveOpacity,
      transition: 'backdrop-filter 0.3s ease-out, opacity 0.3s ease-out'
    };
  }, [state.postProcessing, focalScreenPos]);

  const filterString = useMemo(() => {
    if (!state.postProcessing || !state.postProcessing.enabled) return 'none';
    const pp = state.postProcessing;
    const intensity = (pp.opacity ?? 100) / 100;
    
    let filters = '';
    
    if (pp.brightnessEnabled) {
      const bIntensity = (pp.brightnessIntensity ?? 100) / 100 * intensity;
      if (pp.brightness !== 100) {
          const b = 100 + (pp.brightness - 100) * bIntensity;
          filters += ` brightness(${b}%)`;
      }
      if (pp.contrast !== 100) {
          const c = 100 + (pp.contrast - 100) * bIntensity;
          filters += ` contrast(${c}%)`;
      }
    }

    if (pp.hueEnabled) {
        const hIntensity = (pp.hueIntensity ?? 100) / 100 * intensity;
        
        // UI range 0-100 maps to 0-360 degrees
        if (pp.hue !== 0) {
            const h = (pp.hue * 3.6) * hIntensity;
            filters += ` hue-rotate(${h}deg) `;
        }
        
        // UI range 0-100 maps to 0-1000% saturation
        // Normal saturation is UI value 10 (100%)
        if (pp.saturation !== 10) {
            const sValue = pp.saturation * 10;
            const s = 100 + (sValue - 100) * hIntensity;
            filters += ` saturate(${s}%) `;
        }
    }
    if (pp.bloomEnabled && pp.bloom > 0) {
        filters += ` url(#bloom-filter) `;
    }
    if (pp.blur > 0 && !pp.dofEnabled && !state.postProcessing.focalLat) {
        filters += ` blur(${(pp.blur / 40) * intensity}px) `;
    }
    if (pp.chromaticEnabled && pp.chromatic > 0) {
        filters += ` url(#chromatic-dv-filter) `;
    }
    return filters.trim() || 'none';
  }, [state.postProcessing]);

  const handleGlobeClick = ({ lat, lng }: { lat: number, lng: number }) => {
    if (state.postProcessing?.isPicking && onGlobeUpdate) {
      onGlobeUpdate({
        postProcessing: {
          ...state.postProcessing,
          focalLat: lat,
          focalLng: lng,
          isPicking: false
        }
      });
    }
  };

  const { 
    landConfig = { style: SurfaceStyle.REALISTIC, color: '#1a1a1a', opacity: 1.0, gradientEnabled: false, color2: '#333333' },
    oceanConfig = { style: SurfaceStyle.REALISTIC, color: '#050505', opacity: 1.0, gradientEnabled: true, color2: '#111111' },
    satellite = { show: true, opacity: 0.5, blendMode: 'overlay' as BlendMode },
    globalBorder = { visible: true, width: 0.6, color: '#00f2ff', color2: '#ffffff', gradientEnabled: false, opacity: 0.99 },
    gridLayers = [],
    strata = [],
    countries: stateCountries = [],
    atmosphere = { show: true, color: '#00f2ff', altitude: 0.15 }
  } = state || {};

  useEffect(() => {
    const globe = globeRef.current;
    if (globe) {
      globe.controls().autoRotate = state.autoRotate;
      globe.controls().autoRotateSpeed = 0.5;
    }
  }, [state.autoRotate]);

  useEffect(() => {
    const loadData = async () => {
        try {
            const jsonResponse = await fetchWithProgress(GEOJSON_URL, (loaded, total) => {
                const safeTotal = total || 2500000; 
                const percent = Math.min(1, loaded / safeTotal);
                setLoadingProgress(Math.round(percent * 60));
            });
            const geoJsonData = await jsonResponse.json();
            setLoadingProgress(60);

            const imgResponse = await fetchWithProgress(SAT_IMG_URL, (loaded, total) => {
                const safeTotal = total || 1000000; 
                const percent = Math.min(1, loaded / safeTotal);
                setLoadingProgress(60 + Math.round(percent * 40));
            });
            const imgBlob = await imgResponse.blob();
            const imgUrl = URL.createObjectURL(imgBlob);
            const image = new Image();
            image.src = imgUrl;
            await new Promise((resolve) => {
                image.onload = resolve;
                image.onerror = resolve; 
            });
            
            setLoadingProgress(100);

            const china = geoJsonData.features.find((f: any) => f.properties.ISO_A3 === 'CHN');
            const taiwan = geoJsonData.features.find((f: any) => f.properties.ISO_A3 === 'TWN');
            if (china && taiwan) {
                if (china.geometry.type === 'Polygon') {
                    china.geometry.type = 'MultiPolygon';
                    china.geometry.coordinates = [china.geometry.coordinates];
                }
                if (taiwan.geometry.type === 'Polygon') china.geometry.coordinates.push(taiwan.geometry.coordinates);
                else if (taiwan.geometry.type === 'MultiPolygon') china.geometry.coordinates.push(...taiwan.geometry.coordinates);
                geoJsonData.features = geoJsonData.features.filter((f: any) => f.properties.ISO_A3 !== 'TWN');
            }
            geoJsonData.features.forEach((f: any) => { f._bbox = computeBBox(f.geometry); });
            
            setCountries(geoJsonData);
            setSatImage(image);
        } catch (error) {
            console.error("Failed to load globe data", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!countries.features.length) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 1024, 512);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    if (oceanConfig.gradientEnabled) {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, oceanConfig.color || '#000000');
        grad.addColorStop(1, oceanConfig.color2 || '#111111');
        ctx.fillStyle = grad;
    } else {
        ctx.fillStyle = oceanConfig.color || '#000000';
    }
    ctx.globalAlpha = oceanConfig.opacity ?? 1.0; 
    ctx.fillRect(0, 0, 1024, 512);
    ctx.restore();

    if (landConfig.style === SurfaceStyle.SOLID || landConfig.style === SurfaceStyle.REALISTIC) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        countries.features.forEach((f: any) => {
            const drawPolygon = (ring: number[][]) => {
                const first = ring[0];
                ctx.moveTo((first[0] + 180) * (1024 / 360), (90 - first[1]) * (512 / 180));
                for (let i = 1; i < ring.length; i++) {
                    ctx.lineTo((ring[i][0] + 180) * (1024 / 360), (90 - ring[i][1]) * (512 / 180));
                }
            };
            if (f.geometry.type === 'Polygon') {
                drawPolygon(f.geometry.coordinates[0]);
            } else if (f.geometry.type === 'MultiPolygon') {
                f.geometry.coordinates.forEach((poly: any) => drawPolygon(poly[0]));
            }
        });
        ctx.closePath();
        
        ctx.clip(); 

        if (landConfig.gradientEnabled) {
            const grad = ctx.createLinearGradient(0, 0, 0, 512);
            grad.addColorStop(0, landConfig.color || '#1a1a1a');
            grad.addColorStop(1, landConfig.color2 || '#333333');
            ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = landConfig.color || '#1a1a1a';
        }
        ctx.globalAlpha = landConfig.opacity ?? 1.0;
        ctx.fillRect(0, 0, 1024, 512);
        ctx.restore();
    }

    if (satellite.show && satImage) {
      ctx.save();
      setBlendMode(ctx, satellite.blendMode || 'overlay');
      ctx.globalAlpha = satellite.opacity ?? 1.0;
      ctx.drawImage(satImage, 0, 0, 1024, 512);
      ctx.restore();
    }

    setGeneratedTexture(canvas.toDataURL());
  }, [landConfig, oceanConfig, satellite, satImage, countries.features]);

  useEffect(() => {
    const updateMaterial = () => {
      const globe = globeRef.current;
      if (globe && typeof globe.globeMaterial === 'function') {
          const material = globe.globeMaterial();
          if (material) {
              material.color = new THREE.Color(0xffffff); 
              material.shininess = 5; 
              material.displacementMap = null;
              material.bumpMap = null;
              material.displacementScale = 0;
              material.wireframe = false; 
              material.transparent = true;
              material.opacity = 1.0; 
              material.needsUpdate = true;
          }
      }
    };
    updateMaterial();
  }, [generatedTexture]);

  const combinedLattice = useMemo(() => {
    const points: any[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); 
    
    if (state.showWireframe) {
        points.push({
            isWireframe: true,
            lat: 0, lng: 0, altitude: 0.005,
            color: state.wireframeColor || '#ffffff',
            opacity: state.wireframeOpacity ?? 0.1
        });
    }

    gridLayers.forEach((grid) => {
       if (!grid || !grid.visible) return;
       points.push({
          isGridLabLayer: true,
          ...grid
       });
    });

    strata.forEach((layer) => {
      if (!layer || !layer.visible || layer.fillMode === FillMode.COLOR) return;
      const n = layer.gridDensity || 1000;
      const rotation = new THREE.Euler((layer.rotationX || 0) * (Math.PI / 180), (layer.rotationY || 0) * (Math.PI / 180), (layer.rotationZ || 0) * (Math.PI / 180));
      
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2;
        const radius = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = phi * i;
        const lat = Math.asin(y) * (180 / Math.PI);
        const lng = Math.atan2(Math.sin(theta) * radius, Math.cos(theta) * radius) * (180 / Math.PI);
        
        if (!layer.showSea) {
            let onLand = false;
            for (const f of countries.features) {
                if (lng >= f._bbox.minX && lng <= f._bbox.maxX && lat >= f._bbox.minY && lat <= f._bbox.maxY) {
                    if (f.geometry.type === 'Polygon') {
                        if (isPointInPoly([lng, lat], f.geometry.coordinates[0])) { onLand = true; break; }
                    } else {
                        for (const poly of f.geometry.coordinates) {
                            if (isPointInPoly([lng, lat], poly[0])) { onLand = true; break; }
                        }
                        if (onLand) break;
                    }
                }
            }
            if (!onLand) continue;
        }

        points.push({
          lat, lng, altitude: (layer.altitude || 0) + 0.002, 
          size: layer.gridSize || 0.05, gridHeight: layer.gridHeight || 0.1, gridSegments: layer.gridSegments || 1, gridGap: layer.gridGap || 0.0,
          sides: layer.gridSides || 6, color: layer.gridColor || '#ffffff', color2: layer.gridColor2 || '#ffffff', gradientEnabled: layer.gridGradientEnabled || false,
          gradientAxis: layer.gridGradientAxis || 'Y', opacity: layer.opacity ?? 1.0, isDot: layer.fillMode === FillMode.DOT_MATRIX, rotation,
          pattern: 0
        });
      }
    });
    return points;
  }, [strata, gridLayers, state.showWireframe, state.wireframeColor, state.wireframeOpacity, countries.features]);

  const getPolygonAltitude = (d: any) => {
    if (!d || !d.properties) return 0.01;
    const countryConfig = stateCountries.find(c => c.id === d.properties.ISO_A3);
    const countryHeight = countryConfig ? countryConfig.height : 0;
    return (state.landAltitude || 0) + countryHeight;
  };

  const getCapColor = useMemo(() => (d: any) => {
    if (!d || !d.properties) return '#ffffff';
    const config = stateCountries.find(c => c.id === d.properties.ISO_A3);
    if (config) {
      if (config.textureSync) return 'rgba(0,0,0,0)'; 
      const opacity = config.opacity ?? 1.0;

      if (config.gradientEnabled && config.color2) {
        const capBaseColor = new THREE.Color(config.color || '#ffffff');
        const capTopColor = new THREE.Color(config.color2 || '#ffffff');
        const gradientRatio = (d.__altitude || 0.01) / getPolygonAltitude(d); 
        const mixedColor = capBaseColor.lerp(capTopColor, gradientRatio).getStyle();
        return withOpacity(mixedColor, opacity);
      }
      return withOpacity(config.color || '#ffffff', opacity);
    }
    
    if (landConfig.style === SurfaceStyle.REALISTIC) return 'rgba(0,0,0,0.01)';
    const landOpacity = landConfig.opacity ?? 1.0;
    if (landConfig.gradientEnabled) {
      const baseColor = new THREE.Color(landConfig.color || '#1a1a1a');
      const topColor = new THREE.Color(landConfig.color2 || '#333333');
      const mixedStyle = baseColor.lerp(topColor, 0.5).getStyle();
      return withOpacity(mixedStyle, landOpacity); 
    }
    return withOpacity(landConfig.color || '#1a1a1a', landOpacity);
  }, [landConfig, stateCountries, state.landAltitude]);

  const getHubCoords = (countryIso: string): { lat: number; lng: number } | null => {
    if (CAPITAL_COORDS[countryIso]) return CAPITAL_COORDS[countryIso];
    const feat = countries.features.find((f: any) => f.properties.ISO_A3 === countryIso);
    if (!feat) return null;
    const ring = feat.geometry.type === 'MultiPolygon' ? feat.geometry.coordinates[0][0] : feat.geometry.coordinates[0];
    let x = 0, y = 0;
    ring.forEach((p: any) => { x += p[0]; y += p[1]; });
    return { lat: y / ring.length, lng: x / ring.length };
  };

  const arcs = useMemo(() => {
    if (!countries.features.length) return [];
    const results: any[] = [];
    const len = countries.features.length;

    const currentOpacity = state.arcOpacity ?? 1.0;
    const arcColor = state.arcGradientEnabled 
      ? [withOpacity(state.arcColor, currentOpacity), withOpacity(state.arcColor2, currentOpacity)] 
      : withOpacity(state.arcColor, currentOpacity);

    const generateBundle = (c1: {lat:number, lng:number}, c2: {lat:number, lng:number}, config: any) => {
      const dLat = c2.lat - c1.lat;
      const dLng = c2.lng - c1.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
      const pLat = -dLng / dist;
      const pLng = dLat / dist;
      const mid = ((config.bundleSize || 1) - 1) / 2;

      for (let i = 0; i < (config.bundleSize || 1); i++) {
        const offset = (i - mid) * (config.spacing || 0);
        let startLat = c1.lat;
        let startLng = c1.lng;
        let endLat = c2.lat;
        let endLng = c2.lng;
        let altitude = config.curvature || 0.3;

        if (config.distribution === ArcDistribution.HORIZONTAL) {
           startLat += offset * pLat;
           startLng += offset * pLng;
           endLat += offset * pLat;
           endLng += offset * pLng;
        } else {
           altitude += offset * 0.5;
        }

        results.push({
          startLat, startLng, endLat, endLng,
          color: arcColor,
          altitude: Math.max(0.01, altitude)
        });
      }
    };
    
    if (state.randomArcs && state.randomArcs.visible) {
      for (let j = 0; j < (state.randomArcs.count || 0); j++) {
        const idx1 = Math.floor((j * 9301 + 49297) % len);
        const idx2 = Math.floor((j * 49297 + 9301) % len);
        const f1 = countries.features[idx1];
        const f2 = countries.features[idx2];
        if (f1 && f2 && idx1 !== idx2) {
          const c1 = getHubCoords(f1.properties.ISO_A3);
          const c2 = getHubCoords(f2.properties.ISO_A3);
          if (c1 && c2) generateBundle(c1, c2, state.randomArcs);
        }
      }
    }
    (state.arcGroups || []).forEach(group => {
      if (!group || !group.visible) return;
      const c1 = getHubCoords(group.startCountryId);
      const c2 = getHubCoords(group.endCountryId);
      if (c1 && c2) generateBundle(c1, c2, group);
    });
    return results;
  }, [state.randomArcs, state.arcGroups, countries.features, state.arcColor, state.arcColor2, state.arcGradientEnabled, state.arcOpacity]);

  const chromOffsetX = (state.postProcessing?.chromaticOffsetX ?? 15) * ((state.postProcessing?.chromatic ?? 0) / 100);
  const chromOffsetY = (state.postProcessing?.chromaticOffsetY ?? 15) * ((state.postProcessing?.chromatic ?? 0) / 100);
  const chromOpacity = ((state.postProcessing?.chromatic ?? 0) / 100) * ((state.postProcessing?.opacity ?? 100) / 100);

  // Bloom SVG filter parameters
  const bloomThreshold = state.postProcessing?.bloomThreshold ?? 0.36;
  const bloomSmoothing = state.postProcessing?.bloomSmoothing ?? 0.25;
  const bloomRadius = (state.postProcessing?.bloomRadius ?? 1.0) * 12; // Base radius scale
  const bloomStrength = (state.postProcessing?.bloomStrength ?? 2.7) * ((state.postProcessing?.bloom ?? 100) / 100);
  const bloomOverallOpacity = ((state.postProcessing?.opacity ?? 100) / 100);

  // Vignette parameters
  const vIntensity = (state.postProcessing?.vignetteIntensity ?? 100) / 100 * ((state.postProcessing?.opacity ?? 100) / 100);
  const vOffset = state.postProcessing?.vignetteOffset ?? 50;
  const vDarkness = (state.postProcessing?.vignetteDarkness ?? 80) / 100;

  // Noise dynamic parameters
  const noiseSize = (state.postProcessing?.noiseSize ?? 25);
  const noiseFreq = (101 - noiseSize) / 100; // Small size = high frequency
  const noiseOctaves = Math.ceil((state.postProcessing?.noiseRoughness ?? 50) / 20);
  const noiseAmount = (state.postProcessing?.noiseAmount ?? 36) / 100;
  const noiseIntensity = (state.postProcessing?.noiseIntensity ?? 100) / 100 * ((state.postProcessing?.opacity ?? 100) / 100);

  return (
    <div className={`w-full h-full relative overflow-hidden bg-black ${state.postProcessing?.isPicking ? 'cursor-crosshair' : ''}`}>
      <svg className="hidden">
        <defs>
          <filter id="pixelate">
            <feFlood floodOpacity="0" result="transparent" />
            <feMorphology operator="dilate" radius={Math.max(0.1, (state.postProcessing?.mosaicSize || 10) / 10)} />
          </filter>
          
          <filter id="chromatic-dv-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feColorMatrix in="SourceGraphic" type="matrix" 
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red-channel" />
            <feColorMatrix in="SourceGraphic" type="matrix" 
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green-channel" />
            <feColorMatrix in="SourceGraphic" type="matrix" 
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue-channel" />
            <feOffset in="red-channel" dx={chromOffsetX} dy={chromOffsetY} result="red-offset" />
            <feGaussianBlur in="red-offset" stdDeviation={Math.max(0, chromOffsetX/10)} result="red-blurred" />
            <feOffset in="blue-channel" dx={-chromOffsetX} dy={-chromOffsetY} result="blue-offset" />
            <feGaussianBlur in="blue-offset" stdDeviation={Math.max(0, chromOffsetX/10)} result="blue-blurred" />
            <feBlend in="red-blurred" in2="green-channel" mode="screen" result="rg-blend" />
            <feBlend in="rg-blend" in2="blue-blurred" mode="screen" result="rgb-final" />
            <feComposite in="rgb-final" in2="SourceGraphic" operator="arithmetic" k1="0" k2={chromOpacity} k3={1 - chromOpacity} k4="0" />
          </filter>

          <filter id="bloom-filter" x="-30%" y="-30%" width="160%" height="160%">
            <feColorMatrix type="matrix" 
              values={`
                1 1 1 0 ${-bloomThreshold}
                1 1 1 0 ${-bloomThreshold}
                1 1 1 0 ${-bloomThreshold}
                0 0 0 1 0
              `}
              result="highlights"
            />
            <feGaussianBlur in="highlights" stdDeviation={bloomSmoothing * 5} result="smoothed-highlights" />
            <feGaussianBlur in="smoothed-highlights" stdDeviation={bloomRadius} result="blurred-glow" />
            <feComponentTransfer in="blurred-glow" result="strong-glow">
              <feFuncR type="linear" slope={bloomStrength} />
              <feFuncG type="linear" slope={bloomStrength} />
              <feFuncB type="linear" slope={bloomStrength} />
              <feFuncA type="linear" slope={bloomStrength * bloomOverallOpacity} />
            </feComponentTransfer>
            <feBlend in="strong-glow" in2="SourceGraphic" mode="screen" />
          </filter>

          {/* New Advanced Noise Filter */}
          <filter id="noise-filter">
             <feTurbulence type="fractalNoise" baseFrequency={noiseFreq} numOctaves={noiseOctaves} result="noise-texture" />
             <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" result="grayscale-noise" />
             <feComponentTransfer in="grayscale-noise" result="weighted-noise">
                <feFuncA type="linear" slope={noiseAmount * noiseIntensity} />
             </feComponentTransfer>
             <feBlend in="weighted-noise" in2="SourceGraphic" mode="overlay" />
          </filter>
        </defs>
      </svg>

      <div 
        className="w-full h-full"
        style={{ 
          filter: filterString, 
          transition: 'filter 0.3s ease-out' 
        }}
      >
        <Globe
          ref={globeRef} width={window.innerWidth} height={window.innerHeight} 
          backgroundColor="#000000"
          globeImageUrl={generatedTexture || undefined}
          globeResolution={64} 
          showAtmosphere={atmosphere.show} 
          atmosphereColor={atmosphere.color} 
          atmosphereAltitude={atmosphere.altitude}
          polygonsData={countries.features}
          polygonAltitude={getPolygonAltitude}
          polygonCapColor={getCapColor}
          onPolygonClick={handleGlobeClick}
          onGlobeClick={handleGlobeClick}
          polygonSideColor={(d: any) => {
            if (!d || !d.properties) return '#ffffff';
            const config = stateCountries.find(c => c.id === d.properties.ISO_A3);
            if (config) {
               return withOpacity(config.color || landConfig.color || '#1a1a1a', config.opacity ?? 1.0);
            }
            return withOpacity(landConfig.color || '#1a1a1a', landConfig.opacity ?? 1.0); 
          }}
          polygonStrokeColor={(d: any) => {
            if (!globalBorder.visible) return 'rgba(0,0,0,0)';
            const baseColor = globalBorder.color || '#ffffff';
            const op = globalBorder.opacity ?? 1.0;
            
            if (globalBorder.gradientEnabled && globalBorder.color2) {
              const bbox = d._bbox || { minY: -90, maxY: 90 };
              const lat = (bbox.minY + bbox.maxY) / 2;
              const t = Math.max(0, Math.min(1, (lat + 90) / 180)); 
              const c1 = new THREE.Color(baseColor);
              const c2 = new THREE.Color(globalBorder.color2);
              return withOpacity(c1.lerp(c2, t).getStyle(), op);
            }
            return withOpacity(baseColor, op);
          }}
          polygonStrokeWidth={globalBorder.visible ? (globalBorder.width || 0.1) : 0}
          polygonsTransitionDuration={300}
          customLayerData={combinedLattice}
          customThreeObject={(d: any) => {
            if (!d) return new THREE.Group();

            if (d.isGridLabLayer) {
               const group = new THREE.Group();
               const radius = 100 * (1 + (d.altitude || 0));
               const res = d.resolution || 32;

               if (d.showWireframe) {
                  const geo = new THREE.SphereGeometry(radius, res, res / 2);
                  const edges = new THREE.EdgesGeometry(geo);
                  
                  let material;
                  if ((d.dashLength || 0) > 0) {
                     material = new THREE.LineDashedMaterial({
                        color: d.color || '#ffffff',
                        opacity: d.opacity ?? 1.0,
                        transparent: true,
                        dashSize: d.dashLength || 1,
                        gapSize: d.dashGap || 0.1,
                        depthWrite: false,
                     });
                  } else {
                     material = new THREE.LineBasicMaterial({
                        color: d.color || '#ffffff',
                        opacity: d.opacity ?? 1.0,
                        transparent: true,
                        depthWrite: false,
                     });
                  }
                  const wireframe = new THREE.LineSegments(edges, material);
                  if ((d.dashLength || 0) > 0) wireframe.computeLineDistances();
                  group.add(wireframe);
               }

               if (d.showPoints) {
                  const geo = new THREE.SphereGeometry(radius, res, res / 2);
                  const mat = new THREE.PointsMaterial({
                     color: d.pointColor || d.color || '#ffffff',
                     size: d.pointSize || 0.1,
                     transparent: true,
                     opacity: d.opacity ?? 1.0,
                     depthWrite: false,
                  });
                  const points = new THREE.Points(geo, mat);
                  group.add(points);
               }
               return group;
            }

            if (d.isWireframe) {
              return new THREE.Mesh(
                  new THREE.SphereGeometry(100.2, 48, 24),
                  new THREE.MeshBasicMaterial({ 
                      color: d.color || '#ffffff', 
                      wireframe: true, 
                      transparent: true, 
                      opacity: d.opacity ?? 0.1,
                      depthWrite: false 
                  })
              );
            }

            return new THREE.Mesh(getCachedGeometry(d.sides, d.size, d.gridHeight, d.isDot), getCachedMaterial(d));
          }}
          customThreeObjectUpdate={(obj, d: any) => {
            if (!globeRef.current || !d) return;
            if (d.isWireframe || d.isGridLabLayer) {
                obj.position.set(0,0,0);
                return;
            }
            const coords = globeRef.current.getCoords(d.lat, d.lng, d.altitude);
            if (!coords) return;
            const pos = new THREE.Vector3(coords.x, coords.y, coords.z);
            if (d.rotation) pos.applyEuler(d.rotation);
            obj.position.copy(pos); 
            obj.lookAt(0, 0, 0); 
            obj.rotateX(-Math.PI / 2); 
          }}
          arcsData={arcs}
          arcColor={(d: any) => d.color || '#ffffff'}
          arcAltitude={(d: any) => d.altitude || 0.1}
          arcDashLength={() => (3.0 / (state.arcSegments || 20)) * (1 - (state.arcGap || 0.4))}
          arcDashGap={() => (3.0 / (state.arcSegments || 20)) * (state.arcGap || 0.4)}
          arcDashAnimateTime={state.arcAnimateTime || 5000}
          arcStroke={state.arcThickness || 0.5}
          rendererConfig={{ 
              antialias: true, 
              alpha: false, 
              stencil: false,
              preserveDrawingBuffer: true 
          }}
          autoRotate={state.autoRotate}
          autoRotateSpeed={0.5}
        />
      </div>

      <div 
        className="absolute inset-0 pointer-events-none z-[100]" 
        style={dofMaskStyles as any} 
      />

      {state.postProcessing?.enabled && (
        <>
          {state.postProcessing.chromaticEnabled && state.postProcessing.chromatic > 10 && (
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-overlay z-[150]" 
              style={{ 
                background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 2px, transparent 4px)`,
                opacity: (state.postProcessing.chromatic / 100) * 0.3
              }} 
            />
          )}

          {state.postProcessing.mosaicEnabled && state.postProcessing.mosaic > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                backdropFilter: `url(#pixelate)`,
                opacity: (state.postProcessing.mosaic / 100) * ((state.postProcessing.opacity ?? 100) / 100)
              }} 
            />
          )}

          {state.postProcessing.vignetteEnabled && (
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                background: `radial-gradient(circle, transparent ${vOffset}%, rgba(0,0,0,${vDarkness}) 100%)`,
                opacity: vIntensity
              }} 
            />
          )}

          {state.postProcessing.noiseEnabled && (
            <div 
              className="absolute inset-0 pointer-events-none z-[200]" 
              style={{ 
                backdropFilter: `url(#noise-filter)`,
                opacity: 1 
              }} 
            />
          )}
        </>
      )}

      {isLoading && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
             <div className="flex flex-col items-center gap-4">
                 <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                 <div className="text-white/60 text-xs font-bold tracking-[0.2em] animate-pulse">INITIALIZING SYSTEM... {loadingProgress}%</div>
             </div>
         </div>
      )}
    </div>
  );
});
