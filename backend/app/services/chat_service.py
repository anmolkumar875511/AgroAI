"""
Chat service — builds context-enriched prompts from territory data,
streams Anthropic Claude responses.
"""
from __future__ import annotations
import os
from typing import AsyncIterator
from app.schemas.schemas import ChatMessage

SYSTEM_PROMPT = """You are AgroAI — an expert field intelligence assistant for Syngenta crop protection field representatives operating across India (Bihar, UP, Maharashtra, Punjab, Gujarat).

Your expertise covers:
• Crop protection: fungicides, insecticides, herbicides, seed treatments
• Key Syngenta brands: Amistar 250 SC (azoxystrobin), Actara 25 WG (thiamethoxam), Tilt 250 EC (propiconazole), Score 250 EC (difenoconazole), Movondo (mefentrifluconazole), Vibrance Integral (sedaxane+thiamethoxam), Ridomil Gold (metalaxyl-M), Axial 50 EC (pinoxaden), Coragen 20 SC (chlorantraniliprole), Pegasus 500 SC (diafenthiuron)
• Pest identification: BPH, stem borer, leaf blast, powdery mildew, downy mildew, whitefly, aphids, bollworm
• Crop stages: rice, wheat, cotton, maize, mustard, soybean, sugarcane
• Mandi market intelligence and price trends
• Visit planning, retailer prioritization, grower engagement

Respond concisely (2-4 sentences unless detail is requested). Always be practical, farmer-first, and actionable. Quote specific dosages when recommending products. Use Indian units (bags, quintals, acres, bighas)."""


async def get_ai_response(messages: list[ChatMessage], territory_id: str | None = None) -> str:
    """Returns plain text response from Anthropic."""
    try:
        import anthropic
        api_key = os.getenv("ANTHROPIC_API_KEY", "")
        if not api_key:
            return _fallback_response(messages[-1].content if messages else "")

        client = anthropic.Anthropic(api_key=api_key)
        api_messages = [{"role": m.role, "content": m.content} for m in messages]

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=api_messages,
        )
        return response.content[0].text if response.content else "Unable to generate response."

    except ImportError:
        return "AI chat requires the 'anthropic' package. Run: pip install anthropic"
    except Exception as e:
        return f"AI service temporarily unavailable. ({str(e)[:80]})"


def _fallback_response(user_msg: str) -> str:
    """Rule-based fallback when API key is not set."""
    msg = user_msg.lower()
    if any(w in msg for w in ["blast", "fungus", "fungal", "powdery", "rust"]):
        return "For fungal diseases, apply Amistar 250 SC @ 1 ml/l or Score 250 EC @ 0.5 ml/l. Ensure good leaf coverage. Repeat after 14 days if infection persists."
    if any(w in msg for w in ["bph", "brown plant hopper", "insect", "pest"]):
        return "For BPH and sucking pests, Actara 25 WG @ 0.5 g/l is highly effective. Apply early morning for best results. Economic threshold: 5 BPH/hill."
    if any(w in msg for w in ["stock", "inventory", "reorder"]):
        return "Check retailer stock via the Retailer Insights page. Low Stock status triggers automatic rescore. Priority visit recommended within 48 hours to prevent stockout revenue loss."
    if any(w in msg for w in ["mandi", "price", "market"]):
        return "Mandi prices are updated daily. Check the Dashboard → Mandi Prices section for latest commodity rates across Bihar and Maharashtra mandis."
    if any(w in msg for w in ["visit", "route", "planner"]):
        return "Use the Visit Planner to see AI-prioritised retailer queue. Retailers are scored 0-100 based on visit gap, stock status, revenue potential, and pest risk proximity."
    return "I'm your AgroAI field assistant. Ask me about crop diseases, pest control, product dosages, mandi prices, or territory planning. Set ANTHROPIC_API_KEY for full AI capability."
