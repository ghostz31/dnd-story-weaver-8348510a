export interface ClassRef {
    name: string
    nameEn: string
    hitDie: number
    primaryAbility: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
    savingThrows: string[]
    armorProficiencies: string[]
    weaponProficiencies: string[]
    skillChoices: string[]
    numSkillChoices: number
    tools: string[]
    startingEquipment: string[]
}

export interface ProgressionEntry {
    level: number
    proficiencyBonus: number
    features: string[]
    resources?: Record<string, number | null | string>
}

export interface SubclassEntry {
    id: string
    name: string
    source: string
    features: Record<number, {
        name: string
        type?: 'action' | 'bonus' | 'reaction' | 'passive'
        description?: string
        spells?: string[]
        usage?: string
        choices?: string[]
        keywords?: string[]
        forbidden?: string[]
    }>
}

export interface FullClassRef extends ClassRef {
    progression: ProgressionEntry[]
    resourceTables: Record<string, (number | string)[]>
    classActions: Record<string, { restoreOn: string; availableFrom: number }>
    subclasses: Record<string, SubclassEntry>
}
