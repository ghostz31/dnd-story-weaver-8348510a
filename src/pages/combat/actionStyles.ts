// ============================================================================
// HELPERS — Couleurs & libellés
// ============================================================================

export function getActionColor(type: string): string {
  const colors: Record<string, string> = {
    'action': '#ef4444',
    'bonus': '#f59e0b',
    'reaction': '#3b82f6',
    'free': '#10b981',
    'limited': '#8b5cf6'
  }
  return colors[type] || '#6b7280'
}

export function getFeatureColor(type: string): string {
  const colors: Record<string, string> = {
    'action': '#ef4444',
    'bonus': '#f59e0b',
    'reaction': '#3b82f6',
    'passive': '#10b981',
    'trait': '#8b5cf6',
    'feat': '#ec4899'
  }
  return colors[type] || '#6b7280'
}

export function getActionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'action': 'Action',
    'bonus': 'Bonus',
    'reaction': 'Réaction',
    'free': 'Libre',
    'limited': 'Limité'
  }
  return labels[type] || type
}

export function getFeatureTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'action': 'Action',
    'bonus': 'Action Bonus',
    'reaction': 'Réaction',
    'passive': 'Passive',
    'trait': 'Trait',
    'feat': 'Don'
  }
  return labels[type] || type
}

export function formatTagLabel(tag: string): string {
  const labels: Record<string, string> = {
    'finesse': 'Finesse',
    'heavy': 'Lourde',
    'light': 'Légère',
    'two-handed': '2M',
    'versatile': 'Polyvalente',
    'melee': 'Mêlée',
    'ranged': 'Distance',
    'magic': 'Magique',
    'concentration': 'Conc.'
  }
  return labels[tag] || tag
}
