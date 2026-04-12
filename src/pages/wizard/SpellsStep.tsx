import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { loadAllSpells, classIdToSpellClassName, getSpellsForClass } from '../../data/spells'
import { getAlwaysPreparedSpells, getSubclassSpellLabel, isAlwaysPreparedSpell } from '../../data/subclassSpells'
import { getMaxSpellLevel } from '../../utils/spellUtils'
import { CheckCircleIcon, SparklesIcon, LockClosedIcon } from '@heroicons/react/24/solid'
import { useState, useEffect, useMemo } from 'react'
import type { Spell } from '../../types/spell'

export function SpellsStep() {
    const { character, updateCharacter } = useWizard()
    const [allSpells, setAllSpells] = useState<Spell[]>([])
    const [selected, setSelected] = useState<string[]>(character.selectedSpells || [])
    const [loading, setLoading] = useState(true)

    const characterClass = character.characterClass
    if (!characterClass || !characterClass.spellcasting) {
        return (
            <WizardShell
                title="Sorts"
                subtitle="Votre classe ne possède pas de capacités magiques"
            >
                <div className="card text-center p-8">
                    <SparklesIcon className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                    <p className="text-ink-muted">
                        Les {characterClass?.name} ne lancent pas de sorts. Vous pouvez passer à l'étape suivante.
                    </p>
                </div>
            </WizardShell>
        )
    }

    // Charger les sorts
    useEffect(() => {
        loadAllSpells().then(spells => {
            setAllSpells(spells)
            setLoading(false)
        })
    }, [])

    const { cantripsKnown } = characterClass.spellcasting
    const levelIndex = character.level - 1
    const numCantrips = cantripsKnown[levelIndex] || 0
    const maxSpellLevel = getMaxSpellLevel(characterClass, character.level)

    // Nombre de sorts préparables/connus
    const numSpells = useMemo(() => {
        if (characterClass.spellcasting?.spellsKnown) {
            // Barde, Ensorceleur, Rôdeur, Occultiste — sorts connus
            return characterClass.spellcasting.spellsKnown[levelIndex] || 0
        }
        // Clerc, Druide, Paladin — sorts préparés = mod + niveau
        const abilityKey = characterClass.spellcasting?.ability || 'wis'
        const abilityMod = Math.floor(((character.abilityScores[abilityKey] || 10) - 10) / 2)
        if (characterClass.id === 'paladin' || characterClass.id === 'ranger') {
            return Math.max(1, abilityMod + Math.floor(character.level / 2))
        }
        return Math.max(1, abilityMod + character.level)
    }, [characterClass, character.level, character.abilityScores, levelIndex])

    // Nom de classe pour le filtrage des sorts
    const spellClassName = classIdToSpellClassName[characterClass.id] || ''

    // Sorts disponibles pour cette classe
    const classSpells = useMemo(() => {
        if (!spellClassName || allSpells.length === 0) return []
        return getSpellsForClass(allSpells, spellClassName, maxSpellLevel)
    }, [allSpells, spellClassName, maxSpellLevel])

    // Pas de sous-classe dans le wizard de création (choix au level-up)
    const subclassId: string | undefined = undefined
    const alwaysPrepared = useMemo(() =>
        getAlwaysPreparedSpells(subclassId, character.level),
        [subclassId, character.level]
    )
    const subclassLabel = getSubclassSpellLabel(subclassId)

    // Grouper par niveau
    const spellsByLevel = useMemo(() => {
        const grouped = new Map<number, Spell[]>()
        for (const spell of classSpells) {
            const list = grouped.get(spell.level) || []
            list.push(spell)
            grouped.set(spell.level, list)
        }
        // Trier par nom dans chaque groupe
        grouped.forEach((list, level) => {
            grouped.set(level, list.sort((a, b) => a.name.localeCompare(b.name, 'fr')))
        })
        return grouped
    }, [classSpells])

    const toggleSpell = (spellName: string, isCantrip: boolean) => {
        // Ne pas permettre de désélectionner les sorts toujours préparés
        if (isAlwaysPreparedSpell(spellName, subclassId, character.level)) return

        if (selected.includes(spellName)) {
            setSelected(prev => prev.filter(n => n !== spellName))
        } else {
            if (isCantrip) {
                const currentCantrips = selected.filter(n =>
                    classSpells.find(s => s.name === n)?.level === 0
                ).length
                if (currentCantrips < numCantrips) {
                    setSelected(prev => [...prev, spellName])
                }
            } else {
                const currentLeveled = selected.filter(n => {
                    const spell = classSpells.find(s => s.name === n)
                    return spell && spell.level > 0
                }).length
                if (currentLeveled < numSpells) {
                    setSelected(prev => [...prev, spellName])
                }
            }
        }
    }

    useEffect(() => {
        updateCharacter({ selectedSpells: selected })
    }, [selected])

    const selectedCantripsCount = selected.filter(n =>
        classSpells.find(s => s.name === n)?.level === 0
    ).length
    const selectedLeveledCount = selected.filter(n => {
        const spell = classSpells.find(s => s.name === n)
        return spell && spell.level > 0
    }).length

    if (loading) {
        return (
            <WizardShell title="Grimoire et Sorts" subtitle="Chargement des sorts...">
                <div className="card h-32 animate-pulse bg-muted/20" />
            </WizardShell>
        )
    }

    return (
        <WizardShell
            title="Grimoire et Sorts"
            subtitle={`Choisissez vos sorts de ${characterClass.name}`}
        >
            <div className="space-y-8">
                {/* Sorts de sous-classe (toujours préparés) */}
                {alwaysPrepared.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <LockClosedIcon className="w-4 h-4 text-amber-500" />
                            <h3 className="font-bold text-ink text-sm">{subclassLabel}</h3>
                            <span className="text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                Toujours préparés
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                            {alwaysPrepared.map(spellName => {
                                const spell = allSpells.find(s => s.name === spellName)
                                return (
                                    <div
                                        key={spellName}
                                        className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-bold text-ink text-sm">{spellName}</span>
                                                {spell && (
                                                    <span className="text-[10px] text-ink-muted ml-2">
                                                        Niv {spell.level} • {spell.school}
                                                    </span>
                                                )}
                                            </div>
                                            <LockClosedIcon className="w-4 h-4 text-amber-500" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Cantrips */}
                {numCantrips > 0 && spellsByLevel.has(0) && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-ink">Sorts mineurs (Cantrips)</h3>
                            <span className={`text-sm font-bold ${selectedCantripsCount === numCantrips ? 'text-green-600' : 'text-primary'}`}>
                                {selectedCantripsCount} / {numCantrips}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {spellsByLevel.get(0)?.map(spell => (
                                <button
                                    key={spell.name}
                                    onClick={() => toggleSpell(spell.name, true)}
                                    className={`text-left p-3 rounded-lg border transition-all ${selected.includes(spell.name)
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border bg-card'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-ink text-sm">{spell.name}</span>
                                        {selected.includes(spell.name) && <CheckCircleIcon className="w-4 h-4 text-primary" />}
                                    </div>
                                    <p className="text-[10px] text-ink-muted leading-relaxed">
                                        {spell.description?.slice(0, 100)}...
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Leveled Spells by level */}
                {numSpells > 0 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-ink">Sorts</h3>
                            <span className={`text-sm font-bold ${selectedLeveledCount === numSpells ? 'text-green-600' : 'text-primary'}`}>
                                {selectedLeveledCount} / {numSpells}
                            </span>
                        </div>

                        {Array.from(spellsByLevel.entries())
                            .filter(([level]) => level > 0)
                            .sort(([a], [b]) => a - b)
                            .map(([level, spells]) => (
                                <div key={level} className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted border-b border-border pb-1">
                                        Niveau {level} ({spells.length} sorts)
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {spells.map(spell => {
                                            const isOath = isAlwaysPreparedSpell(spell.name, subclassId, character.level)
                                            return (
                                                <button
                                                    key={spell.name}
                                                    onClick={() => toggleSpell(spell.name, false)}
                                                    disabled={isOath}
                                                    className={`text-left p-3 rounded-lg border transition-all ${isOath
                                                        ? 'border-amber-500/30 bg-amber-500/5 opacity-60 cursor-not-allowed'
                                                        : selected.includes(spell.name)
                                                            ? 'border-secondary bg-secondary/10'
                                                            : 'border-border bg-card'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-ink text-sm">{spell.name}</span>
                                                            {isOath && (
                                                                <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                                                    {subclassLabel}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {(selected.includes(spell.name) || isOath) && (
                                                            <CheckCircleIcon className={`w-4 h-4 ${isOath ? 'text-amber-500' : 'text-secondary'}`} />
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-ink-muted leading-relaxed">
                                                        {spell.school} • {spell.castingTime} • {spell.range}
                                                    </p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </WizardShell>
    )
}
