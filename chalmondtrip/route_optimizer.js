#!/usr/bin/env node
/**
 * Seoul Itinerary Route Optimizer
 *
 * 1. Loads every venue from data.js (Seoul categories, items with lat/lng).
 * 2. Runs K-means++ (K=9) with 30 restarts to find the best geographic clusters.
 * 3. Within each cluster, orders stops with a nearest-neighbour TSP.
 * 4. Prints clusters (west→east) with TSP order and total walking distance.
 *
 * Usage: node route_optimizer.js
 */

const TRIP_DATA = require('./data.js');

// ── 1. Extract all Seoul venues with coordinates ──────────────────────────────

const venues = [];
for (const [cat, items] of Object.entries(TRIP_DATA.cities.seoul.categories)) {
  for (const item of items) {
    if (item.lat && item.lng) {
      venues.push({ id: item.id, name: item.name, lat: item.lat, lng: item.lng, cat });
    }
  }
}
console.log(`Loaded ${venues.length} Seoul venues\n`);

// ── 2. Distance (km, Euclidean approx — fine for Seoul's ~50 km span) ─────────

const KM_PER_LAT = 111.0;
const KM_PER_LNG = 88.8; // 111 × cos(37.5°)

function dist(a, b) {
  const dlat = (a.lat - b.lat) * KM_PER_LAT;
  const dlng = (a.lng - b.lng) * KM_PER_LNG;
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

// ── 3. K-means++ (best of 30 random restarts) ─────────────────────────────────

function kmeans(venues, K, maxIter = 500, numRuns = 30) {
  let best = null;

  for (let run = 0; run < numRuns; run++) {
    // K-means++ seeding: first centre random, subsequent weighted by distance²
    const cents = [venues[Math.floor(Math.random() * venues.length)]];
    while (cents.length < K) {
      const dSq = venues.map(v => Math.min(...cents.map(c => dist(v, c) ** 2)));
      const total = dSq.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < venues.length; i++) {
        r -= dSq[i];
        if (r <= 0) { cents.push(venues[i]); break; }
      }
      if (cents.length < K) cents.push(venues[venues.length - 1]); // guard
    }

    let assign = venues.map(() => 0);
    for (let iter = 0; iter < maxIter; iter++) {
      const prev = [...assign];

      // Assignment step
      assign = venues.map(v => {
        let minD = Infinity, k = 0;
        cents.forEach((c, i) => { const d = dist(v, c); if (d < minD) { minD = d; k = i; } });
        return k;
      });

      if (assign.every((a, i) => a === prev[i])) break; // converged

      // Update step
      for (let k = 0; k < K; k++) {
        const pts = venues.filter((_, i) => assign[i] === k);
        if (!pts.length) continue;
        cents[k] = {
          lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
          lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length
        };
      }
    }

    const inertia = venues.reduce((s, v, i) => s + dist(v, cents[assign[i]]) ** 2, 0);
    if (!best || inertia < best.inertia) {
      best = { assign: [...assign], cents: cents.map(c => ({ ...c })), inertia };
    }
  }
  return best;
}

// ── 4. Run clustering ─────────────────────────────────────────────────────────

const K = 9;   // 9 geographic day-clusters for Seoul
const { assign, cents } = kmeans(venues, K);

// Group venues by cluster
const clusters = {};
venues.forEach((v, i) => {
  const k = assign[i];
  if (!clusters[k]) clusters[k] = { venues: [], lat: cents[k].lat, lng: cents[k].lng };
  clusters[k].venues.push(v);
});

// Sort clusters west → east (by centroid longitude)
const sorted = Object.values(clusters).sort((a, b) => a.lng - b.lng);

// ── 5. Area label from centroid ───────────────────────────────────────────────

function label(lat, lng) {
  if (lat > 37.580)                         return 'NORTH  — Gyeongbokgung / Bukchon / Insadong / Jongno';
  if (lng < 126.925)                        return 'WEST   — Yeouido / IFC Mall / Han River west';
  if (lng < 126.950 && lat < 37.560)       return 'MAPO   — Mangwon / Mapo / riverside';
  if (lng < 126.960 && lat >= 37.550)      return 'NW     — Hongdae / Sinchon / Ewha';
  if (lng < 126.980 && lat < 37.545)       return 'CENTER — Yongsan / Itaewon / Hannam';
  if (lat > 37.558 && lng > 126.975 && lng < 127.010) return 'CITY   — Myeongdong / Euljiro / Jung-gu';
  if (lng > 127.045 && lat < 127.075 && lat < 37.530) return 'SE     — COEX / Gangnam / Jamsil';
  if (lng > 127.030 && lat > 37.540)       return 'EAST   — Seongsu / Gwangjang / Dongdaemun / Achasan';
  return 'SOUTH  — Gangnam / Garosu-gil / Sinsa / Apgujeong';
}

