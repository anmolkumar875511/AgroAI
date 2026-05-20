export interface KPIData {
  id: string;
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
  icon: string;
  iconColor: string;
  iconBg: string;
  chartData: number[];
  chartColor: string;
  chartFill: string;
}

export interface AIRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  crop: string;
  cropIcon: string;
  message: string;
  weather: string;
  product: string;
  village: string;
  farmer?: string;
  pestRisk?: string;
  recommendedProduct?: string;
  nextAction?: string;
  followUpTimeline?: string[];
  explainableReasons?: ExplainableReason[];
  retailer_id?: string;
}

export interface ExplainableReason {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PriorityVisit {
  id: string;
  name: string;
  type: 'retailer' | 'village' | 'cluster';
  score: number;
  location: string;
  lastVisit: string;
  status: string;
  tags: VisitTag[];
  aiReason: string;
  actions: string[];
}

export interface VisitTag {
  label: string;
  color: 'green' | 'blue' | 'red' | 'yellow';
}

export interface HeatmapCell {
  id: number;
  x: number;
  y: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  village: string;
  riskPercent: number;
}

export interface NDVIData {
  date: string;
  healthy: number;
  moderate: number;
  stressed: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  time: string;
  read: boolean;
}

export interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'humid';
  location: string;
  humidity: number;
  rainfall: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
  value3?: number;
}

export interface CropRiskTrend {
  month: string;
  rice: number;
  cotton: number;
  wheat: number;
}

export interface StockItem {
  product: string;
  utilization: number;
  stock: number;
  status: 'optimal' | 'low' | 'critical';
}

export interface RegionalPerformance {
  metric: string;
  yourTerritory: number;
  average: number;
}
