from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import MandiResponse, MandiPriceItem
from app.services.mandi_service import get_mandi_prices

router = APIRouter()


@router.get("/", response_model=MandiResponse)
async def mandi_prices(
    state: str = Query(None),
    limit: int = Query(10),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    rows = await get_mandi_prices(state, limit, db)

    items = [
        MandiPriceItem(
            commodity=m.commodity,
            price=m.price,
            change=m.change,
            change_pct=m.change_pct,
            mandi=m.mandi,
            state=m.state,
            unit=m.unit,
            recorded_date=m.recorded_date.isoformat(),
        )
        for m in rows
    ]

    return MandiResponse(
        prices=items,
        updated_at=datetime.now(timezone.utc).isoformat(),
    )
