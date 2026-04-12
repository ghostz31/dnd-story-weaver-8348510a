import type { CharacterClass } from '../types/character'

// Descriptions détaillées des classes pour l'affichage
export interface ClassDescription {
    summary: string
    flavorText: string
    hitDie: string           // ex: "1d12 par niveau"
    primaryAbilityLabel: string
    savingThrowLabels: string[]
    roleTag: string          // ex: "Tank / DPS Mêlée"
    iconColor: string        // couleur thématique pour l'UI
}

export const classDescriptions: Record<string, ClassDescription> = {
    barbarian: {
        summary: 'Un combattant primitif animé par une rage au combat inégalée. Robuste et dévastateur, le Barbare excelle au corps à corps.',
        flavorText: 'Ceux qui empruntent cette voie sont des guerriers féroces qui puisent dans leur rage intérieure une force et une résilience surhumaines.',
        hitDie: '1d12 par niveau de Barbare',
        primaryAbilityLabel: 'Force',
        savingThrowLabels: ['Force', 'Constitution'],
        roleTag: 'Tank / DPS Mêlée',
        iconColor: '#DC2626',
    },
    bard: {
        summary: 'Un artiste magicien dont les mots et la musique tissent la magie. Polyvalent, le Barde soutient ses alliés et déstabilise ses ennemis.',
        flavorText: 'La musique du Barde n\'est pas qu\'un divertissement — c\'est la matière même de la création, un écho des premiers mots qui ont donné forme au monde.',
        hitDie: '1d8 par niveau de Barde',
        primaryAbilityLabel: 'Charisme',
        savingThrowLabels: ['Dextérité', 'Charisme'],
        roleTag: 'Support / Contrôle',
        iconColor: '#8B5CF6',
    },
    cleric: {
        summary: 'Un champion divin armé de magie octroyée par une divinité. Le Clerc est le soigneur par excellence mais peut aussi combattre en première ligne.',
        flavorText: 'Les clercs sont les intermédiaires entre le monde mortel et les plans lointains des dieux, servant de canal pour la volonté divine.',
        hitDie: '1d8 par niveau de Clerc',
        primaryAbilityLabel: 'Sagesse',
        savingThrowLabels: ['Sagesse', 'Charisme'],
        roleTag: 'Soigneur / Support',
        iconColor: '#F59E0B',
    },
    druid: {
        summary: 'Un gardien de la nature qui puise dans la magie primordiale du monde. Le Druide peut se transformer en animal et contrôler les éléments.',
        flavorText: 'Les druides vénèrent la nature dans toute sa splendeur : le soleil et la lune implacables, le cycle des saisons et les créatures qui peuplent le monde.',
        hitDie: '1d8 par niveau de Druide',
        primaryAbilityLabel: 'Sagesse',
        savingThrowLabels: ['Intelligence', 'Sagesse'],
        roleTag: 'Polyvalent / Contrôle',
        iconColor: '#059669',
    },
    fighter: {
        summary: 'Un maître des armes et des tactiques de combat. Le Guerrier excelle dans toutes les formes de combat, de l\'épée à l\'arc.',
        flavorText: 'Les guerriers apprennent les bases de tous les styles de combat. Chaque guerrier sait manier une variété d\'armes et d\'armures.',
        hitDie: '1d10 par niveau de Guerrier',
        primaryAbilityLabel: 'Force ou Dextérité',
        savingThrowLabels: ['Force', 'Constitution'],
        roleTag: 'DPS / Tank',
        iconColor: '#B91C1C',
    },
    monk: {
        summary: 'Un artiste martial qui canalise le Ki pour accomplir des prouesses physiques extraordinaires. Le Moine frappe vite et esquive encore plus vite.',
        flavorText: 'Les moines font une étude rigoureuse d\'une énergie magique que la plupart des traditions monastiques appellent le Ki.',
        hitDie: '1d8 par niveau de Moine',
        primaryAbilityLabel: 'Dextérité & Sagesse',
        savingThrowLabels: ['Force', 'Dextérité'],
        roleTag: 'DPS Mêlée / Mobilité',
        iconColor: '#0EA5E9',
    },
    paladin: {
        summary: 'Un guerrier sacré lié par un serment divin. Le Paladin combine la puissance martiale et la magie divine pour défendre la justice.',
        flavorText: 'Un paladin est un guerrier dont la force provient de son serment sacré — une promesse qui lui confère des pouvoirs surnaturels.',
        hitDie: '1d10 par niveau de Paladin',
        primaryAbilityLabel: 'Force & Charisme',
        savingThrowLabels: ['Sagesse', 'Charisme'],
        roleTag: 'Tank / Soigneur / DPS',
        iconColor: '#EAB308',
    },
    ranger: {
        summary: 'Un guerrier des terres sauvages spécialisé dans la traque et le combat à distance. Le Rôdeur est le maître de la survie et de l\'exploration.',
        flavorText: 'Loin de l\'agitation des cités, par-delà les lisières qui protègent les fermes les plus lointaines, au cœur des forêts épaisses, les rôdeurs montent une garde sans fin.',
        hitDie: '1d10 par niveau de Rôdeur',
        primaryAbilityLabel: 'Dextérité & Sagesse',
        savingThrowLabels: ['Force', 'Dextérité'],
        roleTag: 'DPS à distance / Éclaireur',
        iconColor: '#16A34A',
    },
    rogue: {
        summary: 'Un expert furtif qui frappe dans l\'ombre avec une précision mortelle. Le Roublard excelle en discrétion, crochetage et combat opportuniste.',
        flavorText: 'Les roublards font appel à la compétence, à la discrétion, et aux points faibles de leurs ennemis pour prendre l\'avantage dans n\'importe quelle situation.',
        hitDie: '1d8 par niveau de Roublard',
        primaryAbilityLabel: 'Dextérité',
        savingThrowLabels: ['Dextérité', 'Intelligence'],
        roleTag: 'DPS Burst / Utilitaire',
        iconColor: '#4B5563',
    },
    sorcerer: {
        summary: 'Un lanceur de sorts inné dont la magie jaillit d\'un don naturel. L\'Ensorceleur peut modifier ses sorts avec la Métamagie.',
        flavorText: 'Les ensorceleurs sont porteurs d\'un héritage magique conféré par une lignée exotique, l\'influence d\'un autre monde ou l\'exposition à des forces cosmiques inconnues.',
        hitDie: '1d6 par niveau d\'Ensorceleur',
        primaryAbilityLabel: 'Charisme',
        savingThrowLabels: ['Constitution', 'Charisme'],
        roleTag: 'DPS Magique / Blaster',
        iconColor: '#7C3AED',
    },
    warlock: {
        summary: 'Un mage lié par un pacte avec une entité surnaturelle puissante. L\'Occultiste dispose de sorts qui se rechargent au repos court.',
        flavorText: 'Un occultiste est défini par un pacte conclu avec un être extradimensionnel. Parfois la relation est comme celle d\'un clerc avec sa divinité, parfois c\'est tout autre chose.',
        hitDie: '1d8 par niveau d\'Occultiste',
        primaryAbilityLabel: 'Charisme',
        savingThrowLabels: ['Sagesse', 'Charisme'],
        roleTag: 'DPS Magique / Invocateur',
        iconColor: '#9333EA',
    },
    wizard: {
        summary: 'Un érudit de la magie qui tire son pouvoir de l\'étude et de la pratique. Le Magicien dispose de la plus grande liste de sorts du jeu.',
        flavorText: 'Les magiciens sont les archétypes des lanceurs de sorts, tirant parti de la trame magique subtile qui imprègne le cosmos pour lancer des sorts.',
        hitDie: '1d6 par niveau de Magicien',
        primaryAbilityLabel: 'Intelligence',
        savingThrowLabels: ['Intelligence', 'Sagesse'],
        roleTag: 'DPS Magique / Contrôle / Utilitaire',
        iconColor: '#2563EB',
    },
}

