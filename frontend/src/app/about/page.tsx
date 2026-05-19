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
          <h1 className="text-4xl font-bold">About River Trash AI</h1>
          <p className="text-lg text-slate-700 leading-8">
            River Trash AI is an environmental monitoring solution that combines drone imagery,
            geospatial telemetry, and AI-driven object detection to identify floating waste in rivers.
            The system helps teams monitor pollution, map trash hotspots, and prioritize cleanup actions.
          </p>
        </section>

        <section className="mt-16 grid gap-10 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold mb-4">Project Background</h2>
            <p className="text-slate-700 leading-7">
              Our mission is to support cleaner waterways by leveraging autonomous drone technology and
              artificial intelligence. The platform focuses on early detection of waste accumulation,
              real-time GPS tagging, and delivering actionable insights to environmental agencies.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <ul className="space-y-3 text-slate-700 leading-7">
              <li>1) Drone captures river video and GPS telemetry.</li>
              <li>2) AI model detects trash and maps coordinates.</li>
              <li>3) Backend processes detections and stores results.</li>
              <li>4) Frontend displays analysis, map, and video playback.</li>
            </ul>
          </div>
        </section>

        <section className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold mb-3">Hardware</h3>
            <p className="text-slate-700 leading-7">
              The system is designed to work with drones and edge devices that capture video footage and
              GPS metadata for river monitoring.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold mb-3">Software</h3>
            <p className="text-slate-700 leading-7">
              The backend uses FastAPI, the detection logic runs on YOLO models, and the frontend is built
              as a React/Next.js dashboard for fast analysis and mapping.
            </p>
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-blue-600 p-10 text-white shadow-2xl">
          <h2 className="text-3xl font-semibold mb-4">Ready to explore river data?</h2>
          <p className="max-w-3xl leading-7">
            Switch to the live map or upload your sample footage to start detecting trash in river waterways.
          </p>
        </section>
      </main>
    </div>
  );
}
