import { useState, useEffect } from 'react'
import type { AsiChoice, AbilityScores } from '../types/character'
import type { Feat } from '../data/feats'
import { PlusIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import { checkFeatPrerequisites } from '../utils/feat-prerequisites'

interface AsiSelectorProps {
    level: number
    choice?: AsiChoice
    onChoiceChange: (choice: AsiChoice) => void
    availableFeats: Feat[]
    character?: unknown
    forceMode?: 'stats' | 'feat'
    title?: string
}

const abilityNames: Record<keyof AbilityScores, string> = {
    str: 'Force',
    dex: 'Dextérité',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Sagesse',
    cha: 'Charisme',
}

const sourceColor: Record<string, string> = {
    XGtE: 'bg-hp-high/20 text-hp-high border-hp-high/30',
    TCoE: 'bg-violet-500/20 text-violetald-400 border-violet-500/30',
}

export function AsiSelector({ level, choice, onChoiceChange, availableFeats, character, forceMode, title }: AsiSelectorProps) {
    const effectiveMode = forceMode || choice?.type || 'stats'
    const [mode, setMode] = useState<'stats' | 'feat'>(effectiveMode)
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedFeat, setExpandedFeat] = useState<string | null>(null)

    // Persistance des choix lors du changement d'onglet
    const [lastStats, setLastStats] = useState<Record<string, number>>({})
    const [lastFeatId, setLastFeatId] = useState<string | undefined>(undefined)

    // Mettre à jour les "derniers choix" quand le choix actuel change
    useEffect(() => {
        if (choice?.type === 'stats') {
            setLastStats(choice.stats || {})
        } else if (choice?.type === 'feat') {
            if (choice.featId) setLastFeatId(choice.featId)
        }
    }, [choice])

    const handleStatChange = (stat: keyof AbilityScores, value: number) => {
        const currentStats = choice?.stats || {}
        const newStats: Record<string, number> = {}

        // Copier proprement en s'assurant que tout est numérique
        for (const [key, val] of Object.entries(currentStats)) {
            const num = Number(val)
            if (!isNaN(num) && num > 0) newStats[key] = num
        }

        // Si on veut ajouter +1
        if (value === 1) {
            newStats[stat] = (newStats[stat] || 0) + 1
        } else {
            // Si on veut retirer (reset)
            delete newStats[stat]
        }

        // Vérifier qu'on ne dépasse pas +2 au total
        const total = Object.values(newStats).reduce((a, b) => a + b, 0)
        if (total > 2) return // Bloquer si > 2 points assignés

        onChoiceChange({
            type: 'stats',
            stats: newStats
        })
    }

    const handleFeatSelect = (featId: string) => {
        const feat = availableFeats.find(f => f.id === featId)
        const asiChoiceStats: Record<string, number> = {}

        if (feat) {
            if (feat.asiChoices && feat.asiChoices.length > 0) {
                // Auto-select the first ASI option for half-feats with choices
                const firstChoice = feat.asiChoices[0]
                Object.entries(firstChoice).forEach(([key, val]) => {
                    if (val !== undefined) asiChoiceStats[key] = val
                })
            } else if (feat.abilityScoreIncrease) {
                Object.entries(feat.abilityScoreIncrease).forEach(([key, val]) => {
                    if (val !== undefined) asiChoiceStats[key] = val
                })
            }
        }

        onChoiceChange({
            type: 'feat',
            featId,
            stats: Object.keys(asiChoiceStats).length > 0 ? asiChoiceStats : undefined,
        })
    }

    const filteredFeats = availableFeats.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedStatCount = choice?.type === 'stats'
        ? Object.values(choice.stats || {}).reduce((a, b) => Number(a) + Number(b), 0)
        : 0

    return (
        <div className="card border-l-4 border-l-secondary p-4 mb-4">
            <h4 className="font-bold text-lg md:text-xl mb-2 flex items-center gap-2 md:gap-3">
                <span className="badge badge-primary">{level > 0 ? `Niveau ${level}` : 'Départ'}</span>
                {title || 'Amélioration de Caractéristique'}
            </h4>

            {!forceMode && (
                <div className="flex gap-2 md:gap-3 mb-4">
                    <button
                        onClick={() => {
                            setMode('stats')
                            onChoiceChange({ type: 'stats', stats: lastStats })
                        }}
                        className={`flex-1 btn btn-sm ${mode === 'stats' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <PlusIcon className="w-4 h-4 md:w-5 md:h-5 mr-1" />
                        Augmenter Stats
                    </button>
                    <button
                        onClick={() => {
                            setMode('feat')
                            onChoiceChange({ type: 'feat', featId: lastFeatId })
                        }}
                        className={`flex-1 btn btn-sm ${mode === 'feat' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <SparklesIcon className="w-4 h-4 md:w-5 md:h-5 mr-1" />
                        Choisir un Don
                    </button>
                </div>
            )}

            {mode === 'stats' && (
                <div className="space-y-3 animate-fade-in">
                    <p className="text-sm md:text-base text-ink-muted">
                        Choisissez comment répartir vos <strong>2 points</strong>.
                        Vous pouvez mettre +2 dans une caractéristique ou +1 dans deux différentes.
                        (Points assignés : {selectedStatCount}/2)
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                        {(Object.keys(abilityNames) as Array<keyof AbilityScores>).map(stat => {
                            const currentVal = Number(choice?.stats?.[stat]) || 0
                            const canIncrease = selectedStatCount < 2 && currentVal < 2

                            return (
                                <div key={stat} className={`p-3 md:p-4 rounded border transition-colors ${currentVal > 0 ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-ink">{abilityNames[stat]}</span>
                                        <span className="font-cinzel font-bold text-lg md:text-xl text-primary">
                                            {currentVal > 0 ? `+${currentVal}` : '-'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 justify-end">
                                        <button
                                            onClick={() => handleStatChange(stat, 1)}
                                            disabled={!canIncrease}
                                            className="btn btn-xs btn-secondary w-6 h-6 flex items-center justify-center p-0"
                                        >
                                            +
                                        </button>
                                        {currentVal > 0 && (
                                            <button
                                                onClick={() => {
                                                    const newStats = { ...(choice?.stats || {}) }
                                                    newStats[stat] = currentVal - 1
                                                    if (newStats[stat] === 0) delete newStats[stat]
                                                    onChoiceChange({ type: 'stats', stats: newStats })
                                                }}
                                                className="btn btn-xs btn-ghost w-6 h-6 flex items-center justify-center p-0 text-destructive hover:text-destructive"
                                            >
                                                -
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {mode === 'feat' && (
                <div className="space-y-3 animate-fade-in">
                    <input
                        type="text"
                        placeholder="Rechercher un don..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input w-full"
                    />

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {filteredFeats.map(feat => {
                            const isSelected = choice?.featId === feat.id
                            const prereqCheck = character ? checkFeatPrerequisites(character as Record<string, unknown>, feat) : { valid: true }
                            const isUnavailable = !prereqCheck.valid
                            return (
                                <div
                                    key={feat.id}
                                    className={`w-full text-left rounded border transition-all ${isSelected ? 'border-primary bg-primary/10' : isUnavailable ? 'border-border bg-muted/30 opacity-60' : 'border-border bg-card'}`}
                                >
                                    <div
                                        className={`p-3 md:p-4 ${isUnavailable ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'}`}
                                        onClick={() => {
                                            if (!isUnavailable) handleFeatSelect(feat.id)
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${isUnavailable ? 'text-ink-muted' : 'text-ink'}`}>{feat.name}</span>
                                                {feat.source && feat.source !== 'PHB' && (
                                                    <span className={`text-xs md:text-sm px-1.5 py-0.5 rounded border border-opacity-50 ${sourceColor[feat.source] || ''}`}>
                                                        {feat.source}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {feat.abilityScoreIncrease && (
                                                    <span className="text-xs md:text-sm bg-secondary/20 text-secondary px-1.5 py-0.5 rounded whitespace-nowrap">
                                                        +{Object.values(feat.abilityScoreIncrease)[0]} {abilityNames[Object.keys(feat.abilityScoreIncrease)[0] as keyof AbilityScores] || Object.keys(feat.abilityScoreIncrease)[0].toUpperCase()}
                                                    </span>
                                                )}
                                                {feat.asiChoices && feat.asiChoices.length > 0 && (
                                                    <span className="text-xs md:text-sm bg-secondary/20 text-secondary px-1.5 py-0.5 rounded whitespace-nowrap">
                                                        +1 au choix
                                                    </span>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setExpandedFeat(expandedFeat === feat.id ? null : feat.id)
                                                    }}
                                                    className="p-1 hover:bg-muted rounded-full"
                                                >
                                                    {expandedFeat === feat.id ? (
                                                        <ChevronUpIcon className="w-4 h-4 md:w-5 md:h-5 text-ink-muted" />
                                                    ) : (
                                                        <ChevronDownIcon className="w-4 h-4 md:w-5 md:h-5 text-ink-muted" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {feat.prerequisite && (
                                            <p className={`text-xs md:text-sm mb-1 ${isUnavailable ? 'text-destructive font-medium' : 'text-destructive'}`}>
                                                Prérequis : {feat.prerequisite}
                                                {isUnavailable && prereqCheck.reason && (
                                                    <span className="block mt-0.5">{prereqCheck.reason}</span>
                                                )}
                                            </p>
                                        )}

                                        <p className={`text-xs md:text-sm text-ink-muted ${expandedFeat === feat.id ? '' : 'line-clamp-2'}`}>
                                            {feat.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        {filteredFeats.length === 0 && (
                            <p className="text-center text-ink-muted py-4">Aucun don trouvé.</p>
                        )}
                    </div>
                    {choice?.type === 'feat' && choice.featId && (() => {
                        const selectedFeat = availableFeats.find(f => f.id === choice.featId)
                        if (!selectedFeat?.asiChoices || selectedFeat.asiChoices.length === 0) return null
                        const currentAbility = choice.stats ? Object.keys(choice.stats)[0] : null
                        return (
                            <div className="mt-3 p-3 md:p-4 rounded-lg bg-primary/5 border border-primary/20">
                                <p className="text-xs md:text-sm font-bold text-primary mb-2">Choisir la caractéristique à augmenter :</p>
                                <div className="flex flex-wrap gap-2 md:gap-3">
                                    {selectedFeat.asiChoices.map((asiOption, i) => {
                                        const ability = Object.keys(asiOption)[0] as keyof AbilityScores
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    onChoiceChange({
                                                        type: 'feat',
                                                        featId: choice.featId,
                                                        stats: { [ability]: 1 },
                                                    })
                                                }}
                                                className={`px-3 py-1.5 rounded text-sm md:text-base font-medium transition ${currentAbility === ability ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:border-primary/50'}`}
                                            >
                                                {abilityNames[ability]}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })()}
                </div>
            )}
        </div>
    )
}
