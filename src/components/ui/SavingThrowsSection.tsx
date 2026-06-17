import type { AbilityScores } from '../../types/character'
import type { BonusBreakdown } from '../../contexts/CharacterContext'

interface SavingThrowsSectionProps {
    abilities: (keyof AbilityScores)[]
    isProficient: (ability: keyof AbilityScores) => boolean
    getBreakdown: (ability: keyof AbilityScores) => BonusBreakdown
    abilityLabels: Record<keyof AbilityScores, string>
}

export function SavingThrowsSection({
    abilities,
    isProficient,
    getBreakdown,
    abilityLabels,
}: SavingThrowsSectionProps) {
    const formatModifier = (mod: number) => mod >= 0 ? `+${mod}` : `${mod}`

    return (
        <div className="card p-3">
            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider">
                Jets de sauvegarde
            </h3>
            <div className="grid grid-cols-2 gap-2">
                {abilities.map((ability) => {
                    const proficient = isProficient(ability)
                    const breakdown = getBreakdown(ability)
                    const bonus = breakdown.total
                    return (
                        <div key={ability} className="group relative flex items-center justify-between py-1 cursor-help">
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${proficient ? 'bg-primary' : 'border-2 border-muted-foreground/30'}`} />
                                <span className={`text-sm ${proficient ? 'font-medium' : 'text-muted-foreground'}`}>
                                    {abilityLabels[ability]}
                                </span>
                            </div>
                            <span className={`text-sm font-bold font-cinzel ${proficient ? 'text-primary' : 'text-muted-foreground'}`}>
                                {formatModifier(bonus)}
                            </span>
                            {breakdown.sources.length > 1 && (
                                <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-44">
                                    <div className="bg-popover border border-border rounded-lg shadow-lg p-2 text-xs">
                                        <p className="font-bold text-foreground mb-1 border-b border-border pb-1">Détail JS {abilityLabels[ability]}</p>
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
                                            <span className="font-mono font-bold text-primary">{formatModifier(breakdown.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
