import { useState, useEffect } from 'react'
import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { CheckCircleIcon, BookOpenIcon } from '@heroicons/react/24/solid'
import { loadAuroraBackgrounds, type ConvertedBackground } from '../../utils/background-converter'

export function BackgroundStep() {
    const { character, updateCharacter } = useWizard()
    const [backgrounds, setBackgrounds] = useState<ConvertedBackground[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAuroraBackgrounds().then(data => {
            setBackgrounds(data)
            setLoading(false)
        })
    }, [])

    const handleSelect = (backgroundId: string) => {
        updateCharacter({ background: backgroundId })
    }

    if (loading) {
        return (
            <WizardShell title="Choisir un historique" subtitle="Chargement des données Aurora...">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            </WizardShell>
        )
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
                                {isSelected && (
                                    <CheckCircleIcon className="w-5 h-5 text-primary" />
                                )}
                            </div>

                            <p className="text-sm text-ink-muted mb-3 leading-relaxed">
                                {bg.description}
                            </p>

                            <div className="space-y-1 text-sm">
                                <p className="text-ink-muted">
                                    <strong className="text-ink">Compétences :</strong>{' '}
                                    {bg.skillProficiencies.join(', ')}
                                </p>
                                {bg.toolProficiencies.length > 0 && (
                                    <p className="text-ink-muted">
                                        <strong className="text-ink">Outils :</strong>{' '}
                                        {bg.toolProficiencies.join(', ')}
                                    </p>
                                )}
                                {bg.languageCount > 0 && (
                                    <p className="text-ink-muted">
                                        <strong className="text-ink">Langues :</strong>{' '}
                                        {bg.languageCount} au choix
                                    </p>
                                )}
                                <p className="text-xs text-secondary font-bold flex items-center gap-1 mt-2">
                                    <BookOpenIcon className="w-3.5 h-3.5" />
                                    {bg.featureName}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </WizardShell>
    )
}
