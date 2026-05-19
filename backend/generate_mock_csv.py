import csv
import os
import random
from datetime import datetime, timedelta

os.makedirs("data", exist_ok=True)

csv_path = "data/agroai_master_scored_data.csv"

states = ["Bihar", "Maharashtra", "Punjab", "Uttar Pradesh", "Gujarat"]
districts = {
    "Bihar": ["Patna", "Muzaffarpur", "Darbhanga", "Gaya"],
    "Maharashtra": ["Amravati", "Nagpur", "Pune", "Nashik"],
    "Punjab": ["Ludhiana", "Amritsar", "Patiala", "Jalandhar"],
    "Uttar Pradesh": ["Varanasi", "Lucknow", "Kanpur", "Meerut"],
    "Gujarat": ["Ahmedabad", "Surat", "Rajkot", "Vadodara"]
}
tehsils = {
    "Patna": ["Patna Sadar", "Danapur", "Barh"],
    "Muzaffarpur": ["Sakra", "Mushahari", "Kanti"],
    "Darbhanga": ["Darbhanga Sadar", "Keoti", "Benipur"],
    "Gaya": ["Gaya Sadar", "Sherghati", "Bodh Gaya"],
    "Amravati": ["Amravati Sadar", "Achalpur", "Morshi"],
    "Nagpur": ["Nagpur Sadar", "Kamthi", "Umred"],
    "Pune": ["Haveli", "Baramati", "Shirur"],
    "Nashik": ["Nashik Sadar", "Sinnar", "Niphad"],
    "Ludhiana": ["Ludhiana East", "Ludhiana West", "Khanna"],
    "Amritsar": ["Amritsar II", "Ajnala", "Baba Bakala"],
    "Patiala": ["Patiala Sadar", "Nabha", "Rajpura"],
    "Jalandhar": ["Jalandhar I", "Jalandhar II", "Nakodar"],
    "Varanasi": ["Varanasi Sadar", "Pindra", "Ganga Pur"],
    "Lucknow": ["Lucknow Sadar", "Malihabad", "Bakshi Ka Talab"],
    "Kanpur": ["Kanpur Sadar", "Bilhau", "Ghatampur"],
    "Meerut": ["Meerut Sadar", "Mawana", "Sardhana"],
    "Ahmedabad": ["Ahmedabad Sadar", "Daskroi", "Sanand"],
    "Surat": ["Surat Sadar", "Choryasi", "Olpad"],
    "Rajkot": ["Rajkot Sadar", "Gondal", "Jetpur"],
    "Vadodara": ["Vadodara Sadar", "Dabhoi", "Savli"]
}

# Match the territory_ids in seed.py:
# Amit Sharma: TER_0001 (Bihar)
# Priya Tiwari: TER_0116 (Maharashtra)
# Rajesh Verma: TER_0447 (Punjab)
territory_map = {
    "Bihar": "TER_0001",
    "Maharashtra": "TER_0116",
    "Punjab": "TER_0447",
    "Uttar Pradesh": "TER_0002",
    "Gujarat": "TER_0003"
}

products = [
    ("SKU_001", "Amistar 250 SC"),
    ("SKU_002", "Actara 25 WG"),
    ("SKU_003", "Tilt 250 EC"),
    ("SKU_004", "Movondo"),
    ("SKU_005", "Score 250 EC"),
    ("SKU_006", "Vibrance Integral")
]

headers = [
    "retailer_id", "territory_id", "state", "district", "tehsil",
    "last_visit_date", "last_visit_days",
    "sales_qty_30", "sales_value_30", "transactions_30",
    "sales_qty_7", "sales_value_7", "transactions_7",
    "sales_growth_ratio", "total_stock_qty", "unique_skus", "stock_status",
    "recommended_sku_id", "recommended_product", "product_sales_qty_30",
    "grower_count", "avg_farm_size", "product_scans", "campaign_attendance",
    "total_messages", "total_opened", "total_clicked", "engagement_rate",
    "sales_demand_score", "stock_alert_score", "last_visit_gap_score",
    "product_relevance_score", "grower_engagement_score", "visit_priority_score",
    "priority_level", "recommended_action", "explanation"
]

random.seed(42)
rows = []

