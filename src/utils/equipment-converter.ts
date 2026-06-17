/**
 * Convertisseur d'équipement Aurora V2 → InventoryItem
 * Utilitaires pour charger et transformer l'équipement de départ
 */

import type { InventoryItem } from '../types/inventory'

export interface AuroraWeapon {
  id: string
  name: string
  nameEn: string
  type: string
  damage: string
  damageType: string
  properties: string[]
  weight: number
  cost: number
  range?: { normal: number; long: number }
  versatileDamage?: string
}

export interface AuroraArmor {
  id: string
  name: string
  nameEn: string
  type: 'light' | 'medium' | 'heavy' | 'shield'
  ac: number
  maxDex?: number | null
  strengthReq?: number
  stealthDisadvantage: boolean
  weight: number
  cost: number
}

export interface AuroraGear {
  id: string
  name: string
  nameEn: string
  weight: number
  cost: number
}

export interface AuroraPack {
  id: string
  name: string
  nameEn: string
  weight: number
  cost: number
}

export interface AuroraEquipment {
  version: string
  source: string
  count: number
  weapons: AuroraWeapon[]
  armor: AuroraArmor[]
  adventuringGear: AuroraGear[]
  equipmentPacks: AuroraPack[]
}

let equipmentCache: AuroraEquipment | null = null

export async function loadAuroraEquipment(): Promise<AuroraEquipment> {
  if (equipmentCache) return equipmentCache
  const res = await fetch('/data/aurora/equipment.json')
  if (!res.ok) throw new Error('Failed to load equipment')
  equipmentCache = await res.json()
  return equipmentCache!
}

export function findAuroraItem(
  id: string,
  data: AuroraEquipment
): AuroraWeapon | AuroraArmor | AuroraGear | AuroraPack | undefined {
  return (
    data.weapons.find(w => w.id === id) ??
    data.armor.find(a => a.id === id) ??
    data.adventuringGear.find(g => g.id === id) ??
    data.equipmentPacks.find(p => p.id === id)
  )
}

export function auroraItemToInventoryItem(
  item: AuroraWeapon | AuroraArmor | AuroraGear | AuroraPack,
  quantity = 1
): InventoryItem {
  if ('damage' in item) {
    // Weapon
    const weapon = item as AuroraWeapon
    return {
      id: weapon.id,
      name: weapon.name,
      type: 'weapon',
      quantity,
      weight: weapon.weight,
      equipped: false,
      magical: false,
      value: weapon.cost / 100, // cost is in copper pieces
      damage: weapon.damage,
      damageType: weapon.damageType,
      properties: weapon.properties,
      range: weapon.range,
      versatileDamage: weapon.versatileDamage,
    }
  }

  if ('ac' in item) {
    // Armor
    const armor = item as AuroraArmor
    return {
      id: armor.id,
      name: armor.name,
      type: 'armor',
      quantity,
      weight: armor.weight,
      equipped: armor.type !== 'shield', // armor auto-equips, shield too for now
      magical: false,
      value: armor.cost / 100,
      armorClass: armor.ac,
      armorCategory: armor.type,
      addDex: armor.type === 'light' || (armor.type === 'medium' && armor.maxDex !== 0),
      maxDex: armor.maxDex ?? undefined,
      stealthDisadvantage: armor.stealthDisadvantage,
    }
  }

  // Gear or Pack
  const gear = item as AuroraGear | AuroraPack
  return {
    id: gear.id,
    name: gear.name,
    type: 'gear',
    quantity,
    weight: gear.weight,
    equipped: false,
    magical: false,
    value: gear.cost / 100,
  }
}

export function getGenericWeaponOptions(
  selectorId: string,
  data: AuroraEquipment
): AuroraWeapon[] {
  const all = data.weapons
  switch (selectorId) {
    case 'ID_WEAPON_ANY_SIMPLE':
      return all.filter(w => w.type.startsWith('simple'))
    case 'ID_WEAPON_ANY_MARTIAL':
      return all.filter(w => w.type.startsWith('martial'))
    case 'ID_WEAPON_ANY_MELEE_SIMPLE':
      return all.filter(w => w.type === 'simple-melee')
    case 'ID_WEAPON_ANY_RANGED_SIMPLE':
      return all.filter(w => w.type === 'simple-ranged')
    default:
      return []
  }
}

export function isGenericSelector(id: string): boolean {
  return id.startsWith('ID_WEAPON_ANY_')
}
