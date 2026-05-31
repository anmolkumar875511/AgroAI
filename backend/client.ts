/**
 * AgroAI Frontend API Client
 * Maps every backend route to a typed function.
 *
 * Place at: src/api/client.ts
 */

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

// ─── Auth token management ────────────────────────────────────────────────────
const TOKEN_KEY = "agroai_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {}
    throw new Error(detail);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface UserOut {
  id: number;
  email: string;
  name: string;
  role: string;
  territory_id?: string;
  territory?: string;
  employee_id?: string;
  phone?: string;
  language: string;
  sync_enabled: boolean;
  notifications: Record<string, boolean>;
  theme: string;
}

export interface KPIChartPoint { value: number }
export interface KPIItem {
  id: string;
  title: string;
  value: string;
  trend: string;
  trend_direction: "up" | "down" | "neutral";
  icon: string;
  icon_color: string;
  icon_bg: string;
  chart_data: KPIChartPoint[];
  chart_color: string;
}

export interface MandiPriceItem {
  commodity: string;
  price: number;
  change: number;
  change_pct: number;
  mandi: string;
  unit: string;
}

export interface WeeklyPoint {
  day: string;
  visits: number;
  revenue: number;
  recommendations: number;
}

export interface DashboardData {
  kpis: KPIItem[];
  mandi_prices: MandiPriceItem[];
  weekly_performance: WeeklyPoint[];
}

export interface FieldEfficiencyPoint { week: string; visits: number; completed: number; efficiency: number }
export interface RevenueVisitPoint { month: string; revenue: number; visits: number; per_visit: number }
export interface RecommendationAcceptancePoint { month: string; sent: number; accepted: number; rate: number }
export interface RegionalPerformanceItem { metric: string; your_territory: number; average: number }
export interface CropRiskPoint { month: string; high: number; medium: number; low: number }
export interface StockUtilizationItem { product: string; utilization: number; stock: number; status: string }
export interface AnalyticsData {
  field_efficiency: FieldEfficiencyPoint[];
  revenue_per_visit: RevenueVisitPoint[];
  recommendation_acceptance: RecommendationAcceptancePoint[];
  regional_performance: RegionalPerformanceItem[];
  crop_risk_trends: CropRiskPoint[];
  stock_utilization: StockUtilizationItem[];
}

export interface RetailerCard {
  id: number;
  retailer_id: string;
  name: string;
  territory_id: string;
  location: string;
  priority_level: string;
  visit_priority_score: number;
  stock_status: string;
  total_stock_qty: number;
  last_visit_days: number;
  last_visit_date?: string;
  recommended_product?: string;
  explanation?: string;
}
export interface RetailerListResponse {
  retailers: RetailerCard[];
  total: number;
  skip: number;
  limit: number;
}

export interface GrowerCluster {
  id: number;
  territory_id: string;
  tehsil: string;
  district: string;
  state: string;
  crop_type: string;
  crop_stage: string;
  grower_count: number;
  pest_risk: string;
  urgency_score: number;
  product_scans: number;
  engagement_rate: number;
  recommended_product?: string;
  recommended_advisory?: string;
}
export interface GrowerSummary {
  total_growers: number;
  total_product_scans: number;
  campaign_attendance: number;
  avg_farm_size_acres: number;
  digital_engagement_rate: number;
  high_urgency_clusters: number;
}

export interface ExplainableReason { id: string; title: string; description: string; icon: string }
export interface RecommendationItem {
  id: string;
  territory_id: string;
  priority: string;
  crop: string;
  message: string;
  weather?: string;
  product?: string;
  village?: string;
  farmer?: string;
  retailer_id?: string;
  pest_risk: string;
  next_action?: string;
  follow_up_timeline?: string;
  status: string;
  explainable_reasons: ExplainableReason[];
}

export interface HeatmapCell { id: string; lat: number; lng: number; risk_level: string; risk_score: number; crop: string; village: string; pest_type?: string; area_km2: number }
export interface NDVIPoint { date: string; ndvi: number; benchmark: number; status: string }
export interface WeatherAnomaly { id: string; lat: number; lng: number; type: string; severity: string; description: string; affected_area_km2: number }
export interface PestOutbreak { id: string; lat: number; lng: number; pest_name: string; crop: string; severity: string; affected_farmers: number; recommended_product: string }
export interface AIInsight { id: string; title: string; description: string; severity: string; action: string }
export interface RiskAnalyzerData {
  overall_risk_level: string;
  heatmap: HeatmapCell[];
  ndvi_data: NDVIPoint[];
  weather_anomalies: WeatherAnomaly[];
  pest_outbreaks: PestOutbreak[];
  ai_insights: AIInsight[];
}

export interface VisitPlannerItem {
  id: string;
  name: string;
  type: string;
  score: number;
  location: string;
  last_visit: string;
  status: string;
  tags: string[];
  ai_reason: string;
  actions: string[];
  retailer_id: string;
}
export interface RouteStop { retailer_id: string; name: string; location: string; lat?: number; lng?: number; order: number; estimated_time: string }
export interface RouteVisualizationData { stops: RouteStop[]; total_km: number; total_time_min: number }

export interface NotificationItem { id: number; title: string; message: string; type: string; read: boolean; time: string }
export interface NotificationsResponse { notifications: NotificationItem[]; unread_count: number }

export interface MandiPriceFull extends MandiPriceItem { state: string; recorded_date: string }
export interface MandiResponse { prices: MandiPriceFull[]; updated_at: string }

