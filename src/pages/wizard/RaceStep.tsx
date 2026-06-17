import { useState, useEffect } from 'react'
import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { loadRaces } from '../../data/aurora-loader'
import { convertAuroraRaces } from '../../utils/race-converter'
import type { Race } from '../../types/character'
import { CheckCircleIcon, ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/solid'

const sourceColor: Record<string, string> = {
    PHB: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    XGtE: 'bg-hp-high/20 text-hp-high border-hp-high/30',
    TCoE: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    EEPC: 'bg-magic/20 text-magic border-magic/30',
    MotM: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
}

export function RaceStep() {
    const { character, updateCharacter } = useWizard()
    const [races, setRaces] = useState<Race[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedRace, setExpandedRace] = useState<string | null>(null)

    useEffect(() => {
        loadRaces().then(data => {
            const converted = convertAuroraRaces(data.races, data.traits)
            setRaces(converted)
            setLoading(false)
        })
    }, [])

    const handleRaceSelect = (race: Race) => {
        updateCharacter({
            race,
            subrace: race.subraces && race.subraces.length > 0 ? null : undefined
        })
        if (race.subraces && race.subraces.length > 0) {
            setExpandedRace(race.id)
        } else {
            setExpandedRace(null)
        }
    }

    const handleSubraceSelect = (subraceId: string) => {
        updateCharacter({ subrace: subraceId })
    }

    const getAbilityBonusText = (bonuses: Partial<Record<string, number>>) => {
        const entries = Object.entries(bonuses).filter(([, v]) => v !== undefined && v !== 0)
        if (entries.length === 0) return null
        return entries.map(([key, value]) => `${key.toUpperCase()} +${value}`).join(', ')
    }

    if (loading) {
        return (
            <WizardShell title="Choisir une race" subtitle="Chargement des données Aurora...">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            </WizardShell>
        )
    }

    return (
        <WizardShell
            title="Choisir une race"
            subtitle={`${races.length} races disponibles • Données Aurora V2`}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {races.map((race) => {
                    const isSelected = character.race?.id === race.id
                    const isExpanded = expandedRace === race.id
                    const bonusText = getAbilityBonusText(race.abilityBonuses)

                    return (
                        <div key={race.id} className="flex flex-col">
                            <button
                                onClick={() => handleRaceSelect(race)}
                                className={`text-left rounded-xl border-2 transition-all ${isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-card hover:border-primary/30'
                                }`}
                            >
                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-lg">{race.name}</h3>
                                                {race.source && race.source !== 'PHB' && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${sourceColor[race.source] ?? 'bg-muted text-muted-foreground border-border'}`}>
                                                        {race.source}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {race.nameEn}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <CheckCircleIcon className="w-6 h-6 text-primary shrink-0" />
                                        )}
                                    </div>

                                    {/* Stats row */}
                                    <div className="flex items-center gap-3 mt-3 text-xs">
                                        <StatBadge label="Vitesse" value={`${race.speed}m`} />
                                        <StatBadge label="Taille" value={race.size} />
                                        {bonusText && (
                                            <StatBadge label="Bonus" value={bonusText} highlight />
                                        )}
                                    </div>

                                    {/* Traits preview */}
                                    {race.traits.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {race.traits.slice(0, 4).map(trait => (
                                                <span key={trait} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                    {trait}
                                                </span>
                                            ))}
                                            {race.traits.length > 4 && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                    +{race.traits.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Expand hint if subraces */}
                                {race.subraces && race.subraces.length > 0 && (
                                    <div className={`px-4 pb-2 flex items-center gap-1 text-xs text-muted-foreground transition-colors ${isExpanded ? 'text-primary' : ''}`}>
                                        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        {race.subraces.length} sous-race{race.subraces.length > 1 ? 's' : ''}
                                    </div>
                                )}
                            </button>

                            {/* Subraces */}
                            {isExpanded && race.subraces && race.subraces.length > 0 && (
                                <div className="ml-3 mt-2 flex flex-col gap-2 animate-fade-in">
                                    {race.subraces.map((subrace) => {
                                        const subBonus = getAbilityBonusText(subrace.abilityBonuses)
                                        const isSubSelected = character.subrace === subrace.id
                                        return (
                                            <button
                                                key={subrace.id}
                                                onClick={() => handleSubraceSelect(subrace.id)}
                                                className={`text-left p-3 rounded-lg border transition-all ${isSubSelected
                                                    ? 'border-secondary bg-secondary/10'
                                                    : 'border-border bg-muted/30 hover:bg-muted/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <SparklesIcon className="w-4 h-4 text-magic" />
                                                    <span className="font-medium">{subrace.name}</span>
                                                    {isSubSelected && (
                                                        <CheckCircleIcon className="w-4 h-4 text-secondary ml-auto" />
                                                    )}
                                                </div>
                                                {subBonus && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {subBonus}
                                                    </p>
                                                )}
                                                {subrace.traits.length > 0 && (
                                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                                        {subrace.traits.map(t => (
                                                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </WizardShell>
    )
}

function StatBadge({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] ${
            highlight ? 'bg-primary/10 text-primary font-medium' : 'bg-muted text-muted-foreground'
        }`}>
            <span className="opacity-70">{label}:</span>
            <span>{value}</span>
        </div>
    )
}
