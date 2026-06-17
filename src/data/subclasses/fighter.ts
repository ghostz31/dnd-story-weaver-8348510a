import type { Subclass } from './types'

export const fighterSubclasses: Subclass[] = [
    // ═══════════════════════════════════════════
    {
        id: 'champion',
        classId: 'fighter',
        name: 'Champion',
        nameEn: 'Champion',
        description: 'L\'archétype du guerrier pur, focalisé sur la perfection physique et les coups dévastateurs.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Critique amélioré', description: 'Vos attaques sont des coups critiques sur un 19 ou un 20.', rules: [{ type: 'condition', condition: 'critical-range-19-20', description: 'Zone de critique 19-20' }] },
            { level: 7, name: 'Athlète remarquable', description: 'Ajoutez la moitié de votre bonus de maîtrise (arrondi au supérieur) à tout test de Force, Dextérité ou Constitution que vous ne maîtrisez pas déjà.', rules: [{ type: 'condition', condition: 'remarkable-athlete', description: '+½ maîtrise aux tests de FOR/DEX/CON non maîtrisés' }] },
            { level: 10, name: 'Style de combat supplémentaire', description: 'Choisissez un second style de combat.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'second-fighting-style' }] },
            { level: 15, name: 'Critique supérieur', description: 'Vos attaques sont des coups critiques sur un 18, 19 ou 20.', rules: [{ type: 'condition', condition: 'critical-range-18-20', description: 'Zone de critique 18-20' }] },
            { level: 18, name: 'Survivant', description: 'Au début de chacun de vos tours, regagnez 5 + mod CON PV si vous avez la moitié ou moins de vos PV max.', rules: [{ type: 'condition', condition: 'survivor-regen', description: 'Régénération 5 + mod CON au début du tour si ≤ 50% PV' }] },
        ],
    },
    {
        id: 'battle_master',
        classId: 'fighter',
        name: 'Maître de Bataille',
        nameEn: 'Battle Master',
        description: 'Un tacticien qui utilise des manœuvres de supériorité pour contrôler le champ de bataille.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Supériorité martiale', description: 'Apprenez 3 manœuvres et gagnez 4 dés de supériorité (d8). Manœuvres : Attaque menaçante, Balayage, Coup précis, Désarmement, Diversion, Feinte, Manœuvre tactique, Parade, Provocation, Renversement, Riposte, etc.',
                rules: [
                    { type: 'resource', id: 'superiority-dice', name: 'Dés de supériorité', progression: [0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6], recovery: 'short' },
                    { type: 'select', name: 'Manœuvres', targetType: 'trait', count: 3, options: ['maneuver-ambush', 'maneuver-bait-and-switch', 'maneuver-commanders-strike', 'maneuver-disarming-attack', 'maneuver-distracting-strike', 'maneuver-evasive-footwork', 'maneuver-feinting-attack', 'maneuver-goading-attack', 'maneuver-lunging-attack', 'maneuver-maneuvering-attack', 'maneuver-menacing-attack', 'maneuver-parry', 'maneuver-precision-attack', 'maneuver-pushing-attack', 'maneuver-rally', 'maneuver-riposte', 'maneuver-sweeping-attack', 'maneuver-trip-attack'] }
                ]
            },
            { level: 7, name: 'Connais ton ennemi', description: 'Après 1 minute d\'observation, apprenez si la créature est supérieure, égale ou inférieure à vous dans 2 caractéristiques.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'know-your-enemy' }] },
            { level: 10, name: 'Supériorité martiale améliorée', description: '2 manœuvres supplémentaires, 5 dés de supériorité. Le dé passe à d10.', rules: [{ type: 'select', name: 'Manœuvre supplémentaire', targetType: 'trait', count: 2, options: ['maneuver-ambush', 'maneuver-bait-and-switch', 'maneuver-commanders-strike', 'maneuver-disarming-attack', 'maneuver-distracting-strike', 'maneuver-evasive-footwork', 'maneuver-feinting-attack', 'maneuver-goading-attack', 'maneuver-lunging-attack', 'maneuver-maneuvering-attack', 'maneuver-menacing-attack', 'maneuver-parry', 'maneuver-precision-attack', 'maneuver-pushing-attack', 'maneuver-rally', 'maneuver-riposte', 'maneuver-sweeping-attack', 'maneuver-trip-attack'] }] },
            { level: 15, name: 'Implacable', description: 'Regagnez 1 dé de supériorité si vous n\'en avez plus au jet d\'initiative.', rules: [{ type: 'condition', condition: 'relentless-superiority-dice', description: 'Regagne 1 dé de supériorité au jet d\'initiative si épuisé' }] },
            { level: 18, name: 'Supériorité martiale supérieure', description: '2 manœuvres supplémentaires, 6 dés de supériorité. Le dé passe à d12.', rules: [{ type: 'select', name: 'Manœuvre supplémentaire', targetType: 'trait', count: 2, options: ['maneuver-ambush', 'maneuver-bait-and-switch', 'maneuver-commanders-strike', 'maneuver-disarming-attack', 'maneuver-distracting-strike', 'maneuver-evasive-footwork', 'maneuver-feinting-attack', 'maneuver-goading-attack', 'maneuver-lunging-attack', 'maneuver-maneuvering-attack', 'maneuver-menacing-attack', 'maneuver-parry', 'maneuver-precision-attack', 'maneuver-pushing-attack', 'maneuver-rally', 'maneuver-riposte', 'maneuver-sweeping-attack', 'maneuver-trip-attack'] }] },
        ],
    },
    {
        id: 'eldritch_knight',
        classId: 'fighter',
        name: 'Chevalier Occulte',
        nameEn: 'Eldritch Knight',
        description: 'Un guerrier qui combine la maîtrise des armes avec l\'étude de l\'Abjuration et de l\'Évocation.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Incantation', description: 'Lancez des sorts de Magicien (INT). 2 sorts mineurs + 3 sorts de niveau 1 (principalement Abjuration et Évocation).',
                rules: [
                    { type: 'spell', spellId: 'eldritch-knight-cantrips', alwaysKnown: true },
                    { type: 'spell', spellId: 'eldritch-knight-spells', alwaysKnown: true }
                ]
            },
            { level: 3, name: 'Lien d\'arme', description: 'Liez-vous à une arme. Vous ne pouvez pas être désarmé et pouvez invoquer l\'arme en action bonus.', rules: [{ type: 'condition', condition: 'weapon-bond', description: 'Arme liée : invocable en action bonus, impossible à désarmer' }] },
            { level: 7, name: 'Magie de guerre', description: 'Lorsque vous lancez un sort mineur en action, effectuez une attaque en action bonus.', rules: [{ type: 'condition', condition: 'war-magic-bonus-action', description: 'Attaque en action bonus après un sort mineur' }] },
            { level: 10, name: 'Coup arcanique', description: 'Lorsque vous touchez avec une attaque, le prochain sort que vous lancez contre la même cible a un avantage au jet d\'attaque avant la fin de votre prochain tour.', rules: [{ type: 'condition', condition: 'eldritch-strike', description: 'Avantage au prochain sort contre la cible touchée' }] },
            { level: 15, name: 'Charge arcanique', description: 'Vous pouvez vous téléporter de 9m avant ou après votre Fougue.', rules: [{ type: 'condition', condition: 'arcane-charge-teleport', description: 'Téléportation 9m avant/après Fougue' }] },
            { level: 18, name: 'Magie de guerre améliorée', description: 'Lorsque vous lancez un sort en action, effectuez une attaque en action bonus.', rules: [{ type: 'condition', condition: 'improved-war-magic', description: 'Attaque en action bonus après n\'importe quel sort' }] },
        ],
    },
    {
        id: 'arcane_archer',
        classId: 'fighter',
        name: 'Archer Arcanique',
        nameEn: 'Arcane Archer',
        description: 'Un guerrier qui tisse la magie dans ses flèches pour produire des effets surnaturels.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Savoir de l\'archer arcanique', description: 'Maîtrise d\'Arcanes ou Nature. Apprenez le sort mineur Prestidigitation ou Druidisme.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'arcana-or-nature' }, { type: 'select', name: 'Sort mineur', targetType: 'spell', count: 1, options: ['prestidigitation', 'druidcraft'] }] },
            { level: 3, name: 'Tir arcanique', description: 'Apprenez 2 options de Tir arcanique. 1/tour, appliquez un effet à une flèche (arc court/long). 2 utilisations par repos court ou long.', rules: [{ type: 'resource', id: 'arcane-shot', name: 'Tirs arcaniques', progression: [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], recovery: 'short' }, { type: 'select', name: 'Options de Tir arcanique', targetType: 'trait', count: 2, options: ['arcane-shot-banishing', 'arcane-shot-beguiling', 'arcane-shot-bursting', 'arcane-shot-enfeebling', 'arcane-shot-grasping', 'arcane-shot-piercing', 'arcane-shot-seeking', 'arcane-shot-shadow', 'arcane-shot-transfixing'] }] },
            { level: 7, name: 'Flèche magique', description: 'Vos flèches non-magiques comptent comme magiques. Si vous manquez, action bonus pour relancer l\'attaque contre une autre cible à 18m.', rules: [{ type: 'condition', condition: 'magic-arrow', description: 'Flèches non-magiques comptent comme magiques' }, { type: 'grant', targetType: 'feature', targetId: 'magic-arrow-reroll' }] },
            { level: 10, name: 'Tir arcanique supplémentaire', description: 'Apprenez une option de Tir arcanique supplémentaire.', rules: [{ type: 'select', name: 'Option de Tir arcanique supplémentaire', targetType: 'trait', count: 1, options: ['arcane-shot-banishing', 'arcane-shot-beguiling', 'arcane-shot-bursting', 'arcane-shot-enfeebling', 'arcane-shot-grasping', 'arcane-shot-piercing', 'arcane-shot-seeking', 'arcane-shot-shadow', 'arcane-shot-transfixing'] }] },
            { level: 15, name: 'Tir toujours prêt', description: 'Si vous n\'avez plus de Tir arcanique au jet d\'initiative, vous en regagnez 1.', rules: [{ type: 'condition', condition: 'ever-ready-shot', description: 'Regagne 1 Tir arcanique au jet d\'initiative si épuisé' }] },
            { level: 18, name: 'Tir arcanique amélioré', description: 'Tous vos Tirs arcaniques voient leurs effets améliorés (dégâts augmentés).', rules: [{ type: 'damage_bonus', value: 0, condition: 'improved-arcane-shot', damageType: 'force' }] },
        ],
    },
    {
        id: 'cavalier',
        classId: 'fighter',
        name: 'Cavalier',
        nameEn: 'Cavalier',
        description: 'Un guerrier qui excelle au combat monté et à la protection de ses alliés.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Maîtrise supplémentaire', description: 'Maîtrise d\'une compétence (Dressage, Histoire, Perspicacité, Représentation ou Persuasion) ou d\'une langue.', rules: [{ type: 'select', name: 'Maîtrise supplémentaire', targetType: 'skill', count: 1, options: ['animal-handling', 'history', 'insight', 'performance', 'persuasion', 'language'] }] },
            { level: 3, name: 'Né en selle', description: 'Avantage aux JS pour ne pas tomber de monture. Monter/descendre ne coûte que 1,5m. Si vous tombez de ≤ 3m, atterrissez debout.', rules: [{ type: 'condition', condition: 'born-to-the-saddle', description: 'Avantage JS pour rester en selle, montée/descente 1,5m, chute ≤ 3m = debout' }] },
            { level: 3, name: 'Marque implacable', description: 'Marquez une créature touchée au CàC. Elle a désavantage aux attaques ne vous ciblant pas. Si elle blesse un autre, action bonus : attaque CàC avec avantage (+demi niv dégâts). Mod FOR fois par repos long.', rules: [{ type: 'resource', id: 'unyielding-mark', name: 'Marque implacable', progression: [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], recovery: 'long' }, { type: 'condition', condition: 'unyielding-mark-effect', description: 'Marquée = désavantage aux attaques contre les autres' }] },
            { level: 7, name: 'Manœuvre protectrice', description: 'Réaction : +1d8 CA à vous, votre monture ou une créature à 1,5m. Si l\'attaque touche quand même, résistance aux dégâts. Mod CON fois par repos long.', rules: [{ type: 'resource', id: 'warding-maneuver', name: 'Manœuvre protectrice', progression: [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], recovery: 'long' }] },
            { level: 10, name: 'Tenir la ligne', description: 'Les créatures à portée provoquent une attaque d\'opportunité si elles se déplacent de 1,5m+. Si vous touchez, vitesse réduite à 0.', rules: [{ type: 'condition', condition: 'hold-the-line', description: 'Attaque d\'opportunité si déplacement ≥ 1,5m, vitesse à 0 si touché' }] },
            { level: 15, name: 'Charge féroce', description: 'Si vous vous déplacez de 3m+ en ligne droite avant d\'attaquer, la cible doit réussir un JS FOR ou être mise à terre (1/tour).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'ferocious-charge' }] },
            { level: 18, name: 'Défenseur vigilant', description: 'Nombre illimité d\'attaques d\'opportunité par round (mais pas d\'autre réaction ce tour).', rules: [{ type: 'condition', condition: 'vigilant-defender', description: 'Attaques d\'opportunité illimitées (pas d\'autre réaction ce tour)' }] },
        ],
    },
    {
        id: 'samurai',
        classId: 'fighter',
        name: 'Samouraï',
        nameEn: 'Samurai',
        description: 'Un guerrier animé par un esprit combatif implacable, mêlant élégance et puissance au combat.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Maîtrise supplémentaire', description: 'Maîtrise d\'une compétence (Histoire, Perspicacité, Représentation ou Persuasion) ou d\'une langue.', rules: [{ type: 'select', name: 'Maîtrise supplémentaire', targetType: 'skill', count: 1, options: ['history', 'insight', 'performance', 'persuasion', 'language'] }] },
            { level: 3, name: 'Esprit combatif', description: 'Action bonus : avantage à toutes les attaques d\'arme ce tour + 5 PV temp (10 niv 10, 15 niv 15). 3/repos long.', rules: [{ type: 'resource', id: 'fighting-spirit', name: 'Esprit combatif', progression: [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], recovery: 'long' }, { type: 'condition', condition: 'fighting-spirit-temp-hp', description: '5 PV temporaires (10 niv 10, 15 niv 15)' }] },
            { level: 7, name: 'Courtisan élégant', description: '+mod SAG aux jets de Persuasion. Maîtrise des JS Sagesse (ou INT/CHA si déjà maîtrisé).', rules: [{ type: 'save_bonus', value: 0, condition: 'elegant-courtier-wis-save', save: 'wis' }, { type: 'condition', condition: 'elegant-courtier-persuasion', description: '+mod SAG à Persuasion' }] },
            { level: 10, name: 'Esprit infatigable', description: 'Si plus d\'Esprit combatif au jet d\'initiative, regagnez 1 utilisation.', rules: [{ type: 'condition', condition: 'indomitable-spirit', description: 'Regagne 1 Esprit combatif au jet d\'initiative si épuisé' }] },
            { level: 15, name: 'Frappe rapide', description: 'Si vous avez avantage, renoncez-y sur une attaque pour effectuer une attaque supplémentaire (1/tour).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'rapid-strike' }] },
            { level: 18, name: 'Force avant la mort', description: 'Réaction à 0 PV : prenez un tour supplémentaire immédiatement (1/repos long).', rules: [{ type: 'resource', id: 'strength-before-death', name: 'Force avant la mort', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'psi_warrior',
        classId: 'fighter',
        name: 'Guerrier Psionique',
        nameEn: 'Psi Warrior',
        description: 'Un guerrier éveillé aux pouvoirs psioniques, augmentant ses prouesses avec des frappes et boucliers de force mentale.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Énergie psionique', description: 'Dés d\'énergie psionique (d6, 2 × bonus maîtrise). Champ protecteur (réaction : -dé-mod INT dégâts à 9m), Frappe psionique (1/tour : +dé+mod INT force), Mouvement télékinétique (action bonus : déplacez objet/créature à 9m).',
                rules: [
                    { type: 'resource', id: 'psionic-energy-dice', name: 'Dés d\'énergie psionique', progression: [0, 0, 4, 4, 4, 4, 6, 6, 6, 6, 6, 6, 8, 8, 8, 8, 8, 8, 8, 8], recovery: 'long' },
                    { type: 'condition', condition: 'psionic-power', description: 'Champ protecteur, Frappe psionique, Mouvement télékinétique' }
                ]
            },
            { level: 7, name: 'Adepte télékinétique', description: 'Saut psionique (action bonus : vol = 10 × dé m ce tour). Poussée télékinétique (sur Frappe psionique : JS FOR ou à terre/repoussé 3m).', rules: [{ type: 'condition', condition: 'telekinetic-adept', description: 'Saut psionique et Poussée télékinétique' }] },
            { level: 10, name: 'Esprit protégé', description: 'Résistance aux dégâts psychiques. Dépensez 1 dé pour mettre fin aux effets charmé/effrayé.', rules: [{ type: 'condition', condition: 'guarded-mind', description: 'Résistance aux dégâts psychiques, fin charme/peur avec 1 dé' }] },
            { level: 15, name: 'Rempart de force', description: 'Action bonus : jusqu\'à mod INT créatures à 9m gagnent un abri partiel pendant 1 minute (1/repos long ou 1 dé).', rules: [{ type: 'resource', id: 'bulwark-of-force', name: 'Rempart de force', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 18, name: 'Maître télékinétique', description: 'Lancez Télékinésie en action bonus sans emplacement (1/repos long ou 3 dés).', rules: [{ type: 'resource', id: 'telekinetic-master', name: 'Maître télékinétique', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'rune_knight',
        classId: 'fighter',
        name: 'Chevalier Runique',
        nameEn: 'Rune Knight',
        description: 'Un guerrier qui utilise le pouvoir surnaturel des runes des géants pour renforcer ses capacités martiales.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Maîtrise supplémentaire', description: 'Maîtrise des outils de forgeron. Parlez, lisez et écrivez le Géant.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'smiths-tools' }, { type: 'grant', targetType: 'language', targetId: 'giant' }] },
            { level: 3, name: 'Graveur de runes', description: 'Apprenez 2 runes (Feu, Givre, Pierre, Nuage). Inscrivez-les sur des objets au repos long. Chaque rune donne un bonus passif + un effet activable (1/repos court ou long).', rules: [{ type: 'select', name: 'Runes', targetType: 'trait', count: 2, options: ['rune-cloud', 'rune-fire', 'rune-frost', 'rune-stone'] }] },
            { level: 3, name: 'Puissance du géant', description: 'Action bonus : grandissez à taille G pendant 1 min. Avantage FOR + 1d6 dégâts supplémentaires 1/tour. Bonus de maîtrise utilisations par repos long.', rules: [{ type: 'resource', id: 'giant-might', name: 'Puissance du géant', progression: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6], recovery: 'long' }, { type: 'damage_bonus', value: 0, condition: 'giant-might-damage', damageType: 'force' }] },
            { level: 7, name: 'Bouclier runique', description: 'Réaction : quand une créature à 18m touche une cible autre que vous, forcez-la à relancer l\'attaque.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'rune-shield' }] },
            { level: 10, name: 'Grande stature', description: 'Puissance du géant passe à +1d8. Vous grandissez de 3d10 cm.', rules: [{ type: 'condition', condition: 'great-stature', description: 'Puissance du géant +1d8, +3d10 cm' }] },
            { level: 15, name: 'Maître des runes', description: 'Chaque rune peut être invoquée 2 fois entre repos (au lieu de 1). Apprenez une rune supplémentaire.', rules: [{ type: 'select', name: 'Rune supplémentaire', targetType: 'trait', count: 1, options: ['rune-cloud', 'rune-fire', 'rune-frost', 'rune-stone'] }, { type: 'condition', condition: 'rune-master', description: 'Chaque rune invoquable 2 fois entre repos' }] },
            { level: 18, name: 'Juggernaut runique', description: 'Puissance du géant passe à +1d10. Vous pouvez grandir à taille TG et votre allonge augmente de 1,5m.', rules: [{ type: 'condition', condition: 'runic-juggernaut', description: 'Puissance du géant +1d10, taille TG, allonge +1,5m' }] },
        ],
    },
]
