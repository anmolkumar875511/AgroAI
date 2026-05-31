"""Growers service — cluster intelligence."""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.models import Grower
from app.schemas.schemas import GrowerCluster, GrowerSummary, GrowerClustersResponse


async def get_summary(territory_id: str, db: AsyncSession) -> GrowerSummary:
    q = select(
        func.sum(Grower.grower_count),
        func.sum(Grower.product_scans),
        func.avg(Grower.engagement_rate),
        func.count(),
    ).where(Grower.territory_id == territory_id)
    row = (await db.execute(q)).one()

    q2 = select(func.count()).select_from(Grower).where(
        and_(Grower.territory_id == territory_id, Grower.pest_risk.in_(["Critical", "High"]))
    )
    high_urgency = (await db.execute(q2)).scalar() or 0

    return GrowerSummary(
        total_growers=int(row[0] or 0),
        total_product_scans=int(row[1] or 0),
        campaign_attendance=int((row[0] or 0) * 0.35),
        avg_farm_size_acres=round(3.2 + (hash(territory_id) % 30) / 10, 1),
        digital_engagement_rate=round(float(row[2] or 0.5), 2),
        high_urgency_clusters=high_urgency,
    )


async def get_clusters(
    territory_id: str,
    crop: Optional[str],
    urgency: Optional[str],
    db: AsyncSession,
) -> GrowerClustersResponse:
    conditions = [Grower.territory_id == territory_id]
    if crop:
        conditions.append(Grower.crop_type == crop)
    if urgency:
        conditions.append(Grower.pest_risk == urgency)

    q = select(Grower).where(and_(*conditions)).order_by(Grower.urgency_score.desc())
    result = await db.execute(q)
    clusters = result.scalars().all()

    count_q = select(func.count()).select_from(Grower).where(and_(*conditions))
    total = (await db.execute(count_q)).scalar() or 0

    return GrowerClustersResponse(
        clusters=[GrowerCluster.model_validate(c) for c in clusters],
        total=total,
    )
