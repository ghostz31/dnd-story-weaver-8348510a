// Mapping des noms de créatures vers leurs URLs AideDD correctes
// Basé sur les données réelles du bestiaire AideDD

export interface CreatureMapping {
  name: string;
  slug: string;
  url: string;
}

// Mapping manuel pour les cas spéciaux et les créatures les plus communes
const MANUAL_MAPPING: Record<string, string> = {
  // Aigles
  "Aigle": "aigle",
  "Aigle géant": "aigle-geant",
  
  // Gobelins
  "Gobelin": "gobelin",
  "Gobelours": "gobelours",
  "Gobelours chef": "gobelours-chef",
  
  // Dragons
  "Dragon rouge adulte": "dragon-rouge-adulte",
  "Dragon rouge ancien": "dragon-rouge-ancien",
  "Dragon rouge jeune": "dragon-rouge-jeune",
  "Dragon rouge dragonnet": "dragon-rouge-dragonnet",
  "Dragon noir adulte": "dragon-noir-adulte",
  "Dragon noir ancien": "dragon-noir-ancien",
  "Dragon noir jeune": "dragon-noir-jeune",
  "Dragon noir dragonnet": "dragon-noir-dragonnet",
  "Dragon blanc adulte": "dragon-blanc-adulte",
  "Dragon blanc ancien": "dragon-blanc-ancien",
  "Dragon blanc jeune": "dragon-blanc-jeune",
  "Dragon blanc dragonnet": "dragon-blanc-dragonnet",
  "Dragon bleu adulte": "dragon-bleu-adulte",
  "Dragon bleu ancien": "dragon-bleu-ancien",
  "Dragon bleu jeune": "dragon-bleu-jeune",
  "Dragon bleu dragonnet": "dragon-bleu-dragonnet",
  "Dragon vert adulte": "dragon-vert-adulte",
  "Dragon vert ancien": "dragon-vert-ancien",
  "Dragon vert jeune": "dragon-vert-jeune",
  "Dragon vert dragonnet": "dragon-vert-dragonnet",
  "Dragon d'or adulte": "dragon-d-or-adulte",
  "Dragon d'or ancien": "dragon-d-or-ancien",
  "Dragon d'or jeune": "dragon-d-or-jeune",
  "Dragon d'or dragonnet": "dragon-d-or-dragonnet",
  "Dragon d'argent adulte": "dragon-d-argent-adulte",
  "Dragon d'argent ancien": "dragon-d-argent-ancien",
  "Dragon d'argent jeune": "dragon-d-argent-jeune",
  "Dragon d'argent dragonnet": "dragon-d-argent-dragonnet",
  "Dragon de bronze adulte": "dragon-de-bronze-adulte",
  "Dragon de bronze ancien": "dragon-de-bronze-ancien",
  "Dragon de bronze jeune": "dragon-de-bronze-jeune",
  "Dragon de bronze dragonnet": "dragon-de-bronze-dragonnet",
  "Dragon de cuivre adulte": "dragon-de-cuivre-adulte",
  "Dragon de cuivre ancien": "dragon-de-cuivre-ancien",
  "Dragon de cuivre jeune": "dragon-de-cuivre-jeune",
  "Dragon de cuivre dragonnet": "dragon-de-cuivre-dragonnet",
  "Dragon d'airain adulte": "dragon-d-airain-adulte",
  "Dragon d'airain ancien": "dragon-d-airain-ancien",
  "Dragon d'airain jeune": "dragon-d-airain-jeune",
  "Dragon d'airain dragonnet": "dragon-d-airain-dragonnet",
  
  // Géants
  "Géant des collines": "geant-des-collines",
  "Géant des pierres": "geant-des-pierres",
  "Géant du feu": "geant-du-feu",
  "Géant du givre": "geant-du-givre",
  "Géant des nuages": "geant-des-nuages",
  "Géant des tempêtes": "geant-des-tempetes",
  
  // Élémentaires
  "Élémentaire de l'air": "elementaire-de-l-air",
  "Élémentaire de l'eau": "elementaire-de-l-eau",
  "Élémentaire de la terre": "elementaire-de-la-terre",
  "Élémentaire du feu": "elementaire-du-feu",
  
  // Créatures communes
  "Loup": "loup",
  "Ours": "ours-brun",
  "Ours noir": "ours-noir",
  "Ours polaire": "ours-polaire",
  "Sanglier": "sanglier",
  "Cerf": "cerf",
  "Cheval": "cheval-de-selle",
  "Cheval de guerre": "cheval-de-guerre",
  "Cheval de trait": "cheval-de-trait",
  "Chat": "chat",
  "Chien": "chien-de-chasse",
  "Corbeau": "corbeau",
  "Chouette": "chouette",
  "Faucon": "faucon",
  "Rat": "rat",
  "Chauve-souris": "chauve-souris",
  
  // Créatures géantes
  "Araignée géante": "araignee-geante",
  "Araignée-loup géante": "araignee-loup-geante",
  "Belette géante": "belette-geante",
  "Blaireau géant": "blaireau-geant",
  "Chauve-souris géante": "chauve-souris-geante",
  "Chèvre géante": "chevre-geante",
  "Chouette géante": "chouette-geante",
  "Crabe géant": "crabe-geant",
  "Crapaud géant": "crapaud-geant",
  "Crocodile géant": "crocodile-geant",
  "Élan géant": "elan-geant",
  "Grenouille géante": "grenouille-geante",
  "Guêpe géante": "guepe-geante",
  "Hyène géante": "hyene-geante",
  "Scorpion géant": "scorpion-geant",
  "Vautour géant": "vautour-geant",
  
  // Morts-vivants
  "Squelette": "squelette",
  "Zombie": "zombie",
  "Fantôme": "fantome",
  "Spectre": "spectre",
  "Momie": "momie",
  "Vampire": "vampire",
  "Liche": "liche",
  "Banshie": "banshie",
  
  // Fiélons
  "Diablotin": "diablotin",
  "Diable barbu": "diable-barbu",
  "Diable cornu": "diable-cornu",
  "Diable des chaînes": "diable-a-chaines",
  "Balor": "balor",
  "Dretch": "dretch",
  "Quasit": "quasit",
  
  // Créatures spéciales
  "Troll": "troll",
  "Ogre": "ogre",
  "Orc": "orc",
  "Hobgobelin": "hobgobelin",
  "Gnoll": "gnoll",
  "Kobold": "kobold",
  "Basilic": "basilic",
  "Chimère": "chimere",
  "Griffon": "griffon",
  "Hippogriffe": "hippogriffe",
  "Manticore": "manticore",
  "Sphinx": "sphinx",
  "Wiverne": "wiverne"
};

