/**
 * Combat Engine - Calculateur de bonus de touche et d'actions
 * 
 * Algorithme complet prenant en compte toutes les variables:
 * - Stats (STR/DEX/CHA/etc.)
 * - Proficiency Bonus (niveau)
 * - Équipement (armes, armures magiques)
 * - Dons (Archery, etc.)
 * - Conditions (Avantage/Désavantage)
 */

import type { Character, AbilityScores } from '../types/character'
import type { ItemV2 } from '../types/aurora-v2'
import type { InventoryItem } from '../types/inventory'
import type { AttackCondition } from './feat-effects'
import { getProficiencyBonus } from './rules-engine'
import { getClassActions } from '../data/classFeatures'
import { getFeatById } from '../data/feats'
import { getMaxUses, getBarbarianRageDamageBonus, getRogueSneakAttackDice, getMonkMartialArtsDie, normalizeClassId, getBarbarianFastMovement, getBarbarianBrutalCriticalDice, getClericDivineStrikeDice, hasDivineStrike } from '../utils/feature-helpers'

// ============================================================================
// TYPES DE RÉSOLUTION
// ============================================================================

export interface ResolvedAction {
  // Identité
  id: string
  name: string
  nameEn: string
  
  // Source
  source: {
    type: 'item' | 'feature' | 'spell' | 'race' | 'feat' | 'class'
    id: string
    name: string
  }
  
  // Économie d'action
  actionType: 'action' | 'bonus' | 'reaction' | 'free' | 'limited'
  
  // Calculs de combat
  attack?: {
    bonus: number              // Bonus total de touche
    breakdown: AttackBreakdown  // Détail des sources
    advantage: boolean        // Avantage accordé
    disadvantage: boolean     // Désavantage subi
  }
  
  damage?: {
    dice: string               // Expression des dés (ex: "2d6+4")
    average: number          // Dégâts moyens
    type: string              // Type de dégâts (slashing, fire, etc.)
    versatile?: string         // Dégâts en deux mains
    breakdown: DamageBreakdown
  }
  
  // Propriétés
  range?: {
    normal: number
    long?: number
  }
  
  // Ressources
  resource?: {
    type: 'slot' | 'charge' | 'consumable' | 'feature'
    level?: number           // Niveau du sort
    current: number
    max: number
    resetOn: 'short' | 'long' | 'dawn' | 'never'
  }
  
  // Tags visuels
  tags: ActionTag[]
  
  // Description
  description: string
  shortDescription: string
}

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

export interface DamageBreakdown {
  ability: {
    modifier: number
    added: boolean
    label: string
  }
  weapon: {
    dice: string
    versatile?: string
  }
  magic: {
    bonus: number
    extraDice?: string
  }
  critical: {
    dice: string    // Dés supplémentaires en critique
  }
  conditional: {
    bonus: number
    sources: Array<{ name: string; bonus: number }>
  }
}

export type ActionTag = 
  | 'finesse' | 'heavy' | 'light' | 'two-handed' | 'versatile'
  | 'ammunition' | 'loading' | 'reach' | 'thrown'
  | 'concentration' | 'ritual' | 'spell'
  | 'melee' | 'ranged'
  | 'magic' | 'silvered'
  | 'heavy-armor' | 'medium-armor' | 'light-armor'

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

