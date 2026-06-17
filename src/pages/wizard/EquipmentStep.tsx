import { useState, useEffect, useMemo } from 'react'
import { useWizard } from '../../contexts/WizardContext'
import { WizardShell } from '../../components/WizardShell'
import {
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid'
import { loadClasses } from '../../data/aurora-loader'
import type { ClassV2 } from '../../types/aurora-v2'
import type { InventoryItem } from '../../types/inventory'
import {
  loadAuroraEquipment,
  findAuroraItem,
  auroraItemToInventoryItem,
  getGenericWeaponOptions,
  isGenericSelector,
  type AuroraEquipment,
} from '../../utils/equipment-converter'

interface SelectedOption {
  groupIndex: number
  optionIndex: number
  genericChoice?: string // ID of chosen weapon for generic selectors
}

function getDexMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

function calculateAC(inventory: InventoryItem[], dexScore: number): number {
  const dexMod = getDexMod(dexScore)
  const armor = inventory.find(
    i => i.equipped && i.type === 'armor' && i.armorCategory && i.armorCategory !== 'shield'
  )
  const shield = inventory.find(
    i => i.equipped && i.type === 'armor' && i.armorCategory === 'shield'
  )

  if (!armor) {
    return 10 + dexMod + (shield?.armorClass || 0)
  }

  let base = armor.armorClass || 10
  if (armor.addDex && armor.armorCategory !== 'shield') {
    const maxDex = armor.maxDex ?? (armor.armorCategory === 'medium' ? 2 : undefined)
    base += maxDex !== undefined ? Math.min(dexMod, maxDex) : dexMod
  }
  if (shield) {
    base += shield.armorClass || 0
  }
  return base
}

function slotLabel(item: InventoryItem): string {
  if (item.type === 'armor' && item.armorCategory === 'shield') return 'Main secondaire'
  if (item.type === 'armor') return 'Armure'
  if (item.type === 'weapon') {
    const isRanged = item.properties?.includes('range') || item.properties?.includes('thrown')
    return isRanged ? 'Distance' : 'Mêlée'
  }
  return 'Inventaire'
}

export function EquipmentStep() {
  const { character, updateCharacter } = useWizard()

  const [auroraClass, setAuroraClass] = useState<ClassV2 | null>(null)
  const [equipmentData, setEquipmentData] = useState<AuroraEquipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // User selections for each option group
  const [selections, setSelections] = useState<Record<number, SelectedOption>>({})

  useEffect(() => {
    async function load() {
      try {
        const [classesData, equipData] = await Promise.all([
          loadClasses(),
          loadAuroraEquipment(),
        ])
        setEquipmentData(equipData)

        const classId = character.characterClass?.id
        if (classId) {
          const rawClass = classesData.classes.find(c => c.id === classId)
          if (rawClass) {
            setAuroraClass(rawClass)
          }
        }
      } catch (e) {
        setError('Erreur de chargement des données Aurora')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [character.characterClass?.id])

  // Build inventory from current selections + fixed items
  const inventory = useMemo<InventoryItem[]>(() => {
    if (!auroraClass || !equipmentData) return character.inventory || []

    const items: InventoryItem[] = []
    const se = auroraClass.startingEquipment
    if (!se) return character.inventory || []

    // Fixed items
    for (const fixedId of se.fixed || []) {
      const item = findAuroraItem(fixedId, equipmentData)
      if (item) {
        items.push(auroraItemToInventoryItem(item, 1))
      } else if (fixedId === 'ID_EQUIPMENT_EXPLORER_PACK') {
        // Fallback for packs with no data in Aurora
        items.push({
          id: fixedId,
          name: 'Sac d\'explorateur',
          type: 'gear',
          quantity: 1,
          weight: 0,
          equipped: false,
          magical: false,
          value: 10,
        })
      }
    }

    // Selected options
    for (const [groupIdxStr, sel] of Object.entries(selections)) {
      const groupIdx = parseInt(groupIdxStr)
      const group = se.options?.[groupIdx]
      if (!group) continue
      const option = group[sel.optionIndex]
      if (!option) continue

      for (const itemId of option.items || []) {
        const resolvedId = isGenericSelector(itemId) && sel.genericChoice
          ? sel.genericChoice
          : itemId
        const item = findAuroraItem(resolvedId, equipmentData)
        if (item) {
          items.push(auroraItemToInventoryItem(item, option.quantity || 1))
        }
      }
    }

    return items
  }, [auroraClass, equipmentData, selections, character.inventory])

  const ac = useMemo(
    () => calculateAC(inventory, character.abilityScores.dex),
    [inventory, character.abilityScores.dex]
  )

  // Persist inventory to character state
  useEffect(() => {
    if (auroraClass && equipmentData) {
      updateCharacter({ inventory })
    }
  }, [inventory, auroraClass, equipmentData])

  const handleSelectOption = (groupIndex: number, optionIndex: number) => {
    setSelections(prev => ({
      ...prev,
      [groupIndex]: { groupIndex, optionIndex },
    }))
  }

  const handleGenericChoice = (groupIndex: number, optionIndex: number, weaponId: string) => {
    setSelections(prev => ({
      ...prev,
      [groupIndex]: { groupIndex, optionIndex, genericChoice: weaponId },
    }))
  }

  const toggleEquipped = (idx: number) => {
    const updated = inventory.map((item, i) =>
      i === idx ? { ...item, equipped: !item.equipped } : item
    )
    updateCharacter({ inventory: updated })
  }

  if (loading) {
    return (
      <WizardShell title="Équipement de départ" subtitle="Chargement des données...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </WizardShell>
    )
  }

  if (error) {
    return (
      <WizardShell title="Équipement de départ" subtitle="Erreur">
        <div className="text-destructive text-center py-8">{error}</div>
      </WizardShell>
    )
  }

  const startingEquipment = auroraClass?.startingEquipment
  const hasOptions = startingEquipment && startingEquipment.options && startingEquipment.options.length > 0

  return (
    <WizardShell
      title="Équipement de départ"
      subtitle={`Équipement fourni par ${character.characterClass?.name || 'votre classe'}`}
    >
      {/* Starting Equipment Choices */}
      {hasOptions && (
        <div className="space-y-6 mb-8">
          <h3 className="font-semibold text-ink flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary" />
            Choix d'équipement
          </h3>
          {startingEquipment.options!.map((group, gIdx) => (
            <div key={gIdx} className="card">
              <p className="text-sm text-ink-muted mb-3">
                Choisissez une option ({gIdx + 1}/{startingEquipment.options!.length})
              </p>
              <div className="space-y-2">
                {group.map((opt, oIdx) => {
                  const isSelected = selections[gIdx]?.optionIndex === oIdx
                  const hasGeneric = opt.items?.some(id => isGenericSelector(id))
                  const selectedGeneric = selections[gIdx]?.genericChoice

                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-ink-faint hover:border-primary/40'
                      }`}
                      onClick={() => handleSelectOption(gIdx, oIdx)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-ink">{opt.name}</span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-primary' : 'border-ink-muted'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </div>
                      <p className="text-xs text-ink-muted mt-1">
                        {opt.items?.map(id => {
                          const item = findAuroraItem(id, equipmentData!)
                          return item?.name || id
                        }).join(', ')}
                        {opt.quantity && opt.quantity > 1 ? ` ×${opt.quantity}` : ''}
                      </p>

                      {/* Generic weapon selector */}
                      {isSelected && hasGeneric && equipmentData && (
                        <div className="mt-3 pt-3 border-t border-ink-faint">
                          <label className="text-xs text-ink-muted block mb-1">
                            Précisez l'arme :
                          </label>
                          <select
                            className="input w-full text-sm"
                            value={selectedGeneric || ''}
                            onClick={e => e.stopPropagation()}
                            onChange={e => handleGenericChoice(gIdx, oIdx, e.target.value)}
                          >
                            <option value="">Choisir une arme...</option>
                            {opt.items
                              ?.filter(id => isGenericSelector(id))
                              .flatMap(id => getGenericWeaponOptions(id, equipmentData))
                              .map(w => (
                                <option key={w.id} value={w.id}>
                                  {w.name} ({w.damage} {w.damageType})
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fixed Items */}
      {startingEquipment && startingEquipment.fixed && startingEquipment.fixed.length > 0 && (
        <div className="card mb-8">
          <h3 className="font-semibold mb-4 text-ink">Équipement fixe</h3>
          <div className="flex flex-wrap gap-2">
            {startingEquipment.fixed.map(id => {
              const item = equipmentData ? findAuroraItem(id, equipmentData) : null
              return (
                <span
                  key={id}
                  className="px-3 py-1.5 rounded-full bg-surface border border-ink-faint text-sm text-ink"
                >
                  {item?.name || id.replace(/ID_(EQUIPMENT|WEAPON|ARMOR)_/g, '').replace(/_/g, ' ')}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* AC & Slot Visualizer */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-ink">Inventaire & CA</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShieldCheckIcon className="w-12 h-12 text-primary/20" />
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-primary">
                {ac}
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">{ac}</div>
              <div className="text-xs text-ink-muted">Classe d'armure</div>
            </div>
          </div>
        </div>

        {inventory.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-6">
            Sélectionnez vos options d'équipement ci-dessus pour remplir votre inventaire.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Slot Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Armor Slot */}
              <SlotBox
                label="Armure"
                icon="🛡️"
                item={inventory.find(
                  i => i.type === 'armor' && i.armorCategory && i.armorCategory !== 'shield'
                )}
                onToggle={() => {
                  const idx = inventory.findIndex(
                    i => i.type === 'armor' && i.armorCategory && i.armorCategory !== 'shield'
                  )
                  if (idx >= 0) toggleEquipped(idx)
                }}
              />
              {/* Main Hand */}
              <SlotBox
                label="Main principale"
                icon="⚔️"
                item={inventory.find(
                  i =>
                    i.type === 'weapon' &&
                    (!i.properties?.includes('two-handed') || !inventory.some(x => x.equipped && x.type === 'armor' && x.armorCategory === 'shield'))
                )}
                onToggle={() => {
                  const idx = inventory.findIndex(i => i.type === 'weapon')
                  if (idx >= 0) toggleEquipped(idx)
                }}
              />
              {/* Off Hand */}
              <SlotBox
                label="Main secondaire"
                icon="🛡️"
                item={inventory.find(i => i.armorCategory === 'shield')}
                onToggle={() => {
                  const idx = inventory.findIndex(i => i.armorCategory === 'shield')
                  if (idx >= 0) toggleEquipped(idx)
                }}
              />
            </div>

            {/* Inventory List */}
            <div className="border-t border-ink-faint pt-4 mt-4">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">
                Inventaire complet
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {inventory.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                      item.equipped
                        ? 'bg-primary/10 text-ink'
                        : 'bg-surface-hover text-ink-muted hover:text-ink'
                    }`}
                    onClick={() => toggleEquipped(idx)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : '🎒'}
                      </span>
                      <span className={item.equipped ? 'font-medium' : ''}>
                        {item.name}
                        {item.quantity > 1 ? ` ×${item.quantity}` : ''}
                      </span>
                      {item.equipped && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                          Équipé
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-ink-muted">
                      {slotLabel(item)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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

      <p className="text-sm text-muted mt-lg text-center">
        Vous pourrez modifier votre inventaire après la création du personnage.
      </p>
    </WizardShell>
  )
}

function SlotBox({
  label,
  icon,
  item,
  onToggle,
}: {
  label: string
  icon: string
  item?: InventoryItem
  onToggle: () => void
}) {
  return (
    <div
      onClick={onToggle}
      className={`relative rounded-xl border-2 p-4 text-center cursor-pointer transition-all min-h-[120px] flex flex-col items-center justify-center ${
        item?.equipped
          ? 'border-primary bg-primary/5'
          : 'border-ink-faint bg-surface-hover hover:border-ink-muted'
      }`}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-[10px] uppercase tracking-wide text-ink-muted font-medium">
        {label}
      </span>
      {item ? (
        <span
          className={`text-xs mt-1 font-medium truncate max-w-full px-1 ${
            item.equipped ? 'text-primary' : 'text-ink-muted'
          }`}
        >
          {item.name}
          {item.quantity > 1 ? ` ×${item.quantity}` : ''}
        </span>
      ) : (
        <span className="text-xs text-ink-faint mt-1">Vide</span>
      )}
      {item?.equipped && (
        <div className="absolute top-1.5 right-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      )}
    </div>
  )
}
