/**
 * Moteur de Validation - Permissif (inspiré d'Aurora mais sans bloquer)
 * 
 * Contrairement à Aurora qui bloque si invalide, ce moteur :
 * - Avertit l'utilisateur des problèmes
 * - Permet de continuer malgré tout
 * - Affiche des suggestions d'amélioration
 */

import type { Character } from '../types/character'
import { getFeatById } from '../data/feats'

// ============================================================================
// TYPES DE VALIDATION
// ============================================================================

export interface ValidationResult {
  valid: boolean // Toujours true en mode permissif
  errors: ValidationError[] // Avertissements sévères
  warnings: ValidationWarning[] // Suggestions
  info: ValidationInfo[] // Informations utiles
  suggestions: ValidationSuggestion[] // Conseils d'amélioration
}

export interface ValidationError {
  type: 'missing-class' | 'missing-race' | 'invalid-stat'
  message: string
  field: string
  severity: 'high' | 'medium'
}

export interface ValidationWarning {
  type: 'prerequisite' | 'limit-exceeded' | 'missing-selection'
  message: string
  field: string
  current?: number | string
  required?: number | string
  suggestion?: string
}

export interface ValidationInfo {
  type: 'optimal-stat' | 'recommended-skill' | 'feature-available'
  message: string
  field: string
}

export interface ValidationSuggestion {
  type: 'ability-improvement' | 'skill-choice' | 'feat-synergy'
  message: string
  field: string
  benefit: string
}

// ============================================================================
// VALIDATION PRINCIPALE
// ============================================================================

export function validateCharacter(character: Character): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: [],
    suggestions: [],
  }

  validateCoreRequirements(character, result)
  validateAbilityScores(character, result)
  validateProficiencies(character, result)
  validateFeats(character, result)

  return result
}

// ============================================================================
// VALIDATIONS SPÉCIFIQUES
// ============================================================================

function validateCoreRequirements(character: Character, result: ValidationResult): void {
  if (!character.race) {
    result.errors.push({
      type: 'missing-race',
      message: 'Aucune race sélectionnée',
      field: 'race',
      severity: 'high',
    })
  }

  if (!character.class) {
    result.errors.push({
      type: 'missing-class',
      message: 'Aucune classe sélectionnée',
      field: 'class',
      severity: 'high',
    })
  }
}

function validateAbilityScores(character: Character, result: ValidationResult): void {
  const scores = character.abilityScores || {}
  const classData = character.class
  
  // Vérifier les valeurs minimales/maximales
  for (const [stat, value] of Object.entries(scores)) {
    if (value < 3 || value > 20) {
      result.warnings.push({
        type: 'prerequisite',
        message: `${stat.toUpperCase()} ${value} est hors des limites normales (3-20)`,
        field: `abilityScores.${stat}`,
        current: value,
        suggestion: 'Les caractéristiques devraient être entre 3 et 20',
      })
    }
  }
  
  // Suggestions basées sur la classe
  if (classData?.primaryAbility) {
    const ability = classData.primaryAbility
    const current = scores[ability] || 0
    if (current < 14) {
      result.suggestions.push({
        type: 'ability-improvement',
        message: `${ability.toUpperCase()} est faible (${current}) pour un ${classData.name}`,
        field: `abilityScores.${ability}`,
        benefit: `Augmenter ${ability.toUpperCase()} à 16+ améliorera vos capacités de classe`,
      })
    }
  }
}

function validateProficiencies(character: Character, result: ValidationResult): void {
  const maxSkills = getMaxSkillProficiencies(character)
  const currentSkills = character.skillProficiencies?.length || 0
  
  if (currentSkills > maxSkills) {
    result.warnings.push({
      type: 'limit-exceeded',
      message: `Trop de compétences maîtrisées (${currentSkills}/${maxSkills})`,
      field: 'skillProficiencies',
      current: currentSkills,
      required: maxSkills,
      suggestion: `Désélectionnez ${currentSkills - maxSkills} compétence(s)`,
    })
  }
  
  if (currentSkills < maxSkills) {
    result.info.push({
      type: 'optimal-stat',
      message: `Vous pouvez encore choisir ${maxSkills - currentSkills} compétence(s)`,
      field: 'skillProficiencies',
    })
  }
}

