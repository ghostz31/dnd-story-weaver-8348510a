import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase avec les valeurs correctes
const firebaseConfig = {
  apiKey: "AIzaSyDPr-C22FHhr-pI8JXE1OUdGfjXCR3V78E",
  authDomain: "dnd-encount.firebaseapp.com",
  projectId: "dnd-encount",
  storageBucket: "dnd-encount.appspot.com",
  messagingSenderId: "832140394776",
  appId: "1:832140394776:web:f57225ac1dbe78cbe85e6d",
  measurementId: "G-FGP4Q6CB5Y"
};

// N'oubliez pas d'activer l'authentification par email/mot de passe dans 
// Firebase Console > Authentication > Sign-in method

// Initialiser Firebase une seule fois
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporter les services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 