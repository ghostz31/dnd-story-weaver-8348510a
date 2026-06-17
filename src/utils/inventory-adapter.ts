/**
 * Adapter: convert InventoryItem (flat, explicit bonuses) to ItemV2 (nested, rule-based).
 * 
 * InventoryItem has fields like attackBonus, damageBonus, armorClass as flat numbers.
 * ItemV2 expects nested structures like damage.dice, armorClass.base, weaponProperties[].
 */

import type { InventoryItem } from '../types/inventory'
import type { ItemV2, WeaponProperty, DamageInfo, ArmorClassInfo } from '../types/aurora-v2'
import { getMagicItemByName } from '../data/aurora-loader'
import { weapons as baseWeapons } from '../data/equipment'

const RARITY_MAP: Record<string, ItemV2['rarity']> = {
  'common': 'common',
  'uncommon': 'uncommon',
  'rare': 'rare',
  'very rare': 'very-rare',
  'veryrare': 'very-rare',
  'legendary': 'legendary',
  'artifact': 'artifact',
}

const TYPE_MAP: Record<string, ItemV2['type']> = {
  'weapon': 'weapon',
  'armor': 'armor',
  'gear': 'equipment',
  'consumable': 'consumable',
  'wondrous': 'magic-item',
  'tool': 'tool',
  'questItem': 'equipment',
  'other': 'equipment',
}

function parseRange(range: InventoryItem['range']): { normal: number; long?: number } | undefined {
  if (!range) return undefined
  if (typeof range === 'object') return { normal: range.normal, long: range.long }
  
  const match = range.match(/(\d+)(?:\/(\d+))?/)
  if (match) {
    return {
      normal: parseInt(match[1], 10),
      long: match[2] ? parseInt(match[2], 10) : undefined,
    }
  }
  return undefined
}

function buildMagicName(item: InventoryItem): string {
  let name = item.name
  if (item.magical && !name.includes('+')) {
    const bonus = item.attackBonus || item.damageBonus || 0
    if (bonus > 0) {
      name = `${name} +${bonus}`
    }
  }
  return name
}

const WEAPON_KEYWORDS = ['arc', 'épée', 'dague', 'hache', 'masse', 'bâton', 'lance', 'marteau', 'gourdin', 'couteau', 'faux', 'fleau', 'javelot', 'sarbacane', 'fronde', 'arbalète', 'arbalete', 'trident', 'cimeterre', 'rapière', 'epee', 'dague', 'hache', 'masse', 'baton', 'lance', 'marteau', 'gourdin', 'couteau', 'faux', 'fleau', 'javelot', 'sarbacane', 'fronde', 'arbalete', 'trident', 'cimeterre', 'rapiere', 'serment', 'feu', 'froid', 'foudre', 'acide', 'poison']

function nameLooksLikeWeapon(name: string): boolean {
  const lower = name.toLowerCase()
  return WEAPON_KEYWORDS.some(k => lower.includes(k))
}

function findBaseWeapon(name: string) {
  const lower = name.toLowerCase()
  return baseWeapons.find(w =>
    w.name.toLowerCase() === lower ||
    lower.includes(w.name.toLowerCase()) ||
    w.name.toLowerCase().includes(lower)
  )
}