// Styles de combat disponibles
export interface FightingStyle {
    id: string
    name: string
    nameEn?: string
    description: string
    availableFor: string[]  // class IDs
    source?: 'PHB' | 'XGtE' | 'TCoE'
}

export const fightingStyles: FightingStyle[] = [
    {
        id: 'archery',
        name: 'Archerie',
        description: 'Vous gagnez un bonus de +2 aux jets d\'attaque que vous effectuez avec des armes à distance.',
        availableFor: ['fighter', 'ranger'],
    },
    {
        id: 'defense',
        name: 'Défense',
        description: 'Tant que vous portez une armure, vous gagnez un bonus de +1 à la CA.',
        availableFor: ['fighter', 'paladin', 'ranger'],
    },
    {
        id: 'dueling',
        name: 'Duel',
        description: 'Lorsque vous maniez une arme de corps à corps dans une main et aucune autre arme, vous gagnez un bonus de +2 aux jets de dégâts avec cette arme.',
        availableFor: ['fighter', 'paladin', 'ranger'],
    },
    {
        id: 'great-weapon-fighting',
        name: 'Combat à deux armes',
        description: 'Lorsque vous obtenez 1 ou 2 sur un dé de dégâts pour une attaque avec une arme de corps à corps que vous tenez à deux mains, vous pouvez relancer le dé.',
        availableFor: ['fighter', 'paladin'],
    },
    {
        id: 'protection',
        name: 'Protection',
        description: 'Quand une créature que vous pouvez voir attaque une cible autre que vous à 1,5 m, vous pouvez utiliser votre réaction pour imposer un désavantage au jet d\'attaque. Vous devez manier un bouclier.',
        availableFor: ['fighter', 'paladin'],
    },
    {
        id: 'two-weapon-fighting',
        name: 'Combat à deux armes',
        description: 'Lorsque vous vous engagez dans un combat avec deux armes, vous pouvez ajouter votre modificateur de caractéristique aux dégâts de la seconde attaque.',
        availableFor: ['fighter', 'ranger'],
    },
    // ─── XGtE ──────────────────────────────────────────────────
    {
        id: 'blind-fighting',
        name: 'Combat aveugle',
        nameEn: 'Blind Fighting',
        description: 'Vous avez une vision aveugle de 3m. Dans ce rayon, vous pouvez voir toute créature, même invisible.',
        availableFor: ['fighter', 'paladin', 'ranger', 'monk'],
        source: 'XGtE',
    },
    {
        id: 'interception',
        name: 'Interception',
        nameEn: 'Interception',
        description: 'Réaction : réduire les dégâts d\'une attaque sur un allié à 1,5m de vous de 1d10 + bonus de maîtrise.',
        availableFor: ['fighter', 'paladin'],
        source: 'XGtE',
    },
    {
        id: 'thrown-weapon-fighting',
        name: 'Combat aux armes de jet',
        nameEn: 'Thrown Weapon Fighting',
        description: 'Dégainer une arme de jet = action bonus. +2 aux dégâts avec un jet d\'arme à propriété Jet.',
        availableFor: ['fighter', 'ranger'],
        source: 'XGtE',
    },
    {
        id: 'unarmed-fighting',
        name: 'Combat à mains nues',
        nameEn: 'Unarmed Fighting',
        description: 'Corps-à-corps sans arme : 1d6+FOR (1d8 si les deux mains sont libres). Empoigné au début du tour : 1d4 dégâts contondants.',
        availableFor: ['fighter'],
        source: 'XGtE',
    },
    // ─── TCoE ──────────────────────────────────────────────────
    {
        id: 'superior-technique',
        name: 'Technique supérieure',
        nameEn: 'Superior Technique',
        description: 'Apprenez 1 maniœuvre de Maître de guerre. Gagnez 1 dé de supériorité (d6). Peut être pris à la place d\'un style de combat.',
        availableFor: ['fighter'],
        source: 'TCoE',
    },
]

