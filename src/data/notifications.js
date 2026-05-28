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

/** Returns all notifications, newest first. */
export async function loadNotifications() {
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

/** Human-readable relative timestamp. */
export function relTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
