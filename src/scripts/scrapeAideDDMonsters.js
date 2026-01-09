// Script pour récupérer et stocker les données complètes des monstres depuis AideDD.org
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

// URLs et chemins
const AIDEDD_BASE_URL = 'https://www.aidedd.org';
const AIDEDD_MONSTERS_LIST_URL = 'https://www.aidedd.org/dnd-filters/monstres.php';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data', 'aidedd-complete');
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');
const MONSTERS_DATA_FILE = path.join(OUTPUT_DIR, 'monsters.json');

// Créer les dossiers s'ils n'existent pas
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Fonction principale
async function scrapeAideDDMonsters() {
  console.log('Démarrage de la récupération des données des monstres...');

  // Récupérer la liste des monstres
  const monstersLinks = await fetchMonstersList();
  console.log(`${monstersLinks.length} monstres trouvés sur AideDD.org`);

  // Tableau pour stocker les données complètes
  const monstersData = [];

  // Pour reprendre en cas d'erreur, créer un fichier temporaire après chaque monstre
  const tempDataFile = path.join(OUTPUT_DIR, 'monsters_temp.json');

  // Récupérer les détails de chaque monstre
  for (let i = 0; i < monstersLinks.length; i++) {
    const { name, url } = monstersLinks[i];
    console.log(`Récupération des données pour ${name} (${i + 1}/${monstersLinks.length})`);

    try {
      // Récupérer les détails du monstre
      const monsterData = await fetchMonsterDetails(name, url);

      // Valider les données du monstre
      const validatedData = validateMonsterData(monsterData, name, url);

      monstersData.push(validatedData);

      // Sauvegarder les données actuelles dans un fichier temporaire en cas d'erreur
      if (i % 10 === 0 || i === monstersLinks.length - 1) {
        fs.writeFileSync(tempDataFile, JSON.stringify(monstersData, null, 2));
        console.log(`Sauvegarde temporaire effectuée après ${i + 1} monstres`);
      }

      // Éviter de surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Erreur lors de la récupération des données pour ${name}:`, error);

      // Ajouter une entrée vide pour ce monstre pour garder la trace
      monstersData.push({
        name,
        originalUrl: url,
        error: error.message || "Erreur inconnue",
        recovered: false
      });

      // Sauvegarder les données en cas d'erreur
      fs.writeFileSync(tempDataFile, JSON.stringify(monstersData, null, 2));
    }
  }

  // Nettoyer les données avant de les sauvegarder
  const cleanedData = monstersData.filter(monster => monster.name && monster.name.trim() !== "");

  // Sauvegarder les données dans un fichier JSON
  fs.writeFileSync(MONSTERS_DATA_FILE, JSON.stringify(cleanedData, null, 2));
  console.log(`Données sauvegardées dans ${MONSTERS_DATA_FILE}`);

  // Créer des fichiers annexes
  createNameMappingFile(cleanedData);
  createMonsterNamesFile(cleanedData);

  // Supprimer le fichier temporaire
  if (fs.existsSync(tempDataFile)) {
    fs.unlinkSync(tempDataFile);
    console.log("Fichier temporaire supprimé");
  }

  // Rapport final
  console.log(`Scraping terminé: ${cleanedData.length} monstres récupérés sur ${monstersLinks.length} attendus`);

  // Vérifier les erreurs
  const monstersWithErrors = monstersData.filter(m => m.error);
  if (monstersWithErrors.length > 0) {
    console.log(`${monstersWithErrors.length} monstres n'ont pas pu être récupérés correctement:`);
    monstersWithErrors.forEach(m => console.log(`- ${m.name}: ${m.error}`));
  }
}

// Fonction pour récupérer la liste des monstres
async function fetchMonstersList() {
  try {
    const response = await fetch(AIDEDD_MONSTERS_LIST_URL);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const monstersTable = document.querySelector('table');
    if (!monstersTable) {
      throw new Error('Tableau des monstres non trouvé');
    }

    const monsterRows = monstersTable.querySelectorAll('tr');
    const monstersLinks = [];

    for (let i = 1; i < monsterRows.length; i++) { // Commencer à 1 pour sauter l'en-tête
      const row = monsterRows[i];
      const linkElement = row.querySelector('td a');

      if (linkElement) {
        const name = linkElement.textContent.trim();
        const url = linkElement.getAttribute('href');

        if (name && url) {
          monstersLinks.push({
            name,
            url: url.startsWith('http') ? url : `${AIDEDD_BASE_URL}${url}`
          });
        }
      }
    }

    return monstersLinks;
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des monstres:', error);
    return [];
  }
}

