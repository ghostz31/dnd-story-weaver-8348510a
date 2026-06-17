import type { FullClassRef } from '../reference-types'

export const rodeurRef: FullClassRef = {
    name: 'Rôdeur', nameEn: 'Ranger', hitDie: 10, primaryAbility: 'dex',
    savingThrows: ['str', 'dex'], armorProficiencies: ['armures légères', 'armures intermédiaires', 'boucliers'],
    weaponProficiencies: ['armes courantes', 'armes de guerre'], numSkillChoices: 3,
    skillChoices: ['Athlétisme', 'Discrétion', 'Dressage', 'Intuition', 'Investigation', 'Nature', 'Perception', 'Survie'], tools: [], startingEquipment: [],
    progression: [
        { level: 1, proficiencyBonus: 2, features: ['Ennemi juré', 'Explorateur-né'] }, { level: 2, proficiencyBonus: 2, features: ['Style de combat', 'Incantation'] },
        { level: 3, proficiencyBonus: 2, features: ['Archétype de rôdeur'] }, { level: 4, proficiencyBonus: 2, features: ['Amélioration de caractéristiques'] },
        { level: 5, proficiencyBonus: 3, features: ['Attaque supplémentaire'] }, { level: 6, proficiencyBonus: 3, features: [] },
        { level: 7, proficiencyBonus: 3, features: [] }, { level: 8, proficiencyBonus: 3, features: ['Amélioration de caractéristiques', 'Foulée camouflée'] },
        { level: 9, proficiencyBonus: 4, features: [] }, { level: 10, proficiencyBonus: 4, features: [] },
        { level: 11, proficiencyBonus: 4, features: [] }, { level: 12, proficiencyBonus: 4, features: ['Amélioration de caractéristiques'] },
        { level: 13, proficiencyBonus: 5, features: [] }, { level: 14, proficiencyBonus: 5, features: [] },
        { level: 15, proficiencyBonus: 5, features: [] }, { level: 16, proficiencyBonus: 5, features: ['Amélioration de caractéristiques'] },
        { level: 17, proficiencyBonus: 6, features: [] }, { level: 18, proficiencyBonus: 6, features: [] },
        { level: 19, proficiencyBonus: 6, features: ['Amélioration de caractéristiques'] }, { level: 20, proficiencyBonus: 6, features: [] },
    ],
    resourceTables: {},
    classActions: {
        favoredEnemy: { restoreOn: 'never', availableFrom: 1 }, naturalExplorer: { restoreOn: 'never', availableFrom: 1 },
        fightingStyle: { restoreOn: 'never', availableFrom: 2 }, spellcasting: { restoreOn: 'long', availableFrom: 2 },
        rangerArchetype: { restoreOn: 'never', availableFrom: 3 }, extraAttack: { restoreOn: 'never', availableFrom: 5 },
    },
    subclasses: {
        hunter: { id: 'hunter', name: 'Chasseur', source: 'PHB', features: { 3: { name: 'Proie du chasseur', keywords: ['proie'] }, 7: { name: 'Tactiques défensives', keywords: ['défense'] }, 11: { name: 'Attaques multiples', keywords: ['multiple'] }, 15: { name: 'Défense du chasseur', keywords: ['défense'] } } },
        beast_master: { id: 'beast_master', name: 'Maître des Bêtes', source: 'PHB', features: { 3: { name: 'Compagnon animal', keywords: ['compagnon'] }, 7: { name: 'Entraînement exceptionnel', keywords: ['exceptionnel'] }, 11: { name: 'Frappe bestiale', keywords: ['bestiale'] }, 15: { name: 'Partager les sorts', keywords: ['partager'] } } },
    },
}
