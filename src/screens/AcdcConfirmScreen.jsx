/**
 * AcdcConfirmScreen — "Is this you?" confirmation after a successful TC Staff ID lookup.
 *
 * Shows the ACDC's photo, name, role, and verified staff ID before entering the portal.
 * Visual style mirrors OnboardConfirm: animated checkmark, summary rows, Get Started CTA.
 */
import { useState, useEffect } from 'react';
import { C, FF } from '../tokens';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

// ── Profile photo with initials fallback ──────────────────────────────────────
function AcdcPhoto({ photo, name, size = 96 }) {
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
          border: `3px solid ${BLUE}`,
          boxShadow: '0 6px 24px rgba(6,89,144,.28)',
          display: 'block',
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, rgba(6,89,144,.18), rgba(6,89,144,.38))`,
      border: `3px solid ${BLUE}`,
      boxShadow: '0 6px 24px rgba(6,89,144,.28)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: FF, fontSize: size * 0.3, fontWeight: 900, color: BLUE }}>
        {initials}
      </span>
    </div>
  );
}

// ── Verified badge (reused from OnboardConfirm style) ─────────────────────────
function VerifiedBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(22,163,74,.1)', borderRadius: 20,
      padding: '3px 9px',
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.8" strokeLinecap="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: '#16a34a' }}>Verified</span>
    </div>
  );
}

// ── Row component (matches OnboardConfirm summary rows) ───────────────────────
function SummaryRow({ iconBg, icon, label, value, badge }) {
  return (
    <div style={{
      padding: '15px 18px', borderRadius: 18,
      background: C.bg, border: `1.5px solid ${C.border}`,
      display: 'flex', alignItems: 'flex-start', gap: 13,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1px' }}>
          {label}
        </div>
        <div style={{ fontFamily: FF, fontSize: 16, fontWeight: 800, color: C.text }}>{value}</div>
        {badge && <div style={{ marginTop: 4 }}><VerifiedBadge /></div>}
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function AcdcConfirmScreen({ acdc, onConfirm, onBack }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div
      className="tc-screen"
      style={{
        width: '100%', height: '100%',
        background: '#fff',
        display: 'flex', flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px 26px',
        textAlign: 'center',
        overflowY: 'auto',
      }}>

        {/* Animated check circle — matches OnboardConfirm exactly */}
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'linear-gradient(135deg,#022b52,#065990)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 26,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(.5)',
          transition: 'all .5s cubic-bezier(.34,1.56,.64,1)',
          boxShadow: '0 14px 36px rgba(6,89,144,.35)',
        }}>
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <path
              d="M9 21l8 8 16-16"
              stroke={LIME}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="45"
              strokeDashoffset={visible ? 0 : 45}
              style={{ transition: 'stroke-dashoffset .5s .28s ease' }}
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 style={{ fontFamily: FF, fontSize: 32, fontWeight: 900, color: C.text, letterSpacing: '-1px', marginBottom: 4 }}>
          Welcome back!
        </h1>
        <p style={{ fontFamily: FF, fontSize: 14, color: C.text2, marginBottom: 24 }}>
          Confirm your ACDC portal access below.
        </p>

        {/* Profile photo — centered, sits between heading and rows */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <AcdcPhoto photo={acdc.photo} name={acdc.name} size={148} />
        </div>

        {/* Summary rows */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>

          {/* Name row */}
          <SummaryRow
            iconBg={BLUE}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            }
            label="You are"
            value={acdc.name}
            badge
          />

          {/* Role row */}
          <SummaryRow
            iconBg="rgba(6,89,144,.10)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              </svg>
            }
            label="Role"
            value="Academic Coach for Dual Credit"
            badge={false}
          />

          {/* Staff ID row */}
          <SummaryRow
            iconBg="rgba(22,163,74,.12)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <path d="M2 10h20"/>
              </svg>
            }
            label="Staff ID"
            value={acdc.tcId}
            badge
          />

        </div>

        {/* Get Started */}
        <button
          onClick={onConfirm}
          style={{
            width: '100%', height: 54,
            background: LIME, border: 'none', borderRadius: 16,
            cursor: 'pointer', marginBottom: 12,
            boxShadow: '0 4px 20px rgba(234,255,0,.35)',
          }}
        >
          <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 800, color: DARK }}>
            Enter Portal
          </span>
        </button>

        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}>
          <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 600, color: C.text3 }}>
            That's not me
          </span>
        </button>

      </div>
    </div>
  );
}
