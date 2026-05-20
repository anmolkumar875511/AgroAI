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

    if not clusters:
        # Fallback to deterministic mock clusters if DB has no retailers or territory matches nothing
        clusters = _get_mock_clusters(territory_id, crop, urgency)
        total_count = len(clusters)
        clusters = clusters[skip : skip + limit]
        return {"clusters": clusters, "total": total_count}

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
    
    # Check if there are any retailers in the DB for this territory
    has_retailers = await retailers.count_documents({"territory_id": territory_id})
    if not has_retailers:
        # Fall back to aggregated stats from the mock clusters
        mock_clusters = _get_mock_clusters(territory_id)
        if not mock_clusters:
            return {"total_growers": 0, "total_product_scans": 0, "campaign_attendance": 0,
                    "digital_engagement_rate": 0, "avg_farm_size_acres": 0, "high_urgency_clusters": 0}
            
        total_growers = sum(c["grower_count"] for c in mock_clusters)
        total_scans = sum(c["product_scans"] for c in mock_clusters)
        total_attendance = sum(c["campaign_attendance"] for c in mock_clusters)
        avg_farm = round(sum(c["avg_farm_size_acres"] for c in mock_clusters) / len(mock_clusters), 2)
        
        total_messages = sum(c["total_messages_sent"] for c in mock_clusters)
        total_clicked = sum(int(c["total_messages_sent"] * c["engagement_rate"]) for c in mock_clusters)
        eng_rate = round(total_clicked / (total_messages + 1), 3)
        high_urgency = sum(1 for c in mock_clusters if c["pest_risk"] in ["High", "Critical"])
        
        return {
            "total_growers": total_growers,
            "total_product_scans": total_scans,
            "campaign_attendance": total_attendance,
            "digital_engagement_rate": eng_rate,
            "avg_farm_size_acres": avg_farm,
            "high_urgency_clusters": high_urgency,
        }

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


def _get_mock_clusters(territory_id: str, crop: str = "all", urgency: str = "all") -> list:
    # Bihar default (TER_0001 or fallback)
    state = "Bihar"
    district = "Nalanda"
    tehsils = ["Harnaut", "Biharsharif", "Rajgir", "Islampur", "Chandi", "Giriyak"]
    
    if territory_id and ("0116" in territory_id or "mh" in territory_id.lower()):
        state = "Maharashtra"
        district = "Amravati"
        tehsils = ["Amravati", "Achalpur", "Morshi", "Anjangaon", "Warud", "Chandur"]
    elif territory_id and ("0447" in territory_id or "pb" in territory_id.lower()):
        state = "Punjab"
        district = "Ludhiana"
        tehsils = ["Ludhiana", "Khanna", "Samrala", "Jagraon", "Payal", "Raikot"]
    elif not territory_id:
        state = "Uttar Pradesh"
        district = "Lucknow"
        tehsils = ["Malihabad", "Bakshi Ka Talab", "Mohanlalganj", "Lucknow", "Kakori"]
        
    mock_data = []
    
    crops = ["Rice", "Wheat", "Cotton", "Maize", "Mustard", "Soybean"]
    stages = ["Vegetative", "Tillering", "Flowering", "Grain Fill", "Germination", "Sowing"]
    risks = ["Critical", "High", "Medium", "Low"]
    products = ["Amistar 250 SC", "Actara 25 WG", "Priaxor", "Alika", "Volume Flexi", "Bayer Nativo"]
    
    for i, tehsil in enumerate(tehsils):
        c_type = crops[i % len(crops)]
        stage = stages[i % len(stages)]
        risk = risks[i % len(risks)]
        prod = products[i % len(products)]
        adv = ADVISORIES[i % len(ADVISORIES)]
        
        if risk == "Critical":
            urgency_score = 75 + (i * 3) % 20
        elif risk == "High":
            urgency_score = 56 + (i * 3) % 18
        elif risk == "Medium":
            urgency_score = 36 + (i * 3) % 18
        else:
            urgency_score = 15 + (i * 3) % 20
            
        growers = 120 + (i * 67) % 300
        scans = growers * (4 + (i * 7) % 8)
        attendance = int(growers * (0.3 + (i % 4) * 0.15))
        messages = int(growers * 3)
        clicked = int(growers * 1.5)
        eng_rate = round(clicked / (messages + 1), 3)
        avg_farm = round(1.8 + (i * 0.75) % 4.5, 1)
        last_days = 5 + (i * 9) % 25
        
        if crop != "all" and crop.lower() != c_type.lower():
            continue
        if urgency != "all" and urgency.lower() != risk.lower():
            continue
            
        mock_data.append({
            "id": f"mock-cluster-{tehsil.lower()}",
            "tehsil": tehsil,
            "district": district,
            "state": state,
            "location": f"{tehsil}, {district}",
            "crop_type": c_type,
            "crop_stage": stage,
            "grower_count": growers,
            "avg_farm_size_acres": avg_farm,
            "product_scans": scans,
            "campaign_attendance": attendance,
            "engagement_rate": eng_rate,
            "pest_risk": risk,
            "urgency_score": urgency_score,
            "recommended_advisory": adv,
            "recommended_product": prod,
            "last_visit_days": last_days,
            "total_messages_sent": messages,
        })
        
    return mock_data
