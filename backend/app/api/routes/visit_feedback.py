from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_user
from app.core.database import get_collection
from bson import ObjectId

router = APIRouter()


class VisitFeedbackRequest(BaseModel):
    retailer_id: str
    visit_status: str           # completed | no_purchase | follow_up_needed | skipped
    products_discussed: List[str] = []
    order_placed: bool = False
    order_quantity: float = 0
    order_value: float = 0
    farmer_response: str = ""   # positive | neutral | negative
    follow_up_needed: bool = False
    next_follow_up_date: Optional[str] = None
    competitor_issue: str = ""
    notes: str = ""


class VisitFeedbackResponse(BaseModel):
    success: bool
    visit_log_id: str
    message: str


@router.post("/", response_model=VisitFeedbackResponse, summary="Submit visit feedback / update")
async def submit_feedback(
    data: VisitFeedbackRequest,
    territory_id: str = Query(default="T001"),
    current_user: dict = Depends(get_current_user),
):
    """
    Records the outcome of a field visit. Used for outcome learning
    to improve future recommendations.
    """
    visit_logs = get_collection("visit_logs")
    retailers = get_collection("retailers")

    # Update retailer's last visit info
    update_fields: dict = {
        "last_visit_date": datetime.utcnow(),
        "last_visit_days": 0,
        "updated_at": datetime.utcnow(),
    }

    # If order was placed, bump sales metrics slightly for next ML run
    if data.order_placed and data.order_quantity > 0:
        update_fields["$inc"] = {
            "sales_qty_7": data.order_quantity,
            "sales_value_7": data.order_value,
            "transactions_7": 1,
        }

    await retailers.update_one(
        {"retailer_id": data.retailer_id},
        {"$set": update_fields},
    )

    # Create detailed visit log
    log_doc = {
        "retailer_id": data.retailer_id,
        "territory_id": territory_id,
        "agent_id": current_user["sub"],
        "visit_date": datetime.utcnow(),
        "status": data.visit_status,
        "products_discussed": data.products_discussed,
        "order_placed": data.order_placed,
        "order_quantity": data.order_quantity,
        "order_value": data.order_value,
        "revenue_generated": data.order_value,
        "farmer_response": data.farmer_response,
        "follow_up_needed": data.follow_up_needed,
        "next_follow_up_date": data.next_follow_up_date,
        "competitor_issue": data.competitor_issue,
        "notes": data.notes,
        "outcome": data.visit_status,
        "created_at": datetime.utcnow(),
    }

    result = await visit_logs.insert_one(log_doc)

    # If follow-up is needed, create a notification
    if data.follow_up_needed:
        notifications = get_collection("notifications")
        await notifications.insert_one({
            "user_id": current_user["sub"],
            "title": f"Follow-up: {data.retailer_id}",
            "message": f"Follow-up required for retailer {data.retailer_id}. "
                       f"Date: {data.next_follow_up_date or 'ASAP'}. Notes: {data.notes[:100]}",
            "type": "warning",
            "read": False,
            "created_at": datetime.utcnow(),
        })

    return {
        "success": True,
        "visit_log_id": str(result.inserted_id),
        "message": f"Visit outcome recorded. {'Follow-up reminder created.' if data.follow_up_needed else ''}",
    }


@router.get("/history", summary="Get visit history for a retailer")
async def visit_history(
    retailer_id: str = Query(...),
    limit: int = Query(default=10, le=50),
    current_user: dict = Depends(get_current_user),
):
    visit_logs = get_collection("visit_logs")
    history = []
    async for doc in visit_logs.find(
        {"retailer_id": retailer_id},
        sort=[("visit_date", -1)],
        limit=limit,
    ):
        history.append({
            "id": str(doc["_id"]),
            "visit_date": doc.get("visit_date", "").isoformat() if doc.get("visit_date") else "",
            "status": doc.get("status", ""),
            "products_discussed": doc.get("products_discussed", []),
            "order_placed": doc.get("order_placed", False),
            "order_value": doc.get("order_value", 0),
            "farmer_response": doc.get("farmer_response", ""),
            "follow_up_needed": doc.get("follow_up_needed", False),
            "notes": doc.get("notes", ""),
            "agent_id": doc.get("agent_id", ""),
        })
    return {"retailer_id": retailer_id, "history": history}
