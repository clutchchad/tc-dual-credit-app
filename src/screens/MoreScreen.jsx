import { useState, useEffect } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { C, FF } from '../tokens';
import { getStudentProfile } from '../data/studentProfile';
import { getEngagementBadges, debugUnlockAll } from '../data/engagementTracker';
import { resources } from '../data/resources';

// Milestone key → badge id mapping (Jenzabar-sourced milestones only)
// Engagement badges (on-a-roll, weekend-warrior, weekend-legend, early-bird) are
// driven by client-side localStorage behavior tracking — not Jenzabar data.
// TODO: wire engagement badges to a client-side engagement tracker.
const MILESTONE_BADGE_MAP = {
  applicationSubmitted:  'first-step',
  enrolledInFirstClass:  'officially-in',
  reached30Hours:        'halfway-there',
  reached45Hours:        'associates-bound',
  onTrackForAssociates:  'cap-gown',
  tcPromiseEligible:     'tc-promise',
};

const BLUE      = '#065990';
const DARK      = '#022b52';
const LIME      = '#EAFF00';

// ─────────────────────────────────────────────────────────────────────────────
// Badge definitions — UI scaffold only, all locked in this build
// ─────────────────────────────────────────────────────────────────────────────
const BADGES = [
  {
    id: 'first-step',
    name: 'First Step',
    desc: 'Applied for Dual Credit',
    icon: (col) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <path d="M14 2v6h6M12 18v-6M9 15h6"/>
      </svg>
    ),
  },
  {
    id: 'officially-in',
    name: 'Officially In',
    desc: 'Enrolled in your first class',
    icon: (col) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    id: 'on-a-roll',
    name: 'On a Roll',
    desc: 'Opened app 3 school days in a row',
    icon: (col) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    desc: 'Opened the app on a weekend',
    icon: (col) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
  },
  {
    id: 'weekend-legend',
    name: 'Weekend Legend',
    desc: 'Opened the app both days of a weekend',
    icon: (col) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    desc: 'Logged in before 8am',
    icon: (col) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
    ),
  },
  {
    id: 'halfway-there',
    name: 'Halfway There',
    desc: 'Earned 30 dual credit hours',
    icon: (col) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 2a10 10 0 010 20A10 10 0 0112 2z"/>
        <path d="M12 12a5 5 0 000-10"/>
      </svg>
    ),
  },
  {
    id: 'associates-bound',
    name: "Associate's Bound",
    desc: 'Earned 45 dual credit hours',
    icon: (col) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M15 12v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
      </svg>
    ),
  },
  {
    id: 'cap-gown',
    name: 'Cap & Gown Ready',
    desc: "On track to graduate with an Associate's",
    icon: (col) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        <circle cx="22" cy="16" r="1.5"/>
      </svg>
    ),
  },
  {
    id: 'tc-promise',
    name: 'TC Promise',
    desc: 'Eligible for TC Promise scholarship',
    icon: (col) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Single badge card — unlocked cards use brand colors; locked stay muted
// ─────────────────────────────────────────────────────────────────────────────
function BadgeCard({ badge, unlocked }) {
  if (unlocked) {
    return (
      <div style={{
        background: `linear-gradient(145deg, ${BLUE}, ${DARK})`,
        border: `1.5px solid ${BLUE}`,
        borderRadius: 16,
        padding: '16px 12px 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        position: 'relative',
        opacity: 1,
        boxShadow: '0 4px 18px rgba(6,89,144,.35)',
      }}>
        {/* Badge icon circle — Electric Lime fill */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: LIME,
          border: `2px solid rgba(234,255,0,.55)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {badge.icon(DARK)}
        </div>

        {/* Name */}
        <div style={{
          fontFamily: FF, fontSize: 11.5, fontWeight: 800,
          color: '#fff',
          textAlign: 'center', lineHeight: 1.25,
          letterSpacing: '-0.1px',
        }}>
          {badge.name}
        </div>

        {/* Description */}
        <div style={{
          fontFamily: FF, fontSize: 10, fontWeight: 500,
          color: 'rgba(255,255,255,.72)',
          textAlign: 'center', lineHeight: 1.35,
        }}>
          {badge.desc}
        </div>
      </div>
    );
  }

  // Locked appearance: desaturated dark card, padlock overlay in corner
  return (
    <div style={{
      background: 'rgba(6,89,144,.05)',
      border: '1.5px solid rgba(6,89,144,.1)',
      borderRadius: 16,
      padding: '16px 12px 14px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      position: 'relative',
      opacity: 0.72,
    }}>
      {/* Badge icon circle */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'rgba(6,89,144,.08)',
        border: '2px solid rgba(6,89,144,.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {badge.icon('rgba(6,89,144,.35)')}
      </div>

      {/* Padlock overlay — top-right corner */}
      <div style={{
        position: 'absolute',
        top: 12, right: 12,
        width: 18, height: 18, borderRadius: '50%',
        background: 'rgba(6,89,144,.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(6,89,144,.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>

      {/* Name */}
      <div style={{
        fontFamily: FF, fontSize: 11.5, fontWeight: 800,
        color: 'rgba(6,89,144,.55)',
        textAlign: 'center', lineHeight: 1.25,
        letterSpacing: '-0.1px',
      }}>
        {badge.name}
      </div>

      {/* Description */}
      <div style={{
        fontFamily: FF, fontSize: 10, fontWeight: 500,
        color: 'rgba(6,89,144,.35)',
        textAlign: 'center', lineHeight: 1.35,
      }}>
        {badge.desc}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Achievements panel — expandable overlay, students only
// ─────────────────────────────────────────────────────────────────────────────
function AchievementsPanel({ unlockedIds }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      position: 'relative',
      zIndex: open ? 20 : 1,
      marginBottom: 14,
    }}>
      {/* Header tap target */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: '#fff',
          border: `1px solid ${C.border}`,
          borderRadius: open ? '20px 20px 0 0' : 20,
          boxShadow: open
            ? '0 2px 0 rgba(0,0,0,.04)'
            : '0 2px 10px rgba(0,0,0,.05)',
          padding: '15px 17px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textAlign: 'left',
          transition: 'border-radius .22s',
        }}
      >
        {/* Trophy icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: `linear-gradient(135deg, ${DARK}, ${BLUE})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 21h8M12 17v4"/>
            <path d="M17 3H7l1 9a4 4 0 008 0l1-9z"/>
            <path d="M4 5H7M17 5h3s-.5 5-3 7M4 5s.5 5 3 7"/>
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 900, color: C.text, letterSpacing: '-0.3px' }}>
            Achievements
          </div>
          <div style={{ fontFamily: FF, fontSize: 12, color: C.text3, marginTop: 1 }}>
            Tap to expand your milestones
          </div>
        </div>

        {/* Badge count pill — shows unlocked / total */}
        <div style={{
          background: unlockedIds.size > 0 ? `rgba(6,89,144,.12)` : 'rgba(6,89,144,.07)',
          borderRadius: 20, padding: '3px 9px', flexShrink: 0,
        }}>
          <span style={{ fontFamily: FF, fontSize: 10, fontWeight: 700, color: BLUE }}>
            {unlockedIds.size} / {BADGES.length} badges
          </span>
        </div>

        {/* Chevron — rotates 180° when open */}
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"
          style={{ flexShrink: 0, transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Expanded panel — sits on top of content below via absolute positioning */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0, right: 0,
          background: '#fff',
          border: `1px solid ${C.border}`,
          borderTop: 'none',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 16px 40px rgba(0,0,0,.14)',
          padding: '16px 14px 20px',
          zIndex: 20,
          maxHeight: 480,
          overflowY: 'auto',
        }}>
          {/* 2-column badge grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}>
            {BADGES.map(b => <BadgeCard key={b.id} badge={b} unlocked={unlockedIds.has(b.id)} />)}
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: 16, textAlign: 'center',
            fontFamily: FF, fontSize: 11, color: C.text3, lineHeight: 1.5,
          }}>
            Badges unlock as you hit milestones.{'\n'}
            Check back as the semester progresses!
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Resources panel — collapsible dropdown, all roles
// ─────────────────────────────────────────────────────────────────────────────
const RES_TYPE_COLORS = { pdf: '#b91c1c', video: '#6d28d9', website: '#0d7654', info: '#0369a1' };
const RES_TYPE_LABELS = { pdf: 'Document', video: 'Video', website: 'Website', info: 'Info' };
const RES_FILTERS = [['all','All'],['pdf','Document'],['video','Video'],['website','Website'],['info','Info']];

function ResourcesPanel() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? resources : resources.filter(r => r.type === filter);

  return (
    <div style={{ position: 'relative', zIndex: open ? 20 : 1, marginBottom: 14 }}>
      {/* Header tap target */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: '#fff', border: `1px solid ${C.border}`,
          borderRadius: open ? '20px 20px 0 0' : 20,
          boxShadow: open ? '0 2px 0 rgba(0,0,0,.04)' : '0 2px 10px rgba(0,0,0,.05)',
          padding: '15px 17px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
          transition: 'border-radius .22s', boxSizing: 'border-box',
        }}
      >
        {/* Open book icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: `linear-gradient(135deg, ${DARK}, ${BLUE})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 900, color: C.text, letterSpacing: '-0.3px' }}>Resources</div>
          <div style={{ fontFamily: FF, fontSize: 12, color: C.text3, marginTop: 1 }}>Additional information, Documents, Websites, Videos</div>
        </div>

        {/* Item count pill */}
        <div style={{ background: 'rgba(6,89,144,.07)', borderRadius: 20, padding: '3px 9px', flexShrink: 0 }}>
          <span style={{ fontFamily: FF, fontSize: 10, fontWeight: 700, color: BLUE }}>{resources.length} items</span>
        </div>

        {/* Rotating chevron */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"
          style={{ flexShrink: 0, transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Expanded panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#fff', border: `1px solid ${C.border}`, borderTop: 'none',
          borderRadius: '0 0 20px 20px', boxShadow: '0 16px 40px rgba(0,0,0,.14)',
          padding: '12px 12px 16px', zIndex: 20, maxHeight: 460, overflowY: 'auto',
        }}>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
            {RES_FILTERS.map(([id, label]) => (
              <button
                key={id}
                onClick={e => { e.stopPropagation(); setFilter(id); }}
                style={{
                  flexShrink: 0, height: 28, padding: '0 11px', borderRadius: 20,
                  border: 'none', cursor: 'pointer',
                  background: filter === id ? BLUE : 'rgba(6,89,144,.08)',
                  transition: 'background .15s',
                }}
              >
                <span style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: filter === id ? '#fff' : BLUE }}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Resource rows */}
          {list.map(r => {
            const col = RES_TYPE_COLORS[r.type] || C.text3;
            const tag = RES_TYPE_LABELS[r.type] || r.type;
            return (
              <button
                key={r.id}
                onClick={() => window.open(r.url, '_blank', 'noopener,noreferrer')}
                style={{
                  width: '100%', background: C.bg, border: `1px solid ${C.border}`,
                  borderRadius: 13, padding: '11px 12px', marginBottom: 6,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 10, textAlign: 'left',
                  boxSizing: 'border-box', transition: 'transform .1s',
                }}
                onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: C.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.title}
                </span>
                <span style={{
                  fontFamily: FF, fontSize: 9.5, fontWeight: 700,
                  color: col, background: `${col}14`,
                  borderRadius: 6, padding: '2px 7px',
                  textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0,
                }}>
                  {tag}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Guest — minimal profile CTA
// ─────────────────────────────────────────────────────────────────────────────
function GuestMoreScreen({ onChangeRole, onNavigate, tabs }) {
  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:C.bg, display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, overflowY:'auto', padding:'24px 14px 100px', paddingTop:'calc(env(safe-area-inset-top, 0px) + 24px)', position:'relative' }}>
        {/* Profile CTA card */}
        <div style={{
          width:'100%', background:'#fff', borderRadius:28,
          border:`1px solid ${C.border}`,
          boxShadow:'0 4px 24px rgba(6,89,144,.09)',
          padding:'36px 24px 32px',
          display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
          marginBottom: 14,
        }}>
          {/* TC logo mark */}
          <div style={{
            width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg,#022b52,#065990)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 28px rgba(6,89,144,.3)',
            marginBottom:20,
          }}>
            <span style={{ fontFamily:FF, fontSize:28, fontWeight:900, color:LIME, letterSpacing:'-1px' }}>TC</span>
          </div>

          <div style={{ fontFamily:FF, fontSize:22, fontWeight:900, color:DARK, letterSpacing:'-0.5px', marginBottom:10 }}>
            Set Up Your Profile
          </div>
          <p style={{ fontFamily:FF, fontSize:14, color:C.text2, lineHeight:1.6, margin:'0 0 28px' }}>
            Unlock the full Dual Credit mobile app experience.
          </p>

          <button
            onClick={onChangeRole}
            style={{
              width:'100%', height:54, background:LIME, border:'none', borderRadius:16,
              cursor:'pointer', boxShadow:'0 4px 20px rgba(234,255,0,.35)',
            }}
          >
            <span style={{ fontFamily:FF, fontSize:16, fontWeight:900, color:DARK }}>Get Started</span>
          </button>
        </div>

      </div>
      <BottomNav active="more" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────
export default function MoreScreen({ role, school, grade, onChangeRole, onChangeSchool, onNavigate, tabs }) {
  // Load Jenzabar profile — milestones → badge unlock — students only
  const [unlockedIds,  setUnlockedIds]  = useState(new Set());

  // Engagement badges — refreshable so the debug button can trigger a re-render
  const [engBadges, setEngBadges] = useState(() => getEngagementBadges());

  const refreshEngBadges = () => setEngBadges(getEngagementBadges());

  useEffect(() => {
    if (role !== 'student') return;
    getStudentProfile().then(profile => {
      // Jenzabar milestone badges
      const ids = new Set();
      const m = profile.milestones || {};
      Object.entries(MILESTONE_BADGE_MAP).forEach(([key, badgeId]) => {
        if (m[key]) ids.add(badgeId);
      });

      // Merge engagement badges from localStorage tracker
      const eng = getEngagementBadges();
      if (eng.onARoll)        ids.add('on-a-roll');
      if (eng.weekendWarrior) ids.add('weekend-warrior');
      if (eng.weekendLegend)  ids.add('weekend-legend');
      if (eng.earlyBird)      ids.add('early-bird');

      setUnlockedIds(ids);
    });
  }, [role, engBadges]); // re-run when engBadges refreshes (debug button)

  if (role === 'guest') {
    return <GuestMoreScreen onChangeRole={onChangeRole} onNavigate={onNavigate} tabs={tabs} />;
  }

  const isStudent = role === 'student';

  const profileRows = [
    { label: 'Change My School', icon: 'school', action: onChangeSchool },
    { label: 'Change My Role',   icon: 'role',   action: onChangeRole   },
  ];

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader style={{ paddingBottom: 52 }}>
        <PageTitle title="More" />
      </BlueHeader>

      {/* position:relative so the achievements overlay stacks inside the scroll container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 100px', marginTop: -42, position: 'relative' }}>

        {/* Achievements — students only */}
        {isStudent && <AchievementsPanel unlockedIds={unlockedIds} />}

        {/* Resources — all roles */}
        <ResourcesPanel />

        {/* Profile settings */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 8, paddingLeft: 4 }}>Profile</div>
          {profileRows.map(row => (
            <button
              key={row.label}
              onClick={row.action}
              style={{ width: '100%', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '13px 15px', marginBottom: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', boxSizing: 'border-box' }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6,89,144,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {row.icon === 'school'
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                }
              </div>
              <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 600, color: C.text, flex: 1 }}>{row.label}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>

        {/* App version */}
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '13px 15px', display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
          <span style={{ fontFamily: FF, fontSize: 13, color: C.text2 }}>App Version</span>
          <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 600, color: C.text3 }}>1.0 Beta</span>
        </div>

        <div style={{ textAlign: 'center', paddingBottom: 10 }}>
          <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 900, color: C.blue, letterSpacing: '-0.3px' }}>TC Dual Credit</div>
          <div style={{ fontFamily: FF, fontSize: 11, color: C.text3, marginTop: 2 }}>Texarkana College</div>
        </div>

        {/* Debug: engagement badge unlock — demo purposes only */}
        <div style={{ textAlign: 'center', paddingBottom: 20 }}>
          <button
            onClick={() => { debugUnlockAll(); refreshEngBadges(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
          >
            <span style={{ fontFamily: FF, fontSize: 10, color: 'rgba(6,89,144,.25)', fontWeight: 500 }}>
              Debug: Unlock Engagement Badges
            </span>
          </button>
        </div>
      </div>

      <BottomNav active="more" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
