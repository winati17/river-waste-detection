import os
import time
from typing import List, Dict, Set, Optional
from supabase import create_client


def _get_client():
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def health_check() -> bool:
    sb = _get_client()
    if not sb:
        return False
    try:
        # lightweight probe
        resp = sb.table("detections").select("confidence").limit(1).execute()
        # supabase client returns an object with .data on success
        return getattr(resp, 'data', None) is not None
    except Exception:
        return False


def safe_insert_records(records: List[Dict], max_retries: int = 3) -> bool:
    sb = _get_client()
    if not sb:
        raise RuntimeError("Supabase not configured")

    attempt = 0
    while attempt < max_retries:
        try:
            sb.table("detections").insert(records).execute()
            return True
        except Exception as e:
            attempt += 1
            backoff = 2 ** attempt
            time.sleep(backoff)
    # final attempt
    sb.table("detections").insert(records).execute()
    return True


def get_existing_image_urls() -> Set[str]:
    sb = _get_client()
    if not sb:
        return set()
    try:
        resp = sb.table("detections").select("image_url").execute()
        data = getattr(resp, 'data', resp)
        return {row.get("image_url") for row in (data or [])}
    except Exception:
        return set()
