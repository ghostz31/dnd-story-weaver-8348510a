import type { Subclass } from './types'

export const barbarianSubclasses: Subclass[] = [
    // ═══════════════════════════════════════════
    // BARBARE — Voie primitive (niveau 3)
    // ═══════════════════════════════════════════
    {
        id: 'berserker',
        classId: 'barbarian',
        name: 'Voie du Berserker',
        nameEn: 'Path of the Berserker',
        description: 'Une rage déchaînée qui vous consume entièrement, vous transformant en machine de destruction au prix de l\'épuisement.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Frénésie', description: 'En rage, vous pouvez effectuer une attaque au corps à corps supplémentaire en action bonus à chaque tour. À la fin de la rage, vous subissez un niveau d\'épuisement.',
                rules: [
                    { type: 'condition', condition: 'frenzy-extra-attack', description: 'Attaque supplémentaire en action bonus pendant la rage' }
                ]
            },
            {
                level: 6, name: 'Rage aveugle', description: 'Vous ne pouvez pas être charmé ou effrayé tant que vous êtes en rage. Si vous étiez charmé ou effrayé avant d\'entrer en rage, l\'effet est suspendu.',
                rules: [
                    { type: 'condition', condition: 'immunity-charmed-rage', description: 'Immunité au charme en rage' },
                    { type: 'condition', condition: 'immunity-frightened-rage', description: 'Immunité à la peur en rage' }
                ]
            },
            {
                level: 10, name: 'Présence intimidante', description: 'Utilisez votre action pour effrayer une créature. JS Sagesse DD = 8 + bonus de maîtrise + mod CHA. Effrayée jusqu\'à la fin de votre prochain tour.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'intimidating-presence' }
                ]
            },
            {
                level: 14, name: 'Représailles', description: 'Lorsqu\'une créature vous touche avec une attaque au corps à corps, vous pouvez utiliser votre réaction pour effectuer une attaque au corps à corps contre elle.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'retaliation' }
                ]
            },
        ],
    },
    {
        id: 'totem_warrior',
        classId: 'barbarian',
        name: 'Voie du Totem',
        nameEn: 'Path of the Totem Warrior',
        description: 'Un voyage spirituel où vous adoptez un animal totem comme guide, protecteur et source d\'inspiration.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Quêteur spirituel', description: 'Vous pouvez lancer Communication avec les animaux et Sens animal en tant que rituels.',
                rules: [
                    { type: 'spell', spellId: 'communication-avec-les-animaux', alwaysKnown: true },
                    { type: 'spell', spellId: 'sens-animal', alwaysKnown: true }
                ]
            },
            {
                level: 3, name: 'Esprit totem', description: 'Choisissez un animal totem : Ours (résistance à tous les dégâts sauf psychiques en rage), Aigle (les attaques d\'opportunité contre vous ont un désavantage + Foncer en action bonus en rage), ou Loup (vos alliés ont l\'avantage aux attaques au corps à corps contre les créatures à 1,5m de vous en rage).',
                rules: [
                    { type: 'select', name: 'Esprit totem', targetType: 'trait', count: 1, options: ['totem-bear', 'totem-eagle', 'totem-wolf'] }
                ]
            },
            {
                level: 6, name: 'Aspect de la bête', description: 'Choisissez : Ours (capacité de charge doublée, avantage Force pour pousser/tirer), Aigle (vision à 1,5 km, pas de désavantage Perception en lumière faible), ou Loup (pistage en rythme rapide, discrétion en rythme normal).',
                rules: [
                    { type: 'select', name: 'Aspect de la bête', targetType: 'trait', count: 1, options: ['aspect-bear', 'aspect-eagle', 'aspect-wolf'] }
                ]
            },
            {
                level: 10, name: 'Marcheur spirituel', description: 'Lancez Communion avec la nature comme rituel. Un esprit totem apparaît pour vous transmettre l\'information.',
                rules: [
                    { type: 'spell', spellId: 'communion-avec-la-nature', alwaysKnown: true }
                ]
            },
            {
                level: 14, name: 'Lien totémique', description: 'Choisissez : Ours (créatures hostiles à 1,5m ont désavantage aux attaques contre vos alliés), Aigle (vitesse de vol = vitesse au sol en rage, courts déplacements uniquement), ou Loup (action bonus pour renverser une créature de taille G ou inférieure touchée en CàC).',
                rules: [
                    { type: 'select', name: 'Lien totémique', targetType: 'trait', count: 1, options: ['totemic-bond-bear', 'totemic-bond-eagle', 'totemic-bond-wolf'] }
                ]
            },
        ],
    },
    {
        id: 'ancestral_guardian',
        classId: 'barbarian',
        name: 'Voie du Gardien Ancestral',
        nameEn: 'Path of the Ancestral Guardian',
        description: 'Vous invoquez les esprits de vos ancêtres guerriers pour protéger vos alliés et contrôler le champ de bataille.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Protecteurs ancestraux', description: 'En rage, la première créature que vous touchez à chaque tour est gênée par des esprits guerriers : désavantage aux attaques contre les autres, et ses cibles bénéficient de résistance aux dégâts.',
                rules: [
                    { type: 'condition', condition: 'ancestral-protectors', description: 'En rage, la première créature touchée a désavantage aux attaques contre les autres et ses cibles ont résistance aux dégâts' }
                ]
            },
            {
                level: 6, name: 'Bouclier spirituel', description: 'En rage, utilisez votre réaction pour réduire les dégâts subis par un allié visible à 9m de 2d6 (3d6 au niv 10, 4d6 au niv 14).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'spirit-shield' }
                ]
            },
            {
                level: 10, name: 'Consulter les esprits', description: 'Lancez Augure ou Clairvoyance sans emplacement ni composantes matérielles. Sagesse est votre caractéristique d\'incantation. Utilisable bonus de maîtrise fois par repos long.',
                rules: [
                    { type: 'resource', id: 'consult-spirits', name: 'Consulter les esprits', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 5, 5, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 14, name: 'Ancêtres vengeurs', description: 'Lorsque vous utilisez Bouclier spirituel, l\'attaquant subit des dégâts de force égaux aux dégâts réduits par le bouclier.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'spirit-shield-retaliation', damageType: 'force' }
                ]
            },
        ],
    },
    {
        id: 'storm_herald',
        classId: 'barbarian',
        name: 'Voie du Héraut de la Tempête',
        nameEn: 'Path of the Storm Herald',
        description: 'Vous canalisez votre rage en une aura de magie élémentaire primordiale — désert, mer ou toundra.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Aura de tempête', description: 'En rage, aura de 3m. Choisissez un environnement : Désert (2 dégâts feu aux créatures, scaling +1 niv 5/10/15/20), Mer (1d6 foudre JS DEX une cible, scaling 2d6/3d6/4d6), ou Toundra (2 PV temp aux alliés, scaling). Changez d\'environnement à chaque gain de niveau.',
                rules: [
                    { type: 'select', name: 'Environnement de tempête', targetType: 'trait', count: 1, options: ['storm-desert', 'storm-sea', 'storm-tundra'] }
                ]
            },
            {
                level: 6, name: 'Âme de tempête', description: 'Même hors rage : Désert (résistance feu), Mer (résistance foudre + respiration aquatique + nage 9m), ou Toundra (résistance froid).',
                rules: [
                    { type: 'condition', condition: 'storm-soul-resistance', description: 'Résistance selon l\'environnement choisi' }
                ]
            },
            {
                level: 10, name: 'Tempête protectrice', description: 'Les alliés dans votre aura bénéficient de résistance au type de dégâts de votre environnement choisi.',
                rules: [
                    { type: 'condition', condition: 'storm-shield-aura', description: 'Alliés dans l\'aura ont résistance au type de dégâts de l\'environnement' }
                ]
            },
            {
                level: 14, name: 'Tempête déchaînée', description: 'Désert (réaction : dégâts feu = niv barbare si touché par créature dans l\'aura), Mer (réaction : renverser une créature touchée dans l\'aura, JS Force), ou Toundra (vitesse réduite à 0 pour une créature dans l\'aura, JS Force).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'storm-rage-reaction' }
                ]
            },
        ],
    },
    {
        id: 'zealot',
        classId: 'barbarian',
        name: 'Voie du Zélote',
        nameEn: 'Path of the Zealot',
        description: 'Un guerrier qui canalise sa rage en démonstrations de pouvoir divin, transcendant même la mort au combat.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Fureur divine', description: 'En rage, la 1ère créature touchée par tour subit +1d6 + ½ niveau de barbare dégâts supplémentaires (radiant ou nécrotique, choisi à l\'obtention).',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'divine-fury-first-hit', damageType: 'radiant' }
                ]
            },
            {
                level: 3, name: 'Guerrier des dieux', description: 'Les sorts qui vous ramènent à la vie (comme Rappel à la vie) n\'ont pas besoin de composantes matérielles.',
                rules: [
                    { type: 'condition', condition: 'warrior-of-the-gods', description: 'Pas de composantes matérielles pour les sorts de résurrection' }
                ]
            },
            {
                level: 6, name: 'Concentration fanatique', description: 'Si vous ratez un JS en rage, vous pouvez le relancer (1 fois par rage).',
                rules: [
                    { type: 'condition', condition: 'fanatical-focus', description: 'Relance d\'un JS raté en rage (1 fois par rage)' }
                ]
            },
            {
                level: 10, name: 'Présence zélée', description: 'Action bonus : jusqu\'à 10 créatures à 18m qui vous entendent gagnent avantage aux jets d\'attaque et de sauvegarde jusqu\'au début de votre prochain tour (1/repos long).',
                rules: [
                    { type: 'resource', id: 'zealous-presence', name: 'Présence zélée', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }
                ]
            },
            {
                level: 14, name: 'Rage au-delà de la mort', description: 'En rage, tomber à 0 PV ne vous rend pas inconscient. Vous faites toujours les JS contre la mort. Vous ne mourez que si la rage prend fin et que vous êtes toujours à 0 PV.',
                rules: [
                    { type: 'condition', condition: 'rage-beyond-death', description: 'Tomber à 0 PV en rage ne rend pas inconscient' }
                ]
            },
        ],
    },
    {
        id: 'beast',
        classId: 'barbarian',
        name: 'Voie de la Bête',
        nameEn: 'Path of the Beast',
        description: 'Une puissance bestiale dormante se manifeste lorsque vous entrez en rage, vous dotant d\'armes naturelles redoutables.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Forme de la bête', description: 'En rage, manifestez une arme naturelle au choix : Morsure (1d8 perf, soin = mod CON 1/tour si < 50% PV), Griffes (1d6 tranch, 1 attaque de griffe supplémentaire 1/tour), ou Queue (1d8 perf, allonge, réaction +1d8 CA).',
                rules: [
                    { type: 'select', name: 'Arme naturelle', targetType: 'trait', count: 1, options: ['beast-bite', 'beast-claws', 'beast-tail'] }
                ]
            },
            {
                level: 6, name: 'Âme de la bête', description: 'Vos armes naturelles comptent comme magiques. Après un repos, choisissez : nage + respiration aquatique, escalade (même plafonds sans test), ou sauts améliorés (jet Athlétisme ajouté).',
                rules: [
                    { type: 'condition', condition: 'magical-natural-weapons', description: 'Armes naturelles comptent comme magiques' },
                    { type: 'select', name: 'Bénéfice d\'Âme de la bête', targetType: 'trait', count: 1, options: ['beast-soul-swim', 'beast-soul-climb', 'beast-soul-jump'] }
                ]
            },
            {
                level: 10, name: 'Fureur infectieuse', description: 'Touchez avec arme naturelle en rage : la cible doit réussir un JS SAG (DD 8 + mod CON + maîtrise) ou subir un effet au choix : attaque un allié en réaction, ou 2d12 dégâts psychiques. Bonus de maîtrise utilisations par repos long.',
                rules: [
                    { type: 'resource', id: 'infectious-fury', name: 'Fureur infectieuse', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 14, name: 'Appel de la chasse', description: 'En rage, choisissez jusqu\'à mod CON créatures consentantes à 9m. Gagnez 5 PV temp par créature. Elles gagnent +1d6 dégâts 1/tour. Bonus de maîtrise utilisations par repos long.',
                rules: [
                    { type: 'resource', id: 'call-the-hunt', name: 'Appel de la chasse', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6], recovery: 'long' }
                ]
            },
        ],
    },
    {
        id: 'wild_magic_barbarian',
        classId: 'barbarian',
        name: 'Voie de la Magie Sauvage',
        nameEn: 'Path of Wild Magic',
        description: 'Imprégné de magie sauvage par la Féerie ou d\'autres forces surnaturelles, votre rage déclenche des effets magiques imprévisibles.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Sens de la magie', description: 'Action : détectez sorts et objets magiques dans un rayon de 18m (pas à travers abri total). Identifiez l\'école de magie. Bonus de maîtrise utilisations par repos long.',
                rules: [
                    { type: 'resource', id: 'magic-awareness', name: 'Sens de la magie', progression: [0, 0, 0, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 3, name: 'Sursaut sauvage', description: 'En entrant en rage, lancez 1d8 sur la table de Magie sauvage pour un effet aléatoire. DD des effets = 8 + bonus de maîtrise + mod CON.',
                rules: [
                    { type: 'condition', condition: 'wild-magic-surge', description: 'Effet aléatoire en entrant en rage' }
                ]
            },
            {
                level: 6, name: 'Réserve de magie', description: 'Action : touchez une créature pour lui conférer +1d3 aux jets d\'attaque/caractéristique pendant 10 min, OU restaurez un emplacement de sort de niveau ≤ 1d3. Bonus de maîtrise utilisations par repos long.',
                rules: [
                    { type: 'resource', id: 'bolstering-magic', name: 'Réserve de magie', progression: [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 10, name: 'Réaction instable', description: 'Après avoir subi des dégâts ou raté un JS en rage, utilisez votre réaction pour relancer sur la table de Magie sauvage. Le nouvel effet remplace le précédent.',
                rules: [
                    { type: 'condition', condition: 'unstable-reaction', description: 'Réaction pour relancer la table de Magie sauvage après dégâts ou JS raté en rage' }
                ]
            },
            {
                level: 14, name: 'Sursaut contrôlé', description: 'Lancez 2d8 sur la table de Magie sauvage et choisissez le résultat. Si les deux dés sont identiques, choisissez librement n\'importe quel effet.',
                rules: [
                    { type: 'condition', condition: 'controlled-surge', description: 'Lancez 2d8 et choisissez le résultat sur la table de Magie sauvage' }
                ]
            },
        ],
    },
    {
        id: 'battlerager',
        classId: 'barbarian',
        name: 'Voie du Battlerager',
        nameEn: 'Path of the Battlerager',
        description: 'Réservé aux nains. Vous portez une armure d\'épines et vous jetez dans la mêlée avec une férocité dévastatrice.',
        source: 'SCAG',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Armure d\'épines', description: 'En rage et sans armure (hors bouclier), vous pouvez effectuer une attaque au corps à corps en action bonus avec votre armure d\'épines (1d4 perforants). Quand une créature vous touche avec une attaque au corps à corps en rage, elle subit 3 dégâts perforants.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'spiked-armor-attack' },
                    { type: 'damage_bonus', value: 3, condition: 'spiked-armor-retaliation', damageType: 'piercing' }
                ]
            },
            {
                level: 6, name: 'Chargeur téméraire', description: 'Quand vous utilisez Attaque téméraire en rage, vous gagnez un nombre de points de vie temporaires égal à votre modificateur de Constitution.',
                rules: [
                    { type: 'condition', condition: 'reckless-abandon-temp-hp', description: 'PV temporaires = mod CON quand Attaque téméraire est utilisée en rage' }
                ]
            },
            {
                level: 10, name: 'Chargeur de bataille', description: 'En rage, vous pouvez utiliser votre action bonus pour Foncer. Si vous touchez une créature avec une attaque au corps à corps lors de cette action, elle doit réussir un jet de sauvegarde de Force ou être renversée.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'battlerager-charge' }
                ]
            },
            {
                level: 14, name: 'Épines de stockage', description: 'En rage, quand une créature à 1,5 mètre ou moins de vous vous touche avec une attaque au corps à corps, vous pouvez utiliser votre réaction pour lui infliger 1d10 + votre modificateur de Constitution dégâts perforants.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'spiked-retaliation' }
                ]
            },
        ],
    },
    {
        id: 'giant',
        classId: 'barbarian',
        name: 'Voie du Géant',
        nameEn: 'Path of the Giant',
        description: 'Vous tirez votre force des mêmes forces primordiales que les géants. En rage, vous êtes imprégné de puissance élémentaire et grandissez, prenant une forme qui évoque la gloire des géants — peut-être entouré d\'énergie de feu, de givre ou de foudre.',
        source: 'Bigby',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Puissance du géant', description: 'Vous apprenez à parler, lire et écrire le Géant (ou une autre langue si vous le connaissez déjà). De plus, vous apprenez un tour de magie au choix : druidisme ou thaumaturgie. La Sagesse est votre caractéristique d\'incantation pour ce sort.',
                rules: [
                    { type: 'grant', targetType: 'language', targetId: 'giant' },
                    { type: 'select', name: 'Tour de magie du Géant', targetType: 'spell', count: 1, options: ['druidcraft', 'thaumaturgy'] },
                ]
            },
            {
                level: 3, name: 'Dévastation géante', description: 'En rage : Jet écrasant — quand vous réussissez une attaque à distance avec une arme de lancer utilisant la Force, ajoutez votre bonus de dégâts de la Rage. Stature géante — votre allonge augmente de 1,50 m, et si vous êtes de taille Inférieure à Grande, vous devenez Grand (avec votre équipement). Si la place manque, votre taille ne change pas.',
                rules: [
                    { type: 'condition', condition: 'crushing-throw', description: '+Rage dégâts aux armes de lancer (Force) en rage' },
                    { type: 'condition', condition: 'giant-stature-reach', description: 'Allonge +1,5m en rage' },
                    { type: 'condition', condition: 'giant-stature-size', description: 'Taille Grande en rage' },
                ]
            },
            {
                level: 6, name: 'Fendoir élémentaire', description: 'Quand vous entrez en rage, choisissez une arme tenue et infusez-la avec un type de dégâts : acide, froid, feu, tonnerre ou foudre. Tant que vous maniez l\'arme infusée en rage : ses dégâts passent au type choisi, +1d6 dégâts du type choisi, elle gagne la propriété lancer (portée 6/18 m). Si lancée, elle réapparaît dans votre main après l\'attaque. Les bénéfices sont supprimés si une autre créature manie l\'arme. En action bonus en rage, changez le type de dégâts.',
                rules: [
                    { type: 'select', name: 'Type élémentaire', targetType: 'trait', count: 1, options: ['acid', 'cold', 'fire', 'thunder', 'lightning'] },
                    { type: 'damage_bonus', value: 0, condition: 'elemental-cleaver', damageType: 'fire' }
                ]
            },
            {
                level: 10, name: 'Projection puissante', description: 'En rage, action bonus : choisissez une créature de taille M ou inférieure à votre allonge et déplacez-la dans un espace inoccupé que vous voyez à 9 m. Une créature non consentante doit réussir un JS de Force (DD = 8 + bonus de maîtrise + mod FOR) pour éviter l\'effet. Si à la fin du mouvement la créature n\'est pas sur une surface qui la supporte, elle tombe (dégâts normaux + à terre).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'mighty-impel' }
                ]
            },
            {
                level: 14, name: 'Colosse démiurgique', description: 'En rage : votre allonge augmente de 3 m (au lieu de 1,5), votre taille peut devenir Grande ou Très Grande (votre choix), et votre Projection puissante peut déplacer des créatures de taille G ou inférieure. De plus, les dégâts supplémentaires de Fendoir élémentaire passent à 2d6.',
                rules: [
                    { type: 'condition', condition: 'demiurgic-colossus-reach', description: 'Allonge +3m en rage' },
                    { type: 'condition', condition: 'demiurgic-colossus-size', description: 'Taille Grande ou Très Grande au choix en rage' },
                    { type: 'condition', condition: 'demiurgic-colossus-impel', description: 'Projection puissante cible les créatures de taille G ou inférieure' },
                    { type: 'damage_bonus', value: 0, condition: 'elemental-cleaver-2d6', damageType: 'fire' }
                ]
            },
        ],
    },
]
