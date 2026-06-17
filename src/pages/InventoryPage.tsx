import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArchiveBoxIcon,
    ChevronLeftIcon,
    ScaleIcon,
    CurrencyDollarIcon,
    PlusIcon,
} from '@heroicons/react/24/solid'
import { useCharacter } from '../contexts/CharacterContext'
import { Breadcrumb } from '../components/Breadcrumb'
import { EmptyState } from '../components/ui/EmptyState'
import type { Currency } from '../types/inventory'
import {
    calculateTotalWeight,
    calculateCarryingCapacity,
    MAX_ATTUNED_ITEMS,
} from '../types/inventory'
import { ItemCard } from './inventory/ItemCard'
import { AddItemModal } from './inventory/AddItemModal'
import { CurrencyModal } from './inventory/CurrencyModal'

export function InventoryPage() {
    const {
        character,
        removeItem,
        toggleEquipped,
        updateItemQuantity,
        getTotalScore,
        toggleAttunement,
        updateItemCharges,
        getAttunedCount,
        getCalculatedAC,
    } = useCharacter()

    const [showAddModal, setShowAddModal] = useState(false)
    const [showCurrencyModal, setShowCurrencyModal] = useState(false)
    const [attunementWarning, setAttunementWarning] = useState(false)
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
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

    const openCurrencyModal = () => {
        setShowCurrencyModal(true)
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
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onError={setAddError}
                />
            )}

            {/* Currency Modal */}
            {showCurrencyModal && (
                <CurrencyModal
                    currency={currency}
                    onClose={() => setShowCurrencyModal(false)}
                />
            )}
        </div>
    )
}
