# Weekend Atlas

The trip hub opens the Montréal weekend and preserves Chalmond's itinerary, option browser, and map in an archive tab. The archive is recovered from `e36e37ee7d04a43d9d5d1c140e84b5e5750df3ec`; its images use URLs pinned to that commit. Archived recommendations are historical and unverified.

The new planner is buildless. Serve this directory as static files. `montreal.json` supplies proposals, days, places, neighborhoods, hotels, and research links. `app.js` renders those records; `routes.js` owns the geography calculations. Photos and source attribution live in `images/`.

To add a trip, create another record with this schema and register it in the trip switcher. The renderer accepts the record independently of Montréal's coordinates. The historical archive stays separate because its hand-written itinerary has a different schema. This is intentionally a small extension, not a migration of all historical content.

The former offline optimizer was Seoul-specific, used a fixed longitude scale, randomized geographic clusters, and called a nearest-neighbor tour optimal. That code and its one-off editing scripts are not restored into the active planner. `TripRoute` uses great-circle distance at the actual latitude and deterministic nearest-neighbor ordering with 2-opt improvement for untimed browsing. First and last stops stay fixed. Scheduled itinerary order is never optimized. Map lines are explicitly straight-line guides; real street directions open in Google Maps in overlapping segments of at most five stops. No local street graph or pedestrian routing service is claimed.

Venue pins are approximate. Verified OpenStreetMap name/address matches are recorded beside venue coordinates. Some area/activity pins are manually placed. Before navigating, use the named-place search to verify the entrance. The archived map retains its original behavior.

Research was checked on November 18, 2026. Hotel and meal ranges are planning allowances, not date-specific availability or booking quotes. The budget calculator splits two nights and two parking days between two travelers and applies adjustable buffers. No bookings are made. The guide assumes a car and a shared two-bed room.

Run geography and data checks with:

```powershell
node --test trips/tests/routes.test.mjs
```

Trip photos are reference images from the operator and tourism sources in `images/credits.json`; they can show another season or room category. Cards label neighborhood reference photos. Saved places remain in this browser's local storage. Print includes all three days of the chosen proposal.
