import { getAideDDMonsterSlug } from '../monsterUtils';
import { loadCompleteAideDDMonsters } from './dbInit';
import { createMonsterDataIframe } from '../../createMonsterDataIframe';

// Renommer la fonction existante pour correspondre à l'import dans MonsterBrowser
export const fetchMonsterFromAideDD = async (monsterName: string): Promise<any> => {
  try {
    console.log(`Tentative de récupération des données pour ${monsterName} via fetchMonsterFromAideDD`);

    // Essayer d'abord de récupérer depuis notre JSON local
    try {
      console.log(`Tentative de récupération depuis le JSON local pour ${monsterName}`);
      const response = await fetch('/data/aidedd-monsters-all.json');

      if (!response.ok) {
        throw new Error(`Impossible de charger le fichier JSON local (${response.status})`);
      }

      const monsters = await response.json();

      // Normaliser le nom pour la recherche
      const normalizedName = monsterName.trim().toLowerCase();

      // Rechercher par nom
      const matchedMonster = monsters.find((m: any) =>
        m.name.toLowerCase() === normalizedName ||
        (m.originalName && m.originalName.toLowerCase() === normalizedName)
      );

      if (matchedMonster) {
        console.log(`Monstre trouvé dans le JSON local: ${matchedMonster.name}`);

        // Si le monstre a des données complètes (pas de type "Inconnu"), le retourner directement
        if (matchedMonster.type !== "Inconnu" && matchedMonster.hp !== 10 && matchedMonster.ac !== 10) {
          // Ensure image field is set from imageUrl if not already present
          return {
            ...matchedMonster,
            image: matchedMonster.image || matchedMonster.imageUrl || undefined
          };
        }
      }

      // Si pas de correspondance exacte ou données incomplètes, continuer
    } catch (jsonError) {
      console.error(`Erreur lors de la récupération du JSON local:`, jsonError);
      // Continuer avec la récupération via AideDD
    }

    // Si le JSON local ne fonctionne pas, essayer AideDD
    const aideddData = await getMonsterFromAideDD(monsterName);

    // Si on a réussi, retourner les données
    if (aideddData) {
      console.log(`Données récupérées avec succès depuis AideDD pour ${monsterName}`);
      return aideddData;
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération via AideDD pour ${monsterName}:`, error);

    // En cas d'erreur, essayer de récupérer depuis notre JSON local comme fallback
    try {
      console.log(`Tentative de récupération depuis le JSON local (fallback) pour ${monsterName}`);
      const response = await fetch('/data/aidedd-monsters-all.json');

      if (!response.ok) {
        throw new Error(`Impossible de charger le fichier JSON local (${response.status})`);
      }

      const monsters = await response.json();

      // Normaliser le nom pour la recherche
      const normalizedName = monsterName.trim().toLowerCase();

      // Rechercher par nom
      const matchedMonster = monsters.find((m: any) =>
        m.name.toLowerCase() === normalizedName ||
        (m.originalName && m.originalName.toLowerCase() === normalizedName)
      );

      if (matchedMonster) {
        console.log(`Monstre trouvé dans le JSON local (fallback): ${matchedMonster.name}`);
        return {
          ...matchedMonster,
          image: matchedMonster.image || matchedMonster.imageUrl || undefined
        };
      }

      // Si pas de correspondance exacte, essayer une correspondance partielle
      const partialMatch = monsters.find((m: any) =>
        m.name.toLowerCase().includes(normalizedName) ||
        (m.originalName && m.originalName.toLowerCase().includes(normalizedName))
      );

      if (partialMatch) {
        console.log(`Correspondance partielle trouvée dans le JSON local (fallback): ${partialMatch.name}`);
        return {
          ...partialMatch,
          image: partialMatch.image || partialMatch.imageUrl || undefined
        };
      }

      // Si toujours pas de résultat, générer des données génériques
      console.warn(`Aucune correspondance trouvée dans le JSON local pour ${monsterName}, génération de données génériques`);
    } catch (jsonError) {
      console.error(`Erreur lors de la récupération du JSON local (fallback):`, jsonError);
    }
  }

  // En dernier recours, générer des données génériques
  console.warn(`Génération de données génériques pour ${monsterName}`);
  return {
    name: monsterName,
    cr: 0,
    xp: 10,
    type: "Inconnu",
    size: "M",
    alignment: "neutre",
    ac: 10,
    hp: "10 (1d8 + 2)",
    speed: ["marche 9 m"],
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    actions: [
      {
        name: "Attaque",
        description: `${monsterName} effectue une attaque de base.`
      }
    ]
  };
};

// Fonction pour adapter les données AideDD au format de l'application
export function adaptAideDDData(aideddData: any): any {
  if (!aideddData) return null;

  return {
    id: `aidedd-${aideddData.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: aideddData.name,
    cr: aideddData.cr || "0",
    xp: aideddData.xp || 0,
    type: aideddData.type || "Inconnu",
    size: aideddData.size || "M",
    source: aideddData.source || "AideDD",
    environment: Array.isArray(aideddData.environment) ? aideddData.environment : [],
    legendary: aideddData.legendary || false,
    alignment: aideddData.alignment || "non-aligné",
    ac: aideddData.ac || 10,
    hp: aideddData.hp || 10,
    // Image - check both imageUrl and image fields
    image: aideddData.image || aideddData.imageUrl || undefined,
    // Inclure toutes les autres propriétés disponibles
    abilities: aideddData.abilities,
    actions: aideddData.actions,
    traits: aideddData.traits,
    legendaryActions: aideddData.legendaryActions,
    speed: aideddData.speed,
    skills: aideddData.skills,
    senses: aideddData.senses,
    languages: aideddData.languages,
    damageResistances: aideddData.damageResistances,
    damageImmunities: aideddData.damageImmunities,
    conditionImmunities: aideddData.conditionImmunities
  };
}

// Fonction pour obtenir les données d'un monstre depuis AideDD
export async function getMonsterFromAideDD(monsterName: string, forceRefresh: boolean = false): Promise<any> {
  try {
    console.log(`Recherche des détails pour ${monsterName}${forceRefresh ? ' (rafraîchissement forcé)' : ''}`);
    const normalizedName = getAideDDMonsterSlug(monsterName);

    // 1. D'abord, essayer de récupérer depuis notre base complète (sauf si refresh forcé)
    if (!forceRefresh) {
      try {
        const monsterFromCompleteDB = await getMonsterFromCompleteDB(monsterName);
        console.log(`Monstre ${monsterName} trouvé dans la base de données complète`);
        return monsterFromCompleteDB;
      } catch (error) {
        console.log(`Monstre ${monsterName} non trouvé dans la base complète, tentative avec les autres méthodes...`);
      }
    } else {
      console.log("Chargement forcé depuis AideDD, base de données locale ignorée");
    }

    // 2. Ensuite, essayer de récupérer via iframe
    try {
      console.log(`Tentative via iframe pour ${monsterName}`);
      const monsterData = await fetchMonsterFromAideDD(monsterName);
      console.log(`Données récupérées via iframe pour ${monsterName}`);
      return adaptAideDDData(monsterData);
    } catch (error) {
      console.log(`Échec avec l'iframe, utilisation du fallback:`, error);
    }
    return null;
  } catch (error) {
    console.error(`Erreur getMonsterFromAideDD pour ${monsterName}:`, error);
    return null;
  }
}


// Fonction pour charger le mapping des URLs
async function loadUrlMapping(): Promise<Record<string, string>> {
  try {
    const response = await fetch('/data/aidedd-monster-urls.json');
    if (!response.ok) {
      throw new Error('Impossible de charger le mapping des URLs');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors du chargement du mapping des URLs:', error);
    return {};
  }
}

// Fonction pour parser le HTML de AideDD et extraire les données du monstre
function parseAideDDMonsterHTML(html: string, monsterName: string): any {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Initialisation de l'objet monstre avec des valeurs par défaut
    const monster: any = {
      id: `aidedd-${monsterName.toLowerCase().replace(/\s+/g, '-')}`,
      name: monsterName,
      originalName: monsterName,
      size: "M",
      type: "Inconnu",
      alignment: "neutre",
      ac: 10,
      hp: 10,
      speed: [],
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
      abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      savingThrows: "",
      skills: "",
      senses: "",
      languages: "",
      challengeRating: 0,
      cr: "0",
      xp: 0,
      traits: [],
      actions: [],
      reactions: [],
      legendaryActions: [],
      damageVulnerabilities: "",
      damageResistances: "",
      damageImmunities: "",
      conditionImmunities: "",
      source: "AideDD"
    };

    // 2. Extraction du titre et du sous-titre (Type, Taille, Alignement)
    const h1 = doc.querySelector('h1');
    if (h1) monster.name = h1.textContent?.trim() || monsterName;

    // Traduction/Nom original
    const tradDiv = doc.querySelector('.trad');
    if (tradDiv) {
      const match = tradDiv.textContent?.match(/\[\s*(.*?)\s*\]/);
      if (match) monster.originalName = match[1];
    }

    const typeDiv = doc.querySelector('.type');
    if (typeDiv && typeDiv.textContent) {
      const typeText = typeDiv.textContent.trim();
      // Format: "Humanoïde (aarakocra) de taille M, neutre bon"
      const parts = typeText.split(',');
      if (parts.length >= 2) {
        monster.alignment = parts[parts.length - 1].trim();
        const firstPart = parts.slice(0, parts.length - 1).join(',');

        const sizeMatch = firstPart.match(/de taille\s+(\S+)/i);
        if (sizeMatch) monster.size = sizeMatch[1];

        const typePart = firstPart.replace(/de taille\s+\S+/i, '').trim();
        monster.type = typePart;
      }
    }

    // 3. Extraction du bloc rouge (.red) pour CA, PV, Vitesse, Caracs, Skills, etc.
    const redDiv = doc.querySelector('.red');
    if (redDiv) {
      // Pour CA, PV, Vitesse, on cherche les lignes de texte directes ou balises
      const textContent = redDiv.innerHTML;

      // Regex pour extraire les valeurs clés
      const acMatch = textContent.match(/<strong>Classe d'armure<\/strong>\s*([^<]+)/i);
      if (acMatch) monster.ac = parseInt(acMatch[1]) || acMatch[1].trim(); // keep string if complex

      const hpMatch = textContent.match(/<strong>Points de vie<\/strong>\s*([^<]+)/i);
      if (hpMatch) monster.hp = hpMatch[1].trim();

      const speedMatch = textContent.match(/<strong>Vitesse<\/strong>\s*([^<]+)/i);
      if (speedMatch) {
        monster.speed = speedMatch[1].split(',').map(s => s.trim());
      }

      const savingThrowsMatch = textContent.match(/<strong>Jets de sauvegarde<\/strong>\s*([^<]+)/i);
      if (savingThrowsMatch) monster.savingThrows = savingThrowsMatch[1].trim();

      // Caractéristiques (.carac)
      const caracs = redDiv.querySelectorAll('.carac');
      caracs.forEach(c => {
        const label = c.querySelector('strong')?.textContent?.trim().toLowerCase();
        const valueText = c.childNodes[c.childNodes.length - 1].textContent?.trim() || "10";
        const value = parseInt(valueText.split(' ')[0]);

        if (label && !isNaN(value)) {
          if (label.includes('for')) { monster.str = value; monster.abilities.str = value; }
          if (label.includes('dex')) { monster.dex = value; monster.abilities.dex = value; }
          if (label.includes('con')) { monster.con = value; monster.abilities.con = value; }
          if (label.includes('int')) { monster.int = value; monster.abilities.int = value; }
          if (label.includes('sag')) { monster.wis = value; monster.abilities.wis = value; }
          if (label.includes('cha')) { monster.cha = value; monster.abilities.cha = value; }
        }
      });

      // Autres propriétés (Skills, Senses, etc.) souvent après les caracs
      // On peut utiliser des regex sur tout le contenu du .red car c'est un bloc de texte

      const skillsMatch = textContent.match(/<strong>Compétences<\/strong>\s*([^<]+)/i);
      if (skillsMatch) monster.skills = skillsMatch[1].trim();

      const sensesMatch = textContent.match(/<strong>Sens<\/strong>\s*([^<]+)/i);
      if (sensesMatch) monster.senses = sensesMatch[1].trim();

      const langMatch = textContent.match(/<strong>Langues<\/strong>\s*([^<]+)/i);
      if (langMatch) monster.languages = langMatch[1].trim();

      const crMatch = textContent.match(/<strong>Puissance<\/strong>\s*([^<]+)/i);
      if (crMatch) {
        monster.cr = crMatch[1].split('(')[0].trim();
        const xpMatch = crMatch[1].match(/\((\d+)\s*PX\)/i);
        if (xpMatch) monster.xp = parseInt(xpMatch[1]);
      }

      const vulnMatch = textContent.match(/<strong>Vulnérabilités aux dégâts<\/strong>\s*([^<]+)/i);
      if (vulnMatch) monster.damageVulnerabilities = vulnMatch[1].trim();

      const resMatch = textContent.match(/<strong>Résistances aux dégâts<\/strong>\s*([^<]+)/i);
      if (resMatch) monster.damageResistances = resMatch[1].trim();

      const immMatch = textContent.match(/<strong>Immunités aux dégâts<\/strong>\s*([^<]+)/i);
      if (immMatch) monster.damageImmunities = immMatch[1].trim();

      const condMatch = textContent.match(/<strong>Immunités aux états<\/strong>\s*([^<]+)/i);
      if (condMatch) monster.conditionImmunities = condMatch[1].trim();

      const saveMatch = textContent.match(/<strong>Jets de sauvegarde<\/strong>\s*([^<]+)/i);
      if (saveMatch) monster.savingThrows = saveMatch[1].trim();
    }

    // 4. Extraction des Traits, Actions, Réactions, Légendaires
    // On parcourt les éléments frères dans .sansSerif après le .red
    const container = doc.querySelector('.sansSerif');
    if (container) {
      let currentSection = 'traits'; // 'traits', 'actions', 'reactions', 'legendary'
      const children = Array.from(container.children);

      let passedRed = false;

      children.forEach(child => {
        // Identifier le début de la zone de contenu (après .red)
        if (child.classList.contains('red')) {
          passedRed = true;
          return;
        }
        if (!passedRed) return; // Ignorer ce qui est avant/dans le bloc rouge (déjà traité)

        // Détection des sections
        if (child.classList.contains('rub')) {
          const text = child.textContent?.trim().toLowerCase();
          if (text === 'actions') currentSection = 'actions';
          else if (text === 'réactions' || text === 'reac tions') currentSection = 'reactions'; // AideDD typo handling
          else if (text === 'actions légendaires') currentSection = 'legendary';
          else if (text === 'actions de repaire') currentSection = 'lair'; // Future proof
          return;
        }

        // Traitement des paragraphes <p>
        if (child.tagName === 'P') {
          const strong = child.querySelector('strong');
          let name = '';
          let desc = '';

          if (strong) {
            name = strong.textContent?.trim().replace(/\.$/, '') || ''; // Remove trailing dot
            // La description est tout le texte sauf le titre.
            // Parfois le titre est <strong><em>Nom</em></strong>.
            let htmlContent = child.innerHTML;

            // Nettoyer le nom du début de la chaine HTML
            // Regex simple pour enlever le tag strong du début
            htmlContent = htmlContent.replace(/^<strong[^>]*>.*?<\/strong>\.?\s*/i, '');
            desc = htmlContent.trim();
          } else {
            // Cas où c'est juste du texte (ex: description introductive des actions légendaires)
            // On peut l'ajouter comme une 'note' ou l'ignorer, ou l'ajouter au trait précédent.
            // Pour l'instant on ignore si pas de titre, sauf si c'est pour compléter une description.
            // Simple heuristic: if no strong tag, append to last item of current section
            const targetArray = monster[currentSection === 'legendary' ? 'legendaryActions' : currentSection];
            if (targetArray && targetArray.length > 0) {
              targetArray[targetArray.length - 1].desc += "<br/><br/>" + child.innerHTML;
            }
            return;
          }

          const item = { name, desc };

          if (currentSection === 'traits') monster.traits.push(item);
          else if (currentSection === 'actions') monster.actions.push(item);
          else if (currentSection === 'reactions') monster.reactions.push(item);
          else if (currentSection === 'legendary') monster.legendaryActions.push(item);
        }
      });
    }

    // Normaliser les données finales
    monster.legendary = monster.legendaryActions.length > 0;

    return monster;

  } catch (error) {
    console.error(`Erreur critique parsing HTML pour ${monsterName}:`, error);
    return {
      name: monsterName,
      error: "Parsing failed"
    };
  }
}

// Fonction pour récupérer les détails d'un monstre depuis notre base complète
export async function getMonsterFromCompleteDB(monsterName: string): Promise<any> {
  try {
    // Normaliser le nom pour la recherche
    const normalizedName = monsterName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Charger toutes les données
    const allMonsters = await loadCompleteAideDDMonsters();

    // Rechercher le monstre par son nom
    const monster = allMonsters.find(m => {
      const mName = m.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return mName === normalizedName;
    });

    if (!monster) {
      throw new Error(`Monstre ${monsterName} non trouvé dans la base de données complète`);
    }

    // Adapter les données au format attendu par l'application
    return adaptCompleteMonsterData(monster);
  } catch (error) {
    console.error(`Erreur lors de la récupération des données pour ${monsterName} depuis la base complète:`, error);
    throw error;
  }
}

// Fonction pour adapter les données de monstre de la base complète au format de l'application
function adaptCompleteMonsterData(monsterData: any): any {
  // Si le nom est vide mais que le HTML contient un nom, extraire le nom du HTML
  if (!monsterData.name || monsterData.name === "") {
    try {
      // Tenter d'extraire le nom du titre dans le HTML
      const nameMatch = monsterData.fullHtml.match(/<h1>([^<]+)<\/h1>/);
      if (nameMatch && nameMatch[1]) {
        console.log(`Nom extrait du HTML pour: ${nameMatch[1]}`);
        monsterData.name = nameMatch[1];
      }
    } catch (e) {
      console.error("Erreur lors de l'extraction du nom du HTML:", e);
    }
  }

  // Formatage des vitesses en objet
  const speedObj: { walk?: number; fly?: number; swim?: number; climb?: number } = {};
  if (monsterData.speed) {
    const speedStr = monsterData.speed.toString();
    // Regex pour capturer la valeur et le type
    // Ex: "9 m", "vol 18 m", "nage 12 m"
    const regex = /(?:(vol|nage|escalade|creusement)\s+)?(\d+(?:,\d+)?)\s*m/gi;
    let match;

    // Si pas de type précisé au début, c'est la marche (souvent le premier)
    // On va itérer sur toutes les correspondances
    while ((match = regex.exec(speedStr)) !== null) {
      const type = match[1] ? match[1].toLowerCase() : 'walk';
      const value = parseInt(match[2].replace(',', '.')); // Gérer décimales si besoin, mais souvent entiers

      switch (type) {
        case 'walk': speedObj.walk = value; break;
        case 'vol': speedObj.fly = value; break;
        case 'nage': speedObj.swim = value; break;
        case 'escalade': speedObj.climb = value; break;
        // 'creusement' ignored for now as per type def, or map to closest?
      }
    }

    // Fallback simple si regex fail ou format simple "9 m"
    if (Object.keys(speedObj).length === 0) {
      const simpleMatch = speedStr.match(/(\d+)/);
      if (simpleMatch) speedObj.walk = parseInt(simpleMatch[1]);
    }
  }

  // Fallback parsing from HTML if structured data is missing
  let traits = monsterData.traits || [];
  let actions = monsterData.actions || [];
  let legendaryActions = monsterData.legendaryActions || [];
  let reactions = monsterData.reactions || [];
  let skills = monsterData.skills || "";
  let senses = monsterData.senses || "";
  let languages = monsterData.languages || "";
  let damageResistances = monsterData.damageResistances || "";
  let damageImmunities = monsterData.damageImmunities || "";
  let conditionImmunities = monsterData.conditionImmunities || "";
  let savingThrows = monsterData.savingThrows || "";

  // Fallback parsing from HTML if structured data is missing OR if key stats are missing
  const missingStructuredData = actions.length === 0 || (traits.length === 0 && monsterData.fullHtml && monsterData.fullHtml.length > 500);
  const missingStats = !savingThrows && !senses && !languages;

  if (monsterData.fullHtml && (missingStructuredData || missingStats)) {
    console.log(`[adaptCompleteMonsterData] Données ou stats manquantes pour ${monsterData.name}, tentative de parsing du HTML..., fullHtml length: ${monsterData.fullHtml.length}`);
    const parsed = parseAideDDMonsterHTML(monsterData.fullHtml, monsterData.name);

    console.log(`[adaptCompleteMonsterData] Parsed ${monsterData.name}:`, {
      traits: parsed.traits?.length || 0,
      actions: parsed.actions?.length || 0,
      reactions: parsed.reactions?.length || 0,
      legendaryActions: parsed.legendaryActions?.length || 0
    });

    // Merge/Fill missing data
    if (traits.length === 0) traits = parsed.traits;
    if (actions.length === 0) actions = parsed.actions;
    if (legendaryActions.length === 0) legendaryActions = parsed.legendaryActions;
    if (reactions.length === 0) reactions = parsed.reactions;

    // Fill stats if missing
    if (!skills) skills = parsed.skills;
    if (!senses) senses = parsed.senses;
    if (!languages) languages = parsed.languages;
    if (!damageResistances) damageResistances = parsed.damageResistances;
    if (!damageImmunities) damageImmunities = parsed.damageImmunities;
    if (!conditionImmunities) conditionImmunities = parsed.conditionImmunities;
    if (!savingThrows) savingThrows = parsed.savingThrows;

    // Also try to recover AC/HP/Speed if they are default
    if (monsterData.ac === 10 && parsed.ac !== 10) monsterData.ac = parsed.ac;
    if (monsterData.hp === 10 && parsed.hp !== 10) monsterData.hp = parsed.hp;

    // Fix CR/XP if 0
    if ((monsterData.cr === "0" || monsterData.cr === 0) && parsed.cr !== "0") {
      monsterData.cr = parsed.cr;
      monsterData.challengeRating = parsed.cr; // legacy compat
    }
    if ((monsterData.xp === 0) && parsed.xp !== 0) monsterData.xp = parsed.xp;

    // Speed merging is complex, relying on adaptCompleteMonsterData's own speed parsing which happens earlier
  }

  // Créer un objet au format attendu par l'application
  const result = {
    id: `${monsterData.name.toLowerCase().replace(/\s+/g, '-')}-complete`,
    name: monsterData.name,
    originalName: monsterData.originalName || monsterData.name,
    cr: monsterData.cr || "0",
    xp: monsterData.xp || 0,
    type: monsterData.type || "Inconnu",
    subtype: monsterData.subtype || "",
    size: monsterData.size || "M",
    ac: monsterData.ac || 10,
    hp: monsterData.hp || 10,
    speed: speedObj,
    alignment: monsterData.alignment || "sans alignement",
    legendary: monsterData.isLegendary || false,
    abilities: monsterData.abilities || {
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
    },
    str: monsterData.abilities?.str || 10,
    dex: monsterData.abilities?.dex || 10,
    con: monsterData.abilities?.con || 10,
    int: monsterData.abilities?.int || 10,
    wis: monsterData.abilities?.wis || 10,
    cha: monsterData.abilities?.cha || 10,
    skills: skills,
    senses: senses,
    languages: languages,
    damageResistances: damageResistances,
    damageImmunities: damageImmunities,
    conditionImmunities: conditionImmunities,
    savingThrows: savingThrows,
    traits: traits,
    actions: actions,
    legendaryActions: legendaryActions,
    reactions: reactions,
    source: monsterData.source || "Monster Manual",
    environment: monsterData.environment || [],
    image: monsterData.localImagePath ? `/data/aidedd-complete/${monsterData.localImagePath}` : null
  };

  console.log(`[adaptCompleteMonsterData] Returning ${result.name} with ${result.traits?.length || 0} traits, ${result.actions?.length || 0} actions`);

  return result;
}

// Fonction pour charger les données d'un monstre depuis son fichier individuel
export async function loadMonsterFromIndividualFile(monsterSlug: string): Promise<any> {
  try {
    // Charger le fichier JSON du monstre spécifique
    const response = await fetch(`/data/monsters/${monsterSlug}.json`);
    if (!response.ok) {
      throw new Error(`Impossible de charger les données pour le monstre ${monsterSlug}`);
    }

    const monsterData = await response.json();
    console.log(`Données chargées depuis le fichier individuel pour: ${monsterData.name}`);

    // Adapter les données au format attendu par l'application
    return adaptCompleteMonsterData(monsterData);
  } catch (error) {
    console.error(`Erreur lors du chargement du monstre ${monsterSlug}:`, error);
    throw error;
  }
}
