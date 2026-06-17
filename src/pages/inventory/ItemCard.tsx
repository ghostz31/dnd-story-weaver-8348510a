import {
    StarIcon,
    PlusIcon,
    MinusIcon,
    TrashIcon,
    CheckCircleIcon,
    SparklesIcon,
} from '@heroicons/react/24/solid'
import type { InventoryItem } from '../../types/inventory'
import { itemTypeIcons, rarityColors, rarityLabels } from '../../types/inventory'

interface ItemCardProps {
    item: InventoryItem
    isExpanded: boolean
    onToggleExpand: () => void
    onToggleEquipped: () => void
    onRemove: () => void
    onQuantityChange: (quantity: number) => void
    onToggleAttunement: () => void
    onChargeChange: (charges: number) => void
}

// Composant pour afficher un item
export function ItemCard({
    item,
    isExpanded,
    onToggleExpand,
    onToggleEquipped,
    onRemove,
    onQuantityChange,
    onToggleAttunement,
    onChargeChange,
}: ItemCardProps) {
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
