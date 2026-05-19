"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Dynamically import React-Leaflet (avoids SSR issues in Next.js)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Marker clustering
const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-cluster"),
  { ssr: false }
);

// Mock detections
const mockDetections = [
  {
    id: 1,
    lat: -8.5069,
    lng: 115.2625,
    confidence: 0.85,
    time: "2026-03-02 10:24",
    image:
      "https://images.unsplash.com/photo-1618477462146-050d2769e2e2?q=80&w=400",
  },
  {
    id: 2,
    lat: -8.5075,
    lng: 115.263,
    confidence: 0.91,
    time: "2026-03-02 10:30",
    image:
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=400",
  },
];

export default function RiverTrashDashboard() {
  const [detections] = useState(mockDetections);

return (
  <div className="flex flex-col h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-black font-sans">
    
    {/* NAVBAR (TOP FULL WIDTH) */}
    <nav className="flex items-center justify-between px-8 py-5 backdrop-blur-xl bg-white/40 dark:bg-white/10 border-b border-white/20">
      <div className="text-lg font-semibold">River Trash AI</div>

      <div className="flex gap-4">
        <Link href="/">
          <Button variant="ghost">Home</Button>
        </Link>
        <Link href="/about">
          <Button variant="ghost">About</Button>
        </Link>
        <Link href="/map">
          <Button>Map</Button>
        </Link>
      </div>
    </nav>

    {/* CONTENT */}
    <div className="flex flex-1 overflow-hidden">

      {/* Sidebar */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 p-4 backdrop-blur-xl bg-white/40 dark:bg-white/10 border-r border-white/30 shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-4">Real-time Feed</h2>

        <ScrollArea className="h-[90%] pr-2">
          <div className="space-y-3">
            {detections.map((d) => (
              <Card
                key={d.id}
                className="bg-white/50 dark:bg-white/10 backdrop-blur-xl border-white/20"
              >
                <CardContent className="p-3 flex gap-3">
                  <img
                    src={d.image}
                    alt="trash"
                    className="w-16 h-16 object-cover rounded-xl"
                  />
                  <div className="text-sm">
                    <div className="font-medium">Trash detected</div>
                    <div className="text-muted-foreground">{d.time}</div>
                    <Badge className="mt-1">
                      {Math.round(d.confidence * 100)}% confidence
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[-8.5069, 115.2625]}
          zoom={15}
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          <MarkerClusterGroup>
            {detections.map((d) => (
              <Marker key={d.id} position={[d.lat, d.lng]}>
                <Popup>
                  <div className="space-y-2 w-56">
                    <img
                      src={d.image}
                      className="rounded-xl object-cover"
                      alt="trash"
                    />

                    <div className="text-sm">
                      <div className="font-semibold">
                        Confidence: {Math.round(d.confidence * 100)}%
                      </div>
                      <div>Time: {d.time}</div>
                      <div>
                        GPS: {d.lat.toFixed(5)}, {d.lng.toFixed(5)}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  </div>
);
}
