import { CountryData } from './types';

export const GEOJSON_URL = 'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';

// A subset of major countries for the dropdown with bilingual support
export const COUNTRY_LIST: CountryData[] = [
  { id: 'AFG', name: 'Afghanistan', nameZh: '阿富汗' },
  { id: 'ALB', name: 'Albania', nameZh: '阿尔巴尼亚' },
  { id: 'DZA', name: 'Algeria', nameZh: '阿尔及利亚' },
  { id: 'ARG', name: 'Argentina', nameZh: '阿根廷' },
  { id: 'ARM', name: 'Armenia', nameZh: '亚美尼亚' },
  { id: 'AUS', name: 'Australia', nameZh: '澳大利亚' },
  { id: 'AUT', name: 'Austria', nameZh: '奥地利' },
  { id: 'AZE', name: 'Azerbaijan', nameZh: '阿塞拜疆' },
  { id: 'BGD', name: 'Bangladesh', nameZh: '孟加拉国' },
  { id: 'BLR', name: 'Belarus', nameZh: '白俄罗斯' },
  { id: 'BEL', name: 'Belgium', nameZh: '比利时' },
  { id: 'BOL', name: 'Bolivia', nameZh: '玻利维亚' },
  { id: 'BRA', name: 'Brazil', nameZh: '巴西' },
  { id: 'BGR', name: 'Bulgaria', nameZh: '保加利亚' },
  { id: 'CAN', name: 'Canada', nameZh: '加拿大' },
  { id: 'CHL', name: 'Chile', nameZh: '智利' },
  { id: 'CHN', name: 'China', nameZh: '中国' },
  { id: 'COL', name: 'Colombia', nameZh: '哥伦比亚' },
  { id: 'HRV', name: 'Croatia', nameZh: '克罗地亚' },
  { id: 'CUB', name: 'Cuba', nameZh: '古巴' },
  { id: 'CZE', name: 'Czech Republic', nameZh: '捷克' },
  { id: 'DNK', name: 'Denmark', nameZh: '丹麦' },
  { id: 'EGY', name: 'Egypt', nameZh: '埃及' },
  { id: 'EST', name: 'Estonia', nameZh: '爱沙尼亚' },
  { id: 'ETH', name: 'Ethiopia', nameZh: '埃塞俄比亚' },
  { id: 'FIN', name: 'Finland', nameZh: '芬兰' },
  { id: 'FRA', name: 'France', nameZh: '法国' },
  { id: 'DEU', name: 'Germany', nameZh: '德国' },
  { id: 'GRC', name: 'Greece', nameZh: '希腊' },
  { id: 'HUN', name: 'Hungary', nameZh: '匈牙利' },
  { id: 'ISL', name: 'Iceland', nameZh: '冰岛' },
  { id: 'IND', name: 'India', nameZh: '印度' },
  { id: 'IDN', name: 'Indonesia', nameZh: '印度尼西亚' },
  { id: 'IRN', name: 'Iran', nameZh: '伊朗' },
  { id: 'IRQ', name: 'Iraq', nameZh: '伊拉克' },
  { id: 'IRL', name: 'Ireland', nameZh: '爱尔兰' },
  { id: 'ISR', name: 'Israel', nameZh: '以色列' },
  { id: 'ITA', name: 'Italy', nameZh: '意大利' },
  { id: 'JPN', name: 'Japan', nameZh: '日本' },
  { id: 'KAZ', name: 'Kazakhstan', nameZh: '哈萨克斯坦' },
  { id: 'KEN', name: 'Kenya', nameZh: '肯尼亚' },
  { id: 'KOR', name: 'South Korea', nameZh: '韩国' },
  { id: 'KWT', name: 'Kuwait', nameZh: '科威特' },
  { id: 'MEX', name: 'Mexico', nameZh: '墨西哥' },
  { id: 'MNG', name: 'Mongolia', nameZh: '蒙古' },
  { id: 'MAR', name: 'Morocco', nameZh: '摩洛哥' },
  { id: 'NLD', name: 'Netherlands', nameZh: '荷兰' },
  { id: 'NZL', name: 'New Zealand', nameZh: '新西兰' },
  { id: 'NGA', name: 'Nigeria', nameZh: '尼日利亚' },
  { id: 'NOR', name: 'Norway', nameZh: '挪威' },
  { id: 'PAK', name: 'Pakistan', nameZh: '巴基斯坦' },
  { id: 'PER', name: 'Peru', nameZh: '秘鲁' },
  { id: 'PHL', name: 'Philippines', nameZh: '菲律宾' },
  { id: 'POL', name: 'Poland', nameZh: '波兰' },
  { id: 'PRT', name: 'Portugal', nameZh: '葡萄牙' },
  { id: 'ROU', name: 'Romania', nameZh: '罗马尼亚' },
  { id: 'RUS', name: 'Russia', nameZh: '俄罗斯' },
  { id: 'SAU', name: 'Saudi Arabia', nameZh: '沙特阿拉伯' },
  { id: 'SGP', name: 'Singapore', nameZh: '新加坡' },
  { id: 'ZAF', name: 'South Africa', nameZh: '南非' },
  { id: 'ESP', name: 'Spain', nameZh: '西班牙' },
  { id: 'SWE', name: 'Sweden', nameZh: '瑞典' },
  { id: 'CHE', name: 'Switzerland', nameZh: '瑞士' },
  { id: 'THA', name: 'Thailand', nameZh: '泰国' },
  { id: 'TUR', name: 'Turkey', nameZh: '土耳其' },
  { id: 'UKR', name: 'Ukraine', nameZh: '乌克兰' },
  { id: 'ARE', name: 'United Arab Emirates', nameZh: '阿联酋' },
  { id: 'GBR', name: 'United Kingdom', nameZh: '英国' },
  { id: 'USA', name: 'United States', nameZh: '美国' },
  { id: 'VNM', name: 'Vietnam', nameZh: '越南' }
].sort((a, b) => a.name.localeCompare(b.name));

