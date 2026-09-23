// Live route visualizer for the GPS tracker.
// Uses Leaflet + OpenStreetMap tiles when the network allows it,
// otherwise falls back to a local canvas drawing of the route.

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => resolve(window.L);
    js.onerror = () => resolve(null);
    document.head.appendChild(js);
  });
}

export class TrackMap {
  constructor(container) {
    this.container = container;
    this.map = null;
    this.points = null;
    this.canvas = null;
  }

  async setPoints(points) {
    this.points = points;
    if (!this.container) return;
    if (!points || points.length < 2) {
      this._clear();
      const p = document.createElement('p');
      p.className = 'muted';
      p.style.cssText = 'text-align:center;padding:60px 10px;';
      p.textContent =
        points && points.length === 1
          ? 'Waiting for more GPS signals...'
          : 'No route recorded yet. Start a session to see your route.';
      this.container.appendChild(p);
      return;
    }
    const L = await loadLeaflet();
    if (L) this._leaflet(L);
    else this._canvas();
  }

  _clear() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.container.innerHTML = '';
  }

  _leaflet(L) {
    const pts = this.points;
    if (!this.map) {
      this.container.innerHTML = '<div style="width:100%;height:100%;position:relative;z-index:0;"></div>';
      this.map = L.map(this.container.firstChild, { scrollWheelZoom: false }).setView([pts[0].lat, pts[0].lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
    }
    const latlngs = pts.map((p) => [p.lat, p.lng]);
    if (this._polyline) this._polyline.setLatLngs(latlngs);
    else {
      this._polyline = L.polyline(latlngs, { color: '#b3261e', weight: 5 }).addTo(this.map);
      this._start = L.circleMarker(latlngs[0], { color: '#2e7d32' }).addTo(this.map);
      this._end = L.circleMarker(latlngs[latlngs.length - 1], { color: '#b3261e' }).addTo(this.map);
    }
    if (this._end) this._end.setLatLng(latlngs[latlngs.length - 1]);
    if (!this._bounds) {
      this._bounds = true;
      this.map.fitBounds(latlngs, { padding: [30, 30] });
    }
  }

  _canvas() {
    const pts = this.points;
    const w = this.container.clientWidth || 600;
    const h = this.container.clientHeight || 320;
    this.container.innerHTML = '';
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    cv.style.width = '100%';
    cv.style.height = '100%';
    this.container.appendChild(cv);
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#f7f4ee';
    ctx.fillRect(0, 0, w, h);

    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const pad = 34;
    const sx = (lng) => pad + ((lng - minLng) / (maxLng - minLng || 1)) * (w - pad * 2);
    const sy = (lat) => pad + ((maxLat - lat) / (maxLat - minLat || 1)) * (h - pad * 2);

    ctx.strokeStyle = '#b3261e';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = sx(p.lng), y = sy(p.lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const dot = (x, y, color) => {
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    dot(sx(pts[0].lng), sy(pts[0].lat), '#2e7d32');
    dot(sx(pts[pts.length - 1].lng), sy(pts[pts.length - 1].lat), '#b3261e');
    ctx.font = '13px "Times New Roman", serif';
    ctx.fillStyle = '#5d4037';
    ctx.fillText('START', sx(pts[0].lng) - 22, sy(pts[0].lat) + 28);
    ctx.fillText('FINISH', sx(pts[pts.length - 1].lng) - 24, sy(pts[pts.length - 1].lat) - 18);
  }

  destroy() {
    if (this.map) this.map.remove();
    this.map = null;
  }
}