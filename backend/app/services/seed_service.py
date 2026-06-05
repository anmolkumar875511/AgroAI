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
    Grower, Recommendation, Notification, MandiPrice, Visit, RiskEvent, VisitFeedback,
)

TERRITORIES = [
    {"id": "TER_0001", "name": "Patna North", "state": "Bihar", "district": "Patna", "lat": 25.5941, "lng": 85.1376, "zoom": 11},
    {"id": "TER_0002", "name": "Muzaffarpur South", "state": "Bihar", "district": "Muzaffarpur", "lat": 26.1197, "lng": 85.3910, "zoom": 11},
    {"id": "TER_0003", "name": "Gaya West", "state": "Bihar", "district": "Gaya", "lat": 24.7955, "lng": 84.9994, "zoom": 11},
    {"id": "TER_0004", "name": "Ludhiana East", "state": "Punjab", "district": "Ludhiana", "lat": 30.9010, "lng": 75.8573, "zoom": 11},
    {"id": "TER_0005", "name": "Amravati Sadar", "state": "Maharashtra", "district": "Amravati", "lat": 20.9374, "lng": 77.7796, "zoom": 11},
    {"id": "TER_0006", "name": "Lucknow East", "state": "Uttar Pradesh", "district": "Lucknow", "lat": 26.8467, "lng": 80.9462, "zoom": 11},
    {"id": "TER_0007", "name": "Ahmedabad Central", "state": "Gujarat", "district": "Ahmedabad", "lat": 23.0225, "lng": 72.5714, "zoom": 11},
    {"id": "TER_0008", "name": "Bengaluru North", "state": "Karnataka", "district": "Bengaluru", "lat": 12.9716, "lng": 77.5946, "zoom": 11},
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
    {
        "email": "rajesh@agroai.com", "password": "password123",
        "name": "Rajesh Verma", "role": "agent",
        "territory_id": "TER_0004", "territory": "Ludhiana East",
        "employee_id": "EMP003", "phone": "+91 76543 21098",
    },
    {
        "email": "suresh@agroai.com", "password": "password123",
        "name": "Suresh Kumar", "role": "agent",
        "territory_id": "TER_0006", "territory": "Lucknow East",
        "employee_id": "EMP004", "phone": "+91 91122 33445",
    },
    {
        "email": "neha@agroai.com", "password": "password123",
        "name": "Neha Singh", "role": "agent",
        "territory_id": "TER_0007", "territory": "Ahmedabad Central",
        "employee_id": "EMP005", "phone": "+91 92233 44556",
    },
    {
        "email": "kiran@agroai.com", "password": "password123",
        "name": "Kiran Rao", "role": "agent",
        "territory_id": "TER_0008", "territory": "Bengaluru North",
        "employee_id": "EMP006", "phone": "+91 93344 55667",
    },
    {
        "email": "admin@agroai.com", "password": "admin123",
        "name": "System Admin", "role": "admin",
        "territory_id": "TER_0001", "territory": "All India",
        "employee_id": "ADM001", "phone": "+91 90000 00000",
    },
]

PRODUCTS = [
    "Amistar 250 SC", "Actara 25 WG", "Tilt 250 EC",
    "Score 250 EC", "Movondo", "Vibrance Integral",
    "Ridomil Gold", "Axial 50 EC", "Custodia", "Pegasus 500 SC",
]

