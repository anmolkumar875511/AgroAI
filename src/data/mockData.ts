import type {
  KPIData,
  AIRecommendation,
  PriorityVisit,
  HeatmapCell,
  NDVIData,
  Testimonial,
  SidebarItem,
  NotificationItem,
  WeatherData,
  ChartDataPoint,
  CropRiskTrend,
  StockItem,
  RegionalPerformance,
} from '@/types';

export const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
  { id: 'visit-planner', label: 'Visit Planner', icon: 'MapPinned', path: '/visit-planner' },
  { id: 'recommendations', label: 'AI Recommendations', icon: 'Sparkles', path: '/recommendations' },
  { id: 'risk-analyzer', label: 'Risk Analyzer', icon: 'ShieldAlert', path: '/risk-analyzer' },
  { id: 'retailer-insights', label: 'Retailer Insights', icon: 'Store', path: '/dashboard' },
  { id: 'farmer-profiles', label: 'Farmer Profiles', icon: 'Users', path: '/dashboard' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', path: '/analytics' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' },
];

export const kpiData: KPIData[] = [
  {
    id: 'risk-villages',
    title: 'High Risk Villages',
    value: '12',
    trend: '+3',
    trendDirection: 'up',
    icon: 'AlertTriangle',
    iconColor: '#E53935',
    iconBg: 'rgba(229, 57, 53, 0.1)',
    chartData: [4, 6, 5, 8, 7, 10, 12],
    chartColor: '#E53935',
    chartFill: 'rgba(229, 57, 53, 0.1)',
  },
  {
    id: 'priority-visits',
    title: 'Priority Visits Today',
    value: '24',
    trend: '+5',
    trendDirection: 'up',
    icon: 'MapPin',
    iconColor: '#1B5E20',
    iconBg: 'rgba(27, 94, 32, 0.1)',
    chartData: [15, 18, 16, 20, 22, 24, 24],
    chartColor: '#1B5E20',
    chartFill: 'rgba(27, 94, 32, 0.1)',
  },
  {
    id: 'stock-alerts',
    title: 'Stock Alerts',
    value: '8',
    trend: '-2',
    trendDirection: 'down',
    icon: 'Package',
    iconColor: '#FFC107',
    iconBg: 'rgba(255, 193, 7, 0.1)',
    chartData: [12, 10, 9, 11, 10, 8, 8],
    chartColor: '#FFC107',
    chartFill: 'rgba(255, 193, 7, 0.1)',
  },
  {
    id: 'revenue-opportunity',
    title: 'Revenue Opportunity',
    value: 'Rs. 2.4L',
    trend: '+12%',
    trendDirection: 'up',
    icon: 'TrendingUp',
    iconColor: '#1E88E5',
    iconBg: 'rgba(30, 136, 229, 0.1)',
    chartData: [1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4],
    chartColor: '#1E88E5',
    chartFill: 'rgba(30, 136, 229, 0.1)',
  },
];

