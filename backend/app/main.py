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

# Mount auth router (support both legacy and v1 APIs)
app.include_router(auth.router, prefix="/auth")
app.include_router(auth.router, prefix="/api/v1/auth")

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

@app.get("/api/v1/intel/public")
async def get_public_insights(db: Session = Depends(get_db)):
    # Returns public metadata for all items.
    insights = db.query(InsightMetadata).all()
    result = []
    for ins in insights:
        # Calculate days until unlock
        if ins.unlock_time:
            delta = ins.unlock_time - datetime.datetime.now()
            days = max(0, delta.days)
        else:
            days = 0
            
        result.append({
            "id": str(ins.id),
            "title": ins.title,
            "description": ins.description,
            "priceETH": ins.price,
            "priceUSD": str(float(ins.price) * 3000) if ins.price.replace('.','',1).isdigit() else "30.00",
            "category": getattr(ins, "category", "All"),
            "creator": ins.creator_address,
            "unlockDays": days
        })
        
    return result
