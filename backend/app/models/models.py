from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


# ─── User ─────────────────────────────────────────────────────────────────────

class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    email: str
    hashed_password: str
    employee_id: str
    role: str = "field_agent"  # field_agent | manager | admin
    territory: str = ""
    territory_id: str = ""
    region_id: str = "br"  # default Bihar
    theme: str = "dark"
    language: str = "English"
    notifications: dict = {
        "pestAlerts": True,
        "stockAlerts": True,
        "visitReminders": False,
        "weeklyReports": True,
    }
    sync_enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ─── Retailer ─────────────────────────────────────────────────────────────────

class RetailerModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    retailer_id: str
    territory_id: str
    state: str
    district: str
    tehsil: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    # Sales features (from ML model)
    sales_qty_30: float = 0
    sales_value_30: float = 0
    transactions_30: float = 0
    sales_qty_7: float = 0
    sales_value_7: float = 0
    transactions_7: float = 0
    sales_growth_ratio: float = 0
    total_stock_qty: float = 0
    unique_skus: float = 0
    last_visit_days: float = 0
    product_sales_qty_30: float = 0
    grower_count: float = 0
    avg_farm_size: float = 0
    product_scans: float = 0
    campaign_attendance: float = 0
    total_messages: float = 0
    total_opened: float = 0
    total_clicked: float = 0
    engagement_rate: float = 0
    # Scores (computed)
    visit_priority_score: float = 0
    priority_level: str = "Low"
    recommended_product: str = ""
    recommended_action: str = ""
    explanation: str = ""
    stock_status: str = "Good Stock"
    last_visit_date: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ─── Visit Log ────────────────────────────────────────────────────────────────

class VisitLogModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    retailer_id: str
    territory_id: str
    agent_id: str
    visit_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending | completed | skipped
    notes: str = ""
    revenue_generated: float = 0
    products_discussed: List[str] = []
    outcome: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ─── Notification ─────────────────────────────────────────────────────────────

class NotificationModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: str
    title: str
    message: str
    type: str = "info"  # alert | info | success | warning
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ─── AI Chat Message ──────────────────────────────────────────────────────────

class ChatMessageModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    session_id: str
    user_id: str
    role: str  # user | assistant
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ─── Mandi Price ──────────────────────────────────────────────────────────────

class MandiPriceModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    crop: str
    price: float  # per quintal in INR
    unit: str = "qtl"
    change: float = 0  # price change from previous day
    market: str
    state: str
    date: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
