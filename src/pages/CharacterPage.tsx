import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    SparklesIcon,
    ArchiveBoxIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    FireIcon,
    CheckIcon,
    ArrowPathIcon,
    MoonIcon,
} from '@heroicons/react/24/outline'
import { useCharacter } from '../contexts/CharacterContext'
import type { AbilityScores } from '../types/character'
import type { InventoryItem } from '../types/inventory'
import { downloadCharacterJSON } from '../utils/characterImportExport'

import { CharacterAvatar } from '../components/CharacterAvatar'
import { Breadcrumb } from '../components/Breadcrumb'
import {
    HexStat,
    CombatBadge,
    HPBlock,
    SensesDisplay,
    SkillRow,
    CollapsibleCard,
    SavingThrowsSection,
    Skeleton,
} from '../components/ui'

const abilityLabels: Record<keyof AbilityScores, string> = {
    str: 'FOR',
    dex: 'DEX',
    con: 'CON',
    int: 'INT',
    wis: 'SAG',
    cha: 'CHA',
}

const allSkills: { name: string; ability: keyof AbilityScores }[] = [
    { name: 'Acrobaties', ability: 'dex' },
    { name: 'Arcanes', ability: 'int' },
    { name: 'Athlétisme', ability: 'str' },
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
    { name: 'Représentation', ability: 'cha' },
    { name: 'Religion', ability: 'int' },
    { name: 'Discrétion', ability: 'dex' },
    { name: 'Survie', ability: 'wis' },
    { name: 'Tromperie', ability: 'cha' },
]

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
        getSavingThrowBreakdown,
        getSkillBonus,
        getSkillBreakdown,
        getInitiativeBreakdown,
        getACBreakdown,
        proficiencyBonus,
        getFeatHpBonus,
        getSpeed,
        updateAvatar,
        takeDamage,
        updateTempHp,
        enableSharing,
        shortRest,
        longRest,
    } = useCharacter()

    const [shareLoading, setShareLoading] = useState(false)
    const [shareCopied, setShareCopied] = useState(false)

    useEffect(() => {
        if (id) {
            loadCharacter(id)
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex flex-col gap-4 animate-fade-in pb-8">
                <Skeleton className="card h-32" />
                <div className="grid grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="card h-28" />
                    ))}
                </div>
            </div>
        )
    }

    if (error || !character) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground mb-4">{error || 'Personnage introuvable'}</p>
                <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
            </div>
        )
    }

    const currentHp = character.currentHp ?? character.hp
    const maxHp = character.hp + getFeatHpBonus()
    const acBreakdown = getACBreakdown()
    const ac = acBreakdown.total
    const initiativeBreakdown = getInitiativeBreakdown()
    const initiative = initiativeBreakdown.total
    const speed = getSpeed()

    const abilities = Object.keys(abilityLabels) as Array<keyof AbilityScores>

    const isSaveProficient = (ability: keyof AbilityScores) =>
        character.characterClass?.savingThrows?.includes(ability) || false

    const getSkillCountByAbility = (ability: keyof AbilityScores) =>
        allSkills.filter(s => s.ability === ability && character.skillProficiencies?.includes(s.name)).length

    const passivePerception = 10 + getModifier('wis') +
        (character.skillProficiencies?.includes('Perception') ? proficiencyBonus : 0)
    const passiveInvestigation = 10 + getModifier('int') +
        (character.skillProficiencies?.includes('Investigation') ? proficiencyBonus : 0)
    const passiveInsight = 10 + getModifier('wis') +
        (character.skillProficiencies?.includes('Perspicacité') ? proficiencyBonus : 0)

    const attacks = character.attacks || []
    const equippedItems: InventoryItem[] = character.inventory?.items?.filter(i => i.equipped || i.attuned) || []

    return (
        <div className="flex flex-col gap-4 pb-8 animate-fade-in">
            {/* HEADER — Avatars et infos */}
            <header className="flex items-center gap-4 px-4 pt-4">
                <CharacterAvatar
                    avatarUrl={character.avatarUrl}
                    name={character.name}
                    className={character.characterClass?.id}
                    size="lg"
                    editable
                    onUpload={async (url) => { await updateAvatar(url) }}
                    onRemove={async () => { await updateAvatar('') }}
                />
                <div className="flex-1 min-w-0">
                    <Breadcrumb items={[{ label: character.name }]} />
                    <h1 className="font-bold text-xl md:text-2xl leading-tight truncate font-cinzel">
                        {character.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {character.race?.name} {character.characterClass?.name} • Niveau {character.level}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        {character.level < 20 && (
                            <Link to={`/level-up/${character.id}`} className="btn btn-secondary text-xs py-1 px-3">
                                Monter de niveau
                            </Link>
                        )}
                        <button
                            onClick={async () => {
                                if (shareLoading) return
                                setShareLoading(true)
                                try {
                                    let code = character.shareCode
                                    if (!code) {
                                        code = await enableSharing()
                                    }
                                    if (code) {
                                        await navigator.clipboard.writeText(code)
                                        setShareCopied(true)
                                        setTimeout(() => setShareCopied(false), 2000)
                                    }
                                } catch (err) {
                                    console.error('Share error:', err)
                                } finally {
                                    setShareLoading(false)
                                }
                            }}
                            className={`p-2 rounded-lg hover:bg-muted transition-colors ${character.shareCode ? 'text-hp-high' : 'text-muted-foreground'} ${shareLoading ? 'opacity-50 cursor-wait' : ''}`}
                            title={character.shareCode ? 'Partage actif — cliquez pour copier le code' : 'Partager'}
                        >
                            {shareCopied ? (
                                <CheckIcon className="w-4 h-4" />
                            ) : (
                                <ShareIcon className="w-4 h-4" />
                            )}
                        </button>
                        <button
                            onClick={() => downloadCharacterJSON(character as any)}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                            title="Exporter"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* LAYOUT RESPONSIVE UNIQUE — stack mobile, 3-col desktop */}
            <div className="px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_1fr_minmax(0,320px)] gap-4 lg:gap-6">
                {/* ─── COLONNE 1 (desktop) / éléments re-ordonnés en mobile ─── */}
                <div className="contents lg:block lg:space-y-4">
                    {/* Combat Badges — mobile first, puis ordonné après hex en desktop */}
                    <div className="order-1 lg:order-none lg:hidden">
                        <div className="flex justify-around py-4 bg-card rounded-xl border border-border">
                            <CombatBadge type="ac" value={ac} label="AC" breakdown={acBreakdown} />
                            <CombatBadge type="initiative" value={initiative} label="Initiative" breakdown={initiativeBreakdown} />
                            <CombatBadge type="speed" value={speed} label="Speed" suffix="m" />
                            <CombatBadge type="proficiency" value={proficiencyBonus} label="Proficiency" />
                        </div>
                    </div>

                    {/* HP Block — mobile first */}
                    <div className="order-2 lg:order-none lg:hidden">
                        <HPBlock
                            current={currentHp}
                            max={maxHp}
                            temp={character.tempHp ?? 0}
                            onHeal={(amount) => updateCurrentHp(Math.min(currentHp + amount, maxHp))}
                            onDamage={takeDamage}
                            onSetTempHP={updateTempHp}
                        />
                    </div>

                    {/* Conditions actives — mobile first */}
                    {character.activeConditions && character.activeConditions.length > 0 && (
                        <div className="order-2.5 lg:order-none lg:hidden flex flex-wrap gap-1.5 px-1">
                            {character.activeConditions.map(cond => (
                                <span key={cond} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                                    style={{ backgroundColor: 'hsl(var(--destructive) / 0.15)', color: 'hsl(var(--destructive))' }}>
                                    {cond}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Repos — mobile first */}
                    <div className="order-3 flex gap-2 lg:order-none lg:hidden">
                        <button onClick={shortRest} className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center gap-2">
                            <ArrowPathIcon className="w-4 h-4" /> Repos court
                        </button>
                        <button onClick={longRest} className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center gap-2">
                            <MoonIcon className="w-4 h-4" /> Repos long
                        </button>
                    </div>

                    {/* Hex Stats */}
                    <div className="order-4 lg:order-none">
                        <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                            {abilities.map((ability) => (
                                <HexStat
                                    key={ability}
                                    ability={ability}
                                    score={getTotalScore(ability)}
                                    modifier={getModifier(ability)}
                                    isSaveProficient={isSaveProficient(ability)}
                                    skillCount={getSkillCountByAbility(ability)}
                                    label={abilityLabels[ability]}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Saving Throws */}
                    <div className="order-5 lg:order-none">
                        <SavingThrowsSection
                            abilities={abilities}
                            isProficient={isSaveProficient}
                            getBreakdown={getSavingThrowBreakdown}
                            abilityLabels={abilityLabels}
                        />
                    </div>

                    {/* Senses */}
                    <div className="order-6 lg:order-none">
                        <SensesDisplay
                            perception={passivePerception}
                            investigation={passiveInvestigation}
                            insight={passiveInsight}
                        />
                    </div>
                </div>

                {/* ─── COLONNE 2 — Compétences + Spellcasting ─── */}
                <div className="space-y-4">
                    {/* Skills — collapsible mobile, flat desktop */}
                    <div className="lg:hidden">
                        <CollapsibleCard title="Compétences" badge={character.skillProficiencies?.length || 0}>
                            <div className="space-y-0.5 max-h-60 overflow-y-auto">
                                {allSkills.map((skill) => {
                                    const isProf = character.skillProficiencies?.includes(skill.name)
                                    return (
                                        <SkillRow
                                            key={skill.name}
                                            name={skill.name}
                                            ability={skill.ability}
                                            abilityLabel={abilityLabels[skill.ability]}
                                            bonus={getSkillBonus(skill.ability, !!isProf)}
                                            isProficient={!!isProf}
                                            breakdown={getSkillBreakdown(skill.name, skill.ability, !!isProf)}
                                        />
                                    )
                                })}
                            </div>
                        </CollapsibleCard>
                    </div>
                    <div className="hidden lg:block">
                        <div className="card p-4">
                            <h2 className="text-sm font-bold uppercase text-muted-foreground mb-4 tracking-wider">
                                Compétences
                                <span className="ml-2 text-xs normal-case">
                                    ({character.skillProficiencies?.length || 0} maîtrisées)
                                </span>
                            </h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {allSkills.map((skill) => {
                                    const isProf = character.skillProficiencies?.includes(skill.name)
                                    return (
                                        <SkillRow
                                            key={skill.name}
                                            name={skill.name}
                                            ability={skill.ability}
                                            abilityLabel={abilityLabels[skill.ability]}
                                            bonus={getSkillBonus(skill.ability, !!isProf)}
                                            isProficient={!!isProf}
                                            breakdown={getSkillBreakdown(skill.name, skill.ability, !!isProf)}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Spellcasting Summary — desktop uniquement */}
                    {character.characterClass?.spellcasting && (
                        <div className="hidden lg:block card p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
                                    Incantation
                                </h2>
                                <Link to="/spells" className="text-xs text-primary hover:underline">
                                    Voir les sorts →
                                </Link>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-primary/5 rounded-lg p-2">
                                    <div className="text-xl font-bold font-cinzel text-primary">
                                        {8 + proficiencyBonus + (character.characterClass?.spellcasting?.ability ? getModifier(character.characterClass.spellcasting.ability) : 0)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase">DD</div>
                                </div>
                                <div className="bg-primary/5 rounded-lg p-2">
                                    <div className="text-xl font-bold font-cinzel text-primary">
                                        +{proficiencyBonus + (character.characterClass?.spellcasting?.ability ? getModifier(character.characterClass.spellcasting.ability) : 0)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Attaque</div>
                                </div>
                                <div className="bg-primary/5 rounded-lg p-2">
                                    <div className="text-xl font-bold font-cinzel text-primary">
                                        {character.knownSpells?.length || 0}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Sorts</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Links — mobile */}
                    <div className="lg:hidden grid grid-cols-3 gap-2">
                        <Link to="/combat" className="card p-3 text-center hover:border-primary/50 transition-colors">
                            <FireIcon className="w-6 h-6 mx-auto mb-1 text-primary" />
                            <span className="text-sm font-medium">Combat</span>
                            {attacks.length > 0 && (
                                <span className="block text-xs text-muted-foreground mt-1">{attacks.length} attaques</span>
                            )}
                        </Link>
                        <Link to="/spells" className="card p-3 text-center hover:border-primary/50 transition-colors">
                            <SparklesIcon className="w-6 h-6 mx-auto mb-1 text-magic" />
                            <span className="text-sm font-medium">Sorts</span>
                        </Link>
                        <Link to="/inventory" className="card p-3 text-center hover:border-primary/50 transition-colors">
                            <ArchiveBoxIcon className="w-6 h-6 mx-auto mb-1 text-magic" />
                            <span className="text-sm font-medium">Inventaire</span>
                            {equippedItems.length > 0 && (
                                <span className="block text-xs text-muted-foreground mt-1">{equippedItems.length} objets</span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* ─── COLONNE 3 — Combat (desktop) ─── */}
                <div className="hidden lg:block space-y-4">
                    <div className="card p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <CombatBadge type="ac" value={ac} label="CA" breakdown={acBreakdown} />
                            <CombatBadge type="initiative" value={initiative} label="Initiative" breakdown={initiativeBreakdown} />
                            <CombatBadge type="speed" value={speed} label="Vitesse" suffix="m" />
                            <CombatBadge type="proficiency" value={proficiencyBonus} label="Maîtrise" />
                        </div>
                    </div>

                    <HPBlock
                        current={currentHp}
                        max={maxHp}
                        temp={character.tempHp ?? 0}
                        onHeal={(amount) => updateCurrentHp(Math.min(currentHp + amount, maxHp))}
                        onDamage={takeDamage}
                        onSetTempHP={updateTempHp}
                    />

                    {character.activeConditions && character.activeConditions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {character.activeConditions.map(cond => (
                                <span key={cond} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                                    style={{ backgroundColor: 'hsl(var(--destructive) / 0.15)', color: 'hsl(var(--destructive))' }}>
                                    {cond}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button onClick={shortRest} className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center gap-2">
                            <ArrowPathIcon className="w-4 h-4" /> Repos court
                        </button>
                        <button onClick={longRest} className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center gap-2">
                            <MoonIcon className="w-4 h-4" /> Repos long
                        </button>
                    </div>

                    <div className="space-y-2">
                        <Link to="/combat" className="card p-3 flex items-center justify-between hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <FireIcon className="w-5 h-5 text-primary" />
                                <div>
                                    <div className="font-medium">Combat</div>
                                    <div className="text-xs text-muted-foreground">{attacks.length} attaques configurées</div>
                                </div>
                            </div>
                            <span className="text-muted-foreground">→</span>
                        </Link>
                        <Link to="/spells" className="card p-3 flex items-center justify-between hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <SparklesIcon className="w-5 h-5 text-magic" />
                                <div>
                                    <div className="font-medium">Sorts</div>
                                    <div className="text-xs text-muted-foreground">{character.knownSpells?.length || 0} sorts connus</div>
                                </div>
                            </div>
                            <span className="text-muted-foreground">→</span>
                        </Link>
                        <Link to="/inventory" className="card p-3 flex items-center justify-between hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <ArchiveBoxIcon className="w-5 h-5 text-magic" />
                                <div>
                                    <div className="font-medium">Inventaire</div>
                                    <div className="text-xs text-muted-foreground">{equippedItems.length} objets équipés</div>
                                </div>
                            </div>
                            <span className="text-muted-foreground">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
