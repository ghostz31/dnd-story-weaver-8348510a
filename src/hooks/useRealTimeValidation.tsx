/**
 * Hook de Validation en Temps Réel pour le Wizard
 * 
 * Fournit une validation instantanée et des suggestions
 * pendant la création/modification du personnage
 */

import { useState, useCallback, useEffect } from 'react'
import type { Character } from '../types/character'
import type { ValidationResult, ValidationWarning, ValidationSuggestion } from '../utils/validation'
import { validateCharacter } from '../utils/validation'
import { applyRules, type RuleContext } from '../utils/rules-engine'
import type { Rule } from '../types/aurora-v2'

// ============================================================================
// TYPES
// ============================================================================

interface RealTimeValidationState {
  result: ValidationResult | null
  isValidating: boolean
  lastValidated: Date | null
}

interface UseRealTimeValidationOptions {
  debounceMs?: number
  validateOnChange?: boolean
  minLevel?: number
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useRealTimeValidation(
  character: Character | null,
  options: UseRealTimeValidationOptions = {}
) {
  const {
    debounceMs = 300,
    validateOnChange = true,
  } = options

  const [state, setState] = useState<RealTimeValidationState>({
    result: null,
    isValidating: false,
    lastValidated: null,
  })

  // Fonction de validation
  const performValidation = useCallback(() => {
    if (!character) return

    setState(prev => ({ ...prev, isValidating: true }))

    // Validation asynchrone pour ne pas bloquer l'UI
    setTimeout(() => {
      const result = validateCharacter(character)
      
      setState({
        result,
        isValidating: false,
        lastValidated: new Date(),
      })
    }, 0)
  }, [character])

  // Validation avec debounce
  useEffect(() => {
    if (!validateOnChange || !character) return

    const timeoutId = setTimeout(performValidation, debounceMs)
    return () => clearTimeout(timeoutId)
  }, [character, debounceMs, validateOnChange, performValidation])

  // Force validation
  const forceValidation = useCallback(() => {
    performValidation()
  }, [performValidation])

  // Get warnings for a specific field
  const getFieldWarnings = useCallback((field: string): ValidationWarning[] => {
    if (!state.result) return []
    return state.result.warnings.filter(w => w.field === field || w.field.startsWith(field))
  }, [state.result])

  // Get suggestions for a specific type
  const getSuggestions = useCallback((type?: ValidationSuggestion['type']): ValidationSuggestion[] => {
    if (!state.result) return []
    if (!type) return state.result.suggestions
    return state.result.suggestions.filter(s => s.type === type)
  }, [state.result])

  // Check if there are any blocking issues
  const hasBlockingIssues = useCallback((): boolean => {
    if (!state.result) return false
    return state.result.errors.length > 0
  }, [state.result])

  // Check if there are any warnings
  const hasWarnings = useCallback((): boolean => {
    if (!state.result) return false
    return state.result.warnings.length > 0
  }, [state.result])

  // Get overall status
  const getStatus = useCallback((): 'valid' | 'warning' | 'error' => {
    if (!state.result) return 'valid'
    if (state.result.errors.length > 0) return 'error'
    if (state.result.warnings.length > 0) return 'warning'
    return 'valid'
  }, [state.result])

  return {
    ...state,
    forceValidation,
    getFieldWarnings,
    getSuggestions,
    hasBlockingIssues,
    hasWarnings,
    getStatus,
  }
}

// ============================================================================
// HOOK POUR LES RULES
// ============================================================================

interface UseRulesEngineResult {
  pendingSelections: Rule[]
  appliedChanges: any[]
  applySelection: (rule: Rule, selectedOptions: string[]) => void
}

export function useRulesEngine(
  character: Character | null,
  rules: Rule[]
): UseRulesEngineResult {
  const [pendingSelections, setPendingSelections] = useState<Rule[]>([])
  const [appliedChanges, setAppliedChanges] = useState<any[]>([])

  // Apply rules when they change
  useEffect(() => {
    if (!character) return

    const context: RuleContext = {
      character,
      source: 'wizard',
      sourceId: 'creation',
    }

    const result = applyRules(rules, context)
    
    // Store pending selections
    setPendingSelections([])
    setAppliedChanges(result.changes)
  }, [character, rules])

  // Apply a specific selection
  const applySelection = useCallback((rule: Rule, selectedOptions: string[]) => {
    // TODO : Implémenter la logique d'application des sélections
    console.log('Applying selection:', rule, selectedOptions)
    
    // Remove from pending
    setPendingSelections(prev => prev.filter(r => r !== rule))
  }, [])

  return {
    pendingSelections,
    appliedChanges,
    applySelection,
  }
}

// ============================================================================
// COMPOSANT DE VALIDATION VISUELLE
// ============================================================================

export interface ValidationBadgeProps {
  status: 'valid' | 'warning' | 'error' | 'validating'
  count?: number
  message?: string
}

export function ValidationBadge({ status, count, message }: ValidationBadgeProps) {
  const styles = {
    valid: 'bg-hp-high/20 text-hp-high border-hp-high/30',
    warning: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    error: 'bg-destructive/20 text-destructive border-destructive/30',
    validating: 'bg-ac/20 text-ac border-ac/30 animate-pulse',
  }

  const icons = {
    valid: '✓',
    warning: '⚠',
    error: '✕',
    validating: '⟳',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <span>{icons[status]}</span>
      {count !== undefined && <span>{count}</span>}
      {message && <span>{message}</span>}
    </span>
  )
}

// ============================================================================
// COMPOSANT DE MESSAGE DE VALIDATION
// ============================================================================

export interface ValidationMessageProps {
  warning?: ValidationWarning
  error?: { message: string }
  suggestion?: ValidationSuggestion
}

export function ValidationMessage({ warning, error, suggestion }: ValidationMessageProps) {
  if (error) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
        <span className="text-lg">✕</span>
        <div>
          <p className="font-medium">{error.message}</p>
        </div>
      </div>
    )
  }

  if (warning) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
        <span className="text-lg">⚠</span>
        <div>
          <p className="font-medium">{warning.message}</p>
          {warning.suggestion && (
            <p className="text-yellow-500/70 mt-1 text-xs">💡 {warning.suggestion}</p>
          )}
        </div>
      </div>
    )
  }

  if (suggestion) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-ac/10 border border-ac/30 text-ac text-sm cursor-pointer hover:bg-ac/20 transition-colors">
        <span className="text-lg">💡</span>
        <div>
          <p className="font-medium">{suggestion.message}</p>
          <p className="text-ac/70 mt-1 text-xs">✨ {suggestion.benefit}</p>
        </div>
      </div>
    )
  }

  return null
}

