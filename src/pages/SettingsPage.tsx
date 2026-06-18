import { Link } from 'react-router-dom'
import {
    ChevronLeftIcon,
    Cog6ToothIcon,
    AcademicCapIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowPathIcon,
    SparklesIcon,
} from '@heroicons/react/24/solid'
import { useSettings } from '../hooks/useSettings'
import type { EffectsSettings } from '@trame-besace/shared-types/use-effects'
import { useDarkMode } from '../hooks/useDarkMode'
import { ThemePicker } from '../components/ThemePicker'

const EFFECT_LABELS: { key: keyof EffectsSettings; label: string; hint: string }[] = [
    { key: 'dice3d', label: 'Dé 3D', hint: 'Animation de tumble lors du lancer' },
    { key: 'critFlash', label: 'Flash critique (nat 20)', hint: 'Flash doré + vibration sur jet critique' },
    { key: 'chatToast', label: 'Notifications de jet', hint: 'Toast compact affichant le résultat du dé' },
    { key: 'haloActive', label: 'Halo combattant actif', hint: 'Glow pulsant sur le combattant dont c\'est le tour' },
    { key: 'sortGlow', label: 'Lueur des orbes de sort', hint: 'Les emplacements disponibles pulsent doucement' },
    { key: 'legendaryBorder', label: 'Bordure objets légendaires', hint: 'Liseré doré animé sur les objets légendaires' },
    { key: 'enluminure', label: 'Enluminures', hint: 'Bordures ornementales sur les stat blocks' },
    { key: 'separators', label: 'Séparateurs ornés', hint: 'Ornements entre les sections' },
    { key: 'dropCaps', label: 'Lettrines', hint: 'Première lettre agrandie en début de description' },
    { key: 'parchment', label: 'Texture parchemin', hint: 'Texture subtile sur les cartes (mode clair)' },
    { key: 'aurora', label: 'Aurora vignette', hint: 'Gradient conique animé en arrière-plan' },
    { key: 'pageTransition', label: 'Transitions de page', hint: 'Fade + slide au changement de page' },
    { key: 'hpCounter', label: 'Compteur PV animé', hint: 'Le chiffre des PV s\'anime lors des changements' },
    { key: 'cardPress', label: 'Pression des cartes', hint: 'Légère compression au tap (mobile)' },
    { key: 'hoverLift', label: 'Élévation au survol', hint: 'Les cartes se soulèvent au hover' },
    { key: 'ripple', label: 'Ondulation au tap', hint: 'Effet ripple au tap des boutons' },
    { key: 'ordinals', label: 'Ordinaux typographiques', hint: '1er, 2e, 3e en exposant automatique' },
    { key: 'smallCaps', label: 'Petites capitales', hint: 'Labels de stats en petites majuscules' },
    { key: 'ligatures', label: 'Ligatures', hint: 'Ligatures contextuelles (ff, fi, fl)' },
    { key: 'animatedConditions', label: 'Conditions animées', hint: 'Icônes de condition qui pulse doucement' },
    { key: 'ornateRound', label: 'Compteur de rounds orné', hint: 'Ornement ◇ Round N ◇ dans le tracker' },
]

export function SettingsPage() {
    const { settings, toggleBeginnerMode, completeTutorial, setTutorialStep, toggleEffect, resetEffects } = useSettings()
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
        { id: 'effets', label: 'Effets & animations', icon: <SparklesIcon className="w-4 h-4" /> },
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

                {/* Effets & animations */}
                <section id="effets" className="card scroll-mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-primary" />
                            Effets & animations
                        </h2>
                        <button
                            onClick={resetEffects}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Réinitialiser
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                        Activez ou désactivez les effets visuels selon vos préférences.
                        Les réglages <code className="px-1 rounded bg-muted text-foreground">prefers-reduced-motion</code> sont respectés automatiquement.
                    </p>
                    <div className="space-y-2">
                        {EFFECT_LABELS.map(({ key, label, hint }) => (
                            <div key={key} className="flex items-center justify-between py-1">
                                <div className="flex-1 pr-3">
                                    <p className="text-sm font-medium">{label}</p>
                                    <p className="text-[11px] text-muted-foreground">{hint}</p>
                                </div>
                                <button
                                    onClick={() => toggleEffect(key)}
                                    aria-label={`${label}: ${settings.effects[key] ? 'activé' : 'désactivé'}`}
                                    aria-pressed={settings.effects[key]}
                                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                                        settings.effects[key] ? 'bg-primary' : 'bg-muted'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                            settings.effects[key] ? 'translate-x-5' : 'translate-x-0.5'
                                        }`}
                                    />
                                </button>
                            </div>
                        ))}
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
