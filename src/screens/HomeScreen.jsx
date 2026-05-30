import { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { getAcdcForSchool } from '../data/acdc';
import { schools as schoolList } from '../data/schools';
import { events as eventsData } from '../data/events';
import { C, FF } from '../tokens';
import { loadNotifications, relTime } from '../data/notifications';
import { getStudentProfile } from '../data/studentProfile';


/* ── Helpers ── */
function daysUntil(dateStr) {
  // dateStr is like "Jun 9" — assume current year
  const now = new Date();
  const parsed = new Date(`${dateStr} ${now.getFullYear()}`);
  if (isNaN(parsed)) return null;
  const diff = Math.ceil((parsed - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatDate(dateStr) {
  const now = new Date();
  const parsed = new Date(`${dateStr} ${now.getFullYear()}`);
  if (isNaN(parsed)) return dateStr;
  return parsed.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getGreeting(profile, role) {
  const name = profile?.firstName;
  if (name) return `Hey, ${name}!`;
  return role === 'student' ? 'Hey, Student!' : 'Hey!';
}

/* ── Seed timeline cards (fallback when Firestore unavailable) ── */
const SEED_TIMELINE = [
  {
    id: 'seed1',
    category: 'Announcement',
    title: 'Welcome to the TC Dual Credit App',
    body: 'Stay connected to your dual credit journey — deadlines, your ACDC, pathways, and more, all in one place.',
    daysAgo: 0,
  },
  {
    id: 'seed2',
    category: 'Reminder',
    title: 'Fall 2026 Registration is Coming',
    body: 'Make sure you meet with your ACDC before registration opens. Spots in dual credit courses fill fast — don\'t wait.',
    daysAgo: 3,
  },
  {
    id: 'seed3',
    category: 'TC Promise',
    title: 'You Could Qualify for TC Promise',
    body: 'Students who complete dual credit and meet eligibility requirements may qualify for the TC Promise scholarship. Ask your ACDC for details.',
    daysAgo: 7,
  },
];

function seedRelTime(daysAgo) {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return `${daysAgo}d ago`;
}

const CATEGORY_STYLES = {
  'Announcement': { bg: 'rgba(6,89,144,.10)',    color: '#065990' },
  'Reminder':     { bg: 'rgba(249,115,22,.10)',   color: '#c2410c' },
  'TC Promise':   { bg: 'rgba(22,163,74,.10)',    color: '#15803d' },
  'Event':        { bg: 'rgba(124,58,237,.10)',   color: '#7c3aed' },
};

/* ── CoachPhoto ── */
function CoachPhoto({ photo, name, size = 44 }) {
  const [err, setErr] = useState(false);
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (!photo || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg,rgba(6,89,144,.18),rgba(6,89,144,.38))',
        border: '2px solid rgba(234,255,0,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: FF, fontSize: size * 0.33, fontWeight: 800, color: C.blue }}>{initials}</span>
      </div>
    );
  }
  return (
    <img
      src={photo}
      alt={name}
      onError={() => setErr(true)}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', objectPosition: 'top',
        border: '2px solid rgba(234,255,0,.55)',
        flexShrink: 0,
      }}
    />
  );
}

/* ── ACDC Badge Strip ── */
function AcdcStrip({ acdc, onNavigate }) {
  return (
    <button
      onClick={() => onNavigate('acdc')}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: '#fff',
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(6,89,144,.08)',
        textAlign: 'left',
      }}
    >
      <CoachPhoto photo={acdc.photo} name={acdc.name} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.1px', marginBottom: 1 }}>
          My ACDC
        </div>
        <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {acdc.isFallback ? 'Dual Credit Office' : acdc.name}
        </div>
      </div>
      <a
        href={acdc.schedulingUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#EAFF00',
          border: 'none',
          borderRadius: 10,
          padding: '7px 14px',
          fontFamily: FF, fontSize: 12, fontWeight: 800, color: '#022b52',
          cursor: 'pointer',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Schedule
      </a>
    </button>
  );
}

