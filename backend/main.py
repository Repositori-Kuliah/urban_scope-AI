from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime, timedelta
import models
import database
import analysis
import hashlib
import secrets
import re
import os
import html
from collections import defaultdict
import time
from google import genai
from google.genai import types

models.Base.metadata.create_all(bind=database.engine)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
gemini_client = None
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)

rate_limit_store = defaultdict(list)
RATE_LIMIT_REQUESTS = 100
RATE_LIMIT_WINDOW = 60

def double_hash(data: str) -> str:
    first_hash = hashlib.sha256(data.encode()).hexdigest()
    salt = secrets.token_hex(8)
    second_hash = hashlib.sha256((first_hash + salt).encode()).hexdigest()
    return f"{salt}${second_hash}"

def sanitize_input(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r'[<>"\']', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:2000]

def validate_text_input(text: str) -> bool:
    if not text or len(text.strip()) < 3:
        return False
    if len(text) > 2000:
        return False
    dangerous_patterns = [
        r'<script', r'javascript:', r'onclick', r'onerror',
        r'DROP\s+TABLE', r'DELETE\s+FROM', r'INSERT\s+INTO',
        r'UNION\s+SELECT', r'--', r';--'
    ]
    for pattern in dangerous_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return False
    return True

app = FastAPI(
    title="UrbanScope AI API",
    description="Smart Urban Analysis System - AI-powered regional development analysis",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    rate_limit_store[client_ip] = [
        t for t in rate_limit_store[client_ip]
        if current_time - t < RATE_LIMIT_WINDOW
    ]
    
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT_REQUESTS:
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Please try again later."}
        )
    
    rate_limit_store[client_ip].append(current_time)
    response = await call_next(request)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"]
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ReviewInput(BaseModel):
    region_id: int = Field(..., ge=1, le=1000)
    text: str = Field(..., min_length=3, max_length=2000)
    
    @validator('text')
    def validate_review_text(cls, v):
        if not validate_text_input(v):
            raise ValueError('Invalid or potentially dangerous input detected')
        return sanitize_input(v)

