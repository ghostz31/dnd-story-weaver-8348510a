import { describe, it, expect } from 'vitest';
import {
    getEncounterMultiplier,
    calculateXPBudget,
    calculateActualDifficulty,
    crToXP,
    validateEncounter,
    GeneratedEncounter,
    EncounterSettings,
    Monster
} from './encounterUtils';

describe('encounterUtils', () => {
    describe('getEncounterMultiplier', () => {
        it('returns 1 for a single monster with standard party', () => {
            expect(getEncounterMultiplier(1, 4)).toBe(1);
        });

        it('returns 1.5 for 2 monsters', () => {
            expect(getEncounterMultiplier(2, 4)).toBe(1.5);
        });

        it('multiplies by 1.5 for small parties (< 3)', () => {
            // 1 monster = 1, but party < 3 => 1.5
            expect(getEncounterMultiplier(1, 2)).toBe(1.5);
        });

        it('multiplies by 0.5 for large parties (> 5)', () => {
            // 1 monster = 1, but party > 5 => 0.5
            expect(getEncounterMultiplier(1, 6)).toBe(0.5);
        });
    });

    describe('calculateXPBudget', () => {
        it('calculates correct budget for medium difficulty level 1 party of 4', () => {
            // Level 1 medium = 50xp per player. 4 * 50 = 200
            expect(calculateXPBudget(1, 4, 'medium')).toBe(200);
        });

        it('caps at level 20 for invalid high levels', () => {
            // Level 100 -> caps at 20.
            // Level 20 medium = 5700. 4 * 5700 = 22800.
            expect(calculateXPBudget(100, 4, 'medium')).toBe(22800);
        });
    });

    describe('calculateActualDifficulty', () => {
        it('identifies deadly encounter', () => {
            // Level 1: deadly is 100/player. Party 4 => 400.
            expect(calculateActualDifficulty(400, 1, 4)).toBe('mortelle');
        });

        it('identifies trivial encounter', () => {
            // Level 1: easy is 25/player. Party 4 => 100.
            expect(calculateActualDifficulty(50, 1, 4)).toBe('triviale');
        });
    });

    describe('crToXP', () => {
        it('converts CR 1 to 200 XP', () => {
            expect(crToXP(1)).toBe(200);
        });

        it('converts CR 0 to 10 XP', () => {
            expect(crToXP(0)).toBe(10);
        });

        it('returns 0 for unknown CR', () => {
            expect(crToXP(99)).toBe(0);
        });
    });

    describe('validateEncounter', () => {
        const settings: EncounterSettings = {
            partySize: 4,
            partyLevel: 1,
            difficulty: 'medium',
            encounterType: 'combat'
        };

        it('returns valid for well-balanced encounter', () => {
            // Target 200XP
            const encounter: GeneratedEncounter = {
                monsters: [{ monster: { xp: 200 } as Monster, quantity: 1 }],
                totalXP: 200,
                adjustedXP: 200,
                difficulty: 'medium',
                environment: 'any'
            };
            // Variance 0
            const result = validateEncounter(encounter, settings);
            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(0);
        });

        it('warns if monster count is too high', () => {
            const encounter: GeneratedEncounter = {
                monsters: [{ monster: { xp: 10 } as Monster, quantity: 8 }], // 4 + 3 = 7 limit
                totalXP: 80,
                adjustedXP: 200, // faked for this test logic focusing on count
                difficulty: 'medium',
                environment: 'any'
            };
            const result = validateEncounter(encounter, settings);
            expect(result.warnings).toContain('Beaucoup de créatures peuvent ralentir le combat');
        });
    });
});
