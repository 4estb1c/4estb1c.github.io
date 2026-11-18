import { TripRoute } from './routes.js';

const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

class Itinerary {
  constructor(data, galleries) {
    this.data = data;
    this.galleries = galleries;
    this.headline = 'botabota';
    this.map = null;
  }

  gallery(id, hero = false) {
    const photos = this.galleries[id]?.photos || [];
    return `<div class="gallery${hero ? ' hero-gallery' : ''}">${photos.map((photo,i) => `<a href="${escapeHtml(photo.src)}" target="_blank" rel="noopener" aria-label="Enlarge: ${escapeHtml(photo.alt)}"><img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt)}" loading="${hero && i===0 ? 'eager' : 'lazy'}" width="900" height="700"><span>${escapeHtml(photo.alt)}</span></a>`).join('')}</div>`;
  }

  selectedDays() {
    return this.data.days.map(day => ({...day, blocks: day.blocks.map(original => {
      const block = {...original};
      block.title = block.title.replace('Le Germain',this.data.hotel.name);
      block.text = block.text.replace('Le Germain',this.data.hotel.name);
      if(block.headline && this.headline !== 'botabota') {
        const place = this.place(this.headline);
        Object.assign(block,{title:place.name+' · the afternoon highlight',stops:[place.id]});
        if(place.id==='habitat67') Object.assign(block,{time:'Afternoon · booked tour time',text:'Take a taxi across the river for the 90-minute guided architecture tour. Saturday availability is unconfirmed. Choose a slot that gets you back to the hotel by 5 PM; private walkways require the tour.'});
        else Object.assign(block,{time:'2:30 PM',text:'Visit the basilica interior during Saturday sightseeing hours, currently 9 AM–4 PM. Allow time to sit and take in the space. AURA is a separate evening experience, not included in this route.'});
      }
      return block;
    })}));
  }

  placeCard(place, hotel = false) {
    return `<article class="place-card" id="place-${place.id}">${this.gallery(place.id)}<div class="card-copy"><p class="eyebrow">${escapeHtml(hotel ? place.label+' · '+place.level : place.kind+' · '+place.price)}</p><h3>${escapeHtml(place.name)}</h3><p>${escapeHtml(place.description)}</p><p class="card-note">${escapeHtml(hotel ? place.beds : place.note)}</p><div class="card-links"><a href="${escapeHtml(place.source)}" target="_blank" rel="noopener">${hotel ? 'Rooms & rates' : 'Official details'}</a>${hotel ? `<button data-hotel="${place.id}" aria-pressed="${this.data.hotel.id===place.id}">${this.data.hotel.id===place.id ? 'Selected base' : 'Use as base'}</button>` : `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((place.mapQuery||place.name)+', '+this.data.location)}" target="_blank" rel="noopener">Google Maps</a>`}</div></div></article>`;
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
    const destination = block.returnToHotel ? this.data.hotel : stops[0];
    const nearby = block.nearby || [];
    return `<article class="stop">
      <div class="stop-copy"><p class="time">${escapeHtml(block.time)}</p><h3>${escapeHtml(block.title)}</h3><p>${escapeHtml(block.text)}</p>
      ${destination ? `<div class="stop-links"><a href="${this.directions(origin,destination,block.mode || 'walking')}" target="_blank" rel="noopener">${block.mode === 'driving' ? 'Taxi directions' : 'Walking directions'}</a><a href="${escapeHtml(destination.source)}" target="_blank" rel="noopener">Place details</a></div>` : ''}
      ${stops.length > 1 ? `<p class="stop-route">Then walk: ${stops.slice(1).map(p=>`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.mapQuery || p.name}, ${this.data.location}`)}" target="_blank" rel="noopener">${escapeHtml(p.name)}</a>`).join(' → ')}</p>` : ''}
      ${nearby.length ? `<div class="nearby"><span>Also nearby, if something catches your eye</span>${nearby.map(item=>{const p=this.place(item.id);return `<p><a href="${escapeHtml(p.source)}" target="_blank" rel="noopener">${escapeHtml(p.name)}</a> · ${escapeHtml(item.text)}</p>`;}).join('')}</div>` : ''}</div>
      ${destination ? `<a class="photo-jump" href="#place-${destination.id}">Photos & nearby options</a>` : ''}
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
    if(this.map){this.map.remove();this.map=null;}
    const hotel = this.data.hotel;
    $('#trip-content').innerHTML = `
      <section class="hero"><div><p class="eyebrow">${escapeHtml(this.data.dates)} · ${escapeHtml(this.data.travelers)}</p><h1>Montréal.<br><em>A little indulgence.</em></h1><p>${escapeHtml(this.data.intro)}</p><nav class="day-nav" aria-label="Explore the trip"><a href="#plan">The plan</a><a href="#headlines">Main event</a><a href="#nearby">Nearby places</a><a href="#hotels">Hotels</a></nav></div>${this.gallery('notredame',true)}</section>
      <aside class="base-summary"><p class="eyebrow">Your weekend at a glance</p><p><strong>${escapeHtml(hotel.name)}</strong> · ${escapeHtml(this.place(this.headline).name)} · Monarque brasserie</p><p>Friday arrival. Saturday exploring, an afternoon highlight, and a proper dinner. Sunday old streets and pastries, then leave at 1:30 PM.</p></aside>
      <p class="booking">Reserve ${escapeHtml(hotel.name)}, ${escapeHtml(this.place(this.headline).name)}, and Monarque’s brasserie. Nothing is booked. Food allowances are CAD per person, before tax and tip.</p>
      <section id="plan"><header class="section-heading"><p class="eyebrow">One route to follow</p><h2>The weekend, planned.</h2><nav class="day-nav"><a href="#friday">Friday night</a><a href="#saturday">Saturday</a><a href="#sunday">Sunday</a></nav></header>${this.selectedDays().map(day=>this.dayHtml(day)).join('')}</section>
      <section id="headlines" class="options-section"><header class="section-heading"><p class="eyebrow">Choose one, keep the rest of the plan</p><h2>The main event.</h2><p>Bota Bota is the default. These buttons replace only Saturday’s afternoon stop.</p></header><div class="headline-grid">${this.data.headlines.map(item=>`<article class="headline-card">${this.gallery(item.id)}<div class="card-copy"><p class="eyebrow">${escapeHtml(item.label)}</p><h3>${escapeHtml(this.place(item.id).name)}</h3><p>${escapeHtml(item.description)}</p><p class="card-note">${escapeHtml(item.duration)}</p><button data-headline="${item.id}" aria-pressed="${this.headline===item.id}">${this.headline===item.id ? 'In your Saturday plan' : 'Use for Saturday afternoon'}</button><a class="detail-link" href="#place-${item.id}">Details & booking</a></div></article>`).join('')}</div></section>
      <section id="nearby" class="options-section"><header class="section-heading"><p class="eyebrow">Follow the route; stop where something catches your eye</p><h2>Good places, close together.</h2><p>Meals, desserts, independent shops, and a few memorable diversions. Tap any photo to enlarge it.</p><nav class="area-nav">${this.data.neighborhoods.map(area=>`<a href="#area-${area.id}">${escapeHtml(area.name)}</a>`).join('')}</nav></header>${this.data.neighborhoods.map(area=>`<section class="neighborhood" id="area-${area.id}"><header><h2>${escapeHtml(area.name)}</h2><p>${escapeHtml(area.subtitle)}</p></header><div class="place-grid">${area.ids.map(id=>this.placeCard(this.place(id))).join('')}</div></section>`).join('')}</section>
      <section id="hotels" class="options-section"><header class="section-heading"><p class="eyebrow">Four good bases</p><h2>Stay somewhere you’ll enjoy.</h2><p>Le Germain is the easy two-bed default. The other three add more atmosphere. Compare the total for November 20–22, parking, and cancellation terms; live rates and availability have not been checked.</p></header><div class="place-grid hotel-grid">${this.data.hotels.map(item=>this.placeCard(item,true)).join('')}</div></section>
      <section class="route-section"><p class="eyebrow">The route</p><h2>Your planned stops.</h2><p class="map-note">Green: Saturday. Rust: Sunday. Pins are approximate; directions open actual street routes.</p><div id="map" aria-label="Map of the itinerary stops"></div><p id="map-fallback" hidden>Use the directions links at each stop if the map does not load.</p></section>
      <section class="practical"><h2>Before you leave</h2>${this.data.practical.map(item=>`<p><strong>${escapeHtml(item.title)}.</strong> ${escapeHtml(item.text)}${item.source ? ` <a href="${escapeHtml(item.source)}" target="_blank" rel="noopener">Live check</a>` : ''}</p>`).join('')}<p class="fine-print">${escapeHtml(this.data.assumptions)} Photos illustrate the venues and products, not guaranteed current menus or room categories. <a href="images/gallery.json" target="_blank" rel="noopener">Photo credits and sources</a>.</p></section>`;
    document.querySelectorAll('[data-headline]').forEach(button=>button.addEventListener('click',()=>{
      this.headline=button.dataset.headline;this.render();this.renderMap();
      document.querySelector(`[data-headline="${this.headline}"]`).focus({preventScroll:true});
    }));
    document.querySelectorAll('[data-hotel]').forEach(button=>button.addEventListener('click',()=>{
      this.data.hotel=this.data.hotels.find(hotel=>hotel.id===button.dataset.hotel);this.render();this.renderMap();
      document.querySelector(`[data-hotel="${this.data.hotel.id}"]`).focus({preventScroll:true});
    }));
  }

  renderMap() {
    if(this.map || $('#trip-content').hidden)return;
    if(!window.L){$('#map').hidden=true;$('#map-fallback').hidden=false;return;}
    $('#map').hidden=false;$('#map-fallback').hidden=true;
    this.map=L.map('map',{scrollWheelZoom:false}).setView(this.data.center,12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(this.map);
    const all=[];
    for(const day of this.selectedDays().filter(d=>d.id!=='friday')){
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
  const responses=await Promise.all([fetch('montreal.json'),fetch('images/gallery.json')]);
  if(responses.some(response=>!response.ok))throw new Error('Could not load the itinerary.');
  const [data,galleries]=await Promise.all(responses.map(response=>response.json()));
  window.itinerary=new Itinerary(data,galleries);window.itinerary.render();$('#loading').hidden=true;
  selectTrip(new URL(location.href).searchParams.get('trip')==='chalmond'?'chalmond':'montreal',false);
  window.addEventListener('load',()=>window.itinerary.renderMap());
} catch(error){$('#loading').textContent=`${error.message} Please refresh the page.`;}
