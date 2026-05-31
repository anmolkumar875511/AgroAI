"""Risk Analyzer service — heatmap, NDVI, weather anomalies, pest outbreaks, AI insights."""
import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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
VILLAGES = [
    "Danapur Khurd", "Phulwari Sharif", "Masaurhi", "Bihta Block",
    "Naubatpur", "Paliganj", "Bikram", "Maner", "Shahpur",
]

RISK_LEVELS = ["Critical", "High", "Medium", "Low"]

AI_INSIGHTS_POOL = [
    {
        "id": "ins_1", "severity": "Critical",
        "title": "BPH Infestation at Economic Threshold",
        "description": "Brown Plant Hopper population has reached 8.2/m² in Danapur block — exceeding the economic threshold of 5/m². Immediate insecticide intervention required.",
        "action": "Dispatch Actara 25 WG to RTL_00001 and RTL_00003 within 24 hours.",
    },
    {
        "id": "ins_2", "severity": "High",
        "title": "Fungal Disease Risk Elevated",
        "description": "Relative humidity sustained above 85% for 6 consecutive days. Blast disease progression probability: 78% in rice paddies at flowering stage.",
        "action": "Pre-position Amistar 250 SC at all rice belt retailers. Advise immediate prophylactic application.",
    },
    {
        "id": "ins_3", "severity": "Medium",
        "title": "NDVI Stress Detected — Nitrogen Deficiency",
        "description": "NDVI dropped from 0.72 to 0.58 over 14 days across 3 tehsils. Pattern consistent with nitrogen deficiency rather than pest damage.",
        "action": "Advise growers on top-dressing urea application. Monitor for 7 days before pesticide intervention.",
    },
    {
        "id": "ins_4", "severity": "Low",
        "title": "Pre-season Inventory Optimization",
        "description": "ML demand forecast predicts 35% sales surge in next 3 weeks based on crop calendar and historical patterns.",
        "action": "Increase stock levels at High-priority retailers before the demand window opens.",
    },
]


async def get_risk_data(territory_id: str, lat: float, lng: float, db: AsyncSession) -> RiskAnalyzerResponse:
    # ── Heatmap cells ─────────────────────────────────────────────────────
    heatmap = []
    for i in range(12):
        risk = random.choices(RISK_LEVELS, weights=[1, 2, 5, 8])[0]
        heatmap.append(HeatmapCell(
            id=f"cell_{i}",
            lat=lat + random.uniform(-0.25, 0.25),
            lng=lng + random.uniform(-0.25, 0.25),
            risk_level=risk,
            risk_score={"Critical": random.uniform(80, 100), "High": random.uniform(60, 79), "Medium": random.uniform(35, 59), "Low": random.uniform(5, 34)}[risk],
            crop=random.choice(CROPS),
            village=random.choice(VILLAGES),
            pest_type=random.choice(PESTS) if risk in ["Critical", "High"] else None,
            area_km2=round(random.uniform(2, 40), 1),
        ))

    # ── NDVI trend ───────────────────────────────────────────────────────
    ndvi_data = []
    base_ndvi = 0.72
    for i in range(12):
        month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]
        ndvi = round(base_ndvi + random.uniform(-0.08, 0.06), 3)
        benchmark = round(0.70 + i * 0.005, 3)
        status = "Good" if ndvi >= benchmark else ("Stressed" if ndvi >= benchmark - 0.08 else "Critical")
        ndvi_data.append(NDVIPoint(date=month, ndvi=ndvi, benchmark=benchmark, status=status))
        base_ndvi = ndvi

    # ── Weather anomalies ─────────────────────────────────────────────────
    weather_anomalies = []
    weather_types = ["Heavy Rainfall", "Drought Stress", "Cold Wave", "Heatwave", "Hailstorm"]
    for i in range(4):
        weather_anomalies.append(WeatherAnomaly(
            id=f"wx_{i}",
            lat=lat + random.uniform(-0.3, 0.3),
            lng=lng + random.uniform(-0.3, 0.3),
            type=random.choice(weather_types),
            severity=random.choice(["High", "Medium", "Low"]),
            description=f"Anomalous weather pattern affecting crop health in {random.choice(VILLAGES)}",
            affected_area_km2=round(random.uniform(5, 80), 1),
        ))

    # ── Pest outbreaks (from DB + synthetic) ──────────────────────────────
    result = await db.execute(
        select(RiskEvent).where(
            RiskEvent.territory_id == territory_id,
            RiskEvent.event_type == "pest",
        ).limit(4)
    )
    db_events = result.scalars().all()

    pest_outbreaks = []
    for evt in db_events:
        pest = random.choice(PESTS)
        pest_outbreaks.append(PestOutbreak(
            id=f"pest_{evt.id}",
            lat=evt.lat, lng=evt.lng,
            pest_name=pest,
            crop=evt.crop or "Rice",
            severity=evt.severity,
            affected_farmers=random.randint(15, 250),
            recommended_product=PRODUCTS_MAP.get(pest, "Amistar 250 SC"),
        ))
    # Pad synthetic outbreaks
    for i in range(max(0, 3 - len(pest_outbreaks))):
        pest = random.choice(PESTS)
        pest_outbreaks.append(PestOutbreak(
            id=f"pest_syn_{i}",
            lat=lat + random.uniform(-0.2, 0.2),
            lng=lng + random.uniform(-0.2, 0.2),
            pest_name=pest,
            crop=random.choice(CROPS),
            severity=random.choice(["High", "Medium"]),
            affected_farmers=random.randint(20, 180),
            recommended_product=PRODUCTS_MAP.get(pest, "Actara 25 WG"),
        ))

    # ── AI insights ───────────────────────────────────────────────────────
    ai_insights = [AIInsight(**i) for i in AI_INSIGHTS_POOL[:3]]

    overall = "High" if any(c.risk_level == "Critical" for c in heatmap) else "Medium"

    return RiskAnalyzerResponse(
        overall_risk_level=overall,
        heatmap=heatmap,
        ndvi_data=ndvi_data,
        weather_anomalies=weather_anomalies,
        pest_outbreaks=pest_outbreaks,
        ai_insights=ai_insights,
    )
