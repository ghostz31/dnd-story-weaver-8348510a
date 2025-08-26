// Système de génération de trésor basé sur les tables du DMG D&D 5e
import { AideddMagicItem, getRandomMagicItemByRarity, getRandomMagicItemsByRarity } from './aideddMagicItems';

export interface TreasureResult {
  coins: CoinReward;
  artObjects: ArtObject[];
  gemstones: Gemstone[];
  magicItems: MagicItemReward[];
  specialRewards: SpecialReward[];
  totalValue: number;
  description: string;
}

export interface SpecialReward {
  name: string;
  type: 'information' | 'service' | 'territory' | 'social' | 'cursed' | 'unique' | 'recipe' | 'map' | 'deed' | 'favor';
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
  description: string;
  value?: number; // Valeur approximative si applicable
  requirements?: string; // Conditions d'utilisation
}

export interface CoinReward {
  copper: number;
  silver: number;
  electrum: number;
  gold: number;
  platinum: number;
}

export interface ArtObject {
  name: string;
  value: number;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare';
}

export interface Gemstone {
  name: string;
  value: number;
  description: string;
  type: 'ornamental' | 'semi-precious' | 'precious' | 'rare';
}

export interface MagicItemReward {
  name: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact';
  description: string;
  source: string;
  url?: string; // URL vers la page AideDD
  value?: number; // Valeur approximative
}

interface HoardTableBase {
  coins: Record<string, [number, number]>;
  magicItemChance: Record<number, any>;
}

interface HoardTableWithGems extends HoardTableBase {
  gems?: { count: [number, number]; value: number };
  artObjects?: { count: [number, number]; value: number };
}

// Tables de trésor individuel par CR (DMG p.136-137)
const INDIVIDUAL_TREASURE_TABLES = {
  // CR 0-4
  cr0to4: {
    coins: { copper: [5, 6], silver: [0, 0], electrum: [0, 0], gold: [0, 0], platinum: [0, 0] },
    rollTable: [
      { min: 1, max: 30, coins: { copper: [5, 6] } },
      { min: 31, max: 60, coins: { silver: [4, 6] } },
      { min: 61, max: 70, coins: { electrum: [3, 6] } },
      { min: 71, max: 95, coins: { gold: [3, 6] } },
      { min: 96, max: 100, coins: { platinum: [1, 6] } }
    ]
  },
  // CR 5-10
  cr5to10: {
    rollTable: [
      { min: 1, max: 30, coins: { copper: [4, 6], electrum: [1, 6] } },
      { min: 31, max: 60, coins: { silver: [6, 6], gold: [2, 6] } },
      { min: 61, max: 70, coins: { electrum: [3, 6], gold: [2, 6] } },
      { min: 71, max: 95, coins: { gold: [4, 6] } },
      { min: 96, max: 100, coins: { gold: [2, 6], platinum: [3, 6] } }
    ]
  },
  // CR 11-16
  cr11to16: {
    rollTable: [
      { min: 1, max: 20, coins: { silver: [4, 6], gold: [1, 6] } },
      { min: 21, max: 35, coins: { electrum: [1, 6], gold: [1, 6] } },
      { min: 36, max: 75, coins: { gold: [2, 6], platinum: [1, 6] } },
      { min: 76, max: 100, coins: { gold: [2, 6], platinum: [2, 6] } }
    ]
  },
  // CR 17+
  cr17plus: {
    rollTable: [
      { min: 1, max: 15, coins: { electrum: [2, 6], gold: [8, 6] } },
      { min: 16, max: 55, coins: { gold: [1, 6], platinum: [1, 6] } },
      { min: 56, max: 100, coins: { gold: [1, 6], platinum: [2, 6] } }
    ]
  }
};

// Tables de trésor de réserve (Hoard) par niveau (DMG p.137-139)
const HOARD_TREASURE_TABLES = {
  // Niveau 1-4
  level1to4: {
    coins: { copper: [6, 6], silver: [3, 6], gold: [2, 6] },
    magicItemChance: {
      6: null,
      16: { table: 'A', count: 1 },
      36: { table: 'B', count: 1 },
      44: { table: 'C', count: 1 },
      52: { table: 'F', count: 1 },
      60: { table: 'G', count: 1 },
      65: { table: 'H', count: 1 },
      70: { table: 'I', count: 1 },
      100: null
    }
  },
  // Niveau 5-10
  level5to10: {
    coins: { copper: [2, 6], silver: [2, 6], gold: [6, 6], platinum: [3, 6] },
    gems: { count: [3, 6], value: 50 },
    artObjects: { count: [1, 10], value: 250 },
    magicItemChance: {
      4: null,
      10: { table: 'A', count: [1, 4] },
      16: { table: 'B', count: [1, 4] },
      22: { table: 'C', count: [1, 4] },
      28: { table: 'F', count: [1, 4] },
      32: { table: 'G', count: [1, 4] },
      36: { table: 'H', count: [1, 4] },
      40: { table: 'I', count: [1, 4] },
      44: { table: 'A', count: [1, 4] },
      49: { table: 'B', count: [1, 4] },
      54: { table: 'C', count: [1, 4] },
      59: { table: 'F', count: [1, 4] },
      63: { table: 'G', count: [1, 4] },
      67: { table: 'H', count: [1, 4] },
      68: { table: 'I', count: [1, 4] },
      100: null
    }
  },
  // Niveau 11-16
  level11to16: {
    coins: { gold: [4, 6], platinum: [5, 6] },
    gems: { count: [1, 4], value: 1000 },
    artObjects: { count: [1, 10], value: 2500 },
    magicItemChance: {
      3: null,
      6: { table: 'A', count: [1, 4] },
      9: { table: 'B', count: [1, 4] },
      12: { table: 'C', count: [1, 4] },
      15: { table: 'F', count: [1, 4] },
      18: { table: 'G', count: [1, 4] },
      21: { table: 'H', count: [1, 4] },
      24: { table: 'I', count: [1, 4] },
      100: null
    }
  },
  // Niveau 17+
  level17plus: {
    coins: { gold: [12, 6], platinum: [8, 6] },
    gems: { count: [1, 8], value: 5000 },
    artObjects: { count: [1, 4], value: 7500 },
    magicItemChance: {
      2: null,
      5: { table: 'C', count: [1, 8] },
      8: { table: 'F', count: [1, 4] },
      11: { table: 'G', count: [1, 4] },
      14: { table: 'H', count: [1, 4] },
      17: { table: 'I', count: [1, 4] },
      100: null
    }
  }
} as const;

