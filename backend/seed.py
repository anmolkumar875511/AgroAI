#!/usr/bin/env python3
"""
AgroAI Database Seed Script
============================
Seeds MongoDB Atlas with:
  1. Demo users  (1 admin, 3 field agents, 1 manager)
  2. Retailers   (all 4000 rows from agroai_master_scored_data.csv)
  3. Sample notifications for demo users

Usage:
    python seed.py

Requires:
    pip install motor pymongo python-dotenv passlib[bcrypt]

Make sure your .env has MONGODB_URL set.
"""

import asyncio
import csv
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
print(f"MONGODB_URL: {MONGODB_URL}")
DB_NAME = os.getenv("DB_NAME", "agroai")
CSV_PATH = Path(__file__).parent / "data" / "agroai_master_scored_data.csv"

# Fallback: look in common locations
if not CSV_PATH.exists():
    for candidate in [
        Path("agroai_master_scored_data.csv"),
        Path("data/agroai_master_scored_data.csv"),
        Path("../agroai_master_scored_data.csv"),
    ]:
        if candidate.exists():
            CSV_PATH = candidate
            break


async def seed():
    from motor.motor_asyncio import AsyncIOMotorClient
    from passlib.context import CryptContext

    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    print(f"Connected to MongoDB: {DB_NAME}")

    # ── 1. Drop existing data (fresh seed) ───────────────────────────────────
    for col in ["users", "retailers", "notifications", "visit_logs", "mandi_prices", "chat_messages"]:
        await db[col].drop()
        print(f"  Dropped collection: {col}")

    # ── 2. Seed Users ─────────────────────────────────────────────────────────
    users = [
        {
            "name": "Amit Sharma",
            "email": "amit@agroai.com",
            "hashed_password": pwd.hash("password123"),
            "employee_id": "AG-8829",
            "role": "field_agent",
            "territory": "Bihar North - Cluster A",
            "territory_id": "TER_0001",
            "region_id": "br",
            "theme": "dark",
            "language": "English",
            "notifications": {
                "pestAlerts": True, "stockAlerts": True,
                "visitReminders": False, "weeklyReports": True,
            },
            "sync_enabled": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
        {
            "name": "Priya Tiwari",
            "email": "priya@agroai.com",
            "hashed_password": pwd.hash("password123"),
            "employee_id": "AG-7712",
            "role": "field_agent",
            "territory": "Maharashtra - Amravati",
            "territory_id": "TER_0116",
            "region_id": "mh",
            "theme": "light",
            "language": "Hindi (हिंदी)",
            "notifications": {
                "pestAlerts": True, "stockAlerts": True,
                "visitReminders": True, "weeklyReports": False,
            },
            "sync_enabled": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
        {
            "name": "Rajesh Verma",
            "email": "rajesh@agroai.com",
            "hashed_password": pwd.hash("password123"),
            "employee_id": "AG-5501",
            "role": "field_agent",
            "territory": "Punjab - Ludhiana",
            "territory_id": "TER_0447",
            "region_id": "pb",
            "theme": "dark",
            "language": "Punjabi (ਪੰਜਾਬੀ)",
            "notifications": {
                "pestAlerts": True, "stockAlerts": False,
                "visitReminders": True, "weeklyReports": True,
            },
            "sync_enabled": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
        {
            "name": "Sunita Rao",
            "email": "manager@agroai.com",
            "hashed_password": pwd.hash("password123"),
            "employee_id": "MG-0021",
            "role": "manager",
            "territory": "India (All)",
            "territory_id": "",
            "region_id": "ind",
            "theme": "dark",
            "language": "English",
            "notifications": {
                "pestAlerts": True, "stockAlerts": True,
                "visitReminders": True, "weeklyReports": True,
            },
            "sync_enabled": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
    ]

    result = await db["users"].insert_many(users)
    user_ids = [str(uid) for uid in result.inserted_ids]
    print(f"  Seeded {len(user_ids)} users")

    # ── 3. Seed Retailers from CSV ─────────────────────────────────────────────
    if not CSV_PATH.exists():
        print(f"  WARNING: CSV not found at {CSV_PATH}. Skipping retailer seed.")
        print("  Place agroai_master_scored_data.csv in the 'data/' folder and re-run.")
    else:
        # Region lat/lng seed for deterministic map placement
        STATE_COORDS = {
            "Bihar":           (25.09, 85.31),
            "Uttar Pradesh":   (26.84, 80.94),
            "Maharashtra":     (19.75, 75.71),
            "Punjab":          (31.14, 75.34),
            "Gujarat":         (22.25, 71.19),
            "Karnataka":       (15.31, 75.71),
            "West Bengal":     (22.98, 87.85),
            "Madhya Pradesh":  (23.47, 77.94),
            "Rajasthan":       (27.02, 74.21),
            "Andhra Pradesh":  (15.91, 79.74),
            "Tamil Nadu":      (11.12, 78.65),
            "Haryana":         (29.05, 76.08),
            "Telangana":       (17.12, 79.01),
            "Odisha":          (20.94, 84.80),
            "Assam":           (26.20, 92.93),
        }

        import random
        batch = []
        with open(CSV_PATH, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                state = row.get("state", "Bihar")
                base_lat, base_lng = STATE_COORDS.get(state, (20.59, 78.96))

                # Deterministic jitter per retailer so map pins don't overlap
                rng = random.Random(hash(row["retailer_id"]))
                lat = round(base_lat + rng.uniform(-2.5, 2.5), 5)
                lng = round(base_lng + rng.uniform(-2.5, 2.5), 5)

                # Parse last_visit_date safely
                lv_date = None
                lv_raw = row.get("last_visit_date", "")
                if lv_raw and lv_raw.lower() not in ("", "nan", "nat", "none"):
                    try:
                        lv_date = datetime.strptime(lv_raw[:10], "%Y-%m-%d")
                    except ValueError:
                        lv_date = None

                def safe_float(v, default=0.0):
                    try:
                        f = float(v)
                        return 0.0 if (f != f) else f  # NaN check
                    except (ValueError, TypeError):
                        return default

                doc = {
                    "retailer_id":           row["retailer_id"],
                    "territory_id":          row["territory_id"],
                    "state":                 state,
                    "district":              row.get("district", ""),
                    "tehsil":                row.get("tehsil", ""),
                    "lat":                   lat,
                    "lng":                   lng,
                    # Visit
                    "last_visit_date":       lv_date,
                    "last_visit_days":       safe_float(row.get("last_visit_days")),
                    # Sales
                    "sales_qty_30":          safe_float(row.get("sales_qty_30")),
                    "sales_value_30":        safe_float(row.get("sales_value_30")),
                    "transactions_30":       safe_float(row.get("transactions_30")),
                    "sales_qty_7":           safe_float(row.get("sales_qty_7")),
                    "sales_value_7":         safe_float(row.get("sales_value_7")),
                    "transactions_7":        safe_float(row.get("transactions_7")),
                    "sales_growth_ratio":    safe_float(row.get("sales_growth_ratio")),
                    # Stock
                    "total_stock_qty":       safe_float(row.get("total_stock_qty")),
                    "unique_skus":           safe_float(row.get("unique_skus")),
                    "stock_status":          row.get("stock_status", "Good Stock"),
                    # Products
                    "recommended_sku_id":    row.get("recommended_sku_id", ""),
                    "recommended_product":   row.get("recommended_product", ""),
                    "product_sales_qty_30":  safe_float(row.get("product_sales_qty_30")),
                    # Growers
                    "grower_count":          safe_float(row.get("grower_count")),
                    "avg_farm_size":         safe_float(row.get("avg_farm_size")),
                    "product_scans":         safe_float(row.get("product_scans")),
                    "campaign_attendance":   safe_float(row.get("campaign_attendance")),
                    # Engagement
                    "total_messages":        safe_float(row.get("total_messages")),
                    "total_opened":          safe_float(row.get("total_opened")),
                    "total_clicked":         safe_float(row.get("total_clicked")),
                    "engagement_rate":       safe_float(row.get("engagement_rate")),
                    # ML scores
                    "sales_demand_score":        safe_float(row.get("sales_demand_score")),
                    "stock_alert_score":         safe_float(row.get("stock_alert_score")),
                    "last_visit_gap_score":      safe_float(row.get("last_visit_gap_score")),
                    "product_relevance_score":   safe_float(row.get("product_relevance_score")),
                    "grower_engagement_score":   safe_float(row.get("grower_engagement_score")),
                    "visit_priority_score":      safe_float(row.get("visit_priority_score")),
                    "priority_level":            row.get("priority_level", "Low"),
                    "recommended_action":        row.get("recommended_action", ""),
                    "explanation":               row.get("explanation", ""),
                    "updated_at":                datetime.utcnow(),
                }
                batch.append(doc)

                # Insert in batches of 500
                if len(batch) == 500:
                    await db["retailers"].insert_many(batch)
                    print(f"    Inserted {i+1} retailers...")
                    batch = []

        if batch:
            await db["retailers"].insert_many(batch)

        total_retailers = await db["retailers"].count_documents({})
        print(f"  Seeded {total_retailers} retailers from CSV")

        # Create indexes for fast queries
        await db["retailers"].create_index("retailer_id", unique=True)
        await db["retailers"].create_index("territory_id")
        await db["retailers"].create_index([("visit_priority_score", -1)])
        await db["retailers"].create_index("priority_level")
        await db["retailers"].create_index("state")
        await db["retailers"].create_index("stock_status")
        print("  Created retailer indexes")

    # ── 4. Seed Notifications ─────────────────────────────────────────────────
    notif_templates = [
        {
            "title": "🐛 Pest Alert: Stem Borer Detected",
            "message": "High humidity (76%) in Rampur tehsil triggers Stem Borer risk for 3 rice-growing villages. Immediate action required.",
            "type": "alert",
        },
        {
            "title": "📦 Stock Alert: Amistar Critical",
            "message": "Retailer R08 (GreenAgro) down to 22 units. Estimated 2-day stockout at current demand. Reorder immediately.",
            "type": "warning",
        },
        {
            "title": "📈 Demand Spike: Score (Fungicide)",
            "message": "Score demand up 40% in Varanasi cluster this week. Pre-position stock before weekend rush.",
            "type": "info",
        },
        {
            "title": "✅ Visit Completed: Kisan Kendra Sonepur",
            "message": "Field visit logged. Order placed: Actara 5kg. Revenue: ₹12,500. Follow-up scheduled in 7 days.",
            "type": "success",
        },
        {
            "title": "⏰ Follow-up Reminder: Retailer R12",
            "message": "Follow-up due today for GreenAgro Store. Last discussed: Movondo restocking. Pending order worth ₹18,000.",
            "type": "warning",
        },
        {
            "title": "🌤️ Weather Advisory: Rain Expected",
            "message": "IMD forecast: heavy rain in Bihar North for next 3 days. Reschedule outdoor spray demos. Advise covered storage.",
            "type": "alert",
        },
        {
            "title": "📊 Weekly Report Ready",
            "message": "Your territory performance report for last week is ready. Revenue: ₹2.4L (+12%). Visits: 18/20 completed.",
            "type": "info",
        },
        {
            "title": "🚨 Visit Gap Alert: 5 Retailers",
            "message": "5 high-priority retailers haven't been visited in over 21 days. Risk of competitor takeover increasing.",
            "type": "alert",
        },
    ]

    now = datetime.utcnow()
    notifications_docs = []
    for uid in user_ids[:3]:  # seed for first 3 users
        for i, t in enumerate(notif_templates):
            notifications_docs.append({
                "user_id": uid,
                "title": t["title"],
                "message": t["message"],
                "type": t["type"],
                "read": i >= 4,  # first 4 unread, rest read
                "created_at": now - timedelta(hours=i * 3),
            })

    await db["notifications"].insert_many(notifications_docs)
    print(f"  Seeded {len(notifications_docs)} notifications")

    # Notification indexes
    await db["notifications"].create_index("user_id")
    await db["notifications"].create_index([("created_at", -1)])

    # ── 5. Seed Sample Visit Logs ──────────────────────────────────────────────
    visit_logs = []
    sample_retailers = ["RTL_00001", "RTL_00002", "RTL_00003", "RTL_00004", "RTL_00005"]
    statuses = ["completed", "completed", "completed", "skipped", "follow_up_needed"]
    products = [
        ["Amistar 250 SC", "Actara 25 WG"],
        ["Tilt 250 EC"],
        ["Movondo", "Score 250 EC"],
        [],
        ["Vibrance Integral"],
    ]

    for i, (rid, status, prods) in enumerate(zip(sample_retailers, statuses, products)):
        visit_logs.append({
            "retailer_id": rid,
            "territory_id": "TER_0001",
            "agent_id": user_ids[0],
            "visit_date": now - timedelta(days=i + 1),
            "status": status,
            "products_discussed": prods,
            "order_placed": status == "completed",
            "order_quantity": 10.0 if status == "completed" else 0,
            "order_value": 8500.0 * (i + 1) if status == "completed" else 0,
            "revenue_generated": 8500.0 * (i + 1) if status == "completed" else 0,
            "farmer_response": "positive" if status == "completed" else "neutral",
            "follow_up_needed": status == "follow_up_needed",
            "next_follow_up_date": None,
            "competitor_issue": "",
            "notes": f"Sample visit log {i+1}",
            "outcome": status,
            "created_at": now - timedelta(days=i + 1),
        })

    await db["visit_logs"].insert_many(visit_logs)
    await db["visit_logs"].create_index("territory_id")
    await db["visit_logs"].create_index("retailer_id")
    await db["visit_logs"].create_index([("visit_date", -1)])
    print(f"  Seeded {len(visit_logs)} visit logs")

    # ── 6. User indexes ───────────────────────────────────────────────────────
    await db["users"].create_index("email", unique=True)
    await db["chat_messages"].create_index("session_id")
    await db["chat_messages"].create_index("user_id")

    print("\n✅ Seed complete!")
    print("\nDemo Login Credentials:")
    print("  Field Agent : amit@agroai.com     / password123")
    print("  Field Agent : priya@agroai.com    / password123")
    print("  Field Agent : rajesh@agroai.com   / password123")
    print("  Manager     : manager@agroai.com  / password123")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
