import { EncounterParticipant, EncounterCondition } from '../../lib/types';
import { getConditionInfo } from '../../lib/EncounterUtils';
import type { ToastFn } from './types';

export const useCombatConditions = ({ toast }: { toast: ToastFn }) => {
    const notifyConcentrationCheck = (
        participant: EncounterParticipant,
        damageVal: number,
        source: 'damage' | 'sync' = 'damage'
    ) => {
        if (participant.conditions?.some(c => (typeof c === 'string' ? c : c.name) === 'Concentré')) {
            const dc = Math.max(10, Math.floor(damageVal / 2));
            if (source === 'sync') {
                toast({
                    title: "Jet de Concentration Requis (Sync)",
                    description: `${participant.name} a subi ${damageVal} dégâts (via D&D Beyond).\nDD Constitution : ${dc}`,
                    variant: "destructive",
                    duration: 6000
                });
            } else {
                toast({
                    title: "Jet de Concentration Requis !",
                    description: `${participant.name} a subi ${damageVal} dégâts alors qu'il était concentré.\nDD Constitution : ${dc}`,
                    variant: "destructive",
                    duration: 6000
                });
            }
        }
    };

    const decrementConditionDurations = (conditions: EncounterCondition[]): EncounterCondition[] => {
        return conditions.map(c => {
            if (c.duration > 0) return { ...c, duration: c.duration - 1 };
            return c;
        }).filter(c => c.duration !== 0); // Remove expired
    };

    // --- Condition Notifications (Start of Turn) ---
    const notifyStartOfTurnConditions = (participant: EncounterParticipant) => {
        if (!participant.conditions || participant.conditions.length === 0) return;

        const conditionsToNotify = participant.conditions.map(c => {
            const info = getConditionInfo(c);
            return { name: typeof c === 'string' ? c : c.name, info };
        });

        // 1. Critical Start-of-Turn Effects
        const startEffects = conditionsToNotify.filter(c => c.info.timing === 'start');
        startEffects.forEach(effect => {
            toast({
                title: `Effet de Début de Tour: ${effect.name}`,
                description: `${participant.name}: ${effect.info.description.split('\n')[0]}`,
                variant: "destructive"
            });
        });

        // 2. General Reminder (if not just start effects)
        const otherConditions = conditionsToNotify.filter(c => c.info.timing !== 'start');
        if (otherConditions.length > 0) {
            otherConditions.forEach(c => {
                toast({
                    title: `Rappel Condition: ${c.name} (${participant.name})`,
                    description: c.info.description,
                    duration: 6000
                });
            });
        }
    };

    return { notifyConcentrationCheck, decrementConditionDurations, notifyStartOfTurnConditions };
};
