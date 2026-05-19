import pysrt
import re


def _subrip_time_to_seconds(subrip_time):
    """Convert pysrt.SubRipTime to seconds as a float."""
    return (
        subrip_time.hours * 3600
        + subrip_time.minutes * 60
        + subrip_time.seconds
        + (getattr(subrip_time, 'milliseconds', 0) or 0) / 1000.0
    )


def parse_srt(file_path):
    """
    Parse SRT file to extract GPS data.
    
    Supports two formats:
    
    1. Custom format (simple):
       Lat: -6.123456 Lon: 106.789012 Alt: 100.0
    
    2. DJI format (detailed):
       [latitude: -5.112355] [longitude: 119.420526] [rel_alt: 3.500 abs_alt: 66.465]
    
    Returns:
        list: GPS data points with time, lat, lon, alt
    """
    subs = pysrt.open(file_path, encoding='utf-8')
    gps_data = []

    for sub in subs:
        text = sub.text
        lat = None
        lon = None
        alt = None

        # Try DJI format: [latitude: X] [longitude: Y] [rel_alt: Z abs_alt: W]
        lat_match = re.search(r'\[latitude:\s*([-\d.]+)\]', text)
        lon_match = re.search(r'\[longitude:\s*([-\d.]+)\]', text)
        alt_match = re.search(r'\[(?:rel_alt|abs_alt):\s*([-\d.]+)', text)

        if lat_match:
            lat = float(lat_match.group(1))
        if lon_match:
            lon = float(lon_match.group(1))
        if alt_match:
            alt = float(alt_match.group(1))

        # Fallback to simple format: Lat: X Lon: Y Alt: Z
        if lat is None or lon is None:
            lines = text.split('\n')
            for line in lines:
                line = line.strip()
                
                # Simple format with space-separated values
                if 'Lat:' in line:
                    try:
                        lat = float(re.search(r'Lat:\s*([-\d.]+)', line).group(1))
                    except:
                        pass
                
                if 'Lon:' in line:
                    try:
                        lon = float(re.search(r'Lon:\s*([-\d.]+)', line).group(1))
                    except:
                        pass
                
                if 'Alt:' in line:
                    try:
                        alt = float(re.search(r'Alt:\s*([-\d.]+)', line).group(1))
                    except:
                        pass

        # Store GPS data if we found coordinates
        if lat is not None and lon is not None:
            gps_data.append({
                'time': _subrip_time_to_seconds(sub.start),
                'lat': lat,
                'lon': lon,
                'alt': alt
            })

    return gps_data