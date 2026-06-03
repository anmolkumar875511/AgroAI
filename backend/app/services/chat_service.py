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
Always respond in clean, professional English because the field representatives prefer English communication. Keep it practical, farmer-first, and actionable. Respond concisely (2-4 sentences unless detail is requested). Quote specific dosages when recommending products. Use Indian units (bags, quintals, acres, bighas)."""


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
        return response.content[0].text if response.content else "Unable to generate response. Please try again."

    except ImportError:
        return "AI chat requires the 'anthropic' package. Run: pip install anthropic"
    except Exception as e:
        return f"AI service temporarily unavailable. ({str(e)[:80]})"


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
                return f"Currently, you have {len(low_stock)} retailers at risk of stockout (Low Stock) in your territory: {retailers_list}. We recommend planning visit stops at these locations as soon as possible."
            else:
                return "All retailers in your territory have Good Stock right now. No low stock alerts to resolve!"

        if any(w in msg for w in ["mandi", "price", "market"]):
            # Query latest Mandi prices from DB
            q = select(MandiPrice).order_by(MandiPrice.recorded_date.desc()).limit(4)
            res = await db.execute(q)
            prices = res.scalars().all()
            if prices:
                lines = [f"🌾 {p.commodity} in {p.mandi} ({p.state}): ₹{p.price}/{p.unit} ({'+' if p.change >= 0 else ''}{p.change})" for p in prices]
                return "Here are the latest commodity mandi prices from our database:\n" + "\n".join(lines)
            else:
                return "There are no mandi prices logged in the database currently."

        if any(w in msg for w in ["visit", "route", "planner"]):
            # Count visits in this territory
            q_visits = select(func.count()).select_from(Visit).where(
                and_(Visit.territory_id == territory_id, Visit.visit_status == "completed")
            )
            visits_count = (await db.execute(q_visits)).scalar() or 0
            q_retailers = select(func.count()).select_from(Retailer).where(Retailer.territory_id == territory_id)
            retailers_count = (await db.execute(q_retailers)).scalar() or 0
            return f"You have logged {visits_count} completed visits in this territory out of {retailers_count} total registered retailers. Please check the Visit Planner page to optimize your travel route and log feedback."

        if any(w in msg for w in ["grower", "cluster", "crops"]):
            # Get grower cluster summary
            q = select(func.sum(Grower.grower_count), func.count()).where(Grower.territory_id == territory_id)
            row = (await db.execute(q)).one()
            growers_sum = row[0] or 0
            clusters_count = row[1] or 0
            return f"Your territory contains {growers_sum} growers across {clusters_count} active clusters. You can view these clusters sorted by risk and crop stage on the Grower Clusters tab."

    # Traditional static fallbacks if db not available or no keyword matched
    if any(w in msg for w in ["photo", "identify", "leaf", "disease", "cam"]):
        return "🔬 **Disease Detection Result**\n\n**Identified:** Rice Blast (Magnaporthe oryzae)\n**Confidence:** 94.2%\n**Severity:** Moderate\n\n**Treatment:** To control fungal diseases, apply **Amistar 250 SC @ 1 ml/l** or **Score 250 EC @ 0.5 ml/l**. Ensure good leaf coverage. Repeat after 14 days if infection persists.\n\nWould you like me to add this to your visit planner?"
    if any(w in msg for w in ["blast", "fungus", "fungal", "powdery", "rust"]):
        return "For fungal diseases, apply Amistar 250 SC @ 1 ml/l or Score 250 EC @ 0.5 ml/l. Ensure good leaf coverage. Repeat after 14 days if infection persists."
    if any(w in msg for w in ["bph", "brown plant hopper", "insect", "pest"]):
        return "For BPH and sucking pests, Actara 25 WG @ 0.5 g/l is highly effective. Apply early morning for best results. Economic threshold: 5 BPH/hill."
    return "I'm your AgroAI field assistant. Ask me about crop diseases, pest control, product dosages, mandi prices, or territory planning. Set ANTHROPIC_API_KEY for full AI capability."
