"""Manager dashboard route — team overview, rep performance, missed opportunities."""
import random
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import get_db
from app.core.security import get_current_user, require_manager
from app.models.models import Visit, User
from app.schemas.schemas import (
    ManagerDashboardResponse, RepSummary, NudgeRequest,
)

router = APIRouter()

REPS_STATIC = [
    {"id": "rep1", "name": "Amit Sharma", "territory": "Patna North", "visits": 38, "target": 40,
     "revenue": 320000, "acceptance": 92, "efficiency": 88.5, "status": "active",
     "last_active": "10 mins ago", "phone": "+91 98765 43210"},
    {"id": "rep2", "name": "Priya Tiwari", "territory": "Muzaffarpur South", "visits": 29, "target": 35,
     "revenue": 245000, "acceptance": 85, "efficiency": 82.8, "status": "active",
     "last_active": "2 hrs ago", "phone": "+91 87654 32109"},
    {"id": "rep3", "name": "Rajesh Verma", "territory": "Gaya West", "visits": 31, "target": 40,
     "revenue": 260000, "acceptance": 80, "efficiency": 78.4, "status": "offline",
     "last_active": "1 day ago", "phone": "+91 76543 21098"},
    {"id": "rep4", "name": "Suresh Kumar", "territory": "Varanasi, UP", "visits": 25, "target": 30,
     "revenue": 198000, "acceptance": 75, "efficiency": 71.2, "status": "active",
     "last_active": "45 mins ago", "phone": "+91 98712 34567"},
    {"id": "rep5", "name": "Neha Singh", "territory": "Ahmedabad, Gujarat", "visits": 22, "target": 30,
     "revenue": 182000, "acceptance": 67, "efficiency": 68.9, "status": "active",
     "last_active": "1 hr ago", "phone": "+91 87623 45678"},
]

REVENUE_TREND = [
    {"name": "May 20", "revenue": 42000, "visits": 12},
    {"name": "May 21", "revenue": 58000, "visits": 15},
    {"name": "May 22", "revenue": 49000, "visits": 11},
    {"name": "May 23", "revenue": 65000, "visits": 16},
    {"name": "May 24", "revenue": 72000, "visits": 18},
    {"name": "May 25", "revenue": 81000, "visits": 20},
    {"name": "May 26", "revenue": 60000, "visits": 14},
    {"name": "May 27", "revenue": 89000, "visits": 22},
    {"name": "May 28", "revenue": 95000, "visits": 24},
]

PRODUCT_DEMAND = [
    {"product": "Amistar (Fungicide)", "sales": 420, "stock": 22, "growth": 18, "color": "#8BC34A"},
    {"product": "Actara (Insecticide)", "sales": 380, "stock": 180, "growth": -5, "color": "#1E88E5"},
    {"product": "Score (Fungicide)", "sales": 290, "stock": 56, "growth": 12, "color": "#FFC107"},
    {"product": "Ridomil (Fungicide)", "sales": 250, "stock": 34, "growth": 25, "color": "#E53935"},
    {"product": "Custodia (Fungicide)", "sales": 180, "stock": 145, "growth": 3, "color": "#9C27B0"},
]

MISSED_OPPORTUNITIES = [
    {"id": "mo1", "retailer": "Kisan Agro Kendra", "area": "Muzaffarpur North",
     "priority": "High", "value": 45000, "reason": "High Pest Risk (BPH) alert unattended for 4 days"},
    {"id": "mo2", "retailer": "Mandi Fertilizers", "area": "Patna Rural",
     "priority": "Medium", "value": 28000, "reason": "Amistar Stock Out reported, rep visit pending"},
    {"id": "mo3", "retailer": "Gaya Seeds Store", "area": "Gaya East",
     "priority": "High", "value": 62000, "reason": "High digital engagement but no rep follow-up"},
]


