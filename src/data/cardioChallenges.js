// 100 Cardio Challenges for the Primary Effect (Run / Walk / Bike)
// Each challenge: { id, activity, title, target, unit, points }

const C = [];
let id = 1;
function add(activity, title, target, unit, points) {
  C.push({ id: id++, activity, title, target, unit, points });
}

// --- Run: distance ---
[1, 2, 3, 5, 8, 10, 15, 21, 30, 42].forEach((km, i) => {
  const flavor = [
    'Flat-loop run. Nice and steady.',
    'Quick tempo muscles up.',
    'The classic morning 5K.',
    'Get comfortable going further.',
    'Focus on smooth, even splits.',
    'The double-digit milestone.',
    'A half-marathon prep block.',
    'Half marathon distance!',
    'Long-run endurance anchor.',
    'The full marathon. Legend.'
  ][i];
  add('Run', `Run ${km} km in one session (${flavor})`, km, 'km', 3 + km);
});

// --- Walk: distance ---
[1, 2, 3, 5, 8, 10, 15, 20].forEach((km, i) => {
  add('Walk', `Walk ${km} km in one session`, km, 'km', 2 + km);
});

// --- Bike: distance ---
[5, 10, 20, 30, 40, 50, 80, 100].forEach((km, i) => {
  add('Bike', `Bike ${km} km in one session`, km, 'km', 2 + km);
});

// --- Time-based sessions ---
[20, 30, 45, 60, 90].forEach((m) => add('Run', `Run non-stop for ${m} minutes`, m, 'min', 5));
[30, 45, 60, 90].forEach((m) => add('Walk', `Take a brisk ${m}-minute walk`, m, 'min', 4));
[30, 45, 60, 90, 120].forEach((m) => add('Bike', `Ride continuously for ${m} minutes`, m, 'min', 4));

// --- Run pace targets (min/km) ---
[[6.5, '06:30'], [6.0, '06:00'], [5.5, '05:30'], [5.0, '05:00'], [4.5, '04:30'], [4.1, '04:10']].forEach(([v, p]) => {
  add('Run', `Run 5 km at a ${p} per km pace or faster`, v, 'min/km', 10);
});

// --- Bike average speed ---
[15, 20, 25, 30, 35].forEach((v) => {
  add('Bike', `Average ${v} km/h or more over a 10 km ride`, v, 'km/h', 8);
});

// --- Steps ---
[5000, 10000, 15000, 20000].forEach((s) => add('Walk', `Accumulate ${s.toLocaleString()} steps in a day`, s, 'steps', 5));

// --- Calories ---
[200, 300, 500, 800, 1000].forEach((c) => add('All', `Burn ${c} calories in a single session`, c, 'kcal', 6));
[1500, 2500, 4000].forEach((c) => add('All', `Burn ${c.toLocaleString()} calories in one week`, c, 'kcal', 8));

// --- Consistency ---
[3, 5, 7, 14].forEach((d) => add('All', `Stay active ${d} days in a row (any activity)`, d, 'days', 8));

// --- Weekly / monthly volume ---
add('Run', 'Complete 20 km of running in one week', 20, 'km', 10);
add('Run', 'Complete 30 km of running in one week', 30, 'km', 12);
add('Run', 'Complete 50 km of running in one week', 50, 'km', 15);
add('Walk', 'Walk 15 km in one week', 15, 'km', 8);
add('Walk', 'Walk 25 km in one week', 25, 'km', 10);
add('Walk', 'Walk 40 km in one week', 40, 'km', 12);
add('Bike', 'Ride 100 km in one week', 100, 'km', 12);
add('Bike', 'Ride 150 km in one week', 150, 'km', 15);
add('Run', 'Run 100 km in a single month', 100, 'km', 20);
add('Bike', 'Ride 500 km in a single month', 500, 'km', 20);

// --- Skill and speed ---
add('Run', 'Sprint 100 m flat out', 100, 'm', 4);
add('Run', 'Run 400 m fast as an interval workout', 400, 'm', 5);
add('Run', 'Run 2 km in under 12 minutes', 2, 'km', 8);
add('Run', 'Tempo run: 2 km at a comfortably hard pace', 2, 'km', 8);
add('Run', 'Hill repeats: 5 short hill sprints with recovery', 5, 'reps', 7);
add('Run', 'Long slow run: 60+ minutes at an easy pace', 60, 'min', 9);
add('Bike', 'Ride 15 km before breakfast', 15, 'km', 8);
add('Bike', 'Bike up a hill and back down to enjoy the view', 1, 'route', 5);

// --- Lifestyle & habits ---
add('All', 'Work out before 07:00 AM', 1, 'session', 8);
add('All', 'Complete 5 workouts in a single week', 5, 'sessions', 12);
add('All', 'Beat your personal best distance on any activity', 1, 'PB', 12);
add('All', 'Do a fun walk and leave your phone in the pocket', 1, 'walk', 5);
add('All', 'Complete an active weekend: both Saturday and Sunday', 2, 'days', 8);
add('All', 'Try a new route you have never taken before', 1, 'route', 5);
add('All', 'Stretch thoroughly before and after every run this week', 1, 'week', 6);
add('All', 'Run or ride in the rain (safely, when weather allows)', 1, 'session', 8);
add('All', 'Maintain an easy 30-minute run while able to talk comfortably', 30, 'min', 7);
add('All', 'Bike for 1 hour without stopping', 60, 'min', 9);
add('All', 'Reach a cumulative 10,000 kcal burned on Toba Effect', 10000, 'kcal', 25);
add('All', 'Complete the "Tri-activity week": run, walk and bike at least once', 3, 'sessions', 14);
add('All', 'Keep an average of 8,000 steps every day for 5 days', 8000, 'steps', 10);
add('All', 'Recovery walk: easy 10-minute walk right after a hard workout', 10, 'min', 4);
add('Bike', 'Ride 20 km under 45 minutes', 20, 'km', 10);

export const CARDIO_CHALLENGES = C.slice(0, 100);