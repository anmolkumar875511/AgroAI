"""Async SQLAlchemy database setup + seed helper."""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Create all tables and seed initial data."""
    from app.models.models import (  # noqa: F401 — import to register with Base
        User, Retailer, Visit, VisitFeedback, Notification, RetailerInventory,
        Grower, Recommendation, RiskEvent,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo data
    from app.services.seed_service import seed_all
    await seed_all()
