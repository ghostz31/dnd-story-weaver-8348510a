import type { FeatEffects } from '../../types/feat'

export type FeatSource = 'PHB' | 'XGtE' | 'TCoE'

export interface Feat {
    id: string
    name: string
    nameEn: string
    source: FeatSource
    description: string
    prerequisite?: string
    abilityScoreIncrease?: Partial<Record<string, number>>
    asiChoices?: Partial<Record<string, number>>[]
    spells?: string[]
    hpBonusPerLevel?: number
    speedBonus?: number
    savingThrowProficiency?: string
    skillProficiencies?: string[]
    languages?: string[]
    effects?: FeatEffects
}
