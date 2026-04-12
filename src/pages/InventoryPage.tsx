import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArchiveBoxIcon,
    ChevronLeftIcon,
    ScaleIcon,
    CurrencyDollarIcon,
    StarIcon,
    PlusIcon,
    MinusIcon,
    TrashIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
} from '@heroicons/react/24/solid'
import { useCharacter } from '../contexts/CharacterContext'
import type { InventoryItem, ItemType, Currency } from '../types/inventory'
import {
    itemTypeIcons,
    rarityColors,
    rarityLabels,
    calculateTotalWeight,
    calculateCarryingCapacity,
} from '../types/inventory'
import { weapons, armors, gear, armorCategoryLabels } from '../data/equipment'
import type { CatalogWeapon, CatalogArmor, CatalogGear } from '../data/equipment'

export function InventoryPage() {
    const {
        character,
        addItem,
        removeItem,
        toggleEquipped,
        updateItemQuantity,
        updateCurrency,
        getTotalScore,
        toggleAttunement,
        getAttunedCount,
        getCalculatedAC,
    } = useCharacter()

    const [showAddModal, setShowAddModal] = useState(false)
    const [showCurrencyModal, setShowCurrencyModal] = useState(false)
    const [catalogTab, setCatalogTab] = useState<'manual' | 'weapons' | 'armor' | 'gear'>('manual')
    const [catalogSearch, setCatalogSearch] = useState('')
    const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
        name: '',
        type: 'gear',
        quantity: 1,
        weight: 0,
        equipped: false,
        magical: false,
    })
    const [editingCurrency, setEditingCurrency] = useState<Currency>({ pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 })

    if (!character) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-ink-muted mb-4">Sélectionnez d'abord un personnage</p>
                <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
            </div>
        )
    }

    const inventory = character.inventory || { items: [], currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 } }
    const { items, currency } = inventory

    // Calcul encombrement
    const strScore = getTotalScore('str')
    const maxCapacity = calculateCarryingCapacity(strScore)
    const currentWeight = calculateTotalWeight(items, currency)
    const encumbrancePercent = Math.min((currentWeight / maxCapacity) * 100, 100)

    const equippedItems = items.filter(i => i.equipped)
    const carriedItems = items.filter(i => !i.equipped)

    const handleAddItem = async () => {
        if (!newItem.name?.trim()) return

        await addItem(newItem as Omit<InventoryItem, 'id'>)
        setNewItem({
            name: '',
            type: 'gear',
            quantity: 1,
            weight: 0,
            equipped: false,
            magical: false,
        })
        setShowAddModal(false)
    }

    const handleAddFromCatalog = async (type: 'weapon' | 'armor' | 'gear', catalogItem: CatalogWeapon | CatalogArmor | CatalogGear) => {
        let item: Omit<InventoryItem, 'id'>

        if (type === 'weapon') {
            const w = catalogItem as CatalogWeapon
            item = {
                name: w.name,
                type: 'weapon',
                quantity: 1,
                weight: w.weight,
                equipped: false,
                magical: false,
                damage: w.damage,
                damageType: w.damageType,
                properties: w.properties,
                range: w.range,
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
                equipped: false,
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
    }

    const handleSaveCurrency = async () => {
        await updateCurrency(editingCurrency)
        setShowCurrencyModal(false)
    }

    const openCurrencyModal = () => {
        setEditingCurrency({ ...currency })
        setShowCurrencyModal(true)
    }

    return (
        <div className="flex flex-col gap-4 animate-fade-in pb-8">
            {/* Header */}
            <header className="flex items-center gap-3 mb-2">
                <Link to={`/character/${character.id}`} className="touch-target -ml-2">
                    <ChevronLeftIcon className="w-6 h-6" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </Link>
                <div className="flex-1">
                    <h1 className="font-cinzel text-2xl font-bold flex items-center gap-2">
                        <ArchiveBoxIcon className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                        Inventaire
                    </h1>
                    <p className="text-sm text-ink-muted">{character.name}</p>
                </div>
            </header>

            {/* Currency */}
            <button onClick={openCurrencyModal} className="card hover:border-primary/50 transition-colors">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4" style={{ color: 'hsl(var(--color-gold))' }} />
                    Bourse
                </h3>
                <div className="grid grid-cols-5 gap-2 text-center">
                    {[
                        { key: 'pp', label: 'PP', color: '#E5E4E2' },
                        { key: 'gp', label: 'PO', color: '#FFD700' },
                        { key: 'ep', label: 'PE', color: '#C0C0C0' },
                        { key: 'sp', label: 'PA', color: '#C0C0C0' },
                        { key: 'cp', label: 'PC', color: '#B87333' },
                    ].map((coin) => (
                        <div key={coin.key} className="flex flex-col items-center">
                            <div
                                className="w-10 h-10 rounded-full mb-1 flex items-center justify-center font-cinzel font-bold text-sm"
                                style={{
                                    background: `linear-gradient(135deg, ${coin.color}, ${coin.color}80)`,
                                    color: coin.key === 'pp' || coin.key === 'ep' || coin.key === 'sp' ? '#333' : '#000',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.5)'
                                }}
                            >
                                {currency[coin.key as keyof Currency]}
                            </div>
                            <span className="text-xs text-ink-muted">{coin.label}</span>
                        </div>
                    ))}
                </div>
            </button>

            {/* Encumbrance */}
            <div className="card p-3">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold flex items-center gap-2">
                        <ScaleIcon className="w-4 h-4" style={{ color: 'hsl(var(--secondary))' }} />
                        Encombrement
                    </span>
                    <span className="text-ink-muted">
                        {currentWeight} / {maxCapacity} lb
                    </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                    <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${encumbrancePercent}%`,
                            background: encumbrancePercent > 66
                                ? 'hsl(var(--color-hp))'
                                : encumbrancePercent > 33
                                    ? 'hsl(var(--color-gold))'
                                    : 'hsl(var(--secondary))',
                        }}
                    />
                </div>
            </div>

            {/* CA & Attunement */}
            <div className="grid grid-cols-2 gap-3">
                {/* Calculated AC */}
                <div className="card p-3 text-center">
                    <div className="text-2xl font-cinzel font-bold" style={{ color: 'hsl(var(--primary))' }}>
                        {getCalculatedAC()}
                    </div>
                    <div className="text-xs text-ink-muted">Classe d'Armure</div>
                </div>
                {/* Attunement Counter */}
                <div className="card p-3 text-center">
                    <div className="text-2xl font-cinzel font-bold" style={{ color: 'hsl(var(--color-xp))' }}>
                        {getAttunedCount()}/3
                    </div>
                    <div className="text-xs text-ink-muted">Harmonisation</div>
                </div>
            </div>

            {/* Equipped Items */}
            {equippedItems.length > 0 && (
                <section>
                    <h2 className="font-cinzel text-lg font-semibold mb-3 flex items-center gap-2">
                        <span style={{ color: 'hsl(var(--primary))' }}>◆</span>
                        Équipé
                        <span className="text-sm font-normal text-ink-muted">({equippedItems.length})</span>
                    </h2>
                    <div className="flex flex-col gap-2">
                        {equippedItems.map((item) => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onToggleEquipped={() => toggleEquipped(item.id)}
                                onRemove={() => removeItem(item.id)}
                                onQuantityChange={(q) => updateItemQuantity(item.id, q)}
                                onToggleAttunement={() => toggleAttunement(item.id)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Carried Items */}
            <section>
                <h2 className="font-cinzel text-lg font-semibold mb-3 flex items-center gap-2">
                    <span style={{ color: 'hsl(var(--secondary))' }}>◆</span>
                    Sac
                    <span className="text-sm font-normal text-ink-muted">({carriedItems.length})</span>
                </h2>
                {carriedItems.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {carriedItems.map((item) => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onToggleEquipped={() => toggleEquipped(item.id)}
                                onRemove={() => removeItem(item.id)}
                                onQuantityChange={(q) => updateItemQuantity(item.id, q)}
                                onToggleAttunement={() => toggleAttunement(item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-8 text-ink-muted">
                        Votre sac est vide
                    </div>
                )}
            </section>

            {/* Add Item Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary w-full mt-2"
            >
                <PlusIcon className="w-5 h-5" />
                Ajouter un objet
            </button>

            {/* Add Item Modal */}
            {showAddModal && (
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
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => setShowAddModal(false)} className="btn btn-secondary flex-1">Annuler</button>
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

                        {/* Close button for catalog tabs */}
                        {catalogTab !== 'manual' && (
                            <button onClick={() => setShowAddModal(false)} className="btn btn-secondary w-full mt-4">Fermer</button>
                        )}
                    </div>
                </div>
            )}

            {/* Currency Modal */}
            {showCurrencyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="card w-full max-w-sm p-6">
                        <h2 className="font-cinzel text-xl font-bold mb-4">Modifier la bourse</h2>

                        <div className="space-y-3">
                            {[
                                { key: 'pp', label: 'Pièces de platine (PP)' },
                                { key: 'gp', label: 'Pièces d\'or (PO)' },
                                { key: 'ep', label: 'Pièces d\'électrum (PE)' },
                                { key: 'sp', label: 'Pièces d\'argent (PA)' },
                                { key: 'cp', label: 'Pièces de cuivre (PC)' },
                            ].map((coin) => (
                                <div key={coin.key}>
                                    <label className="block text-sm font-medium mb-1">{coin.label}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editingCurrency[coin.key as keyof Currency]}
                                        onChange={(e) => setEditingCurrency({
                                            ...editingCurrency,
                                            [coin.key]: parseInt(e.target.value) || 0
                                        })}
                                        className="input w-full"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setShowCurrencyModal(false)}
                                className="btn btn-secondary flex-1"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSaveCurrency}
                                className="btn btn-primary flex-1"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Composant pour afficher un item
function ItemCard({
    item,
    onToggleEquipped,
    onRemove,
    onQuantityChange,
    onToggleAttunement,
}: {
    item: InventoryItem
    onToggleEquipped: () => void
    onRemove: () => void
    onQuantityChange: (quantity: number) => void
    onToggleAttunement: () => void
}) {
    const [showActions, setShowActions] = useState(false)

    return (
        <div
            className="card p-3 flex items-center gap-3"
            style={item.magical ? {
                borderColor: item.rarity ? `${rarityColors[item.rarity]}50` : 'hsl(var(--color-xp) / 0.5)',
                background: item.rarity ? `${rarityColors[item.rarity]}08` : 'hsl(var(--color-xp) / 0.05)'
            } : {}}
            onClick={() => setShowActions(!showActions)}
        >
            <span className="text-xl">{itemTypeIcons[item.type]}</span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`font-semibold truncate ${item.magical ? 'text-[hsl(var(--color-xp))]' : ''}`}>
                        {item.name}
                    </span>
                    {item.magical && (
                        <StarIcon className="w-4 h-4 flex-shrink-0" style={{ color: item.rarity ? rarityColors[item.rarity] : 'hsl(var(--color-xp))' }} />
                    )}
                </div>
                {item.rarity && (
                    <span className="text-xs" style={{ color: rarityColors[item.rarity] }}>
                        {rarityLabels[item.rarity]}
                    </span>
                )}
                {item.attuned && (
                    <span className="text-xs" style={{ color: 'hsl(var(--color-xp))' }}> • Harmonisé</span>
                )}
            </div>

            {item.quantity > 1 && (
                <span
                    className="px-2 py-0.5 rounded text-sm font-medium"
                    style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
                >
                    x{item.quantity}
                </span>
            )}

            {item.weight > 0 && (
                <span className="text-sm text-ink-muted">{item.weight * item.quantity} lb</span>
            )}

            {/* Actions */}
            {showActions && (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {item.quantity > 1 && (
                        <>
                            <button
                                onClick={() => onQuantityChange(item.quantity - 1)}
                                className="p-1 rounded bg-muted hover:bg-muted/80"
                            >
                                <MinusIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onQuantityChange(item.quantity + 1)}
                                className="p-1 rounded bg-muted hover:bg-muted/80"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    <button
                        onClick={onToggleEquipped}
                        className="p-1 rounded bg-primary/20 hover:bg-primary/30"
                        title={item.equipped ? 'Déséquiper' : 'Équiper'}
                    >
                        <CheckCircleIcon className="w-4 h-4" style={{ color: item.equipped ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }} />
                    </button>
                    {item.magical && item.attunement && (
                        <button
                            onClick={onToggleAttunement}
                            className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/30"
                            title={item.attuned ? 'Désharmoniser' : 'Harmoniser'}
                        >
                            <SparklesIcon className="w-4 h-4" style={{ color: item.attuned ? 'hsl(var(--color-xp))' : 'hsl(var(--muted-foreground))' }} />
                        </button>
                    )}
                    <button
                        onClick={onRemove}
                        className="p-1 rounded bg-red-500/20 hover:bg-red-500/30"
                    >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            )}
        </div>
    )
}
