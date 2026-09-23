import { NUTRITION_DAYS } from '../data/nutrition';
import { sanitize } from '../utils';

const DAY_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

export function renderThird(view, section, param) {
  let day = parseInt(param, 10);
  if (!isFinite(day) || day < 1 || day > 100) day = 1;
  const data = NUTRITION_DAYS[day - 1];

  view.innerHTML = `
    <div class="page">
      <h2 class="page-title">Third-Tier</h2>
      <p class="page-sub">100 days of healthy food - a complete breakfast, lunch and dinner menu for every single day.</p>

      <div class="card">
        <h4>Pick a day (1 - 100)</h4>
        <div class="day-grid" id="day-grid"></div>
      </div>

      <div id="day-detail"></div>
    </div>`;

  const grid = view.querySelector('#day-grid');
  grid.innerHTML = NUTRITION_DAYS.map(
    (d) => `<button class="day-cell${d.day === day ? ' active' : ''}" data-day="${d.day}">${d.day}</button>`
  ).join('');

  grid.querySelectorAll('.day-cell').forEach((cell) => {
    cell.addEventListener('click', () => {
      location.hash = `#/third/day/${cell.dataset.day}`;
    });
  });

  const detail = view.querySelector('#day-detail');
  detail.innerHTML = `
    <div class="card">
      <h4>Day ${data.day} - ${totalLabel(data.totalKcal)}</h4>
      ${Object.keys(DAY_LABELS)
        .map(
          (key) => `
          <div class="meal-card">
            <span class="kcal">${data[key].kcal} kcal</span>
            <span class="meal-label">${DAY_LABELS[key]}</span>
            <h5>${sanitize(data[key].name)}</h5>
          </div>`
        )
        .join('')}
      <div class="meal-card">
        <span class="kcal">~80 kcal</span>
        <span class="meal-label">Snack</span>
        <h5>${sanitize(data.snack)}</h5>
      </div>
      <p class="hint">Healthy tip for today: ${sanitize(data.tip)}</p>
      <div class="day-nav">
        <button class="btn btn-outline" id="prev-day" ${day === 1 ? 'disabled' : ''}>&larr; Day ${day - 1}</button>
        <span class="muted">Day ${day} of 100</span>
        <button class="btn btn-outline" id="next-day" ${day === 100 ? 'disabled' : ''}>Day ${day + 1} &rarr;</button>
      </div>
    </div>`;

  detail.querySelector('#prev-day').addEventListener('click', () => {
    if (day > 1) location.hash = `#/third/day/${day - 1}`;
  });
  detail.querySelector('#next-day').addEventListener('click', () => {
    if (day < 100) location.hash = `#/third/day/${day + 1}`;
  });
}

function totalLabel(kcal) {
  if (kcal < 1000) return `light day (${kcal} kcal total)`;
  if (kcal < 1150) return `moderate day (${kcal} kcal total)`;
  return `balanced day (${kcal} kcal total)`;
}