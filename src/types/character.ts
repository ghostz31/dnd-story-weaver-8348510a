// Types for D&D 5e Character

export interface AbilityScores {
    str: number
    dex: number
    con: number
    int: number
    wis: number
    cha: number
}

export interface Character {
    id: string
    name: string
    race: Race
    subrace?: string
    class: CharacterClass
    subclass?: string
    level: number
    background: string
    alignment: string

    // Core Stats
    abilityScores: AbilityScores
    hp: {
        current: number
        max: number
        temp: number
    }
    ac: number
    initiative: number
    speed: number
    proficiencyBonus: number

    // Skills & Proficiencies
    skillProficiencies: string[]
    savingThrowProficiencies: string[]
    languages: string[]
    toolProficiencies: string[]

    // Equipment
    equipment: InventoryItem[]
    currency: Currency

    // Spells (if spellcaster)
    spellcasting?: SpellcastingInfo

    // Backstory
    personalityTraits: string
    ideals: string
    bonds: string
    flaws: string
    backstory: string

    // Meta
    createdAt: Date
    updatedAt: Date

    // Dons (Feats) — IDs des dons sélectionnés
    feats?: string[]

    // Choix ASI pour calcul final (optionnel, pour l'historique)
    asiChoices?: Record<number, AsiChoice>
}

export interface AsiChoice {
    type: 'feat' | 'stats'
    featId?: string
    stats?: Partial<AbilityScores>
}

export interface CharacterCreation {
    name: string
    race: Race | null
    subrace: string | null
    characterClass: CharacterClass | null
    abilityScores: AbilityScores
    background: string | null
    skillProficiencies: string[]
    alignment: string
    personalityTraits: string
    ideals: string
    bonds: string
    flaws: string
    level: number
    languages: string[]
    classOptions: Record<string, string>
    selectedSpells: string[]
    // Nouveaux champs pour ASI/Feats
    asiChoices: Record<number, AsiChoice>
}

export type RaceSource = 'PHB' | 'XGtE' | 'TCoE'

export interface Race {
    id: string
    name: string
    nameEn: string
    /** Source officielle du livre de règles */
    source?: RaceSource
    abilityBonuses: Partial<AbilityScores>
    /** Nombre de points de caractéristique libres (TCoE custom lineage) */
    customAbilityBonuses?: number
    speed: number
    size: 'Très petit' | 'Petit' | 'Moyen' | 'Grand'
    traits: string[]
    /** Descriptions détaillées des traits raciaux (inline, pour XGtE/TCoE) */
    traitDetails?: Record<string, string>
    languages: string[]
    subraces?: Subrace[]
}

export interface Subrace {
    id: string
    name: string
    abilityBonuses: Partial<AbilityScores>
    traits: string[]
}

export interface CharacterClass {
    id: string
    name: string
    nameEn: string
    hitDie: number
    primaryAbility: keyof AbilityScores
    savingThrows: (keyof AbilityScores)[]
    skillChoices: string[]
    numSkillChoices: number
    armorProficiencies: string[]
    weaponProficiencies: string[]
    startingEquipment: string[]
    spellcasting?: {
        ability: keyof AbilityScores
        cantripsKnown: number[]
        spellsKnown?: number[]
        spellSlots: number[][]
    }
}

export interface InventoryItem {
    id: string
    name: string
    quantity: number
    weight: number
    equipped: boolean
    attunement?: boolean
    description?: string
    type: 'weapon' | 'armor' | 'gear' | 'consumable' | 'treasure' | 'other'
}

export interface Currency {
    pp: number
    gp: number
    ep: number
    sp: number
    cp: number
}

export interface SpellcastingInfo {
    ability: keyof AbilityScores
    spellSaveDC: number
    spellAttackBonus: number
    spellSlots: { level: number; current: number; max: number }[]
    knownSpells: Spell[]
    preparedSpells: string[] // IDs of prepared spells
}

export interface Spell {
    id: string
    name: string
    level: number
    school: string
    castingTime: string
    range: string
    components: string
    duration: string
    description: string
    ritual?: boolean
    concentration?: boolean
}

// Wizard steps type
export type WizardStep =
    | 'name'
    | 'race'
    | 'class'
    | 'abilities'
    | 'proficiencies'
    | 'options'
    | 'spells'
    | 'background'
    | 'equipment'
    | 'review'
