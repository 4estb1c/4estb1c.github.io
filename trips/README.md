# Weekend Atlas

The trip hub shows one Montréal itinerary and the historical Chalmond archive. The Montréal plan runs from Friday night through Sunday afternoon, with an early departure for Boston. It assumes driving and a shared two-bed room. Nothing is booked.

`montreal.json` holds the hotel, ordered day blocks, selected places, and a few nearby stops. `app.js` renders all days in order and supplies directions from the preceding stop. Taxis are marked explicitly. The map shows numbered stops for Saturday and Sunday, without implying that straight lines are navigable routes. `routes.js` supplies geography helpers. Photos and their sources live in `images/`.

The active guide has no trip styles, catalog filters, saved places, budget calculator, or research panels. The only trip switch is between Montréal and the archived trip. Printing includes the full itinerary.

The Chalmond pages were recovered from `e36e37ee7d04a43d9d5d1c140e84b5e5750df3ec`; their photos use URLs pinned to that commit. Their prices and schedules are historical and unverified.

Serve this directory as static files. Run checks from the repository root with `node --test trips/tests/routes.test.mjs`.
