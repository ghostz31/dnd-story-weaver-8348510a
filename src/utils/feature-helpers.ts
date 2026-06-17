/**
 * Shared helpers for features, traits, and class/race ID normalization.
 * Eliminates duplication between FeaturesPage, CombatFeaturesPage, etc.
 */

import {
  barbarianRages,
  bardInspirationUses,
  monkKiPoints,
  sorcererSorceryPoints,
  paladinLayOnHandsPool,
  fighterSecondWindUses,
  rogueSneakAttackDice,
  monkMartialArtsDie,
  bardInspirationDie,
  warlockSlotLevel,
  warlockSlotCount,
  barbarianRageDamage,
  barbarianFastMovement,
  barbarianBrutalCriticalDice,
  battleMasterDiceCount,
  battleMasterDieSize,
  battleMasterManeuversKnown,
  arcaneArcherShots,
  samuraiFightingSpirit,
  psiWarriorDiceCount,
  psiWarriorDieSize,
  rangerFavoredEnemyCount,
  rangerNaturalExplorerCount,
  rangerKnownSpells,
  druidWildShapeMaxCR,
  druidWildShapeUses,
  druidWildShapeCanFly,
  druidWildShapeCanSwim,
  monkUnarmoredMovement,
} from '../data/classFeatures'

// ============================================================================
// ID NORMALIZATION
// ============================================================================

const CLASS_ID_MAP: Record<string, string> = {
  'ID_PHB_CLASS_BARBARIAN': 'barbarian',
  'ID_PHB_CLASS_BARD': 'bard',
  'ID_PHB_CLASS_CLERIC': 'cleric',
  'ID_PHB_CLASS_DRUID': 'druid',
  'ID_PHB_CLASS_FIGHTER': 'fighter',
  'ID_PHB_CLASS_MONK': 'monk',
  'ID_PHB_CLASS_PALADIN': 'paladin',
  'ID_PHB_CLASS_RANGER': 'ranger',
  'ID_PHB_CLASS_ROGUE': 'rogue',
  'ID_PHB_CLASS_SORCERER': 'sorcerer',
  'ID_PHB_CLASS_WARLOCK': 'warlock',
  'ID_PHB_CLASS_WIZARD': 'wizard',
}

const RACE_ID_MAP: Record<string, string> = {
  'ID_PHB_RACE_HUMAN': 'human',
  'ID_PHB_RACE_ELF': 'elf',
  'ID_PHB_RACE_DWARF': 'dwarf',
  'ID_PHB_RACE_HALFLING': 'halfling',
  'ID_PHB_RACE_DRAGONBORN': 'dragonborn',
  'ID_PHB_RACE_GNOME': 'gnome',
  'ID_PHB_RACE_HALF_ELF': 'half-elf',
  'ID_PHB_RACE_HALF_ORC': 'half-orc',
  'ID_PHB_RACE_TIEFLING': 'tiefling',
}

export function normalizeClassId(classId: string | undefined): string | undefined {
  if (!classId) return undefined
  if (!classId.startsWith('ID_')) return classId
  return CLASS_ID_MAP[classId] || classId.toLowerCase().replace(/id_phb_class_/g, '')
}

export function normalizeRaceId(raceId: string | undefined): string | undefined {
  if (!raceId) return undefined
  if (!raceId.startsWith('ID_')) return raceId
  return RACE_ID_MAP[raceId] || raceId.toLowerCase().replace(/id_phb_race_/g, '')
}

// ============================================================================
// FEATURE CATEGORIZATION
// ============================================================================

const ACTION_KEYWORDS = ['attaque', 'frappe', 'canal', 'imposition', 'châtiment', 'lancer', 'tir', 'rage', 'inspiration', 'récupération']
const BONUS_KEYWORDS = ['bonus', 'furi', 'déplacement', 'rapide', 'rusée', 'second souffle', 'fougue']
const REACTION_KEYWORDS = ['réaction', 'contre', 'riposte', 'protection', 'déviation', 'esquive']

export type FeatureCategory = 'action' | 'bonus' | 'reaction' | 'passive'

export function categorizeFeature(name: string): FeatureCategory {
  const nameLower = name.toLowerCase()
  if (REACTION_KEYWORDS.some(k => nameLower.includes(k))) return 'reaction'
  if (BONUS_KEYWORDS.some(k => nameLower.includes(k))) return 'bonus'
  if (ACTION_KEYWORDS.some(k => nameLower.includes(k))) return 'action'
  return 'passive'
}

