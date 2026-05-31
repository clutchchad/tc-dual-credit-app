import { useState, useEffect, useCallback } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { useIsTablet } from '../hooks/useIsTablet';
import { C, FF } from '../tokens';
import { loadNotifications, relTime } from '../data/notifications';

// ── VAPID subscribe helpers ─────────────────────────────────────────────────
function urlBase64ToUint8Array(b64) {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4);
  const base64  = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  const out     = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function getCurrentSub() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

async function subscribe() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      import.meta.env.VITE_VAPID_PUBLIC_KEY
    ),
  });

  // Attach the user's school and role so targeted push delivery can filter
  // subscriptions before sending.
  let school = 'all';
  let role   = 'all';
  try {
    const stored = JSON.parse(localStorage.getItem('tcdc_v1') || '{}');
    if (stored.school?.id) school = stored.school.id;
    if (stored.role)       role   = stored.role;
  } catch { /* ignore */ }

  const subJson = sub.toJSON();
  await fetch('/api/subscribe', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ ...subJson, school, role }),
  });
  return true;
}

async function unsubscribe() {
  const sub = await getCurrentSub();
  if (sub) await sub.unsubscribe();
}

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

const FILTER_PILLS = [
  { id: 'Announcements', label: 'Announcements' },
  { id: 'Reminder',      label: 'Reminders'     },
  { id: 'Event',         label: 'Events'         },
  { id: 'TC Promise',    label: 'TC Promise'     },
];

// ── Component ───────────────────────────────────────────────────────────────
export default function NotificationsScreen({ onNavigate, tabs }) {
  const isTablet = useIsTablet();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [toggling,   setToggling]     = useState(false);
  const [notifs,     setNotifs]       = useState([]);
  const [supported,  setSupported]    = useState(true);
  const [activeFilters, setActiveFilters] = useState(new Set());

  function toggleFilter(id) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Check real subscription state and load history on mount
  const refresh = useCallback(async () => {
    const sub = await getCurrentSub();
    setPushEnabled(!!sub && Notification.permission === 'granted');
    const stored = await loadNotifications();
    setNotifs(stored);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSupported(false);
      return;
    }
    refresh();
  }, [refresh]);

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      if (pushEnabled) {
        await unsubscribe();
        setPushEnabled(false);
      } else {
        const ok = await subscribe();
        setPushEnabled(ok);
      }
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader style={{ paddingBottom: 52 }}>
        <button
          onClick={() => onNavigate('home')}
          style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.75)', padding:'4px 0', marginBottom:8 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span style={{ fontFamily:FF, fontSize:13, fontWeight:600 }}>Back</span>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <h1 style={{ fontFamily:FF, fontSize:26, fontWeight:900, color:'#fff', letterSpacing:'-0.8px', margin:0 }}>
            Notifications
          </h1>
        </div>
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: isTablet ? '0 24px 40px' : '0 14px 150px', marginTop: -42, position: 'relative' }}>

        {/* Push opt-in card */}
        <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 2px 10px rgba(0,0,0,.05)', padding: '15px 17px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(6,89,144,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text }}>Push Notifications</div>
            <div style={{ fontFamily: FF, fontSize: 11.5, color: C.text2, marginTop: 2 }}>
              {!supported
                ? 'Not supported in this browser.'
                : toggling
                  ? 'Updating…'
                  : pushEnabled
                    ? 'Receiving updates and reminders.'
                    : 'Tap to enable updates and reminders.'}
            </div>
          </div>
          {supported && (
            <div
              onClick={handleToggle}
              style={{ width: 44, height: 26, borderRadius: 13, background: pushEnabled ? C.blue : '#d1d5db', cursor: toggling ? 'default' : 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0, opacity: toggling ? 0.6 : 1 }}
            >
              <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: '#fff', top: 3, left: pushEnabled ? 21 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
            </div>
          )}
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
          {FILTER_PILLS.map(p => {
            const active = activeFilters.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleFilter(p.id)}
                style={{
                  height: 30, padding: '0 13px', borderRadius: 20,
                  border: `1.5px solid ${BLUE}`,
                  background: active ? BLUE : '#fff',
                  cursor: 'pointer',
                  transition: 'background .15s',
                }}
              >
                <span style={{ fontFamily: FF, fontSize: 11.5, fontWeight: 700, color: active ? '#fff' : BLUE }}>
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notifications list */}
        <div style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 8, paddingLeft: 4 }}>Recent</div>

        {notifs.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 48, paddingBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(6,89,144,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="1.8" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </div>
            <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 600, color: C.text2 }}>No notifications yet</div>
            <div style={{ fontFamily: FF, fontSize: 12, color: C.text3, marginTop: 4 }}>
              {pushEnabled ? 'New messages will appear here.' : 'Enable push notifications above to get started.'}
            </div>
          </div>
        ) : (
          notifs
          .filter(n => activeFilters.size === 0 || activeFilters.has(n.category))
          .map(n => (
            <div
              key={n.id}
              style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: '13px 14px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#065990', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#EAFF00" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontFamily: FF, fontSize: 12, color: C.text2, lineHeight: 1.4 }}>{n.body}</div>
              </div>
              <div style={{ fontFamily: FF, fontSize: 10.5, color: C.text3, flexShrink: 0, paddingLeft: 4, paddingTop: 2 }}>
                {relTime(n.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav active="home" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
