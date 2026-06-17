import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid'
import type { InventoryItem } from '../../types/inventory'
import { rarityColors } from '../../types/inventory'
import { convertTrameItemToInventory, type TrameMagicItem } from '../../data/magicItemBonuses'

interface MagicItemDetailModalProps {
    magicItem: TrameMagicItem
    onClose: () => void
    onAdd: (item: Omit<InventoryItem, 'id'>) => Promise<void>
    onError: (message: string | null) => void
}

export function MagicItemDetailModal({ magicItem, onClose, onAdd, onError }: MagicItemDetailModalProps) {
    const m = magicItem
    const item = convertTrameItemToInventory(m)
    const rColor = rarityColors[item.rarity || 'common']

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]" onClick={onClose}>
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
                    <button onClick={onClose} className="p-1 rounded hover:bg-muted"><XMarkIcon className="w-5 h-5 text-muted-foreground" /></button>
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
                            await onAdd(item)
                            onClose()
                        } catch (err) {
                            console.error('Error adding magic item:', err)
                            onError('Erreur lors de l\'ajout de l\'objet')
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
}
