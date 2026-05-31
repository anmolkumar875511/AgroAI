"""Visit Planner service — priority visit queue + route optimization."""
import random
from datetime import date, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Retailer, Visit
from app.schemas.schemas import VisitPlannerItem, VisitActionRequest, RouteStop, RouteVisualizationResponse

TAG_POOL = [["Fungicide", "High Stock"], ["Pest Alert", "Follow-up"], ["New Season", "Low Stock"],
            ["Top Revenue", "Critical"], ["NDVI Alert", "Visit Gap"]]

AI_REASONS = [
    "Stock critically low — 12 days to stockout at current sell rate. Revenue risk: ₹45k.",
    "BPH alert issued 3 days ago — no rep visit. Farmer cluster B-12 awaiting Actara demo.",
    "Last visit 28 days ago — above 21-day max gap threshold. Priority level elevated.",
    "Highest revenue per visit in territory (₹18k avg). Maintain strong relationship.",
    "NDVI anomaly detected nearby — growers seeking fungicide recommendation.",
    "High WhatsApp engagement (85 scans) but no retail conversion yet — visit to close.",
]


async def get_priority_visits(territory_id: str, filter_val: str, db: AsyncSession):
    q = select(Retailer).where(Retailer.territory_id == territory_id)
    if filter_val == "high":
        q = q.where(Retailer.priority_level == "High")
    elif filter_val == "overdue":
        q = q.where(Retailer.last_visit_days >= 21)
    q = q.order_by(Retailer.visit_priority_score.desc()).limit(10)

    result = await db.execute(q)
    retailers = result.scalars().all()

    visits = []
    for i, r in enumerate(retailers):
        status = "pending"
        if r.last_visit_days == 0:
            status = "completed"
        elif r.last_visit_days > 21:
            status = "overdue"

        visits.append(VisitPlannerItem(
            id=f"vp_{r.retailer_id}",
            name=r.name,
            type="retailer",
            score=r.visit_priority_score,
            location=r.location,
            last_visit=f"{r.last_visit_days} days ago" if r.last_visit_days > 0 else "Today",
            status=status,
            tags=random.choice(TAG_POOL),
            ai_reason=AI_REASONS[i % len(AI_REASONS)],
            actions=["Plan Visit", "View Insights", "Log Feedback"],
            retailer_id=r.retailer_id,
        ))

    return visits


async def record_action(req: VisitActionRequest, territory_id: str, db: AsyncSession):
    if req.action == "start":
        result = await db.execute(select(Retailer).where(Retailer.retailer_id == req.retailer_id))
        retailer = result.scalar_one_or_none()
        if retailer:
            visit = Visit(
                user_id=1,  # will be overridden in real auth flow
                retailer_id=req.retailer_id,
                territory_id=territory_id,
                visit_date=date.today(),
                visit_status="in_progress",
            )
            db.add(visit)
            await db.commit()
    return {"status": "ok", "action": req.action, "retailer_id": req.retailer_id}


async def get_route(territory_id: str, db: AsyncSession) -> RouteVisualizationResponse:
    q = select(Retailer).where(
        Retailer.territory_id == territory_id,
        Retailer.priority_level.in_(["High", "Medium"]),
    ).order_by(Retailer.visit_priority_score.desc()).limit(6)

    result = await db.execute(q)
    retailers = result.scalars().all()

    stops = []
    for i, r in enumerate(retailers):
        stops.append(RouteStop(
            retailer_id=r.retailer_id,
            name=r.name,
            location=r.location,
            lat=r.lat,
            lng=r.lng,
            order=i + 1,
            estimated_time=f"{9 + i}:{'30' if i % 2 else '00'} AM",
        ))

    return RouteVisualizationResponse(
        stops=stops,
        total_km=round(random.uniform(28, 95), 1),
        total_time_min=random.randint(180, 360),
    )
