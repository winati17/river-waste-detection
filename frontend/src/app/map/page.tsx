"use client";

import Link from "next/link";
import Map from "../../components/Map";

const mockGps = [
  { lat: -8.5069, lon: 115.2625, time: 0 },
  { lat: -8.5075, lon: 115.263, time: 60 },
  { lat: -8.5081, lon: 115.264, time: 120 },
];

const mockDetections = [
  {
    frame: 42,
    timestamp: 12.4,
    class_name: "Trash",
    confidence: 0.86,
    lat: -8.5072,
    lon: 115.2628,
    snapshot: "",
  },
  {
    frame: 78,
    timestamp: 34.7,
    class_name: "Plastic",
    confidence: 0.91,
    lat: -8.5078,
    lon: 115.2634,
    snapshot: "",
  },
];

export default function MapPage() {
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
        <h1 className="text-4xl font-bold mb-6">Detection Map</h1>
        <p className="mb-10 max-w-3xl text-slate-700 leading-7">
          Visualize detected trash locations and the drone path from river monitoring missions.
          The map updates as new footage is processed.
        </p>

        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="h-[72vh] rounded-3xl overflow-hidden border border-slate-200">
            <Map gpsData={mockGps} detections={mockDetections} />
          </div>
        </div>
      </main>
    </div>
  );
}
