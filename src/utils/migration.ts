/**
 * Système de Migration - Compatibilité descendante
 * 
 * Convertit les personnages existants (format V1) vers le nouveau format V2
 * sans perte de données
 * 
 * NOTE: Ceci est une version stub. L'implémentation complète
 * de la migration nécessite plus de travail.
 */

import type { Character as CharacterV1 } from '../types/character'

// ============================================================================
// TYPES DE MIGRATION
// ============================================================================

export interface MigrationResult {
  success: boolean
  character: CharacterV1
  changes: MigrationChange[]
  warnings: MigrationWarning[]
  version: string
}

export interface MigrationChange {
  type: 'added' | 'modified' | 'removed' | 'converted'
  field: string
  oldValue?: unknown
  newValue?: unknown
  description: string
}

export interface MigrationWarning {
  field: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

// ============================================================================
// MIGRATION PRINCIPALE
// ============================================================================

/**
 * Migre un personnage du format V1 vers le format V2
 * Version stub - pour l'instant retourne le personnage inchangé
 */
export function migrateCharacterV1ToV2(character: CharacterV1): MigrationResult {
  const result: MigrationResult = {
    success: true,
    character: character,
    changes: [],
    warnings: [],
    version: '2.0.0',
  }

  // TODO: Implémenter la logique de migration complète
  // Pour l'instant, le personnage reste au format V1

  return result
}

// ============================================================================
// HELPERS DE MIGRATION
// ============================================================================

/**
 * Vérifie si un personnage est au format V1
 */
export function isV1Character(character: CharacterV1): boolean {
  // Si le personnage n'a pas de propriété 'class' avec un ID Aurora, c'est V1
  const classId = character.class?.id
  return !classId || !classId.startsWith('ID_')
}

/**
 * Convertit un ID de classe au format Aurora
 */
export function convertClassIdToAurora(oldId: string): string {
  const mapping: Record<string, string> = {
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
  }
  
  return mapping[oldId] || oldId
}

/**
 * Convertit un ID de race au format Aurora
 */
export function convertRaceIdToAurora(oldId: string): string {
  const mapping: Record<string, string> = {
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
  
  return mapping[oldId] || oldId
}

// ============================================================================
// BATCH MIGRATION
// ============================================================================

export interface BatchMigrationResult {
  total: number
  successful: number
  failed: number
  results: MigrationResult[]
}

/**
 * Migre plusieurs personnages
 */
export function migrateCharactersBatch(characters: CharacterV1[]): BatchMigrationResult {
  const results = characters.map(migrateCharacterV1ToV2)
  
  return {
    total: characters.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  }
}

// Export all types and functions (already exported via export keyword above)
