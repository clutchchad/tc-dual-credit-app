import { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BottomNav from '../components/BottomNav';
import { useIsTablet } from '../hooks/useIsTablet';
import { getAcdcForSchool } from '../data/acdc';
import { schools as schoolList } from '../data/schools';
import { events } from '../data/events';
import { C, FF } from '../tokens';
import { loadNotifications, relTime } from '../data/notifications';
import { getStudentProfile } from '../data/studentProfile';
import { buildSchedulingUrl } from '../data/buildSchedulingUrl';

const BLUE = '#065990';
const CARDS_KEY = 'tcdc_v1_cards';
const DEFAULT_CARD_ORDER = ['acdc', 'deadline', 'event', 'announce', 'lastnotif'];
function loadCardOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem(CARDS_KEY));
    if (Array.isArray(saved) && saved.length === DEFAULT_CARD_ORDER.length) return saved;
  } catch {}
  return [...DEFAULT_CARD_ORDER];
}

const FULL_SCHOOL_NAMES = {
  txh:       'Texas High School',
  le:        'Liberty-Eylau High School',
  hooks:     'Hooks High School',
  pg:        'Pleasant Grove High School',
  bloomburg: 'Bloomburg High School',
  avery:     'Avery High School',
  dekalb:    'DeKalb High School',
  maud:      'Maud High School',
  prem:      'Premier High School',
  nb:        'New Boston High School',
  simms:     'James Bowie High School',
  atlanta:   'Atlanta High School',
  qc:        'Queen City High School',
  mcleod:    'McLeod High School',
  lk:        'Linden-Kildare High School',
  rw:        'Redwater High School',
  datx:      'Digital Academy of Texas',
  'ar-premier': 'Premier High School - Arkansas',
};

function getFullSchoolName(id) {
  return FULL_SCHOOL_NAMES[id] || id;
}
const LIME = '#EAFF00';
const DARK = '#022b52';

/* ── Helpers ── */
// Expects 'YYYY-MM-DD' — returns days until that date (negative if past)
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today  = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86_400_000);
}

// Expects 'YYYY-MM-DD' — returns human-readable short date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

// Return the soonest upcoming item of the given type (days >= 0)
function soonest(type) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return (
    events
      .filter(e => e.type === type)
      .map(e => ({ ...e, _days: daysUntil(e.date) }))
      .filter(e => e._days !== null && e._days >= 0)
      .sort((a, b) => a._days - b._days)[0] || null
  );
}

function getGreeting(profile, role) {
  if (role === 'guest') return 'Welcome to TC Dual Credit';
  const name = profile?.firstName;
  if (role === 'parent') return name ? `Hey, ${name}!` : 'Hey, Parent!';
  if (name) return `Hey, ${name}!`;
  return 'Hey, Student!';
}

/* ── Seed timeline — student / default ── */
const SEED_TIMELINE = [
  {
    id: 'seed1',
    category: 'Announcements',
    title: 'Welcome to the TC Dual Credit App',
    body: 'Stay connected to your dual credit journey — deadlines, your ACDC, pathways, and more, all in one place.',
    daysAgo: 0,
  },
  {
    id: 'seed2',
    category: 'Reminders',
    title: 'Fall 2026 Registration is Coming',
    body: "Make sure you meet with your ACDC before registration opens. Spots in dual credit courses fill fast — don't wait.",
    daysAgo: 3,
  },
];

/* ── Seed timeline — parent ── */
const PARENT_SEED_TIMELINE = [
  {
    id: 'pseed1',
    category: 'Announcements',
    title: "Welcome, Parent!",
    body: "This app keeps you connected to your child's dual credit journey — deadlines, their Academic Coach, and more, all in one place.",
    daysAgo: 0,
  },
  {
    id: 'pseed2',
    category: 'Reminders',
    title: 'Fall 2026 Registration is Coming',
    body: 'Encourage your student to meet with their ACDC before registration opens. Dual credit spots fill quickly!',
    daysAgo: 3,
  },
];

function seedRelTime(daysAgo) {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return `${daysAgo}d ago`;
}

