import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { classes } from '../../data/classes'
import { CheckCircleIcon, SparklesIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid'

const abilityNames: Record<string, string> = {
    str: 'Force',
    dex: 'Dextérité',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Sagesse',
    cha: 'Charisme',
}

export function ClassStep() {
    const { character, updateCharacter } = useWizard()

    const handleClassSelect = (characterClass: typeof classes[0]) => {
        updateCharacter({ characterClass })
    }

    const handleLevelChange = (newLevel: number) => {
        const level = Math.max(1, Math.min(20, newLevel))
        updateCharacter({ level })
    }

    return (
        <WizardShell
            title="Choisir une classe"
            subtitle="Votre classe définit vos capacités en combat et hors combat"
        >
            <div className="flex flex-col gap-sm">
                {/* Level Selector */}
                <div className="card mb-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-ink">Niveau du personnage</h3>
                            <p className="text-xs text-ink-muted">Choisissez le niveau de départ (1-20)</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleLevelChange(character.level - 1)}
                                className="p-2 rounded-lg bg-card border border-border hover:border-primary transition-colors text-ink"
                            >
                                <ChevronDownIcon className="w-5 h-5" />
                            </button>
                            <span className="text-2xl font-bold font-cinzel text-primary min-w-[2rem] text-center">
                                {character.level}
                            </span>
                            <button
                                onClick={() => handleLevelChange(character.level + 1)}
                                className="p-2 rounded-lg bg-card border border-border hover:border-primary transition-colors text-ink"
                            >
                                <ChevronUpIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {classes.map((cls) => {
                    const isSelected = character.characterClass?.id === cls.id
                    const isSpellcaster = !!cls.spellcasting

                    return (
                        <button
                            key={cls.id}
                            onClick={() => handleClassSelect(cls)}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-card'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-lg text-ink">{cls.name}</span>
                                        {isSpellcaster && (
                                            <SparklesIcon className="w-4 h-4 text-secondary" />
                                        )}
                                        {isSelected && (
                                            <CheckCircleIcon className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-ink-muted font-medium">
                                        <span>d{cls.hitDie} PV</span>
                                        <span className="opacity-30">•</span>
                                        <span>{abilityNames[cls.primaryAbility]}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                                <p className="text-xs text-ink-muted">
                                    <strong className="text-ink">Sauvegardes:</strong>{' '}
                                    {cls.savingThrows.map((s) => abilityNames[s]).join(', ')}
                                </p>
                                <p className="text-xs text-ink-muted">
                                    <strong className="text-ink">Armures:</strong>{' '}
                                    {cls.armorProficiencies.length > 0
                                        ? cls.armorProficiencies.join(', ')
                                        : 'Aucune'}
                                </p>
                                {isSpellcaster && (
                                    <p className="text-xs text-secondary font-bold">
                                        ✨ Lanceur de sorts ({abilityNames[cls.spellcasting!.ability]})
                                    </p>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </WizardShell>
    )
}
