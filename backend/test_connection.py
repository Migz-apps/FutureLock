import os
import httpx
import asyncio
from dotenv import load_dotenv
from app.models.database import init_db, SessionLocal

load_dotenv()

async def test_pinata():
    print("--- Checking Pinata ---")
    url = "https://api.pinata.cloud/data/testAuthentication"
    headers = {
        "pinata_api_key": os.getenv("PINATA_API_KEY"),
        "pinata_secret_api_key": os.getenv("PINATA_SECRET_KEY")
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                print("✅ Pinata Connection: SUCCESS!")
            else:
                print(f"❌ Pinata Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Connection Failed: {e}")

def test_database():
    print("\n--- Checking Database ---")
    try:
        init_db()
        db = SessionLocal()
        print("✅ SQLite Database: INITIALIZED!")
        db.close()
    except Exception as e:
        print(f"❌ Database Error: {e}")

if __name__ == "__main__":
    test_database()
    asyncio.run(test_pinata())