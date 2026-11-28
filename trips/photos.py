"""Fetch three openly licensed photos per place from Wikimedia Commons.

Run: python trips/photos.py <slug> [place_id ...]
Reads `<slug>.json`, writes `images/galleries/<id>/1-3.jpg`, and records alt
text, credit, and license in `<slug>.photos.json`. Places already in that file
are skipped unless named. A place may set "photoQuery" (search text),
"photoFiles" (exact Commons file titles), or "photoExclude" (title fragments
to reject) to steer the choice.
"""

import html
import json
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent
API = "https://commons.wikimedia.org/w/api.php"
AGENT = {"User-Agent": "trip-page-builder/1.0 (static itinerary pages)"}
HISTORIC = re.compile(r"\b1[89]\d\d\b(?!\s*-\s*20)")
SKIP = re.compile(r"\b(map|logo|plan|coat of arms|diagram|flag|sign|menu|ticket|stamp|poster|drawing|engraving|painting by)\b", re.I)


def get(url):
    """GET with backoff, since Commons answers bursts with HTTP 429."""
    for attempt in range(8):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=AGENT), timeout=60) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code not in (429, 503) or attempt == 7:
                raise
            time.sleep(int(error.headers.get("Retry-After") or 0) or 2 ** attempt)
        except (urllib.error.URLError, TimeoutError):
            if attempt == 7:
                raise
            time.sleep(2 ** attempt)


def api(**params):
    params.update(format="json", formatversion=2)
    return json.loads(get(API + "?" + urllib.parse.urlencode(params)))


def plain(value, limit=140):
    text = html.unescape(re.sub(r"<[^>]+>", "", value or "")).strip()
    text = re.sub(r"\s+", " ", text)
    return text if len(text) <= limit else text[:limit].rsplit(" ", 1)[0] + "…"


def candidates(place, city):
    if place.get("photoFiles"):
        return place["photoFiles"]
    query = place.get("photoQuery") or f'{place.get("mapQuery", place["name"])} {city}'
    hits = api(action="query", list="search", srnamespace=6, srlimit=20, srsearch=query + " filetype:bitmap")
    return [hit["title"] for hit in hits["query"]["search"] if not SKIP.search(hit["title"])]


def fetch(place, city):
    titles = candidates(place, city)
    if not titles:
        return place["id"], None
    # 960 px is one of Commons' standard thumbnail widths, which it serves from cache.
    info = api(action="query", prop="imageinfo", titles="|".join(titles[:20]), iiprop="url|size|extmetadata", iiurlwidth=960)
    pages = {page["title"]: page for page in info["query"]["pages"] if "imageinfo" in page}
    chosen = []
    for title in titles:
        page = pages.get(title) or pages.get(title.replace("_", " "))
        if not page:
            continue
        image = page["imageinfo"][0]
        if any(bad.lower() in title.lower() for bad in place.get("photoExclude", [])):
            continue
        # Skip small images, panoramas that crop badly in the 3-photo row, and 19th-century archives.
        ratio = image["width"] / image["height"]
        if not place.get("photoFiles") and (image["width"] < 900 or image["height"] < 550 or not 0.6 <= ratio <= 2.0 or HISTORIC.search(title)):
            continue
        chosen.append((title, image))
        if len(chosen) == 3:
            break
    if len(chosen) < 3:
        return place["id"], None
    folder = ROOT / "images/galleries" / place["id"]
    folder.mkdir(parents=True, exist_ok=True)
    photos = []
    for index, (title, image) in enumerate(chosen, 1):
        (folder / f"{index}.jpg").write_bytes(get(image["thumburl"]))
        meta = image.get("extmetadata", {})
        description = plain(meta.get("ImageDescription", {}).get("value")) or plain(meta.get("ObjectName", {}).get("value"))
        artist = plain(meta.get("Artist", {}).get("value"), 80)
        license_name = plain(meta.get("LicenseShortName", {}).get("value"), 40)
        photos.append({
            "src": f"images/galleries/{place['id']}/{index}.jpg",
            "alt": description or place["name"],
            "source": image["descriptionurl"],
            "image_source": image["url"],
            "credit": " · ".join(part for part in (artist, license_name) if part),
        })
    return place["id"], {"photos": photos}


def main(slug, only):
    data = json.loads((ROOT / f"{slug}.json").read_text(encoding="utf-8"))
    out_path = ROOT / f"{slug}.photos.json"
    gallery = json.loads(out_path.read_text(encoding="utf-8")) if out_path.exists() else {}
    places = data["places"] + data.get("hotels", []) + ([data["hotel"]] if data.get("hotel") else [])
    todo = [p for p in places if (p["id"] in only) or (not only and p["id"] not in gallery)]
    city = data.get("mapCity", "")
    lock = threading.Lock()

    def run(place):
        try:
            place_id, entry = fetch(place, place.get("city", city))
        except Exception as error:  # Report and move on; a rerun retries it.
            place_id, entry = place["id"], None
            print(f"FAILED  {place_id}: {error}", flush=True)
        with lock:  # Save after each place so a failure keeps earlier work.
            if entry:
                gallery[place_id] = entry
                out_path.write_text(json.dumps(gallery, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(("ok      " if entry else "MISSING ") + place_id, flush=True)

    with ThreadPoolExecutor(2) as pool:
        list(pool.map(run, todo))


if __name__ == "__main__":
    main(sys.argv[1], set(sys.argv[2:]))
