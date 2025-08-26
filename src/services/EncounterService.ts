import { EncounterParticipant } from '@/lib/types';

export class EncounterService {
  // ====== Gestion des Participants ======
  
  /**
   * Calcule le modificateur d'initiative basé sur la dextérité
   */
  static calculateInitiativeModifier(dexterity: number): number {
    return Math.floor((dexterity - 10) / 2);
  }
  
  /**
   * Génère une initiative aléatoire pour un participant
   */
  static rollInitiative(participant: EncounterParticipant): number {
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const dexModifier = this.calculateInitiativeModifier(participant.dex || 10);
    return d20Roll + dexModifier;
  }
  
  /**
   * Trie les participants par initiative (décroissant)
   */
  static sortParticipantsByInitiative(participants: EncounterParticipant[]): EncounterParticipant[] {
    return [...participants].sort((a, b) => {
      if (b.initiative !== a.initiative) {
        return b.initiative - a.initiative;
      }
      // En cas d'égalité, trier par dextérité
      return (b.dex || 10) - (a.dex || 10);
    });
  }
  
  /**
   * Calcule la vitesse de déplacement en mètres
   */
  static calculateMovementSpeed(participant: EncounterParticipant): number {
    // Vitesse par défaut de 9 mètres (30 pieds)
    // participant.speed est un tableau de chaînes selon le type EncounterParticipant
    const baseSpeed = 9; // Valeur par défaut
    
    // Réductions dues aux conditions
    const conditions = participant.conditions || [];
    let speedModifier = 1;
    
    if (conditions.includes('Ralenti')) speedModifier *= 0.5;
    if (conditions.includes('Entravé')) speedModifier = 0;
    if (conditions.includes('Paralysé')) speedModifier = 0;
    if (conditions.includes('Pétrifié')) speedModifier = 0;
    if (conditions.includes('Inconscient')) speedModifier = 0;
    
    return Math.floor(baseSpeed * speedModifier);
  }
  
  /**
   * Vérifie si un participant peut agir
   */
  static canParticipantAct(participant: EncounterParticipant): boolean {
    if (participant.currentHp <= 0) return false;
    
    const conditions = participant.conditions || [];
    const incapacitatingConditions = [
      'Inconscient', 'Paralysé', 'Pétrifié', 'Étourdi'
    ];
    
    return !incapacitatingConditions.some(condition => 
      conditions.includes(condition)
    );
  }
  
  /**
   * Vérifie si un participant est conscient
   */
  static isParticipantConscious(participant: EncounterParticipant): boolean {
    if (participant.currentHp <= 0) return false;
    
    const conditions = participant.conditions || [];
    const unconsciousConditions = ['Inconscient', 'Paralysé', 'Pétrifié'];
    
    return !unconsciousConditions.some(condition => 
      conditions.includes(condition)
    );
  }
  
  // ====== Gestion des Points de Vie ======
  
  /**
   * Applique des dégâts à un participant
   */
  static applyDamage(participant: EncounterParticipant, damage: number): EncounterParticipant {
    const newHp = Math.max(0, participant.currentHp - damage);
    const updatedParticipant = { ...participant, currentHp: newHp };
    
    // Ajouter la condition "Inconscient" si les PV tombent à 0
    if (newHp === 0 && participant.currentHp > 0) {
      const conditions = participant.conditions || [];
      if (!conditions.includes('Inconscient')) {
        updatedParticipant.conditions = [...conditions, 'Inconscient'];
      }
    }
    
    return updatedParticipant;
  }
  
  /**
   * Soigne un participant
   */
  static healParticipant(participant: EncounterParticipant, healing: number): EncounterParticipant {
    const newHp = Math.min(participant.maxHp, participant.currentHp + healing);
    const updatedParticipant = { ...participant, currentHp: newHp };
    
    // Retirer la condition "Inconscient" si les PV remontent au-dessus de 0
    if (newHp > 0 && participant.currentHp === 0) {
      const conditions = participant.conditions || [];
      updatedParticipant.conditions = conditions.filter(c => c !== 'Inconscient');
    }
    
    return updatedParticipant;
  }
  
  /**
   * Calcule le pourcentage de vie restante
   */
  static getHealthPercentage(participant: EncounterParticipant): number {
    return Math.round((participant.currentHp / participant.maxHp) * 100);
  }
  
  /**
   * Détermine l'état de santé d'un participant
   */
  static getHealthStatus(participant: EncounterParticipant): 'healthy' | 'injured' | 'critical' | 'unconscious' {
    const percentage = this.getHealthPercentage(participant);
    
    if (percentage === 0) return 'unconscious';
    if (percentage <= 25) return 'critical';
    if (percentage <= 50) return 'injured';
    return 'healthy';
  }
  
  // ====== Gestion des Conditions ======
  
  /**
   * Liste de toutes les conditions D&D 5e
   */
  static readonly CONDITIONS = [
    'Aveuglé', 'Charmé', 'Assourdi', 'Apeuré', 'Agrippé', 'Incapacité',
    'Invisible', 'Paralysé', 'Pétrifié', 'Empoisonné', 'Sujet', 'Entravé',
    'Étourdi', 'Inconscient', 'Épuisement', 'Ralenti', 'Hâte', 'Béni',
    'Maudit', 'Concentré', 'En rage', 'Furtif'
  ] as const;
  
  /**
   * Ajoute une condition à un participant
   */
  static addCondition(participant: EncounterParticipant, condition: string): EncounterParticipant {
    const conditions = participant.conditions || [];
    if (conditions.includes(condition)) return participant;
    
    return {
      ...participant,
      conditions: [...conditions, condition]
    };
  }
  
