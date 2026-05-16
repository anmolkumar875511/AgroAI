from core.database import db_client
from bson import ObjectId

class DataService:
    async def get_all_fields(self):
        return await db_client.db.fields.find().to_list(1000)

    async def get_kpis(self):
        # Mocked aggregation logic
        return [
            {"id": "risk-villages", "title": "High Risk Villages", "value": "12", "trend": "+3", "trendDirection": "up"},
            {"id": "priority-visits", "title": "Priority Visits Today", "value": "24", "trend": "+5", "trendDirection": "up"},
        ]

    async def get_analytics_data(self, metric: str):
        # MongoDB Aggregation Pipeline for Recharts
        pipeline = [
            {"$group": {"_id": "$month", "value": {"$avg": "$revenue"}}},
            {"$sort": {"_id": 1}}
        ]
        return await db_client.db.analytics.aggregate(pipeline).to_list(100)

data_service = DataService()