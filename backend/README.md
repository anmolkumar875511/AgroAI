# AgroAI Backend

FastAPI backend for **AgroAI — Farmer First Field Intelligence Platform**.  
Built for Syngenta Hackathon 2026 · Track: AI-Guided Field Force Intelligence

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI + Uvicorn |
| Database | MongoDB Atlas (Motor async driver) |
| Auth | JWT (python-jose + passlib bcrypt) |
| ML Models | scikit-learn RandomForest (joblib pkl) |
| Validation | Pydantic v2 |

---

## Project Structure

```
agroai-backend/
├── app/
│   ├── main.py                    # FastAPI app + lifespan
│   ├── api/routes/
│   │   ├── auth.py                # Register, Login, Me
│   │   ├── dashboard.py           # KPIs, weekly performance
│   │   ├── recommendations.py     # AI recs + ML predict endpoint
│   │   ├── visit_planner.py       # Priority visits + route
│   │   ├── visit_feedback.py      # Visit outcome form
│   │   ├── risk_analyzer.py       # Heatmap, NDVI, pest, weather
│   │   ├── retailers.py           # Retailer insights CRUD
│   │   ├── growers.py             # Grower cluster insights
│   │   ├── analytics.py           # 6 chart endpoints
│   │   ├── mandi.py               # Mandi prices
│   │   ├── ai_chat.py             # AI assistant chat
│   │   ├── notifications.py       # Notification center
│   │   └── settings.py            # User settings
│   ├── core/
│   │   ├── config.py              # Env-based settings
│   │   ├── database.py            # Motor MongoDB connection
│   │   └── security.py            # JWT + password utils
│   ├── models/models.py           # MongoDB document models
│   ├── schemas/schemas.py         # Request/Response Pydantic schemas
│   ├── services/                  # Business logic layer
│   └── ml/predictor.py            # ML model loader + inference
├── models/                        # Place your .pkl files here
│   ├── agroai_visit_priority_regressor.pkl
│   ├── agroai_priority_classifier.pkl
│   └── agroai_model_features.pkl
├── data/                          # Place CSV files here
│   └── agroai_master_scored_data.csv
├── seed.py                        # Database seed script
├── requirements.txt
└── .env.example
```

---

## Setup

### 1. Clone and install

```bash
cd agroai-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set MONGODB_URL and SECRET_KEY
```

### 3. Place ML model files

Copy your three pkl files into the `models/` folder:
```
models/agroai_visit_priority_regressor.pkl
models/agroai_priority_classifier.pkl
models/agroai_model_features.pkl
```

### 4. Place CSV data

```
data/agroai_master_scored_data.csv
```

### 5. Seed the database

```bash
python seed.py
```

This will:
- Create 5 demo users (field agents, manager, admin)
- Import all **4,000 retailers** from the CSV with ML scores
- Seed notifications and visit logs for demo

**Demo credentials:**
```
amit@agroai.com     / password123   (Field Agent - Bihar)
priya@agroai.com    / password123   (Field Agent - Maharashtra)
rajesh@agroai.com   / password123   (Field Agent - Punjab)
manager@agroai.com  / password123   (Manager)
admin@agroai.com    / admin123      (Admin)
```

### 6. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: **http://localhost:8000/docs**

---

## API Overview

All routes (except `/api/v1/auth/*`) require Bearer JWT token.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login → JWT token |
| GET | `/api/v1/auth/me` | Current user profile |
| GET | `/api/v1/dashboard/` | Full dashboard data |
| GET | `/api/v1/recommendations/` | AI recommendations |
| POST | `/api/v1/recommendations/predict` | Run ML model on custom features |
| POST | `/api/v1/recommendations/apply` | Apply/dismiss recommendation |
| GET | `/api/v1/visit-planner/` | Priority visits list |
| GET | `/api/v1/visit-planner/route` | Optimized route |
| POST | `/api/v1/visit-planner/action` | Record visit action |
| POST | `/api/v1/visit-feedback/` | Submit visit outcome form |
| GET | `/api/v1/risk-analyzer/` | Full risk data |
| GET | `/api/v1/risk-analyzer/heatmap` | Risk heatmap grid |
| GET | `/api/v1/risk-analyzer/ndvi` | NDVI trend data |
| GET | `/api/v1/risk-analyzer/pests` | Pest outbreak pins |
| GET | `/api/v1/risk-analyzer/weather` | Weather anomalies |
| GET | `/api/v1/retailers/` | Retailer insights list |
| GET | `/api/v1/retailers/{retailer_id}` | Full retailer card |
| POST | `/api/v1/retailers/{retailer_id}/score` | Re-run ML score |
| GET | `/api/v1/growers/` | Grower cluster insights |
| GET | `/api/v1/growers/summary` | Territory grower summary |
| GET | `/api/v1/analytics/` | All 6 analytics charts |
| GET | `/api/v1/mandi/` | Today's mandi prices |
| POST | `/api/v1/ai-chat/` | Chat with AgroAI assistant |
| GET | `/api/v1/ai-chat/history` | Chat history |
| GET | `/api/v1/notifications/` | Notification center |
| PATCH | `/api/v1/notifications/{id}/read` | Mark as read |
| GET | `/api/v1/settings/` | Get user settings |
| PATCH | `/api/v1/settings/` | Update settings |

---

## ML Models

The backend uses two models trained on Syngenta hackathon dataset:

| Model | Type | Purpose |
|---|---|---|
| `agroai_visit_priority_regressor.pkl` | RandomForestRegressor | Predict 0-100 visit priority score |
| `agroai_priority_classifier.pkl` | RandomForestClassifier | Classify High / Medium / Low |
| `agroai_model_features.pkl` | List[str] | Feature names (19 features) |

**Top features by importance:**
1. `last_visit_days` (61%)
2. `product_sales_qty_30` (18%)
3. `total_stock_qty` (13%)
4. `sales_qty_30` (3.6%)
5. `engagement_rate` (1.3%)

---

## Frontend Integration

In your React frontend, set the base URL:

```typescript
// In your API client / .env
VITE_API_URL=http://localhost:8000/api/v1
```

Login flow:
```typescript
const res = await fetch(`${VITE_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const { access_token, user } = await res.json();
// Store token, use as: Authorization: Bearer <token>
```
