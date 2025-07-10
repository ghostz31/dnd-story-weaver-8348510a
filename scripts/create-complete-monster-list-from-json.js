/**
 * Ce script extrait tous les monstres du fichier monsters.json d'AideDD
 * et génère un fichier aidedd-monsters-all.json avec tous les monstres.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel dans un contexte de module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins des fichiers
const completeJsonPath = path.join(__dirname, '../public/data/aidedd-complete/monsters.json');
const outputPath = path.join(__dirname, '../public/data/aidedd-monsters-all.json');
const outputIndexPath = path.join(__dirname, '../public/data/aidedd-complete/monsters-index.json');

// Lire le fichier JSON complet
console.log(`Lecture du fichier ${completeJsonPath}...`);
const monstersData = JSON.parse(fs.readFileSync(completeJsonPath, 'utf8'));

console.log(`Nombre total de monstres trouvés: ${Object.keys(monstersData).length}`);

// Transformer les données au format attendu par l'application
const monstersList = [];
const monstersIndex = [];

for (const [monsterSlug, monsterData] of Object.entries(monstersData)) {
  // Transformer les données pour le fichier aidedd-monsters-all.json
  const monster = {
    id: monsterSlug,
    name: monsterData.name,
    originalName: monsterData.originalName || monsterData.name,
    cr: parseFloat(monsterData.cr) || 0,
    xp: monsterData.xp || calculateXPFromCR(parseFloat(monsterData.cr) || 0),
    type: monsterData.type || 'Inconnu',
    subtype: monsterData.subtype || '',
    size: monsterData.size || 'M',
    alignment: monsterData.alignment || 'non-aligné',
    ac: monsterData.ac || '10',
    hp: monsterData.hp || '10 (1d8+2)',
    speed: monsterData.speed || ['marche 9 m'],
    str: monsterData.str || 10,
    dex: monsterData.dex || 10,
    con: monsterData.con || 10,
    int: monsterData.int || 10,
    wis: monsterData.wis || 10,
    cha: monsterData.cha || 10,
    skills: monsterData.skills || '',
    senses: monsterData.senses || '',
    languages: monsterData.languages || '',
    environment: monsterData.environment || [],
    source: monsterData.source || 'Manuel des Monstres',
    legendary: monsterData.legendary || false,
    traits: monsterData.traits || [],
    actions: monsterData.actions || [],
    legendaryActions: monsterData.legendaryActions || [],
    image: monsterData.image || null
  };

  // Ajouter à la liste complète
  monstersList.push(monster);

  // Créer une entrée pour l'index
  monstersIndex.push({
    id: monsterSlug,
    name: monsterData.name,
    originalName: monsterData.originalName || monsterData.name,
    cr: monsterData.cr || '0',
    type: monsterData.type || 'Inconnu',
    size: monsterData.size || 'M',
    image: monsterData.image || null
  });
}

// Trier les listes par nom
monstersList.sort((a, b) => a.name.localeCompare(b.name));
monstersIndex.sort((a, b) => a.name.localeCompare(b.name));

console.log(`Écriture de ${monstersList.length} monstres dans ${outputPath}...`);
fs.writeFileSync(outputPath, JSON.stringify(monstersList, null, 2), 'utf8');

console.log(`Écriture de l'index de ${monstersIndex.length} monstres dans ${outputIndexPath}...`);
fs.writeFileSync(outputIndexPath, JSON.stringify(monstersIndex, null, 2), 'utf8');

console.log('Traitement terminé avec succès!');

// Fonction pour calculer l'XP à partir du CR
function calculateXPFromCR(cr) {
  if (cr <= 0) return 10;
  if (cr <= 0.125) return 25;
  if (cr <= 0.25) return 50;
  if (cr <= 0.5) return 100;
  if (cr <= 1) return 200;
  if (cr <= 2) return 450;
  if (cr <= 3) return 700;
  if (cr <= 4) return 1100;
  if (cr <= 5) return 1800;
  if (cr <= 6) return 2300;
  if (cr <= 7) return 2900;
  if (cr <= 8) return 3900;
  if (cr <= 9) return 5000;
  if (cr <= 10) return 5900;
  if (cr <= 11) return 7200;
  if (cr <= 12) return 8400;
  if (cr <= 13) return 10000;
  if (cr <= 14) return 11500;
  if (cr <= 15) return 13000;
  if (cr <= 16) return 15000;
  if (cr <= 17) return 18000;
  if (cr <= 18) return 20000;
  if (cr <= 19) return 22000;
  if (cr <= 20) return 25000;
  if (cr <= 21) return 33000;
  if (cr <= 22) return 41000;
  if (cr <= 23) return 50000;
  if (cr <= 24) return 62000;
  if (cr <= 25) return 75000;
  if (cr <= 26) return 90000;
  if (cr <= 27) return 105000;
  if (cr <= 28) return 120000;
  if (cr <= 29) return 135000;
  return 155000;
} 