// Objets d'art par valeur (DMG p.134)
const ART_OBJECTS = {
  25: [
    "Chope en argent avec des poignées en forme de griffon",
    "Petit miroir dans un cadre en bois peint",
    "Petit coffret en bois avec des incrustations d'ivoire",
    "Statuette en os représentant un halfelin",
    "Bracelet en laiton avec des turquoises",
    "Vêtement en tissu fin avec des broderies d'or",
    "Masque de velours noir avec de nombreuses perles",
    "Calice en cuivre avec des filigranes d'argent"
  ],
  250: [
    "Grande tapisserie bien préservée",
    "Collier de perles fines",
    "Petit coffre doublé de fourrure et de soie",
    "Statuette en bronze d'un noble halfelin",
    "Paire de boucles d'oreilles en or sertie de saphirs",
    "Boîte à musique en or",
    "Circlet d'or avec quatre aigues-marines",
    "Collier de perles d'or"
  ],
  750: [
    "Calice en argent serti d'opales",
    "Harpe exquise avec des incrustations d'ivoire et de zircon",
    "Petit coffre d'ivoire incrusté d'or",
    "Idole d'or d'un démon",
    "Collier d'or avec un pendentif saphir",
    "Masque funéraire en or",
    "Couronne en platine",
    "Anneau serti d'émeraude"
  ],
  2500: [
    "Peinture d'un noble par un maître artiste",
    "Bol en or serti de diamants",
    "Bracelet d'or avec des rubis",
    "Collier avec un pendentif en diamant",
    "Couronne d'or et de rubis",
    "Sceptre d'or serti de diamants et rubis",
    "Anneau avec un saphir étoilé",
    "Diadème d'or et de perles"
  ],
  7500: [
    "Couronne de joyaux",
    "Anneau d'or et de platine serti de diamants",
    "Petit coffre d'or avec des pierres précieuses",
    "Calice d'or incrusté de diamants et rubis",
    "Collier de diamants",
    "Orbe d'or avec saphirs",
    "Sceptre de platine et de saphirs",
    "Tiare de diamants"
  ]
};

// Gemmes par valeur (DMG p.134)
const GEMSTONES = {
  10: [
    { name: "Azurite", description: "Pierre bleue opaque marbrée", type: "ornamental" as const },
    { name: "Hématite", description: "Pierre gris foncé", type: "ornamental" as const },
    { name: "Lapis-lazuli", description: "Pierre bleue opaque avec des taches dorées", type: "ornamental" as const },
    { name: "Malachite", description: "Pierre verte opaque marbrée", type: "ornamental" as const },
    { name: "Obsidienne", description: "Pierre volcanique noire", type: "ornamental" as const },
    { name: "Rhodochrosite", description: "Pierre rose opaque", type: "ornamental" as const },
    { name: "Œil de tigre", description: "Pierre brune translucide avec un centre doré", type: "ornamental" as const },
    { name: "Turquoise", description: "Pierre bleue opaque", type: "ornamental" as const }
  ],
  50: [
    { name: "Calcédoine", description: "Pierre blanche opaque", type: "semi-precious" as const },
    { name: "Chrysoprase", description: "Pierre verte translucide", type: "semi-precious" as const },
    { name: "Citrine", description: "Quartz jaune pâle", type: "semi-precious" as const },
    { name: "Jaspe", description: "Pierre bleue, noire ou brune opaque", type: "semi-precious" as const },
    { name: "Pierre de lune", description: "Pierre blanche translucide avec un éclat pâle", type: "semi-precious" as const },
    { name: "Onyx", description: "Bandes noires et blanches opaques", type: "semi-precious" as const },
    { name: "Quartz", description: "Cristal transparent blanc", type: "semi-precious" as const },
    { name: "Sardoine", description: "Pierre rouge, brune ou orange opaque", type: "semi-precious" as const }
  ],
  100: [
    { name: "Ambre", description: "Résine fossile dorée transparente", type: "semi-precious" as const },
    { name: "Améthyste", description: "Quartz violet transparent", type: "semi-precious" as const },
    { name: "Chrysobéryl", description: "Gemme jaune-verte transparente", type: "semi-precious" as const },
    { name: "Corail", description: "Rouge opaque", type: "semi-precious" as const },
    { name: "Grenat", description: "Rouge, brun-vert ou violet transparent", type: "semi-precious" as const },
    { name: "Jade", description: "Vert clair translucide", type: "semi-precious" as const },
    { name: "Jais", description: "Noir opaque", type: "semi-precious" as const },
    { name: "Perle", description: "Blanche, crème ou rose opaque", type: "semi-precious" as const }
  ],
  500: [
    { name: "Alexandrite", description: "Vert foncé transparent", type: "precious" as const },
    { name: "Aigue-marine", description: "Bleu-vert pâle transparent", type: "precious" as const },
    { name: "Perle noire", description: "Noire opaque", type: "precious" as const },
    { name: "Spinel bleu", description: "Bleu foncé transparent", type: "precious" as const },
    { name: "Péridot", description: "Vert olive transparent", type: "precious" as const },
    { name: "Topaze", description: "Jaune doré transparent", type: "precious" as const }
  ],
  1000: [
    { name: "Saphir noir", description: "Noir transparent", type: "precious" as const },
    { name: "Perle dorée", description: "Dorée opaque", type: "precious" as const },
    { name: "Opale de feu", description: "Rouge ardent translucide", type: "precious" as const },
    { name: "Opale", description: "Bleu pâle avec des reflets blancs et dorés", type: "precious" as const },
    { name: "Saphir étoilé", description: "Saphir bleu transparent avec une étoile blanche", type: "precious" as const },
    { name: "Rubis étoilé", description: "Ruby translucide rouge avec une étoile blanche", type: "precious" as const }
  ],
  5000: [
    { name: "Saphir", description: "Bleu transparent de la plus belle qualité", type: "rare" as const },
    { name: "Émeraude", description: "Vert brillant transparent", type: "rare" as const },
    { name: "Opale de feu", description: "Rouge ardent de qualité supérieure", type: "rare" as const },
    { name: "Opale", description: "Multicolore avec des reflets dorés", type: "rare" as const },
    { name: "Rubis", description: "Rouge transparent de la plus belle qualité", type: "rare" as const },
    { name: "Diamant", description: "Transparent de la plus belle qualité", type: "rare" as const }
  ]
};

