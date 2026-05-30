#!/usr/bin/env python3

import asyncio
import csv
import json
import os
import random
import argparse

from datetime import datetime, timedelta, timezone
UTC = timezone.utc
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "agroai")

DATA_DIR = Path(__file__).parent / "data"

# ─────────────────────────────────────────────────────────────
# CLI ARGS
# ─────────────────────────────────────────────────────────────

class SeedArgs:
    max_pos = 15000
    max_visits = 5000
    max_growers = 2000
    max_inv = 10000

args = SeedArgs()

# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────


def _b(v):
    return str(v).strip().lower() == "true"


def _f(v, default=0.0):
    try:
        f = float(v)
        return 0.0 if (f != f) else f
    except:
        return default


def _i(v, default=0):
    try:
        return int(float(v))
    except:
        return default


def utc_now():
    return datetime.now(UTC)


def stream_csv(filename):
    path = DATA_DIR / filename

    if not path.exists():
        print(f"WARNING: {filename} not found")
        return

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            yield row


# ─────────────────────────────────────────────────────────────
# STATE COORDS
# ─────────────────────────────────────────────────────────────

STATE_COORDS = {
    "Bihar": (25.09, 85.31),
    "Haryana": (29.05, 76.08),
    "Uttar Pradesh": (26.84, 80.94),
    "Rajasthan": (27.02, 74.21),
    "Maharashtra": (19.75, 75.71),
    "Punjab": (31.14, 75.34),
    "Gujarat": (22.25, 71.19),
    "Karnataka": (15.31, 75.71),
    "West Bengal": (22.98, 87.85),
    "Madhya Pradesh": (23.47, 77.94),
    "Andhra Pradesh": (15.91, 79.74),
    "Tamil Nadu": (11.12, 78.65),
    "Telangana": (17.12, 79.01),
    "Odisha": (20.94, 84.80),
    "Assam": (26.20, 92.93),
}

# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────


