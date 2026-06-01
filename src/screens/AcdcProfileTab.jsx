/**
 * AcdcProfileTab — Contact Card tab for the ACDC portal.
 *
 * No scroll: entire page fits within the viewport.
 * Shows: photo, name, title, phone (plain text), QR placeholder.
 * No icons, no email, no apply button.
 */
import { useState } from 'react';
import { C, FF } from '../tokens';
import { BlueHeader, PageTitle } from '../components/BlueHeader';

const BLUE  = '#065990';
const DARK  = '#022b52';

// ── QR code placeholder ───────────────────────────────────────────────────────
// 21×21 grid that looks like a real QR code (version 1 layout).
// Not a valid encoded QR — a static visual placeholder.

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
  setFinder(0, 0);
  setFinder(0, 14);
  setFinder(14, 0);

  for (let i = 8; i <= 12; i++) {
    g[6][i] = i % 2 === 0 ? 1 : 0;
    g[i][6] = i % 2 === 0 ? 1 : 0;
  }

  g[13][8] = 1;

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const inTL  = r <= 7 && c <= 7;
      const inTR  = r <= 7 && c >= 13;
      const inBL  = r >= 13 && c <= 7;
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

export function QrPlaceholder({ size = 160 }) {
  const N   = 21;
  const pad = 12;
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
function CoachPhoto({ photo, name, size = 96 }) {
  const [err, setErr] = useState(false);
  const mono = (name ?? '')
    .split(' ')
    .filter(w => /^[A-Z]/.test(w))
    .map(w => w[0])
    .join('')
    .slice(0, 2);

  const src = photo || '/fakeacdc.png';

  if (!err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover',
          border: `3px solid ${BLUE}`,
          boxShadow: '0 4px 18px rgba(6,89,144,.25)',
          display: 'block',
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(6,89,144,.18), rgba(6,89,144,.38))',
      border: `3px solid ${BLUE}`,
      boxShadow: '0 4px 18px rgba(6,89,144,.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: FF, fontSize: size * 0.3, fontWeight: 900, color: BLUE }}>
        {mono}
      </span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AcdcProfileTab({ acdc }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Blue header */}
      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle title="Contact Card" />
      </BlueHeader>

      {/* Centered body — no scroll */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        marginTop: -24,
        textAlign: 'center',
      }}>

        {/* Photo */}
        <CoachPhoto
          photo={acdc?.photo || '/fakeacdc.png'}
          name={acdc?.name}
          size={96}
        />

        {/* Name */}
        <div style={{
          fontFamily: FF, fontSize: 22, fontWeight: 900, color: DARK,
          letterSpacing: '-0.4px', lineHeight: 1.2,
          marginTop: 14, marginBottom: 4,
        }}>
          {acdc?.name ?? 'Abigail Beecher'}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: FF, fontSize: 13, fontWeight: 700, color: BLUE,
          marginBottom: 6,
        }}>
          Academic Coach for Dual Credit
        </div>

        {/* Phone — plain text */}
        <div style={{
          fontFamily: FF, fontSize: 15, fontWeight: 600, color: C.text2,
          marginBottom: 22,
        }}>
          {acdc?.phone ?? '903-823-3106'}
        </div>

        {/* QR code */}
        <div style={{
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,.10)',
          border: `1.5px solid ${C.border}`,
        }}>
          <QrPlaceholder size={160} />
        </div>

        {/* QR label */}
        <div style={{
          fontFamily: FF, fontSize: 10, fontWeight: 700, color: C.text3,
          textTransform: 'uppercase', letterSpacing: '1.2px',
          marginTop: 10,
        }}>
          Contact QR
        </div>

      </div>
    </div>
  );
}
