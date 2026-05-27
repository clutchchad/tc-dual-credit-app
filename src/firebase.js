/**
 * Firebase configuration — reads from Vite environment variables.
 * Add the following to your Vercel project (and a local .env.local):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_MESSAGING_SENDER_ID  (optional but recommended)
 *   VITE_FIREBASE_APP_ID               (optional but recommended)
 */
import { initializeApp } from 'firebase/app';
import { getFirestore }  from 'firebase/firestore';

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket:     `${projectId}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID              || '',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
