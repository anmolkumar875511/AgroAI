from models.ml_models import MLModelLoader
import pandas as pd
import numpy as np

class MLService:
    def __init__(self):
        # Initialize the Singleton Loader
        self.loader = MLModelLoader()

    def predict_priority(self, field_data: dict):
        # 1. Align MongoDB JSON data with the EXACT order of the .pkl feature list
        # We use the features list loaded from agroai_model_features.pkl
        feature_list = self.loader.features
        
        # Build the input vector based on the model's expected feature order
        input_vector = []
        for feat in feature_list:
            # Get value from dict; if missing, use 0.0 as default
            val = field_data.get(feat, 0.0)
            input_vector.append(val)
            
        # Convert to DataFrame as Scikit-Learn models expect feature names/indices
        df = pd.DataFrame([input_vector], columns=feature_list)
        
        # 2. Predict Score (Regressor)
        score = self.loader.regressor.predict(df)[0]
        
        # 3. Predict Category (Classifier)
        category = self.loader.classifier.predict(df)[0]
        
        # 4. Generate a simple human-readable explanation
        reason = self._generate_reason(field_data, category)
        
        return {
            "score": round(float(score), 2),
            "priority": str(category),
            "ai_reason": reason
        }

    def _generate_reason(self, data, category):
        if category == "High" or category == "critical":
            return f"Critical risk detected in {data.get('crop', 'crop')} due to low NDVI and high pest history."
        if category == "Medium" or category == "medium":
            return "Moderate priority based on time since last visit and seasonal trends."
        return "General monitoring recommended based on stable crop health."

# Create a single instance to be used across the app
ml_service = MLService()