
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { GlobeState, CountryConfig, FillMode, ArcGroup, GlobeLayer, GradientAxis, ArcDistribution, SurfaceConfig, SurfaceStyle, BlendMode, GridLayer, CountryData, SavedTheme } from '../types';
import { Trash2, Terminal, Sliders, Database, Search, Layers, Share2, Activity, Palette, Grid, ChevronDown, ChevronRight, Eye, EyeOff, RotateCw, Paintbrush, Plus, Link2, Box, Settings2, Sparkles, Globe2, Waves, Image as ImageIcon, Ruler, Square, Fingerprint, Map, X, Save, Check, Library, Star, Download } from 'lucide-react';
import { COUNTRY_LIST, PRESET_THEMES } from '../constants';

interface SidebarProps {
  state: GlobeState;
  onUpdate: (newState: Partial<GlobeState>) => void;
  t: (key: string) => string; 
}

// Reusable Components
const Switch: React.FC<{ checked: boolean; onChange: () => void; label?: string }> = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-3 cursor-pointer group" onClick={onChange}>
    {label && <span className="text-xs text-white/40 uppercase group-hover:text-white/60 transition-colors font-bold">{label}</span>}
    <div className={`w-10 h-5 rounded-full border border-white/60 flex items-center p-[2px] transition-all duration-300 ${checked ? 'bg-white/20' : 'bg-transparent'}`}>
      <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </div>
);

