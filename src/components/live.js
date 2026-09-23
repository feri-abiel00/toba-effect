import { TrackMap } from './map';

// Live "you are here" locator. Runs its own GPS watcher so the user always
// sees their current position on the map, even when no session is started.
export class LiveLocator {
  constructor(container) {
    this.map = new TrackMap(container);
    this.watchId = null;
    this.running = false;
    this.onStatus = null;
    this.fixed = false;
  }

  start() {
    if (this.running) return;
    if (!navigator.geolocation) {
      this.map.setLiveMessage('GPS is not available on this device. Use Manual mode to log a session.');
      return;
    }
    this.running = true;
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this._onPos(pos.coords),
      (err) => this._onErr(err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }

  _onPos(c) {
    const lat = c.latitude;
    const lng = c.longitude;
    const acc = c.accuracy || 0;
    this.map.setLive(lat, lng, acc, 'YOU ARE HERE');
    if (this.onStatus) {
      const txt = `You are here: ${lat.toFixed(5)}, ${lng.toFixed(5)} ±${Math.round(acc)} m`;
      this.onStatus(txt);
    }
  }

  _onErr() {
    this.map.setLiveMessage('Location is off. Enable location access to see where you are right now.');
    if (this.onStatus) this.onStatus('GPS unavailable');
  }

  stop() {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
    this.running = false;
  }

  destroy() {
    this.stop();
    this.map.destroy();
  }
}