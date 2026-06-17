/**
 * Validation des prérequis de dons (Feats)
 * Vérifie si un personnage remplit les conditions pour choisir un don.
 */

import type { Character, CharacterCreation, AbilityScores } from '../types/character'
import type { Feat } from '../data/feats'

export interface PrerequisiteCheck {
  valid: boolean
  reason?: string
}

/** Type générique acceptant n'importe quelle forme de personnage */
type AnyCharacter = Character | CharacterCreation | Record<string, unknown>

// ============================================================================
// HELPERS
// ============================================================================

function getClassArmorProficiencies(character: AnyCharacter): string[] {
  const c = character as any
  return c.class?.armorProficiencies || c.characterClass?.armorProficiencies || []
}

function getClassWeaponProficiencies(character: AnyCharacter): string[] {
  const c = character as any
  return c.class?.weaponProficiencies || c.characterClass?.weaponProficiencies || []
}

function hasArmorProficiency(
  character: AnyCharacter,
  armorType: 'légères' | 'intermédiaires' | 'lourdes'
): boolean {
  const profs = getClassArmorProficiencies(character)
  const lowerProfs = profs.map((p: string) => p.toLowerCase())

  // "Toutes les armures" couvre tout
  if (lowerProfs.some((p: string) => p.includes('toutes'))) return true

  if (armorType === 'légères') {
    return lowerProfs.some((p: string) => p.includes('légères'))
  }
  if (armorType === 'intermédiaires') {
    return lowerProfs.some((p: string) => p.includes('intermédiaires'))
  }
  if (armorType === 'lourdes') {
    return lowerProfs.some((p: string) => p.includes('lourdes'))
  }
  return false
}

function hasMartialWeaponProficiency(character: AnyCharacter): boolean {
  const profs = getClassWeaponProficiencies(character)
  const lowerProfs = profs.map((p: string) => p.toLowerCase())
  return lowerProfs.some((p: string) =>
    p.includes('martiales') || p.includes('de guerre') || p.includes('toutes')
  )
}

function canCastSpells(character: AnyCharacter): boolean {
  const c = character as any
  return !!(
    c.spellcasting ||
    c.spellcastingAbility ||
    c.class?.spellcasting ||
    c.characterClass?.spellcasting
  )
}

function matchesRaceRequirement(
  character: AnyCharacter,
  requirement: string
): boolean {
  const c = character as any
  const raceId = c.race?.id?.toLowerCase() || ''
  const raceName = c.race?.name?.toLowerCase() || ''
  const subrace = (c.subrace || '').toLowerCase()
  const raceNameEn = c.race?.nameEn?.toLowerCase() || ''

  const req = requirement.toLowerCase()

  // Mapping des termes de prérequis aux IDs/noms de race
  const raceMappings: Record<string, string[]> = {
    'halfelin': ['halfling', 'halfelin', 'pied-léger', 'stout', 'lightfoot'],
    'halfling': ['halfling', 'halfelin', 'pied-léger', 'stout', 'lightfoot'],
    'elfe': ['elf', 'elfe', 'haut-elfe', 'high-elf', 'wood-elf', 'elfe des bois', 'dark-elf', 'elfe noir', 'drow'],
    'elf': ['elf', 'elfe', 'haut-elfe', 'high-elf', 'wood-elf', 'elfe des bois', 'dark-elf', 'elfe noir', 'drow'],
    'demi-elfe': ['half-elf', 'demi-elfe'],
    'half-elf': ['half-elf', 'demi-elfe'],
    'nain': ['dwarf', 'nain', 'hill-dwarf', 'nain des collines', 'mountain-dwarf', 'nain des montagnes'],
    'dwarf': ['dwarf', 'nain', 'hill-dwarf', 'nain des collines', 'mountain-dwarf', 'nain des montagnes'],
    'gnome': ['gnome'],
    'demi-orque': ['half-orc', 'demi-orque'],
    'half-orc': ['half-orc', 'demi-orque'],
    'tiefling': ['tiefling'],
    'draconique': ['dragonborn', 'draconique'],
    'dragonborn': ['dragonborn', 'draconique'],
    'drow': ['dark-elf', 'drow', 'elfe noir'],
    'elfe des bois': ['wood-elf', 'elfe des bois'],
    'wood elf': ['wood-elf', 'elfe des bois'],
    'humain': ['human', 'humain'],
    'human': ['human', 'humain'],
    'petit': ['halfling', 'halfelin', 'gnome', 'pied-léger', 'stout', 'lightfoot'],
    'small': ['halfling', 'halfelin', 'gnome', 'pied-léger', 'stout', 'lightfoot'],
  }

  // Extraire les races mentionnées dans le prérequis
  const terms = req.split(/[/,\s]+/).filter((t: string) => t.length > 2)

  for (const term of terms) {
    const mapped = raceMappings[term]
    if (!mapped) continue

    if (
      mapped.includes(raceId) ||
      mapped.includes(raceName) ||
      mapped.includes(subrace) ||
      mapped.includes(raceNameEn)
    ) {
      return true
    }
  }

  // Vérification directe
  const allChecks = [raceId, raceName, subrace, raceNameEn]
  for (const check of allChecks) {
    if (check.includes(req) || req.includes(check)) {
      // Éviter les faux positifs (ex: "elfe" contient "elf")
      if (req === 'elf' && check.includes('elfe')) return true
      if (req === 'elfe' && check.includes('elf')) return true
      if (check === req) return true
    }
  }

  return false
}

