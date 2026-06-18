// Toast compact affichant le résultat d'un jet de dé.
// Animation `roll-toast` (définie dans effects.css) — auto-dismiss géré
// par le parent via la prop `visible` (recommandé : 2.6s).
export interface RollToastProps {
    result: number
    modifier: number
    total: number
    label: string
    visible: boolean
}

export function RollToast({ result, modifier, total, label, visible }: RollToastProps) {
    if (!visible) return null

    // Format : "🎲 17+4 = 21 (Attaque)" — masque le modificateur si 0
    const modStr = modifier === 0 ? '' : `${modifier > 0 ? '+' : ''}${modifier}`

    return (
        <div
            className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2"
            aria-live="polite"
            role="status"
        >
            <div className="roll-toast card px-4 py-2 shadow-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap">
                <span className="text-base">🎲</span>
                <span className="font-cinzel font-bold tabular-nums">
                    {result}
                    {modStr && <span className="text-muted-foreground">{modStr}</span>}
                    {' = '}
                    <span style={{ color: 'hsl(var(--primary))' }}>{total}</span>
                </span>
                <span className="text-muted-foreground">({label})</span>
            </div>
        </div>
    )
}
