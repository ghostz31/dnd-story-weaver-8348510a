import { useState, useEffect, useMemo } from 'react'
import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import { loadAuroraSpells } from '../../utils/spell-converter'
import { getMaxSpellLevel } from '../../utils/spellUtils'
import { spellSchoolColors } from '../../types/spell'
import type { Spell } from '../../types/spell'
import {
  CheckCircleIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  LockClosedIcon,
} from '@heroicons/react/24/solid'

const CLASS_SPELL_LIST_MAP: Record<string, string> = {
  'ID_PHB_CLASS_SORCERER': 'Ensorceleur',
  'ID_PHB_CLASS_WIZARD': 'Magicien',
  'ID_PHB_CLASS_CLERIC': 'Clerc',
  'ID_PHB_CLASS_DRUID': 'Druide',
  'ID_PHB_CLASS_BARD': 'Barde',
  'ID_PHB_CLASS_PALADIN': 'Paladin',
  'ID_PHB_CLASS_RANGER': 'Rôdeur',
  'ID_PHB_CLASS_WARLOCK': 'Occultiste',
  'ID_PHB_CLASS_ARTIFICER': 'Artificier',
  sorcerer: 'Ensorceleur',
  wizard: 'Magicien',
  cleric: 'Clerc',
  druid: 'Druide',
  bard: 'Barde',
  paladin: 'Paladin',
  ranger: 'Rôdeur',
  warlock: 'Occultiste',
  artificer: 'Artificier',
}

function getClassSpellListName(classId: string | undefined): string {
  if (!classId) return ''
  return CLASS_SPELL_LIST_MAP[classId] || CLASS_SPELL_LIST_MAP[classId.toLowerCase().replace('id_phb_class_', '')] || ''
}

