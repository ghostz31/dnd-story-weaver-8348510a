// Catalogue d'équipement D&D 5e SRD

export type WeaponProperty =
    | 'finesse'
    | 'heavy'
    | 'light'
    | 'loading'
    | 'range'
    | 'reach'
    | 'thrown'
    | 'two-handed'
    | 'versatile'
    | 'ammunition'
    | 'special'

export type ArmorCategory = 'light' | 'medium' | 'heavy' | 'shield'
export type DamageType = 'slashing' | 'piercing' | 'bludgeoning' | 'fire' | 'cold' | 'lightning' | 'thunder' | 'poison' | 'acid' | 'necrotic' | 'radiant' | 'force' | 'psychic'

export interface CatalogWeapon {
    id: string
    name: string
    category: 'simple' | 'martial'
    ranged: boolean
    damage: string
    damageType: DamageType
    properties: WeaponProperty[]
    weight: number
    value: number // en pièces d'or
    range?: { normal: number; long: number }
    versatileDamage?: string
}

export interface CatalogArmor {
    id: string
    name: string
    category: ArmorCategory
    armorClass: number
    addDex: boolean
    maxDex?: number // null = pas de limite
    minStr?: number
    stealthDisadvantage: boolean
    weight: number
    value: number
}

export interface CatalogGear {
    id: string
    name: string
    weight: number
    value: number
    description?: string
}

// ========== ARMES ==========

