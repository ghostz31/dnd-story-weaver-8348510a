// Types for D&D 5e Character
import type { InventoryItem, Currency } from './inventory'

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

    // Actions
    actionsPerTurn: number      // 1 par défaut, Monk=2+ avec Flurry
    bonusActionsPerTurn: number // 1 par défaut, monk peut avoir plus
    reactionsPerTurn: number    // 1 par défaut

    // Skills & Proficiencies
    skillProficiencies: string[]
    // Compétences avec expertise (double bonus de maîtrise)
    expertiseSkills?: string[]
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

    // Notes de session
    sessionNotes?: SessionNote[]

    // Meta
    createdAt: Date
    updatedAt: Date

    // Dons (Feats) — IDs des dons sélectionnés
    feats?: string[]

    // Choix ASI pour calcul final (optionnel, pour l'historique)
    asiChoices?: Record<number, AsiChoice>

    // Attribution des bonus raciaux libres TCoE (ex: Fée +2/+1 à choisir)
    customAbilityBonuses?: Partial<AbilityScores>

    // Conditions actives (combat)
    activeConditions?: string[]
    // Niveau d'épuisement (1-6, remplace l'approche par tableau dans activeConditions)
    exhaustionLevel?: number
    // Ressources de classe utilisées
    classResourcesUsed?: Record<string, number>
    // Métamagie Ensorceleur (IDs des options choisies)
    metamagicChoices?: string[]  // keys des conditions
    // Effets actifs (ex: 'rage', 'chant-de-lame', 'forme-sauvage')
    activeEffects?: string[]
    // Ressources de sous-classe génériques (id -> current/max)
    subclassResources?: Record<string, { current: number; max: number }>

    // Options de classe (styles de combat, etc.)
    classOptions?: Record<string, string>

    // Toggles de dons actifs (ex: GWM, Sharpshooter)
    featToggles?: Record<string, boolean>

    // Ressources de classe (utilisation limitée)
    classResources?: {
        // Rage du Barbare
        rages?: { current: number; max: number }
        // Ki du Moine
        ki?: { current: number; max: number }
        // Channel Divinity du Clerc / Paladin
        channelDivinity?: { current: number; max: number }
        // Sorcery Points de l'Ensorceleur
        sorceryPoints?: { current: number; max: number }
        // Sneak Attack du Roublard (dés par niveau)
        sneakAttackDice?: { current: number; max: number }
        // Journeys Domain spells par jour
        domainSpells?: { current: number; max: number }
        // Wild Shape du Druide
        wildShape?: { current: number; max: number }
        // Second Souffle du Guerrier
        secondWind?: { current: number; max: number }
        // Fougue du Guerrier
        actionSurge?: { current: number; max: number }
        // Indomptable du Guerrier
        indomitable?: { current: number; max: number }
        // Châtiment divin du Paladin
        divineSmite?: { current: number; max: number }
        // Récupération arcanique du Magicien
        arcaneRecovery?: { current: number; max: number }
        // Inspiration bardique
        bardicInspiration?: { current: number; max: number }
        // Ennemi juré du Rôdeur
        favoredEnemy?: { current: number; max: number }
        // Invocations occultes de l'Occultiste
        eldritchInvocations?: { current: number; max: number }
        // Points de vie temporaires
        tempHP?: { current: number; source: string }
    }
}

export interface AsiChoice {
    type: 'feat' | 'stats'
    featId?: string
    stats?: Partial<AbilityScores>
    applied?: boolean
}

export interface SessionNote {
    id: string
    title: string
    date: string // ISO date
    content: string
    tags: string[]
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
    customAbilityBonuses?: Partial<AbilityScores>

    // Inventaire créé dans l'étape Équipement
    inventory?: InventoryItem[]
}

export type RaceSource = 'PHB' | 'XGtE' | 'TCoE' | 'EEPC' | 'MotM'

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
    nameEn?: string
    abilityBonuses: Partial<AbilityScores>
    traits: string[]
    speed?: number
    size?: string
    languages?: string[]
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
    // Ressources de classe spécifiques
    classResources?: {
        hasRage?: boolean               // Barbare
        hasKi?: boolean                   // Moine
        hasChannelDivinity?: boolean      // Clerc / Paladin
        hasSorceryPoints?: boolean        // Ensorceleur
        hasSneakAttack?: boolean          // Roublard
        hasBardicInspiration?: boolean    // Barde
        hasLayOnHands?: boolean           // Paladin
        hasSecondWind?: boolean           // Guerrier
        hasWildShape?: boolean            // Druide
        hasActionSurge?: boolean          // Guerrier
        hasIndomitable?: boolean          // Guerrier
        hasDivineSmite?: boolean          // Paladin
        hasArcaneRecovery?: boolean       // Magicien
        hasEldritchInvocations?: boolean  // Occultiste
        hasFavoredEnemy?: boolean         // Rôdeur
    }
}

export type { InventoryItem, Currency, CharacterInventory } from './inventory'

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
