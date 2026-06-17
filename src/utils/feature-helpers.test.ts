import { describe, it, expect } from 'vitest'
import {
  normalizeClassId,
  normalizeRaceId,
  categorizeFeature,
  getMaxUses,
  getBarbarianRageDamageBonus,
  getRogueSneakAttackDice,
  getWarlockSlotInfo,
  getBarbarianFastMovement,
  getBarbarianBrutalCriticalDice,
  getBarbarianRageCount,
  getBattleMasterDiceCount,
  getBattleMasterDieSize,
  getBattleMasterManeuversKnown,
  getArcaneArcherShots,
  getSamuraiFightingSpirit,
  getPsiWarriorDiceCount,
  getPsiWarriorDieSize,
  formatResourceMax,
  getRogueExpertiseCount,
  getFighterCriticalThreshold,
  getChannelDivinityUses,
  getClericDivineStrikeDice,
  getClericDivineStrikeDamageType,
  hasDivineStrike,
  hasPotentSpellcasting,
  getPaladinAuraRange,
  hasPaladinAuraOfProtection,
  hasPaladinAuraOfCourage,
  hasPaladinImprovedDivineSmite,
  hasPaladinCleansingTouch,
  getPaladinCleansingTouchUses,
  getRangerFavoredEnemyCount,
  getRangerNaturalExplorerCount,
  getRangerKnownSpells,
  hasRangerExtraAttack,
  hasRangerVanish,
  hasRangerFeralSenses,
  hasRangerFoeSlayer,
  getDruidWildShapeMaxCR,
  getDruidWildShapeUses,
  canDruidWildShapeFly,
  canDruidWildShapeSwim,
  hasDruidWildShape,
  hasDruidTimelessBody,
  hasDruidArchdruid,
  getDruidWildShapeMoonMaxCR,
  getMonkKiPoints,
  getMonkUnarmoredMovement,
  getMonkMartialArtsDie,
  hasMonkEvasion,
  hasMonkStillnessOfMind,
  hasMonkPurityOfBody,
  hasMonkDiamondSoul,
  hasMonkEmptyBody,
  hasMonkPerfectSelf,
  getWizardArcaneRecoverySlots,
  getWizardPreparedSpellsCount,
  hasWizardSpellMastery,
  hasWizardSignatureSpells,
  getWizardCantripsKnown,
  getBardInspirationUses,
  getBardSongOfRestDie,
  getBardMagicalSecretsCount,
  getBardInspirationDie,
  hasBardCountercharm,
  hasBardSuperiorInspiration,
  getBardPreparedSpellsCount,
  getSorcererSorceryPoints,
  getSorcererMetamagicCount,
  getSorcererKnownSpells,
  getSorcererCantripsKnown,
  hasSorcererSorcerousRestoration,
  getWarlockSlotLevel,
  getWarlockSlotCount,
  getWarlockInvocationsKnown,
  getWarlockMysticArcanumLevel,
  hasWarlockEldritchMaster,
} from './feature-helpers'

describe('normalizeClassId', () => {
  it('returns undefined for undefined input', () => {
    expect(normalizeClassId(undefined)).toBeUndefined()
  })

  it('passes through short IDs unchanged', () => {
    expect(normalizeClassId('barbarian')).toBe('barbarian')
    expect(normalizeClassId('fighter')).toBe('fighter')
  })

  it('converts Aurora IDs to short IDs', () => {
    expect(normalizeClassId('ID_PHB_CLASS_BARBARIAN')).toBe('barbarian')
    expect(normalizeClassId('ID_PHB_CLASS_FIGHTER')).toBe('fighter')
    expect(normalizeClassId('ID_PHB_CLASS_WIZARD')).toBe('wizard')
  })
})

