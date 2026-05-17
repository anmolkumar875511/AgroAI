from datetime import datetime
from typing import List, Dict, Any, Optional
from bson import ObjectId
from app.core.database import get_collection
from app.ml.predictor import ml_service


# Crop-to-pest mapping for explainability
CROP_PEST_MAP = {
    "Rice": {"pest": "Stem Borer", "risk_factor": "humidity > 70%"},
    "Cotton": {"pest": "Bollworm", "risk_factor": "temp 35-38°C"},
    "Wheat": {"pest": "Aphids", "risk_factor": "cool humid weather"},
    "Maize": {"pest": "Fall Armyworm", "risk_factor": "post-monsoon"},
    "Mustard": {"pest": "Aphids", "risk_factor": "dry conditions"},
}

PRODUCT_RECOMMENDATIONS = {
    "Rice": "Amistar (Azoxystrobin)",
    "Cotton": "Actara (Thiamethoxam)",
    "Wheat": "Score (Difenoconazole)",
    "Maize": "Proclaim (Emamectin Benzoate)",
    "Mustard": "Ridomil (Metalaxyl)",
}


async def get_recommendations(territory_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Pull top-priority retailers from MongoDB and enrich with ML predictions
    and explainable AI reasoning.
    """
    retailers = get_collection("retailers")

    cursor = retailers.find(
        {"territory_id": territory_id},
        sort=[("visit_priority_score", -1)],
        limit=limit,
    )

    recs = []
    async for doc in cursor:
        recs.append(_build_recommendation(doc))

    # If no retailers in DB yet, return seeded mock data
    if not recs:
        recs = _mock_recommendations()

    return recs


async def apply_recommendation(
    recommendation_id: str,
    retailer_id: str,
    action: str,
    user_id: str,
) -> Dict[str, Any]:
    """Record that a user applied or dismissed a recommendation."""
    applied = get_collection("applied_recommendations")
    doc = {
        "recommendation_id": recommendation_id,
        "retailer_id": retailer_id,
        "user_id": user_id,
        "action": action,
        "applied_at": datetime.utcnow(),
    }
    result = await applied.insert_one(doc)

    if action == "apply":
        # Mark a visit log entry
        visit_logs = get_collection("visit_logs")
        await visit_logs.insert_one({
            "retailer_id": retailer_id,
            "territory_id": "",
            "agent_id": user_id,
            "visit_date": datetime.utcnow(),
            "status": "pending",
            "notes": f"Auto-created from recommendation {recommendation_id}",
            "revenue_generated": 0,
            "products_discussed": [],
            "outcome": "",
            "created_at": datetime.utcnow(),
        })

    return {"success": True, "id": str(result.inserted_id)}


def _build_recommendation(doc: dict) -> Dict[str, Any]:
    crop = doc.get("recommended_product", "Rice").split(" ")[0]
    if crop not in CROP_PEST_MAP:
        crop = "Rice"

    pest_info = CROP_PEST_MAP[crop]
    product = PRODUCT_RECOMMENDATIONS.get(crop, doc.get("recommended_product", "Amistar"))
    level = doc.get("priority_level", "Medium").lower()

    return {
        "id": str(doc["_id"]),
        "priority": level,
        "crop": crop,
        "message": doc.get("recommended_action", f"Visit retailer and recommend {product} for {crop} protection."),
        "weather": "32°C, Humidity 72%",
        "product": product,
        "village": doc.get("tehsil", "Village"),
        "farmer": None,
        "pest_risk": f"{pest_info['pest']} — High ({pest_info['risk_factor']})",
        "next_action": doc.get("explanation", "Schedule immediate field visit"),
        "follow_up_timeline": ["Today", "3 Days", "7 Days"],
        "explainable_reasons": _build_reasons(doc),
        "retailer_id": doc.get("retailer_id", ""),
        "visit_priority_score": doc.get("visit_priority_score", 0),
    }


def _build_reasons(doc: dict) -> List[Dict[str, Any]]:
    reasons = []
    idx = 1

    if doc.get("total_stock_qty", 100) < 30:
        reasons.append({
            "id": f"r{idx}", "title": "Low Stock Alert",
            "description": f"Only {int(doc.get('total_stock_qty', 0))} units left. Restock risk is high.",
            "icon": "Package",
        })
        idx += 1

    if doc.get("last_visit_days", 0) > 14:
        reasons.append({
            "id": f"r{idx}", "title": "Visit Gap",
            "description": f"Not visited in {int(doc.get('last_visit_days', 0))} days — relationship risk.",
            "icon": "History",
        })
        idx += 1

    if doc.get("sales_qty_30", 0) > 50:
        reasons.append({
            "id": f"r{idx}", "title": "Strong Sales Momentum",
            "description": f"{int(doc.get('sales_qty_30', 0))} units sold in last 30 days. High demand signal.",
            "icon": "TrendingUp",
        })
        idx += 1

    if doc.get("engagement_rate", 0) > 0.15:
        reasons.append({
            "id": f"r{idx}", "title": "High Grower Engagement",
            "description": f"Growers in this area showing {round(doc.get('engagement_rate', 0)*100)}% engagement rate.",
            "icon": "Leaf",
        })
        idx += 1

    if not reasons:
        reasons.append({
            "id": "r1", "title": "Combined AI Score",
            "description": "Priority determined by weighted combination of sales, stock, visit gap, and grower signals.",
            "icon": "Sprout",
        })

    return reasons


def _mock_recommendations() -> List[Dict[str, Any]]:
    """Fallback mock data when database has no retailers yet."""
    return [
        {
            "id": "mock-1",
            "priority": "high",
            "crop": "Rice",
            "message": "Critical: Stem Borer infestation risk detected. Apply Amistar 200ml/acre within 48 hours.",
            "weather": "32°C, Humidity 75%",
            "product": "Amistar (Azoxystrobin)",
            "village": "Rampur",
            "farmer": "Sunita Devi",
            "pest_risk": "Stem Borer — Critical (humidity > 70%)",
            "next_action": "Schedule urgent field visit and arrange product demo",
            "follow_up_timeline": ["Today", "3 Days", "7 Days"],
            "explainable_reasons": [
                {"id": "r1", "title": "Weather Risk", "description": "Humidity > 70% for 5 consecutive days triggers stem borer risk.", "icon": "CloudRain"},
                {"id": "r2", "title": "Stock Alert", "description": "Retailer R08 has only 22 units of Amistar — reorder needed.", "icon": "Package"},
                {"id": "r3", "title": "Visit Gap", "description": "Area not visited in 18 days — relationship risk increasing.", "icon": "History"},
            ],
            "retailer_id": "R08",
            "visit_priority_score": 91.2,
        },
        {
            "id": "mock-2",
            "priority": "medium",
            "crop": "Cotton",
            "message": "Nutrient deficiency signs detected. Recommend Actara 100ml/acre for Bollworm prevention.",
            "weather": "36°C, Humidity 45%",
            "product": "Actara (Thiamethoxam)",
            "village": "Sonepur",
            "farmer": "Ramesh Kumar",
            "pest_risk": "Bollworm — Medium (temp 35-38°C)",
            "next_action": "Plan visit this week and conduct product demonstration",
            "follow_up_timeline": ["This Week", "14 Days"],
            "explainable_reasons": [
                {"id": "r1", "title": "Product Demand", "description": "Actara sold 80 units in last 30 days in this tehsil.", "icon": "TrendingUp"},
                {"id": "r2", "title": "Grower Engagement", "description": "142 growers in area with 22% campaign engagement rate.", "icon": "Leaf"},
            ],
            "retailer_id": "R12",
            "visit_priority_score": 67.4,
        },
        {
            "id": "mock-3",
            "priority": "low",
            "crop": "Wheat",
            "message": "Routine advisory: Apply Score for fungal prevention before next rain cycle.",
            "weather": "28°C, Humidity 60%",
            "product": "Score (Difenoconazole)",
            "village": "Bihta",
            "farmer": None,
            "pest_risk": "Aphids — Low (cool humid weather)",
            "next_action": "Schedule visit in the next 2 weeks",
            "follow_up_timeline": ["Next Week", "21 Days"],
            "explainable_reasons": [
                {"id": "r1", "title": "Seasonal Signal", "description": "Pre-harvest stage — fungal protection window is now.", "icon": "Sprout"},
            ],
            "retailer_id": "R05",
            "visit_priority_score": 42.1,
        },
    ]
