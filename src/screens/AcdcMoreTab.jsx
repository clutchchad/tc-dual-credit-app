/**
 * AcdcMoreTab — More tab for the ACDC portal.
 *
 * Menu list with four items:
 *   1. Pathways  — school picker → pathway list; each pathway has a send button
 *   2. Events    — full Firestore event list, no countdown/urgency styling
 *   3. Deadlines — full Firestore deadline list, no countdown/urgency styling
 *   4. Log Out   — clears ACDC session, returns to splash
 *
 * Pathways send uses the same single-field auto-detect pattern as AcdcResourcesTab.
 * Events and Deadlines reuse the Firestore query logic from EventsScreen.
 * Log Out calls the onSignOut prop passed down from AcdcHomeScreen.
 */
import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '../hooks/useFirestore';
import { C, FF } from '../tokens';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import { PATHWAYS } from '../data/pathways';
import { SCHOOLS } from '../data/schools';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

// ── Send auto-detection (mirrors AcdcResourcesTab) ───────────────────────────

function detectDestType(val) {
  const stripped = val.replace(/[\s\-\(\)\.]+/g, '');
  if (/^\+?[0-9]{7,15}$/.test(stripped)) return 'sms';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'email';
  return null;
}

// ── Send sheet (bottom drawer, same pattern as AcdcResourcesTab) ─────────────

function SendSheet({ item, itemType, onClose }) {
  const [dest,        setDest]        = useState('');
  const [sending,     setSending]     = useState(false);
  const [confirmed,   setConfirmed]   = useState(false);

  const detType = detectDestType(dest);

  const hintText = () => {
    if (!dest.trim()) return null;
    if (detType === 'sms')   return '📱 Looks like a phone number — will send via SMS';
    if (detType === 'email') return '✉️ Looks like an email address — will send via email';
    return 'Enter a valid phone number or email address';
  };
  const hintColor = (!dest.trim() || detType) ? C.text3 : '#dc2626';

  const handleSend = () => {
    if (!detType) return;
    setSending(true);
    setTimeout(() => {
      console.log('[ACDC Send]', {
        type:        detType,
        destination: dest.trim(),
        itemType,
        itemId:   item.id   || item.pdfUrl,
        itemUrl:  item.pdfUrl || null,
        title:    item.name  || item.title,
      });
      setSending(false);
      setConfirmed(true);
    }, 700);
  };

  const label = item.name || item.title;
  const deliveryNote = detType === 'sms'
    ? `Sent via SMS to ${dest.trim()}`
    : `Sent via email to ${dest.trim()}`;

  return (
    <>
      {/* Dim overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          zIndex: 200,
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,.18)',
        padding: '0 20px 32px',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
        zIndex: 201,
        maxWidth: 520,
        margin: '0 auto',
      }}>
        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: C.border, margin: '12px auto 20px',
        }} />

        {confirmed ? (
          /* ── Confirmation state ── */
          <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: '#dcfce7', border: '2px solid #4ade80',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: DARK, marginBottom: 6 }}>
              Sent!
            </div>
            <div style={{ fontFamily: FF, fontSize: 13, color: C.text2, marginBottom: 24 }}>
              {deliveryNote}
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%', height: 50, background: LIME, border: 'none',
                borderRadius: 14, cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: DARK }}>Done</span>
            </button>
          </div>
        ) : (
          /* ── Input state ── */
          <>
            {/* Item preview chip */}
            <div style={{
              background: 'rgba(6,89,144,.06)', borderRadius: 10,
              padding: '8px 12px', marginBottom: 18,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {itemType === 'pathway'
                  ? <><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M12 19h4.5a3.5 3.5 0 000-7h-8a3.5 3.5 0 010-7H12"/></>
                  : <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>
                }
              </svg>
              <span style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: BLUE,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {label}
              </span>
            </div>

            <label style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: C.text3,
              textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>
              Send to
            </label>

            <input
              type="text"
              inputMode="email"
              placeholder="Phone number or email address"
              value={dest}
              onChange={e => setDest(e.target.value)}
              autoFocus
              style={{
                width: '100%', height: 50, borderRadius: 12, boxSizing: 'border-box',
                border: `1.5px solid ${C.border}`, padding: '0 14px',
                fontFamily: FF, fontSize: 15, color: DARK, outline: 'none',
                background: '#fafafa',
              }}
            />

            {dest.trim() && (
              <div style={{ fontFamily: FF, fontSize: 12, color: hintColor, marginTop: 7, minHeight: 18 }}>
                {hintText()}
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={!detType || sending}
              style={{
                width: '100%', height: 50, marginTop: 18,
                background: (!detType || sending) ? C.border : LIME,
                border: 'none', borderRadius: 14, cursor: detType ? 'pointer' : 'default',
                boxShadow: detType && !sending ? '0 4px 16px rgba(234,255,0,.3)' : 'none',
                transition: 'background .15s, box-shadow .15s',
              }}
            >
              <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 800,
                color: (!detType || sending) ? C.text3 : DARK }}>
                {sending ? 'Sending…' : 'Send'}
              </span>
            </button>
          </>
        )}
      </div>
    </>
  );
}

