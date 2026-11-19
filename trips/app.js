/* Portable Montréal itinerary. Explicit stop IDs replace the old template's heading matching. */
(() => {
  const photos = JSON.parse(document.getElementById('photos-data').textContent);
  const routes = JSON.parse(document.getElementById('routes-data').textContent);
  const maps = new Map();
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  // Photos are embedded, so opening the HTML directly never needs a local server.
  document.querySelectorAll('img[data-image]').forEach(img => {
    img.src = photos[img.dataset.image].data;
  });

  function initMap(day) {
    const pane = document.querySelector(`[data-pane="${day}"]`);
    const container = document.getElementById(`day-map-${day}`);
    if (!window.L) {
      container.hidden = true;
      pane.querySelector('.map-fallback').hidden = false;
      return;
    }
    if (maps.has(day)) {
      const existing = maps.get(day);
      existing.map.invalidateSize();
      existing.map.fitBounds(existing.bounds, {padding:[35,35],maxZoom:16});
      return;
    }
    const plan = routes.days[day];
    const mobile = window.matchMedia?.('(max-width: 640px), (pointer: coarse)').matches ?? false;
    const map = L.map(container, {
      scrollWheelZoom:false,
      zoomControl:!mobile,
      dragging:!mobile,
      touchZoom:!mobile,
      doubleClickZoom:!mobile,
      boxZoom:!mobile,
      keyboard:!mobile
    });
    // OSM's public tile server requires a Referer, which file:// pages cannot send.
    // This public Esri basemap also works when the portable HTML is opened locally.
    const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom:19,
      referrerPolicy:'no-referrer',
      attribution:'Tiles &copy; <a href="https://www.arcgis.com/home/item.html?id=3b93337983e9436f8db950e38a8629af">Esri and contributors</a> &middot; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    tiles.on('tileerror', () => {
      pane.querySelector('.map-fallback').hidden = false;
    });
    tiles.addTo(map);
    const groups = new Map();
    const coordinates = [[routes.hotel.lat,routes.hotel.lng]];
    plan.stops.forEach(stop => {
      const key = `${stop.lat},${stop.lng}`;
      if (!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(stop);
      coordinates.push([stop.lat,stop.lng]);
    });
    // Dashed segments are an ordering aid; actual navigation uses each stop's directions.
    const path = [[routes.hotel.lat,routes.hotel.lng], ...plan.stops.map(stop=>[stop.lat,stop.lng])];
    if(path.length>1)L.polyline(path,{color:plan.color,weight:2.5,dashArray:'6,6',opacity:.7}).addTo(map);
    groups.forEach(stops => {
      const first = stops[0];
      const numbers = [...new Set(stops.map(stop=>stop.n))].join(',');
      const icon = L.divIcon({className:'',html:`<span class="map-pin" style="background:${plan.color};width:${numbers.length>2 ? 43 : 28}px">${numbers}</span>`,iconSize:[numbers.length>2?43:28,28],iconAnchor:[14,14]});
      const popup = stops.map(stop=>`<b>${stop.n}. ${escapeHtml(stop.name)}</b><br>${escapeHtml(stop.time)}<br><a href="#${stop.anchor}">See this stop and photos</a>`).join('<hr>');
      L.marker([first.lat,first.lng],{icon,title:first.name}).addTo(map).bindPopup(popup);
    });
    if(!plan.stops.some(stop=>stop.id===routes.hotel.id)) {
      L.marker([routes.hotel.lat,routes.hotel.lng],{title:routes.hotel.name,icon:L.divIcon({className:'',html:'<span class="map-pin" style="background:#1a1612">H</span>',iconSize:[28,28]})}).addTo(map).bindPopup(`<b>${escapeHtml(routes.hotel.name)}</b><br>Your booked hotel base`);
    }
    const bounds = L.latLngBounds(coordinates);
    map.fitBounds(bounds,{padding:[35,35],maxZoom:16});
    maps.set(day,{map,bounds});
  }

  window.addEventListener('resize',()=>requestAnimationFrame(()=>{
    Object.keys(routes.days).forEach(initMap);
  }));
  Object.keys(routes.days).forEach(initMap);

  const alternatives = [...document.querySelectorAll('.nearby-panel')];
  const toggleAlternatives = document.getElementById('toggle-alternatives');
  function updateAlternativesButton() {
    const expanded = alternatives.every(panel=>panel.open);
    toggleAlternatives.textContent = expanded ? 'Collapse all alternatives' : 'Expand all alternatives';
    toggleAlternatives.setAttribute('aria-expanded',String(expanded));
  }
  toggleAlternatives.addEventListener('click',()=>{
    const expand = !alternatives.every(panel=>panel.open);
    alternatives.forEach(panel=>{panel.open=expand;});
    updateAlternativesButton();
  });
  alternatives.forEach(panel=>panel.addEventListener('toggle',updateAlternativesButton));

  const viewer = document.getElementById('photo-viewer');
  let currentPhoto;
  let opener;
  function showPhoto(key) {
    const photo = photos[key];
    if(!photo)return;
    currentPhoto = key;
    const img = document.getElementById('viewer-image');
    img.src=photo.data;img.alt=photo.alt;
    document.getElementById('viewer-caption').textContent=photo.alt;
    document.getElementById('photo-count').textContent=`${photo.index+1} / 3`;
    document.getElementById('viewer-credit').innerHTML=`${escapeHtml(photo.credit||'')} <a href="${escapeHtml(photo.source)}" target="_blank" rel="noopener">Photo source</a>`;
    if(!viewer.open)viewer.showModal();
  }
  function stepPhoto(delta) {
    const photo=photos[currentPhoto];
    if(photo)showPhoto(`${photo.group}-${(photo.index+delta+3)%3}`);
  }
  document.querySelectorAll('button[data-photo]').forEach(button=>button.addEventListener('click',()=>{
    opener=button;showPhoto(button.dataset.photo);
  }));
  document.getElementById('photo-prev').addEventListener('click',()=>stepPhoto(-1));
  document.getElementById('photo-next').addEventListener('click',()=>stepPhoto(1));
  document.getElementById('photo-close').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('close',()=>opener?.focus({preventScroll:true}));
  viewer.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight')stepPhoto(1);
    if(event.key==='ArrowLeft')stepPhoto(-1);
  });
})();
