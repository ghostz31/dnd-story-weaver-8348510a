// Sous-classes de D&D 5e — données enrichies
// Sources : AideDD, 5e-drs, dnd5eapi.co (SRD 5.1)

import type { Rule } from '../../types/aurora-v2'

export interface SubclassFeature {
    level: number
    name: string
    description: string
    rules?: Rule[]             // Rules mécaniques applicables (optionnel)
}

export interface Subclass {
    id: string
    classId: string
    name: string
    nameEn: string
    description: string
    source: string             // ex: 'PHB' = Player's Handbook
    subclassLevel: number      // Niveau auquel on choisit la sous-classe
    features: SubclassFeature[]
    rules?: Rule[]             // Rules globales de la sous-classe (optionnel)
}
