// 100 Strength Challenges for the Secondary Effect (Push-up / Sit-up / Pull-up)
// Each challenge: { id, activity, title, target, unit, points }

const S = [];
let id = 1;
function add(activity, title, target, unit, points) {
  S.push({ id: id++, activity, title, target, unit, points });
}

// --- Push-up: total in a day ---
[10, 20, 30, 40, 50, 75, 100].forEach((n) => add('Push-up', `Complete ${n} push-ups in total in one day`, n, 'reps', n / 5));

// --- Push-up: single set ---
[5, 10, 15, 20, 25, 30, 40].forEach((n) => add('Push-up', `Do ${n} push-ups in a single set`, n, 'reps', n / 5));

// --- Sit-up: total in a day ---
[20, 40, 60, 80, 100, 150, 200].forEach((n) => add('Sit-up', `Complete ${n} sit-ups in total in one day`, n, 'reps', n / 5));

// --- Sit-up: single set ---
[10, 20, 30, 40, 50, 60].forEach((n) => add('Sit-up', `Do ${n} sit-ups in a single set`, n, 'reps', n / 5));

// --- Pull-up: single set ---
[1, 3, 5, 8, 10, 12, 15, 20].forEach((n) => add('Pull-up', `Do ${n} pull-ups in a single set`, n, 'reps', n * 2));

// --- Pull-up: total in a day ---
[5, 10, 15, 20, 30, 40].forEach((n) => add('Pull-up', `Complete ${n} pull-ups in total in one day`, n, 'reps', n * 2));

// --- Plank hold ---
[20, 30, 45, 60, 90, 120, 180].forEach((s) => add('Core', `Hold a plank for ${s} seconds`, s, 'sec', s / 10));

// --- Dead hang ---
[15, 30, 45, 60, 90].forEach((s) => add('Pull-up', `Hang from the bar for ${s} seconds`, s, 'sec', s / 5));

// --- Circuits (sensible combos) ---
add('All', 'Complete 20 push-ups + 20 sit-ups + 3 pull-ups in one circuit', 1, 'circuit', 8);
add('All', 'Complete 30 push-ups + 40 sit-ups + 5 pull-ups in 15 minutes', 1, 'circuit', 12);
add('All', 'Do 3 full circuits with 60 seconds rest between', 3, 'circuits', 14);
add('All', 'Finish with a 100-rep finisher: 40 push-ups, 40 sit-ups, 20 pull-up negatives', 100, 'reps', 15);
add('All', 'Complete 5 total body sessions in one week', 5, 'sessions', 12);

// --- Form mastery ---
add('Push-up', 'Perfect form push-ups: 10 with chest to the floor', 10, 'reps', 6);
add('Push-up', 'Deficit push-ups on two books: 10', 10, 'reps', 7);
add('Push-up', 'Diamond push-ups: 10', 10, 'reps', 7);
add('Push-up', 'Wide-grip push-ups: 15', 15, 'reps', 6);
add('Push-up', 'Incline push-ups on a bench: 20', 20, 'reps', 4);
add('Push-up', 'Decline push-ups with feet raised: 10', 10, 'reps', 8);
add('Push-up', 'Knee push-ups: 30 (perfect for beginners)', 30, 'reps', 4);

// --- Core variety ---
add('Sit-up', 'Bicycle crunches: 40 total', 40, 'reps', 6);
add('Sit-up', 'Russian twists: 30 turns', 30, 'reps', 6);
add('Sit-up', 'Leg raises: 20', 20, 'reps', 6);
add('Core', 'Plank with shoulder taps: 20 taps', 20, 'reps', 7);
add('Core', 'Side plank for 30 seconds on each side', 60, 'sec', 8);

// --- Pull-up variety ---
add('Pull-up', 'Assisted pull-ups with a band: 8', 8, 'reps', 5);
add('Pull-up', 'Chin-ups (palms facing you): 5', 5, 'reps', 8);
add('Pull-up', 'Mixed-grip pull-ups: 3 each side', 6, 'reps', 10);
add('Pull-up', 'Hold the top position of a pull-up for 10 seconds', 10, 'sec', 7);
add('Pull-up', 'Negative pull-ups: 5 slow lowerings', 5, 'reps', 6);
add('Pull-up', 'Inverted rows on a table or bar: 20', 20, 'reps', 5);

// --- Habits and consistency ---
add('All', 'Exercise 3 days in a row with strength work', 3, 'days', 8);
add('All', 'Exercise 7 days in a row with strength work', 7, 'days', 12);
add('All', 'Hit the "100 member": 100 total reps across push-ups, sit-ups and pull-ups in one day', 100, 'reps', 10);
add('All', 'Complete a morning strength circuit before breakfast', 1, 'session', 6);
add('All', 'Stretch and foam-roll for 10 minutes after a heavy session', 10, 'min', 5);
add('All', 'Stay consistent for 30 days (log at least one set every day)', 30, 'days', 20);
add('All', 'Drink water before, during and after every strength session', 3, 'drinks', 4);
add('All', 'Sleep for 8 hours after a hard pull day', 8, 'hours', 5);
add('All', 'Set and follow a new personal best in any exercise', 1, 'PB', 10);

// --- Extra variety ---
add('Push-up', 'Push-ups with your feet on a chair: 8', 8, 'reps', 7);
add('Push-up', 'Slow push-ups with a 3-second lower: 10', 10, 'reps', 7);
add('Push-up', 'Explosive clap push-ups: 5', 5, 'reps', 8);
add('Push-up', 'Wall push-ups: 20 (gentle warm-up)', 20, 'reps', 3);
add('Sit-up', 'Sit-ups with a slow 3-second lower: 15', 15, 'reps', 5);
add('Sit-up', 'Crunch pulses: 30 small pulses', 30, 'reps', 5);
add('Core', 'Plank knee taps: 20 taps', 20, 'reps', 5);
add('Core', 'Alternating superman holds: 30 seconds', 30, 'sec', 5);
add('Pull-up', 'Wide-grip pull-ups: 3', 3, 'reps', 8);
add('Pull-up', 'Close-grip chin-ups: 5', 5, 'reps', 8);
add('Pull-up', 'Pull-up endurance: 30 total in 3 sets spread across the day', 30, 'reps', 12);
add('Pull-up', 'Rock climber pull-ups (shifting grip): 4', 4, 'reps', 9);
add('All', 'Complete a 10-minute AMRAP: 5 push-ups, 5 sit-ups, 1 pull-up, repeat', 10, 'min', 14);
add('All', 'Complete 15 reps of every exercise in a single day', 45, 'reps', 8);
add('All', 'Beat your previous weekly total reps', 1, 'target', 10);
add('All', 'Log 100 total strength reps before noon', 100, 'reps', 10);
add('All', 'Balance day: 10 push-ups and 10 pull-ups (opposite movements)', 20, 'reps', 8);
add('All', 'No-gym day: 3 full bodyweight circuits anywhere, any time', 3, 'circuits', 8);

export const STRENGTH_CHALLENGES = S.slice(0, 100);