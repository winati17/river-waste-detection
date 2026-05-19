from typing import List, Dict, Optional

def detect_gps_offset(video_duration: float, gps_data: List[Dict]) -> float:
    """
    Auto-detect offset between video timestamps and GPS timestamps.
    
    Problem: Video might start at 0s but GPS data starts at 61s (due to drone being stationary before takeoff)
    Solution: Calculate offset automatically and adjust GPS timestamps
    
    Args:
        video_duration: Duration of video in seconds
        gps_data: List of GPS data with 'time' key
    
    Returns:
        Offset to add to video timestamps to match GPS timestamps
    """
    if not gps_data:
        return 0.0
    
    gps_start = min(p['time'] for p in gps_data)
    gps_end = max(p['time'] for p in gps_data)
    gps_duration = gps_end - gps_start
    
    # If video duration is close to GPS duration, apply offset
    # (Allow 10% difference for rounding/frame skip)
    if abs(gps_duration - video_duration) < max(video_duration * 0.1, 2.0):
        offset = gps_start
        print(f"[DEBUG] Auto-detected GPS offset: {offset:.2f}s")
        return offset
    
    return 0.0

def find_nearest_gps(timestamp: float, gps_data: List[Dict], gps_offset: float = 0.0) -> Optional[Dict]:
    """
    Find nearest GPS data point for a given timestamp.
    Args:
        timestamp: Frame timestamp in seconds
        gps_data: List of GPS data points with 'time', 'lat', 'lon', 'alt'
        gps_offset: Offset to apply to timestamps (for handling video start vs GPS start mismatch)
    Returns:
        Nearest GPS data point or None
    """
    if not gps_data:
        return None
    
    # Adjust timestamp with offset
    adjusted_timestamp = timestamp + gps_offset
    
    # Find closest timestamp
    nearest = min(gps_data, key=lambda x: abs(x['time'] - adjusted_timestamp))
    
    # More lenient: allow up to 30 seconds difference (can be adjusted)
    # This handles cases where drone was recording before flying
    if abs(nearest['time'] - adjusted_timestamp) <= 30.0:
        return nearest
    
    return None

def interpolate_gps(timestamp: float, gps_data: List[Dict], gps_offset: float = 0.0) -> Optional[Dict]:
    """
    Interpolate GPS location between two nearest points.
    Args:
        timestamp: Frame timestamp in seconds
        gps_data: List of GPS data points sorted by time
        gps_offset: Offset to apply (for handling video start vs GPS start mismatch)
    Returns:
        Interpolated GPS data or None
    """
    if not gps_data or len(gps_data) < 2:
        return find_nearest_gps(timestamp, gps_data, gps_offset)
    
    # Adjust timestamp with offset
    adjusted_timestamp = timestamp + gps_offset
    
    # Find surrounding points
    before = None
    after = None
    
    for point in gps_data:
        if point['time'] <= adjusted_timestamp:
            before = point
        elif after is None:
            after = point
            break
    
    if before is None or after is None:
        return find_nearest_gps(timestamp, gps_data, gps_offset)
    
    # Linear interpolation
    time_diff = after['time'] - before['time']
    if time_diff == 0:
        return before
    
    ratio = (adjusted_timestamp - before['time']) / time_diff
    
    interpolated = {
        'time': timestamp,
        'lat': before['lat'] + (after['lat'] - before['lat']) * ratio,
        'lon': before['lon'] + (after['lon'] - before['lon']) * ratio,
        'alt': before.get('alt', 0) + (after.get('alt', 0) - before.get('alt', 0)) * ratio if before.get('alt') and after.get('alt') else None
    }
    
    return interpolated