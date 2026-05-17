import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.core.config import settings


class MLService:
    """Loads and runs the AgroAI visit priority ML models."""

    def __init__(self):
        self.regressor = None
        self.classifier = None
        self.features: List[str] = []
        self._loaded = False

    def load(self):
        """Load all three pkl files. Called once at startup."""
        try:
            self.regressor = joblib.load(settings.REGRESSOR_PATH)
            self.classifier = joblib.load(settings.CLASSIFIER_PATH)
            self.features = joblib.load(settings.FEATURES_PATH)
            self._loaded = True
            print(f"[ML] Models loaded. Features: {self.features}")
        except FileNotFoundError as e:
            print(f"[ML] WARNING: Model file not found — {e}. Predictions will use rule-based fallback.")
            self._loaded = False

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict visit priority score and level for a retailer.

        Args:
            input_data: dict with the 19 model features.

        Returns:
            dict with visit_priority_score, priority_level, action_type, explanation.
        """
        if not self._loaded:
            return self._rule_based_fallback(input_data)

        try:
            df = pd.DataFrame([input_data])
            for col in self.features:
                if col not in df.columns:
                    df[col] = 0
            df = df[self.features].fillna(0)

            score = float(self.regressor.predict(df)[0])
            level = self.classifier.predict(df)[0]

            action_map = {"High": "urgent", "Medium": "planned", "Low": "monitor"}
            explanation = self._build_explanation(input_data, level)

            return {
                "visit_priority_score": round(score, 2),
                "priority_level": level,
                "action_type": action_map.get(level, "monitor"),
                "explanation": explanation,
            }
        except Exception as e:
            print(f"[ML] Prediction error: {e}")
            return self._rule_based_fallback(input_data)

    def predict_batch(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Predict for a batch of retailers at once."""
        if not self._loaded:
            return [self._rule_based_fallback(r) for r in records]

        try:
            df = pd.DataFrame(records)
            for col in self.features:
                if col not in df.columns:
                    df[col] = 0
            df = df[self.features].fillna(0)

            scores = self.regressor.predict(df)
            levels = self.classifier.predict(df)
            action_map = {"High": "urgent", "Medium": "planned", "Low": "monitor"}

            results = []
            for i, (score, level) in enumerate(zip(scores, levels)):
                results.append({
                    "visit_priority_score": round(float(score), 2),
                    "priority_level": level,
                    "action_type": action_map.get(level, "monitor"),
                    "explanation": self._build_explanation(records[i], level),
                })
            return results
        except Exception as e:
            print(f"[ML] Batch prediction error: {e}")
            return [self._rule_based_fallback(r) for r in records]

    def _build_explanation(self, data: Dict[str, Any], level: str) -> str:
        reasons = []
        if data.get("sales_qty_30", 0) > 70:
            reasons.append("Recent sales demand is high")
        if data.get("total_stock_qty", 999) < 20:
            reasons.append("Current retailer stock is critically low")
        if data.get("last_visit_days", 0) > 20:
            reasons.append("This area has not been visited recently")
        if data.get("product_sales_qty_30", 0) > 50:
            reasons.append("Recommended product has strong recent demand")
        if data.get("engagement_rate", 0) > 0.2:
            reasons.append("Nearby grower digital engagement is high")
        if not reasons:
            reasons.append("Priority based on combined sales, stock, visit gap and grower signals")
        return " | ".join(reasons)

    def _rule_based_fallback(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Simple weighted score when models aren't loaded."""
        sales = min(data.get("sales_qty_30", 0) / 200.0, 1.0)
        stock_inv = 1.0 - min(data.get("total_stock_qty", 100) / 100.0, 1.0)
        gap = min(data.get("last_visit_days", 0) / 60.0, 1.0)
        score = round((sales * 0.35 + stock_inv * 0.30 + gap * 0.35) * 100, 2)

        if score >= 70:
            level = "High"
            action_type = "urgent"
        elif score >= 45:
            level = "Medium"
            action_type = "planned"
        else:
            level = "Low"
            action_type = "monitor"

        return {
            "visit_priority_score": score,
            "priority_level": level,
            "action_type": action_type,
            "explanation": self._build_explanation(data, level),
        }


# Singleton instance — imported by routes
ml_service = MLService()
