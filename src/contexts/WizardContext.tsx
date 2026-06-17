import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type { WizardStep, CharacterCreation } from '../types/character'
import { validateWizardStep } from '../utils/wizard-validation'




interface WizardContextType {
    currentStep: WizardStep
    setCurrentStep: (step: WizardStep) => void
    character: CharacterCreation
    updateCharacter: (updates: Partial<CharacterCreation>) => void
    canProceed: boolean
    stepErrors: string[]
    nextStep: () => void
    prevStep: () => void
    resetWizard: () => void
}

const defaultCharacter: CharacterCreation = {
    name: '',
    race: null,
    subrace: null,
    characterClass: null,
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    background: null,
    skillProficiencies: [],
    alignment: '',
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    level: 1,
    languages: [],
    classOptions: {},
    selectedSpells: [],
    asiChoices: {},
    inventory: [],
}

const steps: WizardStep[] = ['name', 'race', 'class', 'abilities', 'proficiencies', 'options', 'spells', 'background', 'equipment', 'review']

const WizardContext = createContext<WizardContextType | null>(null)

export function WizardProvider({ children }: { children: ReactNode }) {
    const [currentStep, setCurrentStep] = useState<WizardStep>('name')
    const [character, setCharacter] = useState<CharacterCreation>(defaultCharacter)

    const updateCharacter = (updates: Partial<CharacterCreation>) => {
        setCharacter(prev => ({ ...prev, ...updates }))
    }

    const stepErrors = useMemo(() => validateWizardStep(currentStep, character), [currentStep, character])
    const canProceed = stepErrors.length === 0

    const nextStep = () => {
        const currentIndex = steps.indexOf(currentStep)
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1])
        }
    }

    const prevStep = () => {
        const currentIndex = steps.indexOf(currentStep)
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1])
        }
    }

    const resetWizard = () => {
        setCurrentStep('name')
        setCharacter(defaultCharacter)
    }

    return (
        <WizardContext.Provider
            value={{
                currentStep,
                setCurrentStep,
                character,
                updateCharacter,
                canProceed,
                stepErrors,
                nextStep,
                prevStep,
                resetWizard,
            }}
        >
            {children}
        </WizardContext.Provider>
    )
}

export function useWizard() {
    const context = useContext(WizardContext)
    if (!context) {
        throw new Error('useWizard must be used within a WizardProvider')
    }
    return context
}
