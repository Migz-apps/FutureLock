from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from ..models.database import User, SessionLocal
from ..core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from pydantic import BaseModel
import datetime

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SignupData(BaseModel):
    email: str
    password: str
    role: str

class LoginData(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(data: SignupData, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(data.password)
    new_user = User(email=data.email, hashed_password=hashed_password, role=data.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(subject=new_user.email)
    refresh_token = create_refresh_token(subject=new_user.email)
    
    # Set tokens as HttpOnly cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=15*60, samesite='lax')
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=7*24*60*60, samesite='lax')
    
    return {"message": "Signup successful", "role": new_user.role}

@router.post("/login")
def login(data: LoginData, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=15*60, samesite='lax')
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=7*24*60*60, samesite='lax')
    
    return {"message": "Login successful", "role": user.role}

@router.post("/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    payload = decode_token(refresh_token)
    if not payload or not payload.get("refresh"):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    user_email = payload.get("sub")
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    access_token = create_access_token(subject=user.email)
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
        
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    return {"email": user.email, "role": user.role}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}