// Tables d'objets magiques étendues avec plus de potions et objets
const MAGIC_ITEM_TABLES = {
  A: [
    { name: "Potion de soins", type: "Potion", rarity: "common" as const, description: "Récupère 2d4+2 points de vie" },
    { name: "Potion de soins mineure", type: "Potion", rarity: "common" as const, description: "Récupère 1d4+1 points de vie" },
    { name: "Potion d'escalade", type: "Potion", rarity: "common" as const, description: "Vitesse d'escalade de 20 pieds pendant 1 heure" },
    { name: "Potion de respiration aquatique", type: "Potion", rarity: "common" as const, description: "Respirer sous l'eau pendant 1 heure" },
    { name: "Potion de résistance à l'acide", type: "Potion", rarity: "uncommon" as const, description: "Résistance aux dégâts d'acide pendant 1 heure" },
    { name: "Sort en parchemin (niveau 1)", type: "Parchemin", rarity: "common" as const, description: "Contient un sort de niveau 1 aléatoire" },
    { name: "Huile d'affûtage", type: "Objet merveilleux", rarity: "common" as const, description: "Appliquée sur une arme, +1 aux dégâts pour 1 heure" },
    { name: "Munitions +1", type: "Munitions", rarity: "uncommon" as const, description: "20 projectiles magiques +1" },
    { name: "Torche éternelle", type: "Objet merveilleux", rarity: "common" as const, description: "Torche qui brûle éternellement sans se consumer" },
    { name: "Corde de soie elfique", type: "Objet merveilleux", rarity: "common" as const, description: "50 pieds de corde ultra-résistante et légère" }
  ],
  B: [
    { name: "Potion de soins supérieure", type: "Potion", rarity: "uncommon" as const, description: "Récupère 4d4+4 points de vie" },
    { name: "Potion de résistance au feu", type: "Potion", rarity: "uncommon" as const, description: "Résistance aux dégâts de feu pendant 1 heure" },
    { name: "Potion de résistance au froid", type: "Potion", rarity: "uncommon" as const, description: "Résistance aux dégâts de froid pendant 1 heure" },
    { name: "Potion d'invisibilité", type: "Potion", rarity: "very_rare" as const, description: "Invisibilité pendant 1 heure" },
    { name: "Potion de force de géant des collines", type: "Potion", rarity: "uncommon" as const, description: "Force fixée à 21 pendant 1 heure" },
    { name: "Sort en parchemin (niveau 2)", type: "Parchemin", rarity: "uncommon" as const, description: "Contient un sort de niveau 2 aléatoire" },
    { name: "Sac sans fond", type: "Objet merveilleux", rarity: "uncommon" as const, description: "Peut contenir 500 livres dans un espace de 2 pieds cubes" },
    { name: "Corde d'escalade", type: "Objet merveilleux", rarity: "uncommon" as const, description: "Corde de 60 pieds qui obéit aux commandes" },
    { name: "Gants de nage et d'escalade", type: "Objet merveilleux", rarity: "uncommon" as const, description: "Vitesse de nage et d'escalade de 40 pieds" },
    { name: "Bottes de marche et de saut", type: "Objet merveilleux", rarity: "uncommon" as const, description: "Vitesse +10 pieds, triple la distance de saut" }
  ],
  C: [
    { name: "Potion de vol", type: "Potion", rarity: "very_rare" as const, description: "Vitesse de vol de 60 pieds pendant 1 heure" },
    { name: "Sort en parchemin (niveau 4)", type: "Parchemin", rarity: "rare" as const, description: "Contient un sort de niveau 4" },
    { name: "Armure de cuir clouté +1", type: "Armure", rarity: "rare" as const, description: "CA 12 + Mod.Dex + 1" },
    { name: "Bouclier +1", type: "Bouclier", rarity: "uncommon" as const, description: "Bonus de +3 à la CA" }
  ],
  F: [
    { name: "Arme +1", type: "Arme", rarity: "uncommon" as const, description: "Arme magique avec bonus +1 aux jets d'attaque et de dégâts" },
    { name: "Munitions +2", type: "Munitions", rarity: "rare" as const, description: "20 projectiles magiques +2" },
    { name: "Potion de soins supérieure", type: "Potion", rarity: "rare" as const, description: "Récupère 8d4+8 points de vie" },
    { name: "Anneau de protection", type: "Anneau", rarity: "rare" as const, description: "Bonus +1 à la CA et aux jets de sauvegarde" }
  ],
  G: [
    { name: "Armure de mailles +1", type: "Armure", rarity: "rare" as const, description: "CA 16 + 1" },
    { name: "Armure d'écailles +1", type: "Armure", rarity: "rare" as const, description: "CA 14 + Mod.Dex (max 2) + 1" },
    { name: "Bouclier +2", type: "Bouclier", rarity: "rare" as const, description: "Bonus de +4 à la CA" },
    { name: "Armure de cuir +2", type: "Armure", rarity: "rare" as const, description: "CA 11 + Mod.Dex + 2" }
  ],
  H: [
    { name: "Potion de soins suprême", type: "Potion", rarity: "very_rare" as const, description: "Récupère 10d4+20 points de vie" },
    { name: "Sort en parchemin (niveau 6)", type: "Parchemin", rarity: "very_rare" as const, description: "Contient un sort de niveau 6" },
    { name: "Armure de plates +1", type: "Armure", rarity: "rare" as const, description: "CA 18 + 1" },
    { name: "Arme +2", type: "Arme", rarity: "rare" as const, description: "Arme magique avec bonus +2 aux jets d'attaque et de dégâts" }
  ],
  I: [
    { name: "Armure +3", type: "Armure", rarity: "very_rare" as const, description: "Armure avec bonus +3 à la CA" },
    { name: "Arme +3", type: "Arme", rarity: "very_rare" as const, description: "Arme magique avec bonus +3 aux jets d'attaque et de dégâts" },
    { name: "Amulette de santé", type: "Objet merveilleux", rarity: "rare" as const, description: "Constitution fixée à 19" },
    { name: "Ceinturon de force de géant des collines", type: "Objet merveilleux", rarity: "rare" as const, description: "Force fixée à 21" }
  ]
};

