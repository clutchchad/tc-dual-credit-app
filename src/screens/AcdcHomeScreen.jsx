/**
 * AcdcHomeScreen — ACDC portal shell with five-tab bottom navigation.
 *
 * Manages its own tab state internally; all five tabs are rendered as
 * placeholder screens for now — each tab's full content is built in later steps.
 *
 * Reuses BottomNav, BlueHeader, and PageTitle from the existing component library.
 */
import { useState } from 'react';
import { C, FF } from '../tokens';
import BottomNav from '../components/BottomNav';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import Card from '../components/Card';
import AcdcProfileTab, { QrPlaceholder } from './AcdcProfileTab';
import AcdcResourcesTab from './AcdcResourcesTab';
import AcdcMoreTab      from './AcdcMoreTab';
import AcdcLookupTab    from './AcdcLookupTab';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

// ── ACDC tab definitions ──────────────────────────────────────────────────────
const ACDC_TABS = [
  { id: 'home',      label: 'Home',            screen: 'home'      },
  { id: 'profile',   label: 'Contact Card',    screen: 'profile'   },
  { id: 'lookup',    label: 'Student Look Up', screen: 'lookup'    },
  { id: 'resources', label: 'Resources',       screen: 'resources' },
  { id: 'more',      label: 'More',            screen: 'more'      },
];

// ── Shared avatar (photo → initials fallback) ────────────────────────────────
function AcdcAvatar({ photo, name, size = 48 }) {
  const [err, setErr] = useState(false);
  const initials = (name ?? '')
    .split(' ')
    .filter(w => /^[A-Z]/.test(w))
    .map(w => w[0])
    .join('')
    .slice(0, 2);

  if (photo && !err) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setErr(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover',
          border: '3px solid rgba(255,255,255,.35)',
          display: 'block',
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(255,255,255,.18)',
      border: '3px solid rgba(255,255,255,.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: FF, fontSize: size * 0.3, fontWeight: 900, color: '#fff' }}>
        {initials}
      </span>
    </div>
  );
}

// ── Dummy data ────────────────────────────────────────────────────────────────

const DUMMY_ANNOUNCEMENTS = [
  {
    id: 'a1',
    category: 'Announcements',
    title: 'Fall 2026 Dual Credit Registration Now Open',
    body: 'Registration for Fall 2026 dual credit courses is now open. Reach out to students at your school to confirm they are enrolled on time. Check the TC portal for seat availability.',
    timeLabel: 'Today',
  },
  {
    id: 'a2',
    category: 'Reminders',
    title: 'Textbook Waiver Deadline Approaching',
    body: 'Students receiving TC Promise awards should submit their textbook waiver requests before the end of the month. Direct them to the Financial Aid office if they have questions.',
    timeLabel: '2d ago',
  },
];

const DUMMY_DEADLINES = [
  { id: 'd1', date: 'Jun 20',  title: 'TSI Assessment Completion'        },
  { id: 'd2', date: 'Jun 30',  title: 'Dual Credit Application Deadline' },
  { id: 'd3', date: 'Jul 15',  title: 'Fall 2026 Enrollment Deadline'    },
];

const DUMMY_EVENTS = [
  { id: 'e1', date: 'Jul 8',   title: 'ACDC Summer Training'             },
  { id: 'e2', date: 'Aug 5',   title: 'Partner School Orientation'       },
  { id: 'e3', date: 'Aug 18',  title: 'Fall Semester Kickoff'            },
];

// ── Sent-notifications dummy data ────────────────────────────────────────────

const SENT_NOTIFS = [
  {
    id: 'n1',
    message: 'Fall 2026 dual credit registration is now open. Log in to the TC portal to confirm your course selections.',
    school: 'Texas High School',
    audience: 'Students',
    sentAt: 'Today, 9:02 AM',
  },
  {
    id: 'n2',
    message: 'Reminder: TSI Assessment results must be submitted by June 20. Contact your ACDC if you have questions.',
    school: 'Pleasant Grove High School',
    audience: 'Students',
    sentAt: 'Yesterday, 3:45 PM',
  },
  {
    id: 'n3',
    message: 'Your student has upcoming dual credit deadlines this month. Please review the Important Dates section in the app.',
    school: 'Texas High School',
    audience: 'Parents',
    sentAt: 'Jun 28, 11:00 AM',
  },
  {
    id: 'n4',
    message: 'Textbook waiver requests for TC Promise students are due by June 30. Students should visit the Financial Aid office.',
    school: 'Liberty-Eylau High School',
    audience: 'All',
    sentAt: 'Jun 27, 8:30 AM',
  },
  {
    id: 'n5',
    message: 'ACDC Summer Training session scheduled for July 8. All counselors should confirm attendance by July 1.',
    school: 'All Schools',
    audience: 'All',
    sentAt: 'Jun 25, 2:15 PM',
  },
  {
    id: 'n6',
    message: 'Fall 2026 dual credit application deadline is June 30. Ensure all students have completed their applications.',
    school: 'New Boston High School',
    audience: 'Students',
    sentAt: 'Jun 24, 10:00 AM',
  },
  {
    id: 'n7',
    message: 'Partner School Orientation is scheduled for August 5. Details will be shared one week before the event.',
    school: 'All Schools',
    audience: 'All',
    sentAt: 'Jun 22, 9:00 AM',
  },
];

