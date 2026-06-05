"""Dashboard service — assembles KPI cards, mandi prices, weekly performance."""

from datetime import date, datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.models import Visit, Retailer, MandiPrice, Recommendation, Notification
from app.schemas.schemas import (
    KPIItem, KPIChartPoint, MandiPrice as MandiPriceSchema,
    WeeklyPoint, DashboardResponse,
)

COUNTED_VISIT_STATUSES = ["completed", "no_purchase", "follow_up_needed"]


async def _get_visits_sparkline(territory_id: str, db: AsyncSession) -> list[KPIChartPoint]:
    spark = []
    today = date.today()
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        q = select(func.count()).select_from(Visit).where(
            and_(Visit.visit_date == d, Visit.visit_status.in_(COUNTED_VISIT_STATUSES))
        )
        if territory_id not in ["ind", "all"]:
            q = q.where(Visit.territory_id == territory_id)
        count = (await db.execute(q)).scalar() or 0
        spark.append(KPIChartPoint(value=float(count)))
    return spark


async def _get_revenue_sparkline(territory_id: str, db: AsyncSession) -> list[KPIChartPoint]:
    spark = []
    today = date.today()
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        q = select(func.coalesce(func.sum(Visit.order_value), 0)).where(Visit.visit_date == d)
        if territory_id not in ["ind", "all"]:
            q = q.where(Visit.territory_id == territory_id)
        val = (await db.execute(q)).scalar() or 0
        spark.append(KPIChartPoint(value=float(val)))
    return spark


async def _get_notifications_sparkline(db: AsyncSession) -> list[KPIChartPoint]:
    spark = []
    today = date.today()
    for i in range(6, -1, -1):
        d_start = datetime.combine(today - timedelta(days=i), datetime.min.time())
        d_end = datetime.combine(today - timedelta(days=i), datetime.max.time())
        q = select(func.count()).select_from(Notification).where(
            and_(
                Notification.type.in_(["warning", "alert"]),
                Notification.created_at >= d_start,
                Notification.created_at <= d_end
            )
        )
        count = (await db.execute(q)).scalar() or 0
        spark.append(KPIChartPoint(value=float(count)))
    return spark


async def _get_recommendations_sparkline(territory_id: str, db: AsyncSession) -> list[KPIChartPoint]:
    spark = []
    today = date.today()
    for i in range(6, -1, -1):
        d_start = datetime.combine(today - timedelta(days=i), datetime.min.time())
        d_end = datetime.combine(today - timedelta(days=i), datetime.max.time())
        q = select(func.count()).select_from(Recommendation).where(
            and_(
                Recommendation.created_at >= d_start,
                Recommendation.created_at <= d_end
            )
        )
        if territory_id not in ["ind", "all"]:
            q = q.where(Recommendation.territory_id == territory_id)
        count = (await db.execute(q)).scalar() or 0
        spark.append(KPIChartPoint(value=float(count)))
    return spark


