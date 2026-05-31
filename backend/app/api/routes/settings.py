from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import SettingsUpdateRequest, UserOut

router = APIRouter()


@router.get("/", response_model=UserOut)
async def get_settings(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/", response_model=UserOut)
async def update_settings(
    req: SettingsUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if req.theme is not None:
        current_user.theme = req.theme
    if req.language is not None:
        current_user.language = req.language
    if req.notifications is not None:
        current_user.notifications = req.notifications
    if req.sync_enabled is not None:
        current_user.sync_enabled = req.sync_enabled
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/sync")
async def sync_offline(_=Depends(get_current_user)):
    return {"status": "ok", "synced_items": 0, "message": "Offline queue cleared"}
