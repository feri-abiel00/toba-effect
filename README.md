# Toba Effect

**Health as same as Grow**

Toba Effect is a wellness companion built for the future generations — a web app inspired by Lake Toba that helps you grow healthier every single day. It combines cardio tracking (Strava-style), bodyweight strength coaching, and a 100-day healthy food plan in one place.

Live demo: <https://toba-effect.web.app>

---

## The Three Effects

### 1. Primary Effect - Cardio (Strava-style)

A GPS-powered activity tracker for three sports:

- **Run**
- **Walk**
- **Bike**

For every session you get live metrics:

- **Distance** (km)
- **Time** (timer)
- **Average speed** (km/h)
- **Pace** (min/km)
- **Calories** (kcal, estimated from your body weight)

Features:

- Real GPS tracking via `navigator.geolocation` with a live route map (Leaflet + OpenStreetMap, with a local canvas fallback when offline).
- **Manual mode** for sessions without GPS.
- **100 Cardio Challenges** — from "Run 5 km in one session" to "Reach 10,000 kcal burned" — each with points and a one-tap complete tracking.
- **History** — an automatic record of every session with delete support and lifetime totals.

### 2. Secondary Effect - Strength

Guides for three foundational bodyweight exercises:

- **Push-Up**
- **Sit-Up**
- **Pull-Up**

For each exercise there is a complete guide: step-by-step technique, form cues, target muscle groups, common mistakes, and beginner/intermediate/advanced rep targets.

Features:

- **Guided Set Timer** — run an exercise session with set count and rest countdowns.
- **100 Strength Challenges** — sensible goals like "Hold a plank for 60 seconds" or "Do 5 pull-ups in a single set".
- **AI in Effect** — a built-in virtual coach that answers your questions about technique, training plans, warm-ups, pain, and motivation.

### 3. Third-Tier - Nutrition

A **100-day healthy eating plan**. Every day includes:

- **Breakfast**
- **Lunch**
- **Dinner**
- A light snack suggestion
- A daily nutrition tip

All meals are calorie-tracked with a total per day, and every day's menu is different (rotating through curated healthy Indonesian and international dishes).

---

## Tech Stack

- **Vanilla JavaScript (ES Modules)** with Vite as the bundler
- **Firebase** (Firestore) for cloud track-record sync with automatic local fallback
- **Leaflet + OpenStreetMap** for GPS route rendering (canvas fallback included)
- **CSS custom properties** with a red / white / brown theme and Times New Roman typography

---

## Getting Started

```bash
npm install

# local development
npm run dev

# production build
npm run build

# preview the built app
npm run preview
```

## Deployment

The app is configured for Firebase Hosting under the `eco2track-new` project using the **toba-effect** hosting site.

```bash
firebase login
npm run deploy
# -> https://toba-effect.web.app
```

### Cloud sync (Firestore)

Workout sessions and challenge completions are saved to the device first and then synced to Firestore when the cloud is reachable. To enable cloud sync:

1. Open the Firebase console for the `eco2track-new` project.
2. Go to **Firestore Database** → **Create database**.
3. Choose a location and start in **test mode** (or deploy the provided `firestore.rules` — it allows read/write, which is fine for a demo app).
4. Any sessions you record will now be stored in the `workouts` and `completions` collections.

If Firestore is not enabled, the app keeps working normally using local device storage and shows **"Sync: Local device"** in the header.

---

## Project Structure

```
├── index.html
├── package.json
├── vite.config.js
├── firebase.json
├── firestore.rules
├── .firebaserc
└── src
    ├── main.js              # hash router + app shell
    ├── styles.css           # red / white / brown theme
    ├── firebase.js          # Firebase configuration
    ├── store.js             # persistence layer (local + Firestore)
    ├── utils.js             # formatting helpers
    ├── ui.js                # toast + UI helpers
    ├── components
    │   ├── gps.js           # GPS track session engine
    │   ├── map.js           # live route map (Leaflet / canvas)
    │   └── challenges.js    # reusable 100-challenge list
    ├── data
    │   ├── cardioChallenges.js   # 100 cardio challenges
    │   ├── strengthChallenges.js # 100 strength challenges
    │   └── nutrition.js          # 100-day meal plan
    └── pages
        ├── home.js          # landing / choose your path
        ├── primary.js       # tracker + challenges + history
        ├── secondary.js     # guides + challenges + AI coach
        └── third.js         # 100-day healthy food plan
```

---

## The Theme

- **Red** — the fire and energy of the volcano
- **White** — clarity and a clean start
- **Brown** — the earth, tradition and steady growth
- **Times New Roman** — a classic, quiet, serious voice for your health story

---

## Made with ❤️

Built as a student project for the Del Institute of Technology AI training programme. Stay active, eat well, and let the Toba Effect grow within you.