// ============================================================================
// COMPOSANT DE PANNEAU DE VALIDATION
// ============================================================================

export interface ValidationPanelProps {
  result: ValidationResult | null
  isValidating: boolean
}

export function ValidationPanel({ result, isValidating }: ValidationPanelProps) {
  if (isValidating) {
    return (
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="animate-spin">⟳</span>
          <span>Validation en cours...</span>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-muted-foreground text-sm">
          La validation apparaîtra ici
        </p>
      </div>
    )
  }

  const hasErrors = result.errors.length > 0
  const hasWarnings = result.warnings.length > 0
  const hasSuggestions = result.suggestions.length > 0

  if (!hasErrors && !hasWarnings && !hasSuggestions) {
    return (
      <div className="p-4 rounded-lg bg-hp-high/10 border border-hp-high/30">
        <div className="flex items-center gap-2 text-hp-high">
          <span className="text-lg">✓</span>
          <span className="font-medium">Tout est parfait !</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {result.errors.map((error, index) => (
        <ValidationMessage key={`error-${index}`} error={error} />
      ))}
      
      {result.warnings.map((warning, index) => (
        <ValidationMessage key={`warning-${index}`} warning={warning} />
      ))}
      
      {result.suggestions.map((suggestion, index) => (
        <ValidationMessage key={`suggestion-${index}`} suggestion={suggestion} />
      ))}
    </div>
  )
}


