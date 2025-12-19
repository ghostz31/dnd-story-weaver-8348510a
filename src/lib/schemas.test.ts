import { describe, it, expect } from 'vitest';
import { MonsterSchema, EncounterSchema, PartySchema } from './schemas';

describe('Zod Schemas', () => {

    describe('MonsterSchema', () => {
        it('should validate a correct monster', () => {
            const validMonster = {
                id: '123',
                name: 'Goblin',
                xp: 50,
                type: 'Humanoid',
                size: 'S',
                source: 'MM',
                hp: 7,
                ac: 15
            };
            const result = MonsterSchema.safeParse(validMonster);
            expect(result.success).toBe(true);
        });

        it('should apply defaults for missing fields', () => {
            const minimalMonster = {
                id: '456',
                name: 'Blob'
            };
            const result = MonsterSchema.safeParse(minimalMonster);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.xp).toBe(0);
                expect(result.data.type).toBe("Inconnu");
            }
        });
    });

    describe('EncounterSchema', () => {
        it('should validate a full encounter', () => {
            const encounter = {
                id: 'enc-1',
                name: 'Ambush',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                monsters: [
                    { monster: { id: 'm1', name: 'Orc', xp: 100 }, quantity: 2 }
                ],
                difficulty: 'hard'
            };
            const result = EncounterSchema.safeParse(encounter);
            expect(result.success).toBe(true);
        });

        it('should reject invalid difficulty', () => {
            const encounter = {
                id: 'enc-1',
                name: 'Ambush',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                difficulty: 'extreme' // Invalid
            };
            const result = EncounterSchema.safeParse(encounter);
            expect(result.success).toBe(false);
        });
    });

});
