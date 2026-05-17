from datetime import datetime
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from app.core.security import get_current_user
from app.core.database import get_collection
from bson import ObjectId

router = APIRouter()


@router.get("/", summary="Get all notifications for the current user")
async def get_notifications(
    unread_only: bool = Query(default=False),
    limit: int = Query(default=30, le=100),
    current_user: dict = Depends(get_current_user),
):
    notifications = get_collection("notifications")
    query: dict = {"user_id": current_user["sub"]}
    if unread_only:
        query["read"] = False

    results = []
    async for doc in notifications.find(query, sort=[("created_at", -1)], limit=limit):
        results.append({
            "id": str(doc["_id"]),
            "title": doc.get("title", ""),
            "message": doc.get("message", ""),
            "type": doc.get("type", "info"),
            "read": doc.get("read", False),
            "time": _humanize(doc.get("created_at")),
            "created_at": doc.get("created_at", "").isoformat() if doc.get("created_at") else "",
        })

    unread_count = await notifications.count_documents({"user_id": current_user["sub"], "read": False})
    return {"notifications": results, "unread_count": unread_count}


@router.patch("/{notification_id}/read", summary="Mark a notification as read")
async def mark_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    notifications = get_collection("notifications")
    await notifications.update_one(
        {"_id": ObjectId(notification_id), "user_id": current_user["sub"]},
        {"$set": {"read": True}},
    )
    return {"success": True}


@router.patch("/read-all", summary="Mark all notifications as read")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    notifications = get_collection("notifications")
    result = await notifications.update_many(
        {"user_id": current_user["sub"], "read": False},
        {"$set": {"read": True}},
    )
    return {"success": True, "updated": result.modified_count}


def _humanize(dt: datetime) -> str:
    if not dt:
        return "Just now"
    diff = (datetime.utcnow() - dt).total_seconds()
    if diff < 60:
        return "Just now"
    elif diff < 3600:
        return f"{int(diff//60)}m ago"
    elif diff < 86400:
        return f"{int(diff//3600)}h ago"
    else:
        return f"{int(diff//86400)}d ago"
