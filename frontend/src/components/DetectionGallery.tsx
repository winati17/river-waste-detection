'use client';

import { useState, useMemo } from 'react';
import { Detection } from '../types';

interface GalleryProps {
  detections: Detection[];
}

export default function DetectionGallery({ detections }: GalleryProps) {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);

  // Group detections by frame number (1 frame per second)
  const frames = useMemo(() => {
    const map = new Map<number, Detection[]>();
    detections.forEach(d => {
      const group = map.get(d.frame) || [];
      group.push(d);
      map.set(d.frame, group);
    });
    // Return sorted by frame
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([frame, items]) => ({ frame, items }));
  }, [detections]);

  if (frames.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No detections available</p>
      </div>
    );
  }

  // Auto-select first frame if none selected
  const activeFrame = selectedFrame ?? frames[0].frame;
  const activeItems = frames.find(f => f.frame === activeFrame)?.items || [];
  
  // Use the first item's snapshot for the frame thumbnail (since they share the same frame)
  const activeSnapshot = activeItems[0]?.snapshot || '';
  const resolvedSnapshot = activeSnapshot.startsWith('http') 
    ? activeSnapshot 
    : `${process.env.NEXT_PUBLIC_API_URL}${activeSnapshot}`;

  return (
    <div className="space-y-6">
      {/* Frame Details & Detected Items View */}
      {activeItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left side: Original Frame image */}
            <div className="md:w-1/2">
              <img
                src={resolvedSnapshot}
                alt={`Frame ${activeFrame}`}
                className="w-full max-h-96 object-contain rounded shadow-sm border border-gray-100 bg-gray-100"
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded">
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider">Time</span>
                  <p className="font-semibold text-gray-800">{activeItems[0].timestamp.toFixed(2)}s</p>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider">Frame</span>
                  <p className="font-semibold text-gray-800">{activeFrame}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block text-xs uppercase tracking-wider">Location</span>
                  <p className="font-semibold text-gray-800">{activeItems[0].lat.toFixed(5)}, {activeItems[0].lon.toFixed(5)}</p>
                </div>
              </div>
            </div>

            {/* Right side: Items found in this frame */}
            <div className="md:w-1/2">
              <h4 className="font-semibold text-lg mb-3 border-b pb-2">
                Detected Objects ({activeItems.length})
              </h4>
              <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
                {activeItems.map((item, idx) => {
                  let wrapperStyle: React.CSSProperties = {};
                  let imgStyle: React.CSSProperties = {};
                  
                  if (item.bbox) {
                    const w = Math.max(1, item.bbox.x2 - item.bbox.x1);
                    const h = Math.max(1, item.bbox.y2 - item.bbox.y1);
                    const scale = Math.min(80 / w, 80 / h);
                    
                    wrapperStyle = {
                      width: `${w}px`,
                      height: `${h}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      position: 'absolute',
                      top: `${(80 - h * scale) / 2}px`,
                      left: `${(80 - w * scale) / 2}px`,
                      overflow: 'hidden',
                    };
                    
                    imgStyle = {
                      position: 'absolute',
                      left: `-${item.bbox.x1}px`,
                      top: `-${item.bbox.y1}px`,
                      maxWidth: 'none',
                    };
                  }

                  return (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors">
                      {/* CSS Crop Thumbnail */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded overflow-hidden relative shadow-inner">
                        {item.bbox ? (
                          <div style={wrapperStyle}>
                             <img 
                               src={resolvedSnapshot} 
                               alt="Crop" 
                               style={imgStyle}
                             />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 text-center px-2">No BBox</div>
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div>
                        <p className="font-bold text-gray-900 text-lg capitalize">{item.class_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            Confidence: {(item.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Frame Timeline/Grid */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-4">Timeline Frames ({frames.length})</h3>
        <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
          {frames.map(({ frame, items }) => {
            const snap = items[0]?.snapshot || '';
            const resSnap = snap.startsWith('http') ? snap : `${process.env.NEXT_PUBLIC_API_URL}${snap}`;
            const isSelected = activeFrame === frame;
            
            return (
              <button
                key={frame}
                onClick={() => setSelectedFrame(frame)}
                className={`snap-start flex-shrink-0 relative w-32 h-24 rounded-lg overflow-hidden transition-all ${
                  isSelected ? 'ring-4 ring-blue-600 scale-95 shadow-md' : 'hover:opacity-80'
                }`}
              >
                <img
                  src={resSnap}
                  alt={`Frame ${frame}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-bl">
                  {items.length} item{items.length !== 1 && 's'}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-1 pt-4 text-center">
                  {items[0].timestamp.toFixed(1)}s
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}