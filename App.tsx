
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { GlobeView } from './components/GlobeView';
import { GlobeState, FillMode, ArcDistribution, SurfaceStyle, SavedTheme } from './types';
import { Activity, Languages, Info, Sparkles, ChevronUp, ChevronDown, Check, Star } from 'lucide-react';
import { translations } from './i18n';
import { PRESET_THEMES } from './constants';

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
    arcOpacity: 0.8, // 默认不透明度 0.8
    heightSync: true
};

const App: React.FC = () => {
  const [coords, setCoords] = useState({ lat: '--.----', lng: '--.----' });
  const [state, setState] = useState<GlobeState>(DEFAULT_STATE);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load last user theme if exists (optional but kept as fallback)
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
        if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
            setShowThemeMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = useCallback((key: string) => translations[state.language][key] || key, [state.language]);

  const handleUpdate = useCallback((updates: Partial<GlobeState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleLanguage = () => {
    handleUpdate({ language: state.language === 'en' ? 'zh' : 'en' });
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

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden relative selection:bg-white selection:text-black font-sans">
      <div className="absolute inset-0 z-0">
        <GlobeView state={state} />
      </div>

      <div className="z-10 flex h-full w-full pointer-events-none relative">
        <div className="absolute top-8 left-8 flex flex-col gap-2">
          <div className="flex items-center gap-4">
             <Activity className="w-6 h-6 text-white animate-pulse" />
             <h1 className="text-3xl font-bold tracking-[0.1em] text-white shadow-black drop-shadow-md">{t('terminalTitle')}</h1>
             <button 
               onClick={toggleLanguage}
               className="ml-4 p-1.5 px-3 border border-white/20 hover:bg-white hover:text-black transition-all text-xs font-bold pointer-events-auto flex items-center gap-2 bg-black/50 backdrop-blur-sm"
             >
               <Languages className="w-4 h-4" />
               {state.language.toUpperCase()}
             </button>
          </div>
          <p className="text-sm text-white/60 tracking-widest font-bold bg-black/20 backdrop-blur-sm inline-block px-2 normal-case">
            by notowe(WeChat：notowe2021)
          </p>
        </div>

        {/* Current Theme Display - Bottom Right with Quick Selector */}
        <div 
          ref={themeMenuRef}
          className="absolute bottom-8 right-[340px] flex flex-col items-end gap-2"
        >
          {showThemeMenu && (
             <div className="bg-black/80 backdrop-blur-2xl border border-white/20 p-2 rounded shadow-2xl w-64 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto overflow-hidden">
                <div className="flex items-center gap-2 px-2 py-1 mb-2 border-b border-white/10">
                   <Star className="w-3 h-3 text-yellow-500" />
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
                      className="w-full text-left group flex items-center justify-between bg-white/5 border border-transparent p-2 rounded hover:bg-white/10 hover:border-white/20 transition-all mb-1 last:mb-0"
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
            className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded shadow-2xl hover:bg-black/60 hover:border-white/30 transition-all cursor-pointer pointer-events-auto group relative overflow-hidden"
          >
             <div className="w-1 h-8 bg-white/40 group-hover:bg-white transition-colors"></div>
             <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-bold tracking-widest uppercase flex items-center gap-1.5">
                  {t('currentTheme')}
                  <ChevronUp className={`w-3 h-3 transition-transform duration-300 ${showThemeMenu ? 'rotate-180 text-white' : 'text-white/40'}`} />
                </span>
                <span className="text-xs text-white font-bold tracking-wider max-w-[200px] truncate" title={state.themeName}>
                  {state.themeName || t('unknownTheme')}
                </span>
             </div>
             {/* Subtle Glow Effect */}
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 space-y-2 text-white/60 text-sm font-medium bg-black/20 backdrop-blur-sm p-4 rounded border border-white/5">
           <p className="flex justify-between gap-4">{t('latStream')}: <span className="text-white font-bold">{coords.lat}</span></p>
           <p className="flex justify-between gap-4">{t('lngStream')}: <span className="text-white font-bold">{coords.lng}</span></p>
           <p className="flex justify-between gap-4">{t('uptime')}: <span className="text-white font-bold">{(performance.now()/1000).toFixed(0)}S</span></p>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <p className="text-xs text-white/50 mb-3 uppercase tracking-[0.2em] font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">{t('gridSync')}</p>
            <div className="flex gap-1.5">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i % 3 === 0 ? 'bg-white shadow-[0_0_5px_white]' : 'bg-white/20'}`}></div>
                ))}
            </div>
        </div>

        <div className="ml-auto pointer-events-auto h-full shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <Sidebar state={state} onUpdate={handleUpdate} t={t} />
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5"></div>
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/5"></div>
          <div className="absolute inset-10 border border-white/10"></div>
      </div>
    </div>
  );
};

export default App;