// Tables de récompenses spéciales
const SPECIAL_REWARDS = {
  information: [
    {
      name: "Carte au trésor",
      description: "Indique l'emplacement d'un trésor caché dans un rayon de 50 km",
      rarity: "uncommon" as const,
      value: 100
    },
    {
      name: "Secret de noble",
      description: "Information compromettante sur un noble local",
      rarity: "rare" as const,
      value: 500
    },
    {
      name: "Emplacement de donjon",
      description: "Coordonnées précises d'un donjon inexploré",
      rarity: "rare" as const,
      value: 300
    },
    {
      name: "Mot de passe secret",
      description: "Code d'accès à une organisation criminelle ou guilde",
      rarity: "uncommon" as const,
      value: 200
    },
    {
      name: "Prophétie ancienne",
      description: "Prédiction cryptique concernant l'avenir du royaume",
      rarity: "very_rare" as const,
      value: 1000
    },
    {
      name: "Recette d'alchimiste",
      description: "Formule pour créer une potion rare",
      rarity: "rare" as const,
      value: 400
    },
    {
      name: "Généalogie royale",
      description: "Arbre généalogique prouvant une lignée noble",
      rarity: "very_rare" as const,
      value: 2000
    }
  ],
  
  service: [
    {
      name: "Faveur de forgeron",
      description: "Un forgeron maître accepte de créer un objet gratuitement",
      rarity: "uncommon" as const,
      value: 250,
      requirements: "Doit être utilisé dans les 30 jours"
    },
    {
      name: "Protection de la garde",
      description: "Les gardes locaux vous protègent pendant 1 semaine",
      rarity: "uncommon" as const,
      value: 150
    },
    {
      name: "Transport gratuit",
      description: "Un marchand offre le transport gratuit vers n'importe quelle ville",
      rarity: "common" as const,
      value: 100
    },
    {
      name: "Soins du temple",
      description: "Les prêtres locaux offrent leurs services gratuitement",
      rarity: "rare" as const,
      value: 500,
      requirements: "Inclut résurrection si nécessaire"
    },
    {
      name: "Formation de maître",
      description: "Un maître accepte d'enseigner une compétence ou un sort",
      rarity: "rare" as const,
      value: 1000,
      requirements: "Prend 1d4 semaines"
    },
    {
      name: "Audience royale",
      description: "Droit à une audience privée avec le dirigeant local",
      rarity: "very_rare" as const,
      value: 0,
      requirements: "Peut mener à des quêtes importantes"
    }
  ],
  
  territory: [
    {
      name: "Titre de propriété",
      description: "Acte de propriété d'une petite maison en ville",
      rarity: "uncommon" as const,
      value: 2000
    },
    {
      name: "Droits miniers",
      description: "Autorisation d'exploiter une mine pendant 1 an",
      rarity: "rare" as const,
      value: 5000
    },
    {
      name: "Taverne abandonnée",
      description: "Propriété d'une taverne nécessitant des réparations",
      rarity: "uncommon" as const,
      value: 1500,
      requirements: "Nécessite 1000 po de réparations"
    },
    {
      name: "Tour de mage",
      description: "Ancienne tour de sorcier avec laboratoire",
      rarity: "rare" as const,
      value: 10000,
      requirements: "Peut contenir des dangers magiques"
    },
    {
      name: "Fief noble",
      description: "Petit domaine avec village et terres agricoles",
      rarity: "very_rare" as const,
      value: 50000,
      requirements: "Vient avec responsabilités et taxes"
    }
  ],
  
  social: [
    {
      name: "Lettre de recommandation",
      description: "Recommandation d'un noble pour rejoindre une guilde",
      rarity: "uncommon" as const,
      value: 300
    },
    {
      name: "Pardon royal",
      description: "Amnistie pour tous crimes mineurs passés",
      rarity: "rare" as const,
      value: 0,
      requirements: "Ne couvre pas les crimes majeurs"
    },
    {
      name: "Titre de noblesse mineure",
      description: "Reconnaissance officielle comme petite noblesse",
      rarity: "very_rare" as const,
      value: 0,
      requirements: "Vient avec privilèges et obligations"
    },
    {
      name: "Mariage arrangé",
      description: "Proposition de mariage avantageux avec famille riche",
      rarity: "rare" as const,
      value: 10000,
      requirements: "Peut être refusé"
    },
    {
      name: "Adoption par guilde",
      description: "Membership honoraire dans une guilde prestigieuse",
      rarity: "rare" as const,
      value: 500
    }
  ],
  
  cursed: [
    {
      name: "Malédiction mineure",
      description: "Désavantage sur un type de jet de sauvegarde pendant 1 semaine",
      rarity: "uncommon" as const,
      value: -100,
      requirements: "Peut être levée par Remove Curse"
    },
    {
      name: "Objet maudit attirant",
      description: "Objet magique puissant mais avec malédiction cachée",
      rarity: "rare" as const,
      value: 1000,
      requirements: "Effets négatifs se révèlent avec le temps"
    },
    {
      name: "Dette d'honneur",
      description: "Obligation morale de rendre un service important",
      rarity: "uncommon" as const,
      value: 0,
      requirements: "Refuser apporte le déshonneur"
    }
  ],
  
  unique: [
    {
      name: "Œuf de dragon fossilisé",
      description: "Œuf ancien qui pourrait être ranimé par magie puissante",
      rarity: "legendary" as const,
      value: 25000,
      requirements: "Nécessite magie de niveau 9"
    },
    {
      name: "Fragment d'étoile",
      description: "Météorite aux propriétés magiques inconnues",
      rarity: "very_rare" as const,
      value: 5000
    },
    {
      name: "Clé dimensionnelle",
      description: "Ouvre un portail vers un demi-plan personnel",
      rarity: "legendary" as const,
      value: 50000,
      requirements: "Usage unique"
    },
    {
      name: "Cristal de temps",
      description: "Permet de voir 24h dans le passé ou le futur",
      rarity: "very_rare" as const,
      value: 15000,
      requirements: "3 charges, se recharge à l'aube"
    },
    {
      name: "Graine d'arbre-monde",
      description: "Pousse en arbre géant avec propriétés magiques",
      rarity: "legendary" as const,
      value: 100000,
      requirements: "Prend 100 ans pour pousser complètement"
    }
  ],
  
  recipe: [
    {
      name: "Recette de bière naine",
      description: "Formule secrète pour brasser la légendaire bière naine",
      rarity: "uncommon" as const,
      value: 200
    },
    {
      name: "Alliage magique",
      description: "Technique pour forger des armes +1",
      rarity: "rare" as const,
      value: 2000
    },
    {
      name: "Poison paralysant",
      description: "Formule pour créer un poison non-létal puissant",
      rarity: "uncommon" as const,
      value: 300
    },
    {
      name: "Encre invisible",
      description: "Recette d'encre révélée seulement par magie",
      rarity: "common" as const,
      value: 50
    }
  ],
  
  map: [
    {
      name: "Carte des égouts",
      description: "Plan détaillé du réseau souterrain de la ville",
      rarity: "common" as const,
      value: 100
    },
    {
      name: "Routes commerciales",
      description: "Carte des routes commerciales les plus profitables",
      rarity: "uncommon" as const,
      value: 500
    },
    {
      name: "Sanctuaires cachés",
      description: "Emplacements de temples secrets dans la région",
      rarity: "rare" as const,
      value: 1000
    },
    {
      name: "Carte du plan astral",
      description: "Navigation dans le plan astral",
      rarity: "very_rare" as const,
      value: 10000
    }
  ]
};

