/* eslint-disable */
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  arrayUnion,
  onSnapshot,
  setDoc,
  increment
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase/firebase';
import { Party, Player } from '../types';
import { PartySchema } from '../schemas';
import { cleanData, getCurrentUserId, getCurrentUser } from './helpers';
import { getUserStats } from './usersApi';

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

      // Fonction helper pour gérer les dates
      const formatDate = (dateField: any): string => {
        if (!dateField) return new Date().toISOString();
        if (typeof dateField.toDate === 'function') return dateField.toDate().toISOString();
        if (typeof dateField === 'string') return dateField;
        return new Date().toISOString();
      };

      parties.push({
        id: doc.id,
        name: data.name,
        players: data.players || [],
        createdAt: formatDate(data.createdAt),
        updatedAt: formatDate(data.updatedAt)
      });
    });

    // Trier par date de mise à jour (le plus récent d'abord)
    return parties.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error("Erreur lors de la récupération des parties:", error);
    throw error;
  }
};

// Écouter les changements des parties en temps réel
export const subscribeToParties = (
  callback: (parties: Party[]) => void,
  errorCallback?: (error: any) => void
): (() => void) => {
  try {
    const user = getCurrentUser();
    const partiesRef = collection(db, 'users', user.uid, 'parties');

    // Créer un écouteur qui se déclenche à chaque changement dans la collection
    const unsubscribe = onSnapshot(
      partiesRef,
      (snapshot) => {
        const parties: Party[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();

          // Fonction helper pour gérer les dates
          const formatDate = (dateField: any): string => {
            if (!dateField) return new Date().toISOString();
            if (typeof dateField.toDate === 'function') return dateField.toDate().toISOString();
            if (typeof dateField === 'string') return dateField;
            return new Date().toISOString();
          };

          parties.push({
            id: doc.id,
            name: data.name,
            players: data.players || [],
            createdAt: formatDate(data.createdAt),
            updatedAt: formatDate(data.updatedAt)
          });
        });

        // Trier par date de mise à jour (le plus récent d'abord)
        const sortedParties = parties.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        // Appeler le callback avec les données mises à jour
        // Validation Zod
        const validatedParties = sortedParties.map(p => {
          const result = PartySchema.safeParse(p);
          if (!result.success) {
            console.warn(`[Validation] Groupe ${p.id} invalide:`, result.error.format());
            return p; // Best effort
          }
          return result.data;
        });

        callback(validatedParties);
      },
      (error) => {
        console.error("Erreur dans onSnapshot (parties):", error);
        if (errorCallback) errorCallback(error);
      }
    );

    // Retourner la fonction pour se désabonner quand nécessaire
    return unsubscribe;
  } catch (error) {
    console.error("Erreur lors de l'abonnement aux parties:", error);
    if (errorCallback) errorCallback(error);
    return () => { }; // Retourner une fonction vide en cas d'erreur
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

    // Mettre à jour les statistiques de l'utilisateur avec setDoc pour gérer le cas où le document n'existe pas
    await setDoc(userRef, {
      stats: { parties: increment(1) }
    }, { merge: true });

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

    // Fonction helper pour gérer les dates
    const formatDate = (dateField: any): string => {
      if (!dateField) return new Date().toISOString();
      if (typeof dateField.toDate === 'function') return dateField.toDate().toISOString();
      if (typeof dateField === 'string') return dateField;
      return new Date().toISOString();
    };

    return {
      id: partyId,
      name: data?.name,
      players: data?.players || [],
      createdAt: formatDate(data?.createdAt),
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

    // Mettre à jour les statistiques de l'utilisateur avec setDoc pour éviter les crashs
    await setDoc(userRef, {
      stats: { parties: increment(-1) }
    }, { merge: true });

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

    // Nettoyer les données (supprimer les undefined) avant l'envoi
    const cleanedPlayer = cleanData(player);

    await updateDoc(partyRef, {
      players: arrayUnion(cleanedPlayer),
      updatedAt: serverTimestamp()
    });

    return player;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un joueur:", error);
    throw error;
  }
};

// Mettre à jour un joueur
export const updatePlayer = async (partyId: string, playerId: string, updates: Partial<Omit<Player, 'id'>>): Promise<Player | null> => {
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
        return cleanData({ ...player, ...updates, id: playerId });
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
