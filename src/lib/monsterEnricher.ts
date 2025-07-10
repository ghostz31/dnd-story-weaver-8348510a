/**
 * Service pour enrichir les données des monstres avec des informations supplémentaires
 * pour un affichage complet dans MonsterCard
 */

import { Monster } from './types';

// Enrichir un monstre avec des données supplémentaires
export function enrichMonster(monster: any): any {
  // Créer une copie pour ne pas modifier l'original
  const enriched = { ...monster };

  // Appliquer des enrichissements spéciaux pour certains monstres spécifiques
  if (enriched.name === 'Balor') {
    return enrichBalorDemon(enriched);
  }

  // S'assurer que les capacités sont définies
  enriched.abilities = enriched.abilities || {
    str: enriched.str || 10,
    dex: enriched.dex || 10,
    con: enriched.con || 10,
    int: enriched.int || 10,
    wis: enriched.wis || 10,
    cha: enriched.cha || 10
  };

  // Formater la classe d'armure si ce n'est pas déjà une chaîne
  if (typeof enriched.ac === 'number') {
    enriched.ac = `${enriched.ac}`;
  }

  // Formater les points de vie si ce n'est pas déjà une chaîne
  if (typeof enriched.hp === 'number') {
    const hitDie = getHitDieForSize(enriched.size);
    const diceCount = Math.max(1, Math.floor(enriched.hp / ((hitDie / 2) + 0.5)));
    const conMod = Math.floor((enriched.abilities.con - 10) / 2);
    const conBonus = conMod * diceCount;
    
    // Ajuster le format pour correspondre à "68 (8d10 + 24)"
    enriched.hp = `${enriched.hp} (${diceCount}d${hitDie}${conBonus !== 0 ? (conBonus > 0 ? ` + ${conBonus}` : ` - ${Math.abs(conBonus)}`) : ''})`;
  }

  // Formater la vitesse si ce n'est pas déjà dans le bon format
  if (!enriched.speed) {
    enriched.speed = { walk: 9 };
  } else if (Array.isArray(enriched.speed)) {
    const speedObj: any = { walk: 9 };
    if (enriched.speed.includes('vol')) speedObj.fly = 18;
    if (enriched.speed.includes('nage')) speedObj.swim = 9;
    if (enriched.speed.includes('escalade')) speedObj.climb = 6;
    if (enriched.speed.includes('creusement')) speedObj.burrow = 6;
    enriched.speed = speedObj;
  }

  // Générer des jets de sauvegarde s'ils n'existent pas
  if (!enriched.savingThrows) {
    enriched.savingThrows = generateSavingThrows(enriched);
  }

  // Générer des compétences si elles n'existent pas
  if (!enriched.skills) {
    enriched.skills = generateSkills(enriched);
  }

  // Générer des résistances et immunités si elles n'existent pas
  if (!enriched.damageResistances) {
    enriched.damageResistances = generateDamageResistances(enriched);
  }

  if (!enriched.damageImmunities) {
    enriched.damageImmunities = generateDamageImmunities(enriched);
  }

  if (!enriched.conditionImmunities) {
    enriched.conditionImmunities = generateConditionImmunities(enriched);
  }

  // Générer des sens s'ils n'existent pas
  if (!enriched.senses) {
    enriched.senses = generateSenses(enriched);
  }

  // Générer des langues si elles n'existent pas
  if (!enriched.languages) {
    enriched.languages = generateLanguages(enriched);
  }

  // Générer des traits s'ils n'existent pas
  if (!enriched.traits || enriched.traits.length === 0) {
    enriched.traits = generateTraits(enriched);
  }

  // Générer des actions si elles n'existent pas
  if (!enriched.actions || enriched.actions.length === 0) {
    enriched.actions = generateActions(enriched);
  }

  // Générer des actions légendaires si nécessaire
  if (enriched.legendary && (!enriched.legendaryActions || enriched.legendaryActions.length === 0)) {
    enriched.legendaryActions = generateLegendaryActions(enriched);
  }

  return enriched;
}

