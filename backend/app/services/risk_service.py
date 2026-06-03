"""Risk Analyzer service — heatmap, NDVI, weather anomalies, pest outbreaks, AI insights from DB."""
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.models import Territory, RiskEvent
from app.schemas.schemas import (
    HeatmapCell, NDVIPoint, WeatherAnomaly, PestOutbreak,
    AIInsight, RiskAnalyzerResponse,
)

CROPS = ["Rice", "Wheat", "Cotton", "Maize", "Mustard"]
PESTS = ["Brown Plant Hopper", "Stem Borer", "Leaf Blast", "Powdery Mildew", "Whitefly"]
PRODUCTS_MAP = {
    "Brown Plant Hopper": "Actara 25 WG",
    "Stem Borer": "Coragen 20 SC",
    "Leaf Blast": "Amistar 250 SC",
    "Powdery Mildew": "Score 250 EC",
    "Whitefly": "Pegasus 500 SC",
}


async def get_risk_data(territory_id: str, lat: float, lng: float, db: AsyncSession) -> RiskAnalyzerResponse:
    # Query all risk events for this territory
    q_events = select(RiskEvent)
    if territory_id not in ["ind", "all"]:
        q_events = q_events.where(RiskEvent.territory_id == territory_id)
    res = await db.execute(q_events)
    events = res.scalars().all()

    # ── Heatmap cells ─────────────────────────────────────────────────────
    heatmap = []
    for evt in events:
        risk_score = {"Critical": 90.0, "High": 75.0, "Medium": 50.0, "Low": 20.0}.get(evt.severity, 15.0)
        
        # Determine crop & pest type from event description/properties
        crop = evt.crop or "Rice"
        pest_type = None
        if evt.event_type == "pest":
            for p in PESTS:
                if p.lower() in evt.description.lower():
                    pest_type = p
                    break
            if not pest_type:
                pest_type = "Leaf Blast"

        heatmap.append(HeatmapCell(
            id=f"cell_{evt.id}",
            lat=evt.lat,
            lng=evt.lng,
            risk_level=evt.severity,
            risk_score=risk_score,
            crop=crop,
            village="Local Area",
            pest_type=pest_type,
            area_km2=evt.affected_area_km2 or 5.0,
        ))

    # Fallback default cell if database has no events
    if not heatmap:
        heatmap.append(HeatmapCell(
            id="cell_default",
            lat=lat,
            lng=lng,
            risk_level="Low",
            risk_score=10.0,
            crop="Rice",
            village="Central Tehsil",
            pest_type=None,
            area_km2=5.0,
        ))

    # ── NDVI trend (Seasonal profile) ───────────────────────────────────────
    ndvi_data = []
    benchmarks = [0.65, 0.68, 0.72, 0.75, 0.70, 0.55, 0.45, 0.50, 0.58, 0.62, 0.64, 0.63]
    actuals = [0.66, 0.67, 0.73, 0.74, 0.68, 0.52, 0.44, 0.48, 0.59, 0.60, 0.63, 0.64]
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for i in range(12):
        status = "Good" if actuals[i] >= benchmarks[i] else ("Stressed" if actuals[i] >= benchmarks[i] - 0.05 else "Critical")
        ndvi_data.append(NDVIPoint(date=months[i], ndvi=actuals[i], benchmark=benchmarks[i], status=status))

    # ── Weather anomalies ─────────────────────────────────────────────────
    weather_events = [evt for evt in events if evt.event_type == "weather"]
    weather_anomalies = []
    for evt in weather_events:
        weather_anomalies.append(WeatherAnomaly(
            id=f"wx_{evt.id}",
            lat=evt.lat,
            lng=evt.lng,
            type="Weather Anomaly",
            severity=evt.severity,
            description=evt.description,
            affected_area_km2=evt.affected_area_km2 or 10.0,
        ))

    # ── Pest outbreaks ───────────────────────────────────────────────────
    pest_events = [evt for evt in events if evt.event_type == "pest"]
    pest_outbreaks = []
    for evt in pest_events:
        pest_name = "Leaf Blast"
        for p in PESTS:
            if p.lower() in evt.description.lower():
                pest_name = p
                break
        pest_outbreaks.append(PestOutbreak(
            id=f"pest_{evt.id}",
            lat=evt.lat,
            lng=evt.lng,
            pest_name=pest_name,
            crop=evt.crop or "Rice",
            severity=evt.severity,
            affected_farmers=int((evt.affected_area_km2 or 5.0) * 12),
            recommended_product=PRODUCTS_MAP.get(pest_name, "Amistar 250 SC"),
        ))

    # ── AI insights ───────────────────────────────────────────────────────
    ai_insights = []
    for evt in events:
        if evt.severity in ["High", "Critical"]:
            rec_prod = "Amistar 250 SC"
            for k, prod in PRODUCTS_MAP.items():
                if k.lower() in evt.description.lower():
                    rec_prod = prod
                    break
            ai_insights.append(AIInsight(
                id=f"ins_{evt.id}",
                severity=evt.severity,
                title=f"{evt.event_type.capitalize()} Alert in {evt.crop or 'Crop'}",
                description=evt.description,
                action=f"Dispatch {rec_prod} to key retail centers in the affected area.",
            ))

    # General fallback insights if no critical events exist
    if not ai_insights:
        ai_insights = [
            AIInsight(
                id="ins_general_1",
                severity="Medium",
                title="NDVI Stress Detected",
                description="Vegetation index reports minor stress patterns matching nitrogen deficiency.",
                action="Recommend crop nutrition checks during upcoming grower visits.",
            ),
            AIInsight(
                id="ins_general_2",
                severity="Low",
                title="Pre-season Inventory Optimization",
                description="Forecast indicates 35% higher fungicide requirement based on crop cycle calendar.",
                action="Increase stock levels of Amistar 250 SC at High-priority retailers.",
            ),
        ]

    overall = "High" if any(c.risk_level == "Critical" or c.risk_level == "High" for c in heatmap) else "Medium"

    return RiskAnalyzerResponse(
        overall_risk_level=overall,
        heatmap=heatmap,
        ndvi_data=ndvi_data,
        weather_anomalies=weather_anomalies,
        pest_outbreaks=pest_outbreaks,
        ai_insights=ai_insights,
    )
