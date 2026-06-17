import { useState, useEffect } from 'react'
import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { loadClasses } from '../../data/aurora-loader'
import { convertAuroraClass } from '../../utils/class-converter'
import type { CharacterClass } from '../../types/character'
import {
  CheckCircleIcon,
  SparklesIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HeartIcon,
  BoltIcon,
  BookOpenIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid'

const abilityNames: Record<string, string> = {
  str: 'Force',
  dex: 'Dextérité',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Sagesse',
  cha: 'Charisme',
}

const abilityColors: Record<string, string> = {
  str: 'text-str',
  dex: 'text-dex',
  con: 'text-con',
  int: 'text-int',
  wis: 'text-wis',
  cha: 'text-cha',
}

const roleTagMap: Record<string, string> = {
  barbarian: 'Tank / DPS Mêlée',
  bard: 'Support / Contrôle',
  cleric: 'Soigneur / Support',
  druid: 'Polyvalent / Contrôle',
  fighter: 'DPS / Tank',
  monk: 'DPS Mêlée / Mobilité',
  paladin: 'Tank / Soigneur / DPS',
  ranger: 'DPS / Exploration',
  rogue: 'DPS / Utilitaire',
  sorcerer: 'DPS Magique / Contrôle',
  warlock: 'DPS Magique / Utilitaire',
  wizard: 'DPS Magique / Contrôle / Utilitaire',
}

const classColorMap: Record<string, string> = {
  barbarian: '#DC2626',
  bard: '#8B5CF6',
  cleric: '#F59E0B',
  druid: '#059669',
  fighter: '#B91C1C',
  monk: '#0EA5E9',
  paladin: '#EAB308',
  ranger: '#65A30D',
  rogue: '#374151',
  sorcerer: '#7C3AED',
  warlock: '#BE185D',
  wizard: '#2563EB',
}

function auroraIdToOldId(id: string): string {
  return id.toLowerCase().replace('id_phb_class_', '')
}

export function ClassStep() {
  const { character, updateCharacter } = useWizard()
  const [classes, setClasses] = useState<CharacterClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClasses().then(data => {
      const converted = data.classes.map(convertAuroraClass)
      setClasses(converted)
      setLoading(false)
    })
  }, [])

  const handleClassSelect = (cls: CharacterClass) => {
    updateCharacter({ characterClass: cls })
  }

  const handleLevelChange = (newLevel: number) => {
    const level = Math.max(1, Math.min(20, newLevel))
    updateCharacter({ level })
  }

  if (loading) {
    return (
      <WizardShell title="Choisir une classe" subtitle="Chargement des données Aurora...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </WizardShell>
    )
  }

  return (
    <WizardShell
      title="Choisir une classe"
      subtitle={`${classes.length} classes disponibles • Données Aurora V2`}
    >
      {/* Level Selector */}
      <div className="card mb-4 bg-primary/5 border-primary/20 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">Niveau du personnage</h3>
            <p className="text-xs text-muted-foreground">Choisissez le niveau de départ (1-20)</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLevelChange(character.level - 1)}
              className="p-2 rounded-lg bg-card border border-border hover:border-primary transition-colors"
            >
              <ChevronDownIcon className="w-5 h-5" />
            </button>
            <span className="text-2xl font-bold font-cinzel text-primary min-w-[2rem] text-center">
              {character.level}
            </span>
            <button
              onClick={() => handleLevelChange(character.level + 1)}
              className="p-2 rounded-lg bg-card border border-border hover:border-primary transition-colors"
            >
              <ChevronUpIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Class Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {classes.map((cls) => {
          const isSelected = character.characterClass?.id === cls.id
          const isSpellcaster = !!cls.spellcasting
          const oldId = auroraIdToOldId(cls.id)
          const color = classColorMap[oldId] || '#6B7280'
          const roleTag = roleTagMap[oldId] || 'Aventurier'

          return (
            <button
              key={cls.id}
              onClick={() => handleClassSelect(cls)}
              className={`text-left rounded-xl border-2 transition-all ${isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <h3 className="font-bold text-lg">{cls.name}</h3>
                      {isSpellcaster && (
                        <SparklesIcon className="w-4 h-4 text-magic shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cls.nameEn} • {roleTag}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircleIcon className="w-6 h-6 text-primary shrink-0" />
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-2 mt-3 text-xs flex-wrap">
                  <StatBadge
                    icon={HeartIcon}
                    label="PV"
                    value={`d${cls.hitDie}`}
                    color={color}
                  />
                  <StatBadge
                    icon={BoltIcon}
                    label="Carac"
                    value={abilityNames[cls.primaryAbility] || cls.primaryAbility}
                    colorClass={abilityColors[cls.primaryAbility]}
                  />
                  <StatBadge
                    icon={ShieldCheckIcon}
                    label="Sauv"
                    value={cls.savingThrows.map(s => s.toUpperCase()).join('/')}
                  />
                  {isSpellcaster && (
                    <StatBadge
                      icon={BookOpenIcon}
                      label="Sorts"
                      value={abilityNames[cls.spellcasting!.ability] || cls.spellcasting!.ability}
                      highlight
                    />
                  )}
                </div>

                {/* Resources preview */}
                {cls.classResources && Object.values(cls.classResources).some(Boolean) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {cls.classResources.hasRage && <ResourceTag label="Rage" />}
                    {cls.classResources.hasKi && <ResourceTag label="Ki" />}
                    {cls.classResources.hasChannelDivinity && <ResourceTag label="Canal divin" />}
                    {cls.classResources.hasBardicInspiration && <ResourceTag label="Inspiration" />}
                    {cls.classResources.hasSecondWind && <ResourceTag label="Second souffle" />}
                    {cls.classResources.hasActionSurge && <ResourceTag label="Fougue" />}
                    {cls.classResources.hasSorceryPoints && <ResourceTag label="Sorcellerie" />}
                    {cls.classResources.hasWildShape && <ResourceTag label="Forme sauvage" />}
                    {cls.classResources.hasDivineSmite && <ResourceTag label="Châtiment divin" />}
                    {cls.classResources.hasLayOnHands && <ResourceTag label="Imposition" />}
                    {cls.classResources.hasArcaneRecovery && <ResourceTag label="Récupération" />}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </WizardShell>
  )
}

function StatBadge({
  icon: Icon,
  label,
  value,
  color,
  colorClass,
  highlight,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color?: string
  colorClass?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] ${
        highlight ? 'bg-primary/10 text-primary font-medium' : 'bg-muted text-muted-foreground'
      }`}
    >
      {Icon && (
        <span className={colorClass || ''} style={color ? { color } : undefined}>
          <Icon className="w-3 h-3" />
        </span>
      )}
      <span className="opacity-70">{label}:</span>
      <span className={colorClass || ''} style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  )
}

function ResourceTag({ label }: { label: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
      {label}
    </span>
  )
}
