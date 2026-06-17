import { useEffect, useRef, useMemo, useCallback } from 'react';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { EncounterParticipant } from '../lib/types';
import { toast } from '@/hooks/use-toast';

interface AbilityScoreMap {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
}

interface EquipmentSummaryItem {
    name: string;
    type: string;
    equipped: boolean;
    attuned: boolean;
    rarity?: string;
    acBonus?: number;
    attackBonus?: number;
    damageBonus?: number;
    abilityBonus?: Partial<AbilityScoreMap>;
    saveBonus?: number;
}

interface CombatState {
    characterId: string;
    characterName: string;
    race: string;
    className: string;
    level: number;
    currentHp: number;
    maxHp: number;
    tempHp: number;
    ac: number;
    conditions: string[];
    deathSaves: { successes: number; failures: number };
    hitDiceUsed: number;
    hitDiceMax: number;
    hitDieSize: number;
    spellSlotsUsed: number[];
    spellSlotsMax: number[];
    avatarUrl?: string;
abilityScores?: AbilityScoreMap;
    abilityModifiers?: AbilityScoreMap;
    proficiencyBonus?: number;
    speed?: number;
    savingThrows?: string[];
    equipmentSummary?: EquipmentSummaryItem[];
}

interface TrameCommand {
    id: string;
    type: 'updateTempHp' | 'addCondition' | 'removeCondition' | 'updateLevel' | 'updateHp' | 'addInspiration';
    payload: Record<string, unknown>;
    timestamp: number;
    processed?: boolean;
}

function shallowEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const keysA = Object.keys(aObj);
    const keysB = Object.keys(bObj);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => aObj[key] === bObj[key]);
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((item, idx) => shallowEqual(item, b[idx]));
}

interface PendingLocalChange {
    currentHp?: number;
    maxHp?: number;
    tempHp?: number;
    conditions?: string[];
    timestamp: number;
}

export async function pushTrameCommand(shareCode: string, command: Omit<TrameCommand, 'id' | 'timestamp'>): Promise<void> {
    const { doc: docFn, updateDoc, serverTimestamp, arrayUnion } = await import('firebase/firestore');
    const docRef = docFn(db, 'shared_characters', shareCode);
    const commandWithMeta: TrameCommand = {
        ...command,
        id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: Date.now(),
        processed: false,
    };
    await updateDoc(docRef, {
        trameCommands: arrayUnion(commandWithMeta),
        updatedAt: serverTimestamp(),
    });
}

export function registerLocalChange(shareCode: string, change: Omit<PendingLocalChange, 'timestamp'>) {
    if (!_localChangeRegistry[shareCode]) {
        _localChangeRegistry[shareCode] = [];
    }
    _localChangeRegistry[shareCode].push({ ...change, timestamp: Date.now() });
    // Clean up entries older than 5 seconds
    const now = Date.now();
    _localChangeRegistry[shareCode] = _localChangeRegistry[shareCode].filter(c => now - c.timestamp < 5000);
}

const _localChangeRegistry: Record<string, PendingLocalChange[]> = {};

interface UseBesaceSyncProps {
    participants: EncounterParticipant[];
    onUpdateParticipant: (id: string, updates: Partial<EncounterParticipant>) => void;
    enabled: boolean;
}

