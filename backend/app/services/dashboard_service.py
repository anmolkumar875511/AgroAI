"""Dashboard service — assembles KPI cards, mandi prices, weekly performance."""
import random
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.models import Visit, Retailer, MandiPrice, Recommendation
from app.schemas.schemas import (
    KPIItem, KPIChartPoint, MandiPrice as MandiPriceSchema,
    WeeklyPoint, DashboardResponse,
)


def _sparkline(base: float, length: int = 7, variance: float = 0.15):
    return [KPIChartPoint(value=round(base * random.uniform(1 - variance, 1 + variance), 1)) for _ in range(length)]


async def get_dashboard(territory_id: str, db: AsyncSession) -> DashboardResponse:
    # ── KPIs from real DB ───────────────────────────────────────────────────
    today = date.today()
    month_start = today.replace(day=1)
    prev_month_start = (month_start - timedelta(days=1)).replace(day=1)

    # Visits this month
    q = select(func.count()).select_from(Visit).where(
        and_(Visit.territory_id == territory_id, Visit.visit_date >= month_start)
    )
    visits_this_month = (await db.execute(q)).scalar() or 0

    q = select(func.count()).select_from(Visit).where(
        and_(Visit.territory_id == territory_id,
             Visit.visit_date >= prev_month_start, Visit.visit_date < month_start)
    )
    visits_prev_month = (await db.execute(q)).scalar() or 1

    visit_trend = round((visits_this_month - visits_prev_month) / visits_prev_month * 100, 1)

    # Revenue this month
    q = select(func.coalesce(func.sum(Visit.order_value), 0)).where(
        and_(Visit.territory_id == territory_id, Visit.visit_date >= month_start)
    )
    revenue_this = float((await db.execute(q)).scalar() or 0)

    q = select(func.coalesce(func.sum(Visit.order_value), 0)).where(
        and_(Visit.territory_id == territory_id,
             Visit.visit_date >= prev_month_start, Visit.visit_date < month_start)
    )
    revenue_prev = float((await db.execute(q)).scalar() or 1)
    rev_trend = round((revenue_this - revenue_prev) / max(revenue_prev, 1) * 100, 1)

    # Retailers at risk (stock)
    q = select(func.count()).select_from(Retailer).where(
        and_(Retailer.territory_id == territory_id, Retailer.stock_status == "Low Stock")
    )
    low_stock = (await db.execute(q)).scalar() or 0

    # Active recommendations
    q = select(func.count()).select_from(Recommendation).where(
        and_(Recommendation.territory_id == territory_id, Recommendation.status == "pending")
    )
    active_recs = (await db.execute(q)).scalar() or 0

    kpis = [
        KPIItem(
            id="visits", title="Visits This Month",
            value=str(visits_this_month),
            trend=f"{'+' if visit_trend >= 0 else ''}{visit_trend}%",
            trend_direction="up" if visit_trend >= 0 else "down",
            icon="MapPin", icon_color="text-deep-green", icon_bg="bg-deep-green/10",
            chart_data=_sparkline(max(visits_this_month, 10)),
            chart_color="#1B5E20",
        ),
        KPIItem(
            id="revenue", title="Revenue Generated",
            value=f"₹{revenue_this/100000:.1f}L" if revenue_this >= 100000 else f"₹{revenue_this/1000:.0f}k",
            trend=f"{'+' if rev_trend >= 0 else ''}{rev_trend}%",
            trend_direction="up" if rev_trend >= 0 else "down",
            icon="TrendingUp", icon_color="text-lime-green", icon_bg="bg-lime-green/10",
            chart_data=_sparkline(max(revenue_this / 7, 5000)),
            chart_color="#8BC34A",
        ),
        KPIItem(
            id="stock_alerts", title="Stock Alerts",
            value=str(low_stock),
            trend=f"{low_stock} retailer{'s' if low_stock != 1 else ''} need restocking",
            trend_direction="down" if low_stock > 3 else "neutral",
            icon="Package", icon_color="text-accent-yellow", icon_bg="bg-accent-yellow/10",
            chart_data=_sparkline(max(low_stock, 2), variance=0.3),
            chart_color="#FFC107",
        ),
        KPIItem(
            id="recommendations", title="AI Recommendations",
            value=str(active_recs),
            trend="Pending action",
            trend_direction="neutral",
            icon="Sparkles", icon_color="text-info-blue", icon_bg="bg-info-blue/10",
            chart_data=_sparkline(max(active_recs, 3)),
            chart_color="#1E88E5",
        ),
    ]

    # ── Mandi prices from DB ────────────────────────────────────────────────
    result = await db.execute(select(MandiPrice).limit(6))
    mandi_rows = result.scalars().all()
    mandi_prices = [
        MandiPriceSchema(
            commodity=m.commodity, price=m.price, change=m.change,
            change_pct=m.change_pct, mandi=m.mandi, unit=m.unit,
        )
        for m in mandi_rows
    ]

    # ── Weekly performance ──────────────────────────────────────────────────
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly = []
    for i, day in enumerate(days):
        d = today - timedelta(days=(today.weekday() - i) % 7)
        q = select(func.count(), func.coalesce(func.sum(Visit.order_value), 0)).where(
            and_(Visit.territory_id == territory_id, Visit.visit_date == d)
        )
        row = (await db.execute(q)).one()
        weekly.append(WeeklyPoint(
            day=day,
            visits=row[0],
            revenue=float(row[1]),
            recommendations=random.randint(0, 5),
        ))

    return DashboardResponse(kpis=kpis, mandi_prices=mandi_prices, weekly_performance=weekly)
