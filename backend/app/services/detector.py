import os
from pathlib import Path
from ultralytics import YOLO

# Use absolute path to models directory
BACKEND_DIR = Path(__file__).parent.parent.parent  # Go up 3 levels: detector.py -> services -> app -> backend
MODEL_DIR = BACKEND_DIR / "models"

class YOLODetector:
    def __init__(self, model_name: str):
        """
        Initialize YOLO detector with specified model.
        Args:
            model_name: Model filename (e.g., 'yolov8n.pt', 'yolo11n.pt')
        
        Note: Model must exist in backend/models/ directory.
              Does NOT auto-download models.
        """
        self.model_name = model_name
        self.model_path = MODEL_DIR / model_name
        
        # Verify model exists
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"❌ Model not found!\n"
                f"Expected path: {self.model_path}\n"
                f"Please download {model_name} and place it in: {MODEL_DIR}\n"
                f"\n"
                f"Download from:\n"
                f"  - https://github.com/ultralytics/assets/releases/\n"
                f"  - Or run: yolo detect predict model={model_name} source=image.jpg\n"
                f"\n"
                f"Supported models: yolov8n.pt, yolov8s.pt, yolo11n.pt, yolo11s.pt"
            )
        
        # Load model from local path
        print(f"Loading model from: {self.model_path}")
        self.model = YOLO(str(self.model_path))
        print(f"✅ Model loaded successfully")
    
    def detect(self, frame, confidence=0.5, verbose=False):
        """
        Run detection on a frame.
        Args:
            frame: OpenCV image frame
            confidence: Confidence threshold
            verbose: Print debug info
        Returns:
            List of detections with class_name, confidence, bbox, etc.
        """
        results = self.model(frame, conf=confidence, verbose=False)
        detections = []
        
        # Debug: Log frame info
        if verbose:
            print(f"[DEBUG] Frame size: {frame.shape}, Confidence threshold: {confidence}")
        
        for result in results:
            # Debug: Log all boxes found before filtering
            all_boxes = len(result.boxes)
            if verbose and all_boxes > 0:
                print(f"[DEBUG] Found {all_boxes} boxes (before confidence filter)")
                for i, box in enumerate(result.boxes):
                    print(f"  Box {i}: class={int(box.cls)}, conf={float(box.conf):.3f}")
            
            for box in result.boxes:
                detection = {
                    'class_id': int(box.cls),
                    'class_name': result.names[int(box.cls)],
                    'confidence': float(box.conf),
                    'bbox': {
                        'x1': float(box.xyxy[0][0]),
                        'y1': float(box.xyxy[0][1]),
                        'x2': float(box.xyxy[0][2]),
                        'y2': float(box.xyxy[0][3]),
                    }
                }
                detections.append(detection)
        
        if verbose:
            print(f"[DEBUG] Final detections: {len(detections)} (after confidence filter)\n")
        
        return detections
    
    def get_class_names(self):
        """Get list of class names that model can detect."""
        return self.model.names