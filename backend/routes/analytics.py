from fastapi import APIRouter
from services.data_service import data_service

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/revenue")
async def get_revenue_trends():
    return await data_service.get_analytics_data("revenue")