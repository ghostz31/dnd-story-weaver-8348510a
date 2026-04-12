import { useState } from 'react'
import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { races } from '../../data/races'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

const sourceColor: Record<string, string> = {
    XGtE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    TCoE: 'bg-violet-500/20 text-violetald-400 border-violet-500/30',
}

export function RaceStep() {
    const { character, updateCharacter } = useWizard()
    const [expandedRace, setExpandedRace] = useState<string | null>(null)

    const handleRaceSelect = (race: typeof races[0]) => {
        updateCharacter({
            race,
            subrace: race.subraces && race.subraces.length > 0 ? null : undefined
        })
        if (race.subraces && race.subraces.length > 0) {
            setExpandedRace(race.id)
        }
    }

    const handleSubraceSelect = (subraceId: string) => {
        updateCharacter({ subrace: subraceId })
    }

    const getAbilityBonusText = (bonuses: Record<string, number>) => {
        return Object.entries(bonuses)
            .map(([key, value]) => `${key.toUpperCase()} +${value}`)
            .join(', ')
    }

    return (
        <WizardShell
            title="Choisir une race"
            subtitle="Votre race détermine vos traits physiques et culturels"
        >
            <div className="flex flex-col gap-sm">
                {races.map((race) => {
                    const isSelected = character.race?.id === race.id
                    const isExpanded = expandedRace === race.id

                    return (
                        <div key={race.id}>
                            <button
                                onClick={() => handleRaceSelect(race)}
                                className={`w-full text-left p-4 rounded-lg border transition-all ${isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-card'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-lg text-ink">{race.name}</span>
                                            {/* Badge source XGtE / TCoE */}
                                            {race.source && race.source !== 'PHB' && (
                                                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${sourceColor[race.source] ?? 'bg-muted text-ink-muted border-border'}`}>
                                                    {race.source}
                                                </span>
                                            )}
                                            {isSelected && (
                                                <CheckCircleIcon className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <p className="text-sm text-ink-muted mt-1">
                                            {/* Bonus fixes ou bonus libres TCoE */}
                                            {Object.keys(race.abilityBonuses).length > 0
                                                ? getAbilityBonusText(race.abilityBonuses as Record<string, number>)
                                                : race.customAbilityBonuses
                                                    ? `+${race.customAbilityBonuses} points à répartir librement`
                                                    : 'Aucun bonus fixe'
                                            }
                                        </p>
                                        <p className="text-xs text-ink-muted/80 mt-1">
                                            Vitesse: {race.speed} ft • Taille: {race.size}
                                        </p>
                                    </div>
                                </div>

                                {/* Traits preview */}
                                <div className="mt-3 pt-3 border-t border-border/50">
                                    <p className="text-xs text-ink-muted">
                                        <strong className="text-ink">Traits:</strong> {race.traits.slice(0, 3).join(', ')}
                                        {race.traits.length > 3 && '...'}
                                    </p>
                                </div>
                            </button>

                            {/* Subraces */}
                            {isExpanded && race.subraces && race.subraces.length > 0 && (
                                <div className="ml-4 mt-2 flex flex-col gap-2 animate-fade-in">
                                    <p className="text-sm font-semibold text-ink-muted">Choisir une sous-race :</p>
                                    {race.subraces.map((subrace) => (
                                        <button
                                            key={subrace.id}
                                            onClick={() => handleSubraceSelect(subrace.id)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${character.subrace === subrace.id
                                                ? 'border-secondary bg-secondary/10'
                                                : 'border-border bg-muted/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-ink">{subrace.name}</span>
                                                {character.subrace === subrace.id && (
                                                    <CheckCircleIcon className="w-4 h-4 text-secondary" />
                                                )}
                                            </div>
                                            <p className="text-xs text-ink-muted mt-1">
                                                {getAbilityBonusText(subrace.abilityBonuses as Record<string, number>)}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </WizardShell>
    )
}
