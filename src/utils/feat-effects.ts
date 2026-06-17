import type { Character, CharacterCreation, StoredCharacter } from '../types/character'
import {
  type FeatFlag,
  type AttackCondition,
  type FeatToggleDef,
  type FeatEffects,
  type FeatEffectSummary,
} from '../types/feat'
import { getFeatById } from '../data/feats'

// Re-export pour compatibilité des imports existants
export type { FeatFlag, AttackCondition, FeatToggleDef, FeatEffects, FeatEffectSummary }

export function computeFeatEffects(
  character: Character | CharacterCreation | StoredCharacter,
  featToggles: Record<string, boolean> = {}
): FeatEffectSummary {
  const result: FeatEffectSummary = {
    passiveAttackBonus: 0,
    passiveDamageBonus: 0,
    toggleAttackModifier: 0,
    toggleDamageModifier: 0,
    toggleDamageDiceExtra: null,
    acBonus: 0,
    speedBonus: 0,
    hpBonus: 0,
    initiativeBonus: 0,
    saveProficiency: null,
    skillProficiencies: new Set(),
    flags: new Set(),
    luckyCharges: null,
  }

  const feats = (character as { feats?: string[] }).feats
  if (!feats || feats.length === 0) return result

  const level = (character as { level?: number }).level || 1

  for (const featId of feats) {
    const feat = getFeatById(featId)
    if (!feat?.effects) continue

    const e = feat.effects

    // ─── Passive effects ───
    if (e.passive) {
      const p = e.passive
      p.attackBonus?.forEach((b: { value: number }) => { result.passiveAttackBonus += b.value })
      p.damageBonus?.forEach((b: { value: number }) => { result.passiveDamageBonus += b.value })
      if (p.acBonus) result.acBonus += p.acBonus
      if (p.speedBonus) result.speedBonus += p.speedBonus
      if (p.hpBonusPerLevel) result.hpBonus += p.hpBonusPerLevel * level
      if (p.initiativeBonus) result.initiativeBonus += p.initiativeBonus
      if (p.saveProficiency) result.saveProficiency = p.saveProficiency
      p.skillProficiencies?.forEach((s: string) => result.skillProficiencies.add(s))
    }

    // ─── Toggles ───
    if (e.toggles) {
      for (const [key, toggle] of Object.entries(e.toggles) as [string, FeatToggleDef][]) {
        const isActive = featToggles[`${featId}:${key}`] ?? toggle.activeByDefault
        if (isActive) {
          result.toggleAttackModifier += toggle.effects.attackModifier || 0
          result.toggleDamageModifier += toggle.effects.damageModifier || 0
          if (toggle.effects.damageDiceExtra) {
            result.toggleDamageDiceExtra = toggle.effects.damageDiceExtra
          }
        }
      }
    }

    // ─── Flags ───
    e.flags?.forEach((f: FeatFlag) => result.flags.add(f))

    // ─── Lucky ───
    if (e.lucky) {
      result.luckyCharges = e.lucky.maxCharges
    }
  }

  return result
}

export interface FeatToggleInfo {
  featId: string
  featName: string
  key: string
  label: string
  description: string
  active: boolean
}

export function getAvailableToggles(
  character: Character | CharacterCreation | StoredCharacter,
  featToggles: Record<string, boolean> = {}
): FeatToggleInfo[] {
  const result: FeatToggleInfo[] = []
  const feats = (character as { feats?: string[] }).feats
  if (!feats) return result

  for (const featId of feats) {
    const feat = getFeatById(featId)
    if (!feat?.effects?.toggles) continue
    for (const [key, toggle] of Object.entries(feat.effects.toggles) as [string, FeatToggleDef][]) {
      result.push({
        featId,
        featName: feat.name,
        key,
        label: toggle.label,
        description: toggle.description,
        active: featToggles[`${featId}:${key}`] ?? toggle.activeByDefault,
      })
    }
  }

  return result
}

export function getAvailableFlags(
  character: Character | CharacterCreation | StoredCharacter
): FeatFlag[] {
  const result: FeatFlag[] = []
  const feats = (character as { feats?: string[] }).feats
  if (!feats) return result

  for (const featId of feats) {
    const feat = getFeatById(featId)
    if (feat?.effects?.flags) {
      result.push(...feat.effects.flags)
    }
  }

  return result
}
