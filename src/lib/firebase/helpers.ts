/* eslint-disable */
import {
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { User } from 'firebase/auth';

// Constants pour les limites des plans
export const FREE_PLAN_LIMITS = {
  MAX_PARTIES: 3,
  MAX_ENCOUNTERS: 20
};

// ====== Utilitaires ======

// Nettoyer les objets pour Firestore (supprimer les undefined)
export const cleanData = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanData);
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanData(value);
      }
    }
    return cleaned;
  }
  return obj;
};

// Obtenir l'ID de l'utilisateur courant
export const getCurrentUserId = (): string => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Utilisateur non connecté');
  }
  return currentUser.uid;
};

// Vérifier le rôle de l'utilisateur
export const getUserRole = async (): Promise<'free' | 'premium'> => {
  try {
    const userId = getCurrentUserId();
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (userDoc.exists()) {
      return userDoc.data().role || 'free';
    }

    return 'free';
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle utilisateur:', error);
    return 'free';
  }
};

// Récupérer l'utilisateur courant
export const getCurrentUser = (): User => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Utilisateur non authentifié");
  }
  return user;
};
