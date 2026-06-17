import { useEffect, useCallback, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Encounter as EncounterType, EncounterParticipant, UrlMapping, MonsterNameMapping } from '../../lib/types';
import type { User } from 'firebase/auth';
import { updateFirestoreEncounter, subscribeToParties } from '../../lib/firebaseApi';
import { useDnDBeyondLive } from '../useDnDBeyondLive';
import { useBesaceSync } from '../useBesaceSync';
import { extractNumericHP, migrateConditions } from '../../lib/EncounterUtils';
import type { EncounterState, EncounterSetter, ToastFn } from './types';

interface UseCombatSyncParams {
    encounter: EncounterState;
    setEncounter: EncounterSetter;
    encounterId?: string;
    isAuthenticated: boolean;
    user: User | null;
    toast: ToastFn;
    setIsLoadingEncounter: (v: boolean) => void;
    setIsSaving: (v: boolean) => void;
    setMonsterNameMap: (v: MonsterNameMapping) => void;
    setUrlMap: (v: UrlMapping) => void;
    participantsRef: MutableRefObject<EncounterParticipant[]>;
    notifyConcentrationCheck: (participant: EncounterParticipant, damageVal: number, source?: 'damage' | 'sync') => void;
}

export const useCombatSync = ({
    encounter,
    setEncounter,
    encounterId,
    isAuthenticated,
    user,
    toast,
    setIsLoadingEncounter,
    setIsSaving,
    setMonsterNameMap,
    setUrlMap,
    participantsRef,
    notifyConcentrationCheck,
}: UseCombatSyncParams) => {
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Callback stable pour éviter de reset le timer du hook à chaque rendu
    const handleDndBeyondUpdate = useCallback((id: string, updates: Partial<EncounterParticipant>) => {
        const participant = participantsRef.current.find(p => p.id === id);

        // Concentration Check (Side Effect outside of setter)
        if (participant && updates.currentHp !== undefined) {
            const oldHp = typeof participant.currentHp === 'string' ? extractNumericHP(participant.currentHp) : participant.currentHp;
            const newHpVal = typeof updates.currentHp === 'string' ? extractNumericHP(updates.currentHp) : updates.currentHp;

            if (newHpVal < oldHp) {
                notifyConcentrationCheck(participant, oldHp - newHpVal, 'sync');
            }
        }

        setEncounter(prev => ({
            ...prev,
            participants: prev.participants.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
    }, []);

    // Load Maps (Name Map & URL Map)
    useEffect(() => {
        // Load Name Map
        fetch('/data/aidedd-monster-name-mapping.json')
            .then(res => res.json())
            .then(data => setMonsterNameMap(data))
            .catch(err => console.error("Error loading name map", err));

        // Load URL Map
        fetch('/data/aidedd-monster-names.txt')
            .then(res => res.text())
            .then(data => {
                const lines = data.split('\n').filter(line => line.trim() !== '');
                const mappings: UrlMapping = {};
                lines.forEach(slug => {
                    const readableName = slug
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                        .replace(/([Gg])eant(e?)/g, '$1éant$2')
                        .replace(/([Ee])lementaire/g, '$1lémentaire')
                        .replace(/([Ee])veille/g, '$1veillé');
                    mappings[readableName] = slug;
                    const unaccented = readableName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    if (unaccented !== readableName) mappings[unaccented] = slug;
                });
                setUrlMap(mappings);
            })
            .catch(err => console.error("Error loading URL map", err));
    }, []);

    // Load Encounter Logic (Session or Firestore or LocalStorage)
    useEffect(() => {
        if (encounter.participants.length > 0) return;

        const loadData = async () => {
            // Delay for sessionStorage
            await new Promise(r => setTimeout(r, 500));

            const searchParams = new URLSearchParams(window.location.search);
            const source = searchParams.get('source');

            try {
                if (source === 'session') {
                    const sessionData = sessionStorage.getItem('current_encounter');
                    if (sessionData) {
                        const parsed = JSON.parse(sessionData);
                        if (parsed.participants?.length > 0) {
                            setEncounter({
                                name: parsed.name || "Rencontre",
                                participants: parsed.participants,
                                currentTurn: parsed.currentTurn || 0,
                                round: parsed.round || 1,
                                combatLog: parsed.combatLog || []
                            });
                            // Trust session data - do not force reload
                            // The useEffect for defaults will catch any default-only monsters if needed
                            toast({ title: "Rencontre chargée", description: `${parsed.name} chargée.` });
                            return;
                        }
                    } else {
                        toast({ title: "Erreur", description: "Aucune donnée de session.", variant: "destructive" });
                        return;
                    }
                } else if (encounterId) {
                    await loadSavedEncounter();
                    return;
                }
            } catch (e) {
                console.error("Error loading encounter", e);
                toast({ title: "Erreur", description: "Échec du chargement.", variant: "destructive" });
            }
        };
        loadData();
    }, [encounterId]);

    // D&D Beyond Sync
    useDnDBeyondLive({
        participants: encounter.participants,
        onUpdateHp: handleDndBeyondUpdate,
        enabled: true
    });

    // Besace Sync
    useBesaceSync({
        participants: encounter.participants,
        onUpdateParticipant: handleDndBeyondUpdate,
        enabled: true
    });

    // Real-time Party Synchronization
    // Subscribe to party changes and update player participants automatically
    useEffect(() => {
        if (!isAuthenticated || !encounter.party?.id) return;

        console.log(`[PartySync] Subscribing to party ${encounter.party.id} for real-time updates`);

        const unsubscribe = subscribeToParties(
            (parties) => {
                const currentParty = parties.find(p => p.id === encounter.party?.id);
                if (!currentParty) {
                    console.log('[PartySync] Party not found in subscription');
                    return;
                }

                console.log('[PartySync] Party updated, syncing player stats...');

                // Update player participants with latest party data
                setEncounter(prev => ({
                    ...prev,
                    participants: prev.participants.map(p => {
                        if (!p.isPC) return p;

                        // Find matching player in updated party
                        const player = currentParty.players.find(pl =>
                            pl.id === p.id.replace('pc-', '') || pl.name === p.name
                        );

                        if (player) {
                            console.log(`[PartySync] Updating ${p.name} with latest stats`);
                            return {
                                ...p,
                                // Sync all player stats
                                ac: player.ac || p.ac,
                                maxHp: player.maxHp || p.maxHp,
                                str: player.str,
                                dex: player.dex,
                                con: player.con,
                                int: player.int,
                                wis: player.wis,
                                cha: player.cha,
                                speed: player.speed,
                                race: player.race || p.race,
                                class: player.characterClass || p.class,
                                level: player.level || p.level,
                                proficiencies: player.proficiencies || p.proficiencies,
                                dndBeyondId: player.dndBeyondId || p.dndBeyondId,
                                besaceShareCode: player.besaceShareCode || p.besaceShareCode,
                                syncSource: player.syncSource || p.syncSource,
                                avatarUrl: player.avatarUrl || p.avatarUrl,
                                // Preserve existing local state if not synced (or sync if available)
                                conditions: p.conditions || [],
                                tempHp: p.tempHp || 0
                            };
                        }
                        return p;
                    })
                }));
            },
            (error) => {
                console.error('[PartySync] Subscription error:', error);
            }
        );

        return () => {
            console.log('[PartySync] Unsubscribing from party updates');
            unsubscribe();
        };
    }, [isAuthenticated, encounter.party?.id]);

    // --- Auto-Save Mechanism (Retention Strategy) ---
    useEffect(() => {
        // 1. Immediate Session/Local Save (Synchronous)
        // Helps with "Session Panic" - browser refresh recovery
        if (encounter.participants.length > 0) {
            const dataToSave = {
                id: encounterId, // Can be undefined for session
                name: encounter.name,
                participants: encounter.participants,
                currentTurn: encounter.currentTurn,
                round: encounter.round,
                party: encounter.party,
                combatLog: encounter.combatLog, // Save log
                updatedAt: new Date().toISOString()
            };

            // Session Storage (Temporary)
            sessionStorage.setItem('current_encounter', JSON.stringify(dataToSave));

            // Local Storage (Persistence)
            if (encounterId) {
                // Save specifics
                localStorage.setItem(`encounter_${encounterId}`, JSON.stringify(dataToSave));

                // Also update the main list if present (simplified)
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const all = JSON.parse(localStorage.getItem('dnd_encounters') || '[]');
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const idx = all.findIndex((e: any) => e.id === encounterId);
                    if (idx >= 0) {
                        all[idx] = { ...all[idx], ...dataToSave };
                        localStorage.setItem('dnd_encounters', JSON.stringify(all));
                    }
                } catch (e) {
                    console.error("Auto-save local list error", e);
                }
            }
        }

        // 2. Debounced Cloud Save (Firestore)
        // Only if authenticated and we have an ID
        if (isAuthenticated && encounterId) {
            if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

            autoSaveTimeoutRef.current = setTimeout(async () => {
                setIsSaving(true);
                try {
                    await updateFirestoreEncounter(encounterId, {
                        name: encounter.name,
                        participants: encounter.participants,
                        currentTurn: encounter.currentTurn,
                        round: encounter.round,
                        combatLog: encounter.combatLog
                    });
                    // Optional: Subtle toast or indicator? Maybe too noisy.
                    console.log("Auto-saved to Cloud");
                } catch (err) {
                    console.error("Auto-save Cloud failed", err);
                } finally {
                    setIsSaving(false);
                }
            }, 3000); // 3 seconds debounce
        }

        return () => {
            if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        };
    }, [encounter, encounterId, isAuthenticated]);

    // --- Actions ---

    // Load Saved Encounter (Firestore/LocalStorage)
    const loadSavedEncounter = async () => {
        if (!encounterId) return;
        setIsLoadingEncounter(true);
        try {
            if (isAuthenticated && user) {
                const docRef = doc(db, 'users', user.uid, 'encounters', encounterId);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data() as EncounterType;

                    // Sync with latest party data if available
                    let syncedParty = data.party;
                    if (data.party?.id) {
                        try {
                            const partyRef = doc(db, 'users', user.uid, 'parties', data.party.id);
                            const partySnap = await getDoc(partyRef);
                            if (partySnap.exists()) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                syncedParty = { id: partySnap.id, ...partySnap.data() } as any;
                                console.log("[loadSavedEncounter] Synced with latest party data");
                            }
                        } catch (e) {
                            console.warn("Could not sync party", e);
                        }
                    }

                    console.log("[loadSavedEncounter] Firestore data loaded:", {
                        hasParticipants: !!data.participants && data.participants.length > 0,
                        participantsCount: data.participants?.length || 0,
                        hasMonsters: !!data.monsters,
                        hasParty: !!syncedParty
                    });

                    let participants = data.participants || [];

                    // Heal/Sync existing participants with current party stats
                    if (participants.length > 0 && syncedParty && syncedParty.players) {
                        participants = participants.map(p => {
                            if (p.isPC) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const player = syncedParty.players?.find((pl: any) =>
                                    pl.id === p.id.replace('pc-', '') || pl.name === p.name
                                );
                                if (player) {
                                    return {
                                        ...p,
                                        str: player.str,
                                        dex: player.dex,
                                        con: player.con,
                                        int: player.int,
                                        wis: player.wis,
                                        cha: player.cha,
                                        speed: player.speed,
                                        race: player.race || p.race,
                                        class: player.characterClass || p.class,
                                        level: player.level || p.level
                                    };
                                }
                            }
                            return { ...p, conditions: migrateConditions(p.conditions) };
                        });
                    }

                    // Only recreate participants if none exist AND we have source data
                    if (participants.length === 0 && data.monsters && syncedParty) {
                        console.log("[loadSavedEncounter] No participants found, creating from monsters and party");
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const playerParticipants = (syncedParty.players || []).map((player: any) => ({
                            id: `pc-${player.id}`,
                            name: player.name,
                            initiative: Math.floor(Math.random() * 20) + 1,
                            ac: player.ac || 10,
                            currentHp: player.currentHp || player.maxHp || 10,
                            maxHp: player.maxHp || 10,
                            isPC: true,
                            conditions: [],
                            notes: '',
                            initiativeModifier: player.initiative,
                            dndBeyondId: player.dndBeyondId,
                            besaceShareCode: player.besaceShareCode,
                            syncSource: player.syncSource,
                            avatarUrl: player.avatarUrl,
                            level: player.level,
                            race: player.race,
                            class: player.characterClass,
                            // Extended
                            str: player.str, dex: player.dex, con: player.con, int: player.int, wis: player.wis, cha: player.cha, speed: player.speed
                        } as EncounterParticipant));

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const monsterParticipants = data.monsters.flatMap(({ monster, quantity }: any) =>
                            Array.from({ length: quantity }, (_, idx) => ({
                                id: `monster-${monster.id}-${idx}`,
                                name: `${monster.name} ${quantity > 1 ? String.fromCharCode(65 + idx) : ''}`.trim(),
                                initiative: Math.floor(Math.random() * 20) + 1,
                                ac: monster.ac || 10,
                                currentHp: monster.hp || 10,
                                maxHp: monster.hp || 10,
                                isPC: false,
                                conditions: [],
                                notes: "",
                                cr: monster.cr,
                                type: monster.type,
                                size: monster.size
                            } as EncounterParticipant))
                        );
                        participants = [...playerParticipants, ...monsterParticipants];
                    } else if (participants.length > 0) {
                        console.log("[loadSavedEncounter] Using existing participants with full data");
                    }
                    setEncounter({
                        id: encounterId,
                        name: data.name,
                        participants,
                        currentTurn: data.currentTurn || 0,
                        round: data.round || 1,
                        party: syncedParty,
                        combatLog: data.combatLog || [],
                        folderId: data.folderId
                    });
                    toast({ title: "Chargée", description: "Rencontre chargée et synchronisée." });
                } else {
                    throw new Error("Introuvable (Firestore)");
                }
            } else {
                // LocalStorage
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const savedEncounters = JSON.parse(localStorage.getItem('dnd_encounters') || '[]');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const found = savedEncounters.find((e: any) => e.id === encounterId);
                // Also check specific key
                const specific = localStorage.getItem(`encounter_${encounterId}`);
                const data = specific ? JSON.parse(specific) : found;

                if (data) {
                    let participants = data.participants || [];

                    // Heal/Sync existing participants with party stats (Local/Session)
                    if (participants.length > 0 && data.party && data.party.players) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        participants = participants.map((p: any) => {
                            if (p.isPC) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const player = data.party.players.find((pl: any) =>
                                    (pl.id && p.id.includes(pl.id)) || pl.name === p.name
                                );
                                if (player) {
                                    return {
                                        ...p,
                                        str: player.str,
                                        dex: player.dex,
                                        con: player.con,
                                        int: player.int,
                                        wis: player.wis,
                                        cha: player.cha,
                                        speed: player.speed,
                                        race: player.race || p.race,
                                        class: player.characterClass || p.class,
                                        level: player.level || p.level,
                                        proficiencies: player.proficiencies || p.proficiencies
                                    };
                                }
                            }
                            return { ...p, conditions: migrateConditions(p.conditions) };
                        });
                    }
                    if (participants.length === 0 && data.monsters && data.party) {
                        // Same init logic... (can extract to helper?)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const playerParticipants = (data.party.players || []).map((player: any) => ({
                            id: `pc-${player.id}`,
                            name: player.name,
                            initiative: Math.floor(Math.random() * 20) + 1,
                            ac: player.ac || 10,
                            currentHp: extractNumericHP(player.currentHp || player.maxHp || 10),
                            maxHp: extractNumericHP(player.maxHp || 10),
                            isPC: true,
                            conditions: [],
                            notes: '',
                            initiativeModifier: player.initiative,
                            dndBeyondId: player.dndBeyondId,
                            besaceShareCode: player.besaceShareCode,
                            syncSource: player.syncSource,
                            avatarUrl: player.avatarUrl,
                            level: player.level,
                            race: player.race,
                            class: player.characterClass,
                            // Extended
                            str: player.str, dex: player.dex, con: player.con, int: player.int, wis: player.wis, cha: player.cha, speed: player.speed
                        } as EncounterParticipant));

                        const monsterParticipants = data.monsters.flatMap(({ monster, quantity }: any) =>
                            Array.from({ length: quantity }, (_, idx) => ({
                                id: `monster-${monster.id}-${idx}`,
                                name: `${monster.name} ${quantity > 1 ? String.fromCharCode(65 + idx) : ''}`.trim(),
                                initiative: Math.floor(Math.random() * 20) + 1,
                                ac: monster.ac || 10,
                                currentHp: extractNumericHP(monster.hp || 10),
                                maxHp: extractNumericHP(monster.hp || 10),
                                isPC: false,
                                conditions: [],
                                notes: "",
                                cr: monster.cr,
                                type: monster.type,
                                size: monster.size
                            } as EncounterParticipant))
                        );
                        participants = [...playerParticipants, ...monsterParticipants];
                    }

                    setEncounter({
                        name: data.name,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        participants: participants.map((p: any) => ({
                            ...p,
                            currentHp: extractNumericHP(p.currentHp),
                            maxHp: extractNumericHP(p.maxHp)
                        })),
                        currentTurn: data.currentTurn || 0,
                        round: data.round || 1,
                        party: data.party ? { id: data.party.id, name: data.party.name } : undefined,
                        combatLog: data.combatLog || []
                    });
                    toast({ title: "Chargée", description: "Rencontre locale chargée." });
                } else {
                    throw new Error("Introuvable (Local)");
                }
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Erreur", description: "Impossible de charger.", variant: "destructive" });
        } finally {
            setIsLoadingEncounter(false);
        }
    };

    const saveCurrentEncounterState = async () => {
        if (!isAuthenticated || !encounterId) return;
        setIsSaving(true);
        try {
            await updateFirestoreEncounter(encounterId, {
                name: encounter.name,
                participants: encounter.participants,
                currentTurn: encounter.currentTurn,
                round: encounter.round,
                combatLog: encounter.combatLog
            });
            toast({ title: "Sauvegardé", description: "État sauvegardé." });
        } catch (e) {
            toast({ title: "Erreur", description: "Échec de la sauvegarde.", variant: "destructive" });
        } finally { setIsSaving(false); }
    };

    return { loadSavedEncounter, saveCurrentEncounterState };
};
