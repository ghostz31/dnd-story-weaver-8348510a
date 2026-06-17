import type { Character } from '../../types/character'
import type { ItemV2 } from '../../types/aurora-v2'
import type { AttackBreakdown } from './attack-bonus'
import type { DamageBreakdown } from './damage'
import { getProficiencyBonus } from '../rules-engine'
import { getClassActions } from '../../data/classFeatures'
import { getMaxUses, getBarbarianRageDamageBonus, getRogueSneakAttackDice, getMonkMartialArtsDie } from '../feature-helpers'
import { calculateAttackBonus, extractMagicBonus } from './attack-bonus'
import { calculateDamage } from './damage'

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

export type ActionTag = 
  | 'finesse' | 'heavy' | 'light' | 'two-handed' | 'versatile'
  | 'ammunition' | 'loading' | 'reach' | 'thrown'
  | 'concentration' | 'ritual' | 'spell'
  | 'melee' | 'ranged'
  | 'magic' | 'silvered'
  | 'heavy-armor' | 'medium-armor' | 'light-armor'

// ============================================================================
// GÉNÉRATEUR D'ACTIONS RÉSOLUES
// ============================================================================

export async function generateResolvedActions(
  character: Character,
  equippedItems: ItemV2[],
  activeEffects: string[] = [],
  wildShapeBeast?: import('../../types/wild-shape').WildShapeBeast | null
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
    
    const knownSpells = (character as Character & { knownSpells?: string[]; preparedSpells?: string[] }).knownSpells || []
    const preparedSpells = (character as Character & { knownSpells?: string[]; preparedSpells?: string[] }).preparedSpells || []
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
