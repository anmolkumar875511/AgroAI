from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.services.dashboard_service import (
    get_kpis,
    get_weekly_performance,
    get_notifications_count,
)
from app.services.mandi_service import get_mandi_prices

router = APIRouter()


@router.get("/", summary="Full dashboard data in one call")
async def dashboard(
    territory_id: str = Query(default="T001"),
    current_user: dict = Depends(get_current_user),
):
    kpis = await get_kpis(territory_id)
    weekly = await get_weekly_performance(territory_id)
    notif_count = await get_notifications_count(current_user["sub"])
    mandi = await get_mandi_prices()

    return {
        "kpis": kpis,
        "weekly_performance": weekly,
        "notifications_count": notif_count,
        "mandi_prices": mandi[:4],  # top 4 for the dashboard widget
    }


@router.get("/kpis", summary="KPI cards only")
async def kpis(
    territory_id: str = Query(default="T001"),
    current_user: dict = Depends(get_current_user),
):
    return await get_kpis(territory_id)


@router.get("/weekly-performance", summary="Weekly performance chart data")
async def weekly_performance(
    territory_id: str = Query(default="T001"),
    current_user: dict = Depends(get_current_user),
):
    return await get_weekly_performance(territory_id)
