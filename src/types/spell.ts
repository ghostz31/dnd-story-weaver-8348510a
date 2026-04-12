// Interface Spell compatible avec Trame
export interface Spell {
    name: string
    level: number
    school: string
    castingTime: string
    range: string
    components: string
    duration: string
    classes: string[]
    description: string
    source?: string
    ritual?: boolean
}

// Noms des écoles de magie en français
export const spellSchools: Record<string, string> = {
    'Abjuration': 'Abjuration',
    'Conjuration': 'Invocation',
    'Divination': 'Divination',
    'Enchantment': 'Enchantement',
    'Evocation': 'Évocation',
    'Illusion': 'Illusion',
    'Necromancy': 'Nécromancie',
    'Transmutation': 'Transmutation',
}

// Couleurs par école de magie
export const spellSchoolColors: Record<string, string> = {
    'Abjuration': '#3B82F6',     // blue
    'Conjuration': '#8B5CF6',    // purple
    'Divination': '#06B6D4',     // cyan
    'Enchantment': '#EC4899',    // pink
    'Evocation': '#EF4444',      // red
    'Illusion': '#A855F7',       // violet
    'Necromancy': '#6B7280',     // gray
    'Transmutation': '#F59E0B',  // amber
}

// Mapping des noms de classe EN vers FR pour le filtrage
export const classNameMapping: Record<string, string> = {
    'Barbarian': 'Barbare',
    'Bard': 'Barde',
    'Cleric': 'Clerc',
    'Druid': 'Druide',
    'Fighter': 'Guerrier',
    'Monk': 'Moine',
    'Paladin': 'Paladin',
    'Ranger': 'Rôdeur',
    'Rogue': 'Roublard',
    'Sorcerer': 'Ensorceleur',
    'Warlock': 'Occultiste',
    'Wizard': 'Magicien',
}
