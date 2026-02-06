
export type Language = 'en' | 'zh';

export interface CountryConfig {
  id: string;
  name: string;
  color: string;
  color2?: string;
  gradientEnabled?: boolean;
  gradientAxis?: GradientAxis;
  height: number;
  opacity?: number;
  textureSync?: boolean;
}

export enum FillMode {
  COLOR = 'color',
  POLYGON_GRID = 'polygon_grid',
  DOT_MATRIX = 'dot_matrix'
}

export enum ArcDistribution {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

export type GradientAxis = 'X' | 'Y' | 'Z';

export interface GlobeLayer {
  id: string;
  name: string;
  visible: boolean;
  fillMode: FillMode;
  color1: string;
  color2: string;
  opacity: number;
  altitude: number;
  gridSides: number;
  gridSize: number;
  gridHeight: number;
  gridSegments: number;
  gridGap: number;
  gridDensity: number;
  gridColor: string;
  gridColor2: string;
  gridGradientEnabled: boolean;
  gridGradientAxis: GradientAxis;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  showSea: boolean;
}

export interface GridLayer {
  id: string;
  name: string;
  visible: boolean;
  altitude: number;
  color: string;
  opacity: number;
  resolution: number;
  showWireframe: boolean;
  showPoints: boolean;
  pointSize: number;
  pointColor: string;
  dashLength: number;
  dashGap: number;
}

export interface ArcGroup {
  id: string;
  startCountryId: string;
  endCountryId: string;
  visible: boolean;
  bundleSize: number;
  distribution: ArcDistribution;
  spacing: number;
  curvature: number;
}

export interface RandomArcConfig {
  visible: boolean;
  count: number;
  bundleSize: number;
  distribution: ArcDistribution;
  spacing: number;
  curvature: number;
}

export enum SurfaceStyle {
  SOLID = 'solid',
  REALISTIC = 'realistic'
}

export interface SurfaceConfig {
  style: SurfaceStyle;
  color: string;
  color2: string;
  gradientEnabled: boolean;
  opacity: number;
}

export type BlendMode = 'source-over' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';

export interface SatelliteConfig {
  show: boolean;
  opacity: number;
  blendMode: BlendMode;
}

export interface GlobalBorderConfig {
  visible: boolean;
  width: number;
  color: string;
  color2?: string;
  gradientEnabled?: boolean;
  opacity?: number;
}

export interface AtmosphereConfig {
  show: boolean;
  color: string;
  altitude: number;
}

export interface PostProcessingConfig {
  enabled: boolean;
  opacity: number;    // 整体透明度/强度 (0-100)
  dofEnabled?: boolean; // 景深效果独立开关
  blur: number;       // 虚化强度 (UI显示为“景深”)
  focus: number;      // 焦点深度/偏移 (0-100)
  fstop: number;      // 景深范围/焦段 (0-100)
  focalLat?: number;  // 空间焦点纬度
  focalLng?: number;  // 空间焦点经度
  isPicking?: boolean; // 是否正在拾取焦点
  mosaic: number;     // 马赛克透明度/强度
  mosaicEnabled?: boolean; // 马赛克显隐开关
  mosaicSize?: number; // 马赛克粒度
  chromatic: number;  // 相差透明度/强度
  chromaticEnabled?: boolean; // 相差显隐开关
  chromaticOffsetX?: number; // 相差 X 偏移
  chromaticOffsetY?: number; // 相差 Y 偏移
  chromaticLinked?: boolean; // 相差偏移是否锁定
  bloom: number;      // 光晕整体强度
  bloomEnabled?: boolean; // 光晕显隐开关
  bloomStrength?: number; // 光晕增强系数
  bloomRadius?: number;   // 光晕模糊比例
  bloomThreshold?: number; // 光晕临界值
  bloomSmoothing?: number; // 光晕平滑度
  hue: number;        // 色调 (归一化 0-100, 映射至 360deg)
  hueEnabled?: boolean; 
  hueIntensity: number; // 色调独立透明度/强度
  saturation: number; // 饱和度 (归一化 0-100, 映射至 1000%)
  brightness: number; // 亮度
  brightnessEnabled?: boolean;
  brightnessIntensity: number; // 亮度独立透明度/强度
  contrast: number;   // 对比度
  vignette: number;   // 晕影强度滑块兼容性
  vignetteEnabled?: boolean;
  vignetteIntensity: number; // 晕影独立透明度/强度
  vignetteDarkness: number;  // 黑暗度
  vignetteOffset: number;    // 偏移
  noise: number;      // 噪点强度滑块兼容性
  noiseEnabled?: boolean;
  noiseIntensity: number; // 噪点独立透明度/强度
  noiseAmount: number;    // 颗粒数量/密度
  noiseSize: number;      // 颗粒大小
  noiseRoughness: number; // 粗糙度
}

export interface GlobeState {
  language: Language;
  themeName: string; 
  
  satellite: SatelliteConfig;
  landAltitude: number;
  globalBorder: GlobalBorderConfig;

  surfaceSync: boolean; 
  showWireframe: boolean; 
  wireframeColor: string; 
  wireframeOpacity: number; 
  landConfig: SurfaceConfig;
  oceanConfig: SurfaceConfig;

  strata: GlobeLayer[];
  gridLayers: GridLayer[];
  autoRotate: boolean;
  atmosphere: AtmosphereConfig;
  
  landmassOpacity: number;
  landmassColor: string; 
  landmassColor2: string;
  countries: CountryConfig[];
  
  randomArcs: RandomArcConfig; 
  arcGroups: ArcGroup[];       
  
  arcThickness: number;
  arcAnimateTime: number;
  arcColor: string;
  arcColor2: string;
  arcGradientEnabled: boolean;
  arcSegments: number;
  arcGap: number;
  arcOpacity: number; 
  
  heightSync: boolean;

  postProcessing?: PostProcessingConfig;
}

export interface CountryData {
  name: string;
  nameZh: string;
  id: string;
}

export interface SavedTheme {
  id: string;
  name: string;
  config: GlobeState;
}