// Fonction pour récupérer les détails d'un monstre
async function fetchMonsterDetails(name, url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extraire les informations de base - amélioration de l'extraction du nom
    let extractedName = '';

    // Méthode 1: Chercher dans l'élément .titre (méthode principale)
    const titleElement = document.querySelector('.titre');
    if (titleElement) {
      extractedName = titleElement.textContent?.trim() || '';
    }

    // Méthode 2: Chercher dans le h1 si la méthode 1 échoue
    if (!extractedName) {
      const h1Element = document.querySelector('h1');
      if (h1Element) {
        extractedName = h1Element.textContent?.trim() || '';
      }
    }

    // Méthode 3: Chercher dans le titre de la page si les deux méthodes précédentes échouent
    if (!extractedName) {
      const titleTag = document.querySelector('title');
      if (titleTag) {
        const titleText = titleTag.textContent || '';
        const titleMatch = titleText.match(/^([^»]+)/);
        if (titleMatch && titleMatch[1]) {
          extractedName = titleMatch[1].trim();
        }
      }
    }

    // Si on n'a toujours pas de nom, utiliser le nom fourni en paramètre
    if (!extractedName) {
      console.warn(`Impossible d'extraire le nom pour ${url}, utilisation du nom fourni: ${name}`);
      extractedName = name;
    }

    console.log(`Nom extrait pour ${url}: "${extractedName}"`);

    // Extraire l'image si disponible
    const imageElement = document.querySelector('.picture img');
    let imageUrl = null;
    let localImagePath = null;

    if (imageElement) {
      const imgSrc = imageElement.getAttribute('src');
      imageUrl = imgSrc.startsWith('http') ? imgSrc : `${AIDEDD_BASE_URL}${imgSrc}`;

      // Télécharger l'image
      localImagePath = await downloadImage(imageUrl, extractedName);
    }

    // Extraire le type, la taille et l'alignement
    const typeElement = document.querySelector('.sousTitreTaille') || document.querySelector('.type');
    const typeText = typeElement?.textContent || '';

    // Extraction des caractéristiques
    let type = '';
    let size = '';
    let alignment = '';

    if (typeText) {
      const typeMatch = typeText.match(/([^,]+) de taille ([^,]+),\s+(.+)/i);
      if (typeMatch) {
        type = typeMatch[1].trim();
        size = typeMatch[2].trim();
        alignment = typeMatch[3].trim();
      } else {
        // Format alternatif possible
        console.log(`Format de type non standard: "${typeText}"`);
        // Essayer d'extraire les informations du texte
        if (typeText.includes('taille')) {
          // Essayer de déduire le type
          const typeParts = typeText.split('taille');
          if (typeParts.length > 0) {
            type = typeParts[0].trim();
          }
        }

        // Déduire la taille
        ['TP', 'P', 'M', 'G', 'TG', 'Gig'].forEach(sizeCode => {
          if (typeText.includes(sizeCode)) {
            size = sizeCode;
          }
        });

        // Déduire l'alignement
        ['loyal', 'neutre', 'chaotique', 'bon', 'mauvais', 'sans alignement'].forEach(alignPart => {
          if (typeText.toLowerCase().includes(alignPart.toLowerCase())) {
            if (alignment) {
              alignment += ' ';
            }
            alignment += alignPart;
          }
        });

        // Si on n'a pas pu extraire certaines informations, utiliser des valeurs par défaut
        if (!type) type = 'Créature';
        if (!size) size = 'M';
        if (!alignment) alignment = 'sans alignement';
      }
    }

    // Extraire CA, PV et vitesse
    const statBlocks = Array.from(document.querySelectorAll('.carac, .red'));
    let ac = '';
    let hp = '';
    let speed = '';

    // Méthode 1: chercher dans les blocs .carac
    statBlocks.forEach(block => {
      const html = block.innerHTML || '';

      if (html.includes('Classe d\'armure')) {
        const acMatch = html.match(/Classe d'armure<\/strong>\s*(\d+)/);
        if (acMatch) {
          ac = acMatch[1].trim();
        }
      }

      if (html.includes('Points de vie')) {
        const hpMatch = html.match(/Points de vie<\/strong>\s*([^<]+)/);
        if (hpMatch) {
          hp = hpMatch[1].trim();
        }
      }

      if (html.includes('Vitesse')) {
        const speedMatch = html.match(/Vitesse<\/strong>\s*([^<]+)/);
        if (speedMatch) {
          speed = speedMatch[1].trim();
        }
      }
    });

    // Méthode 2: recherche directe dans la classe .red si la méthode 1 échoue
    if (!ac || !hp || !speed) {
      const redBlock = document.querySelector('.red');
      if (redBlock) {
        const redHtml = redBlock.innerHTML || '';

        if (!ac) {
          const acMatch = redHtml.match(/Classe d['']armure<\/strong>\s*(\d+)/i) ||
            redHtml.match(/AC<\/strong>\s*(\d+)/i);
          if (acMatch) {
            ac = acMatch[1].trim();
          }
        }

        if (!hp) {
          const hpMatch = redHtml.match(/Points de vie<\/strong>\s*([^<]+)/i) ||
            redHtml.match(/HP<\/strong>\s*([^<]+)/i);
          if (hpMatch) {
            hp = hpMatch[1].trim();
          }
        }

        if (!speed) {
          const speedMatch = redHtml.match(/Vitesse<\/strong>\s*([^<]+)/i) ||
            redHtml.match(/Speed<\/strong>\s*([^<]+)/i);
          if (speedMatch) {
            speed = speedMatch[1].trim();
          }
        }
      }
    }

    // Valeurs par défaut si l'extraction échoue
    if (!ac) ac = '10';
    if (!hp) hp = '10 (1d8+2)';
    if (!speed) speed = 'marche 9 m';

    // Extraire les caractéristiques
    const abilities = {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    };

    // Méthode 1: chercher dans le bloc .carac2
    const abilityBlock = document.querySelector('.carac2');
    if (abilityBlock) {
      const abilityValues = Array.from(abilityBlock.querySelectorAll('.valeur'));
      const abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

      abilityValues.forEach((element, index) => {
        if (index < abilityNames.length) {
          const value = parseInt(element.textContent || '10', 10);
          abilities[abilityNames[index]] = isNaN(value) ? 10 : value;
        }
      });
    } else {
      // Méthode 2: chercher les caractéristiques dans la classe .red
      const redBlock = document.querySelector('.red');
      if (redBlock) {
        const html = redBlock.innerHTML || '';

        const strMatch = html.match(/FOR<\/strong><br>(\d+)/);
        const dexMatch = html.match(/DEX<\/strong><br>(\d+)/);
        const conMatch = html.match(/CON<\/strong><br>(\d+)/);
        const intMatch = html.match(/INT<\/strong><br>(\d+)/);
        const wisMatch = html.match(/SAG<\/strong><br>(\d+)/);
        const chaMatch = html.match(/CHA<\/strong><br>(\d+)/);

        if (strMatch) abilities.str = parseInt(strMatch[1], 10) || 10;
        if (dexMatch) abilities.dex = parseInt(dexMatch[1], 10) || 10;
        if (conMatch) abilities.con = parseInt(conMatch[1], 10) || 10;
        if (intMatch) abilities.int = parseInt(intMatch[1], 10) || 10;
        if (wisMatch) abilities.wis = parseInt(wisMatch[1], 10) || 10;
        if (chaMatch) abilities.cha = parseInt(chaMatch[1], 10) || 10;
      }
    }

    // Extraire les autres sections (compétences, sens, etc.)
    const sections = Array.from(document.querySelectorAll('.bloc'));
    let skills = '';
    let senses = '';
    let languages = '';
    let damageResistances = '';
    let damageImmunities = '';
    let conditionImmunities = '';
    let cr = '';

    sections.forEach(section => {
      const title = section.querySelector('.titreBloc')?.textContent || '';
      const content = section.querySelector('.description')?.textContent || '';

      if (title.includes('Compétences')) {
        skills = content.trim();
      } else if (title.includes('Sens')) {
        senses = content.trim();
      } else if (title.includes('Langues')) {
        languages = content.trim();
      } else if (title.includes('Résistances aux dégâts')) {
        damageResistances = content.trim();
      } else if (title.includes('Immunités aux dégâts')) {
        damageImmunities = content.trim();
      } else if (title.includes('Immunités aux conditions')) {
        conditionImmunities = content.trim();
      } else if (title.includes('Puissance')) {
        cr = content.trim();
      }
    });

    // Extraire FP et XP
    // Format attendu: "Power (XP PX)" ou "1/4 (50 PX)"
    let crMatch = cr.match(/(\d+(?:\/\d+)?)\s+\((\d+)\s*(?:PX|XP)\)/i);
    let crValue = '0';
    let xp = 0;

    if (crMatch) {
      crValue = crMatch[1];
      xp = parseInt(crMatch[2], 10);
    } else {
      // Fallback: essayer de trouver juste le CR
      const simpleCrMatch = cr.match(/^(\d+(?:\/\d+)?)/);
      if (simpleCrMatch) {
        crValue = simpleCrMatch[1];
        // Calculer l'XP à partir du CR si non trouvé explicitement
        const crNum = crValue.includes('/')
          ? parseInt(crValue.split('/')[0]) / parseInt(crValue.split('/')[1])
          : parseFloat(crValue);
        xp = calculateXPFromCR(crNum);
      }
    }

    // Extraire les traits, actions et actions légendaires
    const traits = [];
    const actions = [];
    const legendaryActions = [];

    // Traitement des traits
    const traitsBlock = Array.from(document.querySelectorAll('.bloc')).find(
      block => !block.querySelector('.titreBloc')?.textContent?.includes('Actions')
    );

    if (traitsBlock) {
      const traitElements = Array.from(traitsBlock.querySelectorAll('.description > div'));

      traitElements.forEach(element => {
        const traitText = element.innerHTML;
        const nameMatch = traitText.match(/<strong>([^<]+)<\/strong>/);

        if (nameMatch) {
          const traitName = nameMatch[1].trim();
          let traitDesc = traitText.replace(/<strong>[^<]+<\/strong>/, '').trim();

          traits.push({
            name: traitName,
            description: traitDesc
          });
        }
      });
    }

    // Traitement des actions
    const actionsBlock = Array.from(document.querySelectorAll('.bloc')).find(
      block => block.querySelector('.titreBloc')?.textContent?.includes('Actions')
    );

    if (actionsBlock) {
      const actionElements = Array.from(actionsBlock.querySelectorAll('.description > div'));

      actionElements.forEach(element => {
        const actionText = element.innerHTML;
        const nameMatch = actionText.match(/<strong>([^<]+)<\/strong>/);

        if (nameMatch) {
          const actionName = nameMatch[1].trim();
          let actionDesc = actionText.replace(/<strong>[^<]+<\/strong>/, '').trim();

          actions.push({
            name: actionName,
            description: actionDesc
          });
        }
      });
    }

    // Traitement des actions légendaires
    const legendaryBlock = Array.from(document.querySelectorAll('.bloc')).find(
      block => block.querySelector('.titreBloc')?.textContent?.includes('Actions légendaires')
    );

    if (legendaryBlock) {
      const legendaryElements = Array.from(legendaryBlock.querySelectorAll('.description > div'));

      legendaryElements.forEach(element => {
        const legendaryText = element.innerHTML;
        const nameMatch = legendaryText.match(/<strong>([^<]+)<\/strong>/);

        if (nameMatch) {
          const legendaryName = nameMatch[1].trim();
          let legendaryDesc = legendaryText.replace(/<strong>[^<]+<\/strong>/, '').trim();

          legendaryActions.push({
            name: legendaryName,
            description: legendaryDesc
          });
        }
      });
    }

    // Récupérer le HTML complet pour stockage
    const fullHtml = html;

    // Construire l'objet de données complet
    return {
      name: extractedName,
      originalUrl: url,
      imageUrl,
      localImagePath: localImagePath ? path.relative(OUTPUT_DIR, localImagePath) : null,
      type,
      size,
      alignment,
      ac,
      hp,
      speed,
      abilities,
      skills,
      senses,
      languages,
      damageResistances,
      damageImmunities,
      conditionImmunities,
      cr: crValue,
      xp,
      traits,
      actions,
      legendaryActions: legendaryActions.length > 0 ? legendaryActions : undefined,
      isLegendary: legendaryActions.length > 0,
      fullHtml // Conserver le HTML complet pour référence
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails pour ${name}:`, error);
    return {
      name,
      originalUrl: url,
      error: error.message
    };
  }
}

// Fonction pour télécharger une image
async function downloadImage(imageUrl, monsterName) {
  try {
    console.log(`Téléchargement de l'image pour ${monsterName}: ${imageUrl}`);

    // Vérifier si l'URL est valide
    if (!imageUrl || !imageUrl.startsWith('http')) {
      console.warn(`URL d'image invalide pour ${monsterName}: ${imageUrl}`);
      return null;
    }

    // Ajouter un timeout et des retry
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        // Définir un timeout pour la requête
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes de timeout

        const response = await fetch(imageUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Statut HTTP ${response.status} pour ${imageUrl}`);
        }

        // Vérifier le type de contenu
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          console.warn(`Le contenu reçu n'est pas une image: ${contentType}`);
          throw new Error(`Type de contenu invalide: ${contentType}`);
        }

        const buffer = await response.arrayBuffer();

        // Nettoyer le nom pour l'utiliser comme nom de fichier
        const safeFileName = monsterName.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        if (!safeFileName) {
          console.warn(`Impossible de générer un nom de fichier valide pour ${monsterName}`);
          return null;
        }

        // Déterminer l'extension à partir de l'URL et du type de contenu
        let fileExtension = 'jpg'; // extension par défaut

        if (contentType) {
          if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            fileExtension = 'jpg';
          } else if (contentType.includes('png')) {
            fileExtension = 'png';
          } else if (contentType.includes('gif')) {
            fileExtension = 'gif';
          } else if (contentType.includes('webp')) {
            fileExtension = 'webp';
          }
        } else {
          // Si le type de contenu n'est pas disponible, essayer d'extraire l'extension de l'URL
          const urlExtension = imageUrl.split('.').pop().toLowerCase();
          const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
          if (validExtensions.includes(urlExtension)) {
            fileExtension = urlExtension === 'jpeg' ? 'jpg' : urlExtension;
          }
        }

        const filePath = path.join(IMAGES_DIR, `${safeFileName}.${fileExtension}`);

        // Vérifier si le dossier existe
        if (!fs.existsSync(IMAGES_DIR)) {
          fs.mkdirSync(IMAGES_DIR, { recursive: true });
        }

        // Écrire le fichier
        fs.writeFileSync(filePath, Buffer.from(buffer));
        console.log(`Image sauvegardée: ${filePath}`);

        return filePath;
      } catch (error) {
        lastError = error;
        console.warn(`Tentative ${4 - retries}/3 échouée pour ${imageUrl}: ${error.message}`);
        retries--;

        // Attendre avant de réessayer
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // Si on arrive ici, toutes les tentatives ont échoué
    throw lastError || new Error(`Échec du téléchargement après 3 tentatives`);
  } catch (error) {
    console.error(`Erreur lors du téléchargement de l'image pour ${monsterName}:`, error);
    return null;
  }
}

