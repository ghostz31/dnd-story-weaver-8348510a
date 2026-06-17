/**
 * Chargeur de données Aurora V2
 * Fournit un accès unifié aux données SRD au format Aurora
 */

import type { RaceV2, ClassV2, SpellV2 } from '../types/aurora-v2'

// Cache des données chargées
let racesCache: { races: RaceV2[]; traits: Record<string, any> } | null = null
let classesCache: { classes: ClassV2[] } | null = null
let spellsCache: { spells: SpellV2[] } | null = null

/**
 * Charge les données des races
 */
export async function loadRaces(): Promise<{ races: RaceV2[]; traits: Record<string, any> }> {
  if (racesCache) return racesCache
  
  try {
    const response = await fetch('/data/aurora/races.json')
    if (!response.ok) throw new Error('Failed to load races')
    
    const data = await response.json()
    racesCache = {
      races: data.races || [],
      traits: data.traits || {}
    }
    
    return racesCache
  } catch (error) {
    console.error('Error loading races:', error)
    return { races: [], traits: {} }
  }
}

/**
 * Charge les données des classes
 */
export async function loadClasses(): Promise<{ classes: ClassV2[] }> {
  if (classesCache) return classesCache
  
  try {
    const response = await fetch('/data/aurora/classes.json')
    if (!response.ok) throw new Error('Failed to load classes')
    
    const data = await response.json()
    classesCache = { classes: data.classes || [] }
    
    return classesCache
  } catch (error) {
    console.error('Error loading classes:', error)
    return { classes: [] }
  }
}

/**
 * Charge les données des sorts
 */
export async function loadSpells(): Promise<{ spells: SpellV2[] }> {
  if (spellsCache) return spellsCache
  
  try {
    const response = await fetch('/data/aurora/spells.json')
    if (!response.ok) throw new Error('Failed to load spells')
    
    const data = await response.json()
    spellsCache = { spells: data.spells || [] }
    
    return spellsCache
  } catch (error) {
    console.error('Error loading spells:', error)
    return { spells: [] }
  }
}

/**
 * Récupère une race par son ID Aurora
 */
export async function getRaceById(id: string): Promise<RaceV2 | undefined> {
  const { races } = await loadRaces()
  return races.find(r => r.id === id)
}

/**
 * Récupère une classe par son ID Aurora
 */
export async function getClassById(id: string): Promise<ClassV2 | undefined> {
  const { classes } = await loadClasses()
  return classes.find(c => c.id === id)
}

/**
 * Récupère un trait racial par son ID
 */
export async function getRacialTraitById(id: string): Promise<any | undefined> {
  const { traits } = await loadRaces()
  return traits[id]
}

/**
 * Récupère les capacités de classe pour un niveau donné
 */
export async function getClassFeatures(classId: string, level: number): Promise<any[]> {
  const characterClass = await getClassById(classId)
  if (!characterClass || !characterClass.features) return []
  
  const features: any[] = []
  for (let i = 1; i <= level; i++) {
    const levelFeatures = characterClass.features[i]
    if (levelFeatures) {
      features.push(...levelFeatures)
    }
  }
  
  return features
}

/**
 * Récupère les sous-classes d'une classe
 */
export async function getSubclasses(classId: string): Promise<any[]> {
  const characterClass = await getClassById(classId)
  return characterClass?.subclasses || []
}

/**
 * Récupère une sous-classe par son ID
 */
export async function getSubclassById(classId: string, subclassId: string): Promise<any | undefined> {
  const subclasses = await getSubclasses(classId)
  return subclasses.find(s => s.id === subclassId)
}

/**
 * Convertit un ID Aurora au format de l'ancien système
 * Ex: ID_PHB_CLASS_BARBARIAN -> barbarian
 */
