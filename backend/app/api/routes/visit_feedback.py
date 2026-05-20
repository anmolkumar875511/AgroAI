from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from datetime import datetime
from app.core.security import get_current_user
from app.core.database import get_collection

router = APIRouter()

class VisitFeedback(BaseModel):
    retailer_id: str
    visit_status: str
    products_discussed: list[str]
    order_placed: bool
    order_quantity: float
    order_value: float
    farmer_response: str
    follow_up_needed: bool
    next_follow_up_date: str = ""
    competitor_issue: str = ""
    notes: str = ""

@router.post("/", summary="Submit real visit feedback")
async def submit_feedback(
    data: VisitFeedback,
    territory_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    visit_logs = get_collection("visit_logs")
    retailers = get_collection("retailers")
    
    now = datetime.utcnow()
    
    # 1. Save the visit log to the database
    log_doc = data.dict()
    log_doc["territory_id"] = territory_id
    log_doc["agent_id"] = current_user["_id"]
    log_doc["created_at"] = now
    
    result = await visit_logs.insert_one(log_doc)
    
    # 2. Update the Retailer's profile in the database
    update_data = {
        "last_visit_date": now.strftime("%Y-%m-%d"),
        "last_visit_days": 0 # Reset the days since last visit
    }
    
    # If they placed an order, positively impact their 7-day sales
    if data.order_placed:
        await retailers.update_one(
            {"retailer_id": data.retailer_id},
            {
                "$set": update_data,
                "$inc": {
                    "sales_value_7": data.order_value,
                    "sales_qty_7": data.order_quantity,
                    "transactions_7": 1
                }
            }
        )
    else:
        await retailers.update_one(
            {"retailer_id": data.retailer_id},
            {"$set": update_data}
        )

    return {
        "success": True, 
        "visit_log_id": str(result.inserted_id),
        "message": "Visit logged and retailer metrics updated."
    }