/**
 * Firebase initialisation — config is fetched at runtime from /api/firebase-config
 * so that credentials never need to be in VITE_ environment variables.
 *
 * Use the useFirestore() hook (src/hooks/useFirestore.js) in components; it
 * resolves to the Firestore db instance once the promise settles.
 */
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const dbReady = fetch('/api/firebase-config')
  .then(r => r.json())
  .then(({ apiKey, projectId }) => {
    if (!projectId) return null;
    const app =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            apiKey,
            projectId,
            authDomain:    `${projectId}.firebaseapp.com`,
            storageBucket: `${projectId}.firebasestorage.app`,
          });
    return getFirestore(app);
  })
  .catch(() => null);
