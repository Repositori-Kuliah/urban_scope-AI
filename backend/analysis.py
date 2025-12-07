import math
from textblob import TextBlob
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, f1_score

# --- 1. Analisis Sentimen (Simple NLP) ---
def analyze_sentiment(text):
    """
    Menggunakan TextBlob untuk analisis sentimen sederhana.
    Dalam produksi nyata, ganti ini dengan BERT/Transformer.
    """
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity
    
    if polarity > 0.1:
        label = "Positive"
    elif polarity < -0.1:
        label = "Negative"
    else:
        label = "Neutral"
        
    # Ekstraksi Topik Sederhana (Keyword Based)
    text_lower = text.lower()
    topic = "General"
    if "macet" in text_lower or "jalan" in text_lower or "traffic" in text_lower:
        topic = "Infrastructure"
    elif "sakit" in text_lower or "dokter" in text_lower or "health" in text_lower:
        topic = "Health"
    elif "sekolah" in text_lower or "guru" in text_lower:
        topic = "Education"
        
    return polarity, label, topic

# --- 2. Analisis Spasial (Haversine Distance) ---
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Radius bumi dalam km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

# --- 3. Model Rekomendasi ---
def generate_recommendations(region, facilities, reviews):
    """
    Logika Multi-Kriteria:
    1. Rasio Fasilitas per Penduduk (Bobot 30%)
    2. Sentimen Negatif Rata-rata (Bobot 40%)
    3. Jarak Rata-rata ke Fasilitas (Bobot 30%)
    """
    # Hitung Rasio
    facility_count = len(facilities)
    ratio_score = 1.0 - (facility_count / (region.population / 1000)) # Normalized inverse
    ratio_score = max(0, min(1, ratio_score)) # Clamp 0-1

    # Hitung Sentimen
    if not reviews:
        sentiment_factor = 0.5
    else:
        avg_polarity = np.mean([r.sentiment_score for r in reviews])
        # Konversi polarity (-1 s/d 1) ke risk score (1 = sangat negatif, 0 = sangat positif)
        sentiment_factor = (1 - avg_polarity) / 2 

    # Hitung Jarak (Mock logic: jika fasilitas jauh, skor kebutuhan naik)
    if not facilities:
        dist_score = 1.0
    else:
        # Asumsi: Kita ambil jarak fasilitas terdekat dari pusat kecamatan
        dists = [calculate_distance(region.latitude, region.longitude, f.latitude, f.longitude) for f in facilities]
        min_dist = min(dists)
        dist_score = min(1.0, min_dist / 5.0) # Cap di 5km

    # Final Score (Weighted Average)
    final_score = (0.3 * ratio_score) + (0.4 * sentiment_factor) + (0.3 * dist_score)
    
    priority = "Low"
    action = "Monitor"
    if final_score >= 0.65:
        priority = "High"
        action = "Urgent Construction Needed"
    elif final_score >= 0.45:
        priority = "Medium"
        action = "Improve Existing Facilities"

    return final_score, priority, action

# --- 4. Evaluasi Model (Metrics) ---
def evaluate_model_performance(y_true_sentiment, y_pred_sentiment, y_true_trend, y_pred_trend):
    """
    Contoh fungsi evaluasi untuk laporan teknis.
    """
    f1 = f1_score(y_true_sentiment, y_pred_sentiment, average='weighted')
    mae = mean_absolute_error(y_true_trend, y_pred_trend)
    return {"sentiment_f1": f1, "trend_mae": mae}