// ============================================================================
// PARSERS
// ============================================================================

function parseAbilityPrerequisite(prerequisite: string): { stat: keyof AbilityScores; min: number } | null {
  // Formats : "DEX 13", "FOR 13", "CHA 13", "Dextérité 13"
  const match = prerequisite.match(/(FOR|DEX|CON|INT|SAG|CHA|Force|Dextérité|Constitution|Intelligence|Sagesse|Charisme)\s+(\d+)/i)
  if (!match) return null

  const statMap: Record<string, keyof AbilityScores> = {
    for: 'str', force: 'str',
    dex: 'dex', dextérité: 'dex',
    con: 'con', constitution: 'con',
    int: 'int', intelligence: 'int',
    sag: 'wis', sagesse: 'wis',
    cha: 'cha', charisme: 'cha',
  }

  const stat = statMap[match[1].toLowerCase()]
  const min = parseInt(match[2], 10)
  if (!stat || isNaN(min)) return null

  return { stat, min }
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

export function checkFeatPrerequisites(
  character: AnyCharacter,
  feat: Feat
): PrerequisiteCheck {
  if (!feat.prerequisite) return { valid: true }

  const prereq = feat.prerequisite
  const lowerPrereq = prereq.toLowerCase()

  // ─── Prérequis de caractéristique (ex: "DEX 13") ───
  const abilityReq = parseAbilityPrerequisite(prereq)
  if (abilityReq) {
    const scores = (character as any).abilityScores as AbilityScores
    const score = scores[abilityReq.stat]
    if (score < abilityReq.min) {
      return {
        valid: false,
        reason: `${abilityReq.stat.toUpperCase()} ${score} (minimum requis : ${abilityReq.min})`
      }
    }
    return { valid: true }
  }

  // ─── Maîtrise des armures ───
  if (lowerPrereq.includes('armures lourdes')) {
    if (!hasArmorProficiency(character, 'lourdes')) {
      return { valid: false, reason: 'Maîtrise des armures lourdes requise' }
    }
    return { valid: true }
  }

  if (lowerPrereq.includes('armures intermédiaires')) {
    if (!hasArmorProficiency(character, 'intermédiaires')) {
      return { valid: false, reason: 'Maîtrise des armures intermédiaires requise' }
    }
    return { valid: true }
  }

  if (lowerPrereq.includes('armures légères')) {
    if (!hasArmorProficiency(character, 'légères')) {
      return { valid: false, reason: 'Maîtrise des armures légères requise' }
    }
    return { valid: true }
  }

  // ─── Maîtrise des armes martiales ───
  if (lowerPrereq.includes('armes martiales') || lowerPrereq.includes('armes de guerre')) {
    if (!hasMartialWeaponProficiency(character)) {
      return { valid: false, reason: 'Maîtrise des armes martiales requise' }
    }
    return { valid: true }
  }

  // ─── Capacité à lancer des sorts ───
  if (lowerPrereq.includes('sorts') || lowerPrereq.includes('spellcasting')) {
    if (!canCastSpells(character)) {
      return { valid: false, reason: 'Capacité à lancer des sorts requise' }
    }
    return { valid: true }
  }

  // ─── Prérequis de race ───
  // Liste des mots-clés de race à rechercher
  const raceKeywords = [
    'halfelin', 'halfling', 'elfe', 'elf', 'demi-elfe', 'half-elf',
    'nain', 'dwarf', 'gnome', 'demi-orque', 'half-orc', 'tiefling',
    'draconique', 'dragonborn', 'drow', 'elfe des bois', 'wood elf',
    'humain', 'human', 'petit', 'small'
  ]

  const hasRaceKeyword = raceKeywords.some(kw => lowerPrereq.includes(kw))
  if (hasRaceKeyword) {
    if (!matchesRaceRequirement(character, prereq)) {
      return { valid: false, reason: `Race incompatible : ${prereq}` }
    }
    return { valid: true }
  }

  // ─── Prérequis inconnu ───
  // Par défaut, on laisse passer avec un avertissement (permissif)
  return { valid: true }
}

/**
 * Filtre une liste de dons pour ne garder que ceux dont le personnage remplit les prérequis.
 */
export function filterFeatsByPrerequisites(
  character: AnyCharacter,
  feats: Feat[]
): { available: Feat[]; unavailable: Array<{ feat: Feat; reason: string }> } {
  const available: Feat[] = []
  const unavailable: Array<{ feat: Feat; reason: string }> = []

  for (const feat of feats) {
    const check = checkFeatPrerequisites(character, feat)
    if (check.valid) {
      available.push(feat)
    } else if (check.reason) {
      unavailable.push({ feat, reason: check.reason })
    }
  }

  return { available, unavailable }
}
