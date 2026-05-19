export interface Detection {
  frame: number;
  timestamp: number;
  class_name: string;
  confidence: number;
  lat: number;
  lon: number;
  snapshot: string;
}

export interface DetectionResult {
  job_id: string;
  status: string;
  detections?: Detection[];
  total_detections?: number;
  processing_time?: number;
  avg_confidence?: number;
  error?: string;
  video_url?: string;
}