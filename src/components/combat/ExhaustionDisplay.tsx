const exhaustionEffects = [
    'Désavantage aux jets de caractéristique',
    'Vitesse réduite de moitié',
    'Désavantage aux jets d\'attaque et de sauvegarde',
    'PV max réduits de moitié',
    'Vitesse réduite à 0',
    'Mort',
]

interface ExhaustionDisplayProps {
    exhaustionLevel: number
}

export function ExhaustionDisplay({ exhaustionLevel }: ExhaustionDisplayProps) {
    if (exhaustionLevel === 0) return null

    return (
        <div className="mt-3 card p-3 border-l-4 border-l-hp-crit">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-hp-crit uppercase tracking-wider">Épuisement</span>
                <div className="flex gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                                i < exhaustionLevel ? 'bg-hp-crit' : 'bg-muted'
                            }`}
                        />
                    ))}
                </div>
                <span className="text-xs text-muted-foreground">{exhaustionLevel}/6</span>
            </div>
            <div className="space-y-1">
                {exhaustionEffects.slice(0, exhaustionLevel).map((effect, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-hp-crit font-bold shrink-0">{i + 1}.</span>
                        <span className="text-muted-foreground">{effect}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
