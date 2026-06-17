import type { Subclass } from './types'

export const rangerSubclasses: Subclass[] = [
    // ═══════════════════════════════════════════
    {
        id: 'hunter',
        classId: 'ranger',
        name: 'Chasseur',
        nameEn: 'Hunter',
        description: 'Un protecteur de la civilisation qui accepte de traquer les menaces les plus dangereuses.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Proie du chasseur', description: 'Choisissez : Tueur de colosses (+1d8 dégâts aux créatures avec tous leurs PV), Tueur de géants (pas d\'attaque d\'opportunité si vous touchez), ou Tueur de hordes (+1 attaque contre une créature adjacente).',
                rules: [
                    { type: 'select', name: 'Proie du chasseur', targetType: 'trait', count: 1, options: ['hunter-colossus', 'hunter-giant', 'hunter-horde'] }
                ]
            },
            {
                level: 7, name: 'Tactiques défensives', description: 'Choisissez : Échapper à la horde (désavantage des attaques d\'opportunité), Défense contre l\'assaut (avantage JS contre être renversé), ou Volonté de fer (avantage JS contre être effrayé).',
                rules: [
                    { type: 'select', name: 'Tactiques défensives', targetType: 'trait', count: 1, options: ['hunter-escape-horde', 'hunter-defense-assault', 'hunter-iron-will'] }
                ]
            },
            {
                level: 11, name: 'Attaque multiple', description: 'Choisissez : Volée (attaquez chaque créature à 3m), ou Attaque tourbillonnante (attaquez chaque créature à portée à 1,5m).',
                rules: [
                    { type: 'select', name: 'Attaque multiple', targetType: 'trait', count: 1, options: ['hunter-volley', 'hunter-whirlwind'] }
                ]
            },
            {
                level: 15, name: 'Défense supérieure', description: 'Choisissez : Esquive (demi-dégâts en réaction), Esquive surnaturelle, ou Riposte.',
                rules: [
                    { type: 'select', name: 'Défense supérieure', targetType: 'trait', count: 1, options: ['hunter-evasion', 'hunter-uncanny-dodge', 'hunter-riposte'] }
                ]
            },
        ],
    },
    {
        id: 'beast_master',
        classId: 'ranger',
        name: 'Maître des Bêtes',
        nameEn: 'Beast Master',
        description: 'Un rôdeur qui forme un lien mystique avec un compagnon animal, combattant côte à côte.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Compagnon du rôdeur', description: 'Gagnez un compagnon animal (FP 1/4 max, taille Moyenne ou inférieure). Il obéit à vos commandes et utilise votre bonus de maîtrise.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'ranger-companion' }
                ]
            },
            {
                level: 7, name: 'Entraînement exceptionnel', description: 'Votre compagnon peut Foncer, Se désengager ou Aider en action bonus.',
                rules: [
                    { type: 'condition', condition: 'exceptional-training', description: 'Le compagnon peut Foncer, Se désengager ou Aider en action bonus' }
                ]
            },
            {
                level: 11, name: 'Furie bestiale', description: 'Votre compagnon peut attaquer deux fois quand vous lui ordonnez d\'attaquer.',
                rules: [
                    { type: 'condition', condition: 'bestial-fury', description: 'Le compagnon attaque deux fois sur commande' }
                ]
            },
            {
                level: 15, name: 'Partager les sorts', description: 'Lorsque vous lancez un sort sur vous-même, votre compagnon en bénéficie aussi s\'il est à 9m.',
                rules: [
                    { type: 'condition', condition: 'share-spells', description: 'Le compagnon bénéficie aussi des sorts lancés sur vous-même à 9m' }
                ]
            },
        ],
    },
    {
        id: 'gloom_stalker',
        classId: 'ranger',
        name: 'Traqueur des Ombres',
        nameEn: 'Gloom Stalker',
        description: 'Un rôdeur maître des embuscades, à l\'aise dans les ténèbres les plus profondes.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Embuscade redoutable', description: '+mod SAG à l\'initiative. Au 1er tour : +3m de vitesse et 1 attaque supplémentaire (+1d8 dégâts si touche).',
                rules: [
                    { type: 'condition', condition: 'dread-ambusher-initiative', description: '+mod SAG à l\'initiative' },
                    { type: 'damage_bonus', value: 0, condition: 'dread-ambusher-first-turn', damageType: 'weapon' }
                ]
            },
            {
                level: 3, name: 'Vision dans l\'ombre', description: 'Vision dans le noir 18m (ou +9m si existante). Invisible aux créatures qui utilisent la vision dans le noir pour vous voir.',
                rules: [
                    { type: 'condition', condition: 'umbral-sight', description: 'Vision dans le noir 18m, invisible aux visions dans le noir' }
                ]
            },
            {
                level: 7, name: 'Esprit de fer', description: 'Maîtrise des JS Sagesse (ou INT/CHA si déjà maîtrisé).',
                rules: [
                    { type: 'grant', targetType: 'proficiency', targetId: 'ID_SAVE_WIS' }
                ]
            },
            {
                level: 11, name: 'Déluge du traqueur', description: 'Si vous manquez une attaque, effectuez une attaque supplémentaire dans la même action.',
                rules: [
                    { type: 'condition', condition: 'stalkers-flurry', description: 'Attaque supplémentaire si vous manquez une attaque' }
                ]
            },
            {
                level: 15, name: 'Esquive ténébreuse', description: 'Réaction quand une créature vous attaque (sans avantage) : imposez un désavantage à l\'attaque. Touché ou non, téléportez-vous à 9m.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'shadowy-dodge' }
                ]
            },
        ],
    },
    {
        id: 'horizon_walker',
        classId: 'ranger',
        name: 'Marcheur de l\'Horizon',
        nameEn: 'Horizon Walker',
        description: 'Un rôdeur qui protège le monde contre les menaces venues d\'autres plans d\'existence.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Détection de portail', description: 'Action : détectez la distance et direction du portail planaire le plus proche à 1,5 km (1/repos court ou long).',
                rules: [
                    { type: 'resource', id: 'detect-portal', name: 'Détection de portail', progression: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }
                ]
            },
            {
                level: 3, name: 'Guerrier planaire', description: 'Action bonus : désignez une créature à 9m. Votre prochaine attaque ce tour inflige tous les dégâts en force +1d8 force (+2d8 au niv 11).',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'planar-warrior', damageType: 'force' }
                ]
            },
            {
                level: 7, name: 'Pas éthéré', description: 'Action bonus : lancez Forme éthérée (fin au tour). Bonus de maîtrise fois par repos long.',
                rules: [
                    { type: 'resource', id: 'ethereal-step', name: 'Pas éthéré', progression: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 11, name: 'Frappe distante', description: 'Téléportez-vous de 3m avant chaque attaque. Si vous attaquez 2+ créatures différentes, 1 attaque supplémentaire contre une 3e.',
                rules: [
                    { type: 'condition', condition: 'distant-strike', description: 'Téléportation de 3m avant chaque attaque, attaque supplémentaire si 2+ cibles' }
                ]
            },
            {
                level: 15, name: 'Défense spectrale', description: 'Réaction quand vous subissez des dégâts : résistance à tous les dégâts de cette attaque ce tour.',
                rules: [
                    { type: 'condition', condition: 'spectral-defense', description: 'Résistance à tous les dégâts d\'une attaque en réaction' }
                ]
            },
        ],
    },
    {
        id: 'monster_slayer',
        classId: 'ranger',
        name: 'Pourfendeur',
        nameEn: 'Monster Slayer',
        description: 'Un rôdeur spécialisé dans la traque et la destruction des créatures surnaturelles.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Sens du chasseur', description: 'Action : apprenez les immunités, résistances ou vulnérabilités d\'une créature à 18m. Mod SAG fois par repos long.',
                rules: [
                    { type: 'resource', id: 'hunters-sense', name: 'Sens du chasseur', progression: [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4], recovery: 'long' }
                ]
            },
            {
                level: 3, name: 'Proie du pourfendeur', description: 'Action bonus : désignez une créature à 18m. 1/tour, +1d6 dégâts à votre première attaque touchée. Dure jusqu\'au repos court/long.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'slayers-prey', damageType: 'weapon' }
                ]
            },
            {
                level: 7, name: 'Défense surnaturelle', description: '+1d6 aux JS et tests de caractéristique imposés par la cible de Proie du pourfendeur.',
                rules: [
                    { type: 'condition', condition: 'supernatural-defense', description: '+1d6 aux JS et tests imposés par la Proie' }
                ]
            },
            {
                level: 11, name: 'Némésis des mages', description: 'Réaction quand une créature à 18m lance un sort ou se téléporte : JS SAG ou le sort/téléportation échoue (1/repos court ou long).',
                rules: [
                    { type: 'resource', id: 'magic-users-nemesis', name: 'Némésis des mages', progression: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }
                ]
            },
            {
                level: 15, name: 'Contre du pourfendeur', description: 'Réaction quand la cible de votre Proie vous force à faire un JS : effectuez une attaque d\'arme contre elle.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'slayers-counter' }
                ]
            },
        ],
    },
    {
        id: 'fey_wanderer',
        classId: 'ranger',
        name: 'Vagabond Féerique',
        nameEn: 'Fey Wanderer',
        description: 'Un rôdeur imprégné de la magie de la Féerie, mêlant prouesses martiales et enchantements.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Frappes redoutables', description: '1/tour quand vous touchez une créature : +1d4 dégâts psychiques (+1d6 au niv 11).',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'dreadful-strikes', damageType: 'psychic' }
                ]
            },
            {
                level: 3, name: 'Charme surnaturel', description: '+mod SAG aux jets de Charisme. Maîtrise de Tromperie, Représentation ou Persuasion.',
                rules: [
                    { type: 'condition', condition: 'otherworldly-glamour', description: '+mod SAG aux jets de Charisme' },
                    { type: 'select', name: 'Compétence féerique', targetType: 'skill', count: 1, options: ['ID_SKILL_DECEPTION', 'ID_SKILL_PERFORMANCE', 'ID_SKILL_PERSUASION'] }
                ]
            },
            {
                level: 7, name: 'Charme retors', description: 'Avantage JS contre charmé/effrayé. Réaction quand une créature à 36m réussit un JS charmé/effrayé : forcez une autre créature à 36m à faire un JS SAG ou être charmée/effrayée 1 min.',
                rules: [
                    { type: 'condition', condition: 'beguiling-twist', description: 'Avantage JS contre charmé/effrayé, réaction pour transférer l\'effet' }
                ]
            },
            {
                level: 11, name: 'Renforts féeriques', description: 'Lancez Invoquer une fée 1/repos long sans emplacement (peut être sans concentration, durée 1 min).',
                rules: [
                    { type: 'spell', spellId: 'summon-fey', alwaysKnown: true }
                ]
            },
            {
                level: 15, name: 'Présence brumeuse', description: 'Réaction quand vous subissez des dégâts : devenez invisible et téléportez-vous à 9m (invisible jusqu\'au début de votre prochain tour). Bonus de maîtrise fois par repos long.',
                rules: [
                    { type: 'resource', id: 'misty-presence', name: 'Présence brumeuse', progression: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
        ],
    },
    {
        id: 'swarmkeeper',
        classId: 'ranger',
        name: 'Gardien des Essaims',
        nameEn: 'Swarmkeeper',
        description: 'Un rôdeur lié à un essaim d\'esprits de la nature qui l\'assistent au combat.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Essaim rassemblé', description: '1/tour après une attaque touchée : +1d6 perforants, OU JS FOR ou repoussé 4,5m, OU vous vous déplacez de 1,5m.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'gathered-swarm', damageType: 'piercing' }
                ]
            },
            {
                level: 3, name: 'Main de mage de l\'essaim', description: 'Apprenez Main de mage (forme d\'essaim). Sorts bonus : Lueurs féeriques, Toile d\'araignée, Forme gazeuse, Œil magique, Fléau d\'insectes.',
                rules: [
                    { type: 'spell', spellId: 'mage-hand', alwaysKnown: true }
                ]
            },
            {
                level: 7, name: 'Marée grouillante', description: 'Action bonus : vol 3m + vol stationnaire pendant 1 minute. Bonus de maîtrise fois par repos long.',
                rules: [
                    { type: 'resource', id: 'swarming-spirit', name: 'Marée grouillante', progression: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 11, name: 'Essaim puissant', description: 'Dégâts passent à 1d8. Poussée peut aussi mettre à terre. Déplacement personnel donne un abri partiel.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'mighty-swarm', damageType: 'piercing' }
                ]
            },
            {
                level: 15, name: 'Dispersion en essaim', description: 'Réaction quand vous subissez des dégâts : résistance aux dégâts et téléportation à 9m. Bonus de maîtrise fois par repos long.',
                rules: [
                    { type: 'resource', id: 'swarm dispersal', name: 'Dispersion en essaim', progression: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
        ],
    },
]
