import { EncounterParticipant, EncounterCondition, CombatLogEntry } from '../../lib/types';
import { calculateMovementSpeed } from '../../lib/EncounterUtils';
import type { EncounterState, EncounterSetter, ToastFn } from './types';

interface UseCombatTurnParams {
    encounter: EncounterState;
    setEncounter: EncounterSetter;
    sortedParticipants: EncounterParticipant[];
    toast: ToastFn;
    setSelectedParticipantId: (id: string | null) => void;
    setShowCreatureFrame: (show: boolean) => void;
    setSelectedCreatureUrl: (url: string | null) => void;
    openCreatureFrame: (id: string) => Promise<void>;
    decrementConditionDurations: (conditions: EncounterCondition[]) => EncounterCondition[];
    notifyStartOfTurnConditions: (participant: EncounterParticipant) => void;
    createLogEntry: (type: CombatLogEntry['type'], message: string, sourceId?: string, targetId?: string) => CombatLogEntry;
}

export const useCombatTurn = ({
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
}: UseCombatTurnParams) => {
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
            if (checked > sortedParticipants.length) {
                // All participants are dead — signal to the UI
                setEncounter(prev => ({ ...prev, combatOver: true }));
                toast({
                    title: "Fin du combat",
                    description: "Tous les participants sont morts ou hors combat.",
                    variant: "destructive"
                });
                return;
            } // All dead
        } while (sortedParticipants[nextIndex].currentHp <= 0);

        const nextId = sortedParticipants[nextIndex].id;
        const nextParticipant = sortedParticipants[nextIndex];

        // --- Condition Notifications (Start of Turn) ---
        notifyStartOfTurnConditions(nextParticipant);

        // Log turn change
        const turnMsg = `Tour de ${sortedParticipants[nextIndex].name} (Round ${newRound})`;

        setEncounter(prev => {
            // Handle Condition Duration Decrement on Turn Start
            const participantWithDecrementedConditions = sortedParticipants[nextIndex];
            // Logic: Check existing participant in state, not sorted (which might be stale).
            // Actually, we should map over all.
            const updatedParticipants = prev.participants.map(p => {
                if (p.id === nextId) {
                    // Found the one starting turn
                    // Decrement conditions
                    const newConditions = decrementConditionDurations(p.conditions);

                    // Report expired?
                    const expired = p.conditions.filter(c => c.duration > 0).filter(c => c.duration - 1 === 0);
                    // We can't log easily inside map, but this simple logic handles removal.

                    return {
                        ...p,
                        hasUsedAction: false,
                        hasUsedBonusAction: false,
                        hasUsedReaction: false,
                        remainingMovement: calculateMovementSpeed(p),
                        conditions: newConditions
                    };
                }
                return p;
            });

            const entry = createLogEntry('turn', turnMsg, nextId);

            return {
                ...prev,
                currentTurn: nextIndex,
                round: newRound,
                participants: updatedParticipants,
                combatLog: [entry, ...prev.combatLog].slice(0, 100)
            };
        });

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

    return { nextTurn, previousTurn, rollInitiativeForAll, moveParticipant, resetEncounter };
};
