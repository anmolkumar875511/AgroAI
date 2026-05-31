"""
scripts/train_model.py
─────────────────────
Generates the sklearn priority-scoring model and saves pickles to models_pkl/.
Run once before starting the server if you want ML-backed scoring:

    python scripts/train_model.py

The live app falls back to heuristics if pickles are missing — this script
is only needed for the ML upgrade path.
"""
import os
import sys
import pickle
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "models_pkl")
os.makedirs(OUT_DIR, exist_ok=True)

FEATURE_NAMES = [
    "days_since_visit",
    "stock_status_enc",    # 0=Good, 1=Low, 2=Out
    "priority_enc",        # 0=Low, 1=Medium, 2=High
    "monthly_revenue",
    "pest_risk_enc",       # 0=Low, 1=Medium, 2=High, 3=Critical
]

STOCK_MAP  = {"Good Stock": 0, "Low Stock": 1, "Out of Stock": 2}
PRIORITY_MAP = {"Low": 0, "Medium": 1, "High": 2}
RISK_MAP   = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}


def simulate_score(row: np.ndarray) -> float:
    """Deterministic ground-truth label generator (matches heuristic)."""
    days, stock, priority, revenue, risk = row
    s = 40.0
    s += min(days / 30 * 30, 30)
    s += stock * 10
    s += priority * 7.5
    s += min(revenue / 200000 * 10, 10)
    s += risk * 3.3
    return float(np.clip(s + np.random.normal(0, 2), 10, 100))


def main():
    np.random.seed(42)
    N = 5000

    X = np.column_stack([
        np.random.randint(0, 60, N),            # days_since_visit
        np.random.randint(0, 3, N),             # stock_status_enc
        np.random.randint(0, 3, N),             # priority_enc
        np.random.uniform(10000, 500000, N),    # monthly_revenue
        np.random.randint(0, 4, N),             # pest_risk_enc
    ])
    y = np.array([simulate_score(row) for row in X])

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("gbr", GradientBoostingRegressor(
            n_estimators=200, max_depth=4, learning_rate=0.08,
            subsample=0.8, random_state=42,
        )),
    ])
    model.fit(X, y)

    # Save model
    model_path = os.path.join(OUT_DIR, "agroai_visit_priority_regressor.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"✓ Model saved → {model_path}")

    # Save feature names
    feat_path = os.path.join(OUT_DIR, "agroai_model_features.pkl")
    with open(feat_path, "wb") as f:
        pickle.dump(FEATURE_NAMES, f)
    print(f"✓ Feature list saved → {feat_path}")

    # Save a simple classifier for priority level
    from sklearn.ensemble import RandomForestClassifier
    y_cls = np.where(y >= 70, "High", np.where(y >= 45, "Medium", "Low"))
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y_cls)
    clf_path = os.path.join(OUT_DIR, "agroai_priority_classifier.pkl")
    with open(clf_path, "wb") as f:
        pickle.dump(clf, f)
    print(f"✓ Classifier saved → {clf_path}")

    # Quick accuracy check
    from sklearn.metrics import r2_score, mean_absolute_error
    y_pred = model.predict(X)
    print(f"\nRegressor — R²: {r2_score(y, y_pred):.3f}  MAE: {mean_absolute_error(y, y_pred):.2f}")
    print("Training complete.\n")


if __name__ == "__main__":
    main()
