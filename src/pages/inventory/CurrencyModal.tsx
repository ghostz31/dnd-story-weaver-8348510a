import { useState } from 'react'
import { useCharacter } from '../../contexts/CharacterContext'
import type { Currency } from '../../types/inventory'

interface CurrencyModalProps {
    currency: Currency
    onClose: () => void
}

export function CurrencyModal({ currency, onClose }: CurrencyModalProps) {
    const { updateCurrency } = useCharacter()
    const [editingCurrency, setEditingCurrency] = useState<Currency>({ ...currency })

    const handleSaveCurrency = async () => {
        await updateCurrency(editingCurrency)
        onClose()
    }

    return (
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
                        onClick={onClose}
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
    )
}
