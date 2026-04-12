/**
 * Sorts de sous-classes (toujours préparés, ne comptent pas dans la limite)
 *
 * Chaque sous-classe accorde des sorts supplémentaires à certains niveaux.
 * Ces sorts sont automatiquement préparés et ne comptent pas dans le nombre
 * de sorts que le personnage peut préparer.
 *
 * Les noms correspondent exactement à ceux de spells-complete.json (AideDD)
 */

export interface SubclassSpellEntry {
    /** Niveau de personnage auquel les sorts sont acquis */
    characterLevel: number
    /** Noms des sorts (FR, correspondant à spells-complete.json) */
    spells: string[]
}

export interface SubclassSpellList {
    subclassId: string
    classId: string
    /** Label affiché (ex: "Sorts de serment", "Sorts de domaine") */
    label: string
    entries: SubclassSpellEntry[]
}

// ═══════════════════════════════════════════════
// PALADIN — Sorts de serment
// ═══════════════════════════════════════════════

const devotionSpells: SubclassSpellList = {
    subclassId: 'devotion',
    classId: 'paladin',
    label: 'Sorts de serment',
    entries: [
        { characterLevel: 3, spells: ['Protection contre le mal et le bien', 'Sanctuaire'] },
        { characterLevel: 5, spells: ['Restauration partielle', 'Zone de vérité'] },
        { characterLevel: 9, spells: ['Lueur d\'espoir', 'Dissipation de la magie'] },
        { characterLevel: 13, spells: ['Gardien de la foi', 'Liberté de mouvement'] },
        { characterLevel: 17, spells: ['Communion', 'Colonne de flamme'] },
    ],
}

const vengeanceSpells: SubclassSpellList = {
    subclassId: 'vengeance',
    classId: 'paladin',
    label: 'Sorts de serment',
    entries: [
        { characterLevel: 3, spells: ['Fléau', 'Marque du chasseur'] },
        { characterLevel: 5, spells: ['Immobilisation de personne', 'Foulée brumeuse'] },
        { characterLevel: 9, spells: ['Hâte', 'Protection contre une énergie'] },
        { characterLevel: 13, spells: ['Bannissement', 'Frappe piégeuse'] },
        { characterLevel: 17, spells: ['Immobilisation de monstre', 'Scrutation'] },
    ],
}

// ═══════════════════════════════════════════════
// CLERC — Sorts de domaine
// ═══════════════════════════════════════════════

const lifeDomainSpells: SubclassSpellList = {
    subclassId: 'life',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Bénédiction', 'Soins'] },
        { characterLevel: 3, spells: ['Restauration partielle', 'Arme spirituelle'] },
        { characterLevel: 5, spells: ['Lueur d\'espoir', 'Retour à la vie'] },
        { characterLevel: 7, spells: ['Gardien de la foi', 'Protection contre la mort'] },
        { characterLevel: 9, spells: ['Soins de groupe', 'Rappel à la vie'] },
    ],
}

const warDomainSpells: SubclassSpellList = {
    subclassId: 'war',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Bouclier de la foi', 'Faveur divine'] },
        { characterLevel: 3, spells: ['Arme magique', 'Arme spirituelle'] },
        { characterLevel: 5, spells: ['Aura du croisé', 'Esprits gardiens'] },
        { characterLevel: 7, spells: ['Gardien de la foi', 'Liberté de mouvement'] },
        { characterLevel: 9, spells: ['Colonne de flamme', 'Immobilisation de monstre'] },
    ],
}

const lightDomainSpells: SubclassSpellList = {
    subclassId: 'light',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Mains brûlantes', 'Lueurs féeriques'] },
        { characterLevel: 3, spells: ['Sphère de feu', 'Rayon ardent'] },
        { characterLevel: 5, spells: ['Boule de feu', 'Lumière du jour'] },
        { characterLevel: 7, spells: ['Gardien de la foi', 'Mur de feu'] },
        { characterLevel: 9, spells: ['Colonne de flamme', 'Scrutation'] },
    ],
}

// ═══════════════════════════════════════════════
// DRUIDE — Sorts de cercle
// ═══════════════════════════════════════════════

const landForestSpells: SubclassSpellList = {
    subclassId: 'land',
    classId: 'druid',
    label: 'Sorts de cercle (Forêt)',
    entries: [
        { characterLevel: 3, spells: ['Peau d\'écorce', 'Pattes d\'araignée'] },
        { characterLevel: 5, spells: ['Appel de la foudre', 'Croissance végétale'] },
        { characterLevel: 7, spells: ['Divination', 'Liberté de mouvement'] },
        { characterLevel: 9, spells: ['Communion avec la nature', 'Passage par les arbres'] },
    ],
}

const moonCircleSpells: SubclassSpellList = {
    subclassId: 'moon',
    classId: 'druid',
    label: 'Sorts de cercle',
    entries: [
        // Le Cercle de la Lune n'a pas de sorts de cercle supplémentaires
        // mais améliore la Forme sauvage — les sorts sont gérés par les features
    ],
}

// ═══════════════════════════════════════════════
// Registre complet
// ═══════════════════════════════════════════════

export const allSubclassSpells: SubclassSpellList[] = [
    // Paladin
    devotionSpells,
    vengeanceSpells,
    // Clerc
    lifeDomainSpells,
    warDomainSpells,
    lightDomainSpells,
    // Druide
    landForestSpells,
    moonCircleSpells,
]

/**
 * Récupère les sorts de sous-classe "toujours préparés" pour un personnage
 * @param subclassId ID de la sous-classe
 * @param characterLevel Niveau actuel du personnage
 * @returns Liste des noms de sorts toujours préparés
 */
export function getAlwaysPreparedSpells(subclassId: string | undefined, characterLevel: number): string[] {
    if (!subclassId) return []

    const subclassSpellList = allSubclassSpells.find(s => s.subclassId === subclassId)
    if (!subclassSpellList) return []

    const spellNames: string[] = []
    for (const entry of subclassSpellList.entries) {
        if (characterLevel >= entry.characterLevel) {
            spellNames.push(...entry.spells)
        }
    }
    return spellNames
}

/**
 * Récupère le label du type de sorts de sous-classe
 */
export function getSubclassSpellLabel(subclassId: string | undefined): string {
    if (!subclassId) return 'Sorts de sous-classe'
    const subclassSpellList = allSubclassSpells.find(s => s.subclassId === subclassId)
    return subclassSpellList?.label ?? 'Sorts de sous-classe'
}

/**
 * Vérifie si un sort est un sort de sous-classe toujours préparé
 */
export function isAlwaysPreparedSpell(spellName: string, subclassId: string | undefined, characterLevel: number): boolean {
    const alwaysPrepared = getAlwaysPreparedSpells(subclassId, characterLevel)
    return alwaysPrepared.includes(spellName)
}
