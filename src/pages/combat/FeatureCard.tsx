import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { getFeatureColor, getFeatureTypeLabel } from './actionStyles'

// ============================================================================
// SOUS-COMPOSANTS — FeatureCard
// ============================================================================

export function FeatureCard({
  feature,
  isExpanded,
  onToggle,
  trackedResources,
  onUseResource,
  spellSlotSummary,
}: {
  feature: any
  isExpanded: boolean
  onToggle: () => void
  trackedResources: Record<string, any>
  onUseResource: (id: string, amount?: number) => boolean
  spellSlotSummary: Array<{ level: number; available: number; max: number }>
}) {
  const color = getFeatureColor(feature.type)
  const hasUses = feature.uses || feature.resource
  
  // Trouver la ressource trackée si applicable
  const resourceKey = feature.uses?.key || feature.resource?.id
  const trackedResource = resourceKey ? trackedResources[resourceKey] : null
  const currentUses = trackedResource?.current ?? feature.uses?.current ?? 0
  const maxUses = trackedResource?.max ?? feature.uses?.max ?? 0
  const restoreOn = trackedResource?.resetOn ?? feature.uses?.restoreOn ?? 'long'
  
  return (
    <div 
      className="card overflow-hidden"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Pastille niveau — style sort */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-cinzel font-bold text-sm shrink-0"
            style={{ background: color + '20', color }}
          >
            {feature.level ?? '•'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{feature.name}</h3>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ backgroundColor: color + '20', color }}
              >
                {getFeatureTypeLabel(feature.type)}
              </span>
              {hasUses && (
                <span className="text-[10px] text-muted-foreground">
                  {restoreOn === 'short' ? 'Repos court' : 'Repos long'}
                </span>
              )}
            </div>

            {/* Châtiment divin — affiche les emplacements de sort disponibles */}
            {feature.name === 'Châtiment divin' && spellSlotSummary.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {spellSlotSummary.map((slot) => {
                  const isUsed = slot.available === 0
                  return (
                    <div
                      key={slot.level}
                      className={`spell-orb ${isUsed ? 'used' : ''}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        lineHeight: 1,
                        ...(isUsed ? {} : {
                          borderColor: 'hsl(var(--color-magic) / 0.5)',
                          background: 'hsl(var(--color-magic) / 0.15)',
                          color: 'hsl(var(--color-magic))',
                        }),
                      }}
                      title={`Niveau ${slot.level} : ${slot.available}/${slot.max} restant${slot.available > 1 ? 's' : ''}`}
                    >
                      {slot.level}
                    </div>
                  )
                })}
                <span className="text-[10px] text-muted-foreground">Emplacements de sort</span>
              </div>
            )}

            {/* Utilisations — style sort */}
            {hasUses && maxUses > 0 && feature.name !== 'Châtiment divin' && (
              <div className="flex items-center gap-2 mt-2">
                {maxUses <= 10 ? (
                  <div className="flex gap-[3px]">
                    {Array.from({ length: maxUses }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (i >= currentUses) onUseResource(resourceKey, 1)
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          i < currentUses
                            ? 'bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.5)]'
                            : 'bg-muted hover:bg-primary/30'
                        }`}
                        title={i < currentUses ? 'Disponible' : 'Utilisé'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.5)]" />
                    <span className="text-xs font-cinzel font-bold text-primary tabular-nums">
                      {currentUses}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/ {maxUses === 999 ? '∞' : maxUses}</span>
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {restoreOn === 'short' ? 'Repos court' : 'Repos long'}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <ChevronDownIcon 
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
        
        {/* Description étendue */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
            {feature.prerequisite && (
              <p className="text-xs text-muted-foreground mt-2">
                Prérequis: {feature.prerequisite}
              </p>
            )}
            {feature.source && (
              <p className="text-xs text-muted-foreground mt-1">
                Source: {feature.source}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
