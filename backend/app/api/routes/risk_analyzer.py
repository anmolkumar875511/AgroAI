from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.services.risk_service import (
    get_heatmap,
    get_ndvi_data,
    get_pest_outbreaks,
    get_weather_anomalies,
    get_ai_insights,
)

router = APIRouter()


@router.get("/", summary="Full risk analyzer data in one call")
async def risk_analyzer(
    territory_id: str = Query(default="T001"),
    region_lat: float = Query(default=25.09),
    region_lng: float = Query(default=85.31),
    crop: str = Query(default="Rice"),
    current_user: dict = Depends(get_current_user),
):
    heatmap = await get_heatmap(territory_id, crop)
    ndvi = await get_ndvi_data(territory_id)
    pests = await get_pest_outbreaks(territory_id, region_lat, region_lng)
    weather = await get_weather_anomalies(territory_id, region_lat, region_lng)
    insights = await get_ai_insights(territory_id)

    return {
        "heatmap": heatmap,
        "ndvi_data": ndvi,
        "pest_outbreaks": pests,
        "weather_anomalies": weather,
        "overall_risk_level": insights["overall_risk_level"],
        "ai_insights": insights["ai_insights"],
    }


@router.get("/heatmap", summary="Risk heatmap grid cells")
async def heatmap(
    territory_id: str = Query(default="T001"),
    crop: str = Query(default="Rice"),
    current_user: dict = Depends(get_current_user),
):
    return await get_heatmap(territory_id, crop)


@router.get("/ndvi", summary="NDVI trend data for the last 30 days")
async def ndvi(
    territory_id: str = Query(default="T001"),
    current_user: dict = Depends(get_current_user),
):
    return await get_ndvi_data(territory_id)


@router.get("/pests", summary="Active pest outbreak locations")
async def pests(
    territory_id: str = Query(default="T001"),
    region_lat: float = Query(default=25.09),
    region_lng: float = Query(default=85.31),
    current_user: dict = Depends(get_current_user),
):
    return await get_pest_outbreaks(territory_id, region_lat, region_lng)


@router.get("/weather", summary="Weather anomaly pins for the map")
async def weather(
    territory_id: str = Query(default="T001"),
    region_lat: float = Query(default=25.09),
    region_lng: float = Query(default=85.31),
    current_user: dict = Depends(get_current_user),
):
    return await get_weather_anomalies(territory_id, region_lat, region_lng)


@router.get("/insights", summary="AI-generated risk insights for the territory")
async def insights(
    territory_id: str = Query(default="T001"),
    current_user: dict = Depends(get_current_user),
):
    return await get_ai_insights(territory_id)
