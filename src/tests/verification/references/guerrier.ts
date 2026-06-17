import type { FullClassRef } from '../reference-types'

export const guerrierRef: FullClassRef = {
    name: 'Guerrier',
    nameEn: 'Fighter',
    hitDie: 10,
    primaryAbility: 'str',
    savingThrows: ['str', 'con'],
    armorProficiencies: ['toutes les armures', 'boucliers'],
    weaponProficiencies: ['armes courantes', 'armes de guerre'],
    skillChoices: ['Acrobaties', 'Athlétisme', 'Dressage', 'Histoire', 'Intimidation', 'Intuition', 'Perception', 'Survie'],
    numSkillChoices: 2,
    tools: [],
    startingEquipment: ['cotte de mailles ou armure de cuir + arc long'],

    progression: [
        { level: 1,  proficiencyBonus: 2, features: ['Style de combat', 'Second souffle'] },
        { level: 2,  proficiencyBonus: 2, features: ['Fougue'] },
        { level: 3,  proficiencyBonus: 2, features: ['Archétype martial'] },
        { level: 4,  proficiencyBonus: 2, features: ['Amélioration de caractéristiques'] },
        { level: 5,  proficiencyBonus: 3, features: ['Attaque supplémentaire'] },
        { level: 6,  proficiencyBonus: 3, features: ['Amélioration de caractéristiques'] },
        { level: 7,  proficiencyBonus: 3, features: ['Capacité de l\'archétype martial'] },
        { level: 8,  proficiencyBonus: 3, features: ['Amélioration de caractéristiques'] },
        { level: 9,  proficiencyBonus: 4, features: ['Inflexible'] },
        { level: 10, proficiencyBonus: 4, features: ['Capacité de l\'archétype martial'] },
        { level: 11, proficiencyBonus: 4, features: ['Attaque supplémentaire'] },
        { level: 12, proficiencyBonus: 4, features: ['Amélioration de caractéristiques'] },
        { level: 13, proficiencyBonus: 5, features: ['Inflexible'] },
        { level: 14, proficiencyBonus: 5, features: ['Amélioration de caractéristiques'] },
        { level: 15, proficiencyBonus: 5, features: ['Capacité de l\'archétype martial'] },
        { level: 16, proficiencyBonus: 5, features: ['Amélioration de caractéristiques'] },
        { level: 17, proficiencyBonus: 6, features: ['Fougue', 'Inflexible'] },
        { level: 18, proficiencyBonus: 6, features: ['Capacité de l\'archétype martial'] },
        { level: 19, proficiencyBonus: 6, features: ['Amélioration de caractéristiques'] },
        { level: 20, proficiencyBonus: 6, features: ['Attaque supplémentaire'] },
    ],

    resourceTables: {
        fighterSecondWindUses: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },

    classActions: {
        secondWind: { restoreOn: 'short', availableFrom: 1 },
        actionSurge: { restoreOn: 'short', availableFrom: 2 },
        indomitable: { restoreOn: 'long', availableFrom: 9 },
    },

    subclasses: {
        champion: {
            id: 'champion', name: 'Champion', source: 'PHB',
            features: {
                3:  { name: 'Critique amélioré', keywords: ['critique', '19', '20'] },
                7:  { name: 'Athlète accompli', keywords: ['maîtrise', 'force', 'dextérité', 'constitution'] },
                10: { name: 'Style de combat supplémentaire', keywords: ['style', 'second'] },
                15: { name: 'Critique supérieur', keywords: ['critique', '18'] },
                18: { name: 'Survivant', keywords: ['pv', '5', 'moitié'] },
            },
        },
        battle_master: {
            id: 'battle_master', name: 'Maître de Bataille', source: 'PHB',
            features: {
                3:  { name: 'Supériorité martiale', keywords: ['3', 'manœuvre', 'dé'] },
                7:  { name: 'Observation de l\'ennemi', keywords: ['créature', 'caractéristique'] },
                10: { name: 'Supériorité martiale améliorée', keywords: ['d10'] },
                15: { name: 'Implacable', keywords: ['initiative', 'dé'] },
                18: { name: 'Supériorité martiale améliorée (d12)', keywords: ['d12'] },
            },
        },
        eldritch_knight: {
            id: 'eldritch_knight', name: 'Chevalier Occulte', source: 'PHB',
            features: {
                3:  { name: 'Incantation', keywords: ['2', 'sort'] },
                3.1: { name: 'Lien d\'arme', keywords: ['arme', 'invoq'] },
                7:  { name: 'Magie de guerre', keywords: ['sort mineur', 'action bonus', 'attaque'] },
                10: { name: 'Coup arcanique', keywords: ['sort', 'cible'] },
                15: { name: 'Charge arcanique', keywords: ['téléport', 'fougue'] },
                18: { name: 'Magie de guerre améliorée', keywords: ['sort', 'attaque', 'bonus'] },
            },
        },
    },
}
