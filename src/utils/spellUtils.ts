import type { Spell } from '../types/spell'
import type { CharacterClass } from '../types/character'

/**
 * Retourne le niveau maximum de sort accessible pour une classe à un niveau donné
 */
export function getMaxSpellLevel(characterClass: CharacterClass | null, level: number): number {
    if (!characterClass?.spellcasting) return -1 // Pas de sorts

    const slots = characterClass.spellcasting.spellSlots[level - 1] || []
    // Le niveau max est le nombre d'éléments dans le tableau des slots
    return slots.length
}

/**
 * Retourne les emplacements de sorts pour une classe à un niveau donné
 * Index 0 = niveau 1, Index 1 = niveau 2, etc.
 */
export function getSpellSlots(characterClass: CharacterClass | null, level: number): number[] {
    if (!characterClass?.spellcasting) return []
    return characterClass.spellcasting.spellSlots[level - 1] || []
}

/**
 * Retourne le nombre de cantrips connus pour une classe à un niveau donné
 */
export function getCantripsKnown(characterClass: CharacterClass | null, level: number): number {
    if (!characterClass?.spellcasting) return 0
    return characterClass.spellcasting.cantripsKnown?.[level - 1] || 0
}

/**
 * Retourne le nombre de sorts connus (pour les classes à sorts connus)
 */
export function getSpellsKnown(characterClass: CharacterClass | null, level: number): number | null {
    if (!characterClass?.spellcasting?.spellsKnown) return null
    return characterClass.spellcasting.spellsKnown[level - 1] || 0
}

/**
 * Filtre les sorts par classe (utilise le nom anglais de la classe)
 */
export function filterSpellsByClass(spells: Spell[], classNameEn: string): Spell[] {
    return spells.filter(spell =>
        spell.classes?.some(c => c.toLowerCase() === classNameEn.toLowerCase())
    )
}

/**
 * Filtre les sorts par niveau maximum
 * maxLevel = 0 pour cantrips uniquement
 * maxLevel = 1 pour cantrips + niveau 1
 */
export function filterSpellsByMaxLevel(spells: Spell[], maxLevel: number): Spell[] {
    return spells.filter(spell => spell.level <= maxLevel)
}

/**
 * Groupe les sorts par niveau
 */
export function groupSpellsByLevel(spells: Spell[]): Map<number, Spell[]> {
    const grouped = new Map<number, Spell[]>()

    spells.forEach(spell => {
        const existing = grouped.get(spell.level) || []
        existing.push(spell)
        grouped.set(spell.level, existing)
    })

    // Trier les sorts alphabétiquement dans chaque groupe
    grouped.forEach((spellList, level) => {
        grouped.set(level, spellList.sort((a, b) => a.name.localeCompare(b.name, 'fr')))
    })

    return grouped
}

/**
 * Retourne le label du niveau de sort
 */
export function getSpellLevelLabel(level: number): string {
    if (level === 0) return 'Cantrips'
    return `Niveau ${level}`
}

/**
 * Vérifie si une classe est un lanceur de sorts
 */
export function isSpellcaster(characterClass: CharacterClass | null): boolean {
    return !!characterClass?.spellcasting
}

/**
 * Retourne le type de gestion des sorts pour une classe:
 * - 'known': classe à sorts connus (Barde, Ensorceleur, Rôdeur, Occultiste, Magicien) — nombre fixe via spellsKnown
 * - 'prepared': classe à sorts préparés (Clerc, Druide, Paladin) — prépare mod+niveau depuis toute la liste
 */
export function getSpellcastingType(characterClass: CharacterClass | null): 'known' | 'prepared' | 'spellbook' | null {
    if (!characterClass?.spellcasting) return null
    
    // Magicien a un grimoire
    if (characterClass.id === 'wizard') {
        return 'spellbook'
    }
    
    // Classes à sorts préparés (pas de choix de sorts au level-up)
    const preparedClasses = ['cleric', 'druid', 'paladin']
    if (preparedClasses.includes(characterClass.id)) {
        return 'prepared'
    }
    
    // Toutes les autres classes avec spellcasting ont des sortsKnown
    return 'known'
}

/**
 * Retourne le nombre max de sorts connus (hors cantrips) pour une classe à un niveau donné.
 * - Magicien (grimoire): 6 + 2*(niveau-1)
 * - Classes à sorts connus: spellsKnown[niveau-1]
 * - Classes à sorts préparés: null (pas de limite de "connus")
 */
export function getMaxKnownSpells(characterClass: CharacterClass | null, level: number): number | null {
    if (!characterClass?.spellcasting) return 0
    const type = getSpellcastingType(characterClass)

    if (type === 'spellbook') {
        // Magicien: 6 sorts au niveau 1, +2 par niveau supplémentaire
        return 6 + 2 * (level - 1)
    }

    if (type === 'known' && characterClass.spellcasting.spellsKnown) {
        return characterClass.spellcasting.spellsKnown[level - 1] || 0
    }

    // Classes à sorts préparés — pas de limite de "connus"
    return null
}

/**
 * Retourne le nombre max de sorts préparables pour une classe à un niveau donné.
 * - Clerc/Druide: mod(SAG) + niveau (min 1)
 * - Paladin: mod(CHA) + ½ niveau arrondi inf (min 1)
 * - Magicien: mod(INT) + niveau (min 1)
 * - Classes à sorts connus: null (tous les sorts connus sont disponibles)
 */
export function getMaxPreparedSpells(
    characterClass: CharacterClass | null,
    level: number,
    abilityMod: number
): number | null {
    if (!characterClass?.spellcasting) return 0
    const type = getSpellcastingType(characterClass)

    if (type === 'known') {
        // Classes à sorts connus — pas de préparation, tous les sorts connus sont utilisables
        return null
    }

    if (type === 'spellbook' || type === 'prepared') {
        if (characterClass.id === 'paladin') {
            return Math.max(1, abilityMod + Math.floor(level / 2))
        }
        return Math.max(1, abilityMod + level)
    }

    return null
}
