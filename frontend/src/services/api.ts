import axios from 'axios';
import { DetectionResult } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadFiles = async (
  video: File,
  srt: File,
  modelName: string,
  confidence: number
): Promise<DetectionResult> => {
  const formData = new FormData();
  formData.append('video', video);
  formData.append('srt', srt);
  formData.append('model_name', modelName);
  formData.append('confidence', confidence.toString());

  const response = await api.post('/api/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getResults = async (jobId: string): Promise<DetectionResult> => {
  const response = await api.get(`/api/results/${jobId}`);
  return response.data;
};

export const getAllDetections = async () => {
  const response = await api.get(`/api/detections`);
  return response.data;
};