// Options de Métamagie pour l'Ensorceleur
export interface MetamagicOption {
    id: string
    name: string
    cost: number  // points de sorcellerie
    description: string
}

export const metamagicOptions: MetamagicOption[] = [
    { id: 'careful', name: 'Sort prudent', cost: 1, description: 'Les créatures choisies réussissent automatiquement leur jet de sauvegarde contre le sort.' },
    { id: 'distant', name: 'Sort distant', cost: 1, description: 'Doublez la portée du sort (ou portée de 9m si toucher).' },
    { id: 'empowered', name: 'Sort puissant', cost: 1, description: 'Relancez jusqu\'à CHA dés de dégâts (cumulable avec d\'autres métamagies).' },
    { id: 'extended', name: 'Sort étendu', cost: 1, description: 'Doublez la durée du sort (max 24h).' },
    { id: 'heightened', name: 'Sort intensifié', cost: 3, description: 'Une cible a un désavantage à son premier jet de sauvegarde contre le sort.' },
    { id: 'quickened', name: 'Sort accéléré', cost: 2, description: 'Changez le temps d\'incantation de 1 action à 1 action bonus.' },
    { id: 'subtle', name: 'Sort subtil', cost: 1, description: 'Lancez le sort sans composante verbale ni somatique.' },
    { id: 'twinned', name: 'Sort jumelé', cost: -1, description: 'Ciblez une seconde créature (coût = niveau du sort, 1 pour un sort mineur). Sort mono-cible uniquement.' },
    // TCoE
    { id: 'transmuted', name: 'Sort transmué', cost: 1, description: 'Changez le type de dégâts du sort entre : acide, foudre, froid, feu, poison, tonnerre.' },
    { id: 'seeking', name: 'Sort cherchant', cost: 2, description: 'Si vous ratez un jet d\'attaque de sort, vous pouvez le relancer (1 fois par sort).' },
]

// Invocations occultes de l'Occultiste
export interface EldritchInvocation {
    id: string
    name: string
    nameEn: string
    description: string
    prerequisite?: string
}

