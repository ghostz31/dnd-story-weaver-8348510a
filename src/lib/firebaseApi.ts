import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  getDoc, 
  query, 
  where, 
  arrayUnion, 
  arrayRemove,
  increment
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db, auth } from '../firebase/firebase';
import { Party, Player, UserStats, Monster, Encounter } from './types';
import { User } from 'firebase/auth';

// Constantes pour les limites du plan gratuit
const FREE_PLAN_LIMITS = {
  MAX_PARTIES: 1,
  MAX_ENCOUNTERS: 3
};

// ====== Utilitaires ======

// Obtenir l'ID de l'utilisateur courant
const getCurrentUserId = (): string => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Utilisateur non connecté');
  }
  return currentUser.uid;
};

// Vérifier le rôle de l'utilisateur
const getUserRole = async (): Promise<'free' | 'premium'> => {
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
const getCurrentUser = (): User => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Utilisateur non authentifié");
  }
  return user;
};

// Vérifier si l'utilisateur peut créer une nouvelle partie
export const canCreateParty = async (): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("Utilisateur non trouvé");
    }
    
    const userData = userDoc.data();
    const stats = await getUserStats();
    
    // Vérifier si l'utilisateur a atteint sa limite de parties
    if (userData.subscriptionPlan === 'premium') {
      return true; // Les utilisateurs premium n'ont pas de limite
    } else {
      return stats.parties < stats.maxParties;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des limites:", error);
    throw error;
  }
};

// Vérifier si l'utilisateur peut créer une nouvelle rencontre
export const canCreateEncounter = async (): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("Utilisateur non trouvé");
    }
    
    const userData = userDoc.data();
    const stats = await getUserStats();
    
    // Vérifier si l'utilisateur a atteint sa limite de rencontres
    if (userData.subscriptionPlan === 'premium') {
      return true; // Les utilisateurs premium n'ont pas de limite
    } else {
      return stats.encounters < stats.maxEncounters;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des limites de rencontres:", error);
    throw error;
  }
};

// ====== API pour les groupes d'aventuriers ======

// Récupérer toutes les parties de l'utilisateur
export const getParties = async (): Promise<Party[]> => {
  try {
    const user = getCurrentUser();
    const partiesRef = collection(db, 'users', user.uid, 'parties');
    const querySnapshot = await getDocs(partiesRef);
    
    const parties: Party[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      parties.push({
        id: doc.id,
        name: data.name,
        players: data.players || [],
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      });
    });
    
    // Trier par date de mise à jour (le plus récent d'abord)
    return parties.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error("Erreur lors de la récupération des parties:", error);
    throw error;
  }
};

