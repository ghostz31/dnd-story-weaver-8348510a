import type { Feat } from './types'

export const xgteFeats: Feat[] = [
    {
        id: "bountiful-luck",
        name: "Chance abondante",
        nameEn: "Bountiful Luck",
        source: "XGtE",
        prerequisite: "Halfelin",
        description: "Prérequis : Halfelin. Quand un allié à 9 m obtient un 1 naturel, vous pouvez utiliser votre chance de Halfelin à sa place (réaction).",
        effects: {
            flags: ['bountiful-luck-reaction']
        }
    },
    {
        id: "dragon-fear",
        name: "Peur draconique",
        nameEn: "Dragon Fear",
        source: "XGtE",
        prerequisite: "Draconique",
        description: "Prérequis : ascendance draconique. FOR, CON ou CHA +1. Au lieu de souffle, vous pouvez rugir : créatures dans un cône de 9 m doivent réussir un JS de SAG ou être effrayées pendant 1 minute.",
        asiChoices: [
            {
                str: 1
            },
            {
                con: 1
            },
            {
                cha: 1
            }
        ],
        effects: {
            flags: ['dragon-fear-action']
        }
    },
    {
        id: "dragon-hide",
        name: "Écailles draconiques",
        nameEn: "Dragon Hide",
        source: "XGtE",
        prerequisite: "Draconique",
        description: "Prérequis : ascendance draconique. FOR, CON ou CHA +1. CA de base 13 + mod DEX si pas d'armure. Grifes naturelles (1d4 + mod FOR tranchants).",
        asiChoices: [
            {
                str: 1
            },
            {
                con: 1
            },
            {
                cha: 1
            }
        ],
        effects: {
            flags: ['dragon-hide-natural-armor']
        }
    },
    {
        id: "drow-high-magic",
        name: "Haute magie drow",
        nameEn: "Drow High Magic",
        source: "XGtE",
        prerequisite: "Drow",
        description: "Prérequis : Drow. Vous apprenez Détection de la magie et Lévitation (1 fois/repos long chacun), et Dissipation de la magie (1 fois/repos long).",
        effects: {
            flags: ['drow-high-magic-spells']
        }
    },
    {
        id: "dwarven-fortitude",
        name: "Robustesse naine",
        nameEn: "Dwarven Fortitude",
        source: "XGtE",
        prerequisite: "Nain",
        description: "Prérequis : Nain. CON +1. Quand vous prenez l'action Esquiver en combat, vous pouvez dépenser un dé de vie pour récupérer des PV.",
        abilityScoreIncrease: {
            con: 1
        },
        effects: {
            flags: ['dwarven-fortitude-dodge-heal']
        }
    },
    {
        id: "elven-accuracy",
        name: "Précision elfique",
        nameEn: "Elven Accuracy",
        source: "XGtE",
        prerequisite: "Elfe ou demi-elfe",
        description: "Prérequis : elfe ou demi-elfe. DEX, INT, SAG ou CHA +1. Avantage sur un jet d'attaque : vous pouvez relancer un des dés.",
        asiChoices: [
            {
                dex: 1
            },
            {
                int: 1
            },
            {
                wis: 1
            },
            {
                cha: 1
            }
        ],
        effects: {
            flags: ['elven-accuracy-reroll']
        }
    },
    {
        id: "fade-away",
        name: "Retraite invisible",
        nameEn: "Fade Away",
        source: "XGtE",
        prerequisite: "Gnome",
        description: "Prérequis : gnome. DEX ou INT +1. Quand vous subissez des dégâts, réaction : devenez invisible jusqu'à la fin de votre prochain tour ou jusqu'à ce que vous attaquiez/jetiez un sort (1 fois/repos court ou long).",
        asiChoices: [
            {
                dex: 1
            },
            {
                int: 1
            }
        ],
        effects: {
            flags: ['fade-away-reaction']
        }
    },
    {
        id: "fey-teleportation",
        name: "Téléportation féerique",
        nameEn: "Fey Teleportation",
        source: "XGtE",
        prerequisite: "Elfe",
        description: "Prérequis : elfe. INT, SAG ou CHA +1. Vous apprenez Misty Step (1 fois/repos long) et un tour de magie. Le sort est lancé sans emplacement.",
        asiChoices: [
            {
                int: 1
            },
            {
                wis: 1
            },
            {
                cha: 1
            }
        ],
        effects: {
            flags: ['fey-teleportation-action']
        }
    },
    {
        id: "flames-of-phlegethos",
        name: "Flammes de Phlégethos",
        nameEn: "Flames of Phlegethos",
        source: "XGtE",
        prerequisite: "Tiefling",
        description: "Prérequis : tiefling. INT ou CHA +1. Quand vous lancez un sort de feu, vous pouvez relancer les 1 sur les dés de dégâts. Après avoir lancé un sort de feu, vous êtes entouré de flammes (lumière, dégâts feu).",
        asiChoices: [
            {
                int: 1
            },
            {
                cha: 1
            }
        ],
        effects: {
            flags: ['flames-of-phlegethos-fire']
        }
    },
    {
        id: "infernal-constitution",
        name: "Constitution infernale",
        nameEn: "Infernal Constitution",
        source: "XGtE",
        prerequisite: "Tiefling",
        description: "Prérequis : tiefling. CON +1. Résistance au froid et au poison. Avantage aux JS contre l'empoisonnement.",
        abilityScoreIncrease: {
            con: 1
        },
        effects: {
            flags: ['infernal-constitution-resistance']
        }
    },
    {
        id: "orcish-fury",
        name: "Fureur orque",
        nameEn: "Orcish Fury",
        source: "XGtE",
        prerequisite: "Demi-orque",
        description: "Prérequis : demi-orque. FOR ou CON +1. Quand vous frappez avec une attaque au corps à corps, vous pouvez ajouter 1d8 dégâts supplémentaires du type de l'arme (1 fois/repos court ou long). Réaction : attaque supplémentaire après avoir utilisé Relentless Endurance.",
        asiChoices: [
            {
                str: 1
            },
            {
                con: 1
            }
        ],
        effects: {
            flags: ['orcish-fury-reaction']
        }
    },
    {
        id: "prodigy",
        name: "Prodige",
        nameEn: "Prodigy",
        source: "XGtE",
        prerequisite: "Humain, demi-elfe ou demi-orque",
        description: "Prérequis : humain, demi-elfe ou demi-orque. Une compétence, un outil et une langue de votre choix. Expertise dans une compétence maîtrisée.",
        effects: {
            flags: ['prodigy-skill']
        }
    },
    {
        id: "second-chance",
        name: "Deuxième chance",
        nameEn: "Second Chance",
        source: "XGtE",
        prerequisite: "Halfling",
        description: "Prérequis : halfelin. DEX, CON ou CHA +1. Quand une créature vous touche avec une attaque, réaction : force la créature à relancer le jet (1 fois/repos court ou long).",
        asiChoices: [
            {
                dex: 1
            },
            {
                con: 1
            },
            {
                cha: 1
            }
        ],
        effects: {
            flags: ['second-chance-reaction']
        }
    },
    {
        id: "squat-nimbleness",
        name: "Agilité du petit",
        nameEn: "Squat Nimbleness",
        source: "XGtE",
        prerequisite: "Nain ou petit",
        description: "Prérequis : nain ou race de taille P. FOR ou DEX +1. Vitesse +1,5 m. Maîtrise en Acrobaties ou Athlétisme.",
        asiChoices: [
            {
                str: 1
            },
            {
                dex: 1
            }
        ],
        effects: {
            passive: {
                speedBonus: 1.5
            },
            flags: ['squat-nimbleness-speed']
        }
    },
    {
        id: "wood-elf-magic",
        name: "Magie des elfes des bois",
        nameEn: "Wood Elf Magic",
        source: "XGtE",
        prerequisite: "Elfe des bois",
        description: "Prérequis : elfe des bois. Vous apprenez un tour de magie de druide. Vous pouvez lancer Lueurs féeriques et Brouillard (1 fois/repos long chacun) sans emplacement.",
        effects: {
            flags: ['wood-elf-magic-spells']
        }
    },
]