// ── Helpers shared by Events and Deadlines views ──────────────────────────────

function fmtDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function SectionLabel({ label }) {
  return (
    <div style={{
      fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3,
      textTransform: 'uppercase', letterSpacing: '1.4px',
      marginBottom: 8, paddingLeft: 4,
    }}>
      {label}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 12px', fontFamily: FF, fontSize: 13, color: C.text3 }}>
      {message}
    </div>
  );
}

// ItemCard — no urgency chip (no countdown badge, no color-coded days remaining)
function AcdcItemCard({ item, type }) {
  const dateStr = type === 'deadline' ? item.dueDate : item.date;

  return (
    <div style={{ display: 'flex', gap: 13, marginBottom: 12 }}>
      {/* Timeline dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 22, flexShrink: 0 }}>
        <div style={{
          width: 13, height: 13, borderRadius: '50%',
          background: type === 'deadline' ? C.red : BLUE,
          border: `3px solid ${type === 'deadline' ? '#fee2e2' : '#dbeafe'}`,
          marginTop: 16, flexShrink: 0,
        }} />
      </div>

      {/* Card */}
      <div style={{
        flex: 1, background: '#fff', borderRadius: 14,
        border: `1px solid ${C.border}`, padding: '13px 15px',
        boxShadow: '0 1px 4px rgba(0,0,0,.04)',
      }}>
        <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          {item.title}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: FF, fontSize: 12, color: C.text3 }}>
            {type === 'deadline' ? 'Due ' : ''}{fmtDate(dateStr)}
            {type === 'event' && item.time ? ` · ${item.time}` : ''}
          </span>
          {type === 'event' && item.location && (
            <>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: C.border }} />
              <span style={{ fontFamily: FF, fontSize: 12, color: C.text3 }}>{item.location}</span>
            </>
          )}
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: C.border }} />
          <span style={{ fontFamily: FF, fontSize: 12, fontWeight: 600,
            color: type === 'deadline' ? C.red : BLUE }}>
            {type === 'deadline' ? 'Deadline' : 'Event'}
          </span>
        </div>
        {item.description ? (
          <div style={{ fontFamily: FF, fontSize: 12, color: C.text2, marginTop: 6, lineHeight: 1.45 }}>
            {item.description}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Events sub-view ───────────────────────────────────────────────────────────

function EventsView({ onBack }) {
  const db = useFirestore();
  const [events,      setEvents]      = useState([]);
  const [eventsReady, setEventsReady] = useState(false);

  useEffect(() => {
    if (!db) return;
    const q    = query(collection(db, 'dcEvents'), orderBy('date', 'asc'));
    const cutoff = Date.now() - 12 * 60 * 60 * 1000;
    const unsub = onSnapshot(
      q,
      snap => {
        setEvents(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(ev => {
              const ts = ev.date;
              if (!ts) return true;
              const d = ts.toDate ? ts.toDate() : new Date(ts);
              return d.getTime() > cutoff;
            })
        );
        setEventsReady(true);
      },
      () => setEventsReady(true)
    );
    return unsub;
  }, [db]);

  const loading = !db || !eventsReady;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <BlueHeader>
        <PageTitle title="Events" onBack={onBack} />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 120px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 40, fontFamily: FF, fontSize: 13, color: C.text3 }}>
            Loading…
          </div>
        ) : events.length === 0 ? (
          <EmptyState message="No upcoming events." />
        ) : (
          <>
            <SectionLabel label="Upcoming Events" />
            {events.map(ev => <AcdcItemCard key={ev.id} item={ev} type="event" />)}
          </>
        )}
      </div>
    </div>
  );
}