// Utilitaires de génération
class TreasureGenerator {
  // Lancer de dés
  private rollDice(count: number, sides: number): number {
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  }

  // Convertir notation [count, sides] en nombre
  private rollFromArray(diceArray: readonly [number, number] | [number, number]): number {
    return this.rollDice(diceArray[0], diceArray[1]);
  }

  // Générer trésor individuel
  generateIndividualTreasure(cr: number): TreasureResult {
    const table = this.getIndividualTable(cr);
    const roll = this.rollDice(1, 100);
    
    let coinResult: CoinReward = { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 };
    
    for (const entry of table.rollTable) {
      if (roll >= entry.min && roll <= entry.max) {
        Object.entries(entry.coins).forEach(([coinType, diceArray]) => {
          if (diceArray && Array.isArray(diceArray)) {
            coinResult[coinType as keyof CoinReward] = this.rollFromArray(diceArray as [number, number]);
          }
        });
        break;
      }
    }

    return {
      coins: coinResult,
      artObjects: [],
      gemstones: [],
      magicItems: [],
      specialRewards: [],
      totalValue: this.calculateCoinValue(coinResult),
      description: this.formatIndividualTreasureDescription(coinResult)
    };
  }

  // Générer trésor de réserve (Hoard)
  generateHoardTreasure(partyLevel: number): TreasureResult {
    const table = this.getHoardTable(partyLevel);
    let result: TreasureResult = {
      coins: { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 },
      artObjects: [],
      gemstones: [],
      magicItems: [],
      specialRewards: [],
      totalValue: 0,
      description: ""
    };

    // Générer les pièces
    Object.entries(table.coins).forEach(([coinType, diceArray]) => {
      if (diceArray) {
        result.coins[coinType as keyof CoinReward] = this.rollFromArray(diceArray as [number, number]) * 100;
      }
    });

    // Générer les gemmes si applicable
    if ('gems' in table && table.gems) {
      const gemCount = this.rollFromArray(table.gems.count);
      for (let i = 0; i < gemCount; i++) {
        const availableGems = GEMSTONES[table.gems.value as keyof typeof GEMSTONES];
        const randomGem = availableGems[Math.floor(Math.random() * availableGems.length)];
        result.gemstones.push({
          ...randomGem,
          value: table.gems.value
        });
      }
    }

    // Générer les objets d'art si applicable
    if ('artObjects' in table && table.artObjects) {
      const artCount = this.rollFromArray(table.artObjects.count);
      for (let i = 0; i < artCount; i++) {
        const availableArt = ART_OBJECTS[table.artObjects.value as keyof typeof ART_OBJECTS];
        const randomArt = availableArt[Math.floor(Math.random() * availableArt.length)];
        result.artObjects.push({
          name: randomArt,
          value: table.artObjects.value,
          description: randomArt,
          rarity: this.getArtRarity(table.artObjects.value)
        });
      }
    }

    // Générer les objets magiques
    const magicRoll = this.rollDice(1, 100);
    Object.entries(table.magicItemChance).forEach(([threshold, itemData]) => {
      const thresholdNum = parseInt(threshold);
      if (magicRoll <= thresholdNum && itemData) {
        const count = Array.isArray(itemData.count) ? this.rollFromArray(itemData.count) : itemData.count;
        for (let i = 0; i < count; i++) {
          // Utiliser les objets AideDD selon la table demandée
          const rarity = this.getTableRarity(itemData.table);
          const aideddItem = getRandomMagicItemByRarity(rarity);
          
          if (aideddItem) {
            result.magicItems.push(convertAideddToMagicItem(aideddItem));
          } else {
            // Fallback vers les anciens objets si aucun objet AideDD n'est trouvé
            const magicTable = MAGIC_ITEM_TABLES[itemData.table as keyof typeof MAGIC_ITEM_TABLES];
            const randomItem = magicTable[Math.floor(Math.random() * magicTable.length)];
            result.magicItems.push({
              ...randomItem,
              source: "DMG"
            });
          }
        }
        return;
      }
    });

    // Calculer la valeur totale
    result.totalValue = this.calculateTotalValue(result);
    result.description = this.formatHoardTreasureDescription(result);

    return result;
  }

