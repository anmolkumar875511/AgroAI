from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.schemas.schemas import VisitActionRequest
from app.services.visit_service import (
    get_priority_visits,
    get_optimized_route,
    record_visit_action,
)

router = APIRouter()


@router.get("/", summary="Get priority-ranked visits for today")
async def priority_visits(
    territory_id: str = Query(default="T001"),
    filter: str = Query(default="all"),  # all | high-risk | revenue | follow-up
    current_user: dict = Depends(get_current_user),
):
    return await get_priority_visits(territory_id, filter)


@router.get("/route", summary="Get today's optimized route with stops")
async def optimized_route(
    territory_id: str = Query(default="T001"),
    current_user: dict = Depends(get_current_user),
):
    return await get_optimized_route(territory_id)


@router.post("/action", summary="Record a visit action (start/complete/skip)")
async def visit_action(
    data: VisitActionRequest,
    territory_id: str = Query(default="T001"),
    current_user: dict = Depends(get_current_user),
):
    return await record_visit_action(
        retailer_id=data.retailer_id,
        action=data.action,
        user_id=current_user["sub"],
        territory_id=territory_id,
        notes=data.notes,
        revenue_generated=data.revenue_generated,
        products_discussed=data.products_discussed,
    )
