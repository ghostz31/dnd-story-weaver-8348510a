/* eslint-disable */
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  setDoc,
  getDocs,
  query
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Monster } from '../types';
import { cleanData, getCurrentUser } from './helpers';

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
