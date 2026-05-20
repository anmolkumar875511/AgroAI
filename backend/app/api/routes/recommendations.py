from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.core.database import get_collection
from typing import List

router = APIRouter()

@router.get("/", summary="Get AI Recommendations with Explainability")
async def get_recommendations(
    territory_id: str = Query(default="TER_0001"),
    limit: int = Query(default=10),
    current_user: dict = Depends(get_current_user),
):
    recs_col = get_collection("recommendations")
    feat_col = get_collection("feature_importance")
    
    # Fetch recommendations for this territory
    cursor = recs_col.find({"territory_id": territory_id}).limit(limit)
    
    recommendations = []
    async for doc in cursor:
        rec_id = doc.get("recommendation_id", str(doc["_id"]))
        retailer_id = doc.get("retailer_id", "")
        
        # Fetch the Explainable AI reasons for this specific recommendation/retailer
        reasons_cursor = feat_col.find({"retailer_id": retailer_id}).limit(3)
        explainable_reasons = []
        
        async for feat in reasons_cursor:
            explainable_reasons.append({
                "id": str(feat["_id"]),
                "title": feat.get("feature_name", "Demand Spike").replace("_", " ").title(),
                "description": f"Impact score: {feat.get('importance_score', 0)}",
                "icon": "TrendingUp" if float(feat.get('importance_score', 0)) > 0 else "AlertCircle"
            })
            
        # Fallback reasons if feature_importance table is empty for this row
        if not explainable_reasons:
            explainable_reasons = [
                {"id": "r1", "title": "High Historical Sales", "description": "Retailer performs well in this season", "icon": "TrendingUp"}
            ]

        recommendations.append({
            "id": rec_id,
            "retailer_id": retailer_id,
            "priority": doc.get("priority", "Medium").lower(),
            "crop": doc.get("crop", "General"),
            "message": doc.get("message", "Routine checkup advised."),
            "weather": doc.get("weather_context", "Clear skies"),
            "product": doc.get("recommended_product", "Standard Stock"),
            "village": doc.get("village", "Local"),
            "farmer": doc.get("top_farmer", ""),
            "pest_risk": doc.get("pest_risk", "Low"),
            "next_action": doc.get("next_action", "Visit Store"),
            "follow_up_timeline": ["Day 1: Call", "Day 3: Visit"],
            "explainable_reasons": explainable_reasons
        })
        
    return recommendations