// Coordinates for national capitals to provide a cleaner "Data Hub" look
export const CAPITAL_COORDS: Record<string, { lat: number; lng: number }> = {
  CHN: { lat: 39.9042, lng: 116.4074 },
  USA: { lat: 38.9072, lng: -77.0369 },
  GBR: { lat: 51.5074, lng: -0.1276 },
  FRA: { lat: 48.8566, lng: 2.3522 },
  DEU: { lat: 52.5200, lng: 13.4050 },
  JPN: { lat: 35.6762, lng: 139.6503 },
  RUS: { lat: 55.7558, lng: 37.6173 },
  IND: { lat: 28.6139, lng: 77.2090 },
  BRA: { lat: -15.7975, lng: -47.8919 },
  CAN: { lat: 45.4215, lng: -75.6972 },
  AUS: { lat: -35.2809, lng: 149.1300 },
  ITA: { lat: 41.9028, lng: 12.4964 },
  ESP: { lat: 40.4168, lng: -3.7038 },
  KOR: { lat: 37.5665, lng: 126.9780 },
  SGP: { lat: 1.3521, lng: 103.8198 },
  SAU: { lat: 24.7136, lng: 46.6753 },
  TUR: { lat: 39.9334, lng: 32.8597 },
  EGY: { lat: 30.0444, lng: 31.2357 },
  ZAF: { lat: -25.7479, lng: 28.2293 },
  ARG: { lat: -34.6037, lng: -58.3816 }
};

