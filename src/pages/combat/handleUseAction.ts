import type { ResolvedAction } from '../../utils/combat-engine'

// ============================================================================
// HELPERS — Utilisation d'action
// ============================================================================

export function handleUseAction(
  action: ResolvedAction,
  consumeResource: (id: string, amount?: number) => boolean,
  consumeActionType: (type: 'action' | 'bonus' | 'reaction') => boolean
) {
  console.log('Using action:', action.name)

  // Consommer l'action/bonus/réaction du tour si applicable
  if (action.actionType === 'action' || action.actionType === 'bonus' || action.actionType === 'reaction') {
    const success = consumeActionType(action.actionType)
    if (!success) {
      alert(`Vous avez déjà utilisé votre ${action.actionType === 'action' ? 'action' : action.actionType === 'bonus' ? 'action bonus' : 'réaction'} ce tour!`)
      return
    }
  }

  if (action.resource) {
    const success = consumeResource(action.id, 1)
    if (!success) {
      alert('Pas assez de ressources!')
    }
  }
}
