/**
 * Combat Action Card Component
 * 
 * Architecture visuelle hiérarchisée:
 * 1. PRIMAIRE: Nom + Gros chiffres (Bonus/Dégâts)
 * 2. SECONDAIRE: Portée + Ressources
 * 3. TERTIAIRE: Tags (Pills/Badges)
 * 4. DÉTAILS: Description accordéon
 */

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import type { ResolvedAction } from '../../utils/combat-engine'
import { formatAttackBonus, getActionColor, getTagColor } from '../../utils/combat-engine'
import { formatResourceMax } from '../../utils/feature-helpers'

interface ActionCardProps {
  action: ResolvedAction
  onUse?: () => void
  disabled?: boolean
  isExpanded?: boolean
}

export function ActionCard({ action, onUse, disabled = false, isExpanded = false }: ActionCardProps) {
  const [expanded, setExpanded] = useState(isExpanded)
  
  const actionColor = getActionColor(action.actionType)
  const hasAttack = !!action.attack
  const hasDamage = !!action.damage
  const hasResource = !!action.resource && action.resource.max > 0
  const hasRange = !!action.range
  
  return (
    <div 
      className={`
        relative overflow-hidden rounded-lg border-2 transition-all duration-200
        ${disabled ? 'opacity-50 grayscale' : 'hover:shadow-lg'}
      `}
      style={{ borderColor: actionColor + '40' }}  // 40 = 25% opacity
    >
      {/* Bandeau de couleur en haut */}
      <div 
        className="h-1 w-full"
        style={{ backgroundColor: actionColor }}
      />
      
      <div className="bg-card p-4">
        {/* HEADER: Nom + Type d'action */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-foreground truncate">
                {action.name}
              </h3>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-medium text-primary-foreground uppercase tracking-wide"
                style={{ backgroundColor: actionColor }}
              >
                {getActionTypeLabel(action.actionType)}
              </span>
            </div>
            
            {/* Source de l'action */}
            <p className="text-xs text-muted-foreground mt-0.5">
              Source: {action.source.name}
            </p>
          </div>
          
          {/* Bouton d'utilisation (si applicable) */}
          {onUse && hasResource && (
            <button
              onClick={onUse}
              disabled={disabled || (action.resource?.current || 0) <= 0}
              className="btn btn-primary btn-sm"
            >
              Utiliser
            </button>
          )}
        </div>
        
        {/* SECTION PRIMAIRE: Gros chiffres */}
        <div className="flex items-center gap-4 mb-3">
          {/* Bonus de touche */}
          {hasAttack && (
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Toucher</span>
              <span className="text-3xl font-bold" style={{ color: actionColor }}>
                {formatAttackBonus(action.attack!.bonus)}
              </span>
            </div>
          )}
          
          {/* Séparateur */}
          {hasAttack && hasDamage && (
            <div className="h-8 w-px bg-border" />
          )}
          
          {/* Dégâts */}
          {hasDamage && (
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Dégâts</span>
                <span className="text-xl font-bold text-foreground">
                  {action.damage!.dice}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({Math.floor(action.damage!.average)})
                </span>
              </div>
              <span className="text-xs text-muted-foreground capitalize">
                {action.damage!.type}
              </span>
            </div>
          )}
        </div>
        
        {/* SECTION SECONDAIRE: Portée + Ressources */}
        <div className="flex items-center gap-3 mb-3 text-sm">
          {/* Portée */}
          {hasRange && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>📐</span>
              <span>
                {action.range!.normal}m
                {action.range!.long && ` / ${action.range!.long}m`}
              </span>
            </div>
          )}
          
          {/* Ressource */}
          {hasResource && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground uppercase">
                {action.resource!.type === 'slot' ? `Niv. ${action.resource!.level}` : 'Charges'}
              </span>
              <ResourcePips 
                current={action.resource!.current} 
                max={action.resource!.max}
                resetOn={action.resource!.resetOn}
              />
            </div>
          )}
        </div>
        
        {/* SECTION TERTIAIRE: Tags */}
        {action.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {action.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium text-primary-foreground"
                style={{ backgroundColor: getTagColor(tag) }}
              >
                {formatTagLabel(tag)}
              </span>
            ))}
          </div>
        )}
        
        {/* SECTION DÉTAILS: Accordéon */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {action.description || action.shortDescription}
            </p>
            
            {/* Breakdown du calcul */}
            {action.attack?.breakdown && (
              <AttackBreakdown breakdown={action.attack.breakdown} />
            )}
            
            {action.damage?.breakdown && (
              <DamageBreakdown breakdown={action.damage.breakdown} />
            )}
          </div>
        )}
        
        {/* Bouton d'expansion */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUpIcon className="w-4 h-4" />
              Masquer les détails
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4" />
              Voir les détails
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================

function ResourcePips({ current, max, resetOn }: { current: number; max: number; resetOn: string }) {
  const isDepleted = current <= 0
  const displayMax = formatResourceMax(max)
  return (
    <div className="flex items-center gap-1.5" title={`${current}/${displayMax} — Repos ${resetOn === 'short' ? 'court' : resetOn === 'long' ? 'long' : 'spécial'}`}>
      <div className="flex gap-[2px] h-2">
        {Array.from({ length: Math.min(max >= 999 ? 8 : max, 8) }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-full rounded-full transition-all ${
              i < current
                ? 'bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.4)]'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-cinzel font-bold tabular-nums ${isDepleted ? 'text-destructive' : 'text-primary'}`}>
        {current}
      </span>
      <span className="text-[10px] text-muted-foreground">/{displayMax}</span>
    </div>
  )
}

function AttackBreakdown({ breakdown }: { breakdown: NonNullable<ResolvedAction['attack']>['breakdown'] }) {
  return (
    <div className="text-xs space-y-1 bg-muted/50 p-3 rounded">
      <p className="font-medium text-muted-foreground mb-2">Détail du bonus de touche:</p>
      
      {/* Caractéristique de base */}
      <div className="flex justify-between">
        <span>{breakdown.baseAbility.label}</span>
        <span className={breakdown.baseAbility.modifier >= 0 ? 'text-hp-high' : 'text-destructive'}>
          {breakdown.baseAbility.modifier >= 0 ? '+' : ''}{breakdown.baseAbility.modifier}
        </span>
      </div>
      
      {/* Maîtrise */}
      {breakdown.proficiency.has && (
        <div className="flex justify-between">
          <span>{breakdown.proficiency.label}</span>
          <span className="text-hp-high">+{breakdown.proficiency.bonus}</span>
        </div>
      )}
      
      {/* Bonus magiques */}
      {breakdown.magicBonus.total > 0 && (
        <div className="flex justify-between">
          <span>Bonus magique</span>
          <span className="text-magic">+{breakdown.magicBonus.total}</span>
        </div>
      )}
      
      {/* Bonus de dons */}
      {breakdown.featBonus.total > 0 && (
        <div className="flex justify-between">
          <span>Bonus de dons</span>
          <span className="text-ac">+{breakdown.featBonus.total}</span>
        </div>
      )}
      
      {/* Total */}
      <div className="flex justify-between font-bold pt-2 border-t border-border/50">
        <span>Total</span>
        <span>
          {breakdown.baseAbility.modifier + 
           breakdown.proficiency.bonus + 
           breakdown.magicBonus.total + 
           breakdown.featBonus.total >= 0 ? '+' : ''}
          {breakdown.baseAbility.modifier + 
           breakdown.proficiency.bonus + 
           breakdown.magicBonus.total + 
           breakdown.featBonus.total}
        </span>
      </div>
    </div>
  )
}

function DamageBreakdown({ breakdown }: { breakdown: NonNullable<ResolvedAction['damage']>['breakdown'] }) {
  return (
    <div className="text-xs space-y-1 bg-muted/50 p-3 rounded">
      <p className="font-medium text-muted-foreground mb-2">Détail des dégâts:</p>
      
      {/* Dés de l'arme */}
      <div className="flex justify-between">
        <span>Arme</span>
        <span>{breakdown.weapon.dice}</span>
      </div>
      
      {/* Modificateur de caractéristique */}
      {breakdown.ability.added && (
        <div className="flex justify-between">
          <span>{breakdown.ability.label}</span>
          <span className="text-hp-high">+{breakdown.ability.modifier}</span>
        </div>
      )}
      
      {/* Bonus magique */}
      {breakdown.magic.bonus > 0 && (
        <div className="flex justify-between">
          <span>Bonus magique</span>
          <span className="text-magic">+{breakdown.magic.bonus}</span>
        </div>
      )}
      
      {/* Dés supplémentaires (Frappe divine, etc.) */}
      {breakdown.magic.extraDice && (
        <div className="flex justify-between">
          <span>Frappe divine (1/tour)</span>
          <span className="text-magic">+{breakdown.magic.extraDice}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// HELPERS D'AFFICHAGE
// ============================================================================

function getActionTypeLabel(type: ResolvedAction['actionType']): string {
  const labels: Record<ResolvedAction['actionType'], string> = {
    'action': 'Action',
    'bonus': 'Action Bonus',
    'reaction': 'Réaction',
    'free': 'Action Libre',
    'limited': 'Usage Limité'
  }
  return labels[type]
}

function formatTagLabel(tag: string): string {
  const labels: Record<string, string> = {
    'finesse': 'Finesse',
    'heavy': 'Lourde',
    'light': 'Légère',
    'two-handed': '2M',
    'versatile': 'Polyvalente',
    'ammunition': 'Munition',
    'loading': 'Recharge',
    'reach': 'Allonge',
    'thrown': 'Lancer',
    'melee': 'Mêlée',
    'ranged': 'Distance',
    'magic': 'Magique',
    'concentration': 'Concentration',
    'ritual': 'Rituel',
    'spell': 'Sort'
  }
  return labels[tag] || tag
}
