import type { InventoryItem, ItemRarity } from '../types/inventory'
import { weapons } from '../data/equipment'
import type { CatalogWeapon } from '../data/equipment'

export interface TrameMagicItem {
    id: string
    name: string
    type: string
    rarity: string
    attunement: boolean
    attunementDetails?: string
    description: string
    source?: string
    imageUrl?: string | null
}

const rarityMap: Record<string, ItemRarity> = {
    'commun': 'common',
    'peu commun': 'uncommon',
    'rare': 'rare',
    'tres rare': 'very-rare',
    'très rare': 'very-rare',
    'legendaire': 'legendary',
    'légendaire': 'legendary',
    'artefact': 'artifact',
    'artéfact': 'artifact',
}

const typeMap: Record<string, InventoryItem['type']> = {
    'arme': 'weapon',
    'armure': 'armor',
    'anneau': 'wondrous',
    'baton': 'wondrous',
    'bâton': 'wondrous',
    'baguette': 'wondrous',
    'sceptre': 'wondrous',
    'parchemin': 'consumable',
    'potion': 'consumable',
    'objet merveilleux': 'wondrous',
    'outil': 'tool',
}

function resolveRarity(r: string): ItemRarity {
    const lower = r.toLowerCase().trim()
    return rarityMap[lower] || 'common'
}

function resolveType(t: string): InventoryItem['type'] {
    const lower = t.toLowerCase().trim()
    for (const [key, value] of Object.entries(typeMap)) {
        if (lower.includes(key)) return value
    }
    if (lower.includes('armure') || lower.includes('bouclier')) return 'armor'
    if (lower.includes('potion') || lower.includes('flasque') || lower.includes('elixir') || lower.includes('huile')) return 'consumable'
    if (lower.includes('parchemin')) return 'consumable'
    return 'wondrous'
}

function findBaseWeaponByName(name: string): CatalogWeapon | undefined {
    const lower = name.toLowerCase().trim()
    return weapons.find(w =>
        w.name.toLowerCase() === lower ||
        w.name.toLowerCase().includes(lower) ||
        lower.includes(w.name.toLowerCase())
    )
}

interface ParsedBonuses {
    attackBonus?: number
    damageBonus?: number
    acBonus?: number
    abilityBonus?: Partial<Record<string, number>>
    abilitySetTo?: Partial<Record<string, number>>
    saveBonus?: number
    spellAttackBonus?: number
    spellSaveDCBonus?: number
    speedBonus?: number
    damageExtra?: string
    armorClass?: number
    armorCategory?: 'light' | 'medium' | 'heavy' | 'shield'
    addDex?: boolean
    maxDex?: number
    stealthDisadvantage?: boolean
    charges?: number
    maxCharges?: number
    chargesRecovery?: 'short' | 'long' | 'dawn'
}

