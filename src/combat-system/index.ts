/**
 * Combat System Exports
 * 
 * Exporte tous les composants et utilitaires du système de combat
 */

// Composants UI
export { ActionCard } from '../components/combat/ActionCard'

// Store
export { 
  useCombatStore, 
  useCombatActions, 
  useResourceTracker 
} from '../stores/combatStore'

// Engine
export {
  calculateAttackBonus,
  calculateDamage,
  generateResolvedActions,
  formatAttackBonus,
  formatDamage,
  getActionColor,
  getTagColor
} from '../utils/combat-engine'

// Types
export type {
  ResolvedAction,
  AttackBreakdown,
  DamageBreakdown,
  ActionTag
} from '../utils/combat-engine'
