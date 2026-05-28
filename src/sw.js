import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute }          from 'workbox-routing';
import { NetworkOnly }                             from 'workbox-strategies';

// ── Immediate activation ────────────────────────────────────────────────────
// Skip the "waiting" phase so a newly deployed service worker takes control on
// the very next page refresh instead of requiring all tabs to be closed first.
self.addEventListener('install',  ()      => self.skipWaiting());
self.addEventListener('activate', event  => event.waitUntil(clients.claim()));

// ── Admin page: always fetch from network ────────────────────────────────────
// Registered BEFORE precacheAndRoute so it takes priority over the precache
// NavigationRoute. This ensures /admin always loads the latest deployed code
// without cache interference. (WorkBox routes are matched in registration order.)
registerRoute(
  new NavigationRoute(new NetworkOnly(), {
    allowlist: [/^\/admin/],
  })
);

// ── Workbox precaching ───────────────────────────────────────────────────────
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ── Push event ───────────────────────────────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch {
    data = { title: 'TC Dual Credit', body: event.data.text() };
  }

  const title     = data.title || 'TC Dual Credit';
  const body      = data.body  || '';
  const timestamp = Date.now();

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, {
        body,
        icon:  '/icon.svg',
        badge: '/icon.svg',
        data:  { timestamp },
      }),
      storeNotification({ title, body, timestamp }),
    ])
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => {
        const existing = list.find(c => new URL(c.url).origin === self.location.origin);
        if (existing) return existing.focus();
        return clients.openWindow('/');
      })
  );
});

// ── IndexedDB helpers ─────────────────────────────────────────────────────────
const DB_NAME    = 'tcdc-notifs';
const DB_VERSION = 1;
const STORE_NAME = 'received';

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

async function storeNotification(notif) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.add(notif);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror    = () => { db.close(); reject(tx.error); };
  });
}
