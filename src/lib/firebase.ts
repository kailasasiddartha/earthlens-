import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// PLACEHOLDER CONFIG - Replace with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDEMO_PLACEHOLDER_KEY_REPLACE_ME",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return !firebaseConfig.apiKey.includes('PLACEHOLDER') && 
         !firebaseConfig.projectId.includes('your-project');
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

// Only initialize if configured
if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

// Create mock objects for when Firebase isn't configured
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: null) => void) => {
    callback(null);
    return () => {};
  },
} as unknown as Auth;

const mockDb = {} as Firestore;
const mockStorage = {} as FirebaseStorage;

// Export initialized instances or mocks
export const auth = authInstance || mockAuth;
export const db = dbInstance || mockDb;
export const storage = storageInstance || mockStorage;
export default app;
