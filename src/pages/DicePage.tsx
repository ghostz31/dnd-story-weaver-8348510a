import { useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
    ChevronLeftIcon,
    CubeIcon,
    TrashIcon,
} from '@heroicons/react/24/solid'
import { useSettings } from '../hooks/useSettings'
import { RollToast } from '../components/ui/RollToast'

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
    const { settings } = useSettings()
    const [history, setHistory] = useState<RollEntry[]>([])
    const [modifier, setModifier] = useState(0)
    const [lastRoll, setLastRoll] = useState<RollEntry | null>(null)
    const [animating, setAnimating] = useState(false)
    // Nombre de dés en cours de rolling (pour afficher les pastilles qui tournent)
    const [pendingCount, setPendingCount] = useState(0)
    // Toast de résultat (auto-dismiss 2.6s)
    const [toast, setToast] = useState<{ result: number; modifier: number; total: number; label: string } | null>(null)
    const resultCardRef = useRef<HTMLDivElement>(null)
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const addRoll = useCallback((entry: RollEntry) => {
        setLastRoll(entry)
        setHistory(prev => [entry, ...prev].slice(0, 50))
    }, [])

    // Déclenche le flash critique + screen-shake sur le conteneur de résultat.
    // Rejouable : retire les classes, force un reflow, puis les réapplique.
    const triggerCritFlash = useCallback(() => {
        const el = resultCardRef.current
        if (!el) return
        el.classList.remove('crit-flash', 'screen-shake')
        void el.offsetWidth
        el.classList.add('crit-flash', 'screen-shake')
        window.setTimeout(() => {
            el.classList.remove('crit-flash', 'screen-shake')
        }, 600)
    }, [])

    // Affiche le toast pendant 2.6s (durée de l'animation roll-toast dans effects.css)
    const showToast = useCallback((data: { result: number; modifier: number; total: number; label: string }) => {
        if (toastTimer.current) clearTimeout(toastTimer.current)
        setToast(data)
        toastTimer.current = setTimeout(() => setToast(null), 2600)
    }, [])

    // Durée de l'animation de rolling : 600ms si dice3d activé, sinon 200ms (feedback minimal)
    const rollDuration = settings.effects.dice3d ? 600 : 200

    const rollDice = useCallback((sides: number, count: number, mod: number, label?: string) => {
        setAnimating(true)
        setPendingCount(count)
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
            setPendingCount(0)

            // Crit : dé unique dont le résultat est le max du dé (nat 20 pour d20, etc.)
            if (settings.effects.critFlash && count === 1 && results[0] === sides) {
                triggerCritFlash()
            }

            // Toast de résultat
            if (settings.effects.chatToast) {
                showToast({
                    result: total - mod,
                    modifier: mod,
                    total,
                    label: label || entry.dice,
                })
            }
        }, rollDuration)
    }, [addRoll, rollDuration, settings.effects.critFlash, settings.effects.chatToast, showToast, triggerCritFlash])

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

        // Nombre de pastilles affichées pendant l'animation = nombre de dés lancés
        setPendingCount(count)

        setTimeout(() => {
            addRoll(entry)
            setAnimating(false)
            setPendingCount(0)

            // Crit : dé unique (après keep) dont le résultat est le max du dé
            if (settings.effects.critFlash && finalResults.length === 1 && finalResults[0] === sides) {
                triggerCritFlash()
            }

            if (settings.effects.chatToast) {
                showToast({
                    result: total - config.modifier,
                    modifier: config.modifier,
                    total,
                    label: config.label,
                })
            }
        }, rollDuration)
    }, [addRoll, rollDuration, settings.effects.critFlash, settings.effects.chatToast, showToast, triggerCritFlash])

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
            <div ref={resultCardRef} className="card text-center py-6 relative overflow-hidden">
                {animating && !settings.effects.dice3d && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                )}
                {lastRoll || animating ? (
                    <div className="animate-fade-in">
                        <p className="text-xs text-muted-foreground mb-1">
                            {(animating && pendingCount > 0) ? 'Lancement…' : (lastRoll?.label || lastRoll?.dice)}
                            {!animating && lastRoll && lastRoll.modifier !== 0 && ` ${lastRoll.modifier > 0 ? '+' : ''}${lastRoll.modifier}`}
                        </p>
                        <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
                            {animating
                                ? Array.from({ length: pendingCount }).map((_, i) => (
                                    <span
                                        key={i}
                                        className={`dice-3d rolling inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-lg font-bold${settings.effects.dice3d ? '' : ' opacity-60'}`}
                                        aria-hidden="true"
                                    />
                                ))
                                : lastRoll?.results.map((r, i) => (
                                    <span
                                        key={i}
                                        className={`dice-3d inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-lg font-bold`}
                                    >
                                        {r}
                                    </span>
                                ))}
                        </div>
                        <p className="text-4xl font-bold font-cinzel" style={{ color: 'hsl(var(--primary))' }}>
                            {animating ? '…' : lastRoll?.total}
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

            {/* Toast de résultat — affiché 2.6s après chaque roll si chatToast activé */}
            {toast && (
                <RollToast
                    result={toast.result}
                    modifier={toast.modifier}
                    total={toast.total}
                    label={toast.label}
                    visible={!!toast}
                />
            )}
        </div>
    )
}
