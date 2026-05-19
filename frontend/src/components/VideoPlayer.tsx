'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export default function VideoPlayer({ videoUrl, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [onTimeUpdate]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full bg-black"
        src={videoUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <div className="bg-gray-900 p-4 space-y-2">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-700 rounded cursor-pointer accent-blue-600"
        />
        <div className="flex items-center justify-between text-sm text-gray-300">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}