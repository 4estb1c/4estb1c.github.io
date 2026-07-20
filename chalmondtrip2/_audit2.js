// Adversarial itinerary audit.
//
// Rebuilds each day's stop list exactly the way itinerary.html does (same
// TITLE_MAP / OPT_MAP first-match-wins resolution, same block-vs-cluster
// anchoring), then attacks the result:
//   geography   — consecutive hop distances, day span, backtracking
//   schedule    — is there enough clock time to cover each hop?
//   images      — which activities render with no gallery
//   repetition  — the same venue used across many days
//   coverage    — blocks that resolve to nothing, days missing a meal
//
// Usage: node _audit2.js
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const html = fs.readFileSync(path.join(ROOT, 'itinerary.html'), 'utf8');
const data = require(path.join(ROOT, 'data.js'));

// ── venue index ────────────────────────────────────────────────────────
const V = {};
for (const city of Object.values(data.cities))
  for (const [cat, arr] of Object.entries(city.categories))
    for (const v of arr) V[v.id] = { ...v, cat };

// ── pull the keyword maps straight out of the page ─────────────────────
function grabMap(name) {
  const i = html.indexOf('const ' + name + ' = {');
  if (i < 0) throw new Error('missing ' + name);
  const body = html.slice(i, html.indexOf('\n};', i));
  const out = [];
  const re = /'((?:[^'\\]|\\.)*)'\s*:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(body))) out.push([m[1].replace(/\\'/g, "'"), m[2]]);
  return out;
}
const TITLE_MAP = grabMap('TITLE_MAP');
const OPT_MAP = grabMap('OPT_MAP');
const kw = (raw, map) => {
  raw = raw.toLowerCase().replace(/[‘’ʼ]/g, "'");
  for (const [k, id] of map) if (raw.includes(k)) return id;
  return null;
};

