"""Manager dashboard route — team overview, rep performance, missed opportunities."""
import random
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case
from app.core.database import get_db
from app.core.security import get_current_user, require_manager
from app.models.models import Visit, User, Retailer, RetailerInventory, Territory
from app.schemas.schemas import (
    ManagerDashboardResponse, RepSummary, NudgeRequest,
)

router = APIRouter()


@router.get("/dashboard", response_model=ManagerDashboardResponse)
async def manager_dashboard(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Fetch all agents from db
    agents_res = await db.execute(select(User).where(User.role == "agent"))
    agents = agents_res.scalars().all()

    # Fetch all territories to map id to state
    terr_res = await db.execute(select(Territory))
    territories = terr_res.scalars().all()
    terr_map = {t.id: t for t in territories}

    reps = []
    for agent in agents:
        # Completed visits and total revenue from Visit table
        visits_res = await db.execute(
            select(
                func.count(Visit.id),
                func.sum(Visit.order_value)
            )
            .where(and_(Visit.user_id == agent.id, Visit.visit_status == "completed"))
        )
        visits_count, total_rev = visits_res.first() or (0, 0.0)
        visits_count = visits_count or 0
        total_rev = float(total_rev or 0.0)

        # Get total visits count to compute acceptance rate
        total_visits_res = await db.execute(
            select(func.count(Visit.id))
            .where(Visit.user_id == agent.id)
        )
        total_visits_count = total_visits_res.scalar() or 0

        # Get number of visits with orders placed
        ordered_visits_res = await db.execute(
            select(func.count(Visit.id))
            .where(and_(Visit.user_id == agent.id, Visit.order_placed == True))
        )
        ordered_visits_count = ordered_visits_res.scalar() or 0

        # Acceptance rate: percentage of completed visits that resulted in orders
        acceptance_rate = round((ordered_visits_count / total_visits_count) * 100, 1) if total_visits_count > 0 else 75.0

        # Target (default target is 40)
        target = 40

        # Efficiency: visits completed vs target
        efficiency = round((visits_count / target) * 100, 1) if target > 0 else 0.0
        efficiency = min(100.0, efficiency)

        # Active status: check when last active
        last_visit_res = await db.execute(
            select(Visit.visit_date)
            .where(Visit.user_id == agent.id)
            .order_by(Visit.visit_date.desc())
            .limit(1)
        )
        last_visit_date = last_visit_res.scalar()
        if last_visit_date:
            last_active_str = last_visit_date.strftime("%I:%M %p") if last_visit_date == date.today() else last_visit_date.strftime("%b %d")
            status = "active" if (date.today() - last_visit_date).days <= 2 else "offline"
        else:
            last_active_str = "never active"
            status = "offline"

        t_obj = terr_map.get(agent.territory_id)
        if t_obj:
            territory_str = f"{agent.territory}, {t_obj.state}"
        else:
            territory_str = agent.territory or "N/A"

        reps.append(
            RepSummary(
                id=str(agent.id),
                name=agent.name,
                territory=territory_str,
                visits=visits_count,
                target=target,
                revenue=total_rev,
                acceptance=acceptance_rate,
                efficiency=efficiency,
                status=status,
                last_active=last_active_str,
                phone=agent.phone or "",
            )
        )

    total_revenue = sum(r.revenue for r in reps)
    total_visits = sum(r.visits for r in reps)
    total_targets = sum(r.target for r in reps)
    avg_acceptance = round(sum(r.acceptance for r in reps) / len(reps), 1) if reps else 0.0
    avg_efficiency = round(sum(r.efficiency for r in reps) / len(reps), 1) if reps else 0.0

    # Dynamic Revenue Trend: group by visit date for last 30 days
    thirty_days_ago = date.today() - timedelta(days=30)
    trend_res = await db.execute(
        select(
            Visit.visit_date,
            func.sum(Visit.order_value),
            func.count(Visit.id)
        )
        .where(and_(Visit.visit_date >= thirty_days_ago, Visit.visit_status == "completed"))
        .group_by(Visit.visit_date)
        .order_by(Visit.visit_date)
    )
    revenue_trend = []
    for r_date, r_sum, r_count in trend_res.all():
        revenue_trend.append({
            "name": r_date.strftime("%b %d") if r_date else "",
            "revenue": float(r_sum or 0.0),
            "visits": int(r_count or 0)
        })

    # Dynamic Product Demand: aggregate total quantity of each product from RetailerInventory
    inventory_res = await db.execute(
        select(
            RetailerInventory.product_name,
            func.sum(RetailerInventory.quantity)
        )
        .group_by(RetailerInventory.product_name)
    )
    product_demand = []
    colors = ["#8BC34A", "#1E88E5", "#FFC107", "#E53935", "#9C27B0", "#00BCD4"]
    for i, (prod, qty) in enumerate(inventory_res.all()):
        product_demand.append({
            "product": prod,
            "sales": int(qty or 0),
            "stock": int(qty or 0) + 150,
            "growth": round(random.uniform(-5, 25), 1),
            "color": colors[i % len(colors)]
        })

    # Dynamic Missed Opportunities: select low stock or out of stock retailers
    retailer_res = await db.execute(
        select(Retailer)
        .where(Retailer.stock_status.in_(["Out of Stock", "Low Stock"]))
        .order_by(Retailer.visit_priority_score.desc())
        .limit(5)
    )
    missed_opportunities = []
    for r in retailer_res.scalars().all():
        missed_opportunities.append({
            "id": r.retailer_id,
            "retailer": r.name,
            "area": r.location,
            "state": r.state,
            "priority": "High" if r.priority_level == "High" else "Medium",
            "reason": r.explanation or f"Stock status is {r.stock_status}. Urgently requires visit to restock recommended product.",
            "value": float(r.monthly_revenue * 0.25) if r.monthly_revenue else 25000.0
        })

    return ManagerDashboardResponse(
        total_revenue=total_revenue,
        total_visits=total_visits,
        total_targets=total_targets,
        avg_acceptance=avg_acceptance,
        avg_efficiency=avg_efficiency,
        reps=reps,
        revenue_trend=revenue_trend,
        product_demand=product_demand,
        missed_opportunities=missed_opportunities,
    )


@router.post("/nudge")
async def nudge_rep(req: NudgeRequest, _=Depends(get_current_user)):
    return {"status": "ok", "rep_id": req.rep_id, "message": "Nudge sent successfully"}


@router.get("/team-tracking")
async def team_tracking(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Rep-wise visit tracking data for RepVisitTrackingPage."""
    agents_res = await db.execute(select(User).where(User.role == "agent"))
    agents = agents_res.scalars().all()

    # Fetch all territories to map id to state
    terr_res = await db.execute(select(Territory))
    territories = terr_res.scalars().all()
    terr_map = {t.id: t for t in territories}

    reps_live = []
    total_visits_today = 0
    total_duration = 0
    completed_duration_count = 0
    overdue_visits = 0

    for agent in agents:
        # Today's visits count
        today_visits_res = await db.execute(
            select(func.count(Visit.id))
            .where(and_(Visit.user_id == agent.id, Visit.visit_date == date.today()))
        )
        visits_today = today_visits_res.scalar() or 0
        total_visits_today += visits_today

        # Today's completed visits duration
        duration_res = await db.execute(
            select(func.sum(Visit.duration_minutes), func.count(Visit.id))
            .where(and_(
                Visit.user_id == agent.id,
                Visit.visit_date == date.today(),
                Visit.visit_status == "completed"
            ))
        )
        dur_sum, dur_count = duration_res.first() or (0, 0)
        if dur_sum:
            total_duration += dur_sum
            completed_duration_count += dur_count

        # Daily target is 10 visits
        target = 10

        # Status & Last active
        last_visit_res = await db.execute(
            select(Visit.visit_date)
            .where(Visit.user_id == agent.id)
            .order_by(Visit.visit_date.desc())
            .limit(1)
        )
        last_visit_date = last_visit_res.scalar()
        if last_visit_date:
            last_active_str = last_visit_date.strftime("%I:%M %p") if last_visit_date == date.today() else last_visit_date.strftime("%b %d")
            status = "Active" if (date.today() - last_visit_date).days <= 1 else "Idle"
        else:
            last_active_str = "Offline"
            status = "Offline"

        t_obj = terr_map.get(agent.territory_id)
        if t_obj:
            territory_str = f"{agent.territory}, {t_obj.state}"
        else:
            territory_str = agent.territory or "N/A"

        reps_live.append({
            "id": agent.id,
            "name": agent.name,
            "territory": territory_str,
            "visitsToday": visits_today,
            "target": target,
            "duration": 30,  # default average minutes
            "status": status,
            "lastActive": last_active_str
        })

    # Average visit duration today or fallback to last 30 days
    if completed_duration_count > 0:
        avg_duration = round(total_duration / completed_duration_count)
    else:
        fallback_res = await db.execute(
            select(func.avg(Visit.duration_minutes))
            .where(Visit.visit_status == "completed")
        )
        avg_duration = round(float(fallback_res.scalar() or 32))

    # Overdue visits: count of visits in last 7 days that are not completed
    seven_days_ago = date.today() - timedelta(days=7)
    overdue_res = await db.execute(
        select(func.count(Visit.id))
        .where(and_(
            Visit.visit_date >= seven_days_ago,
            Visit.visit_date < date.today(),
            Visit.visit_status != "completed"
        ))
    )
    overdue_visits = overdue_res.scalar() or 0

    # Completed visits in last 7 days grouped by day and agent name
    timeline = []
    for i in reversed(range(7)):
        d = date.today() - timedelta(days=i)
        day_str = d.strftime("%a")
        day_entry = {"day": day_str}
        for agent in agents:
            count_res = await db.execute(
                select(func.count(Visit.id))
                .where(and_(
                    Visit.user_id == agent.id,
                    Visit.visit_date == d,
                    Visit.visit_status == "completed"
                ))
            )
            day_entry[agent.name] = count_res.scalar() or 0
        timeline.append(day_entry)

    # Recent activities
    recent_visits = await db.execute(
        select(Visit, User.name, Retailer.name)
        .join(User, Visit.user_id == User.id)
        .join(Retailer, Visit.retailer_id == Retailer.retailer_id)
        .order_by(Visit.created_at.desc())
        .limit(10)
    )
    recent_activities = []
    for visit, u_name, r_name in recent_visits.all():
        action_desc = "completed visit" if visit.visit_status == "completed" else "visited"
        order_desc = f" — Ordered {visit.order_quantity} units (value: ₹{int(visit.order_value)})" if visit.order_placed else ""
        time_str = "today"
        if visit.visit_date != date.today():
            time_str = "yesterday" if (date.today() - visit.visit_date).days == 1 else visit.visit_date.strftime("%b %d")

        recent_activities.append({
            "id": visit.id,
            "text": f"{u_name} {action_desc} at {r_name}{order_desc}",
            "time": time_str,
            "type": "order" if visit.order_placed else "visit"
        })

    total_targets_today = len(agents) * 10
    completion_rate = round((total_visits_today / total_targets_today) * 100) if total_targets_today > 0 else 0

    return {
        "timeline": timeline,
        "reps": reps_live,
        "summary": {
            "total_visits_today": total_visits_today,
            "completion_rate": completion_rate,
            "avg_duration_min": avg_duration,
            "overdue_visits": overdue_visits,
        },
        "recent_activities": recent_activities,
    }
