from sqlalchemy import create_url, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import datetime

DATABASE_URL = "sqlite:///./futurelock.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class InsightMetadata(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    cid = Column(String, unique=True)  # IPFS Hash
    unlock_time = Column(DateTime)
    creator_address = Column(String)
    is_encrypted = Column(Boolean, default=True)

# Create the database tables
def init_db():
    Base.metadata.create_all(bind=engine)