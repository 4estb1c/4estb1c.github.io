"""Build one portable HTML trip from the original Chalmond template styles.

Run: python trips/build.py. Photos, venue data, map code, and styles are embedded.
Only map tiles, web fonts, and outbound links need an internet connection.
"""

import base64
import html
import json
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parent


def escaped(value):
    return html.escape(str(value), quote=True)


def json_script(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")


def build():
    data = json.loads((ROOT / "montreal.json").read_text(encoding="utf-8"))
    galleries = json.loads((ROOT / "images/gallery.json").read_text(encoding="utf-8"))
    places = {p["id"]: p for p in data["places"] + data.get("hotels", []) + [data["hotel"]]}
    image_data = {}
    used = set()

    def photo_strip(place_id):
        used.add(place_id)
        photos = galleries[place_id]["photos"]
        assert len(photos) == 3, place_id
        markup = []
        for index, photo in enumerate(photos):
            key = f"{place_id}-{index}"
            if key not in image_data:
                image_data[key] = {**photo, "group": place_id, "index": index,
                    "data": "data:image/jpeg;base64," + base64.b64encode((ROOT / photo["src"]).read_bytes()).decode()}
            markup.append(f'<button class="photo" data-photo="{key}" aria-label="Enlarge: {escaped(photo["alt"])}"><img data-image="{key}" alt="{escaped(photo["alt"])}" width="900" height="650"></button>')
        return '<div class="block-imgs">' + ''.join(markup) + '</div>'

    def maps_link(place):
        query = urlencode({"api": 1, "query": place.get("mapQuery", place["name"]) + ", Montréal"})
        return "https://www.google.com/maps/search/?" + query

    def links(place, origin=None, mode="walking"):
        result = f'<a href="{escaped(place["source"])}" target="_blank" rel="noopener">Website</a><a href="{escaped(maps_link(place))}" target="_blank" rel="noopener">Map</a>'
        if origin and origin["id"] != place["id"]:
            params = {"api": 1, "origin": origin.get("mapQuery", origin["name"]) + ", Montréal", "destination": place.get("mapQuery", place["name"]) + ", Montréal", "travelmode": mode}
            result = f'<a href="{escaped("https://www.google.com/maps/dir/?" + urlencode(params))}" target="_blank" rel="noopener">{"Taxi" if mode == "driving" else "Walking"} directions</a>' + result
        return '<div class="stop-links">' + result + '</div>'

    def alternative(item):
        place = places[item["id"]]
        return f'<article class="opt"><h4 class="opt-name">{escaped(place["name"])}</h4><p class="opt-desc">{escaped(item["text"])}</p>{links(place)}{photo_strip(place["id"])}</article>'

    route_data = {}
    day_html = []
    colors = {"friday": "#8b5d3b", "saturday": "#2a5d57", "sunday": "#9d4edd"}
    for day_index, day in enumerate(data["days"]):
        origin = data["hotel"]
        blocks = []
        route = []
        legend = []
        for n, block in enumerate(day["blocks"], 1):
            stops = [places[place_id] for place_id in block["stops"]]
            block_id = f'{day["id"]}-stop-{n}'
            place_markup = ''.join((f'<h4 class="photo-subtitle">{escaped(place["name"])}</h4>' if len(stops)>1 else '') + photo_strip(place["id"]) for place in stops)
            note = f'<p class="block-tip">{escaped(block["note"])}</p>' if block.get("note") else ''
            nearby = ''
            if block.get("nearby"):
                nearby = '<details class="nearby-panel"><summary>Nearby / alternatives</summary>' + ''.join(alternative(item) for item in block["nearby"]) + '</details>'
            directions = links(stops[0], origin, block.get("mode", "walking")) if stops else ''
            blocks.append(f'<article class="block" id="{block_id}"><p class="block-time">{escaped(block["time"])}</p><h3 class="block-title"><span class="num">{n:02}</span>{escaped(block["title"])}</h3><p class="block-desc">{escaped(block["text"])}</p>{note}{directions}{place_markup}{nearby}</article>')
            for place in stops:
                route.append({"n": n, "id": place["id"], "name": place["name"], "lat": place["lat"], "lng": place["lng"], "anchor": block_id, "mode": block.get("mode", "walking"), "time": block["time"]})
                legend.append(f'<li><span class="lg-n" style="background:{colors[day["id"]]}">{n}</span><a href="#{block_id}">{escaped(place["name"])}</a></li>')
            if stops:
                origin = stops[-1]
        route_data[day["id"]] = {"stops": route, "color": colors[day["id"]]}
        day_html.append(f'<section class="day" data-pane="{day["id"]}" id="{day["id"]}" aria-label="{escaped(day["label"])}"><header class="compact-day-head"><span class="compact-day-number">{day_index+1:02}</span><div><h2>{escaped(day["label"])}</h2><p>{escaped(day["date"])} · 2026</p></div></header><div class="day-map" id="day-map-{day["id"]}" aria-label="{escaped(day["label"])} route map"></div><p class="map-fallback" hidden>Map unavailable. Use the directions links below.</p><div class="schedule">{"".join(blocks)}</div></section>')

    tabs = ''.join(f'<a class="city-tab" data-day="{day["id"]}" href="#{day["id"]}">{escaped(day["label"])}<span class="nav-date"> · {escaped(day["date"])}</span></a>' for day in data["days"])
    reservation_items = ''.join(f'<li><a href="{escaped(item["url"])}" target="_blank" rel="noopener">{escaped(item["name"])}</a> · {escaped(item["when"])}. {escaped(item["status"])}</li>' for item in data['reservations'])
    reservations = f'<section class="checklist" id="reservations"><h2>Things to book</h2><ul class="booking-list">{reservation_items}</ul><p>{escaped(data["cocktails"])}</p></section>'
    practical = ''.join(f'<p><strong>{escaped(item["title"])}.</strong> {escaped(item["text"])}</p>' for item in data['practical'])
    style = (ROOT / 'vendor/leaflet.css').read_text(encoding='utf-8') + '\n' + (ROOT / 'style.css').read_text(encoding='utf-8')
    vendor = (ROOT / 'vendor/leaflet.js').read_text(encoding='utf-8').replace('//# sourceMappingURL=leaflet.js.map', '')
    style = '\n'.join(line for line in style.splitlines() if 'Chalmond' not in line)
    client = (ROOT / 'app.js').read_text(encoding='utf-8')
    license_text = (ROOT / 'vendor/leaflet-license.txt').read_text(encoding='utf-8')
    output = f'''<!DOCTYPE html>
<!-- Leaflet license: {license_text} -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Montreal itinerary · November 20–22, 2026."><title>Montreal · November 20–22</title><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>{style}</style></head><body>
<main class="page"><header class="masthead"><h1>Montreal</h1><div class="header-meta"><p>November 20–22, 2026</p><a href="#reservations">Things to book</a></div></header><div class="trip-nav"><nav class="city-tabs" aria-label="Jump to day">{tabs}</nav><button type="button" id="toggle-alternatives" aria-expanded="false">Expand all alternatives</button></div>{''.join(day_html)}{reservations}<section class="getting-around">{practical}</section></main>
<dialog class="photo-viewer" id="photo-viewer" aria-label="Enlarged venue photo"><div class="viewer-controls"><button type="button" id="photo-prev">Previous</button><span id="photo-count"></span><button type="button" id="photo-next">Next</button><button type="button" id="photo-close">Close</button></div><img id="viewer-image" alt=""><p class="viewer-caption" id="viewer-caption"></p><p class="viewer-credit" id="viewer-credit"></p></dialog>
<script type="application/json" id="photos-data">{json_script(image_data)}</script><script type="application/json" id="routes-data">{json_script({"days": route_data, "hotel": data["hotel"]})}</script><script>{vendor}</script><script id="trip-app">{client}</script><noscript>Enable JavaScript to show the embedded photos and use maps. The complete itinerary text is in this file.</noscript></body></html>'''
    (ROOT / 'index.html').write_text(output, encoding='utf-8')
    (ROOT / 'montreal').mkdir(exist_ok=True)
    (ROOT / 'montreal/index.html').write_text(output, encoding='utf-8')
    print(f'Built {ROOT / "index.html"}: {len(image_data)} embedded photos, {len(output.encode()) / 1024 / 1024:.1f} MB, three day maps.')


if __name__ == '__main__':
    build()
