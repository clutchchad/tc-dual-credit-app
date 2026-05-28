import { useState, useEffect } from 'react';
import { dbReady } from '../firebase';

/**
 * Returns the Firestore db instance once /api/firebase-config resolves,
 * or null while it is still loading / if config is missing.
 *
 * Usage:
 *   const db = useFirestore();
 *   useEffect(() => {
 *     if (!db) return;
 *     const unsub = onSnapshot(...);
 *     return unsub;
 *   }, [db]);
 */
export function useFirestore() {
  const [db, setDb] = useState(null);
  useEffect(() => {
    let cancelled = false;
    dbReady.then(instance => {
      if (!cancelled && instance) setDb(instance);
    });
    return () => { cancelled = true; };
  }, []);
  return db;
}