@router.get("/dashboard", response_model=ManagerDashboardResponse)
async def manager_dashboard(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    reps = [
        RepSummary(
            id=r["id"], name=r["name"], territory=r["territory"],
            visits=r["visits"], target=r["target"], revenue=r["revenue"],
            acceptance=r["acceptance"], efficiency=r["efficiency"],
            status=r["status"], last_active=r["last_active"], phone=r["phone"],
        )
        for r in REPS_STATIC
    ]

    total_revenue = sum(r.revenue for r in reps)
    total_visits = sum(r.visits for r in reps)
    total_targets = sum(r.target for r in reps)
    avg_acceptance = round(sum(r.acceptance for r in reps) / len(reps), 1)
    avg_efficiency = round(sum(r.efficiency for r in reps) / len(reps), 1)

    return ManagerDashboardResponse(
        total_revenue=total_revenue,
        total_visits=total_visits,
        total_targets=total_targets,
        avg_acceptance=avg_acceptance,
        avg_efficiency=avg_efficiency,
        reps=reps,
        revenue_trend=REVENUE_TREND,
        product_demand=PRODUCT_DEMAND,
        missed_opportunities=MISSED_OPPORTUNITIES,
    )


@router.post("/nudge")
async def nudge_rep(req: NudgeRequest, _=Depends(get_current_user)):
    return {"status": "ok", "rep_id": req.rep_id, "message": "Nudge sent successfully"}


@router.get("/team-tracking")
async def team_tracking(_=Depends(get_current_user)):
    """Rep-wise visit tracking data for RepVisitTrackingPage."""
    from datetime import datetime
    TIMELINE = [
        {"day": "Mon", "Amit Sharma": 5, "Priya Tiwari": 4, "Rajesh Verma": 3, "Suresh Kumar": 6, "Neha Singh": 5},
        {"day": "Tue", "Amit Sharma": 7, "Priya Tiwari": 5, "Rajesh Verma": 4, "Suresh Kumar": 7, "Neha Singh": 6},
        {"day": "Wed", "Amit Sharma": 6, "Priya Tiwari": 6, "Rajesh Verma": 5, "Suresh Kumar": 8, "Neha Singh": 7},
        {"day": "Thu", "Amit Sharma": 8, "Priya Tiwari": 7, "Rajesh Verma": 3, "Suresh Kumar": 9, "Neha Singh": 6},
        {"day": "Fri", "Amit Sharma": 9, "Priya Tiwari": 8, "Rajesh Verma": 6, "Suresh Kumar": 8, "Neha Singh": 8},
        {"day": "Sat", "Amit Sharma": 4, "Priya Tiwari": 5, "Rajesh Verma": 4, "Suresh Kumar": 5, "Neha Singh": 4},
        {"day": "Sun", "Amit Sharma": 2, "Priya Tiwari": 3, "Rajesh Verma": 2, "Suresh Kumar": 3, "Neha Singh": 3},
    ]
    REPS_LIVE = [
        {"id": 1, "name": "Amit Sharma", "territory": "Patna, Bihar", "visitsToday": 8, "target": 10, "duration": 34, "status": "Active", "lastActive": "10:45 AM"},
        {"id": 2, "name": "Priya Tiwari", "territory": "Amravati, Maharashtra", "visitsToday": 6, "target": 8, "duration": 28, "status": "Active", "lastActive": "11:20 AM"},
        {"id": 3, "name": "Rajesh Verma", "territory": "Ludhiana, Punjab", "visitsToday": 5, "target": 8, "duration": 40, "status": "Idle", "lastActive": "09:30 AM"},
        {"id": 4, "name": "Suresh Kumar", "territory": "Varanasi, UP", "visitsToday": 9, "target": 10, "duration": 30, "status": "Active", "lastActive": "11:45 AM"},
        {"id": 5, "name": "Neha Singh", "territory": "Ahmedabad, Gujarat", "visitsToday": 7, "target": 8, "duration": 32, "status": "Active", "lastActive": "10:15 AM"},
    ]
    return {
        "timeline": TIMELINE,
        "reps": REPS_LIVE,
        "summary": {
            "total_visits_today": sum(r["visitsToday"] for r in REPS_LIVE),
            "completion_rate": 78,
            "avg_duration_min": 32,
            "overdue_visits": 8,
        },
        "recent_activities": [
            {"id": 1, "text": "Amit Sharma completed visit at Kisan Seed Store — Ordered 50 units Amistar 250 SC", "time": "10 mins ago", "type": "order"},
            {"id": 2, "text": "Priya Tiwari completed visit at Amravati Agri-Hub — Follow-up needed for cotton growers", "time": "25 mins ago", "type": "visit"},
            {"id": 3, "text": "Suresh Kumar resolved pest outbreak alert at Varanasi Block B — Recommendation accepted", "time": "40 mins ago", "type": "recommendation"},
            {"id": 4, "text": "Neha Singh logged brand audit at Ahmedabad Seeds Center — Good stock levels maintained", "time": "1 hr ago", "type": "audit"},
            {"id": 5, "text": "Rajesh Verma updated visit feedback at Ludhiana Fertilisers — High demand for Score 250 EC", "time": "2 hrs ago", "type": "visit"},
        ],
    }
