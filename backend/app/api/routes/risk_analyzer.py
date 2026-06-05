from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, check_territory_access
from app.schemas.schemas import RiskAnalyzerResponse
from app.services.risk_service import get_risk_data

router = APIRouter()


@router.get("/{territory_id}", response_model=RiskAnalyzerResponse)
async def risk_analyzer(
    territory_id: str,
    lat: float = Query(25.5941),
    lng: float = Query(85.1376),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    check_territory_access(current_user, territory_id)
    return await get_risk_data(territory_id, lat, lng, db)
