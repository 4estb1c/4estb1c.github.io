#!/usr/bin/env node
/* Cross-check: for each DAY_ROUTES stop, match its name to a data venue via the
   same keyword maps the page uses, then flag coordinate drift > 0.4 km. */
const fs = require('fs');
const TRIP = require('./data.js');
const html = fs.readFileSync('./itinerary.html', 'utf8');
const _all = {};
for (const c of Object.values(TRIP.cities))
  for (const items of Object.values(c.categories))
    for (const it of items) _all[it.id] = it;

function parseMap(name){const s=html.indexOf(`const ${name} = {`);const b=html.slice(s,html.indexOf('};',s));const m={};let x;const re=/'((?:[^'\\]|\\.)*)'\s*:\s*(?:'([^']*)'|null)/g;while((x=re.exec(b)))m[x[1].replace(/\\'/g,"'")]=x[2]||null;const re2=/"([^"]*)"\s*:\s*'([^']*)'/g;while((x=re2.exec(b)))m[x[1]]=x[2];return m;}
const TITLE=parseMap('TITLE_MAP'), OPT=parseMap('OPT_MAP');
function match(name){const r=name.toLowerCase();for(const[k,id]of Object.entries(TITLE))if(id&&r.includes(k))return id;for(const[k,id]of Object.entries(OPT))if(id&&r.includes(k))return id;return null;}

// parse DAY_ROUTES
const s = html.indexOf('const DAY_ROUTES = {');
const body = html.slice(s, html.indexOf('\n};', s));
const dayRe = /(\d+):\s*\{[^]*?stops:\s*\[([^]*?)\]\s*\}/g;
const stopRe = /name:'([^']*)',\s*lat:([\d.]+),\s*lng:([\d.]+)/g;
const KM_LAT=111.0, KM_LNG=88.8;
let m, flags=0, checked=0;
console.log('=== Map stop vs data-venue coordinate check (Seoul days 5–15) ===');
while ((m = dayRe.exec(body))) {
  const day = +m[1]; if (day < 5) continue;
  let sm;
  while ((sm = stopRe.exec(m[2]))) {
    const [_, nm, lat, lng] = sm;
    const id = match(nm);
    if (!id || !_all[id] || !_all[id].lat) continue;
    const v = _all[id];
    const d = Math.hypot((+lat - v.lat)*KM_LAT, (+lng - v.lng)*KM_LNG);
    checked++;
    if (d > 0.4) { console.log(`  D${day} "${nm}" → ${id} (${v.name}): ${d.toFixed(2)} km off`); flags++; }
  }
}
console.log(flags ? `\n${flags} stop(s) drift >0.4km (of ${checked} matched).` : `\nAll ${checked} matched stops within 0.4km of their data venue. ✓`);
