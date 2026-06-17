/* eslint-disable */
/*
RÈGLES DE SÉCURITÉ FIRESTORE À CONFIGURER:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permet à un utilisateur authentifié d'accéder à ses propres données
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règle pour la collection monsters globale
    match /monsters/{monsterId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
*/

// Barrel file — re-exporte toutes les API Firebase par entité métier.
// Les imports existants (`from './firebaseApi'` ou `from '../lib/firebaseApi'`)
// continuent de fonctionner grâce à ces re-exports.

export * from './firebase/usersApi';
export * from './firebase/partiesApi';
export * from './firebase/encountersApi';
export * from './firebase/monstersApi';