async def get_dashboard(territory_id: str, db: AsyncSession) -> DashboardResponse:
    # ── KPIs from real DB ───────────────────────────────────────────────────
    today = date.today()
    month_start = today.replace(day=1)
    prev_month_start = (month_start - timedelta(days=1)).replace(day=1)

    # Visits this month
    q = select(func.count()).select_from(Visit).where(
        and_(Visit.visit_date >= month_start, Visit.visit_status.in_(COUNTED_VISIT_STATUSES))
    )
    if territory_id not in ["ind", "all"]:
        q = q.where(Visit.territory_id == territory_id)
    visits_this_month = (await db.execute(q)).scalar() or 0

    q = select(func.count()).select_from(Visit).where(
        and_(
            Visit.visit_date >= prev_month_start,
            Visit.visit_date < month_start,
            Visit.visit_status.in_(COUNTED_VISIT_STATUSES),
        )
    )
    if territory_id not in ["ind", "all"]:
        q = q.where(Visit.territory_id == territory_id)
    visits_prev_month = (await db.execute(q)).scalar() or 1

    visit_trend = round((visits_this_month - visits_prev_month) / visits_prev_month * 100, 1)

    # Revenue this month
    q = select(func.coalesce(func.sum(Visit.order_value), 0)).where(Visit.visit_date >= month_start)
    if territory_id not in ["ind", "all"]:
        q = q.where(Visit.territory_id == territory_id)
    revenue_this = float((await db.execute(q)).scalar() or 0)

    q = select(func.coalesce(func.sum(Visit.order_value), 0)).where(
        and_(Visit.visit_date >= prev_month_start, Visit.visit_date < month_start)
    )
    if territory_id not in ["ind", "all"]:
        q = q.where(Visit.territory_id == territory_id)
    revenue_prev = float((await db.execute(q)).scalar() or 1)
    rev_trend = round((revenue_this - revenue_prev) / max(revenue_prev, 1) * 100, 1)

    # Retailers at risk (stock)
    q = select(func.count()).select_from(Retailer).where(Retailer.stock_status == "Low Stock")
    if territory_id not in ["ind", "all"]:
        q = q.where(Retailer.territory_id == territory_id)
    low_stock = (await db.execute(q)).scalar() or 0

    # Active recommendations
    q = select(func.count()).select_from(Recommendation).where(Recommendation.status == "pending")
    if territory_id not in ["ind", "all"]:
        q = q.where(Recommendation.territory_id == territory_id)
    active_recs = (await db.execute(q)).scalar() or 0

    kpis = [
        KPIItem(
            id="visits", title="Visits This Month",
            value=str(visits_this_month),
            trend=f"{'+' if visit_trend >= 0 else ''}{visit_trend}%",
            trend_direction="up" if visit_trend >= 0 else "down",
            icon="MapPin", icon_color="text-deep-green", icon_bg="bg-deep-green/10",
            chart_data=await _get_visits_sparkline(territory_id, db),
            chart_color="#1B5E20",
        ),
        KPIItem(
            id="revenue", title="Revenue Generated",
            value=f"₹{revenue_this/100000:.1f}L" if revenue_this >= 100000 else f"₹{revenue_this/1000:.0f}k",
            trend=f"{'+' if rev_trend >= 0 else ''}{rev_trend}%",
            trend_direction="up" if rev_trend >= 0 else "down",
            icon="TrendingUp", icon_color="text-lime-green", icon_bg="bg-lime-green/10",
            chart_data=await _get_revenue_sparkline(territory_id, db),
            chart_color="#8BC34A",
        ),
        KPIItem(
            id="stock_alerts", title="Stock Alerts",
            value=str(low_stock),
            trend=f"{low_stock} retailer{'s' if low_stock != 1 else ''} need restocking",
            trend_direction="down" if low_stock > 3 else "neutral",
            icon="Package", icon_color="text-accent-yellow", icon_bg="bg-accent-yellow/10",
            chart_data=await _get_notifications_sparkline(db),
            chart_color="#FFC107",
        ),
        KPIItem(
            id="recommendations", title="AI Recommendations",
            value=str(active_recs),
            trend="Pending action",
            trend_direction="neutral",
            icon="Sparkles", icon_color="text-info-blue", icon_bg="bg-info-blue/10",
            chart_data=await _get_recommendations_sparkline(territory_id, db),
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
            and_(Visit.visit_date == d, Visit.visit_status.in_(COUNTED_VISIT_STATUSES))
        )
        if territory_id not in ["ind", "all"]:
            q = q.where(Visit.territory_id == territory_id)
        row = (await db.execute(q)).one()

        # Query actual recommendations for this day
        q_rec = select(func.count()).select_from(Recommendation).where(
            and_(
                Recommendation.created_at >= datetime.combine(d, datetime.min.time()),
                Recommendation.created_at <= datetime.combine(d, datetime.max.time())
            )
        )
        if territory_id not in ["ind", "all"]:
            q_rec = q_rec.where(Recommendation.territory_id == territory_id)
        recs_count = (await db.execute(q_rec)).scalar() or 0

        weekly.append(WeeklyPoint(
            day=day,
            visits=row[0],
            revenue=float(row[1]),
            recommendations=recs_count,
        ))

    return DashboardResponse(kpis=kpis, mandi_prices=mandi_prices, weekly_performance=weekly)