// Enrichir spécifiquement le Balor (puissant démon)
function enrichBalorDemon(monster: any): any {
  // Créer un Balor complet
  return {
    ...monster,
    name: "Balor",
    originalName: "Balor",
    cr: 19,
    xp: 22000,
    type: "Fiélon",
    subtype: "démon",
    size: "TG",
    ac: "19 (armure naturelle)",
    hp: "262 (21d12 + 126)",
    speed: {
      walk: 12,
      fly: 24
    },
    abilities: {
      str: 26,
      dex: 15,
      con: 22,
      int: 20,
      wis: 16,
      cha: 22
    },
    savingThrows: "For +14, Con +12, Sag +9, Cha +12",
    skills: "Intimidation +12, Perception +9",
    damageResistances: "froid, foudre, contondant, perforant et tranchant d'attaques non magiques",
    damageImmunities: "feu, poison",
    conditionImmunities: "empoisonné",
    senses: "vision véritable 36 m, Perception passive 19",
    languages: "abyssal, télépathie 36 m",
    alignment: "chaotique mauvais",
    legendary: false,
    source: "Monster Manual",
    environment: ["Abysses"],
    
    traits: [
      {
        name: "Armes démoniaques",
        description: "Les attaques d'arme du balor sont magiques. Quand le balor touche avec une arme, celle-ci inflige 1d6 dégâts de foudre supplémentaires (inclus dans l'attaque)."
      },
      {
        name: "Résistance à la magie",
        description: "Le balor a l'avantage aux jets de sauvegarde contre les sorts et autres effets magiques."
      },
      {
        name: "Aura de feu",
        description: "Au début de chacun de ses tours, le balor inflige 10 (3d6) dégâts de feu à toutes les créatures situées à 1,50 mètre ou moins de lui. De plus, toute créature qui touche le balor avec une attaque au corps à corps alors qu'elle se trouve à 1,50 mètre ou moins de lui subit 10 (3d6) dégâts de feu."
      }
    ],
    
    actions: [
      {
        name: "Attaques multiples",
        description: "Le balor effectue deux attaques : une avec son épée longue et une avec son fouet."
      },
      {
        name: "Épée longue",
        description: "Attaque d'arme au corps à corps : +14 au toucher, allonge 3 m, une cible. Touché : 21 (3d8 + 8) dégâts tranchants plus 13 (3d8) dégâts de foudre. Si le balor obtient un coup critique, il lance trois fois les dés de dégâts au lieu de deux."
      },
      {
        name: "Fouet",
        description: "Attaque d'arme au corps à corps : +14 au toucher, allonge 9 m, une cible. Touché : 15 (2d6 + 8) dégâts tranchants plus 10 (3d6) dégâts de feu, et la cible doit réussir un jet de sauvegarde de Force DD 20 pour ne pas être tirée de jusqu'à 7,50 mètres vers le balor."
      },
      {
        name: "Téléportation",
        description: "Le balor se téléporte magiquement, avec tous ses objets équipés et transportés, vers un emplacement inoccupé qu'il peut voir dans un rayon de 36 mètres."
      }
    ]
  };
}

// Fonction pour obtenir le dé de vie selon la taille
function getHitDieForSize(size: string): number {
  switch (size) {
    case 'TP': return 4;
    case 'P': return 6;
    case 'M': return 8;
    case 'G': return 10;
    case 'TG': return 12;
    case 'Gig': return 20;
    default: return 8;
  }
}

// Générer des jets de sauvegarde pour un monstre
function generateSavingThrows(monster: any): string {
  const proficiencyBonus = Math.max(2, Math.floor(2 + (monster.cr / 4)));
  const abilities = monster.abilities;
  const savingThrows = [];

  // Déterminer les sauvegardes basées sur le type
  let primarySaves: string[] = [];
  
  switch (monster.type) {
    case 'Bête':
      primarySaves = ['dex', 'con'];
      break;
    case 'Humanoïde':
      primarySaves = ['dex', 'wis'];
      break;
    case 'Dragon':
      primarySaves = ['dex', 'con', 'wis', 'cha'];
      break;
    case 'Fiélon':
      primarySaves = ['dex', 'con', 'wis'];
      break;
    case 'Aberration':
      primarySaves = ['con', 'int', 'wis'];
      break;
    case 'Céleste':
      primarySaves = ['wis', 'cha'];
      break;
    case 'Mort-vivant':
      primarySaves = ['wis', 'cha'];
      break;
    case 'Géant':
      primarySaves = ['str', 'con'];
      break;
    default:
      // Choisir 2 sauvegardes aléatoires
      const allAbilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
      primarySaves = [
        allAbilities[Math.floor(Math.random() * 6)],
        allAbilities[Math.floor(Math.random() * 6)]
      ];
      // Éviter les doublons
      if (primarySaves[0] === primarySaves[1]) {
        primarySaves[1] = allAbilities[(allAbilities.indexOf(primarySaves[0]) + 1) % 6];
      }
  }

  // Ajouter les jets de sauvegarde avec bonus
  primarySaves.forEach(ability => {
    const abilityKey = ability as keyof typeof abilities;
    const mod = Math.floor((abilities[abilityKey] - 10) / 2);
    const total = mod + proficiencyBonus;
    
    let frenchAbility = '';
    switch (ability) {
      case 'str': frenchAbility = 'For'; break;
      case 'dex': frenchAbility = 'Dex'; break;
      case 'con': frenchAbility = 'Con'; break;
      case 'int': frenchAbility = 'Int'; break;
      case 'wis': frenchAbility = 'Sag'; break;
      case 'cha': frenchAbility = 'Cha'; break;
    }
    
    savingThrows.push(`${frenchAbility} ${total >= 0 ? '+' : ''}${total}`);
  });

  return savingThrows.join(', ');
}

