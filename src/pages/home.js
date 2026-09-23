export function renderHome(view) {
  view.innerHTML = `
  <div class="page">
    <section class="hero">
      <h2>Toba Effect</h2>
      <p class="subtitle">Health as same as Grow</p>
    </section>

    <div class="section-label">Choose your path</div>
    <div class="effect-grid">
      <a class="effect-card" href="#/primary">
        <h3>Primary Effect</h3>
        <p>Your personal Strava-style tracker. Run, walk or ride a bike with live GPS, distance, speed, pace and calories, plus 100 challenges and a full workout history.</p>
        <div class="meta">Run &middot; Walk &middot; Bike &middot; GPS &middot; 100 Challenges &middot; History</div>
        <span class="go">Go to Primary Effect</span>
      </a>
      <a class="effect-card" href="#/secondary">
        <h3>Secondary Effect</h3>
        <p>Guided training for Push-Ups, Sit-Ups and Pull-Ups with proper form, a set timer, 100 strength challenges and AI in Effect as your virtual coach.</p>
        <div class="meta">Push-Up &middot; Sit-Up &middot; Pull-Up &middot; AI Coach &middot; 100 Challenges</div>
        <span class="go">Go to Secondary Effect</span>
      </a>
      <a class="effect-card" href="#/third">
        <h3>Third-Tier</h3>
        <p>A 100-day healthy eating plan with breakfast, lunch and dinner menus for every single day, complete with calories and daily nutrition tips.</p>
        <div class="meta">100 Days &middot; Breakfast &middot; Lunch &middot; Dinner &middot; Calorie tracked</div>
        <span class="go">Go to Third-Tier</span>
      </a>
    </div>

    <div class="section-label">About Toba Effect</div>
    <div class="card">
      <p>Named after Lake Toba, the largest volcanic lake in the world, Toba Effect applies the same idea to your
      health: the steady, powerful eruption of good habits that keeps growing every single day.</p>
      <p class="hint">Everything you do here is stored on your device and, when possible, synced to Firebase so your
      track record is never lost.</p>
    </div>
  </div>`;
}