/* ── Next Deadline Card ── */
function NextDeadlineCard({ onNavigate, schoolId }) {
  const filtered = eventsData.filter(e => e.type === 'deadline');
  const item = filtered[0] || null;
  const days = item ? item.days : null;
  const formatted = item ? formatDate(item.date) : null;

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 3px 14px rgba(6,89,144,.15)' }}>
      <div style={{ background: C.blue, padding: '13px 15px 11px', position: 'relative' }}>
        {/* Lime left accent bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#EAFF00', borderRadius: '0 0 0 0' }} />
        <div style={{ paddingLeft: 8 }}>
          <div style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: 'rgba(234,255,0,.85)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 6 }}>
            Next Deadline
          </div>
          {item ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.25 }}>
                  {item.title}
                </div>
                <div style={{ fontFamily: FF, fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>
                  {formatted}
                </div>
              </div>
              {days !== null && (
                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 12 }}>
                  <div style={{ fontFamily: FF, fontSize: 32, fontWeight: 900, color: '#EAFF00', lineHeight: 1, letterSpacing: '-2px' }}>{days}</div>
                  <div style={{ fontFamily: FF, fontSize: 9, color: 'rgba(255,255,255,.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>days</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontFamily: FF, fontSize: 13, color: 'rgba(255,255,255,.45)', fontStyle: 'italic' }}>
              No upcoming deadlines
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onNavigate('events')}
        style={{ width: '100%', background: '#fff', border: 'none', padding: '7px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span style={{ fontFamily: FF, fontSize: 11, color: C.text2, fontWeight: 500 }}>View all deadlines</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

/* ── Next Event Card ── */
function NextEventCard({ onNavigate }) {
  const filtered = eventsData.filter(e => e.type === 'event');
  const item = filtered[0] || null;
  const days = item ? item.days : null;
  const formatted = item ? formatDate(item.date) : null;

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 3px 14px rgba(6,89,144,.12)' }}>
      <div style={{ background: '#0a3d62', padding: '13px 15px 11px', position: 'relative' }}>
        {/* Royal Blue left accent bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#93d2ff', borderRadius: '0 0 0 0' }} />
        <div style={{ paddingLeft: 8 }}>
          <div style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: 'rgba(147,210,255,.85)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 6 }}>
            Next Event
          </div>
          {item ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.25 }}>
                  {item.title}
                </div>
                <div style={{ fontFamily: FF, fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>
                  {item.location ? `${formatted} · ${item.location}` : formatted}
                </div>
              </div>
              {days !== null && (
                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 12 }}>
                  <div style={{ fontFamily: FF, fontSize: 32, fontWeight: 900, color: '#93d2ff', lineHeight: 1, letterSpacing: '-2px' }}>{days}</div>
                  <div style={{ fontFamily: FF, fontSize: 9, color: 'rgba(255,255,255,.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>days</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontFamily: FF, fontSize: 13, color: 'rgba(255,255,255,.45)', fontStyle: 'italic' }}>
              No upcoming events
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onNavigate('events')}
        style={{ width: '100%', background: '#fff', border: 'none', padding: '7px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span style={{ fontFamily: FF, fontSize: 11, color: C.text2, fontWeight: 500 }}>View all events</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

/* ── Recent Notification Card ── */
function RecentNotifCard({ notif, onNavigate }) {
  return (
    <button
      onClick={() => onNavigate('notifications')}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: '#fff', border: `1px solid ${C.border}`,
        borderRadius: 16, padding: '12px 14px',
        cursor: 'pointer', textAlign: 'left',
        boxShadow: '0 2px 8px rgba(0,0,0,.04)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EAFF00" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.1px', marginBottom: 2 }}>
          Recent Notification
        </div>
        <div style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: '-0.1px', marginBottom: 1 }}>
          {notif ? notif.title : 'No notifications yet'}
        </div>
        <div style={{ fontFamily: FF, fontSize: 11.5, color: C.text2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {notif ? notif.body : 'Enable push notifications to stay up to date.'}
        </div>
      </div>
      <div style={{ flexShrink: 0, paddingLeft: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        {notif && <span style={{ fontFamily: FF, fontSize: 10, color: C.text3 }}>{relTime(notif.timestamp)}</span>}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </button>
  );
}

/* ── Timeline Card ── */
function TimelineCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES['Announcement'];
  const timestamp = item.daysAgo !== undefined ? seedRelTime(item.daysAgo) : (item.timestamp ? relTime(item.timestamp) : '');

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: '13px 15px', boxShadow: '0 1px 6px rgba(0,0,0,.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: FF, fontSize: 10, fontWeight: 700, color: catStyle.color, background: catStyle.bg, borderRadius: 20, padding: '3px 9px', letterSpacing: '0.3px' }}>
          {item.category}
        </span>
        <span style={{ fontFamily: FF, fontSize: 10.5, color: C.text3 }}>{timestamp}</span>
      </div>
      <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: '-0.2px', lineHeight: 1.3, marginBottom: 5 }}>
        {item.title}
      </div>
      <div
        style={{
          fontFamily: FF, fontSize: 12.5, color: C.text2, lineHeight: 1.55,
          overflow: expanded ? 'visible' : 'hidden',
          display: expanded ? 'block' : '-webkit-box',
          WebkitLineClamp: expanded ? undefined : 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {item.body}
      </div>
      {!expanded && item.body && item.body.length > 120 && (
        <button
          onClick={() => setExpanded(true)}
          style={{ background: 'none', border: 'none', padding: '4px 0 0', cursor: 'pointer', fontFamily: FF, fontSize: 12, fontWeight: 700, color: C.blue }}
        >
          Read more
        </button>
      )}
    </div>
  );
}

/* ── Main HomeScreen ── */
export default function HomeScreen({ role, school, grade, onNavigate, tabs }) {
  const schoolInfo = schoolList.find(s => s.id === school.id) || {};
  const barColor   = schoolInfo.bar       || '#065990';
  const barTextColor = schoolInfo.textColor || '#fff';
  const acdc       = getAcdcForSchool(school.id, grade);

  const [latestNotif,  setLatestNotif]  = useState(null);
  const [timeline,     setTimeline]     = useState(SEED_TIMELINE);
  const [profile,      setProfile]      = useState(null);

  useEffect(() => {
    loadNotifications().then(ns => setLatestNotif(ns[0] ?? null));
    getStudentProfile().then(p => setProfile(p));

    /* Try Firestore for timeline */
    (async () => {
      try {
        const { initializeApp, getApps } = await import('firebase/app');
        const { getFirestore, collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
        const firebaseConfig = {
          apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId:             import.meta.env.VITE_FIREBASE_APP_ID,
        };
        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const q = query(collection(db, 'timeline'), orderBy('timestamp', 'desc'), limit(20));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const cards = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setTimeline(cards);
        }
      } catch {}
    })();
  }, []);

  const greeting = getGreeting(profile, role);

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* ── HEADER ── */}
      <div style={{ background: C.blue, flexShrink: 0, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div style={{ padding: '12px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: FF, fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.7px', lineHeight: 1.1 }}>
              {greeting}
            </div>
            <div style={{ fontFamily: FF, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.55)', marginTop: 2, letterSpacing: '0.1px' }}>
              {school.name} · {role === 'student' ? 'Student' : 'Parent'}
            </div>
          </div>
          <button
            onClick={() => onNavigate('notifications')}
            style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
        </div>

        {/* School color bar */}
        <div style={{ background: barColor, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: FF, fontSize: 12.5, fontWeight: 700, color: barTextColor }}>{school.name}</span>
          {school.id === 'txh' && grade && (
            <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 20, padding: '2px 8px', fontFamily: FF, fontSize: 11, fontWeight: 700, color: '#fff' }}>
              {grade}
            </span>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 88 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px 0' }}>

          {/* ACDC Strip */}
          <AcdcStrip acdc={acdc} onNavigate={onNavigate} />

          {/* Deadline + Event side-by-side on wider screens, stacked on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
               className="md:grid-cols-2">
            <NextDeadlineCard onNavigate={onNavigate} schoolId={school.id} />
            <NextEventCard onNavigate={onNavigate} />
          </div>

          {/* Recent Notification */}
          <RecentNotifCard notif={latestNotif} onNavigate={onNavigate} />

        </div>

        {/* ── TIMELINE ── */}
        <div style={{ padding: '20px 14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 900, color: C.text, letterSpacing: '-0.3px' }}>Timeline</span>
            <div style={{ flex: 1, height: 2, borderRadius: 1, background: C.blue, opacity: 0.18 }} />
            <div style={{ width: 28, height: 2, borderRadius: 1, background: C.blue }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12 }}>
            {timeline.map(item => (
              <TimelineCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="home" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