export async function inventoryItemToItemV2(item: InventoryItem): Promise<ItemV2> {
  // Recherche dans la base de données des objets magiques
  const magicItem = await getMagicItemByName(item.name)
  if (magicItem) {
    console.log(`[Adapter] Found magic item DB entry for "${item.name}": type=${magicItem.type}, damage=${magicItem.damage}`)
  }

  // Chercher l'arme de base dans le catalogue si pas de dégâts
  let baseWeapon = !item.damage ? findBaseWeapon(item.name) : undefined
  // Si l'objet magique a un type comme "Arme (marteau de guerre)", extraire le nom de base
  if (!baseWeapon && magicItem?.type) {
    const typeMatch = magicItem.type.match(/\(([^)]+)\)/)
    if (typeMatch) {
      baseWeapon = findBaseWeapon(typeMatch[1].trim())
      if (baseWeapon) {
        console.log(`[Adapter] Extracted base weapon "${typeMatch[1].trim()}" from magic item type "${magicItem.type}"`)
      }
    }
  }
  if (baseWeapon) {
    console.log(`[Adapter] Found base weapon catalog for "${item.name}": damage=${baseWeapon.damage}, type=${baseWeapon.damageType}`)
  }

  const base: ItemV2 = {
    id: item.id,
    name: buildMagicName(item),
    nameEn: item.name,
    source: 'inventory',
    type: TYPE_MAP[item.type] || 'equipment',
    weight: item.weight || undefined,
    rarity: item.rarity ? RARITY_MAP[item.rarity.toLowerCase()] : undefined,
    attunement: item.attunement || false,
    description: item.description,
  }

  // Si la DB magique connait cet objet et dit que c'est une arme, forcer le type weapon
  const dbSaysWeapon = magicItem?.type === 'weapon' || magicItem?.type.toLowerCase().startsWith('arme')
  const dbSaysArmor = magicItem?.type === 'armor' || magicItem?.type.toLowerCase().startsWith('armure')

  // Détecter les armes (y compris les armes magiques classées comme wondrous/gear/other)
  const hasDamage = !!(magicItem?.damage || baseWeapon?.damage || (item.damage && item.damage !== '' && item.damage !== '0'))
  const isWeapon =
    item.type === 'weapon' ||
    item.category === 'weapon' ||
    dbSaysWeapon ||
    baseWeapon !== undefined ||
    (hasDamage && (
      item.type === 'wondrous' ||
      item.type === 'gear' ||
      item.type === 'other' ||
      item.type === 'questItem' ||
      (item.magical && (item.attackBonus || item.properties?.some(p => ['finesse','light','heavy','two-handed','versatile','reach','thrown','ammunition','loading'].includes(p))))
    )) ||
    (hasDamage && nameLooksLikeWeapon(item.name))

  if (isWeapon && hasDamage) {
    // Utiliser les stats de la DB magique si disponibles, sinon celles de l'item, sinon le catalogue de base
    const damageDice = (magicItem?.damage && magicItem.damage !== 'varies')
      ? magicItem.damage
      : (item.damage || baseWeapon?.damage)!
    const damageType = (magicItem?.damageType && magicItem.damageType !== 'varies')
      ? magicItem.damageType
      : (item.damageType || baseWeapon?.damageType) || 'slashing'
    const props = magicItem?.properties || item.properties || (baseWeapon?.properties as string[]) || []
    const attackBonus = magicItem?.attackBonus ?? item.attackBonus ?? 0
    const damageBonus = magicItem?.damageBonus ?? item.damageBonus ?? 0
    const weaponRange = magicItem?.range || baseWeapon?.range || parseRange(item.range)
    const weaponVersatile = magicItem?.versatileDamage || baseWeapon?.versatileDamage || item.versatileDamage

    const damageInfo: DamageInfo = {
      dice: damageDice,
      type: damageType as DamageInfo['type'],
    }
    if (damageBonus > 0) {
      damageInfo.bonus = damageBonus
    }

    const weaponProps: ItemV2 & { weaponProperties: WeaponProperty[] } = {
      ...base,
      type: 'weapon',
      damage: damageInfo,
      weaponProperties: props as WeaponProperty[],
      range: weaponRange,
      versatile: weaponVersatile
        ? { dice: weaponVersatile, type: damageType as DamageInfo['type'] }
        : undefined,
    }

    // Si la DB a un bonus d'attaque mais l'item ne l'a pas, on l'ajoute dans le nom pour que extractMagicBonus le détecte
    if (attackBonus > 0 && !weaponProps.name.includes('+')) {
      weaponProps.name = `${weaponProps.name} +${attackBonus}`
    }

    const charges = magicItem?.charges ?? item.charges
    const maxCharges = magicItem?.maxCharges ?? item.maxCharges
    if (charges !== undefined) {
      weaponProps.charges = {
        max: maxCharges || charges,
        recovery: magicItem?.chargesRecovery || item.chargesRecovery,
      }
    }

    return weaponProps
  }

  if (item.type === 'armor' || item.armorCategory || dbSaysArmor) {
    const acInfo: ArmorClassInfo = {
      base: magicItem?.armorClass ?? item.armorClass ?? 0,
      addDex: magicItem?.addDex ?? item.addDex,
      dexMax: magicItem?.maxDex ?? item.maxDex,
    }

    if ((magicItem?.armorCategory || item.armorCategory) === 'shield') {
      return {
        ...base,
        type: 'armor',
        armorClass: acInfo,
        armorCategory: 'shield',
      }
    }

    return {
      ...base,
      type: 'armor',
      armorClass: acInfo,
      armorCategory: (magicItem?.armorCategory || item.armorCategory) as ArmorClassInfo['base'] extends number ? 'light' | 'medium' | 'heavy' : never,
      stealthDisadvantage: magicItem?.stealthDisadvantage ?? item.stealthDisadvantage,
    }
  }

  if (item.magical || item.rarity) {
    return {
      ...base,
      type: 'magic-item',
      rules: item.specialAbilities?.map(ab => ({
        type: 'grant' as const,
        targetType: 'feature' as const,
        targetId: ab.name,
      })) || [],
    }
  }

  return base
}

export async function getEquippedItemsAsItemV2(items: InventoryItem[]): Promise<ItemV2[]> {
  const equipped = items.filter(item => item.equipped)
  const filtered = equipped.filter(item => {
    // Only skip if explicitly not attuned (attuned === false).
    // attuned === undefined means "not set yet" — allow through so user can attune via UI.
    if (item.attunement === true && item.attuned === false) {
      console.log(`[Adapter] ${item.name} SKIPPED (requires attunement, attuned=false)`)
      return false
    }
    return true
  })

  console.log(`[Adapter] Inventory: ${items.length} total, ${equipped.length} equipped, ${filtered.length} after attunement filter`)
  equipped.forEach(i => {
    console.log(`[Adapter] Equipped: "${i.name}" type=${i.type} cat=${i.category} damage=${i.damage} attunement=${i.attunement} attuned=${i.attuned} magical=${i.magical}`)
  })

  return Promise.all(filtered.map(inventoryItemToItemV2))
}
