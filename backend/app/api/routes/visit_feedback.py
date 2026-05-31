from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import VisitFeedback
from app.schemas.schemas import VisitFeedbackRequest, VisitFeedbackResponse

router = APIRouter()


@router.post("/submit/{territory_id}", response_model=VisitFeedbackResponse)
async def submit_feedback(
    territory_id: str,
    req: VisitFeedbackRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
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
    await db.commit()
    await db.refresh(fb)
    return fb
