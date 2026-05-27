import { useState, useEffect, useCallback } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { C, FF } from '../tokens';

const DB_NAME    = 'tcdc-notifs';
const DB_VERSION = 1;
const STORE_NAME = 'received';

// ── IndexedDB helpers ──────────────────────────────────────────────────────
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = ()  => reject(req.error);
  });
}

async function loadNotifications() {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE_NAME, 'readonly');
      const all = tx.objectStore(STORE_NAME).getAll();
      all.onsuccess = () => { db.close(); resolve([...all.result].reverse()); };
      all.onerror   = () => { db.close(); reject(all.error); };
    });
  } catch {
    return [];
  }
}

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
  await fetch('/api/subscribe', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(sub),
  });
  return true;
}

async function unsubscribe() {
  const sub = await getCurrentSub();
  if (sub) await sub.unsubscribe();
}

// ── Relative time ───────────────────────────────────────────────────────────
function relTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Component ───────────────────────────────────────────────────────────────
export default function NotificationsScreen({ onNavigate, tabs }) {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [toggling,   setToggling]     = useState(false);
  const [notifs,     setNotifs]       = useState([]);
  const [supported,  setSupported]    = useState(true);

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
      <BlueHeader>
        <PageTitle title="Notifications" onBack={() => onNavigate('home')} />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 100px', marginTop: -42 }}>

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
          notifs.map(n => (
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