// Créer une nouvelle partie
export const createParty = async (name: string): Promise<Party | null> => {
  try {
    const user = getCurrentUser();
    
    // Vérifier si l'utilisateur peut créer une nouvelle partie
    const canCreate = await canCreateParty();
    if (!canCreate) {
      throw new Error("Vous avez atteint la limite de groupes pour votre plan");
    }
    
    const userRef = doc(db, 'users', user.uid);
    const partiesRef = collection(userRef, 'parties');
    
    const now = serverTimestamp();
    const partyData = {
      name,
      players: [],
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(partiesRef, partyData);
    
    // Mettre à jour les statistiques de l'utilisateur
    await updateDoc(userRef, {
      'stats.parties': increment(1)
    });
    
    return {
      id: docRef.id,
      name,
      players: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erreur lors de la création d'une partie:", error);
    throw error;
  }
};

// Récupérer un groupe spécifique
export const getParty = async (partyId: string): Promise<Party | null> => {
  try {
    const userId = getCurrentUserId();
    const partyDoc = await getDoc(doc(db, 'users', userId, 'parties', partyId));
    
    if (!partyDoc.exists()) {
      return null;
    }
    
    return { id: partyDoc.id, ...partyDoc.data() } as Party;
  } catch (error) {
    console.error('Erreur lors de la récupération du groupe:', error);
    return null;
  }
};

// Mettre à jour une partie
export const updateParty = async (partyId: string, updates: Partial<Omit<Party, 'id' | 'players' | 'createdAt' | 'updatedAt'>>): Promise<Party | null> => {
  try {
    const user = getCurrentUser();
    const partyRef = doc(db, 'users', user.uid, 'parties', partyId);
    
    const partyDoc = await getDoc(partyRef);
    if (!partyDoc.exists()) {
      throw new Error("Groupe non trouvé");
    }
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(partyRef, updateData);
    
    // Récupérer la partie mise à jour
    const updatedDoc = await getDoc(partyRef);
    const data = updatedDoc.data();
    
    return {
      id: partyId,
      name: data?.name,
      players: data?.players || [],
      createdAt: data?.createdAt.toDate().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour d'une partie:", error);
    throw error;
  }
};

// Supprimer une partie
export const deleteParty = async (partyId: string): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    const partyRef = doc(db, 'users', user.uid, 'parties', partyId);
    const userRef = doc(db, 'users', user.uid);
    
    await deleteDoc(partyRef);
    
    // Mettre à jour les statistiques de l'utilisateur
    await updateDoc(userRef, {
      'stats.parties': increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression d'une partie:", error);
    throw error;
  }
};

// Ajouter un joueur à une partie
export const addPlayerToParty = async (partyId: string, playerData: Omit<Player, 'id'>): Promise<Player | null> => {
  try {
    const user = getCurrentUser();
    const partyRef = doc(db, 'users', user.uid, 'parties', partyId);
    
    const player: Player = {
      ...playerData,
      id: uuidv4()
    };
    
    await updateDoc(partyRef, {
      players: arrayUnion(player),
      updatedAt: serverTimestamp()
    });
    
    return player;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un joueur:", error);
    throw error;
  }
};

// Mettre à jour un joueur
export const updatePlayer = async (partyId: string, playerId: string, updates: Omit<Player, 'id'>): Promise<Player | null> => {
  try {
    const user = getCurrentUser();
    const partyRef = doc(db, 'users', user.uid, 'parties', partyId);
    
    // Récupérer la partie et ses joueurs
    const partyDoc = await getDoc(partyRef);
    if (!partyDoc.exists()) {
      throw new Error("Groupe non trouvé");
    }
    
    const partyData = partyDoc.data();
    const players = partyData.players || [];
    
    // Trouver et mettre à jour le joueur spécifique
    const updatedPlayers = players.map((player: Player) => {
      if (player.id === playerId) {
        return { ...updates, id: playerId };
      }
      return player;
    });
    
    // Mettre à jour la partie avec la liste mise à jour des joueurs
    await updateDoc(partyRef, {
      players: updatedPlayers,
      updatedAt: serverTimestamp()
    });
    
    // Retourner le joueur mis à jour
    const updatedPlayer = updatedPlayers.find((p: Player) => p.id === playerId);
    return updatedPlayer || null;
  } catch (error) {
    console.error("Erreur lors de la mise à jour d'un joueur:", error);
    throw error;
  }
};

// Supprimer un joueur d'une partie
export const removePlayerFromParty = async (partyId: string, playerId: string): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    const partyRef = doc(db, 'users', user.uid, 'parties', partyId);
    
    // Récupérer la partie et ses joueurs
    const partyDoc = await getDoc(partyRef);
    if (!partyDoc.exists()) {
      throw new Error("Groupe non trouvé");
    }
    
    const partyData = partyDoc.data();
    const players = partyData.players || [];
    
    // Trouver le joueur à supprimer
    const playerToRemove = players.find((p: Player) => p.id === playerId);
    if (!playerToRemove) {
      throw new Error("Joueur non trouvé");
    }
    
    // Filtrer la liste des joueurs
    const updatedPlayers = players.filter((p: Player) => p.id !== playerId);
    
    // Mettre à jour la partie avec la liste mise à jour des joueurs
    await updateDoc(partyRef, {
      players: updatedPlayers,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression d'un joueur:", error);
    throw error;
  }
};

// ====== API pour les rencontres ======

// Récupérer toutes les rencontres de l'utilisateur
export const getEncounters = async (): Promise<Encounter[]> => {
  try {
    const user = getCurrentUser();
    const encountersRef = collection(db, 'users', user.uid, 'encounters');
    const querySnapshot = await getDocs(encountersRef);
    
    const encounters: Encounter[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      encounters.push({
        id: doc.id,
        name: data.name,
        monsters: data.monsters || [],
        difficulty: data.difficulty,
        partyId: data.partyId,
        partyLevel: data.partyLevel,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      });
    });
    
    // Trier par date de création (le plus récent d'abord)
    return encounters.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Erreur lors de la récupération des rencontres:", error);
    throw error;
  }
};

// Sauvegarder une rencontre
export const saveEncounter = async (encounterData: Omit<Encounter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Encounter | null> => {
  try {
    const user = getCurrentUser();
    
    // Vérifier si l'utilisateur peut créer une nouvelle rencontre
    const canCreate = await canCreateEncounter();
    if (!canCreate) {
      throw new Error("Vous avez atteint la limite de rencontres pour votre plan");
    }
    
    const userRef = doc(db, 'users', user.uid);
    const encountersRef = collection(userRef, 'encounters');
    
    const now = serverTimestamp();
    const data = {
      ...encounterData,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(encountersRef, data);
    
    // Mettre à jour les statistiques de l'utilisateur
    await updateDoc(userRef, {
      'stats.encounters': increment(1)
    });
    
    return {
      id: docRef.id,
      ...encounterData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la rencontre:", error);
    throw error;
  }
};

// Supprimer une rencontre
export const deleteEncounter = async (encounterId: string): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    const encounterRef = doc(db, 'users', user.uid, 'encounters', encounterId);
    const userRef = doc(db, 'users', user.uid);
    
    await deleteDoc(encounterRef);
    
    // Mettre à jour les statistiques de l'utilisateur
    await updateDoc(userRef, {
      'stats.encounters': increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la rencontre:", error);
    throw error;
  }
};

// Calculer la difficulté d'une rencontre
export const calculateEncounterDifficulty = (
  party: Party,
  monsters: EncounterMonster[]
): { totalXP: number; adjustedXP: number; difficulty: 'easy' | 'medium' | 'hard' | 'deadly' } => {
  // Calculer l'XP totale des monstres
  const totalXP = monsters.reduce((sum, { monster, quantity }) => {
    return sum + monster.xp * quantity;
  }, 0);
  
  // Compter le nombre total de monstres
  const monsterCount = monsters.reduce((sum, { quantity }) => sum + quantity, 0);
  
  // Déterminer le multiplicateur en fonction du nombre de monstres
  let multiplier = 1;
  if (monsterCount === 1) {
    multiplier = 1;
  } else if (monsterCount === 2) {
    multiplier = 1.5;
  } else if (monsterCount >= 3 && monsterCount <= 6) {
    multiplier = 2;
  } else if (monsterCount >= 7 && monsterCount <= 10) {
    multiplier = 2.5;
  } else if (monsterCount >= 11 && monsterCount <= 14) {
    multiplier = 3;
  } else if (monsterCount >= 15) {
    multiplier = 4;
  }
  
  // Calculer l'XP ajustée
  const adjustedXP = Math.floor(totalXP * multiplier);
  
  // Calculer les seuils de difficulté pour le groupe
  const thresholds = {
    easy: 0,
    medium: 0,
    hard: 0,
    deadly: 0
  };
  
  // Seuils de difficulté par joueur, selon le DMG
  const xpThresholds: Record<number, Record<string, number>> = {
    1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
    2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
    3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
    4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
    5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
    6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
    7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
    8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
    9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
    10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
    11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
    12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
    13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
    14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
    15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
    16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
    17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
    18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
    19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
    20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
  };
  
  // Calculer les seuils pour chaque joueur
  party.players.forEach(player => {
    const level = Math.min(Math.max(player.level, 1), 20);
    thresholds.easy += xpThresholds[level].easy;
    thresholds.medium += xpThresholds[level].medium;
    thresholds.hard += xpThresholds[level].hard;
    thresholds.deadly += xpThresholds[level].deadly;
  });
  
  // Déterminer la difficulté
  let difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  if (adjustedXP < thresholds.easy) {
    difficulty = 'easy';
  } else if (adjustedXP < thresholds.medium) {
    difficulty = 'easy';
  } else if (adjustedXP < thresholds.hard) {
    difficulty = 'medium';
  } else if (adjustedXP < thresholds.deadly) {
    difficulty = 'hard';
  } else {
    difficulty = 'deadly';
  }
  
  return { totalXP, adjustedXP, difficulty };
};

// ====== Statistiques utilisateur ======

// Récupérer les statistiques d'utilisation de l'utilisateur
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const user = getCurrentUser();
    const userRef = doc(db, 'users', user.uid);
    
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error("Utilisateur non trouvé");
    }
    
    const userData = userDoc.data();
    const stats = userData.stats || {};
    const plan = userData.subscriptionPlan || 'free';
    
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
    throw error;
  }
}; 