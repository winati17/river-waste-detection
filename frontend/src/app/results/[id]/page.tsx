'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { getResults } from '../../../services/api';
import { DetectionResult } from '../../../types';
import Map from '../../../components/Map';
import VideoPlayer from '../../../components/VideoPlayer';
import DetectionGallery from '../../../components/DetectionGallery';

export default function ResultsPage() {
  const { id } = useParams();
  const router = useRouter();
  const jobId = id as string;
  const [activeTab, setActiveTab] = useState<'summary' | 'map' | 'video' | 'gallery'>('summary');
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  const { data, isLoading, error } = useQuery<DetectionResult>({
    queryKey: ['results', jobId],
    queryFn: () => getResults(jobId),
    refetchInterval: 2000, // Always refetch every 2 seconds for now
  });

  // Extract GPS path from detections and SRT
  const gpsPath = useMemo(() => {
    const detections = data?.detections ?? [];
    if (detections.length === 0) return [];

    // Create a unique path from all detection coordinates sorted by timestamp
    const uniquePoints: Record<string, { lat: number; lon: number; time: number }> = {};
    detections.forEach((det) => {
      const key = `${det.lat.toFixed(5)}-${det.lon.toFixed(5)}`;
      if (!uniquePoints[key]) {
        uniquePoints[key] = {
          lat: det.lat,
          lon: det.lon,
          time: det.timestamp,
        };
      }
    });

    return Object.values(uniquePoints).sort((a, b) => a.time - b.time);
  }, [data?.detections]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing video...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few minutes</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error loading results</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const tabs = [
    { id: 'summary' as const, label: 'Summary', icon: '📊' },
    { id: 'map' as const, label: 'Map', icon: '🗺️' },
    { id: 'video' as const, label: 'Video', icon: '📹', disabled: !data.video_url },
    { id: 'gallery' as const, label: 'Gallery', icon: '🖼️', disabled: !data.detections || data.detections.length === 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Detection Results</h1>
          <p className="text-gray-600 mt-2">Job ID: {jobId}</p>
        </div>

        {/* Status Banner */}
        <div className="mb-6">
          {data.status === 'completed' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              ✅ Processing completed successfully!
            </div>
          ) : data.status === 'failed' ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              ❌ Processing failed: {data.error}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
              ⏳ Processing in progress...
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex gap-1 p-4 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : tab.disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 font-medium">Status</p>
                    <p className="text-2xl font-bold text-blue-900 mt-2">{data.status}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 font-medium">Total Detections</p>
                    <p className="text-2xl font-bold text-green-900 mt-2">{data.total_detections || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 font-medium">Processing Time</p>
                    <p className="text-2xl font-bold text-purple-900 mt-2">
                      {data.processing_time ? `${data.processing_time.toFixed(2)}s` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 font-medium">Avg Confidence</p>
                    <p className="text-2xl font-bold text-orange-900 mt-2">
                      {data.avg_confidence ? `${(data.avg_confidence * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                {data.status === 'completed' && data.detections && data.detections.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Detection Types</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(
                        data.detections.reduce(
                          (acc, det) => {
                            acc[det.class_name] = (acc[det.class_name] || 0) + 1;
                            return acc;
                          },
                          {} as Record<string, number>
                        )
                      ).map(([className, count]) => (
                        <div key={className} className="bg-gray-100 rounded-lg p-4">
                          <p className="font-medium text-gray-900">{className}</p>
                          <p className="text-2xl font-bold text-blue-600 mt-2">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Map Tab */}
            {activeTab === 'map' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Detection Map</h3>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <Map
                    gpsData={gpsPath}
                    detections={data.detections || []}
                    currentTimestamp={currentVideoTime}
                  />
                </div>
              </div>
            )}

            {/* Video Tab */}
            {activeTab === 'video' && data.video_url && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Video Playback</h3>
                <VideoPlayer
                  videoUrl={`${process.env.NEXT_PUBLIC_API_URL}${data.video_url}`}
                  onTimeUpdate={(time) => setCurrentVideoTime(time)}
                />
              </div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Detection Gallery</h3>
                {data.detections && data.detections.length > 0 ? (
                  <DetectionGallery detections={data.detections} />
                ) : (
                  <p className="text-gray-600 py-8 text-center">No detections found</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}