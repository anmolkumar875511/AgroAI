"""App configuration via environment variables."""
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    SECRET_KEY: str = "agroai-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    DATABASE_URL: str = "sqlite+aiosqlite:///./agroai.db"

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://agroai.vercel.app",
    ]

    ANTHROPIC_API_KEY: str = ""
    APP_NAME: str = "AgroAI"
    DEBUG: bool = True


settings = Settings()