class ChatInput(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    context: Optional[str] = None
    
    @validator('message')
    def validate_message(cls, v):
        if not validate_text_input(v):
            raise ValueError('Invalid input detected')
        return sanitize_input(v)

class FacilitySearchInput(BaseModel):
    query: str = Field(..., min_length=1, max_length=200)
    sort_by: Optional[str] = "name"
    limit: Optional[int] = Field(default=20, ge=1, le=100)

class RegionOut(BaseModel):
    id: int
    name: str
    population: int
    latitude: float
    longitude: float
    
    class Config:
        from_attributes = True

class FacilityOut(BaseModel):
    id: int
    name: str
    type: str
    region_name: str
    bed_count: int
    chair_count: int
    available_technology: List[str]
    bps_complaints: int
    user_complaints: int
    rating: float
    latitude: float
    longitude: float

class RecommendationOut(BaseModel):
    region_name: str
    score: float
    priority: str
    action: str

@app.get("/", tags=["Health"])
def read_root():
    return {
        "status": "UrbanScope AI System Online",
        "version": "2.0.0",
        "security": "enabled",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/regions", response_model=List[RegionOut], tags=["Regions"])
def get_regions(db: Session = Depends(get_db)):
    regions = db.query(models.Region).all()
    return regions

@app.get("/api/facilities/search", tags=["Facilities"])
def search_facilities(
    q: str = "",
    sort_by: str = "name",
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = sanitize_input(q).lower()
    
    facilities = db.query(models.Facility).all()
    regions = {r.id: r.name for r in db.query(models.Region).all()}
    
    facility_names = [
        "City Park", "District Police Station", "Fire & Rescue Station",
        "Senior High School", "Traditional Market", "Community Health Center",
        "Public Library", "Sports Complex", "Government Office", "Bus Terminal"
    ]
    
    results = []
    for fac in facilities:
        region_name = regions.get(fac.region_id, "Unknown")
        fac_name = f"{region_name} {fac.type}"
        
        if not query or query in fac_name.lower() or query in region_name.lower():
            import random
            random.seed(fac.id)
            
            tech_options = ["Public WiFi", "Solar Lighting", "CCTV", "Smart Parking", "Digital Display", "Air Quality Monitor"]
            selected_tech = random.sample(tech_options, random.randint(1, 4))
            
            results.append({
                "id": fac.id,
                "name": fac_name,
                "type": fac.type,
                "region_id": fac.region_id,
                "region_name": region_name,
                "bed_count": random.randint(0, 100) if fac.type in ["Hospital", "Health Center"] else 0,
                "chair_count": random.randint(20, 200),
                "available_technology": selected_tech,
                "bps_complaints": random.randint(0, 15),
                "user_complaints": random.randint(0, 25),
                "rating": round(random.uniform(3.5, 5.0), 1),
                "latitude": fac.latitude,
                "longitude": fac.longitude
            })
    
    if sort_by == "name":
        results.sort(key=lambda x: x["name"])
    elif sort_by == "rating":
        results.sort(key=lambda x: x["rating"], reverse=True)
    elif sort_by == "complaints":
        results.sort(key=lambda x: x["bps_complaints"] + x["user_complaints"])
    
    return results[:limit]

@app.get("/api/facilities/{facility_id}", tags=["Facilities"])
def get_facility_detail(facility_id: int, db: Session = Depends(get_db)):
    facility = db.query(models.Facility).filter(models.Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    region = db.query(models.Region).filter(models.Region.id == facility.region_id).first()
    region_name = region.name if region else "Unknown"
    
    reviews = db.query(models.CitizenReview).filter(
        models.CitizenReview.region_id == facility.region_id
    ).order_by(models.CitizenReview.created_at.desc()).limit(10).all()
    
    import random
    random.seed(facility_id)
    
    tech_options = ["Public WiFi", "Solar Lighting", "CCTV", "Smart Parking", "Digital Display", "Air Quality Monitor"]
    selected_tech = random.sample(tech_options, random.randint(2, 5))
    
    return {
        "id": facility.id,
        "name": f"{region_name} {facility.type}",
        "type": facility.type,
        "region_name": region_name,
        "description": f"This is a {facility.type.lower()} facility located in {region_name}. It serves the local community with essential services and modern amenities.",
        "bed_count": random.randint(20, 100) if facility.type in ["Hospital", "Health Center"] else 0,
        "chair_count": random.randint(50, 300),
        "available_technology": selected_tech,
        "bps_complaints": random.randint(0, 15),
        "user_complaints": len([r for r in reviews if r.sentiment_label == "Negative"]),
        "rating": round(random.uniform(4.0, 5.0), 1),
        "latitude": facility.latitude,
        "longitude": facility.longitude,
        "recent_reviews": [
            {
                "text": r.text,
                "sentiment": r.sentiment_label,
                "topic": r.issue_topic,
                "date": r.created_at.isoformat() if r.created_at else None
            } for r in reviews[:5]
        ]
    }

@app.post("/api/reviews/", tags=["Data Input"])
def submit_review(review: ReviewInput, db: Session = Depends(get_db)):
    region = db.query(models.Region).filter(models.Region.id == review.region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    sanitized_text = sanitize_input(review.text)
    polarity, label, topic = analysis.analyze_sentiment(sanitized_text)
    
    db_review = models.CitizenReview(
        region_id=review.region_id,
        text=sanitized_text,
        sentiment_score=polarity,
        sentiment_label=label,
        issue_topic=topic
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    return {
        "status": "Review processed successfully",
        "sentiment": label,
        "topic": topic,
        "id": double_hash(str(db_review.id))[:16]
    }

@app.post("/api/chat", tags=["AI Chat"])
async def chat_with_ai(chat_input: ChatInput, db: Session = Depends(get_db)):
    if not gemini_client:
        raise HTTPException(
            status_code=503,
            detail="AI chat service is not available. Please configure GOOGLE_API_KEY."
        )
    
    stats = db.query(models.Region).all()
    facilities_count = db.query(models.Facility).count()
    reviews_count = db.query(models.CitizenReview).count()
    
    system_context = f"""You are UrbanScope AI, an intelligent assistant for urban development analysis.
You help users understand regional development needs, facility information, and citizen feedback.

Current System Statistics:
- Total Regions: {len(stats)}
- Total Facilities: {facilities_count}
- Total Citizen Reviews: {reviews_count}

Regions available: {', '.join([r.name for r in stats])}

Provide helpful, accurate, and concise responses about urban development, facilities, and community needs.
Always be professional and supportive. If asked about specific data, provide relevant insights."""

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Content(role="user", parts=[types.Part(text=chat_input.message)])
            ],
            config=types.GenerateContentConfig(
                system_instruction=system_context,
                max_output_tokens=500,
                temperature=0.7,
            ),
        )
        
        ai_response = response.text if response.text else "I apologize, I could not generate a response. Please try again."
        
        return {
            "response": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}"
        )

@app.get("/api/dashboard/stats", tags=["Dashboard"])
def get_dashboard_stats(db: Session = Depends(get_db)):
    regions = db.query(models.Region).all()
    results = []
    
    for reg in regions:
        facilities = db.query(models.Facility).filter(models.Facility.region_id == reg.id).all()
        reviews = db.query(models.CitizenReview).filter(models.CitizenReview.region_id == reg.id).all()
        
        score, priority, action = analysis.generate_recommendations(reg, facilities, reviews)
        
        results.append({
            "id": reg.id,
            "region": reg.name,
            "coords": [reg.latitude, reg.longitude],
            "score": round(score, 2),
            "priority": priority,
            "action": action,
            "review_count": len(reviews),
            "facility_count": len(facilities)
        })
    return results

@app.get("/api/recommendations", response_model=List[RecommendationOut], tags=["Analysis"])
def get_recommendations(db: Session = Depends(get_db)):
    stats = get_dashboard_stats(db)
    output = []
    for s in stats:
        output.append(RecommendationOut(
            region_name=s['region'],
            score=s['score'],
            priority=s['priority'],
            action=s['action']
        ))
    return sorted(output, key=lambda x: x.score, reverse=True)

@app.get("/api/stats/summary", tags=["Analysis"])
def get_summary_stats(db: Session = Depends(get_db)):
    regions = db.query(models.Region).all()
    reviews = db.query(models.CitizenReview).all()
    facilities = db.query(models.Facility).all()
    
    sentiment_distribution = {
        "positive": sum(1 for r in reviews if r.sentiment_label == "Positive"),
        "negative": sum(1 for r in reviews if r.sentiment_label == "Negative"),
        "neutral": sum(1 for r in reviews if r.sentiment_label == "Neutral")
    }
    
    topic_distribution = {}
    for r in reviews:
        topic = r.issue_topic or "General"
        topic_distribution[topic] = topic_distribution.get(topic, 0) + 1
    
    return {
        "total_regions": len(regions),
        "total_reviews": len(reviews),
        "total_facilities": len(facilities),
        "sentiment_distribution": sentiment_distribution,
        "topic_distribution": topic_distribution
    }
