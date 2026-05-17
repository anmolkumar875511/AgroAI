from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.services.mandi_service import get_mandi_prices

router = APIRouter()


@router.get("/", summary="Get today's mandi (market) prices")
async def mandi_prices(
    state: str = Query(default="Bihar"),
    current_user: dict = Depends(get_current_user),
):
    return await get_mandi_prices(state)
