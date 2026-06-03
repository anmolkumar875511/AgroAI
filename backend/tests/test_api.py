"""
AgroAI Backend — Pytest Test Suite
Run: pytest tests/ -v
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.core.database import get_db, Base
from app.core.security import hash_password

# ── In-memory test database ───────────────────────────────────────────────────
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSession = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_db():
    async with TestSession() as session:
        yield session

app.dependency_overrides[get_db] = override_db


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    """Create tables + seed test data into the in-memory DB."""
    from app.models.models import (  # noqa — registers all with Base
        User, Territory, Retailer, RetailerInventory,
        Grower, Recommendation, Notification, MandiPrice,
        Visit, RiskEvent, VisitFeedback,
    )
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed minimal test data directly (bypass seed_service's hardcoded session)
    async with TestSession() as db:
        from app.models.models import User, Retailer, Recommendation, Notification, MandiPrice, Grower, RiskEvent
        from datetime import date

        # Users
        agent = User(
            email="amit@agroai.com",
            hashed_password=hash_password("password123"),
            name="Amit Sharma", role="agent",
            territory_id="TER_0001", territory="Patna North",
            employee_id="EMP001",
        )
        manager = User(
            email="manager@agroai.com",
            hashed_password=hash_password("password123"),
            name="Rajiv Mehta", role="manager",
            territory_id="TER_0001", territory="Bihar Region",
            employee_id="MGR001",
        )
        db.add_all([agent, manager])
        await db.flush()

        # Retailers
        for i in range(5):
            r = Retailer(
                retailer_id=f"RTL_{i+1:05d}",
                name=f"Test Retailer {i+1}",
                territory_id="TER_0001",
                location=f"Patna Sadar, Patna",
                district="Patna", state="Bihar",
                priority_level=["High", "High", "Medium", "Medium", "Low"][i],
                visit_priority_score=85.0 - i * 10,
                stock_status=["Good Stock", "Low Stock", "Good Stock", "Out of Stock", "Good Stock"][i],
                total_stock_qty=[200, 40, 150, 0, 300][i],
                last_visit_days=i * 7,
                recommended_product="Amistar 250 SC",
                explanation="Test explanation.",
                monthly_revenue=200000.0,
            )
            db.add(r)

        # Growers
        for i in range(4):
            db.add(Grower(
                territory_id="TER_0001",
                tehsil="Patna Sadar",
                district="Patna", state="Bihar",
                crop_type=["Rice", "Wheat", "Cotton", "Maize"][i],
                crop_stage="Vegetative",
                grower_count=100 + i * 50,
                pest_risk=["Critical", "High", "Medium", "Low"][i],
                urgency_score=90 - i * 20,
                product_scans=50 + i * 20,
                engagement_rate=0.7 - i * 0.1,
                recommended_product="Actara 25 WG",
                recommended_advisory="Apply immediately.",
            ))

        # Recommendations
        for n in range(1, 4):
            db.add(Recommendation(
                id=f"REC_00{n}",
                territory_id="TER_0001",
                priority=["Critical", "High", "Medium"][n - 1],
                crop="Rice",
                message=f"Test recommendation {n}",
                pest_risk="High",
                retailer_id=f"RTL_{n:05d}",
                status="pending",
                explainable_reasons=[
                    {"id": "r1", "title": "Pest Risk", "description": "High risk detected", "icon": "Bug"}
                ],
            ))

        # Notifications
        for i, (title, ntype) in enumerate([
            ("Pest Alert", "alert"),
            ("Stock Warning", "warning"),
            ("Visit Done", "success"),
            ("Report Ready", "info"),
        ]):
            db.add(Notification(
                user_id=agent.id,
                title=title,
                message=f"Test notification {i + 1}",
                type=ntype,
                read=(i >= 2),
            ))

        # Risk Events
        for i in range(12):
            db.add(RiskEvent(
                territory_id="TER_0001",
                event_type="pest" if i % 2 == 0 else "weather",
                severity="High" if i % 3 == 0 else "Medium",
                lat=25.5941 + i * 0.01,
                lng=85.1376 + i * 0.01,
                description=f"Test risk event {i+1}",
                crop="Rice",
                affected_area_km2=10.0,
            ))

        # Mandi prices
        for commodity, state, price in [
            ("Paddy", "Bihar", 2183),
            ("Wheat", "Bihar", 2250),
            ("Cotton", "Maharashtra", 7200),
        ]:
            db.add(MandiPrice(
                commodity=commodity,
                mandi="Patna",
                state=state,
                price=price,
                change=45.0,
                change_pct=2.1,
            ))

        await db.commit()

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_headers(client):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "amit@agroai.com", "password": "password123"
    })
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


@pytest_asyncio.fixture
async def manager_headers(client):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "manager@agroai.com", "password": "password123"
    })
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


# ─────────────────────────────────────────────────────────────────────────────
# Health + Auth
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_login_success(client):
    r = await client.post("/api/v1/auth/login", json={
        "email": "amit@agroai.com", "password": "password123"
    })
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["user"]["role"] == "agent"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    r = await client.post("/api/v1/auth/login", json={
        "email": "amit@agroai.com", "password": "wrongpass"
    })
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_me(client, auth_headers):
    r = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == "amit@agroai.com"


@pytest.mark.asyncio
async def test_protected_without_token(client):
    r = await client.get("/api/v1/auth/me")
    assert r.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_dashboard(client, auth_headers):
    r = await client.get("/api/v1/dashboard/TER_0001", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "kpis" in data
    assert len(data["kpis"]) == 4
    assert "mandi_prices" in data
    assert "weekly_performance" in data
    assert len(data["weekly_performance"]) == 7
    # KPI structure check
    kpi = data["kpis"][0]
    assert "id" in kpi and "value" in kpi and "trend_direction" in kpi


# ─────────────────────────────────────────────────────────────────────────────
# Analytics
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_analytics(client, auth_headers):
    r = await client.get("/api/v1/analytics/TER_0001?date_range=14d", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    for key in ["field_efficiency", "revenue_per_visit", "recommendation_acceptance",
                "regional_performance", "crop_risk_trends", "stock_utilization"]:
        assert key in data


@pytest.mark.asyncio
async def test_analytics_all_ranges(client, auth_headers):
    for dr in ["7d", "14d", "30d", "90d"]:
        r = await client.get(f"/api/v1/analytics/TER_0001?date_range={dr}", headers=auth_headers)
        assert r.status_code == 200, f"Failed for {dr}"


# ─────────────────────────────────────────────────────────────────────────────
# Retailers
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_retailers_list(client, auth_headers):
    r = await client.get("/api/v1/retailers/?territory_id=TER_0001", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "retailers" in data and "total" in data
    assert data["total"] >= 5


@pytest.mark.asyncio
async def test_retailers_filter_priority(client, auth_headers):
    r = await client.get(
        "/api/v1/retailers/?territory_id=TER_0001&priority=High", headers=auth_headers
    )
    assert r.status_code == 200
    for ret in r.json()["retailers"]:
        assert ret["priority_level"] == "High"


@pytest.mark.asyncio
async def test_retailers_filter_stock(client, auth_headers):
    r = await client.get(
        "/api/v1/retailers/?territory_id=TER_0001&stock=Low Stock", headers=auth_headers
    )
    assert r.status_code == 200
    for ret in r.json()["retailers"]:
        assert ret["stock_status"] == "Low Stock"


@pytest.mark.asyncio
async def test_retailers_search(client, auth_headers):
    r = await client.get(
        "/api/v1/retailers/?territory_id=TER_0001&search=Test", headers=auth_headers
    )
    assert r.status_code == 200
    assert r.json()["total"] >= 0


@pytest.mark.asyncio
async def test_retailer_rescore(client, auth_headers):
    r = await client.post("/api/v1/retailers/RTL_00001/rescore", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "new_score" in data
    assert 10.0 <= data["new_score"] <= 100.0
    assert data["priority_level"] in ["High", "Medium", "Low"]


# ─────────────────────────────────────────────────────────────────────────────
# Growers
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_grower_summary(client, auth_headers):
    r = await client.get("/api/v1/growers/summary/TER_0001", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "total_growers" in data
    assert "digital_engagement_rate" in data
    assert "high_urgency_clusters" in data


@pytest.mark.asyncio
async def test_grower_clusters(client, auth_headers):
    r = await client.get("/api/v1/growers/clusters?territory_id=TER_0001", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "clusters" in data and "total" in data


@pytest.mark.asyncio
async def test_grower_clusters_filtered_high(client, auth_headers):
    r = await client.get(
        "/api/v1/growers/clusters?territory_id=TER_0001&urgency=High", headers=auth_headers
    )
    assert r.status_code == 200
    for c in r.json()["clusters"]:
        assert c["pest_risk"] == "High"


@pytest.mark.asyncio
async def test_grower_clusters_filtered_crop(client, auth_headers):
    r = await client.get(
        "/api/v1/growers/clusters?territory_id=TER_0001&crop=Rice", headers=auth_headers
    )
    assert r.status_code == 200
    for c in r.json()["clusters"]:
        assert c["crop_type"] == "Rice"


# ─────────────────────────────────────────────────────────────────────────────
# Recommendations
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_recommendations(client, auth_headers):
    r = await client.get("/api/v1/recommendations/TER_0001", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0
    rec = data[0]
    assert "id" in rec and "priority" in rec and "explainable_reasons" in rec


@pytest.mark.asyncio
async def test_apply_recommendation(client, auth_headers):
    r = await client.post("/api/v1/recommendations/apply", json={
        "recommendation_id": "REC_001",
        "retailer_id": "RTL_00001",
        "action": "apply",
    }, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "applied"


@pytest.mark.asyncio
async def test_dismiss_recommendation(client, auth_headers):
    r = await client.post("/api/v1/recommendations/apply", json={
        "recommendation_id": "REC_002",
        "retailer_id": "RTL_00002",
        "action": "dismiss",
    }, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "dismissed"


# ─────────────────────────────────────────────────────────────────────────────
# Risk Analyzer
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_risk_analyzer(client, auth_headers):
    r = await client.get(
        "/api/v1/risk/TER_0001?lat=25.5941&lng=85.1376", headers=auth_headers
    )
    assert r.status_code == 200
    data = r.json()
    assert "heatmap" in data and "ndvi_data" in data
    assert "weather_anomalies" in data and "pest_outbreaks" in data
    assert "ai_insights" in data
    assert data["overall_risk_level"] in ["Critical", "High", "Medium", "Low"]
    assert len(data["heatmap"]) == 12
    assert len(data["ndvi_data"]) == 12


# ─────────────────────────────────────────────────────────────────────────────
# Visit Planner
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_visit_planner_priority(client, auth_headers):
    r = await client.get("/api/v1/visit-planner/priority/TER_0001", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    if data:
        item = data[0]
        assert "score" in item and "ai_reason" in item and "retailer_id" in item


@pytest.mark.asyncio
async def test_visit_planner_filter_high(client, auth_headers):
    r = await client.get(
        "/api/v1/visit-planner/priority/TER_0001?filter=high", headers=auth_headers
    )
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_visit_planner_action(client, auth_headers):
    r = await client.post(
        "/api/v1/visit-planner/action/TER_0001",
        json={"retailer_id": "RTL_00001", "action": "start"},
        headers=auth_headers,
    )
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_visit_route(client, auth_headers):
    r = await client.get("/api/v1/visit-planner/route/TER_0001", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "stops" in data and "total_km" in data and "total_time_min" in data


# ─────────────────────────────────────────────────────────────────────────────
# Visit Feedback
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_submit_visit_feedback(client, auth_headers):
    r = await client.post("/api/v1/visit-feedback/submit/TER_0001", json={
        "retailer_id": "RTL_00001",
        "visit_status": "completed",
        "products_discussed": ["Amistar 250 SC", "Actara 25 WG"],
        "order_placed": True,
        "order_quantity": 50,
        "order_value": 12500.0,
        "farmer_response": "positive",
        "follow_up_needed": False,
        "notes": "Good visit.",
    }, headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "id" in data
    assert data["retailer_id"] == "RTL_00001"


@pytest.mark.asyncio
async def test_submit_feedback_missing_retailer(client, auth_headers):
    r = await client.post("/api/v1/visit-feedback/submit/TER_0001",
        json={"visit_status": "completed"},
        headers=auth_headers)
    assert r.status_code == 422


# ─────────────────────────────────────────────────────────────────────────────
# Notifications
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_notifications(client, auth_headers):
    r = await client.get("/api/v1/notifications/", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "notifications" in data and "unread_count" in data
    assert isinstance(data["notifications"], list)
    assert len(data["notifications"]) >= 2
    n = data["notifications"][0]
    assert "title" in n and "type" in n and "time" in n


@pytest.mark.asyncio
async def test_unread_only(client, auth_headers):
    r = await client.get("/api/v1/notifications/?unread_only=true", headers=auth_headers)
    assert r.status_code == 200
    for n in r.json()["notifications"]:
        assert n["read"] is False


@pytest.mark.asyncio
async def test_mark_all_read(client, auth_headers):
    r = await client.patch("/api/v1/notifications/mark-all-read", headers=auth_headers)
    assert r.status_code == 200
    r2 = await client.get("/api/v1/notifications/", headers=auth_headers)
    assert r2.json()["unread_count"] == 0


# ─────────────────────────────────────────────────────────────────────────────
# Settings
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_settings(client, auth_headers):
    r = await client.get("/api/v1/settings/", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "language" in data and "theme" in data


@pytest.mark.asyncio
async def test_update_settings(client, auth_headers):
    r = await client.patch("/api/v1/settings/", json={
        "theme": "light",
        "language": "Hindi (हिंदी)",
        "sync_enabled": False,
    }, headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["theme"] == "light"
    assert data["language"] == "Hindi (हिंदी)"


# ─────────────────────────────────────────────────────────────────────────────
# Mandi Prices
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_mandi_prices(client, auth_headers):
    r = await client.get("/api/v1/mandi/", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "prices" in data and "updated_at" in data
    assert len(data["prices"]) > 0
    p = data["prices"][0]
    assert "commodity" in p and "price" in p and "mandi" in p


@pytest.mark.asyncio
async def test_mandi_prices_state_filter(client, auth_headers):
    r = await client.get("/api/v1/mandi/?state=Bihar", headers=auth_headers)
    assert r.status_code == 200
    for p in r.json()["prices"]:
        assert p["state"] == "Bihar"


# ─────────────────────────────────────────────────────────────────────────────
# Manager
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_manager_dashboard(client, manager_headers):
    r = await client.get("/api/v1/manager/dashboard", headers=manager_headers)
    assert r.status_code == 200
    data = r.json()
    assert "total_revenue" in data and "reps" in data
    assert len(data["reps"]) > 0
    assert "revenue_trend" in data and "missed_opportunities" in data


@pytest.mark.asyncio
async def test_manager_team_tracking(client, manager_headers):
    r = await client.get("/api/v1/manager/team-tracking", headers=manager_headers)
    assert r.status_code == 200
    data = r.json()
    assert "timeline" in data and "reps" in data and "summary" in data


@pytest.mark.asyncio
async def test_nudge_rep(client, manager_headers):
    r = await client.post("/api/v1/manager/nudge", json={
        "rep_id": "rep1",
        "message": "Please visit Kisan Agro today.",
    }, headers=manager_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ─────────────────────────────────────────────────────────────────────────────
# ML Predictor (pure unit tests — no HTTP)
# ─────────────────────────────────────────────────────────────────────────────

def test_ml_predictor_heuristic():
    from app.ml.predictor import predict_priority_score
    score = predict_priority_score(35, "Low Stock", "High", 250000, "High")
    assert 10.0 <= score <= 100.0


def test_ml_high_risk_scores_higher():
    from app.ml.predictor import predict_priority_score
    high = predict_priority_score(40, "Out of Stock", "High", 300000, "Critical")
    low  = predict_priority_score(2,  "Good Stock",   "Low",  20000,  "Low")
    assert high > low


def test_ml_classify_priority():
    from app.ml.predictor import classify_priority
    assert classify_priority(85.0) == "High"
    assert classify_priority(55.0) == "Medium"
    assert classify_priority(20.0) == "Low"
    assert classify_priority(70.0) == "High"
    assert classify_priority(44.9) == "Low"
