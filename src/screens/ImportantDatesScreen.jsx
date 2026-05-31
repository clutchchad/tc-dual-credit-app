import { useState, useEffect } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { events as seedEvents } from '../data/events';
import { C, FF } from '../tokens';

const BLUE = '#065990';
const DARK = '#022b52';
const LIME = '#EAFF00';

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysUntil(str) {
  const target = parseDate(str);
  if (!target) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86_400_000);
}

function fmtDate(str) {
  const d = parseDate(str);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtMonth(str) {
  const d = parseDate(str);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

function fmtDay(str) {
  const d = parseDate(str);
  if (!d) return '';
  return d.getDate();
}

// ── Badge config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  deadline: { label: 'Deadline', bg: LIME,                color: BLUE },
  event:    { label: 'Event',    bg: 'rgba(6,89,144,.10)', color: BLUE },
};

// ── DateCard ─────────────────────────────────────────────────────────────────

function DateCard({ item }) {
  const days   = daysUntil(item.date);
  const cfg    = TYPE_CONFIG[item.type] || TYPE_CONFIG.event;
  const isPast = days !== null && days < 0;

  let countdownLabel = null;
  if (days === 0)        countdownLabel = { text: 'Today',     color: '#059669' };
  else if (days === 1)   countdownLabel = { text: 'Tomorrow',  color: '#059669' };
  else if (days > 1 && days <= 14) countdownLabel = { text: `${days}d away`, color: BLUE };

  return (
    <div style={{
      background: isPast ? '#f9f9fb' : '#fff',
      borderRadius: 16,
      border: `1px solid ${isPast ? 'rgba(0,0,0,.07)' : C.border}`,
      boxShadow: isPast ? 'none' : '0 2px 10px rgba(0,0,0,.05)',
      padding: '13px 14px',
      marginBottom: 8,
      display: 'flex', alignItems: 'flex-start', gap: 13,
      opacity: isPast ? 0.55 : 1,
    }}>
      {/* Date block */}
      <div style={{
        width: 44, flexShrink: 0, textAlign: 'center',
        background: isPast ? 'rgba(0,0,0,.05)' : BLUE,
        borderRadius: 12, padding: '6px 4px',
      }}>
        <div style={{ fontFamily: FF, fontSize: 9, fontWeight: 700, color: isPast ? C.text3 : 'rgba(234,255,0,.85)', textTransform: 'uppercase', letterSpacing: '0.8px', lineHeight: 1 }}>
          {fmtMonth(item.date)}
        </div>
        <div style={{ fontFamily: FF, fontSize: 22, fontWeight: 900, color: isPast ? C.text3 : '#fff', lineHeight: 1.1, letterSpacing: '-1px' }}>
          {fmtDay(item.date)}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: FF, fontSize: 10, fontWeight: 700,
            color: cfg.color, background: cfg.bg,
            borderRadius: 20, padding: '2px 8px', letterSpacing: '0.3px',
          }}>
            {cfg.label}
          </span>
          {countdownLabel && (
            <span style={{ fontFamily: FF, fontSize: 10, fontWeight: 700, color: countdownLabel.color }}>
              {countdownLabel.text}
            </span>
          )}
        </div>
        <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: isPast ? C.text3 : C.text, letterSpacing: '-0.2px', lineHeight: 1.3, marginBottom: item.location ? 4 : 0 }}>
          {item.title}
        </div>
        {item.location && (
          <div style={{ fontFamily: FF, fontSize: 11.5, color: C.text3, lineHeight: 1.4 }}>
            {item.location}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Month group header ────────────────────────────────────────────────────────

function MonthHeader({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, marginTop: 4,
    }}>
      <span style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.4px' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ImportantDatesScreen({ onNavigate, tabs }) {
  const [items, setItems] = useState(() =>
    [...seedEvents].sort((a, b) => (a.date > b.date ? 1 : -1))
  );
  const [filter, setFilter] = useState('all'); // 'all' | 'event' | 'deadline'

  useEffect(() => {
    (async () => {
      try {
        const { initializeApp, getApps } = await import('firebase/app');
        const { getFirestore, collection, query, orderBy, getDocs } = await import('firebase/firestore');
        const firebaseConfig = {
          apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId:             import.meta.env.VITE_FIREBASE_APP_ID,
        };
        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const db  = getFirestore(app);

        const [evSnap, dlSnap] = await Promise.all([
          getDocs(query(collection(db, 'dcEvents'),    orderBy('date', 'asc'))),
          getDocs(query(collection(db, 'dcDeadlines'), orderBy('date', 'asc'))),
        ]);

        const live = [
          ...evSnap.docs.map(d => ({ type: 'event',    ...d.data(), id: d.id })),
          ...dlSnap.docs.map(d => ({ type: 'deadline', ...d.data(), id: d.id })),
        ];

        if (live.length > 0) {
          setItems(live.sort((a, b) => (a.date > b.date ? 1 : -1)));
        }
      } catch {
        // Firestore unavailable — seed data stays
      }
    })();
  }, []);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming  = items.filter(i => { const d = parseDate(i.date); return d && d >= today; });
  const past      = items.filter(i => { const d = parseDate(i.date); return d && d < today;  });
  const deadlines = upcoming.filter(i => i.type === 'deadline');

  // Apply filter to displayed items
  const filteredItems = filter === 'all'      ? items
                      : filter === 'event'    ? items.filter(i => i.type === 'event')
                      : items.filter(i => i.type === 'deadline');

  // Re-group based on filtered items
  const filteredGroups = filteredItems.reduce((acc, item) => {
    const d = parseDate(item.date);
    if (!d) return acc;
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader style={{ paddingBottom: 52 }}>
        <PageTitle title="Important Dates" sub="Events &amp; Deadlines" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 100px', marginTop: -42 }}>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[
            { id: 'all',      label: 'All',       count: items.length     },
            { id: 'event',    label: 'Upcoming',  count: upcoming.length  },
            { id: 'deadline', label: 'Deadlines', count: deadlines.length },
          ].map(tab => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  height: 34, padding: '0 13px', borderRadius: 20, border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  background: active ? BLUE : '#fff',
                  boxShadow: active ? 'none' : `0 1px 4px rgba(0,0,0,.07)`,
                  border: active ? 'none' : `1px solid ${C.border}`,
                }}
              >
                <span style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: active ? '#fff' : C.text3 }}>
                  {tab.label}
                </span>
                <span style={{
                  fontFamily: FF, fontSize: 10, fontWeight: 800,
                  color: active ? LIME : BLUE,
                  background: active ? 'rgba(234,255,0,.18)' : 'rgba(6,89,144,.08)',
                  borderRadius: 10, padding: '1px 6px',
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grouped list */}
        {Object.entries(filteredGroups).map(([month, groupItems]) => (
          <div key={month}>
            <MonthHeader label={month} />
            {groupItems.map(item => <DateCard key={item.id} item={item} />)}
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontFamily: FF, fontSize: 14, color: C.text3 }}>No dates on record.</div>
          </div>
        )}
      </div>

      <BottomNav active="dates" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
