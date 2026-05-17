from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.services.analytics_service import get_analytics

router = APIRouter()


@router.get("/", summary="Full analytics data for all 6 charts")
async def analytics(
    territory_id: str = Query(default="T001"),
    date_range: str = Query(default="14d"),  # 7d | 14d | 30d | 90d
    current_user: dict = Depends(get_current_user),
):
    return await get_analytics(territory_id, date_range)
