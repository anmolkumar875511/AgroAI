from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user, check_territory_access
from app.models.models import VisitFeedback, Visit, Retailer
from app.schemas.schemas import VisitFeedbackRequest, VisitFeedbackResponse

router = APIRouter()

ACTIVE_VISIT_STATUSES = ["planned", "in_progress"]


@router.post("/submit/{territory_id}", response_model=VisitFeedbackResponse)
async def submit_feedback(
    territory_id: str,
    req: VisitFeedbackRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    check_territory_access(current_user, territory_id)
    
    fb = VisitFeedback(
        territory_id=territory_id,
        retailer_id=req.retailer_id,
        visit_status=req.visit_status,
        products_discussed=req.products_discussed,
        order_placed=req.order_placed,
        order_quantity=req.order_quantity,
        order_value=req.order_value,
        farmer_response=req.farmer_response,
        follow_up_needed=req.follow_up_needed,
        next_follow_up_date=req.next_follow_up_date,
        competitor_issue=req.competitor_issue,
        notes=req.notes,
    )
    db.add(fb)
    
    # 1. Update Retailer last visit metadata and stock status
    retailer_res = await db.execute(
        select(Retailer).where(Retailer.retailer_id == req.retailer_id)
    )
    retailer = retailer_res.scalar_one_or_none()
    if retailer:
        retailer.last_visit_days = 0
        retailer.last_visit_date = date.today().isoformat()
        if req.order_placed:
            retailer.total_stock_qty += req.order_quantity
            # Recalculate stock_status
            if retailer.total_stock_qty <= 0:
                retailer.total_stock_qty = 0
                retailer.stock_status = "Out of Stock"
            elif retailer.total_stock_qty <= 100:
                retailer.stock_status = "Low Stock"
            else:
                retailer.stock_status = "Good Stock"

    # 2. Close the planned/in-progress visit for this retailer today, preserving outcome status
    visit_res = await db.execute(
        select(Visit).where(
            Visit.user_id == current_user.id,
            Visit.retailer_id == req.retailer_id,
            Visit.visit_date == date.today(),
            Visit.visit_status.in_(ACTIVE_VISIT_STATUSES)
        ).order_by(Visit.created_at.desc())
    )
    visit = visit_res.scalars().first()
    if visit:
        visit.visit_status = req.visit_status
        visit.order_placed = req.order_placed
        visit.order_quantity = req.order_quantity
        visit.order_value = req.order_value
    else:
        # If no active planned visit exists, insert a new Visit record with the actual outcome
        visit = Visit(
            user_id=current_user.id,
            retailer_id=req.retailer_id,
            territory_id=territory_id,
            visit_date=date.today(),
            visit_status=req.visit_status,
            order_placed=req.order_placed,
            order_value=req.order_value,
            order_quantity=req.order_quantity,
        )
        db.add(visit)

    await db.commit()
    await db.refresh(fb)
    
    # Invalidate dashboard cache
    try:
        from app.core.redis import cache_delete
        await cache_delete(f"dashboard:data:{territory_id}")
        await cache_delete("dashboard:data:ind")
        await cache_delete("dashboard:data:all")
    except Exception:
        pass

    return fb