const AUDIENCE_STYLE = {
  'Students': { bg: 'rgba(6,89,144,.10)',  color: BLUE },
  'Parents':  { bg: 'rgba(234,255,0,.35)', color: DARK },
  'All':      { bg: 'rgba(6,89,144,.07)',  color: DARK },
};

// ── Sent-notifications history sheet ─────────────────────────────────────────

function NotifsHistorySheet({ onClose }) {
  return (
    /* Overlay — tap outside to close */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.45)',
        zIndex: 300,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      {/* Sheet — stop propagation so tapping inside doesn't close */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '22px 22px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,.18)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '82vh',
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: C.border, margin: '14px auto 0',
          flexShrink: 0,
        }} />

        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 12px',
          flexShrink: 0,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <div style={{ fontFamily: FF, fontSize: 10, fontWeight: 700, color: C.text3,
              textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 2 }}>
              Last Notifications Sent
            </div>
            <div style={{ fontFamily: FF, fontSize: 16, fontWeight: 900, color: DARK,
              letterSpacing: '-0.3px' }}>
              Sent History
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: C.bg, border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke={C.text3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Scrollable list */}
        <div style={{
          overflowY: 'auto',
          padding: '8px 16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        }}>
          {SENT_NOTIFS.map((n, i) => {
            const aud = AUDIENCE_STYLE[n.audience] || AUDIENCE_STYLE['All'];
            return (
              <div
                key={n.id}
                style={{
                  padding: '14px 0',
                  borderBottom: i < SENT_NOTIFS.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                {/* Top row: school + time */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                  <span style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: BLUE,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {n.school}
                  </span>
                  <span style={{ fontFamily: FF, fontSize: 10.5, color: C.text3, flexShrink: 0 }}>
                    {n.sentAt}
                  </span>
                </div>
                {/* Message */}
                <div style={{ fontFamily: FF, fontSize: 13, color: C.text, lineHeight: 1.5, marginBottom: 8 }}>
                  {n.message}
                </div>
                {/* Audience chip */}
                <span style={{
                  fontFamily: FF, fontSize: 10, fontWeight: 700,
                  background: aud.bg, color: aud.color,
                  borderRadius: 20, padding: '3px 9px', letterSpacing: '0.3px',
                }}>
                  {n.audience}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Notifications Sent Card ───────────────────────────────────────────────────

function NotifsSentCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, marginBottom: 12, textAlign: 'left',
        }}
      >
        <Card style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Green checkmark circle */}
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: 'rgba(22,163,74,.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          {/* Label + chevron */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FF, fontSize: 10, fontWeight: 700, color: C.text3,
              textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 3 }}>
              Last Notifications Sent
            </div>
            <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: DARK }}>
              View sent history
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={C.text3} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </Card>
      </button>

      {open && <NotifsHistorySheet onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Announcement item row ─────────────────────────────────────────────────────

const CATEGORY_STYLES = {
  'Announcements': { bg: 'rgba(6,89,144,.10)', color: BLUE },
  'Reminders':     { bg: 'rgba(234,255,0,.30)', color: DARK },
};

function AnnouncementItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES['Announcements'];

  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`,
      padding: '13px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{
          fontFamily: FF, fontSize: 10, fontWeight: 700,
          color: catStyle.color, background: catStyle.bg,
          borderRadius: 20, padding: '3px 9px', letterSpacing: '0.3px',
        }}>
          {item.category}
        </span>
        <span style={{ fontFamily: FF, fontSize: 10.5, color: C.text3 }}>{item.timeLabel}</span>
      </div>
      <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 800, color: C.text,
        letterSpacing: '-0.2px', lineHeight: 1.3, marginBottom: 4 }}>
        {item.title}
      </div>
      <div style={{
        fontFamily: FF, fontSize: 12.5, color: C.text2, lineHeight: 1.55,
        overflow: expanded ? 'visible' : 'hidden',
        display: expanded ? 'block' : '-webkit-box',
        WebkitLineClamp: expanded ? undefined : 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {item.body}
      </div>
      {!expanded && item.body.length > 100 && (
        <button
          onClick={() => setExpanded(true)}
          style={{ background: 'none', border: 'none', padding: '4px 0 0', cursor: 'pointer',
            fontFamily: FF, fontSize: 12, fontWeight: 700, color: BLUE }}
        >
          Read more
        </button>
      )}
    </div>
  );
}

function AnnouncementsCard() {
  return (
    <Card style={{ padding: '16px 16px 4px', marginBottom: 12 }}>
      <div style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: BLUE,
        textTransform: 'uppercase', letterSpacing: '1.1px', marginBottom: 2 }}>
        Announcements
      </div>
      {DUMMY_ANNOUNCEMENTS.map(item => (
        <AnnouncementItem key={item.id} item={item} />
      ))}
    </Card>
  );
}

// ── Accordion section (Deadlines / Events) ────────────────────────────────────

function AccordionSection({ title, icon, items, accentColor = BLUE }) {
  const [open, setOpen] = useState(false);

  return (
    <Card style={{ marginBottom: 12, overflow: 'hidden' }}>
      {/* Header row — always visible, tap to toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '15px 16px',
          textAlign: 'left',
        }}
      >
        {/* Icon bubble */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(6,89,144,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>

        {/* Title + count */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 800, color: DARK,
            letterSpacing: '-0.2px' }}>
            {title}
          </span>
          <span style={{
            fontFamily: FF, fontSize: 10, fontWeight: 800,
            color: BLUE, background: 'rgba(6,89,144,.10)',
            borderRadius: 10, padding: '2px 7px',
          }}>
            {items.length}
          </span>
        </div>

        {/* Chevron — rotates when open */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"
          style={{ flexShrink: 0, transition: 'transform .22s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Collapsible content */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '4px 16px 12px' }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : 'none',
              }}
            >
              {/* Date pill */}
              <div style={{
                flexShrink: 0,
                background: BLUE, borderRadius: 10,
                padding: '5px 10px',
                minWidth: 52, textAlign: 'center',
              }}>
                <span style={{ fontFamily: FF, fontSize: 12, fontWeight: 800, color: '#fff',
                  letterSpacing: '-0.2px' }}>
                  {item.date}
                </span>
              </div>
              {/* Title */}
              <span style={{ fontFamily: FF, fontSize: 13.5, fontWeight: 700, color: C.text,
                flex: 1, lineHeight: 1.3 }}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Tab: Home ─────────────────────────────────────────────────────────────────
function TabHome({ acdc, onSignOut }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Blue gradient header */}
      <div style={{
        background: `linear-gradient(160deg, ${DARK} 0%, ${BLUE} 100%)`,
        padding: '0 20px 32px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: FF, fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1.15 }}>
          {acdc?.name ?? 'Abigail Beecher'}
        </div>
        <div style={{ fontFamily: FF, fontSize: 14, color: 'rgba(255,255,255,.65)', marginTop: 4 }}>
          Academic Coach for Dual Credit
        </div>
      </div>

      {/* Scrollable content — overlaps header with negative margin */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 100px', marginTop: -16 }}>

        <NotifsSentCard />
        <AnnouncementsCard />

        <AccordionSection
          title="Deadlines"
          items={DUMMY_DEADLINES}
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
            </svg>
          }
        />

        <AccordionSection
          title="Events"
          items={DUMMY_EVENTS}
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          }
        />
      </div>
    </div>
  );
}

// ── Generic placeholder tab ───────────────────────────────────────────────────
function TabPlaceholder({ title, icon }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle title={title} />
      </BlueHeader>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 28px 120px',
        marginTop: -24,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(6,89,144,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          {icon}
        </div>
        <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: DARK, letterSpacing: '-0.3px', marginBottom: 8, textAlign: 'center' }}>
          {title}
        </div>
        <p style={{ fontFamily: FF, fontSize: 14, color: C.text2, lineHeight: 1.6, textAlign: 'center', maxWidth: 260, margin: 0 }}>
          This section is coming in the next build step.
        </p>
      </div>
    </div>
  );
}

// Placeholder icon definitions — inline SVG matching BottomNav style
const TAB_ICONS = {
  profile: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  lookup: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  resources: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
  more: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill={BLUE}>
      <circle cx="12" cy="5"  r="1.75"/>
      <circle cx="12" cy="12" r="1.75"/>
      <circle cx="12" cy="19" r="1.75"/>
    </svg>
  ),
};

// ── Portal shell ──────────────────────────────────────────────────────────────
export default function AcdcHomeScreen({ acdc, onSignOut }) {
  const [activeTab, setActiveTab] = useState('home');

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <TabHome acdc={acdc} onSignOut={onSignOut} />;
      case 'profile':
        return <AcdcProfileTab acdc={acdc} />;
      case 'lookup':
        return <AcdcLookupTab />;
      case 'resources':
        return <AcdcResourcesTab />;
      case 'more':
        return <AcdcMoreTab onSignOut={onSignOut} />;
      default:
        return <TabHome acdc={acdc} onSignOut={onSignOut} />;
    }
  };

  return (
    <div
      className="tc-screen"
      style={{
        width: '100%', height: '100%',
        background: C.bg,
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}
    >
      {renderTab()}
      <BottomNav
        active={activeTab}
        onNavigate={setActiveTab}
        tabs={ACDC_TABS}
      />
    </div>
  );
}
