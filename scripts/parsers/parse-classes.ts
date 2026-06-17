/**
 * Parser des classes Aurora XML → JSON
 */

interface ClassV2 {
  id: string
  name: string
  nameEn: string
  source: string
  
  // Caractéristiques
  hitDice: number
  primaryAbility: string[]
  savingThrows: string[]
  
  // Équipement de départ
  startingEquipment: {
    options: string[][]
  }
  
  // Progression niveau par niveau
  features: Record<number, ClassFeature[]>
  
  // Sous-classes
  subclasses?: SubclassV2[]
  
  // Incantation (si applicable)
  spellcasting?: {
    ability: string
    type: 'full' | 'half' | 'third' | 'pact'
    knowSpells?: boolean
    prepareSpells?: boolean
    ritualCasting?: boolean
    focus?: string
  }
}

interface ClassFeature {
  id: string
  name: string
  description: string
  // Rules associées
  rules?: Rule[]
  // Utilisations (ex: Rage 2/utilisation)
  uses?: {
    count: number | string // Nombre ou référence "$(barbarian:rage)"
    recovery: 'short' | 'long'
  }
}

interface SubclassV2 {
  id: string
  name: string
  description: string
  features: Record<number, ClassFeature[]>
}

type Rule = 
  | { type: 'grant'; targetType: string; targetId: string }
  | { type: 'select'; targetType: string; count: number; options: string[] }

/**
 * Parse les classes depuis XML Aurora
 * TODO : Implémenter le parsing complet
 */
export function parseClasses(xmlContent: string): ClassV2[] {
  console.log('Parsing classes... (TODO: implémentation complète)')
  
  // Pour l'instant, retourner un tableau vide
  return []
}

export { parseClasses }
export type { ClassV2, ClassFeature, SubclassV2 }
