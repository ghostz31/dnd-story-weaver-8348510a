// Types pour le système de Level-Up

import type { AbilityScores, AsiChoice } from './character'

export type AbilityKey = keyof AbilityScores

// Niveaux où chaque classe obtient un ASI
export const asiLevels: Record<string, number[]> = {
    default: [4, 8, 12, 16, 19],
    fighter: [4, 6, 8, 12, 14, 16, 19],
    rogue: [4, 8, 10, 12, 16, 19],
}

// Niveaux où chaque classe choisit sa subclass
export const subclassLevels: Record<string, number> = {
    cleric: 1,
    sorcerer: 1,
    warlock: 1,
    druid: 2,
    wizard: 2,
    barbarian: 3,
    bard: 3,
    fighter: 3,
    monk: 3,
    paladin: 3,
    ranger: 3,
    rogue: 3,
}

// Choix ASI possibles (aligné avec character.ts pour supporter Feats)
export type ASIChoice = AsiChoice

// Résultat du wizard Level-Up
export interface LevelUpChoices {
    newLevel: number
    hpMethod: 'roll' | 'average' | 'manual'
    hpRoll?: number  // Si roll, résultat du dé
    hpGained: number // Total PV gagnés (dé/moyenne + mod CON)
    asiChoice?: ASIChoice
    subclassId?: string // ID de la sous-classe choisie
    newSpellsSelected?: string[] // IDs des nouveaux sorts choisis
    newCantripsSelected?: string[] // IDs des nouveaux cantrips choisis
}

// États du wizard
export type LevelUpStep =
    | 'intro'
    | 'hp'
    | 'subclass' // Nouvel état
    | 'asi'
    | 'spells'
    | 'confirm'

// Informations calculées pour le level-up
export interface LevelUpInfo {
    currentLevel: number
    newLevel: number
    hitDie: number
    conModifier: number
    averageHp: number  // (hitDie / 2) + 1
    proficiencyBonusCurrent: number
    proficiencyBonusNew: number
    hasASI: boolean
    hasSubclassChoice: boolean // Nouveau drapeau
    // Pour les casters
    newCantripsCount: number  // Nombre de nouveaux cantrips à choisir
    newSpellsCount: number    // Nombre de nouveaux sorts à choisir
    newSpellSlotLevel?: number // Nouveau niveau de sort débloqué
}

// Calcul du bonus de maîtrise
export function getProficiencyBonus(level: number): number {
    if (level <= 4) return 2
    if (level <= 8) return 3
    if (level <= 12) return 4
    if (level <= 16) return 5
    return 6
}

// Vérifie si le niveau donne un ASI pour cette classe
export function hasASIAtLevel(classId: string, level: number): boolean {
    const levels = asiLevels[classId] || asiLevels.default
    return levels.includes(level)
}

// Calcul de la moyenne de PV gagnés
export function getAverageHpGain(hitDie: number): number {
    return Math.floor(hitDie / 2) + 1
}
