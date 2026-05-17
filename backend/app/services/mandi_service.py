from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.core.database import get_collection


# Static seed prices (INR per quintal) — refreshed daily in production
BASE_PRICES = {
    "Wheat":       {"base": 2230, "icon": "Wheat",  "market": "Patna Mandi"},
    "Rice (Paddy)":{"base": 2201, "icon": "Sprout", "market": "Muzaffarpur"},
    "Maize":       {"base": 1930, "icon": "Sprout", "market": "Gaya Mandi"},
    "Mustard":     {"base": 5330, "icon": "Sprout", "market": "Patna Mandi"},
    "Soybean":     {"base": 3780, "icon": "Sprout", "market": "Chapra Mandi"},
    "Cotton":      {"base": 6200, "icon": "Sprout", "market": "Patna Mandi"},
}


async def get_mandi_prices(state: str = "Bihar") -> List[Dict[str, Any]]:
    """
    Return today's mandi prices.
    In production: fetch from data.gov.in API and cache in MongoDB.
    For now: returns realistic synthetic daily-varying prices.
    """
    mandi_col = get_collection("mandi_prices")

    # Check cache (updated today)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    cached = await mandi_col.find_one({"state": state, "date": {"$gte": today_start}})

    if cached and "prices" in cached:
        return cached["prices"]

    # Generate today's prices with daily variance
    import random
    seed = int(datetime.utcnow().strftime("%Y%m%d"))
    random.seed(seed)

    prices = []
    for crop, info in BASE_PRICES.items():
        change = random.randint(-80, 150)
        price = info["base"] + change
        prices.append({
            "crop": crop,
            "icon": info["icon"],
            "price": f"₹{price:,}",
            "unit": "/qtl",
            "change": f"+₹{change}" if change >= 0 else f"-₹{abs(change)}",
            "up": change >= 0,
            "market": info["market"],
            "updated_at": datetime.utcnow().isoformat(),
        })

    # Cache for the day
    await mandi_col.update_one(
        {"state": state, "date": {"$gte": today_start}},
        {"$set": {"state": state, "prices": prices, "date": datetime.utcnow()}},
        upsert=True,
    )

    return prices