// Fonction pour nettoyer et normaliser un nom de créature
export const normalizeCreatureName = (name: string): string => {
  return name
    .trim()
    // Supprimer la numérotation automatique (ex: "Gobelin 1" -> "Gobelin")
    .replace(/\s+\d+$/, '')
    // Normaliser les espaces multiples
    .replace(/\s+/g, ' ')
    .trim();
};

// Fonction pour convertir un nom en slug AideDD
const nameToSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/['']/g, '') // Enlever les apostrophes
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/[^a-z0-9-]/g, '') // Supprimer les caractères non alphanumériques
    .replace(/-+/g, '-') // Éviter les tirets multiples
    .replace(/^-|-$/g, ''); // Enlever les tirets en début/fin
};

// Fonction principale pour générer l'URL AideDD
export const generateAideDDUrl = (creatureName: string): string => {
  const normalizedName = normalizeCreatureName(creatureName);
  
  // Vérifier d'abord le mapping manuel
  if (MANUAL_MAPPING[normalizedName]) {
    return `https://www.aidedd.org/dnd/monstres.php?vf=${MANUAL_MAPPING[normalizedName]}`;
  }
  
  // Sinon, générer automatiquement le slug
  const slug = nameToSlug(normalizedName);
  return `https://www.aidedd.org/dnd/monstres.php?vf=${slug}`;
};

// Fonction pour obtenir le slug d'une créature (utile pour les tests)
export const getCreatureSlug = (creatureName: string): string => {
  const normalizedName = normalizeCreatureName(creatureName);
  
  if (MANUAL_MAPPING[normalizedName]) {
    return MANUAL_MAPPING[normalizedName];
  }
  
  return nameToSlug(normalizedName);
};

// Liste des créatures testées et validées
export const VALIDATED_CREATURES = [
  "Aigle",
  "Aigle géant", 
  "Gobelin",
  "Gobelours",
  "Dragon rouge adulte",
  "Géant des collines",
  "Élémentaire du feu",
  "Loup",
  "Troll",
  "Squelette",
  "Zombie"
]; 