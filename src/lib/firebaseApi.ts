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
  increment,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db, auth } from '../firebase/firebase';
import { Party, Player, UserStats, Monster, Encounter, EncounterMonster, EncounterFolder } from './types';
import { User } from 'firebase/auth';
import { EncounterSchema, PartySchema } from './schemas';

// Constants pour les limites des plans
const FREE_PLAN_LIMITS = {
  MAX_PARTIES: 3,
  MAX_ENCOUNTERS: 20
};

// ====== Utilitaires ======

// Nettoyer les objets pour Firestore (supprimer les undefined)
const cleanData = (obj: any): any => {
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

      // Fonction helper pour gérer les dates
      const formatDate = (dateField: any): string => {
        if (!dateField) return new Date().toISOString();
        if (typeof dateField.toDate === 'function') return dateField.toDate().toISOString();
        if (typeof dateField === 'string') return dateField;
        return new Date().toISOString();
      };

      encounters.push({
        id: doc.id,
        name: data.name,
        description: data.description || '',
        environment: data.environment || '',
        monsters: data.monsters || [],
        party: data.party || null,
        participants: data.participants || [],
        difficulty: data.difficulty || 'medium',
        totalXP: data.totalXP || 0,
        adjustedXP: data.adjustedXP || 0,
        status: data.status || 'draft',
        round: data.round || 1,
        currentTurn: data.currentTurn || 0,
        isActive: data.isActive || false,
        folderId: data.folderId || null,
        createdAt: formatDate(data.createdAt),
        updatedAt: formatDate(data.updatedAt)
      });
    });

    // Trier par date de mise à jour (le plus récent d'abord)
    return encounters.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error("Erreur lors de la récupération des rencontres:", error);
    throw error;
  }
};

