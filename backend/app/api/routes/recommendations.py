from fastapi import APIRouter, Depends, Query, HTTPException
from app.core.security import get_current_user
from app.schemas.schemas import ApplyRecommendationRequest, PredictRequest, PredictResponse
from app.services.recommendations_service import (
    get_recommendations,
    apply_recommendation,
)
from app.ml.predictor import ml_service

router = APIRouter()


@router.get("/", summary="Get AI recommendations for the territory")
async def recommendations(
    territory_id: str = Query(default="T001"),
    limit: int = Query(default=10, le=50),
    current_user: dict = Depends(get_current_user),
):
    return await get_recommendations(territory_id, limit)


@router.post("/apply", summary="Apply or dismiss a recommendation")
async def apply(
    data: ApplyRecommendationRequest,
    current_user: dict = Depends(get_current_user),
):
    return await apply_recommendation(
        recommendation_id=data.recommendation_id,
        retailer_id=data.retailer_id,
        action=data.action,
        user_id=current_user["sub"],
    )


@router.post("/predict", response_model=PredictResponse, summary="Run ML model on custom retailer features")
async def predict(
    data: PredictRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Accepts the 19 features from the AgroAI ML model and returns
    visit_priority_score, priority_level, action_type, and explanation.
    """
    result = ml_service.predict(data.model_dump())
    return result
