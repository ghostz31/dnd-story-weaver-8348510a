import type { Feat } from './types'

export const tcoeFeats: Feat[] = [
    {
        id: "artificer-initiate",
        name: "Initié artificier",
        nameEn: "Artificer Initiate",
        source: "TCoE",
        description: "INT ou CON +1. Vous apprenez un tour de magie et un sort de niveau 1 de la liste d'artificier (1 fois/repos long). Vous obtenez la maîtrise d'un outil d'artisan.",
        asiChoices: [
            {
                int: 1
            },
            {
                con: 1
            }
        ],
        effects: {
            flags: ['artificer-initiate-spells']
        }
    },
    {
        id: "chef",
        name: "Cuisinier",
        nameEn: "Chef",
        source: "TCoE",
        description: "CON ou SAG +1. Maîtrise des ustensiles de cuisine. Repas court : vous et jusqu'à 5 alliés récupérez 1d8 PV supplémentaires. Vous pouvez préparer des petits encas (action bonus pour stabiliser 0 PV).",
        asiChoices: [
            {
                con: 1
            },
            {
                wis: 1
            }
        ],
        effects: {
            flags: ['chef-heal-food']
        }
    },
    {
        id: "crusher",
        name: "Broyeur",
        nameEn: "Crusher",
        source: "TCoE",
        description: "FOR ou CON +1. Dégâts contondants : vous pouvez déplacer la cible de 1,5 m. Coup critique contondant : avantage sur les jets d'attaque contre la cible jusqu'au début de votre prochain tour.",
        asiChoices: [
            {
                str: 1
            },
            {
                con: 1
            }
        ],
        effects: {
            flags: ['crusher-move', 'crusher-advantage-crit']
        }
    },
    {
        id: "fighting-initiate",
        name: "Initié au combat",
        nameEn: "Fighting Initiate",
        source: "TCoE",
        prerequisite: "Maîtrise des armes martiales",
        description: "Prérequis : armes martiales. Vous apprenez un style de combat de votre choix. Si vous en avez déjà un, vous pouvez en changer à chaque montée de niveau.",
        effects: {
            flags: ['fighting-initiate-style']
        }
    },
    {
        id: "gunner",
        name: "Tireur",
        nameEn: "Gunner",
        source: "TCoE",
        description: "DEX +1. Maîtrise des armes à feu. Pas de désavantage à portée de contact. Ignorer la propriété Rechargement.",
        abilityScoreIncrease: {
            dex: 1
        },
        effects: {
            flags: ['gunner-firearms']
        }
    },
    {
        id: "metamagic-adept",
        name: "Adepte de la métamagie",
        nameEn: "Metamagic Adept",
        source: "TCoE",
        prerequisite: "Sorts",
        description: "Prérequis : sorts. Vous apprenez 2 options de métamagie et gagnez 2 points de sorcellerie (récupérés à chaque repos long).",
        effects: {
            flags: ['metamagic-adept-metamagic']
        }
    },
    {
        id: "piercer",
        name: "Perforateur",
        nameEn: "Piercer",
        source: "TCoE",
        description: "FOR ou DEX +1. Quand vous infligez des dégâts perforants, vous pouvez relancer un dé de dégâts. Coup critique perforant : vous ajoutez un dé de dégâts supplémentaire.",
        asiChoices: [
            {
                str: 1
            },
            {
                dex: 1
            }
        ],
        effects: {
            flags: ['piercer-reroll']
        }
    },
    {
        id: "poisoner",
        name: "Empoisonneur",
        nameEn: "Poisoner",
        source: "TCoE",
        description: "Maîtrise du kit d'empoisonneur. Créez poison (action bonus): appliqué en 1 action. Attaque d'arme empoisonnée : cible fait JS de CON DD 14 ou subit 2d8 poison + empoisonné 1 minute. Résistance au poison ignorée.",
        effects: {
            flags: ['poisoner-apply']
        }
    },
    {
        id: "shadow-touched",
        name: "Marqué par l'ombre",
        nameEn: "Shadow Touched",
        source: "TCoE",
        description: "INT, SAG ou CHA +1. Vous apprenez Invisibilité (1 fois/repos long) et un sort de niveau 1 de la liste d'illusion/nécromancie.",
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
            flags: ['shadow-touched-spells']
        }
    },
    {
        id: "skill-expert",
        name: "Expert en compétences",
        nameEn: "Skill Expert",
        source: "TCoE",
        description: "+1 à une caractéristique de votre choix. Maîtrise dans 1 compétence de votre choix. Expertise dans 1 compétence où vous êtes déjà compétent.",
        asiChoices: [
            { str: 1 },
            { dex: 1 },
            { con: 1 },
            { int: 1 },
            { wis: 1 },
            { cha: 1 }
        ],
        effects: {
            flags: ['skill-expert-expertise']
        }
    },
    {
        id: "slasher",
        name: "Tailladeur",
        nameEn: "Slasher",
        source: "TCoE",
        description: "FOR ou DEX +1. Dégâts tranchants : -3 m de vitesse à la cible jusqu'au début de votre prochain tour (1 fois/tour). Coup critique tranchant : désavantage à tous ses jets d'attaque jusqu'au début de votre prochain tour.",
        asiChoices: [
            {
                str: 1
            },
            {
                dex: 1
            }
        ],
        effects: {
            flags: ['slasher-speed-reduction', 'slasher-disadvantage-crit']
        }
    },
    {
        id: "telekinetic",
        name: "Télékinésiste",
        nameEn: "Telekinetic",
        source: "TCoE",
        description: "INT, SAG ou CHA +1. Apprenez mage main (invisible). Action bonus : déplacez une créature à 9 m de 1,5 m vers vous ou vous en éloignant (JS FOR DD 8 + bonus maîtrise + mod).",
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
            flags: ['telekinetic-action']
        }
    },
    {
        id: "telepathic",
        name: "Télépathique",
        nameEn: "Telepathic",
        source: "TCoE",
        description: "INT, SAG ou CHA +1. Communiquer télépathiquement avec n'importe quelle créature à 18 m connaissant au moins 1 langue. Lancer détection des pensées 1 fois/repos long sans emplacement.",
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
            flags: ['telepathic-communication']
        }
    }
]
