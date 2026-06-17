import type { BonusBreakdown } from '../../contexts/CharacterContext'

interface CombatBadgeProps {
  type: 'ac' | 'initiative' | 'speed' | 'proficiency'
  value: number | string
  label: string
  color?: string
  suffix?: string
  breakdown?: BonusBreakdown
}

const typeColors: Record<string, string> = {
  ac: 'hsl(var(--color-ac))',
  initiative: '#F59E0B',
  speed: 'hsl(var(--secondary))',
  proficiency: 'hsl(var(--primary))',
}

export function CombatBadge({ type, value, label, suffix, breakdown }: CombatBadgeProps) {
  const color = typeColors[type]

  return (
    <div className="flex flex-col items-center relative group">
      <div 
        className="w-14 h-14 md:w-16 md:h-16 rounded-full border-[3px] flex flex-col items-center justify-center bg-card shadow-md cursor-help transition-transform group-hover:scale-105"
        style={{ borderColor: color }}
      >
        <span className="text-lg md:text-xl font-bold font-cinzel" style={{ color }}>
          {typeof value === 'number' && value >= 0 ? `+${value}` : value}
          {suffix && <span className="text-[10px] md:text-xs">{suffix}</span>}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>

      {/* Breakdown tooltip */}
      {breakdown && breakdown.sources.length > 1 && (
        <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-48">
          <div className="bg-popover border border-border rounded-lg shadow-lg p-2.5 text-xs">
            <p className="font-bold text-foreground mb-1.5 border-b border-border pb-1">Détail</p>
            <div className="space-y-1">
              {breakdown.sources.map((source, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">{source.label}</span>
                  <span className={`font-mono font-bold ${source.value >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {source.value >= 0 ? `+${source.value}` : source.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-1.5 pt-1 border-t border-border flex justify-between">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-mono font-bold text-primary">{breakdown.total}</span>
            </div>
          </div>
          <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 mx-auto -mt-1.5" />
        </div>
      )}
    </div>
  )
}
