// Types pour l'inventaire du personnage

export type ItemType = 'weapon' | 'armor' | 'gear' | 'consumable' | 'wondrous' | 'tool' | 'other'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact'

export interface InventoryItem {
    id: string
    name: string
    type: ItemType
    quantity: number
    weight: number  // en livres (lb)
    equipped: boolean
    magical: boolean
    rarity?: ItemRarity
    attunement?: boolean  // nécessite harmonisation
    attuned?: boolean     // est harmonisé
    description?: string
    value?: number        // en pièces d'or

    // Propriétés d'arme
    damage?: string       // ex: "1d8"
    damageType?: string   // ex: "slashing"
    properties?: string[] // ex: ["finesse", "light"]
    range?: string | { normal: number; long: number }
    versatileDamage?: string

    // Propriétés d'armure
    armorClass?: number
    armorCategory?: 'light' | 'medium' | 'heavy' | 'shield'
    addDex?: boolean
    maxDex?: number
    stealthDisadvantage?: boolean
}

export interface Currency {
    pp: number  // platine
    gp: number  // or
    ep: number  // électrum
    sp: number  // argent
    cp: number  // cuivre
}

export interface CharacterInventory {
    items: InventoryItem[]
    currency: Currency
}

// Poids en or de chaque type de pièce (pour le calcul d'encombrement)
export const coinWeights = {
    pp: 0.02,  // 50 pièces = 1 lb
    gp: 0.02,
    ep: 0.02,
    sp: 0.02,
    cp: 0.02,
}

// Couleurs par rareté
export const rarityColors: Record<ItemRarity, string> = {
    common: '#9CA3AF',      // gray
    uncommon: '#22C55E',    // green
    rare: '#3B82F6',        // blue
    'very-rare': '#8B5CF6', // purple
    legendary: '#F59E0B',   // amber/gold
    artifact: '#EF4444',    // red
}

// Labels FR pour les raretés
export const rarityLabels: Record<ItemRarity, string> = {
    common: 'Commun',
    uncommon: 'Peu commun',
    rare: 'Rare',
    'very-rare': 'Très rare',
    legendary: 'Légendaire',
    artifact: 'Artefact',
}

// Icônes par type d'objet
export const itemTypeIcons: Record<ItemType, string> = {
    weapon: '⚔️',
    armor: '🛡️',
    wondrous: '✨',
    consumable: '🧪',
    gear: '🎒',
    tool: '🔧',
    other: '📦',
}

// Calcul du poids total des pièces
export function calculateCoinWeight(currency: Currency): number {
    return Object.entries(currency).reduce((total, [type, count]) => {
        return total + count * coinWeights[type as keyof typeof coinWeights]
    }, 0)
}

// Calcul du poids total de l'inventaire
export function calculateTotalWeight(items: InventoryItem[], currency: Currency): number {
    const itemWeight = items.reduce((total, item) => total + item.weight * item.quantity, 0)
    const coinWeight = calculateCoinWeight(currency)
    return Math.round((itemWeight + coinWeight) * 10) / 10
}

// Calcul de la capacité d'encombrement basée sur FOR
export function calculateCarryingCapacity(strScore: number): number {
    return strScore * 15  // règle standard D&D 5e
}

// Conversion en pièces d'or totales
export function calculateTotalGold(currency: Currency): number {
    return currency.pp * 10 + currency.gp + currency.ep * 0.5 + currency.sp * 0.1 + currency.cp * 0.01
}
