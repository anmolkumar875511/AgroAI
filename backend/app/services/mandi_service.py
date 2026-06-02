"""
Mandi service — attempts to pull live prices from data.gov.in,
falls back to DB seed data gracefully.
"""
from __future__ import annotations
import httpx
from datetime import datetime, timezone, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
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
    """Try to update from live Agmarknet API, then return prices from DB."""
    # Attempt to fetch live prices
    live_records = await fetch_live_prices()
    if live_records:
        for item in live_records:
            # Check if this commodity + mandi + state already exists
            q = select(MandiPrice).where(
                and_(
                    MandiPrice.commodity == item["commodity"],
                    MandiPrice.mandi == item["mandi"],
                    MandiPrice.state == item["state"]
                )
            )
            res = await db.execute(q)
            existing = res.scalar_one_or_none()
            if existing:
                existing.price = item["price"]
                existing.change = item["change"]
                existing.change_pct = item["change_pct"]
                existing.recorded_date = date.today()
            else:
                new_price = MandiPrice(
                    commodity=item["commodity"],
                    mandi=item["mandi"],
                    state=item["state"],
                    price=item["price"],
                    change=item["change"],
                    change_pct=item["change_pct"],
                    unit=item["unit"],
                    recorded_date=date.today()
                )
                db.add(new_price)
        try:
            await db.commit()
        except Exception:
            await db.rollback()

    # Now select from DB
    q = select(MandiPrice)
    if state:
        q = q.where(MandiPrice.state == state)
    q = q.order_by(MandiPrice.recorded_date.desc()).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()