export function auroraIdToOldId(auroraId: string): string {
  const idMap: Record<string, string> = {
    'ID_PHB_CLASS_BARBARIAN': 'barbarian',
    'ID_PHB_CLASS_BARD': 'bard',
    'ID_PHB_CLASS_CLERIC': 'cleric',
    'ID_PHB_CLASS_DRUID': 'druid',
    'ID_PHB_CLASS_FIGHTER': 'fighter',
    'ID_PHB_CLASS_MONK': 'monk',
    'ID_PHB_CLASS_PALADIN': 'paladin',
    'ID_PHB_CLASS_RANGER': 'ranger',
    'ID_PHB_CLASS_ROGUE': 'rogue',
    'ID_PHB_CLASS_SORCERER': 'sorcerer',
    'ID_PHB_CLASS_WARLOCK': 'warlock',
    'ID_PHB_CLASS_WIZARD': 'wizard',
    
    'ID_PHB_RACE_HUMAN': 'human',
    'ID_PHB_RACE_ELF': 'elf',
    'ID_PHB_RACE_DWARF': 'dwarf',
    'ID_PHB_RACE_HALFLING': 'halfling',
    'ID_PHB_RACE_DRAGONBORN': 'dragonborn',
    'ID_PHB_RACE_GNOME': 'gnome',
    'ID_PHB_RACE_HALF_ELF': 'half-elf',
    'ID_PHB_RACE_HALF_ORC': 'half-orc',
    'ID_PHB_RACE_TIEFLING': 'tiefling',
  }
  
  return idMap[auroraId] || auroraId.toLowerCase().replace(/id_phb_(class|race|subclass|subrace)_/g, '')
}

/**
 * Convertit un ID de l'ancien système vers Aurora
 * Ex: barbarian -> ID_PHB_CLASS_BARBARIAN
 */
export function oldIdToAuroraId(oldId: string, _type: 'class' | 'race' = 'class'): string | undefined {
  const reverseMap: Record<string, string> = {
    'barbarian': 'ID_PHB_CLASS_BARBARIAN',
    'bard': 'ID_PHB_CLASS_BARD',
    'cleric': 'ID_PHB_CLASS_CLERIC',
    'druid': 'ID_PHB_CLASS_DRUID',
    'fighter': 'ID_PHB_CLASS_FIGHTER',
    'monk': 'ID_PHB_CLASS_MONK',
    'paladin': 'ID_PHB_CLASS_PALADIN',
    'ranger': 'ID_PHB_CLASS_RANGER',
    'rogue': 'ID_PHB_CLASS_ROGUE',
    'sorcerer': 'ID_PHB_CLASS_SORCERER',
    'warlock': 'ID_PHB_CLASS_WARLOCK',
    'wizard': 'ID_PHB_CLASS_WIZARD',
    
    'human': 'ID_PHB_RACE_HUMAN',
    'elf': 'ID_PHB_RACE_ELF',
    'dwarf': 'ID_PHB_RACE_DWARF',
    'halfling': 'ID_PHB_RACE_HALFLING',
    'dragonborn': 'ID_PHB_RACE_DRAGONBORN',
    'gnome': 'ID_PHB_RACE_GNOME',
    'half-elf': 'ID_PHB_RACE_HALF_ELF',
    'half-orc': 'ID_PHB_RACE_HALF_ORC',
    'tiefling': 'ID_PHB_RACE_TIEFLING',
  }
  
  return reverseMap[oldId]
}

// ============================================================================
// CHARGEMENT ÉQUIPMENT, DONS ET BACKGROUNDS
// ============================================================================

let equipmentCache: { weapons: any[]; armor: any[]; adventuringGear: any[]; equipmentPacks: any[] } | null = null
let featsCache: { feats: any[] } | null = null
let backgroundsCache: { backgrounds: any[] } | null = null
let magicItemsCache: { items: Record<string, MagicItemData> } | null = null

export interface MagicItemData {
  name: string
  type: 'weapon' | 'armor' | 'wondrous'
  rarity: string
  attunement: boolean
  attunementDetails?: string
  description: string
  damage?: string
  damageType?: string
  properties?: string[]
  range?: { normal: number; long?: number }
  versatileDamage?: string
  attackBonus?: number
  damageBonus?: number
  damageExtra?: string
  armorClass?: number
  armorCategory?: string
  acBonus?: number
  addDex?: boolean
  maxDex?: number
  stealthDisadvantage?: boolean
  abilitySetTo?: Record<string, number>
  saveBonus?: number
  spellAttackBonus?: number
  spellSaveDCBonus?: number
  speedBonus?: number
  charges?: number
  maxCharges?: number
  chargesRecovery?: string
  weight: number
  source: string
}

/**
 * Charge les données d'équipement
 */
