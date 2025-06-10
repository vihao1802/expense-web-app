import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from configs.config import settings

MONGO_URI = settings.MONGO_URI
DB_NAME = settings.DB_NAME

client = AsyncIOMotorClient(MONGO_URI)
db = client.get_database(DB_NAME)  

async def test_mongo_connection():
    try:
        await db.command("ping")
        print("✅ MongoDB connected successfully.")

        # Uniqueness index
        await db["accounts"].create_index("email", unique=True)
    except Exception as e:
        print("❌ MongoDB connection failed:", e)

asyncio.create_task(test_mongo_connection())