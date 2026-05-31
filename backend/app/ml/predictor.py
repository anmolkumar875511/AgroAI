"""
AgroAI ML Predictor — visit priority scoring.

Uses a trained sklearn model when available (models_pkl/), falls back to
a deterministic weighted heuristic so the app always works.
"""
from __future__ import annotations
import os
import pickle
import random
from typing import Optional

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../models_pkl/agroai_visit_priority_regressor.pkl")
FEATURES_PATH = os.path.join(os.path.dirname(__file__), "../../models_pkl/agroai_model_features.pkl")

_model = None
_feature_names: list[str] = []


def _load_model():
    global _model, _feature_names
    try:
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        if os.path.exists(FEATURES_PATH):
            with open(FEATURES_PATH, "rb") as f:
                _feature_names = pickle.load(f)
    except Exception:
        _model = None
        _feature_names = []


_load_model()


def _heuristic_score(
    days_since_visit: int,
    stock_status: str,
    priority_level: str,
    monthly_revenue: float,
    pest_risk: str = "Low",
) -> float:
    """Weighted heuristic when ML model is unavailable."""
    score = 40.0

    # Visit gap penalty (max +30)
    if days_since_visit >= 30:
        score += 30
    elif days_since_visit >= 21:
        score += 20
    elif days_since_visit >= 14:
        score += 12
    elif days_since_visit >= 7:
        score += 5

    # Stock status (+20)
    score += {"Out of Stock": 20, "Low Stock": 12, "Good Stock": 0}.get(stock_status, 0)

    # Priority (+15)
    score += {"High": 15, "Medium": 8, "Low": 0}.get(priority_level, 0)

    # Revenue weight (+10)
    if monthly_revenue >= 200000:
        score += 10
    elif monthly_revenue >= 100000:
        score += 6
    elif monthly_revenue >= 50000:
        score += 3

    # Pest risk (+10)
    score += {"Critical": 10, "High": 7, "Medium": 3, "Low": 0}.get(pest_risk, 0)

    # Small jitter for realism
    score += random.uniform(-1.5, 1.5)
    return round(min(max(score, 10.0), 100.0), 1)


def predict_priority_score(
    days_since_visit: int,
    stock_status: str,
    priority_level: str,
    monthly_revenue: float,
    pest_risk: str = "Low",
    extra_features: Optional[dict] = None,
) -> float:
    """
    Returns a priority score 0-100.
    Uses ML model if loaded, otherwise heuristic.
    """
    if _model is not None and _feature_names:
        try:
            import numpy as np
            stock_map = {"Out of Stock": 2, "Low Stock": 1, "Good Stock": 0}
            priority_map = {"High": 2, "Medium": 1, "Low": 0}
            risk_map = {"Critical": 3, "High": 2, "Medium": 1, "Low": 0}

            feat_dict = {
                "days_since_visit": days_since_visit,
                "stock_status_enc": stock_map.get(stock_status, 0),
                "priority_enc": priority_map.get(priority_level, 1),
                "monthly_revenue": monthly_revenue,
                "pest_risk_enc": risk_map.get(pest_risk, 0),
            }
            if extra_features:
                feat_dict.update(extra_features)

            feat_vec = np.array([[feat_dict.get(f, 0) for f in _feature_names]])
            score = float(_model.predict(feat_vec)[0])
            return round(min(max(score, 10.0), 100.0), 1)
        except Exception:
            pass

    return _heuristic_score(days_since_visit, stock_status, priority_level, monthly_revenue, pest_risk)


def classify_priority(score: float) -> str:
    if score >= 70:
        return "High"
    elif score >= 45:
        return "Medium"
    return "Low"
