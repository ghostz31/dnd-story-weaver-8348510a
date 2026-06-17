/**
 * Parser de l'équipement Aurora XML → JSON
 */

interface ItemV2 {
  id: string
  name: string
  nameEn: string
  source: string
  type: 'weapon' | 'armor' | 'equipment' | 'tool' | 'consumable'
  
  // Commun
  cost?: {
    amount: number
    unit: 'cp' | 'sp' | 'gp' | 'pp'
  }
  weight?: number
  description?: string
  
  // Armes
  weaponProperties?: WeaponProperty[]
  damage?: {
    dice: string
    type: string
  }
  versatile?: string // Ex: "1d10" pour épée longue
  ammunition?: string
  range?: {
    normal: number
    long?: number
  }
  
  // Armures
  armorClass?: {
    base: number
    dexMax?: number // Max bonus DEX (ex: 2 pour armure de cuir clouté)
    addDex?: boolean
  }
  strengthRequirement?: number
  stealthDisadvantage?: boolean
  armorCategory?: 'light' | 'medium' | 'heavy' | 'shield'
}

type WeaponProperty = 
  | 'ammunition'
  | 'finesse'
  | 'heavy'
  | 'light'
  | 'loading'
  | 'range'
  | 'reach'
  | 'special'
  | 'thrown'
  | 'two-handed'
  | 'versatile'

/**
 * Parse l'équipement depuis XML Aurora
 * TODO : Implémenter le parsing complet
 */
export function parseItems(xmlContent: string): ItemV2[] {
  console.log('Parsing items... (TODO: implémentation complète)')
  
  // Pour l'instant, retourner un tableau vide
  return []
}

export { parseItems }
export type { ItemV2 }