export const eldritchInvocations: EldritchInvocation[] = [
    // ─── PHB ───────────────────────────────────────────────────
    { id: 'agonizing-blast', name: 'Décharge agonisante', nameEn: 'Agonizing Blast', description: 'Ajoutez votre mod CHA aux dégâts de Décharge occulte.', prerequisite: 'Sort mineur Décharge occulte' },
    { id: 'armor-of-shadows', name: 'Armure d\'ombres', nameEn: 'Armor of Shadows', description: 'Lancez Armure du mage à volonté sans emplacement.' },
    { id: 'ascendant-step', name: 'Pas ascendant', nameEn: 'Ascendant Step', description: 'Lancez Lévitation à volonté sans emplacement.', prerequisite: 'Niveau 9' },
    { id: 'beast-speech', name: 'Langage des bêtes', nameEn: 'Beast Speech', description: 'Lancez Communication avec les animaux à volonté sans emplacement.' },
    { id: 'beguiling-influence', name: 'Influence trompeuse', nameEn: 'Beguiling Influence', description: 'Maîtrise de Tromperie et Persuasion.' },
    { id: 'bewitching-whispers', name: 'Chuchotements envoûtants', nameEn: 'Bewitching Whispers', description: 'Lancez Contrainte à volonté une fois par repos long.', prerequisite: 'Niveau 7' },
    { id: 'book-of-ancient-secrets', name: 'Livre des ombres antiques', nameEn: 'Book of Ancient Secrets', description: 'Inscrivez des rituels de n\'importe quelle classe dans votre Livre des ombres.', prerequisite: 'Pacte du Grimoire' },
    { id: 'chains-of-carceri', name: 'Chaînes de Carcéri', nameEn: 'Chains of Carceri', description: 'Lancez Immobilisation de monstre à volonté (1 fois/cible/repos long) sur célestes, fiélons ou élémentaires.', prerequisite: 'Niveau 15, Pacte de la Lame ou Chaîne' },
    { id: 'devils-sight', name: 'Regard du diable', nameEn: 'Devil\'s Sight', description: 'Voyez normalement dans le noir (magique ou non) jusqu\'à 36m.' },
    { id: 'dreadful-word', name: 'Parole terrible', nameEn: 'Dreadful Word', description: 'Lancez Confusion une fois par repos long.', prerequisite: 'Niveau 7' },
    { id: 'eldritch-sight', name: 'Vue occulte', nameEn: 'Eldritch Sight', description: 'Lancez Détection de la magie à volonté sans emplacement.' },
    { id: 'eldritch-spear', name: 'Lance occulte', nameEn: 'Eldritch Spear', description: 'Portée de Décharge occulte de 90m au lieu de 9m.', prerequisite: 'Sort mineur Décharge occulte' },
    { id: 'eyes-of-the-rune-keeper', name: 'Yeux du gardien des runes', nameEn: 'Eyes of the Rune Keeper', description: 'Lisez toutes les écritures.' },
    { id: 'fiendish-vigor', name: 'Vigueur fiélonne', nameEn: 'Fiendish Vigor', description: 'Lancez Simulacre de vie à volonté au niveau 1 sans emplacement.' },
    { id: 'gaze-of-two-minds', name: 'Regard des deux esprits', nameEn: 'Gaze of Two Minds', description: 'Action : percevez à travers les sens d\'un humanoïde conçentant (concentrate). Maintenir par action bonus.' },
    { id: 'life-drinker', name: 'Buveur de vie', nameEn: 'Lifedrinker', description: 'Arme de pacte : 1d6 dégâts nécrotiques supplémentaires à chaque touche.', prerequisite: 'Niveau 12, Pacte de la Lame' },
    { id: 'mask-of-many-faces', name: 'Masque de mille visages', nameEn: 'Mask of Many Faces', description: 'Lancez Déguisement à volonté sans emplacement.' },
    { id: 'master-of-myriad-forms', name: 'Maître des mille formes', nameEn: 'Master of Myriad Forms', description: 'Lancez Altération à volonté sans emplacement.', prerequisite: 'Niveau 15' },
    { id: 'minions-of-chaos', name: 'Serviteurs du chaos', nameEn: 'Minions of Chaos', description: 'Lancez Appel d\'élémental une fois par repos long.', prerequisite: 'Niveau 9' },
    { id: 'mire-the-mind', name: 'Emprisonnement mental', nameEn: 'Mire the Mind', description: 'Lancez Lenteur une fois par repos long.', prerequisite: 'Niveau 5' },
    { id: 'misty-visions', name: 'Visions brumeuses', nameEn: 'Misty Visions', description: 'Lancez Image silencieuse à volonté sans emplacement.' },
    { id: 'one-with-shadows', name: 'Un avec les ombres', nameEn: 'One with Shadows', description: 'Dans la pénombre ou l\'obscurité, devenez invisible en action. L\'invisibilité prend fin si vous bougez/attaquez/lancez.', prerequisite: 'Niveau 5' },
    { id: 'otherworldly-leap', name: 'Bond d\'un autre monde', nameEn: 'Otherworldly Leap', description: 'Lancez Saut à volonté sans emplacement.', prerequisite: 'Niveau 9' },
    { id: 'repelling-blast', name: 'Décharge repoussante', nameEn: 'Repelling Blast', description: 'Repoussez la cible de 3m avec Décharge occulte.', prerequisite: 'Sort mineur Décharge occulte' },
    { id: 'sculptor-of-flesh', name: 'Sculpteur de chair', nameEn: 'Sculptor of Flesh', description: 'Lancez Métamorphose une fois par repos long.', prerequisite: 'Niveau 7' },
    { id: 'sign-of-ill-omen', name: 'Signe de mauvaise augure', nameEn: 'Sign of Ill Omen', description: 'Lancez Malédiction une fois par repos long.', prerequisite: 'Niveau 5' },
    { id: 'thirsting-blade', name: 'Lame assoiffée', nameEn: 'Thirsting Blade', description: 'Attaquez deux fois avec votre arme de pacte.', prerequisite: 'Pacte de la Lame, niveau 5' },
    { id: 'tomb-of-levistus', name: 'Tombeau de Lévistus', nameEn: 'Tomb of Levistus', description: 'Réaction à la prise de dégâts : gagnez 10 PV temporaires par niveau d\'occultiste, devenez gelé jusqu\'au début du prochain tour.', prerequisite: 'Niveau 5' },
    { id: 'tricksters-escape', name: 'Fuite du fripon', nameEn: 'Trickster\'s Escape', description: 'Lancez Liberté de mouvement une fois par repos long.', prerequisite: 'Niveau 7' },
    { id: 'visions-of-distant-realms', name: 'Visions de royaumes lointains', nameEn: 'Visions of Distant Realms', description: 'Lancez Œil à volonté sans emplacement.', prerequisite: 'Niveau 15' },
    { id: 'voice-of-the-chain-master', name: 'Voix du maître de la chaîne', nameEn: 'Voice of the Chain Master', description: 'Percevez à travers les sens de votre familier, commande-le à distance illimitée. Parlez via lui.', prerequisite: 'Pacte de la Chaîne' },
    { id: 'whispers-of-the-grave', name: 'Murmures de la tombe', nameEn: 'Whispers of the Grave', description: 'Lancez Communication avec les morts à volonté sans emplacement.', prerequisite: 'Niveau 9' },
    { id: 'witch-sight', name: 'Vision de la sorcière', nameEn: 'Witch Sight', description: 'Voyez la vraie forme des métamorphes et des créatures transformées à 9m.', prerequisite: 'Niveau 15' },
    // ─── XGtE ──────────────────────────────────────────────────
    { id: 'bond-of-the-talisman', name: 'Lien du talisman', nameEn: 'Bond of the Talisman', description: 'Le porteur du talisman peut se téléporter vers vous (1 fois/repos long).', prerequisite: 'Niveau 12, Pacte du Talisman' },
    { id: 'eldritch-mind', name: 'Esprit occulte', nameEn: 'Eldritch Mind', description: 'Avantage aux jets de concentration de sorts.' },
    { id: 'far-scribe', name: 'Scribe lointain', nameEn: 'Far Scribe', description: 'Votre Livre des ombres peut être un terminal de message (Message à volonté avec des contacts inscrits).', prerequisite: 'Niveau 5, Pacte du Grimoire' },
    { id: 'gift-of-the-depths', name: 'Don des profondeurs', nameEn: 'Gift of the Depths', description: 'Respirez sous l\'eau. Vitesse de nage. Lancez Marche sur l\'eau une fois par repos long.', prerequisite: 'Niveau 5' },
    { id: 'gift-of-the-ever-living-ones', name: 'Don des immortels', nameEn: 'Gift of the Ever-Living Ones', description: 'Lorsque vous récupérez des PV via votre familier, utilisez le dé max (pas de jet).', prerequisite: 'Pacte de la Chaîne' },
    { id: 'grasp-of-hadar', name: 'Emprise d\'Hadar', nameEn: 'Grasp of Hadar', description: 'Tirez la cible de 3m vers vous avec Décharge occulte (1 fois/tour).', prerequisite: 'Sort mineur Décharge occulte' },
    { id: 'improved-pact-weapon', name: 'Arme de pacte améliorée', nameEn: 'Improved Pact Weapon', description: 'Arme de pacte : +1 d\'attaque et de dégâts. Peut être focus arcanique. Peut être arc/arbalète.', prerequisite: 'Pacte de la Lame' },
    { id: 'investment-of-the-chain-master', name: 'Investissement du maître de chaîne', nameEn: 'Investment of the Chain Master', description: 'Familier : vol/nage, immunité conditionnelle, attaque charmant/empoisonné. Votre réaction pour lui faire attaquer.', prerequisite: 'Pacte de la Chaîne' },
    { id: 'lance-of-lethargy', name: 'Lance de torpeur', nameEn: 'Lance of Lethargy', description: 'Décharge occulte : réduire la vitesse de la cible de 3m jusqu\'au prochain tour (1 fois/tour).', prerequisite: 'Sort mineur Décharge occulte' },
    { id: 'maddening-hex', name: 'Sort maudit délirant', nameEn: 'Maddening Hex', description: 'Action bonus : soul de votre Malédiction rayonne 1d6 psychique à toutes créatures à 1,5m de la cible.', prerequisite: 'Niveau 5, sort Malédiction ou capacité similaire' },
    { id: 'protection-of-the-talisman', name: 'Protection du talisman', nameEn: 'Protection of the Talisman', description: 'Le porteur du talisman : +1d4 aux jets de sauvegarde ratés (4 fois/repos long).', prerequisite: 'Niveau 7, Pacte du Talisman' },
    { id: 'relentless-hex', name: 'Hex impitoyable', nameEn: 'Relentless Hex', description: 'Action bonus : téléportez-vous à 1,5m de votre cible de Malédiction.', prerequisite: 'Niveau 7, sort Malédiction' },
    { id: 'shroud-of-shadow', name: 'Linceul d\'ombre', nameEn: 'Shroud of Shadow', description: 'Lancez Invisibilité à volonté sans emplacement.', prerequisite: 'Niveau 15' },
    { id: 'tomb-of-levistus-xgte', name: 'Tombeau de Lévistus (amélioré)', nameEn: 'Undying Servitude', description: 'Lancez Animation de morts une fois par repos long.', prerequisite: 'Niveau 5' },
    // ─── TCoE ──────────────────────────────────────────────────
    { id: 'eldritch-mind-tcoe', name: 'Esprit sans peur', nameEn: 'Eldritch Mind (TCoE)', description: 'Avantage aux jets de sauvegarde de concentration (version TCoE — identique XGtE).' },
    { id: 'pact-of-the-star-chain', name: 'Invocateur d\'étoiles', nameEn: 'Pact of the Star Chain', description: 'Votre talisman vous permet de lancer Guidé une fois/repos.', prerequisite: 'Pacte du Talisman' },
]
// Pactes de l'Occultiste
export interface PactBoon {
    id: string
    name: string
    nameEn: string
    description: string
}

