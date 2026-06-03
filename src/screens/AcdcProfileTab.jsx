/**
 * AcdcProfileTab — Contact Card tab for the ACDC portal.
 *
 * No scroll: entire page fits within the viewport.
 * Shows: photo, name, title, phone, QR placeholder, three share buttons.
 * Send sheet reuses the same bottom-sheet overlay pattern as AcdcResourcesTab.
 */
import { useState } from 'react';
import { C, FF } from '../tokens';
import { BlueHeader, PageTitle } from '../components/BlueHeader';

const BLUE  = '#065990';
const LIME  = '#EAFF00';
const DARK  = '#022b52';

// Placeholder URLs — swap for real links when confirmed
const LINKS = {
  application: 'https://my.texarkanacollege.edu/ICS/Admissions/Dual-Credit_Application.jnz',
  app:         'https://tcdualcredit.app',
  appointment: 'https://outlook.office365.com/bok/tc-acdc-scheduling',
};

// ── QR code placeholder ───────────────────────────────────────────────────────
function makeQrGrid() {
  const N = 21;
  const g = Array.from({ length: N }, () => Array(N).fill(0));
  const setFinder = (or, oc) => {
    for (let dr = 0; dr < 7; dr++) {
      for (let dc = 0; dc < 7; dc++) {
        const outer  = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const center = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        g[or + dr][oc + dc] = (outer || center) ? 1 : 0;
      }
    }
  };
  setFinder(0, 0); setFinder(0, 14); setFinder(14, 0);
  for (let i = 8; i <= 12; i++) {
    g[6][i] = i % 2 === 0 ? 1 : 0;
    g[i][6] = i % 2 === 0 ? 1 : 0;
  }
  g[13][8] = 1;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const inTL   = r <= 7 && c <= 7;
      const inTR   = r <= 7 && c >= 13;
      const inBL   = r >= 13 && c <= 7;
      const timing = (r === 6 && c >= 8 && c <= 12) || (c === 6 && r >= 8 && r <= 12);
      const format = (r === 8 && c <= 8) || (c === 8 && r <= 8) ||
                     (r === 8 && c >= 13) || (c === 8 && r >= 13);
      if (inTL || inTR || inBL || timing || format) continue;
      if (g[r][c] !== 0) continue;
      const h1 = (r * 3  + c * 11 + r * c) % 7;
      const h2 = (r * 13 + c * 5  + (r + c) * 2) % 11;
      g[r][c] = (h1 < 3 || h2 < 4) && !(h1 < 3 && h2 < 4) ? 1 : 0;
    }
  }
  return g;
}
const QR_GRID = makeQrGrid();

export function QrPlaceholder({ size = 120 }) {
  const N = 21, pad = 10;
  const mod = (size - pad * 2) / N;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block' }} aria-label="QR code placeholder">
      <rect width={size} height={size} fill="#fff" rx={3} />
      {QR_GRID.flatMap((row, r) =>
        row.map((cell, c) => cell === 1 ? (
          <rect key={`${r}-${c}`} x={pad + c * mod} y={pad + r * mod}
            width={mod} height={mod} fill="#000" />
        ) : null)
      )}
    </svg>
  );
}

// ── Photo with initials fallback ──────────────────────────────────────────────
function CoachPhoto({ photo, name, size = 80 }) {
  const [err, setErr] = useState(false);
  const mono = (name ?? '').split(' ').filter(w => /^[A-Z]/.test(w))
    .map(w => w[0]).join('').slice(0, 2);
  const src = photo || '/fakeacdc.png';
  if (!err) {
    return (
      <img src={src} alt={name} onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover',
          border: `3px solid ${BLUE}`, boxShadow: '0 4px 14px rgba(6,89,144,.22)',
          display: 'block' }} />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,rgba(6,89,144,.18),rgba(6,89,144,.38))',
      border: `3px solid ${BLUE}`, boxShadow: '0 4px 14px rgba(6,89,144,.22)',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: FF, fontSize: size * 0.3, fontWeight: 900, color: BLUE }}>
        {mono}
      </span>
    </div>
  );
}

// ── Send-sheet (bottom drawer) ────────────────────────────────────────────────
function detectDestType(val) {
  const digits = val.replace(/[\s\-().+]/g, '');
  if (/^[0-9]{7,15}$/.test(digits)) return 'sms';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'email';
  return null;
}

