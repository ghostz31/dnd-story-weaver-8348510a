import type { Character } from '../types/character'
import type { WildShapeBeast } from '../types/wild-shape'
import { getAvailableBeasts } from '../data/bestiary'

export interface WildShapeState {
    active: boolean
    beastId: string | null
    beast: WildShapeBeast | null
    tempHp: number // PV temporaires = PV de la bête
}

/**
 * Retourne la liste des bêtes disponibles pour un druide donné.
 */
export function getWildShapeOptions(
    level: number,
    subclass?: string,
    canFly = false,
    canSwim = false
): WildShapeBeast[] {
    return getAvailableBeasts(level, subclass, canFly, canSwim)
}

/**
 * Applique la transformation en forme sauvage.
 * Le personnage conserve :
 *   - SAG, INT, CHA
 *   - Bonus de maîtrise
 *   - Jets de sauvegarde maîtrisés
 *   - Compétences maîtrisées
 * La bête fournit :
 *   - FOR, DEX, CON
 *   - PV, CA, Vitesse
 *   - Attaques naturelles
 */
export function applyWildShape(
    character: Character,
    beast: WildShapeBeast
): Character {
    return {
        ...character,
        hp: {
            current: beast.hp,
            max: beast.hp,
            temp: 0,
        },
        ac: beast.ac,
        speed: beast.speed.walk,
        abilityScores: {
            str: beast.abilityScores.str,
            dex: beast.abilityScores.dex,
            con: beast.abilityScores.con,
            int: character.abilityScores.int,
            wis: character.abilityScores.wis,
            cha: character.abilityScores.cha,
        },
        // On garde les attaques manuelles mais on ajoutera les attaques naturelles
        // dans le combat engine
    }
}

/**
 * Vérifie si le druide peut utiliser la Forme sauvage.
 */
export function canWildShape(level: number): boolean {
    return level >= 2
}

/**
 * Nombre d'utilisations de Forme sauvage.
 */
export function getWildShapeUses(level: number): number {
    if (level < 2) return 0
    if (level >= 20) return Infinity
    return 2
}

/**
 * FP maximum autorisé en Forme sauvage.
 */
export function getWildShapeMaxCR(level: number, isMoonDruid = false): number {
    if (level < 2) return 0
    if (isMoonDruid) {
        if (level >= 6) return Math.floor(level / 3)
        return 1
    }
    if (level < 4) return 0.25
    if (level < 8) return 0.5
    return 1
}

/**
 * Le druide peut voler en Forme sauvage ?
 */
export function canWildShapeFly(level: number): boolean {
    return level >= 8
}

/**
 * Le druide peut nager en Forme sauvage ?
 */
export function canWildShapeSwim(level: number): boolean {
    return level >= 4
}
