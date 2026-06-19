// ============================================================================
// DRUID-SPECIFIC TABLES
// ============================================================================

// FP maximum de Forme sauvage (0 avant niv 2)
export const druidWildShapeMaxCR: number[] = [0, 0, 0.25, 0.25, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

// Nombre d'utilisations de Forme sauvage (2 à partir du niv 2, illimité au niv 20)
export const druidWildShapeUses: number[] = [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 999]

// Restriction de vol pour Forme sauvage (débloqué au niv 8)
export const druidWildShapeCanFly: boolean[] = [
    false, false, false, false, false, false, false, false,
    true, true, true, true, true, true, true, true, true, true, true, true
]

// Restriction de forme aquatique (débloquée au niv 4)
export const druidWildShapeCanSwim: boolean[] = [
    false, false, false, false,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true
]
