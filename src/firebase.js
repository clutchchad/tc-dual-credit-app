/**
 * Firebase configuration placeholder.
 * Replace these values with your actual Firebase project credentials from
 * the Firebase Console → Project Settings → Your apps → Web app → Config.
 *
 * To swap mock data for live Firestore data, replace the arrays in
 * src/data/*.js with Firestore queries using these imports:
 *   import { collection, getDocs, query, orderBy } from 'firebase/firestore';
 *   import { db } from '../firebase';
 */
import { initializeApp } from 'firebase/app';
import { getFirestore }  from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'REPLACE_WITH_API_KEY',
  authDomain:        'REPLACE_WITH_AUTH_DOMAIN',
  projectId:         'REPLACE_WITH_PROJECT_ID',
  storageBucket:     'REPLACE_WITH_STORAGE_BUCKET',
  messagingSenderId: 'REPLACE_WITH_SENDER_ID',
  appId:             'REPLACE_WITH_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