describe('normalizeRaceId', () => {
  it('returns undefined for undefined input', () => {
    expect(normalizeRaceId(undefined)).toBeUndefined()
  })

  it('converts Aurora race IDs', () => {
    expect(normalizeRaceId('ID_PHB_RACE_ELF')).toBe('elf')
    expect(normalizeRaceId('ID_PHB_RACE_DWARF')).toBe('dwarf')
    expect(normalizeRaceId('ID_PHB_RACE_TIEFLING')).toBe('tiefling')
  })
})

describe('categorizeFeature', () => {
  it('categorizes action features', () => {
    expect(categorizeFeature('Rage')).toBe('action')
    expect(categorizeFeature('Canal divin')).toBe('action')
    expect(categorizeFeature('Imposition des mains')).toBe('action')
  })

  it('categorizes bonus action features', () => {
    expect(categorizeFeature('Second souffle')).toBe('bonus')
    expect(categorizeFeature('Fougue')).toBe('bonus')
  })

  it('categorizes reaction features', () => {
    expect(categorizeFeature('Déviation de projectiles')).toBe('reaction')
    expect(categorizeFeature('Esquive instinctive')).toBe('reaction')
  })

  it('defaults to passive for unknown features', () => {
    expect(categorizeFeature('Défense sans armure')).toBe('passive')
    expect(categorizeFeature('Vision dans le noir')).toBe('passive')
  })
})

describe('getMaxUses', () => {
  it('returns correct rage counts', () => {
    expect(getMaxUses('rages', 1)).toBe(2)
    expect(getMaxUses('rages', 3)).toBe(3)
    expect(getMaxUses('rages', 6)).toBe(4)
    expect(getMaxUses('rages', 17)).toBe(6)
    expect(getMaxUses('rages', 20)).toBe(999)
  })

  it('returns correct ki points', () => {
    expect(getMaxUses('ki', 1)).toBe(0)
    expect(getMaxUses('ki', 2)).toBe(2)
    expect(getMaxUses('ki', 10)).toBe(10)
    expect(getMaxUses('ki', 20)).toBe(20)
  })

  it('returns 0 for unknown keys', () => {
    expect(getMaxUses('unknown', 5)).toBe(0)
  })

  it('returns 0 for level 0', () => {
    expect(getMaxUses('rages', 0)).toBe(0)
  })
})

describe('class-specific values', () => {
  it('returns correct barbarian rage damage', () => {
    expect(getBarbarianRageDamageBonus(1)).toBe(2)
    expect(getBarbarianRageDamageBonus(9)).toBe(3)
    expect(getBarbarianRageDamageBonus(16)).toBe(4)
  })

  it('returns correct rogue sneak attack dice', () => {
    expect(getRogueSneakAttackDice(1)).toBe(1)
    expect(getRogueSneakAttackDice(3)).toBe(2)
    expect(getRogueSneakAttackDice(19)).toBe(10)
  })

  it('returns correct monk martial arts die', () => {
    expect(getMonkMartialArtsDie(1)).toBe('d4')
    expect(getMonkMartialArtsDie(5)).toBe('d6')
    expect(getMonkMartialArtsDie(11)).toBe('d8')
    expect(getMonkMartialArtsDie(17)).toBe('d10')
  })

  it('returns correct bard inspiration die', () => {
    expect(getBardInspirationDie(1)).toBe('d6')
    expect(getBardInspirationDie(5)).toBe('d8')
    expect(getBardInspirationDie(15)).toBe('d12')
  })

  it('returns correct warlock slot info', () => {
    expect(getWarlockSlotInfo(1)).toEqual({ slotLevel: 1, count: 1 })
    expect(getWarlockSlotInfo(5)).toEqual({ slotLevel: 3, count: 2 })
    expect(getWarlockSlotInfo(11)).toEqual({ slotLevel: 5, count: 3 })
    expect(getWarlockSlotInfo(17)).toEqual({ slotLevel: 5, count: 4 })
  })
})