export const aiRecommendations: AIRecommendation[] = [
  {
    id: 'rec-1',
    priority: 'high',
    crop: 'Rice',
    cropIcon: 'Wheat',
    message: 'Pest risk detected in Village Rampur. Recommend Amistar application within 48hrs.',
    weather: '32C, Humid',
    product: 'Amistar',
    village: 'Rampur',
    farmer: 'Rajesh Kumar',
    pestRisk: '78%',
    recommendedProduct: 'Amistar (200ml/acre)',
    nextAction: 'Visit within 24hrs. Demonstrate Amistar application technique. Offer 10% scheme discount.',
    followUpTimeline: ['Today', 'Tomorrow', 'Day 3'],
    explainableReasons: [
      { id: 'r1', title: 'Weather Pattern', description: 'Humidity >70% for 3 days creates ideal stem borer conditions.', icon: 'CloudRain' },
      { id: 'r2', title: 'Historical Data', description: 'Similar patterns led to 65% infestation in nearby fields last season.', icon: 'History' },
      { id: 'r3', title: 'Inventory', description: 'Amistar stock is optimal. Alternative (Custodia) is running low.', icon: 'Package' },
      { id: 'r4', title: 'Demand', description: '3 farmers in cluster requested pest advisory this week.', icon: 'TrendingUp' },
    ],
  },
  {
    id: 'rec-2',
    priority: 'medium',
    crop: 'Cotton',
    cropIcon: 'Flower2',
    message: 'Nutrient deficiency signs in Dharnai. Recommend Miravis Duo foliar spray.',
    weather: '30C, Dry',
    product: 'Miravis',
    village: 'Dharnai',
    farmer: 'Priya Sharma',
    pestRisk: '45%',
    recommendedProduct: 'Miravis Duo (150ml/acre)',
    nextAction: 'Schedule visit for soil testing. Discuss fertilizer schedule.',
    followUpTimeline: ['Today', 'Day 2', 'Day 5'],
    explainableReasons: [
      { id: 'r1', title: 'Soil Analysis', description: 'Nitrogen levels 30% below optimal for cotton growth stage.', icon: 'Leaf' },
      { id: 'r2', title: 'Crop Stage', description: 'Flowering stage requires higher nutrient input.', icon: 'Sprout' },
      { id: 'r3', title: 'Weather', description: 'Dry spell reduces nutrient uptake from soil.', icon: 'Sun' },
    ],
  },
  {
    id: 'rec-3',
    priority: 'low',
    crop: 'Wheat',
    cropIcon: 'Wheat',
    message: 'Irrigation advisory for Sonepur. Optimize water schedule for grain filling.',
    weather: '28C, Clear',
    product: 'Irrigation',
    village: 'Sonepur',
    farmer: 'Mohan Singh',
    pestRisk: '12%',
    recommendedProduct: 'Drip irrigation schedule',
    nextAction: 'Advise on alternate day irrigation. Check moisture levels.',
    followUpTimeline: ['Day 1', 'Day 3', 'Day 7'],
    explainableReasons: [
      { id: 'r1', title: 'Weather', description: 'Clear skies with high evaporation rate detected.', icon: 'Sun' },
      { id: 'r2', title: 'Crop Stage', description: 'Grain filling stage requires consistent moisture.', icon: 'Sprout' },
    ],
  },
];

export const priorityVisits: PriorityVisit[] = [
  {
    id: 'v1',
    name: 'Retailer R12 - GreenAgro Store',
    type: 'retailer',
    score: 92,
    location: 'Village Rampur',
    lastVisit: '5 days ago',
    status: 'Action Ready',
    tags: [
      { label: 'Action Ready', color: 'green' },
      { label: 'High Revenue', color: 'blue' },
      { label: 'Pest Advisory', color: 'red' },
    ],
    aiReason: 'High pest risk probability (78%) combined with low stock on Amistar creates urgent revenue opportunity.',
    actions: ['Start Visit', 'View Profile'],
  },
  {
    id: 'v2',
    name: 'Village A - Farmer Cluster',
    type: 'village',
    score: 88,
    location: 'Village A, Block 3',
    lastVisit: '3 days ago',
    status: 'Pest Advisory Needed',
    tags: [
      { label: 'Pest Advisory', color: 'red' },
      { label: 'Group Visit', color: 'yellow' },
    ],
    aiReason: 'Stem borer outbreak detected in 3 adjacent rice fields. 8 farmers need immediate advisory.',
    actions: ['Plan Visit', 'Send Alert'],
  },
  {
    id: 'v3',
    name: 'Cluster B - Cotton Growers',
    type: 'cluster',
    score: 81,
    location: 'Cluster B, District East',
    lastVisit: '7 days ago',
    status: 'Follow-up Required',
    tags: [
      { label: 'Follow-up', color: 'yellow' },
      { label: 'Nutrient Deficiency', color: 'blue' },
    ],
    aiReason: 'Previous Miravis recommendation needs follow-up. 60% farmers yet to apply.',
    actions: ['Follow Up', 'View Details'],
  },
  {
    id: 'v4',
    name: 'Retailer R08 - Kisan Kendra',
    type: 'retailer',
    score: 76,
    location: 'Main Road, Sonepur',
    lastVisit: '2 days ago',
    status: 'Stock Replenishment',
    tags: [
      { label: 'Stock Alert', color: 'red' },
      { label: 'Regular Visit', color: 'green' },
    ],
    aiReason: 'Retailer inventory below threshold for 5 key products. Replenish to avoid lost sales.',
    actions: ['Update Stock', 'Schedule Visit'],
  },
];

