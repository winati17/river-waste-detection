from fastapi import FastAPI
from pydantic import BaseModel
from supabase import create_client
import os
import base64
import uuid
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET")

if not SUPABASE_URL:
    raise Exception("SUPABASE_URL not loaded")

if not SUPABASE_KEY:
    raise Exception("SUPABASE_SERVICE_KEY not loaded")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class Detection(BaseModel):
    lat: float
    lng: float
    confidence: float
    timestamp: str
    image_base64: str

@app.post("/api/detection")
def receive_detection(data: Detection):

    # Convert base64 → file
    image_bytes = base64.b64decode(data.image_base64)
    file_name = f"{uuid.uuid4()}.jpg"

    # Upload ke Supabase Storage
    supabase.storage.from_(BUCKET_NAME).upload(
        file_name,
        image_bytes,
        {"content-type": "image/jpeg"}
    )

    image_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{file_name}"

    # Insert ke database
    supabase.table("detections").insert({
        "lat": data.lat,
        "lng": data.lng,
        "confidence": data.confidence,
        "image_url": image_url,
        "detected_at": data.timestamp
    }).execute()

    return {"status": "success"}