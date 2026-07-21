import { initializeApp } from 'firebase/app'
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  connectFirestoreEmulator 
} from 'firebase/firestore'
import { getDatabase, connectDatabaseEmulator } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCfC2gWBc_CNV0vmTUrqPUE-pkO4Q92tHM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nkhbat-alnujoom.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://nkhbat-alnujoom-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nkhbat-alnujoom",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nkhbat-alnujoom.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "309990493425",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:309990493425:web:b3f09955052a1651446d50"
}; 

const app = initializeApp(firebaseConfig)

import { getFirestore } from 'firebase/firestore'

// Disable offline persistence for now so you don't see cached emulator data
export const db = getFirestore(app)

export const rtdb = getDatabase(app)

// Connect to emulators locally during development & testing
// Disabled for production - set VITE_USE_EMULATORS=true in .env.local to enable for local dev
const useEmulators = false
if (useEmulators) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectDatabaseEmulator(rtdb, '127.0.0.1', 9000)
}

export default app
