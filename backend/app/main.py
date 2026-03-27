from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .models.database import SessionLocal, init_db, InsightMetadata
import datetime
from fastapi.middleware.cors import CORSMiddleware

# Initialize
app = FastAPI()

# Fix CORS for local RCA network
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

from .api import auth

# Mount auth router
app.include_router(auth.router, prefix="/auth")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/insights/create")
async def create_insight(
    title: str = Query(...), 
    content: str = Query(...), 
    unlockDate: str = Query(...), # Changed to match frontend CamelCase
    creator: str = Query(...), 
    db: Session = Depends(get_db)
):
    # Mocking the encryption core since you have a separate core file
    mock_cid = f"ipfs_hash_{datetime.datetime.now().timestamp()}"
    
    # Save to SQLite
    new_insight = InsightMetadata(
        title=title,
        description="Encrypted Intelligence",
        cid=mock_cid,
        unlock_time=datetime.datetime.fromisoformat(unlockDate),
        creator_address=creator
    )
    
    db.add(new_insight)
    db.commit()
    
    return {
        "status": "locked",
        "cid": mock_cid,
        "unlock_at": unlockDate
    }