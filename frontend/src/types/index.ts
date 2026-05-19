export interface Detection {
  frame: number;
  timestamp: number;
  class_name: string;
  confidence: number;
  lat: number;
  lon: number;
  snapshot: string;
  bbox?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface DetectionResult {
  job_id: string;
  status: string;
  detections?: Detection[];
  total_detections?: number;
  progress?: number;
  processing_time?: number;
  avg_confidence?: number;
  error?: string;
  video_url?: string;
  original_video_url?: string;
}