/**
 * Seed events and deadlines — structured as Firestore documents for easy replacement.
 * Replace with live queries:
 *   events    → query(collection(db, 'dcEvents'),    orderBy('date',    'asc'))
 *   deadlines → query(collection(db, 'dcDeadlines'), orderBy('date',    'asc'))
 *
 * date field must be 'YYYY-MM-DD' so daysUntil() and fmtDate() parse correctly.
 * school: 'all' = program-wide; use a school id from schools.js to target a school.
 */
export const events = [
  // ── Events ──────────────────────────────────────────────────────────────────
  {
    id: 'ev-info-night',
    type: 'event',
    title: 'Fall 2026 Dual Credit Info Night',
    date: '2026-07-15',
    location: 'Texarkana College Campus',
    school: 'all',
  },
  {
    id: 'ev-tsia2',
    type: 'event',
    title: 'TSIA2 Testing Session',
    date: '2026-07-22',
    location: 'TC Testing Center — 903-823-3278',
    school: 'all',
  },
  {
    id: 'ev-orientation',
    type: 'event',
    title: 'New Student Orientation',
    date: '2026-08-18',
    location: 'Texarkana College Campus',
    school: 'all',
  },
  {
    id: 'ev-first-day',
    type: 'event',
    title: 'First Day of Fall Classes',
    date: '2026-08-25',
    location: 'Your High School Campus',
    school: 'all',
  },
  {
    id: 'ev-promise-info',
    type: 'event',
    title: 'TC Promise Info Session',
    date: '2026-09-10',
    location: 'Texarkana College Campus',
    school: 'all',
  },

  // ── Deadlines ────────────────────────────────────────────────────────────────
  {
    id: 'dl-app-deadline',
    type: 'deadline',
    title: 'Fall 2026 Dual Credit Application Deadline',
    date: '2026-08-01',
    location: 'Submit at my.texarkanacollege.edu/ICS/Admissions/Dual-Credit_Application.jnz',
    school: 'all',
  },
  {
    id: 'dl-contract',
    type: 'deadline',
    title: 'Fall 2026 Registration Contract Due',
    date: '2026-08-08',
    location: 'Submit to your ACDC',
    school: 'all',
  },
  {
    id: 'dl-payment',
    type: 'deadline',
    title: 'Fall 2026 Payment Deadline',
    date: '2026-08-15',
    location: 'Pay at myTC Portal',
    school: 'all',
  },
  {
    id: 'dl-drop',
    type: 'deadline',
    title: 'Fall 2026 Drop Deadline',
    date: '2026-09-05',
    location: 'Submit Drop Form to ACDC',
    school: 'all',
  },
  {
    id: 'dl-spring-opens',
    type: 'deadline',
    title: 'Spring 2027 Application Opens',
    date: '2026-10-01',
    location: 'Apply at my.texarkanacollege.edu/ICS/Admissions/Dual-Credit_Application.jnz',
    school: 'all',
  },
];
