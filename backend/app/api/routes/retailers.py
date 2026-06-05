from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import RetailerListResponse, RescoreResponse
from app.services.retailers_service import list_retailers, rescore_retailer
from app.core.limiter import rescore_limiter

router = APIRouter()


@router.get("/", response_model=RetailerListResponse)
async def get_retailers(
    territory_id: str = Query(...),
    priority: Optional[str] = Query(None),
    stock: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(12),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await list_retailers(territory_id, priority, stock, search, skip, limit, db)


@router.post("/{retailer_id}/rescore", response_model=RescoreResponse, dependencies=[Depends(rescore_limiter)])
async def rescore(
    retailer_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await rescore_retailer(retailer_id, db)