  // Générer trésor complet pour une rencontre
  generateEncounterTreasure(monsters: Array<{name: string, cr: number}>, partyLevel: number): {
    individualTreasures: Array<{monster: string, treasure: TreasureResult}>;
    hoardTreasure: TreasureResult | null;
  } {
    const individualTreasures = monsters.map(monster => ({
      monster: monster.name,
      treasure: this.generateCreatureSpecificTreasure(monster.name, monster.cr)
    }));

    // Générer un trésor de réserve pour les rencontres importantes (CR élevé)
    const totalCR = monsters.reduce((sum, monster) => sum + monster.cr, 0);
    const hoardTreasure = totalCR >= 4 ? this.generateHoardTreasure(partyLevel) : null;

    return {
      individualTreasures,
      hoardTreasure
    };
  }

  // Générer trésor adapté selon la créature
  generateCreatureSpecificTreasure(creatureName: string, cr: number): TreasureResult {
    const baseTreasure = this.generateIndividualTreasure(cr);
    
    // Bonus d'objets spécifiques selon le type de créature
    const creatureType = this.getCreatureType(creatureName);
    const specificItems = this.getCreatureSpecificItems(creatureType, cr);
    
    // Ajouter les objets spécifiques
    baseTreasure.magicItems.push(...specificItems);
    
    // Générer des récompenses spéciales
    const specialRewards = this.generateSpecialRewards(creatureType, cr);
    baseTreasure.specialRewards.push(...specialRewards);
    
    // Mettre à jour la description
    const totalSpecial = specificItems.length + specialRewards.length;
    baseTreasure.description = baseTreasure.description === 'Aucun trésor' && totalSpecial > 0
      ? `Objets spéciaux (${totalSpecial})`
      : baseTreasure.description;
    
    return baseTreasure;
  }

  // Déterminer le type de créature
  private getCreatureType(creatureName: string): string {
    const name = creatureName.toLowerCase();
    
    if (name.includes('dragon')) return 'dragon';
    if (name.includes('gobelin') || name.includes('orc') || name.includes('hobgobelin')) return 'humanoide_tribal';
    if (name.includes('squelette') || name.includes('zombie') || name.includes('liche') || name.includes('fantome')) return 'mort_vivant';
    if (name.includes('mage') || name.includes('sorcier') || name.includes('archimage')) return 'lanceur_de_sorts';
    if (name.includes('bandit') || name.includes('voleur') || name.includes('assassin')) return 'criminel';
    if (name.includes('loup') || name.includes('ours') || name.includes('aigle') || name.includes('tigre')) return 'bete';
    if (name.includes('diable') || name.includes('demon')) return 'fiend';
    if (name.includes('elementaire')) return 'elementaire';
    if (name.includes('geant')) return 'geant';
    
    return 'commun';
  }

