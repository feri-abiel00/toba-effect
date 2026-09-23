import { register, login, guestMode } from '../accounts';
import { sanitize } from '../utils';

export function renderAccount(view) {
  view.innerHTML = `
    <div class="page">
      <section class="hero hero-small">
        <h2>Toba Effect</h2>
        <p class="subtitle">Health as same as Grow</p>
      </section>

      <div class="section-label">Your account</div>
      <p class="page-sub" style="text-align:center;">Register your account first, then log in to keep your tracks, challenges and meals synced.</p>

      <div class="auth-grid">
        <div class="card auth-card">
          <h4>Log In</h4>
          <div class="field">
            <label>Email</label>
            <input id="login-email" type="email" autocomplete="email" placeholder="you@email.com" />
          </div>
          <div class="field">
            <label>Password</label>
            <input id="login-pass" type="password" autocomplete="current-password" placeholder="Your password" />
          </div>
          <div class="form-error" id="login-error"></div>
          <button class="btn btn-red" id="login-btn">Log In to Account</button>
        </div>

        <div class="card auth-card">
          <h4>Register</h4>
          <div class="field">
            <label>Full Name</label>
            <input id="reg-name" type="text" autocomplete="name" placeholder="Your full name" />
          </div>
          <div class="field">
            <label>Email</label>
            <input id="reg-email" type="email" autocomplete="email" placeholder="you@email.com" />
          </div>
          <div class="field">
            <label>Password</label>
            <input id="reg-pass" type="password" autocomplete="new-password" placeholder="At least 6 characters" />
          </div>
          <div class="field">
            <label>Confirm Password</label>
            <input id="reg-pass2" type="password" autocomplete="new-password" placeholder="Repeat your password" />
          </div>
          <div class="form-error" id="reg-error"></div>
          <button class="btn btn-red" id="reg-btn">Register New Account</button>
          <p class="hint">After registering, you will be signed in automatically.</p>
        </div>

        <div class="card auth-card">
          <h4>Guest Mode</h4>
          <p class="hint">Use Toba Effect without an account. Your records are kept on this device only and will not sync to the cloud.</p>
          <div class="field">
            <label>Guest Display Name</label>
            <input id="guest-name" type="text" placeholder="e.g. Wanderer" />
          </div>
          <button class="btn btn-brown" id="guest-btn">Continue as Guest</button>
        </div>
      </div>
    </div>`;

  const err = (id, msg) => {
    const el = view.querySelector('#' + id);
    if (msg) el.textContent = msg;
    else el.textContent = '';
  };

  async function run(fn, errId) {
    err(errId, '');
    try {
      await fn();
    } catch (e) {
      err(errId, e.message || 'Something went wrong.');
    }
  }

  view.querySelector('#login-btn').addEventListener('click', () => {
    const email = view.querySelector('#login-email').value;
    const pass = view.querySelector('#login-pass').value;
    run(async () => {
      await login(email, pass);
      location.hash = '#/';
      location.reload();
    }, 'login-error');
  });

  view.querySelector('#reg-btn').addEventListener('click', () => {
    const name = view.querySelector('#reg-name').value;
    const email = view.querySelector('#reg-email').value;
    const pass = view.querySelector('#reg-pass').value;
    const pass2 = view.querySelector('#reg-pass2').value;
    run(async () => {
      await register(name, email, pass, pass2);
      location.hash = '#/';
      location.reload();
    }, 'reg-error');
  });

  view.querySelector('#guest-btn').addEventListener('click', () => {
    const name = view.querySelector('#guest-name').value;
    run(async () => {
      await guestMode(name);
      location.hash = '#/';
      location.reload();
    }, 'login-error');
  });

  [view.querySelector('#login-pass'), view.querySelector('#reg-pass2')].forEach((inp) => {
    if (inp) {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (inp.id === 'login-pass') view.querySelector('#login-btn').click();
          else view.querySelector('#reg-btn').click();
        }
      });
    }
  });
}