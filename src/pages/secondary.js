import { STRENGTH_CHALLENGES } from '../data/strengthChallenges';
import { renderChallengeList } from '../components/challenges';
import { formatTime } from '../utils';
import { sanitize } from '../utils';
import { toast } from '../ui';

const GUIDES = [
  {
    name: 'Push-Up',
    target: 'Chest, shoulders, triceps and core',
    howto: [
      'Start in a high plank with hands slightly wider than shoulders.',
      'Keep your body in a straight line from head to heels.',
      'Lower your chest toward the floor while keeping elbows at about 45 degrees.',
      'Push back up until your arms are fully extended.',
      'Breathe in on the way down, breathe out on the way up.'
    ],
    cues: ['No sagging hips', 'No flared elbows', 'Neck neutral, eyes down'],
    muscles: ['Pectorals', 'Triceps', 'Anterior deltoids', 'Core'],
    mistakes: [
      'Letting your lower back sag.',
      'Only half-lowering your chest.',
      'Holding your breath.'
    ],
    reps: { Beginner: 8, Intermediate: 15, Advanced: 30 }
  },
  {
    name: 'Sit-Up',
    target: 'Abdominals, hip flexors and lower back',
    howto: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place fingertips lightly behind your head, elbows wide.',
      'Curl your shoulders off the floor using your abs, not your neck.',
      'Lift your upper back fully toward your knees.',
      'Lower back down with control until your shoulder blades touch the floor.'
    ],
    cues: ['Curl, do not yank', 'Feet stay planted', 'Chin slightly tucked'],
    muscles: ['Rectus abdominis', 'Obliques', 'Hip flexors'],
    mistakes: [
      'Pulling your head with your hands.',
      'Swinging your upper body for momentum.',
      'Rounding the lower back harshly at the bottom.'
    ],
    reps: { Beginner: 10, Intermediate: 20, Advanced: 35 }
  },
  {
    name: 'Pull-Up',
    target: 'Back, biceps and grip strength',
    howto: [
      'Grip the bar slightly wider than shoulder-width, palms facing away.',
      'Hang with arms fully extended and shoulders engaged.',
      'Pull your elbows down toward your hips to lift your chest to the bar.',
      'Pause briefly at the top, chin over the bar.',
      'Lower yourself slowly and under control to full hang.'
    ],
    cues: ['Lead with the chest', 'No kipping or kicking', 'Full range of motion'],
    muscles: ['Latissimus dorsi', 'Biceps', 'Rear deltoids', 'Forearms'],
    mistakes: [
      'Half reps without a full hang.',
      'Swinging to gain momentum.',
      'Shrugging shoulders instead of pulling with the back.'
    ],
    reps: { Beginner: 1, Intermediate: 5, Advanced: 12 }
  }
];

export function renderSecondary(view, section, param) {
  section = section || 'guides';

  view.innerHTML = `
    <div class="page">
      <h2 class="page-title">Secondary Effect</h2>
      <p class="page-sub">Master Push-Ups, Sit-Ups and Pull-Ups with proper technique, 100 challenges and AI in Effect by your side.</p>
      <div class="tabs">
        <a class="tab ${section === 'guides' ? 'active' : ''}" href="#/secondary/guides">Guides</a>
        <a class="tab ${section === 'challenges' ? 'active' : ''}" href="#/secondary/challenges">Challenges (100)</a>
        <a class="tab ${section === 'ai' ? 'active' : ''}" href="#/secondary/ai">AI in Effect</a>
      </div>
      <div id="secondary-body"></div>
    </div>`;

  const body = view.querySelector('#secondary-body');
  if (section === 'challenges') renderChallengeList(body, STRENGTH_CHALLENGES, 'strength');
  else if (section === 'ai') renderAi(body);
  else renderGuides(body);
}

// ---------------------------------------------------------------- guides
function renderGuides(body) {
  body.innerHTML = `<div class="guide-grid">
    ${GUIDES.map(
      (g) => `
      <div class="guide">
        <h4>${g.name}</h4>
        <p class="hint">${g.target}</p>
        <p><b>How to do it</b></p>
        <ul>${g.howto.map((s) => `<li>${s}</li>`).join('')}</ul>
        <p><b>Form cues</b></p>
        <div>${g.cues.map((c) => `<span class="tag">${c}</span>`).join('')}</div>
        <p><b>Muscles used</b></p>
        <div>${g.muscles.map((m) => `<span class="tag">${m}</span>`).join('')}</div>
        <p><b>Common mistakes</b></p>
        <ul>${g.mistakes.map((s) => `<li>${s}</li>`).join('')}</ul>
        <p><b>Target reps per set</b></p>
        <ul>
          <li>Beginner: ${g.reps.Beginner}</li>
          <li>Intermediate: ${g.reps.Intermediate}</li>
          <li>Advanced: ${g.reps.Advanced}</li>
        </ul>
        <button class="btn btn-red" data-ex="${sanitize(g.name)}">Start Guided Set</button>
      </div>`
    ).join('')}
  </div>
  <div id="set-panel"></div>`;

  body.querySelectorAll('[data-ex]').forEach((btn) => {
    btn.addEventListener('click', () => renderSetPanel(body.querySelector('#set-panel'), btn.dataset.ex));
  });
}

