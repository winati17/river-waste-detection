'use client';

import { useState } from 'react';
import { Detection } from '../types';

interface GalleryProps {
  detections: Detection[];
}

export default function DetectionGallery({ detections }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (detections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No detections available</p>
      </div>
    );
  }

  const selected = selectedIndex !== null ? detections[selectedIndex] : null;

  return (
    <div className="space-y-4">
      {/* Large View */}
      {selected && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="mb-4">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${selected.snapshot}`}
              alt="Detection"
              className="w-full max-h-96 object-cover rounded"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Class</span>
              <p className="font-medium">{selected.class_name}</p>
            </div>
            <div>
              <span className="text-gray-600">Confidence</span>
              <p className="font-medium">{(selected.confidence * 100).toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-gray-600">Frame</span>
              <p className="font-medium">{selected.frame}</p>
            </div>
            <div>
              <span className="text-gray-600">Time</span>
              <p className="font-medium">{selected.timestamp.toFixed(2)}s</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600">Location</span>
              <p className="font-medium">{selected.lat.toFixed(4)}, {selected.lon.toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Grid */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-4">Gallery ({detections.length} items)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {detections.map((detection, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative overflow-hidden rounded transition-all ${
                selectedIndex === idx ? 'ring-2 ring-blue-600 scale-95' : 'hover:scale-105'
              }`}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${detection.snapshot}`}
                alt={`Detection ${idx}`}
                className="w-full h-24 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                {(detection.confidence * 100).toFixed(0)}%
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* List View */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-4">Detections</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {detections.map((detection, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-full text-left p-3 rounded transition-colors ${
                selectedIndex === idx
                  ? 'bg-blue-100 border-l-4 border-blue-600'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{detection.class_name}</p>
                  <p className="text-xs text-gray-600">
                    Frame {detection.frame} • {detection.timestamp.toFixed(2)}s
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{(detection.confidence * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-600">
                    {detection.lat.toFixed(3)}, {detection.lon.toFixed(3)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}