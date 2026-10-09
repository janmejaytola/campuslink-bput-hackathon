import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import rawConfig from '../firebase-applet-config.json';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || rawConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain || 'campuslink-4e78d.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || rawConfig.projectId || 'campuslink-4e78d',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket || 'campuslink-4e78d.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || rawConfig.appId,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (typeof window !== 'undefined') {
  app = getApps().length > 0 ? getApp() : initializeApp(config);
  auth = getAuth(app);
  // Standard Firebase Web SDK initialization connects to the default Cloud Firestore database "(default)"
  db = getFirestore(app);
  // Standard Firebase Storage initialization
  storage = getStorage(app);
} else {
  // SSR placeholder
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { app, auth, db, storage };
