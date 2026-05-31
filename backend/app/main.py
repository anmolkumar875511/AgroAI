"""
AgroAI Backend — FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import (
    auth, dashboard, analytics, recommendations,
    retailers, growers, risk_analyzer, visit_planner,
    visit_feedback, notifications, settings as settings_router,
    mandi, ai_chat, manager,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    await init_db()
    yield


app = FastAPI(
    title="AgroAI Field Intelligence API",
    description="Backend for AgroAI — Farmer First Field Intelligence Platform",
    version="2.0.0",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth.router,              prefix=PREFIX + "/auth",             tags=["Auth"])
app.include_router(dashboard.router,         prefix=PREFIX + "/dashboard",        tags=["Dashboard"])
app.include_router(analytics.router,         prefix=PREFIX + "/analytics",        tags=["Analytics"])
app.include_router(recommendations.router,   prefix=PREFIX + "/recommendations",  tags=["Recommendations"])
app.include_router(retailers.router,         prefix=PREFIX + "/retailers",        tags=["Retailers"])
app.include_router(growers.router,           prefix=PREFIX + "/growers",          tags=["Growers"])
app.include_router(risk_analyzer.router,     prefix=PREFIX + "/risk",             tags=["Risk Analyzer"])
app.include_router(visit_planner.router,     prefix=PREFIX + "/visit-planner",    tags=["Visit Planner"])
app.include_router(visit_feedback.router,    prefix=PREFIX + "/visit-feedback",   tags=["Visit Feedback"])
app.include_router(notifications.router,     prefix=PREFIX + "/notifications",    tags=["Notifications"])
app.include_router(settings_router.router,   prefix=PREFIX + "/settings",         tags=["Settings"])
app.include_router(mandi.router,             prefix=PREFIX + "/mandi",            tags=["Mandi Prices"])
app.include_router(ai_chat.router,           prefix=PREFIX + "/chat",             tags=["AI Chat"])
app.include_router(manager.router,           prefix=PREFIX + "/manager",          tags=["Manager"])


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "AgroAI API", "version": "2.0.0"}
