from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .models.database import SessionLocal, init_db, InsightMetadata
from .core.security import generate_new_key, encrypt_content
import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
init_db()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/insights/create")
async def create_insight(
    title: str, 
    content: str, 
    unlock_date: str, 
    creator: str, 
    db: Session = Depends(get_db)
):
    # 1. Generate unique key for this insight
    key = generate_new_key()
    
    # 2. Encrypt the content
    encrypted_blob = encrypt_content(content, key)
    
    # 3. Logic for IPFS Upload would go here (using httpx)
    mock_cid = f"ipfs_hash_{datetime.datetime.now().timestamp()}"
    
    # 4. Save metadata to SQLite
    new_insight = InsightMetadata(
        title=title,
        description="Encrypted Intelligence",
        cid=mock_cid,
        unlock_time=datetime.datetime.fromisoformat(unlock_date),
        creator_address=creator
    )
    
    db.add(new_insight)
    db.commit()
    
    return {
        "status": "locked",
        "cid": mock_cid,
        "decryption_key_preview": key[:10] + "...", # Securely store the full key elsewhere!
        "unlock_at": unlock_date
    }