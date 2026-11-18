import { TripRoute } from './routes.js';

const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

class Itinerary {
  constructor(data, credits) {
    this.data = data;
    this.credits = credits;
    this.map = null;
  }

  photo(key, caption) {
    const file = this.credits[key]?.file;
    return file ? `<img src="${escapeHtml(file)}" alt="${escapeHtml(caption)}" loading="lazy" width="1200" height="800">` : '';
  }

  place(id) {
    return this.data.places.find(place => place.id === id);
  }

  directions(origin, destination, mode) {
    const name = place => `${place.mapQuery || place.name}, ${this.data.location}`;
    const query = new URLSearchParams({api:'1',origin:name(origin),destination:name(destination),travelmode:mode});
    return `https://www.google.com/maps/dir/?${query}`;
  }

  blockHtml(block, origin) {
    const stops = block.stops.map(id => this.place(id));
    const destination = stops[0];
    const nearby = block.nearby || [];
    return `<article class="stop ${block.image ? 'with-photo' : ''}">
      <div class="stop-copy"><p class="time">${escapeHtml(block.time)}</p><h3>${escapeHtml(block.title)}</h3><p>${escapeHtml(block.text)}</p>
      ${destination ? `<div class="stop-links"><a href="${this.directions(origin,destination,block.mode || 'walking')}" target="_blank" rel="noopener">${block.mode === 'driving' ? 'Taxi directions' : 'Walking directions'} ↗</a><a href="${escapeHtml(destination.source)}" target="_blank" rel="noopener">Place details ↗</a></div>` : ''}
      ${stops.length > 1 ? `<p class="stop-route">Then walk: ${stops.slice(1).map(p=>`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.mapQuery || p.name}, ${this.data.location}`)}" target="_blank" rel="noopener">${escapeHtml(p.name)} ↗</a>`).join(' → ')}</p>` : ''}
      ${nearby.length ? `<div class="nearby"><span>Also nearby, if something catches your eye</span>${nearby.map(item=>{const p=this.place(item.id);return `<p><a href="${escapeHtml(p.source)}" target="_blank" rel="noopener">${escapeHtml(p.name)}</a> · ${escapeHtml(item.text)}</p>`;}).join('')}</div>` : ''}</div>
      ${block.image ? `<figure>${this.photo(block.image,block.title)}</figure>` : ''}
    </article>`;
  }

  dayHtml(day) {
    let origin = this.data.hotel;
    const blocks = day.blocks.map(block => {
      const html = this.blockHtml(block,origin);
      if(block.stops.length) origin = this.place(block.stops.at(-1));
      if(block.returnToHotel) origin = this.data.hotel;
      return html;
    }).join('');
    return `<section class="day" id="${day.id}"><header class="day-heading"><p class="eyebrow">${escapeHtml(day.label)} / ${day.date}</p><h2>${escapeHtml(day.title)}</h2><p>${escapeHtml(day.summary)}</p></header>${blocks}</section>`;
  }

  render() {
    const hotel = this.data.hotel;
    $('#trip-content').innerHTML = `
      <section class="hero"><div><p class="eyebrow">${escapeHtml(this.data.dates)} · ${escapeHtml(this.data.travelers)}</p><h1>Montréal.<br><em>Here’s the plan.</em></h1><p>${escapeHtml(this.data.intro)}</p><nav class="day-nav" aria-label="Itinerary days"><a href="#friday">Friday night ↓</a><a href="#saturday">Saturday ↓</a><a href="#sunday">Sunday ↓</a></nav></div><figure>${this.photo('oldmontreal','Old Montréal')}</figure></section>
      <aside class="hotel"><div>${this.photo(hotel.image,hotel.name)}</div><div><p class="eyebrow">Your base</p><h2>${escapeHtml(hotel.name)}</h2><p>Signature Two Queen Beds. Park here and use taxis between neighborhoods.</p><a href="${escapeHtml(hotel.source)}" target="_blank" rel="noopener">Check rooms and book ↗</a></div></aside>
      <p class="booking">${escapeHtml(this.data.booking)}</p>
      ${this.data.days.map(day => this.dayHtml(day)).join('')}
      <section class="route-section"><p class="eyebrow">The route</p><h2>Your stops, in one place.</h2><p class="map-note">Green: Saturday. Rust: Sunday. Pins are approximate; the directions links above open actual street routes.</p><div id="map" aria-label="Map of the itinerary stops"></div><p id="map-fallback" hidden>Use the directions links at each stop if the map does not load.</p></section>
      <section class="practical"><h2>Before you leave</h2>${this.data.practical.map(item=>`<p><strong>${escapeHtml(item.title)}.</strong> ${escapeHtml(item.text)}${item.source ? ` <a href="${item.source}" target="_blank" rel="noopener">Live check ↗</a>` : ''}</p>`).join('')}<p class="fine-print">${escapeHtml(this.data.assumptions)} <a href="images/credits.json" target="_blank" rel="noopener">Photo sources</a>.</p></section>`;
  }

  renderMap() {
    if(this.map || $('#trip-content').hidden)return;
    if(!window.L){$('#map').hidden=true;$('#map-fallback').hidden=false;return;}
    $('#map').hidden=false;$('#map-fallback').hidden=true;
    this.map=L.map('map',{scrollWheelZoom:false}).setView(this.data.center,12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(this.map);
    const all=[];
    for(const day of this.data.days.filter(d=>d.id!=='friday')){
      const stops=day.blocks.flatMap(block=>block.stops).map(id=>this.place(id));
      const color=day.id==='saturday'?'#38563d':'#ba4e30';
      stops.forEach((place,index)=>{
        if(!TripRoute.valid(place))return;
        all.push([place.lat,place.lng]);
        L.marker([place.lat,place.lng],{title:place.name,icon:L.divIcon({className:'',html:`<span class="number-pin" style="background:${color}">${index+1}</span>`,iconSize:[26,26]})}).bindPopup(`${escapeHtml(day.label)} ${index+1}: <b>${escapeHtml(place.name)}</b>`).addTo(this.map);
      });
    }
    if(all.length)this.map.fitBounds(all,{padding:[30,30]});
    requestAnimationFrame(()=>this.map.invalidateSize());
  }
}

function selectTrip(id,push=true) {
  const archive=id==='chalmond';
  $('#archive').hidden=!archive;$('#trip-content').hidden=archive;
  document.querySelectorAll('[data-trip]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.trip===id));
  if(archive&&!$('iframe').getAttribute('src'))$('iframe').src='chalmondtrip/itinerary.html';
  document.title=archive?'Weekend Atlas · Chalmond':'Weekend Atlas · Montréal itinerary';
  if(push){const url=new URL(location.href);url.searchParams.set('trip',id);history.pushState({},'',url);}
  if(!archive){window.itinerary?.renderMap();requestAnimationFrame(()=>window.itinerary?.map?.invalidateSize());}
}

document.querySelectorAll('[data-trip]').forEach(button=>button.addEventListener('click',()=>selectTrip(button.dataset.trip)));
window.addEventListener('popstate',()=>selectTrip(new URL(location.href).searchParams.get('trip')==='chalmond'?'chalmond':'montreal',false));
$('#print').addEventListener('click',()=>window.print());
try {
  const responses=await Promise.all([fetch('montreal.json'),fetch('images/credits.json')]);
  if(responses.some(response=>!response.ok))throw new Error('Could not load the itinerary.');
  const [data,credits]=await Promise.all(responses.map(response=>response.json()));
  window.itinerary=new Itinerary(data,credits);window.itinerary.render();$('#loading').hidden=true;
  selectTrip(new URL(location.href).searchParams.get('trip')==='chalmond'?'chalmond':'montreal',false);
  window.addEventListener('load',()=>window.itinerary.renderMap());
} catch(error){$('#loading').textContent=`${error.message} Please refresh the page.`;}