// ── Deadlines sub-view ────────────────────────────────────────────────────────

function DeadlinesView({ onBack }) {
  const db = useFirestore();
  const [deadlines,      setDeadlines]      = useState([]);
  const [deadlinesReady, setDeadlinesReady] = useState(false);

  useEffect(() => {
    if (!db) return;
    const q      = query(collection(db, 'dcDeadlines'), orderBy('dueDate', 'asc'));
    const cutoff = Date.now() - 72 * 60 * 60 * 1000;
    const unsub  = onSnapshot(
      q,
      snap => {
        setDeadlines(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(dl => {
              const ts = dl.dueDate || dl.date;
              if (!ts) return true;
              const d = ts.toDate ? ts.toDate() : new Date(ts);
              return d.getTime() > cutoff;
            })
        );
        setDeadlinesReady(true);
      },
      () => setDeadlinesReady(true)
    );
    return unsub;
  }, [db]);

  const loading = !db || !deadlinesReady;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <BlueHeader>
        <PageTitle title="Deadlines" onBack={onBack} />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 120px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 40, fontFamily: FF, fontSize: 13, color: C.text3 }}>
            Loading…
          </div>
        ) : deadlines.length === 0 ? (
          <EmptyState message="No upcoming deadlines." />
        ) : (
          <>
            <SectionLabel label="Deadlines" />
            {deadlines.map(dl => <AcdcItemCard key={dl.id} item={dl} type="deadline" />)}
          </>
        )}
      </div>
    </div>
  );
}

// ── Pathways sub-view ─────────────────────────────────────────────────────────

const BROWSABLE_SCHOOLS = SCHOOLS.filter(s => !s.unassigned);