const CATEGORY_STYLES = {
  'Announcements': { bg: 'rgba(6,89,144,.10)',   color: '#065990' },
  'Announcement':  { bg: 'rgba(6,89,144,.10)',   color: '#065990' },
  'Reminder':      { bg: 'transparent',          color: LIME      },
  'Reminders':     { bg: 'transparent',          color: LIME      },
  'TC Promise':    { bg: 'rgba(22,163,74,.10)',  color: '#15803d' },
  'Event':         { bg: 'rgba(124,58,237,.10)', color: '#7c3aed' },
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
        border: `2px solid ${BLUE}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: FF, fontSize: size * 0.33, fontWeight: 800, color: BLUE }}>{initials}</span>
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
        border: `2px solid ${BLUE}`,
        flexShrink: 0,
      }}
    />
  );
}

/* ── Unified sortable item — used for all 5 home cards ── */
function SortableItem({ id, fullWidth, handlePos, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        gridColumn: fullWidth ? '1 / -1' : undefined,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        position: 'relative',
        zIndex: isDragging ? 999 : 'auto',
        height: '100%',
      }}
    >
      {children}
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          ...(handlePos === 'center'
            ? { top: 8, left: '50%', transform: 'translateX(-50%)' }
            : { top: 8, right: 8 }),
          width: 28, height: 22, borderRadius: 6,
          background: 'rgba(6,89,144,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab', touchAction: 'none', zIndex: 10,
        }}
      >
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <rect x="0" y="0" width="14" height="2" rx="1" fill={BLUE} fillOpacity="0.45"/>
          <rect x="0" y="4" width="14" height="2" rx="1" fill={BLUE} fillOpacity="0.45"/>
          <rect x="0" y="8" width="14" height="2" rx="1" fill={BLUE} fillOpacity="0.45"/>
        </svg>
      </div>
    </div>
  );
}

/* ── ACDC Strip — 3 action icons ── */
function AcdcStrip({ acdc, onNavigate }) {
  const iconBtn = (content, href, target) => (
    <a
      href={href}
      target={target}
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', flexShrink: 0 }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: BLUE,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {content}
      </div>
    </a>
  );

  const calIcon   = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2.3" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
  const phoneIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2.3" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
  const mailIcon  = (stroke) => <svg width="15" height="13" viewBox="0 0 24 20" fill="none" stroke={stroke} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>;

  return (
    <div style={{
      width: '100%', boxSizing: 'border-box',
      background: '#fff',
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 2px 10px rgba(6,89,144,.08)',
    }}>
      {/* Photo — taps to ACDC screen */}
      <button onClick={() => onNavigate('acdc')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
        <CoachPhoto photo={acdc.photo} name={acdc.name} size={44} />
      </button>

      {/* Name — taps to ACDC screen */}
      <button onClick={() => onNavigate('acdc')} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
        <div style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.1px', marginBottom: 1 }}>My ACDC</div>
        <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acdc.name}</div>
      </button>

      {/* 3 action icons */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
        {iconBtn(calIcon, buildSchedulingUrl(), '_blank')}
        {iconBtn(phoneIcon, `tel:${acdc.phone}`, undefined)}
        {acdc.email
          ? iconBtn(mailIcon(LIME), `mailto:${acdc.email}`, undefined)
          : (
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: BLUE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {mailIcon(LIME)}
            </div>
          )
        }
      </div>
    </div>
  );
}

/* ── Next Deadline Card ── */
function NextDeadlineCard({ onNavigate }) {
  const item      = soonest('deadline');
  const days      = item ? daysUntil(item.date) : null;
  const formatted = item ? formatDate(item.date) : null;

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 3px 14px rgba(6,89,144,.15)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ background: BLUE, padding: '13px 15px 11px', position: 'relative', flex: 1 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: LIME }} />
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
                  <div style={{ fontFamily: FF, fontSize: 32, fontWeight: 900, color: LIME, lineHeight: 1, letterSpacing: '-2px' }}>{days}</div>
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
        style={{ width: '100%', background: '#fff', border: 'none', padding: '7px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}
      >
        <span style={{ fontFamily: FF, fontSize: 11, color: C.text2, fontWeight: 500 }}>View all deadlines</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

/* ── Next Event Card ── */
function NextEventCard({ onNavigate }) {
  const item      = soonest('event');
  const days      = item ? daysUntil(item.date) : null;
  const formatted = item ? formatDate(item.date) : null;

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 3px 14px rgba(234,255,0,.25)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ background: LIME, padding: '13px 15px 11px', position: 'relative', flex: 1 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: BLUE }} />
        <div style={{ paddingLeft: 8 }}>
          <div style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 6, opacity: 0.7 }}>
            Next Event
          </div>
          {item ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: DARK, letterSpacing: '-0.3px', lineHeight: 1.25 }}>
                  {item.title}
                </div>
                <div style={{ fontFamily: FF, fontSize: 11, color: 'rgba(2,43,82,.55)', marginTop: 3 }}>
                  {item.location ? `${formatted} · ${item.location}` : formatted}
                </div>
              </div>
              {days !== null && (
                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 12 }}>
                  <div style={{ fontFamily: FF, fontSize: 32, fontWeight: 900, color: BLUE, lineHeight: 1, letterSpacing: '-2px' }}>{days}</div>
                  <div style={{ fontFamily: FF, fontSize: 9, color: 'rgba(2,43,82,.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>days</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontFamily: FF, fontSize: 13, color: 'rgba(2,43,82,.45)', fontStyle: 'italic' }}>
              No upcoming events
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onNavigate('events')}
        style={{ width: '100%', background: '#fff', border: 'none', padding: '7px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}
      >
        <span style={{ fontFamily: FF, fontSize: 11, color: C.text2, fontWeight: 500 }}>View all events</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

/* ── Announcement Card (Event color scheme: Lime bg, Blue accent) ── */
function AnnouncementCard({ item, onNavigate }) {
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 3px 14px rgba(234,255,0,.25)',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{ background: LIME, padding: '13px 15px 11px', position: 'relative', flex: 1 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: BLUE }} />
        <div style={{ paddingLeft: 8 }}>
          <div style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 6, opacity: 0.7 }}>
            Announcements
          </div>
          {item ? (
            <div>
              <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: DARK, letterSpacing: '-0.3px', lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {item.title}
              </div>
              <div style={{ fontFamily: FF, fontSize: 11, color: 'rgba(2,43,82,.55)', marginTop: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {item.body}
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: FF, fontSize: 13, color: 'rgba(2,43,82,.45)', fontStyle: 'italic' }}>
              No announcements
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onNavigate('notifications')}
        style={{ width: '100%', background: '#fff', border: 'none', padding: '7px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}
      >
        <span style={{ fontFamily: FF, fontSize: 11, color: C.text2, fontWeight: 500 }}>View all announcements</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

/* ── Last Notification Card (Deadline color scheme: Blue bg, Lime accent) ── */
function LastNotifCard({ notif, onNavigate }) {
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 3px 14px rgba(6,89,144,.15)',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{ background: BLUE, padding: '13px 15px 11px', position: 'relative', flex: 1 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: LIME }} />
        <div style={{ paddingLeft: 8 }}>
          <div style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: 'rgba(234,255,0,.85)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 6 }}>
            Last Notification
          </div>
          {notif ? (
            <div>
              <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {notif.title}
              </div>
              <div style={{ fontFamily: FF, fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {notif.body}
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: FF, fontSize: 13, color: 'rgba(255,255,255,.45)', fontStyle: 'italic' }}>
              No notifications yet
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onNavigate('notifications')}
        style={{ width: '100%', background: '#fff', border: 'none', padding: '7px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}
      >
        <span style={{ fontFamily: FF, fontSize: 11, color: C.text2, fontWeight: 500 }}>View all notifications</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
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
      <div style={{ width: 40, height: 40, borderRadius: 12, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2.2" strokeLinecap="round">
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

/* ── Guest Apply Banner ── */
function GuestApplyBanner() {
  return (
    <a
      href="https://my.texarkanacollege.edu/ICS/Admissions/Dual-Credit_Application.jnz"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: LIME,
        borderRadius: 16,
        padding: '15px 16px',
        textDecoration: 'none',
        boxShadow: '0 4px 20px rgba(234,255,0,.40)',
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(2,43,82,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <path d="M14 2v6h6M12 18v-6M9 15h6"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 900, color: DARK, letterSpacing: '-0.3px' }}>
          Apply for Dual Credit
        </div>
        <div style={{ fontFamily: FF, fontSize: 12, color: 'rgba(2,43,82,.65)', marginTop: 2 }}>
          Start earning college credits while in high school
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
    </a>
  );
}

/* ── Timeline Card ── */
function TimelineCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES['Announcement'];
  const timestamp = item.daysAgo !== undefined
    ? seedRelTime(item.daysAgo)
    : (item.timestamp ? relTime(item.timestamp) : '');

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
          style={{ background: 'none', border: 'none', padding: '4px 0 0', cursor: 'pointer', fontFamily: FF, fontSize: 12, fontWeight: 700, color: BLUE }}
        >
          Read more
        </button>
      )}
    </div>
  );
}

/* ── Timeline Section ── */
// excludeCategories: array of category strings already shown elsewhere (e.g. compact cards)
function TimelineSection({ items, isTablet, excludeCategories = [] }) {
  const pad = isTablet ? '24px 24px 0' : '20px 14px 0';
  const visible = excludeCategories.length
    ? items.filter(i => !excludeCategories.includes(i.category))
    : items;
  if (!visible.length) return null;
  return (
    <div style={{ padding: pad }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12 }}>
        {visible.map(item => <TimelineCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}

/* ── Read tcdc_v1 from localStorage ── */
function getLocalProfile() {
  try { return JSON.parse(localStorage.getItem('tcdc_v1') || '{}'); } catch { return {}; }
}

/* ════════════════════════════════════════════════════════
   Main HomeScreen
   ════════════════════════════════════════════════════════ */
export default function HomeScreen({ role: roleProp, school, grade, onNavigate, tabs }) {
  const isTablet  = useIsTablet();
  // Use localStorage as ground truth to avoid any state-timing lag on role
  const localProfile = getLocalProfile();
  const role      = roleProp || localProfile.role || 'guest';

  const isGuest   = role === 'guest';
  const isStudent = role === 'student';
  const isParent  = role === 'parent';

  // Identity data for student header — comes from localStorage (set during ID flow)
  const storedFirstName = localProfile.firstName || null;
  const storedLastName  = localProfile.lastName  || null;
  const storedStudentId = localProfile.studentId || null;
  const fullName = [storedFirstName, storedLastName].filter(Boolean).join(' ') || null;

  const schoolInfo    = school ? (schoolList.find(s => s.id === school.id) || {}) : {};
  const barColor      = schoolInfo.color     || BLUE;
  const barTextColor  = schoolInfo.textColor || '#fff';
  const resolvedGrade = grade || localProfile.grade || null;
  const acdc          = (school && !isGuest) ? getAcdcForSchool(school.id, resolvedGrade) : null;

  const [latestNotif, setLatestNotif] = useState(null);
  const [timeline,    setTimeline]    = useState(isParent ? PARENT_SEED_TIMELINE : SEED_TIMELINE);
  const [profile,     setProfile]     = useState(null);
  const [cardOrder, setCardOrder] = useState(loadCardOrder);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;

    setCardOrder(prev => {
      const activeId = active.id;
      const overId   = over.id;

      if (activeId === 'acdc') {
        // Determine where arrayMove would place ACDC, then snap to the
        // nearest of the three valid flat-array positions: 0 (top), 2 (middle), 4 (bottom).
        const rawOrder  = arrayMove(prev, prev.indexOf('acdc'), prev.indexOf(overId));
        const rawIdx    = rawOrder.indexOf('acdc');
        const snapped   = [0, 2, 4].reduce((best, pos) =>
          Math.abs(pos - rawIdx) < Math.abs(best - rawIdx) ? pos : best
        );
        // Rebuild: extract mini cards in their current relative order, then
        // splice ACDC into the snapped slot.
        const minis = prev.filter(id => id !== 'acdc');
        minis.splice(snapped, 0, 'acdc');          // splice(0)→top, (2)→mid, (4)→bottom
        try { localStorage.setItem(CARDS_KEY, JSON.stringify(minis)); } catch {}
        return minis;
      }

      // Mini card drag: block landing on ACDC (would break the layout).
      if (overId === 'acdc') return prev;

      // Both active and over are mini cards — free swap.
      const next = arrayMove(prev, prev.indexOf(activeId), prev.indexOf(overId));
      try { localStorage.setItem(CARDS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const latestAnnounce = timeline.find(i => i.category === 'Announcements' || i.category === 'Announcement');
  const allCardContent = {
    acdc:      acdc ? <AcdcStrip acdc={acdc} onNavigate={onNavigate} /> : null,
    deadline:  <NextDeadlineCard onNavigate={onNavigate} />,
    event:     <NextEventCard onNavigate={onNavigate} />,
    announce:  <AnnouncementCard item={latestAnnounce} onNavigate={onNavigate} />,
    lastnotif: <LastNotifCard notif={latestNotif} onNavigate={onNavigate} />,
  };

  useEffect(() => {
    if (!isGuest) {
      loadNotifications().then(ns => setLatestNotif(ns[0] ?? null));
    }
    if (isStudent) {
      getStudentProfile().then(p => setProfile(p));
    }

    /* Try Firestore for timeline — filter by active, role, and school */
    (async () => {
      try {
        const { initializeApp, getApps } = await import('firebase/app');
        const { getFirestore, collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
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
        // Fetch active posts ordered by recency; filter role+school client-side
        const q = query(
          collection(db, 'timeline'),
          where('active', '==', true),
          orderBy('timestamp', 'desc'),
          limit(40),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const userRole   = role;
          const userSchool = school?.id || localProfile.school || null;
          const filtered = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(item => {
              const roleMatch   = !item.targetRole || item.targetRole === 'all' || item.targetRole === userRole;
              const schoolMatch = !item.school     || item.school     === 'all' || (userSchool && item.school === userSchool);
              return roleMatch && schoolMatch;
            })
            .slice(0, 10);
          if (filtered.length > 0) setTimeline(filtered);
        }
      } catch {}
    })();
  }, []);

  const greeting = getGreeting(profile, role);

  /* ── Shared header ── */
  const renderHeader = () => (
    <div style={{ background: BLUE, flexShrink: 0, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div style={{ padding: '12px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            {isStudent ? (
              /* Student identity block — name / ID / school+grade */
              <>
                <div style={{ fontFamily: FF, fontSize: 21, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                  {fullName || 'Student'}
                </div>
                {storedStudentId && (
                  <div style={{ fontFamily: FF, fontSize: 11.5, color: 'rgba(255,255,255,.60)', marginTop: 2, letterSpacing: '0.1px' }}>
                    ID: {storedStudentId}
                  </div>
                )}
              </>
            ) : isParent ? (
              /* Parent identity block — mirrors student block, framed as "Parent of" */
              <>
                <div style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: 'rgba(234,255,0,.75)', textTransform: 'uppercase', letterSpacing: '1.1px', marginBottom: 3 }}>
                  Parent of
                </div>
                <div style={{ fontFamily: FF, fontSize: 21, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                  {fullName || 'Student'}
                </div>
                {storedStudentId && (
                  <div style={{ fontFamily: FF, fontSize: 11.5, color: 'rgba(255,255,255,.60)', marginTop: 2, letterSpacing: '0.1px' }}>
                    ID: {storedStudentId}
                  </div>
                )}
              </>
            ) : (
              /* Guest single-line greeting */
              <>
                <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.6px', lineHeight: 1.1 }}>
                  {greeting}
                </div>
                <div style={{ fontFamily: FF, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>
                  Explore dual credit resources
                </div>
              </>
            )}
          </div>
        {/* Bell only for students and parents */}
        {!isGuest && (
          <button
            onClick={() => onNavigate('notifications')}
            style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
        )}
      </div>

      {/* School color bar — only for users with a school */}
      {school && (
        <div style={{ background: barColor, padding: '6px 16px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: FF, fontSize: 12.5, fontWeight: 700, color: barTextColor }}>
            {getFullSchoolName(school.id)}{resolvedGrade ? ` · ${resolvedGrade}` : ''}
          </span>
        </div>
      )}
    </div>
  );

  /* ── GUEST home body ── */
  if (isGuest) {
    const pad  = isTablet ? '20px 24px 0' : '12px 14px 0';
    const pbottom = isTablet ? 32 : 150;
    return (
      <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {renderHeader()}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: pbottom }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: pad }}>
            <GuestApplyBanner />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <NextDeadlineCard onNavigate={onNavigate} />
              <NextEventCard onNavigate={onNavigate} />
            </div>
          </div>
          <TimelineSection items={timeline} isTablet={isTablet} />
        </div>
        <BottomNav active="home" onNavigate={onNavigate} tabs={tabs} />
      </div>
    );
  }

  /* ── STUDENT + PARENT home body (shared structure) ── */
  const pbottom = isTablet ? 32 : 150;
  const outerPad = isTablet ? '20px 24px 0' : '12px 14px 0';

  /* Tablet: 2-col dashboard grid */
  const tabletDashboard = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: outerPad }}>
      {/* Left col: deadline + event */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <NextDeadlineCard onNavigate={onNavigate} />
        <NextEventCard onNavigate={onNavigate} />
      </div>
      {/* Right col: ACDC + notification */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {acdc && <AcdcStrip acdc={acdc} onNavigate={onNavigate} />}
        <RecentNotifCard notif={latestNotif} onNavigate={onNavigate} />
      </div>
    </div>
  );

  /* Mobile: all 5 cards in a single flat DnD grid */
  const mobileDashboard = (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cardOrder} strategy={rectSortingStrategy}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: outerPad }}>
          {cardOrder.map(id => {
            const content = allCardContent[id];
            if (!content) return null;
            const isAcdc = id === 'acdc';
            return (
              <SortableItem key={id} id={id} fullWidth={isAcdc} handlePos={isAcdc ? 'center' : 'right'}>
                {content}
              </SortableItem>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {renderHeader()}

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: pbottom }}>
        {isTablet ? tabletDashboard : mobileDashboard}
        <TimelineSection
          items={timeline}
          isTablet={isTablet}
          excludeCategories={isTablet ? [] : ['Announcements', 'Announcement', 'Reminders', 'Reminder']}
        />
      </div>

      <BottomNav active="home" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
