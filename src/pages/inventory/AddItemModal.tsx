import { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { useCharacter } from '../../contexts/CharacterContext'
import type { InventoryItem, ItemType, ItemRarity } from '../../types/inventory'
import { rarityColors } from '../../types/inventory'
import { weapons, armors, gear, armorCategoryLabels, weaponPropertyLabels } from '../../data/equipment'
import type { CatalogWeapon, CatalogArmor, CatalogGear, WeaponProperty } from '../../data/equipment'
import { convertTrameItemToInventory, type TrameMagicItem } from '../../data/magicItemBonuses'
import { MagicItemDetailModal } from './MagicItemDetailModal'

interface AddItemModalProps {
    onClose: () => void
    onError: (message: string | null) => void
}

export function AddItemModal({ onClose, onError }: AddItemModalProps) {
    const { addItem } = useCharacter()

    const [catalogTab, setCatalogTab] = useState<'manual' | 'weapons' | 'armor' | 'gear' | 'magic'>('manual')
    const [catalogSearch, setCatalogSearch] = useState('')
    const [trameItems, setTrameItems] = useState<TrameMagicItem[]>([])
    const [trameLoading, setTrameLoading] = useState(false)
    const [trameLoaded, setTrameLoaded] = useState(false)
    const [trameFilterType, setTrameFilterType] = useState<string>('')
    const [trameFilterRarity, setTrameFilterRarity] = useState<string>('')
    const [selectedMagicItem, setSelectedMagicItem] = useState<TrameMagicItem | null>(null)
    const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
        name: '',
        type: 'gear',
        quantity: 1,
        weight: 0,
        equipped: false,
        magical: false,
    })

    useEffect(() => {
        if (catalogTab === 'magic' && !trameLoaded) {
            setTrameLoading(true)
            fetch('/data/magic-items.json')
                .then(r => r.json())
                .then(data => {
                    setTrameItems(data)
                    setTrameLoaded(true)
                })
                .catch(err => console.error('Error loading magic items:', err))
                .finally(() => setTrameLoading(false))
        }
    }, [catalogTab, trameLoaded])

    const handleAddItem = async () => {
        if (!newItem.name?.trim()) return
        try {
            await addItem(newItem as Omit<InventoryItem, 'id'>)
            setNewItem({
                name: '',
                type: 'gear',
                quantity: 1,
                weight: 0,
                equipped: false,
                magical: false,
            })
            onClose()
            onError(null)
        } catch (err) {
            console.error('Error adding item:', err)
            onError('Erreur lors de l\'ajout de l\'objet')
        }
    }

    const handleAddFromCatalog = async (type: 'weapon' | 'armor' | 'gear', catalogItem: CatalogWeapon | CatalogArmor | CatalogGear) => {
        try {
        let item: Omit<InventoryItem, 'id'>

        if (type === 'weapon') {
            const w = catalogItem as CatalogWeapon
            item = {
                name: w.name,
                type: 'weapon',
                quantity: 1,
                weight: w.weight,
                equipped: true,
                magical: false,
                damage: w.damage,
                damageType: w.damageType,
                properties: w.properties.map(p => weaponPropertyLabels[p as WeaponProperty] || p),
                range: w.range ? `${w.range.normal}/${w.range.long} m` : undefined,
                versatileDamage: w.versatileDamage,
                value: w.value,
            }
        } else if (type === 'armor') {
            const a = catalogItem as CatalogArmor
            item = {
                name: a.name,
                type: 'armor',
                quantity: 1,
                weight: a.weight,
                equipped: true,
                magical: false,
                armorClass: a.armorClass,
                armorCategory: a.category,
                addDex: a.addDex,
                maxDex: a.maxDex,
                stealthDisadvantage: a.stealthDisadvantage,
                value: a.value,
            }
        } else {
            const g = catalogItem as CatalogGear
            item = {
                name: g.name,
                type: 'gear',
                quantity: 1,
                weight: g.weight,
                equipped: false,
                magical: false,
                value: g.value,
            }
        }

        await addItem(item)
        setCatalogSearch('')
        onError(null)
        } catch (err) {
            console.error('Error adding from catalog:', err)
            onError('Erreur lors de l\'ajout de l\'objet')
        }
    }
    const handleAddMagicItem = async (item: Omit<InventoryItem, 'id'>) => {
        await addItem(item)
        onError(null)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="font-cinzel text-xl font-bold mb-4">Ajouter un objet</h2>

                {/* Tabs */}
                <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4">
                    {[
                        { id: 'manual', label: 'Manuel' },
                        { id: 'weapons', label: '⚔️ Armes' },
                        { id: 'armor', label: '🛡️ Armures' },
                        { id: 'gear', label: '🎒 Équip.' },
                        { id: 'magic', label: '✨ Magie' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCatalogTab(tab.id as typeof catalogTab)}
                            className={`flex-1 py-2 px-2 rounded-md text-sm font-medium transition ${catalogTab === tab.id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search (for catalog tabs) */}
                {catalogTab !== 'manual' && (
                    <div className="relative mb-4">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={catalogSearch}
                            onChange={(e) => setCatalogSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="input w-full pl-10"
                        />
                    </div>
                )}

                {/* Manual Entry */}
                {catalogTab === 'manual' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nom *</label>
                            <input
                                type="text"
                                value={newItem.name || ''}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                className="input w-full"
                                placeholder="Épée longue"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select
                                    value={newItem.type}
                                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value as ItemType })}
                                    className="input w-full"
                                >
                                    <option value="weapon">Arme</option>
                                    <option value="armor">Armure</option>
                                    <option value="gear">Équipement</option>
                                    <option value="consumable">Consommable</option>
                                    <option value="wondrous">Merveilleux</option>
                                    <option value="tool">Outil</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantité</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                                    className="input w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Poids (lb)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={newItem.weight}
                                onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input
                                type="text"
                                value={newItem.description || ''}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                className="input w-full"
                                placeholder="Description optionnelle..."
                            />
                        </div>
                        {newItem.magical && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Rareté</label>
                                <select
                                    value={newItem.rarity || ''}
                                    onChange={(e) => setNewItem({ ...newItem, rarity: (e.target.value || undefined) as ItemRarity | undefined })}
                                    className="input w-full"
                                >
                                    <option value="">—</option>
                                    <option value="common">Commun</option>
                                    <option value="uncommon">Peu commun</option>
                                    <option value="rare">Rare</option>
                                    <option value="very-rare">Très rare</option>
                                    <option value="legendary">Légendaire</option>
                                    <option value="artifact">Artefact</option>
                                </select>
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newItem.magical}
                                    onChange={(e) => setNewItem({ ...newItem, magical: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Objet magique</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newItem.equipped}
                                    onChange={(e) => setNewItem({ ...newItem, equipped: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Équipé</span>
                            </label>
                            {newItem.magical && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newItem.attunement || false}
                                        onChange={(e) => setNewItem({ ...newItem, attunement: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Harmonisation requise</span>
                                </label>
                            )}
                        </div>
                        {newItem.magical && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Charges max</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newItem.maxCharges || ''}
                                        onChange={(e) => {
                                            const max = parseInt(e.target.value) || 0
                                            setNewItem({ ...newItem, maxCharges: max > 0 ? max : undefined, charges: max > 0 ? max : undefined })
                                        }}
                                        className="input w-full"
                                        placeholder="—"
                                    />
                                </div>
                                {newItem.maxCharges && newItem.maxCharges > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Charges actuelles</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={newItem.maxCharges}
                                            value={newItem.charges ?? newItem.maxCharges}
                                            onChange={(e) => setNewItem({ ...newItem, charges: parseInt(e.target.value) || 0 })}
                                            className="input w-full"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Récupération</label>
                                    <select
                                        value={newItem.chargesRecovery || ''}
                                        onChange={(e) => setNewItem({ ...newItem, chargesRecovery: (e.target.value || undefined) as 'short' | 'long' | 'dawn' | undefined })}
                                        className="input w-full"
                                    >
                                        <option value="">—</option>
                                        <option value="short">Repos court</option>
                                        <option value="long">Repos long</option>
                                        <option value="dawn">Aube</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        {/* Weapon-specific fields */}
                        {newItem.type === 'weapon' && (
                            <div className="space-y-4 border-t pt-4" style={{ borderColor: 'hsl(var(--border))' }}>
                                <h3 className="text-sm font-semibold">Propriétés d'arme</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dégâts</label>
                                        <input
                                            type="text"
                                            value={newItem.damage || ''}
                                            onChange={(e) => setNewItem({ ...newItem, damage: e.target.value })}
                                            className="input w-full"
                                            placeholder="1d8"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Type de dégâts</label>
                                        <select
                                            value={newItem.damageType || 'slashing'}
                                            onChange={(e) => setNewItem({ ...newItem, damageType: e.target.value })}
                                            className="input w-full"
                                        >
                                            <option value="slashing">Tranchant</option>
                                            <option value="piercing">Perforant</option>
                                            <option value="bludgeoning">Contondant</option>
                                            <option value="fire">Feu</option>
                                            <option value="cold">Froid</option>
                                            <option value="lightning">Foudre</option>
                                            <option value="thunder">Tonnerre</option>
                                            <option value="poison">Poison</option>
                                            <option value="acid">Acide</option>
                                            <option value="necrotic">Nécrotique</option>
                                            <option value="radiant">Radiant</option>
                                            <option value="force">Force</option>
                                            <option value="psychic">Psychique</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Portée</label>
                                        <input
                                            type="text"
                                            value={typeof newItem.range === 'string' ? newItem.range : newItem.range ? `${newItem.range.normal}/${newItem.range.long}` : ''}
                                            onChange={(e) => setNewItem({ ...newItem, range: e.target.value })}
                                            className="input w-full"
                                            placeholder="9/36 m"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dégâts polyvalent</label>
                                        <input
                                            type="text"
                                            value={newItem.versatileDamage || ''}
                                            onChange={(e) => setNewItem({ ...newItem, versatileDamage: e.target.value })}
                                            className="input w-full"
                                            placeholder="1d10"
                                        />
                                    </div>
                                </div>
                                {newItem.magical && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Bonus attaque</label>
                                            <input
                                                type="number"
                                                min="-5"
                                                max="5"
                                                value={newItem.attackBonus ?? ''}
                                                onChange={(e) => setNewItem({ ...newItem, attackBonus: parseInt(e.target.value) || undefined })}
                                                className="input w-full"
                                                placeholder="+1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Bonus dégâts</label>
                                            <input
                                                type="number"
                                                min="-5"
                                                max="5"
                                                value={newItem.damageBonus ?? ''}
                                                onChange={(e) => setNewItem({ ...newItem, damageBonus: parseInt(e.target.value) || undefined })}
                                                className="input w-full"
                                                placeholder="+1"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Armor-specific fields */}
                        {newItem.type === 'armor' && (
                            <div className="space-y-4 border-t pt-4" style={{ borderColor: 'hsl(var(--border))' }}>
                                <h3 className="text-sm font-semibold">Propriétés d'armure</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">CA de base</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={newItem.armorClass || ''}
                                            onChange={(e) => setNewItem({ ...newItem, armorClass: parseInt(e.target.value) || undefined })}
                                            className="input w-full"
                                            placeholder="12"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Catégorie</label>
                                        <select
                                            value={newItem.armorCategory || 'light'}
                                            onChange={(e) => setNewItem({ ...newItem, armorCategory: e.target.value as 'light' | 'medium' | 'heavy' | 'shield' })}
                                            className="input w-full"
                                        >
                                            <option value="light">Légère</option>
                                            <option value="medium">Intermédiaire</option>
                                            <option value="heavy">Lourde</option>
                                            <option value="shield">Bouclier</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newItem.addDex ?? true}
                                            onChange={(e) => setNewItem({ ...newItem, addDex: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Ajoute DEX</span>
                                    </label>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">DEX max</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={newItem.maxDex ?? ''}
                                            onChange={(e) => setNewItem({ ...newItem, maxDex: parseInt(e.target.value) || undefined })}
                                            className="input w-full"
                                            placeholder="∞"
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newItem.stealthDisadvantage || false}
                                        onChange={(e) => setNewItem({ ...newItem, stealthDisadvantage: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Désavantage furtivité</span>
                                </label>
                                {newItem.magical && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bonus CA magique</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            value={newItem.acBonus ?? ''}
                                            onChange={(e) => setNewItem({ ...newItem, acBonus: parseInt(e.target.value) || undefined })}
                                            className="input w-full"
                                            placeholder="+1"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Magical bonus fields */}
                        {newItem.magical && newItem.type !== 'weapon' && newItem.type !== 'armor' && (
                            <div className="space-y-4 border-t pt-4" style={{ borderColor: 'hsl(var(--border))' }}>
                                <h3 className="text-sm font-semibold">Bonus magiques</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bonus CA</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            value={newItem.acBonus ?? ''}
                                            onChange={(e) => setNewItem({ ...newItem, acBonus: parseInt(e.target.value) || undefined })}
                                            className="input w-full"
                                            placeholder="+1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bonus JDS</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            value={newItem.saveBonus ?? ''}
                                            onChange={(e) => setNewItem({ ...newItem, saveBonus: parseInt(e.target.value) || undefined })}
                                            className="input w-full"
                                            placeholder="+1"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bonus attaque sort</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            value={newItem.spellAttackBonus ?? ''}
                                            onChange={(e) => setNewItem({ ...newItem, spellAttackBonus: parseInt(e.target.value) || undefined })}
                                            className="input w-full"
                                            placeholder="+1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bonus DD sort</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            value={newItem.spellSaveDCBonus ?? ''}
                                            onChange={(e) => setNewItem({ ...newItem, spellSaveDCBonus: parseInt(e.target.value) || undefined })}
                                            className="input w-full"
                                            placeholder="+1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Bonus vitesse (m)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newItem.speedBonus ?? ''}
                                        onChange={(e) => setNewItem({ ...newItem, speedBonus: parseInt(e.target.value) || undefined })}
                                        className="input w-full"
                                        placeholder="+3"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => onClose()} className="btn btn-secondary flex-1">Annuler</button>
                            <button onClick={handleAddItem} disabled={!newItem.name?.trim()} className="btn btn-primary flex-1">Ajouter</button>
                        </div>
                    </div>
                )}

                {/* Weapons Catalog */}
                {catalogTab === 'weapons' && (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {weapons
                            .filter(w => w.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                            .map(weapon => (
                                <button
                                    key={weapon.id}
                                    onClick={() => handleAddFromCatalog('weapon', weapon)}
                                    className="w-full p-3 rounded-lg border border-border hover:border-primary/50 text-left transition flex items-center gap-3"
                                >
                                    <span className="text-xl">⚔️</span>
                                    <div className="flex-1">
                                        <div className="font-semibold">{weapon.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {weapon.damage} {weapon.damageType} • {weapon.weight} lb
                                        </div>
                                    </div>
                                    <PlusIcon className="w-5 h-5 text-primary" />
                                </button>
                            ))}
                    </div>
                )}

                {/* Armor Catalog */}
                {catalogTab === 'armor' && (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {armors
                            .filter(a => a.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                            .map(armor => (
                                <button
                                    key={armor.id}
                                    onClick={() => handleAddFromCatalog('armor', armor)}
                                    className="w-full p-3 rounded-lg border border-border hover:border-primary/50 text-left transition flex items-center gap-3"
                                >
                                    <span className="text-xl">{armor.category === 'shield' ? '🛡️' : '🛡️'}</span>
                                    <div className="flex-1">
                                        <div className="font-semibold">{armor.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            CA {armor.armorClass}{armor.addDex ? ` + DEX${armor.maxDex ? ` (max ${armor.maxDex})` : ''}` : ''} • {armorCategoryLabels[armor.category]} • {armor.weight} lb
                                        </div>
                                    </div>
                                    <PlusIcon className="w-5 h-5 text-primary" />
                                </button>
                            ))}
                    </div>
                )}

                {/* Gear Catalog */}
                {catalogTab === 'gear' && (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {gear
                            .filter(g => g.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                            .map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => handleAddFromCatalog('gear', g)}
                                    className="w-full p-3 rounded-lg border border-border hover:border-primary/50 text-left transition flex items-center gap-3"
                                >
                                    <span className="text-xl">🎒</span>
                                    <div className="flex-1">
                                        <div className="font-semibold">{g.name}</div>
                                        <div className="text-xs text-muted-foreground">{g.weight} lb • {g.value} po</div>
                                    </div>
                                    <PlusIcon className="w-5 h-5 text-primary" />
                                </button>
                            ))}
                    </div>
                )}

                {catalogTab === 'magic' && (
                    <>
                        {/* Filters */}
                        <div className="flex gap-2 mb-3">
                            <select
                                value={trameFilterType}
                                onChange={(e) => setTrameFilterType(e.target.value)}
                                className="input flex-1 text-xs py-1.5"
                            >
                                <option value="">Tous les types</option>
                                <option value="Arme">⚔️ Arme</option>
                                <option value="Armure">🛡️ Armure</option>
                                <option value="Anneau">💍 Anneau</option>
                                <option value="Baguette">🪄 Baguette</option>
                                <option value="Bâton">🪄 Bâton</option>
                                <option value="Sceptre">🪄 Sceptre</option>
                                <option value="Objet merveilleux">✨ Objet merveilleux</option>
                                <option value="Potion">🧪 Potion</option>
                                <option value="Parchemin">📜 Parchemin</option>
                            </select>
                            <select
                                value={trameFilterRarity}
                                onChange={(e) => setTrameFilterRarity(e.target.value)}
                                className="input flex-1 text-xs py-1.5"
                            >
                                <option value="">Toutes raretés</option>
                                <option value="commun">Commun</option>
                                <option value="peu commun">Peu commun</option>
                                <option value="rare">Rare</option>
                                <option value="très rare">Très rare</option>
                                <option value="légendaire">Légendaire</option>
                                <option value="artéfact">Artéfact</option>
                            </select>
                        </div>
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                            {trameLoading && (
                                <div className="text-center py-8 text-muted-foreground">Chargement des objets magiques…</div>
                            )}
                            {!trameLoading && trameItems
                                .filter(m => {
                                    if (trameFilterType && !m.type.toLowerCase().includes(trameFilterType.toLowerCase())) return false
                                    if (trameFilterRarity && !m.rarity.toLowerCase().includes(trameFilterRarity.toLowerCase())) return false
                                    if (catalogSearch && !m.name.toLowerCase().includes(catalogSearch.toLowerCase())) return false
                                    return true
                                })
                                .map(m => {
                                    const item = convertTrameItemToInventory(m)
                                    const rColor = rarityColors[item.rarity || 'common']
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => setSelectedMagicItem(m)}
                                            className="w-full p-2.5 rounded-lg border border-border hover:border-primary/50 text-left transition"
                                            style={{ borderColor: `${rColor}40` }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg shrink-0">{item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : item.type === 'consumable' ? '🧪' : '✨'}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-sm truncate" style={{ color: rColor }}>{m.name}</span>
                                                        {m.attunement && <span className="text-[11px] px-1 py-0.5 rounded bg-magic/10 text-magic shrink-0">Har.</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] italic" style={{ color: rColor }}>{item.rarity === 'common' ? 'Commun' : item.rarity === 'uncommon' ? 'Peu commun' : item.rarity === 'rare' ? 'Rare' : item.rarity === 'very-rare' ? 'Très rare' : item.rarity === 'legendary' ? 'Légendaire' : item.rarity}</span>
                                                        {m.type && <span className="text-[10px] text-muted-foreground">• {m.type}</span>}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {item.attackBonus && <span className="text-[11px] px-1 py-0.5 rounded bg-primary/10 text-primary">Atk +{item.attackBonus}</span>}
                                                        {item.damageBonus && <span className="text-[11px] px-1 py-0.5 rounded bg-destructive/10 text-destructive">Dég +{item.damageBonus}</span>}
                                                        {item.acBonus && <span className="text-[11px] px-1 py-0.5 rounded bg-ac/10 text-ac">CA +{item.acBonus}</span>}
                                                        {item.saveBonus && <span className="text-[11px] px-1 py-0.5 rounded bg-hp-high/10 text-hp-high">JDS +{item.saveBonus}</span>}
                                                        {item.spellAttackBonus && <span className="text-[11px] px-1 py-0.5 rounded bg-[hsl(var(--color-xp)/0.15)] text-[hsl(var(--color-xp))]">Atk sort +{item.spellAttackBonus}</span>}
                                                        {item.spellSaveDCBonus && <span className="text-[11px] px-1 py-0.5 rounded bg-[hsl(var(--color-xp)/0.15)] text-[hsl(var(--color-xp))]">DD sort +{item.spellSaveDCBonus}</span>}
                                                        {item.speedBonus && item.speedBonus > 0 && <span className="text-[11px] px-1 py-0.5 rounded bg-magic/10 text-magic">Vit +{item.speedBonus}m</span>}
                                                        {item.abilitySetTo && Object.entries(item.abilitySetTo).map(([k, v]) => (
                                                            <span key={k} className="text-[11px] px-1 py-0.5 rounded bg-magic/10 text-magic">{k.toUpperCase()} → {v}</span>
                                                        ))}
                                                        {item.damageExtra && <span className="text-[11px] px-1 py-0.5 rounded bg-destructive/10 text-destructive">{item.damageExtra}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                        </div>
                    </>
                )}

                {/* Magic Item Detail Modal */}
                {selectedMagicItem && (
                    <MagicItemDetailModal
                        magicItem={selectedMagicItem}
                        onClose={() => setSelectedMagicItem(null)}
                        onAdd={handleAddMagicItem}
                        onError={onError}
                    />
                )}

                {/* Close button for catalog tabs */}
                {catalogTab !== 'manual' && (
                    <button onClick={() => onClose()} className="btn btn-secondary w-full mt-4">Fermer</button>
                )}
            </div>
        </div>
    )
}
