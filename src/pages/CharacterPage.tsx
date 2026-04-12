import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    HeartIcon,
    ShieldCheckIcon,
    BoltIcon,
    ChevronLeftIcon,
    MinusIcon,
    PlusIcon,
    SparklesIcon,
    ArchiveBoxIcon,
    FireIcon,
} from '@heroicons/react/24/solid'
import { useCharacter } from '../contexts/CharacterContext'
import type { AbilityScores } from '../types/character'

// Liste complète des compétences D&D 5e avec leur caractéristique associée
const allSkills: { name: string; ability: keyof AbilityScores }[] = [
    { name: 'Acrobaties', ability: 'dex' },
    { name: 'Arcanes', ability: 'int' },
    { name: 'Athlétisme', ability: 'str' },
    { name: 'Discrétion', ability: 'dex' },
    { name: 'Dressage', ability: 'wis' },
    { name: 'Escamotage', ability: 'dex' },
    { name: 'Histoire', ability: 'int' },
    { name: 'Intimidation', ability: 'cha' },
    { name: 'Investigation', ability: 'int' },
    { name: 'Médecine', ability: 'wis' },
    { name: 'Nature', ability: 'int' },
    { name: 'Perception', ability: 'wis' },
    { name: 'Perspicacité', ability: 'wis' },
    { name: 'Persuasion', ability: 'cha' },
    { name: 'Religion', ability: 'int' },
    { name: 'Représentation', ability: 'cha' },
    { name: 'Survie', ability: 'wis' },
    { name: 'Tromperie', ability: 'cha' },
]

// Labels des caractéristiques
const abilityLabels: Record<keyof AbilityScores, string> = {
    str: 'FOR',
    dex: 'DEX',
    con: 'CON',
    int: 'INT',
    wis: 'SAG',
    cha: 'CHA',
}

// Couleurs par caractéristique (CSS custom properties)
const abilityColors: Record<keyof AbilityScores, string> = {
    str: 'var(--stat-str)',
    dex: 'var(--stat-dex)',
    con: 'var(--stat-con)',
    int: 'var(--stat-int)',
    wis: 'var(--stat-wis)',
    cha: 'var(--stat-cha)',
}

