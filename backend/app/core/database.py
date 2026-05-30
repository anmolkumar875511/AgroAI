import sys
from pathlib import Path
from mongomock_motor import AsyncMongoMockClient
from app.core.config import settings

client: AsyncMongoMockClient = None


async def connect_db():
    global client
    client = AsyncMongoMockClient()
    print(f"Connected to in-memory mongomock database: {settings.DB_NAME}")

    # Run in-memory seeding
    try:
        backend_dir = Path(__file__).resolve().parent.parent.parent
        if str(backend_dir) not in sys.path:
            sys.path.append(str(backend_dir))

        from seed import seed
        db = client[settings.DB_NAME]

        print("[INFO] Starting in-memory database seeding...")
        await seed(db=db)
        print("[SUCCESS] In-memory database seeding completed!")
    except Exception as e:
        print(f"[ERROR] Error during in-memory database seeding: {e}")


async def disconnect_db():
    global client
    if client:
        client.close()
        print("Disconnected from in-memory database")


def get_db():
    return client[settings.DB_NAME]


# Collection helpers
def get_collection(name: str):
    return client[settings.DB_NAME][name]
