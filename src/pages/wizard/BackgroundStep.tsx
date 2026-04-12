import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { backgrounds } from '../../data/backgrounds'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

const sourceColor: Record<string, string> = {
    XGtE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    TCoE: 'bg-violet-500/20 text-violetald-400 border-violet-500/30',
}

export function BackgroundStep() {
    const { character, updateCharacter } = useWizard()

    const handleSelect = (backgroundId: string) => {
        updateCharacter({ background: backgroundId })
    }

    return (
        <WizardShell
            title="Choisir un historique"
            subtitle="L'historique décrit d'où vient votre personnage"
        >
            <div className="flex flex-col gap-sm">
                {backgrounds.map((bg) => {
                    const isSelected = character.background === bg.id

                    return (
                        <button
                            key={bg.id}
                            onClick={() => handleSelect(bg.id)}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-card'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="font-semibold text-lg text-ink">{bg.name}</span>
                                {bg.source && bg.source !== 'PHB' && (
                                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${sourceColor[bg.source] ?? 'bg-muted text-ink-muted border-border'}`}>
                                        {bg.source}
                                    </span>
                                )}
                                {isSelected && (
                                    <CheckCircleIcon className="w-5 h-5 text-primary" />
                                )}
                            </div>

                            <div className="space-y-1 text-sm">
                                <p className="text-ink-muted">
                                    <strong className="text-ink">Compétences:</strong> {bg.skillProficiencies.join(', ')}
                                </p>
                                {'languages' in bg && typeof bg.languages === 'number' && (
                                    <p className="text-ink-muted">
                                        <strong className="text-ink">Langues:</strong> {bg.languages} au choix
                                    </p>
                                )}
                                <p className="text-xs text-secondary font-bold">
                                    ⭐ {bg.feature}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </WizardShell>
    )
}
