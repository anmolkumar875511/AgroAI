from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, check_territory_access
from app.schemas.schemas import GrowerSummary, GrowerClustersResponse
from app.services.growers_service import get_summary, get_clusters

router = APIRouter()


@router.get("/summary/{territory_id}", response_model=GrowerSummary)
async def summary(
    territory_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    check_territory_access(current_user, territory_id)
    return await get_summary(territory_id, db)


@router.get("/clusters", response_model=GrowerClustersResponse)
async def clusters(
    territory_id: str = Query(...),
    crop: Optional[str] = Query(None),
    urgency: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    check_territory_access(current_user, territory_id)
    return await get_clusters(territory_id, crop, urgency, db)
