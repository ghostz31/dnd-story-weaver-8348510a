import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
    ChevronLeftIcon,
    CubeIcon,
    TrashIcon,
} from '@heroicons/react/24/solid'

interface RollEntry {
    id: string
    dice: string
    results: number[]
    total: number
    modifier: number
    timestamp: Date
    label?: string
}

const DICE_TYPES = [
    { sides: 4, label: 'd4', color: 'bg-rose-500' },
    { sides: 6, label: 'd6', color: 'bg-orange-500' },
    { sides: 8, label: 'd8', color: 'bg-amber-500' },
    { sides: 10, label: 'd10', color: 'bg-emerald-500' },
    { sides: 12, label: 'd12', color: 'bg-sky-500' },
    { sides: 20, label: 'd20', color: 'bg-violet-500' },
    { sides: 100, label: 'd100', color: 'bg-pink-500' },
]

const QUICK_ROLLS = [
    { label: 'Avantage', dice: '2d20', keep: 'highest', modifier: 0 },
    { label: 'Désavantage', dice: '2d20', keep: 'lowest', modifier: 0 },
    { label: 'Dégâts arme', dice: '1d8', modifier: 0 },
    { label: 'Soin', dice: '1d8', modifier: 4 },
    { label: 'Caractéristique', dice: '4d6', keep: 'highest3', modifier: 0 },
]

function rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 9)
}

export function DicePage() {
    const [history, setHistory] = useState<RollEntry[]>([])
    const [modifier, setModifier] = useState(0)
    const [lastRoll, setLastRoll] = useState<RollEntry | null>(null)
    const [animating, setAnimating] = useState(false)

    const addRoll = useCallback((entry: RollEntry) => {
        setLastRoll(entry)
        setHistory(prev => [entry, ...prev].slice(0, 50))
    }, [])

    const rollDice = useCallback((sides: number, count: number, mod: number, label?: string) => {
        setAnimating(true)
        const results: number[] = []
        for (let i = 0; i < count; i++) {
            results.push(rollDie(sides))
        }
        const total = results.reduce((a, b) => a + b, 0) + mod

        const entry: RollEntry = {
            id: generateId(),
            dice: `${count}d${sides}`,
            results,
            total,
            modifier: mod,
            timestamp: new Date(),
            label,
        }

        // Petit délai pour l'animation
        setTimeout(() => {
            addRoll(entry)
            setAnimating(false)
        }, 200)
    }, [addRoll])

    const rollQuick = useCallback((config: typeof QUICK_ROLLS[0]) => {
        setAnimating(true)
        const [count, sides] = config.dice.split('d').map(Number)
        const results: number[] = []
        for (let i = 0; i < count; i++) {
            results.push(rollDie(sides))
        }

        let finalResults = [...results]
        if (config.keep === 'highest') {
            finalResults = [Math.max(...results)]
        } else if (config.keep === 'lowest') {
            finalResults = [Math.min(...results)]
        } else if (config.keep === 'highest3') {
            finalResults = results.sort((a, b) => b - a).slice(0, 3)
        }

        const total = finalResults.reduce((a, b) => a + b, 0) + config.modifier

        const entry: RollEntry = {
            id: generateId(),
            dice: config.dice,
            results,
            total,
            modifier: config.modifier,
            timestamp: new Date(),
            label: config.label,
        }

        setTimeout(() => {
            addRoll(entry)
            setAnimating(false)
        }, 200)
    }, [addRoll])

    const clearHistory = () => {
        if (confirm('Effacer l\'historique ?')) {
            setHistory([])
            setLastRoll(null)
        }
    }

    return (
        <div className="flex flex-col gap-4 animate-fade-in pb-8">
            {/* Header */}
            <header className="flex items-center gap-3 mb-2">
                <Link to="/" className="touch-target -ml-2">
                    <ChevronLeftIcon className="w-6 h-6" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </Link>
                <div className="flex-1">
                    <h1 className="font-cinzel text-2xl font-bold flex items-center gap-2">
                        <CubeIcon className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                        Dés
                    </h1>
                </div>
            </header>

            {/* Dernier résultat */}
            <div className="card text-center py-6 relative overflow-hidden">
                {animating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                )}
                {lastRoll ? (
                    <div className="animate-fade-in">
                        <p className="text-xs text-muted-foreground mb-1">
                            {lastRoll.label || lastRoll.dice}
                            {lastRoll.modifier !== 0 && ` ${lastRoll.modifier > 0 ? '+' : ''}${lastRoll.modifier}`}
                        </p>
                        <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
                            {lastRoll.results.map((r, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-lg font-bold"
                                >
                                    {r}
                                </span>
                            ))}
                        </div>
                        <p className="text-4xl font-bold font-cinzel" style={{ color: 'hsl(var(--primary))' }}>
                            {lastRoll.total}
                        </p>
                    </div>
                ) : (
                    <div className="text-muted-foreground">
                        <CubeIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Appuie sur un dé pour lancer</p>
                    </div>
                )}
            </div>

            {/* Modificateur */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Modificateur</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setModifier(m => m - 1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg font-bold hover:bg-muted/80"
                    >
                        −
                    </button>
                    <span className={`w-10 text-center font-bold ${modifier > 0 ? 'text-hp-high' : modifier < 0 ? 'text-hp-crit' : ''}`}>
                        {modifier >= 0 ? `+${modifier}` : modifier}
                    </span>
                    <button
                        onClick={() => setModifier(m => m + 1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg font-bold hover:bg-muted/80"
                    >
                        +
                    </button>
                </div>
                <button
                    onClick={() => setModifier(0)}
                    className="text-xs text-muted-foreground hover:text-foreground ml-auto"
                >
                    Réinitialiser
                </button>
            </div>

            {/* Types de dés */}
            <div className="grid grid-cols-4 gap-2">
                {DICE_TYPES.map(die => (
                    <button
                        key={die.sides}
                        onClick={() => rollDice(die.sides, 1, modifier)}
                        className={`${die.color} text-white rounded-xl p-3 flex flex-col items-center gap-1 shadow-sm hover:brightness-110 active:scale-95 transition-all`}
                    >
                        <span className="text-lg font-bold font-cinzel">{die.label}</span>
                        <span className="text-[10px] opacity-80">Lancer</span>
                    </button>
                ))}
            </div>

            {/* Jets rapides */}
            <div className="space-y-2">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Jets rapides
                </h2>
                <div className="flex flex-wrap gap-2">
                    {QUICK_ROLLS.map(roll => (
                        <button
                            key={roll.label}
                            onClick={() => rollQuick(roll)}
                            className="px-3 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 active:scale-95 transition-all"
                        >
                            {roll.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Historique */}
            {history.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            Historique
                        </h2>
                        <button onClick={clearHistory} className="touch-target">
                            <TrashIcon className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        {history.map(entry => (
                            <div
                                key={entry.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-sm"
                            >
                                <span className="text-xs text-muted-foreground w-12 shrink-0">
                                    {entry.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                <span className="font-medium w-20 shrink-0">
                                    {entry.label || entry.dice}
                                </span>
                                <span className="text-muted-foreground flex-1 truncate">
                                    {entry.results.join(', ')}
                                    {entry.modifier !== 0 && ` ${entry.modifier > 0 ? '+' : ''}${entry.modifier}`}
                                </span>
                                <span className="font-bold font-cinzel w-8 text-right" style={{ color: 'hsl(var(--primary))' }}>
                                    {entry.total}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
