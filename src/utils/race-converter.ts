/**
 * Convertisseur RaceV2 (Aurora) → Race (format V1 utilisé par le wizard)
 */

import type { Race, Subrace, AbilityScores } from '../types/character'
import type { RaceV2 } from '../types/aurora-v2'

const ABILITY_MAP: Record<string, keyof AbilityScores> = {
  strength: 'str',
  dexterity: 'dex',
  constitution: 'con',
  intelligence: 'int',
  wisdom: 'wis',
  charisma: 'cha',
}

const SIZE_MAP: Record<string, Race['size']> = {
  small: 'Petit',
  medium: 'Moyen',
  large: 'Grand',
}

/**
 * Convertit une liste de races Aurora en format V1
 * @param auroraRaces Races depuis loadRaces().races
 * @param traitsMap Map des traits depuis loadRaces().traits
 */
export function convertAuroraRaces(
  auroraRaces: RaceV2[],
  traitsMap: Record<string, { name: string; description: string }>
): Race[] {
  return auroraRaces.map(r => convertSingleRace(r, traitsMap))
}

function convertSingleRace(
  r: RaceV2,
  traitsMap: Record<string, { name: string; description: string }>
): Race {
  const abilityBonuses: Partial<AbilityScores> = {}
  for (const [key, val] of Object.entries(r.abilityBonuses || {})) {
    const mapped = ABILITY_MAP[key]
    if (mapped) abilityBonuses[mapped] = val
  }

  const traitNames = r.traits
    .map(id => traitsMap[id]?.name)
    .filter(Boolean) as string[]

  const traitDetails: Record<string, string> = {}
  for (const id of r.traits) {
    const t = traitsMap[id]
    if (t) traitDetails[t.name] = t.description
  }

  const subraces: Subrace[] | undefined = r.subraces?.map(s => {
    const subBonuses: Partial<AbilityScores> = {}
    for (const [key, val] of Object.entries(s.abilityBonuses || {})) {
      const mapped = ABILITY_MAP[key]
      if (mapped) subBonuses[mapped] = val
    }
    const subTraitNames = s.traits
      .map(id => traitsMap[id]?.name)
      .filter(Boolean) as string[]
    return {
      id: s.id,
      name: s.name,
      abilityBonuses: subBonuses,
      traits: subTraitNames,
    }
  })

  return {
    id: r.id,
    name: r.name,
    nameEn: r.nameEn,
    source: r.source as Race['source'],
    abilityBonuses,
    speed: typeof r.speed === 'number' ? r.speed : r.speed.base,
    size: SIZE_MAP[r.size] || 'Moyen',
    traits: traitNames,
    traitDetails,
    languages: r.languages.map(id => {
      // Simple extraction du nom de langue depuis l'ID
      const match = id.match(/ID_LANGUAGE_(\w+)/)
      return match ? capitalizeFirst(match[1]) : id
    }),
    subraces: subraces && subraces.length > 0 ? subraces : undefined,
  }
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}
