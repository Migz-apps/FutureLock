from fastapi import FastAPI, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from .models.database import SessionLocal, init_db, InsightMetadata, User, Purchase, Rating
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
    insights = db.query(InsightMetadata).all()
    result = []
    for ins in insights:
        if ins.unlock_time:
            delta = ins.unlock_time - datetime.datetime.now()
            days = max(0, delta.days)
            # Alternatively use float for exact days:
            # days = max(0, delta.total_seconds() / 86400)
        else:
            days = 0
            
        # Get creator Trust Score
        creator_user = db.query(User).filter(
            (User.username == ins.creator_address) | (User.wallet_address == ins.creator_address)
        ).first()
        
        trust_score = creator_user.trust_score if creator_user else 0.0
        ratings_count = creator_user.ratings_count if creator_user else 0
            
        result.append({
            "id": str(ins.id),
            "title": ins.title,
            "description": ins.description,
            "priceETH": ins.price,
            "priceUSD": str(float(ins.price) * 3000) if ins.price.replace('.','',1).isdigit() else "30.00",
            "category": getattr(ins, "category", "All"),
            "creator": creator_user.username if creator_user and creator_user.username else ins.creator_address,
            "unlockDays": days,
            "trustScore": trust_score,
            "ratingsCount": ratings_count
        })
        
    return result

@app.post("/api/v1/intel/{insight_id}/buy")
async def buy_insight(insight_id: int, request: Request, db: Session = Depends(get_db)):
    from .api.auth import decode_token
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(access_token)
    subject = payload.get("sub")
    
    user = db.query(User).filter((User.email == subject) | (User.wallet_address == subject)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    insight = db.query(InsightMetadata).filter(InsightMetadata.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
        
    purchase = Purchase(user_id=user.id, insight_id=insight.id, purchased_at=datetime.datetime.now())
    db.add(purchase)
    
    insight.buyers_count += 1
    db.commit()
    return {"message": "Purchase successful"}

@app.post("/api/v1/intel/{insight_id}/rate")
async def rate_insight(insight_id: int, score: int = Query(..., ge=1, le=5), is_dispute: bool = Query(False), request: Request = None, db: Session = Depends(get_db)):
    from .api.auth import decode_token
    # Auth user
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(access_token)
    subject = payload.get("sub")
    user = db.query(User).filter((User.email == subject) | (User.wallet_address == subject)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    insight = db.query(InsightMetadata).filter(InsightMetadata.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
        
    # Rating Eligibility: Only permitted for intelligence that has reached its unlock date
    if insight.unlock_time and insight.unlock_time > datetime.datetime.now():
        raise HTTPException(status_code=400, detail="Intelligence is still locked in The Vault.")

    # Weight Calculation
    weight = 0.5 # Guest/Standard User
    
    if user.role == "Creator" and user.trust_score >= 4.0:
        weight = 2.0 # Active Creator
        
    purchase = db.query(Purchase).filter(Purchase.user_id == user.id, Purchase.insight_id == insight.id).first()
    if purchase and purchase.purchased_at < insight.unlock_time:
        weight = 5.0 # Verified Buyer (Paid before unlock)

    # Save Rating
    existing_rating = db.query(Rating).filter(Rating.user_id == user.id, Rating.insight_id == insight.id).first()
    if existing_rating:
        raise HTTPException(status_code=400, detail="You have already rated this intelligence.")
        
    rating = Rating(user_id=user.id, insight_id=insight.id, score=score, is_dispute=is_dispute)
    db.add(rating)
    db.commit()
    
    # Update Creator Trust Score Persistence
    creator_user = db.query(User).filter(
        (User.username == insight.creator_address) | (User.wallet_address == insight.creator_address)
    ).first()
    
    if creator_user:
        creator_user.total_weighted_score += (score * weight)
        creator_user.total_weight_sum += weight
        creator_user.ratings_count += 1
        creator_user.trust_score = creator_user.total_weighted_score / creator_user.total_weight_sum
        db.commit()

    # Dispute Grace Period & Escrow Settlement Protocol (24-Hour Rule)
    if is_dispute and insight.unlock_time:
        settlement_window_end = insight.unlock_time + datetime.timedelta(hours=24)
        if datetime.datetime.now() <= settlement_window_end:
            # Check if 30% or more of unique buyers have flagged as fraudulent
            insight.disputes_count += 1
            if insight.buyers_count > 0 and (insight.disputes_count / insight.buyers_count) >= 0.3:
                insight.freeze_funds = True
                # Simulate notify admin
                print(f"[ADMIN ALERT] Funds Frozen for Insight {insight.id} due to high dispute rate.")
            db.commit()

    return {"message": "Rating recorded successfully", "new_trust_score": creator_user.trust_score if creator_user else None}
