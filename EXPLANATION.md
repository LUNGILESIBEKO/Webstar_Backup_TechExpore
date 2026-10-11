# Firestore setup for Tech Career Explorer

## What was wrong
1. **Login.js had a syntax error** (missing `}`, `catch` outside the `try`), so the app could not even build. It also used variables that did not exist (`navigation`, `institution`, `course`, `year`, `user`).
2. **Firebase.js called `getAnalytics()`**, which only works in web browsers and breaks React Native.
3. **Auth was not persisted on phones** (user was logged out on every restart) and Firestore's default connection can be blocked on some networks.
4. **Home.js showed "Loading profile..." forever** if `users/{uid}` did not exist (which is always true when sign-up never saved a profile).
5. **Field names disagreed**: Login/Home used `fullName`, Settings used `name`.
6. **Logout did not sign out** of Firebase.

## What I changed
- `Firebase.js`: connects once. `initializeAuth` + AsyncStorage on phones, `initializeFirestore` with auto long-polling, Analytics removed.
- `checkFirestore.js` (new): on app start writes, reads and deletes `_connection_test/ping`. Open the console: **✅ Firestore is CONNECTED** or **❌ FAILED: <code>**.
- `Login.js`: sign-up creates the Auth account, then the Firestore doc `users/{uid}`; sign-in logs in; friendly error messages shown on screen.
- `Home.js`, `settingsScreen.js`, `App.js`: consistent `fullName`, no infinite loading, real sign-out.
- `firebase/firestore.rules` (new) and `seedFirestore.js` (new).

## Collections and fields
**users/{uid}** (one per student, doc id = Auth uid)
fullName (string), email (string), institution (string), course (string), year (string), skillsTracked (number), roadmapStep (number), roadmapTotal (number), completedRoadmapSteps (array of numbers), quizResult (map: answers, matches, topMatch, completedAt), darkMode (bool), notificationPrefs (map), createdAt, updatedAt (timestamps)

**Shared content (read-only in app; app falls back to built-in data if empty):**
- institutions: name (string), order (number)
- career_tracks: title (string), order (number)
- quiz_questions: id, order, question/options as in Quiz.js
- roadmap_steps: id (number), category, title, duration, description, resources (array of {label,url}), order
- job_prep_tips: category ('cv' | 'interview' | 'jobsearch'), title, body, order

## Do these in the Firebase console (required!)
1. **Build > Firestore Database > Create database** (if not created). Pick a region (e.g. europe-west / africa-south1 if offered).
2. **Build > Authentication > Get started > Sign-in method > Email/Password > Enable.** Without this, sign-up fails.
3. **Firestore > Rules**: paste `firebase/firestore.rules` and Publish.
4. Run `npx expo install @react-native-async-storage/async-storage` if not installed, then `npx expo start -c`.
5. Sign up with a NEW account (old attempts never created users), check Firestore for `users/{uid}`.

Note: the rules block writes to shared collections, so add those docs in the console (or temporarily allow writes while running `seedFirestore()` once, then restore the rules).


---

# Update: automatic Quiz/Roadmap, Mentor pop-ups, email verification, one UI

## Quiz and Roadmap are now automatic
- `Data/careerData.js` holds the content (career tracks, quiz questions **with scoring weights**, roadmap steps for every track, mentors). Screens contain no content.
- `careerEngine.js` reads Firestore first (`career_tracks`, `quiz_questions`, `roadmap_steps`) and only uses `Data/careerData.js` when Firestore is empty/offline.
- Quiz: each answer option has `weights` (points per track). The result is calculated from them (percent = points earned / best possible), saved to `users/{uid}.quizResult` including `topMatch.id`.
- Roadmap: built from the student's top match. Retake the quiz -> a different roadmap. Progress is stored per step id (e.g. `backend-developer-3`) in `users/{uid}.completedRoadmapSteps`, so each track keeps its own progress. No quiz yet -> the screen asks the student to take it.
- Career Results opened from Profile now loads the saved result instead of showing fake default numbers.
- To change content from the console: `quiz_questions` doc = `{ id, order, text, options: [{ text, weights: { "backend-developer": 3, ... } }] }`; `roadmap_steps` doc = `{ id, track, order, category, title, duration, description, resources: [{label,url}] }`. Run `seedFirestore()` once to upload the built-in content (it also removes the old untagged `step_01..step_07` docs).

