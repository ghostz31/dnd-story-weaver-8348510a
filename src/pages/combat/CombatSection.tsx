import { useState, useMemo } from 'react'
import { FireIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { SectionTabs } from '../../components/ui'
import type { ResolvedAction } from '../../utils/combat-engine'
import { CombatActionCard } from './CombatActionCard'

// ============================================================================
// SOUS-COMPOSANTS — CombatSection
// ============================================================================

export function CombatSection({ 
  actions, 
  limitedActions, 
  isCalculating,
  onUseAction,
  actionsUsedThisTurn
}: { 
  actions: ResolvedAction[]
  limitedActions: ResolvedAction[]
  isCalculating: boolean
  onUseAction: (action: ResolvedAction) => void
  actionsUsedThisTurn: { action: boolean; bonus: boolean; reaction: boolean }
}) {
  const [activeTab, setActiveTab] = useState('weapons')
  
  const weaponActions = actions.filter(a => a.source.type === 'item')
  const otherActions = actions.filter(a => a.source.type !== 'item')
  
  const tabs = [
    { id: 'weapons', label: 'Armes', count: weaponActions.length },
    { id: 'actions', label: 'Actions', count: otherActions.filter(a => a.actionType === 'action').length },
    { id: 'bonus', label: 'Bonus', count: otherActions.filter(a => a.actionType === 'bonus').length },
    { id: 'reactions', label: 'Réactions', count: otherActions.filter(a => a.actionType === 'reaction').length },
    { id: 'limited', label: 'Limitées', count: limitedActions.length },
  ]
  
  const filteredActions = useMemo(() => {
    switch (activeTab) {
      case 'weapons': return weaponActions
      case 'actions': return otherActions.filter(a => a.actionType === 'action')
      case 'bonus': return otherActions.filter(a => a.actionType === 'bonus')
      case 'reactions': return otherActions.filter(a => a.actionType === 'reaction')
      case 'limited': return limitedActions
      default: return actions
    }
  }, [activeTab, weaponActions, otherActions, limitedActions, actions])
  
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold font-cinzel flex items-center gap-2">
        <FireIcon className="w-5 h-5 text-destructive" />
        Actions de Combat
      </h2>
      
      {/* Sous-navigation */}
      <SectionTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      
      {/* Liste des actions */}
      <div className={activeTab === 'weapons' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
        {isCalculating ? (
          <div className="card p-6 text-center text-muted-foreground">
            <ArrowPathIcon className="w-6 h-6 mx-auto mb-2 animate-spin" />
            Calcul des actions...
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="card p-6 text-center text-muted-foreground">
            <p>Aucune action disponible</p>
            <p className="text-xs mt-1">Équipez une arme ou vérifiez votre classe</p>
          </div>
        ) : (
          filteredActions.map(action => (
            <CombatActionCard 
              key={action.id} 
              action={action}
              actionsUsedThisTurn={actionsUsedThisTurn}
              onUse={() => onUseAction(action)}
            />
          ))
        )}
      </div>
    </section>
  )
}
