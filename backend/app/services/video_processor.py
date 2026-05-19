import cv2
import os
from typing import List, Dict

class VideoProcessor:
    def __init__(self, video_path: str, frame_skip: int = 10):
        """
        Initialize video processor.
        Args:
            video_path: Path to video file
            frame_skip: Process every nth frame (default 10)
        """
        self.video_path = video_path
        self.frame_skip = frame_skip
        self.cap = cv2.VideoCapture(video_path)
        
        if not self.cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")
        
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    def get_frames(self):
        """
        Generator that yields frames at specified interval.
        Yields:
            (frame_number, timestamp, frame)
        """
        frame_number = 0
        
        while True:
            ret, frame = self.cap.read()
            
            if not ret:
                break
            
            # Only yield frames at skip interval
            if frame_number % self.frame_skip == 0:
                timestamp = frame_number / self.fps
                yield frame_number, timestamp, frame
            
            frame_number += 1
    
    def save_frame(self, frame, output_path: str) -> str:
        """
        Save frame as JPEG.
        Args:
            frame: OpenCV image frame
            output_path: Directory to save frame
        Returns:
            Filename of saved frame
        """
        os.makedirs(output_path, exist_ok=True)
        filename = f"frame_{int(cv2.getTickCount())}.jpg"
        filepath = os.path.join(output_path, filename)
        cv2.imwrite(filepath, frame)
        return filename
    
    def close(self):
        """Close video capture."""
        self.cap.release()
    
    def __del__(self):
        """Cleanup on object deletion."""
        self.close()