// Second souffle du Guerrier (utilisations par repos court)
export const fighterSecondWindUses: number[] = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

// ============================================================================
// FIGHTER-SPECIFIC TABLES
// ============================================================================

// Nombre de dés de supériorité du Maître de bataille (4 au niv 3, 5 au niv 10, 6 au niv 18)
export const battleMasterDiceCount: number[] = [0, 0, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6]

// Type de dé de supériorité du Maître de bataille (d6 → d10 au niv 10 → d12 au niv 18)
export const battleMasterDieSize: string[] = [
    'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd10', 'd10',
    'd10', 'd10', 'd10', 'd10', 'd10', 'd10', 'd12', 'd12', 'd12'
]

// Nombre de manœuvres connues du Maître de bataille (3 au niv 3, +2 au niv 7/10/15/18)
export const battleMasterManeuversKnown: number[] = [0, 0, 3, 3, 3, 3, 5, 5, 5, 7, 7, 7, 7, 7, 9, 9, 9, 11, 11, 11]

// Tirs arcaniques de l'Archer arcanique (2 par repos court ou long)
export const arcaneArcherShots: number[] = [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]

// Esprit combatif du Samouraï (3 par repos long)
export const samuraiFightingSpirit: number[] = [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]

// Dés d'énergie psionique du Guerrier psionique (2 × bonus maîtrise)
export const psiWarriorDiceCount: number[] = [0, 0, 4, 4, 4, 4, 6, 6, 6, 6, 6, 6, 8, 8, 8, 8, 8, 8, 8, 8]

// Type de dé d'énergie psionique (d6 → d8 au niv 11 → d10 au niv 17)
export const psiWarriorDieSize: string[] = [
    'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd8',
    'd8', 'd8', 'd8', 'd8', 'd8', 'd10', 'd10', 'd10', 'd10'
]
