import { Party } from '@/lib/types';

// Classes de personnages D&D
export const CHARACTER_CLASSES = [
  'Barbare', 'Barde', 'Clerc', 'Druide', 'Ensorceleur', 'Guerrier',
  'Magicien', 'Moine', 'Occultiste', 'Paladin', 'Rôdeur', 'Roublard'
];

// Calculer le niveau moyen du groupe
export const calculateAverageLevel = (party: Party) => {
  if (party.players.length === 0) return 0;
  const sum = party.players.reduce((acc, player) => acc + player.level, 0);
  return Math.round((sum / party.players.length) * 10) / 10;
};
