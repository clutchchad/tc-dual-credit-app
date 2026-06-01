/**
 * AcdcHomeScreen — placeholder ACDC portal home.
 *
 * The real tabs and inner experience are built in the next step.
 * For now this screen simply confirms the ACDC has landed in the portal.
 */
import { useState } from 'react';
import { C, FF } from '../tokens';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

// Initials fallback reused from AcdcConfirmScreen pattern
function AcdcAvatar({ photo, name, size = 72 }) {
  const [err, setErr] = useState(false);
  const initials = name
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
          border: `3px solid rgba(255,255,255,.35)`,
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

export default function AcdcHomeScreen({ acdc, onSignOut }) {
  const firstName = acdc?.name?.split(' ')[0] ?? 'Coach';

  return (
    <div
      className="tc-screen"
      style={{
        width: '100%', height: '100%',
        background: C.bg,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Blue header */}
      <div style={{
        background: `linear-gradient(160deg, ${DARK} 0%, ${BLUE} 100%)`,
        padding: '0 20px 32px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
      }}>
        {/* Top row: avatar left, sign-out right */}
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

        {/* Greeting */}
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

      {/* Content area — placeholder */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 40px', marginTop: -16 }}>

        {/* Coming soon card */}
        <div style={{
          background: '#fff', borderRadius: 20,
          border: `1px solid ${C.border}`,
          boxShadow: '0 2px 16px rgba(0,0,0,.06)',
          padding: '28px 22px',
          textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(6,89,144,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>

          <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: DARK, letterSpacing: '-0.4px', marginBottom: 8 }}>
            Portal Coming Soon
          </div>
          <p style={{ fontFamily: FF, fontSize: 14, color: C.text2, lineHeight: 1.6, margin: 0 }}>
            Your full ACDC dashboard — student look-up, enrollment status, and messaging — is in progress and will be available here.
          </p>
        </div>

      </div>
    </div>
  );
}
