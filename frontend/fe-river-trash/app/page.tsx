"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-black font-sans">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-5 backdrop-blur-xl bg-white/40 dark:bg-white/10 border-b border-white/20">
        <div className="text-lg font-semibold">River Trash AI</div>

        <div className="flex gap-4">
          <Link href="/">
            <Button>Home</Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost">About</Button>
          </Link>
          <Link href="/map">
            <Button variant="ghost">Map</Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="py-28 px-6 text-center max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold mb-6"
        >
          Smart River Monitoring
          <br />
          Powered by AI & Autonomous Drones
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
        >
          Detect, map, and monitor river pollution in real-time using computer
          vision, geospatial intelligence, and edge AI. A next-generation
          solution for sustainable and cleaner waterways.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4"
        >
          <Link href="/map">
            <Button size="lg" className="px-8">
              View Live Map
            </Button>
          </Link>

          <Link href="/about">
            <Button size="lg" variant="outline" className="px-8">
              Learn More
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Why River Trash AI?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Autonomous Monitoring",
              desc: "Drones continuously patrol rivers and capture real-time environmental data.",
            },
            {
              title: "AI Trash Detection",
              desc: "Advanced YOLO models detect floating waste with high accuracy.",
            },
            {
              title: "Geospatial Intelligence",
              desc: "Precise GPS tagging enables actionable environmental insights.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg"
            >
              <div className="text-xl font-semibold mb-2">{f.title}</div>
              <p className="text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* IMPACT */}
      <section className="bg-white/40 dark:bg-white/5 backdrop-blur-xl py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-8">Environmental Impact</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: "10K+", label: "Trash Detected" },
              { value: "25", label: "Rivers Monitored" },
              { value: "92%", label: "Detection Accuracy" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-white/50 dark:bg-white/10"
              >
                <div className="text-4xl font-bold mb-2">{s.value}</div>
                <div className="text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center px-6">
        <h2 className="text-3xl font-semibold mb-6">
          Join the Future of Environmental Monitoring
        </h2>

        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Collaborate with us to deploy AI-powered solutions for cleaner rivers
          and sustainable ecosystems.
        </p>

        <Link href="/about">
          <Button size="lg" className="px-10">
            Get in Touch
          </Button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-sm text-muted-foreground">
        © 2026 River Trash AI Monitoring System
      </footer>
    </div>
  );
}
