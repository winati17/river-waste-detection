"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFiles } from "../services/api";

export default function UploadForm() {
  const [video, setVideo] = useState<File | null>(null);
  const [srt, setSrt] = useState<File | null>(null);
  const [modelName, setModelName] = useState("yolov8n.pt");
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
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white/90 shadow-2xl shadow-slate-200/80 p-8 ring-1 ring-slate-200">
      <h2 className="text-2xl font-semibold mb-6">Start Waste Detection</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">Video File (.mp4)</label>
          <input
            type="file"
            accept=".mp4"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
            className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">GPS SRT File</label>
          <input
            type="file"
            accept=".srt"
            onChange={(e) => setSrt(e.target.files?.[0] || null)}
            className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Model</label>
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="yolov8n.pt">YOLOv8 Nano</option>
            <option value="yolo11n.pt">YOLO11 Nano</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Confidence Threshold: {confidence}
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            className="mt-2 w-full"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !video || !srt}
          className="w-full rounded-full bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Processing..." : "Process Video"}
        </button>
      </form>
    </div>
  );
}
