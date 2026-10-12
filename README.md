# ReadyNet

An installable, offline-first Progressive Web App for checking in after an earthquake or other
disaster. A person shares their location, answers short questions about their condition and
surroundings, and gets a triage color (Red, Yellow, Green, White), an area risk rating, first-aid
steps and a map of city supply caches.

**This is a prototype with no backend.** Everything runs and is stored on the device. Anything that
would need a server — sending to responders, rescue alerts, loved ones, other neighbors' supplies —
is simulated with local data and controls labelled **Demo** (toggle in Settings).

## Run

```bash
npm install
npm run dev        # http://localhost:5173 (service worker is off in dev)
npm test           # Vitest unit tests for src/logic and the outbox
npm run build      # type-check + production build with service worker
npm run preview    # serve the build at http://localhost:4173 (offline + install work here)
npm run test:e2e   # Playwright smoke tests (builds and previews automatically)
npm run lint
npm run icons      # re-render PNG icons from public/icons/icon.svg
```

## Deploy

Any static HTTPS host works (HTTPS is required for the service worker, geolocation and
notifications). Routing uses URL hashes, so no server rewrites are needed.

- **GitHub Pages:** `.github/workflows/deploy.yml` lints, tests, builds and deploys on every push to
  `main`. Enable it once under _Settings → Pages → Source: GitHub Actions_. The app is then at
  `https://<user>.github.io/ready-net/`.
- **Netlify / Vercel / other:** build command `npm run build`, output `dist`. If you host under a
  sub-path, set `BASE_PATH=/your-path/` when building.

## 2-minute demo script

1. **Install.** Open the site on a phone. Tap **Install app** on Home (Android/desktop) or
   Share › Add to Home Screen (iOS). Open it from the home screen.
2. **Go offline.** Turn on airplane mode. The header pill switches to **Offline**.
3. **Get the alert.** Tap **Demo: trigger earthquake alert** and allow notifications. Tap the
   notification — it opens the red **Earthquake reported in your area** screen. (If notifications
   are blocked, the same alert appears as an in-app banner.) Tap **Check in now**.
4. **Check in.** Location shows coordinates or lets you type a landmark. Answer _Yes, but it can
   wait_ · _Yes_ · **Yes** (breathing/bleeding) · _Yes_ · _No_. Bleeding follow-ups appear: **Arm or
   leg** · **Spurting or pulsing** · … then the injury follow-ups, then surroundings: **Yes**,
   someone is trapped, and _No_ to the rest. Reload mid-way: you resume at the same question.
5. **Photos.** Take or choose up to 5 photos (or skip).
6. **Result.** Red rescue banner, **Red — Seriously injured**, **Area risk: High**, and first-aid
   steps including _Arm or leg still bleeding?_.
7. **Help and caches.** Say **Yes** to helping and pick skills (the blue-card note appears). On the
   map the library cache is **Closed — high-risk zone**. Pick items to bring and confirm.
8. **Checked in.** Shows **Saved — will send when online**. Turn airplane mode off: after about 1.5 s
   it flips to **Sent**.
9. **Loved ones tab.** Add someone → _Waiting for them to verify_ → **Simulate: they verified** →
   **Simulate: [name] checked in** (repeat to cycle through each sharing case, including one where
   only "checked in" shows).
10. **Settings.** Turn Demo mode off to hide demo controls; **Delete all my data** clears everything.

## How it works

| Area                                    | How                                                                                                                                             |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Questions                               | Data in `src/data/questions.ts` (wording, option ids, scores)                                                                                   |
| Triage, risk, first aid, question order | Pure functions in `src/logic/` with unit tests                                                                                                  |
| First-aid wording                       | `src/data/firstAid.ts` — placeholder text pending EMS review                                                                                    |
| Storage                                 | IndexedDB via `idb-keyval` (`checkins`, `draft`, `photos`, `outbox`, `lovedOnes`); settings in `localStorage`. Records carry `schemaVersion: 1` |
| Simulated sending                       | Completed check-ins go to the outbox; when online (on load and on `online`), after 1.5 s they're marked sent                                    |
| Offline / install                       | `vite-plugin-pwa` (Workbox) precaches the app shell, fonts, icons and data; manifest in `vite.config.ts`                                        |
| Notifications                           | `ServiceWorkerRegistration.showNotification`; permission is requested only when a user action needs it; falls back to an in-app banner          |
| Caches map                              | Stylised SVG (`src/components/CacheMap.tsx`) with bundled `src/data/caches.json` — no map tiles                                                 |

Rename the app in one place: `APP_NAME` in `src/config.ts` (plus the manifest name in
`vite.config.ts` and the `<title>` in `index.html`).

Area risk uses only this device's answers. A real build would pool many reports per zone and
require several independent reports before marking a zone high-risk.

## Project layout

```text
public/         fonts (Atkinson Hyperlegible), icons, sw-notifications.js
src/config.ts   APP_NAME and demo defaults
src/data/       questions, first-aid text, caches.json, demo loved ones
src/logic/      triage, risk, firstAid, flow, caches (+ *.test.ts)
src/store/      IndexedDB stores, outbox, settings
src/screens/    Home, Alert, check-in steps, Caches, LovedOnes, Settings
src/components/ Header, ProgressBar, AnswerButton, Chip, Card, CacheMap, …
src/pwa/        service worker registration, notifications, install prompt
e2e/            Playwright smoke tests
```
