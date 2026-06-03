"""Analytics service — all 6 chart shapes for AnalyticsPage from real DB."""
from datetime import date, datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case
from app.models.models import Visit, Retailer, RetailerInventory, Recommendation, Grower, RiskEvent
from app.schemas.schemas import (
    FieldEfficiencyPoint, RevenueVisitPoint, RecommendationAcceptancePoint,
    RegionalPerformanceItem, CropRiskPoint, StockUtilizationItem, AnalyticsResponse,
)

PRODUCTS = ["Amistar 250 SC", "Actara 25 WG", "Tilt 250 EC", "Score 250 EC", "Movondo", "Vibrance Integral"]
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


async def get_analytics(territory_id: str, date_range: str, db: AsyncSession) -> AnalyticsResponse:
    days_map = {"7d": 7, "14d": 14, "30d": 30, "90d": 90}
    days = days_map.get(date_range, 14)
    since = date.today() - timedelta(days=days)

    # ── Field Efficiency (real visits) ────────────────────────────────────
    field_efficiency = []
    weeks = min(days // 7, 6) or 1
    for w in range(weeks):
        week_start = date.today() - timedelta(days=(w + 1) * 7)
        week_end = date.today() - timedelta(days=w * 7)
        
        q = select(func.count()).select_from(Visit).where(
            and_(Visit.visit_date >= week_start, Visit.visit_date < week_end)
        )
        if territory_id not in ["ind", "all"]:
            q = q.where(Visit.territory_id == territory_id)
        total = (await db.execute(q)).scalar() or 0
        
        q2 = select(func.count()).select_from(Visit).where(
            and_(Visit.visit_date >= week_start, Visit.visit_date < week_end,
                 Visit.visit_status == "completed")
        )
        if territory_id not in ["ind", "all"]:
            q2 = q2.where(Visit.territory_id == territory_id)
        completed = (await db.execute(q2)).scalar() or 0
        
        eff = round((completed / total * 100) if total > 0 else 0.0, 1)
        field_efficiency.append(FieldEfficiencyPoint(
            week=f"W{weeks - w}",
            visits=total,
            completed=completed,
            efficiency=eff,
        ))
    field_efficiency.reverse()

    # ── Revenue Per Visit ─────────────────────────────────────────────────
    today = date.today()
    six_months_ago = today - timedelta(days=180)
    q = select(Visit).where(Visit.visit_date >= six_months_ago)
    if territory_id not in ["ind", "all"]:
        q = q.where(Visit.territory_id == territory_id)
    visits_res = (await db.execute(q)).scalars().all()

    # Map month string to visits & revenue
    month_data = {}
    for v in visits_res:
        m_str = v.visit_date.strftime("%b")
        if m_str not in month_data:
            month_data[m_str] = {"visits": 0, "revenue": 0.0}
        month_data[m_str]["visits"] += 1
        if v.visit_status == "completed" or v.order_placed:
            month_data[m_str]["revenue"] += v.order_value

    revenue_per_visit = []
    for i in range(5, -1, -1):
        m_date = today - timedelta(days=i * 30)
        m_str = m_date.strftime("%b")
        data = month_data.get(m_str, {"visits": 0, "revenue": 0.0})
        v_count = data["visits"]
        rev = data["revenue"]
        per_visit = round(rev / v_count, 0) if v_count > 0 else 0.0
        revenue_per_visit.append(RevenueVisitPoint(
            month=m_str, revenue=rev, visits=v_count, per_visit=per_visit
        ))

    # ── Recommendation Acceptance ─────────────────────────────────────────
    four_months_ago = today - timedelta(days=120)
    q_recs = select(Recommendation).where(
        Recommendation.created_at >= datetime.combine(four_months_ago, datetime.min.time())
    )
    if territory_id not in ["ind", "all"]:
        q_recs = q_recs.where(Recommendation.territory_id == territory_id)
    recs_res = (await db.execute(q_recs)).scalars().all()

    rec_month_data = {}
    for r in recs_res:
        m_str = r.created_at.strftime("%b")
        if m_str not in rec_month_data:
            rec_month_data[m_str] = {"sent": 0, "accepted": 0}
        rec_month_data[m_str]["sent"] += 1
        if r.status == "applied":
            rec_month_data[m_str]["accepted"] += 1

    rec_acceptance = []
    for i in range(3, -1, -1):
        m_date = today - timedelta(days=i * 30)
        m_str = m_date.strftime("%b")
        data = rec_month_data.get(m_str, {"sent": 0, "accepted": 0})
        sent = data["sent"]
        accepted = data["accepted"]
        rate = round(accepted / sent * 100, 1) if sent > 0 else 0.0
        rec_acceptance.append(RecommendationAcceptancePoint(
            month=m_str, sent=sent, accepted=accepted, rate=rate
        ))

    # ── Regional Performance ──────────────────────────────────────────────
    # 1. Visit Completion %
    q_visits_t = select(
        func.count(),
        func.sum(case((Visit.visit_status == "completed", 1), else_=0))
    )
    if territory_id not in ["ind", "all"]:
        q_visits_t = q_visits_t.where(Visit.territory_id == territory_id)
    visits_t_total, visits_t_comp = (await db.execute(q_visits_t)).one()
    visits_t_total = visits_t_total or 0
    visits_t_comp = visits_t_comp or 0
    eff_t = round((visits_t_comp / visits_t_total * 100) if visits_t_total > 0 else 0.0, 1)

    q_visits_all = select(
        func.count(),
        func.sum(case((Visit.visit_status == "completed", 1), else_=0))
    )
    visits_all_total, visits_all_comp = (await db.execute(q_visits_all)).one()
    visits_all_total = visits_all_total or 0
    visits_all_comp = visits_all_comp or 0
    eff_all = round((visits_all_comp / visits_all_total * 100) if visits_all_total > 0 else 0.0, 1)

    # 2. Revenue per Visit
    q_rev_t = select(func.sum(Visit.order_value))
    if territory_id not in ["ind", "all"]:
        q_rev_t = q_rev_t.where(Visit.territory_id == territory_id)
    rev_t_sum = float((await db.execute(q_rev_t)).scalar() or 0.0)
    rev_per_visit_t = round((rev_t_sum / visits_t_total / 1000) if visits_t_total > 0 else 0.0, 1)

    q_rev_all = select(func.sum(Visit.order_value))
    rev_all_sum = float((await db.execute(q_rev_all)).scalar() or 0.0)
    rev_per_visit_all = round((rev_all_sum / visits_all_total / 1000) if visits_all_total > 0 else 0.0, 1)

    # 3. Recommendation Accept %
    q_rec_t = select(
        func.count(),
        func.sum(case((Recommendation.status == "applied", 1), else_=0))
    )
    if territory_id not in ["ind", "all"]:
        q_rec_t = q_rec_t.where(Recommendation.territory_id == territory_id)
    rec_t_total, rec_t_acc = (await db.execute(q_rec_t)).one()
    rec_t_total = rec_t_total or 0
    rec_t_acc = rec_t_acc or 0
    rec_acc_t = round((rec_t_acc / rec_t_total * 100) if rec_t_total > 0 else 0.0, 1)

    q_rec_all = select(
        func.count(),
        func.sum(case((Recommendation.status == "applied", 1), else_=0))
    )
    rec_all_total, rec_all_acc = (await db.execute(q_rec_all)).one()
    rec_all_total = rec_all_total or 0
    rec_all_acc = rec_all_acc or 0
    rec_acc_all = round((rec_all_acc / rec_all_total * 100) if rec_all_total > 0 else 0.0, 1)

    # 4. Stock Alert Resolution % (Retailers with "Good Stock")
    q_stock_t = select(
        func.count(),
        func.sum(case((Retailer.stock_status == "Good Stock", 1), else_=0))
    )
    if territory_id not in ["ind", "all"]:
        q_stock_t = q_stock_t.where(Retailer.territory_id == territory_id)
    stock_t_total, stock_t_good = (await db.execute(q_stock_t)).one()
    stock_t_total = stock_t_total or 0
    stock_t_good = stock_t_good or 0
    stock_res_t = round((stock_t_good / stock_t_total * 100) if stock_t_total > 0 else 0.0, 1)

    q_stock_all = select(
        func.count(),
        func.sum(case((Retailer.stock_status == "Good Stock", 1), else_=0))
    )
    stock_all_total, stock_all_good = (await db.execute(q_stock_all)).one()
    stock_all_total = stock_all_total or 0
    stock_all_good = stock_all_good or 0
    stock_res_all = round((stock_all_good / stock_all_total * 100) if stock_all_total > 0 else 0.0, 1)

    # 5. Grower Engagement %
    q_grower_t = select(func.avg(Grower.engagement_rate))
    if territory_id not in ["ind", "all"]:
        q_grower_t = q_grower_t.where(Grower.territory_id == territory_id)
    grower_t_avg = (await db.execute(q_grower_t)).scalar() or 0.0
    grower_eng_t = round(float(grower_t_avg * 100), 1)

    q_grower_all = select(func.avg(Grower.engagement_rate))
    grower_all_avg = (await db.execute(q_grower_all)).scalar() or 0.0
    grower_eng_all = round(float(grower_all_avg * 100), 1)

    regional_performance = [
        RegionalPerformanceItem(metric="Visit Completion %", your_territory=eff_t, average=eff_all),
        RegionalPerformanceItem(metric="Revenue per Visit (₹k)", your_territory=rev_per_visit_t, average=rev_per_visit_all),
        RegionalPerformanceItem(metric="Recommendation Accept %", your_territory=rec_acc_t, average=rec_acc_all),
        RegionalPerformanceItem(metric="Stock Alert Resolution %", your_territory=stock_res_t, average=stock_res_all),
        RegionalPerformanceItem(metric="Grower Engagement %", your_territory=grower_eng_t, average=grower_eng_all),
    ]

    # ── Crop Risk Trends ──────────────────────────────────────────────────
    q_risks = select(RiskEvent).where(
        RiskEvent.created_at >= datetime.combine(four_months_ago, datetime.min.time())
    )
    if territory_id not in ["ind", "all"]:
        q_risks = q_risks.where(RiskEvent.territory_id == territory_id)
    risks_res = (await db.execute(q_risks)).scalars().all()

    risk_month_data = {}
    for r in risks_res:
        m_str = r.created_at.strftime("%b")
        if m_str not in risk_month_data:
            risk_month_data[m_str] = {"High": 0, "Medium": 0, "Low": 0}
        sev = r.severity.capitalize() if r.severity else "Low"
        if sev == "Critical":
            sev = "High"
        if sev not in risk_month_data[m_str]:
            risk_month_data[m_str][sev] = 0
        risk_month_data[m_str][sev] += 1

    crop_risk = []
    for i in range(3, -1, -1):
        m_date = today - timedelta(days=i * 30)
        m_str = m_date.strftime("%b")
        data = risk_month_data.get(m_str, {"High": 0, "Medium": 0, "Low": 0})
        crop_risk.append(CropRiskPoint(
            month=m_str,
            high=data.get("High", 0),
            medium=data.get("Medium", 0),
            low=data.get("Low", 0),
        ))

    # ── Stock Utilization ─────────────────────────────────────────────────
    result = await db.execute(
        select(RetailerInventory.product_name,
               func.sum(RetailerInventory.quantity).label("total_qty"))
        .group_by(RetailerInventory.product_name)
        .order_by(func.sum(RetailerInventory.quantity).desc())
        .limit(6)
    )
    rows = result.all()

    stock_util = []
    if rows:
        max_qty = max(r.total_qty for r in rows) or 1
        for r in rows:
            util = round(r.total_qty / max_qty * 100, 1)
            status = "Good Stock" if util > 50 else ("Low Stock" if util > 20 else "Out of Stock")
            stock_util.append(StockUtilizationItem(
                product=r.product_name, utilization=util,
                stock=r.total_qty, status=status,
            ))
    else:
        for p in PRODUCTS:
            stock_util.append(StockUtilizationItem(
                product=p, utilization=0.0, stock=0, status="Out of Stock"
            ))

    return AnalyticsResponse(
        field_efficiency=field_efficiency,
        revenue_per_visit=revenue_per_visit,
        recommendation_acceptance=rec_acceptance,
        regional_performance=regional_performance,
        crop_risk_trends=crop_risk,
        stock_utilization=stock_util,
    )
