/**
 * Convertisseur SpellV2 (Aurora) → Spell (format V1 utilisé par le wizard)
 */

import type { Spell } from '../types/spell'
import type { SpellV2 } from '../types/aurora-v2'

const CLASS_MAP: Record<string, string> = {
  sorcerer: 'Ensorceleur',
  wizard: 'Magicien',
  cleric: 'Clerc',
  druid: 'Druide',
  bard: 'Barde',
  paladin: 'Paladin',
  ranger: 'Rôdeur',
  warlock: 'Occultiste',
  artificer: 'Artificier',
}

const SCHOOL_MAP: Record<string, string> = {
  abjuration: 'Abjuration',
  conjuration: 'Invocation',
  divination: 'Divination',
  enchantment: 'Enchantement',
  evocation: 'Évocation',
  illusion: 'Illusion',
  necromancy: 'Nécromancie',
  transmutation: 'Transmutation',
}

function formatCastingTime(ct: SpellV2['castingTime']): string {
  switch (ct.type) {
    case 'action': return '1 action'
    case 'bonus': return '1 action bonus'
    case 'reaction': return ct.condition ? `1 réaction, ${ct.condition}` : '1 réaction'
    case 'minute': return `${ct.value || 1} minute${ct.value && ct.value > 1 ? 's' : ''}`
    case 'hour': return `${ct.value || 1} heure${ct.value && ct.value > 1 ? 's' : ''}`
    default: return ct.type
  }
}

function formatRange(range: SpellV2['range']): string {
  switch (range.type) {
    case 'self': return 'Personnelle'
    case 'touch': return 'Contact'
    case 'ranged': return `${range.distance} ${range.unit === 'feet' ? 'ft' : range.unit}`
    case 'unlimited': return 'Illimitée'
    case 'sight': return 'Vue'
    case 'special': return 'Spéciale'
    default: return range.type
  }
}

function formatComponents(components: SpellV2['components']): string {
  const parts: string[] = []
  if (components.verbal) parts.push('V')
  if (components.somatic) parts.push('S')
  if (components.material) parts.push(`M (${components.material.text})`)
  return parts.join(', ')
}

function formatDuration(duration: SpellV2['duration']): string {
  switch (duration.type) {
    case 'instant': return 'Instantanée'
    case 'permanent': return 'Permanente'
    case 'special': return 'Spéciale'
    case 'timed': {
      const conc = duration.concentration ? 'Concentration, ' : ''
      return `${conc}jusqu'à ${duration.time || ''}`
    }
    default: return duration.type
  }
}

export function convertAuroraSpell(spell: SpellV2): Spell {
  return {
    name: spell.name,
    level: spell.level,
    school: SCHOOL_MAP[spell.school] || spell.school,
    castingTime: formatCastingTime(spell.castingTime),
    range: formatRange(spell.range),
    components: formatComponents(spell.components),
    duration: formatDuration(spell.duration),
    classes: (spell.spellLists || []).map(c => CLASS_MAP[c] || c).filter(Boolean),
    description: spell.description.full || spell.description.short || '',
    source: spell.source,
    ritual: (spell as any).ritual || false,
  }
}

export function loadAuroraSpells(): Promise<Spell[]> {
  return fetch('/data/aurora/spells.json')
    .then(res => res.json())
    .then((data: SpellV2[]) => {
      return data.map(convertAuroraSpell)
    })
    .catch(err => {
      console.error('Error loading Aurora spells:', err)
      return []
    })
}
