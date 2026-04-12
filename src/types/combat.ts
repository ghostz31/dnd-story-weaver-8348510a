// Types pour le combat

export type DamageType =
    | 'slashing' | 'piercing' | 'bludgeoning'  // physiques
    | 'fire' | 'cold' | 'lightning' | 'thunder' | 'acid' | 'poison'  // élémentaires
    | 'radiant' | 'necrotic' | 'force' | 'psychic'  // magiques

export type AttackType = 'melee' | 'ranged' | 'spell'

export interface Attack {
    id: string
    name: string
    type: AttackType
    ability: 'str' | 'dex' | 'int' | 'wis' | 'cha'  // caractéristique utilisée
    isProficient: boolean
    damageRoll: string       // ex: "1d8", "2d6"
    damageType: DamageType
    bonusDamage?: number     // bonus supplémentaire
    range?: string           // ex: "1.5 m" ou "36/120 m"
    properties?: string[]    // versatile, finesse, etc.
    magical?: boolean
    description?: string
}

// Labels FR pour les types de dégâts
export const damageTypeLabels: Record<DamageType, string> = {
    slashing: 'Tranchant',
    piercing: 'Perforant',
    bludgeoning: 'Contondant',
    fire: 'Feu',
    cold: 'Froid',
    lightning: 'Foudre',
    thunder: 'Tonnerre',
    acid: 'Acide',
    poison: 'Poison',
    radiant: 'Radiant',
    necrotic: 'Nécrotique',
    force: 'Force',
    psychic: 'Psychique',
}

// Icônes par type de dégât
export const damageTypeIcons: Record<DamageType, string> = {
    slashing: '⚔️',
    piercing: '🗡️',
    bludgeoning: '🔨',
    fire: '🔥',
    cold: '❄️',
    lightning: '⚡',
    thunder: '💨',
    acid: '🧪',
    poison: '☠️',
    radiant: '✨',
    necrotic: '💀',
    force: '💫',
    psychic: '🧠',
}

// Labels FR pour les types d'attaque
export const attackTypeLabels: Record<AttackType, string> = {
    melee: 'Corps à corps',
    ranged: 'À distance',
    spell: 'Sort',
}

// Armes de base D&D 5e avec leurs stats
export const baseWeapons: Omit<Attack, 'id' | 'isProficient'>[] = [
    // Armes simples de corps à corps
    { name: 'Bâton', type: 'melee', ability: 'str', damageRoll: '1d6', damageType: 'bludgeoning', properties: ['versatile (1d8)'] },
    { name: 'Dague', type: 'melee', ability: 'dex', damageRoll: '1d4', damageType: 'piercing', range: '6/18 m', properties: ['finesse', 'légère', 'lancer'] },
    { name: 'Gourdin', type: 'melee', ability: 'str', damageRoll: '1d4', damageType: 'bludgeoning', properties: ['légère'] },
    { name: 'Hachette', type: 'melee', ability: 'str', damageRoll: '1d6', damageType: 'slashing', range: '6/18 m', properties: ['légère', 'lancer'] },
    { name: 'Javeline', type: 'melee', ability: 'str', damageRoll: '1d6', damageType: 'piercing', range: '9/36 m', properties: ['lancer'] },
    { name: 'Marteau léger', type: 'melee', ability: 'str', damageRoll: '1d4', damageType: 'bludgeoning', range: '6/18 m', properties: ['légère', 'lancer'] },
    { name: 'Masse', type: 'melee', ability: 'str', damageRoll: '1d6', damageType: 'bludgeoning' },
    { name: 'Serpe', type: 'melee', ability: 'str', damageRoll: '1d4', damageType: 'slashing', properties: ['légère'] },

    // Armes simples à distance
    { name: 'Arbalète légère', type: 'ranged', ability: 'dex', damageRoll: '1d8', damageType: 'piercing', range: '24/96 m', properties: ['munitions', 'chargement', 'deux mains'] },
    { name: 'Arc court', type: 'ranged', ability: 'dex', damageRoll: '1d6', damageType: 'piercing', range: '24/96 m', properties: ['munitions', 'deux mains'] },
    { name: 'Fléchette', type: 'ranged', ability: 'dex', damageRoll: '1d4', damageType: 'piercing', range: '6/18 m', properties: ['finesse', 'lancer'] },
    { name: 'Fronde', type: 'ranged', ability: 'dex', damageRoll: '1d4', damageType: 'bludgeoning', range: '9/36 m', properties: ['munitions'] },

    // Armes de guerre de corps à corps
    { name: 'Cimeterre', type: 'melee', ability: 'dex', damageRoll: '1d6', damageType: 'slashing', properties: ['finesse', 'légère'] },
    { name: 'Épée courte', type: 'melee', ability: 'dex', damageRoll: '1d6', damageType: 'piercing', properties: ['finesse', 'légère'] },
    { name: 'Épée longue', type: 'melee', ability: 'str', damageRoll: '1d8', damageType: 'slashing', properties: ['versatile (1d10)'] },
    { name: 'Épée à deux mains', type: 'melee', ability: 'str', damageRoll: '2d6', damageType: 'slashing', properties: ['lourde', 'deux mains'] },
    { name: 'Fléau', type: 'melee', ability: 'str', damageRoll: '1d8', damageType: 'bludgeoning' },
    { name: 'Hallebarde', type: 'melee', ability: 'str', damageRoll: '1d10', damageType: 'slashing', properties: ['lourde', 'allonge', 'deux mains'] },
    { name: 'Hache à deux mains', type: 'melee', ability: 'str', damageRoll: '1d12', damageType: 'slashing', properties: ['lourde', 'deux mains'] },
    { name: 'Hache de guerre', type: 'melee', ability: 'str', damageRoll: '1d8', damageType: 'slashing', properties: ['versatile (1d10)'] },
    { name: 'Lance', type: 'melee', ability: 'str', damageRoll: '1d6', damageType: 'piercing', range: '6/18 m', properties: ['lancer', 'versatile (1d8)'] },
    { name: 'Marteau de guerre', type: 'melee', ability: 'str', damageRoll: '1d8', damageType: 'bludgeoning', properties: ['versatile (1d10)'] },
    { name: 'Masse d\'armes', type: 'melee', ability: 'str', damageRoll: '1d8', damageType: 'bludgeoning' },
    { name: 'Morgenstern', type: 'melee', ability: 'str', damageRoll: '1d8', damageType: 'piercing' },
    { name: 'Pique', type: 'melee', ability: 'str', damageRoll: '1d10', damageType: 'piercing', properties: ['lourde', 'allonge', 'deux mains'] },
    { name: 'Rapière', type: 'melee', ability: 'dex', damageRoll: '1d8', damageType: 'piercing', properties: ['finesse'] },
    { name: 'Trident', type: 'melee', ability: 'str', damageRoll: '1d6', damageType: 'piercing', range: '6/18 m', properties: ['lancer', 'versatile (1d8)'] },

    // Armes de guerre à distance
    { name: 'Arc long', type: 'ranged', ability: 'dex', damageRoll: '1d8', damageType: 'piercing', range: '45/180 m', properties: ['munitions', 'lourde', 'deux mains'] },
    { name: 'Arbalète de poing', type: 'ranged', ability: 'dex', damageRoll: '1d6', damageType: 'piercing', range: '9/36 m', properties: ['munitions', 'légère', 'chargement'] },
    { name: 'Arbalète lourde', type: 'ranged', ability: 'dex', damageRoll: '1d10', damageType: 'piercing', range: '30/120 m', properties: ['munitions', 'lourde', 'chargement', 'deux mains'] },
]
