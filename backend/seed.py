#!/usr/bin/env python3
"""
AgroAI Ultimate Dataset Seed Script
===================================
Loads ALL data files (raw and ML-scored) into MongoDB to power every frontend page.
"""

import asyncio
import os
import pandas as pd
from datetime import datetime, timezone
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "agroai")
DATA_DIR = Path(__file__).parent / "data"

# Optional: Set to an integer (e.g., 500) to limit rows during dev, or None for everything
MAX_RECORDS = 500 

async def load_csv_to_mongo(db, file_name: str, collection_name: str, unique_col: str = None):
    """Helper function to load, clean, and insert CSV data into MongoDB."""
    file_path = DATA_DIR / file_name
    if not file_path.exists():
        print(f"⚠️ Missing {file_name}. Skipping collection: {collection_name}.")
        return

    print(f"Loading {file_name} into {collection_name}...")
    try:
        df = pd.read_csv(file_path, low_memory=False)
        
        # Deduplicate if a primary key is provided
        if unique_col and unique_col in df.columns:
            df = df.drop_duplicates(subset=[unique_col])
            
        # Safely fill NaNs so MongoDB doesn't throw BSON errors
        df = df.fillna('')
        
        # Apply row limits if set
        if MAX_RECORDS:
            df = df.head(MAX_RECORDS)
            
        docs = df.to_dict(orient='records')
        
        if docs:
            # Insert in batches to prevent memory overflow
            batch_size = 1000
            for i in range(0, len(docs), batch_size):
                await db[collection_name].insert_many(docs[i:i+batch_size])
            print(f"  ✅ Seeded {len(docs)} records into '{collection_name}'.")
    except Exception as e:
        print(f"  ❌ Error loading {file_name}: {e}")


async def seed():
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    print(f"Connected to MongoDB: {DB_NAME}\n")

    # 1. Clean existing collections
    collections_to_drop = [
        "users", "retailers", "recommendations", "feature_importance", 
        "growers", "visit_logs", "pos_data", "inventory", "campaigns", "reps"
    ]
    for col in collections_to_drop:
        await db[col].drop()
    print("Dropped old collections to start fresh.\n")

    # 2. Seed Users (Required for LoginPage.tsx and SettingsPage.tsx)
    now_utc = datetime.now(timezone.utc)
    users = [
        {
            "name": "Amit Sharma", "email": "amit@agroai.com", "hashed_password": pwd.hash("password123"),
            "role": "field_agent", "territory_id": "TER_0001", "region_id": "br", "created_at": now_utc
        },
        {
            "name": "Sunita Rao", "email": "manager@agroai.com", "hashed_password": pwd.hash("password123"),
            "role": "manager", "territory_id": "", "region_id": "ind", "created_at": now_utc
        }
    ]
    await db["users"].insert_many(users)
    print("✅ Seeded Demo Users (amit@agroai.com / password123).\n")

    # 3. Load all CSVs mapping to their collections
    # Format: (CSV Filename, MongoDB Collection Name, Unique Column if applicable)
    datasets = [
        # AI & Master Data (Powers RecommendationsPage & RetailerInsightsPage)
        ("agroai_master_scored_data.csv", "retailers", "retailer_id"),
        ("agroai_recommendations.csv", "recommendations", None),
        ("agroai_feature_importance.csv", "feature_importance", None),
        
        # Raw Data (Powers AnalyticsPage & DashboardPage)
        ("retailer_visit_log.csv", "visit_logs", None),
        ("retailer_pos.csv", "pos_data", None),
        ("retailer_inventory_weekly.csv", "inventory", None),
        
        # Grower & Marketing Data (Powers GrowerInsightsPage)
        ("growers.csv", "growers", "grower_id"),
        ("whatsapp_campaign.csv", "campaigns", None),
        ("digital_funnel_weekly.csv", "digital_funnel", None),
        
        # Team Data
        ("reps_territory.csv", "reps", "rep_id"),
    ]

    for file_name, col_name, unique_col in datasets:
        await load_csv_to_mongo(db, file_name, col_name, unique_col)

    # 4. Create Indexes for fast querying
    print("\nCreating database indexes...")
    try:
        await db["retailers"].create_index("retailer_id", unique=True)
        await db["retailers"].create_index("territory_id")
        await db["recommendations"].create_index("territory_id")
        await db["visit_logs"].create_index("retailer_id")
        await db["growers"].create_index("territory_id")
        print("✅ Indexes created successfully.")
    except Exception as e:
        print(f"⚠️ Could not create some indexes: {e}")

    print("\n🎉 [SUCCESS] Ultimate Data Seed Complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())