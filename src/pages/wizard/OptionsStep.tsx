import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { subclasses } from '../../data/subclasses'
import { CheckCircleIcon, StarIcon } from '@heroicons/react/24/solid'
import { AsiSelector } from '../../components/AsiSelector'
import { getClassASILevels } from '../../data/classFeatures'
import { feats } from '../../data/feats'
import type { AsiChoice } from '../../types/character'

const subclassTriggerLevels: Record<string, number> = {
    barbarian: 3,
    bard: 3,
    cleric: 1,
    druid: 2,
    fighter: 3,
    monk: 3,
    paladin: 3,
    ranger: 3,
    rogue: 3,
    sorcerer: 1,
    warlock: 1,
    wizard: 2
}

const fightingStyles = [
    { id: 'archery', name: 'Archerie', description: '+2 aux jets d\'attaque avec des armes à distance.' },
    { id: 'defense', name: 'Défense', description: '+1 à la CA si vous portez une armure.' },
    { id: 'dueling', name: 'Duel', description: '+2 aux dégâts si vous tenez une arme à une main et aucune autre arme.' },
    { id: 'gwf', name: 'Combat à deux mains', description: 'Relancez les 1 et 2 sur les dés de dégâts des armes à deux mains.' },
    { id: 'protection', name: 'Protection', description: 'Improuvez un désavantage à une attaque contre un allié proche si vous avez un bouclier.' },
    { id: 'twf', name: 'Combat à deux armes', description: 'Ajoutez votre modificateur de caractéristique aux dégâts de la seconde attaque.' }
]

export function OptionsStep() {
    const { character, updateCharacter } = useWizard()
    const { characterClass, level, classOptions } = character

    if (!characterClass) return null

    const needsSubclass = level >= subclassTriggerLevels[characterClass.id]
    const availableSubclasses = subclasses.filter(s => s.classId === characterClass.id)

    const needsFightingStyle = (characterClass.id === 'fighter' && level >= 1) ||
        (characterClass.id === 'paladin' && level >= 2) ||
        (characterClass.id === 'ranger' && level >= 2)

    const asiLevels = getClassASILevels(characterClass.id)
    const reachedAsiLevels = asiLevels.filter(lvl => lvl <= level)

    const handleOptionSelect = (key: string, value: string) => {
        updateCharacter({
            classOptions: {
                ...classOptions,
                [key]: value
            }
        })
    }

    const handleAsiChange = (asiLevel: number, choice: AsiChoice) => {
        updateCharacter({
            asiChoices: {
                ...(character.asiChoices || {}),
                [asiLevel]: choice
            }
        })
    }

    const hasChoices = needsSubclass || needsFightingStyle || reachedAsiLevels.length > 0

    if (!hasChoices) {
        return (
            <WizardShell
                title="Options de classe"
                subtitle="Aucun choix requis pour votre niveau actuel"
            >
                <div className="card text-center p-8">
                    <StarIcon className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                    <p className="text-ink-muted">
                        Votre {characterClass.name} de niveau {level} n'a pas de choix de personnalisation à faire à cette étape.
                    </p>
                </div>
            </WizardShell>
        )
    }

    return (
        <WizardShell
            title="Options de classe"
            subtitle={`Personnalisez votre ${characterClass.name} de niveau ${level}`}
        >
            <div className="space-y-8">
                {/* Subclass Selection */}
                {needsSubclass && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-ink flex items-center gap-2">
                            <StarIcon className="w-5 h-5 text-secondary" />
                            {characterClass.id === 'cleric' ? 'Domaine Divin' :
                                characterClass.id === 'wizard' ? 'Tradition Arcanique' :
                                    characterClass.id === 'paladin' ? 'Serment Sacré' : 'Sous-classe'}
                        </h3>
                        <div className="flex flex-col gap-3">
                            {availableSubclasses.map(sub => {
                                const isSelected = classOptions.subclass === sub.id
                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => handleOptionSelect('subclass', sub.id)}
                                        className={`text-left p-4 rounded-lg border transition-all ${isSelected
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border bg-card'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-ink">{sub.name}</span>
                                            {isSelected && <CheckCircleIcon className="w-5 h-5 text-primary" />}
                                        </div>
                                        <p className="text-xs text-ink-muted leading-relaxed">
                                            {sub.description}
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Fighting Style Selection */}
                {needsFightingStyle && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-ink flex items-center gap-2">
                            <StarIcon className="w-5 h-5 text-secondary" />
                            Style de Combat
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {fightingStyles.map(style => {
                                const isSelected = classOptions.fightingStyle === style.id
                                return (
                                    <button
                                        key={style.id}
                                        onClick={() => handleOptionSelect('fightingStyle', style.id)}
                                        className={`text-left p-4 rounded-lg border transition-all ${isSelected
                                            ? 'border-secondary bg-secondary/10'
                                            : 'border-border bg-card'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-ink">{style.name}</span>
                                            {isSelected && <CheckCircleIcon className="w-5 h-5 text-secondary" />}
                                        </div>
                                        <p className="text-[10px] text-ink-muted">
                                            {style.description}
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ASI Selection */}
                {reachedAsiLevels.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-ink flex items-center gap-2">
                            <StarIcon className="w-5 h-5 text-secondary" />
                            Améliorations de Caractéristique
                        </h3>
                        <div className="space-y-4">
                            {reachedAsiLevels.map(asiLevel => (
                                <AsiSelector
                                    key={asiLevel}
                                    level={asiLevel}
                                    choice={character.asiChoices?.[asiLevel]}
                                    onChoiceChange={(choice) => handleAsiChange(asiLevel, choice)}
                                    availableFeats={feats}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </WizardShell>
    )
}
