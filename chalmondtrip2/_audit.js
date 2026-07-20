#!/usr/bin/env node
/* Audit referenced venues: place_id present? images present? coords present? */
const fs = require('fs');
const TRIP_DATA = require('./data.js');
const html = fs.readFileSync('./itinerary.html', 'utf8');
const _all = {};
for (const c of Object.values(TRIP_DATA.cities))
  for (const items of Object.values(c.categories))
    for (const it of items) _all[it.id] = it;

function ids(name){const s=html.indexOf(`const ${name} = {`);const b=html.slice(s,html.indexOf('};',s));const set=new Set();let m;const re=/:\s*'([a-z]+-[a-z0-9]+)'/g;while((m=re.exec(b)))set.add(m[1]);return set;}
const used=new Set([...ids('TITLE_MAP'),...ids('OPT_MAP')]);

const rows=[];
for(const id of used){const it=_all[id];if(!it)continue;
  rows.push({id,name:it.name,pid:!!it.place_id,img:!!(it.images&&it.images.length),coord:!!(it.lat&&it.lng)});
}
rows.sort((a,b)=>a.id.localeCompare(b.id));
const noPid=rows.filter(r=>!r.pid);
const noImg=rows.filter(r=>!r.img);
console.log(`Referenced venues: ${rows.length}`);
console.log(`\n=== NO place_id (${noPid.length}) — map link relies on coords, may be off ===`);
noPid.forEach(r=>console.log(`  ${r.id.padEnd(10)} img:${r.img?'Y':'N'} ${r.name}`));
console.log(`\n=== NO images (${noImg.length}) ===`);
noImg.forEach(r=>console.log(`  ${r.id.padEnd(10)} pid:${r.pid?'Y':'N'} ${r.name}`));
