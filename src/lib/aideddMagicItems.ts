export interface AideddMagicItem {
  nameVF: string;
  nameVO: string;
  type: 'Anneau' | 'Arme' | 'Armure' | 'Baguette' | 'Bâton' | 'Objet merveilleux' | 'Parchemin' | 'Potion' | 'Sceptre';
  rarity: 'commun' | 'peu commun' | 'rare' | 'très rare' | 'légendaire' | 'artéfact';
  url: string;
  description?: string;
  source: string;
}

export const AIDEDD_MAGIC_ITEMS: AideddMagicItem[] = [
  // Objets communs
  {
    nameVF: "Amulette de sombre éclat",
    nameVO: "Dark Shard Amulet",
    type: "Objet merveilleux",
    rarity: "commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=amulette-de-sombre-eclat",
    description: "Lance un sort mineur d'occultiste, soumis à un jet d'Intelligence (Arcanes).",
    source: "Xanathar's Guide to Everything"
  },
  {
    nameVF: "Amulette mécanique",
    nameVO: "Clockwork Amulet",
    type: "Objet merveilleux",
    rarity: "commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=amulette-mecanique",
    description: "Cette amulette permet d'obtenir 10 au lieu de lancer le d20 d'un jet d'attaque (1/jour).",
    source: "Xanathar's Guide to Everything"
  },
  {
    nameVF: "Vêtements raccommodeurs",
    nameVO: "Clothes of Mending",
    type: "Objet merveilleux",
    rarity: "commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=vetements-raccommodeurs",
    description: "Ces vêtements de voyageur se réparent magiquement contre l'usure quotidienne.",
    source: "Xanathar's Guide to Everything"
  },

  // Objets peu communs
  {
    nameVF: "Amulette d'antidétection",
    nameVO: "Amulet of Proof against Detection and Location",
    type: "Objet merveilleux",
    rarity: "peu commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=amulette-d-antidetection",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Amulette de cicatrisation",
    nameVO: "Periapt of Wound Closure",
    type: "Objet merveilleux",
    rarity: "peu commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=amulette-de-cicatrisation",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Amulette de santé",
    nameVO: "Periapt of Health",
    type: "Objet merveilleux",
    rarity: "peu commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=amulette-de-sante",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Anneau de barrière mentale",
    nameVO: "Ring of Mind Shielding",
    type: "Anneau",
    rarity: "peu commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=anneau-de-barriere-mentale",
    description: "Immunité aux magies qui permettent de lire dans vos pensées.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Anneau de chaleur constante",
    nameVO: "Ring of Warmth",
    type: "Anneau",
    rarity: "peu commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=anneau-de-chaleur-constante",
    description: "Résistance aux dommages causés par le froid ; insensibles aux basses températures jusqu'à -45 degrés Celsius.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Anneau de marche sur l'eau",
    nameVO: "Ring of Water Walking",
    type: "Anneau",
    rarity: "peu commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=anneau-de-marche-sur-l-eau",
    description: "Permet de se déplacer et de rester sur des surfaces liquides.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Potion de soins",
    nameVO: "Potion of Healing",
    type: "Potion",
    rarity: "peu commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=potion-de-soins",
    description: "Restaure 2d4+2 points de vie.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Potion d'escalade",
    nameVO: "Potion of Climbing",
    type: "Potion",
    rarity: "peu commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=potion-d-escalade",
    description: "Confère une vitesse d'escalade de 6 mètres pendant 1 heure.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Sceptre inamovible",
    nameVO: "Immovable Rod",
    type: "Sceptre",
    rarity: "peu commun",
    url: "https://www.aidedd.org/dnd/om.php?vf=sceptre-inamovible",
    description: "Ce sceptre peut se fixer magiquement sur place et retenir jusqu'à 4000 kg.",
    source: "Dungeon Master's Guide"
  },

  // Objets rares
  {
    nameVF: "Amulette de bonne santé",
    nameVO: "Amulet of Health",
    type: "Objet merveilleux",
    rarity: "rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=amulette-de-bonne-sante",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Amulette de protection contre le poison",
    nameVO: "Periapt of Proof against Poison",
    type: "Objet merveilleux",
    rarity: "rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=amulette-de-protection-contre-le-poison",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Anneau d'action libre",
    nameVO: "Ring of Free Action",
    type: "Anneau",
    rarity: "rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=anneau-d-action-libre",
    description: "Un terrain difficile ne coûte pas de mouvement extra ; la magie ne peut réduire votre vitesse ni vous paralyser ou entraver.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Anneau d'esquive totale",
    nameVO: "Ring of Evasion",
    type: "Anneau",
    rarity: "rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=anneau-d-esquive-totale",
    description: "3 charges pour convertir un jet de sauvegarde de Dextérité raté en réussite.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Anneau d'influence sur les animaux",
    nameVO: "Ring of Animal Influence",
    type: "Anneau",
    rarity: "rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=anneau-d-influence-sur-les-animaux",
    description: "3 charges pour lancer amitié avec les animaux, peur ou communication avec les animaux.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Anneau de feuille morte",
    nameVO: "Ring of Feather Falling",
    type: "Anneau",
    rarity: "rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=anneau-de-feuille-morte",
    description: "Aucun dommage dû à une chute.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Arme +1",
    nameVO: "Weapon +1",
    type: "Arme",
    rarity: "rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=arme-1",
    description: "Bonus de +1 aux jets d'attaque et de dégâts.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Armure +1",
    nameVO: "Armor +1",
    type: "Armure",
    rarity: "rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=armure-1",
    description: "Bonus de +1 à la classe d'armure.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Bouclier +1",
    nameVO: "Shield +1",
    type: "Armure",
    rarity: "rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=bouclier-1",
    description: "Bonus de +1 à la classe d'armure.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Potion de soins supérieurs",
    nameVO: "Potion of Greater Healing",
    type: "Potion",
    rarity: "rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=potion-de-soins-superieurs",
    description: "Restaure 4d4+4 points de vie.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Potion d'invisibilité",
    nameVO: "Potion of Invisibility",
    type: "Potion",
    rarity: "rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=potion-d-invisibilite",
    description: "Vous devenez invisible pendant 1 heure.",
    source: "Dungeon Master's Guide"
  },

  // Objets très rares
  {
    nameVF: "Amulette des plans",
    nameVO: "Amulet of the Planes",
    type: "Objet merveilleux",
    rarity: "très rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=amulette-des-plans",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Anneau de feu d'étoiles",
    nameVO: "Ring of Shooting Stars",
    type: "Anneau",
    rarity: "très rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=anneau-de-feu-d-etoiles",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Arme +2",
    nameVO: "Weapon +2",
    type: "Arme",
    rarity: "très rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=arme-2",
    description: "Bonus de +2 aux jets d'attaque et de dégâts.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Armure +2",
    nameVO: "Armor +2",
    type: "Armure",
    rarity: "très rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=armure-2",
    description: "Bonus de +2 à la classe d'armure.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Bouclier +2",
    nameVO: "Shield +2",
    type: "Armure",
    rarity: "très rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=bouclier-2",
    description: "Bonus de +2 à la classe d'armure.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Tapis volant",
    nameVO: "Carpet of Flying",
    type: "Objet merveilleux",
    rarity: "très rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=tapis-volant",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Voleuse des neuf vies",
    nameVO: "Nine Lives Stealer",
    type: "Arme",
    rarity: "très rare",
    url: "https://www.aidedd.org/dnd/om.php?vf=voleuse-des-neuf-vies",
    description: "Arme +2 ; 1d8+1 charges pour jet de sauvegarde de Constitution ou être tué instantanément en cas de coup critique.",
    source: "Dungeon Master's Guide"
  },

  // Objets légendaires
  {
    nameVF: "Anneau d'invisibilité",
    nameVO: "Ring of Invisibility",
    type: "Anneau",
    rarity: "légendaire",
    url: "https://www.aidedd.org/dnd/om.php?vf=anneau-d-invisibilite",
    description: "Vous devenez invisible jusqu'à ce que l'anneau soit retiré ou que vous attaquiez ou lanciez un sort.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Anneau de convocation de djinn",
    nameVO: "Ring of Djinni Summoning",
    type: "Anneau",
    rarity: "légendaire",
    url: "https://www.aidedd.org/dnd/om.php?vf=anneau-de-convocation-de-djinn",
    description: "Invoque un djinn amical pendant 1 heure (1/jour).",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Anneau de contrôle des élémentaires",
    nameVO: "Ring of Elemental Command",
    type: "Anneau",
    rarity: "légendaire",
    url: "https://www.aidedd.org/dnd/om.php?vf=anneau-de-controle-des-elementaires",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Arme +3",
    nameVO: "Weapon +3",
    type: "Arme",
    rarity: "légendaire",
    url: "https://www.aidedd.org/dnd/om.php?vf=arme-3",
    description: "Bonus de +3 aux jets d'attaque et de dégâts.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Armure +3",
    nameVO: "Armor +3",
    type: "Armure",
    rarity: "légendaire",
    url: "https://www.aidedd.org/dnd/om.php?vf=armure-3",
    description: "Bonus de +3 à la classe d'armure.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Bouclier +3",
    nameVO: "Shield +3",
    type: "Armure",
    rarity: "légendaire",
    url: "https://www.aidedd.org/dnd/om.php?vf=bouclier-3",
    description: "Bonus de +3 à la classe d'armure.",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Vengeresse sacrée",
    nameVO: "Holy Avenger",
    type: "Arme",
    rarity: "légendaire",
    url: "https://www.aidedd.org/dnd/om.php?vf=vengeresse-sacree",
    source: "Dungeon Master's Guide"
  },
  {
    nameVF: "Sphère d'annihilation",
    nameVO: "Sphere of Annihilation",
    type: "Objet merveilleux",
    rarity: "légendaire",
    url: "https://www.aidedd.org/dnd/om.php?vf=sphere-d-annihilation",
    source: "Dungeon Master's Guide"
  }
];

// Fonction pour obtenir les objets par rareté
export const getMagicItemsByRarity = (rarity: AideddMagicItem['rarity']): AideddMagicItem[] => {
  return AIDEDD_MAGIC_ITEMS.filter(item => item.rarity === rarity);
};

// Fonction pour obtenir les objets par type
export const getMagicItemsByType = (type: AideddMagicItem['type']): AideddMagicItem[] => {
  return AIDEDD_MAGIC_ITEMS.filter(item => item.type === type);
};

// Fonction pour obtenir un objet aléatoire par rareté
export const getRandomMagicItemByRarity = (rarity: AideddMagicItem['rarity']): AideddMagicItem | null => {
  const items = getMagicItemsByRarity(rarity);
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
};

// Fonction pour obtenir plusieurs objets aléatoires par rareté
export const getRandomMagicItemsByRarity = (rarity: AideddMagicItem['rarity'], count: number): AideddMagicItem[] => {
  const items = getMagicItemsByRarity(rarity);
  const result: AideddMagicItem[] = [];
  
  for (let i = 0; i < count && items.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * items.length);
    result.push(items[randomIndex]);
  }
  
  return result;
}; 