export const weapons: CatalogWeapon[] = [
    // Armes simples de corps à corps
    { id: 'club', name: 'Gourdin', category: 'simple', ranged: false, damage: '1d4', damageType: 'bludgeoning', properties: ['light'], weight: 2, value: 0.1 },
    { id: 'dagger', name: 'Dague', category: 'simple', ranged: false, damage: '1d4', damageType: 'piercing', properties: ['finesse', 'light', 'thrown'], weight: 1, value: 2, range: { normal: 6, long: 18 } },
    { id: 'greatclub', name: 'Massue', category: 'simple', ranged: false, damage: '1d8', damageType: 'bludgeoning', properties: ['two-handed'], weight: 10, value: 0.2 },
    { id: 'handaxe', name: 'Hachette', category: 'simple', ranged: false, damage: '1d6', damageType: 'slashing', properties: ['light', 'thrown'], weight: 2, value: 5, range: { normal: 6, long: 18 } },
    { id: 'javelin', name: 'Javeline', category: 'simple', ranged: false, damage: '1d6', damageType: 'piercing', properties: ['thrown'], weight: 2, value: 0.5, range: { normal: 9, long: 36 } },
    { id: 'light_hammer', name: 'Marteau léger', category: 'simple', ranged: false, damage: '1d4', damageType: 'bludgeoning', properties: ['light', 'thrown'], weight: 2, value: 2, range: { normal: 6, long: 18 } },
    { id: 'mace', name: 'Masse d\'armes', category: 'simple', ranged: false, damage: '1d6', damageType: 'bludgeoning', properties: [], weight: 4, value: 5 },
    { id: 'quarterstaff', name: 'Bâton', category: 'simple', ranged: false, damage: '1d6', damageType: 'bludgeoning', properties: ['versatile'], weight: 4, value: 0.2, versatileDamage: '1d8' },
    { id: 'sickle', name: 'Serpe', category: 'simple', ranged: false, damage: '1d4', damageType: 'slashing', properties: ['light'], weight: 2, value: 1 },
    { id: 'spear', name: 'Lance', category: 'simple', ranged: false, damage: '1d6', damageType: 'piercing', properties: ['thrown', 'versatile'], weight: 3, value: 1, range: { normal: 6, long: 18 }, versatileDamage: '1d8' },

    // Armes simples à distance
    { id: 'light_crossbow', name: 'Arbalète légère', category: 'simple', ranged: true, damage: '1d8', damageType: 'piercing', properties: ['ammunition', 'loading', 'two-handed'], weight: 5, value: 25, range: { normal: 24, long: 96 } },
    { id: 'dart', name: 'Fléchette', category: 'simple', ranged: true, damage: '1d4', damageType: 'piercing', properties: ['finesse', 'thrown'], weight: 0.25, value: 0.05, range: { normal: 6, long: 18 } },
    { id: 'shortbow', name: 'Arc court', category: 'simple', ranged: true, damage: '1d6', damageType: 'piercing', properties: ['ammunition', 'two-handed'], weight: 2, value: 25, range: { normal: 24, long: 96 } },
    { id: 'sling', name: 'Fronde', category: 'simple', ranged: true, damage: '1d4', damageType: 'bludgeoning', properties: ['ammunition'], weight: 0, value: 0.1, range: { normal: 9, long: 36 } },

    // Armes de guerre corps à corps
    { id: 'battleaxe', name: 'Hache de bataille', category: 'martial', ranged: false, damage: '1d8', damageType: 'slashing', properties: ['versatile'], weight: 4, value: 10, versatileDamage: '1d10' },
    { id: 'flail', name: 'Fléau', category: 'martial', ranged: false, damage: '1d8', damageType: 'bludgeoning', properties: [], weight: 2, value: 10 },
    { id: 'glaive', name: 'Coutille', category: 'martial', ranged: false, damage: '1d10', damageType: 'slashing', properties: ['heavy', 'reach', 'two-handed'], weight: 6, value: 20 },
    { id: 'greataxe', name: 'Grande hache', category: 'martial', ranged: false, damage: '1d12', damageType: 'slashing', properties: ['heavy', 'two-handed'], weight: 7, value: 30 },
    { id: 'greatsword', name: 'Épée à deux mains', category: 'martial', ranged: false, damage: '2d6', damageType: 'slashing', properties: ['heavy', 'two-handed'], weight: 6, value: 50 },
    { id: 'halberd', name: 'Hallebarde', category: 'martial', ranged: false, damage: '1d10', damageType: 'slashing', properties: ['heavy', 'reach', 'two-handed'], weight: 6, value: 20 },
    { id: 'lance', name: 'Lance de cavalerie', category: 'martial', ranged: false, damage: '1d12', damageType: 'piercing', properties: ['reach', 'special'], weight: 6, value: 10 },
    { id: 'longsword', name: 'Épée longue', category: 'martial', ranged: false, damage: '1d8', damageType: 'slashing', properties: ['versatile'], weight: 3, value: 15, versatileDamage: '1d10' },
    { id: 'maul', name: 'Maillet', category: 'martial', ranged: false, damage: '2d6', damageType: 'bludgeoning', properties: ['heavy', 'two-handed'], weight: 10, value: 10 },
    { id: 'morningstar', name: 'Morgenstern', category: 'martial', ranged: false, damage: '1d8', damageType: 'piercing', properties: [], weight: 4, value: 15 },
    { id: 'pike', name: 'Pique', category: 'martial', ranged: false, damage: '1d10', damageType: 'piercing', properties: ['heavy', 'reach', 'two-handed'], weight: 18, value: 5 },
    { id: 'rapier', name: 'Rapière', category: 'martial', ranged: false, damage: '1d8', damageType: 'piercing', properties: ['finesse'], weight: 2, value: 25 },
    { id: 'scimitar', name: 'Cimeterre', category: 'martial', ranged: false, damage: '1d6', damageType: 'slashing', properties: ['finesse', 'light'], weight: 3, value: 25 },
    { id: 'shortsword', name: 'Épée courte', category: 'martial', ranged: false, damage: '1d6', damageType: 'piercing', properties: ['finesse', 'light'], weight: 2, value: 10 },
    { id: 'trident', name: 'Trident', category: 'martial', ranged: false, damage: '1d6', damageType: 'piercing', properties: ['thrown', 'versatile'], weight: 4, value: 5, range: { normal: 6, long: 18 }, versatileDamage: '1d8' },
    { id: 'warhammer', name: 'Marteau de guerre', category: 'martial', ranged: false, damage: '1d8', damageType: 'bludgeoning', properties: ['versatile'], weight: 2, value: 15, versatileDamage: '1d10' },
    { id: 'whip', name: 'Fouet', category: 'martial', ranged: false, damage: '1d4', damageType: 'slashing', properties: ['finesse', 'reach'], weight: 3, value: 2 },

    // Armes de guerre à distance
    { id: 'blowgun', name: 'Sarbacane', category: 'martial', ranged: true, damage: '1', damageType: 'piercing', properties: ['ammunition', 'loading'], weight: 1, value: 10, range: { normal: 7, long: 30 } },
    { id: 'hand_crossbow', name: 'Arbalète de poing', category: 'martial', ranged: true, damage: '1d6', damageType: 'piercing', properties: ['ammunition', 'light', 'loading'], weight: 3, value: 75, range: { normal: 9, long: 36 } },
    { id: 'heavy_crossbow', name: 'Arbalète lourde', category: 'martial', ranged: true, damage: '1d10', damageType: 'piercing', properties: ['ammunition', 'heavy', 'loading', 'two-handed'], weight: 18, value: 50, range: { normal: 30, long: 120 } },
    { id: 'longbow', name: 'Arc long', category: 'martial', ranged: true, damage: '1d8', damageType: 'piercing', properties: ['ammunition', 'heavy', 'two-handed'], weight: 2, value: 50, range: { normal: 45, long: 180 } },
    { id: 'net', name: 'Filet', category: 'martial', ranged: true, damage: '0', damageType: 'bludgeoning', properties: ['special', 'thrown'], weight: 3, value: 1, range: { normal: 1.5, long: 4.5 } },
]