function renderSetPanel(panel, exercise) {
  const sets = 3;
  const rest = 45;
  let currentSet = 1;
  let phase = 'work';
  let restLeft = rest;
  let timer = null;

  panel.innerHTML = `
    <div class="card">
      <h4>Guided Set - ${sanitize(exercise)}</h4>
      <p class="timer-state" id="set-state">Set 1 of 3 - Do your reps now</p>
      <div class="activity-row" style="text-align:center;">
        <span class="timer-big" id="set-count">0</span>
      </div>
      <div class="btn-row" style="justify-content:center;" id="set-btns"></div>
    </div>`;

  const stateEl = panel.querySelector('#set-state');
  const countEl = panel.querySelector('#set-count');
  const btnRow = panel.querySelector('#set-btns');

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function draw() {
    if (phase === 'work') {
      countEl.textContent = 'Go!';
      stateEl.textContent = `Set ${currentSet} of ${sets} - do your ${exercise} reps now`;
      btnRow.innerHTML = `
        <button class="btn btn-brown" id="s-done">Done - Start Rest (${rest}s)</button>
        <button class="btn btn-outline" id="s-end">End Session</button>`;
    } else {
      countEl.textContent = restLeft;
      stateEl.textContent = `Rest - Set ${currentSet} of ${sets} complete, next set soon`;
      btnRow.innerHTML = `
        <button class="btn btn-soft" id="s-skip">Skip Rest</button>
        <button class="btn btn-outline" id="s-end">End Session</button>`;
    }
    btnRow.querySelector('#s-end').addEventListener('click', () => {
      if (confirm('End this session now?')) endSession();
    });
  }

  function startRest() {
    stopTimer();
    phase = 'rest';
    restLeft = rest;
    draw();
    timer = setInterval(() => {
      restLeft--;
      countEl.textContent = restLeft;
      if (restLeft <= 0) {
        stopTimer();
        currentSet++;
        if (currentSet > sets) return endSession();
        phase = 'work';
        draw();
      } else {
        btnRow.querySelector('#s-skip')?.addEventListener('click', skipRest);
      }
    }, 1000);
  }

  function skipRest() {
    stopTimer();
    currentSet++;
    if (currentSet > sets) return endSession();
    phase = 'work';
    draw();
  }

  let completed = 0;
  function endSession() {
    stopTimer();
    completed = sets * (GUIDES.find((g) => g.name === exercise)?.reps.Intermediate || 10);
    panel.innerHTML = `
      <div class="card">
        <h4>Session Complete</h4>
        <p>You finished <b>${sets} sets</b> of <b>${sanitize(exercise)}</b> with proper rest and control.</p>
        <p class="hint">Great consistency - now log it by tackling a Challenge in the Challenges tab, or ask AI in Effect for your next step.</p>
        <div class="btn-row"><button class="btn btn-red" id="set-again">Train Again</button>
        <a href="#/secondary/challenges" class="btn btn-outline">Go to Challenges</a></div>
      </div>`;
    panel.querySelector('#set-again').addEventListener('click', () => renderSetPanel(panel, exercise));
    toast(`${completed} estimated total reps today - keep going!`);
  }

  draw();
  btnRow.querySelector('#s-done').addEventListener('click', startRest);
}

// ---------------------------------------------------------------- AI in Effect
const CHIPS = [
  'Plan for beginners',
  'Fix my push-up form',
  'Sit-up technique',
  'Progress on pull-ups',
  'Is pain normal?',
  'Warm-up routine',
  'Motivate me'
];