export function generateHeatmapData(): HeatmapCell[] {
  const villages = [
    'Rampur', 'Dharnai', 'Sonepur', 'Kishanpur', 'Mohanpur', 'Gopalpur',
    'Laxminagar', 'Hariharpur', 'Bishunpur', 'Devipur', 'Karmatand',
    'Chhatna', 'Joypur', 'Bankura', 'Hura', 'Taldangra',
  ];
  const cells: HeatmapCell[] = [];
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 15; y++) {
      const rand = Math.random();
      let risk: HeatmapCell['risk'] = 'low';
      let riskPercent = Math.floor(Math.random() * 20);
      if (rand > 0.85) {
        risk = 'critical';
        riskPercent = 80 + Math.floor(Math.random() * 20);
      } else if (rand > 0.7) {
        risk = 'high';
        riskPercent = 50 + Math.floor(Math.random() * 30);
      } else if (rand > 0.5) {
        risk = 'medium';
        riskPercent = 25 + Math.floor(Math.random() * 25);
      }
      cells.push({
        id: x * 15 + y,
        x,
        y,
        risk,
        village: villages[Math.floor(Math.random() * villages.length)],
        riskPercent,
      });
    }
  }
  return cells;
}

export const heatmapData: HeatmapCell[] = generateHeatmapData();

export const ndviData: NDVIData[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  return {
    date: `Jan ${day}`,
    healthy: 0.75 + Math.sin(day * 0.2) * 0.1 + Math.random() * 0.05,
    moderate: 0.55 + Math.sin(day * 0.15) * 0.08 + Math.random() * 0.05,
    stressed: 0.35 + Math.sin(day * 0.1) * 0.06 + Math.random() * 0.05,
  };
});

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote: "AgroAI told me exactly when to visit Rajesh's farm and what product to recommend. He trusted the advice because I could explain WHY. Sales went up 40%.",
    name: 'Amit Sharma',
    role: 'Field Agent, Bihar Territory',
    avatar: '/images/farmer-amit.jpg',
  },
  {
    id: 't2',
    quote: "The pest alert came 3 days before I noticed anything in my field. The AI recommendation saved my entire cotton crop.",
    name: 'Sunita Patel',
    role: 'Farmer, Gujarat',
    avatar: '/images/farmer-sunita.jpg',
  },
  {
    id: 't3',
    quote: "As a territory manager, I finally have visibility into what my team is doing in the field. The analytics are incredible.",
    name: 'Rahul Mehta',
    role: 'Territory Manager, Maharashtra',
    avatar: '/images/farmer-amit.jpg',
  },
  {
    id: 't4',
    quote: "I don't understand technology, but this app speaks my language. The voice assistant tells me everything I need to know.",
    name: 'Lakshmi Devi',
    role: 'Farmer, Andhra Pradesh',
    avatar: '/images/farmer-sunita.jpg',
  },
  {
    id: 't5',
    quote: "Route optimization alone saved me 2 hours every day. I can visit more farmers and close more deals.",
    name: 'Vikram Singh',
    role: 'Field Agent, Rajasthan',
    avatar: '/images/farmer-amit.jpg',
  },
];

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Pest Outbreak Alert',
    message: 'Stem borer detected in 3 villages of your territory. Immediate action recommended.',
    type: 'alert',
    time: '5 min ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Stock Alert',
    message: 'Amistar inventory running low at Retailer R12. Schedule replenishment.',
    type: 'warning',
    time: '15 min ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Visit Completed',
    message: 'Amit Sharma completed visit to Village Rampur. Sale: Rs. 12,500.',
    type: 'success',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 'n4',
    title: 'Weather Advisory',
    message: 'Heavy rainfall predicted for tomorrow in East Block. Reschedule outdoor visits.',
    type: 'info',
    time: '2 hrs ago',
    read: true,
  },
  {
    id: 'n5',
    title: 'AI Insight',
    message: 'Revenue opportunity detected: 5 farmers in Cluster B ready for fertilizer purchase.',
    type: 'info',
    time: '3 hrs ago',
    read: true,
  },
];

export const weatherData: WeatherData = {
  temp: 28,
  condition: 'sunny',
  location: 'Patna',
  humidity: 65,
  rainfall: 0,
};

export const weeklyPerformanceData: ChartDataPoint[] = [
  { name: 'Mon', value: 4, value2: 5, value3: 3.2 },
  { name: 'Tue', value: 6, value2: 5, value3: 3.8 },
  { name: 'Wed', value: 5, value2: 6, value3: 4.1 },
  { name: 'Thu', value: 7, value2: 6, value3: 4.5 },
  { name: 'Fri', value: 8, value2: 7, value3: 4.8 },
  { name: 'Sat', value: 6, value2: 7, value3: 5.2 },
  { name: 'Sun', value: 4, value2: 5, value3: 4.9 },
];

