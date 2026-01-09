import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './use-toast';
import { Encounter as EncounterType, EncounterParticipant, UrlMapping, MonsterNameMapping } from '../lib/types';
import { updateFirestoreEncounter, updatePlayer } from '../lib/firebaseApi';
import { useDnDBeyondLive } from '../hooks/useDnDBeyondLive';
import {
    extractNumericHP,
    getConditionInfo,
    estimateDexModifier,
    calculateMovementSpeed,
    getAideDDMonsterSlug,
    // getAideDDMonsterName, // Not used directly logic-wise? Used by getAideDDMonsterSlug implicitly? No explicit export?
    createGenericMonster,
    getAideDDMonsterName
} from '../lib/EncounterUtils';
// fetchMonsterFromAideDD aliased as getMonsterFromAideDD in component
import { fetchMonsterFromAideDD as getMonsterFromAideDD } from '../lib/api';

export const useEncounterManager = () => {
    const { encounterId } = useParams<{ encounterId?: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();

    // --- State ---
    const [encounter, setEncounter] = useState<{
        name: string;
        participants: EncounterParticipant[];
        currentTurn: number;
        round: number;
        party?: { id: string; name: string };
    }>({
        name: 'Rencontre',
        participants: [],
        currentTurn: 0,
        round: 1
    });

    const [isLoadingEncounter, setIsLoadingEncounter] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [quickInitiativeMode, setQuickInitiativeMode] = useState<boolean>(false);
    const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

    // Maps
    const [monsterNameMap, setMonsterNameMap] = useState<MonsterNameMapping>({});
    const [urlMap, setUrlMap] = useState<UrlMapping>({});

    // Monster Details / Iframe
    const [monsterDetails, setMonsterDetails] = useState<Record<string, any>>({});
    const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
    const [currentMonsterDetails, setCurrentMonsterDetails] = useState<any>(null);
    const [selectedCreatureUrl, setSelectedCreatureUrl] = useState<string | null>(null);
    const [showCreatureFrame, setShowCreatureFrame] = useState<boolean>(false);

    // --- Computed ---
    const sortedParticipants = useMemo(() => {
        return [...encounter.participants].sort((a, b) => b.initiative - a.initiative);
    }, [encounter.participants]);

    // --- Effects ---

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
                                round: parsed.round || 1
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
                toast({ title: "Erreur", description: "Echec du chargement.", variant: "destructive" });
            }
        };
        loadData();
    }, [encounterId]);

    // Auto-load monster data on add OR if data is missing (Heal corrupted data)
    useEffect(() => {
        const monsterParticipants = encounter.participants.filter(p => !p.isPC);
        if (monsterParticipants.length > 0) {
            // Check for defaults OR missing actions (corrupted save)
            // Note: Check for empty arrays too, as Zod/Serialization might have left them as []
            const needsUpdate = monsterParticipants.filter(p =>
                (p.maxHp === 10 && p.ac === 10) ||
                ((!p.actions || p.actions.length === 0) && (!p.traits || p.traits.length === 0) && p.name !== 'Monstre')
            );

            if (needsUpdate.length > 0) {
                console.log("Healing/Loading monster data for:", needsUpdate.map(p => p.name));
                const loadData = async () => {
                    for (const p of needsUpdate) await loadRealMonsterData(p.id);
                };
                loadData();
            }
        }
    }, [encounter.participants.length, encounter.participants]); // Added dependency on participants content deep check effectively

    // D&D Beyond Sync
    useDnDBeyondLive({
        participants: encounter.participants,
        onUpdateHp: (id, currentHp, maxHp) => {
            setEncounter(prev => ({
                ...prev,
                participants: prev.participants.map(p => p.id === id ? { ...p, currentHp, maxHp } : p)
            }));
        },
        enabled: true
    });

    // --- Auto-Save Mechanism (Retention Strategy) ---
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
                    const all = JSON.parse(localStorage.getItem('dnd_encounters') || '[]');
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
                        round: encounter.round
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
                            return p;
                        });
                    }

                    // Only recreate participants if none exist AND we have source data
                    if (participants.length === 0 && data.monsters && syncedParty) {
                        console.log("[loadSavedEncounter] No participants found, creating from monsters and party");
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
                            level: player.level,
                            race: player.race,
                            class: player.characterClass,
                            // Extended
                            str: player.str, dex: player.dex, con: player.con, int: player.int, wis: player.wis, cha: player.cha, speed: player.speed
                        } as EncounterParticipant));

                        const monsterParticipants = data.monsters.flatMap(({ monster, quantity }) =>
                            Array.from({ length: quantity }, (_, idx) => ({
                                id: `monster-${monster.id}-${idx}`,
                                name: monster.name,
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
                        name: data.name,
                        participants,
                        currentTurn: data.currentTurn || 0,
                        round: data.round || 1,
                        party: syncedParty
                    });
                    toast({ title: "Chargée", description: "Rencontre chargée et synchronisée." });
                } else {
                    throw new Error("Introuvable (Firestore)");
                }
            } else {
                // LocalStorage
                const savedEncounters = JSON.parse(localStorage.getItem('dnd_encounters') || '[]');
                const found = savedEncounters.find((e: any) => e.id === encounterId);
                // Also check specific key
                const specific = localStorage.getItem(`encounter_${encounterId}`);
                const data = specific ? JSON.parse(specific) : found;

                if (data) {
                    let participants = data.participants || [];

                    // Heal/Sync existing participants with party stats (Local/Session)
                    if (participants.length > 0 && data.party && data.party.players) {
                        participants = participants.map((p: any) => {
                            if (p.isPC) {
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
                            return p;
                        });
                    }
                    if (participants.length === 0 && data.monsters && data.party) {
                        // Same init logic... (can extract to helper?)
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
                            level: player.level,
                            race: player.race,
                            class: player.characterClass,
                            // Extended
                            str: player.str, dex: player.dex, con: player.con, int: player.int, wis: player.wis, cha: player.cha, speed: player.speed
                        } as EncounterParticipant));

                        const monsterParticipants = data.monsters.flatMap(({ monster, quantity }: any) =>
                            Array.from({ length: quantity }, (_, idx) => ({
                                id: `monster-${monster.id}-${idx}`,
                                name: monster.name,
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
                        participants: participants.map((p: any) => ({
                            ...p,
                            currentHp: extractNumericHP(p.currentHp),
                            maxHp: extractNumericHP(p.maxHp)
                        })),
                        currentTurn: data.currentTurn || 0,
                        round: data.round || 1,
                        party: data.party ? { id: data.party.id, name: data.party.name } : undefined
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

    const findMonsterDetails = async (name: string, forceRefresh = false) => {
        try {
            const res = await getMonsterFromAideDD(name /*, forceRefresh - API doesn't seem to take forceRefresh in import? check later */);
            return res;
        } catch (e) {
            return null;
        }
    };

    const loadRealMonsterData = async (participantId: string) => {
        const p = encounter.participants.find(x => x.id === participantId);
        if (!p || p.isPC) return;

        const details = await findMonsterDetails(p.name);
        console.log(`[loadRealMonsterData] Got details for ${p.name}:`, {
            hasActions: !!details?.actions && details.actions.length > 0,
            hasTraits: !!details?.traits && details.traits.length > 0,
            hasReactions: !!details?.reactions && details.reactions.length > 0,
            hasLegendary: !!details?.legendaryActions && details.legendaryActions.length > 0,
        });
        if (details && details.hp) {
            let realMaxHp = 10;
            if (typeof details.hp === 'string') {
                const m = details.hp.match(/^(\d+)/);
                if (m) realMaxHp = parseInt(m[1], 10);
            } else if (typeof details.hp === 'number') realMaxHp = details.hp;

            let realAC = p.ac;
            if (details.ac) { // handling ac string/number
                if (typeof details.ac === 'string') {
                    const m = details.ac.match(/(\d+)/);
                    if (m) realAC = parseInt(m[1], 10);
                } else if (typeof details.ac === 'number') realAC = details.ac;
            }

            setEncounter(prev => ({
                ...prev,
                participants: prev.participants.map(part => part.id === participantId ? {
                    ...part,
                    maxHp: realMaxHp,
                    currentHp: part.currentHp === 10 ? realMaxHp : part.currentHp,
                    ac: realAC,
                    str: details.str, dex: details.dex, con: details.con, int: details.int, wis: details.wis, cha: details.cha,
                    // Extended details for StatBlock
                    speed: details.speed,
                    savingThrows: details.savingThrows,
                    skills: details.skills,
                    damageResistances: details.damageResistances,
                    damageImmunities: details.damageImmunities,
                    damageVulnerabilities: details.damageVulnerabilities,
                    conditionImmunities: details.conditionImmunities,
                    senses: details.senses,
                    languages: details.languages,
                    challengeRating: details.challengeRating || details.cr,
                    xp: details.xp,
                    // Lists
                    actions: details.actions || [],
                    traits: details.traits || [],
                    reactions: details.reactions || [],
                    legendaryActionsList: details.legendaryActions || [],
                    image: details.image // Copy image url
                } : part)
            }));
        }
    };

    // Actions implementation
    const updateHp = (id: string, amount: number) => {
        setEncounter(prev => ({
            ...prev,
            participants: prev.participants.map(p => {
                if (p.id !== id) return p;

                const currentNumeric = typeof p.currentHp === 'string'
                    ? extractNumericHP(p.currentHp)
                    : p.currentHp;

                // Allow going above maxHp (healing beyond max) as requested
                // Only clamp to 0 for lower bound? User said "inflict and heal damage (even beyond its maximum life)".
                // Usually D&D doesn't go below 0 (unconscious), but maybe they want to track negative?
                // "inflict and heal... even beyond max" suggests unlimited upper bound.
                // Standard behavior is max(0, newHp).

                const newHp = Math.max(0, currentNumeric + amount);

                return {
                    ...p,
                    currentHp: newHp
                };
            })
        }));
    };

    const nextTurn = () => {
        if (sortedParticipants.length === 0) return;
        let nextIndex = encounter.currentTurn;
        let newRound = encounter.round;
        if (newRound === 1 && nextIndex === 0) {
            // Init actions
            setEncounter(prev => ({ ...prev, participants: prev.participants.map(p => ({ ...p, hasUsedAction: false, hasUsedBonusAction: false, hasUsedReaction: false, remainingMovement: calculateMovementSpeed(p) })) }));
        }

        let checked = 0;
        do {
            nextIndex = (nextIndex + 1) % sortedParticipants.length;
            checked++;
            if (nextIndex === 0) newRound++;
            if (checked > sortedParticipants.length) return; // All dead
        } while (sortedParticipants[nextIndex].currentHp <= 0);

        const nextId = sortedParticipants[nextIndex].id;
        // reset actions for next
        setEncounter(prev => ({
            ...prev,
            currentTurn: nextIndex,
            round: newRound,
            participants: prev.participants.map(p => p.id === nextId ? {
                ...p, hasUsedAction: false, hasUsedBonusAction: false, hasUsedReaction: false, remainingMovement: calculateMovementSpeed(p)
            } : p)
        }));
        setSelectedParticipantId(null);
        // Iframe logic
        const active = sortedParticipants[nextIndex];
        if (!active.isPC) openCreatureFrame(active.id);
        else { setShowCreatureFrame(false); setSelectedCreatureUrl(null); }
    };

    const previousTurn = () => {
        if (sortedParticipants.length === 0) return;
        let prevIndex = encounter.currentTurn;
        let newRound = encounter.round;
        let checked = 0;
        do {
            prevIndex = prevIndex === 0 ? sortedParticipants.length - 1 : prevIndex - 1;
            checked++;
            if (prevIndex === sortedParticipants.length - 1 && newRound > 1) newRound--;
            if (checked > sortedParticipants.length) return;
        } while (sortedParticipants[prevIndex].currentHp <= 0);

        // Reset actions for prev? Logic in original was "Reset actions of PREVIOUS participant" which is confusing, it presumably meant "Start of turn Logic for the participant we landed on"?
        // Original code: resetActionsForParticipant(prevParticipantId). Yes.
        const prevId = sortedParticipants[prevIndex].id;
        setEncounter(prev => ({
            ...prev,
            currentTurn: prevIndex,
            round: newRound,
            participants: prev.participants.map(p => p.id === prevId ? {
                ...p, hasUsedAction: false, hasUsedBonusAction: false, hasUsedReaction: false, remainingMovement: calculateMovementSpeed(p)
            } : p)
        }));
        setSelectedParticipantId(null);
        const active = sortedParticipants[prevIndex];
        if (!active.isPC) openCreatureFrame(active.id);
        else { setShowCreatureFrame(false); setSelectedCreatureUrl(null); }
    };

    const rollInitiativeForAll = () => {
        if (!encounter.participants) return;
        const updated = encounter.participants.map(p => {
            if (p.isPC) return { ...p, initiative: p.initiative || 0, initiativeModifier: p.initiativeModifier || 0 };
            const mod = p.dex ? Math.floor((p.dex - 10) / 2) : 0;
            return { ...p, initiative: Math.floor(Math.random() * 20) + 1 + mod, initiativeModifier: mod };
        });
        // Sort
        updated.sort((a, b) => {
            if (b.initiative !== a.initiative) return b.initiative - a.initiative;
            const aDex = a.dex ? Math.floor((a.dex - 10) / 2) : 0;
            const bDex = b.dex ? Math.floor((b.dex - 10) / 2) : 0;
            return bDex - aDex;
        });
        setEncounter(prev => ({ ...prev, participants: updated, currentTurn: 0 }));
        toast({ title: "Initiative lancée", description: "Ordre mis à jour." });
    };

    const openCreatureFrame = async (id: string) => {
        const p = encounter.participants.find(x => x.id === id);
        if (!p || p.isPC) return;
        const slug = getAideDDMonsterSlug(p.name, urlMap);
        setSelectedCreatureUrl(`https://www.aidedd.org/dnd/monstres.php?vf=${slug}`);
        setShowCreatureFrame(true);
        // also load details
        await loadMonsterOnDemand(id);
    };

    const loadMonsterOnDemand = async (id: string) => {
        setLoadingDetails(true);
        const p = encounter.participants.find(x => x.id === id);
        if (!p) { setLoadingDetails(false); return; }
        const details = await findMonsterDetails(p.name, true);
        if (details) {
            setCurrentMonsterDetails(details);
            // Update participant stats
            setEncounter(prev => ({
                ...prev,
                participants: prev.participants.map(part => part.id === id ? {
                    ...part,
                    ac: details.ac || part.ac, maxHp: details.hp || part.maxHp,
                    str: details.str, dex: details.dex, con: details.con, int: details.int, wis: details.wis, cha: details.cha,
                    speed: details.speed,
                    savingThrows: details.savingThrows,
                    skills: details.skills,
                    damageResistances: details.damageResistances,
                    damageImmunities: details.damageImmunities,
                    damageVulnerabilities: details.damageVulnerabilities,
                    conditionImmunities: details.conditionImmunities,
                    senses: details.senses,
                    languages: details.languages,
                    challengeRating: details.challengeRating || details.cr,
                    xp: details.xp,
                    actions: details.actions || [],
                    traits: details.traits || [],
                    reactions: details.reactions || [],
                    legendaryActionsList: details.legendaryActions || [],
                    image: details.image
                } : part)
            }));
        } else {
            setCurrentMonsterDetails(createGenericMonster(p.name));
        }
        setLoadingDetails(false);
    };

    const resetEncounter = () => {
        setEncounter(prev => ({
            ...prev,
            currentTurn: 0,
            round: 1,
            participants: prev.participants.map(p => ({
                ...p, currentHp: p.maxHp, conditions: [], hasUsedAction: false, hasUsedBonusAction: false, hasUsedReaction: false, remainingMovement: calculateMovementSpeed(p)
            }))
        }));
        setShowCreatureFrame(false);
        setSelectedCreatureUrl(null);
    };

    const removeParticipant = (id: string) => {
        setEncounter(prev => ({ ...prev, participants: prev.participants.filter(p => p.id !== id) }));
    };

    const saveCurrentEncounterState = async () => {
        if (!isAuthenticated || !encounterId) return;
        setIsSaving(true);
        try {
            await updateFirestoreEncounter(encounterId, {
                name: encounter.name,
                participants: encounter.participants,
                currentTurn: encounter.currentTurn,
                round: encounter.round
            });
            toast({ title: "Sauvegardé", description: "Etat sauvegardé." });
        } catch (e) {
            toast({ title: "Erreur", description: "Echec sauvegarde.", variant: "destructive" });
        } finally { setIsSaving(false); }
    };

    const addPlayerCharacter = (newPC: { name: string, initiative: number, ac: number, hp: number }) => {
        const newP: EncounterParticipant = {
            id: `pc-${Date.now()}`,
            name: newPC.name,
            initiative: newPC.initiative,
            ac: newPC.ac,
            currentHp: newPC.hp,
            maxHp: newPC.hp,
            isPC: true,
            conditions: [],
            notes: '',
            initiativeModifier: 0, // default
            level: 1,
            // default monster props to satisfy interface
            cr: 0, type: 'Humanoïde', size: 'M',
            str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
        };
        setEncounter(prev => ({ ...prev, participants: [...prev.participants, newP] }));
    };

    const updateParticipant = (id: string, updates: Partial<EncounterParticipant>) => {
        setEncounter(prev => ({
            ...prev,
            participants: prev.participants.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
    };

    const moveParticipant = (id: string, direction: 'up' | 'down') => {
        const index = sortedParticipants.findIndex(p => p.id === id);
        if (index === -1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sortedParticipants.length) return;

        const target = sortedParticipants[targetIndex];
        const current = sortedParticipants[index];

        // Swap initiatives
        const newInitiativeCurrent = target.initiative;
        const newInitiativeTarget = current.initiative;

        const updated = encounter.participants.map(p => {
            if (p.id === current.id) return { ...p, initiative: newInitiativeCurrent };
            if (p.id === target.id) return { ...p, initiative: newInitiativeTarget };
            return p;
        });

        setEncounter(prev => ({ ...prev, participants: updated }));
    };

    return {
        encounter,
        setEncounter,
        sortedParticipants,
        isLoadingEncounter,
        isSaving,
        quickInitiativeMode,
        setQuickInitiativeMode,
        selectedParticipantId,
        setSelectedParticipantId,
        monsterDetails,
        loadingDetails,
        currentMonsterDetails,
        selectedCreatureUrl,
        showCreatureFrame,
        setShowCreatureFrame,
        grimoireOpen: false,
        actions: {
            updateHp,
            updateParticipant,
            nextTurn,
            previousTurn,
            rollInitiativeForAll,
            resetEncounter,
            removeParticipant,
            saveCurrentEncounterState,
            addPlayerCharacter,
            loadSavedEncounter,
            loadRealMonsterData,
            loadMonsterOnDemand,
            openCreatureFrame,
            moveParticipant
        }
    };
};