const ColorPicker: React.FC<{ label: string; value: string; onChange: (color: string) => void; t: (key: string) => string; }> = ({ label, value, onChange, t }) => (
  <div className="flex items-center justify-between text-xs text-white/40 font-bold mb-2">
    <span>{label}</span>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-8 h-6 p-0 border-none bg-transparent cursor-pointer"
      title={label}
    />
  </div>
);

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; displayValue?: string; t: (key: string) => string; }> = ({ label, value, min, max, step, onChange, displayValue, t }) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<number>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => onChange(newValue), 50);
  };

  return (
    <div className="flex flex-col gap-1.5 mb-2">
      <div className="flex justify-between items-center text-xs text-white/40 font-bold">
        <span>{label}</span>
        <span className="text-white">{displayValue !== undefined ? displayValue : localValue.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={handleChange}
        className="w-full h-[1px] bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
      />
    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ElementType; isOpen: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border-b border-white/10 last:border-b-0">
    <button 
      className={`w-full flex items-center justify-between p-4 transition-colors hover:bg-white/5 ${isOpen ? 'bg-white/10 text-white' : 'text-white/60'}`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${isOpen ? 'text-white' : 'text-white/40'}`} />
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      {isOpen ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
    </button>
    {isOpen && (
      <div className="p-4 bg-white/5 animate-in slide-in-from-top-2 duration-200">
        {children}
      </div>
    )}
  </div>
);

interface SearchableSelectProps {
  options: CountryData[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder = "Select...", searchPlaceholder = "Search..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(opt => 
      opt.name.toLowerCase().includes(q) || 
      opt.nameZh.toLowerCase().includes(q) || 
      opt.id.toLowerCase().includes(q)
    );
  }, [options, search]);

  const selectedOption = options.find(o => o.id === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="w-full p-2 bg-white/5 border border-white/10 text-white text-xs cursor-pointer flex items-center justify-between hover:bg-white/10"
        onClick={() => { setIsOpen(!isOpen); setSearch(""); }}
      >
        <div className="flex flex-col truncate">
           <span className="font-bold">{selectedOption ? selectedOption.name : placeholder}</span>
           {selectedOption && <span className="text-[10px] text-white/40">{selectedOption.nameZh} ({selectedOption.id})</span>}
        </div>
        <ChevronDown className="w-3 h-3 text-white/60" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-black/90 border border-white/20 rounded shadow-2xl backdrop-blur-xl flex flex-col max-h-[250px]">
          <div className="p-2 border-b border-white/10 sticky top-0 bg-black/95 z-10">
            <div className="flex items-center gap-2 bg-white/10 rounded px-2 py-1">
               <Search className="w-3 h-3 text-white/40" />
               <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none text-white text-xs w-full focus:outline-none placeholder:text-white/30"
                placeholder={searchPlaceholder}
                autoFocus
               />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 terminal-scrollbar">
            {filteredOptions.length === 0 ? (
               <div className="p-3 text-center text-white/30 text-xs italic">No matches found</div>
            ) : (
                filteredOptions.map(opt => (
                <div 
                    key={opt.id} 
                    className={`p-2 cursor-pointer hover:bg-white/20 flex flex-col border-b border-white/5 last:border-0 ${value === opt.id ? 'bg-white/10' : ''}`}
                    onClick={() => { onChange(opt.id); setIsOpen(false); }}
                >
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-white">{opt.name}</span>
                        <span className="text-[10px] text-white/40 font-mono">{opt.id}</span>
                    </div>
                    <span className="text-[10px] text-white/60">{opt.nameZh}</span>
                </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export const Sidebar: React.FC<SidebarProps> = ({ state, onUpdate, t }) => { 
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLayer, setExpandedLayer] = useState<string | null>(state.strata?.[0]?.id || null);
  const [expandedGrid, setExpandedGrid] = useState<string | null>(state.gridLayers?.[0]?.id || null);
  const [expandedMore, setExpandedMore] = useState<string | null>(null);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  
  const [startCountry, setStartCountry] = useState('CHN');
  const [endCountry, setEndCountry] = useState('USA');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [surfaceTab, setSurfaceTab] = useState<'LAND' | 'OCEAN'>('LAND'); 

  // Theme Library States
  const [themeLib, setThemeLib] = useState<SavedTheme[]>([]);
  const [expandedLib, setExpandedLib] = useState(false);
  const [expandedPresets, setExpandedPresets] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme_library');
    if (saved) {
      try { setThemeLib(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveToLibrary = useCallback((theme: GlobeState, customName?: string) => {
    const name = customName || theme.themeName || t('unknownTheme');
    if (name.length > 80) {
      alert(t('themeLimitExceeded'));
      return;
    }
    const newTheme: SavedTheme = {
      id: `THEME_${Date.now()}`,
      name: name,
      config: { ...theme, themeName: name }
    };
    setThemeLib(prev => {
      const updated = [newTheme, ...prev].slice(0, 20); // Keep last 20
      localStorage.setItem('theme_library', JSON.stringify(updated));
      return updated;
    });
  }, [t]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    GRID_LAB: true,
    GLOBAL_SURFACE: false,
    STRATA: false,
    COUNTRIES: false,
    LINK_CHANNELS: false,
    APPEARANCE: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCountryUpdate = useCallback((id: string, updates: Partial<CountryConfig>) => {
    onUpdate({ countries: state.countries.map(c => c.id === id ? { ...c, ...updates } : c) });
  }, [state.countries, onUpdate]);

  const handleLayerUpdate = useCallback((id: string, updates: Partial<GlobeLayer>) => {
    onUpdate({ strata: state.strata.map(layer => layer.id === id ? { ...layer, ...updates } : layer) });
  }, [state.strata, onUpdate]);

  const handleGridLayerUpdate = useCallback((id: string, updates: Partial<GridLayer>) => {
    onUpdate({ gridLayers: state.gridLayers.map(layer => layer.id === id ? { ...layer, ...updates } : layer) });
  }, [state.gridLayers, onUpdate]);

  const handleSurfaceConfigUpdate = useCallback((type: 'landConfig' | 'oceanConfig', updates: Partial<SurfaceConfig>) => {
    const current = state[type];
    if (current) onUpdate({ [type]: { ...current, ...updates } });
  }, [state, onUpdate]);

  const addLayer = () => {
    const strata = state.strata || [];
    const newId = `STRATUM_${strata.length + 1}`;
    onUpdate({
      strata: [...strata, {
        id: newId,
        name: `新地层 ${strata.length + 1}`,
        visible: true,
        fillMode: FillMode.POLYGON_GRID,
        color1: '#00f2ff',
        color2: '#7000ff',
        opacity: 0.8,
        altitude: 0.005,
        gridSides: 6,
        gridSize: 0.05,
        gridHeight: 0.05,
        gridSegments: 1,
        gridGap: 0.0,
        gridDensity: 1000,
        gridColor: '#00f2ff',
        gridColor2: '#7000ff',
        gridGradientEnabled: true,
        gridGradientAxis: 'Y', 
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        showSea: false
      }]
    });
    setExpandedLayer(newId);
  };

  const removeLayer = (idToRemove: string) => {
    onUpdate({ strata: state.strata.filter(layer => layer.id !== idToRemove) });
    if (expandedLayer === idToRemove) setExpandedLayer(null);
  };

  const addGridLayer = () => {
    const grids = state.gridLayers || [];
    const newId = `GRID_${grids.length + 1}`;
    onUpdate({
      gridLayers: [...grids, {
        id: newId,
        name: `结构网格 ${grids.length + 1}`,
        visible: true,
        altitude: 0.05,
        color: '#ffffff',
        opacity: 0.2,
        resolution: 32,
        showWireframe: true,
        showPoints: false,
        pointSize: 0.1,
        pointColor: '#ffffff',
        dashLength: 0,
        dashGap: 0,
      }]
    });
    setExpandedGrid(newId);
  };

  const removeGridLayer = (idToRemove: string) => {
    onUpdate({ gridLayers: state.gridLayers.filter(layer => layer.id !== idToRemove) });
    if (expandedGrid === idToRemove) setExpandedGrid(null);
  };

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return state.countries || [];
    const q = searchQuery.toLowerCase();
    return state.countries.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [searchQuery, state.countries]);

  const availableCountriesForDropdown = useMemo(() => {
    const existingIds = new Set((state.countries || []).map(c => c.id));
    return COUNTRY_LIST.filter(country => !existingIds.has(country.id));
  }, [state.countries]);

  const addCountry = (countryId: string) => {
    const countryName = COUNTRY_LIST.find(c => c.id === countryId)?.name || countryId;
    onUpdate({
      countries: [
        ...(state.countries || []),
        {
          id: countryId,
          name: countryName,
          color: '#ffffff',
          color2: '#eeeeee',
          gradientEnabled: true,
          gradientAxis: 'Y',
          height: 0.01,
          opacity: 0.2, 
          textureSync: false
        }
      ]
    });
    setExpandedCountry(countryId);
    setSearchQuery(''); 
  };

  const removeCountry = (idToRemove: string) => {
    onUpdate({ countries: state.countries.filter(c => c.id !== idToRemove) });
    if (expandedCountry === idToRemove) setExpandedCountry(null);
  };

  const renderSurfaceConfigControls = (config: SurfaceConfig | undefined, type: 'landConfig' | 'oceanConfig') => {
    if (!config) return null;
    return (
      <>
        <div className="mb-4">
          <label className="block text-xs text-white/40 uppercase font-bold mb-1">{t('style')}</label>
          <div className="flex gap-4">
            <label className="flex items-center text-xs text-white/60 cursor-pointer">
              <input
                type="radio"
                name={`${type}-style`}
                value={SurfaceStyle.SOLID}
                checked={config.style === SurfaceStyle.SOLID}
                onChange={() => handleSurfaceConfigUpdate(type, { style: SurfaceStyle.SOLID })}
                className="mr-2"
              />
              {t('styleSolid')}
            </label>
            <label className="flex items-center text-xs text-white/60 cursor-pointer">
              <input
                type="radio"
                name={`${type}-style`}
                value={SurfaceStyle.REALISTIC}
                checked={config.style === SurfaceStyle.REALISTIC}
                onChange={() => handleSurfaceConfigUpdate(type, { style: SurfaceStyle.REALISTIC })}
                className="mr-2"
              />
              {t('styleRealistic')}
            </label>
          </div>
        </div>

        <ColorPicker label={t('primaryColor')} value={config.color} onChange={(v) => handleSurfaceConfigUpdate(type, { color: v })} t={t} />
        <Switch label={t('gridGradient')} checked={config.gradientEnabled} onChange={() => handleSurfaceConfigUpdate(type, { gradientEnabled: !config.gradientEnabled })} />
        {config.gradientEnabled && (
          <ColorPicker label={t('secondaryColor')} value={config.color2} onChange={(v) => handleSurfaceConfigUpdate(type, { color2: v })} t={t} />
        )}
        <Slider label={t('opacity')} value={config.opacity} min={0.0} max={1.0} step={0.01} onChange={(v) => handleSurfaceConfigUpdate(type, { opacity: v })} t={t} />
      </>
    );
  };

  // 统一的 select 样式类
  const selectClassName = "w-full p-2 bg-[#1a1a1a] border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 [&>option]:bg-[#1a1a1a] [&>option]:text-white";

  return (
    <div className="w-80 h-full bg-gradient-to-b from-black/80 to-black/50 backdrop-blur-md text-white border-l border-white/10 flex flex-col overflow-hidden shadow-xl">
      <div className="p-4 border-b border-white/10 flex items-center justify-between text-lg font-bold tracking-wider">
        <h2 className="text-white uppercase">{t('terminalTitle')}</h2>
        <Fingerprint className="w-5 h-5 text-white/60" />
      </div>

      <div className="flex-1 overflow-y-auto terminal-scrollbar text-white">
        {/* 1. Structure Grid */}
        <Section title={t('gridLab')} icon={Grid} isOpen={!!expandedSections['GRID_LAB']} onToggle={() => toggleSection('GRID_LAB')}>
            <div className="space-y-4">
                {(state.gridLayers || []).map((grid) => (
                   <div key={grid.id} className="border-t border-white/5 pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
                      <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setExpandedGrid(expandedGrid === grid.id ? null : grid.id)}>
                        <h4 className="text-xs font-bold text-white/80 uppercase">{grid.name}</h4>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); removeGridLayer(grid.id); }} className="p-1 text-white/50 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleGridLayerUpdate(grid.id, { visible: !grid.visible }); }} className="p-1 text-white/60 hover:text-white transition-colors">
                            {grid.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                          </button>
                          {expandedGrid === grid.id ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronRight className="w-4 h-4 text-white/60" />}
                        </div>
                      </div>
                      
                      {expandedGrid === grid.id && (
                        <div className="space-y-4 mt-2 pl-2 border-l border-white/10">
                          <input
                            type="text"
                            value={grid.name}
                            onChange={(e) => handleGridLayerUpdate(grid.id, { name: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 text-white text-xs"
                          />
                          <Slider label={t('altitude')} value={grid.altitude} min={0} max={5} step={0.01} onChange={(v) => handleGridLayerUpdate(grid.id, { altitude: v })} t={t} />
                          <Slider label={t('resolution')} value={grid.resolution} min={8} max={128} step={4} onChange={(v) => handleGridLayerUpdate(grid.id, { resolution: v })} t={t} />
                          <ColorPicker label={t('wireframeColor')} value={grid.color} onChange={(v) => handleGridLayerUpdate(grid.id, { color: v })} t={t} />
                          <Slider label={t('opacity')} value={grid.opacity} min={0} max={1} step={0.01} onChange={(v) => handleGridLayerUpdate(grid.id, { opacity: v })} t={t} />
                          
                          <div className="border-t border-white/10 pt-4">
                            <h5 className="text-[10px] font-bold text-white/40 uppercase mb-2">{t('gridStructure')}</h5>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-white/60 font-bold">{t('wireframe')}</span>
                                <button onClick={() => handleGridLayerUpdate(grid.id, { showWireframe: !grid.showWireframe })} className="text-white/80 hover:text-white">
                                    {grid.showWireframe ? <Eye size={14} /> : <EyeOff size={14} className="text-white/30" />}
                                </button>
                            </div>

                            {grid.showWireframe && (
                              <div className="mt-2 space-y-2">
                                <Slider label={t('dashLength')} value={grid.dashLength} min={0} max={10} step={0.1} onChange={(v) => handleGridLayerUpdate(grid.id, { dashLength: v })} t={t} />
                                <Slider label={t('dashGap')} value={grid.dashGap} min={0} max={5} step={0.1} onChange={(v) => handleGridLayerUpdate(grid.id, { dashGap: v })} t={t} />
                              </div>
                            )}
                          </div>

                          <div className="border-t border-white/10 pt-4">
                            <h5 className="text-[10px] font-bold text-white/40 uppercase mb-2">{t('gridLab')}</h5>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-white/60 font-bold">{t('showPoints')}</span>
                                <button onClick={() => handleGridLayerUpdate(grid.id, { showPoints: !grid.showPoints })} className="text-white/80 hover:text-white">
                                    {grid.showPoints ? <Eye size={14} /> : <EyeOff size={14} className="text-white/30" />}
                                </button>
                            </div>

                            {grid.showPoints && (
                               <div className="mt-2 space-y-2">
                                 <Slider label={t('pointSize')} value={grid.pointSize} min={0.01} max={1} step={0.01} onChange={(v) => handleGridLayerUpdate(grid.id, { pointSize: v })} t={t} />
                                 <ColorPicker label={t('pointColor')} value={grid.pointColor} onChange={(v) => handleGridLayerUpdate(grid.id, { pointColor: v })} t={t} />
                               </div>
                            )}
                          </div>
                        </div>
                      )}
                   </div>
                ))}
                
                <button onClick={addGridLayer} className="w-full py-2 border border-white/20 hover:bg-white hover:text-black transition-all text-xs font-bold flex items-center justify-center gap-2 mt-4">
                  <Plus className="w-4 h-4" /> {t('addGrid')}
                </button>
            </div>
        </Section>

        {/* 2. Global Surface */}
        <Section title={t('globalSurface')} icon={Palette} isOpen={!!expandedSections['GLOBAL_SURFACE']} onToggle={() => toggleSection('GLOBAL_SURFACE')}>
             <div className="space-y-6">
                {/* Satellite */}
                <div className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between cursor-pointer mb-3" onClick={() => setExpandedMore(expandedMore === 'satellite' ? null : 'satellite')}>
                        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2"><ImageIcon className="w-3 h-3" /> {t('satelliteMap')}</h3>
                        <div className="flex items-center gap-2">
                           <button onClick={(e) => { e.stopPropagation(); onUpdate({ satellite: { ...state.satellite, show: !state.satellite?.show } }); }} className="p-1 text-white/60 hover:text-white transition-colors">
                              {state.satellite?.show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                           </button>
                           {expandedMore === 'satellite' ? <ChevronDown className="w-3 h-3 text-white/60" /> : <ChevronRight className="w-3 h-3 text-white/60" />}
                        </div>
                    </div>
                    {expandedMore === 'satellite' && (
                        <div className="space-y-4 pl-2 border-l border-white/10">
                        {state.satellite?.show && (
                            <>
                            <Slider
                                label={t('opacity')}
                                value={state.satellite?.opacity || 0.5}
                                min={0.0}
                                max={1.0}
                                step={0.01}
                                onChange={(v) => onUpdate({ satellite: { ...state.satellite, opacity: v } })}
                                t={t}
                            />
                            <label className="block text-xs text-white/40 uppercase font-bold mb-1">{t('blendMode')}</label>
                            <select
                                value={state.satellite?.blendMode || 'overlay'}
                                onChange={(e) => onUpdate({ satellite: { ...state.satellite, blendMode: e.target.value as BlendMode } })}
                                className={selectClassName}
                            >
                                <option value="source-over">{t('blendNormal')}</option>
                                <option value="overlay">{t('blendOverlay')}</option>
                                <option value="multiply">{t('blendMultiply')}</option>
                                <option value="screen">{t('blendScreen')}</option>
                            </select>
                            </>
                        )}
                        </div>
                    )}
                </div>
                
                {/* Border */}
                <div className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between cursor-pointer mb-3" onClick={() => setExpandedMore(expandedMore === 'globalBorder' ? null : 'globalBorder')}>
                        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2"><Ruler className="w-3 h-3" /> {t('borderConfig')}</h3>
                        <div className="flex items-center gap-2">
                           <button onClick={(e) => { e.stopPropagation(); onUpdate({ globalBorder: { ...state.globalBorder, visible: !state.globalBorder?.visible } }); }} className="p-1 text-white/60 hover:text-white transition-colors">
                              {state.globalBorder?.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                           </button>
                           {expandedMore === 'globalBorder' ? <ChevronDown className="w-3 h-3 text-white/60" /> : <ChevronRight className="w-3 h-3 text-white/60" />}
                        </div>
                    </div>
                    {expandedMore === 'globalBorder' && (
                        <div className="space-y-4 pl-2 border-l border-white/10">
                        {state.globalBorder?.visible && (
                            <>
                            <Slider
                                label={t('borderWidth')}
                                value={state.globalBorder?.width || 0.6}
                                min={0.1}
                                max={2.0}
                                step={0.1}
                                onChange={(v) => onUpdate({ globalBorder: { ...state.globalBorder, width: v } })}
                                t={t}
                            />
                            <ColorPicker
                                label={t('primaryColor')}
                                value={state.globalBorder?.color || '#00f2ff'}
                                onChange={(v) => onUpdate({ globalBorder: { ...state.globalBorder, color: v } })}
                                t={t}
                            />
                            <Switch 
                              label={t('gridGradient')} 
                              checked={state.globalBorder?.gradientEnabled || false} 
                              onChange={() => onUpdate({ globalBorder: { ...state.globalBorder, gradientEnabled: !state.globalBorder.gradientEnabled } })} 
                            />
                            {state.globalBorder.gradientEnabled && (
                              <ColorPicker
                                  label={t('secondaryColor')}
                                  value={state.globalBorder?.color2 || '#ffffff'}
                                  onChange={(v) => onUpdate({ globalBorder: { ...state.globalBorder, color2: v } })}
                                  t={t}
                              />
                            )}
                            <Slider
                                label={t('opacity')}
                                value={state.globalBorder?.opacity ?? 1.0}
                                min={0.0}
                                max={1.0}
                                step={0.01}
                                onChange={(v) => onUpdate({ globalBorder: { ...state.globalBorder, opacity: v } })}
                                t={t}
                            />
                            </>
                        )}
                        </div>
                    )}
                </div>

                {/* Base Height */}
                <div className="border-b border-white/10 pb-4">
                     <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2 mb-3"><Box className="w-3 h-3" /> {t('baseHeight')}</h3>
                    <Slider
                        label={t('extrusionAmt')}
                        value={state.landAltitude}
                        min={0.0}
                        max={5}
                        step={0.01}
                        onChange={(v) => onUpdate({ landAltitude: v })}
                        t={t}
                    />
                </div>

                {/* Land/Ocean Config */}
                <div>
                    <div className="flex bg-white/5 border-b border-white/10 mb-4">
                        <button
                        className={`flex-1 py-2 text-center text-xs font-bold uppercase transition-colors ${surfaceTab === 'LAND' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'}`}
                        onClick={() => setSurfaceTab('LAND')}
                        >
                        <Square className="inline-block w-3 h-3 mr-2" />
                        {t('landConfig')}
                        </button>
                        <button
                        className={`flex-1 py-2 text-center text-xs font-bold uppercase transition-colors ${surfaceTab === 'OCEAN' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'}`}
                        onClick={() => setSurfaceTab('OCEAN')}
                        >
                        <Waves className="inline-block w-3 h-3 mr-2" />
                        {t('oceanConfig')}
                        </button>
                    </div>
                    {surfaceTab === 'LAND' && renderSurfaceConfigControls(state.landConfig, 'landConfig')}
                    {surfaceTab === 'OCEAN' && renderSurfaceConfigControls(state.oceanConfig, 'oceanConfig')}
                </div>
             </div>
        </Section>

        {/* 3. Strata Texture Fill */}
        <Section title={t('surfaceConfig')} icon={Layers} isOpen={!!expandedSections['STRATA']} onToggle={() => toggleSection('STRATA')}>
            <div className="space-y-4">
                  <Switch
                    label={t('surfaceSync')}
                    checked={state.surfaceSync}
                    onChange={() => onUpdate({ surfaceSync: !state.surfaceSync })}
                  />

                  {(state.strata || []).map((layer) => (
                    <div key={layer.id} className="border-t border-white/5 pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
                      <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setExpandedLayer(expandedLayer === layer.id ? null : layer.id)}>
                        <h4 className="text-xs font-bold text-white/80 uppercase">{layer.name || layer.id}</h4>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }} className="p-1 text-white/50 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleLayerUpdate(layer.id, { visible: !layer.visible }); }} className="p-1 text-white/60 hover:text-white transition-colors">
                            {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                          </button>
                          {expandedLayer === layer.id ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronRight className="w-4 h-4 text-white/60" />}
                        </div>
                      </div>
                      {expandedLayer === layer.id && (
                        <div className="space-y-3 mt-2 pl-2 border-l border-white/10">
                          <input
                            type="text"
                            value={layer.name}
                            onChange={(e) => handleLayerUpdate(layer.id, { name: e.target.value })}
                            className="w-full p-2 bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30"
                            placeholder={t('layerName')}
                          />
                          <Slider
                            label={t('altitude')}
                            value={layer.altitude}
                            min={0.0}
                            max={5}
                            step={0.01}
                            onChange={(v) => handleLayerUpdate(layer.id, { altitude: v })}
                            t={t}
                          />

                          <label className="block text-xs text-white/40 uppercase font-bold mb-1">{t('fillMode')}</label>
                          <select
                            value={layer.fillMode}
                            onChange={(e) => handleLayerUpdate(layer.id, { fillMode: e.target.value as FillMode })}
                            className={selectClassName}
                          >
                            <option value={FillMode.COLOR}>{t('modeColor')}</option>
                            <option value={FillMode.POLYGON_GRID}>{t('modePolygon')}</option>
                            <option value={FillMode.DOT_MATRIX}>{t('modeDot')}</option>
                          </select>

                          {layer.fillMode === FillMode.COLOR && (
                            <>
                              <ColorPicker label={t('primaryColor')} value={layer.color1} onChange={(v) => handleLayerUpdate(layer.id, { color1: v })} t={t} />
                              <Switch label={t('gridGradient')} checked={layer.gridGradientEnabled} onChange={() => handleLayerUpdate(layer.id, { gridGradientEnabled: !layer.gridGradientEnabled })} />
                              {layer.gridGradientEnabled && (
                                <ColorPicker label={t('secondaryColor')} value={layer.color2} onChange={(v) => handleLayerUpdate(layer.id, { color2: v })} t={t} />
                              )}
                              <Slider label={t('opacity')} value={layer.opacity} min={0.0} max={1.0} step={0.01} onChange={(v) => handleLayerUpdate(layer.id, { opacity: v })} t={t} />
                            </>
                          )}

                          {(layer.fillMode === FillMode.POLYGON_GRID || layer.fillMode === FillMode.DOT_MATRIX) && (
                            <div className="space-y-3 border-t border-white/10 pt-3 mt-3">
                              <h5 className="text-xs font-bold text-white/60 uppercase">{t('gridSettings')}</h5>
                              {layer.fillMode === FillMode.POLYGON_GRID && (
                                <Slider label={t('gridSides')} value={layer.gridSides} min={3} max={12} step={1} onChange={(v) => handleLayerUpdate(layer.id, { gridSides: v })} t={t} />
                              )}
                              <Slider label={t('gridSize')} value={layer.gridSize} min={0.01} max={10} step={0.01} onChange={(v) => handleLayerUpdate(layer.id, { gridSize: v })} t={t} />
                              <Slider label={t('gridHeight')} value={layer.gridSize} min={0.01} max={500} step={0.01} onChange={(v) => handleLayerUpdate(layer.id, { gridHeight: v })} t={t} />
                              <Slider label={t('segments')} value={layer.gridSegments} min={1} max={20} step={1} onChange={(v) => handleLayerUpdate(layer.id, { gridSegments: v })} t={t} />
                              <Slider label={t('gap')} value={layer.gridGap} min={0.0} max={0.9} step={0.01} onChange={(v) => handleLayerUpdate(layer.id, { gridGap: v })} t={t} />
                              <Slider label={t('gridDensity')} value={layer.gridDensity} min={100} max={10000} step={100} onChange={(v) => handleLayerUpdate(layer.id, { gridDensity: v })} t={t} />
                              <ColorPicker label={t('gridColorStart')} value={layer.gridColor} onChange={(v) => handleLayerUpdate(layer.id, { gridColor: v })} t={t} />
                              <Switch label={t('gridGradient')} checked={layer.gridGradientEnabled} onChange={() => handleLayerUpdate(layer.id, { gridGradientEnabled: !layer.gridGradientEnabled })} />
                              {layer.gridGradientEnabled && (
                                <>
                                  <ColorPicker label={t('gridColorEnd')} value={layer.color2} onChange={(v) => handleLayerUpdate(layer.id, { color2: v })} t={t} />
                                  <label className="block text-xs text-white/40 uppercase font-bold mb-1">{t('gradientAxis')}</label>
                                  <select
                                    value={layer.gridGradientAxis}
                                    onChange={(e) => handleLayerUpdate(layer.id, { gridGradientAxis: e.target.value as GradientAxis })}
                                    className={selectClassName}
                                  >
                                    <option value="X">{t('axisX')}</option>
                                    <option value="Y">{t('axisY')}</option>
                                    <option value="Z">{t('axisZ')}</option>
                                  </select>
                                </>
                              )}
                              <Slider label={t('opacity')} value={layer.opacity} min={0.0} max={1.0} step={0.01} onChange={(v) => handleLayerUpdate(layer.id, { opacity: v })} t={t} />
                              <Switch label={t('seaSync')} checked={layer.showSea} onChange={() => handleLayerUpdate(layer.id, { showSea: !layer.showSea })} />
                              <div className="border-t border-white/10 pt-3 mt-3">
                                <h5 className="text-xs font-bold text-white/60 uppercase flex items-center gap-1"><RotateCw className="w-3 h-3" /> {t('spatialOrientation')}</h5>
                                <Slider label={t('rotX')} value={layer.rotationX} min={0} max={360} step={1} onChange={(v) => handleLayerUpdate(layer.id, { rotationX: v })} t={t} />
                                <Slider label={t('rotY')} value={layer.rotationY} min={0} max={360} step={1} onChange={(v) => handleLayerUpdate(layer.id, { rotationY: v })} t={t} />
                                <Slider label={t('rotZ')} value={layer.rotationZ} min={0} max={360} step={1} onChange={(v) => handleLayerUpdate(layer.id, { rotationZ: v })} t={t} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={addLayer} className="w-full py-2 border border-white/20 hover:bg-white hover:text-black transition-all text-xs font-bold flex items-center justify-center gap-2 mt-4">
                    <Plus className="w-4 h-4" /> {t('addLayer')}
                  </button>
            </div>
        </Section>

        {/* 4. Extruded Countries */}
        <Section title={t('extrudedCountries')} icon={Map} isOpen={!!expandedSections['COUNTRIES']} onToggle={() => toggleSection('COUNTRIES')}>
             <div className="space-y-4">
                  <div className="mb-4">
                    <div className="text-xs text-white/40 font-bold mb-2 uppercase">{t('addCountryTitle')}</div>
                    <SearchableSelect options={availableCountriesForDropdown} value="" onChange={addCountry} placeholder={t('searchAddPlaceholder')} searchPlaceholder={t('searchPlaceholder')} />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-2 bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30"
                    />
                  </div>

                  <ul className="space-y-3 border-t border-white/10 pt-2">
                    {filteredCountries.map(country => (
                      <li key={country.id} className="border border-white/10 p-2 rounded bg-white/5">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedCountry(expandedCountry === country.id ? null : country.id)}>
                          <span className="text-sm font-bold text-white/80 uppercase">{country.name} ({country.id})</span>
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); removeCountry(country.id); }} className="p-1 text-white/50 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {expandedCountry === country.id ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronRight className="w-4 h-4 text-white/60" />}
                          </div>
                        </div>
                        {expandedCountry === country.id && (
                          <div className="space-y-3 mt-2 pt-2 border-t border-white/10">
                            <Slider label={t('extrusionAmt')} value={country.height} min={0.0} max={0.5} step={0.01} onChange={(v) => handleCountryUpdate(country.id, { height: v })} t={t} />
                            <ColorPicker label={t('countryColor')} value={country.color} onChange={(v) => handleCountryUpdate(country.id, { color: v })} t={t} />
                             <Slider label={t('opacity')} value={country.opacity ?? 1.0} min={0.0} max={1.0} step={0.01} onChange={(v) => handleCountryUpdate(country.id, { opacity: v })} t={t} />
                            <Switch label={t('textureSync')} checked={country.textureSync || false} onChange={() => handleCountryUpdate(country.id, { textureSync: !country.textureSync })} />
                            <Switch label={t('gridGradient')} checked={country.gradientEnabled || false} onChange={() => handleCountryUpdate(country.id, { gradientEnabled: !country.gradientEnabled })} />
                            {country.gradientEnabled && (
                                <ColorPicker label={t('countryColor2')} value={country.color2 || '#eeeeee'} onChange={(v) => handleCountryUpdate(country.id, { color2: v })} t={t} />
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
             </div>
        </Section>
        
        {/* 5. Link Channels */}
        <Section title={t('linkChannels')} icon={Share2} isOpen={!!expandedSections['LINK_CHANNELS']} onToggle={() => toggleSection('LINK_CHANNELS')}>
            <div className="space-y-6">
                <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xs font-bold text-white/60 uppercase mb-3">{t('arcStyleGlobal')}</h3>
                    <ColorPicker label={t('arcColor')} value={state.arcColor} onChange={(v) => onUpdate({ arcColor: v })} t={t} />
                    <Switch label={t('gridGradient')} checked={state.arcGradientEnabled} onChange={() => onUpdate({ arcGradientEnabled: !state.arcGradientEnabled })} />
                    {state.arcGradientEnabled && <ColorPicker label={t('countryColor2')} value={state.arcColor2} onChange={(v) => onUpdate({ arcColor2: v })} t={t} />}
                    <Slider label={t('arcWidth')} value={state.arcThickness} min={0.1} max={5} step={0.1} onChange={(v) => onUpdate({ arcThickness: v })} t={t} />
                    <Slider label={t('arcSpeed')} value={state.arcAnimateTime} min={500} max={10000} step={100} displayValue={state.arcAnimateTime + 'ms'} onChange={(v) => onUpdate({ arcAnimateTime: v })} t={t} />
                    <Slider label={t('arcDashLen')} value={state.arcSegments} min={5} max={100} step={1} onChange={(v) => onUpdate({ arcSegments: v })} t={t} />
                    <Slider label={t('arcDashGap')} value={state.arcGap} min={0} max={1} step={0.01} onChange={(v) => onUpdate({ arcGap: v })} t={t} />
                    <Slider label={t('opacity')} value={state.arcOpacity} min={0} max={1} step={0.01} onChange={(v) => onUpdate({ arcOpacity: v })} t={t} />
                </div>

                <div className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-white/60 uppercase">{t('randomFlux')}</h3>
                        <Switch checked={state.randomArcs.visible} onChange={() => onUpdate({ randomArcs: { ...state.randomArcs, visible: !state.randomArcs.visible } })} />
                    </div>
                    {state.randomArcs.visible && (
                        <div className="space-y-2 mt-2">
                            <label className="block text-xs text-white/40 uppercase font-bold mb-1">{t('distribution')}</label>
                            <div className="flex gap-2 mb-2">
                                <button onClick={() => onUpdate({ randomArcs: { ...state.randomArcs, distribution: ArcDistribution.VERTICAL } })} className={`flex-1 py-1 text-[10px] border ${state.randomArcs.distribution === ArcDistribution.VERTICAL ? 'bg-white text-black border-white' : 'text-white border-white/20'}`}>{t('distVertical')}</button>
                                <button onClick={() => onUpdate({ randomArcs: { ...state.randomArcs, distribution: ArcDistribution.HORIZONTAL } })} className={`flex-1 py-1 text-[10px] border ${state.randomArcs.distribution === ArcDistribution.HORIZONTAL ? 'bg-white text-black border-white' : 'text-white border-white/20'}`}>{t('distHorizontal')}</button>
                            </div>
                            <Slider label={t('arcQuantity')} value={state.randomArcs.count} min={0} max={100} step={1} onChange={(v) => onUpdate({ randomArcs: { ...state.randomArcs, count: v } })} t={t} />
                            <Slider label={t('bundleSize')} value={state.randomArcs.bundleSize} min={1} max={10} step={1} onChange={(v) => onUpdate({ randomArcs: { ...state.randomArcs, bundleSize: v } })} t={t} />
                            <Slider label={t('spacing')} value={state.randomArcs.spacing} min={0} max={10} step={0.01} onChange={(v) => onUpdate({ randomArcs: { ...state.randomArcs, spacing: v } })} t={t} />
                            <Slider label={t('arcCurvature')} value={state.randomArcs.curvature} min={0} max={2} step={0.1} onChange={(v) => onUpdate({ randomArcs: { ...state.randomArcs, curvature: v } })} t={t} />
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-xs font-bold text-white/60 uppercase mb-3">{t('manualLinks')}</h3>
                    <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                            <label className="text-[10px] text-white/40 block mb-1">{t('origin')}</label>
                            <SearchableSelect options={COUNTRY_LIST} value={startCountry} onChange={setStartCountry} placeholder="Origin" searchPlaceholder="Search..." />
                        </div>
                        <div className="flex items-center justify-center pt-4"><Link2 className="w-4 h-4 text-white/40" /></div>
                        <div className="flex-1">
                            <label className="text-[10px] text-white/40 block mb-1">{t('destination')}</label>
                            <SearchableSelect options={COUNTRY_LIST} value={endCountry} onChange={setEndCountry} placeholder="Target" searchPlaceholder="Search..." />
                        </div>
                    </div>
                    <button onClick={() => {
                        const newGroup: ArcGroup = { id: `LINK_${Date.now()}`, startCountryId: startCountry, endCountryId: endCountry, visible: true, bundleSize: 1, distribution: ArcDistribution.VERTICAL, spacing: 0.1, curvature: 0.5 };
                        onUpdate({ arcGroups: [...state.arcGroups, newGroup] });
                    }} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold mb-4">{t('establishLinkBtn')}</button>

                    <ul className="space-y-2">
                        {state.arcGroups.map(group => (
                            <li key={group.id} className="bg-white/5 p-2 rounded border border-white/10">
                                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedGroupId(expandedGroupId === group.id ? null : group.id)}>
                                    <span className="text-xs font-bold">{group.startCountryId} -&gt; {group.endCountryId}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); onUpdate({ arcGroups: state.arcGroups.filter(g => g.id !== group.id) }); }} className="text-white/40 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                        {expandedGroupId === group.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </div>
                                </div>
                                {expandedGroupId === group.id && (
                                    <div className="mt-2 pt-2 border-t border-white/10 space-y-2">
                                        <label className="block text-xs text-white/40 uppercase font-bold mb-1">{t('distribution')}</label>
                                        <div className="flex gap-2 mb-2">
                                            <button onClick={() => onUpdate({ arcGroups: state.arcGroups.map(g => g.id === group.id ? { ...g, distribution: ArcDistribution.VERTICAL } : g) })} className={`flex-1 py-1 text-[10px] border ${group.distribution === ArcDistribution.VERTICAL ? 'bg-white text-black border-white' : 'text-white border-white/20'}`}>{t('distVertical')}</button>
                                            <button onClick={() => onUpdate({ arcGroups: state.arcGroups.map(g => g.id === group.id ? { ...g, distribution: ArcDistribution.HORIZONTAL } : g) })} className={`flex-1 py-1 text-[10px] border ${group.distribution === ArcDistribution.HORIZONTAL ? 'bg-white text-black border-white' : 'text-white border-white/20'}`}>{t('distHorizontal')}</button>
                                        </div>
                                        <Slider label={t('bundleSize')} value={group.bundleSize} min={1} max={10} step={1} onChange={(v) => onUpdate({ arcGroups: state.arcGroups.map(g => g.id === group.id ? { ...g, bundleSize: v } : g) })} t={t} />
                                        <Slider label={t('spacing')} value={group.spacing} min={0} max={10} step={0.01} onChange={(v) => onUpdate({ arcGroups: state.arcGroups.map(g => g.id === group.id ? { ...g, spacing: v } : g) })} t={t} />
                                        <Slider label={t('arcCurvature')} value={group.curvature} min={0} max={2} step={0.1} onChange={(v) => onUpdate({ arcGroups: state.arcGroups.map(g => g.id === group.id ? { ...g, curvature: v } : g) })} t={t} />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Section>

        {/* 6. Appearance */}
        <Section title={t('appearance')} icon={Settings2} isOpen={!!expandedSections['APPEARANCE']} onToggle={() => toggleSection('APPEARANCE')}>
            <div className="space-y-4">
                <div className="border-b border-white/10 pb-4 space-y-2">
                    <h3 className="text-xs font-bold text-white/60 uppercase mb-2">SYSTEM VISUALS</h3>
                    <div className="flex items-center justify-between"><span className="text-xs font-bold">{t('autoRotate')}</span><Switch checked={state.autoRotate} onChange={() => onUpdate({ autoRotate: !state.autoRotate })} /></div>
                    <div className="flex items-center justify-between"><span className="text-xs font-bold">{t('showAtmosphere')}</span><Switch checked={state.atmosphere.show} onChange={() => onUpdate({ atmosphere: { ...state.atmosphere, show: !state.atmosphere.show } })} /></div>
                    {state.atmosphere.show && (
                        <div className="pl-2 border-l border-white/10 mt-2">
                            <ColorPicker label={t('atmosColor')} value={state.atmosphere.color} onChange={(v) => onUpdate({ atmosphere: { ...state.atmosphere, color: v } })} t={t} />
                            <Slider label={t('atmosAltitude')} value={state.atmosphere.altitude} min={0} max={1} step={0.01} onChange={(v) => onUpdate({ atmosphere: { ...state.atmosphere, altitude: v } })} t={t} />
                        </div>
                    )}
                    <div className="flex items-center justify-between mt-2"><span className="text-xs font-bold">{t('heightSync')}</span><Switch checked={state.heightSync} onChange={() => onUpdate({ heightSync: !state.heightSync })} /></div>
                </div>

                {/* Theme Manager Enhanced */}
                <div>
                    <h3 className="text-xs font-bold text-white/60 uppercase mb-2">{t('themeManager')}</h3>
                    
                    {/* Recommended Themes at the top of Theme Manager */}
                    <div className="border-t border-white/10 pt-2 mb-4">
                         <button 
                          onClick={() => setExpandedPresets(!expandedPresets)}
                          className="w-full flex items-center justify-between p-2 text-white/60 hover:text-white transition-colors"
                        >
                           <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs font-bold uppercase tracking-widest">{t('presetThemes')}</span>
                           </div>
                           {expandedPresets ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        {expandedPresets && (
                            <div className="mt-2 space-y-1.5 mb-4">
                                {PRESET_THEMES.map((theme, i) => (
                                    <div 
                                      key={i} 
                                      className="group flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded hover:border-yellow-500/40 transition-all cursor-pointer"
                                      onClick={() => onUpdate({ ...theme.config, themeName: theme.name })}
                                    >
                                       <div className="flex items-center gap-2 truncate">
                                          <Sparkles className="w-3 h-3 text-yellow-500/50 group-hover:text-yellow-500" />
                                          <span className="text-[10px] font-bold text-white/80 group-hover:text-white truncate">{theme.name}</span>
                                       </div>
                                       <Check className="w-3 h-3 text-white/10 group-hover:text-white/40" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Theme Name Input */}
                    <div className="mb-4">
                       <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-tighter">{t('themeNamePlaceholder')}</label>
                       <div className="relative">
                          <input 
                            type="text"
                            value={state.themeName}
                            maxLength={81}
                            onChange={(e) => {
                                if (e.target.value.length > 80) {
                                    alert(t('themeLimitExceeded'));
                                    return;
                                }
                                onUpdate({ themeName: e.target.value });
                            }}
                            className="w-full bg-white/5 border border-white/20 p-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                          />
                          <div className={`absolute right-2 top-2 text-[8px] font-mono ${state.themeName.length >= 80 ? 'text-red-500' : 'text-white/20'}`}>
                             {state.themeName.length}/80
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button 
                            onClick={() => saveToLibrary(state)}
                            className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all"
                        >
                            <Library className="w-4 h-4 mb-1" />
                            <span className="text-[10px] font-bold uppercase">{t('saveTheme')}</span>
                        </button>
                        <button 
                            onClick={() => {
                                const json = JSON.stringify(state);
                                const blob = new Blob([json], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${state.themeName || 'holo-globe'}.json`;
                                a.click();
                            }}
                            className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all"
                        >
                            <Download className="w-4 h-4 mb-1" />
                            <span className="text-[10px] font-bold uppercase">{t('exportJson')}</span>
                        </button>
                    </div>

                    <label className="w-full py-3 bg-white/10 border border-white/20 text-xs font-bold hover:bg-white hover:text-black transition-all text-center cursor-pointer block mb-4 uppercase flex items-center justify-center gap-2">
                        <ImageIcon className="w-4 h-4" /> {t('loadTheme')}
                        <input type="file" className="hidden" accept=".json" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    try {
                                        const parsed = JSON.parse(ev.target?.result as string);
                                        const finalConfig = { ...parsed, themeName: parsed.themeName || file.name.replace('.json', '') };
                                        onUpdate(finalConfig);
                                        saveToLibrary(finalConfig);
                                        alert(t('themeAutoSaved'));
                                    } catch (err) { console.error(err); }
                                };
                                reader.readAsText(file);
                            }
                        }} />
                    </label>

                    {/* Theme Library UI */}
                    <div className="border-t border-white/10 pt-4">
                        <button 
                          onClick={() => setExpandedLib(!expandedLib)}
                          className="w-full flex items-center justify-between p-2 text-white/60 hover:text-white transition-colors"
                        >
                           <div className="flex items-center gap-2">
                              <Library className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-widest">{t('themeLib')} ({themeLib.length})</span>
                           </div>
                           {expandedLib ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        {expandedLib && (
                           <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto terminal-scrollbar pr-1">
                              {themeLib.length === 0 ? (
                                 <div className="p-4 text-center text-[10px] text-white/20 italic">{t('neuralUplink')}...</div>
                              ) : (
                                 themeLib.map(tItem => (
                                    <div 
                                      key={tItem.id} 
                                      className="group flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded hover:border-white/20 transition-all cursor-pointer"
                                      onClick={() => onUpdate(tItem.config)}
                                    >
                                       <div className="flex flex-col truncate pr-2">
                                          <span className="text-[10px] font-bold text-white/80 group-hover:text-white truncate">{tItem.name}</span>
                                          <span className="text-[8px] text-white/20 font-mono">ID: {tItem.id.split('_')[1]}</span>
                                       </div>
                                       <button 
                                         onClick={(e) => {
                                            e.stopPropagation();
                                            const updated = themeLib.filter(lib => lib.id !== tItem.id);
                                            setThemeLib(updated);
                                            localStorage.setItem('theme_library', JSON.stringify(updated));
                                         }}
                                         className="p-1 text-white/10 hover:text-red-500 transition-colors"
                                       >
                                          <Trash2 className="w-3.5 h-3.5" />
                                       </button>
                                    </div>
                                 ))
                              )}
                           </div>
                        )}
                    </div>
                </div>
            </div>
        </Section>
      </div>
    </div>
  );
};
