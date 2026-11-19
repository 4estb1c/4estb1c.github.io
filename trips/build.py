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
        return '<div class="block-imgs">' + ''.join(markup) + '</div><p class="photo-caption">Three real photos. Select a photo to enlarge it and see its caption and source.</p>'

    def maps_link(place):
        query = urlencode({"api": 1, "query": place.get("mapQuery", place["name"]) + ", Montréal"})
        return "https://www.google.com/maps/search/?" + query

    def links(place, origin=None, mode="walking"):
        result = f'<a href="{escaped(place["source"])}" target="_blank" rel="noopener">Details & booking</a><a href="{escaped(maps_link(place))}" target="_blank" rel="noopener">Google Maps</a>'
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
                nearby = '<details class="nearby-panel"><summary>Also worth knowing nearby / alternatives</summary>' + ''.join(alternative(item) for item in block["nearby"]) + '</details>'
            directions = links(stops[0], origin, block.get("mode", "walking")) if stops else '<div class="stop-links"><a href="https://www.admtl.com/en-CA/guide/leaving-montreal" target="_blank" rel="noopener">YUL departure guide · if using YUL</a></div>'
            star = '<p class="star-label">★ A highlight of the day</p>' if block.get('star') else ''
            blocks.append(f'<article class="block highlight" id="{block_id}">{star}<p class="block-time">{escaped(block["time"])}</p><h3 class="block-title"><span class="num">{n:02}</span>{escaped(block["title"])}</h3><p class="block-desc">{escaped(block["text"])}</p>{note}{directions}{place_markup}{nearby}</article>')
            for place in stops:
                route.append({"n": n, "id": place["id"], "name": place["name"], "lat": place["lat"], "lng": place["lng"], "anchor": block_id, "mode": block.get("mode", "walking"), "time": block["time"]})
                legend.append(f'<li><span class="lg-n" style="background:{colors[day["id"]]}">{n}</span><a href="#{block_id}">{escaped(place["name"])}</a></li>')
            if stops:
                origin = stops[-1]
        route_data[day["id"]] = {"stops": route, "color": colors[day["id"]]}
        day_html.append(f'<section class="tab-pane day{ " active" if day_index == 0 else ""}" data-pane="{day["id"]}" id="{day["id"]}"><header class="day-head"><div><p class="day-date">{escaped(day["label"])} · {escaped(day["date"])}</p><span class="day-city-tag">Montréal</span><span class="day-num">{day_index+1:02}</span></div><div><h2 class="day-title">{escaped(day["title"])}</h2><p class="day-tagline">{escaped(day["summary"])}</p></div></header><div class="day-map" id="day-map-{day["id"]}" aria-label="{escaped(day["label"])} route map"></div><p class="map-fallback" hidden>The map is unavailable. The directions links below still open the route.</p><div class="day-legend"><ol class="legend-list">{"".join(legend)}</ol></div><p class="home-note"><strong>Base: Le Mount Stephen.</strong> Numbered pins match the timeline. Dashed lines show stop order, not street routes. Use each stop’s directions for navigation.</p><div class="schedule">{"".join(blocks)}</div></section>')

    for index, day in enumerate(data['days']):
        anchors = data.get('anchors', {}).get(day['id'], [])
        if anchors:
            highlight_links = []
            for anchor in anchors:
                n = next(n for n, block in enumerate(day['blocks'], 1) if anchor['id'] in block['stops'])
                highlight_links.append(f'<a href="#{day["id"]}-stop-{n}">★ {escaped(anchor["label"])}</a>')
            day_html[index] = day_html[index].replace('<div class="day-map"', '<div class="day-highlights">'+''.join(highlight_links)+'</div><div class="day-map"', 1)
    skating_anchor = next(stop['anchor'] for day in route_data.values() for stop in day['stops'] if stop['id']=='atrium')
    tabs = ''.join(f'<button type="button" class="city-tab{ " active" if i == 0 else ""}" data-day="{day["id"]}" aria-pressed="{str(i == 0).lower()}">{escaped(day["label"])}</button>' for i, day in enumerate(data["days"]))
    reservation_rows = ''.join(f'<tr><th scope="row"><a href="{escaped(item["url"])}" target="_blank" rel="noopener">{escaped(item["name"])}</a></th><td>{escaped(item["when"])}</td><td>{escaped(item["status"])}</td></tr>' for item in data['reservations'])
    dinner_options = ''.join(f'<article class="opt"><h3>{escaped(places[item["id"]]["name"])}</h3><p>{escaped(item["text"])}</p><p><a href="{escaped(item["booking"])}" target="_blank" rel="noopener">Reservation calendar</a></p>{photo_strip(item["id"])}</article>' for item in data['dinner_options'])
    reservations = f'<section class="checklist" id="reservations"><h2>What to reserve.</h2><p>For two people. Availability checked November 18, 2026; tables can change. Nothing is booked.</p><div class="reservation-scroll"><table class="reservation-table"><thead><tr><th>Book</th><th>When</th><th>Live check / action</th></tr></thead><tbody>{reservation_rows}</tbody></table></div><p><strong>Cocktails.</strong> {escaped(data["cocktails"])}</p><details class="nearby-panel dinner-shortlist"><summary>Dinner shortlist · choose one</summary>{dinner_options}</details></section>'
    hotel_comparison = f'<details class="nearby-panel hotel-comparison"><summary>Compare with Le Germain Montréal</summary><p>{escaped(data["hotel_comparison"])}</p><p><a href="https://www.germainhotels.com/en/le-germain-hotel/montreal/rooms/the-signature" target="_blank" rel="noopener">Le Germain Signature room · details and booking</a></p>{photo_strip("germain")}</details>'
    practical = ''.join(f'<p><strong>{escaped(item["title"])}.</strong> {escaped(item["text"])}' + (f' <a href="{escaped(item["source"])}" target="_blank" rel="noopener">Live check</a>' if item.get("source") else '') + '</p>' for item in data['practical'])
    credits = ''.join('<li><strong>' + escaped(places[place_id]["name"]) + '</strong>: ' + ', '.join(f'<a href="{escaped(photo["source"])}" target="_blank" rel="noopener">Photo {i+1}{" · "+escaped(photo["credit"]) if photo.get("credit") else ""}</a>' for i, photo in enumerate(galleries[place_id]["photos"])) + '</li>' for place_id in sorted(used))
    style = (ROOT / 'vendor/leaflet.css').read_text(encoding='utf-8') + '\n' + (ROOT / 'style.css').read_text(encoding='utf-8')
    vendor = (ROOT / 'vendor/leaflet.js').read_text(encoding='utf-8').replace('//# sourceMappingURL=leaflet.js.map', '')
    client = (ROOT / 'app.js').read_text(encoding='utf-8')
    license_text = (ROOT / 'vendor/leaflet-license.txt').read_text(encoding='utf-8')
    output = f'''<!DOCTYPE html>
<!-- Leaflet license: {license_text} -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Forrest and Milo’s Montréal weekend, in the original Chalmond trip format."><title>Montréal · Forrest & Milo · November 20–22</title><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>{style}</style></head><body>
<main class="page"><nav class="trip-links"><a href="#friday">Days & maps</a><a href="#reservations">What to reserve</a><a href="#before-you-go">Before you go</a><a href="#{skating_anchor}">Saturday skating</a></nav><header class="masthead"><p class="eyebrow">Montréal weekend · November 20–22, 2026</p><h1>Forrest<br>&amp; <em>Milo.</em></h1><p class="byline">Two nights · Good food, beautiful shops, and time to talk.</p><p class="intro">{escaped(data["intro"])}</p></header><aside class="lodging-banner"><h4>Your chosen hotel</h4><div class="lodging-row"><span class="city-label">Le Mount<br>Stephen</span><span>Deluxe Two Queen Room · Friday → Sunday<br><a href="{escaped(data["hotel"]["source"])}" target="_blank" rel="noopener">Room details & booking</a></span></div><p class="hotel-info">Two real queen beds. Hotel selection only; nothing is booked. Fly in, use taxis between neighborhoods, and leave your bags with reception after checkout. Plan Friday arrival around midnight. Sunday: leave the hotel at 4 PM for 8 PM nonstops, landing New York at 9:30 PM and Boston at 9:28 PM.</p><div class="hotel-photos">{photo_strip("mountstephen")}</div>{hotel_comparison}</aside><nav class="city-tabs" aria-label="Choose a day">{tabs}</nav>{''.join(day_html)}{reservations}<section class="checklist" id="before-you-go"><h2>Before you go.</h2>{practical}<p class="fineprint">All times Eastern. Menu items, inventory, and photos illustrate the places, not guaranteed current offerings. Photos span seasons; skating photos show past winter seasons. Boat cruises are omitted: the operator’s regular 2026 sightseeing schedule ends before this weekend. <a href="https://www.croisieresaml.com/en/our-cruises/montreal" target="_blank" rel="noopener">Cruise calendar</a>.</p><details class="photo-credits"><summary>Photo credits & sources</summary><ul>{credits}</ul></details></section><footer class="footer"><span>Montréal · November 20–22 · Forrest &amp; Milo</span><button type="button" id="print">Print / save PDF</button></footer></main>
<dialog class="photo-viewer" id="photo-viewer" aria-label="Enlarged venue photo"><div class="viewer-controls"><button type="button" id="photo-prev">Previous</button><span id="photo-count"></span><button type="button" id="photo-next">Next</button><button type="button" id="photo-close">Close</button></div><img id="viewer-image" alt=""><p class="viewer-caption" id="viewer-caption"></p><p class="viewer-credit" id="viewer-credit"></p></dialog>
<script type="application/json" id="photos-data">{json_script(image_data)}</script><script type="application/json" id="routes-data">{json_script({"days": route_data, "hotel": data["hotel"]})}</script><script>{vendor}</script><script id="trip-app">{client}</script><noscript>Enable JavaScript to show the embedded photos, choose days, and use maps. The complete itinerary text is in this file.</noscript></body></html>'''
    (ROOT / 'index.html').write_text(output, encoding='utf-8')
    print(f'Built {ROOT / "index.html"}: {len(image_data)} embedded photos, {len(output.encode()) / 1024 / 1024:.1f} MB, three day maps.')


if __name__ == '__main__':
    build()