// ========== ARMURES ==========

export const armors: CatalogArmor[] = [
    // Armures légères
    { id: 'padded', name: 'Armure matelassée', category: 'light', armorClass: 11, addDex: true, stealthDisadvantage: true, weight: 8, value: 5 },
    { id: 'leather', name: 'Armure de cuir', category: 'light', armorClass: 11, addDex: true, stealthDisadvantage: false, weight: 10, value: 10 },
    { id: 'studded_leather', name: 'Armure de cuir clouté', category: 'light', armorClass: 12, addDex: true, stealthDisadvantage: false, weight: 13, value: 45 },

    // Armures intermédiaires
    { id: 'hide', name: 'Armure de peaux', category: 'medium', armorClass: 12, addDex: true, maxDex: 2, stealthDisadvantage: false, weight: 12, value: 10 },
    { id: 'chain_shirt', name: 'Chemise de mailles', category: 'medium', armorClass: 13, addDex: true, maxDex: 2, stealthDisadvantage: false, weight: 20, value: 50 },
    { id: 'scale_mail', name: 'Armure d\'écailles', category: 'medium', armorClass: 14, addDex: true, maxDex: 2, stealthDisadvantage: true, weight: 45, value: 50 },
    { id: 'breastplate', name: 'Cuirasse', category: 'medium', armorClass: 14, addDex: true, maxDex: 2, stealthDisadvantage: false, weight: 20, value: 400 },
    { id: 'half_plate', name: 'Demi-plate', category: 'medium', armorClass: 15, addDex: true, maxDex: 2, stealthDisadvantage: true, weight: 40, value: 750 },

    // Armures lourdes
    { id: 'ring_mail', name: 'Armure d\'anneaux', category: 'heavy', armorClass: 14, addDex: false, stealthDisadvantage: true, weight: 40, value: 30 },
    { id: 'chain_mail', name: 'Cotte de mailles', category: 'heavy', armorClass: 16, addDex: false, minStr: 13, stealthDisadvantage: true, weight: 55, value: 75 },
    { id: 'splint', name: 'Armure à plaques', category: 'heavy', armorClass: 17, addDex: false, minStr: 15, stealthDisadvantage: true, weight: 60, value: 200 },
    { id: 'plate', name: 'Harnois', category: 'heavy', armorClass: 18, addDex: false, minStr: 15, stealthDisadvantage: true, weight: 65, value: 1500 },

    // Boucliers
    { id: 'shield', name: 'Bouclier', category: 'shield', armorClass: 2, addDex: false, stealthDisadvantage: false, weight: 6, value: 10 },
]

// ========== ÉQUIPEMENT DIVERS ==========

export const gear: CatalogGear[] = [
    // Packs d'aventurier
    { id: 'backpack', name: 'Sac à dos', weight: 5, value: 2 },
    { id: 'bedroll', name: 'Sac de couchage', weight: 7, value: 1 },
    { id: 'tinderbox', name: 'Briquet', weight: 1, value: 0.5 },
    { id: 'torch', name: 'Torche', weight: 1, value: 0.01 },
    { id: 'rope_hemp', name: 'Corde en chanvre (15m)', weight: 10, value: 1 },
    { id: 'rope_silk', name: 'Corde en soie (15m)', weight: 5, value: 10 },
    { id: 'rations', name: 'Rations (1 jour)', weight: 2, value: 0.5 },
    { id: 'waterskin', name: 'Outre', weight: 5, value: 0.2 },
    { id: 'lantern_hooded', name: 'Lanterne à capote', weight: 2, value: 5 },
    { id: 'lantern_bullseye', name: 'Lanterne sourde', weight: 2, value: 10 },
    { id: 'oil_flask', name: 'Flasque d\'huile', weight: 1, value: 0.1 },
    { id: 'crowbar', name: 'Pied-de-biche', weight: 5, value: 2 },
    { id: 'hammer', name: 'Marteau', weight: 3, value: 1 },
    { id: 'pitons', name: 'Pitons (10)', weight: 2.5, value: 0.05 },
    { id: 'grappling_hook', name: 'Grappin', weight: 4, value: 2 },
    { id: 'tent', name: 'Tente (2 personnes)', weight: 20, value: 2 },
    { id: 'mirror_steel', name: 'Miroir en acier', weight: 0.5, value: 5 },
    { id: 'caltrops', name: 'Chausse-trapes (sac de 20)', weight: 2, value: 1 },
    { id: 'chain', name: 'Chaîne (3m)', weight: 10, value: 5 },
    { id: 'manacles', name: 'Menottes', weight: 6, value: 2 },

    // Munitions
    { id: 'arrows', name: 'Flèches (20)', weight: 1, value: 1 },
    { id: 'bolts', name: 'Carreaux d\'arbalète (20)', weight: 1.5, value: 1 },
    { id: 'sling_bullets', name: 'Billes de fronde (20)', weight: 1.5, value: 0.04 },

    // Divers
    { id: 'holy_symbol', name: 'Symbole sacré', weight: 1, value: 5 },
    { id: 'arcane_focus', name: 'Focaliseur arcanique', weight: 1, value: 10 },
    { id: 'component_pouch', name: 'Sacoche à composantes', weight: 2, value: 25 },
    { id: 'spellbook', name: 'Grimoire', weight: 3, value: 50 },
    { id: 'healers_kit', name: 'Trousse de soins', weight: 3, value: 5, description: '10 utilisations' },
    { id: 'thieves_tools', name: 'Outils de voleur', weight: 1, value: 25 },
]