export async function loadEquipment(): Promise<{ weapons: any[]; armor: any[]; adventuringGear: any[]; equipmentPacks: any[] }> {
  if (equipmentCache) return equipmentCache
  
  try {
    const response = await fetch('/data/aurora/equipment.json')
    if (!response.ok) throw new Error('Failed to load equipment')
    
    const data = await response.json()
    equipmentCache = {
      weapons: data.weapons || [],
      armor: data.armor || [],
      adventuringGear: data.adventuringGear || [],
      equipmentPacks: data.equipmentPacks || []
    }
    
    return equipmentCache
  } catch (error) {
    console.error('Error loading equipment:', error)
    return { weapons: [], armor: [], adventuringGear: [], equipmentPacks: [] }
  }
}

/**
 * Charge la base de données des objets magiques
 */
export async function loadMagicItems(): Promise<{ items: Record<string, MagicItemData> }> {
  if (magicItemsCache) return magicItemsCache

  try {
    const response = await fetch('/data/aurora/magic-items.json')
    if (!response.ok) throw new Error('Failed to load magic items')

    const data = await response.json()
    magicItemsCache = { items: data.items || {} }

    return magicItemsCache
  } catch (error) {
    console.error('Error loading magic items:', error)
    return { items: {} }
  }
}

/**
 * Cherche un objet magique par son nom (insensible à la casse et aux accents)
 */
export async function getMagicItemByName(name: string): Promise<MagicItemData | undefined> {
  const { items } = await loadMagicItems()
  const normalizedName = normalizeItemName(name)

  // Construire un index normalisé à la volée si pas déjà fait
  const normalizedEntries = Object.entries(items).map(([key, value]) => ({
    key: normalizeItemName(key),
    originalKey: key,
    value: value as MagicItemData,
  }))

  // Recherche exacte sur clé normalisée
  const exactMatch = normalizedEntries.find(e => e.key === normalizedName)
  if (exactMatch) {
    return exactMatch.value
  }

  // Recherche partielle
  for (const entry of normalizedEntries) {
    if (normalizedName.includes(entry.key) || entry.key.includes(normalizedName)) {
      return entry.value
    }
  }

  return undefined
}

function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Charge les données des dons
 */
export async function loadFeats(): Promise<{ feats: any[] }> {
  if (featsCache) return featsCache
  
  try {
    const response = await fetch('/data/aurora/feats.json')
    if (!response.ok) throw new Error('Failed to load feats')
    
    const data = await response.json()
    featsCache = { feats: data.feats || [] }
    
    return featsCache
  } catch (error) {
    console.error('Error loading feats:', error)
    return { feats: [] }
  }
}

/**
 * Charge les données des backgrounds
 */
export async function loadBackgrounds(): Promise<{ backgrounds: any[] }> {
  if (backgroundsCache) return backgroundsCache
  
  try {
    const response = await fetch('/data/aurora/backgrounds.json')
    if (!response.ok) throw new Error('Failed to load backgrounds')
    
    const data = await response.json()
    backgroundsCache = { backgrounds: data.backgrounds || [] }
    
    return backgroundsCache
  } catch (error) {
    console.error('Error loading backgrounds:', error)
    return { backgrounds: [] }
  }
}

/**
 * Récupère une arme par ID
 */
export async function getWeaponById(id: string): Promise<any | undefined> {
  const { weapons } = await loadEquipment()
  return weapons.find(w => w.id === id)
}

/**
 * Récupère une armure par ID
 */
export async function getArmorById(id: string): Promise<any | undefined> {
  const { armor } = await loadEquipment()
  return armor.find(a => a.id === id)
}

/**
 * Récupère un don par ID
 */
export async function getFeatById(id: string): Promise<any | undefined> {
  const { feats } = await loadFeats()
  return feats.find(f => f.id === id)
}

/**
 * Récupère un background par ID
 */
export async function getBackgroundById(id: string): Promise<any | undefined> {
  const { backgrounds } = await loadBackgrounds()
  return backgrounds.find(b => b.id === id)
}

/**
 * Précharge toutes les données Aurora (à appeler au démarrage)
 */
export async function preloadAuroraData(): Promise<void> {
  console.log('🔄 Préchargement des données Aurora V2...')
  
  await Promise.all([
    loadRaces(),
    loadClasses(),
    loadSpells(),
    loadEquipment(),
    loadFeats(),
    loadBackgrounds()
  ])
  
  console.log('✅ Données Aurora V2 préchargées')
}

/**
 * Vide le cache (utile pour le développement)
 */
export function clearAuroraCache(): void {
  racesCache = null
  classesCache = null
  spellsCache = null
  equipmentCache = null
  featsCache = null
  backgroundsCache = null
}
