import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    BookOpenIcon,
    ChevronLeftIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/solid'

// Mock notes data
const mockNotes = {
    personality: {
        traits: 'Je ne supporte pas les menteurs et je déteste qu\'on me mente.',
        ideals: 'L\'honneur. Mon parole est sacrée, je tiens toujours mes promesses.',
        bonds: 'Je dois protéger ma famille à tout prix, même si elle est loin.',
        flaws: 'Je suis trop têtu et je refuse de changer d\'avis une fois décidé.',
    },
    sessions: [
        {
            id: '1',
            title: 'Session 12 - Le donjon des ombres',
            date: '2024-01-15',
            content: 'Nous avons exploré le donjon sous la montagne. Combat difficile contre le nécromancien. Thordak a failli mourir mais a été sauvé par Elara.',
            tags: ['combat', 'donjon', 'boss'],
        },
        {
            id: '2',
            title: 'Session 11 - Arrivée à Valdris',
            date: '2024-01-08',
            content: 'Rencontre avec le Seigneur Aldric. Il nous a confié la mission d\'enquêter sur les disparitions.',
            tags: ['quête', 'PNJ'],
        },
        {
            id: '3',
            title: 'Session 10 - La route du nord',
            date: '2024-01-01',
            content: 'Voyage vers Valdris. Embuscade de gobelins sur le chemin. Trouvé une carte mystérieuse.',
            tags: ['voyage', 'combat', 'loot'],
        },
    ],
}

export function NotesPage() {
    const [notes] = useState(mockNotes)
    const [activeTab, setActiveTab] = useState<'personality' | 'sessions'>('sessions')

    return (
        <div className="flex flex-col gap-4 animate-fade-in pb-8">
            {/* Header */}
            <header className="flex items-center gap-3 mb-2">
                <Link to="/" className="touch-target -ml-2">
                    <ChevronLeftIcon className="w-6 h-6" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </Link>
                <div className="flex-1">
                    <h1 className="font-cinzel text-2xl font-bold flex items-center gap-2">
                        <BookOpenIcon className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                        Notes
                    </h1>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 p-1 rounded-lg" style={{ background: 'hsl(var(--muted))' }}>
                <button
                    onClick={() => setActiveTab('sessions')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'sessions'
                            ? 'bg-[hsl(var(--card))] shadow-sm'
                            : 'text-ink-muted hover:text-ink'
                        }`}
                >
                    Sessions
                </button>
                <button
                    onClick={() => setActiveTab('personality')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'personality'
                            ? 'bg-[hsl(var(--card))] shadow-sm'
                            : 'text-ink-muted hover:text-ink'
                        }`}
                >
                    Personnalité
                </button>
            </div>

            {/* Personality Tab */}
            {activeTab === 'personality' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    {[
                        { key: 'traits', label: 'Traits de personnalité', icon: '🎭', color: 'var(--primary)' },
                        { key: 'ideals', label: 'Idéaux', icon: '⭐', color: 'var(--color-gold)' },
                        { key: 'bonds', label: 'Liens', icon: '🔗', color: 'var(--secondary)' },
                        { key: 'flaws', label: 'Défauts', icon: '💔', color: 'var(--color-hp)' },
                    ].map((item) => (
                        <div key={item.key} className="card">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <span>{item.icon}</span>
                                    {item.label}
                                </h3>
                                <button className="touch-target">
                                    <PencilIcon className="w-4 h-4 text-ink-muted" />
                                </button>
                            </div>
                            <p className="text-sm text-ink-muted leading-relaxed">
                                {notes.personality[item.key as keyof typeof notes.personality]}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="flex flex-col gap-3 animate-fade-in">
                    {/* Add Note Button */}
                    <button className="btn btn-primary w-full">
                        <PlusIcon className="w-5 h-5" />
                        Nouvelle note de session
                    </button>

                    {/* Sessions List */}
                    {notes.sessions.map((session) => (
                        <div key={session.id} className="card">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{session.title}</h3>
                                    <p className="text-xs text-ink-muted">
                                        {new Date(session.date).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button className="touch-target">
                                        <PencilIcon className="w-4 h-4 text-ink-muted" />
                                    </button>
                                    <button className="touch-target">
                                        <TrashIcon className="w-4 h-4 text-ink-muted" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-ink-muted line-clamp-2 mb-3">
                                {session.content}
                            </p>

                            {session.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    {session.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs px-2 py-0.5 rounded-full"
                                            style={{
                                                background: 'hsl(var(--primary) / 0.15)',
                                                color: 'hsl(var(--primary))'
                                            }}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
