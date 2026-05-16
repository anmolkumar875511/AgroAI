from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    MONGODB_URL: str = os.getenv("MONGODB_URL")
    APP_NAME: str = os.getenv("APP_NAME", "AgroAI Backend")
    DATABASE_NAME: str = "agroai"

settings = Settings()