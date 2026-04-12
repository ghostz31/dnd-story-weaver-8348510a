import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { backgrounds } from '../../data/backgrounds'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'

const allLanguages = [
    'Commun', 'Elfique', 'Nain', 'Halfelin', 'Géant', 'Gnome', 'Gobelin', 'Orc', 'Abyssal', 'Céleste', 'Draconique', 'Infernal', 'Primordial', 'Profond', 'Sylvestre', 'Bas-parler'
]

export function ProficiencyStep() {
    const { character, updateCharacter } = useWizard()
    const [selectedSkills, setSelectedSkills] = useState<string[]>(character.skillProficiencies)
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(character.languages)

    const characterClass = character.characterClass
    const background = backgrounds.find(bg => bg.id === character.background)

    // Skills from status
    const backgroundSkills = background?.skillProficiencies || []
    const classSkillChoices = characterClass?.skillChoices || []
    const numClassChoices = characterClass?.numSkillChoices || 0

    // Languages from background
    const numBackgroundLanguages = background && 'languages' in background ? (background as any).languages : 0

    const toggleSkill = (skill: string) => {
        if (backgroundSkills.includes(skill)) return // Cannot unselect background skills

        if (selectedSkills.includes(skill)) {
            setSelectedSkills(prev => prev.filter(s => s !== skill))
        } else {
            // Count current class-selected skills
            const classSelectedCount = selectedSkills.filter(s => classSkillChoices.includes(s) && !backgroundSkills.includes(s)).length
            if (classSelectedCount < numClassChoices) {
                setSelectedSkills(prev => [...prev, skill])
            }
        }
    }

    const toggleLanguage = (lang: string) => {
        const raceLanguages = character.race?.languages || []
        if (raceLanguages.includes(lang)) return

        if (selectedLanguages.includes(lang)) {
            setSelectedLanguages(prev => prev.filter(l => l !== lang))
        } else {
            if (selectedLanguages.length < numBackgroundLanguages) {
                setSelectedLanguages(prev => [...prev, lang])
            }
        }
    }

    // Update global state when local state changes
    useEffect(() => {
        updateCharacter({
            skillProficiencies: selectedSkills,
            languages: selectedLanguages
        })
    }, [selectedSkills, selectedLanguages])

    // Class skills logic: we filter out those already provided by background
    const availableClassSkills = classSkillChoices.filter(skill => !backgroundSkills.includes(skill))
    const currentClassSkillsCount = selectedSkills.filter(s => classSkillChoices.includes(s) && !backgroundSkills.includes(s)).length

    return (
        <WizardShell
            title="Maîtrises et Langues"
            subtitle="Choisissez vos compétences et langues supplémentaires"
        >
            <div className="space-y-6">
                {/* Background Skills (Fixed) */}
                <div className="card">
                    <h3 className="font-bold text-ink mb-2">Compétences de l'historique ({background?.name})</h3>
                    <div className="flex flex-wrap gap-2">
                        {backgroundSkills.map(skill => (
                            <div key={skill} className="px-3 py-1 bg-primary/20 border border-primary text-primary rounded-full text-sm font-medium flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Class Skills (Selection) */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-ink">Compétences de classe ({characterClass?.name})</h3>
                        <span className={`text-sm font-bold ${currentClassSkillsCount === numClassChoices ? 'text-green-600' : 'text-primary'}`}>
                            {currentClassSkillsCount} / {numClassChoices}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {availableClassSkills.map(skill => {
                            const isSelected = selectedSkills.includes(skill)
                            return (
                                <button
                                    key={skill}
                                    onClick={() => toggleSkill(skill)}
                                    className={`text-left p-3 rounded-lg border transition-all text-sm ${isSelected
                                        ? 'border-primary bg-primary/10 text-primary font-bold'
                                        : 'border-border bg-card text-ink-muted'
                                        }`}
                                >
                                    {skill}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Languages Selection (if any) */}
                {numBackgroundLanguages > 0 && (
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-ink">Langues de l'historique</h3>
                            <span className={`text-sm font-bold ${selectedLanguages.length === numBackgroundLanguages ? 'text-green-600' : 'text-primary'}`}>
                                {selectedLanguages.length} / {numBackgroundLanguages}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {allLanguages.map(lang => {
                                const isRaceLang = character.race?.languages.includes(lang)
                                const isSelected = selectedLanguages.includes(lang) || isRaceLang

                                return (
                                    <button
                                        key={lang}
                                        disabled={isRaceLang}
                                        onClick={() => toggleLanguage(lang)}
                                        className={`text-left p-3 rounded-lg border transition-all text-xs ${isSelected
                                            ? isRaceLang ? 'border-border/50 bg-muted/30 text-ink-muted cursor-not-allowed opacity-50' : 'border-secondary bg-secondary/10 text-primary font-bold'
                                            : 'border-border bg-card text-ink-muted font-medium'
                                            }`}
                                    >
                                        <div className="flex items-center gap-1">
                                            {lang}
                                            {isRaceLang && <span className="text-[10px] italic">(Racial)</span>}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </WizardShell>
    )
}
