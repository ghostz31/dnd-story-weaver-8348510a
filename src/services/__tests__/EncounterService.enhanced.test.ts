// Tests avancés pour EncounterService
// Note: Ces tests nécessitent l'installation de Jest et @testing-library

import { EncounterService } from '../EncounterService';
import { EncounterParticipant } from '@/lib/types';

describe('EncounterService - Tests Avancés', () => {
  // Données de test
  const mockParticipant: EncounterParticipant = {
    id: 'test-1',
    name: 'Test Warrior',
    initiative: 15,
    ac: 16,
    currentHp: 30,
    maxHp: 30,
    isPC: false,
    conditions: [],
    notes: '',
    cr: '1',
    type: 'humanoid',
    size: 'Medium',
    dex: 14,
    hasUsedAction: false,
    hasUsedBonusAction: false,
    hasUsedReaction: false,
    remainingMovement: 30
  };

  const mockPlayer: EncounterParticipant = {
    id: 'player-1',
    name: 'Test Player',
    initiative: 12,
    ac: 18,
    currentHp: 45,
    maxHp: 45,
    isPC: true,
    conditions: [],
    notes: 'Paladin Level 5',
    level: 5,
    characterClass: 'Paladin',
    race: 'Human',
    dex: 12
  };

  describe('Initiative Management', () => {
    test('should calculate initiative modifier correctly', () => {
      expect(EncounterService.calculateInitiativeModifier(10)).toBe(0);
      expect(EncounterService.calculateInitiativeModifier(14)).toBe(2);
      expect(EncounterService.calculateInitiativeModifier(8)).toBe(-1);
      expect(EncounterService.calculateInitiativeModifier(20)).toBe(5);
    });

    test('should roll initiative within valid range', () => {
      const result = EncounterService.rollInitiative(mockParticipant);
      expect(result).toBeGreaterThanOrEqual(3); // 1 + 2 (dex modifier)
      expect(result).toBeLessThanOrEqual(22); // 20 + 2 (dex modifier)
    });

    test('should sort participants by initiative (descending)', () => {
      const participants = [
        { ...mockParticipant, id: '1', initiative: 10 },
        { ...mockParticipant, id: '2', initiative: 20 },
        { ...mockParticipant, id: '3', initiative: 15 }
      ];

      const sorted = EncounterService.sortParticipantsByInitiative(participants);
      
      expect(sorted[0].initiative).toBe(20);
      expect(sorted[1].initiative).toBe(15);
      expect(sorted[2].initiative).toBe(10);
    });
  });

  describe('Health Management', () => {
    test('should calculate health percentage correctly', () => {
      const participant = { ...mockParticipant, currentHp: 15, maxHp: 30 };
      expect(EncounterService.getHealthPercentage(participant)).toBe(50);
    });

    test('should determine health status correctly', () => {
      const fullHealth = { ...mockParticipant, currentHp: 30, maxHp: 30 };
      const halfHealth = { ...mockParticipant, currentHp: 15, maxHp: 30 };
      const lowHealth = { ...mockParticipant, currentHp: 5, maxHp: 30 };
      const unconscious = { ...mockParticipant, currentHp: 0, maxHp: 30 };

      expect(EncounterService.getHealthStatus(fullHealth)).toBe('healthy');
      expect(EncounterService.getHealthStatus(halfHealth)).toBe('injured');
      expect(EncounterService.getHealthStatus(lowHealth)).toBe('bloodied');
      expect(EncounterService.getHealthStatus(unconscious)).toBe('unconscious');
    });

    test('should apply damage correctly', () => {
      const result = EncounterService.applyDamage(mockParticipant, 10);
      expect(result.currentHp).toBe(20);
    });

    test('should not allow negative health', () => {
      const result = EncounterService.applyDamage(mockParticipant, 50);
      expect(result.currentHp).toBe(0);
    });

    test('should heal participant correctly', () => {
      const damaged = { ...mockParticipant, currentHp: 20 };
      const result = EncounterService.healParticipant(damaged, 5);
      expect(result.currentHp).toBe(25);
    });

    test('should not heal above max health', () => {
      const result = EncounterService.healParticipant(mockParticipant, 10);
      expect(result.currentHp).toBe(30);
    });
  });

  describe('Condition Management', () => {
    test('should add condition to participant', () => {
      const result = EncounterService.toggleCondition(mockParticipant, 'poisoned');
      expect(result.conditions).toContain('poisoned');
    });

    test('should remove existing condition', () => {
      const poisoned = { ...mockParticipant, conditions: ['poisoned'] };
      const result = EncounterService.toggleCondition(poisoned, 'poisoned');
      expect(result.conditions).not.toContain('poisoned');
    });

    test('should handle multiple conditions', () => {
      let result = EncounterService.toggleCondition(mockParticipant, 'poisoned');
      result = EncounterService.toggleCondition(result, 'stunned');
      
      expect(result.conditions).toContain('poisoned');
      expect(result.conditions).toContain('stunned');
      expect(result.conditions).toHaveLength(2);
    });
  });

  describe('Movement and Actions', () => {
    test('should calculate movement speed correctly', () => {
      const speed = EncounterService.calculateMovementSpeed(mockParticipant);
      expect(speed).toBeGreaterThan(0);
      expect(typeof speed).toBe('number');
    });

    test('should determine if participant can act', () => {
      const canAct = EncounterService.canParticipantAct(mockParticipant);
      expect(typeof canAct).toBe('boolean');
    });

    test('should reset participant actions', () => {
      const usedActions = {
        ...mockParticipant,
        hasUsedAction: true,
        hasUsedBonusAction: true,
        hasUsedReaction: true,
        remainingMovement: 0
      };

      const result = EncounterService.resetParticipantActions(usedActions);
      
      expect(result.hasUsedAction).toBe(false);
      expect(result.hasUsedBonusAction).toBe(false);
      expect(result.hasUsedReaction).toBe(false);
      expect(result.remainingMovement).toBeGreaterThan(0);
    });
  });

  describe('Encounter Difficulty', () => {
    test('should calculate encounter difficulty for party', () => {
      const party = [mockPlayer];
      const monsters = [mockParticipant];
      
      const difficulty = EncounterService.calculateEncounterDifficulty(party, monsters);
      
      expect(difficulty).toHaveProperty('totalXP');
      expect(difficulty).toHaveProperty('adjustedXP');
      expect(difficulty).toHaveProperty('difficulty');
      expect(difficulty.totalXP).toBeGreaterThan(0);
    });

    test('should handle empty party gracefully', () => {
      const difficulty = EncounterService.calculateEncounterDifficulty([], [mockParticipant]);
      expect(difficulty.difficulty).toBe('deadly');
    });

    test('should handle empty monsters gracefully', () => {
      const difficulty = EncounterService.calculateEncounterDifficulty([mockPlayer], []);
      expect(difficulty.totalXP).toBe(0);
      expect(difficulty.difficulty).toBe('trivial');
    });
  });

  describe('Utility Functions', () => {
    test('should generate unique participant names', () => {
      const participants = [
        { ...mockParticipant, name: 'Goblin' },
        { ...mockParticipant, name: 'Goblin' }
      ];

      const uniqueName = EncounterService.generateUniqueParticipantName('Goblin', participants);
      expect(uniqueName).toBe('Goblin 3');
    });

    test('should export encounter state', () => {
      const encounter = {
        name: 'Test Encounter',
        participants: [mockParticipant],
        currentTurn: 0,
        round: 1
      };

      const exported = EncounterService.exportEncounterState(encounter);
      expect(exported).toContain('Test Encounter');
      expect(exported).toContain('Test Warrior');
    });

    test('should import encounter state', () => {
      const exportedData = JSON.stringify({
        name: 'Imported Encounter',
        participants: [mockParticipant],
        currentTurn: 0,
        round: 1
      });

      const imported = EncounterService.importEncounterState(exportedData);
      expect(imported.name).toBe('Imported Encounter');
      expect(imported.participants).toHaveLength(1);
    });

    test('should handle invalid import data', () => {
      expect(() => {
        EncounterService.importEncounterState('invalid json');
      }).toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle participant with missing properties', () => {
      const incompleteParticipant = {
        id: 'incomplete',
        name: 'Incomplete',
        initiative: 10,
        ac: 10,
        currentHp: 10,
        maxHp: 10,
        isPC: false,
        conditions: [],
        notes: ''
      } as EncounterParticipant;

      expect(() => {
        EncounterService.calculateMovementSpeed(incompleteParticipant);
      }).not.toThrow();

      expect(() => {
        EncounterService.canParticipantAct(incompleteParticipant);
      }).not.toThrow();
    });

    test('should handle extreme values', () => {
      const extremeParticipant = {
        ...mockParticipant,
        dex: 30, // Very high dexterity
        currentHp: 1000,
        maxHp: 1000
      };

      const modifier = EncounterService.calculateInitiativeModifier(extremeParticipant.dex!);
      expect(modifier).toBe(10); // (30-10)/2 = 10

      const percentage = EncounterService.getHealthPercentage(extremeParticipant);
      expect(percentage).toBe(100);
    });
  });
});

