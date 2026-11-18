# Montréal weekend

The Montréal itinerary reuses the original Chalmond trip’s typography, timeline, day tabs, numbered maps, and photo strips. Le Mount Stephen is the selected base. Saturday groups the northern shops into one outing, with skating at Atrium Le 1000 afterward. Sunday stays in Old Montréal until the 3:45 PM luggage pickup, with a 4 PM hotel departure and 5 PM YUL arrival target. Live Google Flights listings checked November 18 show Sunday November 22 nonstops at 8 PM: AC736 to LGA, arriving 9:30 PM, and AC8612 to BOS, arriving 9:28 PM. Milo’s constraint is landing in New York by 10 PM; Forrest can get home to Boston later. Nothing is booked.

`index.html` is a portable artifact with the itinerary, photos, Leaflet, and styles embedded. Open it directly in a browser. Internet is needed for map tiles, optional web fonts, and outbound booking/directions links. No local server or ChatGPT hosting is required.

Edit `montreal.json`, `app.js`, or `style.css`, then run `python trips/build.py` from the repository root to regenerate the HTML. Photo files and their sources live in `images/`; Leaflet’s bundled license is retained in `vendor/leaflet.js`. Route helpers remain in `routes.js`. Run the geography and asset checks with `node --test trips/tests/routes.test.mjs`.

The original historical Chalmond pages remain in `chalmondtrip/`. Their prices and schedules are not current.