// Labels FR pour les propriétés d'armes
export const weaponPropertyLabels: Record<WeaponProperty, string> = {
    finesse: 'Finesse',
    heavy: 'Lourde',
    light: 'Légère',
    loading: 'Chargement',
    range: 'Portée',
    reach: 'Allonge',
    thrown: 'Lancer',
    'two-handed': 'Deux mains',
    versatile: 'Polyvalente',
    ammunition: 'Munitions',
    special: 'Spéciale',
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
    poison: 'Poison',
    acid: 'Acide',
    necrotic: 'Nécrotique',
    radiant: 'Radiant',
    force: 'Force',
    psychic: 'Psychique',
}

// Labels FR pour les catégories d'armure
export const armorCategoryLabels: Record<ArmorCategory, string> = {
    light: 'Légère',
    medium: 'Intermédiaire',
    heavy: 'Lourde',
    shield: 'Bouclier',
}

// Utility: Convert starting equipment names to InventoryItem objects
import type { InventoryItem } from '../types/inventory'

/**
 * Convertit une liste de noms d'équipement de départ en objets InventoryItem structurés.
 * Essaie de matcher avec le catalogue d'armes/armures, sinon crée un objet générique.
 */
export function convertStartingEquipment(equipmentNames: string[]): Omit<InventoryItem, 'id'>[] {
    const items: Omit<InventoryItem, 'id'>[] = []

    for (const name of equipmentNames) {
        // Chercher dans les armes
        const weapon = weapons.find(w =>
            w.name.toLowerCase() === name.toLowerCase() ||
            name.toLowerCase().includes(w.name.toLowerCase())
        )
        if (weapon) {
            items.push({
                name: weapon.name,
                type: 'weapon',
                quantity: 1,
                weight: weapon.weight,
                equipped: true, // Équipé par défaut
                magical: false,
                damage: weapon.damage,
                damageType: weapon.damageType,
                properties: weapon.properties.map(p => weaponPropertyLabels[p]),
                range: weapon.range ? `${weapon.range.normal}/${weapon.range.long} m` : undefined,
                versatileDamage: weapon.versatileDamage,
                value: weapon.value,
            })
            continue
        }

        // Chercher dans les armures
        const armor = armors.find(a =>
            a.name.toLowerCase() === name.toLowerCase() ||
            name.toLowerCase().includes(a.name.toLowerCase())
        )
        if (armor) {
            items.push({
                name: armor.name,
                type: 'armor',
                quantity: 1,
                weight: armor.weight,
                equipped: true, // Équipé par défaut
                magical: false,
                armorClass: armor.armorClass,
                armorCategory: armor.category,
                addDex: armor.addDex,
                maxDex: armor.maxDex,
                stealthDisadvantage: armor.stealthDisadvantage,
                value: armor.value,
            })
            continue
        }

        // Chercher dans l'équipement
        const gearItem = gear.find(g =>
            g.name.toLowerCase() === name.toLowerCase() ||
            name.toLowerCase().includes(g.name.toLowerCase())
        )
        if (gearItem) {
            items.push({
                name: gearItem.name,
                type: 'gear',
                quantity: 1,
                weight: gearItem.weight,
                equipped: false,
                magical: false,
                value: gearItem.value,
            })
            continue
        }

        // Fallback: créer un objet générique
        items.push({
            name: name,
            type: 'gear',
            quantity: 1,
            weight: 0,
            equipped: false,
            magical: false,
        })
    }

    return items
}
