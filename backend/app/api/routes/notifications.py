from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import NotificationsResponse
from app.services.notifications_service import get_notifications, mark_read, mark_all_read

router = APIRouter()


@router.get("/", response_model=NotificationsResponse)
async def notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await get_notifications(current_user.id, unread_only, limit, db)


@router.patch("/{notif_id}/read")
async def read_one(notif_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    await mark_read(notif_id, current_user.id, db)
    return {"status": "ok"}


@router.patch("/mark-all-read")
async def read_all(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    await mark_all_read(current_user.id, db)
    return {"status": "ok"}