function SendSheet({ item, onClose }) {
  const [dest,    setDest]    = useState('');
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const destType = detectDestType(dest);
  const hint = dest.length === 0 ? 'Phone number or email address'
    : destType === 'sms'   ? '📱 Will send via SMS'
    : destType === 'email' ? '✉️ Will send via email'
    : 'Enter a valid phone number or email';

  const handleSend = async () => {
    if (!destType) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 700));
    console.log('[ACDC Send]', { link: item.id, url: item.url, type: destType, destination: dest.trim() });
    setSending(false);
    setSent(true);
  };

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
        zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '22px 22px 0 0',
          padding: '0 20px calc(env(safe-area-inset-bottom,0px) + 28px)',
          boxShadow: '0 -8px 40px rgba(0,0,0,.18)' }}>

        {/* Drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border,
          margin: '14px auto 20px' }} />

        {/* Item label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          padding: '10px 12px', borderRadius: 12, background: C.bg, border: `1px solid ${C.border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(6,89,144,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: C.text3,
              textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 1 }}>Sharing</div>
            <div style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: DARK }}>{item.label}</div>
          </div>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(22,163,74,.10)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div style={{ fontFamily: FF, fontSize: 16, fontWeight: 900, color: DARK,
              marginBottom: 6 }}>Link Sent!</div>
            <div style={{ fontFamily: FF, fontSize: 13, color: C.text2, lineHeight: 1.5 }}>
              {destType === 'sms' ? `Sent via SMS to ${dest.trim()}` : `Sent via email to ${dest.trim()}`}
            </div>
          </div>
        ) : (
          <>
            <input
              type="text" inputMode="email" autoCapitalize="none"
              value={dest} onChange={e => setDest(e.target.value)}
              placeholder="Phone number or email"
              style={{ width: '100%', height: 50, borderRadius: 14,
                border: `1.5px solid ${C.border}`, padding: '0 14px',
                fontFamily: FF, fontSize: 16, fontWeight: 600, color: DARK,
                background: C.bg, outline: 'none', boxSizing: 'border-box',
                WebkitAppearance: 'none', marginBottom: 8 }}
              onFocus={e  => (e.target.style.borderColor = BLUE)}
              onBlur={e   => (e.target.style.borderColor = C.border)}
            />
            <div style={{ fontFamily: FF, fontSize: 12, color: C.text3,
              marginBottom: 18, minHeight: 18 }}>{hint}</div>
            <button onClick={handleSend} disabled={!destType || sending}
              style={{ width: '100%', height: 52, borderRadius: 14, border: 'none',
                background: destType && !sending ? LIME : C.bg,
                cursor: destType && !sending ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background .15s',
                border: `1.5px solid ${destType && !sending ? 'transparent' : C.border}` }}>
              <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 800,
                color: destType && !sending ? DARK : C.text3 }}>
                {sending ? 'Sending…' : 'Send Link'}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const FULL_SCHOOL_NAMES = {
  txh: 'Texas High School', le: 'Liberty-Eylau High School', hooks: 'Hooks High School',
  pg: 'Pleasant Grove High School', bloomburg: 'Bloomburg High School', avery: 'Avery High School',
  dekalb: 'DeKalb High School', maud: 'Maud High School', prem: 'Premier High School',
  nb: 'New Boston High School', simms: 'James Bowie High School', atlanta: 'Atlanta High School',
  qc: 'Queen City High School', mcleod: 'McLeod High School', lk: 'Linden-Kildare High School',
  rw: 'Redwater High School', datx: 'Digital Academy of Texas', 'ar-premier': 'Premier High School - Arkansas',
};

// ── Main export ───────────────────────────────────────────────────────────────
export default function AcdcProfileTab({ acdc }) {
  const [copied, setCopied] = useState(false);

  const schoolList = [
    ...(acdc?.txhGrades?.length ? ['txh'] : []),
    ...(acdc?.schools || []),
  ];

  const handleShare = async () => {
    const schoolNames = schoolList.map(id => FULL_SCHOOL_NAMES[id] || id).join(', ');
    const text = [
      acdc?.name ?? '',
      'Academic Coach for Dual Credit',
      'Texarkana College',
      '',
      acdc?.phone ? `📞 ${acdc.phone}` : '',
      acdc?.email ? `✉️ ${acdc.email}` : '',
      schoolNames ? `🏫 ${schoolNames}` : '',
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      try { await navigator.share({ title: acdc?.name, text }); } catch {}
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle title="Contact Card" />
      </BlueHeader>

      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '13px 20px calc(env(safe-area-inset-bottom, 0px) + 120px)',
        marginTop: -24, textAlign: 'center',
      }}>

        {/* Photo */}
        <CoachPhoto photo={acdc?.photo || '/fakeacdc.png'} name={acdc?.name} size={148} />

        {/* Name */}
        <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: DARK,
          letterSpacing: '-0.3px', lineHeight: 1.2, marginTop: 10, marginBottom: 3 }}>
          {acdc?.name ?? ''}
        </div>

        {/* Title */}
        <div style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 12 }}>
          Academic Coach for Dual Credit
        </div>

        {/* Assigned schools */}
        {schoolList.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
            {schoolList.map(id => (
              <span key={id} style={{
                fontFamily: FF, fontSize: 11, fontWeight: 700, color: BLUE,
                background: `${BLUE}10`, borderRadius: 20, padding: '3px 10px',
                border: `1px solid ${BLUE}22`,
              }}>
                {FULL_SCHOOL_NAMES[id] || id}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: C.border, marginBottom: 14 }} />

        {/* Contact rows */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {acdc?.phone && (
            <a href={`tel:${acdc.phone}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14,
                padding: '12px 14px', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${BLUE}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE}
                  strokeWidth="2.2" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 700, color: BLUE }}>
                {acdc.phone}
              </span>
            </a>
          )}
          {acdc?.email && (
            <a href={`mailto:${acdc.email}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14,
                padding: '12px 14px', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${BLUE}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="14" viewBox="0 0 24 20" fill="none" stroke={BLUE}
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="16" rx="2"/>
                  <path d="M2 7l10 6 10-6"/>
                </svg>
              </div>
              <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 700, color: BLUE }}>
                {acdc.email}
              </span>
            </a>
          )}
        </div>

        {/* Share My Contact */}
        <button onClick={handleShare}
          style={{
            width: '100%', height: 52, borderRadius: 16, border: 'none',
            background: LIME, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 4px 20px rgba(234,255,0,.35)',
          }}
          onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DARK}
            strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: DARK }}>
            {copied ? 'Copied to Clipboard!' : 'Share My Contact'}
          </span>
        </button>

      </div>
    </div>
  );
}
