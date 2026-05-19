'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Detection } from '../types';

interface MapProps {
  gpsData: Array<{ lat: number; lon: number; time: number }>;
  detections: Detection[];
  currentTimestamp?: number;
}

export default function Map({ gpsData, detections, currentTimestamp }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const pathPolyline = useRef<L.Polyline | null>(null);
  const markers = useRef<{ [key: string]: L.Marker }>({});
  const currentMarker = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map centered on GPS data or default to Makassar
    if (!map.current) {
      const defaultCenter: L.LatLngExpression = [-5.147665, 119.432731];
      const defaultZoom = 13;
      const center =
        gpsData.length > 0
          ? [gpsData[Math.floor(gpsData.length / 2)].lat, gpsData[Math.floor(gpsData.length / 2)].lon]
          : defaultCenter;

      map.current = L.map(mapContainer.current).setView(center as L.LatLngExpression, gpsData.length > 0 ? 13 : defaultZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Clear all markers and path if detections is empty (e.g. after Reset Map)
    if (detections.length === 0) {
      Object.values(markers.current).forEach((marker) => {
        map.current?.removeLayer(marker);
      });
      markers.current = {};
      if (pathPolyline.current) {
        map.current?.removeLayer(pathPolyline.current);
        pathPolyline.current = null;
      }
    }

    // Draw drone path
    if (gpsData.length > 0) {
      const path = gpsData.map((point) => [point.lat, point.lon] as L.LatLngExpression);
      if (!pathPolyline.current) {
        pathPolyline.current = L.polyline(path, {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
        }).addTo(map.current);
      } else {
        pathPolyline.current.setLatLngs(path);
      }
    }

    // Add detection markers
    detections.forEach((detection, index) => {
      if (!markers.current[index]) {
        const marker = L.marker([detection.lat, detection.lon], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        })
          .bindPopup(
            `<div class="text-sm">
              <p><strong>${detection.class_name}</strong></p>
              <p>Confidence: ${(detection.confidence * 100).toFixed(1)}%</p>
              <p>Frame: ${detection.frame}</p>
              <p>Location: ${detection.lat.toFixed(4)}, ${detection.lon.toFixed(4)}</p>
              ${detection.snapshot ? `<img src="${detection.snapshot.startsWith('http') ? detection.snapshot : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + detection.snapshot}" class="mt-2 max-w-xs" />` : ''}
            </div>`,
            { maxWidth: 400 }
          )
          .addTo(map.current!);

        markers.current[index] = marker;
      }
    });

    // Update current position marker
    if (currentTimestamp !== undefined && gpsData.length > 0) {
      const currentPoint = gpsData.find((p) => Math.abs(p.time - currentTimestamp) < 0.5);
      if (currentPoint) {
        if (currentMarker.current) {
          map.current?.removeLayer(currentMarker.current);
        }
        currentMarker.current = L.circleMarker([currentPoint.lat, currentPoint.lon], {
          radius: 8,
          fillColor: '#10b981',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map.current!);
      }
    }

    return () => {
      // Cleanup on unmount
    };
  }, [gpsData, detections, currentTimestamp]);

  return <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" style={{ minHeight: '400px' }} />;
}