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
import AcdcProfileTab from './AcdcProfileTab';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

// ── ACDC tab definitions ──────────────────────────────────────────────────────
const ACDC_TABS = [
  { id: 'home',      label: 'Home',            screen: 'home'      },
  { id: 'profile',   label: 'Profile',         screen: 'profile'   },
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

// ── Tab: Home ─────────────────────────────────────────────────────────────────
function TabHome({ acdc, onSignOut }) {
  const firstName = acdc?.name?.split(' ')[0] ?? 'Coach';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Blue gradient header */}
      <div style={{
        background: `linear-gradient(160deg, ${DARK} 0%, ${BLUE} 100%)`,
        padding: '0 20px 32px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        flexShrink: 0,
      }}>
        {/* Top row: avatar + sign-out */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <AcdcAvatar photo={acdc?.photo} name={acdc?.name ?? ''} size={48} />
          <button
            onClick={onSignOut}
            style={{
              background: 'rgba(255,255,255,.12)', border: 'none',
              borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
            }}
          >
            <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.85)' }}>
              Sign Out
            </span>
          </button>
        </div>

        <div style={{ fontFamily: FF, fontSize: 13, fontWeight: 600, color: LIME, letterSpacing: '0.5px', marginBottom: 4 }}>
          ACDC PORTAL
        </div>
        <div style={{ fontFamily: FF, fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1.15 }}>
          Hello, {firstName}
        </div>
        <div style={{ fontFamily: FF, fontSize: 14, color: 'rgba(255,255,255,.65)', marginTop: 4 }}>
          Academic Coach for Dual Credit
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 100px', marginTop: -16 }}>
        <div style={{
          background: '#fff', borderRadius: 20,
          border: `1px solid ${C.border}`,
          boxShadow: '0 2px 16px rgba(0,0,0,.06)',
          padding: '28px 22px', textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(6,89,144,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>
              <path d="M9 22V12h6v10"/>
            </svg>
          </div>
          <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: DARK, letterSpacing: '-0.4px', marginBottom: 8 }}>
            Dashboard Coming Soon
          </div>
          <p style={{ fontFamily: FF, fontSize: 14, color: C.text2, lineHeight: 1.6, margin: 0 }}>
            Your full ACDC dashboard — student look-up, enrollment status, and updates — is being built and will appear here.
          </p>
        </div>
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
        return <TabPlaceholder title="Student Look Up" icon={TAB_ICONS.lookup} />;
      case 'resources':
        return <TabPlaceholder title="Resources" icon={TAB_ICONS.resources} />;
      case 'more':
        return <TabPlaceholder title="More" icon={TAB_ICONS.more} />;
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
