from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from app.models.process_request import ProcessRequest
from app.models.detection_result import DetectionResult, Detection
from app.services.detector import YOLODetector
from app.services.video_processor import VideoProcessor
from app.services.srt_parser import parse_srt
from app.services.gps_matcher import interpolate_gps, detect_gps_offset
import uuid
import os
import json
import time
import asyncio
import cv2
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "app/uploads")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "app/outputs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# In-memory store for jobs
results_store = {}

# Load existing history from disk
def load_history():
    if os.path.exists(OUTPUT_DIR):
        for item in os.listdir(OUTPUT_DIR):
            job_path = os.path.join(OUTPUT_DIR, item)
            results_file = os.path.join(job_path, "results.json")
            if os.path.isdir(job_path) and os.path.exists(results_file):
                try:
                    with open(results_file, 'r') as f:
                        data = json.load(f)
                        # Reconstruct model from dict
                        results_store[item] = DetectionResult(**data)
                except Exception as e:
                    print(f"Failed to load history for {item}: {e}")

load_history()

def process_video_task(job_id: str, video_path: str, srt_path: str, model_name: str, confidence: float):
    """Background task to process video."""
    try:
        start_time = time.time()
        print(f"\n{'='*80}")
        print(f"🎬 Processing job {job_id}")
        print(f"   Model: {model_name}")
        print(f"   Confidence: {confidence}")
        print(f"{'='*80}\n")
        
        # Initialize detector
        detector = YOLODetector(model_name)
        
        # Parse SRT
        gps_data = parse_srt(srt_path)
        if not gps_data:
            raise ValueError("No GPS data found in SRT file")
        print(f"✅ GPS data parsed: {len(gps_data)} points, time range: {gps_data[0]['time']:.2f}s - {gps_data[-1]['time']:.2f}s")
        
        # Process video (All frames)
        video_processor = VideoProcessor(video_path, frame_skip=1)
        video_processor.frame_skip = 1
        print(f"✅ Video opened: {video_processor.total_frames} frames, {video_processor.fps} fps")
        
        # Auto-detect GPS offset (for handling video start vs GPS start mismatch)
        video_duration = video_processor.total_frames / video_processor.fps
        gps_offset = detect_gps_offset(video_duration, gps_data)
        if gps_offset > 0:
            print(f"⚠️  GPS offset detected: {gps_offset:.2f}s (adjusting timestamps)")
        
        detections = []
        frames_processed = 0
        total_frame_detections = 0
        
        output_dir = os.path.join(OUTPUT_DIR, job_id)
        os.makedirs(output_dir, exist_ok=True)
        
        # Setup video writer
        fps = video_processor.fps
        width = int(video_processor.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(video_processor.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        out_video_filename = f"{job_id}_annotated.webm"
        out_video_path = os.path.join(UPLOAD_DIR, out_video_filename)
        fourcc = cv2.VideoWriter_fourcc(*'vp80')
        out_video = cv2.VideoWriter(out_video_path, fourcc, fps, (width, height))
        
        detect_interval = max(1, int(fps / 5)) # Detect 5 times a second for smooth-ish video without being too slow
        gallery_interval = max(1, int(fps))    # Save to gallery/map 1 time a second
        
        last_results = []
        
        for frame_number, timestamp, frame in video_processor.get_frames():
            frames_processed += 1
            
            # 1. Run detection every detect_interval (e.g., every 6 frames for 30fps)
            if frame_number % detect_interval == 0:
                results, _ = detector.detect(frame, confidence=confidence)
                last_results = results
            
            # Draw the last known bounding boxes on the CURRENT frame for smooth video
            annotated = frame.copy()
            if last_results:
                for res in last_results:
                    x1, y1, x2, y2 = int(res['bbox']['x1']), int(res['bbox']['y1']), int(res['bbox']['x2']), int(res['bbox']['y2'])
                    cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 0, 255), 2)
                    cv2.putText(annotated, f"{res['class_name']} {res['confidence']:.2f}", (x1, max(10, y1 - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            
            # Write every frame to video so playback is 100% smooth
            out_video.write(annotated)
            
            # 2. Save detections to gallery/map ONLY 1 time per second
            if frame_number % gallery_interval == 0:
                total_frame_detections += len(last_results)
                
                if frames_processed <= 2 or len(last_results) > 0:
                    print(f"Frame {frame_number} (t={timestamp:.2f}s): {len(last_results)} detections added to gallery", end="")
                
                saved_count = 0
                for result in last_results:
                    gps = interpolate_gps(timestamp, gps_data, gps_offset)
                    if gps:
                        # Save annotated snapshot
                        snapshot_filename = video_processor.save_frame(annotated, output_dir)
                        
                        detection = Detection(
                            frame=frame_number,
                            timestamp=timestamp,
                            class_name=result['class_name'],
                            confidence=result['confidence'],
                            lat=gps['lat'],
                            lon=gps['lon'],
                            snapshot=f"/outputs/{job_id}/{snapshot_filename}",
                            bbox=result['bbox']
                        )
                        detections.append(detection)
                        saved_count += 1
                
                if frames_processed <= 2 or len(last_results) > 0:
                    print(f" → saved {saved_count}")
            
            # Periodically update progress in results_store
            if frames_processed % 10 == 0:
                progress_pct = int((frame_number / video_processor.total_frames) * 100)
                results_store[job_id] = DetectionResult(
                    job_id=job_id,
                    status="processing",
                    progress=progress_pct,
                    total_detections=len(detections),
                    detections=list(detections),
                    original_video_url=f"/uploads/{job_id}_video.mp4"
                )
            
        out_video.release()
        video_processor.close()
        
        # Calculate stats
        processing_time = time.time() - start_time
        avg_confidence = sum(d.confidence for d in detections) / len(detections) if detections else 0
        
        print(f"\n{'='*80}")
        print(f"📊 PROCESSING SUMMARY")
        print(f"   Frames processed: {frames_processed}")
        print(f"   Total detections (model): {total_frame_detections}")
        print(f"   Detections saved (with GPS): {len(detections)}")
        print(f"   Processing time: {processing_time:.2f}s")
        print(f"   Avg confidence: {avg_confidence:.3f}")
        print(f"{'='*80}\n")
        
        # Store results
        result = DetectionResult(
            job_id=job_id,
            status="completed",
            detections=detections,
            total_detections=len(detections),
            processing_time=processing_time,
            avg_confidence=avg_confidence,
            annotated_video_url=f"/uploads/{out_video_filename}",
            original_video_url=f"/uploads/{job_id}_video.mp4"
        )
        results_store[job_id] = result
        
        # Save results to file
        results_file = os.path.join(output_dir, "results.json")
        with open(results_file, 'w') as f:
            json.dump(result.dict(), f, default=str)
            
        # Bulk insert to Supabase
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")
        if SUPABASE_URL and SUPABASE_KEY and len(detections) > 0:
            try:
                from supabase import create_client
                import datetime
                sb = create_client(SUPABASE_URL, SUPABASE_KEY)
                records = []
                for d in detections:
                    detected_at = datetime.datetime.fromtimestamp(d.timestamp, tz=datetime.timezone.utc)
                    records.append({
                        "lat": d.lat,
                        "lng": d.lon,
                        "confidence": d.confidence,
                        "image_url": d.snapshot,
                        "detected_at": detected_at.isoformat()
                    })
                # Supabase supports bulk insert
                sb.table("detections").insert(records).execute()
                print(f"✅ Saved {len(records)} records to Supabase")
            except Exception as e:
                print(f"⚠️ Failed to save to Supabase: {str(e)}")
        
    except Exception as e:
        import traceback
        print(f"\n❌ ERROR in job {job_id}: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}\n")
        result = DetectionResult(
            job_id=job_id,
            status="failed",
            error=str(e)
        )
        results_store[job_id] = result

@router.post("/api/process", response_model=DetectionResult)
async def process_video(
    video: UploadFile = File(...),
    srt: UploadFile = File(...),
    model_name: str = Form(...),
    confidence: float = Form(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    # Validate inputs
    if not video.filename.endswith('.mp4'):
        raise HTTPException(status_code=400, detail="Video must be MP4 format")
    if not srt.filename.endswith('.srt'):
        raise HTTPException(status_code=400, detail="SRT file required")
    
    if confidence < 0.1 or confidence > 1.0:
        raise HTTPException(status_code=400, detail="Confidence must be between 0.1 and 1.0")

    job_id = str(uuid.uuid4())

    # Save files
    video_path = os.path.join(UPLOAD_DIR, f"{job_id}_video.mp4")
    srt_path = os.path.join(UPLOAD_DIR, f"{job_id}_gps.srt")

    with open(video_path, "wb") as f:
        f.write(await video.read())
    with open(srt_path, "wb") as f:
        f.write(await srt.read())

    # Add background task
    background_tasks.add_task(process_video_task, job_id, video_path, srt_path, model_name, confidence)

    # Return pending response
    result = DetectionResult(
        job_id=job_id,
        status="pending",
        annotated_video_url=f"/uploads/{job_id}_video.mp4"
    )
    results_store[job_id] = result

    return result

@router.get("/api/results/{job_id}", response_model=DetectionResult)
async def get_results(job_id: str):
    if job_id not in results_store:
        raise HTTPException(status_code=404, detail="Job not found")
    return results_store[job_id]

@router.get("/api/results")
async def list_results():
    # Return all jobs sorted by newest first
    # (Since dict is ordered by insertion in Python 3.7+, we can reverse it)
    return {"jobs": list(results_store.values())[::-1]}

@router.delete("/api/results/{job_id}")
async def delete_result(job_id: str):
    if job_id not in results_store:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # 1. Delete from memory
    del results_store[job_id]
    
    # 2. Delete files from disk
    import shutil
    job_output_dir = os.path.join(OUTPUT_DIR, job_id)
    if os.path.exists(job_output_dir):
        try:
            shutil.rmtree(job_output_dir)
        except Exception as e:
            print(f"Error removing output dir {job_output_dir}: {e}")
            
    # Delete uploaded files
    for ext in ["_video.mp4", "_gps.srt", "_annotated.webm"]:
        file_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error removing uploaded file {file_path}: {e}")
                
    # 3. Delete from Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            from supabase import create_client
            sb = create_client(SUPABASE_URL, SUPABASE_KEY)
            # Delete detections containing this job_id in their image_url path
            sb.table("detections").delete().like("image_url", f"%/outputs/{job_id}/%").execute()
            print(f"Deleted Supabase detections for job {job_id}")
        except Exception as e:
            print(f"Failed to delete detections from Supabase: {e}")
            
    return {"status": "success"}