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
import type { InventoryItem, ItemType, ItemRarity } from '../types/inventory'

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

export interface CatalogMagicItem {
    id: string
    name: string
    type: ItemType
    rarity: ItemRarity
    attunement: boolean
    description: string
    weight: number
    bonusFields: Partial<Pick<InventoryItem, 'attackBonus' | 'damageBonus' | 'acBonus' | 'abilityBonus' | 'abilitySetTo' | 'saveBonus' | 'spellAttackBonus' | 'spellSaveDCBonus' | 'speedBonus' | 'damageExtra' | 'damage' | 'damageType' | 'armorClass' | 'armorCategory' | 'addDex' | 'maxDex' | 'stealthDisadvantage' | 'properties' | 'charges' | 'maxCharges' | 'chargesRecovery'>>
}

export const magicItems: CatalogMagicItem[] = [
    // === ARMES +1/+2/+3 ===
    { id: 'weapon_plus1', name: 'Arme +1', type: 'weapon', rarity: 'uncommon', attunement: true, description: 'Arme magique avec un bonus de +1 aux jets d\'attaque et de dégâts.', weight: 0, bonusFields: { attackBonus: 1, damageBonus: 1 } },
    { id: 'weapon_plus2', name: 'Arme +2', type: 'weapon', rarity: 'rare', attunement: true, description: 'Arme magique avec un bonus de +2 aux jets d\'attaque et de dégâts.', weight: 0, bonusFields: { attackBonus: 2, damageBonus: 2 } },
    { id: 'weapon_plus3', name: 'Arme +3', type: 'weapon', rarity: 'very-rare', attunement: true, description: 'Arme magique avec un bonus de +3 aux jets d\'attaque et de dégâts.', weight: 0, bonusFields: { attackBonus: 3, damageBonus: 3 } },

    // === ARMURES +1/+2/+3 ===
    { id: 'armor_plus1', name: 'Armure +1', type: 'armor', rarity: 'rare', attunement: false, description: 'Armure magique conférant un bonus de +1 à la CA.', weight: 0, bonusFields: { acBonus: 1 } },
    { id: 'armor_plus2', name: 'Armure +2', type: 'armor', rarity: 'very-rare', attunement: true, description: 'Armure magique conférant un bonus de +2 à la CA.', weight: 0, bonusFields: { acBonus: 2 } },
    { id: 'armor_plus3', name: 'Armure +3', type: 'armor', rarity: 'legendary', attunement: true, description: 'Armure magique conférant un bonus de +3 à la CA.', weight: 0, bonusFields: { acBonus: 3 } },

    // === BOUCLIER +1/+2/+3 ===
    { id: 'shield_plus1', name: 'Bouclier +1', type: 'armor', rarity: 'uncommon', attunement: true, description: 'Bouclier magique conférant un bonus de +1 à la CA.', weight: 6, bonusFields: { armorClass: 2, armorCategory: 'shield', acBonus: 1, addDex: false } },
    { id: 'shield_plus2', name: 'Bouclier +2', type: 'armor', rarity: 'rare', attunement: true, description: 'Bouclier magique conférant un bonus de +2 à la CA.', weight: 6, bonusFields: { armorClass: 2, armorCategory: 'shield', acBonus: 2, addDex: false } },
    { id: 'shield_plus3', name: 'Bouclier +3', type: 'armor', rarity: 'very-rare', attunement: true, description: 'Bouclier magique conférant un bonus de +3 à la CA.', weight: 6, bonusFields: { armorClass: 2, armorCategory: 'shield', acBonus: 3, addDex: false } },

    // === OBJETS AUGMENTANT LES CARACTÉRISTIQUES ===
    { id: 'belt_hill_giant_strength', name: 'Ceinture de Force des Géants des collines', type: 'wondrous', rarity: 'rare', attunement: true, description: 'Votre score de Force devient 21.', weight: 1, bonusFields: { abilitySetTo: { str: 21 } } },
    { id: 'belt_stone_giant_strength', name: 'Ceinture de Force des Géants de pierre', type: 'wondrous', rarity: 'rare', attunement: true, description: 'Votre score de Force devient 23.', weight: 1, bonusFields: { abilitySetTo: { str: 23 } } },
    { id: 'belt_frost_giant_strength', name: 'Ceinture de Force des Géants du gel', type: 'wondrous', rarity: 'very-rare', attunement: true, description: 'Votre score de Force devient 25.', weight: 1, bonusFields: { abilitySetTo: { str: 25 } } },
    { id: 'belt_fire_giant_strength', name: 'Ceinture de Force des Géants du feu', type: 'wondrous', rarity: 'very-rare', attunement: true, description: 'Votre score de Force devient 27.', weight: 1, bonusFields: { abilitySetTo: { str: 27 } } },
    { id: 'belt_cloud_giant_strength', name: 'Ceinture de Force des Géants des nuages', type: 'wondrous', rarity: 'legendary', attunement: true, description: 'Votre score de Force devient 29.', weight: 1, bonusFields: { abilitySetTo: { str: 29 } } },
    { id: 'belt_storm_giant_strength', name: 'Ceinture de Force des Géants des tempêtes', type: 'wondrous', rarity: 'legendary', attunement: true, description: 'Votre score de Force devient 31.', weight: 1, bonusFields: { abilitySetTo: { str: 31 } } },
    { id: 'gauntlets_ogre_power', name: 'Gantelets de Puissance d\'Ogre', type: 'wondrous', rarity: 'uncommon', attunement: true, description: 'Votre score de Force devient 19 s\'il est inférieur.', weight: 2, bonusFields: { abilitySetTo: { str: 19 } } },
    { id: 'headband_intellect', name: 'Bandeau d\'Intellect', type: 'wondrous', rarity: 'uncommon', attunement: true, description: 'Votre score d\'Intelligence devient 19 s\'il est inférieur.', weight: 0, bonusFields: { abilitySetTo: { int: 19 } } },
    { id: 'amulet_health', name: 'Amulette de Santé', type: 'wondrous', rarity: 'uncommon', attunement: true, description: 'Votre score de Constitution devient 19 s\'il est inférieur.', weight: 0, bonusFields: { abilitySetTo: { con: 19 } } },
    { id: 'cloak_charisma', name: 'Cape de Charisme', type: 'wondrous', rarity: 'uncommon', attunement: true, description: 'Votre score de Charisme devient 19 s\'il est inférieur.', weight: 1, bonusFields: { abilitySetTo: { cha: 19 } } },
    { id: 'slippers_spider_climbing', name: 'Pantoufles d\'Escalade', type: 'wondrous', rarity: 'uncommon', attunement: true, description: 'Vous pouvez marcher sur les surfaces verticales et les plafonds.', weight: 0.5, bonusFields: {} },

    // === OBJETS DE PROTECTION ===
    { id: 'ring_protection', name: 'Anneau de Protection', type: 'wondrous', rarity: 'rare', attunement: true, description: 'Bonus de +1 à la CA et aux jets de sauvegarde.', weight: 0, bonusFields: { acBonus: 1, saveBonus: 1 } },
    { id: 'cloak_protection', name: 'Cape de Protection', type: 'wondrous', rarity: 'rare', attunement: true, description: 'Bonus de +1 à la CA et aux jets de sauvegarde.', weight: 1, bonusFields: { acBonus: 1, saveBonus: 1 } },
    { id: 'ring_protection_plus2', name: 'Anneau de Protection +2', type: 'wondrous', rarity: 'very-rare', attunement: true, description: 'Bonus de +2 à la CA et aux jets de sauvegarde.', weight: 0, bonusFields: { acBonus: 2, saveBonus: 2 } },

    // === OBJETS DE VITESSE ===
    { id: 'boots_elvenkind', name: 'Bottes Elfiques', type: 'wondrous', rarity: 'uncommon', attunement: true, description: 'Vitesse +3m, avantage aux tests de Stealth.', weight: 1, bonusFields: { speedBonus: 3 } },
    { id: 'boots_speed', name: 'Bottes de Vitesse', type: 'wondrous', rarity: 'rare', attunement: true, description: 'Vitesse +3m, action bonus pour Dash.', weight: 1, bonusFields: { speedBonus: 3 } },
    { id: 'boots_flying', name: 'Bottes Volantes', type: 'wondrous', rarity: 'very-rare', attunement: true, description: 'Vous pouvez voler à votre vitesse de marche.', weight: 1, bonusFields: { speedBonus: 0 } },
    { id: 'boots_striding_springing', name: 'Bottes d\'Enjambée et de Bondissement', type: 'wondrous', rarity: 'uncommon', attunement: true, description: 'Vitesse +3m, bonds de 6m.', weight: 1, bonusFields: { speedBonus: 3 } },

    // === OBJETS DE SORTS ===
    { id: 'wand_war_mage', name: 'Baguette du Maître de Guerre', type: 'wondrous', rarity: 'rare', attunement: true, description: 'Bonus de +1 aux jets d\'attaque de sort et au DD de sauvegarde des sorts.', weight: 0, bonusFields: { spellAttackBonus: 1, spellSaveDCBonus: 1 } },
    { id: 'wand_warmage_plus2', name: 'Baguette du Maître de Guerre +2', type: 'wondrous', rarity: 'very-rare', attunement: true, description: 'Bonus de +2 aux jets d\'attaque de sort et au DD de sauvegarde des sorts.', weight: 0, bonusFields: { spellAttackBonus: 2, spellSaveDCBonus: 2 } },
    { id: 'rod_pact_keeper', name: 'Bâton du Pacte', type: 'wondrous', rarity: 'uncommon', attunement: true, description: 'Occultiste : bonus de +1 aux jets d\'attaque de sort et au DD de sauvegarde.', weight: 0, bonusFields: { spellAttackBonus: 1, spellSaveDCBonus: 1 } },
    { id: 'staff_power', name: 'Bâton de Puissance', type: 'wondrous', rarity: 'very-rare', attunement: true, description: 'Bonus de +2 aux jets d\'attaque de sort. 20 charges.', weight: 4, bonusFields: { spellAttackBonus: 2, charges: 20, maxCharges: 20, chargesRecovery: 'long' } },
    { id: 'pearl_power', name: 'Perle de Puissance', type: 'wondrous', rarity: 'uncommon', attunement: false, description: 'Récupération arcanique : regagnez 1 emplacement de sort de niveau 3.', weight: 0, bonusFields: { charges: 1, maxCharges: 1, chargesRecovery: 'dawn' } },

    // === ARMES MAGIQUES SPÉCIFIQUES ===
    { id: 'flame_tongue', name: 'Lame Flamboyante', type: 'weapon', rarity: 'rare', attunement: true, description: 'Action bonus pour activer : +2d6 dégâts de feu supplémentaires.', weight: 0, bonusFields: { damageExtra: '2d6 feu' } },
    { id: 'frost_brand', name: 'Marque de Givre', type: 'weapon', rarity: 'rare', attunement: true, description: 'Action bonus pour activer : +1d6 dégâts de froid. Résistance au feu.', weight: 0, bonusFields: { damageExtra: '1d6 froid' } },
    { id: 'sword_sharpness', name: 'Épée d\'Acuité', type: 'weapon', rarity: 'very-rare', attunement: true, description: 'Arme +3. Critique sur 19-20. Si réduit à 0 PV, tranchage.', weight: 0, bonusFields: { attackBonus: 3, damageBonus: 3 } },
    { id: 'dagger_venom', name: 'Dague d\'Empoisonnement', type: 'weapon', rarity: 'rare', attunement: true, description: 'Dague +1. Cible doit réussir un JS CON 13 ou subir 2d10 dégâts de poison.', weight: 1, bonusFields: { attackBonus: 1, damageBonus: 1, damage: '1d4', damageType: 'piercing', properties: ['Finesse', 'Légère', 'Lancer'] } },
    { id: 'sun_blade', name: 'Lame Solaire', type: 'weapon', rarity: 'rare', attunement: true, description: 'Épée +2, dégâts radiants contre morts-vivants. Lumière 12m.', weight: 3, bonusFields: { attackBonus: 2, damageBonus: 2, damage: '1d8', damageType: 'radiant', properties: ['Finesse'] } },
    { id: 'holy_avenger', name: 'Vengeur Sacré', type: 'weapon', rarity: 'legendary', attunement: true, description: 'Arme +3. Aura 3m : alliés ont avantage aux JDS contre sorts.', weight: 0, bonusFields: { attackBonus: 3, damageBonus: 3 } },

    // === ARMURES MAGIQUES SPÉCIFIQUES ===
    { id: 'mithral_armor', name: 'Armure de Mithral', type: 'armor', rarity: 'uncommon', attunement: false, description: 'Pas de désavantage de furtivité, pas de bruit.', weight: 0, bonusFields: { stealthDisadvantage: false, acBonus: 0 } },
    { id: 'elven_chain', name: 'Cotte Elfique', type: 'armor', rarity: 'rare', attunement: false, description: 'Cotte de mailles légère. CA 14 + DEX (max 2). Pas de désavantage de furtivité.', weight: 20, bonusFields: { armorClass: 14, armorCategory: 'medium', addDex: true, maxDex: 2, stealthDisadvantage: false } },
    { id: 'cloak_displacement', name: 'Cape de Déplacement', type: 'wondrous', rarity: 'rare', attunement: true, description: 'Les attaques contre vous ont désavantage. Disparaît après avoir été touchée.', weight: 1, bonusFields: {} },
    { id: 'bracers_archery', name: 'Brassards d\'Archerie', type: 'wondrous', rarity: 'uncommon', attunement: true, description: 'Bonus de +2 aux jets de dégâts avec les arcs.', weight: 1, bonusFields: {} },
]
