import type { Spell } from '../types/spell'

/**
 * Cache global pour les sorts chargés depuis spells-complete.json
 */
let spellsCache: Spell[] | null = null
let loadingPromise: Promise<Spell[]> | null = null

/**
 * Charge tous les sorts depuis spells-complete.json (avec cache)
 */
export async function loadAllSpells(): Promise<Spell[]> {
    if (spellsCache) return spellsCache

    if (loadingPromise) return loadingPromise

    loadingPromise = fetch('/data/spells-complete.json')
        .then(res => res.json())
        .then((data: Spell[]) => {
            spellsCache = data
            return data
        })
        .catch(err => {
            console.error('Error loading spells:', err)
            loadingPromise = null
            return []
        })

    return loadingPromise
}

/**
 * Retourne les sorts en cache (synchrone). Retourne [] si pas encore chargés.
 * Utile pour les composants qui font un useEffect pour charger.
 */
export function getCachedSpells(): Spell[] {
    return spellsCache || []
}

/**
 * Filtre les sorts par nom de classe (FR) et niveau max
 */
export function getSpellsForClass(allSpells: Spell[], className: string, maxLevel: number): Spell[] {
    return allSpells.filter(spell =>
        spell.level <= maxLevel &&
        spell.classes?.some(c => c === className)
    )
}

/**
 * Récupère un sort par son nom exact
 */
export function getSpellByName(allSpells: Spell[], name: string): Spell | undefined {
    return allSpells.find(s => s.name === name)
}

/**
 * Mapping des IDs de classes vers le nom FR utilisé dans spells-complete.json
 */
export const classIdToSpellClassName: Record<string, string> = {
    barbarian: '', // Pas de sorts
    bard: 'Barde',
    cleric: 'Clerc',
    druid: 'Druide',
    fighter: '', // Pas de sorts (sauf Chevalier Occulte → Magicien)
    monk: '', // Pas de sorts
    paladin: 'Paladin',
    ranger: 'Rôdeur',
    rogue: '', // Pas de sorts (sauf Escroc Arcanique → Magicien)
    sorcerer: 'Ensorceleur',
    warlock: 'Occultiste',
    wizard: 'Magicien',
}

/**
 * Mapping spécial pour les sous-classes incantateurs tiers
 * Ces sous-classes utilisent la liste de sorts d'une autre classe
 */
export const thirdCasterSubclasses: Record<string, string> = {
    eldritch_knight: 'Magicien',
    arcane_trickster: 'Magicien',
}
