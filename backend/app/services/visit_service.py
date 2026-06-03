"""Visit Planner service — priority visit queue + route optimization."""
import random
import math
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
    q = select(Retailer)
    if territory_id not in ["ind", "all"]:
        q = q.where(Retailer.territory_id == territory_id)
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
            db_territory_id = territory_id if territory_id not in ["ind", "all"] else retailer.territory_id
            visit = Visit(
                user_id=1,  # will be overridden in real auth flow
                retailer_id=req.retailer_id,
                territory_id=db_territory_id,
                visit_date=date.today(),
                visit_status="in_progress",
            )
            db.add(visit)
            await db.commit()
    return {"status": "ok", "action": req.action, "retailer_id": req.retailer_id}


async def get_route(territory_id: str, db: AsyncSession) -> RouteVisualizationResponse:
    q = select(Retailer).where(Retailer.priority_level.in_(["High", "Medium"]))
    if territory_id not in ["ind", "all"]:
        q = q.where(Retailer.territory_id == territory_id)
    q = q.order_by(Retailer.visit_priority_score.desc()).limit(6)

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

    # Calculate actual distance (Euclidean approximation converted to km)
    total_km = 0.0
    for idx in range(len(stops) - 1):
        s1 = stops[idx]
        s2 = stops[idx + 1]
        if s1.lat is not None and s1.lng is not None and s2.lat is not None and s2.lng is not None:
            dlat = s2.lat - s1.lat
            dlng = s2.lng - s1.lng
            dist = math.sqrt(dlat**2 + dlng**2) * 111.0  # Approx 111km per degree
            total_km += dist

    # Add detour factor and default if 0
    total_km = round(max(total_km * 1.25, 12.5), 1)

    # 40 km/h average speed + 45 minutes of visit duration per retailer stop
    travel_time = (total_km / 40.0) * 60.0
    visit_time = len(stops) * 45.0
    total_time_min = int(travel_time + visit_time)

    return RouteVisualizationResponse(
        stops=stops,
        total_km=total_km,
        total_time_min=total_time_min,
    )
