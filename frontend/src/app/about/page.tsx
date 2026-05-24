import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="text-xl font-semibold">River Trash AI</div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">Home</Link>
          <Link href="/about" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">About</Link>
          <Link href="/map" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">Map</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="space-y-6">
          <h1 className="text-4xl font-bold">About River Trash AI Monitoring System</h1>
          <p className="text-lg text-slate-700 leading-8">
            River Trash AI is a comprehensive environmental monitoring platform that combines autonomous drone technology, computer vision AI, and geospatial analysis to detect and map floating waste in rivers. The system processes drone footage and GPS telemetry to identify pollution hotspots, enabling data-driven cleanup efforts and environmental research.
          </p>
        </section>

        <section className="mt-16 grid gap-10 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold mb-4">Core Capabilities</h2>
            <ul className="space-y-2 text-slate-700 leading-7">
              <li>✓ Autonomous river video capture via drone missions</li>
              <li>✓ Real-time GPS telemetry recording in SRT format</li>
              <li>✓ AI-powered waste detection using YOLO models</li>
              <li>✓ Geospatial mapping of detected objects</li>
              <li>✓ Interactive results dashboard with video playback</li>
              <li>✓ Historical tracking and analysis tools</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold mb-4">Pipeline Overview</h2>
            <ol className="space-y-3 text-slate-700 leading-7">
              <li>1. <strong>Upload:</strong> Submit drone footage (MP4) + GPS data (SRT)</li>
              <li>2. <strong>Process:</strong> AI analyzes frames at configurable intervals</li>
              <li>3. <strong>Detect:</strong> YOLO identifies trash with confidence scoring</li>
              <li>4. <strong>Map:</strong> Coordinates linked to GPS for precise location</li>
              <li>5. <strong>Visualize:</strong> Results shown via dashboard and interactive map</li>
            </ol>
          </div>
        </section>

        <section className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold mb-3">Frontend</h3>
            <p className="text-slate-700 leading-7">
              Built with Next.js 13 and React. Hosted on Vercel for global accessibility. Real-time UI updates and interactive Leaflet maps for detection visualization.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold mb-3">Backend</h3>
            <p className="text-slate-700 leading-7">
              FastAPI with Python for high-performance video processing. Deployed via Docker on Railway. Handles video parsing, YOLO detection, GPS interpolation, and result storage.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold mb-3">AI Models</h3>
            <p className="text-slate-700 leading-7">
              YOLOv8 Nano and YOLO11 Nano models for real-time object detection. Selectable confidence thresholds (0.1 - 1.0) for fine-tuning detection sensitivity.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