function parseBonuses(name: string, description: string): ParsedBonuses {
    const bonuses: ParsedBonuses = {}
    const lowerName = name.toLowerCase()
    const lowerDesc = description.toLowerCase()

    // Armes +1, +2, +3
    const weaponMatch = lowerName.match(/\+(\d)$/)
    if (weaponMatch && (lowerName.includes('arme') || lowerName.includes('epee') || lowerName.includes('dague') || lowerName.includes('hache') || lowerName.includes('marteau') || lowerName.includes('masse') || lowerName.includes('arc') || lowerName.includes('arbalet') || lowerName.includes('fléau') || lowerName.includes('cimeterre') || lowerName.includes('hallebarde') || lowerName.includes('coutille') || lowerName.includes('lance') || lowerName.includes('trident') || lowerName.includes('fouet') || lowerName.includes('gourdin') || lowerName.includes('maillet') || lowerName.includes('pique'))) {
        const bonus = parseInt(weaponMatch[1])
        bonuses.attackBonus = bonus
        bonuses.damageBonus = bonus
        return bonuses
    }

    // Bouclier +1, +2, +3
    if (lowerName.includes('bouclier') && lowerName.match(/\+(\d)$/)) {
        const bonus = parseInt(lowerName.match(/\+(\d)$/)![1])
        bonuses.armorClass = 2
        bonuses.armorCategory = 'shield'
        bonuses.addDex = false
        bonuses.acBonus = bonus
        return bonuses
    }

    // Armure +1, +2, +3
    if (lowerName.match(/\+(\d)$/) && (lowerName.includes('armure') || lowerName.includes('cotte') || lowerName.includes('harnois') || lowerName.includes('demi-plate') || lowerName.includes('plate') || lowerName.includes('maille') || lowerName.includes('cuir') || lowerName.includes('ecaille'))) {
        const bonus = parseInt(lowerName.match(/\+(\d)$/)![1])
        bonuses.acBonus = bonus
        return bonuses
    }

    // Ceinture de Force des Géants
    if (lowerName.includes('force') && lowerName.includes('geant')) {
        const strValues: Record<string, number> = {
            'collines': 21, 'pierre': 23, 'gel': 25, 'feu': 27, 'nuages': 29, 'tempetes': 31, 'tempête': 31,
        }
        for (const [key, val] of Object.entries(strValues)) {
            if (lowerName.includes(key)) {
                bonuses.abilitySetTo = { str: val }
                return bonuses
            }
        }
    }

    // Gantelets de Puissance d'Ogre / d'Ogre
    if (lowerName.includes('gantelet') && lowerName.includes('ogre')) {
        bonuses.abilitySetTo = { str: 19 }
    }

    // Bandeau d'Intellect
    if (lowerName.includes('bandeau') && lowerName.includes('intellect')) {
        bonuses.abilitySetTo = { int: 19 }
    }

    // Amulette de bonne santé (CON 19)
    if (lowerName.includes('amulette') && lowerName.includes('bonne sante')) {
        bonuses.abilitySetTo = { con: 19 }
    }

    // Cape de Charisme
    if (lowerName.includes('cape') && lowerName.includes('charisme')) {
        bonuses.abilitySetTo = { cha: 19 }
    }

    // Anneau/Cape de Protection
    if ((lowerName.includes('anneau') || lowerName.includes('cape')) && lowerName.includes('protection')) {
        if (lowerName.includes('+2')) {
            bonuses.acBonus = 2
            bonuses.saveBonus = 2
        } else if (lowerName.includes('+3')) {
            bonuses.acBonus = 3
            bonuses.saveBonus = 3
        } else {
            bonuses.acBonus = 1
            bonuses.saveBonus = 1
        }
    }

    // Baguette du Maître de Guerre
    if (lowerName.includes('maitre de guerre') || lowerName.includes('maître de guerre')) {
        if (lowerName.includes('+2')) {
            bonuses.spellAttackBonus = 2
            bonuses.spellSaveDCBonus = 2
        } else if (lowerName.includes('+3')) {
            bonuses.spellAttackBonus = 3
            bonuses.spellSaveDCBonus = 3
        } else {
            bonuses.spellAttackBonus = 1
            bonuses.spellSaveDCBonus = 1
        }
    }

    // Bâton du Pacte
    if (lowerName.includes('baton du pacte') || lowerName.includes('bâton du pacte') || lowerName.includes('rod of the pact keeper') || (lowerName.includes('pacte') && lowerName.includes('occult'))) {
        if (lowerName.includes('+2')) {
            bonuses.spellAttackBonus = 2
            bonuses.spellSaveDCBonus = 2
        } else if (lowerName.includes('+3')) {
            bonuses.spellAttackBonus = 3
            bonuses.spellSaveDCBonus = 3
        } else {
            bonuses.spellAttackBonus = 1
            bonuses.spellSaveDCBonus = 1
        }
    }

    // Bottes de vitesse / elfiques / etc.
    if (lowerName.includes('bottes') && (lowerName.includes('vitesse') || lowerName.includes('elfique') || lowerName.includes('enjambe'))) {
        bonuses.speedBonus = 3
    }

    // Lame Flamboyante
    if (lowerName.includes('lame flamboyante') || lowerName.includes('flame tongue')) {
        bonuses.damageExtra = '2d6 feu'
    }

    // Marque de Givre
    if (lowerName.includes('marque de givre') || lowerName.includes('frost brand')) {
        bonuses.damageExtra = '1d6 froid'
    }

    // Description parsing: Constitution passe à N
    const conMatch = lowerDesc.match(/constitution\s+passe?\s+à\s+(\d+)/)
    if (conMatch) {
        bonuses.abilitySetTo = { ...bonuses.abilitySetTo, con: parseInt(conMatch[1]) }
    }
    const strMatch = lowerDesc.match(/force\s+passe?\s+à\s+(\d+)/)
    if (strMatch) {
        bonuses.abilitySetTo = { ...bonuses.abilitySetTo, str: parseInt(strMatch[1]) }
    }
    const dexMatch = lowerDesc.match(/dext[eé]rit[eé]\s+passe?\s+à\s+(\d+)/)
    if (dexMatch) {
        bonuses.abilitySetTo = { ...bonuses.abilitySetTo, dex: parseInt(dexMatch[1]) }
    }
    const intMatch = lowerDesc.match(/intelligence\s+passe?\s+à\s+(\d+)/)
    if (intMatch) {
        bonuses.abilitySetTo = { ...bonuses.abilitySetTo, int: parseInt(intMatch[1]) }
    }
    const wisMatch = lowerDesc.match(/sagesse\s+passe?\s+à\s+(\d+)/)
    if (wisMatch) {
        bonuses.abilitySetTo = { ...bonuses.abilitySetTo, wis: parseInt(wisMatch[1]) }
    }
    const chaMatch = lowerDesc.match(/charisme\s+passe?\s+à\s+(\d+)/)
    if (chaMatch) {
        bonuses.abilitySetTo = { ...bonuses.abilitySetTo, cha: parseInt(chaMatch[1]) }
    }

    // +N CA
    const acBonusMatch = lowerDesc.match(/[+]\d\s+(?:à la ca|bonus.*ca|classe d'armure|armor class)/)
    if (acBonusMatch) {
        const num = parseInt(acBonusMatch[0].match(/\d/)![0])
        if (!bonuses.acBonus) bonuses.acBonus = num
    }

    // +N JDS
    const saveMatch = lowerDesc.match(/([+])\d\s+(?:jet de sauvegarde|jds|saving throw)/)
    if (saveMatch) {
        bonuses.saveBonus = parseInt(saveMatch[0].match(/\d/)![0])
    }

    // +N attaque de sort / DD
    const spellAtkMatch = lowerDesc.match(/[+](\d)\s+(?:jet d'attaque de sort|sort.*attaque)/)
    if (spellAtkMatch) {
        bonuses.spellAttackBonus = parseInt(spellAtkMatch[1])
    }
    const spellDCMatch = lowerDesc.match(/[+](\d)\s+(?:dd.*sauvegarde.*sort|save dc|difficulty class)/)
    if (spellDCMatch) {
        bonuses.spellSaveDCBonus = parseInt(spellDCMatch[1])
    }

    return bonuses
}

export function convertTrameItemToInventory(item: TrameMagicItem): Omit<InventoryItem, 'id'> {
    const parsed = parseBonuses(item.name, item.description)
    const itemType = resolveType(item.type)

    const result: Omit<InventoryItem, 'id'> = {
        name: item.name,
        type: itemType,
        quantity: 1,
        weight: 0,
        equipped: false,
        magical: true,
        rarity: resolveRarity(item.rarity),
        attunement: item.attunement || false,
        description: item.description,
    }

    // Extraire le nom de l'arme de base depuis le type (ex: "Arme (marteau de guerre)" → "marteau de guerre")
    const typeMatch = item.type.match(/\(([^)]+)\)/)
    const baseName = typeMatch ? typeMatch[1].trim() : null
    const baseWeapon = baseName ? findBaseWeaponByName(baseName) : undefined

    if (itemType === 'weapon' && baseWeapon) {
        result.damage = baseWeapon.damage
        result.damageType = baseWeapon.damageType
        if (baseWeapon.properties) {
            result.properties = [...baseWeapon.properties]
        }
        if (baseWeapon.versatileDamage) {
            result.versatileDamage = baseWeapon.versatileDamage
        }
        if (baseWeapon.range) {
            result.range = baseWeapon.range
        }
    }

    if (parsed.attackBonus) result.attackBonus = parsed.attackBonus
    if (parsed.damageBonus) result.damageBonus = parsed.damageBonus
    if (parsed.acBonus) result.acBonus = parsed.acBonus
    if (parsed.abilityBonus) result.abilityBonus = parsed.abilityBonus
    if (parsed.abilitySetTo) result.abilitySetTo = parsed.abilitySetTo
    if (parsed.saveBonus) result.saveBonus = parsed.saveBonus
    if (parsed.spellAttackBonus) result.spellAttackBonus = parsed.spellAttackBonus
    if (parsed.spellSaveDCBonus) result.spellSaveDCBonus = parsed.spellSaveDCBonus
    if (parsed.speedBonus) result.speedBonus = parsed.speedBonus
    if (parsed.damageExtra) result.damageExtra = parsed.damageExtra
    if (parsed.armorClass) result.armorClass = parsed.armorClass
    if (parsed.armorCategory) result.armorCategory = parsed.armorCategory
    if (parsed.addDex !== undefined) result.addDex = parsed.addDex
    if (parsed.maxDex !== undefined) result.maxDex = parsed.maxDex
    if (parsed.stealthDisadvantage !== undefined) result.stealthDisadvantage = parsed.stealthDisadvantage
    if (parsed.charges) result.charges = parsed.charges
    if (parsed.maxCharges) result.maxCharges = parsed.maxCharges
    if (parsed.chargesRecovery) result.chargesRecovery = parsed.chargesRecovery

    // Equip weapons and armor by default
    if (result.type === 'weapon' || result.type === 'armor') {
        result.equipped = true
    }

    return result
}