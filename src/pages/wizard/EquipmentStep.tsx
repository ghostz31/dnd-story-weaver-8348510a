import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export function EquipmentStep() {
    const { character } = useWizard()

    // Get starting equipment from class
    const startingEquipment = character.characterClass?.startingEquipment || []

    return (
        <WizardShell
            title="Équipement de départ"
            subtitle="Voici l'équipement fourni par votre classe"
        >
            <div className="card mb-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-ink">
                    <CheckCircleIcon className="w-5 h-5 text-primary" />
                    Équipement de {character.characterClass?.name || 'votre classe'}
                </h3>
                <ul className="space-y-2">
                    {startingEquipment.map((item, index) => (
                        <li key={index} className="flex items-center gap-3 text-sm text-ink-muted">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Currency */}
            <div className="card">
                <h3 className="font-semibold mb-md">Bourse de départ</h3>
                <div className="grid grid-cols-5 gap-sm text-center">
                    <div className="stat-item">
                        <span className="stat-value text-lg">0</span>
                        <span className="stat-label">PP</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value text-lg">15</span>
                        <span className="stat-label">PO</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value text-lg">0</span>
                        <span className="stat-label">PE</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value text-lg">0</span>
                        <span className="stat-label">PA</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value text-lg">0</span>
                        <span className="stat-label">PC</span>
                    </div>
                </div>
            </div>

            {/* Note */}
            <p className="text-sm text-muted mt-lg text-center">
                Vous pourrez modifier votre inventaire après la création du personnage.
            </p>
        </WizardShell>
    )
}
