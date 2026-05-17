from datetime import datetime
from typing import List, Dict, Any
from bson import ObjectId
from app.core.database import get_collection


async def get_priority_visits(
    territory_id: str,
    filter_type: str = "all",
) -> List[Dict[str, Any]]:
    """
    Return AI-ranked visits for the given territory.
    Optionally filtered by type: all | high-risk | revenue | follow-up
    """
    retailers = get_collection("retailers")

    query: dict = {"territory_id": territory_id}
    if filter_type == "high-risk":
        query["priority_level"] = "High"
    elif filter_type == "revenue":
        query["sales_value_30"] = {"$gt": 10000}
    elif filter_type == "follow-up":
        query["last_visit_days"] = {"$gt": 14}

    cursor = retailers.find(query, sort=[("visit_priority_score", -1)], limit=20)

    visits = []
    async for doc in cursor:
        visits.append(_build_priority_visit(doc))

    if not visits:
        visits = _mock_priority_visits()

    return visits


async def get_optimized_route(territory_id: str) -> Dict[str, Any]:
    """Return the top stops for today's optimized route."""
    retailers = get_collection("retailers")

    cursor = retailers.find(
        {"territory_id": territory_id, "priority_level": {"$in": ["High", "Medium"]}},
        sort=[("visit_priority_score", -1)],
        limit=4,
    )

    stops = []
    idx = 1
    times = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]
    statuses = ["completed", "in-progress", "pending", "pending"]

    async for doc in cursor:
        stops.append({
            "id": idx,
            "name": doc.get("tehsil", f"Stop {idx}"),
            "lat": doc.get("lat", 25.0 + idx * 0.1),
            "lng": doc.get("lng", 85.3 + idx * 0.1),
            "status": statuses[idx - 1] if idx <= 4 else "pending",
            "time": times[idx - 1] if idx <= 4 else "TBD",
            "retailer_id": doc.get("retailer_id", ""),
        })
        idx += 1

    if not stops:
        stops = _mock_route_stops()

    return {
        "stops": stops,
        "total_distance_km": round(len(stops) * 7.5, 1),
        "estimated_hours": round(len(stops) * 0.9, 1),
        "total_stops": len(stops),
    }


async def record_visit_action(
    retailer_id: str,
    action: str,
    user_id: str,
    territory_id: str,
    notes: str = "",
    revenue_generated: float = 0,
    products_discussed: List[str] = [],
) -> Dict[str, Any]:
    """Record a visit action (start, complete, skip, reschedule)."""
    visit_logs = get_collection("visit_logs")
    retailers = get_collection("retailers")

    if action == "complete":
        await retailers.update_one(
            {"retailer_id": retailer_id},
            {"$set": {
                "last_visit_date": datetime.utcnow(),
                "last_visit_days": 0,
                "updated_at": datetime.utcnow(),
            }},
        )

    log_doc = {
        "retailer_id": retailer_id,
        "territory_id": territory_id,
        "agent_id": user_id,
        "visit_date": datetime.utcnow(),
        "status": action if action in ["completed", "skipped"] else "in-progress",
        "notes": notes,
        "revenue_generated": revenue_generated,
        "products_discussed": products_discussed,
        "outcome": action,
        "created_at": datetime.utcnow(),
    }

    result = await visit_logs.insert_one(log_doc)

    return {
        "success": True,
        "message": f"Visit {action} recorded successfully.",
        "visit_id": str(result.inserted_id),
    }


