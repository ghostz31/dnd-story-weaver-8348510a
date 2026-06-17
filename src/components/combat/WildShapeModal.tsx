import { useState } from 'react'
import { Dialog, DialogFooter } from '../ui/Dialog'
import { getWildShapeOptions, canWildShapeFly, canWildShapeSwim } from '../../utils/wild-shape'
import type { WildShapeBeast } from '../../types/wild-shape'

interface WildShapeModalProps {
    open: boolean
    onClose: () => void
    level: number
    subclass?: string | null
    onSelect: (beast: WildShapeBeast) => void
}

export function WildShapeModal({ open, onClose, level, subclass, onSelect }: WildShapeModalProps) {
    const [search, setSearch] = useState('')
    const beasts = getWildShapeOptions(
        level,
        subclass || undefined,
        canWildShapeFly(level),
        canWildShapeSwim(level)
    )
    const filtered = beasts.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.nameEn.toLowerCase().includes(search.toLowerCase())
    )

    const byCR = filtered.reduce<Record<string, WildShapeBeast[]>>((acc, b) => {
        const crLabel = b.cr === 0 ? 'CR 0' : b.cr < 1 ? `CR 1/${Math.round(1 / b.cr)}` : `CR ${b.cr}`
        if (!acc[crLabel]) acc[crLabel] = []
        acc[crLabel].push(b)
        return acc
    }, {})

    const crOrder = Object.keys(byCR).sort((a, b) => {
        const getVal = (s: string) => {
            if (s === 'CR 0') return 0
            const match = s.match(/CR (\d+)(?:\/(\d+))?/)
            if (!match) return 0
            if (match[2]) return 1 / parseInt(match[2])
            return parseInt(match[1])
        }
        return getVal(a) - getVal(b)
    })

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => { if (!open) onClose() }}
            title="Forme sauvage"
            description="Choisissez une bête. Vous adoptez ses PV, CA, FOR, DEX et CON. Vous conservez votre SAG, INT, CHA et bonus de maîtrise."
            className="max-w-lg"
        >
            <input
                type="text"
                placeholder="Rechercher une bête…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input mb-4"
            />

            <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-1">
                {crOrder.map(cr => (
                    <div key={cr}>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-[hsl(var(--card))] py-1">
                            {cr}
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {byCR[cr].map(beast => (
                                <button
                                    key={beast.id}
                                    onClick={() => onSelect(beast)}
                                    className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{beast.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {beast.size} • {beast.hp} PV • CA {beast.ac} • Vitesse {beast.speed.walk} m
                                                {beast.speed.fly ? ` • Vol ${beast.speed.fly} m` : ''}
                                                {beast.speed.swim ? ` • Nage ${beast.speed.swim} m` : ''}
                                            </p>
                                        </div>
                                        <div className="text-right text-xs text-muted-foreground">
                                            <p>FOR {beast.abilityScores.str}</p>
                                            <p>DEX {beast.abilityScores.dex}</p>
                                            <p>CON {beast.abilityScores.con}</p>
                                        </div>
                                    </div>
                                    {beast.attacks.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {beast.attacks.map(a => (
                                                <span key={a.nameEn} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                                                    {a.name} +{a.bonus} ({a.damage})
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">
                        Aucune bête trouvée.
                    </p>
                )}
            </div>

            <DialogFooter>
                <button onClick={onClose} className="btn btn-ghost flex-1">
                    Annuler
                </button>
            </DialogFooter>
        </Dialog>
    )
}
