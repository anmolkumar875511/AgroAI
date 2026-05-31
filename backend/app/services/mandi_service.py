"""
Mandi service — attempts to pull live prices from data.gov.in,
falls back to DB seed data gracefully.
"""
from __future__ import annotations
import httpx
from datetime import datetime, timezone, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.models import MandiPrice


AGMARKNET_URL = (
    "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    "?api-key=579b464db66ec23bdd000001cdd3946e44ce4aebb6364a17de2c&format=json&limit=20"
)


async def fetch_live_prices() -> list[dict]:
    """Try to pull from Agmarknet. Returns empty list on any error."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(AGMARKNET_URL)
            if r.status_code == 200:
                data = r.json()
                records = data.get("records", [])
                prices = []
                for rec in records[:10]:
                    try:
                        modal = float(rec.get("modal_price", 0))
                        min_p = float(rec.get("min_price", modal))
                        change = round(modal - min_p, 2)
                        change_pct = round((change / min_p * 100) if min_p else 0, 2)
                        prices.append({
                            "commodity": rec.get("commodity", "Unknown"),
                            "mandi": rec.get("market", "Unknown"),
                            "state": rec.get("state", "Unknown"),
                            "price": modal,
                            "change": change,
                            "change_pct": change_pct,
                            "unit": "quintal",
                        })
                    except Exception:
                        continue
                return prices
    except Exception:
        pass
    return []


async def get_mandi_prices(state: str | None, limit: int, db: AsyncSession) -> list[MandiPrice]:
    """Return prices from DB (seeded or refreshed from live)."""
    q = select(MandiPrice)
    if state:
        q = q.where(MandiPrice.state == state)
    q = q.order_by(MandiPrice.recorded_date.desc()).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()
