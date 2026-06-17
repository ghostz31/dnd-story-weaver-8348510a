import { DiceRollButton } from '../DiceRollButton'
import type { Attack } from '../../types/combat'

function parseDamageDice(dice: string): { count: number; sides: number; modifier: number } {
    const match = dice.match(/^(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?$/)
    if (!match) return { count: 1, sides: 6, modifier: 0 }
    const count = parseInt(match[1], 10)
    const sides = parseInt(match[2], 10)
    const sign = match[3] === '-' ? -1 : 1
    const mod = match[4] ? parseInt(match[4], 10) * sign : 0
    return { count, sides, modifier: mod }
}

interface ManualAttacksSectionProps {
    attacks: Attack[]
    proficiencyBonus: number
    getModifier: (ability: 'str' | 'dex' | 'int' | 'wis' | 'cha') => number
}

export function ManualAttacksSection({ attacks, proficiencyBonus, getModifier }: ManualAttacksSectionProps) {
    if (attacks.length === 0) return null

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Attaques manuelles
            </h3>
            {attacks.map(attack => {
                const mod = getModifier(attack.ability)
                const prof = attack.isProficient ? proficiencyBonus : 0
                const bonus = mod + prof + (attack.bonusDamage || 0)
                return (
                    <div key={attack.id} className="card p-3 border-l-4 border-l-muted-foreground">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-sm">{attack.name}</h4>
                                <p className="text-[11px] text-muted-foreground">
                                    {attack.type === 'melee' ? 'Mêlée' : attack.type === 'ranged' ? 'Distance' : 'Sort'}
                                    {attack.range && ` • ${attack.range}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <div className="text-lg font-bold font-cinzel">
                                        {bonus >= 0 ? `+${bonus}` : bonus}
                                    </div>
                                    <DiceRollButton label={`${attack.name} — Toucher`} count={1} sides={20} modifier={bonus} size="sm" />
                                </div>
                                <div className="flex items-center justify-end gap-1">
                                    <div className="text-xs text-muted-foreground">
                                        {attack.damageRoll} {attack.damageType}
                                    </div>
                                    {attack.damageRoll && (
                                        <DiceRollButton label={`${attack.name} — Dégâts`} {...parseDamageDice(attack.damageRoll)} size="sm" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
