import { useDiceStore } from '../stores/diceStore'
import { CubeIcon, TrashIcon } from '@heroicons/react/24/solid'

export function DiceHistoryPanel() {
  const { history, clearHistory } = useDiceStore()

  if (history.length === 0) return null

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CubeIcon className="w-3.5 h-3.5" />
          Historique des lancers
        </h3>
        <button
          onClick={clearHistory}
          className="p-1 hover:bg-muted rounded transition-colors"
          title="Effacer l'historique"
        >
          <TrashIcon className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {history.slice(0, 20).map((roll) => (
          <div key={roll.id} className="flex items-center justify-between text-xs bg-muted/30 rounded px-2 py-1">
            <div className="min-w-0">
              <span className="font-medium text-foreground truncate block">{roll.label}</span>
              <span className="text-[10px] text-muted-foreground">
                [{roll.results.join(', ')}]
                {roll.dropped.length > 0 && <span className="text-muted-foreground/50"> (drop {roll.dropped.join(', ')})</span>}
                {roll.modifier !== 0 && <span>{roll.modifier > 0 ? ` +${roll.modifier}` : ` ${roll.modifier}`}</span>}
              </span>
            </div>
            <span className="text-sm font-bold text-primary ml-2 shrink-0">= {roll.total}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