export function SpellsStep() {
  const { character, updateCharacter } = useWizard()
  const [allSpells, setAllSpells] = useState<Spell[]>([])
  const [selected, setSelected] = useState<string[]>(character.selectedSpells || [])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)

  const characterClass = character.characterClass
  const hasSpellcasting = !!(characterClass && characterClass.spellcasting)

  // Charger les sorts Aurora
  useEffect(() => {
    loadAuroraSpells().then(spells => {
      setAllSpells(spells)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <WizardShell title="Sorts" subtitle="Chargement des sorts...">
        <div className="card p-8 rounded-xl text-center text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Chargement du grimoire...
        </div>
      </WizardShell>
    )
  }

  const { cantripsKnown } = characterClass?.spellcasting || {}
  const numCantrips = cantripsKnown?.[(character.level - 1)] || 0
  const maxSpellLevel = hasSpellcasting ? getMaxSpellLevel(characterClass!, character.level) : 0

  // Nombre de sorts préparables/connus
  const numSpells = useMemo(() => {
    if (!hasSpellcasting || !characterClass?.spellcasting) return 0
    const levelIndex = character.level - 1
    if (characterClass.spellcasting.spellsKnown) {
      return characterClass.spellcasting.spellsKnown[levelIndex] || 0
    }
    const abilityKey = characterClass.spellcasting.ability || 'wis'
    const abilityMod = Math.floor(((character.abilityScores[abilityKey] || 10) - 10) / 2)
    const oldId = characterClass.id.toLowerCase().replace('id_phb_class_', '')
    if (oldId === 'paladin' || oldId === 'ranger') {
      return Math.max(1, abilityMod + Math.floor(character.level / 2))
    }
    return Math.max(1, abilityMod + character.level)
  }, [characterClass, character.level, character.abilityScores, hasSpellcasting])

  // Sorts disponibles pour cette classe
  const classSpellListName = hasSpellcasting ? getClassSpellListName(characterClass?.id) : ''
  const classSpells = useMemo(() => {
    if (!classSpellListName || allSpells.length === 0) return []
    return allSpells.filter(spell =>
      spell.level <= maxSpellLevel &&
      spell.classes?.some(c => c === classSpellListName)
    )
  }, [allSpells, classSpellListName, maxSpellLevel])

  // Apply filters
  const filteredSpells = useMemo(() => {
    let spells = classSpells
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      spells = spells.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.school.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      )
    }
    if (selectedSchool) {
      spells = spells.filter(s => s.school === selectedSchool)
    }
    if (selectedLevel !== null) {
      spells = spells.filter(s => s.level === selectedLevel)
    }
    return spells
  }, [classSpells, searchQuery, selectedSchool, selectedLevel])

  // Grouper par niveau
  const spellsByLevel = useMemo(() => {
    const grouped = new Map<number, Spell[]>()
    for (const spell of filteredSpells) {
      const list = grouped.get(spell.level) || []
      list.push(spell)
      grouped.set(spell.level, list)
    }
    grouped.forEach((list, level) => {
      grouped.set(level, list.sort((a, b) => a.name.localeCompare(b.name, 'fr')))
    })
    return grouped
  }, [filteredSpells])

  const toggleSpell = (spellName: string, isCantrip: boolean) => {
    if (selected.includes(spellName)) {
      setSelected(prev => prev.filter(n => n !== spellName))
    } else {
      if (isCantrip) {
        const currentCantrips = selected.filter(n =>
          classSpells.find(s => s.name === n)?.level === 0
        ).length
        if (currentCantrips < numCantrips) {
          setSelected(prev => [...prev, spellName])
        }
      } else {
        const currentLeveled = selected.filter(n => {
          const spell = classSpells.find(s => s.name === n)
          return spell && spell.level > 0
        }).length
        if (currentLeveled < numSpells) {
          setSelected(prev => [...prev, spellName])
        }
      }
    }
  }

  useEffect(() => {
    updateCharacter({ selectedSpells: selected })
  }, [selected, updateCharacter])

  const selectedCantripsCount = selected.filter(n =>
    classSpells.find(s => s.name === n)?.level === 0
  ).length
  const selectedLeveledCount = selected.filter(n => {
    const spell = classSpells.find(s => s.name === n)
    return spell && spell.level > 0
  }).length

  const allSchools = useMemo(() => {
    const schools = new Set<string>()
    classSpells.forEach(s => schools.add(s.school))
    return Array.from(schools).sort()
  }, [classSpells])

  if (!hasSpellcasting) {
    return (
      <WizardShell title="Sorts" subtitle="Votre classe ne possède pas de capacités magiques">
        <div className="card text-center p-8 rounded-xl">
          <SparklesIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Les {characterClass?.name} ne lancent pas de sorts. Vous pouvez passer à l'étape suivante.
          </p>
        </div>
      </WizardShell>
    )
  }

  const isPreparedCaster = !characterClass!.spellcasting?.spellsKnown

  return (
    <WizardShell
      title="Grimoire et Sorts"
      subtitle={`${classSpells.length} sorts de ${characterClass.name} • ${isPreparedCaster ? 'Préparés' : 'Connus'}`}
    >
      <div className="space-y-6">
        {/* Search & Filters */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un sort..."
              className="w-full pl-9 pr-9 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <XMarkIcon className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* School filters */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedSchool(null)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                !selectedSchool ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:border-primary/30'
              }`}
            >
              Toutes écoles
            </button>
            {allSchools.map(school => (
              <button
                key={school}
                onClick={() => setSelectedSchool(selectedSchool === school ? null : school)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                  selectedSchool === school
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted text-muted-foreground hover:border-primary/30'
                }`}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                  style={{ backgroundColor: spellSchoolColors[school] || '#6B7280' }}
                />
                {school}
              </button>
            ))}
          </div>

          {/* Level filters */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedLevel(null)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                selectedLevel === null ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:border-primary/30'
              }`}
            >
              Tous niveaux
            </button>
            {numCantrips > 0 && (
              <button
                onClick={() => setSelectedLevel(selectedLevel === 0 ? null : 0)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                  selectedLevel === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:border-primary/30'
                }`}
              >
                Tours de magie
              </button>
            )}
            {Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                  selectedLevel === level ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:border-primary/30'
                }`}
              >
                Niv {level}
              </button>
            ))}
          </div>
        </div>

        {/* Counters */}
        {numCantrips > 0 && (
          <CounterBadge
            label="Tours de magie"
            current={selectedCantripsCount}
            max={numCantrips}
          />
        )}
        {numSpells > 0 && (
          <CounterBadge
            label={isPreparedCaster ? 'Sorts préparés' : 'Sorts connus'}
            current={selectedLeveledCount}
            max={numSpells}
          />
        )}

        {/* Spell list */}
        {filteredSpells.length === 0 ? (
          <div className="card text-center p-8 rounded-xl space-y-3">
            <p className="text-muted-foreground">Aucun sort ne correspond aux filtres</p>
            <LockedSpellHint
              query={searchQuery}
              allSpells={allSpells}
              classSpellListName={classSpellListName}
              maxSpellLevel={maxSpellLevel}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(spellsByLevel.entries())
              .sort(([a], [b]) => a - b)
              .map(([level, spells]) => (
                <div key={level} className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1 flex items-center gap-2">
                    {level === 0 ? 'Tours de magie' : `Niveau ${level}`}
                    <span className="text-[10px] font-normal normal-case">
                      ({spells.length} sort{spells.length > 1 ? 's' : ''})
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {spells.map(spell => {
                      const isSelected = selected.includes(spell.name)
                      const isCantrip = spell.level === 0
                      const schoolColor = spellSchoolColors[spell.school] || '#6B7280'

                      return (
                        <button
                          key={spell.name}
                          onClick={() => toggleSpell(spell.name, isCantrip)}
                          className={`text-left p-3 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm">{spell.name}</span>
                                {isSelected && (
                                  <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                                )}
                                {spell.ritual && (
                                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-magic/10 text-magic font-medium">
                                    Rituel
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: schoolColor }}
                                />
                                <span>{spell.school}</span>
                                <span>•</span>
                                <span>{spell.castingTime}</span>
                                <span>•</span>
                                <span>{spell.range}</span>
                              </div>
                            </div>
                          </div>

                          {/* Components & Duration */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {/* V, S, M icons */}
                            {spell.components.includes('V') && (
                              <ComponentTag icon="V" label="Verbal" />
                            )}
                            {spell.components.includes('S') && (
                              <ComponentTag icon="S" label="Somatique" />
                            )}
                            {spell.components.includes('M') && (
                              <ComponentTag icon="M" label="Matériel" />
                            )}
                            {spell.duration.includes('Concentration') && (
                              <ComponentTag icon="C" label="Conc." highlight />
                            )}
                          </div>

                          {/* Description preview */}
                          <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                            {spell.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </WizardShell>
  )
}

