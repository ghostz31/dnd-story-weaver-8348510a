import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './use-toast';
import { EncounterParticipant, UrlMapping, MonsterNameMapping } from '../lib/types';
import {
    createGenericMonster,
} from '../lib/EncounterUtils';
import { getAideDDMonsterSlug } from '../lib/monsterUtils';
// fetchMonsterFromAideDD aliased as getMonsterFromAideDD in component
import { fetchMonsterFromAideDD as getMonsterFromAideDD } from '../lib/api';
import type { EncounterState } from './encounter/types';
import { useCombatConditions } from './encounter/useCombatConditions';
import { useCombatLog } from './encounter/useCombatLog';
import { useCombatSync } from './encounter/useCombatSync';
import { useCombatTurn } from './encounter/useCombatTurn';
import { useCombatHP } from './encounter/useCombatHP';

export const useEncounterManager = () => {
    const { encounterId } = useParams<{ encounterId?: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();

    // --- State ---
    const [encounter, setEncounter] = useState<EncounterState>({
        name: 'Rencontre',
        participants: [],
        currentTurn: 0,
        round: 1,
        combatLog: [],
        folderId: undefined
    });

    const [isLoadingEncounter, setIsLoadingEncounter] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [quickInitiativeMode, setQuickInitiativeMode] = useState<boolean>(false);
    const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

    // Maps
    const [monsterNameMap, setMonsterNameMap] = useState<MonsterNameMapping>({});
    const [urlMap, setUrlMap] = useState<UrlMapping>({});

    // Monster Details / Iframe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [monsterDetails, setMonsterDetails] = useState<Record<string, any>>({});
    const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [currentMonsterDetails, setCurrentMonsterDetails] = useState<any>(null);
    const [selectedCreatureUrl, setSelectedCreatureUrl] = useState<string | null>(null);
    const [showCreatureFrame, setShowCreatureFrame] = useState<boolean>(false);

    // --- Computed ---
    const sortedParticipants = useMemo(() => {
        return [...encounter.participants].sort((a, b) => b.initiative - a.initiative);
    }, [encounter.participants]);

    // Ref stable pour accéder aux participants sans dépendance dans useCallback
    const participantsRef = useRef(encounter.participants);
    useEffect(() => {
        participantsRef.current = encounter.participants;
    }, [encounter.participants]);

    // --- Sub-hooks wiring ---
    const { notifyConcentrationCheck, decrementConditionDurations, notifyStartOfTurnConditions } = useCombatConditions({ toast });
    const { createLogEntry } = useCombatLog({ setEncounter });

    const { loadSavedEncounter, saveCurrentEncounterState } = useCombatSync({
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
    });

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

    const openCreatureFrame = async (id: string) => {
        const p = encounter.participants.find(x => x.id === id);
        if (!p || p.isPC) return;
        const slug = getAideDDMonsterSlug(p.name, urlMap);
        setSelectedCreatureUrl(`https://www.aidedd.org/dnd/monstres.php?vf=${slug}`);
        setShowCreatureFrame(true);
        // also load details
        await loadMonsterOnDemand(id);
    };

    const removeParticipant = (id: string) => {
        setEncounter(prev => ({ ...prev, participants: prev.participants.filter(p => p.id !== id) }));
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

    // --- Combat Turn ---
    const { nextTurn, previousTurn, rollInitiativeForAll, moveParticipant, resetEncounter } = useCombatTurn({
        encounter,
        setEncounter,
        sortedParticipants,
        toast,
        setSelectedParticipantId,
        setShowCreatureFrame,
        setSelectedCreatureUrl,
        openCreatureFrame,
        decrementConditionDurations,
        notifyStartOfTurnConditions,
        createLogEntry,
    });

    // --- Combat HP ---
    const { updateHp, updateHpBatch, updateParticipant } = useCombatHP({
        setEncounter,
        notifyConcentrationCheck,
        createLogEntry,
    });

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
            updateHpBatch,
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
