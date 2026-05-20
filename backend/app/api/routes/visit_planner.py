from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.core.database import get_collection
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/", summary="Get priority visits based on real ML scores")
async def get_priority_visits(
    territory_id: str = Query(default="TER_0001"),
    filter: str = Query(default="all"),
    current_user: dict = Depends(get_current_user),
):
    retailers = get_collection("retailers")
    
    # Query real retailers, sort by the highest visit_priority_score
    query = {"territory_id": territory_id}
    if filter != "all":
        query["priority_level"] = filter.capitalize()
        
    cursor = retailers.find(query).sort("visit_priority_score", -1).limit(10)
    
    visits = []
    async for doc in cursor:
        visits.append({
            "id": f"visit_{doc['retailer_id']}",
            "retailer_id": doc["retailer_id"],
            "name": f"Retailer {doc['retailer_id']}", # Replace with actual name if your CSV has one
            "type": "retailer",
            "score": int(doc.get("visit_priority_score", 50)),
            "location": f"{doc.get('tehsil', '')}, {doc.get('district', '')}",
            "last_visit": doc.get("last_visit_date", "Never"),
            "status": "pending",
            "tags": [
                {"label": doc.get("priority_level", "Medium"), "color": "red" if doc.get("priority_level") == "High" else "blue"},
                {"label": doc.get("stock_status", "Unknown"), "color": "yellow"}
            ],
            "ai_reason": doc.get("explanation", "Routine visit recommended."),
            "actions": ["Check Inventory", "Log Order"]
        })
        
    return visits