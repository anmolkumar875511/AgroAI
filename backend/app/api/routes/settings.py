from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.schemas import UpdateSettingsRequest
from app.services.auth_service import update_user_settings

router = APIRouter()


@router.get("/", summary="Get current user settings")
async def get_settings(current_user: dict = Depends(get_current_user)):
    from app.services.auth_service import get_user_by_id
    user = await get_user_by_id(current_user["sub"])
    return user


@router.patch("/", summary="Update user settings (theme, language, notifications, sync)")
async def update_settings(
    data: UpdateSettingsRequest,
    current_user: dict = Depends(get_current_user),
):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        return {"success": True, "message": "No changes to apply", "updated": {}}

    updated_user = await update_user_settings(current_user["sub"], updates)
    return {
        "success": True,
        "message": "Settings updated successfully",
        "updated": updates,
    }
