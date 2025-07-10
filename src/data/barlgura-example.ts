// Exemple de données complètes pour un Barlgura
export const barlguraData = {
  name: "Barlgura",
  originalName: "Barlgura",
  cr: 5,
  xp: 1800,
  type: "Fiélon",
  subtype: "démon",
  size: "G",
  ac: "15 (armure naturelle)",
  hp: "68 (8d10 + 24)",
  speed: {
    walk: 12,
    climb: 12
  },
  abilities: {
    str: 18,
    dex: 15,
    con: 16,
    int: 7,
    wis: 14,
    cha: 9
  },
  savingThrows: "Dex +5, Con +6",
  skills: "Discrétion +5, Perception +5",
  damageResistances: "froid, feu, foudre",
  damageImmunities: "poison",
  conditionImmunities: "empoisonné",
  senses: "vision aveugle 9 m, vision dans le noir 36 m, Perception passive 15",
  languages: "abyssal, télépathie 36 m",
  alignment: "chaotique mauvais",
  legendary: false,
  source: "Monster Manual",
  environment: ["Abysses"],
  
  // Capacités spéciales
  traits: [
    {
      name: "Incantation innée",
      description: "La caractéristique d'incantation innée du barlgura est la Sagesse (jet de sauvegarde contre ses sorts DD 13). Le barlgura peut lancer les sorts suivants de manière innée, sans avoir besoin de composantes matérielles :\n\n1/jour chacun : enchevêtrement, force fantasmagorique\n2/jour chacun : déguisement, invisibilité (personnel uniquement)"
    },
    {
      name: "Téméraire",
      description: "Au début de son tour, le barlgura peut obtenir un avantage à tous les jets d'attaque au corps à corps avec une arme pendant ce tour, mais les attaques contre lui ont un avantage jusqu'au début de son prochain tour."
    },
    {
      name: "Saut avec élan",
      description: "Le saut en longueur du barlgura va jusqu'à 12 mètres et son saut en hauteur jusqu'à 6 mètres quand il peut prendre son élan."
    }
  ],
  
  // Actions
  actions: [
    {
      name: "Attaques multiples",
      description: "Le barlgura effectue trois attaques : une de morsure et deux avec ses poings."
    },
    {
      name: "Morsure",
      description: "Attaque au corps à corps avec une arme : +7 au toucher, allonge 1,50 m, une cible. Touché : 11 (2d6 + 4) dégâts perforants."
    },
    {
      name: "Poing",
      description: "Attaque au corps à corps avec une arme : +7 au toucher, allonge 1,50 m, une cible. Touché : 9 (1d10 + 4) dégâts contondants."
    }
  ]
}; 