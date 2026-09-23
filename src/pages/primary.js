import { CARDIO_CHALLENGES } from '../data/cardioChallenges';
import { TrackSession } from '../components/gps';
import { TrackMap } from '../components/map';
import { renderChallengeList } from '../components/challenges';
import { getWeight, setWeight, listWorkouts, removeWorkout, makeWorkout, saveWorkout } from '../store';
import { formatTime, formatPace, formatKmh, formatDate } from '../utils';
import { toast } from '../ui';

const ACTIVITIES = ['Run', 'Walk', 'Bike'];

let timers = [];
let currentMap = null;
let routeMaps = [];

function clearTimers() {
  timers.forEach((t) => clearInterval(t));
  timers = [];
}

function clearRouteMaps() {
  routeMaps.forEach((m) => m.destroy());
  routeMaps = [];
}

export async function renderPrimary(view, section, param) {
  clearTimers();
  clearRouteMaps();
  if (currentMap) {
    currentMap.destroy();
    currentMap = null;
  }
  section = section || 'track';

  view.innerHTML = `
    <div class="page">
      <h2 class="page-title">Primary Effect</h2>
      <p class="page-sub">Track your run, walk and bike sessions like a pro - live distance, speed, pace and calories.</p>
      <div class="tabs">
        <a class="tab ${section === 'track' ? 'active' : ''}" href="#/primary/track">Strava Tracker</a>
        <a class="tab ${section === 'challenges' ? 'active' : ''}" href="#/primary/challenges">Challenges (100)</a>
        <a class="tab ${section === 'history' ? 'active' : ''}" href="#/primary/history">History</a>
      </div>
      <div id="primary-body"></div>
    </div>`;

  const body = view.querySelector('#primary-body');
  if (section === 'challenges') {
    await renderChallengeList(body, CARDIO_CHALLENGES, 'cardio');
  } else if (section === 'history') {
    await renderHistory(body);
  } else {
    renderTracker(body);
  }
}

