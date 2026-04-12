import { useNavigate } from 'react-router-dom'
import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { backgrounds } from '../../data/backgrounds'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import {
    UserCircleIcon,
    SparklesIcon,
    ShieldCheckIcon,
    HeartIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/solid'
import { convertStartingEquipment } from '../../data/equipment'
import { getFinalAbilityScores } from '../../utils/characterUtils'
import { getFeatById } from '../../data/feats'

const abilityNames: Record<string, string> = {
    str: 'FOR',
    dex: 'DEX',
    con: 'CON',
    int: 'INT',
    wis: 'SAG',
    cha: 'CHA',
}

export function ReviewStep() {
    const navigate = useNavigate()
    const { character, resetWizard } = useWizard()
    const { user, signInWithGoogle } = useAuth()

    const getModifier = (score: number) => Math.floor((score - 10) / 2)
    const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`)

    // Calculate totals including ASI and Feats
    const finalAbilityScores = getFinalAbilityScores(character)
    const subrace = character.race?.subraces?.find(s => s.id === character.subrace)

    const getScore = (ability: keyof typeof character.abilityScores) => finalAbilityScores[ability]

    const conScore = getScore('con')
    const conMod = getModifier(conScore)

    // HP calculation: (hitDie + conMod) at level 1, plus (avg(hitDie) + conMod) for each level after
    const baseHp = (character.characterClass?.hitDie || 8) + conMod
    const levelUpHp = Math.max(1, Math.floor((character.characterClass?.hitDie || 8) / 2) + 1 + conMod)
    const hp = baseHp + (levelUpHp * (character.level - 1))

    const dexScore = getScore('dex')
    const dexMod = getModifier(dexScore)

    const backgroundData = backgrounds.find(b => b.id === character.background)

    const handleCreate = async () => {
        try {
            let currentUserId = user?.uid;

            if (!currentUserId) {
                // Si non connecté, proposer la connexion Google
                await signInWithGoogle();
                return; // L'effet useAuth rechargera le composant avec l'utilisateur
            }

            // Préparer les données pour Firestore (éviter les tableaux imbriqués)
            // On stocke les IDs de race/class plutôt que les objets complets avec spellSlots

            // Collect all feats (from ASI choices)
            // Note: character.feats n'existe pas sur CharacterCreation pour l'instant
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
                // Stocker les données de race simplifiées (sans tableaux imbriqués)
                race: character.race ? {
                    id: character.race.id,
                    name: character.race.name,
                    speed: character.race.speed,
                    abilityBonuses: character.race.abilityBonuses || {},
                } : null,
                classId: character.characterClass?.id || null,
                // Stocker les données de classe simplifiées (exclure spellSlots qui contient des tableaux imbriqués)
                characterClass: character.characterClass ? {
                    id: character.characterClass.id,
                    name: character.characterClass.name,
                    nameEn: character.characterClass.nameEn,
                    hitDie: character.characterClass.hitDie,
                    primaryAbility: character.characterClass.primaryAbility,
                    savingThrows: character.characterClass.savingThrows,
                    // Ne pas inclure spellcasting.spellSlots car ce sont des tableaux imbriqués
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
                currentHp: hp, // PV actuels = PV max au départ
                ac: 10 + dexMod,
                feats, // Save feats list
                level: character.level,
                userId: currentUserId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                // Inventaire de départ avec l'équipement de classe
                // Nettoyer les valeurs undefined que Firestore n'accepte pas
                inventory: {
                    items: convertStartingEquipment(character.characterClass?.startingEquipment || []).map((item, idx) => {
                        const cleanItem: Record<string, unknown> = { id: `start-${idx}` }
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

            // Save to Firestore sous /users/{userId}/characters (respecte les règles Trame)
            const docRef = await addDoc(collection(db, 'users', currentUserId, 'characters'), characterData)
            console.log('Character created successfully with ID:', docRef.id)

            resetWizard()
            navigate('/')
        } catch (error) {
            console.error('Error creating character:', error)
            alert('Erreur lors de la création. Vérifiez la console pour plus de détails.')
        }
    }

    return (
        <WizardShell
            title="Résumé"
            subtitle="Vérifiez votre personnage avant de le créer"
            nextLabel="Créer le personnage"
            onNext={handleCreate}
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
                {backgroundData && (
                    <p className="text-sm text-ink-muted mt-1 font-medium italic">
                        Historique: {backgroundData.name}
                    </p>
                )}
            </div>

            {/* Combat stats */}
            <div className="card mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-ink uppercase text-sm tracking-widest">
                    <ShieldCheckIcon className="w-5 h-5 text-secondary" />
                    Stats de Combat
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border border-border/40">
                        <HeartIcon className="w-5 h-5 text-hp-high" />
                        <span className="text-xl font-bold text-ink">{hp}</span>
                        <span className="text-[10px] uppercase text-ink-muted font-bold">PV</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border border-border/40">
                        <ShieldCheckIcon className="w-5 h-5 text-ac" />
                        <span className="text-xl font-bold text-ink">{10 + dexMod}</span>
                        <span className="text-[10px] uppercase text-ink-muted font-bold">CA</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border border-border/40">
                        <ArrowRightIcon className="w-5 h-5 text-ink-muted/50" />
                        <span className="text-xl font-bold text-ink">{character.race?.speed || 30}</span>
                        <span className="text-[10px] uppercase text-ink-muted font-bold">FT</span>
                    </div>
                </div>
            </div>

            {/* Ability scores */}
            <div className="card mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-ink uppercase text-sm tracking-widest">
                    <SparklesIcon className="w-5 h-5 text-secondary" />
                    Caractéristiques
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(character.abilityScores) as (keyof typeof character.abilityScores)[]).map((ability) => {
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

            {/* Traits */}
            {character.race && (
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
                        <SparklesIcon className="w-4 h-4 text-purple-400" />
                        Améliorations & Dons
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(character.asiChoices).map(([level, choice]) => (
                            <div key={level} className="text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                                <span className="text-primary font-bold mr-2">Niveau {level}:</span>
                                {choice.type === 'stats' && choice.stats ? (
                                    <span className="text-ink-muted">
                                        Augmentation de caractéristiques ({Object.entries(choice.stats).map(([k, v]) => `${abilityNames[k]} +${v}`).join(', ')})
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

            {/* Spellcasting note */}
            {character.characterClass?.spellcasting && (
                <div className="card mb-6 border-primary/30 bg-primary/5">
                    <p className="text-sm text-ink-muted leading-relaxed">
                        ✨ <strong className="text-primary">{character.characterClass.name}</strong> est un lanceur de sorts.
                        Vous pourrez choisir vos sorts après la création.
                    </p>
                </div>
            )}
        </WizardShell>
    )
}
