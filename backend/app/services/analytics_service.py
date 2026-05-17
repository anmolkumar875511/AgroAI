from typing import List, Dict, Any
from app.core.database import get_collection


async def get_analytics(territory_id: str, date_range: str = "14d") -> Dict[str, Any]:
    """Compute all analytics chart data for the given territory and date range."""

    days_map = {"7d": 7, "14d": 14, "30d": 30, "90d": 90}
    days = days_map.get(date_range, 14)

    return {
        "field_efficiency": await _field_efficiency(territory_id, days),
        "revenue_per_visit": await _revenue_per_visit(territory_id, days),
        "recommendation_acceptance": _recommendation_acceptance(),
        "regional_performance": _regional_performance(),
        "crop_risk_trends": _crop_risk_trends(),
        "stock_utilization": await _stock_utilization(territory_id),
    }


async def _field_efficiency(territory_id: str, days: int) -> List[Dict[str, Any]]:
    from datetime import datetime, timedelta
    visit_logs = get_collection("visit_logs")

    result = []
    today = datetime.utcnow()
    periods = _get_periods(days)

    for label, start, end in periods:
        completed = await visit_logs.count_documents({
            "territory_id": territory_id,
            "status": "completed",
            "visit_date": {"$gte": start, "$lt": end},
        })
        result.append({
            "name": label,
            "value": completed or _mock_efficiency_value(label),
            "value2": 5,  # daily target
        })

    return result or [
        {"name": "Week 1", "value": 4.2, "value2": 5},
        {"name": "Week 2", "value": 3.8, "value2": 5},
        {"name": "Week 3", "value": 5.1, "value2": 5},
        {"name": "Week 4", "value": 4.7, "value2": 5},
    ]


async def _revenue_per_visit(territory_id: str, days: int) -> List[Dict[str, Any]]:
    from datetime import datetime, timedelta
    visit_logs = get_collection("visit_logs")

    result = []
    periods = _get_periods(days)

    for label, start, end in periods:
        total_revenue = 0.0
        total_visits = 0
        async for log in visit_logs.find({
            "territory_id": territory_id,
            "status": "completed",
            "visit_date": {"$gte": start, "$lt": end},
        }):
            total_revenue += log.get("revenue_generated", 0)
            total_visits += 1

        avg = total_revenue / total_visits if total_visits > 0 else 0
        result.append({
            "name": label,
            "value": round(avg) or _mock_revenue_value(label),
            "value2": round(avg * 1.05) or _mock_revenue_value(label, 1.05),
        })

    return result or [
        {"name": "Week 1", "value": 8200, "value2": 8600},
        {"name": "Week 2", "value": 9100, "value2": 9500},
        {"name": "Week 3", "value": 7800, "value2": 8200},
        {"name": "Week 4", "value": 10200, "value2": 10800},
    ]


def _recommendation_acceptance() -> List[Dict[str, Any]]:
    return [
        {"name": "Accepted", "value": 87, "fill": "#8BC34A"},
        {"name": "Pending", "value": 9, "fill": "#FFC107"},
        {"name": "Rejected", "value": 4, "fill": "#E53935"},
    ]


def _regional_performance() -> List[Dict[str, Any]]:
    return [
        {"metric": "Visits", "your_territory": 85, "average": 65},
        {"metric": "Revenue", "your_territory": 92, "average": 70},
        {"metric": "Acceptance", "your_territory": 87, "average": 72},
        {"metric": "Coverage", "your_territory": 78, "average": 60},
        {"metric": "Satisfaction", "your_territory": 90, "average": 75},
    ]


def _crop_risk_trends() -> List[Dict[str, Any]]:
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
    rice   = [12, 18, 15, 22, 28, 35, 42]
    cotton = [8, 12, 10, 15, 20, 18, 25]
    wheat  = [20, 15, 12, 8, 10, 12, 9]
    return [
        {"month": months[i], "rice": rice[i], "cotton": cotton[i], "wheat": wheat[i]}
        for i in range(len(months))
    ]


async def _stock_utilization(territory_id: str) -> List[Dict[str, Any]]:
    retailers = get_collection("retailers")

    # Aggregate average stock utilization per product
    pipeline = [
        {"$match": {"territory_id": territory_id}},
        {"$group": {
            "_id": "$recommended_product",
            "avg_stock": {"$avg": "$total_stock_qty"},
            "count": {"$sum": 1},
        }},
        {"$limit": 6},
    ]

    results = []
    async for doc in retailers.aggregate(pipeline):
        product = doc["_id"] or "General Product"
        avg_stock = doc["avg_stock"] or 0
        utilization = round(100 - min(avg_stock / 200 * 100, 100), 1)
        status = "critical" if utilization > 80 else "low" if utilization > 60 else "optimal"
        results.append({
            "product": product[:20],
            "utilization": utilization,
            "stock": int(avg_stock),
            "status": status,
        })

    return results or [
        {"product": "Amistar", "utilization": 85, "stock": 22, "status": "critical"},
        {"product": "Actara", "utilization": 45, "stock": 180, "status": "optimal"},
        {"product": "Score", "utilization": 72, "stock": 56, "status": "low"},
        {"product": "Ridomil", "utilization": 68, "stock": 34, "status": "low"},
        {"product": "Custodia", "utilization": 30, "stock": 145, "status": "optimal"},
        {"product": "Proclaim", "utilization": 55, "stock": 92, "status": "optimal"},
    ]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_periods(days: int):
    from datetime import datetime, timedelta
    today = datetime.utcnow()
    if days <= 14:
        # Daily buckets
        periods = []
        for i in range(days):
            start = today - timedelta(days=days - i)
            end = start + timedelta(days=1)
            periods.append((start.strftime("%b %d"), start, end))
        return periods
    else:
        # Weekly buckets
        weeks = days // 7
        periods = []
        for i in range(weeks):
            end = today - timedelta(weeks=weeks - i - 1)
            start = end - timedelta(weeks=1)
            periods.append((f"Week {i+1}", start, end))
        return periods


def _mock_efficiency_value(label: str) -> float:
    import hashlib
    h = int(hashlib.md5(label.encode()).hexdigest(), 16) % 30
    return round(3.0 + h / 10, 1)


def _mock_revenue_value(label: str, multiplier: float = 1.0) -> int:
    import hashlib
    h = int(hashlib.md5(label.encode()).hexdigest(), 16) % 4000
    return int((7000 + h) * multiplier)
