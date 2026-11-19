# Montréal weekend

The Montréal itinerary reuses the original Chalmond trip’s typography, timeline, day tabs, numbered maps, and photo strips. Le Mount Stephen is the selected base. Saturday groups the northern shops into one outing, with skating at Atrium Le 1000 afterward. Sunday stays in Old Montréal until the 3:45 PM luggage pickup, with a 4 PM hotel departure and 5 PM YUL arrival target. Live Google Flights listings checked November 18 show Sunday November 22 nonstops at 8 PM: AC736 to LGA, arriving 9:30 PM, and AC8612 to BOS, arriving 9:28 PM. Milo’s constraint is landing in New York by 10 PM; Forrest can get home to Boston later. Nothing is booked.

`index.html` is a portable artifact with the itinerary, photos, Leaflet, and styles embedded. Open it directly in a browser. The basemap uses Esri’s public World Street Map service, which supports local HTML without a Referer header. Internet is needed for map tiles, optional web fonts, and outbound booking/directions links. No local server or ChatGPT hosting is required.

Edit `montreal.json`, `app.js`, or `style.css`, then run `python trips/build.py` from the repository root to regenerate the HTML. Photo files and their sources live in `images/`; Leaflet’s bundled license is retained in `vendor/leaflet.js`. Route helpers remain in `routes.js`. Run the geography and asset checks with `node --test trips/tests/routes.test.mjs`.

The original historical Chalmond pages remain in `chalmondtrip/`. Their prices and schedules are not current.

A reservation checklist records the party size, target times, booking links, and availability actually observed on November 18. Monarque’s 7 PM brasserie remains a cancellation request, not a confirmed table; Ratafia 7:45 PM and Monarque’s 9:30 PM formal room were displayed alternatives. Cocktail bars are walk-in. Nearby panels offer optional detours without changing the daily route. A collapsible Le Germain comparison retains Le Mount Stephen as the selected hotel.
