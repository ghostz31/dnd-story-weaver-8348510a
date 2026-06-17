import type { Character, CharacterCreation } from '../types/character'
import type { StoredCharacter } from '../contexts/CharacterContext'
import { getFeatById } from '../data/feats'

export type FeatFlag =
  | 'alert-immune-surprise'
  | 'alert-no-invisible-advantage'
  | 'mobile-no-opportunity-attack'
  | 'charger-bonus-action'
  | 'crossbow-expert-bonus-attack'
  | 'crossbow-expert-no-disadvantage'
  | 'defensive-duelist-reaction'
  | 'dual-wielder-draw-two'
  | 'dungeon-delver-advantage-traps'
  | 'dungeon-delver-resistance-traps'
  | 'grappler-advantage'
  | 'grappler-pin'
  | 'healer-action-bonus'
  | 'lucky-reroll'
  | 'mage-slayer-reaction'
  | 'mage-slayer-advantage-save'
  | 'polearm-master-bonus-attack'
  | 'polearm-master-opportunity-entry'
  | 'sentinel-reduce-speed'
  | 'sentinel-reaction-ally'
  | 'sentinel-no-disengage'
  | 'shield-master-shove-bonus'
  | 'shield-master-dex-save'
  | 'shield-master-no-damage-save'
  | 'sharpshooter-ignore-cover'
  | 'sharpshooter-no-long-range-disadvantage'
  | 'tavern-brawler-improvised'
  | 'tavern-brawler-grapple-bonus'
  | 'war-caster-concentration'
  | 'war-caster-spell-opportunity'
  | 'war-caster-somatic-shield'
  | 'dragon-fear-action'
  | 'dragon-hide-natural-armor'
  | 'dwarven-fortitude-dodge-heal'
  | 'fade-away-reaction'
  | 'fey-teleportation-action'
  | 'infernal-constitution-resistance'
  | 'orcish-fury-reaction'
  | 'second-chance-reaction'
  | 'bountiful-luck-reaction'
  | 'telekinetic-action'
  | 'crusher-move'
  | 'crusher-advantage-crit'
  | 'slasher-speed-reduction'
  | 'slasher-disadvantage-crit'
  | 'chef-heal-food'
  | 'poisoner-apply'
  | 'inspiring-leader-temp-hp'
  | 'athlete-stand-up'
  | 'heavy-armor-master-damage-reduction'
  | 'observant-passive-bonus'
  | 'savage-attacker-reroll'
  | 'telepathic-communication'
  | 'piercer-reroll'
  | 'actor-deception-performance'
  | 'durable-die-max'
  | 'elemental-adept-reroll'
  | 'heavily-armored-heavy'
  | 'keen-mind-direction'
  | 'lightly-armored-light'
  | 'linguist-languages'
  | 'magic-initiate-spells'
  | 'martial-adept-maneuvers'
  | 'medium-armor-master-stealth'
  | 'moderately-armored-medium'
  | 'mounted-combatant-mounted'
  | 'resilient-save'
  | 'ritual-caster-rituals'
  | 'skilled-proficiencies'
  | 'skulker-hide'
  | 'spell-sniper-range'
  | 'weapon-master-weapons'
  | 'drow-high-magic-spells'
  | 'elven-accuracy-reroll'
  | 'flames-of-phlegethos-fire'
  | 'prodigy-skill'
  | 'squat-nimbleness-speed'
  | 'wood-elf-magic-spells'
  | 'artificer-initiate-spells'
  | 'fighting-initiate-style'
  | 'gunner-firearms'
  | 'metamagic-adept-metamagic'
  | 'shadow-touched-spells'
  | 'skill-expert-expertise'

export type AttackCondition =
  | 'ranged-weapon'
  | 'melee-weapon'
  | 'melee-one-handed'
  | 'heavy-weapon'
  | 'two-handed'
  | 'finesse-weapon'
  | 'spell-attack'

export interface FeatToggleDef {
  label: string
  description: string
  activeByDefault: boolean
  effects: {
    attackModifier?: number
    damageModifier?: number
    damageDiceExtra?: string
    condition?: AttackCondition
  }
}

export interface FeatEffects {
  passive?: {
    attackBonus?: Array<{ value: number; condition?: AttackCondition }>
    damageBonus?: Array<{ value: number; condition?: AttackCondition }>
    acBonus?: number
    speedBonus?: number
    hpBonusPerLevel?: number
    initiativeBonus?: number
    saveProficiency?: string
    skillProficiencies?: string[]
    darkvisionRange?: number
  }
  toggles?: Record<string, FeatToggleDef>
  flags?: FeatFlag[]
  lucky?: { maxCharges: number }
}

export interface FeatEffectSummary {
  passiveAttackBonus: number
  passiveDamageBonus: number
  toggleAttackModifier: number
  toggleDamageModifier: number
  toggleDamageDiceExtra: string | null
  acBonus: number
  speedBonus: number
  hpBonus: number
  initiativeBonus: number
  saveProficiency: string | null
  skillProficiencies: Set<string>
  flags: Set<FeatFlag>
  luckyCharges: number | null
}

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