// Fonction pour valider et nettoyer les données d'un monstre
function validateMonsterData(monsterData, originalName, url) {
  // S'assurer que le monstre a un nom
  if (!monsterData.name || monsterData.name.trim() === "") {
    console.warn(`Monstre sans nom valide pour ${url}, utilisation du nom original: ${originalName}`);
    monsterData.name = originalName;
  }

  // S'assurer que les propriétés essentielles existent
  const requiredProps = ['type', 'size', 'alignment', 'ac', 'hp', 'speed'];
  requiredProps.forEach(prop => {
    if (!monsterData[prop] || monsterData[prop].toString().trim() === "") {
      console.warn(`Propriété '${prop}' manquante pour ${monsterData.name}, utilisation d'une valeur par défaut`);

      // Valeurs par défaut
      switch (prop) {
        case 'type': monsterData[prop] = 'Créature'; break;
        case 'size': monsterData[prop] = 'M'; break;
        case 'alignment': monsterData[prop] = 'sans alignement'; break;
        case 'ac': monsterData[prop] = '10'; break;
        case 'hp': monsterData[prop] = '10 (1d8+2)'; break;
        case 'speed': monsterData[prop] = 'marche 9 m'; break;
      }
    }
  });

  // Extraire et vérifier le CR et l'XP
  if (!monsterData.cr || monsterData.cr.toString().trim() === "") {
    console.warn(`CR manquant pour ${monsterData.name}, utilisation de la valeur par défaut 0`);
    monsterData.cr = "0";
    monsterData.xp = 0;
  }

  // Convertir le CR et XP en valeurs numériques si possible
  if (typeof monsterData.cr === 'string') {
    // Gérer les fractions comme 1/8, 1/4, 1/2
    if (monsterData.cr.includes('/')) {
      const [numerator, denominator] = monsterData.cr.split('/').map(n => parseInt(n, 10));
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        monsterData.xp = calculateXPFromCR(numerator / denominator);
      } else {
        monsterData.xp = 0;
      }
    } else {
      const crNum = parseInt(monsterData.cr, 10);
      if (!isNaN(crNum)) {
        monsterData.xp = calculateXPFromCR(crNum);
      } else {
        monsterData.xp = 0;
      }
    }
  }

  // Normaliser d'autres propriétés
  monsterData.legendary = !!monsterData.legendaryActions && monsterData.legendaryActions.length > 0;

  // Ajouter la propriété originalName si elle n'existe pas déjà
  if (!monsterData.originalName) {
    monsterData.originalName = originalName || monsterData.name;
  }

  return monsterData;
}

