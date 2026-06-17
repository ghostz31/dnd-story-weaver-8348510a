/**
 * Service d'application des rules aux personnages
 * 
 * Applique toutes les rules d'un personnage (race, classe, dons)
 */

import type { Character } from '../types/character'
import { 
  loadRaces, 
  loadClasses, 
  loadFeats,
  oldIdToAuroraId 
} from './aurora-loader'
import { 
  applyRaceRules, 
  applyClassRules, 
  applyFeatRules,
  type RuleChange 
} from '../utils/rules-engine'
import { getSubclassById as getStaticSubclassById } from './subclasses'

export interface CharacterBuildResult {
  success: boolean
  character: Character
  changes: RuleChange[]
  errors: string[]
  warnings: string[]
}

/**
 * Applique toutes les rules d'un personnage
 * - Rules de race
 * - Rules de classe (par niveau)
 * - Rules de dons
 */
export async function applyCharacterRules(character: Character): Promise<CharacterBuildResult> {
  const result: CharacterBuildResult = {
    success: true,
    character: { ...character },
    changes: [],
    errors: [],
    warnings: []
  }

  try {
    // 1. Appliquer les rules de la race
    if (result.character.race?.id) {
      const raceId = result.character.race.id.startsWith('ID_') 
        ? result.character.race.id 
        : oldIdToAuroraId(result.character.race.id, 'race') || result.character.race.id
      
      const { races } = await loadRaces()
      const race = races.find(r => r.id === raceId)
      
      if (race?.rules) {
        const raceResult = applyRaceRules(result.character, raceId, race.rules)
        result.changes.push(...raceResult.changes)
        result.errors.push(...raceResult.errors)
      } else {
        result.warnings.push(`Race ${raceId} non trouvée dans Aurora`)
      }
    }

    // 2. Appliquer les rules de la sous-race
    if (result.character.subrace) {
      // La sous-race a ses propres rules dans race.subraces
      const raceId = result.character.race?.id
      if (raceId) {
        const fullRaceId = raceId.startsWith('ID_') ? raceId : oldIdToAuroraId(raceId, 'race') || raceId
        const { races } = await loadRaces()
        const race = races.find(r => r.id === fullRaceId)
        const subrace = race?.subraces?.find(s => s.id === result.character.subrace || s.name === result.character.subrace)
        
        if (subrace?.rules) {
          const subraceResult = applyRaceRules(result.character, subrace.id, subrace.rules)
          result.changes.push(...subraceResult.changes)
          result.errors.push(...subraceResult.errors)
        }
      }
    }

    // 3. Appliquer les rules de la classe (par niveau)
    if (result.character.class?.id) {
      const classId = result.character.class.id.startsWith('ID_')
        ? result.character.class.id
        : oldIdToAuroraId(result.character.class.id, 'class') || result.character.class.id
      
      const { classes } = await loadClasses()
      const cls = classes.find(c => c.id === classId)
      
      if (cls?.features) {
        // Appliquer les features de chaque niveau
        for (let level = 1; level <= result.character.level; level++) {
          const levelFeatures = cls.features[level]
          if (levelFeatures) {
            for (const feature of levelFeatures) {
              if (feature.rules) {
                const featureResult = applyClassRules(result.character, classId, level, feature.rules)
                result.changes.push(...featureResult.changes)
                result.errors.push(...featureResult.errors)
              }
            }
          }
        }
      } else {
        result.warnings.push(`Classe ${classId} non trouvée dans Aurora`)
      }

      // 4. Appliquer les rules de la sous-classe
      if (result.character.subclass) {
        let subclassRules: any[] = []
        
        // 4a. Essayer Aurora d'abord
        if (cls?.subclasses) {
          const auroraSubclass = cls.subclasses.find(s => 
            s.id === result.character.subclass || 
            s.name.toLowerCase().includes(result.character.subclass!.toLowerCase())
          )
          if (auroraSubclass?.features) {
            for (let level = 1; level <= result.character.level; level++) {
              const levelFeatures = auroraSubclass.features[level]
              if (levelFeatures) {
                for (const feature of levelFeatures) {
                  if (feature.rules) subclassRules.push(...feature.rules)
                }
              }
            }
          }
        }
        
        // 4b. Fallback sur les données statiques si Aurora n'a pas de rules
        if (subclassRules.length === 0) {
          const staticSubclass = getStaticSubclassById(result.character.subclass)
          if (staticSubclass?.features) {
            for (const feature of staticSubclass.features) {
              if (feature.level <= result.character.level && feature.rules) {
                subclassRules.push(...feature.rules)
              }
            }
          }
        }
        
        // 4c. Appliquer les rules collectées
        for (const rule of subclassRules) {
          const featureResult = applyClassRules(result.character, classId, result.character.level, [rule])
          result.changes.push(...featureResult.changes)
          result.errors.push(...featureResult.errors)
        }
      }
    }

    // 5. Appliquer les rules des dons
    if (result.character.feats && result.character.feats.length > 0) {
      const { feats } = await loadFeats()
      
      for (const featId of result.character.feats) {
        const fullFeatId = featId.startsWith('ID_') ? featId : `ID_FEAT_${featId.toUpperCase()}`
        const feat = feats.find(f => f.id === fullFeatId || f.id === featId)
        
        if (feat?.rules) {
          const featResult = applyFeatRules(result.character, feat.id, feat.rules)
          result.changes.push(...featResult.changes)
          result.errors.push(...featResult.errors)
        }
      }
    }

    // Recalculer les valeurs dérivées
    recalculateDerivedValues(result.character)

  } catch (error) {
    result.success = false
    result.errors.push(`Erreur globale: ${error}`)
  }

  return result
}

/**
 * Recalcule les valeurs dérivées d'un personnage
 * - Bonus de maîtrise
 * - Modificateurs de caractéristiques
 * - Initiative
 * - PV max (avec bonus de CON)
 */
function recalculateDerivedValues(character: Character): void {
  // Le bonus de maîtrise est calculé automatiquement par getProficiencyBonus
  // Les modificateurs sont utilisés à la volée
  
  // Recalculer les PV max avec le modificateur de CON
  const conMod = Math.floor((character.abilityScores.con - 10) / 2)
  const baseHP = character.hp.max - (conMod * character.level)
  character.hp.max = baseHP + (conMod * character.level)
  
  // L'initiative = modificateur de DEX
  character.initiative = Math.floor((character.abilityScores.dex - 10) / 2)
}

/**
 * Valide un personnage avant application des rules
 * Retourne les warnings mais n'empêche pas l'application
 */
export async function validateCharacterForRules(character: Character): Promise<string[]> {
  const warnings: string[] = []
  
  if (!character.race) {
    warnings.push('Aucune race sélectionnée')
  }
  
  if (!character.class) {
    warnings.push('Aucune classe sélectionnée')
  }
  
  if (!character.background) {
    warnings.push('Aucun background sélectionné')
  }
  
  // Vérifier que les IDs sont reconnus
  if (character.race?.id) {
    const raceId = character.race.id.startsWith('ID_') 
      ? character.race.id 
      : oldIdToAuroraId(character.race.id, 'race')
    if (!raceId) {
      warnings.push(`Race ID non reconnu: ${character.race.id}`)
    }
  }
  
  if (character.class?.id) {
    const classId = character.class.id.startsWith('ID_')
      ? character.class.id
      : oldIdToAuroraId(character.class.id, 'class')
    if (!classId) {
      warnings.push(`Classe ID non reconnu: ${character.class.id}`)
    }
  }
  
  return warnings
}
