/**
 * Conditions Engine - Effets mécaniques des conditions D&D 5e
 * 
 * Gère l'application des effets des conditions sur:
 * - Jets d'attaque (avantage/désavantage)
 * - Jets de sauvegarde
 * - Tests de compétences
 * - Mouvement
 * - Actions
 */

import type { AbilityScores } from '../types/character'

export interface ConditionEffect {
  condition: string
  effects: ConditionEffectDetail[]
}

export interface ConditionEffectDetail {
  type: 'advantage' | 'disadvantage' | 'speed' | 'action' | 'save' | 'ability' | 'attack' | 'skill'
  target: string
  value: number | string
  description: string
}

export const CONDITION_EFFECTS: Record<string, ConditionEffect> = {
  blinded: {
    condition: 'Aveuglé',
    effects: [
      { type: 'disadvantage', target: 'attack', value: 0, description: 'Désavantage aux jets d\'attaque' },
      { type: 'advantage', target: 'attack_against', value: 0, description: 'Les attaques contre vous ont l\'avantage' },
      { type: 'disadvantage', target: 'skill:perception:sight', value: 0, description: 'Désavantage aux tests de Perception basés sur la vue' },
    ],
  },
  charmed: {
    condition: 'Charmé',
    effects: [
      { type: 'disadvantage', target: 'attack:charmer', value: 0, description: 'Ne peut pas attaquer la source du charme' },
      { type: 'ability', target: 'social:charmer', value: 0, description: 'Avantage aux tests sociaux de la source du charme' },
    ],
  },
  deafened: {
    condition: 'Assourdi',
    effects: [
      { type: 'disadvantage', target: 'skill:perception:hearing', value: 0, description: 'Désavantage aux tests de Perception basés sur l\'ouïe' },
      { type: 'ability', target: 'spell:verbal', value: 0, description: 'Ne peut pas entendre (affecte les sorts avec composantes verbales)' },
    ],
  },
  frightened: {
    condition: 'Effrayé',
    effects: [
      { type: 'disadvantage', target: 'ability', value: 0, description: 'Désavantage aux tests de caractéristiques tant que la source de la peur est en vue' },
      { type: 'disadvantage', target: 'attack', value: 0, description: 'Désavantage aux jets d\'attaque tant que la source de la peur est en vue' },
      { type: 'speed', target: 'away', value: 0, description: 'Ne peut pas se rapprocher volontairement de la source de la peur' },
    ],
  },
  grappled: {
    condition: 'Agrippé',
    effects: [
      { type: 'speed', target: 'all', value: 0, description: 'Vitesse réduite à 0' },
    ],
  },
  incapacitated: {
    condition: 'Incapacité',
    effects: [
      { type: 'action', target: 'all', value: 0, description: 'Ne peut pas effectuer d\'actions ou de réactions' },
    ],
  },
  invisible: {
    condition: 'Invisible',
    effects: [
      { type: 'advantage', target: 'attack', value: 0, description: 'Avantage aux jets d\'attaque' },
      { type: 'disadvantage', target: 'attack_against', value: 0, description: 'Les attaques contre vous ont le désavantage' },
    ],
  },
  paralyzed: {
    condition: 'Paralysé',
    effects: [
      { type: 'action', target: 'all', value: 0, description: 'Ne peut pas effectuer d\'actions ou de réactions' },
      { type: 'speed', target: 'all', value: 0, description: 'Vitesse réduite à 0' },
      { type: 'advantage', target: 'attack_against', value: 0, description: 'Les attaques contre vous ont l\'avantage' },
      { type: 'disadvantage', target: 'save:str', value: 0, description: 'Échec automatique aux JS de Force et Dextérité' },
      { type: 'disadvantage', target: 'save:dex', value: 0, description: 'Échec automatique aux JS de Force et Dextérité' },
      { type: 'ability', target: 'critical:melee', value: 0, description: 'Les attaques de mêlée qui touchent sont des coups critiques' },
    ],
  },
  petrified: {
    condition: 'Pétrifié',
    effects: [
      { type: 'action', target: 'all', value: 0, description: 'Ne peut pas effectuer d\'actions ou de réactions' },
      { type: 'speed', target: 'all', value: 0, description: 'Vitesse réduite à 0' },
      { type: 'disadvantage', target: 'attack_against', value: 0, description: 'Les attaques contre vous ont l\'avantage' },
      { type: 'disadvantage', target: 'save:str', value: 0, description: 'Échec automatique aux JS de Force et Dextérité' },
      { type: 'ability', target: 'resistance:all', value: 0, description: 'Résistance à tous les dégâts' },
      { type: 'ability', target: 'immunity:poison', value: 0, description: 'Immunité aux poisons et maladies' },
    ],
  },
  poisoned: {
    condition: 'Empoisonné',
    effects: [
      { type: 'disadvantage', target: 'attack', value: 0, description: 'Désavantage aux jets d\'attaque' },
      { type: 'disadvantage', target: 'ability', value: 0, description: 'Désavantage aux tests de caractéristiques' },
    ],
  },
  prone: {
    condition: 'À terre',
    effects: [
      { type: 'disadvantage', target: 'attack', value: 0, description: 'Désavantage aux jets d\'attaque' },
      { type: 'advantage', target: 'attack_against:melee', value: 0, description: 'Les attaques de mêlée contre vous ont l\'avantage' },
      { type: 'disadvantage', target: 'attack_against:ranged', value: 0, description: 'Les attaques à distance contre vous ont le désavantage' },
      { type: 'speed', target: 'all', value: 0, description: 'Ne peut se déplacer qu\'en rampant (coûte 1 ft par ft)' },
    ],
  },
  restrained: {
    condition: 'Entravé',
    effects: [
      { type: 'speed', target: 'all', value: 0, description: 'Vitesse réduite à 0' },
      { type: 'disadvantage', target: 'attack', value: 0, description: 'Désavantage aux jets d\'attaque' },
      { type: 'advantage', target: 'attack_against', value: 0, description: 'Les attaques contre vous ont l\'avantage' },
      { type: 'disadvantage', target: 'save:dex', value: 0, description: 'Désavantage aux jets de sauvegarde de Dextérité' },
    ],
  },
  stunned: {
    condition: 'Étourdi',
    effects: [
      { type: 'action', target: 'all', value: 0, description: 'Ne peut pas effectuer d\'actions ou de réactions' },
      { type: 'disadvantage', target: 'attack_against', value: 0, description: 'Les attaques contre vous ont l\'avantage' },
      { type: 'disadvantage', target: 'save', value: 0, description: 'Échec automatique aux JS de Force et Dextérité' },
    ],
  },
  unconscious: {
    condition: 'Inconscient',
    effects: [
      { type: 'action', target: 'all', value: 0, description: 'Ne peut pas effectuer d\'actions ou de réactions' },
      { type: 'speed', target: 'all', value: 0, description: 'Vitesse réduite à 0' },
      { type: 'disadvantage', target: 'attack_against', value: 0, description: 'Les attaques contre vous ont l\'avantage' },
      { type: 'disadvantage', target: 'save:str', value: 0, description: 'Échec automatique aux JS de Force et Dextérité' },
      { type: 'ability', target: 'critical:melee', value: 0, description: 'Les attaques de mêlée qui touchent sont des coups critiques' },
      { type: 'ability', target: 'perception', value: 0, description: 'Inconscient de son environnement' },
    ],
  },
  exhaustion: {
    condition: 'Épuisement',
    effects: [
      { type: 'disadvantage', target: 'ability', value: 0, description: 'Désavantage aux tests de caractéristiques (niveau 1+)' },
      { type: 'speed', target: 'half', value: 0, description: 'Vitesse réduite de moitié (niveau 2+)' },
      { type: 'disadvantage', target: 'attack', value: 0, description: 'Désavantage aux jets d\'attaque (niveau 3+)' },
      { type: 'ability', target: 'hp:max:half', value: 0, description: 'PV maximum réduits de moitié (niveau 4+)' },
      { type: 'speed', target: 'zero', value: 0, description: 'Vitesse réduite à 0 (niveau 5+)' },
      { type: 'ability', target: 'death', value: 0, description: 'Mort (niveau 6)' },
    ],
  },
}