async def seed(db=None):

    from passlib.context import CryptContext

    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

    should_close = False
    if db is None:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(
            MONGODB_URL,
            maxPoolSize=50,
            minPoolSize=10,
        )
        db = client[DB_NAME]
        should_close = True

    print("\n🌱 AgroAI Seed Script")
    print(f"MongoDB: {DB_NAME}")

    # ─────────────────────────────────────────────────────────
    # DROP COLLECTIONS
    # ─────────────────────────────────────────────────────────

    collections = [
        "users",
        "territories",
        "retailers",
        "pos_transactions",
        "inventory",
        "visit_logs",
        "growers",
        "whatsapp_messages",
        "digital_funnel",
        "notifications",
    ]

    for col in collections:
        await db[col].drop()
        print(f"Dropped: {col}")

    # ─────────────────────────────────────────────────────────
    # USERS
    # ─────────────────────────────────────────────────────────

    print("\n👤 Seeding users...")

    users = [
        {
            "name": "Amit Sharma",
            "email": "amit@agroai.com",
            "hashed_password": pwd.hash("password123"),
            "role": "field_agent",
            "created_at": utc_now(),
            "updated_at": utc_now(),
        },
        {
            "name": "Priya Tiwari",
            "email": "priya@agroai.com",
            "hashed_password": pwd.hash("password123"),
            "role": "field_agent",
            "created_at": utc_now(),
            "updated_at": utc_now(),
        },
        {
            "name": "Rajesh Verma",
            "email": "rajesh@agroai.com",
            "hashed_password": pwd.hash("password123"),
            "role": "field_agent",
            "created_at": utc_now(),
            "updated_at": utc_now(),
        },
        {
            "name": "Manager",
            "email": "manager@agroai.com",
            "hashed_password": pwd.hash("password123"),
            "role": "manager",
            "created_at": utc_now(),
            "updated_at": utc_now(),
        },
        {
            "name": "Admin",
            "email": "admin@agroai.com",
            "hashed_password": pwd.hash("admin123"),
            "role": "admin",
            "created_at": utc_now(),
            "updated_at": utc_now(),
        },
    ]

    await db["users"].insert_many(users)

    await db["users"].create_index("email", unique=True)

    print("✅ users seeded")

    # ─────────────────────────────────────────────────────────
    # TERRITORIES
    # ─────────────────────────────────────────────────────────

    print("\n🗺️ Seeding territories...")

    territories = []

    for row in stream_csv("reps_territory.csv"):

        state = row.get("state", "India")

        base_lat, base_lng = STATE_COORDS.get(
            state,
            (20.59, 78.96)
        )

        rng = random.Random(hash(row["territory_id"]))

        territories.append({
            "rep_id": row["rep_id"],
            "territory_id": row["territory_id"],
            "territory_name": row["territory_name"],
            "state": row["state"],
            "district": row["district"],
            "tehsil_list": json.loads(
                row["tehsil_list"]
            ) if row.get("tehsil_list") else [],
            "lat": round(base_lat + rng.uniform(-1.5, 1.5), 5),
            "lng": round(base_lng + rng.uniform(-1.5, 1.5), 5),
            "created_at": utc_now(),
        })

    if territories:
        await db["territories"].insert_many(territories)

    await db["territories"].create_index("territory_id")

    print(f"✅ {len(territories)} territories")

    # ─────────────────────────────────────────────────────────
    # RETAILERS
    # ─────────────────────────────────────────────────────────

    print("\n🏪 Seeding retailers...")

    batch = []

    inserted = 0

    for row in stream_csv("agroai_master_scored_data.csv"):

        state = row.get("state", "Bihar")

        base_lat, base_lng = STATE_COORDS.get(
            state,
            (20.59, 78.96)
        )

        rng = random.Random(hash(row["retailer_id"]))

        batch.append({
            "retailer_id": row["retailer_id"],
            "territory_id": row["territory_id"],
            "state": row.get("state"),
            "district": row.get("district"),
            "tehsil": row.get("tehsil"),

            "lat": round(base_lat + rng.uniform(-2.5, 2.5), 5),
            "lng": round(base_lng + rng.uniform(-2.5, 2.5), 5),

            "sales_value_30": _f(row.get("sales_value_30")),
            "sales_qty_30": _f(row.get("sales_qty_30")),

            "total_stock_qty": _f(row.get("total_stock_qty")),

            "engagement_rate": _f(row.get("engagement_rate")),

            "visit_priority_score": _f(
                row.get("visit_priority_score")
            ),

            "priority_level": row.get(
                "priority_level",
                "Low"
            ),

            "recommended_product": row.get(
                "recommended_product",
                ""
            ),

            "recommended_action": row.get(
                "recommended_action",
                ""
            ),

            "updated_at": utc_now(),
        })

        if len(batch) == 500:

            await db["retailers"].insert_many(batch)

            inserted += len(batch)

            print(f"   inserted {inserted:,} retailers")

            batch = []

    if batch:
        await db["retailers"].insert_many(batch)
        inserted += len(batch)

    await db["retailers"].create_index(
        "retailer_id",
        unique=True
    )

    await db["retailers"].create_index(
        [("visit_priority_score", -1)]
    )

    print(f"✅ {inserted:,} retailers")

    # ─────────────────────────────────────────────────────────
    # POS TRANSACTIONS
    # ─────────────────────────────────────────────────────────

    print("\n💰 Seeding POS transactions...")

    random.seed(42)

    batch = []

    inserted = 0

    for row in stream_csv("retailer_pos.csv"):

        if random.random() > 0.15:
            continue

        try:
            txn_date = datetime.strptime(
                row["transaction_date"],
                "%Y-%m-%d"
            ).replace(tzinfo=UTC)

        except:
            continue

        batch.append({
            "retailer_id": row["retailer_id"],
            "transaction_id": row["transaction_id"],
            "sku_id": row["sku_id"],
            "sku_name": row["sku_name"],
            "sku_qty": _f(row["sku_qty"]),
            "sku_price": _f(row["sku_price"]),
            "revenue": _f(row["sku_qty"]) * _f(row["sku_price"]),
            "transaction_date": txn_date,
        })

        if len(batch) == 1000:

            await db["pos_transactions"].insert_many(batch)

            inserted += len(batch)

            print(f"   inserted {inserted:,} POS")

            batch = []

        if inserted >= args.max_pos:
            break

    if batch:
        await db["pos_transactions"].insert_many(batch)

    await db["pos_transactions"].create_index(
        "retailer_id"
    )

    print(f"✅ POS seeded")

    # ─────────────────────────────────────────────────────────
    # INVENTORY
    # ─────────────────────────────────────────────────────────

    print("\n📦 Seeding inventory...")

    latest = {}

    for row in stream_csv("retailer_inventory_weekly.csv"):

        k = (row["retailer_id"], row["sku_id"])

        if (
            k not in latest or
            row["week_end_date"] > latest[k]["week_end_date"]
        ):
            latest[k] = row

        if len(latest) >= args.max_inv * 2:
            break

    inventory_rows = list(latest.values())[:args.max_inv]

    batch = []

    for row in inventory_rows:

        try:
            wdate = datetime.strptime(
                row["week_end_date"],
                "%Y-%m-%d"
            ).replace(tzinfo=UTC)

        except:
            wdate = utc_now()

        qty = _f(row["sku_qty"])

        batch.append({
            "retailer_id": row["retailer_id"],
            "sku_id": row["sku_id"],
            "sku_name": row["sku_name"],
            "sku_qty": qty,
            "week_end_date": wdate,
            "is_oos": qty == 0,
            "is_low": 0 < qty <= 20,
        })

        if len(batch) == 1000:
            await db["inventory"].insert_many(batch)
            batch = []

    if batch:
        await db["inventory"].insert_many(batch)

    print("✅ inventory seeded")

    # ─────────────────────────────────────────────────────────
    # VISIT LOGS
    # ─────────────────────────────────────────────────────────

    print("\n📋 Seeding visit logs...")

    batch = []

    inserted = 0

    for row in stream_csv("retailer_visit_log.csv"):

        if random.random() > 0.25:
            continue

        try:
            vdate = datetime.strptime(
                row["visit_date"],
                "%Y-%m-%d"
            ).replace(tzinfo=UTC)

        except:
            continue

        batch.append({
            "rep_id": row["rep_id"],
            "territory_id": row["territory_id"],
            "visit_tehsil": row["visit_tehsil"],
            "visit_type": row["visit_type"],
            "product_recommended": row["product_recommended"],
            "visit_date": vdate,
            "status": "completed",
            "created_at": vdate,
        })

        if len(batch) == 1000:

            await db["visit_logs"].insert_many(batch)

            inserted += len(batch)

            print(f"   inserted {inserted:,} visits")

            batch = []

        if inserted >= args.max_visits:
            break

    if batch:
        await db["visit_logs"].insert_many(batch)

    print("✅ visit logs seeded")

    # ─────────────────────────────────────────────────────────
    # GROWERS
    # ─────────────────────────────────────────────────────────

    print("\n🌾 Seeding growers...")

    batch = []

    inserted = 0

    for row in stream_csv("growers.csv"):

        if random.random() > 0.35:
            continue

        batch.append({
            "grower_id": row["grower_id"],
            "state": row["state"],
            "district": row["district"],
            "tehsil": row["tehsil"],
            "language": row["language"],
            "device_type": row["device_type"],
            "grower_age": _i(row["grower_age"]),
            "grower_farm_size": _f(
                row["grower_farm_size"]
            ),
            "product_scan": _b(row["product_scan"]),
        })

        if len(batch) == 500:

            await db["growers"].insert_many(batch)

            inserted += len(batch)

            print(f"   inserted {inserted:,} growers")

            batch = []

        if inserted >= args.max_growers:
            break

    if batch:
        await db["growers"].insert_many(batch)

    print("✅ growers seeded")

    # ─────────────────────────────────────────────────────────
    # WHATSAPP
    # ─────────────────────────────────────────────────────────

    print("\n📱 Seeding WhatsApp messages...")

    batch = []

    for row in stream_csv("whatsapp_campaign.csv"):

        try:
            sent_dt = datetime.strptime(
                row["message_sent_date"],
                "%Y-%m-%d"
            ).replace(tzinfo=UTC)

        except:
            sent_dt = utc_now()

        batch.append({
            "campaign_product": row["campaign_product"],
            "campaign_crop": row["campaign_crop"],
            "grower_id": row["grower_id"],
            "message_sent_date": sent_dt,
            "delivered_status": _b(
                row["delivered_status"]
            ),
            "opened_status": _b(
                row["opened_status"]
            ),
            "clicked_status": _b(
                row["clicked_status"]
            ),
        })

        if len(batch) == 1000:
            await db["whatsapp_messages"].insert_many(batch)
            batch = []

    if batch:
        await db["whatsapp_messages"].insert_many(batch)

    print("✅ WhatsApp seeded")

    # ─────────────────────────────────────────────────────────
    # DIGITAL FUNNEL
    # ─────────────────────────────────────────────────────────

    print("\n📊 Seeding digital funnel...")

    docs = []

    for row in stream_csv("digital_funnel_weekly.csv"):

        try:
            wdate = datetime.strptime(
                row["week_start_date"],
                "%Y-%m-%d"
            ).replace(tzinfo=UTC)

        except:
            wdate = utc_now()

        docs.append({
            "campaign_id": row["campaign_id"],
            "week_start_date": wdate,
            "social_post_impression": _i(
                row["social_post_impression"]
            ),
            "landing_page_visits": _i(
                row["landing_page_visits"]
            ),
            "lead_form_submission": _i(
                row["lead_form_submission"]
            ),
            "campaign_crop": row["campaign_crop"],
            "campaign_product": row["campaign_product"],
        })

    if docs:
        await db["digital_funnel"].insert_many(docs)

    print("✅ digital funnel seeded")

    # ─────────────────────────────────────────────────────────
    # NOTIFICATIONS
    # ─────────────────────────────────────────────────────────

    print("\n🔔 Seeding notifications...")

    users = await db["users"].find().to_list(length=10)

    notifications = []

    for user in users:

        notifications.append({
            "user_id": str(user["_id"]),
            "title": "Stock Alert",
            "message": "Low inventory detected",
            "type": "warning",
            "read": False,
            "created_at": utc_now(),
        })

    if notifications:
        await db["notifications"].insert_many(
            notifications
        )

    print("✅ notifications seeded")

    # ─────────────────────────────────────────────────────────
    # SUMMARY
    # ─────────────────────────────────────────────────────────

    print("\n" + "=" * 50)
    print("✅ SEED COMPLETE")
    print("=" * 50)

    cols = [
        "users",
        "territories",
        "retailers",
        "pos_transactions",
        "inventory",
        "visit_logs",
        "growers",
        "whatsapp_messages",
        "digital_funnel",
        "notifications",
    ]

    for col in cols:

        count = await db[col].count_documents({})

        print(f"{col:<22} {count:,}")

    print("""
Demo Credentials

amit@agroai.com      / password123
priya@agroai.com     / password123
rajesh@agroai.com    / password123
manager@agroai.com   / password123
admin@agroai.com     / admin123
""")

    if should_close:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed())