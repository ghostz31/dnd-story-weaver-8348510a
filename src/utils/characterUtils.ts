import type { CharacterCreation, AbilityScores } from '../types/character'
import { getFeatById } from '../data/feats'

export function getFinalAbilityScores(character: CharacterCreation): AbilityScores {
    // 1. Stats de base (assignées ou roll)
    const scores = { ...character.abilityScores }

    // 2. Bonus raciaux
    const raceBonuses = character.race?.abilityBonuses || {}
    Object.entries(raceBonuses).forEach(([stat, bonus]) => {
        const key = stat as keyof AbilityScores
        scores[key] = (scores[key] || 0) + (bonus || 0)
    })

    // TODO: Gérer bonus libres TCoE (customAbilityBonuses)

    // 3. Bonus de sous-race
    if (character.subrace && character.race?.subraces) {
        const subrace = character.race.subraces.find(s => s.id === character.subrace)
        if (subrace) {
            Object.entries(subrace.abilityBonuses).forEach(([stat, bonus]) => {
                const key = stat as keyof AbilityScores
                scores[key] = (scores[key] || 0) + (bonus || 0)
            })
        }
    }

    // 4. ASI (Améliorations de Caractéristique)
    if (character.asiChoices) {
        Object.values(character.asiChoices).forEach(choice => {
            if (choice.type === 'stats' && choice.stats) {
                // Bonus direct de stats
                Object.entries(choice.stats).forEach(([stat, bonus]) => {
                    const key = stat as keyof AbilityScores
                    scores[key] = (scores[key] || 0) + (bonus || 0)
                })
            } else if (choice.type === 'feat' && choice.featId) {
                // Bonus via Don (Half-Feat)
                const feat = getFeatById(choice.featId)
                if (feat && feat.abilityScoreIncrease) {
                    Object.entries(feat.abilityScoreIncrease).forEach(([stat, bonus]) => {
                        const key = stat as keyof AbilityScores
                        scores[key] = (scores[key] || 0) + (bonus || 0)
                    })
                }
            }
        })
    }

    // S'assurer qu'aucune stat ne dépasse 20 (cap standard, sauf exceptions niveau 20 Barbare mais on ignore pour l'instant)
    // Et aucune stat en dessous de 1 ? Non, pas de limite inférieure stricte autre que 1.
    Object.keys(scores).forEach(key => {
        const k = key as keyof AbilityScores
        scores[k] = Math.min(20, Math.max(1, scores[k]))
    })

    return scores
}