// Générer des compétences pour un monstre
function generateSkills(monster: any): string {
  const proficiencyBonus = Math.max(2, Math.floor(2 + (monster.cr / 4)));
  const abilities = monster.abilities;
  const skills = [];

  // Déterminer les compétences basées sur le type
  let primarySkills: { name: string, ability: string }[] = [];
  
  switch (monster.type) {
    case 'Bête':
      primarySkills = [
        { name: 'Perception', ability: 'wis' },
        { name: 'Discrétion', ability: 'dex' }
      ];
      break;
    case 'Humanoïde':
      primarySkills = [
        { name: 'Perception', ability: 'wis' },
        { name: 'Persuasion', ability: 'cha' }
      ];
      break;
    case 'Dragon':
      primarySkills = [
        { name: 'Perception', ability: 'wis' },
        { name: 'Intimidation', ability: 'cha' }
      ];
      break;
    case 'Fiélon':
      primarySkills = [
        { name: 'Tromperie', ability: 'cha' },
        { name: 'Intimidation', ability: 'cha' },
        { name: 'Perception', ability: 'wis' }
      ];
      break;
    case 'Aberration':
      primarySkills = [
        { name: 'Arcanes', ability: 'int' },
        { name: 'Perception', ability: 'wis' }
      ];
      break;
    default:
      primarySkills = [
        { name: 'Perception', ability: 'wis' }
      ];
  }

  // Ajouter les compétences avec bonus
  primarySkills.forEach(skill => {
    const abilityKey = skill.ability as keyof typeof abilities;
    const mod = Math.floor((abilities[abilityKey] - 10) / 2);
    const total = mod + proficiencyBonus;
    
    skills.push(`${skill.name} ${total >= 0 ? '+' : ''}${total}`);
  });

  return skills.join(', ');
}

// Générer des résistances aux dégâts
function generateDamageResistances(monster: any): string {
  if (monster.type === 'Fiélon') return 'feu, froid, foudre';
  if (monster.type === 'Mort-vivant') return 'nécrotique';
  if (monster.type === 'Élémentaire') {
    if (monster.name.toLowerCase().includes('feu')) return 'contondant, perforant et tranchant des attaques non magiques';
    if (monster.name.toLowerCase().includes('eau')) return 'acide';
    if (monster.name.toLowerCase().includes('terre')) return 'perforant, tranchant';
    if (monster.name.toLowerCase().includes('air')) return 'foudre, tonnerre';
    return 'contondant, perforant et tranchant des attaques non magiques';
  }
  
  return '';
}

// Générer des immunités aux dégâts
function generateDamageImmunities(monster: any): string {
  if (monster.type === 'Artificiel') return 'poison, psychique';
  if (monster.type === 'Mort-vivant') return 'poison';
  if (monster.type === 'Élémentaire') {
    if (monster.name.toLowerCase().includes('feu')) return 'feu, poison';
    if (monster.name.toLowerCase().includes('eau')) return 'poison';
    if (monster.name.toLowerCase().includes('terre')) return 'poison';
    if (monster.name.toLowerCase().includes('air')) return 'poison';
    return 'poison';
  }
  
  return '';
}

// Générer des immunités aux états
function generateConditionImmunities(monster: any): string {
  if (monster.type === 'Artificiel') return 'empoisonné, charmé, épuisé, paralysé, pétrifié, effrayé';
  if (monster.type === 'Mort-vivant') return 'empoisonné, épuisé';
  if (monster.type === 'Élémentaire') return 'épuisé, paralysé, pétrifié, empoisonné, inconscient';
  
  return '';
}

// Générer des sens
function generateSenses(monster: any): string {
  const passivePerception = 10 + Math.floor((monster.abilities?.wis || 10) - 10) / 2;
  let senses = `Perception passive ${passivePerception}`;
  
  if (monster.type === 'Mort-vivant' || monster.type === 'Aberration' || monster.type === 'Fiélon') {
    senses = `vision dans le noir 18 m, ${senses}`;
  }
  
  if (monster.cr >= 5) {
    senses = `vision dans le noir 18 m, ${senses}`;
  }
  
  return senses;
}

// Générer des langues
function generateLanguages(monster: any): string {
  if (monster.type === 'Bête') return '--';
  if (monster.type === 'Humanoïde') return 'commun';
  if (monster.type === 'Dragon') return 'draconique';
  if (monster.type === 'Fiélon') {
    if (monster.name.toLowerCase().includes('démon')) return 'abyssal, télépathie 18 m';
    if (monster.name.toLowerCase().includes('diable')) return 'infernal, télépathie 18 m';
    return 'infernal';
  }
  if (monster.type === 'Mort-vivant') return 'comprend les langues qu\'il connaissait de son vivant mais ne peut pas parler';
  if (monster.type === 'Artificiel') return 'comprend les langues de son créateur mais ne peut pas parler';
  
  return 'comprend le commun mais ne peut pas parler';
}

