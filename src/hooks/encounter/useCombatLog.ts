import { v4 as uuid } from 'uuid';
import { CombatLogEntry } from '../../lib/types';
import type { EncounterSetter } from './types';

export const useCombatLog = ({ setEncounter }: { setEncounter: EncounterSetter }) => {
    const createLogEntry = (
        type: CombatLogEntry['type'],
        message: string,
        sourceId?: string,
        targetId?: string
    ): CombatLogEntry => {
        const entry: CombatLogEntry = {
            id: uuid(),
            timestamp: Date.now(),
            type,
            message
        };
        if (sourceId !== undefined) entry.sourceId = sourceId;
        if (targetId !== undefined) entry.targetId = targetId;
        return entry;
    };

    // Actions implementation
    const addLogEntry = (type: CombatLogEntry['type'], message: string, sourceId?: string, targetId?: string) => {
        const entry: CombatLogEntry = {
            id: uuid(),
            timestamp: Date.now(),
            type,
            message,
            sourceId,
            targetId
        };
        setEncounter(prev => ({
            ...prev,
            combatLog: [entry, ...prev.combatLog].slice(0, 100) // Limit to 100 entries
        }));
    };

    return { addLogEntry, createLogEntry };
};
