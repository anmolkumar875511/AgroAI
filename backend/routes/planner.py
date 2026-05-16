from fastapi import APIRouter
from services.data_service import data_service
from services.ml_service import ml_service
from models.schemas import PriorityPrediction
from typing import List

router = APIRouter(prefix="/api/planner", tags=["Visit Planner"])

@router.get("/priority", response_model=List[PriorityPrediction])
async def get_visit_priorities():
    fields = await data_service.get_all_fields()
    results = []
    
    for field in fields:
        # Predict using the ML Models
        prediction = ml_service.predict_priority(field)
        
        results.append({
            "field_id": str(field["_id"]),
            "score": prediction["score"],
            "priority": prediction["priority"],
            "ai_reason": prediction["ai_reason"]
        })
    
    # Sort by score descending
    return sorted(results, key=lambda x: x["score"], reverse=True)