"""Notifications service."""
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.models.models import Notification
from app.schemas.schemas import NotificationItem, NotificationsResponse


def _humanize(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "Just now"
    if seconds < 3600:
        return f"{seconds // 60} min{'s' if seconds // 60 > 1 else ''} ago"
    if seconds < 86400:
        return f"{seconds // 3600} hr{'s' if seconds // 3600 > 1 else ''} ago"
    return f"{seconds // 86400} day{'s' if seconds // 86400 > 1 else ''} ago"


async def get_notifications(user_id: int, unread_only: bool, limit: int, db: AsyncSession) -> NotificationsResponse:
    q = select(Notification).where(Notification.user_id == user_id)
    if unread_only:
        q = q.where(Notification.read == False)
    q = q.order_by(Notification.created_at.desc()).limit(limit)

    result = await db.execute(q)
    notifs = result.scalars().all()

    count_q = select(func.count()).select_from(Notification).where(
        Notification.user_id == user_id, Notification.read == False
    )
    unread_count = (await db.execute(count_q)).scalar() or 0

    items = [
        NotificationItem(
            id=n.id, title=n.title, message=n.message,
            type=n.type, read=n.read, time=_humanize(n.created_at),
        )
        for n in notifs
    ]
    return NotificationsResponse(notifications=items, unread_count=unread_count)


async def mark_read(notif_id: int, user_id: int, db: AsyncSession):
    await db.execute(
        update(Notification)
        .where(Notification.id == notif_id, Notification.user_id == user_id)
        .values(read=True)
    )
    await db.commit()


async def mark_all_read(user_id: int, db: AsyncSession):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user_id)
        .values(read=True)
    )
    await db.commit()
