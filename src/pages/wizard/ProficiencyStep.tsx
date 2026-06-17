import { useState, useEffect, useMemo } from 'react'
import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { loadAuroraBackgrounds, type ConvertedBackground } from '../../utils/background-converter'
import {
  CheckCircleIcon,
  LockClosedIcon,
  LightBulbIcon,
  BookOpenIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/solid'

// Ability color mapping for recommendations
const ABILITY_COLORS: Record<string, string> = {
  str: 'text-str',
  dex: 'text-dex',
  con: 'text-con',
  int: 'text-int',
  wis: 'text-wis',
  cha: 'text-cha',
}

// Map skill name → ability
const SKILL_ABILITIES: Record<string, string> = {
  'Acrobaties': 'dex',
  'Dressage': 'wis',
  'Arcanes': 'int',
  'Athlétisme': 'str',
  'Tromperie': 'cha',
  'Histoire': 'int',
  'Perspicacité': 'wis',
  'Intimidation': 'cha',
  'Investigation': 'int',
  'Médecine': 'wis',
  'Nature': 'int',
  'Perception': 'wis',
  'Représentation': 'cha',
  'Persuasion': 'cha',
  'Religion': 'int',
  'Escamotage': 'dex',
  'Discrétion': 'dex',
  'Survie': 'wis',
}

const allLanguages = [
  'Commun', 'Elfique', 'Nain', 'Halfelin', 'Géant', 'Gnome', 'Gobelin', 'Orc',
  'Abyssal', 'Céleste', 'Draconique', 'Infernal', 'Primordial', 'Profond', 'Sylvestre', 'Bas-parler'
]

export function ProficiencyStep() {
  const { character, updateCharacter } = useWizard()
  const [backgrounds, setBackgrounds] = useState<ConvertedBackground[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkills, setSelectedSkills] = useState<string[]>(character.skillProficiencies || [])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(character.languages || [])

  const characterClass = character.characterClass

  // Load Aurora backgrounds
  useEffect(() => {
    loadAuroraBackgrounds().then(bgs => {
      setBackgrounds(bgs)
      setLoading(false)
    })
  }, [])

  // Find selected background
  const background = useMemo(() =>
    backgrounds.find(bg => bg.id === character.background) || backgrounds[0],
    [backgrounds, character.background]
  )

  const backgroundSkills = background?.skillProficiencies || []
  const classSkillChoices = characterClass?.skillChoices || []
  const numClassChoices = characterClass?.numSkillChoices || 0
  const numBackgroundLanguages = background?.languageCount || 0

  // Recommendations: skills matching primary ability
  const recommendedSkills = useMemo(() => {
    const primary = characterClass?.primaryAbility
    if (!primary) return []
    return classSkillChoices.filter(skill => SKILL_ABILITIES[skill] === primary)
  }, [characterClass, classSkillChoices])

  const toggleSkill = (skill: string) => {
    if (backgroundSkills.includes(skill)) return // Cannot unselect background skills

    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill))
    } else {
      const classSelectedCount = selectedSkills.filter(s =>
        classSkillChoices.includes(s) && !backgroundSkills.includes(s)
      ).length
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
      const bgLangCount = selectedLanguages.filter(l => !raceLanguages.includes(l)).length
      if (bgLangCount < numBackgroundLanguages) {
        setSelectedLanguages(prev => [...prev, lang])
      }
    }
  }

  // Sync to global state
  useEffect(() => {
    updateCharacter({
      skillProficiencies: selectedSkills,
      languages: selectedLanguages,
    })
  }, [selectedSkills, selectedLanguages, updateCharacter])

  // Filter out background skills from class choices
  const availableClassSkills = classSkillChoices.filter(skill => !backgroundSkills.includes(skill))
  const currentClassSkillsCount = selectedSkills.filter(s =>
    classSkillChoices.includes(s) && !backgroundSkills.includes(s)
  ).length

  if (loading) {
    return (
      <WizardShell title="Maîtrises et Langues" subtitle="Chargement des données Aurora...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </WizardShell>
    )
  }

  return (
    <WizardShell
      title="Maîtrises et Langues"
      subtitle={`${background?.name || 'Historique'} + ${characterClass?.name || 'Classe'}`}
    >
      <div className="space-y-6">
        {/* Background Skills (Fixed) */}
        <div className="card p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <BookOpenIcon className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm">
              Compétences de l'historique
              {background?.name && <span className="text-muted-foreground font-normal"> ({background.name})</span>}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {backgroundSkills.map(skill => (
              <div
                key={skill}
                className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-medium flex items-center gap-1.5"
              >
                <LockClosedIcon className="w-3 h-3" />
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Class Skills Selection */}
        <div className="card p-4 rounded-xl border border-border bg-card">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <LightBulbIcon className="w-4 h-4 text-magic" />
              <h3 className="font-bold text-sm">
                Compétences de classe
                {characterClass?.name && <span className="text-muted-foreground font-normal"> ({characterClass.name})</span>}
              </h3>
            </div>
            <CounterBadge current={currentClassSkillsCount} max={numClassChoices} />
          </div>

          {/* Recommendations hint */}
          {recommendedSkills.length > 0 && currentClassSkillsCount < numClassChoices && (
            <p className="text-[11px] text-muted-foreground mb-3">
              Recommandées pour {characterClass?.name}: {' '}
              {recommendedSkills.map(s => (
                <span key={s} className="text-magic font-medium">{s}</span>
              )).reduce((prev, curr) => <>{prev}, {curr}</> as any)}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            {availableClassSkills.map(skill => {
              const isSelected = selectedSkills.includes(skill)
              const isRecommended = recommendedSkills.includes(skill)
              const ability = SKILL_ABILITIES[skill]
              const abilityColor = ability ? ABILITY_COLORS[ability] : 'text-muted-foreground'

              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  disabled={!isSelected && currentClassSkillsCount >= numClassChoices}
                  className={`text-left p-3 rounded-lg border transition-all text-sm ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : currentClassSkillsCount >= numClassChoices
                        ? 'border-border/50 bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={isSelected ? 'text-primary' : ''}>{skill}</span>
                    <div className="flex items-center gap-1">
                      {isRecommended && !isSelected && (
                        <LightBulbIcon className="w-3 h-3 text-magic" />
                      )}
                      {isSelected && (
                        <CheckCircleIcon className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </div>
                  {ability && (
                    <span className={`text-[10px] ${abilityColor}`}>
                      {ability.toUpperCase()}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Languages Selection */}
        {numBackgroundLanguages > 0 && (
          <div className="card p-4 rounded-xl border border-border bg-card">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="w-4 h-4 text-wis" />
                <h3 className="font-bold text-sm">Langues de l'historique</h3>
              </div>
              <CounterBadge
                current={selectedLanguages.filter(l => !(character.race?.languages || []).includes(l)).length}
                max={numBackgroundLanguages}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allLanguages.map(lang => {
                const isRaceLang = character.race?.languages?.includes(lang)
                const isSelected = selectedLanguages.includes(lang) || isRaceLang
                const isLocked = isRaceLang

                return (
                  <button
                    key={lang}
                    disabled={isLocked}
                    onClick={() => toggleLanguage(lang)}
                    className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                      isLocked
                        ? 'border-border/50 bg-muted/20 text-muted-foreground/50 cursor-not-allowed'
                        : isSelected
                          ? 'border-secondary bg-secondary/5 text-secondary font-medium'
                          : 'border-border bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isLocked && <LockClosedIcon className="w-3 h-3" />}
                      {isSelected && !isLocked && <CheckCircleIcon className="w-3 h-3" />}
                      <span>{lang}</span>
                      {isRaceLang && (
                        <span className="text-[11px] text-muted-foreground">(Race)</span>
                      )}
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

function CounterBadge({ current, max }: { current: number; max: number }) {
  const isFull = current >= max
  return (
    <div className={`text-xs font-bold px-2 py-1 rounded-md ${
      isFull ? 'bg-hp-high/10 text-hp-high' : 'bg-primary/10 text-primary'
    }`}>
      {current} / {max}
    </div>
  )
}