export function CharacterPage() {
    const { id } = useParams<{ id: string }>()
    const {
        character,
        loading,
        error,
        loadCharacter,
        updateCurrentHp,
        getModifier,
        getTotalScore,
        getSavingThrowBonus,
        getSkillBonus,
        proficiencyBonus,
    } = useCharacter()

    const [showAllSkills, setShowAllSkills] = useState(false)

    useEffect(() => {
        if (id) {
            loadCharacter(id)
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex flex-col gap-4 animate-fade-in pb-8">
                <div className="card h-32 animate-pulse bg-muted/20" />
                <div className="grid grid-cols-4 gap-3">
                    <div className="card col-span-2 h-28 animate-pulse bg-muted/20" />
                    <div className="card h-28 animate-pulse bg-muted/20" />
                    <div className="card h-28 animate-pulse bg-muted/20" />
                </div>
            </div>
        )
    }

    if (error || !character) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-ink-muted mb-4">{error || 'Personnage introuvable'}</p>
                <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
            </div>
        )
    }

    const currentHp = character.currentHp ?? character.hp
    const maxHp = character.hp
    const hpPercent = (currentHp / maxHp) * 100

    const getHpStatus = (percent: number) => {
        if (percent <= 25) return 'crit'
        if (percent <= 50) return 'low'
        if (percent <= 75) return 'med'
        return 'high'
    }

    const hpStatus = getHpStatus(hpPercent)

    const getHpColor = (status: string) => {
        const colors: Record<string, string> = {
            crit: 'hsl(var(--color-hp-crit))',
            low: 'hsl(var(--color-hp-low))',
            med: 'hsl(var(--color-hp-med))',
            high: 'hsl(var(--color-hp-high))',
        }
        return colors[status]
    }

    const formatModifier = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`)

    const handleHpChange = (delta: number) => {
        const newHp = Math.max(0, Math.min(currentHp + delta, maxHp))
        updateCurrentHp(newHp)
    }

    // Filtrer les compétences - afficher celles du personnage ou toutes
    const displayedSkills = showAllSkills
        ? allSkills
        : allSkills.filter(skill => character.skillProficiencies?.includes(skill.name))

    return (
        <div className="flex flex-col gap-5 animate-fade-in pb-8">
            {/* Header with back button */}
            <header className="flex items-center gap-3 mb-1">
                <Link to="/" className="touch-target -ml-2" aria-label="Retour à l'accueil">
                    <ChevronLeftIcon className="w-6 h-6" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="font-cinzel text-2xl font-bold truncate">{character.name}</h1>
                    <p className="text-ink-muted text-sm">
                        {character.race?.name} • {character.characterClass?.name} niv. {character.level}
                    </p>
                </div>
                {character.level < 20 && (
                    <Link
                        to="/level-up"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/25 hover:from-purple-500/25 hover:to-pink-500/25 transition-colors"
                    >
                        <span className="text-yellow-400">✨</span>
                        <span className="text-sm font-semibold text-purple-400">Niv+</span>
                    </Link>
                )}
            </header>

            {/* ─── Combat Stats Row ─── */}
            <div className="grid grid-cols-4 gap-3">
                {/* HP — Hero Block */}
                <div
                    className="col-span-2 rounded-xl overflow-hidden border"
                    style={{
                        borderColor: `${getHpColor(hpStatus)}30`,
                        background: `linear-gradient(135deg, ${getHpColor(hpStatus)}08, ${getHpColor(hpStatus)}15)`,
                        boxShadow: `0 0 20px ${getHpColor(hpStatus)}10`
                    }}
                >
                    <div
                        className="px-4 py-3 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <HeartIcon
                                className="w-5 h-5"
                                style={{ color: getHpColor(hpStatus) }}
                                aria-hidden="true"
                            />
                            <span className="font-semibold text-sm">PV</span>
                        </div>
                        <span
                            className="stat-value text-xl font-bold"
                            aria-live="polite"
                            aria-label={`${currentHp} points de vie sur ${maxHp}`}
                        >
                            {currentHp}/{maxHp}
                        </span>
                    </div>
                    <div className="hp-bar mx-3" style={{ borderRadius: '5px' }}>
                        <div
                            className={`hp-bar-fill ${hpStatus}`}
                            style={{ width: `${hpPercent}%` }}
                            role="progressbar"
                            aria-valuenow={currentHp}
                            aria-valuemin={0}
                            aria-valuemax={maxHp}
                        />
                    </div>
                    {/* HP Controls */}
                    <div className="flex items-center justify-center gap-2 px-3 py-2.5">
                        <button
                            onClick={() => handleHpChange(-5)}
                            className="p-1.5 rounded-full bg-red-500/15 hover:bg-red-500/25 active:scale-95 transition-colors"
                            aria-label="Retirer 5 PV"
                        >
                            <MinusIcon className="w-4 h-4 text-red-500" />
                        </button>
                        <button
                            onClick={() => handleHpChange(-1)}
                            className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-500 active:scale-95 transition-colors tabular-nums"
                            aria-label="Retirer 1 PV"
                        >
                            −1
                        </button>
                        <button
                            onClick={() => handleHpChange(1)}
                            className="px-2.5 py-1 text-xs font-medium rounded-md bg-green-500/10 hover:bg-green-500/20 text-green-500 active:scale-95 transition-colors tabular-nums"
                            aria-label="Ajouter 1 PV"
                        >
                            +1
                        </button>
                        <button
                            onClick={() => handleHpChange(5)}
                            className="p-1.5 rounded-full bg-green-500/15 hover:bg-green-500/25 active:scale-95 transition-colors"
                            aria-label="Ajouter 5 PV"
                        >
                            <PlusIcon className="w-4 h-4 text-green-500" />
                        </button>
                    </div>
                </div>

                {/* AC */}
                <div className="card-stat flex flex-col items-center justify-center py-4">
                    <ShieldCheckIcon className="w-6 h-6 mb-1.5" style={{ color: 'hsl(var(--color-ac))' }} aria-hidden="true" />
                    <span className="stat-value text-2xl font-bold">{character.ac}</span>
                    <span className="stat-label mt-1">CA</span>
                </div>

                {/* Initiative */}
                <div className="card-stat flex flex-col items-center justify-center py-4">
                    <BoltIcon className="w-6 h-6 mb-1.5" style={{ color: 'hsl(var(--color-gold))' }} aria-hidden="true" />
                    <span className="stat-value text-2xl font-bold tabular-nums">
                        {formatModifier(getModifier('dex'))}
                    </span>
                    <span className="stat-label mt-1">Init</span>
                </div>
            </div>

            {/* ─── Secondary Stats ─── */}
            <div className="grid grid-cols-3 gap-3">
                <div className="card-stat py-3">
                    <span className="stat-label block mb-1">Vitesse</span>
                    <span className="font-semibold tabular-nums">{character.race?.speed || 9}m</span>
                </div>
                <div className="card-stat py-3">
                    <span className="stat-label block mb-1">Bonus Maîtrise</span>
                    <span className="font-semibold tabular-nums" style={{ color: 'hsl(var(--primary))' }}>
                        +{proficiencyBonus}
                    </span>
                </div>
                <div className="card-stat py-3">
                    <span className="stat-label block mb-1">Dés de vie</span>
                    <span className="font-semibold tabular-nums">
                        {character.level}d{character.characterClass?.hitDie || 8}
                    </span>
                </div>
            </div>

            {/* ─── Ability Scores ─── */}
            <section>
                <h2 className="section-header">Caractéristiques</h2>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 stagger-children">
                    {(Object.keys(abilityLabels) as Array<keyof AbilityScores>).map((ability) => {
                        const isSave = character.characterClass?.savingThrows?.includes(ability) || false
                        const score = getTotalScore(ability)
                        const mod = getModifier(ability)
                        const color = abilityColors[ability]
                        return (
                            <div
                                key={ability}
                                className="card-stat relative py-4"
                                style={{
                                    borderColor: `hsl(${color} / 0.25)`,
                                    background: `linear-gradient(to bottom, hsl(${color} / 0.04), transparent)`
                                }}
                            >
                                {isSave && (
                                    <div
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm"
                                        style={{ background: `hsl(${color})`, color: 'white' }}
                                        title="Jet de sauvegarde maîtrisé"
                                        aria-label="Maîtrise de jet de sauvegarde"
                                    >
                                        ✓
                                    </div>
                                )}
                                <span className="stat-label" style={{ color: `hsl(${color} / 0.8)` }}>
                                    {abilityLabels[ability]}
                                </span>
                                <span className="stat-value text-2xl font-bold block mt-1 tabular-nums">
                                    {score}
                                </span>
                                <span
                                    className="stat-modifier text-sm mt-0.5 block tabular-nums"
                                    style={{ color: `hsl(${color})` }}
                                >
                                    {formatModifier(mod)}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* ─── Saving Throws ─── */}
            <section>
                <h2 className="section-header" data-color="ac">Jets de Sauvegarde</h2>
                <div className="card">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        {(Object.keys(abilityLabels) as Array<keyof AbilityScores>).map((ability) => {
                            const isProficient = character.characterClass?.savingThrows?.includes(ability) || false
                            const bonus = getSavingThrowBonus(ability)
                            return (
                                <div key={ability} className="flex items-center justify-between py-1.5">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`prof-dot ${isProficient ? 'active' : 'inactive'}`} />
                                        <span className={isProficient ? 'font-medium' : 'text-ink-muted text-sm'}>
                                            {abilityLabels[ability]}
                                        </span>
                                    </div>
                                    <span
                                        className="stat-modifier text-sm tabular-nums"
                                        style={{ color: isProficient ? 'hsl(var(--primary))' : 'inherit' }}
                                    >
                                        {formatModifier(bonus)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ─── Skills ─── */}
            <section>
                <h2 className="section-header" data-color="secondary">Compétences</h2>
                <div className="card">
                    <div className="divide-y divide-[hsl(var(--border)/0.3)]">
                        {displayedSkills.map((skill) => {
                            const isProficient = character.skillProficiencies?.includes(skill.name) || false
                            const bonus = getSkillBonus(skill.ability, isProficient)
                            return (
                                <div key={skill.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className={`prof-dot ${isProficient ? 'active' : 'inactive'}`} />
                                        <span className={`truncate ${isProficient ? 'font-medium' : 'text-ink-muted text-sm'}`}>
                                            {skill.name}
                                        </span>
                                        <span className="text-xs text-ink-muted flex-shrink-0">
                                            ({abilityLabels[skill.ability]})
                                        </span>
                                    </div>
                                    <span
                                        className="stat-modifier text-sm tabular-nums flex-shrink-0 ml-2"
                                        style={{ color: isProficient ? 'hsl(var(--primary))' : 'inherit' }}
                                    >
                                        {formatModifier(bonus)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    <button
                        onClick={() => setShowAllSkills(!showAllSkills)}
                        className="w-full mt-4 pt-3 text-sm text-center font-medium border-t"
                        style={{ borderColor: 'hsl(var(--border) / 0.5)', color: 'hsl(var(--primary))' }}
                    >
                        {showAllSkills ? 'Afficher mes maîtrises uniquement' : 'Voir toutes les compétences'} →
                    </button>
                </div>
            </section>

            {/* ─── Quick Navigation Cards ─── */}
            <section className="flex flex-col gap-3">
                <Link
                    to="/inventory"
                    className="card-interactive group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--color-gold) / 0.12)' }}>
                            <ArchiveBoxIcon className="w-5 h-5" style={{ color: 'hsl(var(--color-gold))' }} aria-hidden="true" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Inventaire</h3>
                            <p className="text-xs text-ink-muted">
                                Gérez vos objets et votre bourse
                            </p>
                        </div>
                    </div>
                    <ChevronLeftIcon className="w-5 h-5 rotate-180 text-ink-muted group-hover:translate-x-0.5 group-hover:text-primary transition-transform" aria-hidden="true" />
                </Link>

                <Link
                    to="/combat"
                    className="card-interactive group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--destructive) / 0.1)' }}>
                            <FireIcon className="w-5 h-5" style={{ color: 'hsl(var(--destructive))' }} aria-hidden="true" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Combat</h3>
                            <p className="text-xs text-ink-muted">
                                Attaques et actions au combat
                            </p>
                        </div>
                    </div>
                    <ChevronLeftIcon className="w-5 h-5 rotate-180 text-ink-muted group-hover:translate-x-0.5 group-hover:text-primary transition-transform" aria-hidden="true" />
                </Link>

                {character.characterClass?.spellcasting && (
                    <Link
                        to="/spells"
                        className="card-interactive group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--color-xp) / 0.1)' }}>
                                <SparklesIcon className="w-5 h-5" style={{ color: 'hsl(var(--color-xp))' }} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Grimoire</h3>
                                <p className="text-xs text-ink-muted">
                                    Accédez à vos sorts de {character.characterClass.name}
                                </p>
                            </div>
                        </div>
                        <ChevronLeftIcon className="w-5 h-5 rotate-180 text-ink-muted group-hover:translate-x-0.5 group-hover:text-primary transition-transform" aria-hidden="true" />
                    </Link>
                )}
            </section>
        </div>
    )
}