// Générer des traits spéciaux pour un monstre
function generateTraits(monster: any): { name: string, description: string }[] {
  const traits = [];

  switch (monster.type) {
    case 'Fiélon':
      traits.push({
        name: "Résistance à la magie",
        description: `Le monstre a l'avantage aux jets de sauvegarde contre les sorts et autres effets magiques.`
      });
      
      // Traits spécifiques pour les démons
      if (monster.name.toLowerCase().includes('démon')) {
        traits.push({
          name: "Armes démoniaques",
          description: "Les attaques d'arme du démon sont magiques."
        });
      }
      
      // Traits spécifiques pour les diables
      if (monster.name.toLowerCase().includes('diable')) {
        traits.push({
          name: "Vue du diable",
          description: "Les ténèbres magiques ne gênent pas la vision dans le noir du diable."
        });
      }
      
      if (monster.cr >= 3) {
        traits.push({
          name: "Incantation innée",
          description: `La caractéristique d'incantation innée du monstre est le Charisme (DD du jet de sauvegarde contre les sorts ${8 + Math.floor((monster.abilities?.cha || 10) - 10) / 2 + Math.max(2, Math.floor(2 + (monster.cr / 4)))}, +${Math.floor((monster.abilities?.cha || 10) - 10) / 2 + Math.max(2, Math.floor(2 + (monster.cr / 4)))} au toucher avec les attaques de sort). Il peut lancer les sorts suivants de manière innée, sans avoir besoin de composantes matérielles:\n\nÀ volonté: détection de la magie\n3/jour: ténèbres\n1/jour: charme-personne`
        });
      }
      break;
    case 'Dragon':
      traits.push({
        name: "Résistance légendaire",
        description: "Si le dragon rate un jet de sauvegarde, il peut choisir de le réussir à la place."
      });
      break;
    case 'Mort-vivant':
      traits.push({
        name: "Sensibilité à l'eau bénite",
        description: "Le monstre subit des dégâts radiants égaux à son niveau de puissance lorsqu'il est aspergé d'eau bénite."
      });
      break;
  }

  // Ajouter des traits basés sur l'environnement
  if (monster.environment) {
    if (Array.isArray(monster.environment)) {
      if (monster.environment.some(env => env.includes('aquatique'))) {
        traits.push({
          name: "Amphibie",
          description: "Le monstre peut respirer à l'air libre et sous l'eau."
        });
      }
      if (monster.environment.some(env => env.includes('souterrain'))) {
        traits.push({
          name: "Vision dans le noir",
          description: "Le monstre a une vision dans le noir sur 18 mètres."
        });
      }
    } else if (typeof monster.environment === 'string') {
      if (monster.environment.includes('aquatique')) {
        traits.push({
          name: "Amphibie",
          description: "Le monstre peut respirer à l'air libre et sous l'eau."
        });
      }
      if (monster.environment.includes('souterrain')) {
        traits.push({
          name: "Vision dans le noir",
          description: "Le monstre a une vision dans le noir sur 18 mètres."
        });
      }
    }
  }

  return traits;
}

