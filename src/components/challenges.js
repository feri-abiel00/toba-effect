import { getCompletions, setCompletion } from '../store';
import { sanitize } from '../utils';
import { toast } from '../ui';

export async function renderChallengeList(container, challenges, category) {
  let completions = await getCompletions(category);
  let filter = 'All';
  let search = '';

  container.innerHTML = `
    <div class="card">
      <h4>100 Challenges</h4>
      <p class="hint">Complete a challenge whenever you reach its goal. Your progress is saved automatically.</p>
      <div class="progress"><div id="chal-progress" style="width:0%;"></div></div>
      <div class="filter-row">
        <div class="chips" id="chal-filters"></div>
        <input id="chal-search" type="search" placeholder="Search challenges..." style="flex:1;min-width:160px;" />
      </div>
      <div class="chal-grid" id="chal-grid"></div>
    </div>`;

  const progressEl = container.querySelector('#chal-progress');
  const filterBox = container.querySelector('#chal-filters');
  const grid = container.querySelector('#chal-grid');
  const searchInput = container.querySelector('#chal-search');

  const types = ['All', ...Array.from(new Set(challenges.map((c) => c.activity)))];

  function drawFilters() {
    filterBox.innerHTML = types
      .map(
        (t) => `<button class="chip${t === filter ? ' active' : ''}" data-t="${sanitize(t)}">${sanitize(t)}</button>`
      )
      .join('');
    filterBox.querySelectorAll('.chip').forEach((b) => {
      b.addEventListener('click', () => {
        filter = b.dataset.t;
        drawFilters();
        drawGrid();
      });
    });
  }

  function visible() {
    const q = search.trim().toLowerCase();
    return challenges.filter((c) => {
      const okType = filter === 'All' || c.activity === filter;
      const okSearch = !q || c.title.toLowerCase().includes(q) || String(c.id).includes(q);
      return okType && okSearch;
    });
  }

  function drawGrid() {
    const done = completions.size;
    const pct = Math.round((done / challenges.length) * 100);
    progressEl.style.width = pct + '%';
    progressEl.textContent = `${done} / ${challenges.length}`;

    const list = visible();
    if (!list.length) {
      grid.innerHTML = '<div class="empty">No challenges match your filter.</div>';
      return;
    }
    grid.innerHTML = list
      .map((c) => {
        const isDone = completions.has(String(c.id));
        return `<div class="chal${isDone ? ' done' : ''}" data-id="${c.id}">
          <div class="top">
            <span class="type">${sanitize(c.activity)}</span>
            <span class="pts">${c.points} pts</span>
          </div>
          <div class="title">${sanitize(c.title)}</div>
          <div class="btn-row">
            <button class="btn ${isDone ? 'btn-outline' : 'btn-brown'}" data-action="toggle">
              ${isDone ? 'Completed - undo' : 'Mark as complete'}
            </button>
          </div>
        </div>`;
      })
      .join('');

    grid.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.chal');
        const id = card.dataset.id;
        const wasDone = completions.has(id);
        completions = await getCompletions(category);
        if (wasDone) {
          completions.delete(id);
        } else {
          completions.add(id);
        }
        await setCompletion(category, id, !wasDone);
        toast(wasDone ? 'Challenge reopened' : 'Challenge completed - well done!');
        drawGrid();
      });
    });
  }

  searchInput.addEventListener('input', () => {
    search = searchInput.value;
    drawGrid();
  });

  drawFilters();
  drawGrid();
}