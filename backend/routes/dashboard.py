from fastapi import APIRouter
from services.data_service import data_service
from models.schemas import KPIResponse
from typing import List

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/kpis", response_model=List[KPIResponse])
async def get_dashboard_kpis():
    return await data_service.get_kpis()