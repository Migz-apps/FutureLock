from sqlalchemy import Column, Integer, String, Boolean, DateTime, create_engine
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

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # "Creator" or "Buyer"

def init_db():
    Base.metadata.create_all(bind=engine)