// Tests d'intégration
describe('EncounterService - Integration Tests', () => {
  test('should handle complete encounter flow', () => {
    // Créer des participants
    const participants = [
      { ...mockPlayer, id: 'player-1' },
      { ...mockParticipant, id: 'monster-1' },
      { ...mockParticipant, id: 'monster-2' }
    ];

    // Trier par initiative
    const sorted = EncounterService.sortParticipantsByInitiative(participants);
    expect(sorted).toHaveLength(3);

    // Appliquer des dégâts
    const damaged = EncounterService.applyDamage(sorted[0], 10);
    expect(damaged.currentHp).toBeLessThan(damaged.maxHp);

    // Ajouter des conditions
    const conditioned = EncounterService.toggleCondition(damaged, 'stunned');
    expect(conditioned.conditions).toContain('stunned');

    // Réinitialiser les actions
    const reset = EncounterService.resetParticipantActions(conditioned);
    expect(reset.hasUsedAction).toBe(false);
  });

  test('should maintain data integrity through operations', () => {
    let participant = { ...mockParticipant };

    // Série d'opérations
    participant = EncounterService.applyDamage(participant, 5);
    participant = EncounterService.toggleCondition(participant, 'poisoned');
    participant = EncounterService.healParticipant(participant, 3);
    participant = EncounterService.toggleCondition(participant, 'stunned');

    // Vérifier l'intégrité
    expect(participant.id).toBe(mockParticipant.id);
    expect(participant.name).toBe(mockParticipant.name);
    expect(participant.currentHp).toBe(28); // 30 - 5 + 3
    expect(participant.conditions).toContain('poisoned');
    expect(participant.conditions).toContain('stunned');
  });
}); 