# Trip pages

Standalone published pages:

- Montréal: `/trips/montreal/`
- Korea / Chalmond archive: `/trips/korea/`

The pages do not link to one another. Montréal uses one continuous itinerary, sticky day jump links, an expand-all alternatives button, maps, a numbered itinerary, three photos per place, and a booking list. Alt Hotel Montréal is booked. Other reservations remain pending.

Edit `montreal.json`, `app.js`, or `style.css`, then run `python trips/build.py` from the repository root. The builder writes both `index.html` and `montreal/index.html`. The HTML embeds photos, Leaflet, and styles; internet is needed for map tiles and external links. Run `node --test trips/tests/routes.test.mjs` for route and asset checks.

Korea is copied from the original archive into `korea/`; `index.html` is its itinerary landing page. Its historical schedule is retained.
