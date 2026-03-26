from sqlalchemy import Column, Integer, String, Boolean, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

# We removed 'create_url' because it's not needed for a standard SQLite setup
DATABASE_URL = "sqlite:///./futurelock.db"

# connect_args={"check_same_thread": False} is required for SQLite + FastAPI
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
    is_encrypted = Column(Boolean, default=True)

def init_db():
    Base.metadata.create_all(bind=engine)