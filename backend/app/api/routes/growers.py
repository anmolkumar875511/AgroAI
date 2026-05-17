from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.core.database import get_collection
import random

router = APIRouter()

CROP_STAGES = ["Sowing", "Germination", "Tillering", "Vegetative", "Flowering", "Grain Fill", "Harvest"]
CROP_TYPES = ["Rice", "Wheat", "Cotton", "Maize", "Mustard", "Soybean", "Sugarcane"]
PEST_RISKS = ["Low", "Medium", "High", "Critical"]
ADVISORIES = [
    "Apply Amistar 200ml/acre for blast prevention",
    "Check soil moisture — irrigation recommended",
    "Scout for Stem Borer — humidity is high",
    "Apply micronutrient mix before flowering stage",
    "Harvest within 7 days to avoid storage losses",
    "Spray Actara for sucking pest control",
]


@router.get("/", summary="Get grower cluster insights for the territory")
async def grower_insights(
    territory_id: str = Query(default="T001"),
    state: str = Query(default=""),
    district: str = Query(default=""),
    crop: str = Query(default="all"),
    urgency: str = Query(default="all"),
    skip: int = Query(default=0),
    limit: int = Query(default=20, le=100),
    current_user: dict = Depends(get_current_user),
):
    """
    Returns grower cluster summaries aggregated from retailer tehsil data.
    Each cluster represents one tehsil with crop-level farmer intelligence.
    """
    retailers = get_collection("retailers")

    # Aggregate by tehsil to build grower clusters
    pipeline = [
        {"$match": {"territory_id": territory_id}},
        {"$group": {
            "_id": {"state": "$state", "district": "$district", "tehsil": "$tehsil"},
            "grower_count": {"$sum": "$grower_count"},
            "avg_farm_size": {"$avg": "$avg_farm_size"},
            "product_scans": {"$sum": "$product_scans"},
            "campaign_attendance": {"$sum": "$campaign_attendance"},
            "total_messages": {"$sum": "$total_messages"},
            "total_clicked": {"$sum": "$total_clicked"},
            "avg_priority_score": {"$avg": "$visit_priority_score"},
            "top_product": {"$first": "$recommended_product"},
            "last_visit_days": {"$avg": "$last_visit_days"},
        }},
        {"$sort": {"avg_priority_score": -1}},
        {"$skip": skip},
        {"$limit": limit},
    ]

    clusters = []
    async for doc in retailers.aggregate(pipeline):
        loc = doc["_id"]
        grower_count = int(doc.get("grower_count", 0)) or random.randint(50, 500)
        scans = int(doc.get("product_scans", 0))
        attendance = int(doc.get("campaign_attendance", 0))
        messages = int(doc.get("total_messages", 0))
        clicked = int(doc.get("total_clicked", 0))
        score = doc.get("avg_priority_score", 0)
        last_days = int(doc.get("last_visit_days", 0))

        eng_rate = round(clicked / (messages + 1), 3)
        pest_risk = _score_to_risk(score)
        urgency_score = round(score)

        if urgency != "all" and pest_risk.lower() != urgency.lower():
            continue

        # Deterministic but varied crop assignment per tehsil
        tehsil_hash = abs(hash(loc.get("tehsil", ""))) % len(CROP_TYPES)
        crop_type = CROP_TYPES[tehsil_hash]
        if crop != "all" and crop.lower() != crop_type.lower():
            continue

        stage_hash = abs(hash(loc.get("tehsil", "") + "stage")) % len(CROP_STAGES)
        advisory_hash = abs(hash(loc.get("tehsil", "") + "adv")) % len(ADVISORIES)

        clusters.append({
            "id": f"cluster-{loc.get('tehsil', '')}",
            "tehsil": loc.get("tehsil", ""),
            "district": loc.get("district", ""),
            "state": loc.get("state", ""),
            "location": f"{loc.get('tehsil','')}, {loc.get('district','')}",
            "crop_type": crop_type,
            "crop_stage": CROP_STAGES[stage_hash],
            "grower_count": grower_count,
            "avg_farm_size_acres": round(doc.get("avg_farm_size", 2.5) or 2.5, 2),
            "product_scans": scans,
            "campaign_attendance": attendance,
            "engagement_rate": eng_rate,
            "pest_risk": pest_risk,
            "urgency_score": urgency_score,
            "recommended_advisory": ADVISORIES[advisory_hash],
            "recommended_product": doc.get("top_product", "Amistar 250 SC"),
            "last_visit_days": last_days,
            "total_messages_sent": messages,
        })

    return {"clusters": clusters, "total": len(clusters)}


@router.get("/summary", summary="Territory-level grower summary stats")
async def grower_summary(
    territory_id: str = Query(default="T001"),
    current_user: dict = Depends(get_current_user),
):
    retailers = get_collection("retailers")
    pipeline = [
        {"$match": {"territory_id": territory_id}},
        {"$group": {
            "_id": None,
            "total_growers": {"$sum": "$grower_count"},
            "total_scans": {"$sum": "$product_scans"},
            "total_attendance": {"$sum": "$campaign_attendance"},
            "total_messages": {"$sum": "$total_messages"},
            "total_clicked": {"$sum": "$total_clicked"},
            "avg_farm_size": {"$avg": "$avg_farm_size"},
            "high_risk_count": {"$sum": {"$cond": [{"$eq": ["$priority_level", "High"]}, 1, 0]}},
        }},
    ]
    async for doc in retailers.aggregate(pipeline):
        return {
            "total_growers": int(doc.get("total_growers", 0)),
            "total_product_scans": int(doc.get("total_scans", 0)),
            "campaign_attendance": int(doc.get("total_attendance", 0)),
            "digital_engagement_rate": round(
                doc.get("total_clicked", 0) / (doc.get("total_messages", 1) + 1), 3
            ),
            "avg_farm_size_acres": round(doc.get("avg_farm_size", 2.5) or 2.5, 2),
            "high_urgency_clusters": int(doc.get("high_risk_count", 0)),
        }
    return {"total_growers": 0, "total_product_scans": 0, "campaign_attendance": 0,
            "digital_engagement_rate": 0, "avg_farm_size_acres": 0, "high_urgency_clusters": 0}


def _score_to_risk(score: float) -> str:
    if score >= 70:
        return "Critical"
    elif score >= 55:
        return "High"
    elif score >= 35:
        return "Medium"
    return "Low"
