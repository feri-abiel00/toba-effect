import './styles.css';
import { probeCloud } from './db';
import { getSyncStatus } from './store';
import { getSession, displayName, logout, isGuest } from './accounts';
import { sanitize } from './utils';
import { renderHome } from './pages/home';
import { renderPrimary } from './pages/primary';
import { renderSecondary } from './pages/secondary';
import { renderThird } from './pages/third';
import { renderAccount } from './pages/account';

const appRoot = document.getElementById('app');

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  if (!parts.length) return { page: 'home', section: null, param: null };
  const page = ['primary', 'secondary', 'third'].includes(parts[0]) ? parts[0] : 'home';
  return { page, section: parts[1] || null, param: parts[2] || null };
}

function initialOf(name) {
  return sanitize(String(name || '?').trim().charAt(0).toUpperCase() || '?');
}

function headerHtml(page, session) {
  const links = [
    ['home', '#/', 'Home'],
    ['primary', '#/primary', 'Primary Effect'],
    ['secondary', '#/secondary', 'Secondary Effect'],
    ['third', '#/third', 'Third-Tier']
  ];
  const name = session ? displayName() : '';
  const userChip = session
    ? `<span class="user-chip" title="${sanitize(session.email || session.name || '')}">
        <span class="user-avatar">${initialOf(name)}</span>
        <span class="user-name">${sanitize(name)}${isGuest() ? ' (Guest)' : ''}</span>
        <button class="btn-logout" id="logout-btn">Log out</button>
      </span>`
    : '';
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
    <span class="top-right">
      ${userChip}
      <span class="sync-badge" id="sync-badge">Connecting...</span>
    </span>
  </header>`;
}

function footerHtml() {
  return `<footer>Toba Effect &middot; Health as same as Grow &middot; Account-based tracking, strength coaching and 100 healthy days.</footer>`;
}

async function render() {
  const session = getSession();
  const { page, section, param } = parseHash();
  const authed = !!session;

  appRoot.innerHTML = headerHtml(page, authed ? session : null) + '<main id="view"></main>' + footerHtml();
  const view = document.getElementById('view');

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logout();
      render().then(updateSyncBadge);
    });
  }

  try {
    if (!authed) {
      renderAccount(view);
    } else if (page === 'primary') {
      await renderPrimary(view, section, param);
    } else if (page === 'secondary') {
      renderSecondary(view, section, param);
    } else if (page === 'third') {
      renderThird(view, section, param);
    } else {
      renderHome(view);
    }
  } catch (err) {
    view.innerHTML = `<div class="page"><div class="empty">Something went wrong: ${sanitize(err.message || err)}</div></div>`;
    console.error(err);
  }
  window.scrollTo(0, 0);
}

function updateSyncBadge() {
  const badge = document.getElementById('sync-badge');
  if (!badge) return;
  const session = getSession();
  const owner = session && !session.guest ? ' (account)' : '';
  badge.textContent = 'Sync: ' + (getSyncStatus() === 'cloud' ? 'Cloud' : 'Local') + owner;
}

window.addEventListener('hashchange', () => {
  render().then(updateSyncBadge);
});

(async function boot() {
  await probeCloud();
  await render();
  updateSyncBadge();
})();