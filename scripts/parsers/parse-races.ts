/**
 * Parser des races Aurora XML → JSON
 */

interface RaceV2 {
  id: string
  name: string
  nameEn: string
  source: string
  
  // Caractéristiques
  abilityBonuses: Partial<Record<string, number>>
  speed: number
  size: 'small' | 'medium'
  
  // Traits
  traits: string[]
  traitDetails: Record<string, {
    name: string
    description: string
  }>
  
  // Sous-races
  subraces?: SubraceV2[]
  
  // Rules Aurora
  rules: Rule[]
}

interface SubraceV2 {
  id: string
  name: string
  abilityBonuses: Partial<Record<string, number>>
  traits: string[]
  rules: Rule[]
}

type Rule = 
  | { type: 'grant'; targetType: string; targetId: string }
  | { type: 'stat'; stat: string; value: number }
  | { type: 'select'; targetType: string; count: number; options: string[] }

/**
 * Parse les races depuis XML Aurora
 * TODO : Implémenter le parsing complet
 */
export function parseRaces(xmlContent: string): RaceV2[] {
  console.log('Parsing races... (TODO: implémentation complète)')
  
  // Pour l'instant, retourner un tableau vide
  // L'implémentation complète nécessite de parser le XML complexe d'Aurora
  return []
}

export { parseRaces }
export type { RaceV2, SubraceV2 }
