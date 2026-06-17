import type { Character, AbilityScores } from '../../types/character'
import type { ItemV2 } from '../../types/aurora-v2'
import type { AttackCondition } from '../feat-effects'
import { getProficiencyBonus } from '../rules-engine'
import { getFeatById } from '../../data/feats'
import { normalizeClassId } from '../feature-helpers'

// ============================================================================
// TYPES DE RÉSOLUTION
// ============================================================================

export interface AttackBreakdown {
  baseAbility: {
    ability: keyof AbilityScores
    modifier: number
    label: string
  }
  proficiency: {
    has: boolean
    bonus: number
    label: string
  }
  magicBonus: {
    total: number
    items: Array<{ name: string; bonus: number }>
  }
  featBonus: {
    total: number
    feats: Array<{ name: string; bonus: number }>
  }
  conditional: {
    advantage: string[]    // Sources d'avantage
    disadvantage: string[]  // Sources de désavantage
  }
}

// ============================================================================
// ÉVALUATION DES DONS TOGGLEABLES EN CONTEXTE
// ============================================================================

function matchesFeatCondition(
  condition: AttackCondition | undefined,
  weapon: ItemV2 | null,
  options: { isRanged?: boolean; isSpell?: boolean; isTwoHanded?: boolean }
): boolean {
  if (!condition) return true // Pas de condition = toujours actif

  switch (condition) {
    case 'ranged-weapon':
      return options.isRanged || !!weapon?.range
    case 'melee-weapon':
      return !options.isRanged && !options.isSpell && !weapon?.range
    case 'melee-one-handed':
      return !options.isRanged && !options.isSpell && !options.isTwoHanded && !weapon?.weaponProperties?.includes('two-handed')
    case 'heavy-weapon':
      return !!weapon?.weaponProperties?.includes('heavy')
    case 'two-handed':
      return options.isTwoHanded || !!weapon?.weaponProperties?.includes('two-handed')
    case 'finesse-weapon':
      return !!weapon?.weaponProperties?.includes('finesse')
    case 'spell-attack':
      return !!options.isSpell
    default:
      return false
  }
}

interface FeatToggleCombatEffects {
  attackModifier: number
  damageModifier: number
  damageDiceExtra: string | null
}

export function getActiveFeatToggleEffects(
  character: Character,
  weapon: ItemV2 | null,
  options: { isRanged?: boolean; isSpell?: boolean; isTwoHanded?: boolean }
): FeatToggleCombatEffects {
  const result: FeatToggleCombatEffects = {
    attackModifier: 0,
    damageModifier: 0,
    damageDiceExtra: null,
  }

  const featToggles = character.featToggles || {}
  const feats = character.feats || []

  for (const featId of feats) {
    const feat = getFeatById(featId)
    if (!feat?.effects?.toggles) continue

    for (const [key, toggle] of Object.entries(feat.effects.toggles)) {
      const isActive = featToggles[`${featId}:${key}`] ?? toggle.activeByDefault
      if (!isActive) continue

      if (!matchesFeatCondition(toggle.effects.condition, weapon, options)) continue

      result.attackModifier += toggle.effects.attackModifier || 0
      result.damageModifier += toggle.effects.damageModifier || 0
      if (toggle.effects.damageDiceExtra) {
        result.damageDiceExtra = result.damageDiceExtra
          ? `${result.damageDiceExtra}+${toggle.effects.damageDiceExtra}`
          : toggle.effects.damageDiceExtra
      }
    }
  }

  return result
}

// ============================================================================
// CALCULATEUR DE BONUS DE TOUCHE
// ============================================================================