  // Objets spécifiques par type de créature
  private getCreatureSpecificItems(creatureType: string, cr: number): MagicItemReward[] {
    const items: MagicItemReward[] = [];
    const roll = this.rollDice(1, 100);
    
    switch (creatureType) {
      case 'dragon':
        if (roll <= 80) {
          items.push({
            name: "Écaille de dragon",
            type: "Composant magique",
            rarity: cr >= 10 ? "rare" : "uncommon",
            description: "Composant précieux pour l'enchantement d'armures",
            source: "Créature"
          });
        }
        if (cr >= 15 && roll <= 30) {
          items.push({
            name: "Souffle de dragon en fiole",
            type: "Potion",
            rarity: "very_rare",
            description: "Une fois utilisée, reproduit le souffle du dragon (3d6 dégâts)",
            source: "Créature"
          });
        }
        break;
        
      case 'humanoide_tribal':
        if (roll <= 60) {
          items.push({
            name: "Potion de soins tribale",
            type: "Potion",
            rarity: "common",
            description: "Remède traditionnel, récupère 1d4+1 points de vie",
            source: "Créature"
          });
        }
        if (roll <= 25) {
          items.push({
            name: "Poison de lame",
            type: "Poison",
            rarity: "uncommon",
            description: "3 doses, +1d4 dégâts de poison pendant 1 minute",
            source: "Créature"
          });
        }
        break;
        
      case 'mort_vivant':
        if (roll <= 40) {
          items.push({
            name: "Poussière d'os",
            type: "Composant magique",
            rarity: "uncommon",
            description: "Composant pour sorts de nécromancie",
            source: "Créature"
          });
        }
        if (cr >= 5 && roll <= 20) {
          items.push({
            name: "Essence spectrale",
            type: "Objet merveilleux",
            rarity: "rare",
            description: "Permet de voir les créatures invisibles pendant 10 minutes",
            source: "Créature"
          });
        }
        break;
        
      case 'lanceur_de_sorts':
        if (roll <= 70) {
          const spellLevel = Math.min(Math.floor(cr / 3) + 1, 6);
          items.push({
            name: `Sort en parchemin (niveau ${spellLevel})`,
            type: "Parchemin",
            rarity: spellLevel >= 4 ? "rare" : "uncommon",
            description: `Contient un sort de niveau ${spellLevel}`,
            source: "Créature"
          });
        }
        if (cr >= 8 && roll <= 30) {
          items.push({
            name: "Focaliseur arcanique",
            type: "Objet merveilleux",
            rarity: "rare",
            description: "+1 aux jets d'attaque des sorts",
            source: "Créature"
          });
        }
        break;
        
      case 'criminel':
        if (roll <= 50) {
          items.push({
            name: "Outils de voleur de maître",
            type: "Équipement",
            rarity: "uncommon",
            description: "+2 aux tests de Dextérité avec les outils de voleur",
            source: "Créature"
          });
        }
        if (roll <= 30) {
          items.push({
            name: "Potion d'invisibilité mineure",
            type: "Potion",
            rarity: "rare",
            description: "Invisibilité pendant 10 minutes",
            source: "Créature"
          });
        }
        break;
        
      case 'bete':
        if (roll <= 35) {
          items.push({
            name: "Trophée de chasse",
            type: "Objet d'art",
            rarity: "common",
            description: "Crocs, griffes ou plumes de valeur",
            source: "Créature"
          });
        }
        break;
        
      case 'elementaire':
        if (roll <= 60) {
          items.push({
            name: "Essence élémentaire",
            type: "Composant magique",
            rarity: cr >= 5 ? "rare" : "uncommon",
            description: "Cristallisation de l'essence élémentaire pure",
            source: "Créature"
          });
        }
        break;
        
      case 'geant':
        if (roll <= 40) {
          items.push({
            name: "Potion de force de géant",
            type: "Potion",
            rarity: "rare",
            description: "Force fixée à 23 pendant 1 heure",
            source: "Créature"
          });
        }
        break;
    }
    
    return items;
  }

  // Générer des récompenses spéciales
  private generateSpecialRewards(creatureType: string, cr: number): SpecialReward[] {
    const rewards: SpecialReward[] = [];
    const roll = this.rollDice(1, 100);
    
    // Chance de base pour une récompense spéciale (augmente avec le CR)
    const baseChance = Math.min(20 + (cr * 5), 60);
    
    if (roll <= baseChance) {
      // Sélectionner un type de récompense selon la créature
      const rewardType = this.getSpecialRewardType(creatureType, cr);
      const availableRewards = SPECIAL_REWARDS[rewardType];
      
      if (availableRewards && availableRewards.length > 0) {
        const randomReward = availableRewards[Math.floor(Math.random() * availableRewards.length)];
                 rewards.push({
           name: randomReward.name,
           type: rewardType,
           rarity: randomReward.rarity,
           description: randomReward.description,
           value: randomReward.value,
           requirements: (randomReward as any).requirements
         });
      }
    }
    
    // Chance bonus pour les créatures de haut niveau
    if (cr >= 10 && this.rollDice(1, 100) <= 25) {
      const bonusType = this.getSpecialRewardType(creatureType, cr);
      const bonusRewards = SPECIAL_REWARDS[bonusType];
      
      if (bonusRewards && bonusRewards.length > 0) {
        const bonusReward = bonusRewards[Math.floor(Math.random() * bonusRewards.length)];
        // Éviter les doublons
        if (!rewards.some(r => r.name === bonusReward.name)) {
                     rewards.push({
             name: bonusReward.name,
             type: bonusType,
             rarity: bonusReward.rarity,
             description: bonusReward.description,
             value: bonusReward.value,
             requirements: (bonusReward as any).requirements
           });
        }
      }
    }
    
    return rewards;
  }

  // Déterminer le type de récompense spéciale selon la créature
  private getSpecialRewardType(creatureType: string, cr: number): keyof typeof SPECIAL_REWARDS {
    const roll = this.rollDice(1, 100);
    
    switch (creatureType) {
      case 'dragon':
        if (cr >= 15) return roll <= 30 ? 'unique' : roll <= 60 ? 'territory' : 'information';
        if (cr >= 10) return roll <= 50 ? 'information' : 'territory';
        return roll <= 70 ? 'information' : 'map';
        
      case 'humanoide_tribal':
        return roll <= 40 ? 'information' : roll <= 70 ? 'map' : 'recipe';
        
      case 'mort_vivant':
        if (cr >= 8) return roll <= 30 ? 'cursed' : roll <= 60 ? 'unique' : 'information';
        return roll <= 50 ? 'cursed' : 'information';
        
      case 'lanceur_de_sorts':
        if (cr >= 10) return roll <= 40 ? 'unique' : roll <= 70 ? 'recipe' : 'information';
        return roll <= 60 ? 'recipe' : 'information';
        
      case 'criminel':
        return roll <= 50 ? 'information' : roll <= 80 ? 'service' : 'social';
        
      case 'geant':
        return roll <= 40 ? 'territory' : roll <= 70 ? 'service' : 'information';
        
      case 'fiend':
        return roll <= 60 ? 'cursed' : roll <= 80 ? 'unique' : 'information';
        
      case 'elementaire':
        return roll <= 50 ? 'unique' : roll <= 80 ? 'recipe' : 'information';
        
      default:
        // Répartition générale
        if (roll <= 30) return 'information';
        if (roll <= 50) return 'service';
        if (roll <= 65) return 'map';
        if (roll <= 80) return 'recipe';
        if (roll <= 90) return 'social';
        return 'territory';
    }
  }

