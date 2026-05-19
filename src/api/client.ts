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

function demoUser(email = 'amit@agroai.com'): UserProfile {
  const manager = email.includes('manager');
  return {
    id: manager ? 'USR_MANAGER' : 'USR_AMIT',
    name: manager ? 'Priya Manager' : 'Amit Singh',
    email,
    employee_id: manager ? 'MGR-001' : 'AG-014',
    role: manager ? 'territory_manager' : 'field_agent',
    territory: manager ? 'North India Command' : 'Kanpur Rural',
    territory_id: 'TER_0001',
    region_id: 'kanpur',
    theme: 'dark',
    language: 'English',
    notifications: { pestAlerts: true, stockAlerts: true, visitReminders: true, weeklyReports: true },
    sync_enabled: true,
  };
}

function storedDemoUser(): UserProfile {
  const raw = localStorage.getItem('agroai_user');
  if (!raw) return demoUser();
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return demoUser();
  }
}

function parseEmail(body: BodyInit | null | undefined): string {
  if (typeof body !== 'string') return 'amit@agroai.com';
  try {
    const parsed = JSON.parse(body) as { email?: string };
    return parsed.email || 'amit@agroai.com';
  } catch {
    return 'amit@agroai.com';
  }
}

function mockResponse<T>(endpoint: string, options: FetchOptions): T | null {
  const method = (options.method || 'GET').toUpperCase();

  if (endpoint === '/auth/login' && method === 'POST') {
    const user = demoUser(parseEmail(options.body));
    return { access_token: 'demo-token', token_type: 'bearer', user } as T;
  }
  if (endpoint === '/auth/me') return storedDemoUser() as T;

  if (endpoint === '/dashboard/') {
    return {
      kpis: [
        { id: 'risk-villages', title: 'High Risk Villages', value: '18', trend: '+12%', trend_direction: 'up', icon: 'AlertTriangle', icon_color: '#D32F2F', icon_bg: '#D32F2F22', chart_data: [8, 11, 10, 14, 18], chart_color: '#D32F2F' },
        { id: 'priority-visits', title: 'Priority Visits', value: '42', trend: '+26%', trend_direction: 'up', icon: 'MapPin', icon_color: '#1976D2', icon_bg: '#1976D222', chart_data: [20, 24, 29, 35, 42], chart_color: '#1976D2' },
        { id: 'stock-alerts', title: 'Inventory Alerts', value: '9', trend: '-8%', trend_direction: 'down', icon: 'Package', icon_color: '#F9A825', icon_bg: '#F9A82522', chart_data: [14, 13, 11, 10, 9], chart_color: '#F9A825' },
        { id: 'revenue-opportunity', title: 'Revenue Impact', value: '+18%', trend: '+4%', trend_direction: 'up', icon: 'TrendingUp', icon_color: '#388E3C', icon_bg: '#388E3C22', chart_data: [7, 10, 13, 16, 18], chart_color: '#388E3C' },
      ],
      weekly_performance: [],
      notifications_count: 4,
      mandi_prices: [
        { crop: 'Wheat', icon: 'Wheat', price: 'Rs 2,340', unit: '/qtl', change: '+3.2%', up: true, market: 'Kanpur Mandi', updated_at: 'Now' },
        { crop: 'Rice', icon: 'Sprout', price: 'Rs 2,110', unit: '/qtl', change: '-1.1%', up: false, market: 'Unnao Mandi', updated_at: 'Now' },
        { crop: 'Maize', icon: 'Sprout', price: 'Rs 1,920', unit: '/qtl', change: '+2.4%', up: true, market: 'Fatehpur Mandi', updated_at: 'Now' },
        { crop: 'Mustard', icon: 'Sprout', price: 'Rs 5,480', unit: '/qtl', change: '+4.1%', up: true, market: 'Rural Hub', updated_at: 'Now' },
      ],
    } as T;
  }

  if (endpoint === '/recommendations/') {
    return [
      {
        id: 'REC_001',
        priority: 'high',
        crop: 'Wheat',
        message: 'Push fungicide bundle to retailers serving humid wheat clusters.',
        weather: 'Rainfall anomaly and high night humidity detected',
        product: 'Amistar Top + sticker bundle',
        village: 'Kanpur Rural North',
        farmer: 'Cluster A',
        pest_risk: 'High fungal risk',
        next_action: 'Prioritize retailer visit within 24 hours and carry fungal advisory sheet.',
        follow_up_timeline: ['Today', '24h', '72h'],
        retailer_id: 'RTL_00042',
        visit_priority_score: 89,
        explainable_reasons: [
          { id: 'r1', title: 'Rainfall anomaly detected', description: 'Humidity stayed above fungal threshold for 3 nights.', icon: 'CloudRain' },
          { id: 'r2', title: 'Inventory critically low', description: 'Local fungicide stock is below forecasted weekly demand.', icon: 'Package' },
          { id: 'r3', title: 'High historical conversion', description: 'This retailer cluster converts 31% above baseline.', icon: 'TrendingUp' },
        ],
      },
      {
        id: 'REC_002',
        priority: 'medium',
        crop: 'Maize',
        message: 'Route field team through maize belt with rising Fall Armyworm probability.',
        weather: 'Warm and humid',
        product: 'Proclaim 5 SG',
        village: 'Bithoor Belt',
        farmer: 'Cluster B',
        pest_risk: 'Medium pest pressure',
        next_action: 'Show pest hotspots and prepare advisory in Hindi.',
        follow_up_timeline: ['Today', '48h'],
        retailer_id: 'RTL_00077',
        visit_priority_score: 78,
        explainable_reasons: [
          { id: 'r4', title: 'Pest outbreak nearby', description: 'Bulletin reports activity within 3 km.', icon: 'Leaf' },
          { id: 'r5', title: 'Route efficiency', description: 'Stop fits current active route with low detour cost.', icon: 'History' },
        ],
      },
    ] as T;
  }

  if (endpoint === '/recommendations/apply') return { success: true, id: 'demo-apply' } as T;

  if (endpoint === '/visit-planner/') {
    return [
      { id: 'VIS_001', name: 'RTL_00042 - Shiv Agro Center', type: 'retailer', score: 91, location: 'Kanpur Rural North', last_visit: '8 days ago', status: 'urgent', tags: [{ label: 'HIGH PEST RISK', color: 'red' }, { label: 'LOW INVENTORY', color: 'yellow' }], ai_reason: 'Rainfall anomaly, low fungicide inventory, and high conversion history make this the top visit.', actions: ['Start Visit', 'View Profile'], retailer_id: 'RTL_00042' },
      { id: 'VIS_002', name: 'Bithoor Maize Cluster', type: 'cluster', score: 83, location: 'Bithoor Belt', last_visit: '12 days ago', status: 'planned', tags: [{ label: 'HIGH SALES POTENTIAL', color: 'green' }, { label: 'PEST WATCH', color: 'blue' }], ai_reason: 'Pest bulletin increased route priority and maize advisory demand is rising.', actions: ['Plan Route', 'View Details'], retailer_id: 'RTL_00077' },
    ] as T;
  }

  if (endpoint === '/visit-planner/route') {
    return {
      total_stops: 4,
      total_distance_km: 37,
      estimated_hours: 3.5,
      stops: [
        { id: 1, name: 'Depot', lat: 26.4499, lng: 80.3319, status: 'completed', time: '09:00', retailer_id: 'DEPOT' },
        { id: 2, name: 'Shiv Agro Center', lat: 26.52, lng: 80.39, status: 'in-progress', time: '10:15', retailer_id: 'RTL_00042' },
        { id: 3, name: 'Bithoor Cluster', lat: 26.61, lng: 80.27, status: 'pending', time: '12:00', retailer_id: 'RTL_00077' },
        { id: 4, name: 'Unnao Retailer', lat: 26.48, lng: 80.5, status: 'pending', time: '14:20', retailer_id: 'RTL_00108' },
      ],
    } as T;
  }

  if (endpoint === '/visit-planner/action') return { success: true, message: 'Recorded', visit_id: 'VIS_001' } as T;

  if (endpoint === '/ai-chat/' && method === 'POST') {
    return {
      response: 'Retailer A is priority because rainfall anomaly, pest pressure, low fungicide inventory, and high historical conversion all crossed the model threshold.',
      session_id: 'demo-session',
      timestamp: new Date().toISOString(),
    } as T;
  }

  if (endpoint === '/risk-analyzer/') {
    return {
      heatmap: Array.from({ length: 48 }, (_, i) => ({ id: i, x: i % 8, y: Math.floor(i / 8), risk: i % 11 === 0 ? 'critical' : i % 4 === 0 ? 'high' : i % 3 === 0 ? 'medium' : 'low', village: `Village ${i + 1}`, risk_percent: 45 + (i % 5) * 11 })),
      ndvi_data: ['W1', 'W2', 'W3', 'W4'].map((date, i) => ({ date, healthy: 0.72 - i * 0.03, moderate: 0.18 + i * 0.02, stressed: 0.1 + i * 0.015 })),
      pest_outbreaks: [],
      weather_anomalies: [
        { id: 1, lat: 26.5, lng: 80.38, type: 'rain', label: 'Rainfall anomaly', temp: '27C', condition: 'High humidity' },
        { id: 2, lat: 26.35, lng: 80.22, type: 'drought', label: 'Dry pocket', temp: '35C', condition: 'Low moisture' },
      ],
      overall_risk_level: 'High',
      ai_insights: ['3 villages show critical fungal risk spike', 'Stem borer outbreak probability increased to 78%', 'Recommend immediate field visits to affected zones'],
    } as T;
  }

  if (endpoint === '/notifications/') {
    return {
      unread_count: 3,
      notifications: [
        { id: 'N1', title: 'EARLY FUNGAL RISK DETECTED', message: 'Kanpur Rural moved to high urgency.', type: 'alert', read: false, time: '10:45 AM', created_at: new Date().toISOString() },
        { id: 'N2', title: 'Route optimization completed', message: '4 high-priority stops resequenced.', type: 'success', read: false, time: '10:42 AM', created_at: new Date().toISOString() },
      ],
    } as T;
  }

  if (endpoint.includes('/read')) return { success: true } as T;
  if (endpoint === '/notifications/read-all') return { success: true, updated: 3 } as T;

  if (endpoint === '/retailers/') {
    return {
      total: 3,
      retailers: [
        { id: '1', retailer_id: 'RTL_00042', territory_id: 'TER_0001', state: 'UP', district: 'Kanpur Rural', tehsil: 'Bithoor', location: 'Bithoor Market', visit_priority_score: 91, priority_level: 'High', total_stock_qty: 18, stock_status: 'Low Stock', unique_skus: 7, recommended_product: 'Fungicide Bundle', recommended_action: 'Push fungicide bundle + refill', last_visit_date: '2026-05-10', last_visit_days: 9, explanation: 'Likely to purchase fungicide this week due to rainfall anomaly and high grower demand.' },
        { id: '2', retailer_id: 'RTL_00077', territory_id: 'TER_0001', state: 'UP', district: 'Kanpur Rural', tehsil: 'Chaubepur', location: 'Chaubepur Block', visit_priority_score: 84, priority_level: 'High', total_stock_qty: 0, stock_status: 'Out of Stock', unique_skus: 4, recommended_product: 'Proclaim 5 SG', recommended_action: 'Restore maize pest SKU stock', last_visit_date: '2026-05-06', last_visit_days: 13, explanation: 'Inventory risk is high and pest bulletin increased maize protection demand.' },
        { id: '3', retailer_id: 'RTL_00108', territory_id: 'TER_0001', state: 'UP', district: 'Unnao', tehsil: 'Safipur', location: 'Safipur Rural', visit_priority_score: 72, priority_level: 'Medium', total_stock_qty: 58, stock_status: 'Good Stock', unique_skus: 10, recommended_product: 'Seed treatment pack', recommended_action: 'Cross-sell seed treatment', last_visit_date: '2026-05-14', last_visit_days: 5, explanation: 'High historical conversion and active sowing-stage grower traffic.' },
      ],
    } as T;
  }

  if (endpoint === '/growers/summary') {
    return { total_growers: 4200, total_product_scans: 18340, campaign_attendance: 1240, digital_engagement_rate: 0.42, avg_farm_size_acres: 3.7, high_urgency_clusters: 8 } as T;
  }

  if (endpoint === '/growers/') {
    return {
      total: 2,
      clusters: [
        { id: 'G1', tehsil: 'Bithoor', district: 'Kanpur Rural', state: 'UP', location: 'Bithoor Belt', crop_type: 'Maize', crop_stage: 'Vegetative', grower_count: 640, avg_farm_size_acres: 3.4, product_scans: 3200, campaign_attendance: 260, engagement_rate: 0.48, pest_risk: 'High', urgency_score: 86, recommended_advisory: 'Scout for Fall Armyworm and apply recommended larvicide where threshold is crossed.', recommended_product: 'Proclaim 5 SG', last_visit_days: 11, total_messages_sent: 1200 },
        { id: 'G2', tehsil: 'Chaubepur', district: 'Kanpur Rural', state: 'UP', location: 'Chaubepur', crop_type: 'Wheat', crop_stage: 'Reproductive', grower_count: 820, avg_farm_size_acres: 4.1, product_scans: 4100, campaign_attendance: 310, engagement_rate: 0.39, pest_risk: 'Critical', urgency_score: 93, recommended_advisory: 'Fungal risk high; advise timely fungicide spray and revisit within 24 hours.', recommended_product: 'Amistar Top', last_visit_days: 14, total_messages_sent: 1600 },
      ],
    } as T;
  }

  if (endpoint === '/settings/' && method === 'PATCH') return { success: true, message: 'Saved', updated: {} } as T;

  return null;
}

// ─── Core Fetch Wrapper ──────────────────────────────────────────────────────

type ApiQueryParams = Record<string, string | number | boolean | undefined | null>;

interface FetchOptions extends RequestInit {
  params?: ApiQueryParams;
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

  let res: Response;
  try {
    res = await fetch(url, { ...fetchOptions, headers });
  } catch (err) {
    const fallback = mockResponse<T>(endpoint, options);
    if (fallback !== null) return fallback;
    throw err;
  }

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
    apiFetch<{ total: number; retailers: RetailerCard[] }>('/retailers/', { params: { ...params } }),

  getById: (retailer_id: string) =>
    apiFetch<RetailerDetail>(`/retailers/${retailer_id}`),

  rescore: (retailer_id: string) =>
    apiFetch<PredictResult>(`/retailers/${retailer_id}/score`, { method: 'POST' }),
};

// ─── Growers ─────────────────────────────────────────────────────────────────

export const growersAPI = {
  getClusters: (params: GrowerListParams) =>
    apiFetch<{ clusters: GrowerCluster[]; total: number }>('/growers/', { params: { ...params } }),

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