function validateFeats(character: Character, result: ValidationResult): void {
  // Validation de base des dons - permissif
  const feats = character.feats || []
  
  feats.forEach((featId: string) => {
    const featExists = getFeatById(featId) !== undefined
    
    if (!featExists) {
      result.warnings.push({
        type: 'prerequisite',
        message: `Le don "${featId}" n'existe pas dans la base de données`,
        field: `feats.${featId}`,
        suggestion: 'Vérifiez l\'orthographe ou sélectionnez un don valide',
      })
    }
  })
}

// ============================================================================
// HELPERS
// ============================================================================

function getMaxSkillProficiencies(_character: Character): number {
  let max = 0
  
  // Base: 2 pour la plupart des classes
  max += 2
  
  // Bonus de race
  // Note: Mode permissif - on autorise sans vérifier strictement
  
  // Bonus de background
  max += 2
  
  return max
}

// ============================================================================
// FONCTIONS DE SUGGESTION
// ============================================================================

export function getRecommendedSkills(character: Character): string[] {
  const cls = character.class
  if (!cls) return []
  
  // Compétences recommandées basées sur les caractéristiques principales
  const primaryAbility = cls.primaryAbility
  const recommendations: string[] = []
  
  // Mapper les caractéristiques aux compétences (simplifié)
  const abilityToSkills: Record<string, string[]> = {
    'str': ['Athlétisme'],
    'dex': ['Acrobaties', 'Discrétion', 'Escamotage'],
    'con': [],
    'int': ['Arcanes', 'Histoire', 'Investigation', 'Nature', 'Religion'],
    'wis': ['Dressage', 'Médecine', 'Perception', 'Perspicacité', 'Survie'],
    'cha': ['Tromperie', 'Intimidation', 'Représentation', 'Persuasion'],
  }
  
  if (primaryAbility) {
    const skills = abilityToSkills[primaryAbility.toLowerCase()] || []
    recommendations.push(...skills)
  }
  
  return [...new Set(recommendations)]
}

export function getSynergisticFeats(_character: Character): string[] {
  const cls = _character.class
  const scores = _character.abilityScores
  
  if (!cls || !scores) return []
  
  const synergies: string[] = []
  
  // Suggestions basées sur la classe
  if (cls.id === 'ID_PHB_CLASS_BARBARIAN' || cls.id === 'barbarian') {
    synergies.push('Sentinelle', 'Maître d\'armes lourdes', 'Attaquant sauvage')
  }
  
  if (cls.id === 'ID_PHB_CLASS_ROGUE' || cls.id === 'rogue') {
    synergies.push('Esquive', 'Chanceux', 'Sentinelle')
  }
  
  // Suggestions basées sur les caractéristiques élevées
  const dex = scores.dex || 0
  if (dex >= 14) {
    synergies.push('Esquive', 'Ambidextre')
  }
  
  return [...new Set(synergies)]
}

// ============================================================================
// FORMATAGE DES RÉSULTATS
// ============================================================================

export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = []
  
  if (result.errors.length > 0) {
    lines.push('❌ Erreurs :')
    result.errors.forEach(e => lines.push(`  • ${e.message}`))
    lines.push('')
  }
  
  if (result.warnings.length > 0) {
    lines.push('⚠️ Avertissements :')
    result.warnings.forEach(w => {
      lines.push(`  • ${w.message}`)
      if (w.suggestion) {
        lines.push(`    💡 ${w.suggestion}`)
      }
    })
    lines.push('')
  }
  
  if (result.suggestions.length > 0) {
    lines.push('💡 Suggestions :')
    result.suggestions.forEach(s => {
      lines.push(`  • ${s.message}`)
      lines.push(`    ✨ ${s.benefit}`)
    })
  }
  
  return lines.join('\n')
}
