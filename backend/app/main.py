"""
AgroAI Backend — FastAPI Application Entry Point
"""
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import time
import json
import logging
import os
from datetime import datetime

from app.core.config import settings
from app.core.database import init_db
from app.core.redis import init_redis
from app.api.routes import (
    auth, dashboard, analytics, recommendations,
    retailers, growers, risk_analyzer, visit_planner,
    visit_feedback, notifications, settings as settings_router,
    mandi, ai_chat, manager, media, admin, websocket,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    await init_db()
    await init_redis()
    yield
    from app.core.redis import redis_client, redis_available
    if redis_available and redis_client:
        try:
            await redis_client.close()
        except Exception:
            pass


app = FastAPI(
    title="AgroAI Field Intelligence API",
    description="Backend for AgroAI — Farmer First Field Intelligence Platform",
    version="2.0.0",
    lifespan=lifespan,
)

# ── Audit Logger Setup ────────────────────────────────────────────────────────
logger = logging.getLogger("agroai_audit")
logger.setLevel(logging.INFO)
logger.propagate = False

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_FILE_PATH = os.path.join(BASE_DIR, "agroai_audit.log")

handler = logging.FileHandler(LOG_FILE_PATH, encoding="utf-8")
formatter = logging.Formatter("%(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

@app.middleware("http")
async def audit_log_middleware(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
    except Exception as e:
        duration = time.time() - start_time
        client_host = request.client.host if request.client else "unknown"
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "method": request.method,
            "path": request.url.path,
            "status_code": 500,
            "client_ip": client_host,
            "duration_ms": round(duration * 1000, 2),
            "error": str(type(e).__name__),
        }
        try:
            logger.info(json.dumps(log_data))
        except Exception:
            pass
        raise e

    duration = time.time() - start_time
    client_host = request.client.host if request.client else "unknown"
    log_data = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "client_ip": client_host,
        "duration_ms": round(duration * 1000, 2),
    }
    try:
        logger.info(json.dumps(log_data))
    except Exception:
        pass
        
    return response

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)

cors_origins = settings.ALLOWED_ORIGINS
cors_origin_regex = r"https?://(localhost|127\.0\.0\.1)(:\d+)?" if settings.DEBUG else None

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
app.include_router(media.router,             prefix=PREFIX + "/media",            tags=["Media"])
app.include_router(admin.router,             prefix=PREFIX + "/admin",            tags=["Admin"])
app.include_router(websocket.router,         prefix=PREFIX + "/ws",               tags=["WebSocket"])

# Mount Static Files for Uploads
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "AgroAI API", "version": "2.0.0"}
