
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { GlobeView } from './components/GlobeView';
import { GlobeState, FillMode, ArcDistribution, SurfaceStyle, SavedTheme, PostProcessingConfig } from './types';
import { Activity, Languages, Info, Sparkles, ChevronUp, ChevronDown, Check, Star, Camera, Eye, EyeOff, SlidersHorizontal, Settings2, Power, Image as ImageIcon, Link as LinkIcon, MousePointer2, Target, Lock, Unlock, X as CloseIcon } from 'lucide-react';
import { translations } from './i18n';
import { PRESET_THEMES } from './constants';


const APP_VERSION = "1.1";

const DEFAULT_POST_PROCESSING: PostProcessingConfig = {
  enabled: false,
  opacity: 100, // DoF Intensity
  dofEnabled: false,
  blur: 0,
  focus: 50,
  fstop: 30,
  mosaic: 100,
  mosaicEnabled: false,
  mosaicSize: 10,
  chromatic: 100,
  chromaticEnabled: false,
  chromaticOffsetX: 15,
  chromaticOffsetY: 15,
  chromaticLinked: true,
  bloom: 100,
  bloomEnabled: false,
  bloomStrength: 2.7,
  bloomRadius: 1.0,
  bloomThreshold: 0.36,
  bloomSmoothing: 0.25,
  hue: 0,
  hueEnabled: false,
  hueIntensity: 100,
  saturation: 10,
  brightness: 100,
  brightnessEnabled: false,
  brightnessIntensity: 100,
  contrast: 100,
  vignette: 100,
  vignetteEnabled: false,
  vignetteIntensity: 100,
  vignetteDarkness: 80,
  vignetteOffset: 50,
  noise: 100,
  noiseEnabled: false,
  noiseIntensity: 100,
  noiseAmount: 36,
  noiseSize: 25,
  noiseRoughness: 50
};

const DEFAULT_STATE: GlobeState = {
  language: "zh",
  themeName: "奇爱博士 (Dr. Strangelove)",
  autoRotate: true,
  atmosphere: { show: true, color: "#ffffff", altitude: 0.13 },
  satellite: { show: true, opacity: 0.28, blendMode: "multiply" },
  landAltitude: 0.04,
  globalBorder: { visible: true, width: 0.3, color: "#ffffff", color2: "#ffffff", gradientEnabled: false, opacity: 0.99 },
  landmassOpacity: 0.4,
  landmassColor: "#00f2ff",
  landmassColor2: "#7000ff",
  surfaceSync: false,
  showWireframe: false,
  wireframeColor: "#ffcc00",
  wireframeOpacity: 0.2,
  landConfig: { style: SurfaceStyle.SOLID, color: "#ffffff", color2: "#ffffff", gradientEnabled: false, opacity: 0.1 },
  oceanConfig: { style: SurfaceStyle.REALISTIC, color: "#000000", color2: "#333d00", gradientEnabled: false, opacity: 1 },
  strata: [],
  gridLayers: [
    { id: "GRID_1", name: "结构网格", visible: true, altitude: 0.01, color: "#ffffff", opacity: 0.2, resolution: 32, showWireframe: true, showPoints: false, pointSize: 0.1, pointColor: "#ffffff", dashLength: 0, dashGap: 0 },
    { id: "GRID_2", name: "结构网格 2", visible: true, altitude: 5, color: "#ffffff", opacity: 0.2, resolution: 28, showWireframe: true, showPoints: false, pointSize: 0.1, pointColor: "#ffffff", dashLength: 0, dashGap: 0 }
  ],
  countries: [{ id: "CHN", name: "CHINA", color: "#ffffff", color2: "#000000", gradientEnabled: false, gradientAxis: "Y", height: 0.09, opacity: 0.44, textureSync: false }],
  randomArcs: { visible: true, count: 7, bundleSize: 1, distribution: ArcDistribution.HORIZONTAL, spacing: 0, curvature: 0.2 },
  arcGroups: [],
  arcThickness: 0.1,
  arcAnimateTime: 7800,
  arcColor: "#ffffff",
  arcColor2: "#0055ff",
  arcGradientEnabled: false,
  arcSegments: 100,
  arcGap: 0.22,
  arcOpacity: 0.8,
  heightSync: true,
  postProcessing: DEFAULT_POST_PROCESSING
};

const CapsuleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    className={`w-[48px] h-[24px] rounded-full border border-white/20 flex items-center p-[2px] cursor-pointer transition-all duration-300 relative ${checked ? 'bg-white/30' : 'bg-black/50'}`}
  >
    <div className={`w-[18px] h-[18px] rounded-full shadow-lg transition-transform duration-300 ${checked ? 'translate-x-[24px] bg-white' : 'translate-x-0 bg-white/40'}`} />
  </div>
);

const App: React.FC = () => {
  const [coords, setCoords] = useState({ lat: '--.----', lng: '--.----' });
  const [state, setState] = useState<GlobeState>(DEFAULT_STATE);
  const isZh = state.language === 'zh';
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showPPMenu, setShowPPMenu] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showUpdateNotice, setShowUpdateNotice] = useState(false);

  const [isDofExpanded, setIsDofExpanded] = useState(false);
  const [isMosaicExpanded, setIsMosaicExpanded] = useState(false);
  const [isChromaticExpanded, setIsChromaticExpanded] = useState(false);
  const [isBloomExpanded, setIsBloomExpanded] = useState(false);
  const [isHueExpanded, setIsHueExpanded] = useState(false);
  const [isBrightnessExpanded, setIsBrightnessExpanded] = useState(false);
  const [isVignetteExpanded, setIsVignetteExpanded] = useState(false);
  const [isNoiseExpanded, setIsNoiseExpanded] = useState(false);

  const themeMenuRef = useRef<HTMLDivElement>(null);
  const ppMenuRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);

  const isDraggingGlobal = useRef(false);

  useEffect(() => {
    // Check if user has seen this version
    const lastSeenVersion = localStorage.getItem('last_seen_version');
    if (lastSeenVersion !== APP_VERSION) {
      setShowUpdateNotice(true);
    }

    const savedDefault = localStorage.getItem('default_theme');
    if (savedDefault) {
      try {
        const parsed = JSON.parse(savedDefault);
        setState({ ...DEFAULT_STATE, ...parsed });
      } catch (e) {
        console.error("Failed to load saved theme", e);
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (isDraggingGlobal.current) return;

      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
      if (ppMenuRef.current && !ppMenuRef.current.contains(e.target as Node) && toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowPPMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeUpdateNotice = () => {
    localStorage.setItem('last_seen_version', APP_VERSION);
    setShowUpdateNotice(false);
  };

  const t = useCallback((key: string) => translations[state.language][key] || key, [state.language]);

  const handleUpdate = useCallback((updates: Partial<GlobeState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleLanguage = () => {
    handleUpdate({ language: state.language === 'en' ? 'zh' : 'en' });
  };


  const captureScreenshot = async () => {
    if (!globeContainerRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      // Find the WebGL canvas
      const canvas = globeContainerRef.current.querySelector('canvas');
      if (!canvas) {
        throw new Error("WebGL Canvas not found");
      }

      // Generate high-res image
      const dataUrl = await import('./utils/captureUtils').then(m =>
        m.generateCompositeImage(canvas, state)
      );

      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `planetary-capture-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error("Capture failed:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  const updatePP = (updates: Partial<PostProcessingConfig>) => {
    handleUpdate({
      postProcessing: { ...state.postProcessing!, ...updates }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCoords({
        lat: (Math.random() * 180 - 90).toFixed(4),
        lng: (Math.random() * 360 - 180).toFixed(4)
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const PPSlider = ({ label, value, min, max, key_id, extraAction, isEnabled = true, isSub = false, isFloat = false, step, trackStyle, isEffectOff = false }: { label: string, value: number, min: number, max: number, key_id: keyof PostProcessingConfig, extraAction?: React.ReactNode, isEnabled?: boolean, isSub?: boolean, isFloat?: boolean, step?: number, trackStyle?: React.CSSProperties, isEffectOff?: boolean }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());
    const [isDragging, setIsDragging] = useState(false);

    const dragStartX = useRef(0);
    const dragStartValue = useRef(0);

    const handleInputBlur = () => {
      setIsEditing(false);
      let num = parseFloat(inputValue);
      if (isNaN(num)) num = value;
      num = Math.max(min, Math.min(max, num));
      updatePP({ [key_id]: num });
    };

    const onMouseDown = (e: React.MouseEvent) => {
      if (!isEnabled) return;
      e.stopPropagation();
      if (isEditing) return;

      isDraggingGlobal.current = true;
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartValue.current = value;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - dragStartX.current;
        const sensitivity = (max - min) / 300;
        let newValue = dragStartValue.current + deltaX * sensitivity;

        if (step !== undefined) {
          newValue = Math.round(newValue / step) * step;
        } else if (!isFloat) {
          newValue = Math.round(newValue);
        }

        newValue = Math.max(min, Math.min(max, newValue));
        updatePP({ [key_id]: newValue });
      };

      const onMouseUp = () => {
        setIsDragging(false);
        setTimeout(() => {
          isDraggingGlobal.current = false;
        }, 150);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'default';
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'ew-resize';
    };

    const progressPercent = ((value - min) / (max - min)) * 100;

    const labelWidthClass = isZh ? 'w-16' : 'w-20';
    const labelFontSizeClass = isZh ? (isSub ? 'text-[11px]' : 'text-[13px]') : (isSub ? 'text-[9px]' : 'text-[11px]');

    return (
      <div className={`flex items-center gap-2.5 ${isSub ? 'min-h-[2rem]' : 'min-h-[2.75rem]'} group/row select-none transition-opacity ${!isEnabled ? 'opacity-30 pointer-events-none' : ''}`}>
        <span className={`${labelFontSizeClass} font-black text-white/50 ${labelWidthClass} flex-shrink-0 tracking-tighter leading-[1.1] transition-all break-words uppercase`}>
          {label}
        </span>

        <div
          className={`flex-1 relative h-full min-h-[1rem] flex items-center cursor-ew-resize group/track ${isEffectOff ? 'opacity-40' : ''}`}
          onMouseDown={onMouseDown}
        >
          <div
            className="absolute w-full h-[5px] bg-white/10 rounded-full group-hover/track:bg-white/15 transition-colors"
            style={trackStyle}
          />
          {!trackStyle && (
            <div
              className="absolute h-[5px] bg-white rounded-full z-0 transition-[width] duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          )}
          <div
            className={`absolute w-4 h-4 bg-white rounded-full shadow-[0_0_12px_rgba(0,0,0,0.6)] border-2 border-black/20 z-10 transition-transform ${isDragging ? 'scale-125' : 'group-hover/track:scale-110'}`}
            style={{ left: `calc(${progressPercent}% - 8px)` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className={`${isSub ? 'w-14 h-7' : 'w-16 h-8'} bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover/row:border-white/20 transition-all ${isEffectOff ? 'opacity-40' : ''}`}>
            {isEditing ? (
              <input
                autoFocus
                className="w-full h-full bg-transparent text-center text-[11px] font-bold text-white outline-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleInputBlur()}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center gap-0.5 cursor-text"
                onDoubleClick={(e) => { e.stopPropagation(); if (isEnabled) { setInputValue(value.toString()); setIsEditing(true); } }}
              >
                <span className={`${isSub ? 'text-[11px]' : 'text-[12px]'} font-bold text-white/90`}>{isFloat ? value.toFixed(2) : value}</span>
                {key_id === 'hue' ? (
                  <span className="text-[9px] text-white/30 font-medium">%</span>
                ) : (
                  !isFloat && <span className="text-[9px] text-white/30 font-medium">%</span>
                )}
              </div>
            )}
          </div>
          {extraAction}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden relative selection:bg-white selection:text-black font-sans">
      <div ref={globeContainerRef} className="absolute inset-0 z-0">
        <GlobeView state={state} onGlobeUpdate={(updates) => handleUpdate(updates)} />
      </div>

      <div className="z-10 flex h-full w-full pointer-events-none relative">
        {uiVisible && (
          <div className="absolute top-8 left-8 flex flex-col gap-2">
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/15 p-4 px-6 rounded-3xl shadow-2xl pointer-events-auto ring-1 ring-white/10">
              <Activity className="w-6 h-6 text-white animate-pulse" />
              <h1 className="text-3xl font-bold tracking-[0.1em] text-white uppercase">{t('terminalTitle')}</h1>
              <button
                onClick={toggleLanguage}
                className="ml-4 p-1.5 px-3 border border-white/20 hover:bg-white hover:text-black transition-all text-xs font-bold flex items-center gap-2 bg-white/10 rounded-lg"
              >
                <Languages className="w-4 h-4" />
                {state.language.toUpperCase()}
              </button>
            </div>
          </div>
        )}

        <div
          ref={toolbarRef}
          className={`absolute bottom-8 right-8 flex items-center gap-3 pointer-events-auto transition-all duration-500 ${!uiVisible ? 'right-4 bottom-4' : 'right-[340px]'}`}
        >
          {uiVisible && (
            <div className="relative" ref={themeMenuRef}>
              {showThemeMenu && (
                <div className="absolute bottom-full right-0 mb-3 bg-black/40 backdrop-blur-3xl border border-white/15 p-2 rounded-2xl shadow-2xl w-64 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto overflow-hidden ring-1 ring-white/10">
                  <div className="flex items-center gap-2 px-3 py-2 mb-2 border-b border-white/10">
                    <Star className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">{t('presetThemes')}</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto terminal-scrollbar pr-1">
                    {PRESET_THEMES.map((theme, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          handleUpdate({ ...theme.config, themeName: theme.name });
                          setShowThemeMenu(false);
                        }}
                        className="w-full text-left group flex items-center justify-between bg-white/5 border border-transparent p-2.5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all mb-1 last:mb-0"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-1.5 h-1.5 rounded-full ${state.themeName === theme.name ? 'bg-white shadow-[0_0_5px_white]' : 'bg-white/20'}`}></div>
                          <span className={`text-[10px] font-bold truncate ${state.themeName === theme.name ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                            {theme.name}
                          </span>
                        </div>
                        {state.themeName === theme.name && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/15 p-2 pl-4 pr-5 rounded-2xl shadow-2xl hover:bg-black/60 hover:border-white/30 transition-all cursor-pointer group relative overflow-hidden h-12 ring-1 ring-white/10"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 font-bold tracking-widest uppercase flex items-center gap-1.5 leading-none mb-1">
                    {t('currentTheme')}
                    <ChevronUp className={`w-3 h-3 transition-transform duration-300 ${showThemeMenu ? 'rotate-180 text-white' : 'text-white/40'}`} />
                  </span>
                  <span className="text-xs text-white font-bold tracking-wider max-w-[160px] truncate leading-none">
                    {state.themeName || t('unknownTheme')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex bg-black/40 backdrop-blur-xl border border-white/15 p-1.5 rounded-2xl shadow-2xl items-center ring-1 ring-white/10 h-12">
            <button
              onClick={() => setShowPPMenu(!showPPMenu)}
              className={`p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all ${!uiVisible ? 'hidden' : ''} ${showPPMenu ? 'bg-white/20 text-white' : ''}`}
              title={t('postProcessing')}
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={captureScreenshot}
              disabled={isCapturing}
              className={`p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all ${!uiVisible ? 'hidden' : ''} ${isCapturing ? 'animate-spin opacity-40' : ''}`}
              title="Save Image"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              onClick={() => setUiVisible(!uiVisible)}
              className={`p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all`}
              title={uiVisible ? "Hide UI" : "Show UI"}
            >
              {uiVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowUpdateNotice(true)}
              className={`p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all ${!uiVisible ? 'hidden' : ''}`}
              title={t('updateTitle')}
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showPPMenu && uiVisible && (
          <div
            ref={ppMenuRef}
            className="absolute bottom-24 right-[340px] w-[340px] bg-black/40 backdrop-blur-3xl border border-white/15 p-7 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] pointer-events-auto animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/15 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-white/10 rounded-2xl shadow-inner border border-white/5">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold tracking-widest text-white uppercase">{t('postProcessing')}</span>
              </div>

              <div className="flex items-center gap-2">
                <CapsuleSwitch
                  checked={state.postProcessing?.enabled || false}
                  onChange={() => updatePP({ enabled: !state.postProcessing?.enabled })}
                />
              </div>
            </div>

            <div className={`space-y-1 transition-all duration-500 max-h-[60vh] overflow-y-auto terminal-scrollbar pr-2 ${state.postProcessing?.enabled ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>

              <div className="space-y-1">
                <PPSlider
                  label={t('ppDoF')}
                  value={state.postProcessing?.opacity ?? 100}
                  min={0} max={100}
                  key_id="opacity"
                  isEffectOff={!state.postProcessing?.dofEnabled}
                  extraAction={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updatePP({ dofEnabled: !state.postProcessing?.dofEnabled })}
                        className={`p-1.5 rounded-lg transition-all ${state.postProcessing?.dofEnabled ? 'bg-white/20 text-white shadow-inner' : 'bg-white/5 text-white/30 hover:text-white'}`}
                        title="Toggle DoF"
                      >
                        {state.postProcessing?.dofEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                      </button>
                      <button
                        onClick={() => setIsDofExpanded(!isDofExpanded)}
                        className={`p-1.5 rounded-lg transition-all ${isDofExpanded ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        title="Expand DoF Settings"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  }
                />

                {isDofExpanded && (
                  <div className="pl-6 border-l border-white/15 mt-1 mb-4 space-y-0.5 animate-in slide-in-from-top-2 duration-300">
                    <PPSlider
                      label={t('ppBlur')}
                      value={state.postProcessing?.blur || 0}
                      min={0} max={100} key_id="blur"
                      isEnabled={state.postProcessing?.dofEnabled}
                      isSub
                    />
                    <PPSlider
                      label={t('ppFocus')}
                      value={state.postProcessing?.focus ?? 50}
                      min={0} max={100} key_id="focus"
                      isEnabled={state.postProcessing?.dofEnabled}
                      isSub
                      extraAction={
                        <button
                          onClick={() => updatePP({ isPicking: !state.postProcessing?.isPicking })}
                          title={t('pickFocus')}
                          className={`p-1.5 rounded-lg transition-all ${state.postProcessing?.isPicking ? 'bg-white text-black animate-pulse shadow-[0_0_15px_white]' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        >
                          <Target className="w-3.5 h-3.5" />
                        </button>
                      }
                    />
                    <PPSlider
                      label={t('ppFstop')}
                      value={state.postProcessing?.fstop ?? 30}
                      min={0} max={100} key_id="fstop"
                      isEnabled={state.postProcessing?.dofEnabled}
                      isSub
                    />
                  </div>
                )}
              </div>

              <div className="h-px bg-white/10 my-4" />

              <div className="space-y-1">
                <PPSlider
                  label={t('ppMosaic')}
                  value={state.postProcessing?.mosaic ?? 100}
                  min={0} max={100}
                  key_id="mosaic"
                  isEffectOff={!state.postProcessing?.mosaicEnabled}
                  extraAction={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updatePP({ mosaicEnabled: !state.postProcessing?.mosaicEnabled })}
                        className={`p-1.5 rounded-lg transition-all ${state.postProcessing?.mosaicEnabled ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30 hover:text-white'}`}
                        title="Toggle Mosaic"
                      >
                        {state.postProcessing?.mosaicEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                      </button>
                      <button
                        onClick={() => setIsMosaicExpanded(!isMosaicExpanded)}
                        className={`p-1.5 rounded-lg transition-all ${isMosaicExpanded ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        title="Expand Mosaic Settings"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  }
                />

                {isMosaicExpanded && (
                  <div className="pl-6 border-l border-white/15 mt-1 mb-4 space-y-0.5 animate-in slide-in-from-top-2 duration-300">
                    <PPSlider
                      label={t('ppMosaicSize')}
                      value={state.postProcessing?.mosaicSize || 10}
                      min={1} max={100} key_id="mosaicSize"
                      isEnabled={state.postProcessing?.mosaicEnabled}
                      isSub
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <PPSlider
                  label={t('ppChromatic')}
                  value={state.postProcessing?.chromatic ?? 100}
                  min={0} max={100}
                  key_id="chromatic"
                  isEffectOff={!state.postProcessing?.chromaticEnabled}
                  extraAction={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updatePP({ chromaticEnabled: !state.postProcessing?.chromaticEnabled })}
                        className={`p-1.5 rounded-lg transition-all ${state.postProcessing?.chromaticEnabled ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30 hover:text-white'}`}
                        title="Toggle Chromatic"
                      >
                        {state.postProcessing?.chromaticEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                      </button>
                      <button
                        onClick={() => setIsChromaticExpanded(!isChromaticExpanded)}
                        className={`p-1.5 rounded-lg transition-all ${isChromaticExpanded ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        title="Expand Chromatic Settings"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  }
                />

                {isChromaticExpanded && (
                  <div className="pl-6 border-l border-white/15 mt-1 mb-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-4 min-h-[2.25rem] select-none transition-opacity">
                      <span className={`text-[10px] font-bold text-white/50 ${isZh ? 'w-16' : 'w-20'} flex-shrink-0 tracking-tighter leading-[1.1] uppercase break-words`}>{t('ppChromaticOffset')}</span>
                      <div className="flex-1 flex items-center gap-3">
                        <button
                          onClick={() => updatePP({ chromaticLinked: !state.postProcessing?.chromaticLinked })}
                          className={`p-1.5 rounded-lg transition-all ${state.postProcessing?.chromaticLinked ? 'bg-white/10 text-white' : 'bg-white/5 text-white/30 hover:text-white'}`}
                        >
                          {state.postProcessing?.chromaticLinked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        <div className="flex-1 flex items-center gap-1 bg-white/5 rounded-lg border border-white/10 px-2 h-7 group/input hover:border-white/20">
                          <span className="text-[10px] text-blue-400 font-bold uppercase">X</span>
                          <input
                            type="number"
                            className="w-full bg-transparent text-center text-[11px] font-bold text-white outline-none"
                            value={state.postProcessing?.chromaticOffsetX ?? 15}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              updatePP({
                                chromaticOffsetX: val,
                                ...(state.postProcessing?.chromaticLinked ? { chromaticOffsetY: val } : {})
                              });
                            }}
                          />
                        </div>

                        <div className="flex-1 flex items-center gap-1 bg-white/5 rounded-lg border border-white/10 px-2 h-7 group/input hover:border-white/20">
                          <span className="text-[10px] text-cyan-400 font-bold uppercase">Y</span>
                          <input
                            type="number"
                            className="w-full bg-transparent text-center text-[11px] font-bold text-white outline-none"
                            value={state.postProcessing?.chromaticOffsetY ?? 15}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              updatePP({
                                chromaticOffsetY: val,
                                ...(state.postProcessing?.chromaticLinked ? { chromaticOffsetX: val } : {})
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <PPSlider
                  label={t('ppBloom')}
                  value={state.postProcessing?.bloom ?? 100}
                  min={0} max={100}
                  key_id="bloom"
                  isEffectOff={!state.postProcessing?.bloomEnabled}
                  extraAction={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updatePP({ bloomEnabled: !state.postProcessing?.bloomEnabled })}
                        className={`p-1.5 rounded-lg transition-all ${state.postProcessing?.bloomEnabled ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30 hover:text-white'}`}
                        title="Toggle Bloom"
                      >
                        {state.postProcessing?.bloomEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                      </button>
                      <button
                        onClick={() => setIsBloomExpanded(!isBloomExpanded)}
                        className={`p-1.5 rounded-lg transition-all ${isBloomExpanded ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        title="Expand Bloom Settings"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  }
                />

                {isBloomExpanded && (
                  <div className="pl-6 border-l border-white/15 mt-1 mb-4 space-y-0.5 animate-in slide-in-from-top-2 duration-300">
                    <PPSlider
                      label={t('ppBloomStrength')}
                      value={state.postProcessing?.bloomStrength ?? 2.7}
                      min={0} max={10} step={0.01} key_id="bloomStrength"
                      isEnabled={state.postProcessing?.bloomEnabled}
                      isSub isFloat
                    />
                    <PPSlider
                      label={t('ppBloomRadius')}
                      value={state.postProcessing?.bloomRadius ?? 1.0}
                      min={0} max={5} step={0.01} key_id="bloomRadius"
                      isEnabled={state.postProcessing?.bloomEnabled}
                      isSub isFloat
                    />
                    <PPSlider
                      label={t('ppBloomThreshold')}
                      value={state.postProcessing?.bloomThreshold ?? 0.36}
                      min={0} max={1} step={0.01} key_id="bloomThreshold"
                      isEnabled={state.postProcessing?.bloomEnabled}
                      isSub isFloat
                    />
                    <PPSlider
                      label={t('ppBloomSmoothing')}
                      value={state.postProcessing?.bloomSmoothing ?? 0.25}
                      min={0} max={1} step={0.01} key_id="bloomSmoothing"
                      isEnabled={state.postProcessing?.bloomEnabled}
                      isSub isFloat
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <PPSlider
                  label={t('ppHue')}
                  value={state.postProcessing?.hueIntensity ?? 100}
                  min={0} max={100}
                  key_id="hueIntensity"
                  isEffectOff={!state.postProcessing?.hueEnabled}
                  extraAction={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updatePP({ hueEnabled: !state.postProcessing?.hueEnabled })}
                        className={`p-1.5 rounded-lg transition-all ${state.postProcessing?.hueEnabled ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30 hover:text-white'}`}
                        title="Toggle Hue"
                      >
                        {state.postProcessing?.hueEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                      </button>
                      <button
                        onClick={() => setIsHueExpanded(!isHueExpanded)}
                        className={`p-1.5 rounded-lg transition-all ${isHueExpanded ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        title="Expand Hue Settings"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  }
                />

                {isHueExpanded && (
                  <div className="pl-6 border-l border-white/15 mt-1 mb-4 space-y-0.5 animate-in slide-in-from-top-2 duration-300">
                    <PPSlider
                      label={t('ppHue')}
                      value={state.postProcessing?.hue || 0}
                      min={0} max={100} step={1} key_id="hue"
                      isEnabled={state.postProcessing?.hueEnabled}
                      isSub
                      trackStyle={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
                    />
                    <PPSlider
                      label={t('ppSaturation')}
                      value={state.postProcessing?.saturation ?? 10}
                      min={0} max={100} step={1} key_id="saturation"
                      isEnabled={state.postProcessing?.hueEnabled}
                      isSub
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <PPSlider
                  label={t('ppBrightness')}
                  value={state.postProcessing?.brightnessIntensity ?? 100}
                  min={0} max={100}
                  key_id="brightnessIntensity"
                  isEffectOff={!state.postProcessing?.brightnessEnabled}
                  extraAction={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updatePP({ brightnessEnabled: !state.postProcessing?.brightnessEnabled })}
                        className={`p-1.5 rounded-lg transition-all ${state.postProcessing?.brightnessEnabled ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30 hover:text-white'}`}
                        title="Toggle Brightness"
                      >
                        {state.postProcessing?.brightnessEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                      </button>
                      <button
                        onClick={() => setIsBrightnessExpanded(!isBrightnessExpanded)}
                        className={`p-1.5 rounded-lg transition-all ${isBrightnessExpanded ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        title="Expand Brightness Settings"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  }
                />

                {isBrightnessExpanded && (
                  <div className="pl-6 border-l border-white/15 mt-1 mb-4 space-y-0.5 animate-in slide-in-from-top-2 duration-300">
                    <PPSlider
                      label={t('ppBrightness')}
                      value={state.postProcessing?.brightness ?? 100}
                      min={0} max={200} step={1} key_id="brightness"
                      isEnabled={state.postProcessing?.brightnessEnabled}
                      isSub
                    />
                    <PPSlider
                      label={t('ppContrast')}
                      value={state.postProcessing?.contrast ?? 100}
                      min={0} max={200} step={1} key_id="contrast"
                      isEnabled={state.postProcessing?.brightnessEnabled}
                      isSub
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <PPSlider
                  label={t('ppVignette')}
                  value={state.postProcessing?.vignetteIntensity ?? 100}
                  min={0} max={100}
                  key_id="vignetteIntensity"
                  isEffectOff={!state.postProcessing?.vignetteEnabled}
                  extraAction={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updatePP({ vignetteEnabled: !state.postProcessing?.vignetteEnabled })}
                        className={`p-1.5 rounded-lg transition-all ${state.postProcessing?.vignetteEnabled ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30 hover:text-white'}`}
                        title="Toggle Vignette"
                      >
                        {state.postProcessing?.vignetteEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                      </button>
                      <button
                        onClick={() => setIsVignetteExpanded(!isVignetteExpanded)}
                        className={`p-1.5 rounded-lg transition-all ${isVignetteExpanded ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        title="Expand Vignette Settings"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  }
                />

                {isVignetteExpanded && (
                  <div className="pl-6 border-l border-white/15 mt-1 mb-4 space-y-0.5 animate-in slide-in-from-top-2 duration-300">
                    <PPSlider
                      label={t('ppVignetteDarkness')}
                      value={state.postProcessing?.vignetteDarkness ?? 80}
                      min={0} max={100} step={1} key_id="vignetteDarkness"
                      isEnabled={state.postProcessing?.vignetteEnabled}
                      isSub
                    />
                    <PPSlider
                      label={t('ppVignetteOffset')}
                      value={state.postProcessing?.vignetteOffset ?? 50}
                      min={0} max={100} step={1} key_id="vignetteOffset"
                      isEnabled={state.postProcessing?.vignetteEnabled}
                      isSub
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <PPSlider
                  label={t('ppNoise')}
                  value={state.postProcessing?.noiseIntensity ?? 100}
                  min={0} max={100}
                  key_id="noiseIntensity"
                  isEffectOff={!state.postProcessing?.noiseEnabled}
                  extraAction={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updatePP({ noiseEnabled: !state.postProcessing?.noiseEnabled })}
                        className={`p-1.5 rounded-lg transition-all ${state.postProcessing?.noiseEnabled ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30 hover:text-white'}`}
                        title="Toggle Noise"
                      >
                        {state.postProcessing?.noiseEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                      </button>
                      <button
                        onClick={() => setIsNoiseExpanded(!isNoiseExpanded)}
                        className={`p-1.5 rounded-lg transition-all ${isNoiseExpanded ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        title="Expand Noise Settings"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  }
                />

                {isNoiseExpanded && (
                  <div className="pl-6 border-l border-white/15 mt-1 mb-4 space-y-0.5 animate-in slide-in-from-top-2 duration-300">
                    <PPSlider
                      label={t('ppNoiseAmount')}
                      value={state.postProcessing?.noiseAmount ?? 36}
                      min={0} max={100} step={1} key_id="noiseAmount"
                      isEnabled={state.postProcessing?.noiseEnabled}
                      isSub
                    />
                    <PPSlider
                      label={t('ppNoiseSize')}
                      value={state.postProcessing?.noiseSize ?? 25}
                      min={1} max={100} step={1} key_id="noiseSize"
                      isEnabled={state.postProcessing?.noiseEnabled}
                      isSub
                    />
                    <PPSlider
                      label={t('ppNoiseRoughness')}
                      value={state.postProcessing?.noiseRoughness ?? 50}
                      min={1} max={100} step={1} key_id="noiseRoughness"
                      isEnabled={state.postProcessing?.noiseEnabled}
                      isSub
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {state.postProcessing?.isPicking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm shadow-2xl animate-bounce flex items-center gap-3 ring-4 ring-black/20">
              <Target className="w-5 h-5" />
              {t('pickFocus')}
            </div>
          </div>
        )}

        {uiVisible && (
          <div className="absolute bottom-8 left-8 space-y-2 text-white/60 text-sm font-medium bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto ring-1 ring-white/10">
            <p className="flex justify-between gap-6 uppercase">{t('latStream')}: <span className="text-white font-bold font-mono">{coords.lat}</span></p>
            <p className="flex justify-between gap-6 uppercase">{t('lngStream')}: <span className="text-white font-bold font-mono">{coords.lng}</span></p>
            <p className="flex justify-between gap-6 uppercase">{t('uptime')}: <span className="text-white font-bold font-mono">{(performance.now() / 1000).toFixed(0)}S</span></p>
          </div>
        )}

        {uiVisible && (
          <div className="ml-auto pointer-events-auto h-full shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <Sidebar state={state} onUpdate={handleUpdate} t={t} />
          </div>
        )}
      </div>

      {showUpdateNotice && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/10">
          <div className="w-full max-w-lg bg-black/40 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] p-10 relative animate-in fade-in zoom-in-95 duration-300 ring-1 ring-white/20">
            <button
              onClick={closeUpdateNotice}
              className="absolute top-8 right-8 p-2 text-white/40 hover:text-white transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/5">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-[0.2em] text-white uppercase">{t('updateTitle')}</h2>
              <div className="h-0.5 w-12 bg-white/20 mt-4"></div>
            </div>

            <div className="space-y-8 mb-12">
              <div className="flex gap-5">
                <div className="p-3 bg-white/10 rounded-xl h-fit border border-white/5">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">{t('updatePPTitle')}</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-medium">{t('updatePPDesc')}</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="p-3 bg-white/10 rounded-xl h-fit border border-white/5">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">{t('updateSaveTitle')}</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-medium">{t('updateSaveDesc')}</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="p-3 bg-white/10 rounded-xl h-fit border border-white/5">
                  <EyeOff className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">{t('updateUITitle')}</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-medium">{t('updateUIDesc')}</p>
                </div>
              </div>
            </div>

            <button
              onClick={closeUpdateNotice}
              className="w-full py-4 bg-white text-black text-xs font-bold tracking-[0.3em] uppercase rounded-2xl hover:bg-white/90 transition-all shadow-xl"
            >
              {t('updateClose')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
