import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { TripRoute } from '../routes.js';

test('great-circle distance works across cities, zero coordinates, and the date line', () => {
  assert.equal(TripRoute.distance({lat:0,lng:0},{lat:0,lng:0}),0);
  assert.ok(Math.abs(TripRoute.distance({lat:0,lng:0},{lat:0,lng:1})-111.195)<0.01);
  assert.ok(TripRoute.distance({lat:0,lng:179},{lat:0,lng:-179})<223);
  assert.ok(TripRoute.distance({lat:45,lng:0},{lat:45,lng:1})<80);
  assert.throws(()=>TripRoute.distance({lat:NaN,lng:0},{lat:0,lng:0}),TypeError);
  assert.equal(TripRoute.valid({lat:91,lng:0}),false);
});

test('untimed optimization preserves endpoints and every stop without mutating the input', () => {
  const points=[{id:'a',lat:0,lng:0},{id:'b',lat:0,lng:3},{id:'c',lat:0,lng:1},{id:'d',lat:0,lng:2},{id:'e',lat:0,lng:4}];
  const original=structuredClone(points);
  const ordered=TripRoute.order(points);
  assert.deepEqual(points,original);
  assert.equal(ordered[0],points[0]); assert.equal(ordered.at(-1),points.at(-1));
  assert.deepEqual(ordered.map(p=>p.id).sort(),points.map(p=>p.id).sort());
  assert.ok(TripRoute.length(ordered)<TripRoute.length(points));
  assert.deepEqual(TripRoute.order(points),ordered);
  for (let seed=1;seed<=20;seed++) {
    const sample=Array.from({length:7},(_,i)=>({id:i,lat:45+Math.sin(i*seed)/10,lng:-73+Math.cos(i+seed)/10}));
    assert.ok(TripRoute.length(TripRoute.order(sample)) <= TripRoute.length(sample)+1e-8);
  }
});

test('empty, small, and coincident routes terminate and retain all entries', () => {
  assert.deepEqual(TripRoute.order([]),[]);
  const same=Array.from({length:8},(_,id)=>({id,lat:45,lng:-73}));
  assert.equal(TripRoute.order(same).length,8);
  assert.equal(TripRoute.length(TripRoute.order(same)),0);
  assert.equal(TripRoute.order(same.slice(0,1)).length,1);
});

test('directions encode names and preserve the intended stop order', () => {
  const stops=[{name:'Crew & Café',lat:45,lng:-73},{name:'Notre-Dame',lat:45,lng:-73},{name:'Old Port',lat:45,lng:-73}];
  assert.equal(TripRoute.directions([]),null);
  const url=new URL(TripRoute.directions(stops));
  assert.equal(url.searchParams.get('travelmode'),'walking');
  assert.match(url.searchParams.get('origin'),/^Crew & Café/);
  assert.match(url.searchParams.get('waypoints'),/^Notre-Dame/);
  assert.match(url.searchParams.get('destination'),/^Old Port/);
});

test('all published plans reference existing places, areas, hotels, and local photo assets', async () => {
  const data=JSON.parse(await readFile(new URL('../montreal.json',import.meta.url)));
  const credits=JSON.parse(await readFile(new URL('../images/credits.json',import.meta.url)));
  const ids=new Set(data.places.map(p=>p.id));
  assert.equal(ids.size,data.places.length);
  for(const place of data.places){
    assert.ok(TripRoute.valid(place));
    assert.ok(data.areas.some(a=>a.id===place.area));
    assert.ok(credits[place.image]?.file,place.name);
  }
  for(const proposal of data.proposals){
    assert.ok(data.hotels.some(h=>h.id===proposal.hotel));
    assert.deepEqual(proposal.days.map(d=>d.id),['friday','saturday','sunday']);
    for(const day of proposal.days)for(const id of day.route)assert.ok(ids.has(id),id);
  }
  for(const credit of Object.values(credits))if(credit.file)await access(new URL(`../${credit.file}`,import.meta.url));
});