function LockedSpellHint({
  query,
  allSpells,
  classSpellListName,
  maxSpellLevel,
}: {
  query: string
  allSpells: Spell[]
  classSpellListName: string
  maxSpellLevel: number
}) {
  if (!query.trim()) return null

  const q = query.toLowerCase().trim()

  // Search in all spells (not filtered by class/level)
  const matches = allSpells.filter((spell) =>
    spell.name.toLowerCase().includes(q) ||
    spell.name.toLowerCase() === q
  )

  if (matches.length === 0) return null

  // Sort by relevance (exact match first)
  const sorted = matches.sort((a, b) => {
    const aExact = a.name.toLowerCase() === q ? 1 : 0
    const bExact = b.name.toLowerCase() === q ? 1 : 0
    return bExact - aExact || a.name.localeCompare(b.name, 'fr')
  })

  return (
    <div className="space-y-2">
      {sorted.slice(0, 3).map((spell) => {
        const isClassSpell = spell.classes?.some((c) => c === classSpellListName)
        const isTooHigh = spell.level > maxSpellLevel
        const levelRequired = spell.level * 2 - 1 // Approximate: niv 1 spell at level 1, niv 2 at 3, niv 3 at 5, etc.

        if (!isClassSpell) {
          return (
            <p key={spell.name} className="text-xs text-muted-foreground">
              <span className="font-semibold text-ink">{spell.name}</span> n'est pas dans la liste de sorts de votre classe.
            </p>
          )
        }

        if (isTooHigh) {
          return (
            <div key={spell.name} className="flex items-center gap-2 justify-center">
              <LockClosedIcon className="w-4 h-4 text-magic" />
              <p className="text-sm text-magic font-medium">
                {spell.name} — Disponible au niveau {levelRequired} !
              </p>
            </div>
          )
        }

        return (
          <p key={spell.name} className="text-xs text-muted-foreground">
            <span className="font-semibold text-ink">{spell.name}</span> est déjà dans votre liste mais ne correspond pas aux filtres actuels.
          </p>
        )
      })}
    </div>
  )
}

function CounterBadge({ label, current, max }: { label: string; current: number; max: number }) {
  const isFull = current >= max
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
      isFull ? 'bg-hp-high/10 border border-hp-high/20' : 'bg-primary/5 border border-primary/10'
    }`}>
      <span className="font-medium">{label}</span>
      <span className={`font-bold ${isFull ? 'text-hp-high' : 'text-primary'}`}>
        {current} / {max}
      </span>
    </div>
  )
}

function ComponentTag({ icon, label, highlight }: { icon: string; label: string; highlight?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded ${
      highlight ? 'bg-magic/10 text-magic' : 'bg-muted text-muted-foreground'
    }`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  )
}
