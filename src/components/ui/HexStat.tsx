import type { AbilityScores } from '../../types/character'

interface HexStatProps {
  ability: keyof AbilityScores
  score: number
  modifier: number
  isSaveProficient: boolean
  skillCount: number
  label: string
}

const abilityColors: Record<keyof AbilityScores, string> = {
  str: 'hsl(var(--stat-str))',
  dex: 'hsl(var(--stat-dex))',
  con: 'hsl(var(--stat-con))',
  int: 'hsl(var(--stat-int))',
  wis: 'hsl(var(--stat-wis))',
  cha: 'hsl(var(--stat-cha))',
}

export function HexStat({ ability, score, modifier, isSaveProficient, skillCount, label }: HexStatProps) {
  const color = abilityColors[ability]
  const modText = modifier >= 0 ? `+${modifier}` : `${modifier}`

  return (
    <div
      className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
        isSaveProficient ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'
      }`}
    >
      {/* Label */}
      <span className="stat-label text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      
      {/* Score */}
      <span 
        className="text-2xl md:text-3xl font-bold font-cinzel mt-0.5"
        style={{ color }}
      >
        {score}
      </span>
      
      {/* Modifier Badge */}
      <div 
        className="mt-1 px-2.5 py-0.5 rounded-full text-sm font-bold"
        style={{ 
          backgroundColor: isSaveProficient ? `${color}20` : 'hsl(var(--muted))',
          color: isSaveProficient ? color : 'hsl(var(--muted-foreground))'
        }}
      >
        {modText}
      </div>
      
      {/* Save Proficiency Indicator */}
      {isSaveProficient && (
        <div className="mt-1 text-[11px] font-bold text-primary uppercase tracking-wide">
          Sauv.
        </div>
      )}
      
      {/* Skill Count */}
      {skillCount > 0 && (
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {skillCount} comp.
        </div>
      )}
    </div>
  )
}
