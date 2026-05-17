from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client: AsyncIOMotorClient = None


async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    print(f"Connected to MongoDB Atlas: {settings.DB_NAME}")


async def disconnect_db():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB Atlas")


def get_db():
    return client[settings.DB_NAME]


# Collection helpers
def get_collection(name: str):
    return client[settings.DB_NAME][name]
