/**
 * Types enrichis V2 - Inspirés d'Aurora Builder
 * 
 * Ces types étendent les types existants avec plus de structure
 * pour supporter le système de rules et les références par ID
 */

import type { AbilityScores } from './character'

// Type pour l'alignement
export type Alignment = 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE'

// ============================================================================
// TYPES DE BASE AURORA
// ============================================================================

export type AuroraId = string

export interface AuroraElement {
  id: AuroraId
  name: string
  nameEn: string
  source: string
  description?: string | unknown
}

// ============================================================================
// RULES SYSTEM
// ============================================================================

export type Rule = 
  | GrantRule
  | SelectRule  
  | StatRule
  | PrerequisiteRule
  | SetRule
  | ConditionRule
  | ResourceRule
  | ACRule
  | SpeedRule
  | SpeedBonusRule
  | AttackBonusRule
  | DamageBonusRule
  | SaveBonusRule
  | SpellRule

export interface GrantRule {
  type: 'grant'
  targetType: 'proficiency' | 'language' | 'trait' | 'spell' | 'feature' | 'item'
  targetId: AuroraId
  level?: number
  condition?: string
}

export interface SelectRule {
  type: 'select'
  name: string
  targetType: 'skill' | 'language' | 'spell' | 'trait' | 'feature' | 'subrace' | 'archetype' | 'weapon'
  count: number
  options: AuroraId[] | 'any'
  supports?: string[] // Tags pour filtrer les options
  level?: number
}

export interface StatRule {
  type: 'stat'
  stat: keyof AbilityScores | 'speed' | 'hp' | 'ac'
  value: number | string // Nombre ou référence comme "$(proficiency)"
  bonus?: 'racial' | 'feat' | 'item' | 'misc'
  condition?: string
  max?: number // Maximum pour cette stat (ex: 24 pour Champion primitif)
}

export interface PrerequisiteRule {
  type: 'prerequisite'
  stats?: Partial<Record<keyof AbilityScores, number>>
  level?: number
  levelTotal?: number // Pour multiclassage
  class?: AuroraId
  feature?: AuroraId
  proficiency?: AuroraId
  spellcasting?: boolean
}

export interface SetRule {
  type: 'set'
  property: string
  value: string | number | boolean
}

export interface ConditionRule {
  type: 'condition'
  condition: string        // ex: 'resistance-bludgeoning', 'immunity-charmed', 'advantage-strength'
  description?: string
}

export interface ResourceRule {
  type: 'resource'
  id: string
  name: string
  progression: number[]    // [2, 2, 3, 3, ...] pour 20 niveaux
  recovery: 'short' | 'long' | 'dawn'
  description?: string
}

export interface ACRule {
  type: 'ac'
  formula: string          // ex: '10 + dex + con', '13 + dex', 'base + 2'
  condition?: string       // ex: 'no-heavy-armor', 'unarmored'
}

export interface SpeedRule {
  type: 'speed'
  value: number | string   // nombre fixe ou expression
  condition?: string
  mode?: 'walk' | 'fly' | 'swim' | 'climb' | 'burrow'
}

export interface SpeedBonusRule {
  type: 'speed_bonus'
  value: number | string
  condition?: string
}

export interface AttackBonusRule {
  type: 'attack_bonus'
  value: number | string
  condition?: string       // ex: 'melee', 'ranged', 'spell'
}

export interface DamageBonusRule {
  type: 'damage_bonus'
  value: number | string
  condition?: string       // ex: 'melee', 'rage', 'critical'
  damageType?: string
}

export interface SaveBonusRule {
  type: 'save_bonus'
  value: number | string
  save: string             // ex: 'dex', 'str', 'all'
  condition?: string
}

export interface SpellRule {
  type: 'spell'
  spellId: string
  alwaysPrepared?: boolean
  alwaysKnown?: boolean
  level?: number
}

// ============================================================================
// SPELL V2
// ============================================================================

export interface SpellV2 extends AuroraElement {
  // Mécaniques
  level: number
  school: SpellSchool
  castingTime: CastingTime
  range: SpellRange
  components: SpellComponents
  duration: SpellDuration
  
  // Contenu
  description: SpellDescription
  
  // Listes de classes
  spellLists: AuroraId[] // IDs des classes qui peuvent lancer ce sort
  
  // Mots-clés pour recherche
  keywords: string[]
  
  // Tags
  ritual?: boolean
  concentration?: boolean
}

export type SpellSchool = 
  | 'abjuration' 
  | 'conjuration' 
  | 'divination' 
  | 'enchantment' 
  | 'evocation' 
  | 'illusion' 
  | 'necromancy' 
  | 'transmutation'

export interface CastingTime {
  type: 'action' | 'bonus' | 'reaction' | 'minute' | 'hour'
  value?: number
  condition?: string // Pour les réactions : "when you take damage..."
}

export interface SpellRange {
  type: 'self' | 'touch' | 'ranged' | 'unlimited' | 'sight' | 'special'
  distance?: number
  unit?: 'feet' | 'miles'
  area?: AreaOfEffect
}

