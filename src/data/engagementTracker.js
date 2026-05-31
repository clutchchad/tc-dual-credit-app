const ENG_KEY = 'tcdc_v1_engagement';

// ── Helpers ───────────────────────────────────────────────────────────────────

function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isWeekend() {
  const dow = new Date().getDay(); // 0=Sun, 6=Sat
  return dow === 0 || dow === 6;
}

function isEarlyBird() {
  return new Date().getHours() < 8;
}

function readRecord() {
  try {
    return JSON.parse(localStorage.getItem(ENG_KEY) || 'null') || defaultRecord();
  } catch {
    return defaultRecord();
  }
}

function writeRecord(rec) {
  localStorage.setItem(ENG_KEY, JSON.stringify(rec));
}

function defaultRecord() {
  return {
    totalOpens:    0,
    lastOpenDate:  null,
    currentStreak: 0,
    longestStreak: 0,
    weekendOpens:  [],
    earlyBirdOpens: [],
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Call once per app launch (after splash screen). Safe to call multiple times
 *  in a session — only records once per calendar day. */
export function recordAppOpen() {
  const rec = readRecord();
  const td  = today();

  // Already recorded today — nothing to do
  if (rec.lastOpenDate === td) return;

  // Streak logic
  if (rec.lastOpenDate === yesterday()) {
    rec.currentStreak += 1;
  } else {
    rec.currentStreak = 1;
  }

  // Update longest
  if (rec.currentStreak > rec.longestStreak) {
    rec.longestStreak = rec.currentStreak;
  }

  // Weekend tracking — avoid duplicates
  if (isWeekend() && !rec.weekendOpens.includes(td)) {
    rec.weekendOpens.push(td);
  }

  // Early bird tracking — avoid duplicates
  if (isEarlyBird() && !rec.earlyBirdOpens.includes(td)) {
    rec.earlyBirdOpens.push(td);
  }

  rec.totalOpens  += 1;
  rec.lastOpenDate = td;

  writeRecord(rec);
}

/** Returns badge unlock states for the four engagement badges. */
export function getEngagementBadges() {
  const rec = readRecord();

  // On a Roll: 3+ consecutive-day streak
  const onARoll = rec.currentStreak >= 3;

  // Weekend Warrior: opened on at least 1 weekend day
  const weekendWarrior = rec.weekendOpens.length >= 1;

  // Weekend Legend: find a Saturday + Sunday that belong to the same ISO week.
  // Strategy: for every Saturday in the list, check if the following Sunday
  // (or any Sunday) also exists in the list by computing both dates for each week.
  let weekendLegend = false;
  const weekendSet = new Set(rec.weekendOpens);
  for (const dateStr of rec.weekendOpens) {
    const d = new Date(dateStr + 'T12:00:00'); // noon avoids DST edge cases
    const dow = d.getDay(); // 0=Sun, 6=Sat
    if (dow === 6) {
      // This is a Saturday — check if next day (Sunday) is in the set
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      const sunStr = nextDay.toISOString().slice(0, 10);
      if (weekendSet.has(sunStr)) { weekendLegend = true; break; }
    } else if (dow === 0) {
      // This is a Sunday — check if previous day (Saturday) is in the set
      const prevDay = new Date(d);
      prevDay.setDate(prevDay.getDate() - 1);
      const satStr = prevDay.toISOString().slice(0, 10);
      if (weekendSet.has(satStr)) { weekendLegend = true; break; }
    }
  }

  // Early Bird: opened at least once before 8am
  const earlyBird = rec.earlyBirdOpens.length >= 1;

  return { onARoll, weekendWarrior, weekendLegend, earlyBird };
}

/** Debug helper — forces all four engagement badges to unlock.
 *  Call from the dev UI; never ship in a production context. */
export function debugUnlockAll() {
  const rec = readRecord();

  // Ensure streak >= 3
  rec.currentStreak = Math.max(rec.currentStreak, 3);
  rec.longestStreak = Math.max(rec.longestStreak, 3);

  // Ensure a Saturday + Sunday pair from the same weekend exist
  // Use a fixed past weekend that is definitely in the past
  const sat = '2025-01-04'; // Saturday
  const sun = '2025-01-05'; // Sunday
  if (!rec.weekendOpens.includes(sat)) rec.weekendOpens.push(sat);
  if (!rec.weekendOpens.includes(sun)) rec.weekendOpens.push(sun);

  // Ensure at least one early-bird open
  if (rec.earlyBirdOpens.length === 0) rec.earlyBirdOpens.push('2025-01-06');

  rec.totalOpens = Math.max(rec.totalOpens, 5);

  writeRecord(rec);
}
