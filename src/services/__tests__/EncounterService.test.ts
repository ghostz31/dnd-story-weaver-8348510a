import { EncounterService } from '../EncounterService';
import { EncounterParticipant } from '@/lib/types';

describe('EncounterService', () => {
  // Données de test
  const mockParticipant: EncounterParticipant = {
    id: 'test-1',
    name: 'Gobelin',
    initiative: 15,
    ac: 15,
    currentHp: 7,
    maxHp: 7,
    isPC: false,
    conditions: [],
    notes: '',
    cr: 0.25,
    dex: 14
  };

  const mockPlayer: EncounterParticipant = {
    id: 'player-1',
    name: 'Theron',
    initiative: 18,
    ac: 18,
    currentHp: 42,
    maxHp: 42,
    isPC: true,
    conditions: [],
    notes: '',
    level: 4,
    characterClass: 'Paladin',
    dex: 16
  };

  describe('calculateInitiativeModifier', () => {
    test('calcule correctement le modificateur d\'initiative', () => {
      expect(EncounterService.calculateInitiativeModifier(10)).toBe(0);
      expect(EncounterService.calculateInitiativeModifier(14)).toBe(2);
      expect(EncounterService.calculateInitiativeModifier(16)).toBe(3);
      expect(EncounterService.calculateInitiativeModifier(8)).toBe(-1);
    });
  });

  describe('rollInitiative', () => {
    test('génère une initiative dans la plage correcte', () => {
      const initiative = EncounterService.rollInitiative(mockParticipant);
      const expectedMin = 1 + 2; // d20 min + dex modifier
      const expectedMax = 20 + 2; // d20 max + dex modifier
      
      expect(initiative).toBeGreaterThanOrEqual(expectedMin);
      expect(initiative).toBeLessThanOrEqual(expectedMax);
    });
  });

  describe('sortParticipantsByInitiative', () => {
    test('trie les participants par initiative décroissante', () => {
      const participants = [
        { ...mockParticipant, initiative: 10 },
        { ...mockPlayer, initiative: 18 },
        { ...mockParticipant, id: 'test-2', initiative: 15 }
      ];

      const sorted = EncounterService.sortParticipantsByInitiative(participants);
      
      expect(sorted[0].initiative).toBe(18);
      expect(sorted[1].initiative).toBe(15);
      expect(sorted[2].initiative).toBe(10);
    });

    test('trie par dextérité en cas d\'égalité d\'initiative', () => {
      const participants = [
        { ...mockParticipant, initiative: 15, dex: 12 },
        { ...mockPlayer, initiative: 15, dex: 16 }
      ];

      const sorted = EncounterService.sortParticipantsByInitiative(participants);
      
      expect(sorted[0].dex).toBe(16);
      expect(sorted[1].dex).toBe(12);
    });
  });

  describe('calculateMovementSpeed', () => {
    test('retourne la vitesse par défaut', () => {
      const speed = EncounterService.calculateMovementSpeed(mockParticipant);
      expect(speed).toBe(9); // Vitesse par défaut
    });

    test('réduit la vitesse avec la condition Ralenti', () => {
      const participant = { 
        ...mockParticipant, 
        conditions: ['Ralenti'] 
      };
      const speed = EncounterService.calculateMovementSpeed(participant);
      expect(speed).toBe(4); // 9 * 0.5 arrondi
    });

    test('annule la vitesse avec la condition Entravé', () => {
      const participant = { 
        ...mockParticipant, 
        conditions: ['Entravé'] 
      };
      const speed = EncounterService.calculateMovementSpeed(participant);
      expect(speed).toBe(0);
    });
  });

  describe('canParticipantAct', () => {
    test('retourne true pour un participant normal', () => {
      expect(EncounterService.canParticipantAct(mockParticipant)).toBe(true);
    });

    test('retourne false pour un participant inconscient', () => {
      const participant = { 
        ...mockParticipant, 
        currentHp: 0 
      };
      expect(EncounterService.canParticipantAct(participant)).toBe(false);
    });

    test('retourne false pour un participant paralysé', () => {
      const participant = { 
        ...mockParticipant, 
        conditions: ['Paralysé'] 
      };
      expect(EncounterService.canParticipantAct(participant)).toBe(false);
    });
  });

  describe('applyDamage', () => {
    test('réduit les PV correctement', () => {
      const result = EncounterService.applyDamage(mockParticipant, 3);
      expect(result.currentHp).toBe(4);
    });

    test('ne descend pas en dessous de 0 PV', () => {
      const result = EncounterService.applyDamage(mockParticipant, 10);
      expect(result.currentHp).toBe(0);
    });

    test('ajoute la condition Inconscient à 0 PV', () => {
      const result = EncounterService.applyDamage(mockParticipant, 7);
      expect(result.currentHp).toBe(0);
      expect(result.conditions).toContain('Inconscient');
    });
  });

  describe('healParticipant', () => {
    test('augmente les PV correctement', () => {
      const participant = { ...mockParticipant, currentHp: 3 };
      const result = EncounterService.healParticipant(participant, 2);
      expect(result.currentHp).toBe(5);
    });

    test('ne dépasse pas les PV maximum', () => {
      const participant = { ...mockParticipant, currentHp: 5 };
      const result = EncounterService.healParticipant(participant, 5);
      expect(result.currentHp).toBe(7);
    });

    test('retire la condition Inconscient si les PV remontent', () => {
      const participant = { 
        ...mockParticipant, 
        currentHp: 0, 
        conditions: ['Inconscient'] 
      };
      const result = EncounterService.healParticipant(participant, 1);
      expect(result.currentHp).toBe(1);
      expect(result.conditions).not.toContain('Inconscient');
    });
  });

  describe('getHealthPercentage', () => {
    test('calcule le pourcentage de vie correctement', () => {
      const participant = { ...mockParticipant, currentHp: 3, maxHp: 7 };
      const percentage = EncounterService.getHealthPercentage(participant);
      expect(percentage).toBe(43); // 3/7 * 100 arrondi
    });
  });

  describe('getHealthStatus', () => {
    test('retourne unconscious à 0 PV', () => {
      const participant = { ...mockParticipant, currentHp: 0 };
      expect(EncounterService.getHealthStatus(participant)).toBe('unconscious');
    });

    test('retourne critical à 25% ou moins', () => {
      const participant = { ...mockParticipant, currentHp: 1, maxHp: 7 };
      expect(EncounterService.getHealthStatus(participant)).toBe('critical');
    });

    test('retourne injured entre 26% et 50%', () => {
      const participant = { ...mockParticipant, currentHp: 3, maxHp: 7 };
      expect(EncounterService.getHealthStatus(participant)).toBe('injured');
    });

    test('retourne healthy au-dessus de 50%', () => {
      const participant = { ...mockParticipant, currentHp: 5, maxHp: 7 };
      expect(EncounterService.getHealthStatus(participant)).toBe('healthy');
    });
  });

  describe('toggleCondition', () => {
    test('ajoute une condition si elle n\'existe pas', () => {
      const result = EncounterService.toggleCondition(mockParticipant, 'Empoisonné');
      expect(result.conditions).toContain('Empoisonné');
    });

    test('retire une condition si elle existe', () => {
      const participant = { ...mockParticipant, conditions: ['Empoisonné'] };
      const result = EncounterService.toggleCondition(participant, 'Empoisonné');
      expect(result.conditions).not.toContain('Empoisonné');
    });
  });

  describe('calculateEncounterDifficulty', () => {
    test('calcule la difficulté pour une rencontre facile', () => {
      const monsters = [{ cr: 0.25 }]; // Gobelin
      const result = EncounterService.calculateEncounterDifficulty(monsters, 1, 4);
      
      expect(result.difficulty).toBe('easy');
      expect(result.xp).toBeGreaterThan(0);
    });

    test('ajuste la difficulté selon le nombre de monstres', () => {
      const singleMonster = [{ cr: 1 }];
      const multipleMonsters = [{ cr: 1 }, { cr: 1 }];
      
      const single = EncounterService.calculateEncounterDifficulty(singleMonster, 3, 4);
      const multiple = EncounterService.calculateEncounterDifficulty(multipleMonsters, 3, 4);
      
      expect(multiple.xp).toBeGreaterThan(single.xp);
    });
  });

  describe('generateUniqueParticipantName', () => {
    test('retourne le nom de base s\'il est unique', () => {
      const participants = [mockPlayer];
      const result = EncounterService.generateUniqueParticipantName('Gobelin', participants);
      expect(result).toBe('Gobelin');
    });

    test('ajoute un numéro si le nom existe déjà', () => {
      const participants = [mockParticipant];
      const result = EncounterService.generateUniqueParticipantName('Gobelin', participants);
      expect(result).toBe('Gobelin 1');
    });

    test('incrémente le numéro pour plusieurs doublons', () => {
      const participants = [
        { ...mockParticipant, name: 'Gobelin' },
        { ...mockParticipant, id: 'test-2', name: 'Gobelin 1' }
      ];
      const result = EncounterService.generateUniqueParticipantName('Gobelin', participants);
      expect(result).toBe('Gobelin 2');
    });
  });

  describe('exportEncounterState', () => {
    test('exporte l\'état de la rencontre en JSON', () => {
      const encounter = {
        name: 'Test Encounter',
        participants: [mockParticipant],
        currentTurn: 0,
        round: 1
      };

      const exported = EncounterService.exportEncounterState(encounter);
      const parsed = JSON.parse(exported);

      expect(parsed.name).toBe('Test Encounter');
      expect(parsed.participants).toHaveLength(1);
      expect(parsed.version).toBe('1.0');
      expect(parsed.exportedAt).toBeDefined();
    });
  });

  describe('importEncounterState', () => {
    test('importe un état de rencontre valide', () => {
      const encounter = {
        name: 'Test Encounter',
        participants: [mockParticipant],
        currentTurn: 0,
        round: 1
      };

      const exported = EncounterService.exportEncounterState(encounter);
      const imported = EncounterService.importEncounterState(exported);

      expect(imported).not.toBeNull();
      expect(imported!.name).toBe('Test Encounter');
      expect(imported!.participants).toHaveLength(1);
    });

    test('retourne null pour des données invalides', () => {
      const result = EncounterService.importEncounterState('invalid json');
      expect(result).toBeNull();
    });

    test('retourne null pour des données mal formées', () => {
      const invalidData = JSON.stringify({ invalid: true });
      const result = EncounterService.importEncounterState(invalidData);
      expect(result).toBeNull();
    });
  });
}); 