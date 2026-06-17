import { Party, EncounterMonster, getEncounterMultiplier, xpThresholds } from '../types';

// Fonction pour calculer l'XP à partir du CR
export function calculateXPFromCR(cr: number): number {
  if (cr <= 0) return 10;
  if (cr <= 0.25) return 50;
  if (cr <= 0.5) return 100;
  if (cr <= 1) return 200;
  if (cr <= 2) return 450;
  if (cr <= 3) return 700;
  if (cr <= 4) return 1100;
  if (cr <= 5) return 1800;
  if (cr <= 6) return 2300;
  if (cr <= 7) return 2900;
  if (cr <= 8) return 3900;
  if (cr <= 9) return 5000;
  if (cr <= 10) return 5900;
  if (cr <= 11) return 7200;
  if (cr <= 12) return 8400;
  if (cr <= 13) return 10000;
  if (cr <= 14) return 11500;
  if (cr <= 15) return 13000;
  if (cr <= 16) return 15000;
  if (cr <= 17) return 18000;
  if (cr <= 18) return 20000;
  if (cr <= 19) return 22000;
  if (cr <= 20) return 25000;
  if (cr <= 21) return 33000;
  if (cr <= 22) return 41000;
  if (cr <= 23) return 50000;
  if (cr <= 24) return 62000;
  if (cr <= 25) return 75000;
  if (cr <= 26) return 90000;
  if (cr <= 27) return 105000;
  if (cr <= 28) return 120000;
  if (cr <= 29) return 135000;
  return 155000;
}

// Calculer la difficulté d'une rencontre
export const calculateEncounterDifficulty = (
  party: Party,
  monsters: EncounterMonster[]
): { totalXP: number; adjustedXP: number; difficulty: 'easy' | 'medium' | 'hard' | 'deadly' } => {
  // Calculer l'XP total des monstres
  const totalXP = monsters.reduce((sum, { monster, quantity }) => sum + monster.xp * quantity, 0);

  // Appliquer le multiplicateur selon le nombre de monstres
  const monsterCount = monsters.reduce((count, { quantity }) => count + quantity, 0);
  const multiplier = getEncounterMultiplier(monsterCount, party.players.length);
  const adjustedXP = Math.floor(totalXP * multiplier);

  // Calculer les seuils de difficulté pour le groupe
  const partyThresholds = {
    easy: 0,
    medium: 0,
    hard: 0,
    deadly: 0
  };

  // Additionner les seuils de chaque joueur
  party.players.forEach(player => {
    const level = Math.min(player.level, 20); // Maximum level 20
    const threshold = xpThresholds[level];

    partyThresholds.easy += threshold.easy;
    partyThresholds.medium += threshold.medium;
    partyThresholds.hard += threshold.hard;
    partyThresholds.deadly += threshold.deadly;
  });

  // Déterminer la difficulté
  let difficulty: 'easy' | 'medium' | 'hard' | 'deadly';

  if (adjustedXP >= partyThresholds.deadly) {
    difficulty = 'deadly';
  } else if (adjustedXP >= partyThresholds.hard) {
    difficulty = 'hard';
  } else if (adjustedXP >= partyThresholds.medium) {
    difficulty = 'medium';
  } else {
    difficulty = 'easy';
  }

  return { totalXP, adjustedXP, difficulty };
};
