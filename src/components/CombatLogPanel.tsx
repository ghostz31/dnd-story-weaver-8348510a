import { useCombatStore } from '../stores/combatStore'
import { TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export function CombatLogPanel() {
  const { combatLog, clearCombatLog, turnNumber } = useCombatStore()

  if (combatLog.length === 0) return null

  const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
    action: { bg: 'bg-primary/10', text: 'text-primary', label: 'Action' },
    resource: { bg: 'bg-hp-high/10', text: 'text-hp-high', label: 'Ressource' },
    effect: { bg: 'bg-magic/10', text: 'text-magic', label: 'Effet' },
    turn: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Tour' },
  }

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ArrowPathIcon className="w-3.5 h-3.5" />
          Journal de combat
          <span className="text-[10px] font-normal normal-case">(Tour {turnNumber})</span>
        </h3>
        <button
          onClick={clearCombatLog}
          className="p-1 hover:bg-muted rounded transition-colors"
          title="Effacer le journal"
        >
          <TrashIcon className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {combatLog.slice(-30).map((entry) => {
          const style = typeStyles[entry.type] || typeStyles.action
          return (
            <div key={entry.id} className="flex items-center gap-2 text-xs">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${style.bg} ${style.text}`}>
                {style.label}
              </span>
              <span className="text-muted-foreground shrink-0">T{entry.turn}</span>
              <span className="text-foreground font-medium truncate">{entry.label}</span>
              {entry.detail && (
                <span className="text-muted-foreground/70 shrink-0">{entry.detail}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
