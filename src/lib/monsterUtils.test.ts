import { describe, it, expect } from 'vitest';
import { getMonsterImageUrl, getAideDDMonsterSlug } from './monsterUtils';
import { Monster } from './types';

// Mock partiel de l'interface Monster pour les tests
const createMockMonster = (overrides: Partial<Monster>): Monster => ({
    id: 'test-id',
    name: 'Test Monster',
    cr: 1,
    xp: 200,
    type: 'beast',
    size: 'M',
    source: 'MM',
    environment: [],
    legendary: false,
    alignment: 'unaligned',
    ac: 10,
    hp: 10,
    ...overrides
});

describe('monsterUtils', () => {
    describe('getAideDDMonsterSlug', () => {
        it('should lowercase and replace spaces with dashes', () => {
            expect(getAideDDMonsterSlug('Giant Rat')).toBe('giant-rat');
        });

        it('should remove accents', () => {
            expect(getAideDDMonsterSlug('Éléphant')).toBe('elephant');
            expect(getAideDDMonsterSlug('Âme en peine')).toBe('ame-en-peine');
        });

        it('should convert apostrophes to dashes', () => {
            expect(getAideDDMonsterSlug("Dragon d'or")).toBe('dragon-d-or');
            expect(getAideDDMonsterSlug("Kuo-toa")).toBe('kuo-toa'); // dashes are kept
            expect(getAideDDMonsterSlug("Kuo-toa!")).toBe('kuo-toa');
        });

        it('should handle special cases', () => {
            expect(getAideDDMonsterSlug('Béhir')).toBe('behir');
            expect(getAideDDMonsterSlug('Arbre éveillé')).toBe('arbre-eveille');
            expect(getAideDDMonsterSlug('Dragon d\'ombre rouge, jeune')).toBe('dragon-d-ombre-rouge-jeune');
            expect(getAideDDMonsterSlug('élémentaire du feu')).toBe('elementaire-du-feu');
        });

        it('should use urlMap when provided', () => {
            const urlMap = { 'Monstre Custom': 'monstre-custom-special' };
            expect(getAideDDMonsterSlug('Monstre Custom', urlMap)).toBe('monstre-custom-special');
            expect(getAideDDMonsterSlug('Monstre Inconnu', urlMap)).toBe('monstre-inconnu');
        });
    });

    describe('getMonsterImageUrl', () => {
        it('should prioritize manual mapping', () => {
            const monster = createMockMonster({ name: 'Aigle' });
            // Aigle -> eagle in the map
            expect(getMonsterImageUrl(monster)).toBe('https://www.aidedd.org/dnd/images/eagle.jpg');
        });

        it('should prioritize manual mapping over everything else', () => {
            const monster = createMockMonster({ name: 'Aigle', image: 'wrong-image.jpg', originalName: 'Super Eagle' });
            // Mapping wins
            expect(getMonsterImageUrl(monster)).toBe('https://www.aidedd.org/dnd/images/eagle.jpg');
        });

        it('should use explicit image property if no manual mapping exists', () => {
            const monster = createMockMonster({ name: 'Monstre Inconnu', image: 'custom-file.jpg' });
            expect(getMonsterImageUrl(monster)).toBe('/data/aidedd-complete/images/custom-file.jpg');
        });

        it('should use originalName slug if provided and no mapping/image exists', () => {
            const monster = createMockMonster({ name: 'Créature', originalName: 'Creature' });
            expect(getMonsterImageUrl(monster)).toBe('https://www.aidedd.org/dnd/images/creature.jpg');
        });

        it('should fallback to slugified name in local path if nothing else is available', () => {
            const monster = createMockMonster({ name: 'Super Monstre' });
            expect(getMonsterImageUrl(monster)).toBe('/data/aidedd-complete/images/super-monstre.jpg');
        });

        // Verification de cas réels qui posaient problème
        it('should correctly handle "Araignée"', () => {
            const monster = createMockMonster({ name: 'Araignée' });
            expect(getMonsterImageUrl(monster)).toBe('https://www.aidedd.org/dnd/images/spider.jpg');
        });

        it('should correctly handle "Âme en peine" (Wraith)', () => {
            const monster = createMockMonster({ name: 'Âme en peine' });
            expect(getMonsterImageUrl(monster)).toBe('https://www.aidedd.org/dnd/images/wraith.jpg');
        });
    });
});
