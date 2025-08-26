import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase avec les variables d'environnement
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Vérifier que les variables d'environnement sont définies
if (!firebaseConfig.apiKey) {
  throw new Error('Variables d\'environnement Firebase manquantes. Vérifiez votre fichier .env.local');
}

// N'oubliez pas d'activer l'authentification par email/mot de passe dans 
// Firebase Console > Authentication > Sign-in method

// Initialiser Firebase une seule fois
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporter les services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 