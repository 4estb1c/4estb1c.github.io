# Montréal weekend

The Montréal itinerary reuses the original Chalmond trip’s typography, timeline, day tabs, numbered maps, and photo strips. Le Mount Stephen is the selected base. Nothing is booked.

`index.html` is a portable artifact with the itinerary, photos, Leaflet, and styles embedded. Open it directly in a browser. Internet is needed for map tiles, optional web fonts, and outbound booking/directions links. No local server or ChatGPT hosting is required.

Edit `montreal.json`, `app.js`, or `style.css`, then run `python trips/build.py` from the repository root to regenerate the HTML. Photo files and their sources live in `images/`; Leaflet’s bundled license is retained in `vendor/leaflet.js`. Route helpers remain in `routes.js`. Run the geography and asset checks with `node --test trips/tests/routes.test.mjs`.

The original historical Chalmond pages remain in `chalmondtrip/`. Their prices and schedules are not current.