export interface RepSummary {
  id: string; name: string; territory: string; visits: number; target: number;
  revenue: number; acceptance: number; efficiency: number;
  status: string; last_active: string; phone?: string;
}
export interface ManagerDashboardData {
  total_revenue: number; total_visits: number; total_targets: number;
  avg_acceptance: number; avg_efficiency: number;
  reps: RepSummary[];
  revenue_trend: Record<string, unknown>[];
  product_demand: Record<string, unknown>[];
  missed_opportunities: Record<string, unknown>[];
}

// ─── API modules ──────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: UserOut }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<UserOut>("/auth/me"),
};

export const dashboardAPI = {
  getDashboard: (territory_id: string) =>
    request<DashboardData>(`/dashboard/${territory_id}`),
};

export const analyticsAPI = {
  getAll: (territory_id: string, date_range = "14d") =>
    request<AnalyticsData>(`/analytics/${territory_id}?date_range=${date_range}`),
};

export const retailersAPI = {
  list: (params: {
    territory_id: string;
    priority?: string;
    stock?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams({ territory_id: params.territory_id });
    if (params.priority) q.set("priority", params.priority);
    if (params.stock)    q.set("stock",    params.stock);
    if (params.search)   q.set("search",   params.search);
    if (params.skip !== undefined)  q.set("skip",  String(params.skip));
    if (params.limit !== undefined) q.set("limit", String(params.limit));
    return request<RetailerListResponse>(`/retailers/?${q}`);
  },
  rescore: (retailer_id: string) =>
    request<{ retailer_id: string; new_score: number; priority_level: string }>(
      `/retailers/${retailer_id}/rescore`,
      { method: "POST" },
    ),
};

export const growersAPI = {
  getSummary: (territory_id: string) =>
    request<GrowerSummary>(`/growers/summary/${territory_id}`),
  getClusters: (params: { territory_id: string; crop?: string; urgency?: string }) => {
    const q = new URLSearchParams({ territory_id: params.territory_id });
    if (params.crop)    q.set("crop",    params.crop);
    if (params.urgency) q.set("urgency", params.urgency);
    return request<{ clusters: GrowerCluster[]; total: number }>(`/growers/clusters?${q}`);
  },
};

export const recommendationsAPI = {
  getRecommendations: (territory_id: string, limit = 20) =>
    request<RecommendationItem[]>(`/recommendations/${territory_id}?limit=${limit}`),
  applyRecommendation: (payload: {
    recommendation_id: string;
    retailer_id?: string;
    action: "apply" | "dismiss";
  }) =>
    request<{ status: string; recommendation_id: string }>("/recommendations/apply", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const riskAPI = {
  getAll: (territory_id: string, lat: number, lng: number) =>
    request<RiskAnalyzerData>(`/risk/${territory_id}?lat=${lat}&lng=${lng}`),
};

export const visitPlannerAPI = {
  getPriorityVisits: (territory_id: string, filter = "all") =>
    request<VisitPlannerItem[]>(`/visit-planner/priority/${territory_id}?filter=${filter}`),
  recordAction: (payload: { retailer_id: string; action: string }, territory_id: string) =>
    request<{ status: string }>(`/visit-planner/action/${territory_id}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getRoute: (territory_id: string) =>
    request<RouteVisualizationData>(`/visit-planner/route/${territory_id}`),
};

export const visitFeedbackAPI = {
  submitFeedback: (
    payload: {
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
    },
    territory_id: string,
  ) =>
    request<{ id: number; retailer_id: string; visit_status: string }>(
      `/visit-feedback/submit/${territory_id}`,
      { method: "POST", body: JSON.stringify(payload) },
    ),
};

export const notificationsAPI = {
  getAll: (unread_only = false, limit = 50) =>
    request<NotificationsResponse>(`/notifications/?unread_only=${unread_only}&limit=${limit}`),
  markRead: (id: number) =>
    request<{ status: string }>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    request<{ status: string }>("/notifications/mark-all-read", { method: "PATCH" }),
};

export const settingsAPI = {
  get: () => request<UserOut>("/settings/"),
  update: (payload: {
    theme?: string;
    language?: string;
    notifications?: Record<string, boolean>;
    sync_enabled?: boolean;
  }) =>
    request<UserOut>("/settings/", { method: "PATCH", body: JSON.stringify(payload) }),
  syncOffline: () =>
    request<{ status: string; synced_items: number }>("/settings/sync", { method: "POST" }),
};

export const mandiAPI = {
  getPrices: (state?: string, limit = 10) => {
    const q = new URLSearchParams({ limit: String(limit) });
    if (state) q.set("state", state);
    return request<MandiResponse>(`/mandi/?${q}`);
  },
};

export const chatAPI = {
  send: (messages: { role: "user" | "assistant"; content: string }[], territory_id?: string) =>
    request<{ reply: string; sources: string[] }>("/chat/", {
      method: "POST",
      body: JSON.stringify({ messages, territory_id }),
    }),
};

export const managerAPI = {
  getDashboard: () => request<ManagerDashboardData>("/manager/dashboard"),
  getTeamTracking: () => request<Record<string, unknown>>("/manager/team-tracking"),
  nudgeRep: (rep_id: string, message?: string) =>
    request<{ status: string }>("/manager/nudge", {
      method: "POST",
      body: JSON.stringify({ rep_id, message }),
    }),
};

// ─── Offline queue (for SettingsPage sync) ────────────────────────────────────
export async function syncOfflineQueue(): Promise<void> {
  await settingsAPI.syncOffline();
}