function getActiveFeatToggleEffects(
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
// CALCULATEUR DE DÉGÂTS
// ============================================================================

export function calculateDamage(
  character: Character,
  weapon: ItemV2 | null,
  options: {
    isRanged?: boolean
    isSpell?: boolean
    spellLevel?: number
    isCritical?: boolean
    isTwoHanded?: boolean
    activeEffects?: string[]
  } = {}
): DamageBreakdown {
  const breakdown: DamageBreakdown = {
    ability: {
      modifier: 0,
      added: false,
      label: ''
    },
    weapon: {
      dice: '1'
    },
    magic: {
      bonus: 0
    },
    critical: {
      dice: ''
    },
    conditional: {
      bonus: 0,
      sources: []
    }
  }
  
  // 1. DÉGÂTS DE BASE
  if (weapon?.damage) {
    breakdown.weapon.dice = weapon.damage.dice
    breakdown.weapon.versatile = weapon.versatile?.dice
    
    // 2. BONUS DE CARACTÉRISTIQUE (aux dégâts)
    // Armes à deux mains lourdes n'ajoutent pas le mod de FOR aux dégâts
    const isHeavy = weapon.weaponProperties?.includes('heavy')
    const isTwoHanded = options.isTwoHanded || weapon.weaponProperties?.includes('two-handed')
    
    if (!(isHeavy && isTwoHanded)) {
      // Même logique que pour le bonus de touche
      let ability: keyof AbilityScores = 'str'
      
      if (options.isRanged || weapon.weaponProperties?.includes('thrown')) {
        ability = 'dex'
      } else if (weapon.weaponProperties?.includes('finesse')) {
        const strMod = Math.floor((character.abilityScores.str - 10) / 2)
        const dexMod = Math.floor((character.abilityScores.dex - 10) / 2)
        ability = strMod >= dexMod ? 'str' : 'dex'
      }
      
      const mod = Math.floor((character.abilityScores[ability] - 10) / 2)
      if (mod > 0) {
        breakdown.ability.modifier = mod
        breakdown.ability.added = true
        breakdown.ability.label = ability.toUpperCase()
      }
    }
    
    // 3. BONUS MAGIQUES
    const weaponBonus = extractMagicBonus(weapon)
    const explicitBonus = weapon.damage?.bonus || 0
    breakdown.magic.bonus = weaponBonus + explicitBonus

    // 4. BONUS CONDITIONNELS
    const activeEffects = options.activeEffects || []
    const classId = normalizeClassId(character.class?.id)

    // Bonus de rage du Barbare
    if (classId === 'barbarian' && activeEffects.includes('rage')) {
      // Déterminer la caractéristique utilisée (même logique qu'au-dessus)
      let ability: keyof AbilityScores = 'str'
      if (options.isRanged || weapon.weaponProperties?.includes('thrown')) {
        ability = 'dex'
      } else if (weapon.weaponProperties?.includes('finesse')) {
        const strMod = Math.floor((character.abilityScores.str - 10) / 2)
        const dexMod = Math.floor((character.abilityScores.dex - 10) / 2)
        ability = strMod >= dexMod ? 'str' : 'dex'
      }

      if (ability === 'str' && !options.isRanged) {
        const rageDmg = getBarbarianRageDamageBonus(character.level)
        if (rageDmg > 0) {
          breakdown.conditional.bonus += rageDmg
          breakdown.conditional.sources.push({ name: 'Rage', bonus: rageDmg })
        }
      }
    }

    // STYLES DE COMBAT (dégâts)
    const fightingStyles = getCharacterFightingStyles(character)

    // Duel : +2 dégâts avec une arme à une main (pas deux mains)
    if (fightingStyles.includes('dueling')) {
      const isTwoHanded = options.isTwoHanded || weapon.weaponProperties?.includes('two-handed')
      const hasShield = character.equipment?.some(i => i.equipped && i.type === 'armor' && (i as any).armorCategory === 'shield')
      if (!isTwoHanded && hasShield) {
        breakdown.conditional.bonus += 2
        breakdown.conditional.sources.push({ name: 'Duel', bonus: 2 })
      }
    }

    // Combat aux armes de jet : +2 dégâts avec les armes de jet
    if (fightingStyles.includes('thrown-weapon-fighting') && weapon.weaponProperties?.includes('thrown')) {
      breakdown.conditional.bonus += 2
      breakdown.conditional.sources.push({ name: 'Combat aux armes de jet', bonus: 2 })
    }

    // Attaque sournoise du Roublard
    if (classId === 'rogue' && activeEffects.includes('sneak-attack')) {
      const isFinesse = weapon.weaponProperties?.includes('finesse')
      const isRanged = options.isRanged || weapon.weaponProperties?.includes('thrown') || weapon.weaponProperties?.includes('ammunition')
      if (isFinesse || isRanged) {
        const sneakDice = getRogueSneakAttackDice(character.level)
        if (sneakDice > 0) {
          breakdown.conditional.bonus += 0  // Les dés sont ajoutés séparément dans l'expression
          breakdown.conditional.sources.push({ name: 'Attaque sournoise', bonus: sneakDice })
        }
      }
    }

    // Frappe divine du Clerc (niveau 8+, 1/tour)
    if (classId === 'cleric') {
      const divineDice = getClericDivineStrikeDice(character.level)
      if (divineDice && hasDivineStrike(character.subclass)) {
        const isMelee = !options.isRanged && !options.isSpell
        if (isMelee) {
          breakdown.conditional.bonus += 0
          breakdown.conditional.sources.push({ name: 'Frappe divine (1/tour)', bonus: 1 })
          breakdown.magic.extraDice = divineDice
        }
      }
    }

    // Châtiment divin amélioré du Paladin (niveau 11+)
    if (classId === 'paladin' && character.level >= 11) {
      const isMelee = !options.isRanged && !options.isSpell
      if (isMelee) {
        breakdown.conditional.bonus += 0  // 1d8 dés ajoutés séparément
        breakdown.conditional.sources.push({ name: 'Châtiment divin amélioré', bonus: 1 })
        breakdown.magic.extraDice = breakdown.magic.extraDice
          ? `${breakdown.magic.extraDice}+1d8`
          : '1d8'
      }
    }

    // RÔDEUR — Sous-classes avec bonus de dégâts conditionnels
    if (classId === 'ranger') {
      // Traqueur des Ombres : Embuscade redoutable (+1d8 au 1er tour)
      if (activeEffects.includes('dread-ambusher') && character.subclass === 'gloom_stalker') {
        breakdown.conditional.bonus += 0
        breakdown.conditional.sources.push({ name: 'Embuscade redoutable', bonus: 1 })
        breakdown.magic.extraDice = breakdown.magic.extraDice
          ? `${breakdown.magic.extraDice}+1d8`
          : '1d8'
      }

      // Marcheur de l'Horizon : Guerrier planaire (+1d8/+2d8 force)
      if (activeEffects.includes('planar-warrior') && character.subclass === 'horizon_walker') {
        const planarDice = character.level >= 11 ? '2d8' : '1d8'
        breakdown.conditional.bonus += 0
        breakdown.conditional.sources.push({ name: 'Guerrier planaire', bonus: 1 })
        breakdown.magic.extraDice = breakdown.magic.extraDice
          ? `${breakdown.magic.extraDice}+${planarDice}`
          : planarDice
      }

      // Pourfendeur : Proie du pourfendeur (+1d6)
      if (activeEffects.includes('slayers-prey') && character.subclass === 'monster_slayer') {
        breakdown.conditional.bonus += 0
        breakdown.conditional.sources.push({ name: 'Proie du pourfendeur', bonus: 1 })
        breakdown.magic.extraDice = breakdown.magic.extraDice
          ? `${breakdown.magic.extraDice}+1d6`
          : '1d6'
      }

      // Vagabond Féerique : Frappes redoutables (+1d4/+1d6 psychiques)
      if (activeEffects.includes('dreadful-strikes') && character.subclass === 'fey_wanderer') {
        const dreadfulDice = character.level >= 11 ? '1d6' : '1d4'
        breakdown.conditional.bonus += 0
        breakdown.conditional.sources.push({ name: 'Frappes redoutables', bonus: 1 })
        breakdown.magic.extraDice = breakdown.magic.extraDice
          ? `${breakdown.magic.extraDice}+${dreadfulDice}`
          : dreadfulDice
      }

      // Gardien des Essaims : Essaim rassemblé (+1d6/+1d8 perforants)
      if (activeEffects.includes('gathered-swarm') && character.subclass === 'swarmkeeper') {
        const swarmDice = character.level >= 11 ? '1d8' : '1d6'
        breakdown.conditional.bonus += 0
        breakdown.conditional.sources.push({ name: 'Essaim rassemblé', bonus: 1 })
        breakdown.magic.extraDice = breakdown.magic.extraDice
          ? `${breakdown.magic.extraDice}+${swarmDice}`
          : swarmDice
      }

      // Tueur d'ennemis (niv 20) : +mod SAG aux dégâts contre ennemis jurés
      if (activeEffects.includes('foe-slayer') && character.level >= 20) {
        const wisMod = Math.floor((character.abilityScores.wis - 10) / 2)
        if (wisMod > 0) {
          breakdown.conditional.bonus += wisMod
          breakdown.conditional.sources.push({ name: 'Tueur d\'ennemis', bonus: wisMod })
        }
      }
    }

    // 5. DÉGÂTS CRITIQUES
    if (options.isCritical) {
      // En critique, on relance les dés de l'arme une fois de plus
      let critDice = weapon.damage.dice
      
      // Critique brutal du Barbare (niveau 9+)
      const classId = normalizeClassId(character.class?.id)
      if (classId === 'barbarian' && character.level >= 9) {
        const brutalDice = getBarbarianBrutalCriticalDice(character.level)
        if (brutalDice > 0) {
          const facesMatch = weapon.damage.dice.match(/d(\d+)/)
          if (facesMatch) {
            critDice += `+${brutalDice}d${facesMatch[1]}`
          }
        }
      }
      
      breakdown.critical.dice = critDice
    }
  } else if (options.isSpell) {
    // Sorts de dégâts - calcul basé sur le sort
    breakdown.weapon.dice = '0'  // Sera rempli par le sort spécifique
  }

  // TOGGLES DE DONS — DÉGÂTS (GWM, Sharpshooter, etc.)
  const featToggleEffects = getActiveFeatToggleEffects(character, weapon, {
    isRanged: options.isRanged,
    isSpell: options.isSpell,
    isTwoHanded: options.isTwoHanded,
  })
  if (featToggleEffects.damageModifier !== 0) {
    breakdown.conditional.bonus += featToggleEffects.damageModifier
    breakdown.conditional.sources.push({
      name: featToggleEffects.damageModifier > 0 ? 'Don (bonus dégâts)' : 'Don (malus dégâts)',
      bonus: featToggleEffects.damageModifier
    })
  }
  if (featToggleEffects.damageDiceExtra) {
    breakdown.magic.extraDice = breakdown.magic.extraDice
      ? `${breakdown.magic.extraDice}+${featToggleEffects.damageDiceExtra}`
      : featToggleEffects.damageDiceExtra
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

function extractMagicBonus(item: ItemV2): number {
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
    const equipped = (item as any).equipped !== false
    const attuned = !(item as any).attunement || (item as any).attuned
    if (!equipped || !attuned) continue
    
    if (type === 'attack' || type === 'damage') {
      const attackBonus = (item as any).attackBonus || 0
      const damageBonus = (item as any).damageBonus || 0
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
      const acBonus = (item as any).acBonus || 0
      if (acBonus > 0) {
        result.total += acBonus
        result.sources.push({ name: item.name, bonus: acBonus })
      }
    }
    
    if (type === 'save') {
      const saveBonus = (item as any).saveBonus || 0
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

function getCharacterFightingStyles(character: Character): string[] {
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
// GÉNÉRATEUR D'ACTIONS RÉSOLUES
// ============================================================================

export async function generateResolvedActions(
  character: Character,
  equippedItems: ItemV2[],
  activeEffects: string[] = [],
  wildShapeBeast?: import('../types/wild-shape').WildShapeBeast | null
): Promise<ResolvedAction[]> {
  const actions: ResolvedAction[] = []
  
  console.log('[CombatEngine] generateResolvedActions called')
  console.log('[CombatEngine] Character class:', character.class?.id, 'level:', character.level)
  console.log('[CombatEngine] Equipped items count:', equippedItems.length)
  console.log('[CombatEngine] Equipped items:', equippedItems.map(i => ({ id: i.id, name: i.name, type: i.type, damage: i.damage })))
  
  // 1. ACTIONS D'ÉQUIPEMENT (armes) — ignorées en forme sauvage
  if (!wildShapeBeast) {
  for (const item of equippedItems) {
    console.log('[CombatEngine] Processing item:', item.name, 'type:', item.type)
    if (item.type === 'weapon') {
      const attackBreakdown = calculateAttackBonus(character, item, { activeEffects })
      const damageBreakdown = calculateDamage(character, item, { activeEffects })
      
      const totalAttackBonus = 
        attackBreakdown.baseAbility.modifier +
        attackBreakdown.proficiency.bonus +
        attackBreakdown.magicBonus.total +
        attackBreakdown.featBonus.total
      
      // Construire l'expression de dégâts
      let damageExpr = damageBreakdown.weapon.dice
      if (damageBreakdown.ability.added) {
        damageExpr += `+${damageBreakdown.ability.modifier}`
      }
      if (damageBreakdown.magic.bonus > 0) {
        damageExpr += `+${damageBreakdown.magic.bonus}`
      }
      if (damageBreakdown.conditional.bonus > 0) {
        damageExpr += `+${damageBreakdown.conditional.bonus}`
      }

      // Attaque sournoise : ajouter les dés
      const sneakSource = damageBreakdown.conditional.sources.find(s => s.name === 'Attaque sournoise')
      if (sneakSource) {
        damageExpr += `+${sneakSource.bonus}d6`
      }

      // Dés supplémentaires (Frappe divine, Châtiment divin amélioré)
      if (damageBreakdown.magic.extraDice) {
        damageExpr += `+${damageBreakdown.magic.extraDice}`
      }

      // Calculer la moyenne
      const avgDamage = calculateAverageDamage(damageExpr)

      const action: ResolvedAction = {
        id: `weapon_${item.id}`,
        name: item.name,
        nameEn: item.nameEn || item.name,
        source: {
          type: 'item',
          id: item.id,
          name: item.name
        },
        actionType: 'action',
        attack: {
          bonus: totalAttackBonus,
          breakdown: attackBreakdown,
          advantage: attackBreakdown.conditional.advantage.length > 0,
          disadvantage: attackBreakdown.conditional.disadvantage.length > 0
        },
        damage: {
          dice: damageExpr,
          average: avgDamage,
          type: item.damage?.type || 'slashing',
          versatile: damageBreakdown.weapon.versatile,
          breakdown: damageBreakdown
        },
        range: item.range,
        tags: buildTags(item),
        description: (item.description as string) || '',
        shortDescription: `Attaque avec ${item.name}`
      }
      
      actions.push(action)
    }
  }
  }

  // 1b. ATTAQUES NATURELLES EN FORME SAUVAGE
  if (wildShapeBeast) {
    const profBonus = getProficiencyBonus(character.level)
    for (const attack of wildShapeBeast.attacks) {
      const totalBonus = attack.bonus + profBonus
      const avgDmg = calculateAverageDamage(attack.damage)

      actions.push({
        id: `beast_${wildShapeBeast.id}_${attack.nameEn.toLowerCase().replace(/\s+/g, '_')}`,
        name: attack.name,
        nameEn: attack.nameEn,
        source: {
          type: 'feature',
          id: wildShapeBeast.id,
          name: wildShapeBeast.name
        },
        actionType: 'action',
        attack: {
          bonus: totalBonus,
          breakdown: {
            baseAbility: { ability: 'str', modifier: Math.floor((wildShapeBeast.abilityScores.str - 10) / 2), label: 'Force' },
            proficiency: { has: true, bonus: profBonus, label: `Maîtrise (+${profBonus})` },
            magicBonus: { total: 0, items: [] },
            featBonus: { total: 0, feats: [] },
            conditional: { advantage: [], disadvantage: [] }
          },
          advantage: false,
          disadvantage: false
        },
        damage: {
          dice: attack.damage,
          average: avgDmg,
          type: attack.damageType,
          breakdown: {
            ability: { modifier: 0, added: false, label: '' },
            weapon: { dice: attack.damage },
            magic: { bonus: 0 },
            critical: { dice: attack.damage },
            conditional: { bonus: 0, sources: [] }
          }
        },
        range: attack.range,
        tags: ['melee'],
        description: `Attaque naturelle de ${wildShapeBeast.name}`,
        shortDescription: `Attaque naturelle: ${attack.damage} ${attack.damageType}`
      })
    }
  }

  // 2. ACTIONS DE CLASSE (capacités avec utilisation)
  const classId = character.class?.id || ''
  const normalizedClassId = classId.startsWith('ID_') 
    ? classId.toLowerCase().replace(/id_phb_class_/g, '') 
    : classId
  const classActions = getClassActions(normalizedClassId, character.level)
  
  for (const action of classActions) {
    const maxUses = getMaxUses(action.key, character.level)
    const used = character.classResourcesUsed?.[action.key] || 0
    const current = Math.max(0, maxUses - used)
    
    if (maxUses > 0) {
      const resourceAction: ResolvedAction = {
        id: `class_${action.key}`,
        name: action.name,
        nameEn: action.name,
        source: {
          type: 'class',
          id: action.key,
          name: character.class?.name || ''
        },
        actionType: action.key === 'secondWind' ? 'bonus' : action.key === 'divineSmite' ? 'action' : 'limited',
        resource: {
          type: 'charge',
          current,
          max: maxUses,
          resetOn: action.restoreOn === 'short' ? 'short' : 'long'
        },
        tags: [],
        description: action.description,
        shortDescription: action.description.substring(0, 80)
      }
      
      if (action.key === 'rages') {
        const rageDmg = getBarbarianRageDamageBonus(character.level)
        resourceAction.tags = ['melee']
        resourceAction.shortDescription = `Rage: +${rageDmg} dégâts, résistance B/P/S`
      }
      
      if (action.key === 'divineSmite') {
        resourceAction.tags = ['melee']
        resourceAction.shortDescription = 'Châtiment: +2d8 radiants (coûte 1 emplacement)'
        resourceAction.resource = {
          type: 'slot',
          current,
          max: maxUses,
          resetOn: 'long'
        }
      }
      
      actions.push(resourceAction)
    }
  }
  
  // Sneak Attack for Rogue (passive damage bonus, tracked)
  if (normalizedClassId === 'rogue') {
    const sneakDice = getRogueSneakAttackDice(character.level)
    actions.push({
      id: 'class_sneakAttack',
      name: 'Attaque sournoise',
      nameEn: 'Sneak Attack',
      source: { type: 'class', id: 'sneakAttack', name: 'Roublard' },
      actionType: 'action',
      damage: {
        dice: `${sneakDice}d6`,
        average: sneakDice * 3.5,
        type: 'piercing',
        breakdown: {
          ability: { modifier: 0, added: false, label: '' },
          weapon: { dice: `${sneakDice}d6` },
          magic: { bonus: 0 },
          critical: { dice: `${sneakDice}d6` },
          conditional: { bonus: 0, sources: [] }
        }
      },
      tags: ['melee', 'ranged'],
      description: `Inflige ${sneakDice}d6 dégâts supplémentaires avec avantage ou si un allié est adjacent.`,
      shortDescription: `+${sneakDice}d6 dégâts (1/tour)`
    })
  }
  
  // Martial Arts for Monk
  if (normalizedClassId === 'monk') {
    const martialDie = getMonkMartialArtsDie(character.level)
    const dexMod = Math.floor((character.abilityScores.dex - 10) / 2)
    actions.push({
      id: 'class_martialArts',
      name: 'Arts martiaux',
      nameEn: 'Martial Arts',
      source: { type: 'class', id: 'martialArts', name: 'Moine' },
      actionType: 'action',
      attack: {
        bonus: dexMod + getProficiencyBonus(character.level),
        breakdown: {
          baseAbility: { ability: 'dex', modifier: dexMod, label: 'Dextérité' },
          proficiency: { has: true, bonus: getProficiencyBonus(character.level), label: 'Maîtrise' },
          magicBonus: { total: 0, items: [] },
          featBonus: { total: 0, feats: [] },
          conditional: { advantage: [], disadvantage: [] }
        },
        advantage: false,
        disadvantage: false
      },
      damage: {
        dice: `${martialDie}+${dexMod}`,
        average: parseInt(martialDie.replace('d', '')) / 2 + 0.5 + dexMod,
        type: 'bludgeoning',
        breakdown: {
          ability: { modifier: dexMod, added: true, label: 'DEX' },
          weapon: { dice: martialDie },
          magic: { bonus: 0 },
          critical: { dice: martialDie },
          conditional: { bonus: 0, sources: [] }
        }
      },
      tags: ['melee', 'finesse'],
      description: `Attaque à mains nues avec dé ${martialDie} + DEX. Peut utiliser DEX au lieu de FOR.`,
      shortDescription: `Mains nues: ${martialDie}+${dexMod}`
    })
  }
  
  // 3. ACTIONS DE RACE (Breath Weapon pour Dragonborn)
  if (character.race?.id === 'dragonborn' || character.race?.id?.toLowerCase().includes('dragonborn')) {
    const conMod = Math.floor((character.abilityScores.con - 10) / 2)
    const breathLevel = Math.min(character.level, 20)
    const breathDice = breathLevel >= 16 ? 5 : breathLevel >= 11 ? 4 : breathLevel >= 6 ? 3 : 2
    const dc = 8 + conMod + getProficiencyBonus(character.level)
    
    actions.push({
      id: 'race_breathWeapon',
      name: 'Souffle draconique',
      nameEn: 'Breath Weapon',
      source: { type: 'race', id: 'breathWeapon', name: character.race.name },
      actionType: 'action',
      damage: {
        dice: `${breathDice}d6`,
        average: breathDice * 3.5,
        type: 'fire',
        breakdown: {
          ability: { modifier: 0, added: false, label: '' },
          weapon: { dice: `${breathDice}d6` },
          magic: { bonus: 0 },
          critical: { dice: '' },
          conditional: { bonus: 0, sources: [] }
        }
      },
      resource: {
        type: 'charge',
        current: 1,
        max: 1,
        resetOn: 'short'
      },
      tags: [],
      description: `Souffle en ligne ou cône. JS DEX DD ${dc} pour demi-dégâts. ${breathDice}d6 dégâts.`,
      shortDescription: `${breathDice}d6 dégâts (DD ${dc})`
    })
  }
  
  // 4. SORTS (si lanceur de sorts)
  if (character.class?.spellcasting) {
    const spellAbility = character.class.spellcasting.ability
    const spellMod = Math.floor((character.abilityScores[spellAbility] - 10) / 2)
    const spellDC = 8 + spellMod + getProficiencyBonus(character.level)
    const spellAttack = spellMod + getProficiencyBonus(character.level)
    
    const knownSpells = (character as any).knownSpells || []
    const preparedSpells = (character as any).preparedSpells || []
    const allSpells = [...new Set([...knownSpells, ...preparedSpells])]
    
    const combatSpells: Record<string, { damage?: string; type?: string; actionType: ResolvedAction['actionType']; tags: ActionTag[]; description: string; dc?: boolean; attack?: boolean }> = {
      'Fire Bolt': { damage: '1d10', type: 'fire', actionType: 'action', tags: ['ranged', 'spell'], description: 'Un trait de feu. Cible à portée.', dc: false, attack: true },
      'Rayon de feu': { damage: '1d10', type: 'fire', actionType: 'action', tags: ['ranged', 'spell'], description: 'Un trait de feu. Cible à portée.', dc: false, attack: true },
      'Sacred Flame': { damage: '1d8', type: 'radiant', actionType: 'action', tags: ['spell'], description: `Flammes sacrées. JS DEX DD ${spellDC} pour demi-dégâts.`, dc: true },
      'Flammes sacrées': { damage: '1d8', type: 'radiant', actionType: 'action', tags: ['spell'], description: `Flammes sacrées. JS DEX DD ${spellDC} pour demi-dégâts.`, dc: true },
      'Chill Touch': { damage: '1d8', type: 'necrotic', actionType: 'action', tags: ['ranged', 'spell'], description: 'Toucher spectral. Empêche la régénération.', dc: false, attack: true },
      'Toucher glacial': { damage: '1d8', type: 'necrotic', actionType: 'action', tags: ['ranged', 'spell'], description: 'Toucher spectral. Empêche la régénération.', dc: false, attack: true },
      'Eldritch Blast': { damage: '1d10', type: 'force', actionType: 'action', tags: ['ranged', 'spell'], description: 'Rayon d\'énergie. +1 rayon au niv.5, 11, 17.', dc: false, attack: true },
      'Rayon occulte': { damage: '1d10', type: 'force', actionType: 'action', tags: ['ranged', 'spell'], description: 'Rayon d\'énergie. +1 rayon au niv.5, 11, 17.', dc: false, attack: true },
      'Guiding Bolt': { damage: '4d6', type: 'radiant', actionType: 'action', tags: ['ranged', 'spell'], description: 'Éclair guidé. Avantage à la prochaine attaque contre la cible.', dc: false, attack: true },
      'Rayon guidé': { damage: '4d6', type: 'radiant', actionType: 'action', tags: ['ranged', 'spell'], description: 'Éclair guidé. Avantage à la prochaine attaque contre la cible.', dc: false, attack: true },
      'Inflict Wounds': { damage: '3d10', type: 'necrotic', actionType: 'action', tags: ['melee', 'spell'], description: 'Blessure nécrotique au contact.', dc: false, attack: true },
      'Blessure': { damage: '3d10', type: 'necrotic', actionType: 'action', tags: ['melee', 'spell'], description: 'Blessure nécrotique au contact.', dc: false, attack: true },
      'Healing Word': { actionType: 'bonus', tags: ['spell'], description: 'Soigne 1d4 + mod CHA à distance.' },
      'Mot curatif': { actionType: 'bonus', tags: ['spell'], description: 'Soigne 1d4 + mod CHA à distance.' },
      'Cure Wounds': { actionType: 'action', tags: ['spell'], description: 'Soigne 1d8 + mod au contact.' },
      'Soins': { actionType: 'action', tags: ['spell'], description: 'Soigne 1d8 + mod au contact.' },
      'Shield': { actionType: 'reaction', tags: ['spell'], description: '+5 CA jusqu\'au prochain tour. Réaction quand attaqué.' },
      'Bouclier': { actionType: 'reaction', tags: ['spell'], description: '+5 CA jusqu\'au prochain tour. Réaction quand attaqué.' },
      'Mage Hand': { actionType: 'action', tags: ['spell'], description: 'Main spectrale pour manipuler des objets.' },
      'Main de mage': { actionType: 'action', tags: ['spell'], description: 'Main spectrale pour manipuler des objets.' },
      'Minor Illusion': { actionType: 'action', tags: ['spell'], description: 'Crée un son ou une image illusoire.' },
      'Illusion mineure': { actionType: 'action', tags: ['spell'], description: 'Crée un son ou une image illusoire.' },
    }
    
    for (const spellName of allSpells) {
      const spellData = combatSpells[spellName]
      if (!spellData) continue
      
      const spellAction: ResolvedAction = {
        id: `spell_${spellName.toLowerCase().replace(/\s+/g, '_')}`,
        name: spellName,
        nameEn: spellName,
        source: {
          type: 'spell',
          id: spellName.toLowerCase().replace(/\s+/g, '_'),
          name: character.class?.name || ''
        },
        actionType: spellData.actionType,
        tags: spellData.tags,
        description: spellData.description,
        shortDescription: spellData.description.substring(0, 80)
      }
      
      if (spellData.damage && spellData.attack) {
        spellAction.attack = {
          bonus: spellAttack,
          breakdown: {
            baseAbility: { ability: spellAbility, modifier: spellMod, label: spellAbility.toUpperCase() },
            proficiency: { has: true, bonus: getProficiencyBonus(character.level), label: 'Maîtrise' },
            magicBonus: { total: 0, items: [] },
            featBonus: { total: 0, feats: [] },
            conditional: { advantage: [], disadvantage: [] }
          },
          advantage: false,
          disadvantage: false
        }
        spellAction.damage = {
          dice: spellData.damage,
          average: calculateAverageDamage(spellData.damage),
          type: spellData.type || 'force',
          breakdown: {
            ability: { modifier: 0, added: false, label: '' },
            weapon: { dice: spellData.damage },
            magic: { bonus: 0 },
            critical: { dice: spellData.damage },
            conditional: { bonus: 0, sources: [] }
          }
        }
      }

      if (spellData.damage && spellData.dc) {
        spellAction.damage = {
          dice: spellData.damage,
          average: calculateAverageDamage(spellData.damage),
          type: spellData.type || 'force',
          breakdown: {
            ability: { modifier: 0, added: false, label: '' },
            weapon: { dice: spellData.damage },
            magic: { bonus: 0 },
            critical: { dice: spellData.damage },
            conditional: { bonus: 0, sources: [] }
          }
        }
        spellAction.shortDescription = `DD ${spellDC} ${spellData.description.substring(0, 50)}`
      }
      
      actions.push(spellAction)
    }
  }
  
  return actions
}

function buildTags(item: ItemV2): ActionTag[] {
  const tags: ActionTag[] = []
  
  // Propriétés de l'arme
  if (item.weaponProperties?.includes('finesse')) tags.push('finesse')
  if (item.weaponProperties?.includes('heavy')) tags.push('heavy')
  if (item.weaponProperties?.includes('light')) tags.push('light')
  if (item.weaponProperties?.includes('two-handed')) tags.push('two-handed')
  if (item.weaponProperties?.includes('versatile')) tags.push('versatile')
  if (item.weaponProperties?.includes('reach')) tags.push('reach')
  if (item.weaponProperties?.includes('thrown')) tags.push('thrown')
  if (item.weaponProperties?.includes('ammunition')) tags.push('ammunition')
  if (item.weaponProperties?.includes('loading')) tags.push('loading')
  
  // Type
  if (item.range) {
    tags.push('ranged')
  } else {
    tags.push('melee')
  }
  
  // Magique
  if (extractMagicBonus(item) > 0) {
    tags.push('magic')
  }
  
  return tags
}

function calculateAverageDamage(diceExpr: string): number {
  // Parse une expression comme "2d6+4" ou "1d8+2+1d6"
  let total = 0
  
  // Dés
  const diceMatches = diceExpr.matchAll(/(\d+)d(\d+)/g)
  for (const match of diceMatches) {
    const count = parseInt(match[1], 10)
    const faces = parseInt(match[2], 10)
    total += count * ((faces + 1) / 2)  // Moyenne d'un dé: (faces+1)/2
  }
  
  // Modificateurs fixes
  const modMatch = diceExpr.match(/([+-]\d+)(?!d)/)
  if (modMatch) {
    total += parseInt(modMatch[1], 10)
  }
  
  return Math.floor(total)
}

// ============================================================================
// UTILITAIRES D'AFFICHAGE
// ============================================================================

export function formatAttackBonus(bonus: number): string {
  return bonus >= 0 ? `+${bonus}` : `${bonus}`
}

export function formatDamage(dice: string, average: number): string {
  return `${dice} (${Math.floor(average)} avg)`
}

export function getActionColor(actionType: ResolvedAction['actionType']): string {
  const colors: Record<ResolvedAction['actionType'], string> = {
    'action': '#ef4444',      // Rouge
    'bonus': '#f59e0b',       // Orange
    'reaction': '#3b82f6',    // Bleu
    'free': '#10b981',        // Vert
    'limited': '#8b5cf6'      // Violet
  }
  return colors[actionType]
}

export function getTagColor(tag: ActionTag): string {
  const colors: Partial<Record<ActionTag, string>> = {
    'finesse': '#ec4899',
    'heavy': '#dc2626',
    'light': '#84cc16',
    'two-handed': '#f97316',
    'versatile': '#06b6d4',
    'magic': '#a855f7',
    'concentration': '#eab308'
  }
  return colors[tag] || '#6b7280'
}

// ============================================================================
// CALCUL DE CA DEPUIS L'INVENTAIRE
// ============================================================================

export function calculateACFromInventory(
  character: Character,
  inventoryItems: InventoryItem[]
): number {
  const dexMod = Math.floor((character.abilityScores.dex - 10) / 2)
  const conMod = Math.floor((character.abilityScores.con - 10) / 2)
  const wisMod = Math.floor((character.abilityScores.wis - 10) / 2)
  const classId = character.class?.id || ''
  const normalizedClassId = classId.startsWith('ID_')
    ? classId.toLowerCase().replace(/id_phb_class_/g, '')
    : classId

  const activeItems = inventoryItems.filter(i => {
    if (!i.equipped) return false
    if (i.attunement && !i.attuned) return false
    return true
  })

  const armor = activeItems.find(i =>
    i.type === 'armor' && i.armorCategory && i.armorCategory !== 'shield' && i.armorClass
  )

  const shield = activeItems.find(i =>
    i.armorCategory === 'shield' && i.armorClass
  )

  let baseAC = 10 + dexMod

  if (!armor && (normalizedClassId === 'barbarian' || normalizedClassId === 'monk')) {
    if (normalizedClassId === 'barbarian') {
      baseAC = 10 + dexMod + conMod
    } else if (normalizedClassId === 'monk') {
      baseAC = 10 + dexMod + wisMod
    }
  } else if (armor && armor.armorClass) {
    if (armor.addDex) {
      const maxDex = armor.maxDex ?? Infinity
      baseAC = armor.armorClass + Math.min(dexMod, maxDex)
    } else {
      baseAC = armor.armorClass
    }
  }

  if (shield && shield.armorClass) {
    baseAC += shield.armorClass
  }

  const magicACBonus = activeItems.reduce((sum, i) => sum + (i.acBonus || 0), 0)
  baseAC += magicACBonus

  // Style de combat : Défense (+1 CA si armure portée)
  const fightingStyles = getCharacterFightingStyles(character)
  if (fightingStyles.includes('defense') && armor) {
    baseAC += 1
  }

  // Don : Combat à deux armes (+1 CA si une arme de mêlée dans chaque main)
  const hasDualWielder = character.feats?.includes('dual-wielder')
  if (hasDualWielder) {
    const equippedWeapons = activeItems.filter(i => i.type === 'weapon')
    const meleeWeaponsEquipped = equippedWeapons.filter(i => {
      // Gère les deux formats de propriétés (InventoryItem.properties ou ItemV2.weaponProperties)
      const props = (i as any).properties || (i as any).weaponProperties || []
      const isRanged = props.some((p: string) =>
        p === 'ranged' || p === 'ammunition'
      )
      return !isRanged
    })
    // Deux armes de mêlée équipées (pas de bouclier)
    if (meleeWeaponsEquipped.length >= 2 && !shield) {
      baseAC += 1
    }
  }

  return baseAC
}

// ============================================================================
// CALCUL DE LA VITESSE
// ============================================================================

export function calculateCharacterSpeed(
  character: Character,
  inventoryItems: InventoryItem[]
): number {
  let speed = character.speed || 30
  const classId = normalizeClassId(character.class?.id)
  const level = character.level

  // Déplacement rapide du Barbare (niveau 5+, pas d'armure lourde)
  if (classId === 'barbarian' && level >= 5) {
    const hasHeavyArmor = inventoryItems.some(i => 
      i.equipped && i.type === 'armor' && i.armorCategory === 'heavy'
    )
    if (!hasHeavyArmor) {
      speed += getBarbarianFastMovement(level)
    }
  }

  return speed
}
