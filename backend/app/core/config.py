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
    REDIS_URL: str = "redis://localhost:6379/0"

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://agroai.vercel.app",
    ]

    ANTHROPIC_API_KEY: str = ""
    APP_NAME: str = "AgroAI"
    DEBUG: bool = True

    def __init__(self, **values):
        super().__init__(**values)
        if not self.DEBUG and (
            self.SECRET_KEY == "agroai-super-secret-key-change-in-production-2024" or
            self.SECRET_KEY == "agroai-super-secret-key-change-in-production-please" or
            len(self.SECRET_KEY) < 32
        ):
            import secrets
            # Generate a secure key for runtime safety in production if not explicitly overridden with a strong key
            self.SECRET_KEY = secrets.token_hex(32)


settings = Settings()
