/**
 * Adapter: convert StoredCharacter (Firestore format) to Character (Combat Engine format)
 */

import type { Character, Race, CharacterClass, AbilityScores, StoredCharacter } from '../types/character'
import { getProficiencyBonus } from './rules-engine'

export function storedCharacterToCombatCharacter(stored: StoredCharacter): Character {
  const race: Race = stored.race ?? {
    id: 'human',
    name: 'Humain',
    nameEn: 'Human',
    abilityBonuses: {},
    speed: 9,
    size: 'Moyen',
    traits: [],
    languages: ['Commun'],
  }

  const characterClass: CharacterClass = stored.characterClass ?? {
    id: 'fighter',
    name: 'Guerrier',
    nameEn: 'Fighter',
    hitDie: 10,
    primaryAbility: 'str',
    savingThrows: ['str', 'con'],
    skillChoices: [],
    numSkillChoices: 2,
    armorProficiencies: ['light', 'medium', 'heavy', 'shield'],
    weaponProficiencies: ['simple', 'martial'],
    startingEquipment: [],
  }

  const abilityScores: AbilityScores = stored.abilityScores

  const dexMod = Math.floor((abilityScores.dex - 10) / 2)

  // Equipment: only equipped and attuned items
  const equipment = (stored.inventory?.items || []).filter(item => {
    if (!item.equipped) return false
    if (item.attunement && !item.attuned) return false
    return true
  })

  const speed = race.speed + equipment.reduce((sum, i) => sum + (i.speedBonus || 0), 0)

  return {
    id: stored.id,
    name: stored.name,
    race,
    subrace: stored.subrace || undefined,
    class: characterClass,
    subclass: stored.subclass,
    level: stored.level,
    background: stored.background || '',
    alignment: stored.alignment || '',
    abilityScores,
    hp: {
      current: stored.currentHp ?? stored.hp,
      max: stored.hp,
      temp: stored.tempHp ?? 0,
    },
    ac: stored.ac,
    initiative: dexMod,
    speed,
    proficiencyBonus: getProficiencyBonus(stored.level),
    actionsPerTurn: 1,
    bonusActionsPerTurn: 1,
    reactionsPerTurn: 1,
    skillProficiencies: stored.skillProficiencies || [],
    savingThrowProficiencies: characterClass.savingThrows.map(s => String(s)),
    languages: race.languages || [],
    toolProficiencies: [],
    equipment,
    currency: stored.inventory?.currency || { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
    personalityTraits: stored.personalityTraits || '',
    ideals: stored.ideals || '',
    bonds: stored.bonds || '',
    flaws: stored.flaws || '',
    backstory: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    feats: stored.feats || [],
    asiChoices: stored.asiChoices || {},
    customAbilityBonuses: stored.customAbilityBonuses,
    activeConditions: stored.activeConditions || [],
    exhaustionLevel: stored.exhaustionLevel || 0,
    classResourcesUsed: stored.classResourcesUsed || {},
    metamagicChoices: stored.metamagicChoices || [],
    featToggles: stored.featToggles || {},
    classOptions: stored.classOptions || {},
  }
}