// Écouter les changements des rencontres en temps réel
export const subscribeToEncounters = (
  callback: (encounters: Encounter[]) => void,
  errorCallback?: (error: any) => void
): (() => void) => {
  try {
    const user = getCurrentUser();
    console.log("subscribeToEncounters - Utilisateur:", user.uid);
    const encountersRef = collection(db, 'users', user.uid, 'encounters');
    console.log("subscribeToEncounters - Référence collection:", encountersRef.path);

    // Créer un écouteur qui se déclenche à chaque changement dans la collection
    const unsubscribe = onSnapshot(
      encountersRef,
      (snapshot) => {
        console.log("subscribeToEncounters - Snapshot reçu, taille:", snapshot.size);
        console.log("subscribeToEncounters - Snapshot vide?", snapshot.empty);

        const encounters: Encounter[] = [];
        snapshot.forEach(doc => {
          console.log("subscribeToEncounters - Document:", doc.id, doc.data());
          const data = doc.data();

          // Fonction helper pour gérer les dates
          const formatDate = (dateField: any): string => {
            if (!dateField) return new Date().toISOString();
            if (typeof dateField.toDate === 'function') return dateField.toDate().toISOString();
            if (typeof dateField === 'string') return dateField;
            return new Date().toISOString();
          };

          encounters.push({
            id: doc.id,
            name: data.name,
            description: data.description || '',
            environment: data.environment || '',
            monsters: data.monsters || [],
            party: data.party || null,
            participants: data.participants || [],
            difficulty: data.difficulty || 'medium',
            totalXP: data.totalXP || 0,
            adjustedXP: data.adjustedXP || 0,
            status: data.status || 'draft',
            round: data.round || 1,
            currentTurn: data.currentTurn || 0,
            isActive: data.isActive || false,
            folderId: data.folderId || null,
            createdAt: formatDate(data.createdAt),
            updatedAt: formatDate(data.updatedAt)
          });
        });

        console.log("subscribeToEncounters - Rencontres extraites:", encounters.length);

        // Trier par date de mise à jour (le plus récent d'abord)
        const sortedEncounters = encounters.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        console.log("subscribeToEncounters - Rencontres triées:", sortedEncounters.length);

        // Appeler le callback avec les données mises à jour
        // Validation Zod pour chaque rencontre
        const validatedEncounters = sortedEncounters.filter(enc => {
          const result = EncounterSchema.safeParse(enc);
          if (!result.success) {
            console.warn(`[Validation] Rencontre ${enc.id} invalide:`, result.error.format());
            // Optionnel: On pourrait essayer de réparer ici, mais pour l'instant on garde l'objet
            // si on veut éviter le crash. Ou on le filtre ?
            // Le plan disait "Safe Fallback". Comme on a déjà construit l'objet avec des valeurs par défaut
            // dans le code ci-dessus, il devrait être proche du valide.
            // Si le schéma a des défauts (z.default), safeParse va retourner un objet corrigé !
            return true;
          }
          return true;
        }).map(enc => {
          const result = EncounterSchema.safeParse(enc);
          if (result.success) return result.data;
          return enc; // Fallback 'best effort'
        });

        callback(validatedEncounters);
      },
      (error) => {
        console.error("subscribeToEncounters - Erreur dans onSnapshot:", error);
        if (errorCallback) errorCallback(error);
      }
    );

    // Retourner la fonction pour se désabonner quand nécessaire
    return unsubscribe;
  } catch (error) {
    console.error("Erreur lors de l'abonnement aux rencontres:", error);
    if (errorCallback) errorCallback(error);
    return () => { }; // Retourner une fonction vide en cas d'erreur
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

    // Préparer les données à sauvegarder
    const { party, participants, monsters, ...restData } = encounterData;

    // Vérifier si les participants contiennent des données cycliques et les nettoyer
    const cleanParticipants = participants ? participants.map(participant => {
      // Créer une copie sans propriétés problématiques pour Firestore
      const { actions, traits, reactions, legendaryActionsList, ...cleanParticipant } = participant;

      // Convertir les actions, traits, reactions et legendaryActions en format sérialisable
      return {
        ...cleanParticipant,
        actions: actions ? actions.map(a => ({
          name: a.name || '',
          desc: a.desc || a.description || ''
        })) : [],
        traits: traits ? traits.map(t => ({
          name: t.name || '',
          desc: t.desc || t.description || ''
        })) : [],
        reactions: reactions ? reactions.map(r => ({
          name: r.name || '',
          desc: r.desc || r.description || ''
        })) : [],
        legendaryActionsList: legendaryActionsList ? legendaryActionsList.map(l => ({
          name: l.name || '',
          desc: l.desc || l.description || ''
        })) : []
      };
    }) : [];

    // Nettoyer et préparer les monstres
    const cleanMonsters = monsters ? monsters.map(({ monster, quantity }) => {
      // Preserve ALL monster properties (actions, traits, reactions, etc.)
      // Only clean potential circular references in nested objects
      const cleanedMonster = { ...monster };

      // Clean actions/traits/reactions if they exist to ensure Firestore compatibility
      if (cleanedMonster.actions) {
        cleanedMonster.actions = cleanedMonster.actions.map((a: any) => ({
          name: a.name || '',
          desc: a.desc || a.description || ''
        }));
      }
      if (cleanedMonster.traits) {
        cleanedMonster.traits = cleanedMonster.traits.map((t: any) => ({
          name: t.name || '',
          desc: t.desc || t.description || ''
        }));
      }
      if (cleanedMonster.reactions) {
        cleanedMonster.reactions = cleanedMonster.reactions.map((r: any) => ({
          name: r.name || '',
          desc: r.desc || r.description || ''
        }));
      }
      if (cleanedMonster.legendaryActions) {
        cleanedMonster.legendaryActions = cleanedMonster.legendaryActions.map((l: any) => ({
          name: l.name || '',
          desc: l.desc || l.description || ''
        }));
      }

      return {
        monster: cleanedMonster,
        quantity
      };
    }) : [];

    // Préparer les données du groupe
    const cleanParty = party ? {
      id: party.id,
      name: party.name,
      players: party.players.map(p => ({
        id: p.id,
        name: p.name,
        level: p.level,
        characterClass: p.characterClass,
        ac: p.ac || 10,
        currentHp: p.currentHp || 10,
        maxHp: p.maxHp || 10
      }))
    } : null;

    const now = serverTimestamp();

    // Nettoyer toutes les valeurs undefined
    const cleanData = (obj: any): any => {
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

    const data = cleanData({
      ...restData,
      monsters: cleanMonsters,
      participants: cleanParticipants,
      party: cleanParty,
      createdAt: now,
      updatedAt: now
    });

    const docRef = await addDoc(encountersRef, data);

    // Mettre à jour les statistiques de l'utilisateur avec setDoc pour gérer le cas où le document n'existe pas
    await setDoc(userRef, {
      stats: { encounters: increment(1) }
    }, { merge: true });

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

    // Mettre à jour les statistiques de l'utilisateur avec setDoc pour éviter les crashs
    await setDoc(userRef, {
      stats: { encounters: increment(-1) }
    }, { merge: true });

    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la rencontre:", error);
    throw error;
  }
};

// Mettre à jour une rencontre existante dans Firestore
export const updateFirestoreEncounter = async (
  encounterId: string,
  updates: Partial<Omit<Encounter, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Encounter | null> => {
  try {
    const user = getCurrentUser();
    const encounterRef = doc(db, 'users', user.uid, 'encounters', encounterId);

    // Vérifier si la rencontre existe déjà
    const encounterDoc = await getDoc(encounterRef);

    // Préparer les données à mettre à jour
    const { party, participants, monsters, ...restUpdates } = updates;

    // Vérifier si les participants contiennent des données cycliques et les nettoyer
    const cleanParticipants = participants ? participants.map(participant => {
      // Créer une copie sans propriétés problématiques pour Firestore
      const { actions, traits, reactions, legendaryActionsList, ...cleanParticipant } = participant;

      // Convertir les actions, traits, reactions et legendaryActions en format sérialisable
      return {
        ...cleanParticipant,
        actions: actions ? actions.map(a => ({
          name: a.name || '',
          desc: a.desc || a.description || ''
        })) : [],
        traits: traits ? traits.map(t => ({
          name: t.name || '',
          desc: t.desc || t.description || ''
        })) : [],
        reactions: reactions ? reactions.map(r => ({
          name: r.name || '',
          desc: r.desc || r.description || ''
        })) : [],
        legendaryActionsList: legendaryActionsList ? legendaryActionsList.map(l => ({
          name: l.name || '',
          desc: l.desc || l.description || ''
        })) : []
      };
    }) : undefined;

    // Nettoyer et préparer les monstres
    const cleanMonsters = monsters ? monsters.map(({ monster, quantity }) => {
      // Preserve ALL monster properties (actions, traits, reactions, etc.)
      // Only clean potential circular references in nested objects
      const cleanedMonster = { ...monster };

      // Clean actions/traits/reactions if they exist to ensure Firestore compatibility
      if (cleanedMonster.actions) {
        cleanedMonster.actions = cleanedMonster.actions.map((a: any) => ({
          name: a.name || '',
          desc: a.desc || a.description || ''
        }));
      }
      if (cleanedMonster.traits) {
        cleanedMonster.traits = cleanedMonster.traits.map((t: any) => ({
          name: t.name || '',
          desc: t.desc || t.description || ''
        }));
      }
      if (cleanedMonster.reactions) {
        cleanedMonster.reactions = cleanedMonster.reactions.map((r: any) => ({
          name: r.name || '',
          desc: r.desc || r.description || ''
        }));
      }
      if (cleanedMonster.legendaryActions) {
        cleanedMonster.legendaryActions = cleanedMonster.legendaryActions.map((l: any) => ({
          name: l.name || '',
          desc: l.desc || l.description || ''
        }));
      }

      return {
        monster: cleanedMonster,
        quantity
      };
    }) : undefined;

    // Préparer les données du groupe
    const cleanParty = party ? {
      id: party.id,
      name: party.name,
      players: party.players.map(p => ({
        id: p.id,
        name: p.name,
        level: p.level,
        characterClass: p.characterClass,
        ac: p.ac || 10,
        currentHp: p.currentHp || 10,
        maxHp: p.maxHp || 10
      }))
    } : undefined;

    const now = serverTimestamp();

    // Nettoyer toutes les valeurs undefined (utiliser la même fonction que dans saveEncounter)
    const cleanData = (obj: any): any => {
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

    const updateData: any = {
      ...restUpdates,
      updatedAt: now
    };

    // N'ajouter les champs que s'ils sont définis
    if (cleanParticipants) updateData.participants = cleanParticipants;
    if (cleanMonsters) updateData.monsters = cleanMonsters;
    if (cleanParty) updateData.party = cleanParty;

    // Nettoyer les données avant l'envoi
    const cleanedUpdateData = cleanData(updateData);

    if (encounterDoc.exists()) {
      // Mise à jour d'une rencontre existante
      await updateDoc(encounterRef, cleanedUpdateData);
    } else {
      // Création d'une nouvelle rencontre
      cleanedUpdateData.createdAt = now;
      await setDoc(encounterRef, cleanedUpdateData);

      // Mettre à jour les statistiques de l'utilisateur avec setDoc pour éviter les crashs
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        stats: { encounters: increment(1) }
      }, { merge: true });
    }

    // Récupérer les données mises à jour
    const updatedDoc = await getDoc(encounterRef);
    if (!updatedDoc.exists()) {
      throw new Error("Erreur: Impossible de récupérer la rencontre après mise à jour");
    }

    const data = updatedDoc.data();

    return {
      id: encounterId,
      name: data.name,
      description: data.description || '',
      environment: data.environment || '',
      monsters: data.monsters || [],
      participants: data.participants || [],
      party: data.party || null,
      difficulty: data.difficulty || 'medium',
      totalXP: data.totalXP || 0,
      adjustedXP: data.adjustedXP || 0,
      partyId: data.partyId,
      status: data.status || 'draft',
      round: data.round || 0,
      currentTurn: data.currentTurn || 0,
      isActive: data.isActive || false,
      folderId: data.folderId || null,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la rencontre dans Firestore:", error);
    throw error;
  }
};

// Maintenir la fonction originale pour la compatibilité
export const updateEncounter = async (
  encounterId: string,
  updates: Partial<Omit<Encounter, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Encounter | null> => {
  try {
    return await updateFirestoreEncounter(encounterId, updates);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la rencontre:", error);
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

// Fonction pour initialiser des monstres de test
export const initializeTestMonsters = async (): Promise<void> => {
  try {
    const user = getCurrentUser();
    const monstersCollection = collection(db, 'monsters'); // Collection globale

    // Quelques monstres de base pour tester
    const testMonsters = [
      {
        name: 'Gobelin',
        cr: 0.25,
        xp: 50,
        type: 'humanoïde',
        size: 'P',
        source: 'Manuel des Monstres',
        environment: ['forêt', 'montagne', 'souterrain'],
        legendary: false,
        alignment: 'neutre mauvais',
        ac: 15,
        hp: 7,
        createdBy: user.uid
      },
      {
        name: 'Troll',
        cr: 5,
        xp: 1800,
        type: 'géant',
        size: 'G',
        source: 'Manuel des Monstres',
        environment: ['forêt', 'montagne', 'marais'],
        legendary: false,
        alignment: 'chaotique mauvais',
        ac: 15,
        hp: 84,
        createdBy: user.uid
      },
      {
        name: 'Dragon rouge adulte',
        cr: 17,
        xp: 18000,
        type: 'dragon',
        size: 'TG',
        source: 'Manuel des Monstres',
        environment: ['montagne', 'volcan'],
        legendary: true,
        alignment: 'chaotique mauvais',
        ac: 19,
        hp: 256,
        createdBy: user.uid
      }
    ];

    // Ajouter chaque monstre à la collection globale
    for (const monster of testMonsters) {
      await addDoc(monstersCollection, {
        ...monster,
        createdAt: serverTimestamp()
      });
    }

    console.log('Monstres de test ajoutés avec succès');
    return;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des monstres de test:', error);
    throw error;
  }
};

// Modifier la fonction subscribeToMonsters pour utiliser la collection globale
export const subscribeToMonsters = (
  callback: (monsters: Monster[]) => void,
  errorCallback?: (error: any) => void
): (() => void) => {
  try {
    const user = getCurrentUser();
    // Utiliser la collection globale de monstres au lieu d'une sous-collection utilisateur
    const monstersRef = collection(db, 'monsters');

    // Créer un écouteur qui se déclenche à chaque changement dans la collection
    const unsubscribe = onSnapshot(
      monstersRef,
      (snapshot) => {
        const monsters: Monster[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          monsters.push({
            id: doc.id,
            name: data.name,
            cr: data.cr || 0,
            xp: data.xp || calculateXPFromCR(data.cr || 0),
            type: data.type || 'unknown',
            size: data.size || 'M',
            source: data.source || 'custom',
            environment: data.environment || [],
            legendary: data.legendary || false,
            alignment: data.alignment || 'non-aligné',
            ac: data.ac || 10,
            hp: data.hp || 10,
            custom: data.custom || true
          });
        });

        // Appeler le callback avec les données mises à jour
        callback(monsters);
      },
      (error) => {
        console.error("Erreur lors de l'abonnement aux monstres:", error);
        // Appeler le callback d'erreur si fourni
        if (errorCallback) {
          errorCallback(error);
        }
      }
    );

    // Retourner la fonction pour se désabonner quand nécessaire
    return unsubscribe;
  } catch (error) {
    console.error("Erreur lors de l'abonnement aux monstres:", error);
    // Appeler le callback d'erreur si fourni
    if (errorCallback) {
      errorCallback(error);
    }
    return () => { }; // Retourner une fonction vide en cas d'erreur
  }
};

// Fonction pour calculer l'XP en fonction du CR
export const calculateXPFromCR = (cr: number): number => {
  const crToXP: Record<number | string, number> = {
    0: 10,
    '1/8': 25,
    0.125: 25,
    '1/4': 50,
    0.25: 50,
    '1/2': 100,
    0.5: 100,
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900,
    11: 7200,
    12: 8400,
    13: 10000,
    14: 11500,
    15: 13000,
    16: 15000,
    17: 18000,
    18: 20000,
    19: 22000,
    20: 25000,
    21: 33000,
    22: 41000,
    23: 50000,
    24: 62000,
    25: 75000,
    26: 90000,
    27: 105000,
    28: 120000,
    29: 135000,
    30: 155000
  };

  return crToXP[cr] || 0;
};

// ====== API pour les dossiers de rencontres ======

// Récupérer tous les dossiers de l'utilisateur
export const getFolders = async (): Promise<EncounterFolder[]> => {
  try {
    const user = getCurrentUser();
    const foldersRef = collection(db, 'users', user.uid, 'folders');
    const querySnapshot = await getDocs(foldersRef);

    const folders: EncounterFolder[] = [];
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      folders.push({
        id: docSnap.id,
        name: data.name,
        color: data.color,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });

    return folders.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Erreur lors de la récupération des dossiers:", error);
    throw error;
  }
};

// Écouter les changements des dossiers en temps réel
export const subscribeToFolders = (
  callback: (folders: EncounterFolder[]) => void,
  errorCallback?: (error: any) => void
): (() => void) => {
  try {
    const user = getCurrentUser();
    const foldersRef = collection(db, 'users', user.uid, 'folders');

    const unsubscribe = onSnapshot(
      foldersRef,
      (snapshot) => {
        const folders: EncounterFolder[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          folders.push({
            id: docSnap.id,
            name: data.name,
            color: data.color,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
          });
        });

        callback(folders.sort((a, b) => a.name.localeCompare(b.name)));
      },
      (error) => {
        console.error("Erreur dans onSnapshot (dossiers):", error);
        if (errorCallback) errorCallback(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Erreur lors de l'abonnement aux dossiers:", error);
    if (errorCallback) errorCallback(error);
    return () => { };
  }
};

// Créer un nouveau dossier
export const createFolder = async (name: string, color?: string): Promise<EncounterFolder> => {
  try {
    const user = getCurrentUser();
    const foldersRef = collection(db, 'users', user.uid, 'folders');

    const now = serverTimestamp();
    const folderData = {
      name,
      color: color || null,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(foldersRef, folderData);

    return {
      id: docRef.id,
      name,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erreur lors de la création du dossier:", error);
    throw error;
  }
};

// Mettre à jour un dossier
export const updateFolder = async (
  folderId: string,
  updates: Partial<Omit<EncounterFolder, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<EncounterFolder> => {
  try {
    const user = getCurrentUser();
    const folderRef = doc(db, 'users', user.uid, 'folders', folderId);

    const folderDoc = await getDoc(folderRef);
    if (!folderDoc.exists()) {
      throw new Error("Dossier non trouvé");
    }

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(folderRef, updateData);

    const data = folderDoc.data();
    return {
      id: folderId,
      name: updates.name || data.name,
      color: updates.color !== undefined ? updates.color : data.color,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du dossier:", error);
    throw error;
  }
};

// Supprimer un dossier (les rencontres ne sont pas supprimées, juste leur folderId est retiré)
export const deleteFolder = async (folderId: string): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    const folderRef = doc(db, 'users', user.uid, 'folders', folderId);

    // Récupérer toutes les rencontres de ce dossier et retirer leur folderId
    const encountersRef = collection(db, 'users', user.uid, 'encounters');
    const q = query(encountersRef, where('folderId', '==', folderId));
    const encountersSnapshot = await getDocs(q);

    // Retirer le folderId de chaque rencontre
    const updatePromises = encountersSnapshot.docs.map(docSnap =>
      updateDoc(doc(db, 'users', user.uid, 'encounters', docSnap.id), {
        folderId: null,
        updatedAt: serverTimestamp()
      })
    );

    await Promise.all(updatePromises);

    // Supprimer le dossier
    await deleteDoc(folderRef);

    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression du dossier:", error);
    throw error;
  }
};

// Déplacer une rencontre vers un dossier
export const moveEncounterToFolder = async (encounterId: string, folderId: string | null): Promise<void> => {
  try {
    const user = getCurrentUser();
    const encounterRef = doc(db, 'users', user.uid, 'encounters', encounterId);

    await updateDoc(encounterRef, {
      folderId: folderId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Erreur lors du déplacement de la rencontre:", error);
    throw error;
  }
};



// ====== API pour les Monstres Personnalisés ======

// Récupérer les monstres personnalisés
export const getCustomMonsters = async (): Promise<any[]> => {
  try {
    const user = getCurrentUser();
    const monstersRef = collection(db, 'users', user.uid, 'monsters');
    const q = query(monstersRef);

    const querySnapshot = await getDocs(q);
    const monsters: any[] = [];

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      monsters.push({
        ...data,
        id: docSnap.id,
        custom: true,
        source: 'Custom'
      });
    });

    return monsters;
  } catch (error) {
    console.error("Erreur lors de la récupération des monstres:", error);
    return [];
  }
};

// Écouter les changements des monstres personnalisés
export const subscribeToCustomMonsters = (
  callback: (monsters: any[]) => void,
  errorCallback?: (error: any) => void
): (() => void) => {
  try {
    const user = getCurrentUser();
    const monstersRef = collection(db, 'users', user.uid, 'monsters');

    const unsubscribe = onSnapshot(
      monstersRef,
      (snapshot) => {
        const monsters: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          monsters.push({
            ...data,
            id: doc.id,
            custom: true,
            source: 'Custom'
          });
        });
        callback(monsters);
      },
      (error) => {
        console.error("Erreur d'abonnement aux monstres:", error);
        if (errorCallback) errorCallback(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Erreur lors de la mise en place de l'abonnement monstres:", error);
    if (errorCallback) errorCallback(error);
    return () => { };
  }
};

// Sauvegarder un monstre personnalisé
export const saveCustomMonsterCloud = async (monsterData: any): Promise<void> => {
  try {
    const user = getCurrentUser();

    // Nettoyage des données
    const { id, custom, source, ...dataToSave } = monsterData;
    const cleanedData = cleanData(dataToSave);

    const monsterRef = doc(db, 'users', user.uid, 'monsters', id || monsterData.id);

    await setDoc(monsterRef, {
      ...cleanedData,
      updatedAt: serverTimestamp(),
      createdAt: monsterData.createdAt || serverTimestamp()
    }, { merge: true });

  } catch (error) {
    console.error("Erreur lors de la sauvegarde du monstre:", error);
    throw error;
  }
};

// Supprimer un monstre personnalisé
export const deleteCustomMonsterCloud = async (monsterId: string): Promise<void> => {
  try {
    const user = getCurrentUser();
    const monsterRef = doc(db, 'users', user.uid, 'monsters', monsterId);

    await deleteDoc(monsterRef);
  } catch (error) {
    console.error("Erreur lors de la suppression du monstre:", error);
    throw error;
  }
}; 