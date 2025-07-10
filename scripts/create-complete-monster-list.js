import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel dans un contexte de module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire les fichiers existants
const existingMonstersPath = path.join(__dirname, '../public/data/aidedd-monsters-complete.json');
const monsterNamesPath = path.join(__dirname, '../public/data/aidedd-monster-names.txt');

// Charger les données existantes
const existingMonsters = JSON.parse(fs.readFileSync(existingMonstersPath, 'utf8'));
const monsterNames = fs.readFileSync(monsterNamesPath, 'utf8')
  .split('\n')
  .filter(name => name.trim() !== '');

console.log(`Monstres existants: ${existingMonsters.length}`);
console.log(`Noms de monstres trouvés sur AideDD: ${monsterNames.length}`);

// Fonction pour normaliser les noms en slugs
const normalizeToSlug = (name) => {
  return name.toLowerCase()
    .normalize('NFD') // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/ /g, '-') // Remplacer les espaces par des tirets
    .replace(/[^a-z0-9-]/g, ''); // Supprimer les caractères non alphanumériques
};

// Fonction pour améliorer le formatage des noms
const improveFormatting = (slugName) => {
  // Convertir le slug en nom plus lisible avec la bonne casse et les accents
  const words = slugName.split('-');
  
  // Règles spécifiques pour les noms
  return words.map(word => {
    // Correction des accents spécifiques
    if (word === 'geant' || word === 'geante') return 'géant';
    if (word === 'elementaire') return 'élémentaire';
    if (word === 'epee') return 'épée';
    if (word === 'epouvantail') return 'épouvantail';
    if (word === 'ettin') return 'éttin';
    if (word === 'fee' || word === 'feerique') return word.replace('ee', 'ée');
    if (word === 'teleportation') return 'téléportation';
    if (word === 'lepreux') return 'lépreux';
    if (word === 'mediateur') return 'médiateur';
    if (word === 'elfe') return 'elfe';
    if (word === 'elephant') return 'éléphant';
    if (word === 'eveille') return 'éveillé';
    
    // Majuscule pour la première lettre de chaque mot
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

// Créer un dictionnaire des monstres existants pour une recherche rapide
const existingMonsterDict = {};
existingMonsters.forEach(monster => {
  // Normaliser le nom pour la comparaison
  const normalizedName = normalizeToSlug(monster.name);
  existingMonsterDict[normalizedName] = monster;
});

// Créer la liste complète des monstres
const completeMonsterList = [];

// Pour chaque nom de monstre trouvé sur AideDD
monsterNames.forEach(monsterNameSlug => {
  // Convertir le slug en nom plus lisible avec la bonne casse et les accents
  const readableName = improveFormatting(monsterNameSlug);
  
  // Vérifier si le monstre existe déjà dans notre liste
  const normalizedSlug = normalizeToSlug(readableName);
  if (existingMonsterDict[normalizedSlug]) {
    // Si oui, l'ajouter tel quel
    completeMonsterList.push(existingMonsterDict[normalizedSlug]);
  } else {
    // Sinon, créer une entrée de base
    completeMonsterList.push({
      name: readableName,
      originalName: readableName, // Nom anglais (à remplir manuellement plus tard)
      cr: 0, // Challenge Rating par défaut
      xp: 0, // XP par défaut
      type: "Inconnu", // Type par défaut
      size: "M", // Taille par défaut (Medium)
      ac: 10, // Classe d'armure par défaut
      hp: 10, // Points de vie par défaut
      speed: [], // Vitesses spéciales
      alignment: "inconnu", // Alignement par défaut
      legendary: false, // Créature légendaire par défaut
      source: "Monster Manual", // Source par défaut
      environment: [] // Environnements par défaut
    });
  }
});

// Trier les monstres par nom
completeMonsterList.sort((a, b) => a.name.localeCompare(b.name));

console.log(`Nombre total de monstres dans la liste complète: ${completeMonsterList.length}`);

// Enregistrer la liste complète dans un nouveau fichier
const outputPath = path.join(__dirname, '../public/data/aidedd-monsters-all.json');
fs.writeFileSync(outputPath, JSON.stringify(completeMonsterList, null, 2), 'utf8');

console.log(`Liste complète enregistrée dans ${outputPath}`);

// Créer une table de correspondance entre les noms et les URLs
const monsterNameMapping = {};

// Correspondances exactes connues
monsterNameMapping["Élémentaire de feu"] = "Élémentaire du feu";
monsterNameMapping["Élémentaire de terre"] = "Élémentaire de la terre";
monsterNameMapping["Élémentaire d'eau"] = "Élémentaire de l'eau";
monsterNameMapping["Élémentaire d'air"] = "Élémentaire de l'air";
monsterNameMapping["Aigle geant"] = "Aigle géant";
monsterNameMapping["Araignee geante"] = "Araignée géante";
monsterNameMapping["Belette geante"] = "Belette géante";
monsterNameMapping["Blaireau geant"] = "Blaireau géant";
monsterNameMapping["Chauve-souris geante"] = "Chauve-souris géante";
monsterNameMapping["Chevre geante"] = "Chèvre géante";
monsterNameMapping["Chouette geante"] = "Chouette géante";
monsterNameMapping["Crabe geant"] = "Crabe géant";
monsterNameMapping["Crapaud geant"] = "Crapaud géant";
monsterNameMapping["Crocodile geant"] = "Crocodile géant";
monsterNameMapping["Elan geant"] = "Élan géant";
monsterNameMapping["Araignee-loup geante"] = "Araignée-loup géante";
monsterNameMapping["Araignee de phase"] = "Araignée de phase";
monsterNameMapping["Arbuste eveille"] = "Arbuste éveillé";
monsterNameMapping["Arbre eveille"] = "Arbre éveillé";

// Enregistrer le dictionnaire de correspondance
const mappingPath = path.join(__dirname, '../public/data/aidedd-monster-name-mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(monsterNameMapping, null, 2), 'utf8');

console.log(`Dictionnaire de correspondance enregistré dans ${mappingPath}`); 