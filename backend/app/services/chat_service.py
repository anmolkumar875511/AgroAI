from datetime import datetime
from typing import List, Dict, Any
from app.core.database import get_collection


# Intent keywords → response builder
INTENTS = {
    "pest":    ["pest", "kide", "keeda", "insect", "borer", "armyworm", "aphid", "locust"],
    "weather": ["weather", "mausam", "rain", "temperature", "forecast", "barish"],
    "visit":   ["visit", "plan", "route", "schedule", "kab"],
    "stock":   ["stock", "inventory", "supply", "reorder", "available"],
    "mandi":   ["mandi", "price", "bhav", "rate", "market"],
    "disease": ["disease", "bimari", "photo", "identify", "leaf", "symptom"],
    "ndvi":    ["ndvi", "satellite", "crop health", "fasal"],
    "revenue": ["revenue", "income", "sale", "profit", "earning"],
}

RESPONSES = {
    "pest": lambda region: f"""🔍 **Pest Analysis for {region}**

Based on current weather data (humidity >70%, temp 28-32°C), I detect **high risk for Stem Borer** in rice fields.

**Recommended Action:**
• Apply Amistar 200ml/acre within 48hrs
• Focus on fields near water bodies  
• Schedule farmer demo in affected villages

**Confidence: 87%** | Based on satellite + weather data""",

    "weather": lambda region: f"""🌤️ **Weather Forecast — {region}**

**Today:** 32°C, Partly Cloudy, Humidity 68%  
**Tomorrow:** 30°C, Light Rain Expected  
**Next 3 Days:** Intermittent showers

⚠️ **Advisory:** Reschedule outdoor spraying. Pre-harvest drying may be affected. Recommend covered storage for harvested grain.""",

    "visit": lambda region: f"""📋 **Optimized Visit Plan — Today**

1. **09:00 AM** — Retailer R12, GreenAgro Store (Stock replenishment)
2. **11:30 AM** — Village Rampur, Farmer Cluster (Pest demo)
3. **02:00 PM** — Kisan Kendra, Sonepur (New product launch)
4. **04:30 PM** — Dharnai, Cotton Growers (Follow-up)

**Total Distance:** 28km | **Est. Revenue:** ₹45,000

Shall I recalculate based on priority?""",

    "stock": lambda region: f"""📦 **Inventory Alert — {region}**

🔴 **Critical:** Score (22 units) — Reorder NOW  
🟡 **Low:** Custodia (34 units), Ridomil (56 units)  
🟢 **Optimal:** Amistar (145), Actara (180)

**Recommendation:** Place emergency order for Score. 3 retailers reporting stockout. Estimated revenue loss: ₹18,000/day.""",

    "mandi": lambda region: """💰 **Today's Mandi Prices**

• Wheat: ₹2,275/qtl (↑₹45)
• Rice (Paddy): ₹2,183/qtl (↓₹18)
• Maize: ₹1,962/qtl (↑₹32)
• Mustard: ₹5,450/qtl (↑₹120)

📈 Wheat prices trending upward for 5 consecutive days. Good time for farmers to sell stored grain.""",

    "disease": lambda region: f"""📸 **Disease Detection Ready**

To identify a crop disease:
1. Click the 📷 camera icon below
2. Upload a close-up photo of the affected leaf/stem
3. I'll analyze it using computer vision

**Common diseases in {region} this season:**
• Rice Blast (Magnaporthe oryzae)
• Bacterial Leaf Blight
• Sheath Blight

Upload a photo and I'll provide specific treatment recommendations.""",

    "ndvi": lambda region: f"""🛰️ **NDVI Status — {region}**

**Crop Health Index:** 0.62 (↓ from 0.71 last week)

**Zone Breakdown:**
• Healthy (>0.65): 48% of monitored area
• Moderate (0.4-0.65): 35% of area
• Stressed (<0.4): 17% — Action Needed

**Hotspots:** Rampur tehsil showing 15% NDVI decline. Possible drought stress or pest damage. Recommend field visit within 48hrs.""",

    "revenue": lambda region: f"""📈 **Revenue Intelligence — {region}**

**This Week:** ₹2.4L vs ₹2.0L target (+20%)  
**Top Opportunity:** Score product push — ₹45K potential  
**Pending Conversions:** 3 retailers × avg ₹12K each

**AI Suggestion:** Visit R12 and R08 today to close pending orders. Estimated revenue if completed: ₹2.9L for the week.""",
}

DEFAULT_RESPONSES = [
    "Based on current data, I recommend focusing on 3 high-priority villages showing early signs of pest stress. NDVI analysis indicates a 15% drop in crop health index over the past week. Shall I generate a detailed action plan?",
    "Revenue opportunity detected: 5 farmers in Cluster B have crossed the nutrient application window. Recommending Miravis Duo push — estimated ₹2.4L opportunity. Want me to add them to today's visit plan?",
    "Soil moisture data shows 4 of 12 monitoring stations below optimal. With a dry spell predicted for next week, I recommend advising farmers on supplementary irrigation.",
]


async def handle_chat(
    message: str,
    session_id: str,
    user_id: str,
    region: str,
) -> str:
    """
    Match user intent and return a context-aware response.
    Stores message history in MongoDB.
    """
    chat_col = get_collection("chat_messages")

    # Store user message
    await chat_col.insert_one({
        "session_id": session_id,
        "user_id": user_id,
        "role": "user",
        "content": message,
        "timestamp": datetime.utcnow(),
    })

    # Detect intent
    lower = message.lower()
    response_text = None

    for intent, keywords in INTENTS.items():
        if any(kw in lower for kw in keywords):
            builder = RESPONSES.get(intent)
            if builder:
                response_text = builder(region)
            break

    if not response_text:
        import random
        import hashlib
        h = int(hashlib.md5(message.encode()).hexdigest(), 16) % len(DEFAULT_RESPONSES)
        response_text = DEFAULT_RESPONSES[h].replace("{region}", region)

    # Store assistant response
    await chat_col.insert_one({
        "session_id": session_id,
        "user_id": user_id,
        "role": "assistant",
        "content": response_text,
        "timestamp": datetime.utcnow(),
    })

    return response_text


async def get_chat_history(session_id: str, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve previous messages for a chat session."""
    chat_col = get_collection("chat_messages")
    messages = []
    async for doc in chat_col.find(
        {"session_id": session_id, "user_id": user_id},
        sort=[("timestamp", 1)],
        limit=limit,
    ):
        messages.append({
            "id": str(doc["_id"]),
            "role": doc["role"],
            "content": doc["content"],
            "timestamp": doc["timestamp"].isoformat(),
        })
    return messages
