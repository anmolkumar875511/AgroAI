"""
AgroAI — Pydantic v2 schemas (model_config style, no deprecation warnings).
"""
from __future__ import annotations
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict


# ─── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    role: str
    territory_id: Optional[str] = None
    territory: Optional[str] = None
    employee_id: Optional[str] = None
    phone: Optional[str] = None
    language: str = "English"
    sync_enabled: bool = True
    notifications: Dict[str, bool] = {}
    theme: str = "dark"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── Dashboard ───────────────────────────────────────────────────────────────

class KPIChartPoint(BaseModel):
    value: float


class KPIItem(BaseModel):
    id: str
    title: str
    value: str
    trend: str
    trend_direction: str
    icon: str
    icon_color: str
    icon_bg: str
    chart_data: List[KPIChartPoint]
    chart_color: str


class MandiPrice(BaseModel):
    commodity: str
    price: float
    change: float
    change_pct: float
    mandi: str
    unit: str = "quintal"


class WeeklyPoint(BaseModel):
    day: str
    visits: int
    revenue: float
    recommendations: int


class DashboardResponse(BaseModel):
    kpis: List[KPIItem]
    mandi_prices: List[MandiPrice]
    weekly_performance: List[WeeklyPoint]


# ─── Analytics ───────────────────────────────────────────────────────────────

class FieldEfficiencyPoint(BaseModel):
    week: str
    visits: int
    completed: int
    efficiency: float


class RevenueVisitPoint(BaseModel):
    month: str
    revenue: float
    visits: int
    per_visit: float


class RecommendationAcceptancePoint(BaseModel):
    month: str
    sent: int
    accepted: int
    rate: float


class RegionalPerformanceItem(BaseModel):
    metric: str
    your_territory: float
    average: float


class CropRiskPoint(BaseModel):
    month: str
    high: int
    medium: int
    low: int


class StockUtilizationItem(BaseModel):
    product: str
    utilization: float
    stock: int
    status: str


class AnalyticsResponse(BaseModel):
    field_efficiency: List[FieldEfficiencyPoint]
    revenue_per_visit: List[RevenueVisitPoint]
    recommendation_acceptance: List[RecommendationAcceptancePoint]
    regional_performance: List[RegionalPerformanceItem]
    crop_risk_trends: List[CropRiskPoint]
    stock_utilization: List[StockUtilizationItem]


# ─── Retailers ───────────────────────────────────────────────────────────────

