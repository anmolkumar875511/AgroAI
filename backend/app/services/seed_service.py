"""
Seed service — inserts all demo data on first boot.
Idempotent: checks if data already exists before inserting.
"""
import random
from datetime import date, datetime, timedelta
from sqlalchemy import select, func
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.models import (
    User, Territory, Retailer, RetailerInventory,
    Grower, Recommendation, Notification, MandiPrice, Visit, RiskEvent,
)

TERRITORIES = [
    {"id": "TER_0001", "name": "Patna North", "state": "Bihar", "district": "Patna", "lat": 25.5941, "lng": 85.1376, "zoom": 11},
    {"id": "TER_0002", "name": "Muzaffarpur South", "state": "Bihar", "district": "Muzaffarpur", "lat": 26.1197, "lng": 85.3910, "zoom": 11},
    {"id": "TER_0003", "name": "Gaya West", "state": "Bihar", "district": "Gaya", "lat": 24.7955, "lng": 84.9994, "zoom": 11},
    {"id": "TER_0004", "name": "Ludhiana East", "state": "Punjab", "district": "Ludhiana", "lat": 30.9010, "lng": 75.8573, "zoom": 11},
    {"id": "TER_0005", "name": "Amravati Sadar", "state": "Maharashtra", "district": "Amravati", "lat": 20.9374, "lng": 77.7796, "zoom": 11},
]

USERS = [
    {
        "email": "amit@agroai.com", "password": "password123",
        "name": "Amit Sharma", "role": "agent",
        "territory_id": "TER_0001", "territory": "Patna North",
        "employee_id": "EMP001", "phone": "+91 98765 43210",
    },
    {
        "email": "manager@agroai.com", "password": "password123",
        "name": "Rajiv Mehta", "role": "manager",
        "territory_id": "TER_0001", "territory": "Bihar Region",
        "employee_id": "MGR001", "phone": "+91 99887 76655",
    },
    {
        "email": "priya@agroai.com", "password": "password123",
        "name": "Priya Tiwari", "role": "agent",
        "territory_id": "TER_0005", "territory": "Amravati Sadar",
        "employee_id": "EMP002", "phone": "+91 87654 32109",
    },
]

PRODUCTS = [
    "Amistar 250 SC", "Actara 25 WG", "Tilt 250 EC",
    "Score 250 EC", "Movondo", "Vibrance Integral",
    "Ridomil Gold", "Axial 50 EC", "Custodia", "Pegasus 500 SC",
]

RETAILER_NAMES = [
    "Kisan Seed Store", "Mahavir Fertilizers", "Ganga Agri Kendra",
    "Shree Ram Seeds", "Patna Agro Center", "Mandi Fertilizers",
    "Jai Jawan Agro", "Green Fields Store", "Krishi Vikas Kendra",
    "Bharat Agro Hub", "Saraswati Seeds", "Ram Krishi Bhandar",
    "Dhan Lakshmi Agro", "Patel Seeds Center", "Maratha Agro Store",
    "Punjab Agri Hub", "Khedut Seva Kendra", "Kisaan Shakti Center",
]

TEHSILS = ["Patna Sadar", "Danapur", "Phulwari", "Muzaffarpur Block A",
           "Muzaffarpur Block B", "Gaya Sadar", "Bodh Gaya", "Ludhiana East",
           "Amravati Sadar", "Achalpur"]

CROPS = ["Rice", "Wheat", "Cotton", "Maize", "Mustard", "Soybean", "Sugarcane"]
CROP_STAGES = ["Sowing", "Germination", "Vegetative", "Flowering", "Grain Fill", "Harvest"]
PEST_RISKS = ["Critical", "High", "Medium", "Low"]

ADVISORIES = [
    "Apply Amistar 250 SC @ 1 ml/l to control blast disease. Repeat after 14 days if infection persists.",
    "Scout for BPH infestation. Use Actara 25 WG @ 0.5 g/l for effective control before peak infestation.",
    "Monitor for powdery mildew. Apply Score 250 EC @ 0.5 ml/l at first symptom appearance.",
    "Apply Tilt 250 EC for rust control. Ensure proper coverage on leaf undersides.",
    "Use Ridomil Gold for downy mildew. Mix with water at 2.5 g/l for best results.",
    "Conduct field scouting for whitefly. Apply Pegasus 500 SC @ 0.75 ml/l in early morning.",
]

