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

test('the one itinerary references existing stops and photo assets', async () => {
  const data=JSON.parse(await readFile(new URL('../montreal.json',import.meta.url)));
  const galleries=JSON.parse(await readFile(new URL('../images/gallery.json',import.meta.url)));
  const ids=new Set(data.places.map(p=>p.id));
  assert.equal(ids.size,data.places.length);
  assert.equal(data.proposals,undefined);
  assert.deepEqual(data.days.map(d=>d.id),['friday','saturday','sunday']);
  assert.ok(TripRoute.valid(data.hotel));
  for(const place of [...data.places,...data.hotels]) {
    assert.ok(TripRoute.valid(place));
    assert.ok(place.lat>45.48 && place.lat<45.56 && place.lng>-73.65 && place.lng<-73.53,place.id);
    assert.equal(galleries[place.id].photos.length,3,place.id);
    for(const photo of galleries[place.id].photos)await access(new URL(`../${photo.src}`,import.meta.url));
  }
  assert.equal(data.hotels.length,4);
  assert.equal(data.hotel.id,'mountstephen');
  assert.deepEqual(new Set(data.neighborhoods.flatMap(area=>area.ids)),ids);
  for(const day of data.days){
    for(const block of day.blocks){
      for(const id of block.stops)assert.ok(ids.has(id)||id===data.hotel.id,id);
      for(const nearby of block.nearby||[])assert.ok(ids.has(nearby.id),nearby.id);

    }
  }
});
