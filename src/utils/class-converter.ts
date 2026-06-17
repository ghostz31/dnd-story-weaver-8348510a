/**
 * Convertisseur ClassV2 (Aurora) → CharacterClass (format V1 utilisé par le wizard)
 */

import type { CharacterClass, AbilityScores } from '../types/character'
import type { ClassV2 } from '../types/aurora-v2'

const ABILITY_MAP: Record<string, keyof AbilityScores> = {
  strength: 'str',
  dexterity: 'dex',
  constitution: 'con',
  intelligence: 'int',
  wisdom: 'wis',
  charisma: 'cha',
}

const SKILL_NAME_MAP: Record<string, string> = {
  ID_SKILL_ACROBATICS: 'Acrobaties',
  ID_SKILL_ANIMAL_HANDLING: 'Dressage',
  ID_SKILL_ARCANA: 'Arcanes',
  ID_SKILL_ATHLETICS: 'Athlétisme',
  ID_SKILL_DECEPTION: 'Tromperie',
  ID_SKILL_HISTORY: 'Histoire',
  ID_SKILL_INSIGHT: 'Perspicacité',
  ID_SKILL_INTIMIDATION: 'Intimidation',
  ID_SKILL_INVESTIGATION: 'Investigation',
  ID_SKILL_MEDICINE: 'Médecine',
  ID_SKILL_NATURE: 'Nature',
  ID_SKILL_PERCEPTION: 'Perception',
  ID_SKILL_PERFORMANCE: 'Représentation',
  ID_SKILL_PERSUASION: 'Persuasion',
  ID_SKILL_RELIGION: 'Religion',
  ID_SKILL_SLEIGHT_OF_HAND: 'Escamotage',
  ID_SKILL_STEALTH: 'Discrétion',
  ID_SKILL_SURVIVAL: 'Survie',
}

// Tables standard D&D 5e pour les emplacements de sorts (full caster)
const FULL_CASTER_SLOTS: number[][] = [
  [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2],
  [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
]

// Half caster (paladin, ranger)
const HALF_CASTER_SLOTS: number[][] = [
  [], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3],
  [4, 3, 2], [4, 3, 2], [4, 3, 3], [4, 3, 3],
  [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2],
  [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2],
]

