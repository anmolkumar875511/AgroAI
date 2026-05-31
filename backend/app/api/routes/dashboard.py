from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import DashboardResponse
from app.services.dashboard_service import get_dashboard

router = APIRouter()


@router.get("/{territory_id}", response_model=DashboardResponse)
async def dashboard(
    territory_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await get_dashboard(territory_id, db)
