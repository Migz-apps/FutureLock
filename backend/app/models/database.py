from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Create data directory if it doesn't exist
if not os.path.exists("./data"):
    os.makedirs("./data")

DATABASE_URL = "sqlite:///./data/futurelock.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class InsightMetadata(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    cid = Column(String, unique=True)
    unlock_time = Column(DateTime)
    creator_address = Column(String)
    price = Column(String, default="0.01") # Added price field
    is_encrypted = Column(Boolean, default=True)
    category = Column(String, default="All") # Hybrid Market Filter
    
    # Escrow & Dispute Logic
    freeze_funds = Column(Boolean, default=False)
    disputes_count = Column(Integer, default=0)
    buyers_count = Column(Integer, default=0)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True) # Normalized username
    email = Column(String, unique=True, index=True, nullable=True) # Web2 Identity
    hashed_password = Column(String, nullable=True)
    wallet_address = Column(String, unique=True, index=True, nullable=True) # Web3 Identity
    role = Column(String) # "Creator" or "Buyer"
    
    # Reputation
    trust_score = Column(Float, default=0.0)
    total_weighted_score = Column(Float, default=0.0)
    total_weight_sum = Column(Float, default=0.0)
    ratings_count = Column(Integer, default=0)

class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer) # For simplicity
    insight_id = Column(Integer)
    purchased_at = Column(DateTime)

class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    insight_id = Column(Integer)
    score = Column(Integer)
    is_dispute = Column(Boolean, default=False)

def init_db():
    Base.metadata.create_all(bind=engine)
