from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes.process import router as process_router
from pydantic import BaseModel
from supabase import create_client
import os
import base64
import uuid
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Drone Waste Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process_router)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "app/uploads")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "app/outputs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs("app/outputs", exist_ok=True)
os.makedirs("app/uploads", exist_ok=True)

app.mount("/outputs", StaticFiles(directory="app/outputs"), name="outputs")
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

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
    image_bytes = base64.b64decode(data.image_base64)
    file_name = f"{uuid.uuid4()}.jpg"

    supabase.storage.from_(BUCKET_NAME).upload(
        file_name,
        image_bytes,
        {"content-type": "image/jpeg"}
    )

    image_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{file_name}"

    supabase.table("detections").insert({
        "lat": data.lat,
        "lng": data.lng,
        "confidence": data.confidence,
        "image_url": image_url,
        "detected_at": data.timestamp
    }).execute()

    return {"status": "success"}

@app.get("/api/detections")
def get_all_detections():
    response = supabase.table("detections").select("*").execute()
    return {"data": response.data}

@app.delete("/api/detections")
def clear_detections():
    # Supabase delete requires a filter
    supabase.table("detections").delete().neq("id", -1).execute()
    return {"status": "success"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "AI Drone Waste Detection API is running"}
