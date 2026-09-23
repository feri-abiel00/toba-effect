import { haversineKm } from '../utils';

export const MET = { Run: 9.8, Walk: 3.8, Bike: 7.5 };

// A small pseudo-random route generator used for manual (no-GPS) mode.
// Centers near Lake Toba so the drawn route always feels local.
function generateRoute(km, count = 60) {
  const cx = 2.6876; // Lake Toba
  const cy = 98.8554;
  const pts = [];
  let lat = cx, lng = cy;
  let heading = Math.random() * Math.PI * 2;
  const step = km / count;
  for (let i = 0; i < count; i++) {
    heading += (Math.random() - 0.5) * 0.9;
    const dLat = (Math.cos(heading) * step) / 111.32;
    const dLng = (Math.sin(heading) * step) / (111.32 * Math.cos((lat * Math.PI) / 180));
    lat += dLat;
    lng += dLng;
    pts.push({ lat, lng });
  }
  return pts;
}

export class TrackSession {
  constructor(activity, weightKg, onUpdate) {
    this.activity = activity;
    this.weight = weightKg;
    this.onUpdate = onUpdate;
    this.points = [];
    this.distance = 0;
    this.startTs = Date.now();
    this.lastPos = null;
    this.watchId = null;
    this.currentSpeed = 0;
    this.manual = false;
    this.error = null;
    this._pausedMs = 0;
    this._pauseStart = null;
  }

  elapsed() {
    const now = this._pauseStart || Date.now();
    return (now - this.startTs - this._pausedMs) / 1000;
  }

  pause() {
    if (this._pauseStart) return;
    this._pauseStart = Date.now();
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  resume() {
    if (!this._pauseStart) return;
    this._pausedMs += Date.now() - this._pauseStart;
    this._pauseStart = null;
    if (!this.manual && this.watchId === null) this.startGps();
  }

  startGps() {
    if (!navigator.geolocation) {
      this.error = 'GPS is not available on this device.';
      this.manual = true;
      return this.error;
    }
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.onPosition(pos.coords),
      (err) => {
        this.error = `GPS error: ${err.message || err.code}. You can use Manual mode instead.`;
        if (this.onUpdate) this.onUpdate();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    return null;
  }

  startManual(distanceKm) {
    this.manual = true;
    this.distance = distanceKm;
    this.points = generateRoute(distanceKm);
    if (this.onUpdate) this.onUpdate();
  }

  onPosition(coords) {
    const now = Date.now();
    const point = { lat: coords.latitude, lng: coords.longitude, ts: now };
    if (this.lastPos) {
      const dt = (now - this.lastPos.ts) / 1000;
      const seg = haversineKm(this.lastPos, point);
      if (seg >= 0.001 && dt > 0) {
        this.distance += seg;
        this.currentSpeed = seg / (dt / 3600);
      }
    }
    this.lastPos = point;
    this.points.push(point);
    if (this.points.length > 400) this.points.splice(0, 100);
    if (this.onUpdate) this.onUpdate();
  }

  stats(currentWeight = this.weight) {
    const elapsed = this.elapsed();
    const hours = elapsed / 3600;
    const avgSpeed = hours > 0 && this.distance > 0 ? this.distance / hours : 0;
    const pace = this.distance > 0 ? elapsed / 60 / this.distance : 0;
    const calories = hours > 0 ? Math.round(MET[this.activity] * currentWeight * hours) : 0;
    return { elapsed, distance: this.distance, avgSpeed, pace, calories, points: this.points };
  }

  stop() {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
    return this.stats();
  }
}