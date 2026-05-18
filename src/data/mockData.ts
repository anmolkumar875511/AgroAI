/**
 * CHANGED FILE: src/data/mockData.ts
 *
 * What changed:
 * - KEPT: sidebarItems, testimonials, trustedByItems, howItWorksSteps, weatherData
 *         (still needed for landing page, sidebar, weather widget)
 * - UPDATED sidebarItems: added retailer-insights, grower-insights, notifications
 *           with correct paths; removed placeholder /dashboard paths
 * - REMOVED: kpiData, aiRecommendations, priorityVisits, notifications,
 *            weeklyPerformanceData, fieldEfficiencyData, revenuePerVisitData,
 *            recommendationAcceptanceData, regionalPerformanceData,
 *            cropRiskTrendsData, stockUtilizationData, heatmapData, ndviData
 *            (all now fetched live from the backend API)
 */
import type {
  Testimonial,
  SidebarItem,
  WeatherData,
  NDVIData
} from '@/types';

// ─── Sidebar (used by Sidebar.tsx + MobileSidebarDrawer.tsx) ─────────────────
// CHANGED: updated paths and added new screens per the PDF spec
export const sidebarItems: SidebarItem[] = [
  { id: 'dashboard',         label: 'Dashboard',          icon: 'LayoutDashboard', path: '/dashboard' },
  { id: 'visit-planner',     label: 'Visit Planner',       icon: 'MapPinned',       path: '/visit-planner' },
  { id: 'recommendations',   label: 'AI Recommendations',  icon: 'Sparkles',        path: '/recommendations' },
  { id: 'risk-analyzer',     label: 'Risk Analyzer',       icon: 'ShieldAlert',     path: '/risk-analyzer' },
  { id: 'retailer-insights', label: 'Retailer Insights',   icon: 'Store',           path: '/retailer-insights' },
  { id: 'grower-insights',   label: 'Grower Insights',     icon: 'Users',           path: '/grower-insights' },
  { id: 'analytics',         label: 'Analytics',           icon: 'BarChart3',       path: '/analytics' },
  { id: 'notifications',     label: 'Notifications',       icon: 'Bell',            path: '/notifications' },
  { id: 'settings',          label: 'Settings',            icon: 'Settings',        path: '/settings' },
];

// ─── Landing page data (unchanged — not from API) ────────────────────────────
export const trustedByItems = [
  'Syngenta', 'BetterYield', 'CropGenius', 'KisanAI',
  'HarvestIQ', 'AgriTech', 'FarmWise', 'GreenPulse',
];

export const howItWorksSteps = [
  {
    id: 'step-1', number: '01', title: 'Data Collection',
    description: 'Satellite imagery, weather APIs, soil sensors, and field agent inputs converge into a unified agricultural data lake.',
    features: ['Real-time weather integration', 'NDVI satellite monitoring', 'Field agent mobile inputs'],
    image: '/images/illustration-data.jpg',
  },
  {
    id: 'step-2', number: '02', title: 'AI Processing',
    description: 'Proprietary machine learning models analyze crop health, pest risk, demand patterns, and inventory levels across territories.',
    features: ['Predictive pest modeling', 'Demand forecasting', 'Risk scoring algorithms'],
    image: '/images/illustration-ai.jpg',
  },
  {
    id: 'step-3', number: '03', title: 'Smart Recommendations',
    description: 'Every recommendation is ranked by priority, explainable by design, and timed for maximum impact.',
    features: ['Priority scoring engine', 'Explainable AI outputs', 'Optimal timing calculation'],
    image: '/images/illustration-field.jpg',
  },
  {
    id: 'step-4', number: '04', title: 'Field Action',
    description: 'Field agents execute visits with AI-generated talking points, product suggestions, and route optimization.',
    features: ['Voice-enabled visit assistant', 'Offline mode support', 'Real-time sync'],
    image: '/images/illustration-data.jpg',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote: "AgroAI told me exactly when to visit Rajesh's farm and what product to recommend. He trusted the advice because I could explain WHY. Sales went up 40%.",
    name: 'Amit Sharma', role: 'Field Agent, Bihar Territory', avatar: '/images/farmer-amit.jpg',
  },
  {
    id: 't2',
    quote: "The pest alert came 3 days before I noticed anything in my field. The AI recommendation saved my entire cotton crop.",
    name: 'Sunita Patel', role: 'Farmer, Gujarat', avatar: '/images/farmer-sunita.jpg',
  },
  {
    id: 't3',
    quote: "As a territory manager, I finally have visibility into what my team is doing in the field. The analytics are incredible.",
    name: 'Rahul Mehta', role: 'Territory Manager, Maharashtra', avatar: '/images/farmer-amit.jpg',
  },
  {
    id: 't4',
    quote: "I don't understand technology, but this app speaks my language. The voice assistant tells me everything I need to know.",
    name: 'Lakshmi Devi', role: 'Farmer, Andhra Pradesh', avatar: '/images/farmer-sunita.jpg',
  },
  {
    id: 't5',
    quote: "Route optimization alone saved me 2 hours every day. I can visit more farmers and close more deals.",
    name: 'Vikram Singh', role: 'Field Agent, Rajasthan', avatar: '/images/farmer-amit.jpg',
  },
];

// ─── Weather widget (static fallback — real data from backend future scope) ──
export const weatherData: WeatherData = {
  temp: 28,
  condition: 'sunny',
  location: 'Patna',
  humidity: 65,
  rainfall: 0,
};


export const ndviData: NDVIData[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  return {
    date: `Jan ${day}`,
    healthy: 0.75 + Math.sin(day * 0.2) * 0.1 + Math.random() * 0.05,
    moderate: 0.55 + Math.sin(day * 0.15) * 0.08 + Math.random() * 0.05,
    stressed: 0.35 + Math.sin(day * 0.1) * 0.06 + Math.random() * 0.05,
  };
});