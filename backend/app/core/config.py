from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AgroAI Backend"
    DEBUG: bool = False

    # MongoDB Atlas
    MONGODB_URL: str = "mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority"
    DB_NAME: str = "agroai"

    # JWT
    SECRET_KEY: str = "change-this-to-a-strong-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS — add your frontend URL here
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://agroai.vercel.app",
    ]

    # ML model paths (relative to project root)
    MODEL_DIR: str = "models"
    REGRESSOR_PATH: str = "models/agroai_visit_priority_regressor.pkl"
    CLASSIFIER_PATH: str = "models/agroai_priority_classifier.pkl"
    FEATURES_PATH: str = "models/agroai_model_features.pkl"

    # OpenWeatherMap (optional — for live weather)
    OPENWEATHER_API_KEY: str = ""

    # Google Maps (optional — for geocoding)
    GOOGLE_MAPS_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
