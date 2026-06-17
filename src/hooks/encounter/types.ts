import type { Dispatch, SetStateAction } from 'react';
import type { EncounterParticipant, CombatLogEntry } from '../../lib/types';

export interface EncounterState {
    id?: string;
    name: string;
    participants: EncounterParticipant[];
    currentTurn: number;
    round: number;
    party?: { id: string; name: string };
    combatLog: CombatLogEntry[];
    folderId?: string;
}

export type EncounterSetter = Dispatch<SetStateAction<EncounterState>>;

export type ToastFn = (props: {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
}) => void;
