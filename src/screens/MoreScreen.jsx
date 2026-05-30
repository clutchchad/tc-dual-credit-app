import { useState } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { C, FF } from '../tokens';

const NOTIF_KEY = 'tcdc_v1_notifs';
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
// Single badge card — all locked in this demo build
// ─────────────────────────────────────────────────────────────────────────────
function BadgeCard({ badge }) {
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

      {/* Padlock overlay — bottom-right of icon */}
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
function AchievementsPanel() {
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

        {/* Badge count pill */}
        <div style={{
          background: 'rgba(6,89,144,.07)',
          borderRadius: 20, padding: '3px 9px', flexShrink: 0,
        }}>
          <span style={{ fontFamily: FF, fontSize: 10, fontWeight: 700, color: BLUE }}>
            {BADGES.length} badges
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
            {BADGES.map(b => <BadgeCard key={b.id} badge={b} />)}
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
// Guest — minimal profile CTA
// ─────────────────────────────────────────────────────────────────────────────
function GuestMoreScreen({ onChangeRole, onNavigate, tabs }) {
  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:C.bg, display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 22px', paddingTop:'env(safe-area-inset-top, 24px)' }}>
        <div style={{
          width:'100%', background:'#fff', borderRadius:28,
          border:`1px solid ${C.border}`,
          boxShadow:'0 4px 24px rgba(6,89,144,.09)',
          padding:'36px 24px 32px',
          display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
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
            Get personalized deadlines, connect with your ACDC, and unlock your full dual credit experience.
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
  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY)) ?? true; } catch { return true; }
  });

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
        {isStudent && <AchievementsPanel />}

        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 2px 10px rgba(0,0,0,.05)', padding: '17px 17px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#022b52,#065990)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: FF, fontSize: 16, fontWeight: 800, color: C.text }}>{isStudent ? 'Student' : 'Parent'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
              <span style={{ fontFamily: FF, fontSize: 13, color: C.text2 }}>{school.name}</span>
              {school.id === 'txh' && grade && (
                <span style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: C.blue, background: 'rgba(6,89,144,.1)', borderRadius: 20, padding: '1px 7px' }}>{grade}</span>
              )}
            </div>
          </div>
        </div>

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

        {/* Preferences */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 8, paddingLeft: 4 }}>Preferences</div>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6,89,144,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
            <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 600, color: C.text, flex: 1 }}>Push Notifications</span>
            <div
              onClick={() => setNotifs(n => { const next = !n; localStorage.setItem(NOTIF_KEY, JSON.stringify(next)); return next; })}
              style={{ width: 44, height: 26, borderRadius: 13, background: notifs ? C.blue : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}
            >
              <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: '#fff', top: 3, left: notifs ? 21 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
            </div>
          </div>
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
      </div>

      <BottomNav active="more" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