// ============================================================================
// FONCTIONS D'APPLICATION
// ============================================================================

export interface ConditionModifiers {
  advantageAttacks: boolean
  disadvantageAttacks: boolean
  advantageAgainst: boolean
  disadvantageAgainst: boolean
  speedMultiplier: number
  speedFlat: number | null
  canAct: boolean
  canReact: boolean
  autoFailSaves: (keyof AbilityScores)[]
  criticalFromMelee: boolean
  perceptionBlind: boolean
}

export function getConditionModifiers(conditions: string[]): ConditionModifiers {
  const modifiers: ConditionModifiers = {
    advantageAttacks: false,
    disadvantageAttacks: false,
    advantageAgainst: false,
    disadvantageAgainst: false,
    speedMultiplier: 1,
    speedFlat: null,
    canAct: true,
    canReact: true,
    autoFailSaves: [],
    criticalFromMelee: false,
    perceptionBlind: false,
  }

  for (const conditionName of conditions) {
    const effect = CONDITION_EFFECTS[conditionName]
    if (!effect) continue

    for (const detail of effect.effects) {
      switch (detail.type) {
        case 'advantage':
          if (detail.target === 'attack') modifiers.advantageAttacks = true
          if (detail.target === 'attack_against') modifiers.advantageAgainst = true
          break
        case 'disadvantage':
          if (detail.target === 'attack') modifiers.disadvantageAttacks = true
          if (detail.target === 'attack_against') modifiers.disadvantageAgainst = true
          break
        case 'speed':
          if (detail.target === 'all') modifiers.speedFlat = 0
          if (detail.target === 'half') modifiers.speedMultiplier = 0.5
          if (detail.target === 'zero') modifiers.speedFlat = 0
          break
        case 'action':
          modifiers.canAct = false
          modifiers.canReact = false
          break
        case 'save':
          if (detail.target === 'save:str' || detail.target === 'save:dex') {
            if (!modifiers.autoFailSaves.includes('str')) modifiers.autoFailSaves.push('str')
            if (!modifiers.autoFailSaves.includes('dex')) modifiers.autoFailSaves.push('dex')
          }
          break
        case 'ability':
          if (detail.target === 'critical:melee') modifiers.criticalFromMelee = true
          if (detail.target === 'perception') modifiers.perceptionBlind = true
          break
      }
    }
  }

  return modifiers
}

