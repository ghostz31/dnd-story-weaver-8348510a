import { db } from './firebase'
import {
    collection,
    query,
    getDocs,
    orderBy,
    deleteDoc,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    serverTimestamp,
    type DocumentData,
} from 'firebase/firestore'
import { testStore } from './testStore'

const isTestMode = import.meta.env.VITE_TEST_MODE === 'true'

export interface CharacterSummary {
    id: string
    name: string
    race: { name: string }
    characterClass: { name: string; id: string }
    level: number
    hp: number | { current: number; max: number; temp: number }
    avatarUrl?: string
    createdAt?: unknown
    updatedAt?: unknown
}

function generateId(): string {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const dataStore = {
    /** Récupère tous les personnages d'un utilisateur */
    async getAllCharacters(userId: string): Promise<CharacterSummary[]> {
        if (isTestMode) {
            const chars = testStore.getAll()
            return chars.map(c => ({
                id: c.id,
                ...c.data,
            })) as CharacterSummary[]
        }

        const q = query(
            collection(db, 'users', userId, 'characters'),
            orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        return snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
        })) as CharacterSummary[]
    },

    /** Récupère un personnage par ID */
    async getCharacter(userId: string, characterId: string): Promise<DocumentData | null> {
        if (isTestMode) {
            const stored = testStore.getById(characterId)
            return stored ? stored.data : null
        }

        const snap = await getDoc(doc(db, 'users', userId, 'characters', characterId))
        return snap.exists() ? snap.data() : null
    },

    /** Crée un nouveau personnage */
    async createCharacter(userId: string, data: Record<string, unknown>): Promise<string> {
        if (isTestMode) {
            const id = generateId()
            const charData = {
                id,
                name: data.name || 'Personnage',
                race: data.race,
                characterClass: data.characterClass,
                level: data.level || 1,
                hp: data.hp || 10,
                avatarUrl: data.avatarUrl || '',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                ...data,
            }
            testStore.add(id, charData)
            return id
        }

        const docRef = await addDoc(collection(db, 'users', userId, 'characters'), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        })
        return docRef.id
    },

    /** Met à jour un personnage */
    async updateCharacter(userId: string, characterId: string, data: Record<string, unknown>): Promise<void> {
        if (isTestMode) {
            testStore.update(characterId, { ...data, updatedAt: Date.now() })
            return
        }

        await updateDoc(doc(db, 'users', userId, 'characters', characterId), {
            ...data,
            updatedAt: serverTimestamp(),
        })
    },

    /** Supprime un personnage */
    async deleteCharacter(userId: string, characterId: string): Promise<void> {
        if (isTestMode) {
            testStore.delete(characterId)
            return
        }

        await deleteDoc(doc(db, 'users', userId, 'characters', characterId))
    },

    /** Vérifie si on est en mode test */
    isTestMode(): boolean {
        return isTestMode
    },
}
