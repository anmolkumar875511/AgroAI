import joblib
import os

class MLModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLModelLoader, cls).__new__(cls)
            
            # Define paths to your pickle files
            # Ensure these files are actually in the /models folder!
            features_path = "models/agroai_model_features.pkl"
            regressor_path = "models/agroai_visit_priority_regressor.pkl"
            classifier_path = "models/agroai_priority_classifier.pkl"

            try:
                print("Loading ML Models into memory...")
                cls._instance.features = joblib.load(features_path)
                cls._instance.regressor = joblib.load(regressor_path)
                cls._instance.classifier = joblib.load(classifier_path)
                print("All models loaded successfully.")
            except FileNotFoundError as e:
                print(f"ERROR: Model file not found. Please check your /models folder. {e}")
                raise e
            except Exception as e:
                print(f"ERROR: An unexpected error occurred while loading models: {e}")
                raise e
                
        return cls._instance