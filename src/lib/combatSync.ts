import { db } from './firebase'
import { doc, setDoc, updateDoc, serverTimestamp, onSnapshot, arrayUnion, getDoc, type Unsubscribe } from 'firebase/firestore'
import {
  type CombatState,
  type TrameCommand,
  type SharedCharacterDocument,
  MAX_ATTUNED_SLOTS,
  generateShareCode,
} from '@trame-besace/shared-types'

// Re-export pour compatibilité des importants existants
export type { CombatState, TrameCommand, AbilityScoreMap, EquipmentSummaryItem } from '@trame-besace/shared-types'
export { MAX_ATTUNED_SLOTS, generateShareCode }

function stripUndefined(obj: unknown): unknown {
    if (Array.isArray(obj)) return obj.map(stripUndefined)
    if (obj && typeof obj === 'object') {
        const cleaned: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            if (value !== undefined) {
                cleaned[key] = stripUndefined(value)
            }
        }
        return cleaned
    }
    return obj
}

export async function publishCombatState(shareCode: string, state: Omit<CombatState, 'updatedAt'>): Promise<void> {
    const docRef = doc(db, 'shared_characters', shareCode)
    const cleanState = stripUndefined(state) as Record<string, unknown>
    await setDoc(docRef, {
        ...cleanState,
        updatedAt: serverTimestamp(),
    }, { merge: true })
}

export async function unpublishCombatState(shareCode: string): Promise<void> {
    const docRef = doc(db, 'shared_characters', shareCode)
    await setDoc(docRef, {
        characterId: '',
        characterName: '',
        active: false,
        updatedAt: serverTimestamp(),
    }, { merge: true })
}

export function subscribeToCombatState(
    shareCode: string,
    callback: (state: CombatState | null) => void
): Unsubscribe {
    const docRef = doc(db, 'shared_characters', shareCode)
    return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            const data = snap.data()
            if (data.active !== false && data.characterId) {
                callback(data as CombatState)
            } else {
                callback(null)
            }
        } else {
            callback(null)
        }
    })
}

export async function pushTrameCommand(shareCode: string, command: Omit<TrameCommand, 'id' | 'timestamp'>): Promise<void> {
    const docRef = doc(db, 'shared_characters', shareCode)
    const commandWithMeta: TrameCommand = {
        ...command,
        id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: Date.now(),
        processed: false,
    }
    await updateDoc(docRef, {
        trameCommands: arrayUnion(commandWithMeta),
        updatedAt: serverTimestamp(),
    })
}

export async function clearTrameCommands(shareCode: string, commandIds: string[]): Promise<void> {
    const docRef = doc(db, 'shared_characters', shareCode)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
        const data = snap.data()
        const remaining = (data.trameCommands || []).filter(
            (cmd: TrameCommand) => !commandIds.includes(cmd.id)
        )
        await updateDoc(docRef, {
            trameCommands: remaining,
            updatedAt: serverTimestamp(),
        })
    }
}

export function subscribeToTrameCommands(
    shareCode: string,
    callback: (commands: TrameCommand[]) => void
): Unsubscribe {
    const docRef = doc(db, 'shared_characters', shareCode)
    return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            const data = snap.data()
            const commands: TrameCommand[] = (data.trameCommands || []).filter(
                (cmd: TrameCommand) => !cmd.processed
            )
            callback(commands)
        } else {
            callback([])
        }
    })
}