describe('barbarian helpers', () => {
  it('returns correct fast movement bonus', () => {
    expect(getBarbarianFastMovement(1)).toBe(0)
    expect(getBarbarianFastMovement(4)).toBe(0)
    expect(getBarbarianFastMovement(5)).toBe(3)
    expect(getBarbarianFastMovement(20)).toBe(3)
  })

  it('returns correct brutal critical dice', () => {
    expect(getBarbarianBrutalCriticalDice(1)).toBe(0)
    expect(getBarbarianBrutalCriticalDice(8)).toBe(0)
    expect(getBarbarianBrutalCriticalDice(9)).toBe(1)
    expect(getBarbarianBrutalCriticalDice(13)).toBe(2)
    expect(getBarbarianBrutalCriticalDice(17)).toBe(3)
    expect(getBarbarianBrutalCriticalDice(20)).toBe(3)
  })

  it('returns correct rage count', () => {
    expect(getBarbarianRageCount(1)).toBe(2)
    expect(getBarbarianRageCount(3)).toBe(3)
    expect(getBarbarianRageCount(6)).toBe(4)
    expect(getBarbarianRageCount(17)).toBe(6)
    expect(getBarbarianRageCount(20)).toBe(999)
  })

  it('returns correct battle master dice count', () => {
    expect(getBattleMasterDiceCount(1)).toBe(0)
    expect(getBattleMasterDiceCount(3)).toBe(4)
    expect(getBattleMasterDiceCount(10)).toBe(5)
    expect(getBattleMasterDiceCount(18)).toBe(6)
  })

  it('returns correct battle master die size', () => {
    expect(getBattleMasterDieSize(3)).toBe('d6')
    expect(getBattleMasterDieSize(10)).toBe('d10')
    expect(getBattleMasterDieSize(18)).toBe('d12')
  })

  it('returns correct battle master maneuvers known', () => {
    expect(getBattleMasterManeuversKnown(3)).toBe(3)
    expect(getBattleMasterManeuversKnown(7)).toBe(5)
    expect(getBattleMasterManeuversKnown(15)).toBe(9)
    expect(getBattleMasterManeuversKnown(18)).toBe(11)
  })

  it('returns correct arcane archer shots', () => {
    expect(getArcaneArcherShots(3)).toBe(2)
    expect(getArcaneArcherShots(20)).toBe(2)
  })

  it('returns correct samurai fighting spirit uses', () => {
    expect(getSamuraiFightingSpirit(3)).toBe(3)
    expect(getSamuraiFightingSpirit(20)).toBe(3)
  })

  it('returns correct psi warrior dice count', () => {
    expect(getPsiWarriorDiceCount(3)).toBe(4)
    expect(getPsiWarriorDiceCount(7)).toBe(6)
    expect(getPsiWarriorDiceCount(13)).toBe(8)
  })

  it('returns correct psi warrior die size', () => {
    expect(getPsiWarriorDieSize(3)).toBe('d6')
    expect(getPsiWarriorDieSize(11)).toBe('d8')
    expect(getPsiWarriorDieSize(17)).toBe('d10')
  })

  it('formats resource max correctly', () => {
    expect(formatResourceMax(2)).toBe('2')
    expect(formatResourceMax(6)).toBe('6')
    expect(formatResourceMax(999)).toBe('∞')
    expect(formatResourceMax(1000)).toBe('∞')
  })

  it('returns correct rogue sneak attack dice', () => {
    expect(getRogueSneakAttackDice(1)).toBe(1)
    expect(getRogueSneakAttackDice(3)).toBe(2)
    expect(getRogueSneakAttackDice(10)).toBe(5)
    expect(getRogueSneakAttackDice(20)).toBe(10)
  })

  it('returns correct rogue expertise count', () => {
    expect(getRogueExpertiseCount(1)).toBe(2)
    expect(getRogueExpertiseCount(5)).toBe(2)
    expect(getRogueExpertiseCount(6)).toBe(4)
    expect(getRogueExpertiseCount(20)).toBe(4)
  })

  it('returns correct fighter critical threshold', () => {
    expect(getFighterCriticalThreshold(1)).toBe(20)
    expect(getFighterCriticalThreshold(3, 'champion')).toBe(19)
    expect(getFighterCriticalThreshold(15, 'champion')).toBe(18)
    expect(getFighterCriticalThreshold(15, 'battle_master')).toBe(20)
  })

  it('returns correct channel divinity uses', () => {
    expect(getChannelDivinityUses(1)).toBe(0)
    expect(getChannelDivinityUses(2)).toBe(1)
    expect(getChannelDivinityUses(5)).toBe(1)
    expect(getChannelDivinityUses(6)).toBe(2)
    expect(getChannelDivinityUses(17)).toBe(2)
    expect(getChannelDivinityUses(18)).toBe(3)
    expect(getChannelDivinityUses(20)).toBe(3)
  })

  it('detects divine strike domains', () => {
    expect(hasDivineStrike('life')).toBe(true)
    expect(hasDivineStrike('war')).toBe(true)
    expect(hasDivineStrike('light')).toBe(false)
    expect(hasDivineStrike('knowledge')).toBe(false)
    expect(hasDivineStrike(undefined)).toBe(false)
  })

  it('detects potent spellcasting domains', () => {
    expect(hasPotentSpellcasting('light')).toBe(true)
    expect(hasPotentSpellcasting('knowledge')).toBe(true)
    expect(hasPotentSpellcasting('grave')).toBe(true)
    expect(hasPotentSpellcasting('peace')).toBe(true)
    expect(hasPotentSpellcasting('life')).toBe(false)
    expect(hasPotentSpellcasting(undefined)).toBe(false)
  })

  it('returns correct divine strike dice', () => {
    expect(getClericDivineStrikeDice(7)).toBe('')
    expect(getClericDivineStrikeDice(8)).toBe('1d8')
    expect(getClericDivineStrikeDice(13)).toBe('1d8')
    expect(getClericDivineStrikeDice(14)).toBe('2d8')
    expect(getClericDivineStrikeDice(20)).toBe('2d8')
  })

  it('returns correct divine strike damage types', () => {
    expect(getClericDivineStrikeDamageType('life')).toBe('radiant')
    expect(getClericDivineStrikeDamageType('war')).toBe('weapon')
    expect(getClericDivineStrikeDamageType('tempest')).toBe('thunder')
    expect(getClericDivineStrikeDamageType('forge')).toBe('fire')
    expect(getClericDivineStrikeDamageType('order')).toBe('psychic')
    expect(getClericDivineStrikeDamageType('unknown')).toBe('')
  })

  it('returns correct paladin aura range', () => {
    expect(getPaladinAuraRange(5)).toBe(3)
    expect(getPaladinAuraRange(6)).toBe(3)
    expect(getPaladinAuraRange(17)).toBe(3)
    expect(getPaladinAuraRange(18)).toBe(9)
    expect(getPaladinAuraRange(20)).toBe(9)
  })

  it('detects paladin auras and abilities', () => {
    expect(hasPaladinAuraOfProtection(5)).toBe(false)
    expect(hasPaladinAuraOfProtection(6)).toBe(true)
    expect(hasPaladinAuraOfCourage(9)).toBe(false)
    expect(hasPaladinAuraOfCourage(10)).toBe(true)
    expect(hasPaladinImprovedDivineSmite(10)).toBe(false)
    expect(hasPaladinImprovedDivineSmite(11)).toBe(true)
    expect(hasPaladinCleansingTouch(13)).toBe(false)
    expect(hasPaladinCleansingTouch(14)).toBe(true)
  })

  it('returns correct cleansing touch uses', () => {
    expect(getPaladinCleansingTouchUses(0)).toBe(1)
    expect(getPaladinCleansingTouchUses(2)).toBe(3)
    expect(getPaladinCleansingTouchUses(5)).toBe(6)
    expect(getPaladinCleansingTouchUses(-1)).toBe(1)
  })

  it('returns correct ranger favored enemy count', () => {
    expect(getRangerFavoredEnemyCount(1)).toBe(1)
    expect(getRangerFavoredEnemyCount(5)).toBe(1)
    expect(getRangerFavoredEnemyCount(6)).toBe(2)
    expect(getRangerFavoredEnemyCount(13)).toBe(3)
    expect(getRangerFavoredEnemyCount(20)).toBe(3)
  })

  it('returns correct ranger natural explorer count', () => {
    expect(getRangerNaturalExplorerCount(1)).toBe(1)
    expect(getRangerNaturalExplorerCount(5)).toBe(1)
    expect(getRangerNaturalExplorerCount(6)).toBe(2)
    expect(getRangerNaturalExplorerCount(10)).toBe(3)
    expect(getRangerNaturalExplorerCount(20)).toBe(3)
  })

  it('returns correct ranger known spells', () => {
    expect(getRangerKnownSpells(1)).toBe(0)
    expect(getRangerKnownSpells(2)).toBe(2)
    expect(getRangerKnownSpells(5)).toBe(4)
    expect(getRangerKnownSpells(10)).toBe(6)
    expect(getRangerKnownSpells(20)).toBe(11)
  })

  it('detects ranger abilities by level', () => {
    expect(hasRangerExtraAttack(4)).toBe(false)
    expect(hasRangerExtraAttack(5)).toBe(true)
    expect(hasRangerVanish(13)).toBe(false)
    expect(hasRangerVanish(14)).toBe(true)
    expect(hasRangerFeralSenses(17)).toBe(false)
    expect(hasRangerFeralSenses(18)).toBe(true)
    expect(hasRangerFoeSlayer(19)).toBe(false)
    expect(hasRangerFoeSlayer(20)).toBe(true)
  })

  it('returns correct druid wild shape max CR', () => {
    expect(getDruidWildShapeMaxCR(1)).toBe(0)
    expect(getDruidWildShapeMaxCR(2)).toBe(0.25)
    expect(getDruidWildShapeMaxCR(4)).toBe(0.5)
    expect(getDruidWildShapeMaxCR(8)).toBe(1)
    expect(getDruidWildShapeMaxCR(20)).toBe(1)
  })

  it('returns correct druid wild shape uses', () => {
    expect(getDruidWildShapeUses(1)).toBe(0)
    expect(getDruidWildShapeUses(2)).toBe(2)
    expect(getDruidWildShapeUses(19)).toBe(2)
    expect(getDruidWildShapeUses(20)).toBe(999)
  })

  it('detects druid wild shape flight and swim', () => {
    expect(canDruidWildShapeFly(7)).toBe(false)
    expect(canDruidWildShapeFly(8)).toBe(true)
    expect(canDruidWildShapeSwim(3)).toBe(false)
    expect(canDruidWildShapeSwim(4)).toBe(true)
  })

  it('detects druid abilities by level', () => {
    expect(hasDruidWildShape(1)).toBe(false)
    expect(hasDruidWildShape(2)).toBe(true)
    expect(hasDruidTimelessBody(17)).toBe(false)
    expect(hasDruidTimelessBody(18)).toBe(true)
    expect(hasDruidArchdruid(19)).toBe(false)
    expect(hasDruidArchdruid(20)).toBe(true)
  })

  it('returns correct moon druid wild shape max CR', () => {
    expect(getDruidWildShapeMoonMaxCR(2)).toBe(1)
    expect(getDruidWildShapeMoonMaxCR(6)).toBe(2)
    expect(getDruidWildShapeMoonMaxCR(9)).toBe(3)
    expect(getDruidWildShapeMoonMaxCR(18)).toBe(6)
  })

  it('returns correct monk ki points', () => {
    expect(getMonkKiPoints(1)).toBe(0)
    expect(getMonkKiPoints(2)).toBe(2)
    expect(getMonkKiPoints(5)).toBe(5)
    expect(getMonkKiPoints(20)).toBe(20)
  })

  it('returns correct monk martial arts die', () => {
    expect(getMonkMartialArtsDie(1)).toBe('d4')
    expect(getMonkMartialArtsDie(5)).toBe('d6')
    expect(getMonkMartialArtsDie(11)).toBe('d8')
    expect(getMonkMartialArtsDie(17)).toBe('d10')
  })

  it('returns correct monk unarmored movement', () => {
    expect(getMonkUnarmoredMovement(1)).toBe(0)
    expect(getMonkUnarmoredMovement(2)).toBe(3)
    expect(getMonkUnarmoredMovement(6)).toBe(4.5)
    expect(getMonkUnarmoredMovement(18)).toBe(9)
  })

  it('detects monk abilities by level', () => {
    expect(hasMonkEvasion(6)).toBe(false)
    expect(hasMonkEvasion(7)).toBe(true)
    expect(hasMonkStillnessOfMind(6)).toBe(false)
    expect(hasMonkStillnessOfMind(7)).toBe(true)
    expect(hasMonkPurityOfBody(9)).toBe(false)
    expect(hasMonkPurityOfBody(10)).toBe(true)
    expect(hasMonkDiamondSoul(13)).toBe(false)
    expect(hasMonkDiamondSoul(14)).toBe(true)
    expect(hasMonkEmptyBody(17)).toBe(false)
    expect(hasMonkEmptyBody(18)).toBe(true)
    expect(hasMonkPerfectSelf(19)).toBe(false)
    expect(hasMonkPerfectSelf(20)).toBe(true)
  })

  it('returns correct wizard arcane recovery slots', () => {
    expect(getWizardArcaneRecoverySlots(1)).toBe(1)
    expect(getWizardArcaneRecoverySlots(5)).toBe(3)
    expect(getWizardArcaneRecoverySlots(10)).toBe(5)
    expect(getWizardArcaneRecoverySlots(20)).toBe(10)
  })

  it('returns correct wizard prepared spells count', () => {
    expect(getWizardPreparedSpellsCount(1, 3)).toBe(4)
    expect(getWizardPreparedSpellsCount(5, 2)).toBe(7)
    expect(getWizardPreparedSpellsCount(10, 0)).toBe(10)
    expect(getWizardPreparedSpellsCount(1, -1)).toBe(1)
  })

  it('returns correct wizard cantrips known', () => {
    expect(getWizardCantripsKnown(1)).toBe(3)
    expect(getWizardCantripsKnown(4)).toBe(4)
    expect(getWizardCantripsKnown(10)).toBe(5)
    expect(getWizardCantripsKnown(20)).toBe(5)
  })

  it('detects wizard abilities by level', () => {
    expect(hasWizardSpellMastery(17)).toBe(false)
    expect(hasWizardSpellMastery(18)).toBe(true)
    expect(hasWizardSignatureSpells(19)).toBe(false)
    expect(hasWizardSignatureSpells(20)).toBe(true)
  })

  it('returns correct bard inspiration die', () => {
    expect(getBardInspirationDie(1)).toBe('d6')
    expect(getBardInspirationDie(5)).toBe('d8')
    expect(getBardInspirationDie(10)).toBe('d10')
    expect(getBardInspirationDie(15)).toBe('d12')
  })

  it('returns correct bard inspiration uses', () => {
    expect(getBardInspirationUses(1)).toBe(0)
    expect(getBardInspirationUses(2)).toBe(1)
    expect(getBardInspirationUses(5)).toBe(2)
    expect(getBardInspirationUses(17)).toBe(5)
  })

  it('returns correct bard song of rest die', () => {
    expect(getBardSongOfRestDie(1)).toBe('d6')
    expect(getBardSongOfRestDie(9)).toBe('d8')
    expect(getBardSongOfRestDie(13)).toBe('d10')
    expect(getBardSongOfRestDie(17)).toBe('d12')
  })

  it('returns correct bard magical secrets count', () => {
    expect(getBardMagicalSecretsCount(5)).toBe(0)
    expect(getBardMagicalSecretsCount(10)).toBe(2)
    expect(getBardMagicalSecretsCount(14)).toBe(4)
    expect(getBardMagicalSecretsCount(20)).toBe(6)
  })

  it('detects bard abilities by level', () => {
    expect(hasBardCountercharm(5)).toBe(false)
    expect(hasBardCountercharm(6)).toBe(true)
    expect(hasBardSuperiorInspiration(19)).toBe(false)
    expect(hasBardSuperiorInspiration(20)).toBe(true)
  })

  it('returns correct bard prepared spells count', () => {
    expect(getBardPreparedSpellsCount(1, 3)).toBe(4)
    expect(getBardPreparedSpellsCount(5, 2)).toBe(7)
    expect(getBardPreparedSpellsCount(1, -1)).toBe(1)
  })

  it('returns correct sorcerer sorcery points', () => {
    expect(getSorcererSorceryPoints(1)).toBe(0)
    expect(getSorcererSorceryPoints(2)).toBe(2)
    expect(getSorcererSorceryPoints(5)).toBe(5)
    expect(getSorcererSorceryPoints(20)).toBe(20)
  })

  it('returns correct sorcerer metamagic count', () => {
    expect(getSorcererMetamagicCount(1)).toBe(0)
    expect(getSorcererMetamagicCount(2)).toBe(2)
    expect(getSorcererMetamagicCount(10)).toBe(3)
    expect(getSorcererMetamagicCount(17)).toBe(4)
  })

  it('returns correct sorcerer known spells', () => {
    expect(getSorcererKnownSpells(1)).toBe(3)
    expect(getSorcererKnownSpells(5)).toBe(7)
    expect(getSorcererKnownSpells(15)).toBe(15)
  })

  it('returns correct sorcerer cantrips known', () => {
    expect(getSorcererCantripsKnown(1)).toBe(4)
    expect(getSorcererCantripsKnown(4)).toBe(5)
    expect(getSorcererCantripsKnown(10)).toBe(6)
  })

  it('detects sorcerer sorcerous restoration', () => {
    expect(hasSorcererSorcerousRestoration(19)).toBe(false)
    expect(hasSorcererSorcerousRestoration(20)).toBe(true)
  })

  it('returns correct warlock slot level', () => {
    expect(getWarlockSlotLevel(1)).toBe(1)
    expect(getWarlockSlotLevel(5)).toBe(3)
    expect(getWarlockSlotLevel(9)).toBe(5)
    expect(getWarlockSlotLevel(20)).toBe(5)
  })

  it('returns correct warlock slot count', () => {
    expect(getWarlockSlotCount(1)).toBe(1)
    expect(getWarlockSlotCount(2)).toBe(2)
    expect(getWarlockSlotCount(11)).toBe(3)
    expect(getWarlockSlotCount(17)).toBe(4)
  })

  it('returns correct warlock invocations known', () => {
    expect(getWarlockInvocationsKnown(1)).toBe(0)
    expect(getWarlockInvocationsKnown(2)).toBe(2)
    expect(getWarlockInvocationsKnown(5)).toBe(2)
    expect(getWarlockInvocationsKnown(9)).toBe(4)
    expect(getWarlockInvocationsKnown(17)).toBe(8)
  })

  it('returns correct warlock mystic arcanum level', () => {
    expect(getWarlockMysticArcanumLevel(10)).toBe(0)
    expect(getWarlockMysticArcanumLevel(11)).toBe(6)
    expect(getWarlockMysticArcanumLevel(15)).toBe(8)
    expect(getWarlockMysticArcanumLevel(17)).toBe(9)
  })

  it('detects warlock eldritch master', () => {
    expect(hasWarlockEldritchMaster(19)).toBe(false)
    expect(hasWarlockEldritchMaster(20)).toBe(true)
  })
})