// ---------------------------------------------------------------- tracker
function renderTracker(body) {
  let activity = localStorage.getItem('toba-activity') || 'Run';
  let session = null;
  let status = 'idle';
  let weight = getWeight();
  let tick = 0;
  let map;

  body.innerHTML = `
    <div class="card">
      <h4>New Session</h4>
      <p class="hint">Choose an activity, then use your GPS to record a real session. Manual mode lets you log a session by distance.</p>
      <div class="chips" id="act-chips"></div>
      <div class="row" style="margin-top:16px;">
        <div class="field">
          <label>Your weight (kg)</label>
          <input id="w-input" type="number" min="30" max="250" step="0.5" value="${weight}" />
        </div>
        <span class="hint">Used to estimate calories burned.</span>
      </div>
    </div>

    <div class="card">
      <div class="stats">
        <div class="stat"><div class="value mono-metrics" id="s-dist">0.00</div><div class="label">Distance (km)</div></div>
        <div class="stat"><div class="value mono-metrics" id="s-time">00:00</div><div class="label">Time</div></div>
        <div class="stat"><div class="value mono-metrics" id="s-speed">0.00</div><div class="label">Avg Speed (km/h)</div></div>
        <div class="stat"><div class="value mono-metrics" id="s-pace">--</div><div class="label">Pace (min/km)</div></div>
        <div class="stat"><div class="value mono-metrics" id="s-kcal">0</div><div class="label">Calories (kcal)</div></div>
      </div>

      <div class="map-box" id="map-box"></div>

      <div id="manual-box" style="display:none;">
        <div class="row" style="background:var(--brown-cream);padding:16px;border-radius:12px;margin:14px 0;">
          <div class="field" style="flex:1;min-width:200px;">
            <label>Distance completed (km)</label>
            <input id="man-dist" type="number" min="0.1" step="0.1" placeholder="e.g. 5" style="width:100%;" />
          </div>
          <div>
            <button class="btn btn-brown" id="btn-manual-confirm">Start Manual Session</button>
            <button class="btn btn-outline" id="btn-manual-cancel">Cancel</button>
          </div>
        </div>
      </div>

      <div class="btn-row" id="ctrl-row"></div>
    </div>`;

  const chipsBox = body.querySelector('#act-chips');
  const ctrlRow = body.querySelector('#ctrl-row');
  const manualBox = body.querySelector('#manual-box');
  const manDist = body.querySelector('#man-dist');
  const wInput = body.querySelector('#w-input');
  const mapBox = body.querySelector('#map-box');

  wInput.addEventListener('change', () => {
    weight = Number(wInput.value) || 70;
    setWeight(weight);
    refreshStats();
  });

  function drawChips() {
    chipsBox.innerHTML = ACTIVITIES.map(
      (a) => `<button class="chip${a === activity ? ' active' : ''}" data-a="${a}">${a}</button>`
    ).join('');
    chipsBox.querySelectorAll('.chip').forEach((b) => {
      b.addEventListener('click', () => {
        activity = b.dataset.a;
        localStorage.setItem('toba-activity', activity);
        drawChips();
      });
    });
  }

  function text(id, value) {
    const el = body.querySelector('#' + id);
    if (el) el.textContent = value;
  }

  function refreshStats() {
    if (!session) return;
    const st = session.stats(weight);
    text('s-dist', st.distance.toFixed(2));
    text('s-time', formatTime(st.elapsed));
    text('s-speed', formatKmh(st.avgSpeed));
    text('s-pace', st.pace > 0 ? formatPace(st.pace) : '--');
    text('s-kcal', st.calories);
  }

  async function refreshMap() {
    if (!session || !map) return;
    map.setPoints(session.points);
  }

  function drawControls() {
    const btn = (label, cls, id) => `<button class="btn ${cls}" id="${id}">${label}</button>`;
    if (status === 'idle') {
      ctrlRow.innerHTML = btn('Start with GPS', 'btn-red', 'btn-start') + btn('Start Manually', 'btn-outline', 'btn-manual');
    } else if (status === 'active') {
      ctrlRow.innerHTML = btn('Pause', 'btn-soft', 'btn-pause') + btn('Stop and Save', 'btn-red', 'btn-stop');
    } else if (status === 'paused') {
      ctrlRow.innerHTML = btn('Resume', 'btn-brown', 'btn-resume') + btn('Stop and Save', 'btn-red', 'btn-stop');
    }
    ctrlRow.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => {
        if (b.id === 'btn-start') startGps();
        else if (b.id === 'btn-manual') manualBox.style.display = 'block';
        else if (b.id === 'btn-pause') pause();
        else if (b.id === 'btn-resume') resume();
        else if (b.id === 'btn-stop') stopSession();
      });
    });
  }

  manualBox.querySelector('#btn-manual-confirm').addEventListener('click', startManual);
  manualBox.querySelector('#btn-manual-cancel').addEventListener('click', () => {
    manualBox.style.display = 'none';
  });

  function startGps() {
    if (session) return;
    session = new TrackSession(activity, weight);
    const err = session.startGps();
    status = 'active';
    map = new TrackMap(mapBox);
    manualBox.style.display = 'none';
    drawControls();
    refreshMap();
    if (err) {
      toast('GPS unavailable - use Manual mode.');
      manualBox.style.display = 'block';
    }
    const timer = setInterval(() => {
      refreshStats();
      if (++tick % 3 === 0) refreshMap();
    }, 1000);
    timers.push(timer);
  }

  function startManual() {
    if (session) return;
    const km = parseFloat(manDist.value);
    if (!isFinite(km) || km <= 0) {
      toast('Enter a valid distance first.');
      return;
    }
    session = new TrackSession(activity, weight);
    session.startManual(km);
    status = 'active';
    map = new TrackMap(mapBox);
    manualBox.style.display = 'none';
    drawControls();
    refreshMap();
    const timer = setInterval(() => {
      refreshStats();
      if (++tick % 3 === 0) refreshMap();
    }, 1000);
    timers.push(timer);
  }

  function pause() {
    if (session) session.pause();
    status = 'paused';
    drawControls();
  }

  function resume() {
    if (session) session.resume();
    status = 'active';
    drawControls();
  }

  async function stopSession() {
    clearTimers();
    if (!session) return;
    const st = session.stop();
    const rec = makeWorkout(
      activity,
      st.distance,
      Math.round(st.elapsed),
      st.calories,
      session.manual ? 'manual' : 'gps',
      session.points
    );
    await saveWorkout(rec);
    session = null;
    status = 'idle';
    drawControls();
    showSummary(rec);
  }

  function showSummary(rec) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h3>Session Saved</h3>
        <div class="stats">
          <div class="stat"><div class="value">${rec.distance.toFixed(2)}</div><div class="label">km</div></div>
          <div class="stat"><div class="value">${formatTime(rec.durationSec)}</div><div class="label">Time</div></div>
          <div class="stat"><div class="value">${rec.speed.toFixed(2)}</div><div class="label">km/h</div></div>
          <div class="stat"><div class="value">${rec.pace > 0 ? formatPace(rec.pace) : '--'}</div><div class="label">min/km</div></div>
          <div class="stat"><div class="value">${rec.calories}</div><div class="label">kcal</div></div>
        </div>
        <p class="hint">Recorded as a <b>${rec.activity}</b> ${rec.mode === 'manual' ? '(manual)' : '(GPS)'} session in your history. Your route line is saved too.</p>
        <div class="btn-row">
          <a class="btn btn-red" href="#/primary/history">View History</a>
          <button class="btn btn-brown" id="sum-again">Track Again</button>
          <button class="btn btn-outline" id="sum-close">Close</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#sum-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#sum-again').addEventListener('click', () => overlay.remove());
  }

  drawChips();
  drawControls();
}

