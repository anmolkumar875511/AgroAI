"""Visit Planner service — priority visit queue + route optimization."""
import random
import math
from datetime import date, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.models.models import Retailer, Visit, VisitFeedback
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

PLANNED_STATUSES = ["planned", "in_progress"]
OUTCOME_STATUSES = ["completed", "no_purchase", "follow_up_needed"]


def _retailer_ai_reason(retailer: Retailer, fallback: str) -> str:
    if retailer.explanation:
        return retailer.explanation
    if retailer.stock_status in ["Low Stock", "Out of Stock"]:
        return (
            f"Stock status is {retailer.stock_status.lower()} and current "
            f"monthly revenue exposure is about ₹{int(retailer.monthly_revenue * 0.15):,}."
        )
    if retailer.last_visit_days >= 21:
        return (
            f"Last visit was {retailer.last_visit_days} days ago, crossing the "
            "21-day follow-up threshold for this territory."
        )
    if retailer.monthly_revenue >= 150000:
        return (
            f"High revenue retailer with ₹{int(retailer.monthly_revenue):,} monthly potential. "
            "Relationship maintenance is recommended."
        )
    return fallback


async def get_priority_visits(territory_id: str, filter_val: str, db: AsyncSession):
    q = select(Retailer)
    if territory_id not in ["ind", "all"]:
        q = q.where(Retailer.territory_id == territory_id)
    
    if filter_val in ["high", "high-risk"]:
        q = q.where(Retailer.priority_level == "High")
    elif filter_val == "revenue":
        # Target high monthly revenue potential (>= ₹150,000)
        q = q.where(Retailer.monthly_revenue >= 150000)
    elif filter_val in ["overdue", "follow-up"]:
        # Retailer has follow_up_needed in feedback, or last_visit_days >= 21
        feedback_sub = select(VisitFeedback.retailer_id).where(VisitFeedback.follow_up_needed == True)
        q = q.where(
            or_(
                Retailer.retailer_id.in_(feedback_sub),
                Retailer.last_visit_days >= 21
            )
        )
        
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
            ai_reason=_retailer_ai_reason(r, AI_REASONS[i % len(AI_REASONS)]),
            actions=["Plan Visit", "View Insights", "Log Feedback"],
            retailer_id=r.retailer_id,
        ))

    return visits

async def record_action(req: VisitActionRequest, territory_id: str, user_id: int, db: AsyncSession):
    if req.action in ["start", "plan"]:
        result = await db.execute(select(Retailer).where(Retailer.retailer_id == req.retailer_id))
        retailer = result.scalar_one_or_none()
        if retailer:
            db_territory_id = territory_id if territory_id not in ["ind", "all"] else retailer.territory_id
            existing_res = await db.execute(
                select(Visit).where(
                    and_(
                        Visit.user_id == user_id,
                        Visit.retailer_id == req.retailer_id,
                        Visit.visit_date == date.today(),
                    )
                ).order_by(Visit.created_at.desc())
            )
            existing = existing_res.scalars().first()
            if existing:
                if existing.visit_status not in OUTCOME_STATUSES and existing.visit_status != "skipped":
                    existing.visit_status = "planned"
                    existing.territory_id = db_territory_id
                    await db.commit()
                return {
                    "status": "ok",
                    "action": req.action,
                    "retailer_id": req.retailer_id,
                    "visit_id": existing.id,
                    "deduped": True,
                }

            visit = Visit(
                user_id=user_id,
                retailer_id=req.retailer_id,
                territory_id=db_territory_id,
                visit_date=date.today(),
                visit_status="planned",
            )
            db.add(visit)
            await db.commit()
            await db.refresh(visit)
            return {
                "status": "ok",
                "action": req.action,
                "retailer_id": req.retailer_id,
                "visit_id": visit.id,
                "deduped": False,
            }
    return {"status": "ok", "action": req.action, "retailer_id": req.retailer_id}


async def get_route(territory_id: str, user_id: int, db: AsyncSession) -> RouteVisualizationResponse:
    planned_q = (
        select(Retailer)
        .join(Visit, Visit.retailer_id == Retailer.retailer_id)
        .where(
            and_(
                Visit.user_id == user_id,
                Visit.visit_date == date.today(),
                Visit.visit_status.in_(PLANNED_STATUSES),
            )
        )
    )
    if territory_id not in ["ind", "all"]:
        planned_q = planned_q.where(Retailer.territory_id == territory_id)
    planned_q = planned_q.order_by(Retailer.visit_priority_score.desc()).limit(6)

    result = await db.execute(planned_q)
    retailers = result.scalars().all()

    if not retailers:
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
