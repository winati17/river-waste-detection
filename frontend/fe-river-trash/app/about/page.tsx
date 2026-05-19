"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-black font-sans">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-5 backdrop-blur-xl bg-white/40 dark:bg-white/10 border-b border-white/20">
        <div className="text-lg font-semibold">River Trash AI</div>
        <div className="flex gap-4">
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/about">
            <Button>About</Button>
          </Link>
          <Link href="/map">
            <Button variant="ghost">Map</Button>
          </Link>
        </div>
      </nav>
      
      {/* HERO */}
      <section className="py-24 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          River Trash Geotagging
        </motion.h1>

        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          A smart environmental monitoring system powered by autonomous drone
          technology and AI to detect, map, and help clean river pollution in
          real-time.
        </p>
      </section>

      {/* PROJECT BACKGROUND */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-semibold mb-4">Project Background</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our mission is to support sustainable and cleaner rivers by
            leveraging autonomous drone technology and artificial intelligence.
            This project focuses on early detection of trash accumulation,
            real-time geotagging, and providing actionable environmental
            insights. By integrating AI, geospatial analytics, and IoT, we aim
            to empower governments, environmental organizations, and
            communities to respond faster and more effectively to river
            pollution challenges.
          </p>
        </motion.div>
      </section>

      {/* SYSTEM FLOW */}
      <section className="bg-white/40 dark:bg-white/5 backdrop-blur-xl py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-12 text-center">
            System Flow
          </h2>

          <div className="space-y-10 relative">
            {[
              "Camera Capture",
              "Jetson Nano Inference (YOLO)",
              "GPS Tagging",
              "Web Dashboard",
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-6"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {i + 1}
                </div>
                <div className="text-lg font-medium">{step}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-semibold mb-10 text-center">
          Technology Stack
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white/50 dark:bg-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Hardware</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Jetson Nano</li>
                <li>GPS Module</li>
                <li>Autonomous Drone</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Software</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>YOLO (Computer Vision)</li>
                <li>FastAPI Backend</li>
                <li>Next.js Dashboard</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-white/40 dark:bg-white/5 backdrop-blur-xl py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Contact Us
          </h2>

          <Card className="bg-white/50 dark:bg-white/10 backdrop-blur-xl">
            <CardContent className="p-6 space-y-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Email" />
              <Textarea placeholder="Your message..." rows={5} />
              <Button className="w-full">Send Message</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-sm text-muted-foreground">
        © 2026 River Trash Monitoring System
      </footer>
    </div>
  );
}
