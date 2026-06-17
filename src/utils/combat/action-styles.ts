import type { ResolvedAction, ActionTag } from './actions-resolver'

// ============================================================================
// UTILITAIRES D'AFFICHAGE
// ============================================================================

export function getActionColor(actionType: ResolvedAction['actionType']): string {
  const colors: Record<ResolvedAction['actionType'], string> = {
    'action': '#ef4444',      // Rouge
    'bonus': '#f59e0b',       // Orange
    'reaction': '#3b82f6',    // Bleu
    'free': '#10b981',        // Vert
    'limited': '#8b5cf6'      // Violet
  }
  return colors[actionType]
}

export function getTagColor(tag: ActionTag): string {
  const colors: Partial<Record<ActionTag, string>> = {
    'finesse': '#ec4899',
    'heavy': '#dc2626',
    'light': '#84cc16',
    'two-handed': '#f97316',
    'versatile': '#06b6d4',
    'magic': '#a855f7',
    'concentration': '#eab308'
  }
  return colors[tag] || '#6b7280'
}
