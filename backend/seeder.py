import models
from database import SessionLocal, engine
import random

models.Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    existing = db.query(models.Region).first()
    if existing:
        print("Database already seeded!")
        db.close()
        return
    
    regions_data = [
        {"name": "Kebayoran Tech", "pop": 15000, "lat": -6.22, "lon": 106.80},
        {"name": "Cilandak Green", "pop": 8000, "lat": -6.29, "lon": 106.81},
        {"name": "Tebet Crowded", "pop": 25000, "lat": -6.24, "lon": 106.85},
        {"name": "Menteng Heritage", "pop": 12000, "lat": -6.19, "lon": 106.84},
        {"name": "Kemang Urban", "pop": 18000, "lat": -6.26, "lon": 106.82},
    ]
    
    region_objs = []
    for r in regions_data:
        reg = models.Region(name=r['name'], population=r['pop'], latitude=r['lat'], longitude=r['lon'])
        db.add(reg)
        region_objs.append(reg)
    db.commit()
    
    for reg in region_objs: 
        db.refresh(reg)

    reviews_text = [
        ("Susah sekali cari rumah sakit disini, macet parah setiap hari.", -0.6),
        ("Taman kotanya bagus dan terawat, udara segar.", 0.7),
        ("Jalanan berlubang membahayakan pengendara motor.", -0.8),
        ("Sekolah cukup dekat, tapi fasilitas perpustakaan kurang.", -0.2),
        ("Sangat nyaman tinggal disini, lingkungan aman.", 0.8),
        ("Lampu jalan sering mati, gelap di malam hari.", -0.5),
        ("Pelayanan puskesmas sangat lambat dan antrian panjang.", -0.7),
        ("Ada tempat olahraga gratis untuk warga.", 0.6),
        ("Trotoar rusak dan tidak ramah pejalan kaki.", -0.4),
        ("Sampah sering menumpuk di pinggir jalan.", -0.6),
    ]

    facility_types = ['Hospital', 'School', 'Park', 'Police Station', 'Fire Station', 'Market']

    for reg in region_objs:
        for _ in range(random.randint(2, 6)):
            fac = models.Facility(
                region_id=reg.id, 
                type=random.choice(facility_types),
                latitude=reg.latitude + random.uniform(-0.02, 0.02),
                longitude=reg.longitude + random.uniform(-0.02, 0.02)
            )
            db.add(fac)
        
        for _ in range(random.randint(8, 25)):
            text, sentiment = random.choice(reviews_text)
            variation = random.uniform(-0.1, 0.1)
            final_sentiment = max(-1, min(1, sentiment + variation))
            
            if final_sentiment > 0.1:
                label = "Positive"
            elif final_sentiment < -0.1:
                label = "Negative"
            else:
                label = "Neutral"
            
            topic = "General"
            text_lower = text.lower()
            if "jalan" in text_lower or "macet" in text_lower or "trotoar" in text_lower:
                topic = "Infrastructure"
            elif "sakit" in text_lower or "puskesmas" in text_lower or "dokter" in text_lower:
                topic = "Health"
            elif "sekolah" in text_lower or "perpustakaan" in text_lower:
                topic = "Education"
            elif "sampah" in text_lower or "taman" in text_lower:
                topic = "Environment"
            elif "lampu" in text_lower or "gelap" in text_lower:
                topic = "Safety"
                
            review = models.CitizenReview(
                region_id=reg.id,
                text=text,
                sentiment_score=final_sentiment,
                sentiment_label=label,
                issue_topic=topic
            )
            db.add(review)

    db.commit()
    db.close()
    print("Database seeded successfully with 5 regions!")

if __name__ == "__main__":
    seed()
