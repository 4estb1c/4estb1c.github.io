import { TripRoute } from './routes.js';

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = selector => document.querySelector(selector);
const money = value => Math.round(value).toLocaleString('en-CA');
const mapsLink = (place, location) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.mapQuery || place.name}, ${location}`)}`;

/** One data record supplies the guide, itinerary, map, and budget for a trip. */
class TripPlanner {
  constructor(data, credits) {
    this.data = data;
    this.credits = credits;
    this.proposal = data.proposals[0];
    this.day = 'saturday';
    this.mapMode = 'day';
    this.browseOrder = null;
    this.saved = new Set();
    this.storageAvailable = true;
    try { this.saved = new Set(JSON.parse(localStorage.getItem(`atlas-${data.id}-saved`) || '[]')); }
    catch { this.storageAvailable = false; }
    this.map = null;
    this.layer = null;
  }

  photo(key, alt, css = '') {
    if (!this.credits[key]?.file) return `<div class="hotel-fallback ${css}">${escapeHtml(alt)}</div>`;
    return `<img class="${css}" src="${escapeHtml(this.credits[key].file)}" alt="${escapeHtml(alt)}" loading="lazy" width="1200" height="800">`;
  }

  researchHtml() {
    const research=this.data.research;
    if(!research)return '';
    return `<section class="section" id="research"><div class="section-head"><div><div class="section-number">THE TASTE CHECK / SOURCES & COMMUNITY SIGNALS</div><h2>${escapeHtml(research.title)}</h2></div><p>Ratings help check a choice. The activity, atmosphere, price, and location decide whether it fits.</p></div><p class="research-intro">${escapeHtml(research.intro)}</p><div class="taste-grid">${research.patterns.map(pattern=>`<article><div class="eyebrow">From the saved trip</div><h3>${escapeHtml(pattern.past)}</h3><p>${escapeHtml(pattern.now)}</p></article>`).join('')}</div><details class="research-method"><summary>How I chose the places, and what the numbers mean</summary><p>${escapeHtml(research.method)}</p><p>${escapeHtml(research.limits)}</p><ul>${research.sources.map(source=>`<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)} ↗</a></li>`).join('')}</ul></details></section>`;
  }

  evidenceHtml(place) {
    if(!place.fit&&!place.evidence?.length)return '';
    const [first,...other]=place.evidence||[];
    return `${first?`<p class="signal-summary"><a href="${escapeHtml(first.url)}" target="_blank" rel="noopener">${escapeHtml(first.label)} ↗</a></p>`:''}<details class="place-evidence"><summary>Why it fits / tradeoffs</summary>${place.fit?`<p>${escapeHtml(place.fit)}</p>`:''}${other.length?`<ul>${other.map(source=>`<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)} ↗</a></li>`).join('')}</ul>`:''}${place.tradeoff?`<p><b>Keep in mind:</b> ${escapeHtml(place.tradeoff)}</p>`:''}</details>`;
  }

  uniqueHtml() {
    const unique=this.data.unique;
    if(!unique)return '';
    return `<section class="section" id="unique"><div class="section-head"><div><div class="section-number">SPECIFIC TO THE PLACE / A SHORT LIST</div><h2>${escapeHtml(unique.title)}</h2></div><p>Four considered options, with a reason to go and a reason you might skip each one.</p></div><p class="research-intro">${escapeHtml(unique.intro)}</p><div class="unique-grid">${unique.ids.map(id=>{const p=this.data.places.find(place=>place.id===id);return `<article class="unique-card">${this.photo(p.image,p.name)}<div class="unique-body"><p class="eyebrow">${escapeHtml(p.unique)}</p><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.unique_reason)}</p><p class="unique-swap">${escapeHtml(p.swap)}</p><details><summary>The practical catch</summary><p>${escapeHtml(p.note)}</p><p>${escapeHtml(p.tradeoff)}</p></details><button data-unique-place="${p.id}" class="text-link">See full details & sources ↗</button></div></article>`;}).join('')}</div><div class="notice">${escapeHtml(unique.verdict)}</div><details class="research-method"><summary>What I checked but did not add to the plan</summary>${unique.excluded.map(item=>`<p><b>${escapeHtml(item.name)}:</b> ${escapeHtml(item.reason)} <a href="${escapeHtml(item.source)}" target="_blank" rel="noopener">Source ↗</a></p>`).join('')}</details></section>`;
  }

  render() {
    $('#trip-content').innerHTML = `
      <section class="hero"><div class="hero-copy"><p class="eyebrow">Québec, Canada / ${escapeHtml(this.data.dates)}</p><h1>${escapeHtml(this.data.title)}<em>for the weekend.</em></h1><p class="intro">${escapeHtml(this.data.intro)}</p><div class="hero-meta"><div>Traveling with<strong>${escapeHtml(this.data.travelers)}</strong></div><div>The brief<strong>Eat well. Wander. Repeat.</strong></div></div></div><figure class="hero-photo">${this.photo('oldmontreal','The stone streets and architecture of Old Montréal')}<div class="hero-stamp">48 HOURS<br>A LITTLE<br>FURTHER NORTH</div><figcaption>01 / OLD MONTRÉAL · A GOOD PLACE TO BEGIN</figcaption></figure></section>
      <nav class="jump-nav" aria-label="Trip sections"><a href="#unique">Only here?</a><a href="#proposals">The proposals</a><a href="#itinerary">Day by day</a><a href="#neighborhoods">Neighborhoods</a><a href="#places">The shortlist</a><a href="#research">Why these places</a><a href="#hotels">Where to stay</a><a href="#map-section">The map</a><a href="#practical">Before you go</a></nav>
      ${this.uniqueHtml()}
      <section class="section" id="proposals"><div class="section-head"><div><div class="section-number">01 / CHOOSE YOUR MOOD</div><h2>Three ways to spend it.</h2></div><p>Same city, a different emphasis. Choosing a proposal updates the itinerary, route, and budget.</p></div><div class="proposal-grid">${this.data.proposals.map(p => `<button class="proposal" data-proposal="${p.id}" aria-pressed="${p.id === this.proposal.id}"><span class="label">${escapeHtml(p.tag)}</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p><span class="choose">${p.id === this.proposal.id ? 'Selected ✓' : 'Explore this version ↗'}</span></button>`).join('')}</div><div class="notice"><strong>The one fixed point:</strong> target leaving Montréal at <b>1:30 PM Sunday</b>, with <b>2 PM as this plan’s cutoff</b>, for a 10 PM Boston arrival target. Check live traffic and US-bound border waits; leave earlier if needed.</div></section>
      <section class="section" id="itinerary"><div class="section-head"><div><div class="section-number">02 / THE LOOSE PLAN</div><h2>A little structure. Plenty of room.</h2></div><p>One main neighborhood at a time. Every detour is optional. All times are Eastern.</p></div><div class="days" aria-label="Itinerary day"></div><div id="day-content" aria-live="polite"></div></section>
      <section class="section" id="neighborhoods"><div class="section-head"><div><div class="section-number">03 / FIND YOUR PATCH OF THE CITY</div><h2>Follow the neighborhood.</h2></div><p>These are places to spend time, with several good options nearby. Follow your curiosity within each cluster.</p></div><div class="area-grid">${this.data.areas.map(a => `<article class="area-card">${this.photo(a.image,a.name)}<div class="tag">${escapeHtml(a.tag)}</div><h3>${escapeHtml(a.name)}</h3><p>${escapeHtml(a.description)}</p><button data-area="${a.id}">See the places here ↗</button> · <a class="text-link" href="${a.source}" target="_blank" rel="noopener">Area guide</a></article>`).join('')}</div></section>
      ${this.researchHtml()}
      <section class="section" id="places"><div class="section-head"><div><div class="section-number">04 / SAVE WHAT CATCHES YOUR EYE</div><h2>The good-stuff shortlist.</h2></div><p>Food is the anchor. Independent shops and good walks fill the spaces in between. Save a few to build your own browse route.</p></div><div class="filter-row"><input id="search" type="search" placeholder="Search food, scents, a skyline…" aria-label="Search places"><select id="area-filter" aria-label="Filter by neighborhood"><option value="all">All neighborhoods</option>${this.data.areas.map(a=>`<option value="${a.id}">${escapeHtml(a.name)}</option>`).join('')}</select><select id="kind-filter" aria-label="Filter by type"><option value="all">All types</option>${[...new Set(this.data.places.map(p=>p.kind))].map(k=>`<option>${k}</option>`).join('')}</select><button class="chip" id="saved-only" aria-pressed="false">Saved only ♡</button></div><div id="results-count" class="results-count" role="status"></div><div id="places-grid" class="places-grid"></div></section>
      <section class="section" id="hotels"><div class="section-head"><div><div class="section-number">05 / TWO NIGHTS, A GOOD BASE</div><h2>Where to put your bags.</h2></div><p>Shortlist by all-in cost and bed setup. These are target budgets, not date-specific quotes or availability.</p></div><div class="hotel-grid">${this.data.hotels.map(h=>`<article class="hotel">${this.photo(h.image,h.name)}<div class="body"><span class="label">${escapeHtml(h.label)}</span><h3>${escapeHtml(h.name)}</h3><div class="rate">CAD ${h.target[0]}–${h.target[1]} / room / night target</div><p>${escapeHtml(h.description)}</p><p class="details"><b>Beds:</b> ${escapeHtml(h.beds)}</p><p class="details"><b>Parking:</b> ${escapeHtml(h.parking)}</p><a class="text-link" href="${h.source}" target="_blank" rel="noopener">Rooms & current booking ↗</a><br><button class="select-hotel" data-hotel="${h.id}">Use in budget</button></div></article>`).join('')}</div><div class="budget-box"><div><p class="eyebrow">A transparent planning allowance</p><div class="budget-inputs"><label>Room / night (CAD)<input id="room-rate" type="number" min="0" max="3000" step="5" value="350"></label><label>Parking / day (CAD)<input id="parking-rate" type="number" min="0" max="300" step="5" value="45"></label><label>Hotel buffer (%)<input id="hotel-buffer" type="number" min="0" max="100" value="20"></label><label>Food tax + tip buffer (%)<input id="food-buffer" type="number" min="0" max="100" value="33"></label></div><p class="budget-detail">Two nights, one room split two ways; two parking days split two ways. Buffers are adjustable planning cushions, not a tax calculation. Add fuel, travel insurance if needed, shopping, and any extra parking period separately.</p></div><div><div id="budget-total" class="budget-total" aria-live="polite"></div><div id="budget-detail" class="budget-detail"></div></div></div></section>
      <section class="section" id="map-section"><div class="section-head"><div><div class="section-number">06 / KEEP IT GEOGRAPHIC</div><h2>Less crossing town. More being there.</h2></div><p>Approximate venue pins and straight-line guides. Street directions open separately; use taxis or transit for longer transfers.</p></div><div class="map-layout"><aside class="map-aside"><div class="map-controls"><button data-map="day" aria-pressed="true">Day route</button><button data-map="saved" aria-pressed="false">Saved places</button></div><p id="route-summary" role="status"></p><ol id="route-stops"></ol><div id="route-links"></div><button id="optimize" class="chip" hidden>Shorten untimed browse route</button><p id="route-note">Timed itinerary stops stay in their planned order. Lines do not account for hills, entrances, closures, or street layout.</p></aside><div id="map" class="map" role="region" aria-label="Interactive Montréal trip map"></div></div></section>
      <section class="section" id="practical"><div class="section-head"><div><div class="section-number">07 / A FEW THINGS TO KNOW</div><h2>Before you go.</h2></div><p>Research checked ${escapeHtml(this.data.checked)}. Recheck operator hours and bookings before departure.</p></div><div class="logistics">${this.data.logistics.map((item,i)=>`<details ${i<2?'open':''}><summary>${escapeHtml(item.title)}</summary><p>${escapeHtml(item.body)}</p><a class="text-link" href="${item.source}" target="_blank" rel="noopener">Source / live check ↗</a></details>`).join('')}</div><p class="source-note">Venue links are the sources for each recommendation. Photos are reference images from the credited operator or tourism pages and may show another season. Area photos are explicitly labeled on individual place cards. <a href="images/credits.json" target="_blank" rel="noopener">Photo sources ↗</a>. The recovered Chalmond pages use photos pinned to the original Git commit.</p></section>`;
    this.bind();
    this.renderDay();
    this.renderPlaces();
    this.selectHotel(this.proposal.hotel);
  }

  bind() {
    document.querySelectorAll('[data-unique-place]').forEach(button=>button.addEventListener('click',()=>{
      const place=this.data.places.find(p=>p.id===button.dataset.uniquePlace);
      $('#search').value=place.name; $('#area-filter').value='all'; $('#kind-filter').value='all';
      $('#saved-only').setAttribute('aria-pressed','false'); this.renderPlaces(); $('#places').scrollIntoView();
    }));
    document.querySelectorAll('[data-proposal]').forEach(button=>button.addEventListener('click',()=>{
      this.proposal=this.data.proposals.find(p=>p.id===button.dataset.proposal);
      document.querySelectorAll('[data-proposal]').forEach(b=>{
        const selected=b.dataset.proposal===this.proposal.id;
        b.setAttribute('aria-pressed',selected);
        b.querySelector('.choose').textContent=selected?'Selected ✓':'Explore this version ↗';
      });
      this.browseOrder=null;
      this.renderDay();
      this.selectHotel(this.proposal.hotel);
    }));
    document.querySelectorAll('[data-area]').forEach(button=>button.addEventListener('click',()=>{
      $('#area-filter').value=button.dataset.area;
      $('#kind-filter').value='all'; $('#search').value=''; $('#saved-only').setAttribute('aria-pressed','false');
      this.renderPlaces(); $('#places').scrollIntoView();
    }));
    ['#search','#area-filter','#kind-filter'].forEach(id=>$(id).addEventListener('input',()=>this.renderPlaces()));
    $('#saved-only').addEventListener('click',()=>{
      const b=$('#saved-only'); b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true'); this.renderPlaces();
    });
    document.querySelectorAll('[data-hotel]').forEach(button=>button.addEventListener('click',()=>this.selectHotel(button.dataset.hotel)));
    ['#room-rate','#parking-rate','#hotel-buffer','#food-buffer'].forEach(id=>$(id).addEventListener('input',()=>this.renderBudget()));
    document.querySelectorAll('[data-map]').forEach(button=>button.addEventListener('click',()=>{
      this.mapMode=button.dataset.map;
      document.querySelectorAll('[data-map]').forEach(b=>b.setAttribute('aria-pressed',b===button));
      this.renderMap();
    }));
    $('#optimize').addEventListener('click',()=>{
      this.browseOrder=TripRoute.order(this.getStops()); this.renderMap();
    });
  }

  renderDay() {
    $('.days').innerHTML=this.proposal.days.map(d=>`<button data-day="${d.id}" aria-pressed="${d.id===this.day}">${d.label} <span> / ${d.date}</span></button>`).join('');
    $('.days').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
      this.day=button.dataset.day; this.renderDay();
    }));
    const d=this.proposal.days.find(day=>day.id===this.day);
    $('#day-content').innerHTML=this.dayHtml(d);
    this.renderMap();
  }

  dayHtml(d) {
    return `<div class="day-panel"><div class="day-summary"><p class="eyebrow">${d.date} / ${escapeHtml(this.proposal.title)}</p><h3>${escapeHtml(d.title)}</h3><p>${escapeHtml(d.summary)}</p><a class="text-link" href="#map-section">See this route on the map ↗</a></div><ol class="timeline">${d.blocks.map(([time,title,body])=>`<li><time>${escapeHtml(time)}</time><h4>${escapeHtml(title)}</h4><p>${escapeHtml(body)}</p></li>`).join('')}</ol></div>`;
  }

  renderPlaces() {
    const query=$('#search').value.toLowerCase().trim();
    const area=$('#area-filter').value, kind=$('#kind-filter').value;
    const onlySaved=$('#saved-only').getAttribute('aria-pressed')==='true';
    const places=this.data.places.filter(p=>(area==='all'||p.area===area)&&(kind==='all'||p.kind===kind)&&(!onlySaved||this.saved.has(p.id))&&`${p.name} ${p.detail} ${p.kind}`.toLowerCase().includes(query));
    $('#results-count').textContent=`${places.length} places · ${this.saved.size} saved${this.storageAvailable?' · Saved on this browser':' · Saves available for this session only'}`;
    $('#places-grid').innerHTML=places.length?places.map(p=>{
      const a=this.data.areas.find(area=>area.id===p.area);
      const areaPhoto=this.data.areas.some(area=>area.image===p.image)&&!['stviateur','lookout','jeantalon'].includes(p.id);
      return `<article class="place"><div class="place-photo">${this.photo(p.image,areaPhoto?`${a.name} — area reference photo`:p.name)}${p.photo_label||areaPhoto?`<span class="photo-label">${escapeHtml(p.photo_label||`AREA REFERENCE / ${a.name}`)}</span>`:''}<button class="save" data-save="${p.id}" aria-label="Save ${escapeHtml(p.name)}" aria-pressed="${this.saved.has(p.id)}">${this.saved.has(p.id)?'Saved ♥':'Save ♡'}</button></div><div class="place-body"><div class="kicker">${p.kind} / ${escapeHtml(a.name)}${p.pick?` · ${escapeHtml(p.pick)}`:''}</div><h3>${escapeHtml(p.name)}</h3><div class="budget">${escapeHtml(p.budget)}</div><p>${escapeHtml(p.detail)}</p><p class="note">${escapeHtml(p.note)}</p>${this.evidenceHtml(p)}<div class="place-links"><a href="${p.source}" target="_blank" rel="noopener">Source / visit ↗</a><a href="${mapsLink(p,this.data.location)}" target="_blank" rel="noopener">Find on map ↗</a></div></div></article>`;
    }).join(''):'<p class="empty">No places match. Try another neighborhood or type, or save places from the full shortlist.</p>';
    $('#places-grid').querySelectorAll('[data-save]').forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.save;
      this.saved.has(id)?this.saved.delete(id):this.saved.add(id);
      try {localStorage.setItem(`atlas-${this.data.id}-saved`,JSON.stringify([...this.saved]));}
      catch {this.storageAvailable=false;}
      this.browseOrder=null;
      this.renderPlaces(); this.renderMap();
    }));
  }

  selectHotel(id) {
    const hotel=this.data.hotels.find(h=>h.id===id);
    $('#room-rate').value=Math.round((hotel.target[0]+hotel.target[1])/2/5)*5;
    document.querySelectorAll('[data-hotel]').forEach(b=>{
      b.textContent=b.dataset.hotel===id?'Using target midpoint ✓':'Use in budget';
      b.setAttribute('aria-pressed',b.dataset.hotel===id);
    });
    this.renderBudget();
  }

  renderBudget() {
    const input=id=>Math.max(0,Number($(id).value)||0);
    const room=input('#room-rate'), parking=input('#parking-rate');
    const hotel=(room+parking)*(1+input('#hotel-buffer')/100);
    const food=this.proposal.food.map(v=>v*(1+input('#food-buffer')/100));
    const extra=this.proposal.extra?.map(v=>v*(1+input('#hotel-buffer')/100))||[0,0];
    $('#budget-total').innerHTML=`CAD ${money(hotel+food[0]+extra[0])}–${money(hotel+food[1]+extra[1])}<small>PER PERSON / WEEKEND PLANNING RANGE</small>`;
    $('#budget-detail').textContent=`${this.proposal.title}: hotel + parking share ≈ CAD ${money(hotel)}; food ≈ CAD ${money(food[0])}–${money(food[1])}${extra[1]?`; optional spa allowance ≈ CAD ${money(extra[0])}–${money(extra[1])}`:''}. Includes the selected buffers. Fuel, shopping, and other admission or transport extra. Hotel rate uses a target midpoint until you enter an actual quote.`;
  }

  getStops() {
    if(this.mapMode==='saved') return this.browseOrder||this.data.places.filter(p=>this.saved.has(p.id));
    return this.proposal.days.find(d=>d.id===this.day).route.map(id=>this.data.places.find(p=>p.id===id));
  }

  renderMap() {
    if(!$('#map')) return;
    const stops=this.getStops();
    $('#route-summary').textContent=stops.length?`${stops.length} stops · ${TripRoute.length(stops).toFixed(1)} km straight-line total. Actual travel is longer; this is not a walking-time estimate.`:'No route stops yet. Save a few places, or choose another day.';
    $('#route-stops').innerHTML=stops.map((p,i)=>`<li><button data-pin="${i}">${escapeHtml(p.name)}</button></li>`).join('');
    $('#route-links').innerHTML='';
    // Google Maps mobile supports fewer intermediate points. Split with overlapping endpoints.
    for(let start=0;start<stops.length-1;start+=4){
      const part=stops.slice(start,start+5);
      const link=document.createElement('a'); link.className='text-link'; link.href=TripRoute.directions(part,this.data.location); link.target='_blank'; link.rel='noopener';
      link.textContent=`Street directions${stops.length>5?` · part ${Math.floor(start/4)+1}`:''} ↗`; $('#route-links').append(link);
    }
    $('#optimize').hidden=this.mapMode!=='saved'||stops.length<4;
    $('#route-note').textContent=this.mapMode==='saved'?'Saved places form an untimed browse route. Shortening keeps the first and last stop fixed and uses straight-line distances. It does not account for opening hours or bookings.':'Timed itinerary stops stay in their planned order. Lines do not account for hills, entrances, closures, or street layout. Use taxis or transit between distant clusters.';
    if(!window.L){$('#map').innerHTML='<p class="map-unavailable">The interactive map could not load. The stop list and street-directions links still work.</p>';return;}
    if(!this.map){
      this.map=L.map('map',{scrollWheelZoom:false}).setView(this.data.center,12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(this.map);
      this.layer=L.layerGroup().addTo(this.map);
    }
    this.layer.clearLayers();
    const markers=stops.map((p,i)=>L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:`<div class="number-pin">${i+1}</div>`,iconSize:[26,26]}),title:p.name}).bindPopup(`<b>${escapeHtml(p.name)}</b><br>${escapeHtml(p.budget)}<br><a href="${mapsLink(p,this.data.location)}" target="_blank" rel="noopener">Find actual entrance ↗</a>`).addTo(this.layer));
    if(stops.length>1)L.polyline(stops.map(p=>[p.lat,p.lng]),{color:'#38563d',weight:2,dashArray:'5 7'}).addTo(this.layer);
    if(stops.length)this.map.fitBounds(L.latLngBounds(stops.map(p=>[p.lat,p.lng])),{padding:[35,35],maxZoom:15});
    $('#route-stops').querySelectorAll('[data-pin]').forEach(b=>b.addEventListener('click',()=>{
      const marker=markers[Number(b.dataset.pin)];this.map.setView(marker.getLatLng(),16);marker.openPopup();
    }));
    requestAnimationFrame(()=>this.map.invalidateSize());
  }
}