RETAILER_NAMES_BY_STATE = {
    "Bihar": ["Kisan Seed Store", "Mahavir Fertilizers", "Ganga Agri Kendra", "Patna Agro Center", "Ram Krishi Bhandar", "Dhan Lakshmi Agro", "Jai Kisan Seeds", "Mithila Krishi Kendra"],
    "Punjab": ["Punjab Agri Hub", "Guru Nanak Fertilizers", "Satkar Agro Store", "Malwa Seeds Store", "Doaba Krishi Center", "Sikh Seeds", "Golden Agro Inputs", "Ludhiana Krishi"],
    "Maharashtra": ["Maratha Agro Store", "Amravati Seeds Center", "Vidarbha Fertilizers", "Sahyadri Agri Hub", "Shetkari Seva Kendra", "Moreshwar Agro", "Shivaji Seeds", "Maharashtra Krishi"],
    "Uttar Pradesh": ["Lucknow Agri Hub", "Avadh Seeds Bhandar", "Ganga Krishi Seva", "UP Crop Solution", "Shree Ram Agri", "Kisan Vikas Store", "Varanasi Agro Center", "Krishna Fertilizers"],
    "Gujarat": ["Khedut Seva Kendra", "Gujarat Agro Input", "Kathiawar Seeds", "Ahmedabad Agri Care", "Sardar Patel Fertilizers", "Jai Jawan Agro Stores", "Vikas Krishi Kendra", "Gujarat Seeds"],
    "Karnataka": ["Karnataka Agri Solutions", "Cauvery Seed Agency", "Bengaluru Agro Store", "Basaveshwara Fertilizers", "Kalyana Agri Inputs", "Krishna Seed Center", "Nandi Agro", "Basava Seeds"],
}

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
           "Amravati Sadar", "Achalpur", "Lucknow Sadar", "Ahmedabad Rural", "Bengaluru North"]

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
    {"title": "📦 Stock Alert — Amistar 250 SC", "message": "Kisan Seed Store has only 12 units left. Reorder threshold breached. Sales risk: ₹45,000.", "type": "warning"},
    {"title": "✅ Visit Target Achieved", "message": "Congratulations! You've completed 38/40 planned visits this week. Efficiency score: 95%.", "type": "success"},
    {"title": "🌦️ Weather Advisory — Bihar Zone", "message": "Heavy rainfall forecast (>50mm) in next 48 hours. Pre-position fungicides at key retailers.", "type": "alert"},
    {"title": "📊 Weekly Report Ready", "message": "Your territory performance report for May Week 3 is ready. Revenue: ₹3.2L (+14% MoM).", "type": "info"},
    {"title": "🌿 NDVI Anomaly Detected", "message": "Crop stress index elevated in Danapur Block. Possible nitrogen deficiency in 280 acres.", "type": "warning"},
    {"title": "💡 AI Recommendation Accepted", "message": "Retailer Kisan Seed Store accepted Amistar recommendation. Order placed: 50 units (₹12,500).", "type": "success"},
    {"title": "⏰ Follow-up Reminder", "message": "Mahavir Fertilizers follow-up due today. Last visit: 8 days ago. Priority: High.", "type": "info"},
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

        # Retrieve seeded users for linking
        result = await db.execute(select(User))
        all_users = result.scalars().all()
        amit = next((u for u in all_users if u.email == "amit@agroai.com"), all_users[0])
        priya = next((u for u in all_users if u.email == "priya@agroai.com"), all_users[0])
        rajesh = next((u for u in all_users if u.email == "rajesh@agroai.com"), all_users[0])
        suresh = next((u for u in all_users if u.email == "suresh@agroai.com"), all_users[0])
        neha = next((u for u in all_users if u.email == "neha@agroai.com"), all_users[0])
        kiran = next((u for u in all_users if u.email == "kiran@agroai.com"), all_users[0])

        def get_agent_for_territory(t_id: str):
            if t_id in ["TER_0001", "TER_0002", "TER_0003"]:
                return amit
            if t_id == "TER_0004":
                return rajesh
            if t_id == "TER_0005":
                return priya
            if t_id == "TER_0006":
                return suresh
            if t_id == "TER_0007":
                return neha
            if t_id == "TER_0008":
                return kiran
            return amit

        # Retailers (6 retailers per territory, total 48)
        retailers_created = []
        retailer_idx = 1
        for ter in TERRITORIES:
            state = ter["state"]
            names_pool = RETAILER_NAMES_BY_STATE.get(state, RETAILER_NAMES)
            for idx in range(6):
                name = names_pool[idx % len(names_pool)] + f" ({ter['name'].split()[0]} #{idx+1})"
                tehsil = f"{ter['name'].split()[0]} Tehsil {chr(65+idx)}"
                priority = random.choice(["High", "High", "Medium", "Medium", "Low"])
                score = round(random.uniform(45, 95), 1)
                stock_status = random.choice(["Good Stock", "Good Stock", "Low Stock", "Out of Stock"])
                stock_qty = {"Good Stock": random.randint(200, 500), "Low Stock": random.randint(30, 80), "Out of Stock": 0}[stock_status]
                last_visit_days = random.randint(0, 45)

                r = Retailer(
                    retailer_id=f"RTL_{retailer_idx:05d}",
                    name=name,
                    territory_id=ter["id"],
                    location=f"{tehsil}, {ter['district']}",
                    tehsil=tehsil,
                    district=ter["district"],
                    state=ter["state"],
                    lat=ter["lat"] + random.uniform(-0.15, 0.15),
                    lng=ter["lng"] + random.uniform(-0.15, 0.15),
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
                retailer_idx += 1

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
        for i in range(24):
            ter = TERRITORIES[i % len(TERRITORIES)]
            crop = random.choice(CROPS)
            pest_risk = random.choices(PEST_RISKS, weights=[1, 2, 4, 6])[0]
            tehsil_idx = i % len(TEHSILS)
            db.add(Grower(
                territory_id=ter["id"],
                tehsil=TEHSILS[tehsil_idx],
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

        # Recommendations dynamically generated and correctly mapped
        recommendations_seeded_count = 0
        retailers_by_territory = {}
        for r in retailers_created:
            if r.territory_id not in retailers_by_territory:
                retailers_by_territory[r.territory_id] = []
            retailers_by_territory[r.territory_id].append(r)

        for territory_id, r_list in retailers_by_territory.items():
            # Seed 2 recommendations per territory: one pending, one applied
            # First recommendation (pending)
            r = r_list[0]
            rec_id = f"REC_{recommendations_seeded_count+1:03d}"
            crop = random.choice(CROPS)
            product = random.choice(PRODUCTS)
            pest_risk = random.choice(PEST_RISKS)
            priority = pest_risk
            explain_idx = recommendations_seeded_count % len(EXPLAINABLE_REASONS)
            db.add(Recommendation(
                id=rec_id,
                territory_id=territory_id,
                priority=priority,
                crop=crop,
                message=f"Pre-emptive application of {product} recommended at {r.name} to control {crop.lower()} disease risk.",
                weather="Humid (85%), Temperature 30°C" if priority in ["Critical", "High"] else "Sunny, 28°C",
                product=product,
                village=r.location.split(",")[0],
                farmer=f"Farmer cluster near {r.name}",
                retailer_id=r.retailer_id,
                pest_risk=pest_risk,
                next_action=f"Visit {r.name} to check inventory and recommend {product}",
                follow_up_timeline="Within 24 hours" if priority == "Critical" else "Within 3 days",
                status="pending",
                explainable_reasons=EXPLAINABLE_REASONS[explain_idx],
            ))
            recommendations_seeded_count += 1

            # Second recommendation (applied)
            r = r_list[3 % len(r_list)]
            rec_id = f"REC_{recommendations_seeded_count+1:03d}"
            crop = random.choice(CROPS)
            product = random.choice(PRODUCTS)
            pest_risk = random.choice(PEST_RISKS)
            priority = pest_risk
            explain_idx = recommendations_seeded_count % len(EXPLAINABLE_REASONS)
            db.add(Recommendation(
                id=rec_id,
                territory_id=territory_id,
                priority=priority,
                crop=crop,
                message=f"Pre-emptive application of {product} recommended at {r.name} to control {crop.lower()} disease risk.",
                weather="Humid (85%), Temperature 30°C" if priority in ["Critical", "High"] else "Sunny, 28°C",
                product=product,
                village=r.location.split(",")[0],
                farmer=f"Farmer cluster near {r.name}",
                retailer_id=r.retailer_id,
                pest_risk=pest_risk,
                next_action=f"Visit {r.name} to check inventory and recommend {product}",
                follow_up_timeline="Within 24 hours" if priority == "Critical" else "Within 3 days",
                status="applied",
                explainable_reasons=EXPLAINABLE_REASONS[explain_idx],
            ))
            recommendations_seeded_count += 1


        # Notifications for manager and amit
        for n in NOTIFICATIONS_SEED:
            # Add for manager
            db.add(Notification(
                user_id=2,  # manager's ID
                title=n["title"],
                message=n["message"],
                type=n["type"],
                read=random.choice([True, False, False]),
            ))
            # Add for amit
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

        # Seed 120 visits and matching VisitFeedback records (past 30 days)
        for i in range(120):
            visit_date = date.today() - timedelta(days=random.randint(0, 29))
            r = random.choice(retailers_created)
            agent = get_agent_for_territory(r.territory_id)

            status = random.choice(["completed", "completed", "no_purchase", "follow_up_needed"])
            order_placed = random.choice([True, True, False]) if status == "completed" else False
            order_val = round(random.uniform(5000, 85000), 0) if order_placed else 0.0
            order_qty = random.randint(10, 100) if order_placed else 0
            duration = random.randint(20, 75)

            visit = Visit(
                user_id=agent.id,
                retailer_id=r.retailer_id,
                territory_id=r.territory_id,
                visit_date=visit_date,
                visit_status=status,
                order_placed=order_placed,
                order_value=order_val,
                order_quantity=order_qty,
                duration_minutes=duration,
            )
            db.add(visit)

            # Seed matching VisitFeedback record for non-progress visits
            if status != "in_progress":
                fb = VisitFeedback(
                    territory_id=r.territory_id,
                    retailer_id=r.retailer_id,
                    visit_status=status,
                    products_discussed=random.sample(PRODUCTS, k=random.randint(1, 3)),
                    order_placed=order_placed,
                    order_quantity=order_qty,
                    order_value=order_val,
                    farmer_response=random.choice(["positive", "positive", "neutral", "skeptical"]),
                    follow_up_needed=(status == "follow_up_needed"),
                    next_follow_up_date=(date.today() + timedelta(days=random.randint(3, 14))).isoformat() if status == "follow_up_needed" else None,
                    notes=f"Discussed regional crop health. Retailer requested details on {random.choice(PRODUCTS)}.",
                    created_at=datetime.combine(visit_date, datetime.min.time()) + timedelta(hours=random.randint(9, 17)),
                )
                db.add(fb)

        # Risk events (across all 8 territories)
        for ter in TERRITORIES:
            for _ in range(2):
                db.add(RiskEvent(
                    territory_id=ter["id"],
                    event_type=random.choice(["pest", "weather", "ndvi"]),
                    severity=random.choice(["High", "Medium", "Low"]),
                    lat=ter["lat"] + random.uniform(-0.1, 0.1),
                    lng=ter["lng"] + random.uniform(-0.1, 0.1),
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
