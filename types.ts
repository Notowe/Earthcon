
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

export interface GlobeState {
  language: Language;
  themeName: string; // 新增主题名称
  
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
  arcOpacity: number; // 新增透明度控制属性
  
  heightSync: boolean;
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
