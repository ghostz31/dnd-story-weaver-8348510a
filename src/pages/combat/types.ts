import type { ClassAction } from '../../data/classFeatures'
import { categorizeFeature } from '../../utils/feature-helpers'

// ============================================================================
// TYPES
// ============================================================================

export type ViewMode = 'combat' | 'features' | 'all'
export type FeatureCategory = 'all' | 'actions' | 'bonus' | 'reactions' | 'passives' | 'traits' | 'feats'

export interface OrganizedFeatures {
  actions: Array<{ name: string; description: string; level: number; uses?: ClassAction }>
  bonus: Array<{ name: string; description: string; level: number; uses?: ClassAction }>
  reactions: Array<{ name: string; description: string; level: number; uses?: ClassAction }>
  passives: Array<{ name: string; description: string; level: number; uses?: ClassAction }>
  traits: Array<{ name: string; description: string; source: string }>
  feats: Array<{ name: string; description: string; prerequisite?: string }>
}

const CATEGORIZE_MAP: Record<string, FeatureCategory> = {
  action: 'actions',
  bonus: 'bonus',
  reaction: 'reactions',
  passive: 'passives',
}

export function categorizeFeatureForPage(name: string): FeatureCategory {
  return CATEGORIZE_MAP[categorizeFeature(name)] || 'passives'
}
