import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'

export function NameStep() {
    const { character, updateCharacter } = useWizard()

    return (
        <WizardShell
            title="Nom du personnage"
            subtitle="Comment s'appelle votre héros ?"
        >
            <div className="flex flex-col gap-lg">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-ink uppercase tracking-widest" htmlFor="name">
                        Nom du Héros
                    </label>
                    <input
                        id="name"
                        type="text"
                        className="input text-xl font-cinzel text-ink bg-card border-border/60 focus:border-primary/50"
                        placeholder="Ex: Thordak le Brave"
                        value={character.name}
                        onChange={(e) => updateCharacter({ name: e.target.value })}
                        autoFocus
                    />
                </div>

                {/* Quick name suggestions */}
                <div>
                    <p className="text-sm text-ink-muted mb-3 font-semibold uppercase tracking-widest">Suggestions :</p>
                    <div className="flex flex-wrap gap-2">
                        {['Aldric', 'Elara', 'Theron', 'Lyra', 'Grom', 'Seraphina'].map((name) => (
                            <button
                                key={name}
                                onClick={() => updateCharacter({ name })}
                                className="btn btn-secondary text-xs uppercase tracking-wider font-bold h-10 px-4"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </WizardShell>
    )
}