MANDI_PRICES_SEED = [
    {"commodity": "Paddy (Common)", "mandi": "Patna", "state": "Bihar", "price": 2183, "change": 45, "change_pct": 2.1, "unit": "quintal"},
    {"commodity": "Wheat", "mandi": "Muzaffarpur", "state": "Bihar", "price": 2250, "change": -30, "change_pct": -1.3, "unit": "quintal"},
    {"commodity": "Cotton (Long)", "mandi": "Amravati", "state": "Maharashtra", "price": 7200, "change": 120, "change_pct": 1.7, "unit": "quintal"},
    {"commodity": "Soybean", "mandi": "Nagpur", "state": "Maharashtra", "price": 4850, "change": -80, "change_pct": -1.6, "unit": "quintal"},
    {"commodity": "Maize", "mandi": "Ludhiana", "state": "Punjab", "price": 1890, "change": 20, "change_pct": 1.1, "unit": "quintal"},
    {"commodity": "Mustard", "mandi": "Patna", "state": "Bihar", "price": 5600, "change": 90, "change_pct": 1.6, "unit": "quintal"},
    {"commodity": "Arhar Dal", "mandi": "Varanasi", "state": "UP", "price": 7100, "change": -50, "change_pct": -0.7, "unit": "quintal"},
    {"commodity": "Onion", "mandi": "Nashik", "state": "Maharashtra", "price": 1200, "change": 150, "change_pct": 14.3, "unit": "quintal"},
]

NOTIFICATIONS_SEED = [
    {"title": "🚨 Critical Pest Alert — Patna Sadar", "message": "BPH infestation detected in 3 villages. Immediate Actara 25 WG dispatch required. 450 growers affected.", "type": "alert"},
    {"title": "📦 Stock Alert — Amistar 250 SC", "message": "RTL_00001 Kisan Seed Store has only 12 units left. Reorder threshold breached. Sales risk: ₹45,000.", "type": "warning"},
    {"title": "✅ Visit Target Achieved", "message": "Congratulations! You've completed 38/40 planned visits this week. Efficiency score: 95%.", "type": "success"},
    {"title": "🌦️ Weather Advisory — Bihar Zone", "message": "Heavy rainfall forecast (>50mm) in next 48 hours. Pre-position fungicides at key retailers.", "type": "alert"},
    {"title": "📊 Weekly Report Ready", "message": "Your territory performance report for May Week 3 is ready. Revenue: ₹3.2L (+14% MoM).", "type": "info"},
    {"title": "🌿 NDVI Anomaly Detected", "message": "Crop stress index elevated in Danapur Block. Possible nitrogen deficiency in 280 acres.", "type": "warning"},
    {"title": "💡 AI Recommendation Accepted", "message": "Retailer RTL_00003 accepted Amistar recommendation. Order placed: 50 units (₹12,500).", "type": "success"},
    {"title": "⏰ Follow-up Reminder", "message": "RTL_00007 Mahavir Fertilizers follow-up due today. Last visit: 8 days ago. Priority: High.", "type": "info"},
    {"title": "🌾 Mandi Price Alert", "message": "Paddy prices up 4.2% at Patna Mandi (₹2183/quintal). Recommend stocking fungicides now.", "type": "info"},
    {"title": "🎯 Territory Coverage Gap", "message": "Muzaffarpur Block B has no rep visit in 18 days. 12 retailers at risk. Schedule immediately.", "type": "warning"},
]

EXPLAINABLE_REASONS = [
    [
        {"id": "r1", "title": "High Pest Risk Detected", "description": "BPH infestation at 8.2/m² exceeds economic threshold of 5/m²", "icon": "Bug"},
        {"id": "r2", "title": "Weather Pattern Match", "description": "Humidity 85%+ for 5 consecutive days — ideal for BPH proliferation", "icon": "Cloud"},
        {"id": "r3", "title": "Historical Purchase Pattern", "description": "This retailer ordered Actara 3x in same crop cycle last year", "icon": "BarChart2"},
    ],
    [
        {"id": "r1", "title": "Crop Stage Critical", "description": "Rice at flowering stage — most vulnerable to blast disease", "icon": "Sprout"},
        {"id": "r2", "title": "NDVI Stress Indicator", "description": "NDVI dropped 0.12 points vs benchmark — early disease stress signal", "icon": "Activity"},
        {"id": "r3", "title": "Regional Outbreak Pattern", "description": "3 nearby villages reported similar symptoms in past 7 days", "icon": "Map"},
    ],
    [
        {"id": "r1", "title": "Low Stock Alert", "description": "Retailer has only 15 days of inventory remaining at current sell rate", "icon": "Package"},
        {"id": "r2", "title": "Demand Forecast", "description": "ML model predicts 35% demand surge in next 2 weeks based on crop calendar", "icon": "TrendingUp"},
        {"id": "r3", "title": "Revenue Opportunity", "description": "Potential ₹45,000 order value if visited within 3 days", "icon": "IndianRupee"},
    ],
]

