export interface BeastAttack {
    name: string
    nameEn: string
    bonus: number      // bonus de touche natif de la bête
    damage: string     // ex: "1d6+2"
    damageType: string
    range?: { normal: number; long?: number }
    properties?: string[]
}

export interface WildShapeBeast {
    id: string
    name: string
    nameEn: string
    cr: number         // Challenge Rating
    size: 'TP' | 'P' | 'M' | 'G' | 'TG'
    hp: number
    ac: number
    speed: {
        walk: number
        fly?: number
        swim?: number
        climb?: number
        burrow?: number
    }
    abilityScores: {
        str: number
        dex: number
        con: number
        int: number
        wis: number
        cha: number
    }
    attacks: BeastAttack[]
    skills?: string[]
    senses?: string[]
    languages?: string[]
    // Traits spéciaux
    traits?: Array<{ name: string; description: string }>
}
