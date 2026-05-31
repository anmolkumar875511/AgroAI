from fastapi import APIRouter, Depends, Query
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import RecommendationItem, ApplyRecommendationRequest
from app.services.recommendations_service import get_recommendations, apply_recommendation

router = APIRouter()


@router.get("/{territory_id}", response_model=List[RecommendationItem])
async def recommendations(
    territory_id: str,
    limit: int = Query(20),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await get_recommendations(territory_id, limit, db)


@router.post("/apply", response_model=dict)
async def apply(
    req: ApplyRecommendationRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await apply_recommendation(req, db)
