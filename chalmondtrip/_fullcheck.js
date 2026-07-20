#!/usr/bin/env node
// Whole-site error sweep: tag balance, encoding, refs, images, dates, links.
const fs = require('fs');
const path = require('path');
const TRIP = require('./data.js');
const html = fs.readFileSync('itinerary.html', 'utf8');
const problems = [];
const warn = [];

// ---- 1. HTML tag balance (div) ----
const opens = (html.match(/<div\b/g) || []).length;
const closes = (html.match(/<\/div>/g) || []).length;
if (opens !== closes) problems.push(`<div> imbalance: ${opens} open vs ${closes} close`);

// ---- 2. Other structural tags balance ----
for (const tag of ['html','head','body','style','script','section']) {
  const o = (html.match(new RegExp(`<${tag}\\b`, 'g')) || []).length;
  const c = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
  if (o !== c) problems.push(`<${tag}> imbalance: ${o} vs ${c}`);
}

// ---- 3. Mojibake / encoding garbage ----
const mojibake = html.match(/Ã.|â€.|Â.|ï¿½|�/g);
if (mojibake) problems.push(`Mojibake found: ${[...new Set(mojibake)].slice(0,10).join(' ')}`);

// ---- 4. Leftover regex backreference corruption (\1 \2 etc as literal) ----
const backref = html.match(/[^\\]\\[1-9]/g);
if (backref) problems.push(`Literal backref artifacts: ${[...new Set(backref)].join(' ')}`);

// ---- 5. Unconverted/garbled cost strings ----
const garbledCost = html.match(/₩[\d,]*\s*\(~\$\d[\d,]*\)\d/g); // the "₩20,00 (~$1)0" pattern
if (garbledCost) problems.push(`Garbled cost: ${garbledCost.join(' | ')}`);

// ---- 6. Every img src on disk ----
const imgSrcs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]);
for (const src of imgSrcs) {
  if (/^https?:/.test(src)) { warn.push(`remote img: ${src}`); continue; }
  if (!fs.existsSync(path.join('.', src))) problems.push(`Missing <img> file: ${src}`);
}

// ---- 7. Every data.js image file on disk + uniqueness ----
const fileUse = {};
let venueCount = 0, imgCount = 0;
for (const c of Object.values(TRIP.cities))
  for (const items of Object.values(c.categories))
    for (const it of items) {
      venueCount++;
      for (const src of (it.images || [])) {
        imgCount++;
        if (!fs.existsSync(path.join('.', src))) problems.push(`data.js missing file: ${src} (${it.id})`);
        (fileUse[src] = fileUse[src] || []).push(it.id);
      }
    }
for (const [src, ids] of Object.entries(fileUse))
  if (new Set(ids).size > 1) problems.push(`Image reused across venues: ${src} -> ${[...new Set(ids)].join(', ')}`);

// ---- 8. Orphan image files (on disk, referenced nowhere) ----
const referenced = new Set([...Object.keys(fileUse), ...imgSrcs]);
const imgDir = 'images/seoul';
if (fs.existsSync(imgDir)) {
  for (const f of fs.readdirSync(imgDir)) {
    const rel = `images/seoul/${f}`;
    if (!referenced.has(rel)) warn.push(`orphan image file (unused): ${rel}`);
  }
}

// ---- 9. Duplicate venue ids in data.js ----
const seen = {};
for (const c of Object.values(TRIP.cities))
  for (const items of Object.values(c.categories))
    for (const it of items) { seen[it.id] = (seen[it.id]||0)+1; }
for (const [id,n] of Object.entries(seen)) if (n>1) problems.push(`Duplicate venue id: ${id} (x${n})`);

// ---- 10. Coord sanity (Seoul-ish bounds) ----
for (const c of Object.values(TRIP.cities))
  for (const items of Object.values(c.categories))
    for (const it of items) {
      if (it.lat==null||it.lng==null) continue;
      if (it.lat<36.5||it.lat>38.2||it.lng<126.0||it.lng>128.5)
        warn.push(`coord far from Seoul: ${it.id} (${it.lat},${it.lng}) ${it.name}`);
    }

// ---- 11. Date sequence in day headers ----
const dates = [...html.matchAll(/<div class="day-date">([^<]+)<\/div>/g)].map(m=>m[1].trim());
const dayNums = [...html.matchAll(/<div class="day-num">(\d+)<\/div>/g)].map(m=>+m[1]);
const seqOk = dayNums.every((n,i)=> i===0 || n===dayNums[i-1]+1);
if (!seqOk) problems.push(`day-num not sequential: ${dayNums.join(',')}`);

// ---- 12. Sleep field present each day ----
const sleeps = (html.match(/Sleep:\s*<strong>/g)||[]).length;
if (sleeps !== dayNums.length) warn.push(`Sleep fields (${sleeps}) != day count (${dayNums.length})`);

// ---- 13. Unclosed anchor / broken external links scheme ----
const badHref = [...html.matchAll(/href="([^"]*)"/g)].map(m=>m[1]).filter(h=>h && !/^(https?:|mailto:|#|\/|[\w./-]+$)/.test(h));
if (badHref.length) warn.push(`odd href values: ${badHref.slice(0,5).join(' | ')}`);

console.log('venues:', venueCount, '| images referenced in data.js:', imgCount);
console.log('days:', dayNums.length, '| dates:', dates.join(' / '));
console.log('div open/close:', opens, '/', closes);
console.log('');
if (problems.length) { console.log('PROBLEMS ('+problems.length+'):'); problems.forEach(p=>console.log('  ✗ '+p)); }
else console.log('NO PROBLEMS FOUND.');
if (warn.length) { console.log('\nWARNINGS / notes ('+warn.length+'):'); warn.forEach(w=>console.log('  • '+w)); }
