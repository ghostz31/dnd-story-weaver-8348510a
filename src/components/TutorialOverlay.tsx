import { useEffect, useState } from 'react'
import { XMarkIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/solid'

export interface TutorialStep {
    target: string
    title: string
    description: string
    position?: 'top' | 'bottom' | 'left' | 'right'
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        target: '.bottom-nav-safe',
        title: 'Navigation',
        description: 'Utilisez cette barre pour naviguer entre les différentes sections : Accueil, Personnage, Combat, Sorts, Inventaire et Dés.',
        position: 'top',
    },
    {
        target: '[href="/combat-features"]',
        title: 'Fiche de Combat',
        description: 'C\'est ici que vous gérerez vos attaques, vos ressources et vos capacités pendant les combats.',
        position: 'top',
    },
    {
        target: '[href="/spells"]',
        title: 'Grimoire',
        description: 'Consultez et préparez vos sorts si vous êtes un lanceur de sorts.',
        position: 'top',
    },
    {
        target: '[href="/inventory"]',
        title: 'Sac de Dos',
        description: 'Gérez votre équipement, votre or et vos objets magiques.',
        position: 'top',
    },
    {
        target: '[href="/dice"]',
        title: 'Lancer de Dés',
        description: 'Lancez des dés pour vos jets d\'attaque, de dégâts, de caractéristiques...',
        position: 'top',
    },
]

interface TutorialOverlayProps {
    steps?: TutorialStep[]
    currentStep: number
    onNext: () => void
    onPrev: () => void
    onClose: () => void
    isOpen: boolean
}

export function TutorialOverlay({
    steps = TUTORIAL_STEPS,
    currentStep,
    onNext,
    onPrev,
    onClose,
    isOpen,
}: TutorialOverlayProps) {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

    const step = steps[currentStep]

    useEffect(() => {
        if (!isOpen || !step) return

        const findTarget = () => {
            const el = document.querySelector(step.target)
            if (el) {
                setTargetRect(el.getBoundingClientRect())
            } else {
                setTargetRect(null)
            }
        }

        findTarget()
        window.addEventListener('resize', findTarget)
        window.addEventListener('scroll', findTarget, true)

        return () => {
            window.removeEventListener('resize', findTarget)
            window.removeEventListener('scroll', findTarget, true)
        }
    }, [isOpen, step])

    if (!isOpen || !step) return null

    const isLast = currentStep === steps.length - 1
    const isFirst = currentStep === 0

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Dark overlay with spotlight */}
            <div className="absolute inset-0 bg-black/60">
                {targetRect && (
                    <div
                        className="absolute bg-transparent"
                        style={{
                            left: targetRect.left - 8,
                            top: targetRect.top - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                            borderRadius: 12,
                        }}
                    />
                )}
            </div>

            {/* Tooltip */}
            <div
                className="absolute z-10"
                style={{
                    ...(targetRect
                        ? getTooltipPosition(targetRect, step.position || 'bottom')
                        : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }),
                }}
            >
                <div className="bg-card rounded-xl shadow-2xl p-5 max-w-xs w-[280px] border border-border animate-fade-in">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg">{step.title}</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-muted rounded-lg transition-colors"
                            aria-label="Fermer"
                        >
                            <XMarkIcon className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {step.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-colors ${
                                        i === currentStep ? 'bg-primary' : 'bg-muted'
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {!isFirst && (
                                <button
                                    onClick={onPrev}
                                    className="btn btn-ghost btn-sm px-2"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={isLast ? onClose : onNext}
                                className="btn btn-primary btn-sm"
                            >
                                {isLast ? 'Terminer' : 'Suivant'}
                                {!isLast && <ChevronRightIcon className="w-4 h-4 ml-1" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getTooltipPosition(
    rect: DOMRect,
    position: 'top' | 'bottom' | 'left' | 'right'
): React.CSSProperties {
    const spacing = 16
    switch (position) {
        case 'top':
            return {
                left: rect.left + rect.width / 2,
                bottom: window.innerHeight - rect.top + spacing,
                transform: 'translateX(-50%)',
            }
        case 'bottom':
            return {
                left: rect.left + rect.width / 2,
                top: rect.bottom + spacing,
                transform: 'translateX(-50%)',
            }
        case 'left':
            return {
                right: window.innerWidth - rect.left + spacing,
                top: rect.top + rect.height / 2,
                transform: 'translateY(-50%)',
            }
        case 'right':
            return {
                left: rect.right + spacing,
                top: rect.top + rect.height / 2,
                transform: 'translateY(-50%)',
            }
    }
}

export { TUTORIAL_STEPS }
