from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from database import Base
from datetime import datetime

class Region(Base):
    __tablename__ = "regions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) # Nama Kecamatan/Kelurahan
    population = Column(Integer)
    latitude = Column(Float)
    longitude = Column(Float)

class Facility(Base):
    __tablename__ = "facilities"
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"))
    type = Column(String) # e.g., 'hospital', 'school', 'park'
    latitude = Column(Float)
    longitude = Column(Float)

class CitizenReview(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"))
    text = Column(Text)
    sentiment_score = Column(Float) # -1.0 to 1.0
    sentiment_label = Column(String) # Positive, Negative, Neutral
    issue_topic = Column(String) # e.g., 'traffic', 'health'
    created_at = Column(DateTime, default=datetime.utcnow)

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"))
    score = Column(Float)
    priority_level = Column(String) # High, Medium, Low
    action_item = Column(String)
    last_updated = Column(DateTime, default=datetime.utcnow)