'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadFiles } from '@/services/api';

export default function Home() {
  const [video, setVideo] = useState<File | null>(null);
  const [srt, setSrt] = useState<File | null>(null);
  const [modelName, setModelName] = useState('yolov8n.pt');
  const [confidence, setConfidence] = useState(0.3);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !srt) return;

    setLoading(true);
    try {
      const result = await uploadFiles(video, srt, modelName, confidence);
      router.push(`/results/${result.job_id}`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-8">AI Drone Waste Detection</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Video File (.mp4)</label>
            <input
              type="file"
              accept=".mp4"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
              className="mt-1 block w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">GPS SRT File</label>
            <input
              type="file"
              accept=".srt"
              onChange={(e) => setSrt(e.target.files?.[0] || null)}
              className="mt-1 block w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            >
              <option value="yolov8n.pt">YOLOv8 Nano</option>
              <option value="yolo11n.pt">YOLO11 Nano</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confidence Threshold: {confidence}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="mt-1 block w-full"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !video || !srt}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Process Video'}
          </button>
        </form>
      </div>
    </div>
  );
}
