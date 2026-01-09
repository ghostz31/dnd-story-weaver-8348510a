// Script pour récupérer et stocker les données complètes des objets magiques depuis AideDD.org
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

// Nécessaire pour __dirname dans les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URLs et chemins
const AIDEDD_BASE_URL = 'https://www.aidedd.org';
const AIDEDD_ITEMS_LIST_URL = 'https://www.aidedd.org/dnd-filters/objets-magiques.php';
// Chemin corrigé pour pointer vers la racine du projet puis public/data
const OUTPUT_DIR = path.join(path.resolve(__dirname, '../..'), 'public', 'data', 'aidedd-complete');
const ITEMS_DATA_FILE = path.join(OUTPUT_DIR, 'magic-items.json');

// Créer les dossiers s'ils n'existent pas
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Fonction principale
async function scrapeAideDDMagicItems() {
    console.log('Démarrage de la récupération des objets magiques...');

    // Récupérer la liste des objets
    const itemsLinks = await fetchItemsList();
    console.log(`${itemsLinks.length} objets trouvés sur AideDD.org`);

    // Tableau pour stocker les données complètes
    const itemsData = [];
    const tempDataFile = path.join(OUTPUT_DIR, 'magic_items_temp.json');

    // Récupérer les détails de chaque objet
    for (let i = 0; i < itemsLinks.length; i++) {
        const { name, url } = itemsLinks[i];
        console.log(`Récupération des données pour ${name} (${i + 1}/${itemsLinks.length})`);

        try {
            const itemData = await fetchItemDetails(name, url);

            if (itemData) {
                itemsData.push(itemData);
            }

            // Sauvegarde temporaire
            if (i % 20 === 0 || i === itemsLinks.length - 1) {
                fs.writeFileSync(tempDataFile, JSON.stringify(itemsData, null, 2));
                console.log(`Sauvegarde temporaire effectuée après ${i + 1} objets`);
            }

            // Éviter de surcharger le serveur
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            console.error(`Erreur pour ${name}:`, error.message);
        }
    }

    // Nettoyage et sauvegarde finale
    const cleanedData = itemsData.filter(item => item && item.name);
    fs.writeFileSync(ITEMS_DATA_FILE, JSON.stringify(cleanedData, null, 2));
    console.log(`Données sauvegardées dans ${ITEMS_DATA_FILE}`);

    if (fs.existsSync(tempDataFile)) {
        fs.unlinkSync(tempDataFile);
    }

    console.log(`Scraping terminé: ${cleanedData.length} objets récupérés.`);
}

// Fonction pour récupérer la liste des objets
async function fetchItemsList() {
    try {
        const response = await fetch(AIDEDD_ITEMS_LIST_URL);
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const table = document.querySelector('table');
        if (!table) throw new Error('Tableau non trouvé');

        const rows = table.querySelectorAll('tr');
        const links = [];

        // Ignorer l'en-tête (i=1)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const linkElement = row.querySelector('td a');

            if (linkElement) {
                const name = linkElement.textContent.trim();
                const href = linkElement.getAttribute('href');

                if (name && href) {
                    links.push({
                        name,
                        url: href.startsWith('http') ? href : `${AIDEDD_BASE_URL}${href}`
                    });
                }
            }
        }

        return links;
    } catch (error) {
        console.error('Erreur liste des objets:', error);
        return [];
    }
}

// Fonction pour récupérer les détails
async function fetchItemDetails(name, url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Nom (H1)
        const h1 = document.querySelector('h1');
        const extractedName = h1 ? h1.textContent.trim() : name;

        // Type, Rareté, Harmonisation (.type)
        const typeElement = document.querySelector('.type');
        const typeText = typeElement ? typeElement.textContent.trim() : '';

        // Parsing du typeText
        // Exemples: 
        // "Objet merveilleux, peu commun"
        // "Arme (épée longue), rare (nécessite l'harmonisation)"
        // "Bâton, très rare (nécessite l'harmonisation par un druide)"

        let type = 'Objet merveilleux';
        let rarity = 'Commun';
        let attunement = false;
        let attunementDetails = '';

        if (typeText) {
            const parts = typeText.split(',');
            if (parts.length >= 1) {
                type = parts[0].trim();
            }
            if (parts.length >= 2) {
                let rarityPart = parts[1].trim();

                // Vérifier l'harmonisation
                const normalizedTypeText = typeText.toLowerCase();
                if (normalizedTypeText.includes('nécessite l\'harmonisation') || normalizedTypeText.includes('nécessite un lien')) {
                    attunement = true;
                    // Extraire les détails d'harmonisation si présents
                    const attunementMatch = typeText.match(/\((.*?)\)/);
                    if (attunementMatch && attunementMatch[1] && (attunementMatch[1].includes('lien') || attunementMatch[1].includes('harmonisation'))) {
                        attunementDetails = attunementMatch[1];
                    }
                }

                // Nettoyer la rareté (enlever la parenthèse d'harmonisation si elle est collée)
                rarity = rarityPart.split('(')[0].trim();
            }
        }

        // Description (.description)
        const descriptionDiv = document.querySelector('.description');
        let description = '';
        if (descriptionDiv) {
            // Nettoyage de la description (suppression des balises HTML)
            let rawHtml = descriptionDiv.innerHTML;
            // Remplacer les <br> par des sauts de ligne pour la lisibilité textuelle
            rawHtml = rawHtml.replace(/<br\s*\/?>/gi, '\n');
            // Supprimer toutes les autres balises HTML et décoder les entités
            description = rawHtml.replace(/<[^>]*>/g, '').trim();
            // Décodage basique des entités communes si nécessaire (JSDOM ne le fait pas sur innerHTML modifié)
            description = description.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        }

        // Source (.source)
        const sourceDiv = document.querySelector('.source');
        let source = 'DMG'; // Valeur par défaut
        if (sourceDiv) {
            source = sourceDiv.textContent.trim();
        }

        // Image (si dispo)
        const imgElement = document.querySelector('.picture img');
        let imageUrl = null;
        if (imgElement) {
            const src = imgElement.getAttribute('src');
            imageUrl = src.startsWith('http') ? src : `${AIDEDD_BASE_URL}${src}`;
        }

        return {
            id: url, // Utiliser l'URL comme ID unique temporaire
            name: extractedName,
            type,
            rarity,
            attunement,
            attunementDetails: attunementDetails || undefined,
            description, // Garder le HTML pour le rendu riche
            source,
            url,
            imageUrl,
            htmlFull: html // Stockage complet au cas où
        };

    } catch (error) {
        console.error(`Erreur détails ${name}:`, error);
        return null;
    }
}

scrapeAideDDMagicItems();
