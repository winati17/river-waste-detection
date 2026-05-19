"use client";

import Link from "next/link";
import UploadForm from "../components/UploadForm";
import HistoryList from "../components/HistoryList";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900">
      <nav className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="text-2xl font-semibold">River Trash AI</div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Home</Link>
          <Link href="/about" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">About</Link>
          <Link href="/map" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">Map</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <section className="grid gap-12 lg:grid-cols-[1.4fr_1fr] items-center">
          <div className="space-y-8">
            <div className="max-w-xl space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">River waste detection</p>
              <h1 className="text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
                AI-powered detection for cleaner rivers
              </h1>
              <p className="text-lg leading-8 text-slate-700">
                Upload river drone video and GPS telemetry to identify floating trash,
                plot detection locations, and review the results with maps and video playback.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/map" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800">View Map</Link>
                <Link href="/about" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">Learn More</Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Autonomous Monitoring", text: "Capture river footage and GPS data with drone missions." },
                { title: "AI Trash Detection", text: "Use advanced YOLO models to identify floating waste." },
                { title: "Geospatial Insights", text: "Map detections with GPS coordinates for actionable analysis." },
                { title: "Result Dashboard", text: "Review detection summaries, map data, and video playback." },
              ].map((card) => (
                <div key={card.title} className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
                  <p className="text-slate-600 leading-7">{card.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-[2rem] bg-white/90 p-8 shadow-2xl shadow-slate-500/10 ring-1 ring-slate-200">
              <h2 className="text-3xl font-semibold mb-4">Upload video & start detection</h2>
              <p className="mb-6 text-slate-600">
                Submit your MP4 river footage and GPS SRT file, then choose the model and confidence threshold.
              </p>
              <UploadForm />
              <HistoryList />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/70 py-8 text-center text-sm text-slate-600">
        © 2026 River Trash AI Monitoring System
      </footer>
    </div>
  );
}
