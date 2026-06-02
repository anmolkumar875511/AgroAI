"""Retailers service — list, filter, ML rescore."""
import random
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.models.models import Retailer
from app.schemas.schemas import RetailerCard, RetailerListResponse, RescoreResponse


async def list_retailers(
    territory_id: str,
    priority: Optional[str],
    stock: Optional[str],
    search: Optional[str],
    skip: int,
    limit: int,
    db: AsyncSession,
) -> RetailerListResponse:
    conditions = []
    if territory_id not in ["ind", "all"]:
        conditions.append(Retailer.territory_id == territory_id)
    if priority:
        conditions.append(Retailer.priority_level == priority)
    if stock:
        conditions.append(Retailer.stock_status == stock)
    if search:
        conditions.append(
            or_(
                Retailer.retailer_id.ilike(f"%{search}%"),
                Retailer.name.ilike(f"%{search}%"),
                Retailer.location.ilike(f"%{search}%"),
                Retailer.recommended_product.ilike(f"%{search}%"),
            )
        )

    count_q = select(func.count()).select_from(Retailer).where(and_(*conditions))
    total = (await db.execute(count_q)).scalar() or 0

    q = (
        select(Retailer)
        .where(and_(*conditions))
        .order_by(Retailer.visit_priority_score.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(q)
    retailers = result.scalars().all()

    return RetailerListResponse(
        retailers=[RetailerCard.model_validate(r) for r in retailers],
        total=total,
        skip=skip,
        limit=limit,
    )


async def rescore_retailer(retailer_id: str, db: AsyncSession) -> RescoreResponse:
    """Simulate ML model re-scoring."""
    result = await db.execute(select(Retailer).where(Retailer.retailer_id == retailer_id))
    r = result.scalar_one_or_none()
    if not r:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Retailer not found")

    # Simulate ML rescore
    new_score = round(r.visit_priority_score * random.uniform(0.9, 1.1), 1)
    new_score = max(10.0, min(100.0, new_score))
    priority = "High" if new_score >= 70 else ("Medium" if new_score >= 45 else "Low")

    r.visit_priority_score = new_score
    r.priority_level = priority
    await db.commit()

    return RescoreResponse(retailer_id=retailer_id, new_score=new_score, priority_level=priority)
