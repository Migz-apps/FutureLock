from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from ..models.database import User, SessionLocal
from ..core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from pydantic import BaseModel, field_validator
import datetime

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SignupData(BaseModel):
    username: str
    email: str
    password: str
    role: str

    @field_validator('username')
    @classmethod
    def lowercase_username(cls, v: str) -> str:
        return v.lower()

class LoginData(BaseModel):
    email: str
    password: str

class WalletLoginData(BaseModel):
    username: str = None
    wallet_address: str
    role: str

    @field_validator('username')
    @classmethod
    def lowercase_username(cls, v: str) -> str:
        return v.lower() if v else v

@router.post("/signup")
@router.post("/register")
def signup(data: SignupData, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already claimed")
        
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(data.password)
    new_user = User(username=data.username, email=data.email, hashed_password=hashed_password, role=data.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(subject=new_user.email)
    refresh_token = create_refresh_token(subject=new_user.email)
    
    # Set tokens as HttpOnly cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=15*60, samesite='lax')
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=7*24*60*60, samesite='lax')
    
    return {"message": "Signup successful", "role": new_user.role, "identityType": "email", "identity": data.email}

@router.post("/login")
def login(data: LoginData, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=15*60, samesite='lax')
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=7*24*60*60, samesite='lax')
    
    return {"message": "Login successful", "role": user.role, "identityType": "email", "identity": data.email}

@router.post("/wallet-login")
def wallet_login(data: WalletLoginData, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.wallet_address == data.wallet_address).first()
    if not user:
        if not data.username:
            raise HTTPException(status_code=400, detail="Username required for new wallet registration")
            
        if db.query(User).filter(User.username == data.username).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already claimed")
            
        # Register user on first wallet login automatically
        user = User(username=data.username, wallet_address=data.wallet_address, role=data.role)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Normally, Nonce generation and signature verification go here
    # For now, we simulate verified access
    access_token = create_access_token(subject=user.wallet_address)
    refresh_token = create_refresh_token(subject=user.wallet_address)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=15*60, samesite='lax')
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=7*24*60*60, samesite='lax')
    
    return {"message": "Wallet login successful", "role": user.role, "identityType": "wallet", "identity": data.wallet_address}

@router.post("/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    payload = decode_token(refresh_token)
    if not payload or not payload.get("refresh"):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    subject = payload.get("sub")
    
    # Try email first, then wallet
    user = db.query(User).filter((User.email == subject) | (User.wallet_address == subject)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    identifier = user.email if user.email else user.wallet_address
    access_token = create_access_token(subject=identifier)
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=15*60, samesite='lax')
    
    return {"message": "Token refreshed"}

@router.get("/me")
def get_current_user(request: Request, db: Session = Depends(get_db)):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(access_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid access token")
        
    subject = payload.get("sub")
    
    user = db.query(User).filter((User.email == subject) | (User.wallet_address == subject)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    identity_type = "email" if user.email else "wallet"
    identity = user.email or user.wallet_address
    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "identityType": identity_type,
        "identity": identity,
        "trust_score": user.trust_score,
        "ratings_count": user.ratings_count
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

