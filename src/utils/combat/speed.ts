import type { Character } from '../../types/character'
import type { InventoryItem } from '../../types/inventory'
import { normalizeClassId, getBarbarianFastMovement } from '../feature-helpers'

// ============================================================================
// CALCUL DE LA VITESSE
// ============================================================================

export function calculateCharacterSpeed(
  character: Character,
  inventoryItems: InventoryItem[]
): number {
  let speed = character.speed || 30
  const classId = normalizeClassId(character.class?.id)
  const level = character.level

  // Déplacement rapide du Barbare (niveau 5+, pas d'armure lourde)
  if (classId === 'barbarian' && level >= 5) {
    const hasHeavyArmor = inventoryItems.some(i =>
      i.equipped && i.type === 'armor' && i.armorCategory === 'heavy'
    )
    if (!hasHeavyArmor) {
      speed += getBarbarianFastMovement(level)
    }
  }

  return speed
}