function selectTrip(id, push=true) {
  const archive=id==='chalmond';
  $('#archive').hidden=!archive; $('#trip-content').hidden=archive;
  document.querySelectorAll('[data-trip]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.trip===id));
  if(archive&&!$('iframe').getAttribute('src'))$('iframe').src='chalmondtrip/itinerary.html';
  document.title=archive?'Weekend Atlas · Chalmond archive':'Weekend Atlas · Montréal';
  if(push){const url=new URL(location.href);url.searchParams.set('trip',id);history.pushState({},'',url);}
  if(!archive&&window.planner)requestAnimationFrame(()=>window.planner.renderMap());
}

document.querySelectorAll('[data-trip]').forEach(b=>b.addEventListener('click',()=>selectTrip(b.dataset.trip)));
window.addEventListener('popstate',()=>selectTrip(new URL(location.href).searchParams.get('trip')==='chalmond'?'chalmond':'montreal',false));
$('#print').addEventListener('click',()=>window.print());

try {
  const [dataResponse,creditsResponse]=await Promise.all([fetch('montreal.json'),fetch('images/credits.json')]);
  if(!dataResponse.ok||!creditsResponse.ok)throw new Error('Could not load the trip files.');
  const [data,credits]=await Promise.all([dataResponse.json(),creditsResponse.json()]);
  window.planner=new TripPlanner(data,credits);
  window.planner.render(); $('#loading').hidden=true;
  selectTrip(new URL(location.href).searchParams.get('trip')==='chalmond'?'chalmond':'montreal',false);
  // Printing includes all three days of the selected proposal.
  window.addEventListener('beforeprint',()=>{
    $('#day-content').innerHTML=window.planner.proposal.days.map(d=>`<div class="print-day">${window.planner.dayHtml(d)}</div>`).join('');
    document.querySelectorAll('.logistics details').forEach(d=>{d.dataset.wasOpen=d.open;d.open=true;});
  });
  window.addEventListener('afterprint',()=>{
    window.planner.renderDay();
    document.querySelectorAll('.logistics details').forEach(d=>{d.open=d.dataset.wasOpen==='true';});
  });
} catch(error) {
  $('#loading').textContent=`The trip could not load. Please refresh, or open this folder through a web server. ${error.message}`;
}

window.addEventListener('load',()=>window.planner?.renderMap());