for idx in range(1, 1001):
    state = random.choice(states)
    dist = random.choice(districts[state])
    teh = random.choice(tehsils[dist])
    terr_id = territory_map[state]
    
    # visit dates
    last_visit_days = random.randint(1, 60)
    last_visit_date = (datetime.utcnow() - timedelta(days=last_visit_days)).strftime("%Y-%m-%d")
    
    # sales
    sales_qty_30 = round(random.uniform(50, 500), 2)
    sales_value_30 = round(sales_qty_30 * random.uniform(200, 1500), 2)
    transactions_30 = random.randint(5, 30)
    
    sales_qty_7 = round(sales_qty_30 * random.uniform(0.1, 0.35), 2)
    sales_value_7 = round(sales_qty_7 * random.uniform(200, 1500), 2)
    transactions_7 = random.randint(1, 10)
    
    sales_growth_ratio = round(random.uniform(0.5, 2.0), 2)
    
    # stock
    total_stock_qty = round(random.uniform(10, 200), 2)
    unique_skus = random.randint(1, 6)
    
    if total_stock_qty < 30:
        stock_status = "Low Stock"
    elif total_stock_qty < 15:
        stock_status = "Out of Stock"
    else:
        stock_status = "Good Stock"
        
    recommended_sku_id, recommended_product = random.choice(products)
    product_sales_qty_30 = round(sales_qty_30 * random.uniform(0.1, 0.4), 2)
    
    # growers
    grower_count = random.randint(10, 150)
    avg_farm_size = round(random.uniform(2.0, 15.0), 2)
    product_scans = random.randint(5, 100)
    campaign_attendance = random.randint(2, 50)
    
    # engagement
    total_messages = random.randint(10, 200)
    total_opened = random.randint(5, total_messages)
    total_clicked = random.randint(0, total_opened)
    engagement_rate = round((total_clicked / total_messages) * 100, 2) if total_messages > 0 else 0.0
    
    # scores (0 - 100)
    sales_demand_score = round(random.uniform(20, 95), 2)
    stock_alert_score = round(random.uniform(10, 95), 2)
    last_visit_gap_score = round(last_visit_days * 1.5, 2)
    if last_visit_gap_score > 100: last_visit_gap_score = 100.0
    product_relevance_score = round(random.uniform(30, 95), 2)
    grower_engagement_score = round(random.uniform(20, 95), 2)
    
    visit_priority_score = round(
        (sales_demand_score * 0.2) + 
        (stock_alert_score * 0.2) + 
        (last_visit_gap_score * 0.4) + 
        (grower_engagement_score * 0.2), 
        2
    )
    
    if visit_priority_score > 75:
        priority_level = "High"
        recommended_action = "Schedule Immediate Visit"
        explanation = f"Critical stocking issues combined with high last visit gap of {last_visit_days} days. High demand potential detected."
    elif visit_priority_score > 40:
        priority_level = "Medium"
        recommended_action = "Schedule Routine Visit"
        explanation = f"Moderate urgency. Stock is stable but last visited {last_visit_days} days ago."
    else:
        priority_level = "Low"
        recommended_action = "Monitor Remotely"
        explanation = "Low priority. Good stock levels and high regular engagement."
        
    rows.append({
        "retailer_id": f"RTL_{idx:05d}",
        "territory_id": terr_id,
        "state": state,
        "district": dist,
        "tehsil": teh,
        "last_visit_date": last_visit_date,
        "last_visit_days": last_visit_days,
        "sales_qty_30": sales_qty_30,
        "sales_value_30": sales_value_30,
        "transactions_30": transactions_30,
        "sales_qty_7": sales_qty_7,
        "sales_value_7": sales_value_7,
        "transactions_7": transactions_7,
        "sales_growth_ratio": sales_growth_ratio,
        "total_stock_qty": total_stock_qty,
        "unique_skus": unique_skus,
        "stock_status": stock_status,
        "recommended_sku_id": recommended_sku_id,
        "recommended_product": recommended_product,
        "product_sales_qty_30": product_sales_qty_30,
        "grower_count": grower_count,
        "avg_farm_size": avg_farm_size,
        "product_scans": product_scans,
        "campaign_attendance": campaign_attendance,
        "total_messages": total_messages,
        "total_opened": total_opened,
        "total_clicked": total_clicked,
        "engagement_rate": engagement_rate,
        "sales_demand_score": sales_demand_score,
        "stock_alert_score": stock_alert_score,
        "last_visit_gap_score": last_visit_gap_score,
        "product_relevance_score": product_relevance_score,
        "grower_engagement_score": grower_engagement_score,
        "visit_priority_score": visit_priority_score,
        "priority_level": priority_level,
        "recommended_action": recommended_action,
        "explanation": explanation
    })

with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=headers)
    writer.writeheader()
    writer.writerows(rows)

print(f"Successfully generated {len(rows)} mock retailers at {csv_path}!")
