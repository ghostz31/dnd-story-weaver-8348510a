import { useState, useMemo } from 'react'
import { SparklesIcon } from '@heroicons/react/24/solid'
import { SectionTabs } from '../../components/ui'
import type { FeatureCategory, OrganizedFeatures } from './types'
import { FeatureCard } from './FeatureCard'

// ============================================================================
// SOUS-COMPOSANTS — FeaturesSection
// ============================================================================

export function FeaturesSection({
  features,
  category,
  onCategoryChange,
  trackedResources,
  onUseResource,
  spellSlotSummary,
}: {
  features: OrganizedFeatures
  category: FeatureCategory
  onCategoryChange: (c: FeatureCategory) => void
  trackedResources: Record<string, any>
  onUseResource: (id: string, amount?: number) => boolean
  spellSlotSummary: Array<{ level: number; available: number; max: number }>
}) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  
  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedItems)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedItems(newSet)
  }
  
  const categoryTabs = [
    { id: 'all', label: 'Tout' },
    { id: 'actions', label: 'Actions', count: features.actions.length },
    { id: 'bonus', label: 'Bonus', count: features.bonus.length },
    { id: 'reactions', label: 'Réactions', count: features.reactions.length },
    { id: 'passives', label: 'Passives', count: features.passives.length },
    { id: 'traits', label: 'Traits', count: features.traits.length },
    { id: 'feats', label: 'Dons', count: features.feats.length },
  ]
  
  const filteredFeatures = useMemo(() => {
    if (category === 'all') {
      return [
        ...features.actions.map((f: OrganizedFeatures['actions'][0]) => ({ ...f, type: 'action' as const, id: `action-${f.name}` })),
        ...features.bonus.map((f: OrganizedFeatures['bonus'][0]) => ({ ...f, type: 'bonus' as const, id: `bonus-${f.name}` })),
        ...features.reactions.map((f: OrganizedFeatures['reactions'][0]) => ({ ...f, type: 'reaction' as const, id: `reaction-${f.name}` })),
        ...features.passives.map((f: OrganizedFeatures['passives'][0]) => ({ ...f, type: 'passive' as const, id: `passive-${f.name}` })),
        ...features.traits.map((f: OrganizedFeatures['traits'][0]) => ({ ...f, type: 'trait' as const, id: `trait-${f.name}` })),
        ...features.feats.map((f: OrganizedFeatures['feats'][0]) => ({ ...f, type: 'feat' as const, id: `feat-${f.name}` })),
      ]
    }
    
    const mapping: Record<string, keyof OrganizedFeatures> = {
      'actions': 'actions',
      'bonus': 'bonus',
      'reactions': 'reactions',
      'passives': 'passives',
      'traits': 'traits',
      'feats': 'feats'
    }
    
    return (features[mapping[category]] as any[]).map((f) => ({ 
      ...f, 
      type: category === 'actions' ? 'action' as const : category === 'bonus' ? 'bonus' as const : category === 'reactions' ? 'reaction' as const : category === 'passives' ? 'passive' as const : category === 'traits' ? 'trait' as const : 'feat' as const,
      id: `${category}-${f.name}`
    }))
  }, [features, category])
  
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold font-cinzel flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-magic" />
        Capacités & Traits
      </h2>
      
      {/* Sous-navigation */}
      <SectionTabs
        tabs={categoryTabs}
        activeTab={category}
        onChange={(id) => onCategoryChange(id as FeatureCategory)}
      />
      
      {/* Liste des capacités */}
      <div className="space-y-2">
        {filteredFeatures.length === 0 ? (
          <div className="card p-6 text-center text-muted-foreground">
            <p>Aucune capacité dans cette catégorie</p>
          </div>
        ) : (
          filteredFeatures.map((feature: any) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              isExpanded={expandedItems.has(feature.id)}
              onToggle={() => toggleExpanded(feature.id)}
              trackedResources={trackedResources}
              onUseResource={onUseResource}
              spellSlotSummary={spellSlotSummary}
            />
          ))
        )}
      </div>
    </section>
  )
}
