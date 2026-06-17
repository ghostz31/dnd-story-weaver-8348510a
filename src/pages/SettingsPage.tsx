import { Link } from 'react-router-dom'
import {
    ChevronLeftIcon,
    Cog6ToothIcon,
    AcademicCapIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/solid'
import { useSettings } from '../hooks/useSettings'
import { useDarkMode } from '../hooks/useDarkMode'
import { ThemePicker } from '../components/ThemePicker'

export function SettingsPage() {
    const { settings, toggleBeginnerMode, completeTutorial, setTutorialStep } = useSettings()
    const { dark, toggle: toggleDarkMode } = useDarkMode()

    const handleRestartTutorial = () => {
        setTutorialStep(0)
        completeTutorial()
        // Reset tutorial completion so it shows again
        localStorage.setItem('besace-settings', JSON.stringify({
            ...settings,
            tutorialCompleted: false,
            tutorialStep: 0,
        }))
        window.location.reload()
    }

    const sections = [
        { id: 'affichage', label: 'Affichage', icon: <EyeIcon className="w-4 h-4" /> },
        { id: 'jeu', label: 'Mode de jeu', icon: <AcademicCapIcon className="w-4 h-4" /> },
        { id: 'tutoriel', label: 'Tutoriel', icon: <ArrowPathIcon className="w-4 h-4" /> },
        { id: 'a-propos', label: 'À propos', icon: <Cog6ToothIcon className="w-4 h-4" /> },
    ]

    return (
        <div className="flex flex-col gap-4 animate-fade-in pb-8">
            {/* Header */}
            <header className="flex items-center gap-3 mb-2">
                <Link to="/" className="touch-target -ml-2">
                    <ChevronLeftIcon className="w-6 h-6" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </Link>
                <div className="flex-1">
                    <h1 className="font-cinzel text-2xl font-bold flex items-center gap-2">
                        <Cog6ToothIcon className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                        Paramètres
                    </h1>
                </div>
            </header>

            <div className="lg:grid lg:grid-cols-[180px_1fr] lg:gap-6">
                {/* Desktop sidebar anchors */}
                <nav className="hidden lg:block sticky top-6 self-start" aria-label="Navigation paramètres">
                    <ul className="space-y-1">
                        {sections.map(s => (
                            <li key={s.id}>
                                <a
                                    href={`#${s.id}`}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    {s.icon}
                                    {s.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

            {/* Settings sections */}
            <div className="space-y-4 scroll-mt-6" style={{ scrollBehavior: 'smooth' }}>
                {/* Affichage */}
                <section id="affichage" className="card scroll-mt-6">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Affichage
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Mode sombre</p>
                                <p className="text-xs text-muted-foreground">
                                    Activer le thème sombre
                                </p>
                            </div>
                            <button
                                onClick={toggleDarkMode}
                                className={`relative w-12 h-7 rounded-full transition-colors ${
                                    dark ? 'bg-primary' : 'bg-muted'
                                }`}
                            >
                                <div
                                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                                        dark ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>
                        <div className="pt-2 border-t border-border/50">
                            <ThemePicker />
                        </div>
                    </div>
                </section>

                {/* Mode débutant */}
                <section id="jeu" className="card scroll-mt-6">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Mode de jeu
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    {settings.beginnerMode ? (
                                        <EyeIcon className="w-5 h-5 text-hp-high" />
                                    ) : (
                                        <EyeSlashIcon className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">Mode débutant</p>
                                    <p className="text-xs text-muted-foreground">
                                        Interface simplifiée sans les options avancées
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleBeginnerMode}
                                className={`relative w-12 h-7 rounded-full transition-colors ${
                                    settings.beginnerMode ? 'bg-hp-high' : 'bg-muted'
                                }`}
                            >
                                <div
                                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                                        settings.beginnerMode ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Tutoriel */}
                <section id="tutoriel" className="card scroll-mt-6">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Tutoriel
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                <AcademicCapIcon className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium">Visite guidée</p>
                                    <p className="text-xs text-muted-foreground">
                                        {settings.tutorialCompleted
                                            ? 'Vous avez déjà vu le tutoriel'
                                            : 'Le tutoriel vous guidera dans l\'application'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleRestartTutorial}
                                className="btn btn-secondary btn-sm flex items-center gap-1"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                Relancer
                            </button>
                        </div>
                    </div>
                </section>

                {/* À propos */}
                <section id="a-propos" className="card scroll-mt-6">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        À propos
                    </h2>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            <span className="font-medium text-foreground">Besace</span> — Feuille de personnage D&D 5e
                        </p>
                        <p>
                            Conçu pour les joueurs qui veulent une expérience fluide et immersive à la table.
                        </p>
                        <p className="text-xs opacity-60">
                            Version 1.0.0 • Donjons & Dragons 5e
                        </p>
                    </div>
                </section>
            </div>
            </div>
        </div>
    )
}
