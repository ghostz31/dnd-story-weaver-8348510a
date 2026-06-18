import type { BonusBreakdown } from '../../types/character'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip'

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
  initiative: 'hsl(var(--color-xp))',
  speed: 'hsl(var(--secondary))',
  proficiency: 'hsl(var(--primary))',
}

export function CombatBadge({ type, value, label, suffix, breakdown }: CombatBadgeProps) {
  const color = typeColors[type]
  const showBreakdown = breakdown && breakdown.sources.length > 1

  const trigger = (
    <div className="flex flex-col items-center">
      <div
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-[3px] flex flex-col items-center justify-center bg-card shadow-md transition-transform ${
          showBreakdown ? 'cursor-help group-hover:scale-105' : ''
        }`}
        style={{ borderColor: color }}
      >
        <span className="text-lg md:text-xl font-bold font-cinzel" style={{ color }}>
          {typeof value === 'number' && value >= 0 ? `+${value}` : value}
          {suffix && <span className="text-[10px] md:text-xs">{suffix}</span>}
        </span>
      </div>
      <span className="stat-label mt-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  )

  if (!showBreakdown) return trigger

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group">{trigger}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-48">
          <p className="font-bold text-foreground mb-1.5 border-b border-border pb-1">Détail</p>
          <div className="space-y-1">
            {breakdown!.sources.map((source, i) => (
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
            <span className="font-mono font-bold text-primary">{breakdown!.total}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
