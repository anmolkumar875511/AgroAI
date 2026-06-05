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


import json
from datetime import date
from fastapi import Body
from sqlalchemy import select
from app.models.models import VisitFeedback, Visit, Retailer
from app.schemas.schemas import VisitActionRequest
from app.services.visit_service import record_action

@router.post("/sync")
async def sync_offline(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    queue = payload.get("queue", [])
    synced_count = 0
    
    for item in queue:
        path = item.get("path", "")
        body_str = item.get("body", "")
        if not body_str:
            continue
            
        try:
            body = json.loads(body_str) if isinstance(body_str, str) else body_str
        except Exception:
            continue

        if "/visit-planner/action/" in path:
            parts = path.strip("/").split("/")
            territory_id = parts[-1] if parts else ""
            
            req = VisitActionRequest(
                retailer_id=body.get("retailer_id"),
                action=body.get("action")
            )
            await record_action(req, territory_id, current_user.id, db)
            synced_count += 1
            
        elif "/visit-feedback/submit/" in path:
            parts = path.strip("/").split("/")
            territory_id = parts[-1] if parts else ""
            
            fb = VisitFeedback(
                territory_id=territory_id,
                retailer_id=body.get("retailer_id"),
                visit_status=body.get("visit_status"),
                products_discussed=body.get("products_discussed", []),
                order_placed=body.get("order_placed", False),
                order_quantity=body.get("order_quantity", 0),
                order_value=body.get("order_value", 0.0),
                farmer_response=body.get("farmer_response", "positive"),
                follow_up_needed=body.get("follow_up_needed", False),
                next_follow_up_date=body.get("next_follow_up_date"),
                competitor_issue=body.get("competitor_issue"),
                notes=body.get("notes"),
            )
            db.add(fb)
            
            retailer_res = await db.execute(
                select(Retailer).where(Retailer.retailer_id == fb.retailer_id)
            )
            retailer = retailer_res.scalar_one_or_none()
            if retailer:
                retailer.last_visit_days = 0
                retailer.last_visit_date = date.today().isoformat()
                if fb.order_placed:
                    retailer.total_stock_qty += fb.order_quantity
                    if retailer.total_stock_qty <= 0:
                        retailer.total_stock_qty = 0
                        retailer.stock_status = "Out of Stock"
                    elif retailer.total_stock_qty <= 100:
                        retailer.stock_status = "Low Stock"
                    else:
                        retailer.stock_status = "Good Stock"

            visit_res = await db.execute(
                select(Visit).where(
                    Visit.user_id == current_user.id,
                    Visit.retailer_id == fb.retailer_id,
                    Visit.visit_date == date.today(),
                    Visit.visit_status == "in_progress"
                )
            )
            visit = visit_res.scalars().first()
            if visit:
                visit.visit_status = "completed"
                visit.order_placed = fb.order_placed
                visit.order_quantity = fb.order_quantity
                visit.order_value = fb.order_value
            else:
                visit = Visit(
                    user_id=current_user.id,
                    retailer_id=fb.retailer_id,
                    territory_id=territory_id,
                    visit_date=date.today(),
                    visit_status="completed",
                    order_placed=fb.order_placed,
                    order_value=fb.order_value,
                    order_quantity=fb.order_quantity,
                )
                db.add(visit)
                
            synced_count += 1

    await db.commit()
    
    try:
        from app.core.redis import cache_delete
        await cache_delete("dashboard:data:ind")
        await cache_delete("dashboard:data:all")
        for item in queue:
            path = item.get("path", "")
            parts = path.strip("/").split("/")
            if parts:
                await cache_delete(f"dashboard:data:{parts[-1]}")
    except Exception:
        pass

    return {"status": "ok", "synced_items": synced_count, "message": f"Successfully synced {synced_count} items."}
