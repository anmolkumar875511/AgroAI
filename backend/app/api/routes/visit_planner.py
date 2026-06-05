from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, check_territory_access
from app.schemas.schemas import VisitPlannerItem, VisitActionRequest, RouteVisualizationResponse
from app.services.visit_service import get_priority_visits, record_action, get_route
from typing import List

router = APIRouter()


@router.get("/priority/{territory_id}", response_model=List[VisitPlannerItem])
async def priority_visits(
    territory_id: str,
    filter: str = Query("all"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    check_territory_access(current_user, territory_id)
    return await get_priority_visits(territory_id, filter, db)


@router.post("/action/{territory_id}")
async def action(
    territory_id: str,
    req: VisitActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    check_territory_access(current_user, territory_id)
    res = await record_action(req, territory_id, current_user.id, db)
    
    # Invalidate dashboard cache
    try:
        from app.core.redis import cache_delete
        await cache_delete(f"dashboard:data:{territory_id}")
        await cache_delete("dashboard:data:ind")
        await cache_delete("dashboard:data:all")
    except Exception:
        pass
        
    return res


@router.get("/route/{territory_id}", response_model=RouteVisualizationResponse)
async def route(
    territory_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    check_territory_access(current_user, territory_id)
    return await get_route(territory_id, current_user.id, db)
