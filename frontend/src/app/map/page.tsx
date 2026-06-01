"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAllDetections } from "../../services/api";
import { Detection } from "../../types";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("../../components/Map"), { ssr: false });

export default function MapPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['all-detections'],
    queryFn: getAllDetections,
    refetchInterval: 5000, // Poll database every 5 seconds to keep the map updated
  });

  const detections: Detection[] = (data?.data || []).map((d: any) => ({
    frame: 0,
    timestamp: d.detected_at || 0,
    class_name: "Trash", 
    confidence: d.confidence || 0,
    lat: d.lat,
    lon: d.lng,
    snapshot: d.image_url || '',
  }));

  // Create a path from detections sorted by time
  const gpsPath = [...detections]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(d => ({ lat: d.lat, lon: d.lon, time: 0 }));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="text-2xl font-semibold">River Waste Detection</div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">Home</Link>
          <Link href="/map" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Map</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-4xl font-bold">Detection Map</h1>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="h-[72vh] rounded-3xl overflow-hidden border border-slate-200">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">Loading map data...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">Failed to load detections</div>
            ) : (
              <Map gpsData={gpsPath} detections={detections} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