// ── 6. Nearest-neighbour TSP for intra-cluster ordering ──────────────────────

function tsp(vs) {
  if (vs.length <= 1) return vs;
  const rem = [...vs];
  // Start from the westernmost (makes geographic sense: arrive from hotel in Hongdae)
  rem.sort((a, b) => a.lng - b.lng);
  const tour = [rem.shift()];
  while (rem.length) {
    const last = tour.at(-1);
    let ni = 0, minD = Infinity;
    rem.forEach((v, i) => { const d = dist(last, v); if (d < minD) { minD = d; ni = i; } });
    tour.push(rem.splice(ni, 1)[0]);
  }
  return tour;
}

// ── 7. Print report ───────────────────────────────────────────────────────────

const LINE = '─'.repeat(72);

console.log('═'.repeat(72));
console.log('  SEOUL ROUTE OPTIMIZER  ·  K-means++ (K=' + K + ')  ·  Nearest-neighbour TSP');
console.log('═'.repeat(72) + '\n');

sorted.forEach((cluster, idx) => {
  const areaLabel = label(cluster.lat, cluster.lng);
  const ordered = tsp(cluster.venues);
  const walkKm = ordered.reduce((s, v, i) => i === 0 ? 0 : s + dist(ordered[i - 1], v), 0);

  console.log(`┌ CLUSTER ${idx + 1}  ${areaLabel}`);
  console.log(`│  Centroid ${cluster.lat.toFixed(4)}°N  ${cluster.lng.toFixed(4)}°E  ·  ${cluster.venues.length} venues  ·  ~${walkKm.toFixed(1)} km total walk`);
  console.log('│  Optimal stop order:');
  ordered.forEach((v, i) => {
    const arrow = i < ordered.length - 1 ? `  → ${dist(v, ordered[i + 1]).toFixed(2)} km` : '';
    console.log(`│    ${String(i + 1).padStart(2)}. [${v.cat.padEnd(10)}]  ${v.name}${arrow}`);
  });
  console.log('└' + LINE + '\n');
});

// ── 8. Cross-reference with current day assignments ───────────────────────────

console.log('═'.repeat(72));
console.log('  CURRENT DAY MAPPING vs GEOGRAPHIC CLUSTERS');
console.log('═'.repeat(72) + '\n');

// Manual day assignments from the itinerary (approximate)
const dayAssignments = {
  'Day 5  (arrive, Hongdae)':          { lat: 37.557, lng: 126.924 },
  'Day 6  (spa, Namsan, Itaewon)':     { lat: 37.534, lng: 126.991 },
  'Day 7  (Sinchon, Hongdae, Mangwon)':{ lat: 37.556, lng: 126.935 },
  'Day 8  (Seongsu, Dongdaemun)':      { lat: 37.545, lng: 127.055 },
  'Day 9  (Gyeongbokgung, Insadong)':  { lat: 37.580, lng: 126.985 },
  'Day 10 (Gapyeong day trip)':        { lat: 37.800, lng: 127.500 },
  'Day 11 (Achasan, Casino east)':     { lat: 37.552, lng: 127.095 },
  'Day 12 (Hannam, Garosu-gil, COEX)': { lat: 37.522, lng: 127.035 },
  'Day 13 (Mangwon→Yeouido→Itaewon)': { lat: 37.537, lng: 126.965 },
  'Day 14 (Myeongdong, Itaewon night)':{ lat: 37.560, lng: 126.983 },
  'Day 15 (last, Yeouido, Hongdae)':   { lat: 37.545, lng: 126.930 },
};

for (const [day, center] of Object.entries(dayAssignments)) {
  // Find which cluster this day's center falls into
  let minD = Infinity, clusterIdx = 0;
  sorted.forEach((c, i) => {
    const d = dist(center, c);
    if (d < minD) { minD = d; clusterIdx = i; }
  });
  const cl = sorted[clusterIdx];
  const areaLabel = label(cl.lat, cl.lng);
  console.log(`  ${day}`);
  console.log(`      → nearest cluster: ${clusterIdx + 1} (${areaLabel})`);
  console.log(`      → mismatch km from cluster centre: ${minD.toFixed(2)} km`);
  console.log();
}
