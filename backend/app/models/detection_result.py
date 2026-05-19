from pydantic import BaseModel
from typing import List, Optional

class Detection(BaseModel):
    frame: int
    timestamp: float
    class_name: str
    confidence: float
    lat: float
    lon: float
    snapshot: str

class DetectionResult(BaseModel):
    job_id: str
    status: str  # pending, processing, completed, failed
    detections: Optional[List[Detection]] = None
    total_detections: Optional[int] = None
    progress: Optional[int] = None
    processing_time: Optional[float] = None
    avg_confidence: Optional[float] = None
    error: Optional[str] = None
    video_url: Optional[str] = None  # URL to access the video