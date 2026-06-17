import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { loadAuroraBackgrounds, type ConvertedBackground } from '../../utils/background-converter'
import { useAuth } from '../../contexts/AuthContext'
import { dataStore } from '../../lib/dataStore'
import {
    UserCircleIcon,
    SparklesIcon,
    ShieldCheckIcon,
    HeartIcon,
    BoltIcon,
    BookOpenIcon,
    GlobeAltIcon,
    ArrowRightIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/solid'
import { getFinalAbilityScores } from '../../utils/characterUtils'
import { getFeatById } from '../../data/feats'
import type { SpellV2 } from '../../types/aurora-v2'

const abilityNames: Record<string, string> = {
    str: 'FOR',
    dex: 'DEX',
    con: 'CON',
    int: 'INT',
    wis: 'SAG',
    cha: 'CHA',
}

const abilityFullNames: Record<string, string> = {
    str: 'Force',
    dex: 'Dextérité',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Sagesse',
    cha: 'Charisme',
}

const skillAbilities: Record<string, string> = {
    'Acrobaties': 'dex',
    'Dressage': 'wis',
    'Arcanes': 'int',
    'Athlétisme': 'str',
    'Tromperie': 'cha',
    'Histoire': 'int',
    'Perspicacité': 'wis',
    'Intimidation': 'cha',
    'Investigation': 'int',
    'Médecine': 'wis',
    'Nature': 'int',
    'Perception': 'wis',
    'Représentation': 'cha',
    'Persuasion': 'cha',
    'Religion': 'int',
    'Escamotage': 'dex',
    'Discrétion': 'dex',
    'Survie': 'wis',
}

function getModifier(score: number): number {
    return Math.floor((score - 10) / 2)
}

function formatMod(mod: number): string {
    return mod >= 0 ? `+${mod}` : `${mod}`
}

function getProficiencyBonus(level: number): number {
    return Math.ceil(1 + level / 4)
}

function getWeaponAbility(item: { properties?: string[]; range?: unknown }): 'str' | 'dex' {
    const hasFinesse = item.properties?.includes('finesse')
    const isRanged = item.properties?.includes('range') || item.properties?.includes('thrown')
    if (isRanged) return 'dex'
    if (hasFinesse) return 'dex' // Could be str too, but we'll show both note
    return 'str'
}

export function ReviewStep() {
    const navigate = useNavigate()
    const { character, resetWizard } = useWizard()
    const { user, signInWithGoogle } = useAuth()

    const [backgrounds, setBackgrounds] = useState<ConvertedBackground[]>([])
    const [allSpells, setAllSpells] = useState<SpellV2[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        Promise.all([
            loadAuroraBackgrounds(),
            fetch('/data/aurora/spells.json').then(r => r.json()).then((d: SpellV2[] | { spells: SpellV2[] }) => {
                if (Array.isArray(d)) return d
                return d.spells || []
            }),
        ]).then(([bgs, spells]) => {
            setBackgrounds(bgs)
            setAllSpells(spells)
            setLoading(false)
        })
    }, [])

    // Core calculations
    const finalAbilityScores = getFinalAbilityScores(character)
    const subrace = character.race?.subraces?.find(s => s.id === character.subrace)
    const background = backgrounds.find(bg => bg.id === character.background)

    const getScore = (ability: keyof typeof finalAbilityScores) => finalAbilityScores[ability]

    const conMod = getModifier(getScore('con'))
    const dexMod = getModifier(getScore('dex'))

    const proficiencyBonus = getProficiencyBonus(character.level)

    // HP
    const baseHp = (character.characterClass?.hitDie || 8) + conMod
    const levelUpHp = Math.max(1, Math.floor((character.characterClass?.hitDie || 8) / 2) + 1 + conMod)
    const hp = baseHp + (levelUpHp * (character.level - 1))

    // AC
    const inventory = character.inventory || []
    const equippedArmor = inventory.find(
        i => i.equipped && i.type === 'armor' && i.armorCategory && i.armorCategory !== 'shield'
    )
    const equippedShield = inventory.find(
        i => i.equipped && i.type === 'armor' && i.armorCategory === 'shield'
    )
    let ac = 10 + dexMod
    const acBreakdown: string[] = [`Base 10 + DEX ${formatMod(dexMod)}`]
    if (equippedArmor) {
        ac = equippedArmor.armorClass || 10
        acBreakdown.length = 0
        acBreakdown.push(`${equippedArmor.name} CA ${equippedArmor.armorClass}`)
        if (equippedArmor.addDex) {
            const maxDex = equippedArmor.maxDex ?? (equippedArmor.armorCategory === 'medium' ? 2 : undefined)
            const appliedDex = maxDex !== undefined ? Math.min(dexMod, maxDex) : dexMod
            ac += appliedDex
            if (appliedDex !== 0) {
                acBreakdown.push(`+ DEX ${formatMod(appliedDex)}${maxDex !== undefined ? ` (max ${maxDex})` : ''}`)
            }
        }
    }
    if (equippedShield) {
        ac += equippedShield.armorClass || 0
        acBreakdown.push(`+ Bouclier ${equippedShield.armorClass}`)
    }

    // Initiative
    const initiative = dexMod

    // Speed
    const speed = character.race?.speed || 30

    // Equipped weapons
    const equippedWeapons = inventory.filter(i => i.equipped && i.type === 'weapon')

    // Spellcasting
    const spellcasting = character.characterClass?.spellcasting
    const spellAbility = spellcasting?.ability
    const spellAbilityMod = spellAbility ? getModifier(getScore(spellAbility)) : 0
    const spellSaveDC = spellcasting ? 8 + proficiencyBonus + spellAbilityMod : null
    const spellAttackBonus = spellcasting ? proficiencyBonus + spellAbilityMod : null

    // Selected spells lookup
    const selectedSpellData = useMemo(() => {
        return character.selectedSpells.map(name => {
            const spell = allSpells.find(s => s.name === name)
            return { name, level: spell?.level ?? 0, school: spell?.school ?? '' }
        }).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name, 'fr'))
    }, [character.selectedSpells, allSpells])

    const selectedCantrips = selectedSpellData.filter(s => s.level === 0)
    const selectedLeveled = selectedSpellData.filter(s => s.level > 0)

    // Skills with values
    const skillValues = useMemo(() => {
        const result: { name: string; ability: string; mod: number; total: number; isProficient: boolean }[] = []
        for (const [skill, ability] of Object.entries(skillAbilities)) {
            const isProficient = character.skillProficiencies.includes(skill)
            const mod = getModifier(getScore(ability as keyof typeof finalAbilityScores))
            const total = mod + (isProficient ? proficiencyBonus : 0)
            result.push({ name: skill, ability, mod, total, isProficient })
        }
        return result.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'fr'))
    }, [character.skillProficiencies, finalAbilityScores, proficiencyBonus])

    // Class resources
    const resources = character.characterClass?.classResources
    const resourceItems: { label: string; value: string }[] = []
    if (resources) {
        if (resources.hasRage) resourceItems.push({ label: 'Rage', value: `${2 + getModifier(getScore('con'))} / repos` })
        if (resources.hasKi) resourceItems.push({ label: 'Ki', value: `${character.level} / repos` })
        if (resources.hasChannelDivinity) resourceItems.push({ label: 'Canal divin', value: '1 / repos' })
        if (resources.hasSorceryPoints) resourceItems.push({ label: 'Points de sorcellerie', value: `${character.level} / repos` })
        if (resources.hasBardicInspiration) resourceItems.push({ label: 'Inspiration bardique', value: `${Math.max(1, getModifier(getScore('cha')))}d6` })
        if (resources.hasSecondWind) resourceItems.push({ label: 'Second souffle', value: '1 / repos court' })
        if (resources.hasActionSurge) resourceItems.push({ label: 'Fougue', value: '1 / repos' })
        if (resources.hasWildShape) resourceItems.push({ label: 'Forme sauvage', value: `${Math.floor(character.level / 2)} / repos` })
        if (resources.hasLayOnHands) resourceItems.push({ label: 'Imposition des mains', value: `${character.level * 5} PV` })
    }

    const handleCreate = async () => {
        setSaving(true)
        try {
            const currentUserId = user?.uid;
            console.log('[ReviewStep] Début création, userId:', currentUserId);

            if (!currentUserId) {
                console.warn('[ReviewStep] Utilisateur non authentifié, tentative de connexion...');
                await signInWithGoogle();
                return;
            }

            const feats: string[] = []
            if (character.asiChoices) {
                Object.values(character.asiChoices).forEach(choice => {
                    if (choice.type === 'feat' && choice.featId) {
                        feats.push(choice.featId)
                    }
                })
            }

            const characterData = {
                name: character.name,
                raceId: character.race?.id || null,
                subraceId: character.subrace || null,
                race: character.race ? {
                    id: character.race.id,
                    name: character.race.name,
                    speed: character.race.speed,
                    abilityBonuses: character.race.abilityBonuses || {},
                } : null,
                classId: character.characterClass?.id || null,
                characterClass: character.characterClass ? {
                    id: character.characterClass.id,
                    name: character.characterClass.name,
                    nameEn: character.characterClass.nameEn,
                    hitDie: character.characterClass.hitDie,
                    primaryAbility: character.characterClass.primaryAbility,
                    savingThrows: character.characterClass.savingThrows,
                    hasSpellcasting: !!character.characterClass.spellcasting,
                    spellcastingAbility: character.characterClass.spellcasting?.ability || null,
                } : null,
                abilityScores: finalAbilityScores,
                background: character.background,
                skillProficiencies: character.skillProficiencies || [],
                alignment: character.alignment || '',
                personalityTraits: character.personalityTraits || '',
                ideals: character.ideals || '',
                bonds: character.bonds || '',
                flaws: character.flaws || '',
                hp,
                currentHp: hp,
                ac,
                initiative,
                speed,
                proficiencyBonus,
                feats,
                classOptions: character.classOptions || {},
                level: character.level,
                userId: currentUserId,
                inventory: {
                    items: (character.inventory || []).map((item, idx) => {
                        const cleanItem: Record<string, unknown> = { id: item.id || `start-${idx}` }
                        for (const [key, value] of Object.entries(item)) {
                            if (value !== undefined) {
                                cleanItem[key] = value
                            }
                        }
                        return cleanItem
                    }),
                    currency: { pp: 0, gp: 15, ep: 0, sp: 0, cp: 0 },
                },
            }

            console.log('[ReviewStep] Création via dataStore, userId:', currentUserId);
            const newId = await dataStore.createCharacter(currentUserId, characterData)
            console.log('[ReviewStep] Personnage créé, ID:', newId)

            // Stocker l'ID pour que CharacterContext puisse auto-charger
            localStorage.setItem('besace-selected-character', newId)
            console.log('[ReviewStep] ID stocké dans localStorage')

            resetWizard()
            // Rediriger vers la fiche du personnage au lieu de l'accueil
            navigate(`/character/${newId}`)
            console.log('[ReviewStep] Navigation vers /character/' + newId)
        } catch (error) {
            console.error('[ReviewStep] Erreur création personnage:', error)
            alert('Erreur lors de la création du personnage. Détails dans la console.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <WizardShell title="Résumé" subtitle="Chargement des données...">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            </WizardShell>
        )
    }

    return (
        <WizardShell
            title="Résumé"
            subtitle="Vérifiez votre personnage avant de le créer"
            nextLabel="Créer le personnage"
            onNext={handleCreate}
            loading={saving}
        >
            {/* Character header */}
            <div className="card mb-6 text-center bg-muted/20">
                <UserCircleIcon className="w-16 h-16 mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold font-cinzel text-ink">{character.name}</h2>
                <p className="text-ink-muted">
                    {character.race?.name}
                    {subrace && ` (${subrace.name})`}
                    {' • '}
                    {character.characterClass?.name} niveau {character.level}
                </p>
                {background && (
                    <p className="text-sm text-ink-muted mt-1 font-medium italic">
                        Historique: {background.name}
                    </p>
                )}
                {character.alignment && (
                    <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-muted/50 text-xs text-ink-muted border border-border">
                        {character.alignment}
                    </span>
                )}
            </div>

            {/* Combat stats */}
            <div className="card mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-ink uppercase text-sm tracking-widest">
                    <ShieldCheckIcon className="w-5 h-5 text-secondary" />
                    Stats de combat
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <StatBox icon={<HeartIcon className="w-5 h-5 text-hp-high" />} value={hp} label="PV" />
                    <StatBox icon={<ShieldCheckIcon className="w-5 h-5 text-ac" />} value={ac} label="CA" tooltip={acBreakdown.join('\n')} />
                    <StatBox icon={<BoltIcon className="w-5 h-5 text-yellow-400" />} value={formatMod(initiative)} label="Initiative" />
                    <StatBox icon={<ArrowRightIcon className="w-5 h-5 text-ink-muted/50" />} value={speed} label="Vitesse" />
                    <StatBox icon={<SparklesIcon className="w-5 h-5 text-primary" />} value={`+${proficiencyBonus}`} label="Maîtrise" />
                    <StatBox icon={<BookOpenIcon className="w-5 h-5 text-ac" />} value={character.characterClass?.hitDie || 8} label="Dé de vie" />
                </div>

                {/* AC breakdown */}
                {equippedArmor && (
                    <div className="text-xs text-ink-muted bg-muted/30 rounded-lg p-2 border border-border/40">
                        <strong className="text-ink">CA détaillée :</strong>{' '}
                        {acBreakdown.join(' + ')} = <strong className="text-ink">{ac}</strong>
                    </div>
                )}
            </div>

            {/* Ability scores */}
            <div className="card mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-ink uppercase text-sm tracking-widest">
                    <SparklesIcon className="w-5 h-5 text-secondary" />
                    Caractéristiques
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(finalAbilityScores) as (keyof typeof finalAbilityScores)[]).map((ability) => {
                        const total = getScore(ability)
                        const mod = getModifier(total)
                        return (
                            <div key={ability} className="flex flex-col items-center p-2 bg-muted/30 rounded-lg border border-border/40">
                                <span className="text-[10px] text-ink-muted font-bold uppercase">{abilityNames[ability]}</span>
                                <span className="text-lg font-bold text-ink">{total}</span>
                                <span className="text-xs font-bold text-primary">{formatMod(mod)}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Attacks */}
            {equippedWeapons.length > 0 && (
                <div className="card mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-ink uppercase text-sm tracking-widest">
                        <BoltIcon className="w-5 h-5 text-destructive" />
                        Attaques
                    </h3>
                    <div className="space-y-2">
                        {equippedWeapons.map((weapon, idx) => {
                            const ability = getWeaponAbility(weapon)
                            const abilityMod = getModifier(getScore(ability))
                            const attackBonus = abilityMod + proficiencyBonus
                            return (
                                <div key={`${weapon.id}-${idx}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/40 text-sm">
                                    <div>
                                        <span className="font-bold text-ink">{weapon.name}</span>
                                        {weapon.properties && weapon.properties.length > 0 && (
                                            <span className="text-xs text-ink-muted ml-2">({weapon.properties.join(', ')})</span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-primary">+{attackBonus} toucher</div>
                                        <div className="text-xs text-ink-muted">
                                            {weapon.damage}{weapon.versatileDamage ? ` / ${weapon.versatileDamage}` : ''} {weapon.damageType}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Spellcasting */}
            {spellcasting && (
                <div className="card mb-6 border-primary/30 bg-primary/5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-ink uppercase text-sm tracking-widest">
                        <SparklesIcon className="w-5 h-5 text-magic" />
                        Incantation ({abilityFullNames[spellAbility || 'int']})
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg border border-border/40">
                            <span className="text-[10px] text-ink-muted font-bold uppercase">DD Sauvegarde</span>
                            <span className="text-xl font-bold text-ink">{spellSaveDC}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg border border-border/40">
                            <span className="text-[10px] text-ink-muted font-bold uppercase">Attaque Sort</span>
                            <span className="text-xl font-bold text-ink">+{spellAttackBonus}</span>
                        </div>
                    </div>
                    {selectedCantrips.length > 0 && (
                        <div className="mb-2">
                            <span className="text-xs font-bold text-ink-muted uppercase">Sorts mineurs</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {selectedCantrips.map(s => (
                                    <span key={s.name} className="px-2 py-0.5 rounded-full bg-magic/10 border border-magic/20 text-xs text-magic/80">
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {selectedLeveled.length > 0 && (
                        <div>
                            <span className="text-xs font-bold text-ink-muted uppercase">Sorts</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {selectedLeveled.map(s => (
                                    <span key={s.name} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
                                        {s.name} <span className="text-ink-muted/60">(N{s.level})</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {selectedSpellData.length === 0 && (
                        <p className="text-xs text-ink-muted">Aucun sort sélectionné.</p>
                    )}
                </div>
            )}

            {/* Skills */}
            <div className="card mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-ink uppercase text-sm tracking-widest">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-ac" />
                    Compétences
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {skillValues.filter(s => s.isProficient).map(skill => (
                        <div key={skill.name} className="flex items-center justify-between px-2 py-1.5 bg-muted/30 rounded-md border border-border/40 text-xs">
                            <span className="text-ink">{skill.name}</span>
                            <span className="font-bold text-primary">{formatMod(skill.total)}</span>
                        </div>
                    ))}
                </div>
                {skillValues.filter(s => s.isProficient).length === 0 && (
                    <p className="text-xs text-ink-muted">Aucune compétence maîtrisée.</p>
                )}
            </div>

            {/* Languages */}
            {character.languages.length > 0 && (
                <div className="card mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-ink uppercase text-sm tracking-widest">
                        <GlobeAltIcon className="w-5 h-5 text-dex" />
                        Langues
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {character.languages.map(lang => (
                            <span key={lang} className="px-3 py-1 bg-muted/30 rounded-full text-xs text-ink border border-border/40">
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Class resources */}
            {resourceItems.length > 0 && (
                <div className="card mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-ink uppercase text-sm tracking-widest">
                        <BoltIcon className="w-5 h-5 text-yellow-400" />
                        Ressources de classe
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {resourceItems.map(res => (
                            <div key={res.label} className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-lg border border-border/40 text-sm">
                                <span className="text-ink-muted">{res.label}</span>
                                <span className="font-bold text-ink">{res.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Equipped gear summary */}
            {inventory.some(i => i.equipped) && (
                <div className="card mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-ink uppercase text-sm tracking-widest">
                        <ShieldCheckIcon className="w-5 h-5 text-secondary" />
                        Équipement équipé
                    </h3>
                    <div className="space-y-1.5">
                        {inventory.filter(i => i.equipped).map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="flex items-center gap-2 text-sm text-ink-muted">
                                <span className="text-primary">•</span>
                                <span className="text-ink font-medium">{item.name}</span>
                                {item.quantity > 1 && <span className="text-xs">×{item.quantity}</span>}
                                {item.armorClass && <span className="text-xs text-ink-muted">— CA +{item.armorClass}</span>}
                                {item.damage && <span className="text-xs text-ink-muted">— {item.damage} {item.damageType}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Traits */}
            {character.race && character.race.traits.length > 0 && (
                <div className="card mb-6">
                    <h3 className="font-semibold mb-3 text-ink text-sm uppercase tracking-widest">Traits raciaux</h3>
                    <ul className="text-sm space-y-2">
                        {character.race.traits.map((trait, i) => (
                            <li key={i} className="flex items-start gap-3 text-ink-muted">
                                <span className="text-primary font-bold">•</span>
                                {trait}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Feats & ASI Summary */}
            {character.asiChoices && Object.keys(character.asiChoices).length > 0 && (
                <div className="card mb-6">
                    <h3 className="font-semibold mb-3 text-ink text-sm uppercase tracking-widest flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-magic" />
                        Améliorations & Dons
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(character.asiChoices).map(([level, choice]) => (
                            <div key={level} className="text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                                <span className="text-primary font-bold mr-2">{level === '0' ? 'Humain Variante' : `Niveau ${level}`}:</span>
                                {choice.type === 'stats' && choice.stats ? (
                                    <span className="text-ink-muted">
                                        {Object.entries(choice.stats).map(([k, v]) => `${abilityNames[k]} +${v}`).join(', ')}
                                    </span>
                                ) : choice.type === 'feat' && choice.featId ? (
                                    <span className="text-ink-muted">
                                        Don : <strong className="text-ink">{getFeatById(choice.featId)?.name}</strong>
                                    </span>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </WizardShell>
    )
}

function StatBox({ icon, value, label, tooltip }: { icon: React.ReactNode; value: string | number; label: string; tooltip?: string }) {
    return (
        <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border border-border/40" title={tooltip}>
            {icon}
            <span className="text-xl font-bold text-ink mt-1">{value}</span>
            <span className="text-[10px] uppercase text-ink-muted font-bold">{label}</span>
        </div>
    )
}
