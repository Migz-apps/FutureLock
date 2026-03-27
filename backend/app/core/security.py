import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

def generate_new_key():
    """Generates a unique AES key for each insight."""
    return Fernet.generate_key().decode()

def encrypt_content(content: str, key: str):
    """Encrypts the secret intelligence string."""
    f = Fernet(key.encode())
    encrypted_data = f.encrypt(content.encode())
    return encrypted_data.decode()

def decrypt_content(encrypted_content: str, key: str):
    """Decrypts the insight for the buyer."""
    f = Fernet(key.encode())
    return f.decrypt(encrypted_content.encode()).decode()

from datetime import datetime, timedelta
from typing import Any, Union
from passlib.context import CryptContext
import jwt

PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "SUPER_SECRET_FUTURELOCK_KEY" # In production, read from env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return PWD_CONTEXT.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return PWD_CONTEXT.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "refresh": True}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None