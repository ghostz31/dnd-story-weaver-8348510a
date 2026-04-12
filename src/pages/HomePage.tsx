import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    PlusIcon,
    UserGroupIcon,
    SparklesIcon,
    ShieldCheckIcon,
    ScaleIcon,
    HeartIcon,
    ChevronRightIcon,
    ArrowRightOnRectangleIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore'

const MAX_CHARACTERS = 5

// Couleur thématique par classe
const classColors: Record<string, string> = {
    'Barbare': '0 72% 51%',
    'Barde': '280 60% 55%',
    'Clerc': '45 85% 48%',
    'Druide': '142 71% 42%',
    'Ensorceleur': '217 85% 55%',
    'Guerrier': '25 95% 50%',
    'Magicien': '217 85% 55%',
    'Moine': '210 65% 52%',
    'Paladin': '45 85% 48%',
    'Rôdeur': '152 69% 38%',
    'Roublard': '220 14% 40%',
    'Sorcier': '270 60% 55%',
}

// Types for character data
interface CharacterSummary {
    id: string;
    name: string;
    race: { name: string };
    characterClass: { name: string };
    level: number;
    hp: number;
}

// Confirmation Modal Component
function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
}: {
    isOpen: boolean
    title: string
    message: string
    confirmLabel: string
    onConfirm: () => void
    onCancel: () => void
}) {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <h3 id="modal-title" className="font-cinzel text-lg font-bold mb-2">{title}</h3>
                <p className="text-ink-muted text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="btn flex-1 bg-muted text-ink hover:bg-muted/80"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export function HomePage() {
    const { user, loading: authLoading, signInWithGoogle, logout, isAuthenticated } = useAuth()
    const [characters, setCharacters] = useState<CharacterSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

    useEffect(() => {
        const fetchCharacters = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                const q = query(
                    collection(db, 'users', user.uid, 'characters'),
                    orderBy('createdAt', 'desc')
                )
                const querySnapshot = await getDocs(q)
                const charData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as CharacterSummary[]
                setCharacters(charData)
            } catch (error) {
                console.error("Error fetching characters:", error)
            } finally {
                setLoading(false)
            }
        }

        if (!authLoading) {
            fetchCharacters()
        }
    }, [user, authLoading])

    const handleDeleteCharacter = async () => {
        if (!user || !deleteTarget) return

        try {
            await deleteDoc(doc(db, 'users', user.uid, 'characters', deleteTarget.id))
            setCharacters(prev => prev.filter(c => c.id !== deleteTarget.id))
        } catch (error) {
            console.error('Error deleting character:', error)
        } finally {
            setDeleteTarget(null)
        }
    }

    const canCreateMore = characters.length < MAX_CHARACTERS

    const getClassColor = (className: string) => classColors[className] || 'var(--primary)'

    return (
        <div className="space-y-10 pb-20 animate-fade-in px-4 max-w-5xl mx-auto">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-14 pb-6 text-center flex flex-col items-center">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full opacity-30 blur-[80px]"
                    style={{ background: 'hsl(var(--primary) / 0.4)' }}
                />

                <div className="relative mb-6 transform hover:scale-105 transition-transform duration-500">
                    <svg className="w-20 h-20 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,5.5V5c0-1.1-0.9-2-2-2h-3C14,1.9,13.1,1,12,1S10,1.9,10,3H7C5.9,3,5,3.9,5,5v0.5c-2.2,0.5-4,2.5-4,4.9v2.2 c0,3,2.4,5.4,5.4,5.4h1.1c1,1.8,2.9,3,5.1,3s4.1-1.2,5.1-3h1.1c3,0,5.4-2.4,5.4-5.4v-2.2C23,8,21.2,6,19,5.5z M12,3c0.6,0,1,0.4,1,1 s-0.4,1-1,1s-1-0.4-1-1S11.4,3,12,3z M19,10.4c0,1-0.8,1.8-1.8,1.8h-0.4c-0.3,0-0.5-0.2-0.5-0.5s0.2-0.5,0.5-0.5h0.4 c0.4,0,0.8-0.4,0.8-0.8V9.4c0-2-1.6-3.6-3.6-3.6h-4.8c-2,0-3.6,1.6-3.6,3.6v1 c0,0.4,0.4,0.8,0.8,0.8h0.4c0.3,0,0.5,0.2,0.5,0.5s-0.2,0.5-0.5,0.5H6.6C5.6,12.2,4.8,11.4,4.8,10.4V8.2c0-1.2,1-2.2,2.2-2.2h10 C18,6,19,7,19,8.2V10.4z" />
                    </svg>
                </div>

                <h1 className="text-5xl sm:text-6xl font-cinzel font-bold mb-3 tracking-tighter text-ink">
                    BESACE
                </h1>
                <p className="text-lg text-ink-muted mb-8 italic font-medium max-w-md mx-auto">
                    Gardez l'essentiel de vos aventures à portée de main
                </p>

                {/* Auth Section */}
                {!isAuthenticated ? (
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={signInWithGoogle}
                            className="btn text-base px-7 py-3.5 font-cinzel tracking-wider group bg-white text-gray-800 border border-gray-200 hover:border-primary/40 hover:shadow-md transition-colors flex items-center gap-3 shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Connexion Google
                        </button>
                        <p className="text-sm text-ink-muted">
                            Connectez-vous pour créer et sauvegarder vos personnages
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        {/* User Profile */}
                        <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-full border border-border/40">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt=""
                                    className="w-8 h-8 rounded-full"
                                    width={32}
                                    height={32}
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-primary font-bold text-sm">
                                        {user?.displayName?.[0] || user?.email?.[0] || '?'}
                                    </span>
                                </div>
                            )}
                            <span className="text-sm font-medium text-ink">
                                {user?.displayName || user?.email}
                            </span>
                            <button
                                onClick={logout}
                                className="ml-2 p-1.5 hover:bg-muted/50 rounded-full transition-colors"
                                aria-label="Se déconnecter"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5 text-ink-muted" />
                            </button>
                        </div>

                        {canCreateMore ? (
                            <Link to="/create" className="btn-primary btn btn-shine text-base px-7 py-3.5 font-cinzel tracking-wider group">
                                Nouveau Héros
                                <PlusIcon className="w-5 h-5 ml-1.5 group-hover:rotate-90 transition-transform" />
                            </Link>
                        ) : (
                            <div className="text-center">
                                <div className="btn bg-muted/50 text-ink-muted cursor-not-allowed text-base px-7 py-3.5 font-cinzel tracking-wider">
                                    Limite Atteinte
                                </div>
                                <p className="text-sm text-ink-muted mt-2">Maximum {MAX_CHARACTERS} personnages</p>
                            </div>
                        )}
                        <p className="text-xs text-ink-muted tabular-nums">
                            {characters.length} / {MAX_CHARACTERS} personnages
                        </p>
                    </div>
                )}
            </section>

            {/* Characters List Section */}
            <section>
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="section-header mb-0">
                        Vos Compagnons
                    </h2>
                    {characters.length > 0 && (
                        <Link to="/character" className="text-sm font-semibold text-primary hover:underline flex items-center">
                            Voir tout <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map(i => (
                            <div key={i} className="card h-36 animate-pulse bg-muted/20 border-border/30" />
                        ))}
                    </div>
                ) : characters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                        {characters.map((char) => {
                            const classColor = getClassColor(char.characterClass.name)
                            return (
                                <div
                                    key={char.id}
                                    className="card group hover:shadow-md relative overflow-hidden"
                                    style={{ borderColor: `hsl(${classColor} / 0.2)` }}
                                >
                                    {/* Class color strip */}
                                    <div
                                        className="absolute top-0 left-0 right-0 h-1"
                                        style={{ background: `hsl(${classColor})` }}
                                    />

                                    {/* Delete button */}
                                    <button
                                        onClick={() => setDeleteTarget({ id: char.id, name: char.name })}
                                        className="absolute top-4 right-3 p-2 bg-red-500/8 hover:bg-red-500/15 rounded-lg transition-colors z-10"
                                        aria-label={`Supprimer ${char.name}`}
                                    >
                                        <TrashIcon className="w-4 h-4 text-red-500/70" />
                                    </button>

                                    <div className="flex justify-between items-start mb-4 pr-10 pt-1">
                                        <div>
                                            <h3 className="text-lg font-bold text-ink tracking-tight mb-0.5 group-hover:text-primary transition-colors">
                                                {char.name}
                                            </h3>
                                            <p className="text-sm text-ink-muted font-medium">
                                                {char.race.name} {char.characterClass.name} • niv. {char.level}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                                            <HeartIcon className="w-4 h-4" style={{ color: 'hsl(var(--color-hp-high))' }} aria-hidden="true" />
                                            <span className="font-semibold tabular-nums" style={{ color: 'hsl(var(--color-hp-high))' }}>{char.hp} PV</span>
                                        </div>
                                        <Link
                                            to={`/character/${char.id}`}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors"
                                        >
                                            Ouvrir la fiche
                                            <ChevronRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="card text-center py-14 bg-muted/5 border-dashed border-2 border-border/30">
                        <UserGroupIcon className="w-14 h-14 mx-auto mb-4 text-ink-muted/25" />
                        <p className="text-ink-muted/50 font-medium italic mb-5">
                            Aucun héros n'a encore rejoint votre besace…
                        </p>
                        <Link to="/create" className="btn btn-secondary text-sm font-bold uppercase tracking-widest">
                            Commencer l'aventure
                        </Link>
                    </div>
                )}
            </section>

            {/* Quick Access Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to="/spells" className="card-stat group hover:border-[hsl(var(--color-xp)/0.4)] py-6">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--color-xp) / 0.1)' }}>
                        <SparklesIcon className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'hsl(var(--color-xp))' }} />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase text-ink">Grimoire</span>
                </Link>
                <Link to="/inventory" className="card-stat group hover:border-[hsl(var(--color-gold)/0.4)] py-6">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--color-gold) / 0.1)' }}>
                        <ShieldCheckIcon className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'hsl(var(--color-gold))' }} />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase text-ink">Sac de Dos</span>
                </Link>
                <Link to="/notes" className="card-stat group hover:border-[hsl(var(--color-ac)/0.4)] py-6">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--color-ac) / 0.1)' }}>
                        <ScaleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'hsl(var(--color-ac))' }} />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase text-ink">Archives</span>
                </Link>
                <div className="card-stat opacity-40 py-6 cursor-not-allowed">
                    <div className="w-10 h-10 mx-auto mb-3 border-2 border-dashed border-ink-muted/20 rounded-lg" />
                    <span className="text-xs font-bold tracking-wider uppercase text-ink-muted/50 italic">Sync Trame</span>
                </div>
            </section>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Supprimer ce personnage ?"
                message={`${deleteTarget?.name} sera supprimé définitivement. Cette action est irréversible.`}
                confirmLabel="Supprimer"
                onConfirm={handleDeleteCharacter}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    )
}
