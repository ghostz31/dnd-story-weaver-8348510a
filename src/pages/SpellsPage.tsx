import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
    SparklesIcon,
    ChevronLeftIcon,
    FireIcon,
    BookOpenIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CheckCircleIcon,
    LockClosedIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/solid'
import { CheckCircleIcon as CheckCircleOutline, PlusCircleIcon as PlusCircleOutline } from '@heroicons/react/24/outline'
import { useCharacter } from '../contexts/CharacterContext'
import type { Spell } from '../types/spell'
import { spellSchoolColors } from '../types/spell'
import { loadAllSpells, classIdToSpellClassName } from '../data/spells'
import { getAlwaysPreparedSpells, getSubclassSpellLabel, isAlwaysPreparedSpell } from '../data/subclassSpells'
import {
    getMaxSpellLevel,
    getSpellSlots,
    getCantripsKnown,
    filterSpellsByMaxLevel,
    groupSpellsByLevel,
    getSpellLevelLabel,
    isSpellcaster,
    getSpellcastingType,
    getMaxKnownSpells,
    getMaxPreparedSpells,
} from '../utils/spellUtils'

export function SpellsPage() {
    const {
        character,
        getModifier,
        proficiencyBonus,
        useSpellSlot,
        restoreSpellSlot,
        resetAllSpellSlots,
        getSpellSlotsForLevel,
        toggleSpellPreparation,
        toggleKnownSpell,
    } = useCharacter()
    const [allSpells, setAllSpells] = useState<Spell[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedSpell, setExpandedSpell] = useState<string | null>(null)
    const [showOnlyKnown, setShowOnlyKnown] = useState(true)

    // Charger les sorts depuis le JSON (avec cache)
    useEffect(() => {
        loadAllSpells().then(spells => {
            setAllSpells(spells)
            setLoading(false)
        })
    }, [])

    // Mapping legacy pour les anciens IDs techniques → noms FR
    const legacyIdToName: Record<string, string> = {
        'vicious_mockery': 'Moquerie cruelle', 'prestidigitation': 'Prestidigitation',
        'fire_bolt': 'Trait de feu', 'mage_hand': 'Main de mage',
        'guidance': 'Assistance', 'sacred_flame': 'Flamme sacrée',
        'cure_wounds': 'Soins', 'healing_word': 'Mot de guérison',
        'mage_armor': 'Armure de mage', 'magic_missile': 'Projectile magique',
        'thunderwave': 'Vague tonnante', 'shield': 'Bouclier',
        'shatter': 'Fracassement', 'invisibility': 'Invisibilité',
        'hold_person': 'Immobilisation de personne',
        'lesser_restoration': 'Restauration partielle',
        'spiritual_weapon': 'Arme spirituelle',
    }

    // Nom de classe pour le filtrage des sorts
    const classId = character?.characterClass?.id || ''
    const spellClassName = classIdToSpellClassName[classId] || ''
    const spellcastingType = getSpellcastingType(character?.characterClass || null)

    // Sorts de sous-classe (toujours préparés)
    const subclassId = character?.subclass
    const alwaysPrepared = useMemo(() =>
        getAlwaysPreparedSpells(subclassId, character?.level || 0),
        [subclassId, character?.level]
    )
    const subclassLabel = getSubclassSpellLabel(subclassId)

    // Résoudre les noms connus (support legacy IDs + noms directs)
    const knownSpellNames = useMemo(() => {
        const known = character?.knownSpells || []
        return known.map(k => legacyIdToName[k] || k)
    }, [character?.knownSpells])

    // Séparer cantrips et sorts de niveau connus
    const knownCantrips = useMemo(() => {
        return knownSpellNames.filter(name =>
            allSpells.find(s => s.name === name)?.level === 0
        )
    }, [knownSpellNames, allSpells])

    const knownLeveledSpells = useMemo(() => {
        return knownSpellNames.filter(name => {
            const spell = allSpells.find(s => s.name === name)
            return spell && spell.level > 0
        })
    }, [knownSpellNames, allSpells])

    // === LIMITES D&D 5e ===
    const maxCantrips = character?.characterClass
        ? getCantripsKnown(character.characterClass, character.level)
        : 0

    const maxKnownLeveled = character?.characterClass
        ? getMaxKnownSpells(character.characterClass, character.level)
        : null // null = pas de limite (classes à sorts préparés)

    const spellcastingAbility = character?.characterClass?.spellcasting?.ability
    const spellcastingMod = spellcastingAbility ? getModifier(spellcastingAbility) : 0

    const maxPrepared = character?.characterClass
        ? getMaxPreparedSpells(character.characterClass, character.level, spellcastingMod)
        : null // null = pas de préparation

    // Nombre actuel de sorts préparés (hors cantrips et sorts toujours préparés)
    const currentPreparedCount = useMemo(() => {
        const prepared = character?.preparedSpells || []
        // Ne compter que les sorts de niveau >= 1, et exclure les always-prepared
        return prepared.filter(name => {
            const spell = allSpells.find(s => s.name === name)
            return spell && spell.level > 0 && !alwaysPrepared.includes(name)
        }).length
    }, [character?.preparedSpells, allSpells, alwaysPrepared])

    // Vérifier si on peut encore apprendre des sorts 
    const canLearnMoreCantrips = knownCantrips.length < maxCantrips
    const canLearnMoreSpells = maxKnownLeveled === null || knownLeveledSpells.length < maxKnownLeveled
    const canPrepareMore = maxPrepared === null || currentPreparedCount < maxPrepared

    // Filtrer les sorts par classe et niveau
    const filteredSpells = useMemo(() => {
        if (!character?.characterClass || !spellClassName) return []

        const maxLevel = getMaxSpellLevel(character.characterClass, character.level)

        if (showOnlyKnown) {
            if (spellcastingType === 'prepared') {
                // Clerc/Druide/Paladin: en mode "Mes sorts" → afficher tous les sorts de la classe
                // (ils préparent depuis la liste entière)
                const classSpells = allSpells.filter(spell =>
                    spell.classes?.some(c => c === spellClassName)
                )
                const filtered = filterSpellsByMaxLevel(classSpells, maxLevel)
                // Inclure aussi les cantrips connus
                const knownCantripSpells = allSpells.filter(s =>
                    s.level === 0 && knownSpellNames.includes(s.name)
                )
                return [...knownCantripSpells.filter(s => !filtered.some(f => f.name === s.name)), ...filtered]
            }
            // Magicien, Barde, Ensorceleur, Rôdeur, Occultiste: afficher sorts connus + always-prepared
            const allKnownNames = [...new Set([...knownSpellNames, ...alwaysPrepared])]
            return allSpells.filter(s => allKnownNames.includes(s.name))
        } else {
            // Afficher tous les sorts de la classe (filtrés par niveau max)
            const classSpells = allSpells.filter(spell =>
                spell.classes?.some(c => c === spellClassName)
            )
            return filterSpellsByMaxLevel(classSpells, maxLevel)
        }
    }, [allSpells, character, showOnlyKnown, spellClassName, alwaysPrepared, knownSpellNames, spellcastingType])

    // Grouper par niveau
    const spellsByLevel = useMemo(() => {
        return groupSpellsByLevel(filteredSpells)
    }, [filteredSpells])

    // Sorts préparés
    const preparedSpells = character?.preparedSpells || []

    const spellSaveDC = 8 + proficiencyBonus + spellcastingMod
    const spellAttackBonus = proficiencyBonus + spellcastingMod

    // Slots de sorts
    const spellSlots = character?.characterClass
        ? getSpellSlots(character.characterClass, character.level)
        : []

    const getSchoolColor = (school: string) => {
        return spellSchoolColors[school] || '#6B7280'
    }

    const abilityLabels: Record<string, string> = {
        str: 'FOR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'SAG', cha: 'CHA'
    }

    // Composant détails d'un sort
    const SpellDetails = ({ spell }: { spell: Spell }) => (
        <div className="card mt-1 p-4 bg-muted/20 text-sm space-y-2 overflow-hidden animate-fade-in">
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Temps :</strong> {spell.castingTime}</div>
                <div><strong>Portée :</strong> {spell.range}</div>
                <div><strong>Composantes :</strong> {spell.components}</div>
                <div><strong>Durée :</strong> {spell.duration}</div>
            </div>
            <p className="text-ink-muted leading-relaxed pt-2 border-t border-border/50">
                {spell.description}
            </p>
        </div>
    )

    if (!character) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-ink-muted mb-4">Sélectionnez d'abord un personnage</p>
                <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
            </div>
        )
    }

    if (!isSpellcaster(character.characterClass)) {
        return (
            <div className="flex flex-col gap-4 animate-fade-in pb-8">
                <header className="flex items-center gap-3 mb-2">
                    <Link to={`/character/${character.id}`} className="touch-target -ml-2">
                        <ChevronLeftIcon className="w-6 h-6" style={{ color: 'hsl(var(--muted-foreground))' }} />
                    </Link>
                    <h1 className="font-cinzel text-2xl font-bold">Sorts</h1>
                </header>
                <div className="card text-center py-12">
                    <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-ink-muted/30" />
                    <p className="text-ink-muted">
                        {character.name} ({character.characterClass?.name}) n'est pas un lanceur de sorts.
                    </p>
                </div>
            </div>
        )
    }

    // Label d'explication selon le type de classe
    const getSpellTypeExplanation = () => {
        switch (spellcastingType) {
            case 'spellbook':
                return `Grimoire : ${knownLeveledSpells.length}/${maxKnownLeveled} sorts inscrits · Préparés : ${currentPreparedCount}/${maxPrepared}`
            case 'known':
                return `Sorts connus : ${knownLeveledSpells.length}/${maxKnownLeveled}`
            case 'prepared':
                return `Sorts préparés : ${currentPreparedCount}/${maxPrepared}`
            default:
                return ''
        }
    }

    return (
        <div className="flex flex-col gap-4 animate-fade-in pb-8">
            {/* Header */}
            <header className="flex items-center gap-3 mb-2">
                <Link to={`/character/${character.id}`} className="touch-target -ml-2">
                    <ChevronLeftIcon className="w-6 h-6" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </Link>
                <div className="flex-1">
                    <h1 className="font-cinzel text-2xl font-bold flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                        Grimoire
                    </h1>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-ink-muted">
                            Sorts de {character.characterClass?.name}
                        </p>
                        {/* Pas de toggle pour les classes à sorts préparés en mode "Mes sorts" */}
                        {spellcastingType !== 'prepared' && (
                            <button
                                onClick={() => setShowOnlyKnown(!showOnlyKnown)}
                                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border transition ${showOnlyKnown
                                        ? 'border-border bg-card/50 hover:bg-muted'
                                        : 'border-primary/50 bg-primary/10 text-primary'
                                    }`}
                            >
                                {showOnlyKnown ? 'Voir tous les sorts' : '✓ Liste complète'}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Spellcasting Stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="card text-center p-3">
                    <span className="text-xs text-ink-muted block mb-1">DD Sauvegarde</span>
                    <span className="font-cinzel text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                        {spellSaveDC}
                    </span>
                </div>
                <div className="card text-center p-3">
                    <span className="text-xs text-ink-muted block mb-1">Attaque sort</span>
                    <span className="font-cinzel text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                        +{spellAttackBonus}
                    </span>
                </div>
                <div className="card text-center p-3">
                    <span className="text-xs text-ink-muted block mb-1">Caractéristique</span>
                    <span className="font-semibold text-sm">
                        {spellcastingAbility ? abilityLabels[spellcastingAbility] : '-'}
                    </span>
                </div>
            </div>

            {/* Compteurs de sorts */}
            <div className="card p-3 bg-muted/20 text-sm">
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-ink-muted">
                    <span>
                        Tours de magie : <strong className={knownCantrips.length >= maxCantrips ? 'text-primary' : 'text-foreground'}>{knownCantrips.length}/{maxCantrips}</strong>
                    </span>
                    {maxKnownLeveled !== null && (
                        <span>
                            {spellcastingType === 'spellbook' ? 'Grimoire' : 'Sorts connus'} : <strong className={knownLeveledSpells.length >= maxKnownLeveled ? 'text-primary' : 'text-foreground'}>{knownLeveledSpells.length}/{maxKnownLeveled}</strong>
                        </span>
                    )}
                    {maxPrepared !== null && (
                        <span>
                            Préparés : <strong className={currentPreparedCount >= maxPrepared ? 'text-primary' : 'text-foreground'}>{currentPreparedCount}/{maxPrepared}</strong>
                        </span>
                    )}
                </div>
            </div>

            {/* Spell Slots */}
            {spellSlots.length > 0 && (
                <section>
                    <h2 className="font-cinzel text-lg font-semibold mb-3 flex items-center gap-2">
                        <FireIcon className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
                        Emplacements de sorts
                    </h2>
                    <div className="card">
                        <div className="space-y-3">
                            {spellSlots.map((_, index) => {
                                const level = index + 1
                                const { used, max } = getSpellSlotsForLevel(level)
                                const available = max - used

                                return (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className="w-20 text-sm font-medium">Niveau {level}</span>
                                        <div className="flex-1 flex gap-1">
                                            {Array.from({ length: max }).map((_, i) => {
                                                const isUsed = i >= available
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => isUsed ? restoreSpellSlot(level) : useSpellSlot(level)}
                                                        className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                                                        title={isUsed ? 'Restaurer' : 'Utiliser'}
                                                        style={{
                                                            borderColor: isUsed ? 'hsl(var(--border))' : 'hsl(var(--primary))',
                                                            background: isUsed
                                                                ? 'transparent'
                                                                : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))',
                                                            boxShadow: isUsed ? 'none' : '0 0 10px hsl(var(--primary-glow) / 0.5)',
                                                            opacity: isUsed ? 0.4 : 1,
                                                        }}
                                                    />
                                                )
                                            })}
                                        </div>
                                        <span className="text-sm text-ink-muted w-12 text-right">
                                            {available}/{max}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                        <button
                            onClick={resetAllSpellSlots}
                            className="btn btn-secondary w-full mt-4"
                        >
                            🌙 Repos long (récupérer tout)
                        </button>
                    </div>
                </section>
            )}

            {loading ? (
                <div className="card h-32 animate-pulse bg-muted/20" />
            ) : (
                <>
                    {/* Mode info banner */}
                    {!showOnlyKnown && (
                        <div className="card bg-primary/5 border-primary/20 p-3 text-sm text-center">
                            <p className="text-ink-muted">
                                <PlusCircleIcon className="w-4 h-4 inline-block mr-1 text-primary" />
                                Cliquez sur <strong className="text-primary">+</strong> pour apprendre un sort.
                                {!canLearnMoreSpells && (
                                    <span className="block text-xs text-amber-500 mt-1">
                                        ⚠️ Limite atteinte — vous ne pouvez plus apprendre de sorts de niveau.
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Cantrips */}
                    {spellsByLevel.has(0) && (
                        <section>
                            <h2 className="font-cinzel text-lg font-semibold mb-3 flex items-center gap-2">
                                <span style={{ color: 'hsl(var(--color-gold))' }}>∞</span>
                                Tours de magie
                                <span className="text-sm font-normal text-ink-muted">
                                    ({knownCantrips.length}/{maxCantrips})
                                </span>
                            </h2>
                            <div className="flex flex-col gap-2">
                                {spellsByLevel.get(0)?.map((spell) => {
                                    const isKnown = knownSpellNames.includes(spell.name)
                                    const isExpanded = expandedSpell === spell.name
                                    const cantripLimitReached = !canLearnMoreCantrips && !isKnown
                                    return (
                                        <div key={spell.name}>
                                            <div className="flex gap-2 items-center">
                                                {!showOnlyKnown && (
                                                    <button
                                                        onClick={() => !cantripLimitReached && toggleKnownSpell(spell.name)}
                                                        className={`p-1 rounded-full transition ${cantripLimitReached ? 'text-muted-foreground/20 cursor-not-allowed'
                                                                : isKnown ? 'text-primary' : 'text-muted-foreground/30 hover:text-primary/50'
                                                            }`}
                                                        title={cantripLimitReached ? `Limite de ${maxCantrips} tours de magie atteinte` : isKnown ? 'Retirer' : 'Apprendre'}
                                                        disabled={cantripLimitReached}
                                                    >
                                                        {isKnown ? <CheckCircleIcon className="w-5 h-5" /> : <PlusCircleOutline className="w-5 h-5" />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setExpandedSpell(isExpanded ? null : spell.name)}
                                                    className={`card py-2 px-3 flex items-center gap-2 flex-1 text-left hover:border-primary/50 transition-colors ${isKnown ? 'border-primary/30 bg-primary/5' : 'bg-card/50'
                                                        }`}
                                                >
                                                    <span
                                                        className="w-2 h-2 rounded-full shrink-0"
                                                        style={{ background: getSchoolColor(spell.school) }}
                                                    />
                                                    <span className={`text-sm font-medium flex-1 ${isKnown ? 'text-primary' : ''}`}>{spell.name}</span>
                                                    <span className="text-[10px] text-ink-muted">{spell.school}</span>
                                                    {isExpanded
                                                        ? <ChevronUpIcon className="w-4 h-4 text-ink-muted shrink-0" />
                                                        : <ChevronDownIcon className="w-4 h-4 text-ink-muted shrink-0" />
                                                    }
                                                </button>
                                            </div>
                                            {isExpanded && <SpellDetails spell={spell} />}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Spells by Level */}
                    {Array.from(spellsByLevel.entries())
                        .filter(([level]) => level > 0)
                        .sort(([a], [b]) => a - b)
                        .map(([level, spells]) => (
                            <section key={level}>
                                <h2 className="font-cinzel text-lg font-semibold mb-3 flex items-center gap-2">
                                    <BookOpenIcon className="w-5 h-5" style={{ color: 'hsl(var(--secondary))' }} />
                                    {getSpellLevelLabel(level)}
                                    <span className="text-sm font-normal text-ink-muted">
                                        ({spells.length} sort{spells.length > 1 ? 's' : ''})
                                    </span>
                                </h2>
                                <div className="flex flex-col gap-2">
                                    {spells.map((spell) => {
                                        const isKnown = knownSpellNames.includes(spell.name)
                                        const isPrepared = preparedSpells.includes(spell.name)
                                        const isOath = isAlwaysPreparedSpell(spell.name, character?.subclass, character?.level || 0)
                                        const isExpanded = expandedSpell === spell.name

                                        // Limites d'apprentissage
                                        const spellLimitReached = !canLearnMoreSpells && !isKnown
                                        // Limites de préparation
                                        const prepareLimitReached = !canPrepareMore && !isPrepared && !isOath

                                        return (
                                            <div key={spell.name}>
                                                <div className="flex gap-2 items-start">
                                                    {/* Left action button */}
                                                    {isOath ? (
                                                        <div className="mt-3 p-1">
                                                            <LockClosedIcon className="w-6 h-6 text-amber-500" />
                                                        </div>
                                                    ) : showOnlyKnown ? (
                                                        // Mode "Mes sorts" → toggle préparation (sauf classes "known" qui n'ont pas de préparation)
                                                        spellcastingType === 'known' ? (
                                                            // Classes à sorts connus: pas de bouton préparer, le sort est toujours disponible
                                                            <div className="mt-3 p-1">
                                                                <CheckCircleIcon className="w-6 h-6 text-primary" />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => !prepareLimitReached && toggleSpellPreparation(spell.name)}
                                                                className={`mt-3 p-1 rounded-full transition ${prepareLimitReached ? 'text-muted-foreground/20 cursor-not-allowed'
                                                                        : isPrepared ? 'text-primary' : 'text-muted-foreground/30 hover:text-primary/50'
                                                                    }`}
                                                                title={prepareLimitReached ? `Limite de ${maxPrepared} sorts préparés atteinte` : isPrepared ? 'Dé-préparer' : 'Préparer'}
                                                                disabled={prepareLimitReached}
                                                            >
                                                                {isPrepared ? <CheckCircleIcon className="w-6 h-6" /> : <CheckCircleOutline className="w-6 h-6" />}
                                                            </button>
                                                        )
                                                    ) : (
                                                        // Mode "Tous les sorts" → toggle apprentissage
                                                        <button
                                                            onClick={() => !spellLimitReached && toggleKnownSpell(spell.name)}
                                                            className={`mt-3 p-1 rounded-full transition ${spellLimitReached ? 'text-muted-foreground/20 cursor-not-allowed'
                                                                    : isKnown ? 'text-primary' : 'text-muted-foreground/30 hover:text-primary/50'
                                                                }`}
                                                            title={spellLimitReached ? `Limite atteinte` : isKnown ? 'Retirer du grimoire' : 'Apprendre'}
                                                            disabled={spellLimitReached}
                                                        >
                                                            {isKnown ? <PlusCircleIcon className="w-6 h-6" /> : <PlusCircleOutline className="w-6 h-6" />}
                                                        </button>
                                                    )}
                                                    {/* Spell card */}
                                                    <div className="flex-1">
                                                        <button
                                                            onClick={() => setExpandedSpell(isExpanded ? null : spell.name)}
                                                            className={`card p-3 flex items-center gap-3 w-full text-left hover:border-primary/50 transition-colors ${isOath ? 'border-amber-500/30 bg-amber-500/5'
                                                                    : isPrepared ? 'border-primary/30 bg-primary/5'
                                                                        : isKnown && !showOnlyKnown ? 'border-primary/20 bg-primary/5'
                                                                            : ''
                                                                }`}
                                                        >
                                                            <div
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center font-cinzel font-bold shrink-0"
                                                                style={{
                                                                    background: isOath ? 'hsl(45 93% 47% / 0.15)'
                                                                        : isPrepared ? 'hsl(var(--primary))'
                                                                            : `${getSchoolColor(spell.school)}20`,
                                                                    color: isOath ? 'hsl(45 93% 47%)'
                                                                        : isPrepared ? 'hsl(var(--primary-foreground))'
                                                                            : getSchoolColor(spell.school)
                                                                }}
                                                            >
                                                                {spell.level}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`font-semibold truncate ${isOath ? 'text-amber-600'
                                                                            : isPrepared ? 'text-primary'
                                                                                : ''
                                                                        }`}>{spell.name}</span>
                                                                    {isOath && (
                                                                        <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                                                                            {subclassLabel}
                                                                        </span>
                                                                    )}
                                                                    {!showOnlyKnown && isKnown && !isOath && (
                                                                        <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                                                                            Appris
                                                                        </span>
                                                                    )}
                                                                    {spell.ritual && (
                                                                        <span
                                                                            className="text-xs px-1.5 py-0.5 rounded shrink-0"
                                                                            style={{ background: 'hsl(var(--color-xp) / 0.2)', color: 'hsl(var(--color-xp))' }}
                                                                        >
                                                                            R
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-ink-muted">{spell.school}</span>
                                                            </div>
                                                            {isExpanded
                                                                ? <ChevronUpIcon className="w-5 h-5 text-ink-muted shrink-0" />
                                                                : <ChevronDownIcon className="w-5 h-5 text-ink-muted shrink-0" />
                                                            }
                                                        </button>
                                                        {isExpanded && <SpellDetails spell={spell} />}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        ))}

                    {filteredSpells.length === 0 && !loading && (
                        <div className="card text-center py-12">
                            <BookOpenIcon className="w-12 h-12 mx-auto mb-4 text-ink-muted/30" />
                            <p className="text-ink-muted">
                                {showOnlyKnown
                                    ? 'Aucun sort appris. Utilisez "Voir tous les sorts" pour en apprendre.'
                                    : 'Aucun sort disponible à ce niveau.'
                                }
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
