import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.models import User, Visit, Retailer

async def test():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User))
        users = res.scalars().all()
        print('--- Users ---')
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}, Territory: {u.territory_id}")

        res = await db.execute(select(Visit))
        visits = res.scalars().all()
        print('\n--- Visits ---')
        for v in visits:
            print(f"ID: {v.id}, UserID: {v.user_id}, RetailerID: {v.retailer_id}, Status: {v.visit_status}")

        res = await db.execute(select(Retailer).limit(5))
        retailers = res.scalars().all()
        print('\n--- Retailers (5) ---')
        for r in retailers:
            print(f"ID: {r.id}, RetailerID: {r.retailer_id}, Name: {r.name}, Territory: {r.territory_id}")

if __name__ == "__main__":
    asyncio.run(test())
