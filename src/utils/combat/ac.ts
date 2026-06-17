import type { Character } from '../../types/character'
import type { InventoryItem } from '../../types/inventory'
import { getCharacterFightingStyles } from './attack-bonus'

// ============================================================================
// CALCUL DE CA DEPUIS L'INVENTAIRE
// ============================================================================

export function calculateACFromInventory(
  character: Character,
  inventoryItems: InventoryItem[]
): number {
  const dexMod = Math.floor((character.abilityScores.dex - 10) / 2)
  const conMod = Math.floor((character.abilityScores.con - 10) / 2)
  const wisMod = Math.floor((character.abilityScores.wis - 10) / 2)
  const classId = character.class?.id || ''
  const normalizedClassId = classId.startsWith('ID_')
    ? classId.toLowerCase().replace(/id_phb_class_/g, '')
    : classId

  const activeItems = inventoryItems.filter(i => {
    if (!i.equipped) return false
    if (i.attunement && !i.attuned) return false
    return true
  })

  const armor = activeItems.find(i =>
    i.type === 'armor' && i.armorCategory && i.armorCategory !== 'shield' && i.armorClass
  )

  const shield = activeItems.find(i =>
    i.armorCategory === 'shield' && i.armorClass
  )

  let baseAC = 10 + dexMod

  if (!armor && (normalizedClassId === 'barbarian' || normalizedClassId === 'monk')) {
    if (normalizedClassId === 'barbarian') {
      baseAC = 10 + dexMod + conMod
    } else if (normalizedClassId === 'monk') {
      baseAC = 10 + dexMod + wisMod
    }
  } else if (armor && armor.armorClass) {
    if (armor.addDex) {
      const maxDex = armor.maxDex ?? Infinity
      baseAC = armor.armorClass + Math.min(dexMod, maxDex)
    } else {
      baseAC = armor.armorClass
    }
  }

  if (shield && shield.armorClass) {
    baseAC += shield.armorClass
  }

  const magicACBonus = activeItems.reduce((sum, i) => sum + (i.acBonus || 0), 0)
  baseAC += magicACBonus

  // Style de combat : Défense (+1 CA si armure portée)
  const fightingStyles = getCharacterFightingStyles(character)
  if (fightingStyles.includes('defense') && armor) {
    baseAC += 1
  }

  // Don : Combat à deux armes (+1 CA si une arme de mêlée dans chaque main)
  const hasDualWielder = character.feats?.includes('dual-wielder')
  if (hasDualWielder) {
    const equippedWeapons = activeItems.filter(i => i.type === 'weapon')
    const meleeWeaponsEquipped = equippedWeapons.filter(i => {
      // Gère les deux formats de propriétés (InventoryItem.properties ou ItemV2.weaponProperties)
      const props = i.properties || (i as { weaponProperties?: string[] }).weaponProperties || []
      const isRanged = props.some((p: string) =>
        p === 'ranged' || p === 'ammunition'
      )
      return !isRanged
    })
    // Deux armes de mêlée équipées (pas de bouclier)
    if (meleeWeaponsEquipped.length >= 2 && !shield) {
      baseAC += 1
    }
  }

  return baseAC
}
