/**
 * AcdcHomeScreen — ACDC Staff Portal shell with five-tab bottom navigation.
 *
 * Tabs: Home | Contact Card | Pathways | Resources | More
 *
 * Home      — coach identity header + feed (notifications, announcements, events, deadlines)
 * Contact Card — AcdcProfileTab (coach views their own public card)
 * Pathways  — pathway plans filtered to only the coach's assigned schools
 * Resources — AcdcResourcesTab (same resource library as student experience)
 * More      — AcdcMoreTab (Sign Out → returns to role selection)
 *
 * FERPA-safe: no student data stored, displayed, or queried anywhere in this file.
 * All email/SMS actions are native device hand-offs (mailto:, sms:) with no
 * recipient address, message body, or send record stored by this app.
 */
import { useState, useMemo } from 'react';
import { C, FF } from '../tokens';
import BottomNav from '../components/BottomNav';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import AcdcProfileTab  from './AcdcProfileTab';
import AcdcResourcesTab from './AcdcResourcesTab';
import AcdcMoreTab      from './AcdcMoreTab';
import { PATHWAYS } from '../data/pathways';
import { SCHOOLS }  from '../data/schools';
import { events as ALL_EVENTS } from '../data/events';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

// ── ACDC-specific tab bar (separate from student/parent bar) ──────────────────
const ACDC_TABS = [
  { id: 'home',      label: 'Home',         screen: 'home'      },
  { id: 'profile',   label: 'Contact Card', screen: 'profile'   },
  { id: 'pathways',  label: 'Pathways',     screen: 'pathways'  },
  { id: 'resources', label: 'Resources',    screen: 'resources' },
  { id: 'more',      label: 'More',         screen: 'more'      },
];

const FULL_SCHOOL_NAMES = {
  txh:          'Texas High School',
  le:           'Liberty-Eylau High School',
  hooks:        'Hooks High School',
  pg:           'Pleasant Grove High School',
  bloomburg:    'Bloomburg High School',
  avery:        'Avery High School',
  dekalb:       'DeKalb High School',
  maud:         'Maud High School',
  prem:         'Premier High School',
  nb:           'New Boston High School',
  simms:        'James Bowie High School',
  atlanta:      'Atlanta High School',
  qc:           'Queen City High School',
  mcleod:       'McLeod High School',
  lk:           'Linden-Kildare High School',
  rw:           'Redwater High School',
  datx:         'Digital Academy of Texas',
  'ar-premier': 'Premier High School - Arkansas',
};

function getSchoolName(id) {
  return FULL_SCHOOL_NAMES[id] || id;
}

// ── Coach avatar (photo → initials fallback) ──────────────────────────────────
function CoachAvatar({ photo, name, size = 62 }) {
  const [err, setErr] = useState(false);
  const initials = (name ?? '').split(' ')
    .filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 2);

  if (photo && !err) {
    return (
      <img src={photo} alt={name} onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover',
          border: '3px solid rgba(255,255,255,.4)', display: 'block', flexShrink: 0 }} />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%',
      background: 'rgba(255,255,255,.18)', border: '3px solid rgba(255,255,255,.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: FF, fontSize: size * 0.3, fontWeight: 900, color: '#fff' }}>
        {initials}
      </span>
    </div>
  );
}

// ── Seed: notifications sent to students (replace with Firestore query later) ─
const SENT_NOTIFICATIONS = [
  {
    id: 'sn-1',
    title: 'Fall 2026 Registration is Open',
    body: 'Fall 2026 dual credit registration is now open. Students should log in to Jenzabar and select their courses before the deadline. Contact your ACDC with any questions.',
    date: '2026-05-28',
    schools: 'all',
  },
  {
    id: 'sn-2',
    title: 'TSIA2 Testing Reminder',
    body: 'Students who have not yet met TSIA2 requirements must test before August 1st. Testing is available at the TC Testing Center. Call 903-823-3278 to schedule.',
    date: '2026-05-20',
    schools: ['txh', 'le', 'pg'],
  },
  {
    id: 'sn-3',
    title: 'Application Deadline Approaching',
    body: 'The Fall 2026 dual credit application deadline is August 1st. Students who have not yet applied should visit my.texarkanacollege.edu to complete their application.',
    date: '2026-05-15',
    schools: 'all',
  },
];

// ── Seed: announcements (replace with Firestore query later) ─────────────────
const ANNOUNCEMENTS = [
  {
    id: 'an-1',
    title: 'Updated Dual Credit Handbook Available',
    body: 'The 2026–2027 Dual Credit Student Handbook has been updated. Key changes include revised drop/withdrawal policies and updated TSI exemption criteria. Share with incoming students.',
    date: '2026-05-22',
  },
  {
    id: 'an-2',
    title: 'Fall Orientation Confirmed for August 18',
    body: 'New Student Orientation is confirmed for August 18th on the TC campus. All new dual credit students are strongly encouraged to attend. Registration opens July 1st.',
    date: '2026-05-10',
  },
  {
    id: 'an-3',
    title: 'TC Promise Scholarship — New Cohort',
    body: 'TC Promise applications for the 2026–2027 cohort open June 1st. Encourage eligible graduating seniors to apply. Full tuition coverage for qualified students.',
    date: '2026-05-01',
  },
];

function fmtDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Expandable feed card ──────────────────────────────────────────────────────
function FeedCard({ title, date, meta, body, accentColor }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14,
      marginBottom: 10, overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '13px 14px', display: 'flex', alignItems: 'flex-start', gap: 10,
          textAlign: 'left', boxSizing: 'border-box',
        }}
      >
        {accentColor && (
          <div style={{ width: 3, borderRadius: 4, alignSelf: 'stretch', flexShrink: 0,
            background: accentColor, minHeight: 28, marginTop: 1 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text,
            lineHeight: 1.3, marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {date && (
              <span style={{ fontFamily: FF, fontSize: 11, color: C.text3 }}>{fmtDate(date)}</span>
            )}
            {meta && meta.map((m, i) => (
              <span key={i} style={{
                fontFamily: FF, fontSize: 10, fontWeight: 700, color: BLUE,
                background: `${BLUE}12`, borderRadius: 20, padding: '2px 8px',
              }}>{m}</span>
            ))}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"
          style={{ flexShrink: 0, marginTop: 4, transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform .2s' }}>
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {open && body && (
        <div style={{
          padding: '0 14px 14px', paddingLeft: accentColor ? '27px' : '14px',
          borderTop: `1px solid ${C.border}`,
        }}>
          <p style={{ fontFamily: FF, fontSize: 13, color: C.text2, lineHeight: 1.65,
            margin: '12px 0 0' }}>
            {body}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHead({ label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 10, marginTop: 20, paddingLeft: 2 }}>
      <span style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: C.text3,
        textTransform: 'uppercase', letterSpacing: '1.4px' }}>
        {label}
      </span>
      {count != null && (
        <span style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: BLUE,
          background: `${BLUE}12`, borderRadius: 20, padding: '2px 9px' }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ── Tab: Home ─────────────────────────────────────────────────────────────────
function TabHome({ acdc }) {
  const schoolList = useMemo(() => [
    ...(acdc?.txhGrades?.length ? ['txh'] : []),
    ...(acdc?.schools || []),
  ], [acdc]);

  // Filter sent notifications to coach's schools
  const sentNotifs = useMemo(() => SENT_NOTIFICATIONS.filter(n =>
    n.schools === 'all' || schoolList.some(s => n.schools.includes(s))
  ), [schoolList]);

  // Filter events and deadlines to coach's schools
  const upcomingEvents = useMemo(() => ALL_EVENTS.filter(e =>
    e.type === 'event' && (e.school === 'all' || schoolList.includes(e.school))
  ), [schoolList]);

  const upcomingDeadlines = useMemo(() => ALL_EVENTS.filter(e =>
    e.type === 'deadline' && (e.school === 'all' || schoolList.includes(e.school))
  ), [schoolList]);

  // Build "audience" label for sent notifications
  function audienceLabels(n) {
    if (n.schools === 'all') return ['All Schools'];
    return n.schools.map(id => getSchoolName(id).replace(' High School', ''));
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Gradient header — coach identity */}
      <div style={{
        background: `linear-gradient(160deg, ${DARK} 0%, ${BLUE} 100%)`,
        flexShrink: 0,
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 18px)',
        paddingBottom: 24, paddingLeft: 20, paddingRight: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CoachAvatar photo={acdc?.photo} name={acdc?.name} size={62} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: LIME,
              textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 4 }}>
              ACDC Staff Portal
            </div>
            <div style={{ fontFamily: FF, fontSize: 22, fontWeight: 900, color: '#fff',
              letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              {acdc?.name ?? ''}
            </div>
            <div style={{ fontFamily: FF, fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 3 }}>
              {acdc?.title ?? 'Academic Coach for Dual Credit'}
            </div>
          </div>
        </div>

        {schoolList.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {schoolList.map(id => (
              <span key={id} style={{
                fontFamily: FF, fontSize: 11, fontWeight: 700, color: LIME,
                background: 'rgba(234,255,0,.15)', borderRadius: 20, padding: '3px 10px',
                border: '1px solid rgba(234,255,0,.25)',
              }}>
                {getSchoolName(id)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 120px' }}>

        {/* Notifications Sent */}
        <SectionHead label="Notifications Sent" count={sentNotifs.length} />
        {sentNotifs.length > 0 ? sentNotifs.map(n => (
          <FeedCard key={n.id}
            title={n.title}
            date={n.date}
            meta={audienceLabels(n)}
            body={n.body}
            accentColor={LIME}
          />
        )) : (
          <p style={{ fontFamily: FF, fontSize: 13, color: C.text3, paddingLeft: 2, marginBottom: 8 }}>
            No notifications sent yet.
          </p>
        )}

        {/* Announcements */}
        <SectionHead label="Announcements" count={ANNOUNCEMENTS.length} />
        {ANNOUNCEMENTS.map(a => (
          <FeedCard key={a.id}
            title={a.title}
            date={a.date}
            body={a.body}
            accentColor={BLUE}
          />
        ))}

        {/* Upcoming Events */}
        <SectionHead label="Upcoming Events" count={upcomingEvents.length} />
        {upcomingEvents.length > 0 ? upcomingEvents.map(e => (
          <FeedCard key={e.id}
            title={e.title}
            date={e.date}
            meta={e.school !== 'all' ? [getSchoolName(e.school).replace(' High School', '')] : null}
            body={e.location ? `📍 ${e.location}` : null}
            accentColor={`${BLUE}60`}
          />
        )) : (
          <p style={{ fontFamily: FF, fontSize: 13, color: C.text3, paddingLeft: 2, marginBottom: 8 }}>
            No upcoming events.
          </p>
        )}

        {/* Deadlines */}
        <SectionHead label="Deadlines" count={upcomingDeadlines.length} />
        {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(d => (
          <FeedCard key={d.id}
            title={d.title}
            date={d.date}
            meta={d.school !== 'all' ? [getSchoolName(d.school).replace(' High School', '')] : null}
            body={d.location || null}
            accentColor="#dc2626"
          />
        )) : (
          <p style={{ fontFamily: FF, fontSize: 13, color: C.text3, paddingLeft: 2, marginBottom: 8 }}>
            No upcoming deadlines.
          </p>
        )}

      </div>
    </div>
  );
}

// ── Tab: Pathways (filtered to coach's assigned schools) ──────────────────────
function TabPathways({ acdc }) {
  const [selectedSchool, setSelectedSchool] = useState(null);

  const assignedIds = useMemo(() => [
    ...(acdc?.txhGrades?.length ? ['txh'] : []),
    ...(acdc?.schools || []),
  ], [acdc]);

  const assignedSchools = useMemo(
    () => SCHOOLS.filter(s => assignedIds.includes(s.id)),
    [assignedIds]
  );

  const pathways = useMemo(
    () => selectedSchool ? PATHWAYS.filter(p => p.school === selectedSchool.id) : [],
    [selectedSchool]
  );

  if (selectedSchool) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <BlueHeader style={{ paddingBottom: 36 }}>
          <PageTitle
            title={selectedSchool.name}
            sub="Pathway plans"
            onBack={() => setSelectedSchool(null)}
          />
        </BlueHeader>

        {/* School color bar */}
        <div style={{ backgroundColor: selectedSchool.color, padding: '8px 16px', flexShrink: 0 }}>
          <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 700,
            color: selectedSchool.textColor || '#fff' }}>
            Pathway Plans at {selectedSchool.name}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 120px' }}>
          <p style={{ fontFamily: FF, fontSize: 13, color: C.text2, lineHeight: 1.6, marginBottom: 14 }}>
            Tap any pathway to open the full Early Enrollment Pathway Plan.
          </p>
          {pathways.length > 0 ? pathways.map(p => (
            <button key={p.id}
              onClick={() => window.open(p.pdfUrl, '_blank', 'noopener,noreferrer')}
              style={{
                width: '100%', background: '#fff', border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '16px 14px', marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                textAlign: 'left', boxSizing: 'border-box',
                transition: 'transform .1s',
              }}
              onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 600, color: C.text }}>
                {p.name.replace(/^EEPP\s*–\s*/, '')}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE}
                strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )) : (
            <p style={{ fontFamily: FF, fontSize: 13, color: C.text2, textAlign: 'center', paddingTop: 40 }}>
              No pathways available for this school.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle title="Pathways" sub="Your assigned schools" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 120px', marginTop: -24 }}>
        {assignedSchools.length > 0 ? assignedSchools.map(school => (
          <button key={school.id} onClick={() => setSelectedSchool(school)}
            style={{
              width: '100%', background: school.color, border: 'none',
              borderRadius: 14, padding: '14px 16px', marginBottom: 10,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
              textAlign: 'left', boxSizing: 'border-box',
              boxShadow: '0 2px 10px rgba(0,0,0,.12)', transition: 'transform .1s',
            }}
            onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 700,
              color: school.textColor || '#fff', flex: 1 }}>
              {school.name}
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={school.textColor || '#fff'} strokeWidth="2.5" strokeLinecap="round"
              style={{ flexShrink: 0, opacity: 0.8 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )) : (
          <p style={{ fontFamily: FF, fontSize: 14, color: C.text2, textAlign: 'center', paddingTop: 60 }}>
            No schools assigned to your profile.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Portal shell ──────────────────────────────────────────────────────────────
export default function AcdcHomeScreen({ acdc, onSignOut }) {
  const [activeTab, setActiveTab] = useState('home');

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <TabHome acdc={acdc} />;
      case 'profile':
        return <AcdcProfileTab acdc={acdc} />;
      case 'pathways':
        return <TabPathways acdc={acdc} />;
      case 'resources':
        return <AcdcResourcesTab />;
      case 'more':
        return <AcdcMoreTab onSignOut={onSignOut} />;
      default:
        return <TabHome acdc={acdc} />;
    }
  };

  return (
    <div className="tc-screen"
      style={{ width: '100%', height: '100%', background: C.bg,
        display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {renderTab()}
      <BottomNav active={activeTab} onNavigate={setActiveTab} tabs={ACDC_TABS} />
    </div>
  );
}
