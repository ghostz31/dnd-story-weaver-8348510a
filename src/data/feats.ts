// ─────────────────────────────────────────────
// src/data/feats.ts  —  Dons (Feats) D&D 5e
// Sources : PHB, XGtE, TCoE
// ─────────────────────────────────────────────

import type { FeatEffects } from '../types/feat'

export type FeatSource = 'PHB' | 'XGtE' | 'TCoE'

export interface Feat {
    id: string
    name: string
    nameEn: string
    source: FeatSource
    description: string
    prerequisite?: string
    abilityScoreIncrease?: Partial<Record<string, number>>
    asiChoices?: Partial<Record<string, number>>[]
    spells?: string[]
    hpBonusPerLevel?: number
    speedBonus?: number
    savingThrowProficiency?: string
    skillProficiencies?: string[]
    languages?: string[]
    effects?: FeatEffects
}

export const feats: Feat[] = [
    {
        id: "alert",
        name: "Vigilance",
        nameEn: "Alert",
        source: "PHB",
        description: "+5 à l'initiative. Vous ne pouvez pas être surpris quand vous êtes conscient. Les créatures que vous ne voyez pas n'obtiennent pas d'avantage sur les jets d'attaque contre vous.",
        effects: {
            passive: {
                initiativeBonus: 5
            },
            flags: [
                "alert-immune-surprise",
                "alert-no-invisible-advantage"
            ]
        }
    },
    {
        id: "athlete",
        name: "Athlète",
        nameEn: "Athlete",
        source: "PHB",
        description: "FOR ou DEX +1. Se lever d'une position à terre ne coûte que 1,5 m de déplacement. Escalader ne vous coûte aucun déplacement supplémentaire. Courir et sauter avec élan ne nécessite qu'1,5 m de course.",
        asiChoices: [
            {
                str: 1
            },
            {
                dex: 1
            }
        ],
        effects: {
            flags: ['athlete-stand-up']
        }
    },
    {
        id: "actor",
        name: "Acteur",
        nameEn: "Actor",
        source: "PHB",
        description: "CHA +1. Avantage sur Tromperie et Représentation pour vous faire passer pour quelqu'un d'autre. Vous pouvez imiter la voix et les manières d'une personne que vous avez entendue parler au moins 1 minute.",
        abilityScoreIncrease: {
            cha: 1
        },
        effects: {
            flags: ['actor-deception-performance']
        }
    },
    {
        id: "charger",
        name: "Chargeur",
        nameEn: "Charger",
        source: "PHB",
        description: "Quand vous utilisez votre action pour Foncer, vous pouvez effectuer une attaque au corps à corps ou bousculer en action bonus. Si vous vous déplacez d'au moins 3 m avant l'attaque, +5 aux dégâts ou repoussez la cible de 3 m.",
        effects: {
            flags: ['charger-bonus-action']
        }
    },
    {
        id: "crossbow-expert",
        name: "Expert à l'arbalète",
        nameEn: "Crossbow Expert",
        source: "PHB",
        description: "Ignorer l'inconvénient de tir à courte portée (combat au corps à corps). Recharger une arbalète ne coûte plus de déplacement. Attaque légère ou à main unique au corps à corps : action bonus de tir à l'arbalète de poing.",
        effects: {
            flags: ['crossbow-expert-bonus-attack', 'crossbow-expert-no-disadvantage']
        }
    },
    {
        id: "defensive-duelist",
        name: "Duelliste défensif",
        nameEn: "Defensive Duelist",
        source: "PHB",
        prerequisite: "DEX 13",
        description: "Prérequis : DEX 13. En tenant une arme légère de finesse dans une main, vous pouvez dépenser votre réaction pour ajouter votre bonus de maîtrise à votre CA contre une attaque au corps à corps.",
        effects: {
            flags: ['defensive-duelist-reaction']
        }
    },
    {
        id: "dual-wielder",
        name: "Combat à deux armes",
        nameEn: "Dual Wielder",
        source: "PHB",
        description: "+1 à la CA en tenant une arme dans chaque main. Vous pouvez utiliser le combat à deux armes même si vos armes n'ont pas la propriété légère. Vous pouvez dégainer ou rengainer deux armes en une seule fois.",
        effects: {
            passive: {
                acBonus: 1
            },
            flags: ['dual-wielder-draw-two']
        }
    },
    {
        id: "dungeon-delver",
        name: "Explorateur de donjons",
        nameEn: "Dungeon Delver",
        source: "PHB",
        description: "Avantage sur les jets pour détecter les portes secrètes. Avantage sur les JS contre les pièges. Résistance aux dégâts des pièges. Vous pouvez chercher des pièges au rythme normal (sans désavantage).",
        effects: {
            flags: ['dungeon-delver-advantage-traps', 'dungeon-delver-resistance-traps']
        }
    },
    {
        id: "durable",
        name: "Endurance",
        nameEn: "Durable",
        source: "PHB",
        description: "CON +1. Quand vous lancez un dé de vie pour récupérer des PV lors d'un repos court, vous récupérez le maximum possible. Si vous récupérez des PV au début d'un tour, le minimum est de 2 × bonus de maîtrise.",
        abilityScoreIncrease: {
            con: 1
        },
        effects: {
            flags: ['durable-die-max']
        }
    },
    {
        id: "elemental-adept",
        name: "Adepte élémentaire",
        nameEn: "Elemental Adept",
        source: "PHB",
        description: "Choisissez un type de dégâts (acide, froid, feu, foudre, tonnerre). Les sorts de ce type ignorent la résistance. Les 1 sur les dés de dégâts comptent comme des 2.",
        effects: {
            flags: ['elemental-adept-reroll']
        }
    },
    {
        id: "grappler",
        name: "Lutteur",
        nameEn: "Grappler",
        source: "PHB",
        prerequisite: "FOR 13",
        description: "Prérequis : FOR 13. Avantage sur les jets d'attaque contre les créatures immobilisées par vous. Vous pouvez utiliser votre action pour épingler une créature empoignée : les deux êtes immobilisés.",
        effects: {
            flags: ['grappler-advantage', 'grappler-pin']
        }
    },
    {
        id: "great-weapon-master",
        name: "Maîtrise des armes de guerre",
        nameEn: "Great Weapon Master",
        source: "PHB",
        description: "Coup critique ou mise à mort : attaque bonus en action bonus. Avant de porter une attaque avec une arme à deux mains ou polyvalente, vous pouvez choisir de prendre −5 en attaque pour +10 aux dégâts.",
        effects: {
            toggles: {
                powerAttack: {
                    label: 'Attaque puissante',
                    description: '-5 en attaque, +10 aux dégâts (arme lourde/polyvalente)',
                    activeByDefault: false,
                    effects: {
                        attackModifier: -5,
                        damageModifier: 10,
                        condition: 'heavy-weapon'
                    }
                }
            }
        }
    },
    {
        id: "healer",
        name: "Guérisseur",
        nameEn: "Healer",
        source: "PHB",
        description: "Kit de soins : stabiliser une créature (0 PV) sans jet. Dépenser un kit de soins restaure 1 + 1d6 + niveau du personnage PV (une fois par personnage à long repos).",
        effects: {
            flags: ['healer-action-bonus']
        }
    },
    {
        id: "heavily-armored",
        name: "Armure lourde",
        nameEn: "Heavily Armored",
        source: "PHB",
        prerequisite: "Maîtrise des armures intermédiaires",
        description: "Prérequis : armures intermédiaires. FOR +1. Vous obtenez la maîtrise des armures lourdes.",
        abilityScoreIncrease: {
            str: 1
        },
        effects: {
            flags: ['heavily-armored-heavy']
        }
    },
    {
        id: "heavy-armor-master",
        name: "Expert en armure lourde",
        nameEn: "Heavy Armor Master",
        source: "PHB",
        prerequisite: "Maîtrise des armures lourdes",
        description: "Prérequis : maîtrise armures lourdes. FOR +1. En armure lourde, les dégâts des attaques sans magie (tranchants, perforants, contondants) sont réduits de 3.",
        abilityScoreIncrease: {
            str: 1
        },
        effects: {
            flags: ['heavy-armor-master-damage-reduction']
        }
    },
    {
        id: "inspiring-leader",
        name: "Chef inspirant",
        nameEn: "Inspiring Leader",
        source: "PHB",
        prerequisite: "CHA 13",
        description: "Prérequis : CHA 13. 10 min de discours pour jusqu'à 6 alliés (dont vous): ils gagnent chacun des PV temporaires égaux à votre niveau + mod CHA. Un allié ne peut bénéficier de cela qu'une fois jusqu'au prochain repos court.",
        effects: {
            flags: ['inspiring-leader-temp-hp']
        }
    },
    {
        id: "keen-mind",
        name: "Esprit acéré",
        nameEn: "Keen Mind",
        source: "PHB",
        description: "INT +1. Vous savez toujours dans quelle direction se trouve le nord. Vous savez toujours combien d'heures il reste avant le prochain lever ou coucher de soleil. Vous pouvez mémoriser parfaitement tout ce que vous avez vu ou entendu au cours du dernier mois.",
        abilityScoreIncrease: {
            int: 1
        },
        effects: {
            flags: ['keen-mind-direction']
        }
    },
    {
        id: "lightly-armored",
        name: "Armure légère",
        nameEn: "Lightly Armored",
        source: "PHB",
        description: "FOR ou DEX +1. Vous obtenez la maîtrise des armures légères.",
        asiChoices: [
            { str: 1 },
            { dex: 1 }
        ],
        effects: {
            flags: ['lightly-armored-light']
        }
    },
    {
        id: "linguist",
        name: "Linguiste",
        nameEn: "Linguist",
        source: "PHB",
        description: "INT +1. Vous apprenez trois langues de votre choix. Vous pouvez créer des codes écrits que seuls vous et les personnes que vous désignez pouvez lire.",
        abilityScoreIncrease: {
            int: 1
        },
        effects: {
            flags: ['linguist-languages']
        }
    },
    {
        id: "lucky",
        name: "Chanceux",
        nameEn: "Lucky",
        source: "PHB",
        description: "Vous avez 3 points de chance (récupérés à chaque long repos). Dépensez 1 point pour relancer un d20 après avoir vu le résultat d'un jet d'attaque, de caractéristique ou de sauvegarde (le vôtre ou celui d'un ennemi contre vous).",
        effects: {
            lucky: { maxCharges: 3 }
        }
    },
    {
        id: "mage-slayer",
        name: "Tueur de mages",
        nameEn: "Mage Slayer",
        source: "PHB",
        description: "Réaction : attaque contre un lanceur de sorts à portée de corps à corps. Concentration après dégâts : désavantage au JS de concentration. Avantage sur vos JS contre les sorts lancés par des créatures à portée de corps à corps.",
        effects: {
            flags: ['mage-slayer-reaction', 'mage-slayer-advantage-save']
        }
    },
    {
        id: "magic-initiate",
        name: "Initié à la magie",
        nameEn: "Magic Initiate",
        source: "PHB",
        description: "Choisissez une classe de lanceur de sorts. Vous apprenez 2 tours de magie et 1 sort de niveau 1 de cette classe (1 fois/repos long). La caractéristique de lancement est celle de la classe choisie.",
        effects: {
            flags: ['magic-initiate-spells']
        }
    },
    {
        id: "martial-adept",
        name: "Adepte martial",
        nameEn: "Martial Adept",
        source: "PHB",
        description: "Vous apprenez deux manœuvres de votre choix parmi celles disponibles pour le Guerrier. Vous gagnez 1 dé de supériorité (d6, récupéré à chaque repos court ou long).",
        effects: {
            flags: ['martial-adept-maneuvers']
        }
    },
    {
        id: "medium-armor-master",
        name: "Expert en armure intermédiaire",
        nameEn: "Medium Armor Master",
        source: "PHB",
        prerequisite: "Maîtrise des armures intermédiaires",
        description: "Prérequis : armures intermédiaires. Pas de désavantage en Discrétion. Bonus de DEX max à la CA : +3 au lieu de +2.",
        effects: {
            flags: ['medium-armor-master-stealth']
        }
    },
    {
        id: "mobile",
        name: "Mobile",
        nameEn: "Mobile",
        source: "PHB",
        description: "+3 m de vitesse. Foncer dans un terrain difficile ne coûte pas de déplacement supplémentaire. Après une attaque au corps à corps (touchée ou non), la cible ne peut pas effectuer d'attaque d'opportuité contre vous ce tour.",
        effects: {
            passive: {
                speedBonus: 3
            },
            flags: ['mobile-no-opportunity-attack']
        }
    },
    {
        id: "moderately-armored",
        name: "Armure intermédiaire",
        nameEn: "Moderately Armored",
        source: "PHB",
        prerequisite: "Maîtrise des armures légères",
        description: "Prérequis : armures légères. FOR ou DEX +1. Vous obtenez la maîtrise des armures intermédiaires et des boucliers.",
        abilityScoreIncrease: {
            str: 1
        },
        effects: {
            flags: ['moderately-armored-medium']
        }
    },
    {
        id: "mounted-combatant",
        name: "Combattant monté",
        nameEn: "Mounted Combatant",
        source: "PHB",
        description: "Avantage sur les jets d'attaque contre les créatures à pied plus petites que votre monture. Cibler votre monture au lieu de vous (redirigez l'attaque). Monture : réussite au JS = pas de dégâts; échec = demi-dégâts.",
        effects: {
            flags: ['mounted-combatant-mounted']
        }
    },
    {
        id: "observant",
        name: "Observateur",
        nameEn: "Observant",
        source: "PHB",
        description: "INT ou SAG +1. Lire les lèvres. +5 aux jets de Perception et d'Investigation passifs.",
        asiChoices: [
            {
                int: 1
            },
            {
                wis: 1
            }
        ],
        effects: {
            flags: ['observant-passive-bonus']
        }
    },
    {
        id: "polearm-master",
        name: "Maîtrise des armes d'hast",
        nameEn: "Polearm Master",
        source: "PHB",
        description: "Avec hallebarde, pique ou canne-épée : attaque bonus au corps à corps (crosse, d4 contondant). Zone de contrôle : attaque d'opportunité quand une créature entre dans votre portée (3 m).",
        effects: {
            flags: ['polearm-master-bonus-attack', 'polearm-master-opportunity-entry']
        }
    },
    {
        id: "resilient",
        name: "Résilient",
        nameEn: "Resilient",
        source: "PHB",
        description: "Choisissez une caractéristique. +1 à cette caractéristique. Vous obtenez la maîtrise des jets de sauvegarde de cette caractéristique.",
        asiChoices: [
            {
                str: 1
            },
            {
                dex: 1
            },
            {
                con: 1
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
            flags: ['resilient-save']
        }
    },
    {
        id: "ritual-caster",
        name: "Lanceur de rituels",
        nameEn: "Ritual Caster",
        source: "PHB",
        description: "Vous obtenez un livre de rituels contenant deux sorts de niveau 1 de votre choix (rituels). Vous pouvez ajouter d'autres rituels au livre. La caractéristique de lancement est INT, SAG ou CHA (choix permanent).",
        effects: {
            flags: ['ritual-caster-rituals']
        }
    },
    {
        id: "savage-attacker",
        name: "Assaillant sauvage",
        nameEn: "Savage Attacker",
        source: "PHB",
        description: "Une fois par tour, quand vous jetez des dés de dégâts pour une attaque au corps à corps, vous pouvez relancer les dés et utiliser le plus haut total.",
        effects: {
            flags: ['savage-attacker-reroll']
        }
    },
    {
        id: "sentinel",
        name: "Sentinelle",
        nameEn: "Sentinel",
        source: "PHB",
        description: "Attaque d'opportunité : vitesse de la cible tombe à 0 si touchée. La réaction de Désengagement ne vous empêche pas d'effectuer une attaque d'opportunité. Réaction : attaque lorsqu'une créature à portée attaque un autre allié.",
        effects: {
            flags: ['sentinel-reduce-speed', 'sentinel-reaction-ally', 'sentinel-no-disengage']
        }
    },
    {
        id: "sharpshooter",
        name: "Tireur d'élite",
        nameEn: "Sharpshooter",
        source: "PHB",
        description: "Attaque à longue portée sans désavantage. Ignorer couverture mi-haute ou trois quarts. Avant d'attaquer à distance, vous pouvez accepter −5 d'attaque pour +10 aux dégâts.",
        effects: {
            toggles: {
                powerShot: {
                    label: 'Tir puissant',
                    description: '-5 en attaque, +10 aux dégâts (distance)',
                    activeByDefault: false,
                    effects: {
                        attackModifier: -5,
                        damageModifier: 10,
                        condition: 'ranged-weapon'
                    }
                }
            },
            flags: ['sharpshooter-ignore-cover', 'sharpshooter-no-long-range-disadvantage']
        }
    },
    {
        id: "shield-master",
        name: "Maître du bouclier",
        nameEn: "Shield Master",
        source: "PHB",
        description: "Si vous attaquez, poussez la cible de 1,5 m en action bonus. Ajoutez le bouclier (+2) aux JS de DEX. Si un effet demande un JS de DEX pour demi-dégâts : succès = pas de dégâts, échec = demi-dégâts.",
        effects: {
            flags: ['shield-master-shove-bonus', 'shield-master-dex-save', 'shield-master-no-damage-save']
        }
    },
    {
        id: "skilled",
        name: "Compétent",
        nameEn: "Skilled",
        source: "PHB",
        description: "Vous gagnez la maîtrise de trois compétences ou outils de votre choix.",
        effects: {
            flags: ['skilled-proficiencies']
        }
    },
    {
        id: "skulker",
        name: "Discret",
        nameEn: "Skulker",
        source: "PHB",
        prerequisite: "DEX 13",
        description: "Prérequis : DEX 13. Vous pouvez vous cacher même quand vous êtes légèrement masqué. Quand vous êtes caché et que vous ratez une attaque à distance, votre position n'est pas révélée. Pas de désavantage en Perception dans la pénombre.",
        effects: {
            flags: ['skulker-hide']
        }
    },
    {
        id: "spell-sniper",
        name: "Tireur magique",
        nameEn: "Spell Sniper",
        source: "PHB",
        description: "Double portée des sorts avec jet d'attaque. Les jets d'attaque de sorts ignorent le couvert partiel et important.",
        effects: {
            flags: ['spell-sniper-range']
        }
    },
    {
        id: "tavern-brawler",
        name: "Bagarreur de taverne",
        nameEn: "Tavern Brawler",
        source: "PHB",
        description: "FOR ou CON +1. Maîtrise des armes improvisées et des poings nus (1d4 contondant). Attaque à mains nues ou arme improvisée : empoigner en action bonus.",
        asiChoices: [
            {
                str: 1
            },
            {
                con: 1
            }
        ],
        effects: {
            flags: ['tavern-brawler-improvised', 'tavern-brawler-grapple-bonus']
        }
    },
    {
        id: "tough",
        name: "Robuste",
        nameEn: "Tough",
        source: "PHB",
        description: "Votre maximum de PV augmente de 2 pour chaque niveau (présent et futur). Soit +2 par niveau de personnage acquis.",
        effects: {
            passive: {
                hpBonusPerLevel: 2
            }
        }
    },
    {
        id: "war-caster",
        name: "Lanceur de sorts de guerre",
        nameEn: "War Caster",
        source: "PHB",
        description: "Prérequis : sorts possible. Avantage aux JS de concentration. Lancer des sorts avec bouclier ou arme en main (composantes somatiques). Réaction : lancer un sort offensif comme attaque d'opportunité.",
        effects: {
            flags: ['war-caster-concentration', 'war-caster-spell-opportunity', 'war-caster-somatic-shield']
        }
    },
    {
        id: "weapon-master",
        name: "Maîtrise des armes",
        nameEn: "Weapon Master",
        source: "PHB",
        description: "FOR ou DEX +1. Maîtrise de 4 armes de combat de votre choix.",
        asiChoices: [
            { str: 1 },
            { dex: 1 }
        ],
        effects: {
            flags: ['weapon-master-weapons']
        }
    },
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

// ─── Helpers ───
export function getFeatById(id: string): Feat | undefined {
    return feats.find(f => f.id === id)
}

export function getFeatsBySource(source: FeatSource): Feat[] {
    return feats.filter(f => f.source === source)
}

export function getAllFeats(): Feat[] {
    return feats
}

export function getFeatHpBonusPerLevel(featIds: string[]): number {
    return featIds
        .map(id => getFeatById(id))
        .filter((f): f is Feat => !!f)
        .reduce((sum, f) => sum + (f.hpBonusPerLevel || f.effects?.passive?.hpBonusPerLevel || 0), 0)
}

export function getFeatSpeedBonus(featIds: string[]): number {
    return featIds
        .map(id => getFeatById(id))
        .filter((f): f is Feat => !!f)
        .reduce((sum, f) => sum + (f.speedBonus || f.effects?.passive?.speedBonus || 0), 0)
}

export function getFeatSavingThrowProficiencies(
    featIds: string[],
    _asiChoices?: Record<number, import('../types/character').AsiChoice>
): string[] {
    const result: string[] = []
    for (const featId of featIds) {
        const feat = getFeatById(featId)
        if (feat?.savingThrowProficiency) {
            result.push(feat.savingThrowProficiency)
        }
    }
    return result
}

export function getFeatSpells(featIds: string[]): string[] {
    const result: string[] = []
    for (const featId of featIds) {
        const feat = getFeatById(featId)
        if (feat?.spells) {
            result.push(...feat.spells)
        }
    }
    return result
}

export function isFeatSpell(spellName: string, featIds: string[]): boolean {
    return getFeatSpells(featIds).some(s =>
        s.toLowerCase() === spellName.toLowerCase()
    )
}
