from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import connect_db, disconnect_db
from app.ml.predictor import ml_service
from app.api.routes import (
    auth,
    dashboard,
    recommendations,
    visit_planner,
    risk_analyzer,
    analytics,
    mandi,
    ai_chat,
    settings as settings_router,
    retailers,
    growers,
    visit_feedback,
    notifications,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    ml_service.load()
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="AgroAI Backend API",
    description="Backend for AgroAI — Farmer First Field Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,             prefix="/api/v1/auth",            tags=["Auth"])
app.include_router(dashboard.router,        prefix="/api/v1/dashboard",       tags=["Dashboard"])
app.include_router(recommendations.router,  prefix="/api/v1/recommendations", tags=["Recommendations"])
app.include_router(visit_planner.router,    prefix="/api/v1/visit-planner",   tags=["Visit Planner"])
app.include_router(visit_feedback.router,   prefix="/api/v1/visit-feedback",  tags=["Visit Feedback"])
app.include_router(risk_analyzer.router,    prefix="/api/v1/risk-analyzer",   tags=["Risk Analyzer"])
app.include_router(analytics.router,        prefix="/api/v1/analytics",       tags=["Analytics"])
app.include_router(retailers.router,        prefix="/api/v1/retailers",       tags=["Retailer Insights"])
app.include_router(growers.router,          prefix="/api/v1/growers",         tags=["Grower Insights"])
app.include_router(mandi.router,            prefix="/api/v1/mandi",           tags=["Mandi Prices"])
app.include_router(ai_chat.router,          prefix="/api/v1/ai-chat",         tags=["AI Chat"])
app.include_router(notifications.router,    prefix="/api/v1/notifications",   tags=["Notifications"])
app.include_router(settings_router.router,  prefix="/api/v1/settings",        tags=["Settings"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "app": "AgroAI Backend", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "ml_models_loaded": ml_service._loaded}
