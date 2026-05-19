/**
 * AgroAI API Client
 * Central HTTP client for all backend communication.
 * Base URL is read from VITE_API_URL in your .env file.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ─── Token Management ────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('agroai_token');
}

export function setToken(token: string): void {
  localStorage.setItem('agroai_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('agroai_token');
  localStorage.removeItem('agroai_user');
}

// ─── Core Fetch Wrapper ──────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v)])
    );
    if (query.toString()) url += `?${query}`;
  }

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...fetchOptions, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/';
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error ${res.status}`);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string; user: UserProfile }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  register: (data: RegisterData) =>
    apiFetch<{ access_token: string; token_type: string; user: UserProfile }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  me: () => apiFetch<UserProfile>('/auth/me'),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const dashboardAPI = {
  getDashboard: (territory_id: string) =>
    apiFetch<DashboardData>('/dashboard/', { params: { territory_id } }),

  getKPIs: (territory_id: string) =>
    apiFetch<KPIItem[]>('/dashboard/kpis', { params: { territory_id } }),

  getWeeklyPerformance: (territory_id: string) =>
    apiFetch<WeeklyPoint[]>('/dashboard/weekly-performance', { params: { territory_id } }),
};

// ─── Recommendations ─────────────────────────────────────────────────────────

export const recommendationsAPI = {
  getRecommendations: (territory_id: string, limit = 10) =>
    apiFetch<Recommendation[]>('/recommendations/', { params: { territory_id, limit } }),

  applyRecommendation: (data: { recommendation_id: string; retailer_id: string; action: 'apply' | 'dismiss' }) =>
    apiFetch<{ success: boolean; id: string }>('/recommendations/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  predict: (features: PredictFeatures) =>
    apiFetch<PredictResult>('/recommendations/predict', {
      method: 'POST',
      body: JSON.stringify(features),
    }),
};

// ─── Visit Planner ───────────────────────────────────────────────────────────

export const visitPlannerAPI = {
  getPriorityVisits: (territory_id: string, filter = 'all') =>
    apiFetch<PriorityVisit[]>('/visit-planner/', { params: { territory_id, filter } }),

  getRoute: (territory_id: string) =>
    apiFetch<RouteData>('/visit-planner/route', { params: { territory_id } }),

  recordAction: (data: VisitActionData, territory_id: string) =>
    apiFetch<{ success: boolean; message: string; visit_id: string }>(
      '/visit-planner/action',
      { method: 'POST', body: JSON.stringify(data), params: { territory_id } }
    ),
};

// ─── Visit Feedback ──────────────────────────────────────────────────────────

export const visitFeedbackAPI = {
  submitFeedback: (data: VisitFeedbackData, territory_id: string) =>
    apiFetch<{ success: boolean; visit_log_id: string; message: string }>(
      '/visit-feedback/',
      { method: 'POST', body: JSON.stringify(data), params: { territory_id } }
    ),

  getHistory: (retailer_id: string, limit = 10) =>
    apiFetch<{ retailer_id: string; history: VisitLog[] }>(
      '/visit-feedback/history',
      { params: { retailer_id, limit } }
    ),
};

// ─── Risk Analyzer ───────────────────────────────────────────────────────────

export const riskAPI = {
  getAll: (territory_id: string, region_lat: number, region_lng: number, crop = 'Rice') =>
    apiFetch<RiskAnalyzerData>('/risk-analyzer/', {
      params: { territory_id, region_lat, region_lng, crop },
    }),

  getHeatmap: (territory_id: string, crop = 'Rice') =>
    apiFetch<HeatmapCell[]>('/risk-analyzer/heatmap', { params: { territory_id, crop } }),

  getNDVI: (territory_id: string) =>
    apiFetch<NDVIPoint[]>('/risk-analyzer/ndvi', { params: { territory_id } }),

  getPests: (territory_id: string, region_lat: number, region_lng: number) =>
    apiFetch<PestOutbreak[]>('/risk-analyzer/pests', {
      params: { territory_id, region_lat, region_lng },
    }),

  getWeather: (territory_id: string, region_lat: number, region_lng: number) =>
    apiFetch<WeatherAnomaly[]>('/risk-analyzer/weather', {
      params: { territory_id, region_lat, region_lng },
    }),

  getInsights: (territory_id: string) =>
    apiFetch<AIInsights>('/risk-analyzer/insights', { params: { territory_id } }),
};

// ─── Retailers ───────────────────────────────────────────────────────────────

export const retailersAPI = {
  list: (params: RetailerListParams) =>
    apiFetch<{ total: number; retailers: RetailerCard[] }>('/retailers/', { params: params as any }),

  getById: (retailer_id: string) =>
    apiFetch<RetailerDetail>(`/retailers/${retailer_id}`),

  rescore: (retailer_id: string) =>
    apiFetch<PredictResult>(`/retailers/${retailer_id}/score`, { method: 'POST' }),
};

// ─── Growers ─────────────────────────────────────────────────────────────────

export const growersAPI = {
  getClusters: (params: GrowerListParams) =>
    apiFetch<{ clusters: GrowerCluster[]; total: number }>('/growers/', { params: params as any }),

  getSummary: (territory_id: string) =>
    apiFetch<GrowerSummary>('/growers/summary', { params: { territory_id } }),
};

// ─── Analytics ───────────────────────────────────────────────────────────────

export const analyticsAPI = {
  getAll: (territory_id: string, date_range = '14d') =>
    apiFetch<AnalyticsData>('/analytics/', { params: { territory_id, date_range } }),
};

// ─── Mandi ───────────────────────────────────────────────────────────────────

export const mandiAPI = {
  getPrices: (state = 'Bihar') =>
    apiFetch<MandiPrice[]>('/mandi/', { params: { state } }),
};

// ─── AI Chat ─────────────────────────────────────────────────────────────────

export const chatAPI = {
  sendMessage: (message: string, session_id: string, region: string) =>
    apiFetch<{ response: string; session_id: string; timestamp: string }>('/ai-chat/', {
      method: 'POST',
      body: JSON.stringify({ message, session_id, region }),
    }),

  getHistory: (session_id: string, limit = 50) =>
    apiFetch<ChatMessage[]>('/ai-chat/history', { params: { session_id, limit } }),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationsAPI = {
  getAll: (unread_only = false, limit = 30) =>
    apiFetch<{ notifications: NotificationItem[]; unread_count: number }>('/notifications/', {
      params: { unread_only, limit },
    }),

  markRead: (id: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    apiFetch<{ success: boolean; updated: number }>('/notifications/read-all', { method: 'PATCH' }),
};

// ─── Settings ────────────────────────────────────────────────────────────────

export const settingsAPI = {
  get: () => apiFetch<UserProfile>('/settings/'),

  update: (data: Partial<SettingsUpdate>) =>
    apiFetch<{ success: boolean; message: string; updated: Record<string, unknown> }>(
      '/settings/',
      { method: 'PATCH', body: JSON.stringify(data) }
    ),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  role: string;
  territory: string;
  territory_id: string;
  region_id: string;
  theme: string;
  language: string;
  notifications: Record<string, boolean>;
  sync_enabled: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  employee_id: string;
  territory?: string;
  territory_id?: string;
  role?: string;
  region_id?: string;
}

export interface KPIItem {
  id: string;
  title: string;
  value: string;
  trend: string;
  trend_direction: 'up' | 'down';
  icon: string;
  icon_color: string;
  icon_bg: string;
  chart_data: number[];
  chart_color: string;
}

export interface WeeklyPoint {
  name: string;
  value: number;
  value2: number;
  value3: number;
}

export interface DashboardData {
  kpis: KPIItem[];
  weekly_performance: WeeklyPoint[];
  notifications_count: number;
  mandi_prices: MandiPrice[];
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  crop: string;
  message: string;
  weather: string;
  product: string;
  village: string;
  farmer?: string;
  pest_risk?: string;
  next_action?: string;
  follow_up_timeline?: string[];
  explainable_reasons?: ExplainableReason[];
  retailer_id: string;
  visit_priority_score: number;
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
  last_visit: string;
  status: string;
  tags: { label: string; color: string }[];
  ai_reason: string;
  actions: string[];
  retailer_id: string;
  lat?: number;
  lng?: number;
}

export interface RouteStop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: 'completed' | 'in-progress' | 'pending';
  time: string;
  retailer_id: string;
}

export interface RouteData {
  stops: RouteStop[];
  total_distance_km: number;
  estimated_hours: number;
  total_stops: number;
}

export interface VisitActionData {
  retailer_id: string;
  action: string;
  notes?: string;
  revenue_generated?: number;
  products_discussed?: string[];
}

export interface VisitFeedbackData {
  retailer_id: string;
  visit_status: string;
  products_discussed: string[];
  order_placed: boolean;
  order_quantity: number;
  order_value: number;
  farmer_response: string;
  follow_up_needed: boolean;
  next_follow_up_date?: string;
  competitor_issue?: string;
  notes?: string;
}

export interface VisitLog {
  id: string;
  visit_date: string;
  status: string;
  products_discussed: string[];
  order_placed: boolean;
  order_value: number;
  farmer_response: string;
  follow_up_needed: boolean;
  notes: string;
  agent_id: string;
}

export interface HeatmapCell {
  id: number;
  x: number;
  y: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  village: string;
  risk_percent: number;
}

export interface NDVIPoint {
  date: string;
  healthy: number;
  moderate: number;
  stressed: number;
}

export interface PestOutbreak {
  id: number;
  lat: number;
  lng: number;
  pest: string;
  severity: string;
  crop: string;
  village: string;
}

export interface WeatherAnomaly {
  id: number;
  lat: number;
  lng: number;
  type: string;
  label: string;
  temp: string;
  condition: string;
}

export interface AIInsights {
  overall_risk_level: string;
  ai_insights: string[];
  high_risk_count: number;
  total_retailers: number;
}

export interface RiskAnalyzerData {
  heatmap: HeatmapCell[];
  ndvi_data: NDVIPoint[];
  pest_outbreaks: PestOutbreak[];
  weather_anomalies: WeatherAnomaly[];
  overall_risk_level: string;
  ai_insights: string[];
}

export interface RetailerCard {
  id: string;
  retailer_id: string;
  territory_id: string;
  state: string;
  district: string;
  tehsil: string;
  location: string;
  lat?: number;
  lng?: number;
  visit_priority_score: number;
  priority_level: string;
  total_stock_qty: number;
  stock_status: string;
  unique_skus: number;
  recommended_product: string;
  recommended_action: string;
  last_visit_date: string;
  last_visit_days: number;
  explanation: string;
}

export interface RetailerDetail extends RetailerCard {
  sales_qty_30: number;
  sales_value_30: number;
  transactions_30: number;
  sales_qty_7: number;
  sales_value_7: number;
  grower_count: number;
  avg_farm_size: number;
  product_scans: number;
  campaign_attendance: number;
  engagement_rate: number;
  sales_demand_score: number;
  stock_alert_score: number;
  last_visit_gap_score: number;
  product_relevance_score: number;
  grower_engagement_score: number;
}

export interface RetailerListParams {
  territory_id: string;
  priority?: string;
  stock?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export interface GrowerCluster {
  id: string;
  tehsil: string;
  district: string;
  state: string;
  location: string;
  crop_type: string;
  crop_stage: string;
  grower_count: number;
  avg_farm_size_acres: number;
  product_scans: number;
  campaign_attendance: number;
  engagement_rate: number;
  pest_risk: string;
  urgency_score: number;
  recommended_advisory: string;
  recommended_product: string;
  last_visit_days: number;
  total_messages_sent: number;
}

export interface GrowerSummary {
  total_growers: number;
  total_product_scans: number;
  campaign_attendance: number;
  digital_engagement_rate: number;
  avg_farm_size_acres: number;
  high_urgency_clusters: number;
}

export interface GrowerListParams {
  territory_id: string;
  state?: string;
  district?: string;
  crop?: string;
  urgency?: string;
  skip?: number;
  limit?: number;
}

export interface AnalyticsData {
  field_efficiency: { name: string; value: number; value2?: number }[];
  revenue_per_visit: { name: string; value: number; value2?: number }[];
  recommendation_acceptance: { name: string; value: number; fill: string }[];
  regional_performance: { metric: string; your_territory: number; average: number }[];
  crop_risk_trends: { month: string; rice: number; cotton: number; wheat: number }[];
  stock_utilization: { product: string; utilization: number; stock: number; status: string }[];
}

export interface MandiPrice {
  crop: string;
  icon: string;
  price: string;
  unit: string;
  change: string;
  up: boolean;
  market: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  read: boolean;
  time: string;
  created_at: string;
}

export interface PredictFeatures {
  sales_qty_30: number;
  sales_value_30: number;
  transactions_30: number;
  sales_qty_7: number;
  sales_value_7: number;
  transactions_7: number;
  sales_growth_ratio: number;
  total_stock_qty: number;
  unique_skus: number;
  last_visit_days: number;
  product_sales_qty_30: number;
  grower_count: number;
  avg_farm_size: number;
  product_scans: number;
  campaign_attendance: number;
  total_messages: number;
  total_opened: number;
  total_clicked: number;
  engagement_rate: number;
}

export interface PredictResult {
  visit_priority_score: number;
  priority_level: string;
  action_type: string;
  explanation: string;
}

export interface SettingsUpdate {
  theme: string;
  language: string;
  notifications: Record<string, boolean>;
  sync_enabled: boolean;
  region_id: string;
}