export const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  action: 'Actions',
  bonus: 'Actions bonus',
  reaction: 'Réactions',
  passive: 'Passives',
}

// ============================================================================
// RESOURCE MAX VALUES BY LEVEL
// ============================================================================

const RESOURCE_TABLES: Record<string, number[]> = {
  rages: barbarianRages,
  bardicInspiration: bardInspirationUses,
  channelDivinity: [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3],
  ki: monkKiPoints,
  layOnHands: paladinLayOnHandsPool,
  secondWind: fighterSecondWindUses,
  actionSurge: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2],
  indomitable: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3],
  wildShape: [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  sorceryPoints: sorcererSorceryPoints,
  arcaneRecovery: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // divineSmite n'a pas de pool propre — il consomme des emplacements de sort
  eldritchInvocations: [0, 0, 2, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9],
  favoredEnemy: [0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
}

export function getMaxUses(key: string, level: number): number {
  const table = RESOURCE_TABLES[key]
  if (!table || level < 1 || level > 20) return 0
  return table[level - 1] || 0
}

// ============================================================================
// CLASS-SPECIFIC VALUES
// ============================================================================

export function getBarbarianRageDamageBonus(level: number): number {
  if (level < 1) return 0
  return barbarianRageDamage[Math.min(level, 20) - 1] || 2
}

export function getMonkMartialArtsDie(level: number): string {
  if (level < 1) return 'd4'
  return monkMartialArtsDie[Math.min(level, 20) - 1] || 'd4'
}

export function getBardInspirationDie(level: number): string {
  if (level < 1) return 'd6'
  return bardInspirationDie[Math.min(level, 20) - 1] || 'd6'
}

export function getWarlockSlotInfo(level: number): { slotLevel: number; count: number } {
  if (level < 1) return { slotLevel: 1, count: 0 }
  const idx = Math.min(level, 20) - 1
  return {
    slotLevel: warlockSlotLevel[idx] || 1,
    count: warlockSlotCount[idx] || 0,
  }
}

// ============================================================================
// BARBARIAN HELPERS
// ============================================================================

export function getBarbarianFastMovement(level: number): number {
  if (level < 1) return 0
  return barbarianFastMovement[Math.min(level, 20) - 1] || 0
}

export function getBarbarianBrutalCriticalDice(level: number): number {
  if (level < 1) return 0
  return barbarianBrutalCriticalDice[Math.min(level, 20) - 1] || 0
}

export function getBarbarianRageCount(level: number): number {
  if (level < 1) return 0
  return barbarianRages[Math.min(level, 20) - 1] || 0
}

// ============================================================================
// FIGHTER HELPERS
// ============================================================================

export function getBattleMasterDiceCount(level: number): number {
  if (level < 1) return 0
  return battleMasterDiceCount[Math.min(level, 20) - 1] || 0
}

export function getBattleMasterDieSize(level: number): string {
  if (level < 1) return 'd6'
  return battleMasterDieSize[Math.min(level, 20) - 1] || 'd6'
}

export function getBattleMasterManeuversKnown(level: number): number {
  if (level < 1) return 0
  return battleMasterManeuversKnown[Math.min(level, 20) - 1] || 0
}

export function getArcaneArcherShots(level: number): number {
  if (level < 1) return 0
  return arcaneArcherShots[Math.min(level, 20) - 1] || 0
}

export function getSamuraiFightingSpirit(level: number): number {
  if (level < 1) return 0
  return samuraiFightingSpirit[Math.min(level, 20) - 1] || 0
}

export function getPsiWarriorDiceCount(level: number): number {
  if (level < 1) return 0
  return psiWarriorDiceCount[Math.min(level, 20) - 1] || 0
}

export function getPsiWarriorDieSize(level: number): string {
  if (level < 1) return 'd6'
  return psiWarriorDieSize[Math.min(level, 20) - 1] || 'd6'
}

// ============================================================================
// CRITICAL THRESHOLD
// ============================================================================

/**
 * Return the critical hit threshold for a fighter.
 * Champion: 19 at level 3, 18 at level 15.
 * Default for all other classes/subclasses: 20.
 */
export function getFighterCriticalThreshold(level: number, subclassId?: string): number {
  if (subclassId === 'champion') {
    if (level >= 15) return 18
    if (level >= 3) return 19
  }
  return 20
}

// ============================================================================
// ROGUE HELPERS
// ============================================================================

export function getRogueSneakAttackDice(level: number): number {
  if (level < 1) return 0
  return rogueSneakAttackDice[Math.min(level, 20) - 1] || 0
}

export function getRogueExpertiseCount(level: number): number {
  if (level < 1) return 0
  return level >= 6 ? 4 : 2
}

// ============================================================================
// CLERIC HELPERS
// ============================================================================

const DIVINE_STRIKE_DOMAINS = new Set([
  'life', 'war', 'nature', 'tempest', 'trickery', 'forge', 'order', 'twilight'
])

const POTENT_SPELLCASTING_DOMAINS = new Set([
  'light', 'knowledge', 'grave', 'peace'
])

const DIVINE_STRIKE_DAMAGE_TYPES: Record<string, string> = {
  life: 'radiant',
  war: 'weapon',
  nature: 'elemental',
  tempest: 'thunder',
  trickery: 'poison',
  forge: 'fire',
  order: 'psychic',
  twilight: 'radiant',
}

export function hasDivineStrike(subclassId?: string): boolean {
  return !!subclassId && DIVINE_STRIKE_DOMAINS.has(subclassId)
}

export function hasPotentSpellcasting(subclassId?: string): boolean {
  return !!subclassId && POTENT_SPELLCASTING_DOMAINS.has(subclassId)
}

export function getClericDivineStrikeDice(level: number): string {
  if (level < 8) return ''
  if (level >= 14) return '2d8'
  return '1d8'
}

export function getClericDivineStrikeDamageType(subclassId?: string): string {
  return DIVINE_STRIKE_DAMAGE_TYPES[subclassId || ''] || ''
}

export function getChannelDivinityUses(level: number): number {
  if (level < 2) return 0
  if (level >= 18) return 3
  if (level >= 6) return 2
  return 1
}

// ============================================================================
// PALADIN HELPERS
// ============================================================================

export function getPaladinAuraRange(level: number): number {
  return level >= 18 ? 9 : 3
}

export function hasPaladinAuraOfProtection(level: number): boolean {
  return level >= 6
}

export function hasPaladinAuraOfCourage(level: number): boolean {
  return level >= 10
}

export function hasPaladinImprovedDivineSmite(level: number): boolean {
  return level >= 11
}

export function hasPaladinCleansingTouch(level: number): boolean {
  return level >= 14
}

export function getPaladinCleansingTouchUses(chaMod: number): number {
  return Math.max(1 + chaMod, 1)
}

// ============================================================================
// RANGER HELPERS
// ============================================================================

export function getRangerFavoredEnemyCount(level: number): number {
  if (level < 1) return 0
  return rangerFavoredEnemyCount[Math.min(level, 20) - 1] || 0
}

export function getRangerNaturalExplorerCount(level: number): number {
  if (level < 1) return 0
  return rangerNaturalExplorerCount[Math.min(level, 20) - 1] || 0
}

export function getRangerKnownSpells(level: number): number {
  if (level < 1) return 0
  return rangerKnownSpells[Math.min(level, 20) - 1] || 0
}

export function hasRangerExtraAttack(level: number): boolean {
  return level >= 5
}

export function hasRangerVanish(level: number): boolean {
  return level >= 14
}

export function hasRangerFeralSenses(level: number): boolean {
  return level >= 18
}

export function hasRangerFoeSlayer(level: number): boolean {
  return level >= 20
}

// ============================================================================
// DRUID HELPERS
// ============================================================================

export function getDruidWildShapeMaxCR(level: number): number {
  if (level < 1) return 0
  return druidWildShapeMaxCR[Math.min(level, 20) - 1] || 0
}

export function getDruidWildShapeUses(level: number): number {
  if (level < 1) return 0
  return druidWildShapeUses[Math.min(level, 20) - 1] || 0
}

export function canDruidWildShapeFly(level: number): boolean {
  if (level < 1) return false
  return druidWildShapeCanFly[Math.min(level, 20) - 1] || false
}

export function canDruidWildShapeSwim(level: number): boolean {
  if (level < 1) return false
  return druidWildShapeCanSwim[Math.min(level, 20) - 1] || false
}

export function hasDruidWildShape(level: number): boolean {
  return level >= 2
}

export function hasDruidTimelessBody(level: number): boolean {
  return level >= 18
}

export function hasDruidArchdruid(level: number): boolean {
  return level >= 20
}

export function getDruidWildShapeMoonMaxCR(level: number): number {
  if (level < 2) return 0
  if (level >= 6) return Math.floor(level / 3)
  return 1
}

// ============================================================================
// MONK HELPERS
// ============================================================================

export function getMonkKiPoints(level: number): number {
  if (level < 1) return 0
  return monkKiPoints[Math.min(level, 20) - 1] || 0
}

export function getMonkUnarmoredMovement(level: number): number {
  if (level < 1) return 0
  return monkUnarmoredMovement[Math.min(level, 20) - 1] || 0
}

export function hasMonkEvasion(level: number): boolean {
  return level >= 7
}

export function hasMonkStillnessOfMind(level: number): boolean {
  return level >= 7
}

export function hasMonkPurityOfBody(level: number): boolean {
  return level >= 10
}

export function hasMonkDiamondSoul(level: number): boolean {
  return level >= 14
}

export function hasMonkEmptyBody(level: number): boolean {
  return level >= 18
}

export function hasMonkPerfectSelf(level: number): boolean {
  return level >= 20
}

// ============================================================================
// WIZARD HELPERS
// ============================================================================

export function getWizardArcaneRecoverySlots(level: number): number {
  if (level < 1) return 0
  return Math.ceil(level / 2)
}

export function getWizardPreparedSpellsCount(level: number, intMod: number): number {
  if (level < 1) return 0
  return Math.max(1, level + intMod)
}

export function hasWizardSpellMastery(level: number): boolean {
  return level >= 18
}

export function hasWizardSignatureSpells(level: number): boolean {
  return level >= 20
}

export function getWizardCantripsKnown(level: number): number {
  if (level < 1) return 0
  if (level >= 10) return 5
  if (level >= 4) return 4
  return 3
}

// ============================================================================
// BARD HELPERS
// ============================================================================

export function getBardInspirationUses(level: number): number {
  if (level < 1) return 0
  return bardInspirationUses[Math.min(level, 20) - 1] || 0
}

export function getBardSongOfRestDie(level: number): string {
  if (level < 1) return 'd6'
  if (level >= 17) return 'd12'
  if (level >= 13) return 'd10'
  if (level >= 9) return 'd8'
  return 'd6'
}

export function getBardMagicalSecretsCount(level: number): number {
  if (level < 10) return 0
  if (level >= 18) return 6
  if (level >= 14) return 4
  return 2
}

export function hasBardCountercharm(level: number): boolean {
  return level >= 6
}

export function hasBardSuperiorInspiration(level: number): boolean {
  return level >= 20
}

export function getBardPreparedSpellsCount(level: number, chaMod: number): number {
  if (level < 1) return 0
  return Math.max(1, level + chaMod)
}

// ============================================================================
// SORCERER HELPERS
// ============================================================================

export function getSorcererSorceryPoints(level: number): number {
  if (level < 2) return 0
  return sorcererSorceryPoints[Math.min(level, 20) - 1] || 0
}

export function getSorcererMetamagicCount(level: number): number {
  if (level < 2) return 0
  if (level >= 17) return 4
  if (level >= 10) return 3
  return 2
}

export function getSorcererKnownSpells(level: number): number {
  // Full caster : 2 at level 1, +1 per level, cap at 15
  if (level < 1) return 0
  return Math.min(15, 2 + level)
}

export function getSorcererCantripsKnown(level: number): number {
  if (level < 1) return 0
  if (level >= 10) return 6
  if (level >= 4) return 5
  return 4
}

export function hasSorcererSorcerousRestoration(level: number): boolean {
  return level >= 20
}

// ============================================================================
// WARLOCK HELPERS
// ============================================================================

export function getWarlockSlotLevel(level: number): number {
  if (level < 1) return 0
  return warlockSlotLevel[Math.min(level, 20) - 1] || 1
}

export function getWarlockSlotCount(level: number): number {
  if (level < 1) return 0
  return warlockSlotCount[Math.min(level, 20) - 1] || 0
}

export function getWarlockInvocationsKnown(level: number): number {
  if (level < 2) return 0
  if (level >= 17) return 8
  if (level >= 15) return 7
  if (level >= 13) return 6
  if (level >= 11) return 5
  if (level >= 9) return 4
  if (level >= 7) return 3
  if (level >= 5) return 2
  return 2
}

export function getWarlockMysticArcanumLevel(level: number): number {
  if (level < 11) return 0
  if (level >= 17) return 9
  if (level >= 15) return 8
  if (level >= 13) return 7
  if (level >= 11) return 6
  return 0
}

export function hasWarlockEldritchMaster(level: number): boolean {
  return level >= 20
}

// ============================================================================
// RESOURCE FORMATTING
// ============================================================================

/**
 * Format a resource maximum value for display.
 * 999 is treated as "unlimited" and shown as the infinity symbol.
 */
export function formatResourceMax(max: number): string {
  return max >= 999 ? '∞' : String(max)
}
