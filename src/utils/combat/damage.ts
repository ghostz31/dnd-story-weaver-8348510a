import type { Character, AbilityScores } from '../../types/character'
import type { ItemV2 } from '../../types/aurora-v2'
import { normalizeClassId, getBarbarianRageDamageBonus, getRogueSneakAttackDice, getClericDivineStrikeDice, hasDivineStrike, getBarbarianBrutalCriticalDice } from '../feature-helpers'
import { extractMagicBonus, getActiveFeatToggleEffects, getCharacterFightingStyles } from './attack-bonus'

// ============================================================================
// TYPES DE RÉSOLUTION
// ============================================================================

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
      const hasShield = character.equipment?.some(i => i.equipped && i.type === 'armor' && i.armorCategory === 'shield')
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
// UTILITAIRES D'AFFICHAGE
// ============================================================================

export function formatDamage(dice: string, average: number): string {
  return `${dice} (${Math.floor(average)} avg)`
}
