# TC Dual Credit App — Claude Context

React PWA for Texarkana College's Dual Credit program. Mobile-first.  
Live at: Vercel (tc-dual-credit-app repo on GitHub, `main` branch auto-deploys)

---

## Stack
- React 18 + Vite 6
- Tailwind 3 (utility classes in JSX; inline styles dominate screen components)
- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop home cards
- Firebase/Firestore — live timeline posts
- vite-plugin-pwa — service worker via `injectManifest` (`src/sw.js`)
- jsPDF — client-side transcript PDF download
- Vercel — hosting + cron (`/api/cron-notifications` at 10am daily)

---

## Color Tokens
```
BLUE  = '#065990'   // Royal Blue — primary brand
LIME  = '#EAFF00'   // Electric Lime — accent
DARK  = '#022b52'   // Deep Navy — headings on light bg
FF    = C.ff        // Font family from src/tokens.js
```
`src/tokens.js` exports `C` (color object) and `FF` (font family string).  
Import: `import { C, FF } from '../tokens';`

---

## localStorage Keys
- `tcdc_v1` — user profile: `{ role, school, grade, studentId, firstName, lastName, isJenzabarVerified }`
- `tcdc_v1_cards` — home card order array (length 5)

---

## Roles
- `student` — full nav (Home, My ACDC, Academic Progress, Important Dates, More)
- `parent` — same nav as student; sees "Parent of [name]" framing
- `guest` — reduced nav (Home, Important Dates, Resources, More); no ACDC or Academics

---

## Screens & Files
| Screen | File |
|---|---|
| Splash | `src/screens/SplashScreen.jsx` |
| Onboarding (5 steps) | `OnboardRole`, `OnboardStudentID`, `OnboardSchool`, `OnboardGrade`, `OnboardConfirm` |
| Home | `src/screens/HomeScreen.jsx` |
| My ACDC | `src/screens/ACDCScreen.jsx` |
| Academic Progress | `src/screens/AcademicsScreen.jsx` |
| Important Dates | `src/screens/ImportantDatesScreen.jsx` |
| Notifications | `src/screens/NotificationsScreen.jsx` |
| More | `src/screens/MoreScreen.jsx` |
| Resources | `src/screens/ResourcesScreen.jsx` |
| Pathways | `src/screens/PathwaysScreen.jsx` |
| Events | `src/screens/EventsScreen.jsx` |
| Apply | `src/screens/ApplyScreen.jsx` |
| Admin | `src/pages/AdminPage.jsx` |

---

## Key Data Files
- `src/data/acdc.js` — `getAcdcForSchool(schoolId, grade)` → coach object `{ name, photo, phone, email?, schedulingUrl? }`
- `src/data/schools.js` — 18 partner high schools with `{ id, name, color, textColor }`
- `src/data/events.js` — deadlines + events `{ type: 'deadline'|'event', date: 'YYYY-MM-DD', title, ... }`
- `src/data/pathways.js` — degree pathway data
- `src/data/resources.js` — resource link cards
- `src/data/notifications.js` — `loadNotifications()` (IndexedDB) + `relTime(timestamp)`
- `src/data/studentProfile.js` — `getStudentProfile()` reads Jenzabar-verified data
- `src/data/buildSchedulingUrl.js` — `buildSchedulingUrl()` → HubSpot scheduling link

---

## Shared Components
- `BlueHeader` + `PageTitle` — standard blue header bar for non-home screens
- `BottomNav` — mobile tab bar + TC logo footer (blue `#065990` bg, `tcdclogo2.png`)
- `SideNav` — tablet sidebar nav
- `Card` — white rounded card wrapper
- `CreditHoursBar` — progress bar (BLUE earned / LIME pending / matched grey track)
- `StatusBar` — course status indicator

---

## Home Screen Cards (DnD)
Order saved to `tcdc_v1_cards`. Default: `['acdc', 'deadline', 'event', 'announce', 'lastnotif']`  
Cards render in a 2-col CSS grid. ACDC is `fullWidth` (spans both cols).  
Whole card surface is draggable (`activationConstraint: { distance: 8 }` so taps still fire).  
Drag handle: tiny 2-line visual indicator, upper-right, `pointerEvents: none`.

---

## Conventions
- **Mobile-first always.** Tablet pass comes last — use `md:` / `lg:` prefixes when adding Tailwind.
- **Inline styles** dominate screen-level components; Tailwind used for layout utilities where natural.
- **No neon glow/outline** on icon buttons — flat fills only.
- **No scroll on ACDC screen** — keep content fitting one viewport.
- New screens get a `BlueHeader` + `BottomNav` wrapper matching existing screens.
- Add new screens to the `switch` in `src/App.jsx` and add a tab entry if it needs nav.

---

## What's Not Yet Built (Wishlist)
- Push notification subscription + send flow (cron endpoint exists, IndexedDB read works)
- Parent-specific child-progress view (currently mirrors student view)
- Admin dashboard depth (`AdminPage.jsx` is scaffolded)
- Pathways feature depth
