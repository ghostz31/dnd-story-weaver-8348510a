import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useWizard } from '../contexts/WizardContext'

interface WizardShellProps {
    title: string
    subtitle?: string
    children: React.ReactNode
    hideBack?: boolean
    hideNext?: boolean
    nextLabel?: string
    onNext?: () => void
    loading?: boolean
}

const stepLabels: Record<string, string> = {
    name: 'Nom',
    race: 'Race',
    class: 'Classe',
    abilities: 'Caractéristiques',
    proficiencies: 'Maîtrises',
    options: 'Options',
    spells: 'Sorts',
    background: 'Historique',
    equipment: 'Équipement',
    review: 'Résumé',
}

const steps = ['name', 'race', 'class', 'abilities', 'proficiencies', 'options', 'spells', 'background', 'equipment', 'review']

export function WizardShell({
    title,
    subtitle,
    children,
    hideBack,
    hideNext,
    nextLabel = 'Suivant',
    onNext,
    loading = false,
}: WizardShellProps) {
    const { currentStep, canProceed, stepErrors, nextStep, prevStep } = useWizard()
    const currentIndex = steps.indexOf(currentStep)
    const progress = ((currentIndex + 1) / steps.length) * 100

    const handleNext = () => {
        if (onNext) {
            onNext()
        } else {
            nextStep()
        }
    }

    return (
        <div className="flex flex-col min-h-full animate-fade-in">
            {/* Progress bar */}
            <div className="sticky-header-safe pb-4">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                    {steps.map((step, index) => (
                        <span
                            key={step}
                            className={index <= currentIndex ? 'text-primary' : ''}
                        >
                            {index < currentIndex ? '✓' : stepLabels[step]}
                        </span>
                    ))}
                </div>
            </div>

            {/* Header */}
            <header className="text-center mb-8 px-4 mt-4">
                <h1 className="font-cinzel text-2xl font-bold">{title}</h1>
                {subtitle && <p className="text-ink-muted mt-1 text-sm">{subtitle}</p>}
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4">
                {children}
            </div>

            {/* Validation errors */}
            {stepErrors.length > 0 && (
                <div className="sticky bottom-0 pt-2 pb-2 px-4 bg-gradient-to-t from-background to-transparent">
                    <div className="space-y-1.5">
                        {stepErrors.map((err, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs"
                            >
                                <span className="text-sm mt-px">✕</span>
                                <span>{err}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div
                className="sticky bottom-0 pt-4 pb-safe bg-gradient-to-t from-background to-transparent px-4"
            >
                <div className="flex gap-4">
                    {!hideBack && currentIndex > 0 && (
                        <button
                            onClick={prevStep}
                            className="btn btn-secondary flex-1"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                            Retour
                        </button>
                    )}
                    {!hideNext && (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed || loading}
                            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                            style={{ opacity: canProceed && !loading ? 1 : 0.5 }}
                        >
                            {loading && (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            )}
                            {nextLabel}
                            {nextLabel === 'Suivant' && !loading && <ChevronRightIcon className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