export const PRESET_THEMES: { name: string; config: any }[] = [
    {
        name: "奇爱博士 (Dr. Strangelove)",
        config: {"language":"zh","themeName":"奇爱博士","autoRotate":true,"atmosphere":{"show":true,"color":"#ffffff","altitude":0.13},"satellite":{"show":true,"opacity":0.28,"blendMode":"multiply"},"landAltitude":0.04,"globalBorder":{"visible":true,"width":0.3,"color":"#ffffff","opacity":0.99},"landmassOpacity":0.4,"landmassColor":"#00f2ff","landmassColor2":"#7000ff","surfaceSync":false,"showWireframe":false,"wireframeColor":"#ffcc00","wireframeOpacity":0.2,"landConfig":{"style":"solid","color":"#ffffff","color2":"#ffffff","gradientEnabled":false,"opacity":0.1},"oceanConfig":{"style":"realistic","color":"#000000","color2":"#333d00","gradientEnabled":false,"opacity":1},"strata":[],"gridLayers":[{"id":"GRID_1","name":"结构网格","visible":true,"altitude":0.01,"color":"#ffffff","opacity":0.2,"resolution":32,"showWireframe":true,"showPoints":false,"pointSize":0.1,"pointColor":"#ffffff","dashLength":0,"dashGap":0},{"id":"GRID_2","name":"结构网格","visible":true,"altitude":5,"color":"#ffffff","opacity":0.2,"resolution":28,"showWireframe":true,"showPoints":false,"pointSize":0.1,"pointColor":"#ffffff","dashLength":0,"dashGap":0}],"countries":[{"id":"CHN","name":"CHINA","color":"#ffffff","color2":"#000000","gradientEnabled":false,"gradientAxis":"Y","height":0.09,"opacity":0.44,"textureSync":false}],"randomArcs":{"visible":true,"count":7,"bundleSize":1,"distribution":"horizontal","spacing":0,"curvature":0.2},"arcGroups":[],"arcThickness":0.1,"arcAnimateTime":7800,"arcColor":"#ffffff","arcColor2":"#0055ff","arcGradientEnabled":false,"arcSegments":100,"arcGap":0.22,"heightSync":true}
    },
    {
        name: "尤里的复仇 (Yuri's Revenge)",
        config: {"language":"zh","themeName":"尤里的复仇","autoRotate":true,"atmosphere":{"show":true,"color":"#db0f0f","altitude":0.33},"satellite":{"show":true,"opacity":0.28,"blendMode":"multiply"},"landAltitude":0.01,"globalBorder":{"visible":true,"width":0.2,"color":"#4a4a4a","opacity":0.99},"landmassOpacity":0.4,"landmassColor":"#00f2ff","landmassColor2":"#7000ff","surfaceSync":false,"showWireframe":false,"wireframeColor":"#ffcc00","wireframeOpacity":0.2,"landConfig":{"style":"realistic","color":"#822b2b","color2":"#13287c","gradientEnabled":true,"opacity":0.38},"oceanConfig":{"style":"realistic","color":"#000000","color2":"#3d0000","gradientEnabled":true,"opacity":1},"strata":[{"id":"STRATUM_1","name":"新地层 1","visible":true,"fillMode":"polygon_grid","color1":"#00f2ff","color2":"#7000ff","opacity":0.15,"altitude":0.5,"gridSides":6,"gridSize":3.45,"gridHeight":5.09,"gridSegments":1,"gridGap":0,"gridDensity":1200,"gridColor":"#ff0000","gridColor2":"#000000","gridGradientEnabled":true,"gridGradientAxis":"Y","rotationX":0,"rotationY":0,"rotationZ":0,"showSea":false},{"id":"STRATUM_2","name":"新地层 2","visible":true,"fillMode":"polygon_grid","color1":"#00f2ff","color2":"#7000ff","opacity":0.13,"altitude":0.33,"gridSides":6,"gridSize":0.05,"gridHeight":500,"gridSegments":1,"gridGap":0,"gridDensity":1200,"gridColor":"#ff0000","gridColor2":"#000000","gridGradientEnabled":true,"gridGradientAxis":"Y","rotationX":0,"rotationY":0,"rotationZ":0,"showSea":false}],"gridLayers":[{"id":"GRID_1","name":"结构网格","visible":true,"altitude":0,"color":"#ffffff","opacity":0.32,"resolution":32,"showWireframe":true,"showPoints":false,"pointSize":0.1,"pointColor":"#ffffff","dashLength":0,"dashGap":0},{"id":"GRID_2","name":"结构网格 2","visible":true,"altitude":0.5,"color":"#ffffff","opacity":0.05,"resolution":128,"showWireframe":true,"showPoints":true,"pointSize":1,"pointColor":"#ff0000","dashLength":2.9,"dashGap":5},{"id":"GRID_3","name":"结构网格 3","visible":true,"altitude":0.2,"color":"#ff0000","opacity":0.05,"resolution":56,"showWireframe":true,"showPoints":true,"pointSize":1,"pointColor":"#ff9500","dashLength":0,"dashGap":0}],"countries":[{"id":"CHN","name":"CHINA","color":"#ffffff","color2":"#000000","gradientEnabled":false,"gradientAxis":"Y","height":0.08,"opacity":0.09,"textureSync":false}],"randomArcs":{"visible":true,"count":7,"bundleSize":4,"distribution":"horizontal","spacing":1.69,"curvature":0.5},"arcGroups":[],"arcThickness":0.2,"arcAnimateTime":7800,"arcColor":"#ff0000","arcColor2":"#0f42eb","arcGradientEnabled":true,"arcSegments":100,"arcGap":0.52,"heightSync":true}
    },
    {
        name: "病毒世界 (Virus World)",
        config: {"language":"zh","autoRotate":true,"atmosphere":{"show":true,"color":"#047106","altitude":0.77},"satellite":{"show":true,"opacity":0.28,"blendMode":"multiply"},"landAltitude":0,"globalBorder":{"visible":true,"width":0.1,"color":"#009468","opacity":0.6},"landmassOpacity":0.4,"landmassColor":"#00f2ff","landmassColor2":"#7000ff","surfaceSync":true,"showWireframe":false,"wireframeColor":"#ffcc00","wireframeOpacity":0.2,"landConfig":{"style":"realistic","color":"#1a1a1a","color2":"#055200","gradientEnabled":true,"opacity":1},"oceanConfig":{"style":"realistic","color":"#050505","color2":"#333d00","gradientEnabled":true,"opacity":1},"strata":[{"id":"BASE","name":"BASE_STRATUM","visible":false,"fillMode":"polygon_grid","color1":"#00f2ff","color2":"#7000ff","opacity":0.6,"altitude":0,"gridSides":6,"gridSize":5.88,"gridHeight":292.46,"gridSegments":4,"gridGap":0,"gridDensity":2000,"gridColor":"#00f2ff","gridColor2":"#7000ff","gridGradientEnabled":true,"gridGradientAxis":"Y","rotationX":0,"rotationY":0,"rotationZ":0,"showSea":false},{"id":"STRATUM_2","name":"新地层 2","visible":true,"fillMode":"dot_matrix","color1":"#00ccff","color2":"#0066ff","opacity":0.18,"altitude":0.73,"gridSides":5,"gridSize":0.6,"gridHeight":35.57,"gridSegments":13,"gridGap":0,"gridDensity":2600,"gridColor":"#00ff33","gridColor2":"#0011ff","gridGradientEnabled":true,"gridGradientAxis":"Y","rotationX":38,"rotationY":71,"rotationZ":126,"showSea":false}],"gridLayers":[{"id":"CORE_GRID","name":"行星结构骨架","visible":true,"altitude":0,"color":"#00f2ff","opacity":0.3,"resolution":32,"showWireframe":true,"showPoints":true,"pointSize":0.15,"pointColor":"#00f2ff","dashLength":0,"dashGap":0},{"id":"GRID_2","name":"结构网格 2","visible":true,"altitude":4.78,"color":"#ffffff","opacity":0.13,"resolution":112,"showWireframe":true,"showPoints":false,"pointSize":0.1,"pointColor":"#ffffff","dashLength":0,"dashGap":0},{"id":"GRID_3","name":"结构网格 3","visible":true,"altitude":0.3,"color":"#8cff75","opacity":0.2,"resolution":32,"showWireframe":true,"showPoints":false,"pointSize":0.1,"pointColor":"#ffffff","dashLength":1.4,"dashGap":1.4}],"countries":[{"id":"CHN","name":"CHINA","color":"#add737","color2":"#3f2fb6","gradientEnabled":true,"gradientAxis":"Y","height":0.2,"opacity":0.22,"textureSync":false}],"randomArcs":{"visible":false,"count":17,"bundleSize":1,"distribution":"horizontal","spacing":0,"curvature":0.4},"arcGroups":[],"arcThickness":0.2,"arcAnimateTime":2000,"arcColor":"#ff0000","arcColor2":"#0055ff","arcGradientEnabled":true,"arcSegments":20,"arcGap":0.4,"heightSync":true}
    },
    {
        name: "孤独星球 (Lonely Planet)",
        config: {"language":"zh","themeName":"孤独星球 (Lonely Planet)","autoRotate":true,"atmosphere":{"show":false,"color":"#ffffff","altitude":0.22},"satellite":{"show":true,"opacity":1,"blendMode":"source-over"},"landAltitude":0.79,"globalBorder":{"visible":true,"width":2,"color":"#ffffff","opacity":0.2},"landmassOpacity":0.4,"landmassColor":"#00f2ff","landmassColor2":"#7000ff","surfaceSync":false,"showWireframe":false,"wireframeColor":"#ffcc00","wireframeOpacity":0.2,"landConfig":{"style":"solid","color":"#ffffff","color2":"#ffffff","gradientEnabled":false,"opacity":0},"oceanConfig":{"style":"realistic","color":"#000000","color2":"#333d00","gradientEnabled":false,"opacity":0.44},"strata":[],"gridLayers":[{"id":"GRID_1","name":"结构网格","visible":true,"altitude":0.01,"color":"#ffffff","opacity":0.2,"resolution":32,"showWireframe":true,"showPoints":false,"pointSize":0.1,"pointColor":"#ffffff","dashLength":0,"dashGap":0},{"id":"GRID_2","name":"结构网格","visible":true,"altitude":5,"color":"#ffffff","opacity":1,"resolution":128,"showWireframe":false,"showPoints":true,"pointSize":1,"pointColor":"#ffffff","dashLength":5.5,"dashGap":5}],"countries":[],"randomArcs":{"visible":true,"count":50,"bundleSize":1,"distribution":"horizontal","spacing":6.97,"curvature":0.3},"arcGroups":[],"arcThickness":0.2,"arcAnimateTime":10000,"arcColor":"#ffffff","arcColor2":"#0055ff","arcGradientEnabled":false,"arcSegments":88,"arcGap":0.22,"arcOpacity":0.8,"heightSync":true}
    },
    {
        name: "黄金时代 (Golden Age)",
        config: {"language":"zh","themeName":"黄金时代 (Golden Age)","autoRotate":true,"atmosphere":{"show":true,"color":"#ab9a5f","altitude":0.33},"satellite":{"show":true,"opacity":0.28,"blendMode":"multiply"},"landAltitude":0.01,"globalBorder":{"visible":true,"width":0.2,"color":"#4a4a4a","opacity":0.99},"landmassOpacity":0.4,"landmassColor":"#00f2ff","landmassColor2":"#7000ff","surfaceSync":false,"showWireframe":false,"wireframeColor":"#ffcc00","wireframeOpacity":0.2,"landConfig":{"style":"realistic","color":"#ffed7a","color2":"#cba210","gradientEnabled":true,"opacity":0.38},"oceanConfig":{"style":"realistic","color":"#0e0901","color2":"#5a4807","gradientEnabled":true,"opacity":1},"strata":[{"id":"STRATUM_1","name":"新地层 1","visible":true,"fillMode":"polygon_grid","color1":"#00f2ff","color2":"#7000ff","opacity":0.15,"altitude":0.5,"gridSides":6,"gridSize":4.37,"gridHeight":0.74,"gridSegments":1,"gridGap":0,"gridDensity":1200,"gridColor":"#ffea00","gridColor2":"#60520b","gridGradientEnabled":true,"gridGradientAxis":"Y","rotationX":0,"rotationY":0,"rotationZ":0,"showSea":false},{"id":"STRATUM_2","name":"新地层 2","visible":true,"fillMode":"polygon_grid","color1":"#00f2ff","color2":"#7000ff","opacity":0.29,"altitude":0.01,"gridSides":6,"gridSize":2.34,"gridHeight":0.74,"gridSegments":1,"gridGap":0,"gridDensity":2900,"gridColor":"#fff700","gridColor2":"#c09b16","gridGradientEnabled":true,"gridGradientAxis":"Y","rotationX":0,"rotationY":0,"rotationZ":0,"showSea":false},{"id":"STRATUM_3","name":"新地层 3","visible":true,"fillMode":"polygon_grid","color1":"#00f2ff","color2":"#7000ff","opacity":0.21,"altitude":0.49,"gridSides":6,"gridSize":3.24,"gridHeight":0.74,"gridSegments":1,"gridGap":0,"gridDensity":1200,"gridColor":"#dfd811","gridColor2":"#000000","gridGradientEnabled":true,"gridGradientAxis":"Y","rotationX":0,"rotationY":0,"rotationZ":0,"showSea":false}],"gridLayers":[{"id":"GRID_1","name":"结构网格","visible":true,"altitude":0.11,"color":"#ffcf24","opacity":0.32,"resolution":16,"showWireframe":true,"showPoints":false,"pointSize":0.1,"pointColor":"#ffffff","dashLength":0,"dashGap":0},{"id":"GRID_2","name":"结构网格 2","visible":true,"altitude":0.5,"color":"#ffffff","opacity":0.13,"resolution":36,"showWireframe":true,"showPoints":true,"pointSize":1,"pointColor":"#ffdd00","dashLength":6.6,"dashGap":0},{"id":"GRID_3","name":"结构网格 3","visible":true,"altitude":0.28,"color":"#ffd500","opacity":0.23,"resolution":12,"showWireframe":true,"showPoints":true,"pointSize":1,"pointColor":"#ecf476","dashLength":0,"dashGap":0},{"id":"GRID_4","name":"结构网格 4","visible":true,"altitude":3.97,"color":"#ffffff","opacity":0.15,"resolution":128,"showWireframe":true,"showPoints":true,"pointSize":1,"pointColor":"#ffffff","dashLength":10,"dashGap":5}],"countries":[{"id":"CHN","name":"CHINA","color":"#ffffff","color2":"#000000","gradientEnabled":false,"gradientAxis":"Y","height":0.08,"opacity":0.09,"textureSync":false}],"randomArcs":{"visible":false,"count":7,"bundleSize":4,"distribution":"horizontal","spacing":1.69,"curvature":0.5},"arcGroups":[],"arcThickness":0.2,"arcAnimateTime":7800,"arcColor":"#ff0000","arcColor2":"#0f42eb","arcGradientEnabled":true,"arcSegments":100,"arcGap":0.52,"arcOpacity":0.8,"heightSync":true}
    }
];