// ── parse days ─────────────────────────────────────────────────────────
const text = s => s
  .replace(/<span class="cost">[\s\S]*?<\/span>/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();

const hkStart = html.indexOf('<div id="tab-hongkong"');
const dayStarts = [...html.matchAll(/<!-- DAY (\d+) -->/g)].map(m => ({ num: +m[1], at: m.index }));

const days = dayStarts.map((d, i) => {
  const body = html.slice(d.at, i + 1 < dayStarts.length ? dayStarts[i + 1].at : html.length);
  const date = (body.match(/<div class="day-date">([^<]*)<\/div>/) || [])[1] || '?';
  const city = d.at > hkStart ? 'HK' : 'Seoul';

  // Activities in document order — every .block and every .options-cluster.
  // Slice between successive activity-opening tags so nested divs stay intact.
  const marks = [...body.matchAll(/<div class="(block highlight|block|options-cluster alt|options-cluster)">/g)]
    .map(m => ({ kind: m[1], at: m.index }));
  const acts = [];
  marks.forEach((mk, k) => {
    const seg = body.slice(mk.at, k + 1 < marks.length ? marks[k + 1].at : body.length);
    const isBlock = mk.kind !== 'options-cluster' && mk.kind !== 'options-cluster alt';
    const isAlt = mk.kind === 'options-cluster alt';
    const head = isBlock
      ? (seg.match(/<div class="block-title">([\s\S]*?)<\/div>/) || [])[1]
      : (seg.match(/<div class="options-head">([\s\S]*?)<\/div>/) || [])[1];
    if (head == null) return;
    const time = isBlock ? (seg.match(/<div class="block-time">([^<]*)<\/div>/) || [])[1] : null;
    const id = isBlock
      ? kw(text(head), TITLE_MAP)
      : (() => {
        for (const o of seg.matchAll(/<div class="opt-name">([\s\S]*?)<\/div>/g)) {
          const oid = kw(text(o[1]), OPT_MAP);
          if (oid && V[oid] && V[oid].lat) return oid;
        }
        return null;
      })();
    acts.push({ isBlock, isAlt, head: text(head), time: time ? text(time) : null, id, at: mk.at });
  });
  // Where the day's written transit notes sit, so a long hop that is already
  // explained in the plan can be reported as expected rather than as a problem.
  const transits = [...body.matchAll(/<div class="transit">/g)].map(m => m.index);
  return { num: d.num, date, city, acts, body, transits };
});

// Logistics lines (flights, check-out, held-open blocks) legitimately have no
// venue — don't report them as unresolved.
const LOGISTICS = /check[\s-]?out|arrive (icn|hkg)|cts\s*→\s*icn|icn\s*→\s*hkg|airport express|drop the haul|sisters day|^k-beauty hour/i;

// ── helpers ────────────────────────────────────────────────────────────
const R = 6371;
function km(a, b) {
  const r = x => x * Math.PI / 180;
  const dLat = r(b[0] - a[0]), dLon = r(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// ── same anchoring the page uses (keep these two in sync) ──────────────
const FAR_KM = 25;
for (const d of days) {
  let last = null;
  for (const a of d.acts) {
    const own = a.id && V[a.id] && V[a.id].lat ? [V[a.id].lat, V[a.id].lng] : null;
    a.own = own;
    if (a.isBlock)   a.p = own || last;
    else if (a.isAlt) a.p = last || own;
    else if (!own)   a.p = last;
    else if (!last)  a.p = own;
    else             a.p = km(last, own) > FAR_KM ? last : own;
    if (a.p) last = a.p;
  }
  const first = (d.acts.find(a => a.p) || {}).p;
  for (const a of d.acts) if (!a.p && first) a.p = first;
}
// Straight-line km → realistic door-to-door minutes on urban transit.
// ~1.35x route factor, ~22 km/h effective, plus a fixed platform/walk overhead.
const travelMin = d => Math.round(8 + (d * 1.35) / 22 * 60);
const mins = t => {
  const m = /^(\d{1,2}):(\d{2})/.exec(t || '');
  return m ? +m[1] * 60 + +m[2] : null;
};

const findings = [];
const add = (sev, day, msg) => findings.push({ sev, day, msg });

// ── 1. geography ───────────────────────────────────────────────────────
console.log('\n════ PER-DAY GEOGRAPHY ════');
for (const d of days) {
  const pts = d.acts.filter(a => a.p);
  let total = 0;
  const hops = [];
  for (let i = 1; i < pts.length; i++) {
    const dist = km(pts[i - 1].p, pts[i].p);
    total += dist;
    hops.push({ from: pts[i - 1], to: pts[i], dist });
  }
  const span = pts.length > 1
    ? Math.max(...pts.flatMap((a, i) => pts.slice(i + 1).map(b => km(a.p, b.p))))
    : 0;
  console.log(`\nDay ${String(d.num).padStart(2)} ${d.date.padEnd(10)} ${d.city.padEnd(5)} ` +
    `stops ${String(pts.length).padStart(2)} | walked-line total ${total.toFixed(1)}km | widest span ${span.toFixed(1)}km`);
  for (const h of hops) {
    // A hop with a written transit note between the two stops is a planned
    // journey, not an oversight — note it, don't flag it.
    const documented = d.transits.some(t => t > h.from.at && t < h.to.at);
    const flag = h.dist > 8 ? (documented ? ' ⚠ long (transit noted)' : ' ⚠ LONG — undocumented') : h.dist > 4 ? ' ·' : '';
    if (h.dist > 2)
      console.log(`     ${h.dist.toFixed(1).padStart(5)}km  ${h.from.head.slice(0, 30).padEnd(32)}→ ${h.to.head.slice(0, 30)}${flag}`);
    if (h.dist > 8)
      add(documented ? 'INFO' : 'WARN', d.num,
        `long hop ${h.dist.toFixed(1)}km${documented ? ' (transit note present)' : ' with NO transit note'}: "${h.from.head.slice(0, 38)}" → "${h.to.head.slice(0, 38)}"`);
  }
  // Backtracking, blocks only — option clusters are approximate by nature
  // (a chain's data coords aren't the branch you'd actually use).
  const bhops = hops.filter(h => h.from.isBlock && h.to.isBlock);
  for (let i = 0; i < bhops.length - 1; i++)
    for (let j = i + 1; j < bhops.length; j++)
      if (bhops[i].dist > 5 && km(bhops[i].from.p, bhops[j].to.p) < 1.5)
        add('INFO', d.num, `out-and-back: leaves "${bhops[i].from.head.slice(0, 30)}" and returns near it at "${bhops[j].to.head.slice(0, 30)}"`);
}

// ── 2. schedule feasibility ────────────────────────────────────────────
console.log('\n════ SCHEDULE FEASIBILITY ════');
for (const d of days) {
  const timed = d.acts.filter(a => a.isBlock && a.time && mins(a.time) != null && a.p);
  for (let i = 1; i < timed.length; i++) {
    const gap = mins(timed[i].time) - mins(timed[i - 1].time);
    if (gap <= 0) continue;                       // crosses midnight / unordered
    const dist = km(timed[i - 1].p, timed[i].p);
    const need = travelMin(dist);
    const slack = gap - need;
    if (slack < 0 || (dist > 0.4 && slack < 15)) {
      const sev = slack < 0 ? 'FAIL' : 'WARN';
      console.log(`  ${sev} Day ${d.num}: ${timed[i - 1].time} "${timed[i - 1].head.slice(0, 32)}" → ${timed[i].time} "${timed[i].head.slice(0, 32)}"`);
      console.log(`       gap ${gap}min · hop ${dist.toFixed(1)}km needs ~${need}min · slack ${slack}min`);
      add(sev, d.num, `timing ${timed[i - 1].time}→${timed[i].time}: ${gap}min gap, ~${need}min of it is travel (${dist.toFixed(1)}km) — ${slack}min left for the activity`);
    }
  }
}

// ── 3. images ──────────────────────────────────────────────────────────
console.log('\n════ ACTIVITIES WITH NO IMAGE ════');
const noImg = new Map();
for (const d of days)
  for (const a of d.acts) {
    if (!a.isBlock) continue;
    const v = a.id && V[a.id];
    if (!v) {
      if (!LOGISTICS.test(a.head)) add('WARN', d.num, `block resolves to no venue: "${a.head.slice(0, 46)}"`);
      continue;
    }
    if (!(v.images || []).length) {
      if (!noImg.has(a.id)) noImg.set(a.id, { name: v.name, days: [] });
      noImg.get(a.id).days.push(d.num);
    }
  }
for (const [id, o] of noImg)
  console.log(`  ${id.padEnd(10)} ${o.name.slice(0, 52).padEnd(54)} days ${o.days.join(',')}`);
console.log(`  → ${noImg.size} distinct venues on the day spine have no photo`);

// ── 4. repetition ──────────────────────────────────────────────────────
console.log('\n════ VENUE REPETITION ════');
const uses = {};
for (const d of days)
  for (const a of d.acts)
    if (a.id) (uses[a.id] = uses[a.id] || new Set()).add(d.num);
for (const [id, set] of Object.entries(uses).sort((a, b) => b[1].size - a[1].size).slice(0, 8))
  if (set.size > 2) {
    console.log(`  ${String(set.size)}× ${id.padEnd(10)} ${(V[id] || {}).name} — days ${[...set].join(',')}`);
    if (set.size > 3) add('INFO', id, `${(V[id] || {}).name} appears on ${set.size} days`);
  }

// ── 5. meal coverage ───────────────────────────────────────────────────
console.log('\n════ MEAL COVERAGE ════');
for (const d of days) {
  const heads = d.acts.map(a => a.head.toLowerCase()).join(' | ');
  // Days that end on a flight out don't need a dinner slot here; days that
  // start on a flight in don't need breakfast or lunch.
  const fliesOut = /→\s*(hkg|icn)|flight|airport express/i.test(heads);
  const fliesIn = /arrive (icn|hkg)/i.test(heads);
  const want = ['breakfast', 'lunch', 'dinner']
    .filter(m => !(fliesOut && m === 'dinner'))
    .filter(m => !(fliesIn && m !== 'dinner'));
  const missing = want.filter(meal => !heads.includes(meal));
  if (missing.length) {
    console.log(`  Day ${d.num} ${d.date} (${d.city}) — no ${missing.join(', ')} slot`);
    add(d.city === 'Seoul' ? 'WARN' : 'INFO', d.num, `missing meal slot(s): ${missing.join(', ')}`);
  }
}

// ── summary ────────────────────────────────────────────────────────────
console.log('\n════ SUMMARY ════');
const bySev = s => findings.filter(f => f.sev === s);
for (const s of ['FAIL', 'WARN', 'INFO']) {
  const list = bySev(s);
  if (!list.length) continue;
  console.log(`\n${s} (${list.length})`);
  for (const f of list) console.log(`  [day ${f.day}] ${f.msg}`);
}
if (!findings.length) console.log('clean.');
console.log('');
