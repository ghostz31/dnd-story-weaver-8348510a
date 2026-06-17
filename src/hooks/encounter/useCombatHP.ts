import { v4 as uuid } from 'uuid';
import { EncounterParticipant, CombatLogEntry } from '../../lib/types';
import { extractNumericHP } from '../../lib/EncounterUtils';
import { registerLocalChange, pushTrameCommand } from '../useBesaceSync';
import type { EncounterSetter } from './types';

interface UseCombatHPParams {
    setEncounter: EncounterSetter;
    notifyConcentrationCheck: (participant: EncounterParticipant, damageVal: number, source?: 'damage' | 'sync') => void;
    createLogEntry: (type: CombatLogEntry['type'], message: string, sourceId?: string, targetId?: string) => CombatLogEntry;
}

export const useCombatHP = ({ setEncounter, notifyConcentrationCheck, createLogEntry }: UseCombatHPParams) => {
    const updateHp = (id: string, amount: number) => {
        const safeAmount = Number(amount);
        if (isNaN(safeAmount)) return;

        // Calculate new HP values outside setEncounter for Besace sync
        let besaceNewHp: number | undefined;
        let besaceNewTempHp: number | undefined;
        let besaceShareCode: string | undefined;

        setEncounter(prev => {
            const participant = prev.participants.find(p => p.id === id);
            if (!participant) return prev;

            const currentNumeric = typeof participant.currentHp === 'string'
                ? extractNumericHP(participant.currentHp)
                : participant.currentHp;

            let newHp = currentNumeric;
            let newTempHp = participant.tempHp || 0;
            const isHeal = amount > 0;
            const isDamage = amount < 0;


            if (isDamage) {
                notifyConcentrationCheck(participant, Math.abs(amount));

                const damage = Math.abs(amount);
                if (newTempHp > 0) {
                    const absorbed = Math.min(newTempHp, damage);
                    newTempHp -= absorbed;
                    const remainingDamage = damage - absorbed;
                    if (remainingDamage > 0) {
                        newHp = Math.max(0, currentNumeric - remainingDamage);
                    }
                } else {
                    newHp = Math.max(0, currentNumeric - damage);
                }
            } else if (isHeal) {
                const maxNumeric = typeof participant.maxHp === 'string'
                    ? extractNumericHP(participant.maxHp)
                    : participant.maxHp;
                newHp = Math.min(maxNumeric, currentNumeric + amount);
            }

            // Capture values for Besace sync (outside setEncounter)
            if (participant.besaceShareCode && participant.syncSource === 'besace') {
                besaceNewHp = newHp;
                besaceNewTempHp = (participant.tempHp || 0) !== newTempHp ? newTempHp : undefined;
                besaceShareCode = participant.besaceShareCode;
            }

            const msg = isHeal
                ? `${participant.name} soigne de ${amount} PV.`
                : `${participant.name} subit ${Math.abs(amount)} dégâts.`;

            const entry = createLogEntry(isHeal ? 'heal' : 'damage', msg, undefined, id);

            return {
                ...prev,
                combatLog: [entry, ...prev.combatLog].slice(0, 100),
                participants: prev.participants.map(p => {
                    if (p.id !== id) return p;
                    return {
                        ...p,
                        currentHp: newHp,
                        tempHp: newTempHp
                    };
                })

            };
        });

        // Push HP changes back to Besace for synced characters
        if (besaceShareCode && besaceNewHp !== undefined) {
            registerLocalChange(besaceShareCode, {
                currentHp: besaceNewHp,
                tempHp: besaceNewTempHp,
            });
            pushTrameCommand(besaceShareCode, {
                type: 'updateHp',
                payload: { hp: besaceNewHp },
            }).catch(err => console.error('Besace pushHp error:', err));
            if (besaceNewTempHp !== undefined) {
                pushTrameCommand(besaceShareCode, {
                    type: 'updateTempHp',
                    payload: { tempHp: besaceNewTempHp },
                }).catch(err => console.error('Besace pushTempHp error:', err));
            }
        }
    };

    const updateHpBatch = (ids: string[], amount: number) => {
        const safeAmount = Number(amount);
        if (isNaN(safeAmount) || ids.length === 0) return;

        const besaceUpdates: { shareCode: string; newHp: number; newTempHp?: number }[] = [];

        setEncounter(prev => {
            const isHeal = amount > 0;
            const isDamage = amount < 0;
            let logEntries: CombatLogEntry[] = [];
            const newLogTime = Date.now();
            let entryCount = 0;

            const updatedParticipants = prev.participants.map(p => {
                if (!ids.includes(p.id)) return p;

                const currentNumeric = typeof p.currentHp === 'string'
                    ? extractNumericHP(p.currentHp)
                    : p.currentHp;

                let newHp = currentNumeric;
                let newTempHp = p.tempHp || 0;

                if (isDamage) {
                    notifyConcentrationCheck(p, Math.abs(amount));

                    const damage = Math.abs(amount);
                    if (newTempHp > 0) {
                        const absorbed = Math.min(newTempHp, damage);
                        newTempHp -= absorbed;
                        const remainingDamage = damage - absorbed;
                        if (remainingDamage > 0) {
                            newHp = Math.max(0, currentNumeric - remainingDamage);
                        }
                    } else {
                        newHp = Math.max(0, currentNumeric - damage);
                    }
                } else if (isHeal) {
                    const maxNumeric = typeof p.maxHp === 'string'
                        ? extractNumericHP(p.maxHp)
                        : p.maxHp;
                    newHp = Math.min(maxNumeric, currentNumeric + amount);
                }

                // Capture Besace sync data
                if (p.besaceShareCode && p.syncSource === 'besace') {
                    const update: { shareCode: string; newHp: number; newTempHp?: number } = { shareCode: p.besaceShareCode, newHp };
                    if ((p.tempHp || 0) !== newTempHp) {
                        update.newTempHp = newTempHp;
                    }
                    besaceUpdates.push(update);
                }

                const msg = isHeal
                    ? `${p.name} groupe soigne de ${amount} PV.`
                    : `${p.name} groupe subit ${Math.abs(amount)} dégâts.`;

                logEntries.push({
                    id: uuid() + `_${entryCount++}`,
                    timestamp: newLogTime,
                    type: isHeal ? 'heal' : 'damage',
                    message: msg,
                    targetId: p.id
                });

                return {
                    ...p,
                    currentHp: newHp,
                    tempHp: newTempHp
                };
            });

            return {
                ...prev,
                combatLog: [...logEntries, ...prev.combatLog].slice(0, 100),
                participants: updatedParticipants
            };
        });

        // Push HP changes back to Besace for synced characters
        for (const update of besaceUpdates) {
            registerLocalChange(update.shareCode, {
                currentHp: update.newHp,
                tempHp: update.newTempHp,
            });
            pushTrameCommand(update.shareCode, {
                type: 'updateHp',
                payload: { hp: update.newHp },
            }).catch(err => console.error('Besace pushHp error:', err));
            if (update.newTempHp !== undefined) {
                pushTrameCommand(update.shareCode, {
                    type: 'updateTempHp',
                    payload: { tempHp: update.newTempHp },
                }).catch(err => console.error('Besace pushTempHp error:', err));
            }
        }
    };

    const updateParticipant = (id: string, updates: Partial<EncounterParticipant>) => {
        let besaceShareCode: string | undefined;
        let besaceNewHp: number | undefined;
        let besaceNewTempHp: number | undefined;

        setEncounter(prev => {
            // Defensive coding: Force numeric types
            const safeUpdates = { ...updates };
            if (safeUpdates.currentHp !== undefined && typeof safeUpdates.currentHp === 'string') {
                safeUpdates.currentHp = parseInt(safeUpdates.currentHp) || 0;
            }
            if (safeUpdates.maxHp !== undefined && typeof safeUpdates.maxHp === 'string' && /^\d+$/.test(safeUpdates.maxHp)) {
                safeUpdates.maxHp = parseInt(safeUpdates.maxHp);
            }
            if (safeUpdates.initiative !== undefined) {
                safeUpdates.initiative = Number(safeUpdates.initiative);
            }

            // Check for concentration if HP is changing
            if (safeUpdates.currentHp !== undefined) {
                const participant = prev.participants.find(p => p.id === id);
                if (participant) {
                    const currentHp = typeof participant.currentHp === 'string' ? extractNumericHP(participant.currentHp) : participant.currentHp;
                    const newHp = safeUpdates.currentHp as number;

                    // If taking damage
                    if (newHp < currentHp) {
                        notifyConcentrationCheck(participant, currentHp - newHp);
                    }

                    // Capture Besace sync data
                    if (participant.besaceShareCode && participant.syncSource === 'besace' && (safeUpdates.currentHp !== undefined || safeUpdates.tempHp !== undefined)) {
                        besaceShareCode = participant.besaceShareCode;
                        if (safeUpdates.currentHp !== undefined) {
                            besaceNewHp = safeUpdates.currentHp as number;
                        }
                        if (safeUpdates.tempHp !== undefined) {
                            besaceNewTempHp = safeUpdates.tempHp as number;
                        }
                    }
                }
            }

            return {
                ...prev,
                participants: prev.participants.map(p => p.id === id ? { ...p, ...safeUpdates } : p)
            };
        });

        // Push HP changes back to Besace for synced characters
        if (besaceShareCode && (besaceNewHp !== undefined || besaceNewTempHp !== undefined)) {
            registerLocalChange(besaceShareCode, {
                currentHp: besaceNewHp,
                tempHp: besaceNewTempHp,
            });
            if (besaceNewHp !== undefined) {
                pushTrameCommand(besaceShareCode, {
                    type: 'updateHp',
                    payload: { hp: besaceNewHp },
                }).catch(err => console.error('Besace pushHp error:', err));
            }
            if (besaceNewTempHp !== undefined) {
                pushTrameCommand(besaceShareCode, {
                    type: 'updateTempHp',
                    payload: { tempHp: besaceNewTempHp },
                }).catch(err => console.error('Besace pushTempHp error:', err));
            }
        }
    };

    return { updateHp, updateHpBatch, updateParticipant };
};
