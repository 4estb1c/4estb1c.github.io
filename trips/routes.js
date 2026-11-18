/** Geography helpers shared by trips. Distances are great-circle kilometres, not street routes. */
export class TripRoute {
  /** @param {{lat:number,lng:number}} point @returns {boolean} */
  static valid(point) {
    return Number.isFinite(point?.lat) && Number.isFinite(point?.lng) && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180;
  }

  /** @param {{lat:number,lng:number}} a @param {{lat:number,lng:number}} b @returns {number} */
  static distance(a, b) {
    if (!this.valid(a) || !this.valid(b)) throw new TypeError('A route needs finite latitude and longitude.');
    const rad = Math.PI / 180;
    const h = Math.sin((b.lat - a.lat) * rad / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lng - a.lng) * rad / 2) ** 2;
    return 6371.0088 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
  }

  /** @param {Array<{lat:number,lng:number}>} stops @returns {number} */
  static length(stops) {
    return stops.slice(1).reduce((total, stop, i) => total + this.distance(stops[i], stop), 0);
  }

  /** Deterministic nearest-neighbor + 2-opt for an untimed browse loop. First and last stay fixed.
   * @template T @param {Array<T & {lat:number,lng:number}>} stops @returns {Array<T & {lat:number,lng:number}>}
   */
  static order(stops) {
    if (stops.some(stop => !this.valid(stop))) throw new TypeError('Invalid route coordinate.');
    if (stops.length < 4) return [...stops];
    const remaining = stops.slice(1, -1);
    const route = [stops[0]];
    while (remaining.length) {
      let closest = 0;
      remaining.forEach((stop, i) => {
        if (this.distance(route.at(-1), stop) < this.distance(route.at(-1), remaining[closest])) closest = i;
      });
      route.push(remaining.splice(closest, 1)[0]);
    }
    route.push(stops.at(-1));
    // Reversing an interior segment only needs comparing its two boundary edges.
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 1; i < route.length - 2; i++) {
        for (let j = i + 1; j < route.length - 1; j++) {
          const before = this.distance(route[i - 1], route[i]) + this.distance(route[j], route[j + 1]);
          const after = this.distance(route[i - 1], route[j]) + this.distance(route[i], route[j + 1]);
          if (after + 1e-8 < before) {
            route.splice(i, j - i + 1, ...route.slice(i, j + 1).reverse());
            improved = true;
          }
        }
      }
    }
    return this.length(route) <= this.length(stops) ? route : [...stops];
  }

  /** Actual street directions are delegated to the map provider, without claiming local street routing.
   * @param {Array<{name:string,lat:number,lng:number}>} stops @param {string} location @returns {string|null}
   */
  static directions(stops, location = '') {
    if (stops.length < 2) return null;
    const address = p => [p.mapQuery || p.name, location].filter(Boolean).join(', ');
    const params = new URLSearchParams({api: '1', origin: address(stops[0]), destination: address(stops.at(-1)), travelmode: 'walking'});
    if (stops.length > 2) params.set('waypoints', stops.slice(1, -1).map(address).join('|'));
    return `https://www.google.com/maps/dir/?${params}`;
  }
}
