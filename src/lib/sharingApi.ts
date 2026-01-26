/**
 * API de partage pour les rencontres et monstres custom
 * Permet de partager des rencontres via lien et de les importer
 */

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { Encounter, Monster, EncounterFolder } from './types';

// Types pour le partage
export interface SharedEncounter extends Omit<Encounter, 'id'> {
    id: string;
    ownerId: string;
    ownerName?: string;
    shareCode: string;
    isPublic: boolean;
    copiedCount: number;
    sharedAt: string;
}

export interface SharedMonster extends Omit<Monster, 'id'> {
    id: string;
    ownerId: string;
    ownerName?: string;
    shareCode: string;
    isPublic: boolean;
    copiedCount: number;
    sharedAt: string;
}

// Générer un code de partage unique (8 caractères)
const generateShareCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Évite les caractères ambigus (0, O, I, 1, L)
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Obtenir l'utilisateur courant
const getCurrentUser = () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Utilisateur non connecté');
    return user;
};

// Helper pour nettoyer les données récursivement (supprimer undefined)
const cleanData = <T>(data: T): T => {
    return JSON.parse(JSON.stringify(data));
};

// ====== Partage de Rencontres ======

/**
 * Partager une rencontre et obtenir un code de partage
 */
export const shareEncounter = async (encounterId: string): Promise<string> => {
    try {
        const user = getCurrentUser();

        // Récupérer la rencontre originale
        const encounterRef = doc(db, 'users', user.uid, 'encounters', encounterId);
        const encounterDoc = await getDoc(encounterRef);

        if (!encounterDoc.exists()) {
            throw new Error('Rencontre non trouvée');
        }

        const encounterData = encounterDoc.data();

        // Vérifier si cette rencontre est déjà partagée
        const sharedRef = collection(db, 'shared_encounters');
        const existingQuery = query(
            sharedRef,
            where('ownerId', '==', user.uid),
            where('originalId', '==', encounterId)
        );
        const existingDocs = await getDocs(existingQuery);

        if (!existingDocs.empty) {
            // Retourner le code existant
            return existingDocs.docs[0].data().shareCode;
        }

        // Générer un nouveau code unique
        let shareCode = generateShareCode();
        let codeExists = true;

        while (codeExists) {
            const codeQuery = query(sharedRef, where('shareCode', '==', shareCode));
            const codeCheck = await getDocs(codeQuery);
            if (codeCheck.empty) {
                codeExists = false;
            } else {
                shareCode = generateShareCode();
            }
        }

        // Créer l'entrée de partage
        // On nettoie d'abord les données pour éviter les undefined
        const cleanEncounterData = cleanData({
            ...encounterData,
            originalId: encounterId,
            ownerId: user.uid,
            ownerName: user.displayName || 'Utilisateur',
            shareCode,
            isPublic: true,
            copiedCount: 0,
            custom: false // Explicite
        });

        const sharedData = {
            ...cleanEncounterData,
            sharedAt: serverTimestamp()
        };



        await addDoc(sharedRef, sharedData);

        return shareCode;
    } catch (error) {
        console.error('Erreur lors du partage de la rencontre:', error);
        throw error;
    }
};

/**
 * Récupérer une rencontre partagée par son code
 */