export const fieldEfficiencyData: ChartDataPoint[] = [
  { name: 'Mon', value: 6, value2: 8 },
  { name: 'Tue', value: 8, value2: 8 },
  { name: 'Wed', value: 7, value2: 8 },
  { name: 'Thu', value: 9, value2: 8 },
  { name: 'Fri', value: 10, value2: 8 },
  { name: 'Sat', value: 7, value2: 6 },
  { name: 'Sun', value: 5, value2: 6 },
];

export const revenuePerVisitData: ChartDataPoint[] = [
  { name: 'Week 1', value: 12500, value2: 11800 },
  { name: 'Week 2', value: 14200, value2: 12500 },
  { name: 'Week 3', value: 13800, value2: 13200 },
  { name: 'Week 4', value: 16500, value2: 14000 },
  { name: 'Week 5', value: 15200, value2: 14500 },
  { name: 'Week 6', value: 18900, value2: 15000 },
];

export const recommendationAcceptanceData = [
  { name: 'Accepted', value: 87, fill: '#8BC34A' },
  { name: 'Pending', value: 8, fill: '#FFC107' },
  { name: 'Declined', value: 5, fill: '#E53935' },
];

export const regionalPerformanceData: RegionalPerformance[] = [
  { metric: 'Visits', yourTerritory: 85, average: 65 },
  { metric: 'Revenue', yourTerritory: 92, average: 70 },
  { metric: 'Acceptance', yourTerritory: 87, average: 72 },
  { metric: 'Coverage', yourTerritory: 78, average: 60 },
  { metric: 'Satisfaction', yourTerritory: 90, average: 75 },
];

export const cropRiskTrendsData: CropRiskTrend[] = [
  { month: 'Aug', rice: 15, cotton: 25, wheat: 10 },
  { month: 'Sep', rice: 22, cotton: 35, wheat: 12 },
  { month: 'Oct', rice: 35, cotton: 45, wheat: 15 },
  { month: 'Nov', rice: 45, cotton: 30, wheat: 20 },
  { month: 'Dec', rice: 30, cotton: 20, wheat: 25 },
  { month: 'Jan', rice: 25, cotton: 18, wheat: 30 },
];

export const stockUtilizationData: StockItem[] = [
  { product: 'Amistar', utilization: 92, stock: 145, status: 'optimal' },
  { product: 'Miravis Duo', utilization: 78, stock: 89, status: 'optimal' },
  { product: 'Custodia', utilization: 45, stock: 34, status: 'low' },
  { product: 'Folio Gold', utilization: 88, stock: 120, status: 'optimal' },
  { product: 'Score', utilization: 35, stock: 22, status: 'critical' },
  { product: 'Ridomil', utilization: 62, stock: 56, status: 'low' },
  { product: 'Actara', utilization: 95, stock: 180, status: 'optimal' },
  { product: 'Pegasus', utilization: 55, stock: 40, status: 'low' },
];

export const trustedByItems = [
  'Syngenta',
  'BetterYield',
  'CropGenius',
  'KisanAI',
  'HarvestIQ',
  'AgriTech',
  'FarmWise',
  'GreenPulse',
];

export const howItWorksSteps = [
  {
    id: 'step-1',
    number: '01',
    title: 'Data Collection',
    description: 'Satellite imagery, weather APIs, soil sensors, and field agent inputs converge into a unified agricultural data lake.',
    features: ['Real-time weather integration', 'NDVI satellite monitoring', 'Field agent mobile inputs'],
    image: '/images/illustration-data.jpg',
  },
  {
    id: 'step-2',
    number: '02',
    title: 'AI Processing',
    description: 'Proprietary machine learning models analyze crop health, pest risk, demand patterns, and inventory levels across territories.',
    features: ['Predictive pest modeling', 'Demand forecasting', 'Risk scoring algorithms'],
    image: '/images/illustration-ai.jpg',
  },
  {
    id: 'step-3',
    number: '03',
    title: 'Smart Recommendations',
    description: 'Every recommendation is ranked by priority, explainable by design, and timed for maximum impact.',
    features: ['Priority scoring engine', 'Explainable AI outputs', 'Optimal timing calculation'],
    image: '/images/illustration-field.jpg',
  },
  {
    id: 'step-4',
    number: '04',
    title: 'Field Action',
    description: 'Field agents execute visits with AI-generated talking points, product suggestions, and route optimization.',
    features: ['Voice-enabled visit assistant', 'Offline mode support', 'Real-time sync'],
    image: '/images/illustration-data.jpg',
  },
];
