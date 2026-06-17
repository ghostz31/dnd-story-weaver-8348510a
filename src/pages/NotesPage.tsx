import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    BookOpenIcon,
    ChevronLeftIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/solid'
import { useCharacter } from '../contexts/CharacterContext'
import { EmptyState } from '../components/ui/EmptyState'
import type { SessionNote } from '../types/character'

type PersonalityKey = 'personalityTraits' | 'ideals' | 'bonds' | 'flaws'

export function NotesPage() {
    const { character, sessionNotes, addSessionNote, updateSessionNote, deleteSessionNote, updatePersonality } = useCharacter()
    const [activeTab, setActiveTab] = useState<'personality' | 'sessions'>('sessions')

    // Personality editing state
    const [editingPersonality, setEditingPersonality] = useState<PersonalityKey | null>(null)
    const [personalityDraft, setPersonalityDraft] = useState('')

    // Session note form state
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formTitle, setFormTitle] = useState('')
    const [formDate, setFormDate] = useState('')
    const [formContent, setFormContent] = useState('')
    const [formTags, setFormTags] = useState('')

    if (!character) {
        return (
            <div className="flex flex-col gap-4 animate-fade-in pb-8">
                <header className="flex items-center gap-3 mb-2">
                    <Link to="/" className="touch-target -ml-2">
                        <ChevronLeftIcon className="w-6 h-6" style={{ color: 'hsl(var(--muted-foreground))' }} />
                    </Link>
                    <h1 className="font-cinzel text-2xl font-bold">Notes</h1>
                </header>
                <div className="card text-center py-8">
                    <p className="text-ink-muted">Aucun personnage sélectionné.</p>
                    <Link to="/characters" className="btn btn-primary mt-4 inline-block">
                        Choisir un personnage
                    </Link>
                </div>
            </div>
        )
    }

    const resetForm = () => {
        setFormTitle('')
        setFormDate('')
        setFormContent('')
        setFormTags('')
        setIsAdding(false)
        setEditingId(null)
    }

    const handleAdd = async () => {
        if (!formTitle.trim() || !formDate) return
        await addSessionNote({
            title: formTitle.trim(),
            date: formDate,
            content: formContent.trim(),
            tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
        })
        resetForm()
    }

    const handleUpdate = async () => {
        if (!editingId || !formTitle.trim() || !formDate) return
        await updateSessionNote(editingId, {
            title: formTitle.trim(),
            date: formDate,
            content: formContent.trim(),
            tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
        })
        resetForm()
    }

    const startEdit = (note: SessionNote) => {
        setEditingId(note.id)
        setFormTitle(note.title)
        setFormDate(note.date)
        setFormContent(note.content)
        setFormTags(note.tags.join(', '))
        setIsAdding(false)
    }

    const startAdd = () => {
        resetForm()
        setIsAdding(true)
        setFormDate(new Date().toISOString().split('T')[0])
    }

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
                        { key: 'personalityTraits' as const, label: 'Traits de personnalité', icon: '\u{1F3AD}', color: 'var(--primary)' },
                        { key: 'ideals' as const, label: 'Idéaux', icon: '\u2B50', color: 'var(--color-gold)' },
                        { key: 'bonds' as const, label: 'Liens', icon: '\u{1F517}', color: 'var(--secondary)' },
                        { key: 'flaws' as const, label: 'Défauts', icon: '\u{1F494}', color: 'var(--color-hp)' },
                    ].map((item) => {
                        const isEditing = editingPersonality === item.key
                        const value = character[item.key] || ''
                        return (
                            <div key={item.key} className="card">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <span>{item.icon}</span>
                                        {item.label}
                                    </h3>
                                    {!isEditing && (
                                        <button
                                            onClick={() => {
                                                setEditingPersonality(item.key)
                                                setPersonalityDraft(value)
                                            }}
                                            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                                            aria-label={`Modifier ${item.label}`}
                                        >
                                            <PencilIcon className="w-4 h-4 text-ink-muted" />
                                        </button>
                                    )}
                                </div>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={personalityDraft}
                                            onChange={(e) => setPersonalityDraft(e.target.value)}
                                            className="input w-full min-h-[80px] text-sm"
                                            placeholder={`Décrivez vos ${item.label.toLowerCase()}...`}
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    await updatePersonality({ [item.key]: personalityDraft.trim() })
                                                    setEditingPersonality(null)
                                                }}
                                                className="btn btn-primary flex-1 text-sm"
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                                Sauvegarder
                                            </button>
                                            <button
                                                onClick={() => setEditingPersonality(null)}
                                                className="btn btn-secondary flex-1 text-sm"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-wrap">
                                        {value || 'Non renseigné'}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="flex flex-col gap-3 animate-fade-in">
                    {/* Add Note Button */}
                    {!isAdding && !editingId && (
                        <button onClick={startAdd} className="btn btn-primary w-full">
                            <PlusIcon className="w-5 h-5" />
                            Nouvelle note de session
                        </button>
                    )}

                    {/* Note Form */}
                    {(isAdding || editingId) && (
                        <div className="card flex flex-col gap-3 animate-fade-in">
                            <input
                                type="text"
                                placeholder="Titre de la note"
                                value={formTitle}
                                onChange={e => setFormTitle(e.target.value)}
                                className="input"
                            />
                            <input
                                type="date"
                                value={formDate}
                                onChange={e => setFormDate(e.target.value)}
                                className="input"
                            />
                            <textarea
                                placeholder="Contenu de la session..."
                                value={formContent}
                                onChange={e => setFormContent(e.target.value)}
                                rows={4}
                                className="input resize-none"
                            />
                            <input
                                type="text"
                                placeholder="Tags séparés par des virgules"
                                value={formTags}
                                onChange={e => setFormTags(e.target.value)}
                                className="input"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={editingId ? handleUpdate : handleAdd}
                                    className="btn btn-primary flex-1"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                    {editingId ? 'Modifier' : 'Ajouter'}
                                </button>
                                <button onClick={resetForm} className="btn btn-secondary flex-1">
                                    <XMarkIcon className="w-4 h-4" />
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Sessions List */}
                    {sessionNotes.length === 0 && !isAdding && !editingId && (
                        <EmptyState
                            icon={<BookOpenIcon className="w-8 h-8" />}
                            title="Aucune note de session"
                            description="Appuie sur le bouton ci-dessus pour en ajouter une."
                            action={{ label: 'Nouvelle note', onClick: startAdd }}
                        />
                    )}

                    {sessionNotes.map((session) => (
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
                                    <button onClick={() => startEdit(session)} className="touch-target">
                                        <PencilIcon className="w-4 h-4 text-ink-muted" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Supprimer cette note ?')) {
                                                await deleteSessionNote(session.id)
                                            }
                                        }}
                                        className="touch-target"
                                    >
                                        <TrashIcon className="w-4 h-4 text-ink-muted" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-ink-muted whitespace-pre-wrap mb-3">
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
