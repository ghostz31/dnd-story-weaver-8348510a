import type { Subclass } from './types'

export const monkSubclasses: Subclass[] = [
    // ═══════════════════════════════════════════
    {
        id: 'open_hand',
        classId: 'monk',
        name: 'Voie de la Paume',
        nameEn: 'Way of the Open Hand',
        description: 'La maîtrise totale des arts martiaux, focalisée sur le combat à mains nues et la manipulation du Ki.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Technique de la paume', description: 'Après avoir touché avec Déluge de coups : poussez de 4,5m (JS DEX), mettez à terre (JS DEX), ou empêchez les réactions (pas de JS).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'open-hand-technique' }
                ]
            },
            {
                level: 6, name: 'Plénitude physique', description: 'En action, récupérez PV = 3 × niveau de Moine (1/repos long).',
                rules: [
                    { type: 'resource', id: 'wholeness-of-body', name: 'Plénitude physique', progression: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }
                ]
            },
            {
                level: 11, name: 'Tranquillité', description: 'Au repos long, gagnez le bénéfice de Sanctuaire jusqu\'au début de votre prochain repos long (DD = 8 + mod SAG + bonus de maîtrise).',
                rules: [
                    { type: 'condition', condition: 'tranquility', description: 'Sanctuaire au repos long' }
                ]
            },
            {
                level: 17, name: 'Paume vibratoire', description: 'Touchez une créature et infligez-lui des vibrations. Vous pouvez les déclencher à tout moment pour la réduire à 0 PV (JS CON DD de Ki).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'quivering-palm' }
                ]
            },
        ],
    },
    {
        id: 'shadow',
        classId: 'monk',
        name: 'Voie de l\'Ombre',
        nameEn: 'Way of Shadow',
        description: 'Un ninja qui canalise le Ki pour maîtriser les ténèbres et se téléporter entre les ombres.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Arts de l\'ombre', description: 'Dépensez 2 Ki pour lancer Ténèbres, Vision dans le noir, Passage sans trace, ou Silence.',
                rules: [
                    { type: 'spell', spellId: 'darkness', alwaysKnown: true },
                    { type: 'spell', spellId: 'darkvision', alwaysKnown: true },
                    { type: 'spell', spellId: 'pass-without-trace', alwaysKnown: true },
                    { type: 'spell', spellId: 'silence', alwaysKnown: true }
                ]
            },
            {
                level: 6, name: 'Pas d\'ombre', description: 'Téléportez-vous de 18m d\'une zone de lumière faible/ténèbres à une autre en action bonus. Avantage à la première attaque de mêlée du même tour.',
                rules: [
                    { type: 'condition', condition: 'shadow-step', description: 'Téléportation entre ombres, avantage première attaque' }
                ]
            },
            {
                level: 11, name: 'Manteau d\'ombres', description: 'Devenez invisible dans une zone de lumière faible/ténèbres (en action). L\'invisibilité dure jusqu\'à ce que vous attaquiez ou lanciez un sort.',
                rules: [
                    { type: 'condition', condition: 'cloak-of-shadows', description: 'Invisible dans lumière faible/ténèbres' }
                ]
            },
            {
                level: 17, name: 'Opportuniste', description: 'Effectuez une attaque de mêlée en réaction lorsqu\'un allié touche une créature à 1,5m de vous.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'opportunist' }
                ]
            },
        ],
    },
    {
        id: 'drunken_master',
        classId: 'monk',
        name: 'Voie de l\'Ivrogne',
        nameEn: 'Way of the Drunken Master',
        description: 'Un moine qui se déplace de façon imprévisible et chancelante, rendant ses mouvements impossibles à anticiper.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Maîtrise supplémentaire', description: 'Maîtrise de Représentation et des outils de brasseur.',
                rules: [
                    { type: 'grant', targetType: 'proficiency', targetId: 'ID_SKILL_PERFORMANCE' },
                    { type: 'grant', targetType: 'proficiency', targetId: 'brewers-supplies' }
                ]
            },
            {
                level: 3, name: 'Technique de l\'ivrogne', description: 'Quand vous utilisez Déluge de coups, vous bénéficiez de Désengagement et +3m de vitesse jusqu\'à la fin du tour.',
                rules: [
                    { type: 'condition', condition: 'drunken-technique', description: 'Déluge de coups = Désengagement +3m vitesse' }
                ]
            },
            {
                level: 6, name: 'Démarche chancelante', description: 'Se relever d\'à terre ne coûte que 1,5m. Réaction quand une attaque CàC vous manque : dépensez 1 Ki pour rediriger l\'attaque contre une créature à 1,5m.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'tipsy-sway' }
                ]
            },
            {
                level: 11, name: 'Chance de l\'ivrogne', description: 'Dépensez 2 Ki pour annuler le désavantage sur un jet de caractéristique, d\'attaque ou de sauvegarde.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'drunkards-luck' }
                ]
            },
            {
                level: 17, name: 'Frénésie enivrée', description: 'Déluge de coups : effectuez jusqu\'à 5 attaques (action bonus), chacune contre une cible différente.',
                rules: [
                    { type: 'condition', condition: 'intoxicated-frenzy', description: 'Déluge de coups = jusqu\'à 5 attaques contre cibles différentes' }
                ]
            },
        ],
    },
    {
        id: 'kensei',
        classId: 'monk',
        name: 'Voie du Kensei',
        nameEn: 'Way of the Kensei',
        description: 'Un maître d\'armes qui considère ses armes comme une extension de son corps, alliant précision et beauté martiale.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Voie du kensei', description: 'Choisissez 2 armes kensei (1 CàC, 1 à distance, non lourde/spéciale ou arc long). Parade agile (+2 CA si frappe à mains nues + arme kensei CàC). Tir du kensei (+1d4 dégâts à distance, action bonus). + calligraphie/peinture.',
                rules: [
                    { type: 'select', name: 'Armes Kensei', targetType: 'weapon', count: 2, options: ['longsword', 'shortsword', 'longbow', 'whip', 'scimitar'] },
                    { type: 'condition', condition: 'agile-parry', description: '+2 CA si frappe à mains nues + arme kensei CàC' },
                    { type: 'damage_bonus', value: 0, condition: 'kensei-shot', damageType: 'weapon' }
                ]
            },
            {
                level: 6, name: 'Un avec la lame', description: 'Armes kensei comptent comme magiques. Frappe habile : dépensez 1 Ki pour +dé d\'arts martiaux dégâts (1/tour).',
                rules: [
                    { type: 'condition', condition: 'magic-kensei-weapons', description: 'Armes kensei magiques' },
                    { type: 'damage_bonus', value: 0, condition: 'deft-strike', damageType: 'weapon' }
                ]
            },
            {
                level: 11, name: 'Affûter la lame', description: 'Action bonus : dépensez jusqu\'à 3 Ki pour +1/+2/+3 attaque et dégâts sur une arme kensei pendant 1 minute.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'sharpen-the-blade' }
                ]
            },
            {
                level: 17, name: 'Précision infaillible', description: 'Si vous manquez avec une arme de moine, relancez le jet (1/tour).',
                rules: [
                    { type: 'condition', condition: 'unerring-accuracy', description: 'Relance d\'un jet d\'attaque manqué 1/tour' }
                ]
            },
        ],
    },
    {
        id: 'sun_soul',
        classId: 'monk',
        name: 'Voie de l\'Âme Solaire',
        nameEn: 'Way of the Sun Soul',
        description: 'Un moine qui canalise son énergie vitale en rayons de lumière brûlante.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Rayon de soleil radiant', description: 'Attaque à distance (9m) infligeant dégâts radiants = dé d\'arts martiaux + mod DEX. Dépensez 1 Ki pour 2 attaques en action bonus.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'radiant-sun-bolt', damageType: 'radiant' }
                ]
            },
            {
                level: 6, name: 'Arc solaire brûlant', description: 'Après action Attaquer, dépensez 2 Ki pour lancer Mains brûlantes en action bonus. +1 Ki par niveau supérieur (max = demi niveau moine).',
                rules: [
                    { type: 'spell', spellId: 'burning-hands', alwaysKnown: true }
                ]
            },
            {
                level: 11, name: 'Explosion solaire', description: 'Action : orbe à 45m, sphère 6m. JS CON ou 2d6 radiants. Dépensez jusqu\'à 3 Ki (+2d6 par Ki).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'searing-arc-strike' }
                ]
            },
            {
                level: 17, name: 'Bouclier solaire', description: 'Aura de lumière vive 9m. Réaction quand touché au CàC : 5 + mod SAG dégâts radiants.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'sun-shield', damageType: 'radiant' }
                ]
            },
        ],
    },
    {
        id: 'mercy',
        classId: 'monk',
        name: 'Voie de la Miséricorde',
        nameEn: 'Way of Mercy',
        description: 'Un moine masqué qui manipule la force vitale pour soigner ou infliger une mort rapide.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Instruments de miséricorde', description: 'Maîtrise de Perspicacité, Médecine et du kit d\'herboriste. Vous gagnez un masque.',
                rules: [
                    { type: 'grant', targetType: 'proficiency', targetId: 'ID_SKILL_INSIGHT' },
                    { type: 'grant', targetType: 'proficiency', targetId: 'ID_SKILL_MEDICINE' },
                    { type: 'grant', targetType: 'proficiency', targetId: 'herbalism-kit' }
                ]
            },
            {
                level: 3, name: 'Mains guérisseuses', description: 'Action : dépensez 1 Ki, touchez une créature → soignez dé d\'arts martiaux + mod SAG PV. Gratuit si remplace une frappe de Déluge de coups.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'hand-of-harmony' }
                ]
            },
            {
                level: 3, name: 'Mains blessantes', description: '1 Ki quand vous touchez à mains nues : +dé d\'arts martiaux + mod SAG dégâts nécrotiques (1/tour).',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'hand-of-harm', damageType: 'necrotic' }
                ]
            },
            {
                level: 6, name: 'Toucher du médecin', description: 'Mains guérisseuses : mettez aussi fin à 1 maladie ou état (aveuglé, assourdi, paralysé, empoisonné, étourdi). Mains blessantes : la cible est empoisonnée.',
                rules: [
                    { type: 'condition', condition: 'physicians-touch', description: 'Mains guérisseuses : soignent états. Mains blessantes : empoisonnent.' }
                ]
            },
            {
                level: 11, name: 'Déluge de soins et de blessures', description: 'Déluge de coups : remplacez les 2 frappes par Mains guérisseuses gratuites, ou utilisez Mains blessantes 1 fois gratuitement.',
                rules: [
                    { type: 'condition', condition: 'flurry-of-blows-healing', description: 'Déluge de coups peut soigner ou blesser gratuitement' }
                ]
            },
            {
                level: 17, name: 'Main de la miséricorde ultime', description: 'Action : touchez un cadavre (mort ≤ 24h), dépensez 5 Ki → résurrection avec 4d10 + mod SAG PV (1/repos long).',
                rules: [
                    { type: 'resource', id: 'hand-of-ultimate-mercy', name: 'Miséricorde ultime', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], recovery: 'long' }
                ]
            },
        ],
    },
    {
        id: 'astral_self',
        classId: 'monk',
        name: 'Voie de l\'Être Astral',
        nameEn: 'Way of the Astral Self',
        description: 'Un moine qui manifeste son véritable être sous forme astrale, une extension spectrale de son Ki.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Bras de l\'être astral', description: 'Action bonus, 1 Ki : bras spectraux 10 min. Portée CàC +1,5m, dégâts de force, utilisez SAG pour attaque/dégâts/tests FOR. À l\'apparition : 2 × dé arts martiaux force aux créatures à 3m (JS DEX).',
                rules: [
                    { type: 'condition', condition: 'arms-of-the-astral-self', description: 'Bras astraux : portée +1,5m, dégâts force, SAG pour attaque/dégâts/FOR' },
                    { type: 'damage_bonus', value: 0, condition: 'astral-arms-summon', damageType: 'force' }
                ]
            },
            {
                level: 6, name: 'Visage de l\'être astral', description: 'Action bonus, 1 Ki : visage spectral 10 min. Vision dans le noir magique, avantage Perspicacité et Intimidation, voix projetée à 180m.',
                rules: [
                    { type: 'condition', condition: 'visage-of-the-astral-self', description: 'Vision dans le noir magique, avantage Perspicacité/Intimidation, voix 180m' }
                ]
            },
            {
                level: 11, name: 'Corps de l\'être astral', description: 'Quand bras + visage actifs : Déviation d\'énergie (réaction : -1d10-mod SAG-niv moine dégâts acide/froid/feu/force/foudre/tonnerre). Bras renforcés (+dé arts martiaux 1/tour).',
                rules: [
                    { type: 'condition', condition: 'body-of-the-astral-self', description: 'Déviation d\'énergie, bras renforcés +dé arts martiaux' }
                ]
            },
            {
                level: 17, name: 'Être astral éveillé', description: '5 Ki : invoquez bras + visage + corps éveillés 10 min. +2 CA. Attaque supplémentaire : 3 attaques avec les bras astraux.',
                rules: [
                    { type: 'condition', condition: 'awakened-astral-self', description: '+2 CA, 3 attaques avec bras astraux' }
                ]
            },
        ],
    },
]