## Mentor pop-up notifications
- `components/Toast.js` (`useToast()`): in-app pop-ups, mounted once in `App.js`.
- Mentor screen shows pop-ups for: request sent, request withdrawn (with a confirm dialog first), save failed, tapping a busy mentor, and - when **Settings > Notifications > Mentor Availability Alerts** is on - "N mentors available now" on open and "<name> is now available" live when a mentor's `available` field flips to true in the `mentors` collection.

## Email verification
- Sign-up sends a verification email, then signs the student out and asks them to verify.
- Sign-in reloads the user and refuses to continue until `emailVerified` is true (with a "Resend verification email" link).
- `firebase/firestore.rules` also requires `request.auth.token.email_verified == true` for reads and updates, so unverified accounts cannot read data even if the app check were bypassed. **Re-publish the rules in the Firebase console.**
- Accounts created before this change are unverified: they get the same "verify first" message and can use Resend.

## One consistent UI
- `theme.js` = colours, spacing, the single background gradient. `components/UI.js` = `Screen`, `ScreenHeader`, `GlassCard`, `PrimaryButton`/`SecondaryButton`, `Pill`, `ProgressBar`, `SegmentedTabs`, `StatsRow`, `EmptyState`, `TabBar`.
- Every screen uses them: same background, header (back button / eyebrow / title / subtitle), glass cards that follow dark mode, buttons, and the same bottom tab bar on Home, Explore, Roadmap and Profile.

---

# Update: tracked skills

- Explore > Skills has a **Track / Tracking** button on every skill. Tapping it saves `users/{uid}.trackedSkills` (array of skill names) and `users/{uid}.skillsTracked` (the count) with `merge: true`, and rolls the change back with an error pop-up if the save fails.
- Home's "Skills tracked" now shows `trackedSkills.length`; Profile shows the tracked skills as a list under "Tracked Skills" (tap it to open Explore).

---

# Update: email verification is now enforced + stay signed in

- **Sign-up** (`screens/Login.js`): creates the account and profile, sends the verification email, signs the student out and shows "Account created - verify your email, then sign in".
- **Sign-in**: reloads the user and refreshes the login token. If the email is still unverified the student is signed out and sees the "verify first" message with a **Resend verification email** link (it signs in with the typed email/password, sends the link, signs out again).
- **Stay signed in** (`App.js`): at startup the app waits for Firebase to restore the saved login. Signed in + verified + not idle for 15 minutes -> opens straight on Main. Otherwise -> Login. A short spinner shows while this is checked.
- **Fixed:** a leftover `Roadmap` screen registration in `App.js` (no import) that would have crashed the app at launch.
- Remember to publish `firebase/firestore.rules` in the Firebase console.

---

# Update: everything follows the quiz result

- `Data/careerContent.js` holds, for each of the 10 career tracks: in-demand skills, certifications, jobs with salary ranges, and Job Prep tips (CV, Interview, Job Search). **Salaries, demand figures and certification costs are indicative estimates, not live data - check them before relying on them.**
- `careerEngine.js` -> `myTrackFrom(quizResult)` turns the saved quiz result (`users/{uid}.quizResult.topMatch`) into that career's content.
- **Explore** (Skills / Certs / Jobs) shows the student's career by default, with a "My career / All careers" switch. No quiz yet -> a card invites them to take it and the general lists are shown.
- **Job Prep Hub** shows tips for the student's career first, then general tips.
- **Mentors**: mentors whose role/tags fit the student's career are listed first with a "Fits your career" tag.
- **Bug fixed:** the "QA / Test Engineer" track got the id `qa-test-engineer` while its quiz weights and roadmap used `qa-engineer`, so QA could never win the quiz. `useCareerTracks` now keeps each track's own id.
- To change what a career shows, edit its block in `TRACK_CONTENT`.
