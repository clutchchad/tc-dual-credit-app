/**
 * AcdcResourcesTab — Resources tab for the ACDC portal.
 *
 * Reuses ResourcesScreen's data, filter pills, ResourceIcon, and card layout.
 * Adds per-resource send action: a bottom sheet with a single phone-or-email
 * input field that auto-detects the destination type and stubs the send
 * (console.log + confirmation toast). No tel: or mailto: links used for sending.
 */
import { useState } from 'react';
import { C, FF } from '../tokens';
import { BlueHeader } from '../components/BlueHeader';
import { resources } from '../data/resources';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

// ── Type palette (identical to ResourcesScreen) ───────────────────────────────
const TYPE_COLORS = {
  pdf:     '#b91c1c',
  video:   '#6d28d9',
  website: '#0d7654',
  info:    '#0369a1',
};
const TYPE_LABELS = {
  pdf:     'PDF',
  video:   'Video',
  website: 'Website',
  info:    'Info',
};

// ── ResourceIcon (identical to ResourcesScreen) ───────────────────────────────
function ResourceIcon({ type }) {
  const col = TYPE_COLORS[type] || C.text3;
  const p = {
    width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none',
    stroke: col, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  if (type === 'pdf') return (
    <svg {...p}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <path d="M14 2v6h6M9 13h6M9 17h4"/>
    </svg>
  );
  if (type === 'video') return (
    <svg {...p}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M10 8l6 4-6 4V8z" fill={col} stroke="none"/>
    </svg>
  );
  if (type === 'info') return (
    <svg {...p}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
  );
  return (
    <svg {...p}>
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  );
}

// Filter pills — same set as ResourcesScreen
const FILTERS = [
  ['all', 'All'], ['pdf', 'PDF'], ['video', 'Video'],
  ['website', 'Website'], ['info', 'Info'],
];

// ── Destination type detection ────────────────────────────────────────────────
function detectDestType(val) {
  const stripped = val.replace(/[\s\-\(\)\.]/g, '');
  if (/^\+?[0-9]{7,15}$/.test(stripped)) return 'sms';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'email';
  return null;
}

// ── Send sheet (bottom drawer) ────────────────────────────────────────────────
function SendSheet({ resource, onClose }) {
  const [dest,    setDest]    = useState('');
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);

  const destType = detectDestType(dest);
  const canSend  = destType !== null && !sending && !sent;

  const hintText = (() => {
    if (!dest.trim()) return null;
    if (destType === 'sms')   return '📱 Looks like a phone number — will send via SMS';
    if (destType === 'email') return '✉️ Looks like an email address — will send via email';
    return 'Enter a valid phone number or email address';
  })();
  const hintColor = destType ? C.text2 : C.red;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);

    // STUB — log the intent; wire Twilio (SMS) or email provider here later
    console.log('[ACDC Send]', {
      type:        destType,
      destination: dest.trim(),
      resourceId:  resource.id,
      resourceUrl: resource.url,
      title:       resource.title,
    });

    // Simulate a brief network round-trip
    await new Promise(r => setTimeout(r, 700));
    setSending(false);
    setSent(true);
  };

  return (
    /* Overlay */
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
          padding: '0 20px calc(env(safe-area-inset-bottom, 0px) + 28px)',
          boxShadow: '0 -8px 40px rgba(0,0,0,.18)',
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: C.border, margin: '14px auto 20px',
        }} />

        {/* Resource being sent */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22,
          padding: '12px 14px', borderRadius: 14,
          background: C.bg, border: `1px solid ${C.border}`,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            background: `${TYPE_COLORS[resource.type] || C.text3}14`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ResourceIcon type={resource.type} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: DARK,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {resource.title}
            </div>
            <div style={{ fontFamily: FF, fontSize: 11, color: C.text3, marginTop: 1 }}>
              {TYPE_LABELS[resource.type] || resource.type}
            </div>
          </div>
        </div>

        {sent ? (
          /* ── Confirmation state ── */
          <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(22,163,74,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: DARK,
              letterSpacing: '-0.3px', marginBottom: 6 }}>
              Resource Sent!
            </div>
            <div style={{ fontFamily: FF, fontSize: 13, color: C.text2, marginBottom: 24 }}>
              {destType === 'sms'
                ? `Sent via SMS to ${dest.trim()}`
                : `Sent via email to ${dest.trim()}`}
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%', height: 50, borderRadius: 14,
                background: BLUE, border: 'none', cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: '#fff' }}>
                Done
              </span>
            </button>
          </div>
        ) : (
          /* ── Input state ── */
          <>
            <div style={{ fontFamily: FF, fontSize: 16, fontWeight: 900, color: DARK,
              letterSpacing: '-0.3px', marginBottom: 4 }}>
              Send this resource
            </div>
            <div style={{ fontFamily: FF, fontSize: 13, color: C.text2, marginBottom: 16 }}>
              Enter a phone number or email — we'll detect which to use.
            </div>

            {/* Single auto-detect input */}
            <input
              type="text"
              inputMode="email"
              placeholder="Phone number or email address"
              value={dest}
              onChange={e => setDest(e.target.value)}
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                height: 52, borderRadius: 14, outline: 'none',
                border: `2px solid ${dest && !destType ? C.red : C.border}`,
                background: C.bg,
                fontFamily: FF, fontSize: 15, fontWeight: 600, color: C.text,
                padding: '0 14px',
                transition: 'border-color .15s',
              }}
            />

            {/* Live detection hint */}
            {hintText && (
              <div style={{
                fontFamily: FF, fontSize: 12, fontWeight: 600,
                color: hintColor, marginTop: 7, lineHeight: 1.4,
              }}>
                {hintText}
              </div>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              style={{
                width: '100%', height: 52, borderRadius: 14,
                border: 'none', marginTop: 16, cursor: canSend ? 'pointer' : 'default',
                background: canSend ? LIME : '#e5e7eb',
                boxShadow: canSend ? '0 4px 18px rgba(234,255,0,.35)' : 'none',
                transition: 'background .15s, box-shadow .15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {sending ? (
                <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: canSend ? DARK : '#9ca3af' }}>
                  Sending…
                </span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={canSend ? DARK : '#9ca3af'} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 800,
                    color: canSend ? DARK : '#9ca3af' }}>
                    Send
                  </span>
                </>
              )}
            </button>

            {/* Cancel */}
            <button
              onClick={onClose}
              style={{ width: '100%', background: 'none', border: 'none',
                cursor: 'pointer', padding: '14px 0 2px' }}
            >
              <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 600, color: C.text3 }}>
                Cancel
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Resource row card ─────────────────────────────────────────────────────────
// Adapted from ResourcesScreen's card: tapping the body opens URL, send button
// opens the sheet. Both are separate interactive elements — no nesting issues.
function ResourceRow({ resource, onSend }) {
  const col      = TYPE_COLORS[resource.type] || C.text3;
  const tagLabel = TYPE_LABELS[resource.type] || resource.type;

  const pressStyle = { transform: 'scale(0.98)' };
  const resetStyle = { transform: 'scale(1)' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: '#fff',
      border: `1px solid ${C.border}`, borderRadius: 18,
      marginBottom: 9, overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
    }}>
      {/* Tappable body — opens URL */}
      <button
        onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 13,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '13px 0 13px 15px', textAlign: 'left', minWidth: 0,
          transition: 'transform .1s',
        }}
        onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Type icon */}
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: `${col}14`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ResourceIcon type={resource.type} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text }}>
            {resource.title}
          </div>
          <div style={{
            fontFamily: FF, fontSize: 12, color: C.text2, marginTop: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {resource.desc}
          </div>
        </div>

        {/* Type tag */}
        <span style={{
          fontFamily: FF, fontSize: 9.5, fontWeight: 700,
          color: col, background: `${col}14`,
          borderRadius: 6, padding: '3px 7px',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          flexShrink: 0, marginRight: 4,
        }}>
          {tagLabel}
        </span>
      </button>

      {/* Send button — separate from card tap */}
      <button
        onClick={onSend}
        style={{
          width: 44, height: '100%', minHeight: 72,
          background: 'none', border: 'none', borderLeft: `1px solid ${C.border}`,
          cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .12s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,89,144,.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        title="Send this resource"
        aria-label={`Send ${resource.title}`}
      >
        {/* Paper-plane send icon */}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke={BLUE} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AcdcResourcesTab() {
  const [filter,       setFilter]       = useState('all');
  const [sendResource, setSendResource] = useState(null);

  const list = filter === 'all' ? resources : resources.filter(r => r.type === filter);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Header with filter pills — matches ResourcesScreen exactly */}
      <BlueHeader>
        <h1 style={{ fontFamily: FF, fontSize: 26, fontWeight: 900, color: '#fff',
          letterSpacing: '-0.8px', marginBottom: 13 }}>
          Resources
        </h1>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{
                flexShrink: 0, height: 31, padding: '0 13px', borderRadius: 20,
                border: 'none', cursor: 'pointer',
                background: filter === id ? LIME : 'rgba(255,255,255,.13)',
                transition: 'background .15s',
              }}
            >
              <span style={{
                fontFamily: FF, fontSize: 12, fontWeight: 700,
                color: filter === id ? DARK : 'rgba(255,255,255,.8)',
              }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </BlueHeader>

      {/* Resource list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 100px' }}>
        {list.map(r => (
          <ResourceRow
            key={r.id}
            resource={r}
            onSend={() => setSendResource(r)}
          />
        ))}
      </div>

      {/* Send sheet (portal-level overlay) */}
      {sendResource && (
        <SendSheet
          resource={sendResource}
          onClose={() => setSendResource(null)}
        />
      )}
    </div>
  );
}
