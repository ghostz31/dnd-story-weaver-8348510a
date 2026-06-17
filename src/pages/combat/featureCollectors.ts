import { getClassActions, type ClassAction } from '../../data/classFeatures'
import { racialTraitDetails } from '../../data/races'

// ============================================================================
// HELPERS — Collecte des capacités & traits
// ============================================================================

export function collectClassFeatures(character: any, classId: string | undefined, auroraFeatures: any[], auroraSubclassFeatures: any[] = []) {
  const features: Array<{ name: string; description: string; level: number; uses?: ClassAction; source?: string }> = []

  if (!classId || !character) return features

  const classActions = getClassActions(classId, character.level)

  // Capacités de classe de base (Aurora)
  auroraFeatures.forEach(f => {
    const existingAction = classActions.find(a => a.name === f.name)
    features.push({
      name: f.name,
      description: f.description,
      level: f.level,
      uses: existingAction,
      source: 'Classe'
    })
  })

  // Capacités de sous-classe (Aurora)
  auroraSubclassFeatures.forEach(f => {
    if (!features.some(existing => existing.name === f.name)) {
      features.push({
        name: f.name,
        description: f.description,
        level: f.level,
        source: 'Sous-classe'
      })
    }
  })

  // Capacités actionnables de l'ancien système
  classActions.forEach(action => {
    if (!features.some(f => f.name === action.name)) {
      const levelForAction = auroraFeatures.find(f => f.name === action.name)?.level || 1
      features.push({
        name: action.name,
        description: action.description,
        level: levelForAction,
        uses: action,
        source: 'Classe'
      })
    }
  })

  return features.sort((a, b) => a.level - b.level)
}

export function collectRacialTraits(character: any, _raceId: string | undefined, auroraTraits: any[]) {
  const traits: Array<{ name: string; description: string; source: string }> = []
  
  if (!character?.race) return traits
  
  // Add aurora traits
  auroraTraits.forEach(t => {
    traits.push({
      name: t.name,
      description: t.description,
      source: character.race.name
    })
  })
  
  // Add traits from character
  if (character.race.traits) {
    character.race.traits.forEach((traitName: string) => {
      if (!traits.some(t => t.name === traitName)) {
        const details = character.race?.traitDetails?.[traitName] || racialTraitDetails[traitName]
        if (details) {
          traits.push({
            name: typeof details === 'string' ? traitName : details.name,
            description: typeof details === 'string' ? details : details.description,
            source: character.race.name
          })
        }
      }
    })
  }
  
  return traits
}
