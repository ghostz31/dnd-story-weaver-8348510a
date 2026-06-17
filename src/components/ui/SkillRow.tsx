import type { BonusBreakdown } from '../../contexts/CharacterContext'

interface SkillRowProps {
  name: string
  ability: string
  abilityLabel: string
  bonus: number
  isProficient: boolean
  onClick?: () => void
  breakdown?: BonusBreakdown
}

export function SkillRow({ name, abilityLabel, bonus, isProficient, onClick, breakdown }: SkillRowProps) {
  const bonusText = bonus >= 0 ? `+${bonus}` : `${bonus}`

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
        isProficient ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            isProficient ? 'bg-primary' : 'border-2 border-muted-foreground/30'
          }`}
        />
        <span className={`text-sm truncate ${isProficient ? 'font-medium' : 'text-muted-foreground'}`}>
          {name}
        </span>
        <span className="text-[10px] text-muted-foreground/60">({abilityLabel})</span>
      </div>
      <span
        className={`text-sm font-bold font-cinzel ${
          isProficient ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {bonusText}
      </span>

      {/* Breakdown tooltip */}
      {breakdown && breakdown.sources.length > 1 && (
        <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-44">
          <div className="bg-popover border border-border rounded-lg shadow-lg p-2 text-xs">
            <p className="font-bold text-foreground mb-1 border-b border-border pb-1">Détail {name}</p>
            <div className="space-y-0.5">
              {breakdown.sources.map((source, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">{source.label}</span>
                  <span className={`font-mono font-bold ${source.value >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {source.value >= 0 ? `+${source.value}` : source.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-1 pt-1 border-t border-border flex justify-between">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-mono font-bold text-primary">{bonus >= 0 ? `+${bonus}` : bonus}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