export const pactBoons: PactBoon[] = [
    { id: 'chain', name: 'Pacte de la Chaîne', nameEn: 'Pact of the Chain', description: 'Apprenez le sort Appel de familier. Votre familier peut être un diablotin, un quasit, un pseudodragon ou un sprite. Vous pouvez le faire attaquer avec votre réaction.' },
    { id: 'blade', name: 'Pacte de la Lame', nameEn: 'Pact of the Blade', description: 'Invoquez une arme de pacte de corps à corps. Vous maîtrisez automatiquement cette arme tant que vous la maniez.' },
    { id: 'tome', name: 'Pacte du Grimoire', nameEn: 'Pact of the Tome', description: 'Recevez un Livre des ombres contenant trois sorts mineurs de n\'importe quelle liste de sorts.' },
    { id: 'talisman', name: 'Pacte du Talisman', nameEn: 'Pact of the Talisman', description: 'Talisman magique : le porteur ajoute 1d4 à ses jets de caractéristique ratés. Porte 4 charges/repos long. Débloquez des invocations spéciales de talisman. (TCoE)' },
]

// Les données principales des classes (structure originale enrichie)
export const classes: CharacterClass[] = [
    {
        id: 'barbarian',
        name: 'Barbare',
        nameEn: 'Barbarian',
        hitDie: 12,
        primaryAbility: 'str',
        savingThrows: ['str', 'con'],
        skillChoices: ['Dressage', 'Athlétisme', 'Intimidation', 'Nature', 'Perception', 'Survie'],
        numSkillChoices: 2,
        armorProficiencies: ['Armures légères', 'Armures intermédiaires', 'Boucliers'],
        weaponProficiencies: ['Armes courantes', 'Armes de guerre'],
        startingEquipment: ['Hache à deux mains', 'Deux hachettes', 'Pack d\'explorateur', '4 javelines'],
    },
    {
        id: 'bard',
        name: 'Barde',
        nameEn: 'Bard',
        hitDie: 8,
        primaryAbility: 'cha',
        savingThrows: ['dex', 'cha'],
        skillChoices: ['Acrobaties', 'Athlétisme', 'Discrétion', 'Histoire', 'Perspicacité', 'Intimidation', 'Investigation', 'Médecine', 'Nature', 'Perception', 'Représentation', 'Persuasion', 'Religion', 'Escamotage', 'Survie'],
        numSkillChoices: 3,
        armorProficiencies: ['Armures légères'],
        weaponProficiencies: ['Armes courantes', 'Arbalète de poing', 'Épée longue', 'Rapière', 'Épée courte'],
        startingEquipment: ['Rapière', 'Pack diplomate', 'Luth', 'Armure de cuir', 'Dague'],
        spellcasting: {
            ability: 'cha',
            cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            spellsKnown: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
            spellSlots: [
                [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2],
                [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1],
                [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
                [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1],
                [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
            ],
        },
    },
    {
        id: 'cleric',
        name: 'Clerc',
        nameEn: 'Cleric',
        hitDie: 8,
        primaryAbility: 'wis',
        savingThrows: ['wis', 'cha'],
        skillChoices: ['Histoire', 'Perspicacité', 'Médecine', 'Persuasion', 'Religion'],
        numSkillChoices: 2,
        armorProficiencies: ['Armures légères', 'Armures intermédiaires', 'Boucliers'],
        weaponProficiencies: ['Armes courantes'],
        startingEquipment: ['Masse d\'armes', 'Cotte de mailles', 'Arbalète légère', 'Pack d\'explorateur', 'Bouclier', 'Symbole sacré'],
        spellcasting: {
            ability: 'wis',
            cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
            spellSlots: [
                [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2],
                [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1],
                [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
                [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1],
                [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
            ],
        },
    },
    {
        id: 'druid',
        name: 'Druide',
        nameEn: 'Druid',
        hitDie: 8,
        primaryAbility: 'wis',
        savingThrows: ['int', 'wis'],
        skillChoices: ['Arcanes', 'Dressage', 'Perspicacité', 'Médecine', 'Nature', 'Perception', 'Religion', 'Survie'],
        numSkillChoices: 2,
        armorProficiencies: ['Armures légères', 'Armures intermédiaires', 'Boucliers (non métalliques)'],
        weaponProficiencies: ['Gourdin', 'Dague', 'Fléchettes', 'Javeline', 'Masse', 'Bâton', 'Cimeterre', 'Serpe', 'Fronde', 'Lance'],
        startingEquipment: ['Bouclier en bois', 'Cimeterre', 'Armure de cuir', 'Pack d\'explorateur', 'Focus druidique'],
        spellcasting: {
            ability: 'wis',
            cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            spellSlots: [
                [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2],
                [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1],
                [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
                [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1],
                [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
            ],
        },
    },
    {
        id: 'fighter',
        name: 'Guerrier',
        nameEn: 'Fighter',
        hitDie: 10,
        primaryAbility: 'str',
        savingThrows: ['str', 'con'],
        skillChoices: ['Acrobaties', 'Dressage', 'Athlétisme', 'Histoire', 'Perspicacité', 'Intimidation', 'Perception', 'Survie'],
        numSkillChoices: 2,
        armorProficiencies: ['Toutes les armures', 'Boucliers'],
        weaponProficiencies: ['Armes courantes', 'Armes de guerre'],
        startingEquipment: ['Cotte de mailles', 'Épée longue', 'Bouclier', 'Arbalète légère', 'Pack d\'exploration'],
    },
    {
        id: 'monk',
        name: 'Moine',
        nameEn: 'Monk',
        hitDie: 8,
        primaryAbility: 'dex',
        savingThrows: ['str', 'dex'],
        skillChoices: ['Acrobaties', 'Athlétisme', 'Histoire', 'Perspicacité', 'Religion', 'Discrétion'],
        numSkillChoices: 2,
        armorProficiencies: [],
        weaponProficiencies: ['Armes courantes', 'Épée courte'],
        startingEquipment: ['Épée courte', 'Pack d\'exploration', '10 fléchettes'],
    },
    {
        id: 'paladin',
        name: 'Paladin',
        nameEn: 'Paladin',
        hitDie: 10,
        primaryAbility: 'str',
        savingThrows: ['wis', 'cha'],
        skillChoices: ['Athlétisme', 'Perspicacité', 'Intimidation', 'Médecine', 'Persuasion', 'Religion'],
        numSkillChoices: 2,
        armorProficiencies: ['Toutes les armures', 'Boucliers'],
        weaponProficiencies: ['Armes courantes', 'Armes de guerre'],
        startingEquipment: ['Arme de guerre', 'Bouclier', 'Cotte de mailles', 'Symbole sacré', 'Pack d\'exploration'],
        spellcasting: {
            ability: 'cha',
            cantripsKnown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            spellSlots: [
                [], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3],
                [4, 3, 2], [4, 3, 2], [4, 3, 3], [4, 3, 3],
                [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2],
                [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2],
            ],
        },
    },
    {
        id: 'ranger',
        name: 'Rôdeur',
        nameEn: 'Ranger',
        hitDie: 10,
        primaryAbility: 'dex',
        savingThrows: ['str', 'dex'],
        skillChoices: ['Dressage', 'Athlétisme', 'Perspicacité', 'Investigation', 'Nature', 'Perception', 'Discrétion', 'Survie'],
        numSkillChoices: 3,
        armorProficiencies: ['Armures légères', 'Armures intermédiaires', 'Boucliers'],
        weaponProficiencies: ['Armes courantes', 'Armes de guerre'],
        startingEquipment: ['Armure d\'écailles', 'Deux épées courtes', 'Pack d\'exploration', 'Arc long', '20 flèches'],
        spellcasting: {
            ability: 'wis',
            cantripsKnown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            spellsKnown: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
            spellSlots: [
                [], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3],
                [4, 3, 2], [4, 3, 2], [4, 3, 3], [4, 3, 3],
                [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2],
                [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2],
            ],
        },
    },
    {
        id: 'rogue',
        name: 'Roublard',
        nameEn: 'Rogue',
        hitDie: 8,
        primaryAbility: 'dex',
        savingThrows: ['dex', 'int'],
        skillChoices: ['Acrobaties', 'Athlétisme', 'Tromperie', 'Perspicacité', 'Intimidation', 'Investigation', 'Perception', 'Représentation', 'Persuasion', 'Escamotage', 'Discrétion'],
        numSkillChoices: 4,
        armorProficiencies: ['Armures légères'],
        weaponProficiencies: ['Armes courantes', 'Arbalète de poing', 'Épée longue', 'Rapière', 'Épée courte'],
        startingEquipment: ['Rapière', 'Arc court', '20 flèches', 'Pack de cambrioleur', 'Armure de cuir', 'Deux dagues', 'Outils de voleur'],
    },
    {
        id: 'sorcerer',
        name: 'Ensorceleur',
        nameEn: 'Sorcerer',
        hitDie: 6,
        primaryAbility: 'cha',
        savingThrows: ['con', 'cha'],
        skillChoices: ['Arcanes', 'Tromperie', 'Perspicacité', 'Intimidation', 'Persuasion', 'Religion'],
        numSkillChoices: 2,
        armorProficiencies: [],
        weaponProficiencies: ['Dague', 'Fléchettes', 'Fronde', 'Bâton', 'Arbalète légère'],
        startingEquipment: ['Arbalète légère', '20 carreaux', 'Composantes', 'Pack d\'explorateur', 'Deux dagues'],
        spellcasting: {
            ability: 'cha',
            cantripsKnown: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
            spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
            spellSlots: [
                [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2],
                [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1],
                [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
                [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1],
                [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
            ],
        },
    },
    {
        id: 'warlock',
        name: 'Occultiste',
        nameEn: 'Warlock',
        hitDie: 8,
        primaryAbility: 'cha',
        savingThrows: ['wis', 'cha'],
        skillChoices: ['Arcanes', 'Tromperie', 'Histoire', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
        numSkillChoices: 2,
        armorProficiencies: ['Armures légères'],
        weaponProficiencies: ['Armes courantes'],
        startingEquipment: ['Arbalète légère', '20 carreaux', 'Composantes', 'Pack d\'érudit', 'Armure de cuir', 'Arme courante', 'Deux dagues'],
        spellcasting: {
            ability: 'cha',
            cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
            spellSlots: [
                [1], [2], [2], [2], [2], [2], [2], [2], [2], [2],
                [3], [3], [3], [3], [3], [3], [4], [4], [4], [4],
            ],
        },
    },
    {
        id: 'wizard',
        name: 'Magicien',
        nameEn: 'Wizard',
        hitDie: 6,
        primaryAbility: 'int',
        savingThrows: ['int', 'wis'],
        skillChoices: ['Arcanes', 'Histoire', 'Perspicacité', 'Investigation', 'Médecine', 'Religion'],
        numSkillChoices: 2,
        armorProficiencies: [],
        weaponProficiencies: ['Dague', 'Fléchettes', 'Fronde', 'Bâton', 'Arbalète légère'],
        startingEquipment: ['Bâton', 'Composantes', 'Pack d\'érudit', 'Grimoire'],
        spellcasting: {
            ability: 'int',
            cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
            spellSlots: [
                [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2],
                [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1],
                [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
                [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1],
                [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
            ],
        },
    },
]