// Générer des actions pour un monstre
function generateActions(monster: any): { name: string, description: string }[] {
  const actions = [];
  const proficiencyBonus = Math.max(2, Math.floor(2 + (monster.cr / 4)));
  const strMod = Math.floor((monster.abilities?.str || 10) - 10) / 2;
  const dexMod = Math.floor((monster.abilities?.dex || 10) - 10) / 2;
  
  // Détermine quel modificateur utiliser pour les attaques
  const attackMod = Math.max(strMod, dexMod);
  const attackBonus = attackMod + proficiencyBonus;
  
  if (monster.cr >= 5) {
    actions.push({
      name: "Attaques multiples",
      description: `Le monstre effectue ${Math.min(3, Math.max(2, Math.floor(monster.cr / 5)))} attaques.`
    });
  }

  switch (monster.type) {
    case 'Bête':
      actions.push({
        name: "Morsure",
        description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 1,50 m, une cible. Touché : ${Math.floor(monster.cr) + 2 + attackMod} (1d${monster.size === 'G' ? '8' : monster.size === 'TG' ? '10' : monster.size === 'Gig' ? '12' : '6'} + ${attackMod}) dégâts perforants.`
      });
      
      if (monster.size !== 'TP' && monster.size !== 'P') {
        actions.push({
          name: "Griffes",
          description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 1,50 m, une cible. Touché : ${Math.floor(monster.cr) + attackMod} (1d${monster.size === 'G' ? '6' : monster.size === 'TG' ? '8' : monster.size === 'Gig' ? '10' : '4'} + ${attackMod}) dégâts tranchants.`
        });
      }
      break;
      
    case 'Humanoïde':
      actions.push({
        name: "Épée",
        description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 1,50 m, une cible. Touché : ${Math.floor(monster.cr) + 2 + attackMod} (1d8 + ${attackMod}) dégâts tranchants.`
      });
      
      actions.push({
        name: "Arbalète",
        description: `Attaque à distance avec une arme : +${Math.floor((monster.abilities?.dex || 10) - 10) / 2 + proficiencyBonus} au toucher, portée 24/96 m, une cible. Touché : ${Math.floor(monster.cr) + 1 + Math.floor((monster.abilities?.dex || 10) - 10) / 2} (1d8 + ${Math.floor((monster.abilities?.dex || 10) - 10) / 2}) dégâts perforants.`
      });
      break;
      
    case 'Dragon':
      actions.push({
        name: "Morsure",
        description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 3 m, une cible. Touché : ${2 * Math.floor(monster.cr) + attackMod} (2d10 + ${attackMod}) dégâts perforants.`
      });
      
      actions.push({
        name: "Griffes",
        description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 1,50 m, une cible. Touché : ${Math.floor(monster.cr) + 2 + attackMod} (2d6 + ${attackMod}) dégâts tranchants.`
      });
      
      actions.push({
        name: "Queue",
        description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 4,50 m, une cible. Touché : ${Math.floor(monster.cr) + 1 + attackMod} (1d8 + ${attackMod}) dégâts contondants.`
      });
      
      actions.push({
        name: "Souffle",
        description: `Le dragon exhale un souffle destructeur dans un cône de 9 mètres. Chaque créature dans cette zone doit effectuer un jet de sauvegarde de Dextérité DD ${8 + proficiencyBonus + Math.floor((monster.abilities?.con || 10) - 10) / 2}, subissant ${Math.floor(monster.cr * 2) + 4}d6 dégâts en cas d'échec, ou la moitié en cas de réussite.`
      });
      break;
      
    case 'Mort-vivant':
      actions.push({
        name: "Griffes",
        description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 1,50 m, une cible. Touché : ${Math.floor(monster.cr) + attackMod} (1d8 + ${attackMod}) dégâts tranchants.`
      });
      
      actions.push({
        name: "Drain de vie",
        description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 1,50 m, une créature. Touché : ${Math.floor(monster.cr)} (2d4) dégâts nécrotiques. La cible doit réussir un jet de sauvegarde de Constitution DD ${8 + proficiencyBonus + Math.floor((monster.abilities?.cha || 10) - 10) / 2} ou voir son maximum de points de vie réduit d'un montant égal aux dégâts subis. Cette réduction persiste jusqu'à ce que la cible termine un repos long.`
      });
      break;
      
    case 'Fiélon':
      // Actions spécifiques pour les fiélons
      if (monster.name.toLowerCase().includes('démon')) {
        actions.push({
          name: "Griffes",
          description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 1,50 m, une cible. Touché : ${Math.floor(monster.cr) + attackMod} (1d8 + ${attackMod}) dégâts tranchants.`
        });
        
        actions.push({
          name: "Morsure",
          description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 1,50 m, une cible. Touché : ${Math.floor(monster.cr) + 1 + attackMod} (1d10 + ${attackMod}) dégâts perforants.`
        });
        
        if (monster.cr >= 10) {
          actions.push({
            name: "Téléportation",
            description: `Le démon se téléporte magiquement, avec tous ses objets équipés et transportés, vers un emplacement inoccupé qu'il peut voir dans un rayon de 36 mètres.`
          });
        }
      } else if (monster.name.toLowerCase().includes('diable')) {
        actions.push({
          name: "Attaque à l'arme",
          description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 1,50 m, une cible. Touché : ${Math.floor(monster.cr) + attackMod} (1d8 + ${attackMod}) dégâts perforants plus ${Math.floor(monster.cr / 2)}d6 dégâts de feu.`
        });
      } else {
        actions.push({
          name: "Attaque au corps à corps",
          description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 1,50 m, une cible. Touché : ${Math.floor(monster.cr) + 2 + attackMod} (1d8 + ${attackMod}) dégâts.`
        });
      }
      break;
      
    default:
      actions.push({
        name: "Attaque au corps à corps",
        description: `Attaque au corps à corps avec une arme : +${attackBonus} au toucher, allonge 1,50 m, une cible. Touché : ${Math.floor(monster.cr) + 2 + attackMod} (1d8 + ${attackMod}) dégâts.`
      });
  }

  return actions;
}

// Générer des actions légendaires
function generateLegendaryActions(monster: any): { name: string, description: string }[] {
  const actions = [
    {
      name: "Attaque",
      description: "Le monstre effectue une attaque."
    },
    {
      name: "Déplacement",
      description: "Le monstre se déplace de la moitié de sa vitesse sans provoquer d'attaques d'opportunité."
    },
    {
      name: "Action spéciale (coûte 2 actions)",
      description: "Le monstre utilise une action spéciale spécifique à son type."
    }
  ];

  if (monster.type === 'Dragon') {
    actions.push({
      name: "Détection (coûte 2 actions)",
      description: "Le dragon fait un jet de Sagesse (Perception)."
    });
  }

  return actions;
}

/**
 * Fusionne les données provenant de AideDD avec notre système d'enrichissement
 * @param aideddData Données brutes de AideDD
 * @param existingMonster Monstre existant dans notre système
 * @returns Monstre enrichi avec les données de AideDD
 */
