import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCharacter } from '../contexts/CharacterContext'
import { ArrowLeftIcon, SparklesIcon, HeartIcon, ArrowUpIcon, BookOpenIcon, CheckIcon, StarIcon } from '@heroicons/react/24/outline'
import { LockClosedIcon } from '@heroicons/react/24/solid'
import type { LevelUpStep, ASIChoice, LevelUpChoices } from '../types/levelup'
import type { Spell } from '../types/spell'
import { getClassFeaturesAtLevel } from '../data/classFeatures'
import { subclasses } from '../data/subclasses'
import { loadAllSpells, classIdToSpellClassName, getSpellsForClass } from '../data/spells'
import { getAlwaysPreparedSpells, getSubclassSpellLabel, isAlwaysPreparedSpell } from '../data/subclassSpells'
import { getMaxSpellLevel } from '../utils/spellUtils'
import { AsiSelector } from '../components/AsiSelector'
import { getAllFeats, getFeatById } from '../data/feats'

const abilityLabels: Record<string, string> = {
    str: 'Force',
    dex: 'Dextérité',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Sagesse',
    cha: 'Charisme',
}

export default function LevelUpPage() {
    const { character, getLevelUpInfo, applyLevelUp } = useCharacter()
    const navigate = useNavigate()

    const levelUpInfo = useMemo(() => getLevelUpInfo(), [getLevelUpInfo])

    // État du wizard
    const [step, setStep] = useState<LevelUpStep>('intro')
    const [hpMethod, setHpMethod] = useState<'roll' | 'average' | 'manual'>('average')
    const [hpRoll, setHpRoll] = useState<number | null>(null)
    const [manualHp, setManualHp] = useState<string>('')
    const [asiChoice, setAsiChoice] = useState<ASIChoice | null>(null)

    // Nouveaux états pour Sous-classe et Sorts
    const [selectedSubclass, setSelectedSubclass] = useState<string | null>(null)
    const [selectedCantrips, setSelectedCantrips] = useState<string[]>([])

    // Sorts chargés depuis spells-complete.json
    const [allSpells, setAllSpells] = useState<Spell[]>([])
    useEffect(() => {
        loadAllSpells().then(setAllSpells)
    }, [])
    const [selectedSpells, setSelectedSpells] = useState<string[]>([])

    const [isApplying, setIsApplying] = useState(false)

    if (!character || !levelUpInfo) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <p className="text-xl">Aucun personnage chargé</p>
                    <Link to="/" className="text-purple-400 hover:underline mt-4 block">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        )
    }

    const {
        currentLevel,
        newLevel,
        hitDie,
        conModifier,
        averageHp,
        proficiencyBonusCurrent,
        proficiencyBonusNew,
        hasASI,
        hasSubclassChoice,
        newCantripsCount,
        newSpellsCount,
    } = levelUpInfo

    // Aptitudes gagnées à ce niveau
    const newFeatures = getClassFeaturesAtLevel(character.characterClass?.id || '', newLevel)

    // Sous-classes disponibles
    const availableSubclasses = subclasses.filter(s => s.classId === character.characterClass?.id)

    // Sorts disponibles (depuis spells-complete.json)
    const spellClassName = classIdToSpellClassName[character.characterClass?.id || '']
    const maxSpellLevel = getMaxSpellLevel(character.characterClass || null, newLevel)

    const classSpells = useMemo(() => {
        if (!spellClassName || allSpells.length === 0) return []
        return getSpellsForClass(allSpells, spellClassName, maxSpellLevel)
    }, [allSpells, spellClassName, maxSpellLevel])

    // Exclure les sorts déjà connus
    const knownSpells = character.knownSpells || []
    const availableCantrips = classSpells.filter(s => s.level === 0 && !knownSpells.includes(s.name))

    // Grouper les sorts par niveau
    const spellsByLevel = useMemo(() => {
        const grouped = new Map<number, Spell[]>()
        for (const spell of classSpells.filter(s => s.level > 0 && !knownSpells.includes(s.name))) {
            const list = grouped.get(spell.level) || []
            list.push(spell)
            grouped.set(spell.level, list)
        }
        grouped.forEach((list, level) => {
            grouped.set(level, list.sort((a, b) => a.name.localeCompare(b.name, 'fr')))
        })
        return grouped
    }, [classSpells, knownSpells])

    // Sorts de sous-classe (toujours préparés)
    const effectiveSubclass = selectedSubclass || character.subclass
    const alwaysPrepared = useMemo(() =>
        getAlwaysPreparedSpells(effectiveSubclass || undefined, newLevel),
        [effectiveSubclass, newLevel]
    )
    const subclassSpellLabel = getSubclassSpellLabel(effectiveSubclass || undefined)

    // Calcul des PV gagnés
    const hpGained = useMemo(() => {
        let dieResult = 0
        if (hpMethod === 'roll' && hpRoll) dieResult = hpRoll
        else if (hpMethod === 'average') dieResult = averageHp
        else if (hpMethod === 'manual') dieResult = parseInt(manualHp) || 0
        return Math.max(1, dieResult + conModifier)
    }, [hpMethod, hpRoll, manualHp, averageHp, conModifier])

    // Lancer le dé de PV
    const rollHitDie = () => {
        const result = Math.floor(Math.random() * hitDie) + 1
        setHpRoll(result)
        setHpMethod('roll')
    }

    // Appliquer le level-up
    const handleConfirm = async () => {
        setIsApplying(true)
        try {
            const choices: LevelUpChoices = {
                newLevel,
                hpMethod,
                hpRoll: hpRoll ?? undefined,
                hpGained,
                asiChoice: hasASI ? asiChoice || undefined : undefined,
                subclassId: selectedSubclass || undefined,
                newSpellsSelected: selectedSpells,
                newCantripsSelected: selectedCantrips,
            }
            await applyLevelUp(choices)
            navigate(`/character/${character.id}`)
        } catch (err) {
            console.error('Level up failed:', err)
        } finally {
            setIsApplying(false)
        }
    }

    // Étapes du wizard
    const steps: LevelUpStep[] = ['intro', 'hp']
    if (hasSubclassChoice) steps.push('subclass')
    if (hasASI) steps.push('asi')
    if (newSpellsCount > 0 || newCantripsCount > 0) steps.push('spells')
    steps.push('confirm')

    const currentStepIndex = steps.indexOf(step)

    const canGoNext = () => {
        if (step === 'hp') {
            if (hpMethod === 'average') return true
            if (hpMethod === 'roll') return hpRoll !== null
            if (hpMethod === 'manual') return manualHp !== '' && !isNaN(parseInt(manualHp)) && parseInt(manualHp) > 0
            return false
        }
        if (step === 'subclass') return selectedSubclass !== null
        if (step === 'asi') {
            if (!asiChoice) return false
            // Validation stricte de l'ASI
            if (asiChoice.type === 'stats') {
                // Doit avoir +2 au total
                return Object.values(asiChoice.stats || {}).reduce((a, b) => a + b, 0) === 2
            }
            if (asiChoice.type === 'feat') {
                // Doit avoir un don sélectionné
                return !!asiChoice.featId
            }
            return false
        }
        if (step === 'spells') {
            return selectedCantrips.length === newCantripsCount && selectedSpells.length === newSpellsCount
        }
        return true
    }

    const goNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setStep(steps[currentStepIndex + 1])
        }
    }

    const goBack = () => {
        if (currentStepIndex > 0) {
            setStep(steps[currentStepIndex - 1])
        }
    }

    const toggleSpell = (spellId: string, isCantrip: boolean) => {
        if (isCantrip) {
            setSelectedCantrips(prev =>
                prev.includes(spellId) ? prev.filter(id => id !== spellId) :
                    prev.length < newCantripsCount ? [...prev, spellId] : prev
            )
        } else {
            setSelectedSpells(prev =>
                prev.includes(spellId) ? prev.filter(id => id !== spellId) :
                    prev.length < newSpellsCount ? [...prev, spellId] : prev
            )
        }
    }

    return (
        <div className="fixed inset-0 bg-background flex flex-col z-[100]">
            {/* Header */}
            <header className="sticky-header-safe border-b border-border shrink-0">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
                    <Link to={`/character/${character.id}`} className="p-2 hover:bg-muted rounded-lg transition">
                        <ArrowLeftIcon className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-foreground flex items-center gap-2 font-cinzel">
                            <SparklesIcon className="w-5 h-5 text-gold" />
                            Montée de niveau
                        </h1>
                        <p className="text-sm text-muted-foreground">{character.name}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-primary">{currentLevel}</span>
                        <span className="text-muted-foreground mx-2">→</span>
                        <span className="text-2xl font-bold text-hp-high">{newLevel}</span>
                    </div>
                </div>
            </header>

            {/* Progress bar */}
            <div className="max-w-2xl w-full mx-auto px-4 py-4 shrink-0">
                <div className="flex gap-2">
                    {steps.map((s, i) => (
                        <div
                            key={s}
                            className={`flex-1 h-2 rounded-full transition-colors ${i <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 pb-12">
                {/* INTRO */}
                {step === 'intro' && (
                    <div className="space-y-6 animate-fade-in py-4">
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-4 shadow-lg shadow-primary/20">
                                <ArrowUpIcon className="w-10 h-10 text-primary-foreground" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground font-cinzel mb-2">
                                Niveau {newLevel} !
                            </h2>
                            <p className="text-muted-foreground">
                                Votre {character.characterClass?.name} gagne en puissance
                            </p>
                        </div>

                        {/* Résumé des changements */}
                        <div className="parchment-card space-y-4">
                            <h3 className="text-lg font-bold text-foreground font-cinzel mb-4">Ce qui vous attend</h3>

                            <div className="flex items-center gap-3 text-foreground">
                                <HeartIcon className="w-5 h-5 text-hp-crit" />
                                <span>+{averageHp} à +{hitDie + conModifier} PV</span>
                            </div>

                            {proficiencyBonusNew > proficiencyBonusCurrent && (
                                <div className="flex items-center gap-3 text-foreground">
                                    <SparklesIcon className="w-5 h-5 text-gold" />
                                    <span>Bonus de maîtrise : +{proficiencyBonusCurrent} → +{proficiencyBonusNew}</span>
                                </div>
                            )}

                            {hasSubclassChoice && (
                                <div className="flex items-center gap-3 text-foreground">
                                    <StarIcon className="w-5 h-5 text-gold" />
                                    <span>Choix d'une spécialisation (sous-classe)</span>
                                </div>
                            )}

                            {hasASI && (
                                <div className="flex items-center gap-3 text-foreground">
                                    <ArrowUpIcon className="w-5 h-5 text-primary" />
                                    <span>Amélioration de caractéristiques (+2 points)</span>
                                </div>
                            )}

                            {(newCantripsCount > 0 || newSpellsCount > 0) && (
                                <div className="flex items-center gap-3 text-foreground">
                                    <BookOpenIcon className="w-5 h-5 text-ac" />
                                    <span>
                                        {newCantripsCount > 0 && `+${newCantripsCount} tour${newCantripsCount > 1 ? 's' : ''}`}
                                        {newCantripsCount > 0 && newSpellsCount > 0 && ', '}
                                        {newSpellsCount > 0 && `+${newSpellsCount} sort${newSpellsCount > 1 ? 's' : ''} connu${newSpellsCount > 1 ? 's' : ''}`}
                                    </span>
                                </div>
                            )}

                            {/* Aptitudes de classe */}
                            {newFeatures.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Nouvelles aptitudes</h4>
                                    <div className="space-y-4">
                                        {newFeatures.map((feature, i) => (
                                            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                                <span className="text-primary font-bold block">{feature.name}</span>
                                                <p className="text-sm text-foreground/80 leading-relaxed">{feature.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* HP */}
                {step === 'hp' && (
                    <div className="space-y-6 animate-fade-in py-4">
                        <div className="text-center py-4">
                            <HeartIcon className="w-12 h-12 text-hp-crit mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-foreground font-cinzel">Points de vie</h2>
                            <p className="text-muted-foreground">Choisissez comment gagner vos PV</p>
                        </div>

                        <div className="grid gap-4">
                            <button
                                onClick={rollHitDie}
                                className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${hpMethod === 'roll' && hpRoll ? 'border-primary bg-primary/10' : 'border-border bg-card/50 hover:border-primary/40'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground font-cinzel">🎲 Lancer 1d{hitDie}</h3>
                                        <p className="text-sm text-muted-foreground">Tentez votre chance !</p>
                                    </div>
                                    {hpRoll && <div className="text-4xl font-bold text-primary">{hpRoll}</div>}
                                </div>
                            </button>

                            <button
                                onClick={() => { setHpMethod('average'); setHpRoll(null) }}
                                className={`p-6 rounded-2xl border-2 transition-all text-left ${hpMethod === 'average' ? 'border-primary bg-primary/10' : 'border-border bg-card/50 hover:border-primary/40'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground font-cinzel">📊 Prendre la moyenne</h3>
                                        <p className="text-sm text-muted-foreground">Valeur garantie : {averageHp}</p>
                                    </div>
                                    <div className="text-3xl font-bold text-muted-foreground">{averageHp}</div>
                                </div>
                            </button>

                            <div
                                className={`p-6 rounded-2xl border-2 transition-all text-left ${hpMethod === 'manual' ? 'border-primary bg-primary/10' : 'border-border bg-card/50 hover:border-primary/40'}`}
                                onClick={() => { setHpMethod('manual'); setHpRoll(null) }}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-foreground font-cinzel">✍️ Saisie manuelle</h3>
                                        <p className="text-sm text-muted-foreground">Entrez le résultat de votre dé</p>
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            value={manualHp}
                                            onChange={(e) => {
                                                setManualHp(e.target.value)
                                                setHpMethod('manual')
                                                setHpRoll(null)
                                            }}
                                            placeholder="Ex: 5"
                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-2 text-center text-xl font-bold text-primary focus:border-primary focus:outline-none transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                            min="1"
                                            max={hitDie}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SUBCLASS */}
                {step === 'subclass' && (
                    <div className="space-y-6 animate-fade-in py-4">
                        <div className="text-center py-4">
                            <StarIcon className="w-12 h-12 text-gold mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-foreground font-cinzel">Spécialisation</h2>
                            <p className="text-muted-foreground">Choisissez votre voie de {character.characterClass?.name}</p>
                        </div>

                        <div className="grid gap-4">
                            {availableSubclasses.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedSubclass(s.id)}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left ${selectedSubclass === s.id ? 'border-gold bg-gold/10' : 'border-border bg-card/50 hover:border-gold/40'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className={`text-lg font-bold font-cinzel ${selectedSubclass === s.id ? 'text-gold' : 'text-foreground'}`}>{s.name}</h3>
                                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                                        </div>
                                        {selectedSubclass === s.id && <CheckIcon className="w-6 h-6 text-gold shrink-0" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ASI */}
                {step === 'asi' && (
                    <div className="space-y-6 animate-fade-in py-4">
                        <div className="text-center py-4">
                            <ArrowUpIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-foreground font-cinzel">Amélioration</h2>
                        </div>

                        <AsiSelector
                            level={newLevel}
                            choice={asiChoice || undefined}
                            onChoiceChange={setAsiChoice}
                            availableFeats={getAllFeats()}
                        />
                    </div>
                )}

                {/* SPELLS */}
                {step === 'spells' && (
                    <div className="space-y-6 animate-fade-in py-4">
                        <div className="text-center py-4">
                            <BookOpenIcon className="w-12 h-12 text-ac mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-foreground font-cinzel">Sélection des sorts</h2>
                            <p className="text-muted-foreground">
                                {newCantripsCount > 0 && `+${newCantripsCount} tour${newCantripsCount > 1 ? 's' : ''} de magie`}
                                {newCantripsCount > 0 && newSpellsCount > 0 && ' et '}
                                {newSpellsCount > 0 && `+${newSpellsCount} sort${newSpellsCount > 1 ? 's' : ''}`}
                            </p>
                        </div>

                        {/* Sorts de sous-classe toujours préparés */}
                        {alwaysPrepared.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <LockClosedIcon className="w-4 h-4 text-amber-500" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500">{subclassSpellLabel}</h3>
                                    <span className="text-[10px] text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">Toujours préparés</span>
                                </div>
                                {alwaysPrepared.map(name => {
                                    const spell = allSpells.find(s => s.name === name)
                                    return (
                                        <div key={name} className="p-3 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-foreground">{name}</h4>
                                                {spell && <p className="text-xs text-muted-foreground">Niv {spell.level} • {spell.school}</p>}
                                            </div>
                                            <LockClosedIcon className="w-5 h-5 text-amber-500" />
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Cantrips */}
                        {newCantripsCount > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-ac uppercase tracking-widest">Tours de magie ({selectedCantrips.length}/{newCantripsCount})</h3>
                                {availableCantrips.map(s => (
                                    <button
                                        key={s.name}
                                        onClick={() => toggleSpell(s.name, true)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex justify-between items-center ${selectedCantrips.includes(s.name) ? 'border-primary bg-primary/10' : 'border-border bg-card/50'}`}
                                    >
                                        <div><h4 className="font-bold text-foreground">{s.name}</h4><p className="text-xs text-muted-foreground">{s.school}</p></div>
                                        {selectedCantrips.includes(s.name) && <CheckIcon className="w-5 h-5 text-primary" />}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Sorts groupés par niveau */}
                        {newSpellsCount > 0 && (
                            <div className="space-y-6 mt-6">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Sorts ({selectedSpells.length}/{newSpellsCount})</h3>
                                {Array.from(spellsByLevel.entries())
                                    .sort(([a], [b]) => a - b)
                                    .map(([level, levelSpells]) => (
                                        <div key={level} className="space-y-2">
                                            <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b border-border pb-1">
                                                Niveau {level} ({levelSpells.length} sorts)
                                            </h4>
                                            {levelSpells.map(s => {
                                                const isOath = isAlwaysPreparedSpell(s.name, effectiveSubclass || undefined, newLevel)
                                                return (
                                                    <button
                                                        key={s.name}
                                                        onClick={() => !isOath && toggleSpell(s.name, false)}
                                                        disabled={isOath}
                                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex justify-between items-center ${isOath ? 'border-amber-500/30 bg-amber-500/5 opacity-50 cursor-not-allowed'
                                                            : selectedSpells.includes(s.name) ? 'border-primary bg-primary/10'
                                                                : 'border-border bg-card/50'
                                                            }`}
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-foreground">{s.name}</h4>
                                                                {isOath && <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">{subclassSpellLabel}</span>}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{s.school} • {s.castingTime}</p>
                                                        </div>
                                                        {(selectedSpells.includes(s.name) || isOath) && (
                                                            <CheckIcon className={`w-5 h-5 ${isOath ? 'text-amber-500' : 'text-primary'}`} />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CONFIRM */}
                {step === 'confirm' && (
                    <div className="space-y-6 animate-fade-in py-4">
                        <div className="text-center py-4">
                            <CheckIcon className="w-12 h-12 text-hp-high mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-foreground font-cinzel">Récapitulatif</h2>
                        </div>

                        <div className="parchment-card space-y-4">
                            <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Niveau</span><span className="text-foreground font-bold">{newLevel}</span></div>
                            <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Points de vie</span><span className="text-hp-high font-bold">+{hpGained} PV</span></div>
                            {selectedSubclass && <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Spécialisation</span><span className="text-gold font-bold">{subclasses.find(s => s.id === selectedSubclass)?.name}</span></div>}
                            {(selectedCantrips.length > 0 || selectedSpells.length > 0) && (
                                <div className="border-b border-border pb-2">
                                    <span className="text-muted-foreground block mb-2">Sorts choisis</span>
                                    <div className="flex flex-wrap gap-2">
                                        {[...selectedCantrips, ...selectedSpells].map(name => (
                                            <span key={name} className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase border border-primary/20">{name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {asiChoice && (
                                <div className="border-b border-border pb-2">
                                    <span className="text-muted-foreground block mb-2">Amélioration</span>
                                    {asiChoice.type === 'stats' && asiChoice.stats ? (
                                        <span className="text-foreground font-bold">
                                            {Object.entries(asiChoice.stats).map(([k, v]) => `${abilityLabels[k as any]} +${v}`).join(', ')}
                                        </span>
                                    ) : asiChoice.type === 'feat' && asiChoice.featId ? (
                                        <span className="text-foreground font-bold">Don : {getFeatById(asiChoice.featId)?.name}</span>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer navigation */}
            <footer className="shrink-0 bg-background/95 backdrop-blur border-t border-border p-6 z-[110] relative">
                <div className="max-w-2xl mx-auto flex gap-4">
                    {currentStepIndex > 0 && (
                        <button onClick={goBack} className="btn btn-secondary px-6">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={step === 'confirm' ? handleConfirm : goNext}
                        disabled={!canGoNext() || isApplying}
                        className="flex-1 btn btn-primary font-black text-lg"
                    >
                        {isApplying ? '...' : step === 'confirm' ? 'Valider' : 'Continuer'}
                        <CheckIcon className="w-6 h-6" />
                    </button>
                </div>
            </footer>
        </div>
    )
}