export interface AreaOfEffect {
  shape: 'sphere' | 'cone' | 'line' | 'cube' | 'cylinder' | 'emanation'
  size: number
  unit?: 'feet' | 'miles'
}

export interface SpellComponents {
  verbal: boolean
  somatic: boolean
  material?: {
    text: string
    consumed?: boolean
    cost?: number // En gp
  }
}

export interface SpellDuration {
  type: 'instant' | 'timed' | 'permanent' | 'special'
  concentration?: boolean
  time?: string // "1 minute", "8 hours", "1 hour"
}

export interface SpellDescription {
  short: string // Pour la fiche de personnage
  full: string // Description complète
  higherLevels?: string // "Aux niveaux supérieurs..."
  atHigherLevels?: HigherLevelScaling[]
}

export interface HigherLevelScaling {
  slotLevel: number
  effect: string
}

// ============================================================================
// RACE V2
// ============================================================================

export interface RaceV2 extends AuroraElement {
  // Caractéristiques physiques
  size: 'small' | 'medium' | 'large'
  speed: number | { base: number; fly?: number; swim?: number; climb?: number }
  
  // Bonus de caractéristiques
  abilityBonuses: Partial<Record<keyof AbilityScores, number>>
  
  // Traits et rules
  traits: AuroraId[] // IDs des traits accordés
  rules: Rule[]
  
  // Capacités spéciales
  languages: AuroraId[]
  skillProficiencies?: AuroraId[]
  weaponProficiencies?: AuroraId[]
  armorProficiencies?: AuroraId[]
  
  // Sous-races
  subraces?: SubraceV2[]
  
  // Âge et culture
  typicalAge?: { adulthood: number; lifespan: number }
  alignment?: Alignment[] // Alignements typiques
  
  // Apparence
  appearance?: {
    description: string
    height: { base: number; mod: number } // En cm
    weight: { base: number; mod: number } // En kg
  }
}

export interface SubraceV2 {
  id: AuroraId
  name: string
  nameEn: string
  abilityBonuses: Partial<Record<keyof AbilityScores, number>>
  traits: AuroraId[]
  rules: Rule[]
}

// ============================================================================
// CLASS V2
// ============================================================================

export interface ClassV2 extends AuroraElement {
  // Mécaniques de base
  hitDice: 6 | 8 | 10 | 12
  primaryAbility: (keyof AbilityScores)[]
  savingThrows: (keyof AbilityScores)[]
  
  // Équipement de départ
  startingEquipment: StartingEquipment
  
  // Progression niveau par niveau
  features: ClassFeatureProgression
  
  // Multiclassage
  multiclass?: {
    prerequisites?: Partial<Record<keyof AbilityScores, number>>
    proficienciesGained: AuroraId[]
  }
  
  // Sous-classes (Archetypes/Traditions/Écoles)
  subclasses: SubclassV2[]
  
  // Incantation (si applicable)
  spellcasting?: SpellcastingProgression
  
  // Ressources de classe (Ki, Rages, etc.)
  resources?: ClassResource[]
}

export interface StartingEquipment {
  // Options d'équipement : choisir une option dans chaque groupe
  options: StartingEquipmentOption[][]
  // Équipement fixe accordé à tous
  fixed?: AuroraId[]
}

export interface StartingEquipmentOption {
  id: AuroraId
  name: string
  items: AuroraId[]
  quantity?: number
}

export interface ClassFeatureProgression {
  [level: number]: ClassFeatureV2[]
}

export interface ClassFeatureV2 extends AuroraElement {
  level: number
  rules: Rule[]
  
  // Pour les capacités avec utilisations limitées
  uses?: {
    count: number | string // Nombre ou référence (ex: "$(barbarian:rages)")
    recovery: 'short' | 'long' | 'dawn'
  }
  
  // Options de la capacité
  options?: FeatureOption[]
}

export interface FeatureOption {
  id: AuroraId
  name: string
  description: string
  rules: Rule[]
}

export interface SubclassV2 extends AuroraElement {
  parentClass: AuroraId
  features: ClassFeatureProgression
  spellcasting?: SpellcastingModification
}

export interface SpellcastingProgression {
  ability: keyof AbilityScores
  type: 'full' | 'half' | 'third' | 'pact'
  
  // Progression des emplacements
  slots: SpellSlotsProgression
  
  // Sorts connus (pour bard, sorcerer, warlock)
  spellsKnown?: { [level: number]: number }
  
  // Sorts préparés (pour cleric, druid, paladin, wizard)
  spellsPrepared?: {
    formula: string // "$(level) + $(ability:modifier)"
    from: 'class-list' | 'spellbook' | 'domain'
  }
  
  // Rituel
  ritualCasting?: boolean
  
  // Focus
  focus?: 'arcane' | 'druidic' | 'holy-symbol' | 'component-pouch'
}

