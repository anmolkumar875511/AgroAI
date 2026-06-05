from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, check_territory_access
from app.schemas.schemas import AnalyticsResponse
from app.services.analytics_service import get_analytics

router = APIRouter()


@router.get("/{territory_id}", response_model=AnalyticsResponse)
async def analytics(
    territory_id: str,
    date_range: str = Query("14d"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    check_territory_access(current_user, territory_id)
    return await get_analytics(territory_id, date_range, db)