// Third caster (eldritch knight, arcane trickster)
const THIRD_CASTER_SLOTS: number[][] = [
  [], [], [2], [3], [3], [4, 2], [4, 2], [4, 3],
  [4, 3], [4, 3, 2], [4, 3, 2], [4, 3, 3],
  [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2],
  [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
]

// Warlock (pact magic)
const PACT_SLOTS: number[][] = [
  [1], [2], [0, 2], [0, 2], [0, 0, 2], [0, 0, 2], [0, 0, 0, 2], [0, 0, 0, 2],
  [0, 0, 0, 0, 2], [0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 3], [0, 0, 0, 0, 0, 3],
  [0, 0, 0, 0, 0, 3], [0, 0, 0, 0, 0, 3], [0, 0, 0, 0, 0, 3], [0, 0, 0, 0, 0, 3],
  [0, 0, 0, 0, 0, 3], [0, 0, 0, 0, 0, 3], [0, 0, 0, 0, 0, 3], [0, 0, 0, 0, 0, 4],
]

function getSpellSlots(type: string | undefined): number[][] {
  switch (type) {
    case 'full': return FULL_CASTER_SLOTS
    case 'half': return HALF_CASTER_SLOTS
    case 'third': return THIRD_CASTER_SLOTS
    case 'pact': return PACT_SLOTS
    default: return []
  }
}

function getCantripsKnown(type: string | undefined): number[] {
  if (!type || type === 'pact') {
    // Warlock cantrips
    return [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
  }
  if (type === 'full') {
    return [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
  }
  if (type === 'half') {
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
  if (type === 'third') {
    return [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
  }
  return []
}

function extractSkillChoices(cls: ClassV2): { skills: string[]; count: number } {
  const skills: string[] = []
  let count = 0

  // Scan level 1 features for skill selection rules
  const level1Features = cls.features?.[1] || []
  for (const feature of level1Features) {
    for (const rule of feature.rules || []) {
      if (rule.type === 'select' && rule.targetType === 'skill') {
        count = rule.count || 1
        if (Array.isArray(rule.options)) {
          for (const opt of rule.options) {
            const skillName = SKILL_NAME_MAP[String(opt)]
            if (skillName) skills.push(skillName)
          }
        }
      }
    }
  }

  return { skills, count }
}

function extractProficiencies(cls: ClassV2): { armor: string[]; weapons: string[] } {
  const armor: string[] = []
  const weapons: string[] = []

  // Scan all features for proficiency grants
  for (const levelFeatures of Object.values(cls.features || {})) {
    for (const feature of levelFeatures) {
      for (const rule of feature.rules || []) {
        if (rule.type === 'grant' && rule.targetType === 'proficiency') {
          const id = String(rule.targetId)
          if (id.startsWith('ID_ARMOR_')) {
            const name = id.replace('ID_ARMOR_', '').replace(/_/g, ' ').toLowerCase()
            armor.push(name)
          } else if (id.startsWith('ID_WEAPON_')) {
            const name = id.replace('ID_WEAPON_', '').replace(/_/g, ' ').toLowerCase()
            weapons.push(name)
          }
        }
      }
    }
  }

  return { armor, weapons }
}

export function convertAuroraClass(cls: ClassV2): CharacterClass {
  const primaryAbility = ABILITY_MAP[cls.primaryAbility[0]] || 'str'
  const savingThrows = cls.savingThrows.map(s => ABILITY_MAP[s] || s)

  const { skills, count: numSkillChoices } = extractSkillChoices(cls)
  const { armor, weapons } = extractProficiencies(cls)

  // Build spellcasting info
  let spellcasting: CharacterClass['spellcasting'] | undefined
  if (cls.spellcasting) {
    const ability = ABILITY_MAP[cls.spellcasting.ability] || 'int'
    spellcasting = {
      ability,
      cantripsKnown: getCantripsKnown(cls.spellcasting.type),
      spellSlots: getSpellSlots(cls.spellcasting.type),
    }

    // Add spellsKnown if present (bard, sorcerer, warlock)
    if (cls.spellcasting.spellsKnown && Object.keys(cls.spellcasting.spellsKnown).length > 0) {
      const knownArr = new Array(20).fill(0)
      for (const [lvl, count] of Object.entries(cls.spellcasting.spellsKnown)) {
        knownArr[parseInt(lvl) - 1] = count as number
      }
      spellcasting.spellsKnown = knownArr
    }
  }

  // Build classResources flags
  const classResources: CharacterClass['classResources'] = {}
  for (const res of cls.resources || []) {
    const name = res.name.toLowerCase()
    if (name.includes('rage')) classResources.hasRage = true
    if (name.includes('ki')) classResources.hasKi = true
    if (name.includes('canal') || name.includes('channel') || name.includes('divin')) classResources.hasChannelDivinity = true
    if (name.includes('sorcellerie') || name.includes('sorcery')) classResources.hasSorceryPoints = true
    if (name.includes('sneak') || name.includes('sournoise')) classResources.hasSneakAttack = true
    if (name.includes('bardique') || name.includes('bardic')) classResources.hasBardicInspiration = true
    if (name.includes('mains') || name.includes('hands') || name.includes('imposition')) classResources.hasLayOnHands = true
    if (name.includes('second') || name.includes('souffle') || name.includes('wind')) classResources.hasSecondWind = true
    if (name.includes('sauvage') || name.includes('wild shape')) classResources.hasWildShape = true
    if (name.includes('fougue') || name.includes('action surge')) classResources.hasActionSurge = true
    if (name.includes('indomptable') || name.includes('indomitable')) classResources.hasIndomitable = true
    if (name.includes('chatiment') || name.includes('smite')) classResources.hasDivineSmite = true
    if (name.includes('arcanique') || name.includes('arcane recovery')) classResources.hasArcaneRecovery = true
    if (name.includes('invocation') || name.includes('eldritch')) classResources.hasEldritchInvocations = true
    if (name.includes('ennemi') || name.includes('favored enemy')) classResources.hasFavoredEnemy = true
  }

  return {
    id: cls.id,
    name: cls.name,
    nameEn: cls.nameEn,
    hitDie: cls.hitDice,
    primaryAbility,
    savingThrows,
    skillChoices: skills.length > 0 ? skills : ['Athlétisme', 'Perception'], // fallback
    numSkillChoices: numSkillChoices || 2,
    armorProficiencies: armor.length > 0 ? armor : ['Armures légères'],
    weaponProficiencies: weapons.length > 0 ? weapons : ['Armes courantes'],
    startingEquipment: [], // Not extracting from Aurora for now
    spellcasting,
    classResources,
  }
}