export type SpellSlotsProgression = {
  [level: number]: {
    [spellLevel: number]: number // Nombre d'emplacements par niveau de sort
  }
}

export interface SpellcastingModification {
  // Modification de la liste de sorts
  expandedSpellList?: AuroraId[]
  
  // Sorts toujours préparés/connus
  alwaysPrepared?: AuroraId[]
  alwaysKnown?: AuroraId[]
  
  // Modification de la caractéristique
  abilityOverride?: keyof AbilityScores
}

export interface ClassResource {
  id: AuroraId
  name: string
  progression: { [level: number]: number }
  recovery: 'short' | 'long'
}

// ============================================================================
// ITEM/ÉQUIPEMENT V2
// ============================================================================

export interface ItemV2 extends AuroraElement {
  type: 'weapon' | 'armor' | 'equipment' | 'tool' | 'consumable' | 'magic-item'
  
  // Coût et poids
  cost?: { amount: number; unit: 'cp' | 'sp' | 'ep' | 'gp' | 'pp' }
  weight?: number // En livres
  
  // Propriétés communes
  rarity?: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact'
  attunement?: boolean
  attunementRequirements?: string
  
  // Spécifique aux armes
  weaponProperties?: WeaponProperty[]
  damage?: DamageInfo
  versatile?: DamageInfo // Dégâts en deux mains
  ammunition?: string // Type de munition pour les armes à distance
  range?: { normal: number; long?: number }
  
  // Spécifique aux armures
  armorClass?: ArmorClassInfo
  strengthRequirement?: number
  stealthDisadvantage?: boolean
  armorCategory?: 'light' | 'medium' | 'heavy' | 'shield'
  donDoff?: { don: number; doff: number } // En minutes
  
  // Spécifique aux consommables
  charges?: {
    max: number
    recovery?: string
  }
  consumable?: boolean
  
  // Effets magiques
  rules?: Rule[]
}

export type WeaponProperty = 
  | 'ammunition'
  | 'finesse'
  | 'heavy'
  | 'light'
  | 'loading'
  | 'range'
  | 'reach'
  | 'special'
  | 'thrown'
  | 'two-handed'
  | 'versatile'
  | 'lance'
  | 'nett'
  | 'exploding'

export interface DamageInfo {
  dice: string // "1d8", "2d6"
  type: DamageType
  bonus?: number
}

export type DamageType = 
  | 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' 
  | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder'

export interface ArmorClassInfo {
  base: number
  addDex?: boolean
  dexMax?: number // Maximum bonus DEX (2 pour armures intermédiaires)
  addCon?: boolean // Pour le barbare
  addWis?: boolean // Pour le moine
}

// ============================================================================
// BACKGROUND/HISTORIQUE V2
// ============================================================================

export interface BackgroundV2 extends AuroraElement {
  // Compétences
  skillProficiencies: AuroraId[]
  
  // Outils/langues
  toolProficiencies?: AuroraId[]
  languageCount?: number
  
  // Équipement
  startingEquipment: AuroraId[]
  startingMoney?: { amount: number; unit: 'gp' }
  
  // Capacité spéciale
  feature: BackgroundFeature
  
  // Personnalité suggérée
  personalityTraits: string[]
  ideals: { alignment: string; description: string }[]
  bonds: string[]
  flaws: string[]
  
  // Tables de connexion
  connections?: {
    description: string
    table: { roll: number; result: string }[]
  }
}

export interface BackgroundFeature extends AuroraElement {
  rules: Rule[]
}

// ============================================================================
// FEAT/DON V2
// ============================================================================

export interface FeatV2 extends AuroraElement {
  // Prérequis
  prerequisites?: {
    stats?: Partial<Record<keyof AbilityScores, number>>
    level?: number
    proficiency?: AuroraId
    feature?: AuroraId
    spellcasting?: boolean
  }
  
  // Bonus de caractéristiques (half-feats)
  abilityScoreIncrease?: Partial<Record<keyof AbilityScores, number>>
  
  // Rules accordées
  rules: Rule[]
  
  // Options (pour les dons avec choix)
  options?: FeatOption[]
}

export interface FeatOption extends AuroraElement {
  parentFeat: AuroraId
  rules: Rule[]
}

// ============================================================================
// CONDITIONS
// ============================================================================

export interface ConditionV2 extends AuroraElement {
  icon: string
  color: string
  effects: string[]
  rules: Rule[]
}

// ============================================================================
// UTILITAIRES DE CONVERSION
// ============================================================================

/**
 * Convertit les types V1 vers V2 (pour migration)
 */
export function convertToV2<T>(_v1Data: any, _type: 'spell' | 'race' | 'class' | 'item'): T {
  // Implémentation de la migration
  // TODO : Ajouter la logique de conversion
  throw new Error('Migration non implémentée')
}

/**
 * Applique les rules à un personnage
 */
export function applyRules(_character: any, _rules: Rule[]): any {
  // Implémentation du moteur de rules
  // TODO : Ajouter la logique d'application
  throw new Error('Moteur de rules non implémenté')
}
