import { useState } from 'react'
import {
  BoltIcon,
  HandRaisedIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { DiceRollButton } from '../../components/DiceRollButton'
import { formatAttackBonus, type ResolvedAction } from '../../utils/combat-engine'
import { formatResourceMax } from '../../utils/feature-helpers'
import { getActionColor, getActionTypeLabel, formatTagLabel } from './actionStyles'

// ============================================================================
// SOUS-COMPOSANTS — CombatActionCard
// ============================================================================

function parseDamageDice(dice: string): { count: number; sides: number; modifier: number } {
  const match = dice.match(/^(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?$/)
  if (!match) return { count: 1, sides: 6, modifier: 0 }
  const count = parseInt(match[1], 10)
  const sides = parseInt(match[2], 10)
  const sign = match[3] === '-' ? -1 : 1
  const mod = match[4] ? parseInt(match[4], 10) * sign : 0
  return { count, sides, modifier: mod }
}

export function CombatActionCard({ action, onUse, actionsUsedThisTurn }: { action: ResolvedAction; onUse: () => void; actionsUsedThisTurn: { action: boolean; bonus: boolean; reaction: boolean } }) {
  const color = getActionColor(action.actionType)
  const hasResource = action.resource && action.resource.max > 0
  const actionTypeUsed = action.actionType === 'action' || action.actionType === 'bonus' || action.actionType === 'reaction'
    ? actionsUsedThisTurn[action.actionType]
    : false
  const canUse = (!hasResource || (action.resource!.current > 0)) && !actionTypeUsed
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div 
      className="card overflow-hidden hover:shadow-lg transition-shadow"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base truncate">{action.name}</h3>
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0"
                style={{
                  color,
                  backgroundColor: `hsl(from ${color} h s l / 0.12)`,
                }}
              >
                {action.actionType === 'bonus' && <BoltIcon className="w-3 h-3" aria-hidden />}
                {action.actionType === 'reaction' && <HandRaisedIcon className="w-3 h-3" aria-hidden />}
                {getActionTypeLabel(action.actionType)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {action.source.name}
            </p>
          </div>
          {hasResource && (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex gap-[2px] h-2">
                {Array.from({ length: Math.min(action.resource!.max >= 999 ? 8 : action.resource!.max, 8) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-full rounded-full transition-all ${
                      i < action.resource!.current
                        ? 'bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.4)]'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-cinzel font-bold tabular-nums text-primary">
                {action.resource!.current}
              </span>
              <span className="text-[10px] text-muted-foreground">/{formatResourceMax(action.resource!.max)}</span>
            </div>
          )}
        </div>
        
        {/* Stats sur une ligne */}
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          {action.attack && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Toucher</span>
              <span className="text-lg font-bold" style={{ color }}>
                {formatAttackBonus(action.attack.bonus)}
              </span>
              <DiceRollButton
                label={`${action.name} — Toucher`}
                count={1}
                sides={20}
                modifier={action.attack.bonus}
                size="sm"
              />
            </div>
          )}

          {action.damage && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Dégâts</span>
              <span className="text-lg font-bold">{action.damage.dice}</span>
              <span className="text-[10px] text-muted-foreground">({Math.floor(action.damage.average)})</span>
              <DiceRollButton
                label={`${action.name} — Dégâts`}
                {...parseDamageDice(action.damage.dice)}
                size="sm"
              />
            </div>
          )}

          {action.range && (
            <div className="text-xs text-muted-foreground ml-auto shrink-0">
              {action.range.normal}m
            </div>
          )}
        </div>
        
        {/* Tags */}
        {action.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {action.tags.map(tag => (
              <span
                key={tag}
                className="text-[11px] px-1.5 py-0.5 rounded-full bg-muted font-medium"
              >
                {formatTagLabel(tag)}
              </span>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <button
            onClick={onUse}
            disabled={!canUse}
            aria-label={`Utiliser ${action.name}`}
            className={`btn btn-sm flex-1 ${canUse ? 'btn-primary' : 'btn-disabled'}`}
          >
            {canUse ? 'Utiliser' : actionTypeUsed ? 'Utilisé (tour)' : 'Épuisé'}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Réduire les détails' : 'Afficher les détails'}
            aria-expanded={expanded}
            className="btn btn-ghost btn-sm px-3"
          >
            {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Détails expansibles */}
        {expanded && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">{action.description}</p>
            {action.attack && (
              <div className="mt-2 text-[10px] text-muted-foreground">
                <p>Caractéristique: {action.attack.breakdown.baseAbility.label} ({action.attack.breakdown.baseAbility.modifier >= 0 ? '+' : ''}{action.attack.breakdown.baseAbility.modifier})</p>
                {action.attack.breakdown.proficiency.has && (
                  <p>Maîtrise: +{action.attack.breakdown.proficiency.bonus}</p>
                )}
                {action.attack.breakdown.magicBonus.total > 0 && (
                  <p>Bonus magique: +{action.attack.breakdown.magicBonus.total}</p>
                )}
                {action.attack.breakdown.featBonus.total > 0 && (
                  <p>Bonus dons: +{action.attack.breakdown.featBonus.total}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
