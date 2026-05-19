from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes.process import router as process_router
import os

app = FastAPI(title="AI Drone Waste Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process_router)

# Mount static files for outputs and uploads
os.makedirs("app/outputs", exist_ok=True)
os.makedirs("app/uploads", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="app/outputs"), name="outputs")
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "AI Drone Waste Detection API is running"}