// Fonction pour calculer l'XP à partir du CR
function calculateXPFromCR(cr) {
  const xpByCR = {
    0: 0,
    0.125: 25,  // 1/8
    0.25: 50,   // 1/4
    0.5: 100,   // 1/2
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900,
    11: 7200,
    12: 8400,
    13: 10000,
    14: 11500,
    15: 13000,
    16: 15000,
    17: 18000,
    18: 20000,
    19: 22000,
    20: 25000,
    21: 33000,
    22: 41000,
    23: 50000,
    24: 62000,
    25: 75000,
    26: 90000,
    27: 105000,
    28: 120000,
    29: 135000,
    30: 155000
  };

  // Trouver le CR le plus proche
  const crValues = Object.keys(xpByCR).map(Number);
  const nearestCR = crValues.reduce((prev, curr) => {
    return (Math.abs(curr - cr) < Math.abs(prev - cr) ? curr : prev);
  });

  return xpByCR[nearestCR] || 0;
}

// Fonction pour créer un fichier de mapping des noms
function createNameMappingFile(monstersData) {
  const nameMapping = {};

  // Créer un mapping pour les noms courants
  monstersData.forEach(monster => {
    if (monster.name && monster.originalName && monster.name !== monster.originalName) {
      nameMapping[monster.originalName] = monster.name;
    }
  });

  // Ajouter des mappings spécifiques pour les noms problématiques
  const specificMappings = {
    "Élémentaire de feu": "Élémentaire du feu",
    "Élémentaire de terre": "Élémentaire de la terre",
    "Élémentaire d'eau": "Élémentaire de l'eau",
    "Élémentaire d'air": "Élémentaire de l'air",
    "Aigle geant": "Aigle géant",
    "Araignee geante": "Araignée géante",
    "Belette geante": "Belette géante",
    "Blaireau geant": "Blaireau géant",
    "Chauve-souris geante": "Chauve-souris géante",
    "Chevre geante": "Chèvre géante",
    "Chouette geante": "Chouette géante",
    "Crabe geant": "Crabe géant",
    "Crapaud geant": "Crapaud géant",
    "Crocodile geant": "Crocodile géant",
    "Elan geant": "Élan géant",
    "Araignee-loup geante": "Araignée-loup géante",
    "Araignee de phase": "Araignée de phase",
    "Arbuste eveille": "Arbuste éveillé",
    "Arbre eveille": "Arbre éveillé"
  };

  // Fusionner les mappings
  Object.assign(nameMapping, specificMappings);

  // Sauvegarder dans un fichier
  const nameMappingFile = path.join(process.cwd(), 'public', 'data', 'aidedd-monster-name-mapping.json');
  fs.writeFileSync(nameMappingFile, JSON.stringify(nameMapping, null, 2));
  console.log(`Fichier de mapping des noms créé: ${nameMappingFile}`);

  return nameMapping;
}

// Fonction pour créer un fichier de noms de monstres
function createMonsterNamesFile(monstersData) {
  // Extraire les noms et créer des slugs
  const monsterSlugs = monstersData
    .filter(monster => monster.name && monster.name.trim() !== "")
    .map(monster => {
      const slug = monster.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return slug;
    })
    .filter(slug => slug !== "");

  // Sauvegarder dans un fichier
  const namesFile = path.join(process.cwd(), 'public', 'data', 'aidedd-monster-names.txt');
  fs.writeFileSync(namesFile, monsterSlugs.join('\n'));
  console.log(`Fichier de noms de monstres créé: ${namesFile}`);

  return monsterSlugs;
}

// Lancer le script
scrapeAideDDMonsters()
  .then(() => {
    console.log('Récupération des données terminée avec succès!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur lors de la récupération des données:', error);
    process.exit(1);
  }); 