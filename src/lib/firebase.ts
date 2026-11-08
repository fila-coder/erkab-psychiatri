/**
 * Firebase initialization — Auth + Firestore only (Spark).
 * Long-polling helps environments where WebChannel/WebSockets hang.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0]! : initializeApp(config);
  auth = getAuth(app);
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch {
    db = getFirestore(app);
  }
}

export { app, auth, db };

export function requireAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Set VITE_FIREBASE_* env vars.');
  }
  return auth;
}

export function requireDb(): Firestore {
  if (!db) {
    throw new Error('Firestore is not configured. Set VITE_FIREBASE_* env vars.');
  }
  return db;
}