class RetailerCard(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    retailer_id: str
    name: str
    territory_id: str
    location: str
    priority_level: str
    visit_priority_score: float
    stock_status: str
    total_stock_qty: int
    last_visit_days: int
    last_visit_date: Optional[str] = None
    recommended_product: Optional[str] = None
    explanation: Optional[str] = None


class RetailerListResponse(BaseModel):
    retailers: List[RetailerCard]
    total: int
    skip: int
    limit: int


class RescoreResponse(BaseModel):
    retailer_id: str
    new_score: float
    priority_level: str


# ─── Growers ─────────────────────────────────────────────────────────────────

class GrowerCluster(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    territory_id: str
    tehsil: str
    district: str
    state: str
    crop_type: str
    crop_stage: str
    grower_count: int
    pest_risk: str
    urgency_score: int
    product_scans: int
    engagement_rate: float
    recommended_product: Optional[str] = None
    recommended_advisory: Optional[str] = None


class GrowerSummary(BaseModel):
    total_growers: int
    total_product_scans: int
    campaign_attendance: int
    avg_farm_size_acres: float
    digital_engagement_rate: float
    high_urgency_clusters: int


class GrowerClustersResponse(BaseModel):
    clusters: List[GrowerCluster]
    total: int


# ─── Recommendations ─────────────────────────────────────────────────────────

class ExplainableReason(BaseModel):
    id: str
    title: str
    description: str
    icon: str


class RecommendationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    territory_id: str
    priority: str
    crop: str
    message: str
    weather: Optional[str] = None
    product: Optional[str] = None
    village: Optional[str] = None
    farmer: Optional[str] = None
    retailer_id: Optional[str] = None
    pest_risk: str
    next_action: Optional[str] = None
    follow_up_timeline: Optional[str] = None
    status: str
    explainable_reasons: List[ExplainableReason]


class ApplyRecommendationRequest(BaseModel):
    recommendation_id: str
    retailer_id: Optional[str] = None
    action: str


# ─── Risk Analyzer ───────────────────────────────────────────────────────────

class HeatmapCell(BaseModel):
    id: str
    lat: float
    lng: float
    risk_level: str
    risk_score: float
    crop: str
    village: str
    pest_type: Optional[str] = None
    area_km2: float


class NDVIPoint(BaseModel):
    date: str
    ndvi: float
    benchmark: float
    status: str


class WeatherAnomaly(BaseModel):
    id: str
    lat: float
    lng: float
    type: str
    severity: str
    description: str
    affected_area_km2: float


class PestOutbreak(BaseModel):
    id: str
    lat: float
    lng: float
    pest_name: str
    crop: str
    severity: str
    affected_farmers: int
    recommended_product: str


class AIInsight(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    action: str


class RiskAnalyzerResponse(BaseModel):
    overall_risk_level: str
    heatmap: List[HeatmapCell]
    ndvi_data: List[NDVIPoint]
    weather_anomalies: List[WeatherAnomaly]
    pest_outbreaks: List[PestOutbreak]
    ai_insights: List[AIInsight]


# ─── Visit Planner ───────────────────────────────────────────────────────────

class VisitPlannerItem(BaseModel):
    id: str
    name: str
    type: str
    score: float
    location: str
    last_visit: str
    status: str
    tags: List[str]
    ai_reason: str
    actions: List[str]
    retailer_id: str


class VisitActionRequest(BaseModel):
    retailer_id: str
    action: str


class RouteStop(BaseModel):
    retailer_id: str
    name: str
    location: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    order: int
    estimated_time: str


class RouteVisualizationResponse(BaseModel):
    stops: List[RouteStop]
    total_km: float
    total_time_min: int


# ─── Visit Feedback ──────────────────────────────────────────────────────────

class VisitFeedbackRequest(BaseModel):
    retailer_id: str
    visit_status: str
    products_discussed: List[str] = []
    order_placed: bool = False
    order_quantity: int = 0
    order_value: float = 0.0
    farmer_response: str = "positive"
    follow_up_needed: bool = False
    next_follow_up_date: Optional[str] = None
    competitor_issue: Optional[str] = None
    notes: Optional[str] = None


class VisitFeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    retailer_id: str
    visit_status: str
    created_at: datetime


# ─── Notifications ───────────────────────────────────────────────────────────

class NotificationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    type: str
    read: bool
    time: str


class NotificationsResponse(BaseModel):
    notifications: List[NotificationItem]
    unread_count: int


# ─── Settings ────────────────────────────────────────────────────────────────

class SettingsUpdateRequest(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    notifications: Optional[Dict[str, bool]] = None
    sync_enabled: Optional[bool] = None


# ─── Mandi ───────────────────────────────────────────────────────────────────

class MandiPriceItem(BaseModel):
    commodity: str
    price: float
    change: float
    change_pct: float
    mandi: str
    state: str
    unit: str
    recorded_date: str


class MandiResponse(BaseModel):
    prices: List[MandiPriceItem]
    updated_at: str


# ─── AI Chat ─────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    territory_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    sources: List[str] = []


# ─── Manager ─────────────────────────────────────────────────────────────────

class RepSummary(BaseModel):
    id: str
    name: str
    territory: str
    visits: int
    target: int
    revenue: float
    acceptance: float
    efficiency: float
    status: str
    last_active: str
    phone: Optional[str] = None


class ManagerDashboardResponse(BaseModel):
    total_revenue: float
    total_visits: int
    total_targets: int
    avg_acceptance: float
    avg_efficiency: float
    reps: List[RepSummary]
    revenue_trend: List[Dict[str, Any]]
    product_demand: List[Dict[str, Any]]
    missed_opportunities: List[Dict[str, Any]]


class NudgeRequest(BaseModel):
    rep_id: str
    message: Optional[str] = None