RECOMMENDATIONS_SEED = [
    {
        "id": "REC_001", "territory_id": "TER_0001", "priority": "Critical",
        "crop": "Rice", "message": "Immediate fungicide application needed — blast disease risk at Danapur block critical level",
        "weather": "Humid (85%), Low wind", "product": "Amistar 250 SC",
        "village": "Danapur Khurd", "farmer": "Ramesh Kumar (contact via RTL_00001)",
        "retailer_id": "RTL_00001", "pest_risk": "Critical",
        "next_action": "Visit RTL_00001 today, demo Amistar application technique",
        "follow_up_timeline": "Within 24 hours",
        "explainable_reasons": EXPLAINABLE_REASONS[0],
    },
    {
        "id": "REC_002", "territory_id": "TER_0001", "priority": "High",
        "crop": "Wheat", "message": "BPH pressure building — pre-emptive Actara application before economic threshold breach",
        "weather": "Dry, Temperature 32°C", "product": "Actara 25 WG",
        "village": "Phulwari Sharif", "farmer": "Suresh Prasad",
        "retailer_id": "RTL_00003", "pest_risk": "High",
        "next_action": "Present Actara 25 WG efficacy data to retailer",
        "follow_up_timeline": "Within 48 hours",
        "explainable_reasons": EXPLAINABLE_REASONS[1],
    },
    {
        "id": "REC_003", "territory_id": "TER_0001", "priority": "Medium",
        "crop": "Maize", "message": "Low inventory alert — Score 250 EC running low at Kisan Seed Store ahead of demand season",
        "weather": "Partly cloudy", "product": "Score 250 EC",
        "village": "Patna Sadar", "farmer": "Multiple farmers",
        "retailer_id": "RTL_00005", "pest_risk": "Medium",
        "next_action": "Confirm reorder of Score 250 EC — 100 unit minimum",
        "follow_up_timeline": "Within 3 days",
        "explainable_reasons": EXPLAINABLE_REASONS[2],
    },
    {
        "id": "REC_004", "territory_id": "TER_0001", "priority": "High",
        "crop": "Cotton", "message": "Downy mildew risk elevated — Ridomil Gold pre-positioning recommended at 2 retailers",
        "weather": "Overcast, Rain expected", "product": "Ridomil Gold",
        "village": "Bihta Block", "farmer": "Farmer cluster B-12",
        "retailer_id": "RTL_00007", "pest_risk": "High",
        "next_action": "Pre-stock Ridomil Gold at RTL_00007 before rainfall",
        "follow_up_timeline": "Within 24 hours",
        "explainable_reasons": EXPLAINABLE_REASONS[0],
    },
    {
        "id": "REC_005", "territory_id": "TER_0001", "priority": "Low",
        "crop": "Mustard", "message": "Routine advisory — apply Tilt 250 EC for rust prevention during flowering stage",
        "weather": "Clear, 28°C", "product": "Tilt 250 EC",
        "village": "Masaurhi Block", "farmer": "Rajiv Agro Group",
        "retailer_id": "RTL_00009", "pest_risk": "Low",
        "next_action": "Schedule demo visit for Tilt 250 EC application",
        "follow_up_timeline": "Within 1 week",
        "explainable_reasons": EXPLAINABLE_REASONS[2],
    },
]


