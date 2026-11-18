# Weekend Atlas

The trip hub shows one Montréal itinerary and the historical Chalmond archive. The Montréal plan runs from Friday night through Sunday evening, with a 6 PM departure and a late-night arrival in Boston. It assumes driving and a shared two-bed room. Nothing is booked.

`montreal.json` holds the hotel, ordered day blocks, 29 places grouped into five neighborhood clusters, four hotels, and three afternoon choices, with a waterfront walk and long caf� break as the default. `app.js` renders all days in order and supplies directions from the preceding stop. Taxis are marked explicitly. The map shows numbered stops for Saturday and Sunday, without implying that straight lines are navigable routes. `routes.js` supplies geography helpers. Every itinerary block shows its place or hotel photos directly in the plan. Each place and hotel has three distinct local images, with captions and source URLs in `images/gallery.json`.

The active guide has no trip styles, catalog filters, saved places, budget calculator, or research panels. The only trip switch is between Montréal and the archived trip. Printing includes the full itinerary.

The Chalmond pages were recovered from `e36e37ee7d04a43d9d5d1c140e84b5e5750df3ec`; their photos use URLs pinned to that commit. Their prices and schedules are historical and unverified.

Serve this directory as static files. Run checks from the repository root with `node --test trips/tests/routes.test.mjs`.
