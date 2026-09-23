import './styles.css';
import { initStore, getSyncStatus } from './store';
import { sanitize } from './utils';
import { renderHome } from './pages/home';
import { renderPrimary } from './pages/primary';
import { renderSecondary } from './pages/secondary';
import { renderThird } from './pages/third';

const appRoot = document.getElementById('app');

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  if (!parts.length) return { page: 'home', section: null, param: null };
  const page = ['primary', 'secondary', 'third'].includes(parts[0]) ? parts[0] : 'home';
  return { page, section: parts[1] || null, param: parts[2] || null };
}

function headerHtml(page) {
  const links = [
    ['home', '#/', 'Home'],
    ['primary', '#/primary', 'Primary Effect'],
    ['secondary', '#/secondary', 'Secondary Effect'],
    ['third', '#/third', 'Third-Tier']
  ];
  return `
  <header class="topbar">
    <div class="brand">
      <h1>Toba Effect</h1>
      <span class="tagline">Health as same as Grow</span>
    </div>
    <nav class="nav">
      ${links
        .map(([key, href, label]) => `<a href="${href}" class="${page === key ? 'active' : ''}">${label}</a>`)
        .join('')}
    </nav>
    <span class="sync-badge" id="sync-badge">Connecting...</span>
  </header>`;
}

function footerHtml() {
  return `<footer>Toba Effect &middot; Health as same as Grow &middot; Cardio tracking, strength coaching and 100 healthy days.</footer>`;
}

async function render() {
  const { page, section, param } = parseHash();
  appRoot.innerHTML = headerHtml(page) + '<main id="view"></main>' + footerHtml();
  const view = document.getElementById('view');
  try {
    if (page === 'primary') await renderPrimary(view, section, param);
    else if (page === 'secondary') renderSecondary(view, section, param);
    else if (page === 'third') renderThird(view, section, param);
    else renderHome(view);
  } catch (err) {
    view.innerHTML = `<div class="page"><div class="empty">Something went wrong: ${sanitize(err.message || err)}</div></div>`;
    console.error(err);
  }
  window.scrollTo(0, 0);
}

async function updateSyncBadge() {
  const badge = document.getElementById('sync-badge');
  if (!badge) return;
  const status = getSyncStatus();
  badge.textContent = status === 'cloud' ? 'Sync: Firebase Cloud' : 'Sync: Local device';
}

window.addEventListener('hashchange', () => {
  render().then(updateSyncBadge);
});

(async function boot() {
  await initStore();
  await render();
  updateSyncBadge();
})();