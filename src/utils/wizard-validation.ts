/**
 * Validation du Wizard par étape
 * Retourne un tableau de messages d'erreur bloquants pour l'étape courante
 */

import type { CharacterCreation, WizardStep } from '../types/character'

function getSubclassTriggerLevel(classId: string | undefined): number {
  if (!classId) return 99
  const early = ['ID_PHB_CLASS_CLERIC', 'ID_PHB_CLASS_SORCERER', 'ID_PHB_CLASS_WARLOCK', 'cleric', 'sorcerer', 'warlock']
  if (early.includes(classId)) return 1
  const lvl2 = ['ID_PHB_CLASS_DRUID', 'ID_PHB_CLASS_WIZARD', 'druid', 'wizard']
  if (lvl2.includes(classId)) return 2
  return 3
}

function getAsiLevels(classId: string | undefined): number[] {
  if (!classId) return []
  const fighterIds = ['ID_PHB_CLASS_FIGHTER', 'fighter']
  const rogueIds = ['ID_PHB_CLASS_ROGUE', 'rogue']
  if (fighterIds.includes(classId)) return [4, 6, 8, 12, 14, 16, 19]
  if (rogueIds.includes(classId)) return [4, 8, 10, 12, 16, 19]
  return [4, 8, 12, 16, 19]
}

function hasFightingStyle(classId: string | undefined, level: number): boolean {
  if (!classId) return false
  const fighterIds = ['ID_PHB_CLASS_FIGHTER', 'fighter']
  const paladinIds = ['ID_PHB_CLASS_PALADIN', 'paladin']
  const rangerIds = ['ID_PHB_CLASS_RANGER', 'ranger']
  if (fighterIds.includes(classId) && level >= 1) return true
  if (paladinIds.includes(classId) && level >= 2) return true
  if (rangerIds.includes(classId) && level >= 2) return true
  return false
}

export function validateWizardStep(
  step: WizardStep,
  character: CharacterCreation
): string[] {
  const errors: string[] = []

  switch (step) {
    case 'name': {
      const name = character.name.trim()
      if (name.length < 2) {
        errors.push('Le nom doit contenir au moins 2 caractères.')
      }
      break
    }

    case 'race': {
      if (!character.race) {
        errors.push('Veuillez sélectionner une race.')
      }
      break
    }

    case 'class': {
      if (!character.characterClass) {
        errors.push('Veuillez sélectionner une classe.')
      }
      break
    }

    case 'abilities': {
      // All methods guarantee valid scores; only flag if somehow uninitialized
      const scores = character.abilityScores
      const allTen = Object.values(scores).every(v => v === 10)
      if (allTen && !character.race) {
        // permissive
      }
      break
    }

    case 'proficiencies': {
      const cls = character.characterClass
      const bgId = character.background
      if (cls && cls.numSkillChoices > 0) {
        const bgSkillsCount = 2 // backgrounds always give 2 skills
        const classSelected = character.skillProficiencies.filter(
          s => cls.skillChoices.includes(s)
        ).length
        const totalWithoutBg = character.skillProficiencies.length - bgSkillsCount
        // If background not chosen yet, we only count class skills
        const effectiveClassSelected = bgId ? Math.max(0, totalWithoutBg) : classSelected
        if (effectiveClassSelected < cls.numSkillChoices) {
          errors.push(
            `Vous devez choisir ${cls.numSkillChoices} compétence(s) de classe (${effectiveClassSelected}/${cls.numSkillChoices}).`
          )
        }
      }
      break
    }

    case 'options': {
      const cls = character.characterClass
      const level = character.level
      if (!cls) break

      // Subclass required?
      const subclassLevel = getSubclassTriggerLevel(cls.id)
      if (level >= subclassLevel && !character.classOptions.subclass) {
        errors.push('Vous devez choisir une sous-classe.')
      }

      // Fighting style required?
      if (hasFightingStyle(cls.id, level) && !character.classOptions.fightingStyle) {
        errors.push('Vous devez choisir un style de combat.')
      }

      // ASI choices required?
      const asiLevels = getAsiLevels(cls.id).filter(l => l <= level)
      for (const asiLevel of asiLevels) {
        if (!character.asiChoices[asiLevel]) {
          errors.push(`Vous devez choisir une amélioration de caractéristique au niveau ${asiLevel}.`)
        }
      }

      // Humain variante — don requis
      if (character.subrace === 'ID_PHB_SUBRACE_VARIANT_HUMAN') {
        const variantChoice = character.asiChoices[0]
        if (!variantChoice || variantChoice.type !== 'feat' || !variantChoice.featId) {
          errors.push('Vous devez choisir un don pour l\'Humain Variante.')
        }
      }
      break
    }

    case 'spells': {
      const cls = character.characterClass
      if (cls?.spellcasting) {
        const cantrips = cls.spellcasting.cantripsKnown[character.level - 1] || 0
        const spellsKnown = cls.spellcasting.spellsKnown?.[character.level - 1] || 0
        const totalNeeded = cantrips + spellsKnown
        if (totalNeeded > 0 && character.selectedSpells.length === 0) {
          errors.push(
            `Vous devez choisir au moins un sort (${character.selectedSpells.length}/${totalNeeded} requis).`
          )
        }
      }
      break
    }

    case 'background': {
      if (!character.background) {
        errors.push('Veuillez sélectionner un historique.')
      }
      break
    }

    case 'equipment': {
      // Equipment is auto-populated from fixed items; choices are optional
      // Only flag if inventory is completely empty (rare edge case)
      if ((!character.inventory || character.inventory.length === 0) && character.characterClass) {
        errors.push('Aucun équipement sélectionné.')
      }
      break
    }

    case 'review': {
      // Always allowed
      break
    }
  }

  return errors
}
