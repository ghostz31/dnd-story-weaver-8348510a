import { useState } from 'react'
import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import type { AbilityScores } from '../../types/character'

type AbilityKey = keyof AbilityScores

const abilityInfo: Record<AbilityKey, { name: string; desc: string }> = {
    str: { name: 'Force', desc: 'Puissance physique' },
    dex: { name: 'Dextérité', desc: 'Agilité et réflexes' },
    con: { name: 'Constitution', desc: 'Endurance et santé' },
    int: { name: 'Intelligence', desc: 'Mémoire et logique' },
    wis: { name: 'Sagesse', desc: 'Perception et intuition' },
    cha: { name: 'Charisme', desc: 'Force de personnalité' },
}

const standardArray = [15, 14, 13, 12, 10, 8]

type Method = 'standard' | 'pointbuy' | 'roll'

export function AbilitiesStep() {
    const { character, updateCharacter } = useWizard()
    const [method, setMethod] = useState<Method>('standard')
    const [availableScores, setAvailableScores] = useState<number[]>([...standardArray])
    const [pointsRemaining, setPointsRemaining] = useState(27)

    const getModifier = (score: number) => Math.floor((score - 10) / 2)

    const formatModifier = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`)

    const getPointBuyCost = (score: number) => {
        const costs: Record<number, number> = {
            8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
        }
        return costs[score] ?? 0
    }

    // Get racial bonuses for display
    const racialBonuses = character.race?.abilityBonuses || {}
    const subrace = character.race?.subraces?.find(s => s.id === character.subrace)
    const subraceBonus = subrace?.abilityBonuses || {}

    const getTotalScore = (ability: AbilityKey) => {
        const base = character.abilityScores[ability]
        const racial = (racialBonuses[ability] || 0) + (subraceBonus[ability] || 0)
        return base + racial
    }

    const handleScoreAssign = (ability: AbilityKey, score: number) => {
        const currentScore = character.abilityScores[ability]

        // Return current score to available if it was from standard array
        const newAvailable = currentScore !== 10
            ? [...availableScores, currentScore].sort((a, b) => b - a)
            : availableScores

        // Remove new score from available
        const index = newAvailable.indexOf(score)
        if (index > -1) {
            newAvailable.splice(index, 1)
        }

        setAvailableScores(newAvailable)
        updateCharacter({
            abilityScores: { ...character.abilityScores, [ability]: score },
        })
    }

    const handlePointBuyChange = (ability: AbilityKey, delta: number) => {
        const currentScore = character.abilityScores[ability]
        const newScore = currentScore + delta

        if (newScore < 8 || newScore > 15) return

        const oldCost = getPointBuyCost(currentScore)
        const newCost = getPointBuyCost(newScore)
        const pointChange = newCost - oldCost

        if (pointsRemaining - pointChange < 0) return

        setPointsRemaining(prev => prev - pointChange)
        updateCharacter({
            abilityScores: { ...character.abilityScores, [ability]: newScore },
        })
    }

    const rollAbilities = () => {
        const rollStat = () => {
            const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
            rolls.sort((a, b) => b - a)
            return rolls.slice(0, 3).reduce((a, b) => a + b, 0)
        }

        const newScores: AbilityScores = {
            str: rollStat(),
            dex: rollStat(),
            con: rollStat(),
            int: rollStat(),
            wis: rollStat(),
            cha: rollStat(),
        }
        updateCharacter({ abilityScores: newScores })
    }

    return (
        <WizardShell
            title="Caractéristiques"
            subtitle="Définissez les capacités de votre personnage"
        >
            {/* Method selector */}
            <div className="flex gap-sm mb-lg">
                {[
                    { id: 'standard', label: 'Standard' },
                    { id: 'pointbuy', label: 'Point Buy' },
                    { id: 'roll', label: 'Dés' },
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => {
                            setMethod(m.id as Method)
                            if (m.id === 'standard') {
                                setAvailableScores([...standardArray])
                                updateCharacter({
                                    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                                })
                            } else if (m.id === 'pointbuy') {
                                setPointsRemaining(27)
                                updateCharacter({
                                    abilityScores: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
                                })
                            }
                        }}
                        className={`flex-1 btn ${method === m.id ? 'btn-primary' : 'btn-secondary'
                            }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Roll button */}
            {method === 'roll' && (
                <button
                    onClick={rollAbilities}
                    className="btn btn-primary w-full mb-lg"
                >
                    🎲 Lancer les dés (4d6 drop lowest)
                </button>
            )}

            {/* Point buy remaining */}
            {method === 'pointbuy' && (
                <div className="text-center mb-8 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-ink-muted">Points utilisés :</span>
                        <span className="font-bold text-xl text-primary">
                            {27 - pointsRemaining} / 27
                        </span>
                    </div>
                    <p className={`text-sm mt-1 ${pointsRemaining < 0 ? 'text-hp font-bold' : pointsRemaining === 0 ? 'text-warning font-bold' : 'text-ink-muted'}`}>
                        {pointsRemaining === 0 ? 'Budget épuisé' : `${pointsRemaining} point${pointsRemaining > 1 ? 's' : ''} restant${pointsRemaining > 1 ? 's' : ''}`}
                    </p>
                </div>
            )}

            {/* Standard array available */}
            {method === 'standard' && availableScores.length > 0 && (
                <div className="mb-8">
                    <p className="text-sm text-ink-muted mb-2 uppercase tracking-wide font-semibold">Scores disponibles:</p>
                    <div className="flex gap-2 flex-wrap">
                        {availableScores.map((score, i) => (
                            <span
                                key={i}
                                className="px-4 py-2 bg-muted/40 border border-border/50 rounded-lg font-bold text-ink"
                            >
                                {score}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Ability scores */}
            <div className="flex flex-col gap-sm">
                {(Object.keys(abilityInfo) as AbilityKey[]).map((ability) => {
                    const info = abilityInfo[ability]
                    const baseScore = character.abilityScores[ability]
                    const totalScore = getTotalScore(ability)
                    const modifier = getModifier(totalScore)
                    const bonus = (racialBonuses[ability] || 0) + (subraceBonus[ability] || 0)

                    return (
                        <div
                            key={ability}
                            className="card flex items-center gap-4"
                        >
                            <div className="flex-1">
                                <p className="font-semibold text-ink">{info.name}</p>
                                <p className="text-xs text-ink-muted leading-tight">{info.desc}</p>
                                {bonus > 0 && (
                                    <p className="text-xs text-secondary font-bold mt-1">+{bonus} racial</p>
                                )}
                            </div>

                            {method === 'standard' && (
                                <select
                                    value={baseScore}
                                    onChange={(e) => handleScoreAssign(ability, parseInt(e.target.value))}
                                    className="input w-20 text-center"
                                >
                                    <option value={10}>--</option>
                                    {[...availableScores, ...(baseScore !== 10 ? [baseScore] : [])]
                                        .sort((a, b) => b - a)
                                        .map((score) => (
                                            <option key={score} value={score}>
                                                {score}
                                            </option>
                                        ))}
                                </select>
                            )}

                            {method === 'pointbuy' && (
                                <div className="flex items-center gap-sm">
                                    <button
                                        onClick={() => handlePointBuyChange(ability, -1)}
                                        disabled={baseScore <= 8}
                                        className="btn btn-icon btn-secondary"
                                    >
                                        −
                                    </button>
                                    <div className="w-10 text-center">
                                        <span className="block font-bold">{baseScore}</span>
                                        <span className="block text-[10px] text-ink-muted leading-none">
                                            {getPointBuyCost(baseScore)} pts
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handlePointBuyChange(ability, 1)}
                                        disabled={baseScore >= 15 || pointsRemaining <= 0}
                                        className="btn btn-icon btn-secondary"
                                    >
                                        +
                                    </button>
                                </div>
                            )}

                            {method === 'roll' && (
                                <span className="text-xl font-bold w-12 text-center">{baseScore}</span>
                            )}

                            <div className="text-center w-16">
                                <p className="text-2xl font-bold text-ink">{totalScore}</p>
                                <p className="text-sm font-bold text-primary">
                                    {formatModifier(modifier)}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </WizardShell>
    )
}