export function applyExhaustionLevel(level: number): ConditionModifiers {
  const modifiers: ConditionModifiers = {
    advantageAttacks: false,
    disadvantageAttacks: level >= 3,
    advantageAgainst: false,
    disadvantageAgainst: false,
    speedMultiplier: level >= 2 ? 0.5 : 1,
    speedFlat: level >= 5 ? 0 : null,
    canAct: true,
    canReact: true,
    autoFailSaves: [],
    criticalFromMelee: false,
    perceptionBlind: false,
  }

  if (level >= 1) {
    modifiers.disadvantageAttacks = true
  }

  return modifiers
}

export function getConditionDescription(condition: string): string {
  const effect = CONDITION_EFFECTS[condition]
  if (!effect) return condition
  return effect.effects.map(e => e.description).join('. ')
}

export function getAllConditions(): string[] {
  return Object.keys(CONDITION_EFFECTS)
}

export function getConditionIcon(condition: string): string {
  const icons: Record<string, string> = {
    blinded: '👁️‍🗨️',
    charmed: '💕',
    deafened: '🔇',
    frightened: '😨',
    grappled: '🤝',
    incapacitated: '💤',
    invisible: '👻',
    paralyzed: '⚡',
    petrified: '🪨',
    poisoned: '☠️',
    prone: '🧎',
    restrained: '🔗',
    stunned: '💫',
    unconscious: '😵',
    exhaustion: '😩',
  }
  return icons[condition] || '❓'
}

export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    blinded: '#6b7280',
    charmed: '#ec4899',
    deafened: '#9ca3af',
    frightened: '#f59e0b',
    grappled: '#8b5cf6',
    incapacitated: '#ef4444',
    invisible: '#3b82f6',
    paralyzed: '#f97316',
    petrified: '#6b7280',
    poisoned: '#22c55e',
    prone: '#a855f7',
    restrained: '#dc2626',
    stunned: '#eab308',
    unconscious: '#1f2937',
    exhaustion: '#78350f',
  }
  return colors[condition] || '#6b7280'
}