  /**
   * Retire une condition d'un participant
   */
  static removeCondition(participant: EncounterParticipant, condition: string): EncounterParticipant {
    const conditions = participant.conditions || [];
    return {
      ...participant,
      conditions: conditions.filter(c => c !== condition)
    };
  }
  
  /**
   * Bascule une condition pour un participant
   */
  static toggleCondition(participant: EncounterParticipant, condition: string): EncounterParticipant {
    const conditions = participant.conditions || [];
    const hasCondition = conditions.includes(condition);
    
    return hasCondition 
      ? this.removeCondition(participant, condition)
      : this.addCondition(participant, condition);
  }
  
  // ====== Gestion des Tours de Combat ======
  
  /**
   * Détermine le prochain participant dans l'ordre d'initiative
   */
  static getNextParticipantIndex(
    currentIndex: number, 
    participants: EncounterParticipant[], 
    skipUnconscious: boolean = true
  ): number {
    if (participants.length === 0) return 0;
    
    let nextIndex = (currentIndex + 1) % participants.length;
    let attempts = 0;
    
    // Éviter les boucles infinies
    while (attempts < participants.length) {
      const participant = participants[nextIndex];
      
      if (!skipUnconscious || this.canParticipantAct(participant)) {
        return nextIndex;
      }
      
      nextIndex = (nextIndex + 1) % participants.length;
      attempts++;
    }
    
    // Si aucun participant ne peut agir, retourner l'index suivant
    return (currentIndex + 1) % participants.length;
  }
  
  /**
   * Réinitialise les actions d'un participant au début de son tour
   */
  static resetParticipantActions(participant: EncounterParticipant): EncounterParticipant {
    return {
      ...participant,
      hasUsedAction: false,
      hasUsedBonusAction: false,
      hasUsedReaction: false,
      remainingMovement: this.calculateMovementSpeed(participant)
    };
  }
  
  // ====== Utilitaires de Combat ======
  
  /**
   * Calcule la difficulté d'une rencontre selon le DMG
   */
  static calculateEncounterDifficulty(
    monsters: Array<{cr: number}>, 
    partyLevel: number, 
    partySize: number
  ): { xp: number; difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly' } {
    // XP par CR selon le DMG
    const crToXp: Record<number, number> = {
      0: 10, 0.125: 25, 0.25: 50, 0.5: 100, 1: 200, 2: 450, 3: 700, 4: 1100,
      5: 1800, 6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900, 11: 7200,
      12: 8400, 13: 10000, 14: 11500, 15: 13000, 16: 15000, 17: 18000,
      18: 20000, 19: 22000, 20: 25000, 21: 33000, 22: 41000, 23: 50000,
      24: 62000, 25: 75000, 26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000
    };
    
    // Seuils XP par niveau et taille de groupe
    const xpThresholds = {
      1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
      2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
      3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
      4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
      5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
      // ... autres niveaux
    };
    
    // Calculer XP total des monstres
    const totalXp = monsters.reduce((sum, monster) => {
      return sum + (crToXp[monster.cr] || 0);
    }, 0);
    
    // Multiplicateur selon le nombre de monstres
    const monsterCount = monsters.length;
    let multiplier = 1;
    if (monsterCount === 2) multiplier = 1.5;
    else if (monsterCount >= 3 && monsterCount <= 6) multiplier = 2;
    else if (monsterCount >= 7 && monsterCount <= 10) multiplier = 2.5;
    else if (monsterCount >= 11) multiplier = 3;
    
    const adjustedXp = Math.floor(totalXp * multiplier);
    
    // Ajuster selon la taille du groupe
    const sizeMultiplier = partySize < 3 ? 1.5 : partySize > 5 ? 0.5 : 1;
    const finalXp = Math.floor(adjustedXp * sizeMultiplier);
    
    // Déterminer la difficulté
    const thresholds = xpThresholds[Math.min(partyLevel, 5)] || xpThresholds[5];
    let difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly' = 'trivial';
    
    if (finalXp >= thresholds.deadly) difficulty = 'deadly';
    else if (finalXp >= thresholds.hard) difficulty = 'hard';
    else if (finalXp >= thresholds.medium) difficulty = 'medium';
    else if (finalXp >= thresholds.easy) difficulty = 'easy';
    
    return { xp: finalXp, difficulty };
  }
  
  /**
   * Génère un nom unique pour un participant (gestion des doublons)
   */
  static generateUniqueParticipantName(
    baseName: string, 
    existingParticipants: EncounterParticipant[]
  ): string {
    const existingNames = existingParticipants.map(p => p.name);
    
    if (!existingNames.includes(baseName)) {
      return baseName;
    }
    
    let counter = 1;
    let uniqueName = `${baseName} ${counter}`;
    
    while (existingNames.includes(uniqueName)) {
      counter++;
      uniqueName = `${baseName} ${counter}`;
    }
    
    return uniqueName;
  }
  
  /**
   * Exporte l'état d'une rencontre pour sauvegarde
   */
  static exportEncounterState(encounter: {
    name: string;
    participants: EncounterParticipant[];
    currentTurn: number;
    round: number;
  }): string {
    return JSON.stringify({
      ...encounter,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }
  
  /**
   * Importe un état de rencontre depuis une sauvegarde
   */
  static importEncounterState(jsonString: string): {
    name: string;
    participants: EncounterParticipant[];
    currentTurn: number;
    round: number;
  } | null {
    try {
      const data = JSON.parse(jsonString);
      
      // Validation basique
      if (!data.name || !Array.isArray(data.participants)) {
        throw new Error('Format de données invalide');
      }
      
      return {
        name: data.name,
        participants: data.participants,
        currentTurn: data.currentTurn || 0,
        round: data.round || 1
      };
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      return null;
    }
  }
} 