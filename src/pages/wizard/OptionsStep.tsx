import { useState, useEffect, useMemo } from 'react'
import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { CheckCircleIcon, StarIcon } from '@heroicons/react/24/solid'
import { AsiSelector } from '../../components/AsiSelector'
import { feats } from '../../data/feats'
import type { AsiChoice } from '../../types/character'
import { loadClasses } from '../../data/aurora-loader'
import type { ClassV2 } from '../../types/aurora-v2'

// Mapping des IDs de style de combat vers nom + description
const FIGHTING_STYLE_MAP: Record<string, { name: string; description: string }> = {
  ID_FIGHTING_STYLE_ARCHERY: {
    name: 'Archerie',
    description: '+2 aux jets d\'attaque avec des armes à distance.',
  },
  ID_FIGHTING_STYLE_DEFENSE: {
    name: 'Défense',
    description: '+1 à la CA si vous portez une armure.',
  },
  ID_FIGHTING_STYLE_DUELING: {
    name: 'Duel',
    description: '+2 aux dégâts si vous tenez une arme à une main et aucune autre arme.',
  },
  ID_FIGHTING_STYLE_GREAT_WEAPON: {
    name: 'Combat à deux mains',
    description: 'Relancez les 1 et 2 sur les dés de dégâts des armes à deux mains.',
  },
  ID_FIGHTING_STYLE_PROTECTION: {
    name: 'Protection',
    description: 'Imposez un désavantage à une attaque contre un allié proche si vous avez un bouclier.',
  },
  ID_FIGHTING_STYLE_TWO_WEAPON: {
    name: 'Combat à deux armes',
    description: 'Ajoutez votre modificateur de caractéristique aux dégâts de la seconde attaque.',
  },
  ID_FIGHTING_STYLE_RANGER: {
    name: 'Défense',
    description: '+1 à la CA si vous portez une armure.',
  },
}

function getAsiLevels(classId: string): number[] {
  // IDs Aurora
  const fighterIds = ['ID_PHB_CLASS_FIGHTER', 'fighter']
  const rogueIds = ['ID_PHB_CLASS_ROGUE', 'rogue']

  if (fighterIds.includes(classId)) {
    return [4, 6, 8, 12, 14, 16, 19]
  }
  if (rogueIds.includes(classId)) {
    return [4, 8, 10, 12, 16, 19]
  }
  return [4, 8, 12, 16, 19]
}

function getSubclassTriggerLevel(classId: string): number {
  // Cleric and Sorcerer/Warlock choose at level 1
  const earlyIds = ['ID_PHB_CLASS_CLERIC', 'ID_PHB_CLASS_SORCERER', 'ID_PHB_CLASS_WARLOCK', 'cleric', 'sorcerer', 'warlock']
  if (earlyIds.includes(classId)) return 1

  // Druid and Wizard at level 2
  const level2Ids = ['ID_PHB_CLASS_DRUID', 'ID_PHB_CLASS_WIZARD', 'druid', 'wizard']
  if (level2Ids.includes(classId)) return 2

  // Most others at level 3
  return 3
}

function getSubclassLabel(classId: string): string {
  const map: Record<string, string> = {
    ID_PHB_CLASS_CLERIC: 'Domaine Divin',
    ID_PHB_CLASS_WIZARD: 'Tradition Arcanique',
    ID_PHB_CLASS_PALADIN: 'Serment Sacré',
    ID_PHB_CLASS_BARBARIAN: 'Voie primitive',
    ID_PHB_CLASS_BARD: 'Collège',
    ID_PHB_CLASS_DRUID: 'Cercle',
    ID_PHB_CLASS_FIGHTER: 'Archétype martial',
    ID_PHB_CLASS_MONK: 'Tradition monastique',
    ID_PHB_CLASS_RANGER: 'Archétype de rôdeur',
    ID_PHB_CLASS_ROGUE: 'Archétype de roublard',
    ID_PHB_CLASS_SORCERER: 'Origine magique',
    ID_PHB_CLASS_WARLOCK: 'Patron',
  }
  return map[classId] || 'Sous-classe'
}

export function OptionsStep() {
    const { character, updateCharacter } = useWizard()
    const { characterClass, level, classOptions } = character

    const [auroraClass, setAuroraClass] = useState<ClassV2 | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!characterClass) {
            setLoading(false)
            return
        }
        loadClasses().then(data => {
            const raw = data.classes.find(c => c.id === characterClass.id)
            if (raw) setAuroraClass(raw)
            setLoading(false)
        })
    }, [characterClass])

    // Subclass logic
    const subclassTriggerLevel = characterClass ? getSubclassTriggerLevel(characterClass.id) : 3
    const needsSubclass = characterClass ? level >= subclassTriggerLevel : false
    const availableSubclasses = auroraClass?.subclasses || []

    // Fighting style logic: scan class features for select rules with fighting style options
    const fightingStyles = useMemo(() => {
        if (!auroraClass) return []
        const styles: { id: string; name: string; description: string }[] = []
        for (const [lvl, featsArr] of Object.entries(auroraClass.features || {})) {
            if (parseInt(lvl) > level) continue
            for (const feat of featsArr) {
                for (const rule of feat.rules || []) {
                    if (
                        rule.type === 'select' &&
                        rule.targetType === 'feature' &&
                        Array.isArray(rule.options)
                    ) {
                        for (const opt of rule.options) {
                            const mapped = FIGHTING_STYLE_MAP[String(opt)]
                            if (mapped) {
                                styles.push({ id: String(opt), ...mapped })
                            }
                        }
                    }
                }
            }
        }
        return styles.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)
    }, [auroraClass, level])

    if (!characterClass) return null

    const needsFightingStyle = fightingStyles.length > 0

    const asiLevels = getAsiLevels(characterClass.id)
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

    const isVariantHuman = character.subrace === 'ID_PHB_SUBRACE_VARIANT_HUMAN'
    const hasChoices = needsSubclass || needsFightingStyle || reachedAsiLevels.length > 0 || isVariantHuman

    if (loading) {
        return (
            <WizardShell title="Options de classe" subtitle="Chargement des données Aurora...">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            </WizardShell>
        )
    }

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
                            {getSubclassLabel(characterClass.id)}
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
                                            {typeof sub.description === 'string' ? sub.description : ''}
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
                                    character={character}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Humain Variante — Don de départ */}
                {isVariantHuman && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-ink flex items-center gap-2">
                            <StarIcon className="w-5 h-5 text-secondary" />
                            Don de l'Humain Variante
                        </h3>
                        <AsiSelector
                            level={0}
                            choice={character.asiChoices?.[0]}
                            onChoiceChange={(choice) => handleAsiChange(0, choice)}
                            availableFeats={feats}
                            character={character}
                            forceMode="feat"
                            title="Don de départ"
                        />
                    </div>
                )}
            </div>
        </WizardShell>
    )
}
