from fastapi import APIRouter, Depends, Query, HTTPException
from app.core.security import get_current_user
from app.core.database import get_collection
from app.ml.predictor import ml_service

router = APIRouter()


@router.get("/", summary="List retailers with insights for the territory")
async def list_retailers(
    territory_id: str = Query(default="T001"),
    priority: str = Query(default="all"),   # all | High | Medium | Low
    stock: str = Query(default="all"),       # all | Low Stock | Out of Stock
    search: str = Query(default=""),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
    current_user: dict = Depends(get_current_user),
):
    retailers = get_collection("retailers")

    query: dict = {"territory_id": territory_id}
    if priority != "all":
        query["priority_level"] = priority
    if stock != "all":
        query["stock_status"] = stock
    if search:
        query["$or"] = [
            {"retailer_id": {"$regex": search, "$options": "i"}},
            {"tehsil": {"$regex": search, "$options": "i"}},
            {"district": {"$regex": search, "$options": "i"}},
            {"recommended_product": {"$regex": search, "$options": "i"}},
        ]

    cursor = retailers.find(query, sort=[("visit_priority_score", -1)], skip=skip, limit=limit)
    total = await retailers.count_documents(query)

    results = []
    async for doc in cursor:
        results.append(_serialize_retailer(doc))

    return {"total": total, "skip": skip, "limit": limit, "retailers": results}


@router.get("/{retailer_id}", summary="Get full retailer insight card")
async def retailer_detail(
    retailer_id: str,
    current_user: dict = Depends(get_current_user),
):
    retailers = get_collection("retailers")
    doc = await retailers.find_one({"retailer_id": retailer_id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Retailer {retailer_id} not found")
    return _serialize_retailer(doc, full=True)


@router.post("/{retailer_id}/score", summary="Re-run ML score for a retailer")
async def rescore_retailer(
    retailer_id: str,
    current_user: dict = Depends(get_current_user),
):
    retailers = get_collection("retailers")
    doc = await retailers.find_one({"retailer_id": retailer_id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Retailer {retailer_id} not found")

    features = {
        "sales_qty_30": doc.get("sales_qty_30", 0),
        "sales_value_30": doc.get("sales_value_30", 0),
        "transactions_30": doc.get("transactions_30", 0),
        "sales_qty_7": doc.get("sales_qty_7", 0),
        "sales_value_7": doc.get("sales_value_7", 0),
        "transactions_7": doc.get("transactions_7", 0),
        "sales_growth_ratio": doc.get("sales_growth_ratio", 0),
        "total_stock_qty": doc.get("total_stock_qty", 0),
        "unique_skus": doc.get("unique_skus", 0),
        "last_visit_days": doc.get("last_visit_days", 0),
        "product_sales_qty_30": doc.get("product_sales_qty_30", 0),
        "grower_count": doc.get("grower_count", 0),
        "avg_farm_size": doc.get("avg_farm_size", 0),
        "product_scans": doc.get("product_scans", 0),
        "campaign_attendance": doc.get("campaign_attendance", 0),
        "total_messages": doc.get("total_messages", 0),
        "total_opened": doc.get("total_opened", 0),
        "total_clicked": doc.get("total_clicked", 0),
        "engagement_rate": doc.get("engagement_rate", 0),
    }

    result = ml_service.predict(features)

    from datetime import datetime
    await retailers.update_one(
        {"retailer_id": retailer_id},
        {"$set": {
            "visit_priority_score": result["visit_priority_score"],
            "priority_level": result["priority_level"],
            "explanation": result["explanation"],
            "updated_at": datetime.utcnow(),
        }},
    )

    return {
        "retailer_id": retailer_id,
        "new_score": result["visit_priority_score"],
        "priority_level": result["priority_level"],
        "action_type": result["action_type"],
        "explanation": result["explanation"],
    }


def _serialize_retailer(doc: dict, full: bool = False) -> dict:
    base = {
        "id": str(doc["_id"]),
        "retailer_id": doc.get("retailer_id", ""),
        "territory_id": doc.get("territory_id", ""),
        "state": doc.get("state", ""),
        "district": doc.get("district", ""),
        "tehsil": doc.get("tehsil", ""),
        "location": f"{doc.get('tehsil','')}, {doc.get('district','')}",
        "lat": doc.get("lat"),
        "lng": doc.get("lng"),
        # Scores
        "visit_priority_score": round(doc.get("visit_priority_score", 0), 1),
        "priority_level": doc.get("priority_level", "Low"),
        # Stock
        "total_stock_qty": int(doc.get("total_stock_qty", 0)),
        "stock_status": doc.get("stock_status", "Good Stock"),
        "unique_skus": int(doc.get("unique_skus", 0)),
        # Products
        "recommended_product": doc.get("recommended_product", ""),
        "recommended_sku_id": doc.get("recommended_sku_id", ""),
        "recommended_action": doc.get("recommended_action", ""),
        # Visit
        "last_visit_date": str(doc.get("last_visit_date", ""))[:10],
        "last_visit_days": int(doc.get("last_visit_days", 0)),
        # Explanation
        "explanation": doc.get("explanation", ""),
    }

    if full:
        base.update({
            # Sales
            "sales_qty_30": doc.get("sales_qty_30", 0),
            "sales_value_30": doc.get("sales_value_30", 0),
            "transactions_30": doc.get("transactions_30", 0),
            "sales_qty_7": doc.get("sales_qty_7", 0),
            "sales_value_7": doc.get("sales_value_7", 0),
            "transactions_7": doc.get("transactions_7", 0),
            "sales_growth_ratio": doc.get("sales_growth_ratio", 0),
            # Growers
            "grower_count": doc.get("grower_count", 0),
            "avg_farm_size": doc.get("avg_farm_size", 0),
            "product_scans": doc.get("product_scans", 0),
            "campaign_attendance": doc.get("campaign_attendance", 0),
            # Engagement
            "total_messages": doc.get("total_messages", 0),
            "engagement_rate": round(doc.get("engagement_rate", 0), 4),
            # Sub-scores
            "sales_demand_score": round(doc.get("sales_demand_score", 0), 1),
            "stock_alert_score": round(doc.get("stock_alert_score", 0), 1),
            "last_visit_gap_score": round(doc.get("last_visit_gap_score", 0), 1),
            "product_relevance_score": round(doc.get("product_relevance_score", 0), 1),
            "grower_engagement_score": round(doc.get("grower_engagement_score", 0), 1),
        })

    return base
