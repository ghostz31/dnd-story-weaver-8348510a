// Types pour l'application Trame

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  subscriptionPlan: 'free' | 'premium';
  createdAt: string;
  lastLogin: string;
}

export interface Player {
  id: string;
  name: string;
  level: number;
  characterClass: string;
  race?: string;
  ac?: number;
  currentHp?: number;
  maxHp?: number;
  // Caractéristiques pour l'import D&D Beyond
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  speed?: string[]; // Vitesse (ex: ["9m", "Vol 18m"])
  initiative?: number; // Modificateur d'initiative
  dndBeyondId?: string; // ID pour la synchro live
}

export interface Party {
  id: string;
  name: string;
  players: Player[];
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  parties: number;
  encounters: number;
  maxParties: number;
  maxEncounters: number;
}

export interface Monster {
  id: string;
  name: string;
  originalName?: string;
  cr?: number;
  challengeRating?: number;
  xp: number;
  type: string;
  size: string;
  source: string;
  custom?: boolean;
  image?: string;
  alignment?: string;
  environment?: string[];
  legendary?: boolean;
  ac?: number;
  hp?: number;
  speed?: {
    walk?: number;
    fly?: number;
    swim?: number;
    climb?: number;
  };
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
}

export interface EncounterMonster {
  monster: Monster;
  quantity: number;
}

export interface Encounter {
  id: string;
  name: string;
  description?: string;
  environment?: string;
  monsters: EncounterMonster[];
  participants?: EncounterParticipant[];
  party?: Party;
  partyId?: string;
  partyLevel?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  totalXP?: number;
  adjustedXP?: number;
  status?: 'draft' | 'active' | 'completed';
  round?: number;
  currentTurn?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tables de difficulté par niveau (DMG)
export const xpThresholds: Record<number, Record<string, number>> = {
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
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
};

// Multiplicateurs pour les groupes de monstres
export const encounterMultipliers: Record<string, number> = {
  single: 1,
  pair: 1.5,
  group: 2,
  large: 2.5,
  horde: 3,
  massive: 4
};

export const getEncounterMultiplier = (monsterCount: number, partySize: number): number => {
  if (monsterCount === 0) return 0;
  if (monsterCount === 1) return 1;
  if (monsterCount === 2) return 1.5;
  if (monsterCount >= 3 && monsterCount <= 6) return 2;
  if (monsterCount >= 7 && monsterCount <= 10) return 2.5;
  if (monsterCount >= 11 && monsterCount <= 14) return 3;
  return 4; // 15+
};

export const environments = [
  { value: 'all', label: 'Tous' },
  { value: 'air', label: 'Air' },
  { value: 'aquatique', label: 'Aquatique' },
  { value: 'colline', label: 'Collines' },
  { value: 'désert', label: 'Désert' },
  { value: 'donjon', label: 'Donjon' },
  { value: 'forêt', label: 'Forêt' },
  { value: 'marais', label: 'Marais' },
  { value: 'montagne', label: 'Montagne' },
  { value: 'plans élémentaires', label: 'Plans élémentaires' },
  { value: 'plans inférieurs', label: 'Plans inférieurs' },
  { value: 'plaine', label: 'Plaine' },
  { value: 'route', label: 'Route' },
  { value: 'ruine', label: 'Ruine' },
  { value: 'souterrain', label: 'Souterrain' },
  { value: 'temple', label: 'Temple' },
  { value: 'urbain', label: 'Urbain' },
  { value: 'volcan', label: 'Volcan' }
];

export const monsterCategories = [
  { value: 'all', label: 'Tous' },
  { value: 'monstre', label: 'Monstres' },
  { value: 'animal', label: 'Animaux' },
  { value: 'pnj', label: 'PNJ' }
];

export const monsterTypes = [
  { value: 'all', label: 'Tous' },
  { value: 'Humanoïde', label: 'Humanoïde' },
  { value: 'Aberration', label: 'Aberration' },
  { value: 'Artificiel', label: 'Artificiel' },
  { value: 'Bête', label: 'Bête' },
  { value: 'Céleste', label: 'Céleste' },
  { value: 'Dragon', label: 'Dragon' },
  { value: 'Élémentaire', label: 'Élémentaire' },
  { value: 'Fée', label: 'Fée' },
  { value: 'Fiélon', label: 'Fiélon' },
  { value: 'Géant', label: 'Géant' },
  { value: 'Monstruosité', label: 'Monstruosité' },
  { value: 'Mort-vivant', label: 'Mort-vivant' },
  { value: 'Plante', label: 'Plante' },
  { value: 'Vase', label: 'Vase' }
];

export const monsterSizes = [
  { value: 'all', label: 'Toutes' },
  { value: 'TP', label: 'TP' },
  { value: 'P', label: 'P' },
  { value: 'M', label: 'M' },
  { value: 'G', label: 'G' },
  { value: 'TG', label: 'TG' },
  { value: 'Gig', label: 'Gig' }
];

export interface EncounterParticipant {
  id: string;
  name: string;
  originalName?: string;
  initiative: number;
  ac: number;
  currentHp: number;
  maxHp: number;
  isPC: boolean;
  conditions: string[];
  notes: string;
  cr?: string | number;
  type?: string;
  size?: string;
  speed?: string[];
  alignment?: string;
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  actions?: any[];
  traits?: any[];
  dndBeyondId?: string; // ID pour la synchro live
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  classes: string[];
  description: string;
  source?: string;
  ritual?: boolean;
} 