  // Méthodes utilitaires privées
  private getIndividualTable(cr: number) {
    if (cr <= 4) return INDIVIDUAL_TREASURE_TABLES.cr0to4;
    if (cr <= 10) return INDIVIDUAL_TREASURE_TABLES.cr5to10;
    if (cr <= 16) return INDIVIDUAL_TREASURE_TABLES.cr11to16;
    return INDIVIDUAL_TREASURE_TABLES.cr17plus;
  }

  private getHoardTable(level: number) {
    if (level <= 4) return HOARD_TREASURE_TABLES.level1to4;
    if (level <= 10) return HOARD_TREASURE_TABLES.level5to10;
    if (level <= 16) return HOARD_TREASURE_TABLES.level11to16;
    return HOARD_TREASURE_TABLES.level17plus;
  }

  private calculateCoinValue(coins: CoinReward): number {
    return coins.copper * 0.01 + coins.silver * 0.1 + coins.electrum * 0.5 + coins.gold * 1 + coins.platinum * 10;
  }

  private calculateTotalValue(result: TreasureResult): number {
    let total = this.calculateCoinValue(result.coins);
    total += result.artObjects.reduce((sum, art) => sum + art.value, 0);
    total += result.gemstones.reduce((sum, gem) => sum + gem.value, 0);
    // Les objets magiques n'ont pas de valeur marchande fixe
    return total;
  }

  private getArtRarity(value: number): 'common' | 'uncommon' | 'rare' | 'very_rare' {
    if (value <= 25) return 'common';
    if (value <= 250) return 'uncommon';
    if (value <= 2500) return 'rare';
    return 'very_rare';
  }

  private formatIndividualTreasureDescription(coins: CoinReward): string {
    const parts = [];
    if (coins.platinum > 0) parts.push(`${coins.platinum} pp`);
    if (coins.gold > 0) parts.push(`${coins.gold} po`);
    if (coins.electrum > 0) parts.push(`${coins.electrum} pe`);
    if (coins.silver > 0) parts.push(`${coins.silver} pa`);
    if (coins.copper > 0) parts.push(`${coins.copper} pc`);
    
    return parts.length > 0 ? parts.join(', ') : 'Aucun trésor';
  }

  // Méthode pour déterminer la rareté selon la table magique
  private getTableRarity(table: string): 'commun' | 'peu commun' | 'rare' | 'très rare' | 'légendaire' {
    const tableRarityMap: Record<string, 'commun' | 'peu commun' | 'rare' | 'très rare' | 'légendaire'> = {
      'A': 'commun',
      'B': 'peu commun', 
      'C': 'rare',
      'F': 'peu commun',
      'G': 'rare',
      'H': 'très rare',
      'I': 'légendaire'
    };
    return tableRarityMap[table] || 'peu commun';
  }

  private formatHoardTreasureDescription(result: TreasureResult): string {
    const parts = [];
    
    // Pièces
    const coinDesc = this.formatIndividualTreasureDescription(result.coins);
    if (coinDesc !== 'Aucun trésor') parts.push(coinDesc);
    
    // Gemmes
    if (result.gemstones.length > 0) {
      parts.push(`${result.gemstones.length} gemme(s)`);
    }
    
    // Objets d'art
    if (result.artObjects.length > 0) {
      parts.push(`${result.artObjects.length} objet(s) d'art`);
    }
    
    // Objets magiques
    if (result.magicItems.length > 0) {
      parts.push(`${result.magicItems.length} objet(s) magique(s)`);
    }
    
    return parts.join(', ') || 'Aucun trésor';
  }
}

// Fonction pour convertir un objet AideDD en MagicItemReward
const convertAideddToMagicItem = (aideddItem: AideddMagicItem): MagicItemReward => {
  const rarityMap: Record<string, 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact'> = {
    'commun': 'common',
    'peu commun': 'uncommon',
    'rare': 'rare',
    'très rare': 'very_rare',
    'légendaire': 'legendary',
    'artéfact': 'artifact'
  };

  return {
    name: aideddItem.nameVF,
    type: aideddItem.type,
    rarity: rarityMap[aideddItem.rarity] || 'common',
    description: aideddItem.description || `${aideddItem.nameVF} (${aideddItem.type})`,
    source: aideddItem.source,
    url: aideddItem.url,
    value: getApproximateValue(rarityMap[aideddItem.rarity] || 'common')
  };
};

// Fonction pour obtenir une valeur approximative selon la rareté
const getApproximateValue = (rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact'): number => {
  const valueRanges = {
    'common': 100,
    'uncommon': 500,
    'rare': 5000,
    'very_rare': 50000,
    'legendary': 250000,
    'artifact': 1000000
  };
  return valueRanges[rarity];
};

// Instance singleton du générateur
export const treasureGenerator = new TreasureGenerator();

// Fonctions utilitaires exportées
export const generateIndividualTreasure = (cr: number) => treasureGenerator.generateIndividualTreasure(cr);
export const generateHoardTreasure = (partyLevel: number) => treasureGenerator.generateHoardTreasure(partyLevel);
export const generateEncounterTreasure = (monsters: Array<{name: string, cr: number}>, partyLevel: number) => 
  treasureGenerator.generateEncounterTreasure(monsters, partyLevel); 