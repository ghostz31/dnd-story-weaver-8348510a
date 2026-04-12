import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ChevronLeftIcon,
    PlusIcon,
    TrashIcon,
    FireIcon,
} from '@heroicons/react/24/solid'
import { useCharacter } from '../contexts/CharacterContext'
import type { Attack, AttackType, DamageType } from '../types/combat'
import {
    baseWeapons,
    damageTypeLabels,
    damageTypeIcons,
    attackTypeLabels,
} from '../types/combat'

export function CombatPage() {
    const {
        character,
        addAttack,
        removeAttack,
        getAttackBonus,
        getDamageBonus,
        proficiencyBonus,
        getCalculatedAC,
    } = useCharacter()

    const [showAddModal, setShowAddModal] = useState(false)
    const [showWeaponPicker, setShowWeaponPicker] = useState(false)
    const [newAttack, setNewAttack] = useState<Partial<Attack>>({
        name: '',
        type: 'melee',
        ability: 'str',
        isProficient: true,
        damageRoll: '1d8',
        damageType: 'slashing',
    })

    if (!character) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-ink-muted mb-4">Sélectionnez d'abord un personnage</p>
                <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
            </div>
        )
    }

    const attacks = character.attacks || []

    // Armes équipées depuis l'inventaire
    const equippedWeapons = (character.inventory?.items || []).filter(
        item => item.type === 'weapon' && item.equipped && item.damage
    )

    const handleAddAttack = async () => {
        if (!newAttack.name?.trim()) return
        await addAttack(newAttack as Omit<Attack, 'id'>)
        setNewAttack({
            name: '',
            type: 'melee',
            ability: 'str',
            isProficient: true,
            damageRoll: '1d8',
            damageType: 'slashing',
        })
        setShowAddModal(false)
    }

    const handleSelectWeapon = (weapon: typeof baseWeapons[0]) => {
        setNewAttack({
            ...weapon,
            isProficient: true,
        })
        setShowWeaponPicker(false)
        setShowAddModal(true)
    }

    const formatBonus = (bonus: number) => bonus >= 0 ? `+${bonus}` : `${bonus}`

    return (
        <div className="flex flex-col gap-4 animate-fade-in pb-8">
            {/* Header */}
            <header className="flex items-center gap-3 mb-2">
                <Link to={`/character/${character.id}`} className="touch-target -ml-2">
                    <ChevronLeftIcon className="w-6 h-6" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </Link>
                <div className="flex-1">
                    <h1 className="font-cinzel text-2xl font-bold flex items-center gap-2">
                        <FireIcon className="w-6 h-6" style={{ color: 'hsl(var(--color-hp))' }} />
                        Combat
                    </h1>
                    <p className="text-sm text-ink-muted">{character.name}</p>
                </div>
            </header>

            {/* Stats résumé */}
            <div className="card">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div
                            className="text-2xl font-cinzel font-bold"
                            style={{ color: 'hsl(var(--primary))' }}
                        >
                            {getCalculatedAC()}
                        </div>
                        <div className="text-xs text-ink-muted">CA</div>
                    </div>
                    <div>
                        <div
                            className="text-2xl font-cinzel font-bold"
                            style={{ color: 'hsl(var(--color-hp))' }}
                        >
                            {character.currentHp ?? character.hp}/{character.hp}
                        </div>
                        <div className="text-xs text-ink-muted">PV</div>
                    </div>
                    <div>
                        <div
                            className="text-2xl font-cinzel font-bold"
                            style={{ color: 'hsl(var(--secondary))' }}
                        >
                            +{proficiencyBonus}
                        </div>
                        <div className="text-xs text-ink-muted">Maîtrise</div>
                    </div>
                </div>
            </div>

            {/* Attaques */}
            <section>
                <h2 className="font-cinzel text-lg font-semibold mb-3 flex items-center gap-2">
                    <span style={{ color: 'hsl(var(--color-hp))' }}>◆</span>
                    Attaques
                    <span className="text-sm font-normal text-ink-muted">({attacks.length})</span>
                </h2>

                {attacks.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {attacks.map((attack) => {
                            const atkBonus = getAttackBonus(attack)
                            const dmgBonus = getDamageBonus(attack)

                            return (
                                <div
                                    key={attack.id}
                                    className="card p-4"
                                    style={attack.magical ? {
                                        borderColor: 'hsl(var(--color-xp) / 0.5)',
                                        background: 'hsl(var(--color-xp) / 0.05)'
                                    } : {}}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{damageTypeIcons[attack.damageType]}</span>
                                                <span className={`font-semibold ${attack.magical ? 'text-[hsl(var(--color-xp))]' : ''}`}>
                                                    {attack.name}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded" style={{
                                                    background: 'hsl(var(--muted))',
                                                    color: 'hsl(var(--muted-foreground))'
                                                }}>
                                                    {attackTypeLabels[attack.type]}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm">
                                                <div>
                                                    <span className="text-ink-muted">Attaque : </span>
                                                    <span
                                                        className="font-bold"
                                                        style={{ color: 'hsl(var(--primary))' }}
                                                    >
                                                        {formatBonus(atkBonus)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-ink-muted">Dégâts : </span>
                                                    <span
                                                        className="font-bold"
                                                        style={{ color: 'hsl(var(--color-hp))' }}
                                                    >
                                                        {attack.damageRoll}{dmgBonus !== 0 ? formatBonus(dmgBonus) : ''}
                                                    </span>
                                                    <span className="text-ink-muted ml-1">
                                                        {damageTypeLabels[attack.damageType]}
                                                    </span>
                                                </div>
                                            </div>

                                            {attack.range && (
                                                <div className="text-xs text-ink-muted mt-1">
                                                    Portée : {attack.range}
                                                </div>
                                            )}

                                            {attack.properties && attack.properties.length > 0 && (
                                                <div className="text-xs text-ink-muted mt-1">
                                                    {attack.properties.join(', ')}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => removeAttack(attack.id)}
                                            className="p-2 rounded bg-red-500/20 hover:bg-red-500/30"
                                        >
                                            <TrashIcon className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="card text-center py-8 text-ink-muted">
                        Aucune attaque configurée
                    </div>
                )}
            </section>

            {/* Armes équipées depuis l'inventaire */}
            {equippedWeapons.length > 0 && (
                <section>
                    <h2 className="font-cinzel text-lg font-semibold mb-3 flex items-center gap-2">
                        <span style={{ color: 'hsl(var(--secondary))' }}>◆</span>
                        Armes équipées
                        <span className="text-sm font-normal text-ink-muted">({equippedWeapons.length})</span>
                    </h2>
                    <div className="flex flex-col gap-2">
                        {equippedWeapons.map((weapon) => {
                            // Déterminer la caractéristique (finesse = DEX possible, sinon STR pour melee, DEX pour ranged)
                            const hasFinesse = weapon.properties?.some(p => p.toLowerCase().includes('finesse'))
                            const isRanged = weapon.properties?.some(p =>
                                p.toLowerCase().includes('munitions') ||
                                p.toLowerCase().includes('lancer')
                            ) || (weapon.range && !weapon.properties?.some(p => p.toLowerCase().includes('lancer')))

                            const strMod = Math.floor((character.abilityScores.str - 10) / 2)
                            const dexMod = Math.floor((character.abilityScores.dex - 10) / 2)

                            // Pour les armes finesse, prendre le meilleur mod
                            let abilityMod = isRanged ? dexMod : strMod
                            if (hasFinesse) {
                                abilityMod = Math.max(strMod, dexMod)
                            }

                            const atkBonus = abilityMod + proficiencyBonus
                            const dmgBonus = abilityMod

                            return (
                                <div
                                    key={weapon.id}
                                    className="card p-4"
                                    style={weapon.magical ? {
                                        borderColor: 'hsl(var(--color-xp) / 0.5)',
                                        background: 'hsl(var(--color-xp) / 0.05)'
                                    } : {}}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">
                                                    {damageTypeIcons[weapon.damageType as DamageType] || '⚔️'}
                                                </span>
                                                <span className={`font-semibold ${weapon.magical ? 'text-[hsl(var(--color-xp))]' : ''}`}>
                                                    {weapon.name}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded" style={{
                                                    background: 'hsl(var(--secondary) / 0.2)',
                                                    color: 'hsl(var(--secondary))'
                                                }}>
                                                    Équipée
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm">
                                                <div>
                                                    <span className="text-ink-muted">Attaque : </span>
                                                    <span
                                                        className="font-bold"
                                                        style={{ color: 'hsl(var(--primary))' }}
                                                    >
                                                        {atkBonus >= 0 ? `+${atkBonus}` : atkBonus}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-ink-muted">Dégâts : </span>
                                                    <span
                                                        className="font-bold"
                                                        style={{ color: 'hsl(var(--color-hp))' }}
                                                    >
                                                        {weapon.damage}{dmgBonus !== 0 ? (dmgBonus >= 0 ? `+${dmgBonus}` : dmgBonus) : ''}
                                                    </span>
                                                    <span className="text-ink-muted ml-1">
                                                        {damageTypeLabels[weapon.damageType as DamageType] || weapon.damageType}
                                                    </span>
                                                </div>
                                            </div>

                                            {weapon.range && (
                                                <div className="text-xs text-ink-muted mt-1">
                                                    Portée : {typeof weapon.range === 'object'
                                                        ? `${weapon.range.normal}/${weapon.range.long} m`
                                                        : weapon.range}
                                                </div>
                                            )}

                                            {weapon.properties && weapon.properties.length > 0 && (
                                                <div className="text-xs text-ink-muted mt-1">
                                                    {weapon.properties.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Boutons d'ajout */}
            <div className="flex gap-2">
                <button
                    onClick={() => setShowWeaponPicker(true)}
                    className="btn btn-secondary flex-1"
                >
                    Choisir une arme
                </button>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary flex-1"
                >
                    <PlusIcon className="w-5 h-5" />
                    Personnalisée
                </button>
            </div>

            {/* Weapon Picker Modal */}
            {showWeaponPicker && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="card w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
                        <h2 className="font-cinzel text-xl font-bold mb-4">Choisir une arme</h2>

                        <div className="space-y-2">
                            {baseWeapons.map((weapon, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectWeapon(weapon)}
                                    className="w-full card p-3 text-left hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{damageTypeIcons[weapon.damageType]}</span>
                                        <div className="flex-1">
                                            <div className="font-semibold">{weapon.name}</div>
                                            <div className="text-xs text-ink-muted">
                                                {weapon.damageRoll} {damageTypeLabels[weapon.damageType]}
                                                {weapon.range && ` • ${weapon.range}`}
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded" style={{
                                            background: 'hsl(var(--muted))'
                                        }}>
                                            {attackTypeLabels[weapon.type]}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowWeaponPicker(false)}
                            className="btn btn-secondary w-full mt-4"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Add Attack Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="font-cinzel text-xl font-bold mb-4">
                            {newAttack.name ? `Configurer : ${newAttack.name}` : 'Nouvelle attaque'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nom *</label>
                                <input
                                    type="text"
                                    value={newAttack.name || ''}
                                    onChange={(e) => setNewAttack({ ...newAttack, name: e.target.value })}
                                    className="input w-full"
                                    placeholder="Épée longue"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        value={newAttack.type}
                                        onChange={(e) => setNewAttack({ ...newAttack, type: e.target.value as AttackType })}
                                        className="input w-full"
                                    >
                                        <option value="melee">Corps à corps</option>
                                        <option value="ranged">À distance</option>
                                        <option value="spell">Sort</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Caractéristique</label>
                                    <select
                                        value={newAttack.ability}
                                        onChange={(e) => setNewAttack({ ...newAttack, ability: e.target.value as Attack['ability'] })}
                                        className="input w-full"
                                    >
                                        <option value="str">Force</option>
                                        <option value="dex">Dextérité</option>
                                        <option value="int">Intelligence</option>
                                        <option value="wis">Sagesse</option>
                                        <option value="cha">Charisme</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Dés de dégâts</label>
                                    <input
                                        type="text"
                                        value={newAttack.damageRoll || ''}
                                        onChange={(e) => setNewAttack({ ...newAttack, damageRoll: e.target.value })}
                                        className="input w-full"
                                        placeholder="1d8"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Type de dégâts</label>
                                    <select
                                        value={newAttack.damageType}
                                        onChange={(e) => setNewAttack({ ...newAttack, damageType: e.target.value as DamageType })}
                                        className="input w-full"
                                    >
                                        {Object.entries(damageTypeLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Portée (optionnel)</label>
                                <input
                                    type="text"
                                    value={newAttack.range || ''}
                                    onChange={(e) => setNewAttack({ ...newAttack, range: e.target.value })}
                                    className="input w-full"
                                    placeholder="9/36 m"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newAttack.isProficient}
                                        onChange={(e) => setNewAttack({ ...newAttack, isProficient: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Maîtrise</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newAttack.magical}
                                        onChange={(e) => setNewAttack({ ...newAttack, magical: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Magique</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false)
                                    setNewAttack({
                                        name: '',
                                        type: 'melee',
                                        ability: 'str',
                                        isProficient: true,
                                        damageRoll: '1d8',
                                        damageType: 'slashing',
                                    })
                                }}
                                className="btn btn-secondary flex-1"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddAttack}
                                disabled={!newAttack.name?.trim()}
                                className="btn btn-primary flex-1"
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