async def seed_all():
    """Master seed function — idempotent."""
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        result = await db.execute(select(func.count()).select_from(User))
        if result.scalar() > 0:
            return  # Already seeded

        # Users
        for u in USERS:
            user = User(
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                name=u["name"],
                role=u["role"],
                territory_id=u["territory_id"],
                territory=u["territory"],
                employee_id=u["employee_id"],
                phone=u["phone"],
            )
            db.add(user)

        # Territories
        for t in TERRITORIES:
            db.add(Territory(**t))

        await db.flush()

        # Get user IDs for notifications
        result = await db.execute(select(User))
        users = result.scalars().all()
        amit = next((u for u in users if u.email == "amit@agroai.com"), users[0])

        # Retailers (18 across territories)
        retailers_created = []
        for i, name in enumerate(RETAILER_NAMES):
            ter = TERRITORIES[i % len(TERRITORIES)]
            tehsil = TEHSILS[i % len(TEHSILS)]
            priority = random.choice(["High", "High", "Medium", "Medium", "Low"])
            score = round(random.uniform(45, 95), 1)
            stock_status = random.choice(["Good Stock", "Good Stock", "Low Stock", "Out of Stock"])
            stock_qty = {"Good Stock": random.randint(200, 500), "Low Stock": random.randint(30, 80), "Out of Stock": 0}[stock_status]
            last_visit_days = random.randint(0, 45)

            r = Retailer(
                retailer_id=f"RTL_{i+1:05d}",
                name=name,
                territory_id=ter["id"],
                location=f"{tehsil}, {ter['district']}",
                tehsil=tehsil,
                district=ter["district"],
                state=ter["state"],
                lat=ter["lat"] + random.uniform(-0.3, 0.3),
                lng=ter["lng"] + random.uniform(-0.3, 0.3),
                priority_level=priority,
                visit_priority_score=score,
                stock_status=stock_status,
                total_stock_qty=stock_qty,
                last_visit_days=last_visit_days,
                last_visit_date=(date.today() - timedelta(days=last_visit_days)).isoformat() if last_visit_days > 0 else date.today().isoformat(),
                recommended_product=random.choice(PRODUCTS),
                explanation=f"High purchase frequency with {random.randint(2,8)} orders in last 90 days. {'Stock critically low — immediate restocking required.' if stock_status == 'Low Stock' else 'Good inventory maintained.'}",
                monthly_revenue=round(random.uniform(50000, 350000), 0),
            )
            db.add(r)
            retailers_created.append(r)

        await db.flush()

        # Inventory for each retailer
        for r in retailers_created:
            for product in random.sample(PRODUCTS, k=random.randint(3, 6)):
                qty = random.randint(0, 200)
                status = "Out of Stock" if qty == 0 else ("Low Stock" if qty < 30 else "Good Stock")
                db.add(RetailerInventory(
                    retailer_id=r.retailer_id,
                    product_name=product,
                    quantity=qty,
                    status=status,
                ))

        # Grower clusters
        for i in range(15):
            ter = TERRITORIES[i % len(TERRITORIES)]
            crop = random.choice(CROPS)
            pest_risk = random.choices(PEST_RISKS, weights=[1, 2, 4, 6])[0]
            db.add(Grower(
                territory_id=ter["id"],
                tehsil=TEHSILS[i % len(TEHSILS)],
                district=ter["district"],
                state=ter["state"],
                crop_type=crop,
                crop_stage=random.choice(CROP_STAGES),
                grower_count=random.randint(50, 1200),
                pest_risk=pest_risk,
                urgency_score={"Critical": random.randint(80, 100), "High": random.randint(60, 79), "Medium": random.randint(40, 59), "Low": random.randint(10, 39)}[pest_risk],
                product_scans=random.randint(10, 800),
                engagement_rate=round(random.uniform(0.25, 0.92), 2),
                recommended_product=random.choice(PRODUCTS),
                recommended_advisory=random.choice(ADVISORIES),
            ))

        # Recommendations
        for rec in RECOMMENDATIONS_SEED:
            db.add(Recommendation(**rec, status="pending"))

        # Notifications for amit
        for n in NOTIFICATIONS_SEED:
            db.add(Notification(
                user_id=amit.id,
                title=n["title"],
                message=n["message"],
                type=n["type"],
                read=random.choice([True, False, False]),
            ))

        # Mandi prices
        for mp in MANDI_PRICES_SEED:
            db.add(MandiPrice(**mp))

        # Sample visits (past 30 days)
        result = await db.execute(select(Retailer))
        all_retailers = result.scalars().all()
        for i in range(60):
            visit_date = date.today() - timedelta(days=random.randint(0, 29))
            r = random.choice(all_retailers)
            db.add(Visit(
                user_id=amit.id,
                retailer_id=r.retailer_id,
                territory_id="TER_0001",
                visit_date=visit_date,
                visit_status=random.choice(["completed", "completed", "no_purchase", "follow_up_needed"]),
                order_placed=random.choice([True, True, False]),
                order_value=round(random.uniform(5000, 85000), 0) if random.random() > 0.3 else 0,
                order_quantity=random.randint(10, 100),
                duration_minutes=random.randint(20, 75),
            ))

        # Risk events
        for ter in TERRITORIES[:3]:
            for _ in range(3):
                db.add(RiskEvent(
                    territory_id=ter["id"],
                    event_type=random.choice(["pest", "weather", "ndvi"]),
                    severity=random.choice(["High", "Medium", "Low"]),
                    lat=ter["lat"] + random.uniform(-0.2, 0.2),
                    lng=ter["lng"] + random.uniform(-0.2, 0.2),
                    description=random.choice([
                        "BPH infestation detected above economic threshold",
                        "Excessive rainfall causing waterlogging in fields",
                        "NDVI anomaly — possible nitrogen deficiency",
                        "Fungal spore count elevated — blast disease risk",
                    ]),
                    crop=random.choice(CROPS),
                    affected_area_km2=round(random.uniform(2, 45), 1),
                ))

        await db.commit()
