/**
 * Script pour séparer les monstres en fichiers individuels
 * 
 * Ce script prend les données du fichier monsters.json et crée un fichier JSON
 * individuel pour chaque monstre contenant toutes ses informations.
 */

import fs from 'fs';
import path from 'path';

// Chemins des fichiers et dossiers
const MONSTERS_DATA_FILE = path.join(process.cwd(), 'public', 'data', 'aidedd-complete', 'monsters.json');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data', 'monsters');
const INDEX_FILE = path.join(OUTPUT_DIR, 'index.json');

// S'assurer que le dossier de sortie existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Fonction principale
async function separateMonsters() {
  console.log('Début de la séparation des monstres en fichiers individuels...');
  
  try {
    // Lire le fichier JSON des monstres
    const monstersData = JSON.parse(fs.readFileSync(MONSTERS_DATA_FILE, 'utf8'));
    console.log(`Lecture de ${monstersData.length} monstres depuis le fichier source`);
    
    // Index des monstres pour faciliter la recherche
    const monstersIndex = [];
    
    // Traiter chaque monstre
    for (let i = 0; i < monstersData.length; i++) {
      const monster = monstersData[i];
      
      // Créer un slug pour le nom du fichier
      const slug = createSlug(monster.name);
      
      // Créer un fichier pour ce monstre
      const monsterFilePath = path.join(OUTPUT_DIR, `${slug}.json`);
      
      // Ajouter ce monstre à l'index
      monstersIndex.push({
        id: slug,
        name: monster.name,
        originalName: monster.originalName || monster.name,
        cr: monster.cr || "0",
        type: monster.type || "Inconnu",
        size: monster.size || "M",
        image: monster.localImagePath ? `/data/aidedd-complete/${monster.localImagePath}` : null
      });
      
      // Écrire le fichier individuel du monstre
      fs.writeFileSync(monsterFilePath, JSON.stringify(monster, null, 2));
      
      // Afficher la progression
      if ((i + 1) % 50 === 0 || i === monstersData.length - 1) {
        console.log(`Progression: ${i + 1}/${monstersData.length} monstres traités`);
      }
    }
    
    // Écrire le fichier d'index
    fs.writeFileSync(INDEX_FILE, JSON.stringify(monstersIndex, null, 2));
    console.log(`Fichier d'index créé: ${INDEX_FILE}`);
    
    console.log('Séparation des monstres terminée avec succès!');
    console.log(`${monstersIndex.length} fichiers individuels de monstres ont été créés dans ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error('Erreur lors de la séparation des monstres:', error);
  }
}

// Fonction pour créer un slug à partir d'un nom
function createSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplacer les caractères non alphanumériques par des tirets
    .replace(/^-+|-+$/g, '')         // Supprimer les tirets au début et à la fin
    .trim();
}

// Exécuter la fonction principale
separateMonsters(); 