function aiReply(raw) {
  const t = raw.toLowerCase();
  let out = null;
  if (/beginner|start|new|plan|level/.test(t)) {
    const lvl = /advanced|hard/.test(t) ? 'Advanced' : /intermediate/.test(t) ? 'Intermediate' : 'Beginner';
    out = lvl === 'Beginner'
      ? `<b>Beginner plan (4 weeks)</b><br>Week 1-2: 2 sessions - knee push-ups 3x8, sit-ups 3x10, band or negative pull-ups 3x3.<br>Week 3-4: 3 sessions - full push-ups 3x8, sit-ups 3x15, negatives 3x5.<br>Rest 48h between sessions and always warm up first.`
      : lvl === 'Intermediate'
      ? `<b>Intermediate plan (4 weeks)</b><br>3 sessions/week: push-ups 4x12, sit-ups 4x20, pull-ups 4x5.<br>Add one harder variation (diamond push-ups, decline sit-ups, chin-ups) each week.`
      : `<b>Advanced plan (4 weeks)</b><br>4 sessions/week: deficit or weighted push-ups 5x20, weighted sit-ups 5x30, weighted pull-ups 5x10.<br>Add one full-body circuit day and track recovery.`;
  } else if (/push.?up|chest|tricep/.test(t)) {
    out = `<b>Push-up form fix</b><br>1) Tighten your core and squeeze your glutes before every rep.<br>2) Hands slightly wider than shoulders - imagine screwing them into the floor.<br>3) Lower until your chest nearly touches - no half reps.<br>4) Keep elbows at ~45 degrees, never "T" shaped.<br>5) If your hips dip, drop to knees and keep a proud chest line.`;
  } else if (/sit.?up|crunch|abs|core/.test(t)) {
    out = `<b>Sit-up technique</b><br>1) Feet flat, knees at 90 degrees; anchor toes lightly.<br>2) Hands behind ears - elbows NEVER pull your head.<br>3) Exhale and curl sternum to knees like rolling a mat.<br>4) Exhale, gear down, then slowly uncurl to the floor.<br>5) 10 slow perfect reps beat 30 sloppy ones.`;
  } else if (/pull.?up|chin|back|hang|bar/.test(t)) {
    out = `<b>Pull-up progression ladder</b><br>1) Dead hangs: 3x20-30s to build grip.<br>2) Negative pull-ups: jump up, lower for 5 full seconds.<br>3) Band-assisted pull-ups: 3x5-8.<br>4) Inverted rows: 3x12.<br>5) Then chase your first clean rep, then 3, then 5. Consistency beats intensity.`;
  } else if (/pain|hurt|injur|strain/.test(t)) {
    out = `<b>Pain is a warning, not a reward.</b><br>Sharp pain in a joint, wrist, shoulder or lower back means STOP that exercise. Recover for 2-3 days, review your form, and try an easier variation. Muscle soreness from workouts is normal; joint or sharp pain is not. When in doubt, see a professional.`;
  } else if (/warm.?up|stretch|mobil/.test(t)) {
    out = `<b>Warm-up routine (5-8 min)</b><br>1) 2 min jumping jacks or easy jog.<br>2) Arm circles 15 each way.<br>3) Wrist stretches 20s each side (crucial for push-ups).<br>4) 10 bodyweight squats.<br>5) 2 easy sets of your exercise with half range. Never start cold.`;
  } else if (/motivat|tired|give up|hard|struggl|demotivat/.test(t)) {
    out = `<b>From the shores of Lake Toba...</b><br>You are not behind - you are exactly where your effort has placed you, and that place is moving forward. Show up for 10 minutes today. One set. One rep better than yesterday is still growth. The best version of you is buried just one more workout deep.`;
  } else if (/how often|frequency|per week|schedule|routine/.test(t)) {
    out = `<b>Frequency guidance</b><br>Strength work: 3-4 non-consecutive days per week.<br>Cardio: 3-5 sessions per week mixing easy and hard days.<br>Always take 1 full rest day and sleep 7-9 hours. Recovery is where you actually grow.`;
  } else if (/ai|help|can you|hello|hi/.test(t)) {
    out = `<b>AI in Effect here!</b><br>I give form tips, build plans, explain exercises and keep you motivated. Try a quick topic below or ask me anything about push-ups, sit-ups, pull-ups, warm-ups or pain.`;
  } else {
    out = `Good question. Focus on: <b>controlled reps, full range of motion, and consistency.</b> Tell me more - are you asking about technique, a plan, or staying motivated? I can also help with push-ups, sit-ups, pull-ups, warm-ups, or how often you should train.`;
  }
  return out;
}

function renderAi(body) {
  body.innerHTML = `
    <div class="card">
      <h4>AI in Effect - your virtual coach</h4>
      <p class="hint">A light AI assistant built for this app. It answers technique, plans and motivation questions about your strength training.</p>
      <div class="chips-chat" id="ai-chips"></div>
      <div class="chat-box" id="ai-chat"></div>
      <div class="chat-input">
        <input id="ai-input" placeholder="Type your question..." />
        <button class="btn btn-red" id="ai-send">Send</button>
      </div>
    </div>`;

  const chat = body.querySelector('#ai-chat');
  const input = body.querySelector('#ai-input');
  const send = body.querySelector('#ai-send');
  const chipBox = body.querySelector('#ai-chips');

  function bubble(cls, text) {
    const d = document.createElement('div');
    d.className = 'bubble ' + cls;
    if (cls === 'ai') d.innerHTML = text;
    else d.textContent = text;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }

  function ask(userText) {
    bubble('user', userText);
    setTimeout(() => bubble('ai', aiReply(userText)), 350);
  }

  chipBox.innerHTML = CHIPS.map((c) => `<button data-q="${sanitize(c)}">${sanitize(c)}</button>`).join('');
  chipBox.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => ask(b.dataset.q));
  });

  function sendMessage() {
    const v = input.value.trim();
    if (!v) return;
    input.value = '';
    ask(v);
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  bubble(
    'ai',
    `<b>Hello! I am AI in Effect.</b><br>I help you with push-up, sit-up and pull-up form, training plans, warm-ups and motivation. Try one of the quick topics below, or ask anything.`
  );
}