export const useBesaceSync = ({ participants, onUpdateParticipant, enabled }: UseBesaceSyncProps) => {
    const subscriptionsRef = useRef<Record<string, Unsubscribe>>({});
    const lastStateRef = useRef<Record<string, CombatState>>({});
    const participantMapRef = useRef<Record<string, EncounterParticipant>>({});
    const onUpdateRef = useRef(onUpdateParticipant);
    onUpdateRef.current = onUpdateParticipant;
    const pendingUpdatesRef = useRef<Record<string, Partial<EncounterParticipant>>>({});
    const debounceTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const tracked = useMemo(
        () => participants.filter(p => p.besaceShareCode && p.isPC),
        [participants]
    );

    const trackedShareCodes = useMemo(
        () => tracked.map(p => p.besaceShareCode!).join(','),
        [tracked]
    );

    const flushUpdates = useCallback((participantId: string) => {
        const updates = pendingUpdatesRef.current[participantId];
        if (updates && Object.keys(updates).length > 0) {
            onUpdateRef.current(participantId, updates);
            delete pendingUpdatesRef.current[participantId];
        }
    }, []);

    // Update participant map on every render
    participantMapRef.current = {};
    for (const p of participants) {
        if (p.besaceShareCode && p.isPC) {
            participantMapRef.current[p.besaceShareCode] = p;
        }
    }

    useEffect(() => {
        if (!enabled) {
            Object.values(subscriptionsRef.current).forEach(unsub => unsub());
            subscriptionsRef.current = {};
            return;
        }

        const tracked = participants.filter(p => p.besaceShareCode && p.isPC);
        const currentCodes = new Set(tracked.map(p => p.besaceShareCode!));
        const subscribedCodes = new Set(Object.keys(subscriptionsRef.current));

        for (const code of subscribedCodes) {
            if (!currentCodes.has(code)) {
                subscriptionsRef.current[code]();
                delete subscriptionsRef.current[code];
                delete lastStateRef.current[code];
            }
        }

        for (const participant of tracked) {
            const shareCode = participant.besaceShareCode!;

            if (subscriptionsRef.current[shareCode]) continue;

            const docRef = doc(db, 'shared_characters', shareCode);
            const unsubscribe = onSnapshot(docRef, (snap) => {
                if (!snap.exists()) return;

                const data = snap.data() as CombatState;
                if (data.active === false) return;

                // Anti-loop: check if a very recent local change matches (within 2s)
                const localChanges = _localChangeRegistry[shareCode];
                if (localChanges && localChanges.length > 0) {
                    const latestLocal = localChanges[localChanges.length - 1];
                    const age = Date.now() - latestLocal.timestamp;
                    let isLocalEcho = false;

                    if (age < 2000) {
                        if (latestLocal.currentHp !== undefined && data.currentHp === latestLocal.currentHp) {
                            isLocalEcho = true;
                        }
                        if (latestLocal.tempHp !== undefined && data.tempHp === latestLocal.tempHp) {
                            isLocalEcho = true;
                        }
                    }
                    if (isLocalEcho) {
                        // Update lastState but don't push to React state to avoid loops
                        lastStateRef.current[shareCode] = data;
                        return;
                    }
                }

                const lastState = lastStateRef.current[shareCode];
                lastStateRef.current[shareCode] = data;

                // Look up current participant from ref (avoids stale closure)
                const currentParticipant = participantMapRef.current[shareCode] || participant;

                if (!lastState) {
                    onUpdateRef.current(currentParticipant.id, {
                        currentHp: data.currentHp,
                        maxHp: data.maxHp,
                        tempHp: data.tempHp,
                        ac: data.ac,
                        conditions: data.conditions.map(name => ({
                            id: name.toLowerCase().replace(/\s+/g, '-'),
                            name,
                            duration: -1,
                        })),
                        deathSaves: data.deathSaves,
                        name: data.characterName || currentParticipant.name,
                        race: data.race || currentParticipant.race,
                        class: data.className || currentParticipant.class,
                        level: data.level || currentParticipant.level,
                        avatarUrl: data.avatarUrl || currentParticipant.avatarUrl,
                        image: data.avatarUrl || currentParticipant.image,
                        str: data.abilityScores?.str ?? currentParticipant.str ?? 10,
                        dex: data.abilityScores?.dex ?? currentParticipant.dex ?? 10,
                        con: data.abilityScores?.con ?? currentParticipant.con ?? 10,
                        int: data.abilityScores?.int ?? currentParticipant.int ?? 10,
                        wis: data.abilityScores?.wis ?? currentParticipant.wis ?? 10,
                        cha: data.abilityScores?.cha ?? currentParticipant.cha ?? 10,
                        abilityScores: data.abilityScores ? {
                            str: data.abilityScores.str,
                            dex: data.abilityScores.dex,
                            con: data.abilityScores.con,
                            int: data.abilityScores.int,
                            wis: data.abilityScores.wis,
                            cha: data.abilityScores.cha,
                        } : currentParticipant.str !== undefined ? {
                            str: currentParticipant.str,
                            dex: currentParticipant.dex || 10,
                            con: currentParticipant.con || 10,
                            int: currentParticipant.int || 10,
                            wis: currentParticipant.wis || 10,
                            cha: currentParticipant.cha || 10,
                        } : undefined,
                        proficiencyBonus: data.proficiencyBonus,
                        speed: data.speed,
                        savingThrowProficiencies: data.savingThrows,
                        abilityModifiers: data.abilityModifiers,
                        equipmentSummary: data.equipmentSummary,
                    });
                    return;
                }

                const updates: Partial<EncounterParticipant> = {};

                if (data.currentHp !== lastState.currentHp || data.maxHp !== lastState.maxHp) {
                    updates.currentHp = data.currentHp;
                    updates.maxHp = data.maxHp;
                }
                if (data.tempHp !== lastState.tempHp) {
                    updates.tempHp = data.tempHp;
                }
                if (data.ac !== lastState.ac) {
                    updates.ac = data.ac;
                }
                if (!arraysEqual(data.conditions, lastState.conditions)) {
                    updates.conditions = data.conditions.map(name => ({
                        id: name.toLowerCase().replace(/\s+/g, '-'),
                        name,
                        duration: -1,
                    }));
                }
                if (!shallowEqual(data.deathSaves, lastState.deathSaves)) {
                    updates.deathSaves = data.deathSaves;
                }
                if (data.avatarUrl !== lastState.avatarUrl) {
                    updates.avatarUrl = data.avatarUrl;
                    updates.image = data.avatarUrl;
                }
                if (data.abilityScores && !shallowEqual(data.abilityScores, lastState.abilityScores)) {
                    updates.abilityScores = data.abilityScores;
                    updates.str = data.abilityScores.str;
                    updates.dex = data.abilityScores.dex;
                    updates.con = data.abilityScores.con;
                    updates.int = data.abilityScores.int;
                    updates.wis = data.abilityScores.wis;
                    updates.cha = data.abilityScores.cha;
                }
                if (data.abilityModifiers && !shallowEqual(data.abilityModifiers, lastState.abilityModifiers)) {
                    updates.abilityModifiers = data.abilityModifiers;
                }
                if (data.proficiencyBonus !== undefined && data.proficiencyBonus !== lastState.proficiencyBonus) {
                    updates.proficiencyBonus = data.proficiencyBonus;
                }
                if (data.speed !== undefined && data.speed !== lastState.speed) {
                    updates.speed = data.speed ? [`${data.speed}m`] : currentParticipant.speed;
                }
                if (data.savingThrows && !arraysEqual(data.savingThrows, lastState.savingThrows || [])) {
                    updates.savingThrowProficiencies = data.savingThrows;
                }
                if (data.equipmentSummary && !arraysEqual(data.equipmentSummary, lastState.equipmentSummary || [])) {
                    updates.equipmentSummary = data.equipmentSummary;
                }

                if (Object.keys(updates).length > 0) {
                    pendingUpdatesRef.current[currentParticipant.id] = {
                        ...(pendingUpdatesRef.current[currentParticipant.id] || {}),
                        ...updates,
                    };
                    if (debounceTimerRef.current[currentParticipant.id]) {
                        clearTimeout(debounceTimerRef.current[currentParticipant.id]);
                    }
                    debounceTimerRef.current[currentParticipant.id] = setTimeout(() => {
                        flushUpdates(currentParticipant.id);
                    }, 100);
                }
            }, (error) => {
                console.error(`Besace sync error for ${shareCode}:`, error);
                toast({
                    title: "Erreur de synchronisation",
                    description: `Impossible de synchroniser ${participant.name} depuis Besace.`,
                    variant: "destructive",
                });
            });

            subscriptionsRef.current[shareCode] = unsubscribe;

            toast({
                title: "Synchronisation Besace active",
                description: `${participant.name} est synchronisé(e) en temps réel.`,
            });
        }

        // Don't unsubscribe on every render — only when codes change
        // The cleanup function only runs when codes actually differ
    }, [enabled, trackedShareCodes, flushUpdates]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(subscriptionsRef.current).forEach(unsub => unsub());
            Object.values(debounceTimerRef.current).forEach(timer => clearTimeout(timer));
        };
    }, []);
};