export const getSharedEncounter = async (shareCode: string): Promise<SharedEncounter | null> => {
    try {
        const sharedRef = collection(db, 'shared_encounters');
        const q = query(sharedRef, where('shareCode', '==', shareCode.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();

        return {
            id: doc.id,
            ownerId: data.ownerId,
            ownerName: data.ownerName,
            shareCode: data.shareCode,
            isPublic: data.isPublic,
            copiedCount: data.copiedCount || 0,
            sharedAt: data.sharedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            name: data.name,
            description: data.description,
            environment: data.environment,
            monsters: data.monsters || [],
            participants: data.participants || [],
            party: data.party,
            partyId: data.partyId,
            difficulty: data.difficulty,
            totalXP: data.totalXP,
            adjustedXP: data.adjustedXP,
            status: 'draft',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as SharedEncounter;
    } catch (error) {
        console.error('Erreur lors de la récupération de la rencontre partagée:', error);
        throw error;
    }
};

/**
 * Copier une rencontre partagée dans son propre compte
 */
export const copySharedEncounter = async (shareCode: string, folderId?: string): Promise<Encounter | null> => {
    try {
        const user = getCurrentUser();

        // Récupérer la rencontre partagée
        const sharedEncounter = await getSharedEncounter(shareCode);
        if (!sharedEncounter) {
            throw new Error('Rencontre partagée non trouvée');
        }

        // Créer une copie dans le compte de l'utilisateur
        const encountersRef = collection(db, 'users', user.uid, 'encounters');

        const baseEncounter = {
            name: `${sharedEncounter.name} (copie)`,
            description: sharedEncounter.description || '',
            environment: sharedEncounter.environment || [],
            monsters: sharedEncounter.monsters || [],
            participants: [],
            party: null,
            partyId: null,
            difficulty: sharedEncounter.difficulty || '',
            totalXP: sharedEncounter.totalXP || 0,
            adjustedXP: sharedEncounter.adjustedXP || 0,
            status: 'draft',
            folderId: folderId || null
        };

        // Nettoyer toutes les données (supprime les undefined récursivement)
        const cleanEncounter = cleanData(baseEncounter);

        const newEncounter = {
            ...cleanEncounter,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(encountersRef, newEncounter);

        // Incrémenter le compteur de copies
        const sharedRef = collection(db, 'shared_encounters');
        const q = query(sharedRef, where('shareCode', '==', shareCode.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const sharedDocRef = querySnapshot.docs[0].ref;
            await updateDoc(sharedDocRef, {
                copiedCount: increment(1)
            });
        }

        return {
            id: docRef.id,
            ...newEncounter,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as Encounter;
    } catch (error) {
        console.error('Erreur lors de la copie de la rencontre:', error);
        throw error;
    }
};

/**
 * Générer l'URL de partage
 */
export const getShareUrl = (shareCode: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/shared/${shareCode}`;
};

// ====== Partage de Monstres Custom ======

/**
 * Partager un monstre custom
 */
export const shareMonster = async (monster: Monster): Promise<string> => {
    try {
        const user = getCurrentUser();

        // Vérifier si ce monstre est déjà partagé
        const sharedRef = collection(db, 'shared_monsters');
        const existingQuery = query(
            sharedRef,
            where('ownerId', '==', user.uid),
            where('originalName', '==', monster.name)
        );
        const existingDocs = await getDocs(existingQuery);

        if (!existingDocs.empty) {
            return existingDocs.docs[0].data().shareCode;
        }

        // Générer un code unique
        let shareCode = generateShareCode();
        let codeExists = true;

        while (codeExists) {
            const codeQuery = query(sharedRef, where('shareCode', '==', shareCode));
            const codeCheck = await getDocs(codeQuery);
            if (codeCheck.empty) {
                codeExists = false;
            } else {
                shareCode = generateShareCode();
            }
        }

        // Créer l'entrée de partage
        const { id, ...monsterData } = monster;

        const cleanMonsterData = cleanData({
            ...monsterData,
            originalName: monster.name,
            ownerId: user.uid,
            ownerName: user.displayName || 'Utilisateur',
            shareCode,
            isPublic: true,
            copiedCount: 0,
            custom: true
        });

        const sharedData = {
            ...cleanMonsterData,
            sharedAt: serverTimestamp()
        };

        await addDoc(sharedRef, sharedData);

        return shareCode;
    } catch (error) {
        console.error('Erreur lors du partage du monstre:', error);
        throw error;
    }
};

/**
 * Récupérer un monstre partagé par son code
 */
export const getSharedMonster = async (shareCode: string): Promise<SharedMonster | null> => {
    try {
        const sharedRef = collection(db, 'shared_monsters');
        const q = query(sharedRef, where('shareCode', '==', shareCode.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();

        return {
            id: docSnap.id,
            ...data,
            sharedAt: data.sharedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as SharedMonster;
    } catch (error) {
        console.error('Erreur lors de la récupération du monstre partagé:', error);
        throw error;
    }
};

/**
 * Copier un monstre partagé (l'ajouter à sa collection locale)
 */
export const copySharedMonster = async (shareCode: string): Promise<Monster | null> => {
    try {
        const sharedMonster = await getSharedMonster(shareCode);
        if (!sharedMonster) {
            throw new Error('Monstre partagé non trouvé');
        }

        // Incrémenter le compteur
        const sharedRef = collection(db, 'shared_monsters');
        const q = query(sharedRef, where('shareCode', '==', shareCode.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            await updateDoc(querySnapshot.docs[0].ref, {
                copiedCount: increment(1)
            });
        }

        // Retourner le monstre (la sauvegarde locale se fait côté composant)
        const { ownerId, ownerName, shareCode: _, isPublic, copiedCount, sharedAt, ...monsterData } = sharedMonster;

        return {
            ...monsterData,
            id: `custom-${Date.now()}`,
            name: `${sharedMonster.name} (copie)`,
            custom: true
        } as Monster;
    } catch (error) {
        console.error('Erreur lors de la copie du monstre:', error);
        throw error;
    }
};
