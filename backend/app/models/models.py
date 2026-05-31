"""
AgroAI — SQLAlchemy ORM Models (all tables in one file for simplicity).
"""
from datetime import datetime, date
from typing import Optional
from sqlalchemy import (
    String, Integer, Float, Boolean, DateTime, Date, Text,
    ForeignKey, JSON, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="agent")  # agent | manager
    territory_id: Mapped[Optional[str]] = mapped_column(String(50))
    territory: Mapped[Optional[str]] = mapped_column(String(255))
    employee_id: Mapped[Optional[str]] = mapped_column(String(50))
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    language: Mapped[str] = mapped_column(String(50), default="English")
    sync_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    notifications: Mapped[dict] = mapped_column(JSON, default=lambda: {
        "pestAlerts": True, "stockAlerts": True,
        "visitReminders": False, "weeklyReports": True,
    })
    theme: Mapped[str] = mapped_column(String(20), default="dark")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    visits: Mapped[list["Visit"]] = relationship("Visit", back_populates="user")
    notifications_list: Mapped[list["Notification"]] = relationship("Notification", back_populates="user")


class Territory(Base):
    __tablename__ = "territories"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    state: Mapped[str] = mapped_column(String(100))
    district: Mapped[str] = mapped_column(String(100))
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    zoom: Mapped[int] = mapped_column(Integer, default=10)


class Retailer(Base):
    __tablename__ = "retailers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    retailer_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    territory_id: Mapped[str] = mapped_column(String(50), index=True)
    location: Mapped[str] = mapped_column(String(255))
    tehsil: Mapped[Optional[str]] = mapped_column(String(100))
    district: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(100))
    lat: Mapped[Optional[float]] = mapped_column(Float)
    lng: Mapped[Optional[float]] = mapped_column(Float)
    priority_level: Mapped[str] = mapped_column(String(20), default="Medium")
    visit_priority_score: Mapped[float] = mapped_column(Float, default=50.0)
    stock_status: Mapped[str] = mapped_column(String(30), default="Good Stock")
    total_stock_qty: Mapped[int] = mapped_column(Integer, default=100)
    last_visit_days: Mapped[int] = mapped_column(Integer, default=0)
    last_visit_date: Mapped[Optional[str]] = mapped_column(String(30))
    recommended_product: Mapped[Optional[str]] = mapped_column(String(255))
    explanation: Mapped[Optional[str]] = mapped_column(Text)
    monthly_revenue: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    inventory: Mapped[list["RetailerInventory"]] = relationship("RetailerInventory", back_populates="retailer")
    visits: Mapped[list["Visit"]] = relationship("Visit", back_populates="retailer")


class RetailerInventory(Base):
    __tablename__ = "retailer_inventory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    retailer_id: Mapped[str] = mapped_column(String(50), ForeignKey("retailers.retailer_id"))
    product_name: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(30), default="Good Stock")
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    retailer: Mapped["Retailer"] = relationship("Retailer", back_populates="inventory")


class Visit(Base):
    __tablename__ = "visits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    retailer_id: Mapped[str] = mapped_column(String(50), ForeignKey("retailers.retailer_id"))
    territory_id: Mapped[str] = mapped_column(String(50), index=True)
    visit_date: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    visit_status: Mapped[str] = mapped_column(String(50), default="completed")
    order_placed: Mapped[bool] = mapped_column(Boolean, default=False)
    order_value: Mapped[float] = mapped_column(Float, default=0.0)
    order_quantity: Mapped[int] = mapped_column(Integer, default=0)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="visits")
    retailer: Mapped["Retailer"] = relationship("Retailer", back_populates="visits")


class VisitFeedback(Base):
    __tablename__ = "visit_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    territory_id: Mapped[str] = mapped_column(String(50))
    retailer_id: Mapped[str] = mapped_column(String(50))
    visit_status: Mapped[str] = mapped_column(String(50))
    products_discussed: Mapped[list] = mapped_column(JSON, default=list)
    order_placed: Mapped[bool] = mapped_column(Boolean, default=False)
    order_quantity: Mapped[int] = mapped_column(Integer, default=0)
    order_value: Mapped[float] = mapped_column(Float, default=0.0)
    farmer_response: Mapped[str] = mapped_column(String(30), default="positive")
    follow_up_needed: Mapped[bool] = mapped_column(Boolean, default=False)
    next_follow_up_date: Mapped[Optional[str]] = mapped_column(String(30))
    competitor_issue: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(30), default="info")  # alert|warning|success|info
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="notifications_list")


class Grower(Base):
    __tablename__ = "growers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    territory_id: Mapped[str] = mapped_column(String(50), index=True)
    tehsil: Mapped[str] = mapped_column(String(100))
    district: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(100))
    crop_type: Mapped[str] = mapped_column(String(100))
    crop_stage: Mapped[str] = mapped_column(String(100))
    grower_count: Mapped[int] = mapped_column(Integer, default=0)
    pest_risk: Mapped[str] = mapped_column(String(20), default="Low")
    urgency_score: Mapped[int] = mapped_column(Integer, default=50)
    product_scans: Mapped[int] = mapped_column(Integer, default=0)
    engagement_rate: Mapped[float] = mapped_column(Float, default=0.5)
    recommended_product: Mapped[Optional[str]] = mapped_column(String(255))
    recommended_advisory: Mapped[Optional[str]] = mapped_column(Text)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    territory_id: Mapped[str] = mapped_column(String(50), index=True)
    priority: Mapped[str] = mapped_column(String(20), default="Medium")
    crop: Mapped[str] = mapped_column(String(100))
    message: Mapped[str] = mapped_column(Text)
    weather: Mapped[Optional[str]] = mapped_column(String(255))
    product: Mapped[Optional[str]] = mapped_column(String(255))
    village: Mapped[Optional[str]] = mapped_column(String(255))
    farmer: Mapped[Optional[str]] = mapped_column(String(255))
    retailer_id: Mapped[Optional[str]] = mapped_column(String(50))
    pest_risk: Mapped[str] = mapped_column(String(20), default="Low")
    next_action: Mapped[Optional[str]] = mapped_column(Text)
    follow_up_timeline: Mapped[Optional[str]] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    explainable_reasons: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class RiskEvent(Base):
    __tablename__ = "risk_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    territory_id: Mapped[str] = mapped_column(String(50), index=True)
    event_type: Mapped[str] = mapped_column(String(50))  # pest|weather|ndvi
    severity: Mapped[str] = mapped_column(String(20))
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    description: Mapped[str] = mapped_column(Text)
    crop: Mapped[Optional[str]] = mapped_column(String(100))
    affected_area_km2: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class MandiPrice(Base):
    __tablename__ = "mandi_prices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    commodity: Mapped[str] = mapped_column(String(100))
    mandi: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(100))
    price: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(20), default="quintal")
    change: Mapped[float] = mapped_column(Float, default=0.0)
    change_pct: Mapped[float] = mapped_column(Float, default=0.0)
    recorded_date: Mapped[date] = mapped_column(Date, server_default=func.current_date())
