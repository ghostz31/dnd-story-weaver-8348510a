import { useWizard, WizardProvider } from '../contexts/WizardContext'
import { NameStep } from './wizard/NameStep'
import { RaceStep } from './wizard/RaceStep'
import { ClassStep } from './wizard/ClassStep'
import { AbilitiesStep } from './wizard/AbilitiesStep'
import { ProficiencyStep } from './wizard/ProficiencyStep'
import { OptionsStep } from './wizard/OptionsStep'
import { SpellsStep } from './wizard/SpellsStep'
import { BackgroundStep } from './wizard/BackgroundStep'
import { EquipmentStep } from './wizard/EquipmentStep'
import { ReviewStep } from './wizard/ReviewStep'

function WizardContent() {
    const { currentStep } = useWizard()

    switch (currentStep) {
        case 'name':
            return <NameStep />
        case 'race':
            return <RaceStep />
        case 'class':
            return <ClassStep />
        case 'abilities':
            return <AbilitiesStep />
        case 'proficiencies':
            return <ProficiencyStep />
        case 'options':
            return <OptionsStep />
        case 'spells':
            return <SpellsStep />
        case 'background':
            return <BackgroundStep />
        case 'equipment':
            return <EquipmentStep />
        case 'review':
            return <ReviewStep />
        default:
            return <NameStep />
    }
}

export function CreateCharacterPage() {
    return (
        <WizardProvider>
            <WizardContent />
        </WizardProvider>
    )
}