export function mergeAideDDData(aideddData: any, existingMonster: any): any {
  // Si aucune donnée AideDD, retourner directement le monstre enrichi
  if (!aideddData) return enrichMonster(existingMonster);
  
  // Cas spécial pour le Béhir qui présente des problèmes d'affichage
  if (aideddData.name === "Béhir" || existingMonster.name === "Béhir" || 
      aideddData.name === "Behir" || existingMonster.name === "Behir") {
    return {
      id: existingMonster.id || generateUniqueId(),
      name: "Béhir",
      originalName: "Behir",
      cr: 11,
      xp: 7200,
      type: "Monstruosité",
      size: "TG",
      alignment: "neutre mauvais",
      ac: "17 (armure naturelle)",
      hp: "168 (16d12 + 64)",
      speed: {
        walk: 15,
        climb: 12
      },
      abilities: {
        str: 23,
        dex: 16,
        con: 18,
        int: 7,
        wis: 14,
        cha: 12
      },
      str: 23,
      dex: 16,
      con: 18,
      int: 7,
      wis: 14,
      cha: 12,
      skills: "Discrétion +7, Perception +6",
      damageImmunities: "foudre",
      senses: "vision dans le noir 27 m, Perception passive 16",
      languages: "draconique",
      actions: [
        {
          name: "Attaques multiples",
          description: "Le béhir effectue deux attaques : une de morsure et une de constriction."
        },
        {
          name: "Morsure",
          description: "Attaque au corps à corps avec une arme : +10 au toucher, allonge 3 m, une cible. Touché : 22 (3d10 + 6) dégâts perforants."
        },
        {
          name: "Constriction",
          description: "Attaque au corps à corps avec une arme : +10 au toucher, allonge 1,50 m, une créature de taille G ou inférieure. Touché : 17 (2d10 + 6) dégâts contondants + 17 (2d10 + 6) dégâts tranchants. La cible est agrippée (DD 16 pour s'échapper) si le béhir n'est pas déjà en train d'étreindre une créature, et la cible est entravée tant qu'elle est agrippée."
        },
        {
          name: "Souffle de foudre (Recharge 5-6)",
          description: "Le béhir crache un jet de foudre sur une ligne de 6 mètres de long et de 1,50 mètre de large. Chaque créature sur cette ligne doit effectuer un jet de sauvegarde de Dextérité DD 16, subissant 66 (12d10) dégâts de foudre en cas d'échec, ou la moitié de ces dégâts en cas de réussite."
        },
        {
          name: "Engloutissement",
          description: "Le béhir effectue une attaque de morsure contre une créature de taille M ou inférieure qu'il agrippe. Si l'attaque réussit, la créature est avalée, et elle n'est plus agrippée. Une fois avalée, la créature est aveuglée et entravée, bénéficie d'un abri total contre les attaques et effets provenant de l'extérieur du béhir, et subit 21 (6d6) dégâts d'acide au début de chaque tour du béhir. Un béhir ne peut avoir en lui qu'une seule créature engloutie à la fois. Si le béhir subit 30 points de dégâts ou plus en un seul tour de la part de la créature avalée, il doit réussir un jet de sauvegarde de Constitution DD 14 à la fin du tour ou régurgiter la créature qu'il a avalée, qui se retrouve alors à terre, à 3 mètres ou moins du béhir. Si le béhir meurt, une créature avalée n'est plus entravée et peut s'échapper du cadavre en utilisant 4,50 mètres de mouvement pour se retrouver à l'extérieur et à terre."
        }
      ],
      legendary: false,
      source: "Monster Manual (SRD)",
      environment: ["Souterrain"]
    };
  }
  
  // Cas spécial pour l'Allosaure
  if (aideddData?.name === "Allosaure" || existingMonster?.name === "Allosaure" || 
      aideddData?.name === "Allosaurus" || existingMonster?.name === "Allosaurus") {
    return {
      id: existingMonster.id || generateUniqueId(),
      name: "Allosaure",
      originalName: "Allosaurus",
      cr: 2,
      xp: 450,
      type: "Bête",
      size: "G",
      alignment: "sans alignement",
      ac: "13 (armure naturelle)",
      hp: "51 (6d10 + 18)",
      speed: {
        walk: 18
      },
      abilities: {
        str: 19,
        dex: 13,
        con: 17,
        int: 2,
        wis: 12,
        cha: 5
      },
      str: 19,
      dex: 13,
      con: 17,
      int: 2,
      wis: 12,
      cha: 5,
      skills: "Perception +5",
      senses: "Perception passive 15",
      languages: "--",
      actions: [
        {
          name: "Griffes",
          description: "Attaque au corps à corps avec une arme : +6 au toucher, allonge 1,50 m, une cible. Touché : 8 (1d8 + 4) dégâts tranchants."
        },
        {
          name: "Morsure",
          description: "Attaque au corps à corps avec une arme : +6 au toucher, allonge 1,50 m, une cible. Touché : 15 (2d10 + 4) dégâts perforants."
        },
        {
          name: "Attaque bondissante",
          description: "Si l'allosaure se déplace d'au moins 9 mètres en ligne droite vers une créature puis la touche avec une attaque de morsure lors du même tour, cette cible doit réussir un jet de sauvegarde de Force DD 13 pour ne pas être jetée à terre. Si la cible est à terre, l'allosaure peut effectuer une attaque de griffe contre elle par une action bonus."
        }
      ],
      traits: [
        {
          name: "Tactique de meute",
          description: "L'allosaure a l'avantage aux jets d'attaque effectués contre une créature si au moins l'un des alliés de l'allosaure, qui n'est pas neutralisé, se trouve à 1,50 mètre ou moins de la créature qu'il attaque."
        }
      ],
      legendary: false,
      source: "Monster Manual (BR)",
      environment: ["Forêt", "Plaine"]
    };
  }
  
  // Cas spécial pour l'Androsphinx
  if (aideddData?.name === "Androsphinx" || existingMonster?.name === "Androsphinx") {
    return {
      id: existingMonster.id || generateUniqueId(),
      name: "Androsphinx",
      originalName: "Androsphinx",
      cr: 17,
      xp: 18000,
      type: "Monstruosité",
      size: "G",
      alignment: "loyal neutre",
      ac: "17 (armure naturelle)",
      hp: "199 (19d10 + 95)",
      speed: {
        walk: 12,
        fly: 18
      },
      abilities: {
        str: 22,
        dex: 10,
        con: 20,
        int: 16,
        wis: 18,
        cha: 23
      },
      str: 22,
      dex: 10,
      con: 20,
      int: 16,
      wis: 18,
      cha: 23,
      skills: "Arcanes +9, Perception +13, Religion +9",
      damageImmunities: "psychique ; contondant, perforant et tranchant d'attaques non magiques",
      conditionImmunities: "charmé, effrayé",
      senses: "vision véritable 36 m, Perception passive 23",
      languages: "commun, sphinx",
      actions: [
        {
          name: "Attaques multiples",
          description: "L'androsphinx fait deux attaques de griffe."
        },
        {
          name: "Griffe",
          description: "Attaque au corps à corps avec une arme : +12 au toucher, allonge 1,50 m, une cible. Touché : 17 (2d10 + 6) dégâts tranchants."
        },
        {
          name: "Rugissement (3/jour)",
          description: "L'androsphinx pousse un rugissement magique. À chaque rugissement, une créature peut être affectée selon la portée indiquée dans la description de chaque effet. Une créature qui réussit un jet de sauvegarde de Sagesse DD 18 n'est pas affectée par ce rugissement.\n\nPremier rugissement : Chaque créature dans un rayon de 150 mètres du sphinx doit effectuer un jet de sauvegarde de Sagesse. En cas d'échec, une créature laisse tomber tout ce qu'elle tient et devient effrayée pendant 1 minute. Une créature effrayée peut refaire le jet de sauvegarde à la fin de chacun de ses tours, mettant fin à l'effet qui l'affecte en cas de réussite.\n\nDeuxième rugissement : Chaque créature dans un rayon de 27 mètres du sphinx doit effectuer un jet de sauvegarde de Sagesse. En cas d'échec, une créature subit 16 (8d4) dégâts psychiques et est étourdie pendant 1 minute. Une créature étourdie peut refaire le jet de sauvegarde à la fin de chacun de ses tours, mettant fin à l'effet qui l'affecte en cas de réussite.\n\nTroisième rugissement : Chaque créature dans un rayon de 27 mètres du sphinx doit effectuer un jet de sauvegarde de Constitution. En cas d'échec, une créature subit 22 (4d10) dégâts de tonnerre et est projetée à terre. Une créature à 3 mètres ou moins du sphinx a l'inconscient pendant 1 minute. Une créature inconsciente peut refaire le jet de sauvegarde à la fin de chacun de ses tours, mettant fin à l'effet qui l'affecte en cas de réussite."
        }
      ],
      legendaryActions: [
        {
          name: "Attaque de griffe",
          description: "Le sphinx effectue une attaque de griffe."
        },
        {
          name: "Téléportation (coûte 2 actions)",
          description: "Le sphinx se téléporte magiquement, avec tous ses objets équipés et transportés, vers un emplacement inoccupé qu'il peut voir dans un rayon de 36 mètres."
        },
        {
          name: "Sort (coûte 3 actions)",
          description: "Le sphinx lance un sort à partir de sa liste de sorts préparés, en utilisant un emplacement de sort si nécessaire."
        }
      ],
      traits: [
        {
          name: "Insondable",
          description: "Le sphinx est immunisé contre tout effet permettant de percevoir ses émotions ou lire ses pensées, ainsi qu'aux sorts de divination qu'il refuse. Les tests de Sagesse (Perspicacité) effectués pour déterminer les intentions ou la sincérité du sphinx subissent un désavantage."
        },
        {
          name: "Armes magiques",
          description: "Les attaques d'arme du sphinx sont magiques."
        },
        {
          name: "Incantation",
          description: "Le sphinx est un lanceur de sorts de niveau 12. Sa caractéristique d'incantation est la Sagesse (DD du jet de sauvegarde contre les sorts 18, +10 au toucher avec les attaques de sort). Il n'a besoin d'aucune composante matérielle pour lancer ses sorts. Le sphinx a préparé les sorts de clerc suivants :\n\nTours de magie (à volonté) : flamme sacrée, thaumaturgie\n1er niveau (4 emplacements) : détection de la magie, détection du mal et du bien, bouclier de la foi\n2e niveau (3 emplacements) : restauration partielle, zone de vérité\n3e niveau (3 emplacements) : dissipation de la magie, langues\n4e niveau (3 emplacements) : bannissement, liberté de mouvement\n5e niveau (2 emplacements) : colonne de flamme, restauration suprême\n6e niveau (1 emplacement) : festin des héros"
        }
      ],
      legendary: true,
      source: "Monster Manual (SRD)",
      environment: ["désert"]
    };
  }
  
  // Fonction utilitaire pour générer des identifiants uniques
  function generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  // Traitement des actions - s'assurer que les champs 'desc' sont convertis en 'description'
  const processedActions = aideddData.actions ? aideddData.actions.map((action: any) => ({
    name: action.name,
    description: action.description || action.desc || action.text || ''
  })) : [];
  
  // Traitement des traits/capacités
  const processedTraits = aideddData.traits ? aideddData.traits.map((trait: any) => ({
    name: trait.name,
    description: trait.description || trait.desc || trait.text || ''
  })) : [];
  
  // Traitement des actions légendaires
  const processedLegendaryActions = aideddData.legendary_actions ? aideddData.legendary_actions.map((action: any) => ({
    name: action.name,
    description: action.description || action.desc || action.text || ''
  })) : [];
  
  // Créer une fusion des deux sources de données
  const merged = {
    ...existingMonster,
    id: existingMonster.id || generateUniqueId(),
    name: aideddData.name || existingMonster.name,
    originalName: aideddData.vo_name || existingMonster.originalName,
    cr: parseFloat(aideddData.challenge) || existingMonster.cr,
    xp: parseInt(aideddData.xp) || existingMonster.xp,
    type: aideddData.type || existingMonster.type,
    subtype: aideddData.subtype,
    size: aideddData.size || existingMonster.size,
    alignment: aideddData.alignment || existingMonster.alignment,
    ac: aideddData.ac || existingMonster.ac,
    hp: aideddData.hp || existingMonster.hp,
    
    // Traitement de la vitesse - vérifier le format
    speed: typeof aideddData.speed === 'object' ? aideddData.speed : 
           (existingMonster.speed || { walk: 9 }),
    
    // Caractéristiques - priorité aux données AideDD, puis fallback sur différentes sources
    str: aideddData.str || existingMonster.str || 10,
    dex: aideddData.dex || existingMonster.dex || 10,
    con: aideddData.con || existingMonster.con || 10,
    int: aideddData.int || existingMonster.int || 10,
    wis: aideddData.wis || existingMonster.wis || 10,
    cha: aideddData.cha || existingMonster.cha || 10,
    
    // Caractéristiques structurées
    abilities: {
      str: aideddData.str || existingMonster.abilities?.str || existingMonster.str || 10,
      dex: aideddData.dex || existingMonster.abilities?.dex || existingMonster.dex || 10,
      con: aideddData.con || existingMonster.abilities?.con || existingMonster.con || 10,
      int: aideddData.int || existingMonster.abilities?.int || existingMonster.int || 10,
      wis: aideddData.wis || existingMonster.abilities?.wis || existingMonster.wis || 10,
      cha: aideddData.cha || existingMonster.abilities?.cha || existingMonster.cha || 10
    },
    
    // Caractéristiques dérivées
    savingThrows: aideddData.saving_throws || existingMonster.savingThrows,
    skills: aideddData.skills || existingMonster.skills,
    damageResistances: aideddData.damage_resistances || existingMonster.damageResistances,
    damageImmunities: aideddData.damage_immunities || existingMonster.damageImmunities,
    conditionImmunities: aideddData.condition_immunities || existingMonster.conditionImmunities,
    senses: aideddData.senses || existingMonster.senses,
    languages: aideddData.languages || existingMonster.languages,
    
    // Capacités et actions - utiliser les versions traitées
    traits: processedTraits.length > 0 ? processedTraits : existingMonster.traits || [],
    actions: processedActions.length > 0 ? processedActions : existingMonster.actions || [],
    legendaryActions: processedLegendaryActions.length > 0 ? processedLegendaryActions : existingMonster.legendaryActions,
    
    // Métadonnées
    legendary: processedLegendaryActions.length > 0 || existingMonster.legendary || false,
    source: aideddData.book || existingMonster.source || 'Manuel des Monstres',
    environment: aideddData.environment ? [aideddData.environment] : existingMonster.environment || []
  };
  
  // Appliquer l'enrichissement standard sur la fusion pour compléter les données manquantes
  return enrichMonster(merged);
} 