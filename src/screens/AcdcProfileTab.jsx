/**
 * AcdcProfileTab — Profile tab for the ACDC portal.
 *
 * Adapted from the student-facing ACDCScreen (CoachCard mobile layout).
 * Key differences from the student view:
 *   - Phone and email rendered as plain text — not tappable tel:/mailto: links.
 *   - AboutCard / bio blurb removed entirely.
 *   - QR code placeholder occupies the space freed by the blurb.
 *   - Apply button opens the Dual Credit application URL.
 */
import { useState } from 'react';
import { C, FF } from '../tokens';
import Card from '../components/Card';
import { BlueHeader, PageTitle } from '../components/BlueHeader';

const BLUE  = '#065990';
const LIME  = '#EAFF00';
const DARK  = '#022b52';

const APPLY_URL =
  'https://my.texarkanacollege.edu/ICS/Admissions/Dual-Credit_Application.jnz';

// ── QR code placeholder ───────────────────────────────────────────────────────
// Generates a 21×21 grid that looks like a real QR code (version 1 layout).
// Not a valid encoded QR — a static visual placeholder sized for on-screen scanning.

function makeQrGrid() {
  const N = 21;
  const g = Array.from({ length: N }, () => Array(N).fill(0));

  // Finder pattern: outer ring + inner 3×3 solid, white gap between them
  const setFinder = (or, oc) => {
    for (let dr = 0; dr < 7; dr++) {
      for (let dc = 0; dc < 7; dc++) {
        const outer  = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const center = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        g[or + dr][oc + dc] = (outer || center) ? 1 : 0;
      }
    }
  };
  setFinder(0, 0);   // top-left
  setFinder(0, 14);  // top-right
  setFinder(14, 0);  // bottom-left

  // Timing strips (row 6 and col 6 between the finders)
  for (let i = 8; i <= 12; i++) {
    g[6][i] = i % 2 === 0 ? 1 : 0;
    g[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Dark module (always present in QR codes)
  g[13][8] = 1;

  // Data region — pseudo-random fill that looks like real QR data
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      // Skip function modules: finders + separators + timing + format-info columns
      const inTL = r <= 7 && c <= 7;
      const inTR = r <= 7 && c >= 13;
      const inBL = r >= 13 && c <= 7;
      const timing = (r === 6 && c >= 8 && c <= 12) ||
                     (c === 6 && r >= 8 && r <= 12);
      const format = (r === 8 && c <= 8) ||
                     (c === 8 && r <= 8) ||
                     (r === 8 && c >= 13) ||
                     (c === 8 && r >= 13);
      if (inTL || inTR || inBL || timing || format) continue;
      if (g[r][c] !== 0) continue; // already set

      // Two interleaved hash functions → ~40 % density, irregular pattern
      const h1 = (r * 3  + c * 11 + r * c) % 7;
      const h2 = (r * 13 + c * 5  + (r + c) * 2) % 11;
      g[r][c] = (h1 < 3 || h2 < 4) && !(h1 < 3 && h2 < 4) ? 1 : 0;
    }
  }

  return g;
}

// Pre-compute once at module level — never re-runs on render
const QR_GRID = makeQrGrid();

function QrPlaceholder({ size = 224 }) {
  const N   = 21;
  const pad = 16; // quiet-zone pixels
  const mod = (size - pad * 2) / N;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block' }}
      aria-label="QR code placeholder"
    >
      <rect width={size} height={size} fill="#fff" rx={4} />
      {QR_GRID.flatMap((row, r) =>
        row.map((cell, c) =>
          cell === 1 ? (
            <rect
              key={`${r}-${c}`}
              x={pad + c * mod}
              y={pad + r * mod}
              width={mod}
              height={mod}
              fill="#000"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ── Photo with initials fallback ──────────────────────────────────────────────
function CoachPhoto({ photo, name, size = 130 }) {
  const [err, setErr] = useState(false);
  const mono = (name ?? '')
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
          border: `3.5px solid ${BLUE}`,
          boxShadow: '0 6px 24px rgba(6,89,144,.28)',
          display: 'block',
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(6,89,144,.18), rgba(6,89,144,.38))',
      border: `3.5px solid ${BLUE}`,
      boxShadow: '0 6px 24px rgba(6,89,144,.28)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: FF, fontSize: size * 0.3, fontWeight: 900, color: BLUE }}>
        {mono}
      </span>
    </div>
  );
}

// ── Contact info row (plain text — not a link) ────────────────────────────────
function InfoRow({ iconPath, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: 'rgba(6,89,144,.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {iconPath}
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3,
          textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 1 }}>
          {label}
        </div>
        <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 700, color: DARK,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ── Contact card ──────────────────────────────────────────────────────────────
function ContactCard({ acdc }) {
  return (
    <Card style={{ padding: '20px 16px 16px', marginBottom: 12, textAlign: 'center' }}>
      {/* Photo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <CoachPhoto photo={acdc.photo} name={acdc.name} size={120} />
      </div>

      {/* Name + title */}
      <div style={{ fontFamily: FF, fontSize: 21, fontWeight: 900, color: DARK,
        letterSpacing: '-0.4px', lineHeight: 1.15 }}>
        {acdc.name}
      </div>
      <div style={{ fontFamily: FF, fontSize: 14, color: BLUE, fontWeight: 700, marginTop: 3 }}>
        Academic Coach for Dual Credit
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(6,89,144,.08)', margin: '14px 0 4px' }} />

      {/* Phone — plain text */}
      <InfoRow
        label="Phone"
        value={acdc.phone}
        iconPath={
          <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        }
      />

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(6,89,144,.04)' }} />

      {/* Email — plain text */}
      <InfoRow
        label="Email"
        value={acdc.email}
        iconPath={
          <>
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M2 9l10 6 10-6"/>
          </>
        }
      />
    </Card>
  );
}

// ── QR code card ──────────────────────────────────────────────────────────────
function QrCard() {
  return (
    <Card style={{ padding: '20px 16px 22px', marginBottom: 12, textAlign: 'center' }}>
      {/* Label */}
      <div style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: BLUE,
        textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 4 }}>
        Your Contact QR
      </div>
      <div style={{ fontFamily: FF, fontSize: 11, color: C.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Students can scan this to apply for Dual Credit
      </div>

      {/* QR placeholder — centred, large */}
      <div style={{
        display: 'inline-flex',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,0,0,.10)',
        border: `1.5px solid ${C.border}`,
      }}>
        <QrPlaceholder size={224} />
      </div>

      {/* Subtext */}
      <div style={{ fontFamily: FF, fontSize: 11, color: C.text3,
        marginTop: 14, lineHeight: 1.5 }}>
        Real QR code will be generated once the apply link is confirmed.
      </div>
    </Card>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AcdcProfileTab({ acdc }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle title="Profile" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 100px', marginTop: -28 }}>
        <ContactCard acdc={acdc} />
        <QrCard />

        {/* Apply button */}
        <button
          onClick={() => window.open(APPLY_URL, '_blank', 'noopener,noreferrer')}
          style={{
            width: '100%', height: 54,
            background: LIME, border: 'none', borderRadius: 16,
            cursor: 'pointer', marginBottom: 8,
            boxShadow: '0 4px 20px rgba(234,255,0,.32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={DARK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: DARK }}>
            Apply for Dual Credit
          </span>
        </button>
      </div>
    </div>
  );
}
