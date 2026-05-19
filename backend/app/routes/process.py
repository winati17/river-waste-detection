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

# In-memory storage for demo; use database in production
results_store = {}

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
        
        # Process video (1 frame per second)
        video_processor = VideoProcessor(video_path, frame_skip=1)
        video_processor.frame_skip = max(1, int(video_processor.fps))
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
        out_video_filename = f"{job_id}_annotated.mp4"
        out_video_path = os.path.join(UPLOAD_DIR, out_video_filename)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out_video = cv2.VideoWriter(out_video_path, fourcc, fps, (width, height))
        
        # Use full framerate for smooth video, but only run detection at frame_skip
        video_processor.frame_skip = 1 
        detect_interval = max(1, int(fps))
        last_annotated_frame = None
        
        for frame_number, timestamp, frame in video_processor.get_frames():
            frames_processed += 1
            
            # Run detection every 1 second
            if frame_number % detect_interval == 0:
                results, annotated = detector.detect(frame, confidence=confidence)
                total_frame_detections += len(results)
                last_annotated_frame = annotated
                
                if frames_processed <= 2 or len(results) > 0:
                    print(f"Frame {frame_number} (t={timestamp:.2f}s): {len(results)} detections", end="")
                
                # Save detections with GPS data
                saved_count = 0
                for result in results:
                    gps = interpolate_gps(timestamp, gps_data, gps_offset)
                    if gps:
                        # Save annotated snapshot instead of raw frame
                        snapshot_filename = video_processor.save_frame(annotated, output_dir)
                        
                        detection = Detection(
                            frame=frame_number,
                            timestamp=timestamp,
                            class_name=result['class_name'],
                            confidence=result['confidence'],
                            lat=gps['lat'],
                            lon=gps['lon'],
                            snapshot=f"/outputs/{job_id}/{snapshot_filename}"
                        )
                        detections.append(detection)
                        saved_count += 1
                
                if frames_processed <= 2 or len(results) > 0:
                    print(f" → saved {saved_count}")
            
            # Write the frame (annotated if available, else original or keep annotated to show box for 1 second)
            # Keeping the box visible for 1 second is better to see what was detected!
            out_video.write(last_annotated_frame if last_annotated_frame is not None else frame)
            
            # Periodically update progress in results_store
            if frames_processed % 10 == 0:
                progress_pct = int((frame_number / video_processor.total_frames) * 100)
                results_store[job_id] = DetectionResult(
                    job_id=job_id,
                    status="processing",
                    progress=progress_pct,
                    total_detections=len(detections),
                    video_url=f"/uploads/{job_id}_video.mp4"
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
            video_url=f"/uploads/{out_video_filename}"
        )
        results_store[job_id] = result
        
        # Save results to file
        results_file = os.path.join(output_dir, "results.json")
        with open(results_file, 'w') as f:
            json.dump(result.dict(), f, default=str)
        
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
        video_url=f"/uploads/{job_id}_video.mp4"
    )
    results_store[job_id] = result

    return result

@router.get("/api/results/{job_id}", response_model=DetectionResult)
async def get_results(job_id: str):
    if job_id not in results_store:
        raise HTTPException(status_code=404, detail="Job not found")
    return results_store[job_id]