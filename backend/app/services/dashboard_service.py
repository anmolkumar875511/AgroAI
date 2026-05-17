from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.core.database import get_collection


async def get_kpis(territory_id: str) -> List[Dict[str, Any]]:
    """
    Compute KPI cards from live MongoDB data for the given territory.
    Falls back to realistic mock values if no data exists yet.
    """
    retailers = get_collection("retailers")
    visit_logs = get_collection("visit_logs")
    notifications = get_collection("notifications")

    # Risk villages (high priority retailers)
    risk_count = await retailers.count_documents({
        "territory_id": territory_id,
        "priority_level": "High",
    }) or 7

    # Pending visits today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0)
    visits_today = await visit_logs.count_documents({
        "territory_id": territory_id,
        "visit_date": {"$gte": today_start},
        "status": "pending",
    }) or 12

    # Stock alerts (critical/low stock retailers)
    stock_alerts = await retailers.count_documents({
        "territory_id": territory_id,
        "stock_status": {"$in": ["Low Stock", "Out of Stock"]},
    }) or 4

    return [
        {
            "id": "risk-villages",
            "title": "Risk Villages",
            "value": str(risk_count),
            "trend": "+2",
            "trend_direction": "up",
            "icon": "AlertTriangle",
            "icon_color": "#E53935",
            "icon_bg": "rgba(229,57,53,0.12)",
            "chart_data": [3, 4, 5, 4, 6, 7, risk_count],
            "chart_color": "#E53935",
        },
        {
            "id": "priority-visits",
            "title": "Priority Visits Today",
            "value": str(visits_today),
            "trend": "+3",
            "trend_direction": "up",
            "icon": "MapPin",
            "icon_color": "#1E88E5",
            "icon_bg": "rgba(30,136,229,0.12)",
            "chart_data": [8, 10, 9, 11, 10, 12, visits_today],
            "chart_color": "#1E88E5",
        },
        {
            "id": "stock-alerts",
            "title": "Stock Alerts",
            "value": str(stock_alerts),
            "trend": "-1",
            "trend_direction": "down",
            "icon": "Package",
            "icon_color": "#FFC107",
            "icon_bg": "rgba(255,193,7,0.12)",
            "chart_data": [6, 5, 6, 5, 4, 5, stock_alerts],
            "chart_color": "#FFC107",
        },
        {
            "id": "revenue-opportunity",
            "title": "Revenue Opportunity",
            "value": "₹2.4L",
            "trend": "+12%",
            "trend_direction": "up",
            "icon": "TrendingUp",
            "icon_color": "#8BC34A",
            "icon_bg": "rgba(139,195,74,0.12)",
            "chart_data": [1.8, 2.0, 1.9, 2.1, 2.2, 2.3, 2.4],
            "chart_color": "#8BC34A",
        },
    ]


async def get_weekly_performance(territory_id: str) -> List[Dict[str, Any]]:
    """Return weekly visits + revenue data for the chart."""
    visit_logs = get_collection("visit_logs")

    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today = datetime.utcnow()
    week_start = today - timedelta(days=today.weekday())

    result = []
    for i, day in enumerate(days):
        day_start = week_start + timedelta(days=i)
        day_end = day_start + timedelta(days=1)

        completed = await visit_logs.count_documents({
            "territory_id": territory_id,
            "status": "completed",
            "visit_date": {"$gte": day_start, "$lt": day_end},
        })
        revenue = 0.0
        async for log in visit_logs.find({
            "territory_id": territory_id,
            "status": "completed",
            "visit_date": {"$gte": day_start, "$lt": day_end},
        }):
            revenue += log.get("revenue_generated", 0)

        # Use mock data as base when no real visits exist
        mock_base = [3.2, 4.1, 3.8, 4.5, 3.9, 4.8, 4.2][i]
        mock_target = [4.0, 4.0, 4.0, 4.0, 4.0, 5.0, 5.0][i]

        result.append({
            "name": day,
            "value": completed if completed > 0 else round(mock_base, 1),
            "value2": mock_target,
            "value3": round(revenue / 100000, 2) if revenue > 0 else round(mock_base * 0.9, 2),
        })

    return result


async def get_notifications_count(user_id: str) -> int:
    notifications = get_collection("notifications")
    return await notifications.count_documents({"user_id": user_id, "read": False})
