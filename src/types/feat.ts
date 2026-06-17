// Types pour les dons (feats) D&D 5e
// Extraits de utils/feat-effects.ts pour casser le cycle data ↔ utils

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
