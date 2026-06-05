from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, check_territory_access
from app.schemas.schemas import DashboardResponse
from app.services.dashboard_service import get_dashboard

import json
from app.core.redis import cache_get, cache_set

router = APIRouter()


@router.get("/{territory_id}", response_model=DashboardResponse)
async def dashboard(
    territory_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    check_territory_access(current_user, territory_id)
    
    cache_key = f"dashboard:data:{territory_id}"
    cached = await cache_get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass
            
    res = await get_dashboard(territory_id, db)
    
    try:
        await cache_set(cache_key, res.model_dump_json(), expire=300)
    except Exception:
        pass
        
    return res