// Single pathway row: body button opens PDF; send button opens SendSheet
function PathwayRow({ pathway, onSend }) {
  const displayName = pathway.name.replace(/^EEPP\s*[–-]\s*/, '');

  const press = e => { e.currentTarget.style.opacity = '0.7'; };
  const lift  = e => { e.currentTarget.style.opacity = '1'; };

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      background: '#fff', border: `1px solid ${C.border}`,
      borderRadius: 12, marginBottom: 10, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,.06)',
    }}>
      {/* Body — opens PDF */}
      <button
        onClick={() => window.open(pathway.pdfUrl, '_blank', 'noopener,noreferrer')}
        onMouseDown={press} onMouseUp={lift} onMouseLeave={lift}
        onTouchStart={press} onTouchEnd={lift}
        style={{
          flex: 1, background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 12px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 10, textAlign: 'left',
          transition: 'opacity .1s',
        }}
      >
        <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 600, color: C.text }}>
          {displayName}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {/* Send button — paper plane */}
      <button
        onClick={() => onSend(pathway)}
        onMouseDown={press} onMouseUp={lift} onMouseLeave={lift}
        onTouchStart={press} onTouchEnd={lift}
        style={{
          width: 48, flexShrink: 0, background: 'none', border: 'none',
          borderLeft: `1px solid ${C.border}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .12s, opacity .1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,89,144,.07)'; }}
        onFocus={e => { e.currentTarget.style.background = 'rgba(6,89,144,.07)'; }}
        onBlur={e  => { e.currentTarget.style.background = 'none'; }}
        title="Send pathway plan"
        aria-label={`Send ${displayName}`}
      >
        {/* Paper-plane icon */}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  );
}

function PathwaysView({ onBack }) {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [sendItem,       setSendItem]       = useState(null);

  const pathways = useMemo(
    () => selectedSchool ? PATHWAYS.filter(p => p.school === selectedSchool.id) : [],
    [selectedSchool]
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}>
      <BlueHeader>
        <PageTitle
          title="Pathway Plans"
          onBack={selectedSchool ? () => setSelectedSchool(null) : onBack}
        />
      </BlueHeader>

      {/* School color bar when a school is selected */}
      {selectedSchool && (
        <div style={{
          backgroundColor: selectedSchool.color,
          height: 44,
          display: 'flex', alignItems: 'center',
          padding: '0 16px', flexShrink: 0, gap: 8,
        }}>
          <span style={{
            fontFamily: FF, fontSize: 14, fontWeight: 700,
            color: selectedSchool.textColor || '#fff',
          }}>
            {selectedSchool.name}
          </span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 120px' }}>
        {!selectedSchool ? (
          /* School picker */
          <>
            <p style={{ fontFamily: FF, fontSize: 13, color: C.text3, lineHeight: 1.6, marginBottom: 14 }}>
              Select a school to view and send pathway plans.
            </p>
            {BROWSABLE_SCHOOLS.map(school => (
              <button
                key={school.id}
                onClick={() => setSelectedSchool(school)}
                style={{
                  width: '100%', background: '#fff', border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '14px 14px', marginBottom: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                  transition: 'box-shadow .15s',
                }}
                onMouseDown={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.1)'; }}
                onMouseUp={e   => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}
                onTouchStart={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.1)'; }}
                onTouchEnd={e   => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    backgroundColor: school.color, flexShrink: 0,
                  }} />
                  <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 600, color: C.text }}>
                    {school.name}
                  </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={C.text3} strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            ))}
          </>
        ) : (
          /* Pathway list with send buttons */
          <>
            <p style={{ fontFamily: FF, fontSize: 13, color: C.text3, lineHeight: 1.6, marginBottom: 14 }}>
              Tap a plan to open the PDF, or use the send button to share it.
            </p>
            {pathways.length > 0 ? (
              pathways.map(p => (
                <PathwayRow key={p.id} pathway={p} onSend={setSendItem} />
              ))
            ) : (
              <EmptyState message="No pathway plans available for this school." />
            )}
          </>
        )}
      </div>

      {/* Send sheet overlay */}
      {sendItem && (
        <SendSheet
          item={sendItem}
          itemType="pathway"
          onClose={() => setSendItem(null)}
        />
      )}
    </div>
  );
}

// ── Menu view ─────────────────────────────────────────────────────────────────

function MenuRow({ icon, label, onPress, destructive }) {
  const iconBg    = destructive ? '#fef2f2' : 'rgba(6,89,144,.08)';
  const iconColor = destructive ? '#dc2626' : BLUE;
  const labelColor = destructive ? '#dc2626' : C.text;

  return (
    <button
      onClick={onPress}
      style={{
        width: '100%', background: '#fff', border: `1px solid ${C.border}`,
        borderRadius: 14, padding: '13px 15px', marginBottom: 10,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
        textAlign: 'left', boxSizing: 'border-box',
        transition: 'box-shadow .12s',
      }}
      onMouseDown={e  => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.09)'; }}
      onMouseUp={e    => { e.currentTarget.style.boxShadow = 'none'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
      onTouchStart={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.09)'; }}
      onTouchEnd={e   => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 700, color: labelColor, flex: 1 }}>
        {label}
      </span>
      {!destructive && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={C.text3} strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      )}
    </button>
  );
}

function MenuView({ onNavigate, onSignOut }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle title="More" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 120px', marginTop: -24 }}>
        <MenuRow
          label="Pathway Plans"
          onPress={() => onNavigate('pathways')}
          icon={
            <>
              <circle cx="6" cy="19" r="2"/>
              <circle cx="18" cy="5" r="2"/>
              <path d="M12 19h4.5a3.5 3.5 0 000-7h-8a3.5 3.5 0 010-7H12"/>
            </>
          }
        />
        <MenuRow
          label="Events"
          onPress={() => onNavigate('events')}
          icon={
            <>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
              <path d="M8 15h.01M12 15h.01M8 19h.01"/>
            </>
          }
        />
        <MenuRow
          label="Deadlines"
          onPress={() => onNavigate('deadlines')}
          icon={
            <>
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3"/>
            </>
          }
        />

        {/* Divider */}
        <div style={{ height: 1, background: C.border, margin: '6px 0 16px' }} />

        <MenuRow
          label="Log Out"
          onPress={onSignOut}
          destructive
          icon={
            <>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </>
          }
        />
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AcdcMoreTab({ onSignOut }) {
  const [view, setView] = useState('menu');

  switch (view) {
    case 'pathways':
      return <PathwaysView onBack={() => setView('menu')} />;
    case 'events':
      return <EventsView onBack={() => setView('menu')} />;
    case 'deadlines':
      return <DeadlinesView onBack={() => setView('menu')} />;
    default:
      return <MenuView onNavigate={setView} onSignOut={onSignOut} />;
  }
}
