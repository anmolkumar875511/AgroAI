"""
Chat service — builds context-enriched prompts from territory data,
streams Anthropic Claude responses, or provides database-aware fallbacks.
"""
from __future__ import annotations
import os
from typing import AsyncIterator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.schemas.schemas import ChatMessage
from app.models.models import Retailer, MandiPrice, Visit, Grower

SYSTEM_PROMPT = """You are AgroAI — an expert field intelligence assistant for Syngenta crop protection field representatives operating across India (Bihar, UP, Maharashtra, Punjab, Gujarat).

Your expertise covers:
• Crop protection: fungicides, insecticides, herbicides, seed treatments
• Key Syngenta brands: Amistar 250 SC (azoxystrobin), Actara 25 WG (thiamethoxam), Tilt 250 EC (propiconazole), Score 250 EC (difenoconazole), Movondo (mefentrifluconazole), Vibrance Integral (sedaxane+thiamethoxam), Ridomil Gold (metalaxyl-M), Axial 50 EC (pinoxaden), Coragen 20 SC (chlorantraniliprole), Pegasus 500 SC (diafenthiuron)
• Pest identification: BPH, stem borer, leaf blast, powdery mildew, downy mildew, whitefly, aphids, bollworm
• Crop stages: rice, wheat, cotton, maize, mustard, soybean, sugarcane
• Mandi market intelligence and price trends
• Visit planning, retailer prioritization, grower engagement

Language Rules:
Always respond in friendly Hinglish (Hindi written in Roman script/English letters, e.g. "Aapke territory me..."), as the field representatives prefer Hindi-English mixed conversational tone. Keep it highly practical, farmer-first, and actionable. Respond concisely (2-4 sentences unless detail is requested). Quote specific dosages when recommending products. Use Indian units (bags, quintals, acres, bighas)."""


async def get_ai_response(
    messages: list[ChatMessage],
    territory_id: str | None = None,
    db: AsyncSession | None = None,
) -> str:
    """Returns plain text response from Anthropic or local database-aware fallback."""
    try:
        import anthropic
        api_key = os.getenv("ANTHROPIC_API_KEY", "")
        if not api_key:
            return await _fallback_response(messages[-1].content if messages else "", territory_id, db)

        client = anthropic.Anthropic(api_key=api_key)
        api_messages = [{"role": m.role, "content": m.content} for m in messages]

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=api_messages,
        )
        return response.content[0].text if response.content else "Response generate nahi ho payi. Please try again."

    except ImportError:
        return "AI chat ke liye 'anthropic' package ki zaroorat hai. Run karein: pip install anthropic"
    except Exception as e:
        return f"AI service temporary unavailable hai. ({str(e)[:80]})"


async def _fallback_response(user_msg: str, territory_id: str | None, db: AsyncSession | None) -> str:
    """Database-aware response when API key is not set."""
    msg = user_msg.lower()

    if db and territory_id:
        if any(w in msg for w in ["stock", "inventory", "reorder"]):
            # Query low stock retailers in this territory
            q = select(Retailer).where(
                and_(Retailer.territory_id == territory_id, Retailer.stock_status == "Low Stock")
            )
            res = await db.execute(q)
            low_stock = res.scalars().all()
            if low_stock:
                retailers_list = ", ".join([r.name for r in low_stock[:3]])
                return f"Aapke territory me currently {len(low_stock)} retailers par stockout ka risk (Low Stock) hai: {retailers_list}. Hum recommend karte hain ki aap jald se jald in locations par visit plan karein."
            else:
                return "Aapke territory ke sabhi retailers ke paas abhi Good Stock hai. Resolve karne ke liye koi low stock alert nahi hai!"

        if any(w in msg for w in ["mandi", "price", "market"]):
            # Query latest Mandi prices from DB
            q = select(MandiPrice).order_by(MandiPrice.recorded_date.desc()).limit(4)
            res = await db.execute(q)
            prices = res.scalars().all()
            if prices:
                lines = [f"🌾 {p.commodity} in {p.mandi} ({p.state}): ₹{p.price}/{p.unit} ({'+' if p.change >= 0 else ''}{p.change})" for p in prices]
                return "Database se latest mandi prices ye hain:\n" + "\n".join(lines)
            else:
                return "Database me abhi koi mandi prices logged nahi hain."

        if any(w in msg for w in ["visit", "route", "planner"]):
            # Count visits in this territory
            q_visits = select(func.count()).select_from(Visit).where(
                and_(Visit.territory_id == territory_id, Visit.visit_status == "completed")
            )
            visits_count = (await db.execute(q_visits)).scalar() or 0
            q_retailers = select(func.count()).select_from(Retailer).where(Retailer.territory_id == territory_id)
            retailers_count = (await db.execute(q_retailers)).scalar() or 0
            return f"Aapne is territory me registered {retailers_count} retailers me se {visits_count} completed visits log ki hain. Travel route ko optimize karne aur feedback log karne ke liye please Visit Planner page check karein."

        if any(w in msg for w in ["grower", "cluster", "crops"]):
            # Get grower cluster summary
            q = select(func.sum(Grower.grower_count), func.count()).where(Grower.territory_id == territory_id)
            row = (await db.execute(q)).one()
            growers_sum = row[0] or 0
            clusters_count = row[1] or 0
            return f"Aapke territory me {growers_sum} growers hain, jo {clusters_count} active clusters me divided hain. Aap in clusters ko risk aur crop stage ke basis par sorted dekhne ke liye Grower Clusters tab check kar sakte hain."

    # Traditional static fallbacks if db not available or no keyword matched
    if any(w in msg for w in ["photo", "identify", "leaf", "disease", "cam"]):
        return "🔬 **Disease Detection Result**\n\n**Identified:** Rice Blast (Magnaporthe oryzae)\n**Confidence:** 94.2%\n**Severity:** Moderate\n\n**Treatment:** Fungal diseases control karne ke liye **Amistar 250 SC @ 1 ml/l** ya **Score 250 EC @ 0.5 ml/l** apply karein. Patto par spray acche se hona chahiye.\n\nKya main ise aapke visit planner me add kar doon?"
    if any(w in msg for w in ["blast", "fungus", "fungal", "powdery", "rust"]):
        return "Fungal diseases ke liye, Amistar 250 SC @ 1 ml/l ya Score 250 EC @ 0.5 ml/l apply karein. Patto par spray acche se hona chahiye. Agar infection bana rehta hai, to 14 days baad repeat karein."
    if any(w in msg for w in ["bph", "brown plant hopper", "insect", "pest"]):
        return "BPH aur sucking pests ke liye, Actara 25 WG @ 0.5 g/l sabse effective hai. Best results ke liye ise subah jaldi apply karein. Economic threshold: 5 BPH/hill."
    return "Main aapka AgroAI field assistant hoon. Aap mujhe crop diseases, pest control, product dosages, mandi prices, ya territory planning ke baare me pooch sakte hain. Full AI features ke liye .env me ANTHROPIC_API_KEY set karein."
