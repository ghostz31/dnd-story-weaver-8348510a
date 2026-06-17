/**
 * Données de référence du Barbare — extraites de https://www.aidedd.org/regles/classes/barbare/
 *
 * Chaque feature de sous-classe est vérifiée avec des assertions de mots-clés
 * pour garantir que les mécaniques D&D 5e sont correctement implémentées.
 */
import type { FullClassRef } from '../reference-types'

export const barbareRef: FullClassRef = {
    name: 'Barbare',
    nameEn: 'Barbarian',
    hitDie: 12,
    primaryAbility: 'str',
    savingThrows: ['str', 'con'],
    armorProficiencies: ['armures légères', 'armures intermédiaires', 'boucliers'],
    weaponProficiencies: ['armes courantes', 'armes de guerre'],
    skillChoices: ['Athlétisme', 'Dressage', 'Intimidation', 'Nature', 'Perception', 'Survie'],
    numSkillChoices: 2,
    tools: [],
    startingEquipment: [
        '(a) une hache à deux mains ou (b) n\'importe quelle arme de guerre de corps à corps',
        '(a) deux hachettes ou (b) n\'importe quelle arme courante',
        'un sac d\'explorateur et quatre javelines',
    ],

    progression: [
        { level: 1, proficiencyBonus: 2, features: ['Rage', 'Défense sans armure'], resources: { rages: 2, rageDamage: 2 } },
        { level: 2, proficiencyBonus: 2, features: ['Attaque téméraire', 'Sens du danger'], resources: { rages: 2, rageDamage: 2 } },
        { level: 3, proficiencyBonus: 2, features: ['Voie primitive'], resources: { rages: 3, rageDamage: 2 } },
        { level: 4, proficiencyBonus: 2, features: ['Amélioration de caractéristiques'], resources: { rages: 3, rageDamage: 2 } },
        { level: 5, proficiencyBonus: 3, features: ['Attaque supplémentaire', 'Déplacement rapide'], resources: { rages: 3, rageDamage: 2 } },
        { level: 6, proficiencyBonus: 3, features: ['Capacité de voie'], resources: { rages: 4, rageDamage: 2 } },
        { level: 7, proficiencyBonus: 3, features: ['Instinct sauvage'], resources: { rages: 4, rageDamage: 2 } },
        { level: 8, proficiencyBonus: 3, features: ['Amélioration de caractéristiques'], resources: { rages: 4, rageDamage: 2 } },
        { level: 9, proficiencyBonus: 4, features: ['Critique brutal'], resources: { rages: 4, rageDamage: 3 } },
        { level: 10, proficiencyBonus: 4, features: ['Capacité de voie'], resources: { rages: 4, rageDamage: 3 } },
        { level: 11, proficiencyBonus: 4, features: ['Rage implacable'], resources: { rages: 4, rageDamage: 3 } },
        { level: 12, proficiencyBonus: 4, features: ['Amélioration de caractéristiques'], resources: { rages: 5, rageDamage: 3 } },
        { level: 13, proficiencyBonus: 5, features: ['Critique brutal'], resources: { rages: 5, rageDamage: 3 } },
        { level: 14, proficiencyBonus: 5, features: ['Capacité de voie'], resources: { rages: 5, rageDamage: 3 } },
        { level: 15, proficiencyBonus: 5, features: ['Rage persistante'], resources: { rages: 5, rageDamage: 3 } },
        { level: 16, proficiencyBonus: 5, features: ['Amélioration de caractéristiques'], resources: { rages: 5, rageDamage: 4 } },
        { level: 17, proficiencyBonus: 6, features: ['Critique brutal'], resources: { rages: 6, rageDamage: 4 } },
        { level: 18, proficiencyBonus: 6, features: ['Puissance indomptable'], resources: { rages: 6, rageDamage: 4 } },
        { level: 19, proficiencyBonus: 6, features: ['Amélioration de caractéristiques'], resources: { rages: 6, rageDamage: 4 } },
        { level: 20, proficiencyBonus: 6, features: ['Champion primitif'], resources: { rages: null, rageDamage: 4 } },
    ],

    resourceTables: {
        barbarianRages: [2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 999],
        barbarianRageDamage: [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4],
        barbarianFastMovement: [0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        barbarianBrutalCriticalDice: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3],
    },

    classActions: {
        rages: { restoreOn: 'long', availableFrom: 1 },
        recklessAttack: { restoreOn: 'never', availableFrom: 2 },
        dangerSense: { restoreOn: 'never', availableFrom: 2 },
        primalPath: { restoreOn: 'never', availableFrom: 3 },
        extraAttack: { restoreOn: 'never', availableFrom: 5 },
        fastMovement: { restoreOn: 'never', availableFrom: 5 },
        feralInstinct: { restoreOn: 'never', availableFrom: 7 },
        brutalCritical: { restoreOn: 'never', availableFrom: 9 },
        relentlessRage: { restoreOn: 'never', availableFrom: 11 },
        persistentRage: { restoreOn: 'never', availableFrom: 15 },
        indomitableMight: { restoreOn: 'never', availableFrom: 18 },
        primalChampion: { restoreOn: 'never', availableFrom: 20 },
    },

    // Sous-classes avec vérification précise des mots-clés mécaniques
    subclasses: {
        berserker: {
            id: 'berserker',
            name: 'Voie du Berserker',
            source: 'PHB',
            features: {
                3: {
                    name: 'Frénésie', type: 'bonus',
                    keywords: ['attaque', 'supplémentaire', 'action bonus', 'épuisement', 'frenzy'],
                    forbidden: [],
                },
                6: {
                    name: 'Rage aveugle', type: 'passive',
                    keywords: ['charmé', 'effrayé', 'immun', 'suspendu'],
                    forbidden: [],
                },
                10: {
                    name: 'Présence intimidante', type: 'action',
                    keywords: ['action', 'effrayer', 'js', 'dd', 'cha'],
                    forbidden: [],
                },
                14: {
                    name: 'Représailles', type: 'reaction',
                    keywords: ['réaction', 'attaque', 'corps à corps', 'touche'],
                    forbidden: [],
                },
            },
        },

        totem_warrior: {
            id: 'totem_warrior',
            name: 'Voie du Totem',
            source: 'PHB',
            features: {
                3: {
                    name: 'Quêteur spirituel', type: 'passive',
                    keywords: ['communication avec les animaux', 'sens animal', 'rituel'],
                    forbidden: [],
                },
                3.1: {
                    name: 'Esprit totem (Ours/Aigle/Loup)', type: 'passive',
                    keywords: ['ours', 'aigle', 'loup', 'totem', 'résistance', 'désavantage', 'avantage'],
                    forbidden: [],
                },
                6: {
                    name: 'Aspect de la bête', type: 'passive',
                    keywords: ['ours', 'aigle', 'loup', 'charge', 'vision', 'pistage'],
                    forbidden: [],
                },
                10: {
                    name: 'Marcheur spirituel', type: 'passive',
                    keywords: ['communion avec la nature', 'rituel'],
                    forbidden: [],
                },
                14: {
                    name: 'Lien totémique', type: 'passive',
                    keywords: ['ours', 'aigle', 'loup', 'vol', 'renverser', 'désavantage'],
                    forbidden: [],
                },
            },
        },

        ancestral_guardian: {
            id: 'ancestral_guardian',
            name: 'Voie du Gardien Ancestral',
            source: 'XGtE',
            features: {
                3: {
                    name: 'Protecteurs ancestraux', type: 'passive',
                    keywords: ['esprit', 'désavantage', 'résistance', 'cible'],
                    forbidden: [],
                },
                6: {
                    name: 'Bouclier spirituel', type: 'reaction',
                    keywords: ['réaction', 'réduire', 'dégâts', '2d6', '3d6', '4d6'],
                    forbidden: [],
                },
                10: {
                    name: 'Consulter les esprits', type: 'passive',
                    keywords: ['augure', 'clairvoyance', 'esprit'],
                    forbidden: [],
                },
                14: {
                    name: 'Ancêtres vengeurs', type: 'reaction',
                    keywords: ['bouclier', 'dégâts', 'force', 'réduits'],
                    forbidden: [],
                },
            },
        },

        storm_herald: {
            id: 'storm_herald',
            name: 'Voie du Héraut de la Tempête',
            source: 'XGtE',
            features: {
                3: {
                    name: 'Aura de tempête (Désert/Mer/Toundra)', type: 'bonus',
                    keywords: ['aura', 'désert', 'mer', 'toundra', 'feu', 'foudre', 'pv'],
                    forbidden: [],
                },
                6: {
                    name: 'Âme de tempête', type: 'passive',
                    keywords: ['résistance', 'environnement', 'feu', 'foudre', 'froid'],
                    forbidden: [],
                },
                10: {
                    name: 'Tempête protectrice', type: 'passive',
                    keywords: ['allié', 'résistance', 'aura'],
                    forbidden: [],
                },
                14: {
                    name: 'Tempête déchaînée', type: 'reaction',
                    keywords: ['réaction', 'dégâts', 'renverser', 'vitesse'],
                    forbidden: [],
                },
            },
        },

        zealot: {
            id: 'zealot',
            name: 'Voie du Zélote',
            source: 'XGtE',
            features: {
                3: {
                    name: 'Fureur divine', type: 'passive',
                    keywords: ['1d6', '½', 'radiant', 'nécrotique', 'dégâts'],
                    forbidden: [],
                },
                3.1: {
                    name: 'Guerrier des dieux', type: 'passive',
                    keywords: ['résurrection', 'composantes', 'matérielles'],
                    forbidden: [],
                },
                6: {
                    name: 'Concentration fanatique', type: 'passive',
                    keywords: ['js', 'relancer', 'rage'],
                    forbidden: [],
                },
                10: {
                    name: 'Présence zélée', type: 'bonus',
                    keywords: ['action bonus', 'avantage', 'attaque', 'sauvegarde'],
                    forbidden: [],
                },
                14: {
                    name: 'Rage au-delà de la mort', type: 'passive',
                    keywords: ['0', 'inconscient', 'mort', 'rage'],
                    forbidden: [],
                },
            },
        },

        beast: {
            id: 'beast',
            name: 'Voie de la Bête',
            source: 'TCoE',
            features: {
                3: {
                    name: 'Forme de la bête (Morsure/Griffes/Queue)', type: 'bonus',
                    keywords: ['morsure', 'griffes', 'queue', 'naturelle', 'arme'],
                    forbidden: [],
                },
                6: {
                    name: 'Âme de la bête', type: 'passive',
                    keywords: ['magique', 'nage', 'escalade', 'saut'],
                    forbidden: [],
                },
                10: {
                    name: 'Fureur infectieuse', type: 'action',
                    keywords: ['js', 'sag', 'psychique', 'naturelle'],
                    forbidden: [],
                },
                14: {
                    name: 'Appel de la chasse', type: 'passive',
                    keywords: ['1d6', 'dégâts', 'créature', 'bonus'],
                    forbidden: [],
                },
            },
        },

        wild_magic_barbarian: {
            id: 'wild_magic_barbarian',
            name: 'Voie de la Magie Sauvage',
            source: 'TCoE',
            features: {
                3: {
                    name: 'Sens de la magie', type: 'action',
                    keywords: ['action', 'détectez', 'magie', 'école'],
                    forbidden: [],
                },
                3.1: {
                    name: 'Sursaut sauvage', type: 'passive',
                    keywords: ['1d8', 'aléatoire', 'rage', 'table'],
                    forbidden: [],
                },
                6: {
                    name: 'Réserve de magie', type: 'action',
                    keywords: ['d3', 'attaque', 'emplacement', 'sort'],
                    forbidden: [],
                },
                10: {
                    name: 'Réaction instable', type: 'reaction',
                    keywords: ['réaction', 'dégâts', 'js', 'relancer'],
                    forbidden: [],
                },
                14: {
                    name: 'Sursaut contrôlé', type: 'passive',
                    keywords: ['2d8', 'choisissez', 'identique'],
                    forbidden: [],
                },
            },
        },
    },
}
