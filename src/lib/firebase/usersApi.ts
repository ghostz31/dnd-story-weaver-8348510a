/* eslint-disable */
import {
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { UserStats } from '../types';
import { getCurrentUser, FREE_PLAN_LIMITS } from './helpers';

// ====== Statistiques utilisateur ======

// Récupérer les statistiques d'utilisation de l'utilisateur
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const user = getCurrentUser();
    const userRef = doc(db, 'users', user.uid);

    const userDoc = await getDoc(userRef);

    // Valeurs par défaut si l'utilisateur n'existe pas encore ou n'a pas de stats
    const defaultStats = {
      parties: 0,
      encounters: 0
    };

    let stats = defaultStats;
    let plan = 'free';

    if (userDoc.exists()) {
      const userData = userDoc.data();
      stats = userData.stats || defaultStats;
      plan = userData.subscriptionPlan || 'free';
    }

    // Limites selon le plan
    const limits: Record<string, { maxParties: number, maxEncounters: number }> = {
      free: {
        maxParties: FREE_PLAN_LIMITS.MAX_PARTIES,
        maxEncounters: FREE_PLAN_LIMITS.MAX_ENCOUNTERS
      },
      premium: {
        maxParties: Number.POSITIVE_INFINITY,
        maxEncounters: Number.POSITIVE_INFINITY
      }
    };

    return {
      parties: stats.parties || 0,
      encounters: stats.encounters || 0,
      maxParties: limits[plan].maxParties,
      maxEncounters: limits[plan].maxEncounters
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    // En cas d'erreur, retourner les stats par défaut pour ne pas bloquer l'UI
    return {
      parties: 0,
      encounters: 0,
      maxParties: FREE_PLAN_LIMITS.MAX_PARTIES,
      maxEncounters: FREE_PLAN_LIMITS.MAX_ENCOUNTERS
    };
  }
};
