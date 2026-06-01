"use client";

import Link from "next/link";
import UploadForm from "../components/UploadForm";
import HistoryList from "../components/HistoryList";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900">
      <nav className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="text-2xl font-semibold">River Waste Detection</div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Home</Link>
          <Link href="/map" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">Map</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-16">
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
      </main>
    </div>
  );
}
