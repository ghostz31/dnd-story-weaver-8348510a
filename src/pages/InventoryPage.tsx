import { useState, useEffect } from 'react'
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
    XMarkIcon,
} from '@heroicons/react/24/solid'
import { useCharacter } from '../contexts/CharacterContext'
import { Breadcrumb } from '../components/Breadcrumb'
import { EmptyState } from '../components/ui/EmptyState'
import type { InventoryItem, ItemType, Currency, ItemRarity } from '../types/inventory'
import {
    itemTypeIcons,
    rarityColors,
    rarityLabels,
    calculateTotalWeight,
    calculateCarryingCapacity,
    MAX_ATTUNED_ITEMS,
} from '../types/inventory'
import { weapons, armors, gear, armorCategoryLabels, weaponPropertyLabels } from '../data/equipment'
import type { CatalogWeapon, CatalogArmor, CatalogGear, WeaponProperty } from '../data/equipment'
import { convertTrameItemToInventory, type TrameMagicItem } from '../data/magicItemBonuses'

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
        updateItemCharges,
        getAttunedCount,
        getCalculatedAC,
    } = useCharacter()

    const [showAddModal, setShowAddModal] = useState(false)
    const [showCurrencyModal, setShowCurrencyModal] = useState(false)
    const [attunementWarning, setAttunementWarning] = useState(false)
    const [catalogTab, setCatalogTab] = useState<'manual' | 'weapons' | 'armor' | 'gear' | 'magic'>('manual')
    const [catalogSearch, setCatalogSearch] = useState('')
    const [trameItems, setTrameItems] = useState<TrameMagicItem[]>([])
    const [trameLoading, setTrameLoading] = useState(false)
    const [trameLoaded, setTrameLoaded] = useState(false)
    const [trameFilterType, setTrameFilterType] = useState<string>('')
    const [trameFilterRarity, setTrameFilterRarity] = useState<string>('')
    const [selectedMagicItem, setSelectedMagicItem] = useState<TrameMagicItem | null>(null)
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

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
    const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
        name: '',
        type: 'gear',
        quantity: 1,
        weight: 0,
        equipped: false,
        magical: false,
    })
    const [editingCurrency, setEditingCurrency] = useState<Currency>({ pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 })
    const [addError, setAddError] = useState<string | null>(null)

    const handleToggleAttunement = async (itemId: string) => {
        const inventory = character?.inventory || { items: [] }
        const item = inventory.items.find(i => i.id === itemId)
        if (!item) return
        if (!item.attuned && getAttunedCount() >= 3) {
            setAttunementWarning(true)
            setTimeout(() => setAttunementWarning(false), 3000)
            return
        }
        await toggleAttunement(itemId)
    }

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
            setShowAddModal(false)
            setAddError(null)
        } catch (err) {
            console.error('Error adding item:', err)
            setAddError('Erreur lors de l\'ajout de l\'objet')
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
        setAddError(null)
        } catch (err) {
            console.error('Error adding from catalog:', err)
            setAddError('Erreur lors de l\'ajout de l\'objet')
        }
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
                    <Breadcrumb items={[{ label: character.name, to: `/character/${character.id}` }, { label: 'Inventaire' }]} />
                    <h1 className="font-cinzel text-2xl font-bold flex items-center gap-2">
                        <ArchiveBoxIcon className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                        Inventaire
                    </h1>
                    <p className="text-sm text-ink-muted">{character.name}</p>
                </div>
            </header>

            {/* Attunement Slots */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Harmonisation</span>
                <div className="flex gap-1">
                    {Array.from({ length: MAX_ATTUNED_ITEMS }, (_, i) => {
                        const attunedItems = items.filter(it => it.attuned)
                        return (
                            <div key={i} className={`w-5 h-5 rounded-full border-2 ${i < attunedItems.length ? 'bg-magic border-magic/60' : 'bg-muted border-muted-foreground/50'}`} />
                        )
                    })}
                </div>
                <span className="text-sm text-muted-foreground">{items.filter(it => it.attuned).length}/{MAX_ATTUNED_ITEMS}</span>
            </div>

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

            {/* Attunement Warning */}
            {attunementWarning && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center text-sm text-destructive">
                    Harmonisation maximale atteinte (3/3). Désactivez un objet harmonisé d'abord.
                </div>
            )}

            {/* Add Error */}
            {addError && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center text-sm text-destructive">
                    {addError}
                    <button onClick={() => setAddError(null)} className="ml-2 underline">Fermer</button>
                </div>
            )}

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
                                isExpanded={expandedItemId === item.id}
                                onToggleExpand={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                                onToggleEquipped={() => toggleEquipped(item.id)}
                                onRemove={() => removeItem(item.id)}
                                onQuantityChange={(q) => updateItemQuantity(item.id, q)}
                                onToggleAttunement={() => handleToggleAttunement(item.id)}
                                onChargeChange={(charges) => updateItemCharges(item.id, charges)}
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
                                isExpanded={expandedItemId === item.id}
                                onToggleExpand={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                                onToggleEquipped={() => toggleEquipped(item.id)}
                                onRemove={() => removeItem(item.id)}
                                onQuantityChange={(q) => updateItemQuantity(item.id, q)}
                                onToggleAttunement={() => handleToggleAttunement(item.id)}
                                onChargeChange={(charges) => updateItemCharges(item.id, charges)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<ArchiveBoxIcon className="w-8 h-8" />}
                        title="Sac vide"
                        description="Ajoutez des objets via le bouton ci-dessous."
                        action={{ label: 'Ajouter un objet', onClick: () => setShowAddModal(true) }}
                    />
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
                        {selectedMagicItem && (() => {
                            const m = selectedMagicItem
                            const item = convertTrameItemToInventory(m)
                            const rColor = rarityColors[item.rarity || 'common']
                            return (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]" onClick={() => setSelectedMagicItem(null)}>
                                    <div className="card w-full max-w-md p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-cinzel text-lg font-bold" style={{ color: rColor }}>{m.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs italic" style={{ color: rColor }}>
                                                        {item.rarity === 'common' ? 'Commun' : item.rarity === 'uncommon' ? 'Peu commun' : item.rarity === 'rare' ? 'Rare' : item.rarity === 'very-rare' ? 'Très rare' : item.rarity === 'legendary' ? 'Légendaire' : item.rarity === 'artifact' ? 'Artéfact' : item.rarity}
                                                    </span>
                                                    {m.type && <span className="text-xs text-muted-foreground">• {m.type}</span>}
                                                    {m.attunement && <span className="text-[10px] px-1.5 py-0.5 rounded bg-magic/10 text-magic font-medium">Harmonisation{m.attunementDetails ? ` (${m.attunementDetails})` : ''}</span>}
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedMagicItem(null)} className="p-1 rounded hover:bg-muted"><XMarkIcon className="w-5 h-5 text-muted-foreground" /></button>
                                        </div>

                                        {/* Image */}
                                        {m.imageUrl && (
                                            <div className="mb-3 flex justify-center">
                                                <img src={m.imageUrl} alt={m.name} className="max-h-48 rounded-lg object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                            </div>
                                        )}

                                        {/* Bonus badges */}
                                        {(item.attackBonus || item.damageBonus || item.acBonus || item.saveBonus || item.spellAttackBonus || item.spellSaveDCBonus || item.speedBonus || item.abilitySetTo || item.damageExtra) && (
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {item.attackBonus && <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">Attaque +{item.attackBonus}</span>}
                                                {item.damageBonus && <span className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive font-medium">Dégâts +{item.damageBonus}</span>}
                                                {item.acBonus && <span className="text-xs px-2 py-1 rounded bg-ac/10 text-ac font-medium">CA +{item.acBonus}</span>}
                                                {item.saveBonus && <span className="text-xs px-2 py-1 rounded bg-hp-high/10 text-hp-high font-medium">JDS +{item.saveBonus}</span>}
                                                {item.spellAttackBonus && <span className="text-xs px-2 py-1 rounded bg-[hsl(var(--color-xp)/0.15)] text-[hsl(var(--color-xp))] font-medium">Attaque sort +{item.spellAttackBonus}</span>}
                                                {item.spellSaveDCBonus && <span className="text-xs px-2 py-1 rounded bg-[hsl(var(--color-xp)/0.15)] text-[hsl(var(--color-xp))] font-medium">DD sort +{item.spellSaveDCBonus}</span>}
                                                {item.speedBonus && item.speedBonus > 0 && <span className="text-xs px-2 py-1 rounded bg-magic/10 text-magic font-medium">Vitesse +{item.speedBonus}m</span>}
                                                {item.abilitySetTo && Object.entries(item.abilitySetTo).map(([k, v]) => (
                                                    <span key={k} className="text-xs px-2 py-1 rounded bg-magic/10 text-magic font-medium">{k.toUpperCase()} → {v}</span>
                                                ))}
                                                {item.damageExtra && <span className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive font-medium">+{item.damageExtra}</span>}
                                            </div>
                                        )}

                                        {/* Description */}
                                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{m.description}</p>

                                        {m.source && <p className="text-[10px] text-muted-foreground mt-3">Source : {m.source}</p>}

                                        {/* Add button */}
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await addItem(item)
                                                    setSelectedMagicItem(null)
                                                    setAddError(null)
                                                } catch (err) {
                                                    console.error('Error adding magic item:', err)
                                                    setAddError('Erreur lors de l\'ajout de l\'objet')
                                                }
                                            }}
                                            className="btn btn-primary w-full mt-4"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Ajouter à l'inventaire
                                        </button>
                                    </div>
                                </div>
                            )
                        })()}

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
    isExpanded,
    onToggleExpand,
    onToggleEquipped,
    onRemove,
    onQuantityChange,
    onToggleAttunement,
    onChargeChange,
}: {
    item: InventoryItem
    isExpanded: boolean
    onToggleExpand: () => void
    onToggleEquipped: () => void
    onRemove: () => void
    onQuantityChange: (quantity: number) => void
    onToggleAttunement: () => void
    onChargeChange: (charges: number) => void
}) {
    return (
        <div
            className="card p-3"
            style={item.magical ? {
                borderColor: item.rarity ? `${rarityColors[item.rarity]}50` : 'hsl(var(--color-xp) / 0.5)',
                background: item.rarity ? `${rarityColors[item.rarity]}08` : 'hsl(var(--color-xp) / 0.05)'
            } : {}}
        >
            <div className="flex items-center gap-3 cursor-pointer" onClick={onToggleExpand}>
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
                    {(item.attackBonus || item.damageBonus || item.acBonus || item.saveBonus) && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                            {item.attackBonus && <span className="text-[10px] px-1 py-0.5 rounded bg-primary/10 text-primary font-medium">Atk +{item.attackBonus}</span>}
                            {item.damageBonus && <span className="text-[10px] px-1 py-0.5 rounded bg-destructive/10 text-destructive font-medium">Dég +{item.damageBonus}</span>}
                            {item.acBonus && <span className="text-[10px] px-1 py-0.5 rounded bg-ac/10 text-ac font-medium">CA +{item.acBonus}</span>}
                            {item.saveBonus && <span className="text-[10px] px-1 py-0.5 rounded bg-hp-high/10 text-hp-high font-medium">JDS +{item.saveBonus}</span>}
                        </div>
                    )}
                    {item.charges !== undefined && item.maxCharges !== undefined && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-ink-muted">Charges :</span>
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: item.maxCharges }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            const newCharges = i < item.charges! ? Math.max(0, item.charges! - (item.charges! - i - 1)) : i + 1
                                            onChargeChange(Math.min(newCharges, item.maxCharges!))
                                        }}
                                        className={`w-2 h-2 rounded-full transition-colors ${i < (item.charges || 0)
                                            ? 'bg-[hsl(var(--color-xp))]'
                                            : 'bg-muted-foreground/20'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold tabular-nums text-[hsl(var(--color-xp))]">{item.charges}/{item.maxCharges}</span>
                        </div>
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

                {/* Always-visible actions */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onToggleEquipped}
                        className="p-1.5 rounded-lg border transition-all"
                        style={{
                            borderColor: item.equipped ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                            background: item.equipped ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                        }}
                        title={item.equipped ? 'Déséquiper' : 'Équiper'}
                    >
                        <CheckCircleIcon className="w-4 h-4" style={{ color: item.equipped ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }} />
                    </button>
                    {item.magical && item.attunement && (
                        <button
                            onClick={onToggleAttunement}
                            className="p-1.5 rounded-lg border transition-all"
                            style={{
                                borderColor: item.attuned ? 'hsl(var(--color-xp))' : 'hsl(var(--border))',
                                background: item.attuned ? 'hsl(var(--color-xp) / 0.1)' : 'transparent',
                            }}
                            title={item.attuned ? 'Désharmoniser' : 'Harmoniser'}
                        >
                            <SparklesIcon className="w-4 h-4" style={{ color: item.attuned ? 'hsl(var(--color-xp))' : 'hsl(var(--muted-foreground))' }} />
                        </button>
                    )}
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
                        onClick={onRemove}
                        className="p-1 rounded bg-destructive/20 hover:bg-destructive/30"
                    >
                        <TrashIcon className="w-4 h-4 text-destructive" />
                    </button>
                </div>
            </div>

            {/* Expanded Detail View */}
            {isExpanded && (
                <div className="ml-4 mt-2 space-y-2 border-t pt-2" style={{ borderColor: 'hsl(var(--border))' }}>
                    {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    {item.specialAbilities && item.specialAbilities.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capacités spéciales</h4>
                            {item.specialAbilities.map((ability, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1">
                                    <div>
                                        <span className="text-sm font-medium text-yellow-400">{ability.name}</span>
                                        {ability.activationType && (
                                            <span className="text-xs text-muted-foreground ml-2">
                                                ({ability.activationType})
                                            </span>
                                        )}
                                        <p className="text-xs text-muted-foreground">{ability.description}</p>
                                    </div>
                                    {ability.usesPerRest && (
                                        <span className="text-xs text-muted-foreground">
                                            {ability.usesRemaining ?? 0}/{ability.usesPerRest}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {item.equipped && (item.acBonus || item.attackBonus || item.damageBonus || item.saveBonus || item.abilityBonus) && (
                        <div className="flex flex-wrap gap-2">
                            {item.acBonus && <span className="text-xs bg-ac/20 text-ac/80 px-2 py-0.5 rounded">CA +{item.acBonus}</span>}
                            {item.attackBonus && <span className="text-xs bg-hp-crit/20 text-hp-crit/80 px-2 py-0.5 rounded">Attaque +{item.attackBonus}</span>}
                            {item.damageBonus && <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded">Dégâts +{item.damageBonus}</span>}
                            {item.saveBonus && <span className="text-xs bg-hp-high/20 text-hp-high/80 px-2 py-0.5 rounded">JDS +{item.saveBonus}</span>}
                            {item.abilityBonus && Object.entries(item.abilityBonus).map(([key, val]) => (
                                <span key={key} className="text-xs bg-magic/20 text-magic/80 px-2 py-0.5 rounded">
                                    {key.toUpperCase()} +{val}
                                </span>
                            ))}
                        </div>
                    )}
                    {item.damage && (
                        <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Dégâts :</span> {item.damage}{item.damageType ? ` ${item.damageType}` : ''}{item.versatileDamage ? ` (polyvalent ${item.versatileDamage})` : ''}
                        </div>
                    )}
                    {item.armorClass && (
                        <div className="text-xs text-muted-foreground">
                            <span className="font-medium">CA :</span> {item.armorClass}{item.addDex ? ' + DEX' : ''}{item.maxDex ? ` (max ${item.maxDex})` : ''}{item.stealthDisadvantage ? ' • Désavantage furtivité' : ''}
                        </div>
                    )}
                    {item.range && (
                        <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Portée :</span> {typeof item.range === 'string' ? item.range : `${item.range.normal}/${item.range.long} m`}
                        </div>
                    )}
                    {item.value !== undefined && (
                        <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Valeur :</span> {item.value} PO
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
