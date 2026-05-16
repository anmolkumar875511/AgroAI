from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class FieldData(BaseModel):
    farmer_name: str
    village: str
    crop: str
    acreage: float
    ndvi_current: float
    soil_moisture: float
    pest_history_score: float # Map 'high'/'low' to numbers in DB
    last_visit_days_ago: int

class PriorityPrediction(BaseModel):
    field_id: str
    score: float
    priority: str # High, Medium, Low
    ai_reason: str

class KPIResponse(BaseModel):
    id: str
    title: str
    value: str
    trend: str
    trendDirection: str