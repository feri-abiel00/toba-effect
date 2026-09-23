export function formatTime(seconds) {
  seconds = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function formatPace(minPerKm) {
  if (!isFinite(minPerKm) || minPerKm <= 0) return '--';
  const total = Math.round(minPerKm * 60);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatKmh(kmh) {
  return isFinite(kmh) && kmh > 0 ? kmh.toFixed(2) : '0.00';
}

export function formatDate(ts) {
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sanitize(html) {
  const el = document.createElement('div');
  el.textContent = html;
  return el.innerHTML;
}