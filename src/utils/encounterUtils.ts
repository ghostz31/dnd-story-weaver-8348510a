
export interface Monster {
  name: string;
  cr: number;
  xp: number;
  type: string;
  size: string;
  environment: string[];
  source: string;
  ac?: number;
  hp?: string;
  speed?: string;
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  skills?: string[];
  damageResistances?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  senses?: string;
  languages?: string;
  actions?: Array<{
    name: string;
    description: string;
  }>;
}

export interface EncounterSettings {
  partySize: number;
  partyLevel: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  environment?: string;
  encounterType: 'combat' | 'exploration' | 'social';
}

export interface GeneratedEncounter {
  monsters: Array<{
    monster: Monster;
    quantity: number;
  }>;
  totalXP: number;
  adjustedXP: number;
  difficulty: string;
  environment: string;
  tactics?: string;
  terrain?: string;
  treasure?: string;
}

// Tables XP par niveau et difficulté (Manuel des Règles)
export const XP_THRESHOLDS: { [key: number]: { easy: number; medium: number; hard: number; deadly: number } } = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

// Multiplicateurs d'encounter en fonction du nombre de monstres
export const getEncounterMultiplier = (monsterCount: number, partySize: number): number => {
  let multiplier: number;
  
  if (monsterCount === 1) multiplier = 1;
  else if (monsterCount === 2) multiplier = 1.5;
  else if (monsterCount <= 6) multiplier = 2;
  else if (monsterCount <= 10) multiplier = 2.5;
  else if (monsterCount <= 14) multiplier = 3;
  else multiplier = 4;

  // Ajustement selon la taille du groupe
  if (partySize < 3) multiplier *= 1.5;
  else if (partySize > 5) multiplier *= 0.5;

  return multiplier;
};

// Calcul du budget XP pour une rencontre
export const calculateXPBudget = (partyLevel: number, partySize: number, difficulty: string): number => {
  const threshold = XP_THRESHOLDS[Math.min(partyLevel, 20)];
  if (!threshold) return 0;
  
  const baseXP = threshold[difficulty as keyof typeof threshold] || threshold.medium;
  return baseXP * partySize;
};

// Déterminer la difficulté réelle d'une rencontre
export const calculateActualDifficulty = (adjustedXP: number, partyLevel: number, partySize: number): string => {
  const thresholds = XP_THRESHOLDS[Math.min(partyLevel, 20)];
  if (!thresholds) return 'inconnue';
  
  const partyThresholds = {
    easy: thresholds.easy * partySize,
    medium: thresholds.medium * partySize,
    hard: thresholds.hard * partySize,
    deadly: thresholds.deadly * partySize,
  };
  
  if (adjustedXP >= partyThresholds.deadly) return 'mortelle';
  if (adjustedXP >= partyThresholds.hard) return 'difficile';
  if (adjustedXP >= partyThresholds.medium) return 'moyenne';
  if (adjustedXP >= partyThresholds.easy) return 'facile';
  return 'triviale';
};

// Conversion CR en XP
export const crToXP = (cr: number): number => {
  const crXPTable: { [key: number]: number } = {
    0: 10,
    0.125: 25,
    0.25: 50,
    0.5: 100,
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900,
    11: 7200,
    12: 8400,
    13: 10000,
    14: 11500,
    15: 13000,
    16: 15000,
    17: 18000,
    18: 20000,
    19: 22000,
    20: 25000,
    21: 33000,
    22: 41000,
    23: 50000,
    24: 62000,
    25: 75000,
    26: 90000,
    27: 105000,
    28: 120000,
    29: 135000,
    30: 155000,
  };
  
  return crXPTable[cr] || 0;
};

// Validation d'une rencontre
export const validateEncounter = (encounter: GeneratedEncounter, settings: EncounterSettings): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  const targetXP = calculateXPBudget(settings.partyLevel, settings.partySize, settings.difficulty);
  const variance = Math.abs(encounter.adjustedXP - targetXP) / targetXP;
  
  if (variance > 0.5) {
    warnings.push(`L'XP ajusté (${encounter.adjustedXP}) s'écarte significativement de la cible (${targetXP})`);
  }
  
  const monsterCount = encounter.monsters.reduce((sum, m) => sum + m.quantity, 0);
  if (monsterCount > settings.partySize + 3) {
    warnings.push('Beaucoup de créatures peuvent ralentir le combat');
    suggestions.push('Considérez réduire le nombre de créatures ou utiliser des créatures plus puissantes');
  }
  
  if (monsterCount === 1 && settings.partySize > 4) {
    suggestions.push('Un seul ennemi contre un grand groupe peut être submergé rapidement');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions,
  };
};

// Générateur de tactiques pour la rencontre
export const generateTactics = (encounter: GeneratedEncounter): string => {
  const monsterCount = encounter.monsters.reduce((sum, m) => sum + m.quantity, 0);
  const hasMultipleTypes = encounter.monsters.length > 1;
  
  const tactics: string[] = [];
  
  if (monsterCount === 1) {
    tactics.push("La créature se concentre sur le personnage le plus menaçant");
    tactics.push("Utilise l'environnement à son avantage");
  } else if (hasMultipleTypes) {
    tactics.push("Les créatures les plus faibles restent en arrière");
    tactics.push("Coordination entre les différents types d'ennemis");
  } else {
    tactics.push("Les créatures attaquent en meute");
    tactics.push("Tentent d'encercler les personnages");
  }
  
  if (encounter.difficulty === 'mortelle' || encounter.difficulty === 'difficile') {
    tactics.push("Les ennemis utilisent des tactiques avancées");
    tactics.push("Retraite stratégique si les choses tournent mal");
  }
  
  return tactics.join('. ') + '.';
};
