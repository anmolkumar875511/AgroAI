"""Recommendations service."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.models import Recommendation
from app.schemas.schemas import RecommendationItem, ExplainableReason, ApplyRecommendationRequest


async def get_recommendations(territory_id: str, limit: int, db: AsyncSession):
    q = select(Recommendation).where(
        Recommendation.territory_id == territory_id,
        Recommendation.status == "pending",
    ).order_by(Recommendation.created_at.desc()).limit(limit)
    result = await db.execute(q)
    recs = result.scalars().all()

    out = []
    for r in recs:
        reasons = [ExplainableReason(**x) for x in (r.explainable_reasons or [])]
        out.append(RecommendationItem(
            id=r.id, territory_id=r.territory_id, priority=r.priority,
            crop=r.crop, message=r.message, weather=r.weather,
            product=r.product, village=r.village, farmer=r.farmer,
            retailer_id=r.retailer_id, pest_risk=r.pest_risk,
            next_action=r.next_action, follow_up_timeline=r.follow_up_timeline,
            status=r.status, explainable_reasons=reasons,
        ))
    return out


async def apply_recommendation(req: ApplyRecommendationRequest, db: AsyncSession):
    new_status = "applied" if req.action == "apply" else "dismissed"
    await db.execute(
        update(Recommendation)
        .where(Recommendation.id == req.recommendation_id)
        .values(status=new_status)
    )
    await db.commit()
    return {"status": new_status, "recommendation_id": req.recommendation_id}