export function calculateAttackBonus(
  character: Character,
  weapon: ItemV2 | null,
  options: {
    isRanged?: boolean
    isSpell?: boolean
    isFinesse?: boolean
    abilityOverride?: keyof AbilityScores
    activeEffects?: string[]
  } = {}
): AttackBreakdown {
  const breakdown: AttackBreakdown = {
    baseAbility: {
      ability: 'str',
      modifier: 0,
      label: 'Force'
    },
    proficiency: {
      has: false,
      bonus: 0,
      label: 'Non maîtrisé'
    },
    magicBonus: {
      total: 0,
      items: []
    },
    featBonus: {
      total: 0,
      feats: []
    },
    conditional: {
      advantage: [],
      disadvantage: []
    }
  }
  
  // 1. DÉTERMINER LA CARACTÉRISTIQUE DE BASE
  let ability: keyof AbilityScores = 'str'
  
  if (options.isSpell) {
    // Sorts: utilisent la caractéristique d'incantation de la classe
    ability = character.class?.spellcasting?.ability || 'cha'
    breakdown.baseAbility.label = ability.toUpperCase()
  } else if (weapon) {
    if (options.isRanged || weapon.weaponProperties?.includes('thrown')) {
      // Armes à distance ou de jet: DEX
      ability = 'dex'
      breakdown.baseAbility.label = 'Dextérité'
    } else if (options.isFinesse || weapon.weaponProperties?.includes('finesse')) {
      // Armes fines: max(STR, DEX)
      const strMod = Math.floor((character.abilityScores.str - 10) / 2)
      const dexMod = Math.floor((character.abilityScores.dex - 10) / 2)
      ability = strMod >= dexMod ? 'str' : 'dex'
      breakdown.baseAbility.label = strMod >= dexMod ? 'Force (Finesse)' : 'Dextérité (Finesse)'
    }
    // Sinon reste STR par défaut
  }
  
  breakdown.baseAbility.ability = ability
  breakdown.baseAbility.modifier = Math.floor((character.abilityScores[ability] - 10) / 2)
  
  // 2. BONUS DE MAÎTRISE
  const isProficient = checkProficiency(character, weapon, options)
  if (isProficient) {
    breakdown.proficiency.has = true
    breakdown.proficiency.bonus = getProficiencyBonus(character.level)
    breakdown.proficiency.label = `Maîtrise (+${breakdown.proficiency.bonus})`
  }
  
  // 3. BONUS MAGIQUES DES OBJETS
  if (weapon) {
    // Bonus direct de l'arme (+1, +2, +3)
    const weaponBonus = extractMagicBonus(weapon)
    if (weaponBonus > 0) {
      breakdown.magicBonus.total += weaponBonus
      breakdown.magicBonus.items.push({
        name: weapon.name,
        bonus: weaponBonus
      })
    }
    
    // Autres bonus d'équipement (anneaux, etc.)
    const equipmentBonuses = getEquipmentBonuses(character, 'attack')
    breakdown.magicBonus.total += equipmentBonuses.total
    breakdown.magicBonus.items.push(...equipmentBonuses.sources)
  }
  
  // 4. BONUS DES DONS
  const featBonuses = getFeatBonuses(character, { 
    isRanged: options.isRanged,
    isSpell: options.isSpell 
  })
  breakdown.featBonus.total += featBonuses.total
  breakdown.featBonus.feats.push(...featBonuses.sources)
  
  // 5. CONDITIONS
  const activeEffects = options.activeEffects || []
  const classId = normalizeClassId(character.class?.id)

  // Rage du Barbare : avantage aux jets d'attaque CàC avec Force
  if (classId === 'barbarian' && activeEffects.includes('rage')) {
    const isMelee = !options.isRanged && !options.isSpell
    let ability: keyof AbilityScores = 'str'
    if (weapon && (options.isRanged || weapon.weaponProperties?.includes('thrown'))) {
      ability = 'dex'
    } else if (weapon?.weaponProperties?.includes('finesse')) {
      const strMod = Math.floor((character.abilityScores.str - 10) / 2)
      const dexMod = Math.floor((character.abilityScores.dex - 10) / 2)
      ability = strMod >= dexMod ? 'str' : 'dex'
    }
    if (isMelee && ability === 'str') {
      breakdown.conditional.advantage.push('Rage (avantage FOR)')
    }
  }

  // Attaque téméraire : avantage à tous les jets d'attaque CàC ce tour
  if (classId === 'barbarian' && activeEffects.includes('reckless-attack')) {
    const isMelee = !options.isRanged && !options.isSpell
    if (isMelee) {
      breakdown.conditional.advantage.push('Attaque téméraire')
    }
  }

  // STYLES DE COMBAT
  const fightingStyles = getCharacterFightingStyles(character)

  // Archerie : +2 aux jets d'attaque avec les armes à distance
  if (fightingStyles.includes('archery') && options.isRanged) {
    breakdown.featBonus.total += 2
    breakdown.featBonus.feats.push({ name: 'Archerie', bonus: 2 })
  }

  // TOGGLES DE DONS (GWM, Sharpshooter, etc.)
  const featToggleEffects = getActiveFeatToggleEffects(character, weapon, {
    isRanged: options.isRanged,
    isSpell: options.isSpell,
  })
  if (featToggleEffects.attackModifier !== 0) {
    breakdown.featBonus.total += featToggleEffects.attackModifier
    breakdown.featBonus.feats.push({
      name: featToggleEffects.attackModifier > 0 ? 'Don (bonus attaque)' : 'Don (malus attaque)',
      bonus: featToggleEffects.attackModifier
    })
  }

  return breakdown
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

function checkProficiency(
  character: Character,
  weapon: ItemV2 | null,
  options: { isSpell?: boolean }
): boolean {
  if (options.isSpell) {
    return !!character.class?.spellcasting
  }
  
  if (!weapon) return false
  
  const weaponProf = character.class?.weaponProficiencies || []
  
  const isSimple = weapon.type === 'weapon' && (
    !weapon.weaponProperties?.includes('heavy') &&
    !weapon.weaponProperties?.includes('two-handed')
  )
  
  if (weaponProf.includes('simple') && isSimple) return true
  if (weaponProf.includes('martial')) return true
  
  for (const prof of weaponProf) {
    if (prof === 'simple' || prof === 'martial') continue
    if (weapon.name.toLowerCase().includes(prof.toLowerCase())) return true
    if (weapon.id.toLowerCase().includes(prof.toLowerCase())) return true
  }
  
  return isSimple
}

export function extractMagicBonus(item: ItemV2): number {
  const nameMatch = item.name.match(/\+([123])$/)
  if (nameMatch) {
    return parseInt(nameMatch[1], 10)
  }
  
  if (item.rarity && item.rarity !== 'common') {
    const rarityBonus: Record<string, number> = {
      'uncommon': 1,
      'rare': 2,
      'very-rare': 3,
      'legendary': 3,
    }
    if (item.damage && rarityBonus[item.rarity]) {
      return rarityBonus[item.rarity]
    }
  }
  
  return 0
}

function getEquipmentBonuses(
  character: Character,
  type: 'attack' | 'damage' | 'ac' | 'save'
): { total: number; sources: Array<{ name: string; bonus: number }> } {
  const result = { total: 0, sources: [] as Array<{ name: string; bonus: number }> }
  
  if (!character.equipment) return result
  
  for (const item of character.equipment) {
    const equipped = item.equipped !== false
    const attuned = !item.attunement || item.attuned
    if (!equipped || !attuned) continue
    
    if (type === 'attack' || type === 'damage') {
      const attackBonus = item.attackBonus || 0
      const damageBonus = item.damageBonus || 0
      if (type === 'attack' && attackBonus > 0) {
        result.total += attackBonus
        result.sources.push({ name: item.name, bonus: attackBonus })
      }
      if (type === 'damage' && damageBonus > 0) {
        result.total += damageBonus
        result.sources.push({ name: item.name, bonus: damageBonus })
      }
    }
    
    if (type === 'ac') {
      const acBonus = item.acBonus || 0
      if (acBonus > 0) {
        result.total += acBonus
        result.sources.push({ name: item.name, bonus: acBonus })
      }
    }
    
    if (type === 'save') {
      const saveBonus = item.saveBonus || 0
      if (saveBonus > 0) {
        result.total += saveBonus
        result.sources.push({ name: item.name, bonus: saveBonus })
      }
    }
  }
  
  return result
}

function getFeatBonuses(
  character: Character,
  options: { isRanged?: boolean; isSpell?: boolean }
): { total: number; sources: Array<{ name: string; bonus: number }> } {
  const result = { total: 0, sources: [] as Array<{ name: string; bonus: number }> }
  
  if (options.isRanged && hasFightingStyle(character, 'archery')) {
    result.total += 2
    result.sources.push({ name: 'Style de combat (Archerie)', bonus: 2 })
  }
  
  if (hasFightingStyle(character, 'dueling') && !options.isRanged) {
    result.total += 2
    result.sources.push({ name: 'Style de combat (Duel)', bonus: 2 })
  }
  
  if (options.isRanged && hasFeat(character, 'sharpshooter')) {
    result.sources.push({ name: 'Tireur d\'élite', bonus: 0 })
  }
  
  return result
}

export function getCharacterFightingStyles(character: Character): string[] {
  const styles: string[] = []

  // Depuis les options de classe (wizard/level-up)
  const classOptions = character.classOptions || {}
  if (classOptions.fightingStyle) {
    styles.push(classOptions.fightingStyle.toLowerCase())
  }
  if (classOptions.secondFightingStyle) {
    styles.push(classOptions.secondFightingStyle.toLowerCase())
  }

  // Depuis les dons (Fighting Initiate, etc.)
  const featFightingStyle = character.feats?.find(f => {
    const feat = getFeatById(f)
    return feat?.name?.toLowerCase().includes('style') || feat?.description?.toLowerCase().includes('style de combat')
  })
  if (featFightingStyle) {
    // Le don Fighting Initiate stocke le style dans les options du don
    // (difficile à récupérer sans structure de données, on skip pour l'instant)
  }

  return styles
}

function hasFightingStyle(character: Character, style: string): boolean {
  const styles = getCharacterFightingStyles(character)
  return styles.some(s => s.toLowerCase().includes(style.toLowerCase()))
}

function hasFeat(character: Character, featId: string): boolean {
  return (character.feats || []).includes(featId)
}

// ============================================================================
// UTILITAIRES D'AFFICHAGE
// ============================================================================

export function formatAttackBonus(bonus: number): string {
  return bonus >= 0 ? `+${bonus}` : `${bonus}`
}
