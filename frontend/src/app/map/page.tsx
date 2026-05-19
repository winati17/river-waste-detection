"use client";

import Link from "next/link";
import Map from "../../components/Map";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllDetections, clearDetections } from "../../services/api";
import { Detection } from "../../types";

export default function MapPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['all-detections'],
    queryFn: getAllDetections,
  });

  const clearMutation = useMutation({
    mutationFn: clearDetections,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-detections'] });
    },
  });

  const detections: Detection[] = (data?.data || []).map((d: any) => ({
    frame: 0,
    timestamp: 0,
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
        <div className="text-xl font-semibold">River Trash AI</div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">Home</Link>
          <Link href="/about" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">About</Link>
          <Link href="/map" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Map</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-4xl font-bold">Detection Map</h1>
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to clear all detections from the map?")) {
                clearMutation.mutate();
              }
            }}
            disabled={clearMutation.isPending}
            className="mt-4 sm:mt-0 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {clearMutation.isPending ? 'Clearing...' : 'Reset Map'}
          </button>
        </div>
        <p className="mb-10 max-w-3xl text-slate-700 leading-7">
          Visualize detected trash locations and the drone path from river monitoring missions.
          The map updates as new footage is processed.
        </p>

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