def _build_priority_visit(doc: dict) -> Dict[str, Any]:
    level = doc.get("priority_level", "Low")
    score = doc.get("visit_priority_score", 50)
    last_days = int(doc.get("last_visit_days", 0))
    stock = doc.get("stock_status", "Good Stock")
    product = doc.get("recommended_product", "General Product")

    tags = []
    if level == "High":
        tags.append({"label": "Pest Risk", "color": "red"})
    if doc.get("sales_value_30", 0) > 20000:
        tags.append({"label": f"Revenue ₹{int(doc.get('sales_value_30', 0)/1000)}K", "color": "green"})
    if "Low" in stock or "Out" in stock:
        tags.append({"label": "Stock Alert", "color": "yellow"})
    if last_days > 14:
        tags.append({"label": f"Follow-up ({last_days}d)", "color": "blue"})

    if level == "High":
        actions = ["Start Visit", "Send Alert"]
    elif level == "Medium":
        actions = ["Plan Visit", "View Profile"]
    else:
        actions = ["Follow-up", "View Profile"]

    return {
        "id": str(doc["_id"]),
        "name": f"Retailer {doc.get('retailer_id', 'Unknown')}",
        "type": "retailer",
        "score": round(score),
        "location": f"{doc.get('tehsil', '')}, {doc.get('district', '')}",
        "last_visit": f"{last_days} days ago" if last_days > 0 else "Today",
        "status": level.lower(),
        "tags": tags,
        "ai_reason": doc.get("explanation", "Priority based on combined sales, stock and visit gap signals."),
        "actions": actions,
        "retailer_id": doc.get("retailer_id", ""),
        "lat": doc.get("lat"),
        "lng": doc.get("lng"),
    }


def _mock_priority_visits() -> List[Dict[str, Any]]:
    return [
        {
            "id": "v1", "name": "Retailer R12 — GreenAgro", "type": "retailer",
            "score": 92, "location": "Sonepur, Saran",
            "last_visit": "18 days ago", "status": "high",
            "tags": [
                {"label": "Pest Risk", "color": "red"},
                {"label": "Revenue ₹45K", "color": "green"},
                {"label": "Stock Alert", "color": "yellow"},
            ],
            "ai_reason": "Critical stock depletion (18 units) + Stem Borer risk detected. Revenue opportunity ₹45K.",
            "actions": ["Start Visit", "Send Alert"],
            "retailer_id": "R12", "lat": 25.18, "lng": 85.06,
        },
        {
            "id": "v2", "name": "Village Cluster — Rampur", "type": "village",
            "score": 81, "location": "Rampur, Muzaffarpur",
            "last_visit": "12 days ago", "status": "high",
            "tags": [
                {"label": "Pest Risk", "color": "red"},
                {"label": "Follow-up (12d)", "color": "blue"},
            ],
            "ai_reason": "3 growers in cluster reported crop stress. NDVI drop of 15% detected via satellite.",
            "actions": ["Start Visit", "View Profile"],
            "retailer_id": "R08", "lat": 25.21, "lng": 85.42,
        },
        {
            "id": "v3", "name": "Kisan Kendra — Sonepur", "type": "cluster",
            "score": 68, "location": "Sonepur, Saran",
            "last_visit": "5 days ago", "status": "medium",
            "tags": [
                {"label": "Revenue ₹22K", "color": "green"},
                {"label": "Follow-up (5d)", "color": "blue"},
            ],
            "ai_reason": "New product launch window — Actara demand spike in adjacent tehsils.",
            "actions": ["Plan Visit", "View Profile"],
            "retailer_id": "R15", "lat": 25.05, "lng": 84.98,
        },
        {
            "id": "v4", "name": "Retailer R05 — AgriPlus", "type": "retailer",
            "score": 45, "location": "Bihta, Patna",
            "last_visit": "3 days ago", "status": "low",
            "tags": [{"label": "Routine", "color": "blue"}],
            "ai_reason": "Regular check-in due — no urgent alerts. Sales stable at ₹8K/month.",
            "actions": ["Follow-up", "View Profile"],
            "retailer_id": "R05", "lat": 25.35, "lng": 84.85,
        },
    ]


def _mock_route_stops() -> List[Dict[str, Any]]:
    return [
        {"id": 1, "name": "GreenAgro Store", "lat": 25.18, "lng": 85.06, "status": "completed", "time": "09:00 AM", "retailer_id": "R12"},
        {"id": 2, "name": "Village Rampur", "lat": 25.21, "lng": 85.42, "status": "in-progress", "time": "11:30 AM", "retailer_id": "R08"},
        {"id": 3, "name": "Kisan Kendra", "lat": 25.05, "lng": 84.98, "status": "pending", "time": "02:00 PM", "retailer_id": "R15"},
        {"id": 4, "name": "AgriPlus Bihta", "lat": 25.35, "lng": 84.85, "status": "pending", "time": "04:30 PM", "retailer_id": "R05"},
    ]
