# AgroAI ML Module

This folder contains the Machine Learning part of the AgroAI project.

## Notebook

- `notebook/agroai.ipynb`

This notebook contains the complete ML workflow:
- Data loading
- Data preprocessing
- Feature engineering
- Model training
- Model evaluation
- Final output generation

## Model Files

### `models/agroai_visit_priority_regressor.pkl`
This model predicts the visit priority score for field planning.

### `models/agroai_priority_classifier.pkl`
This model predicts the priority level:
- High
- Medium
- Low

### `models/agroai_model_features.pkl`
This file stores the feature column order required by the backend while making predictions.

## Output CSV Files

### `outputs/agroai_recommendations.csv`
Final recommendation output for frontend/backend demo.

### `outputs/agroai_master_scored_data.csv`
Master scored dataset containing priority score, priority level, and related fields.

### `outputs/agroai_feature_importance.csv`
Feature importance output from the trained model.

## Environment

The original model files were generated in Kaggle environment:

- Python: 3.12.12
- scikit-learn: 1.6.1
- joblib: 1.5.3
- pandas: 2.3.3
- numpy: 2.0.2

## Backend Note

Backend can load the model files using joblib:

```python
import joblib

reg_model = joblib.load("ml/models/agroai_visit_priority_regressor.pkl")
clf_model = joblib.load("ml/models/agroai_priority_classifier.pkl")
features = joblib.load("ml/models/agroai_model_features.pkl")