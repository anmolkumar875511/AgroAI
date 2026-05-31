# AgroAI Backend — Field Intelligence API v2.0

FastAPI backend for the AgroAI Farmer First Field Intelligence Platform.

---

## Python Version Compatibility

| Python | Status | Notes |
|--------|--------|-------|
| 3.11   | ✅ Supported | Recommended minimum |
| 3.12   | ✅ Supported | Tested, all 40 tests pass |
| 3.13   | ✅ Supported | |
| 3.14   | ✅ Supported | Requires pydantic>=2.11.0 (already in requirements.txt) |

> **If you hit a `pydantic-core` build error** it means your pip is trying to resolve an old pinned version. The loose bounds in `requirements.txt` (`pydantic[email]>=2.11.0`) will pull a pre-built wheel for Python 3.14 automatically.

---

## Quick Start (3 commands)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Copy and configure env
cp .env.example .env        # edit SECRET_KEY, optionally add ANTHROPIC_API_KEY

# 3. Start server  (auto-creates DB + seeds demo data on first boot)
uvicorn app.main:app --reload --port 8000
```

Swagger docs: http://localhost:8000/docs  
ReDoc: http://localhost:8000/redoc  
Health: http://localhost:8000/health

---

## Demo Credentials

| Role     | Email                  | Password      |
|----------|------------------------|---------------|
| Agent    | amit@agroai.com        | password123   |
| Manager  | manager@agroai.com     | password123   |

---

## Project Structure

```
agroai_backend/
├── app/
│   ├── main.py                    ← FastAPI app + router registration
│   ├── api/routes/                ← One file per domain
│   │   ├── auth.py                POST /login, GET /me
│   │   ├── dashboard.py           GET /{territory_id}
│   │   ├── analytics.py           GET /{territory_id}?date_range=
│   │   ├── retailers.py           GET /, POST /{id}/rescore
│   │   ├── growers.py             GET /summary/{id}, GET /clusters
│   │   ├── recommendations.py     GET /{territory_id}, POST /apply
│   │   ├── risk_analyzer.py       GET /{territory_id}
│   │   ├── visit_planner.py       GET /priority/{id}, POST /action, GET /route
│   │   ├── visit_feedback.py      POST /submit/{territory_id}
│   │   ├── notifications.py       GET /, PATCH /{id}/read, PATCH /mark-all-read
│   │   ├── settings.py            GET /, PATCH /
│   │   ├── mandi.py               GET /
│   │   ├── ai_chat.py             POST /
│   │   └── manager.py             GET /dashboard, GET /team-tracking, POST /nudge
│   ├── core/
│   │   ├── config.py              Pydantic settings (env vars)
│   │   ├── database.py            Async SQLAlchemy engine + session
│   │   └── security.py            JWT + bcrypt
│   ├── models/models.py           SQLAlchemy ORM (all tables)
│   ├── schemas/schemas.py         Pydantic v2 request/response models
│   ├── services/                  Business logic (one file per domain)
│   │   ├── seed_service.py        Seeds 3 users, 18 retailers, 15 grower clusters…
│   │   ├── dashboard_service.py
│   │   ├── analytics_service.py
│   │   ├── retailers_service.py
│   │   ├── growers_service.py
│   │   ├── recommendations_service.py
│   │   ├── risk_service.py
│   │   ├── visit_service.py
│   │   ├── notifications_service.py
│   │   ├── mandi_service.py
│   │   └── chat_service.py
│   └── ml/predictor.py            Visit priority scorer (sklearn + heuristic fallback)
├── scripts/train_model.py         Generates models_pkl/ pickles (optional)
├── tests/test_api.py              40 pytest tests (all pass)
├── requirements.txt
├── requirements-dev.txt
├── .env.example
├── pytest.ini
├── Dockerfile
├── docker-compose.yml
└── client.ts                      ← Copy to src/api/client.ts in your frontend
```

---

## API Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/login | Get JWT token |
| GET | /api/v1/auth/me | Current user profile |
| GET | /api/v1/dashboard/{territory_id} | KPIs, mandi prices, weekly chart |
| GET | /api/v1/analytics/{territory_id} | 6 analytics charts |
| GET | /api/v1/retailers/ | Paginated + filtered retailer cards |
| POST | /api/v1/retailers/{id}/rescore | Re-run ML priority score |
| GET | /api/v1/growers/summary/{territory_id} | Grower aggregate stats |
| GET | /api/v1/growers/clusters | Filtered grower clusters |
| GET | /api/v1/recommendations/{territory_id} | AI recommendations |
| POST | /api/v1/recommendations/apply | Apply or dismiss recommendation |
| GET | /api/v1/risk/{territory_id} | Heatmap, NDVI, weather, pest data |
| GET | /api/v1/visit-planner/priority/{territory_id} | Priority visit queue |
| POST | /api/v1/visit-planner/action/{territory_id} | Record visit action |
| GET | /api/v1/visit-planner/route/{territory_id} | Optimised route stops |
| POST | /api/v1/visit-feedback/submit/{territory_id} | Submit visit feedback |
| GET | /api/v1/notifications/ | User notifications |
| PATCH | /api/v1/notifications/{id}/read | Mark one read |
| PATCH | /api/v1/notifications/mark-all-read | Mark all read |
| GET | /api/v1/settings/ | User settings |
| PATCH | /api/v1/settings/ | Update settings |
| GET | /api/v1/mandi/ | Mandi commodity prices |
| POST | /api/v1/chat/ | AI chat (Anthropic) |
| GET | /api/v1/manager/dashboard | Manager overview |
| GET | /api/v1/manager/team-tracking | Rep visit tracking |
| POST | /api/v1/manager/nudge | Send rep nudge notification |

---

## Known Dependency Constraints

**bcrypt must be `>=4.0.0,<5.0.0`** — `passlib` (which handles password hashing) is incompatible with `bcrypt>=5.x`. The `requirements.txt` pins this range automatically.

---

## Database

- **Default**: SQLite (`agroai.db`) — zero configuration, auto-created on startup
- **Production**: Set `DATABASE_URL=postgresql+asyncpg://user:pass@host/db` in `.env`

Tables: `users`, `territories`, `retailers`, `retailer_inventory`, `visits`,
`visit_feedback`, `growers`, `recommendations`, `risk_events`, `notifications`,
`mandi_prices`

---

## ML Scoring

The visit priority scorer (`app/ml/predictor.py`) uses a weighted heuristic by default.
For sklearn-backed scoring, run the training script once:

```bash
python scripts/train_model.py
```

This creates `models_pkl/agroai_visit_priority_regressor.pkl` and the app will use it automatically.

---

## AI Chat

Set `ANTHROPIC_API_KEY` in `.env` to enable the Claude-powered field intelligence assistant.
The chat endpoint falls back to a rule-based responder when the key is not set.

---

## Testing

```bash
pip install -r requirements-dev.txt
pytest tests/ -v
# 40 tests, all pass
```

---

## Docker

```bash
docker-compose up --build
# API available at http://localhost:8000
```

---

## Frontend Integration

Copy `client.ts` to `src/api/client.ts` in your Vite/React project.
Set `VITE_API_URL=http://localhost:8000/api/v1` in your frontend `.env`.
