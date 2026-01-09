import { renderHook } from '@testing-library/react';
import { useEncounterLogic } from './useEncounterLogic';
import { Party } from '../lib/types';
import { describe, it, expect } from 'vitest';

describe('useEncounterLogic', () => {
    const mockParty: Party = {
        id: 'party-1',
        name: 'Test Party',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        players: [
            { id: '1', name: 'P1', level: 1, characterClass: 'Fighter' },
            { id: '2', name: 'P2', level: 1, characterClass: 'Cleric' },
            { id: '3', name: 'P3', level: 1, characterClass: 'Rogue' },
            { id: '4', name: 'P4', level: 1, characterClass: 'Wizard' }
        ]
    };

    it('returns base stats for empty encounter', () => {
        const { result } = renderHook(() => useEncounterLogic([], mockParty));

        expect(result.current).toEqual({
            totalXP: 0,
            adjustedXP: 0,
            difficulty: 'trivial',
            xpPerPlayer: 0,
            difficultyColor: 'text-gray-500'
        });
    });

    it('calculates difficulty correctly for a simple encounter', () => {
        // Level 1 party of 4.
        // Thresholds: Easy 100, Medium 200, Hard 300, Deadly 400
        // Monster CR 1 = 200 XP.
        // Adjusted XP = 200 * 1 (multiplier for 1 monster) = 200.
        // Should be Medium.

        const mockMonsters = [
            {
                monster: {
                    id: 'm1',
                    name: 'Goblin',
                    xp: 200,
                    cr: 1,
                    type: 'humanoid',
                    size: 'S',
                    source: 'MM',
                    environment: [],
                    legendary: false,
                    alignment: 'NE',
                    ac: 15,
                    hp: 7
                },
                quantity: 1
            }
        ];

        const { result } = renderHook(() => useEncounterLogic(mockMonsters, mockParty));

        expect(result.current.totalXP).toBe(200);
        expect(result.current.adjustedXP).toBe(200);
        expect(result.current.difficulty).toBe('medium');
        expect(result.current.difficultyColor).toBe('text-yellow-500');
    });

    it('adjusts difficulty with multiplier for multiple monsters', () => {
        // 2 Monsters of 100 XP each.
        // Total Base = 200.
        // Multiplier for 2 monsters = 1.5.
        // Adjusted = 200 * 1.5 = 300.
        // Thresholds: Hard is 300. Should be Hard.

        const mockMonsters = [
            {
                monster: {
                    id: 'm1',
                    name: 'Goblin',
                    xp: 100,
                    cr: 0.5,
                    type: 'humanoid',
                    size: 'S',
                    source: 'MM',
                    environment: [],
                    legendary: false,
                    alignment: 'NE',
                    ac: 15,
                    hp: 7
                },
                quantity: 2
            }
        ];

        const { result } = renderHook(() => useEncounterLogic(mockMonsters, mockParty));

        expect(result.current.totalXP).toBe(200);
        expect(result.current.adjustedXP).toBe(300);
        expect(result.current.difficulty).toBe('hard');
    });
});