// ---------------------------------------------------------------- history
async function renderHistory(body) {
  const list = await listWorkouts();
  const total = list.reduce(
    (acc, r) => {
      acc.count++;
      acc.dist += r.distance || 0;
      acc.kcal += r.calories || 0;
      acc.time += r.durationSec || 0;
      return acc;
    },
    { count: 0, dist: 0, kcal: 0, time: 0 }
  );

  body.innerHTML = `
    <div class="stats">
      <div class="stat"><div class="value">${total.count}</div><div class="label">Sessions</div></div>
      <div class="stat"><div class="value">${total.dist.toFixed(2)}</div><div class="label">Total km</div></div>
      <div class="stat"><div class="value">${total.kcal}</div><div class="label">Total kcal</div></div>
      <div class="stat"><div class="value">${formatTime(total.time)}</div><div class="label">Total time</div></div>
    </div>
    <div id="hist-list"></div>`;

  const listBox = body.querySelector('#hist-list');
  if (!list.length) {
    listBox.innerHTML = `<div class="empty">No workouts yet. Start tracking in the Strava Tracker and your history will appear here.</div>`;
    return;
  }

  listBox.innerHTML = list
    .map((r) => {
      const hasRoute = Array.isArray(r.points) && r.points.length >= 2;
      return `
      <div class="hist-item" data-id="${r.id}">
        <div class="list-item">
          <div class="main">
            <div class="act">${r.activity} ${r.mode === 'manual' ? '<span class="hint">(manual)</span>' : ''}</div>
            <div class="sub">${formatDate(r.ts)}</div>
          </div>
          <div class="nums"><b>${r.distance.toFixed(2)} km</b><b>${formatTime(r.durationSec)}</b></div>
          <div class="nums"><b>${r.speed.toFixed(2)} km/h</b><b>${r.pace > 0 ? formatPace(r.pace) : '--'} /km</b></div>
          <div class="nums"><b>${r.calories} kcal</b></div>
          <div class="route-actions">
            ${hasRoute ? `<button class="btn btn-outline btn-sm" data-route="${r.id}">View route</button>` : ''}
            <button class="danger" data-del="${r.id}">Delete</button>
          </div>
        </div>
        <div class="route-box" id="route-${r.id}" style="display:none;"></div>
      </div>`;
    })
    .join('');

  listBox.querySelectorAll('[data-route]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.route;
      const box = listBox.querySelector('#route-' + id);
      const open = box.style.display !== 'none';
      if (open) {
        box.style.display = 'none';
        box.innerHTML = '';
        btn.textContent = 'View route';
        routeMaps = routeMaps.filter((m) => {
          if (m.container === box) {
            m.destroy();
            return false;
          }
          return true;
        });
        return;
      }
      box.style.display = 'block';
      btn.textContent = 'Hide route';
      const rec = list.find((x) => x.id === id);
      const map = new TrackMap(box);
      routeMaps.push(map);
      map.setPoints(rec.points);
    });
  });

  listBox.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.del;
      if (!confirm('Delete this workout from your history?')) return;
      await removeWorkout(id);
      clearRouteMaps();
      toast('Workout deleted.');
      await renderHistory(body);
    });
  });
}