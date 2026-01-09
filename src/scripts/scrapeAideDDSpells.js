// Script pour récupérer et stocker les données complètes des sorts depuis AideDD.org
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

// URLs et chemins
const AIDEDD_BASE_URL = 'https://www.aidedd.org';
const AIDEDD_SPELLS_LIST_URL = 'https://www.aidedd.org/dnd-filters/sorts.php';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data', 'aidedd-complete'); // Même dossier que les monstres
const SPELLS_DATA_FILE = path.join(OUTPUT_DIR, 'spells.json');

// Créer les dossiers s'ils n'existent pas
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Map des écoles de magie (anglais/français)
const SCHOOL_MAP = {
    'Abjuration': 'abjuration',
    'Invocation': 'conjuration',
    'Divination': 'divination',
    'Enchantement': 'enchantment',
    'Évocation': 'evocation',
    'Illusion': 'illusion',
    'Nécromancie': 'necromancy',
    'Transmutation': 'transmutation'
};

// Fonction principale
async function scrapeAideDDSpells() {
    console.log('Démarrage de la récupération des sorts...');

    // Récupérer la liste des sorts
    const spellsLinks = await fetchSpellsList();
    console.log(`${spellsLinks.length} sorts trouvés sur AideDD.org`);

    // Tableau pour stocker les données complètes
    const spellsData = [];

    // Pour reprendre en cas d'erreur
    const tempDataFile = path.join(OUTPUT_DIR, 'spells_temp.json');

    // Récupérer les détails de chaque sort
    for (let i = 0; i < spellsLinks.length; i++) {
        const { name, url } = spellsLinks[i];
        console.log(`Récupération des données pour ${name} (${i + 1}/${spellsLinks.length})`);

        try {
            // Récupérer les détails du sort
            const spellData = await fetchSpellDetails(name, url);

            if (spellData) {
                spellsData.push(spellData);
            }

            // Sauvegarder temporairement
            if (i % 20 === 0 || i === spellsLinks.length - 1) {
                fs.writeFileSync(tempDataFile, JSON.stringify(spellsData, null, 2));
                console.log(`Sauvegarde temporaire effectuée après ${i + 1} sorts`);
            }

            // Pause respectueuse
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`Erreur pour ${name}:`, error);
        }
    }

    // Nettoyer et sauvegarder
    fs.writeFileSync(SPELLS_DATA_FILE, JSON.stringify(spellsData, null, 2));
    console.log(`Données sauvegardées dans ${SPELLS_DATA_FILE}`);

    if (fs.existsSync(tempDataFile)) {
        fs.unlinkSync(tempDataFile);
    }

    console.log(`Scraping terminé: ${spellsData.length} sorts récupérés.`);
}

async function fetchSpellsList() {
    try {
        const response = await fetch(AIDEDD_SPELLS_LIST_URL);
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const table = document.querySelector('table');
        if (!table) throw new Error('Tableau des sorts non trouvé');

        const links = [];
        const rows = table.querySelectorAll('tr');

        for (let i = 1; i < rows.length; i++) {
            const linkElement = rows[i].querySelector('td a');
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
        console.error('Erreur liste sorts:', error);
        return [];
    }
}

async function fetchSpellDetails(name, url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // 1. Nom
        let extractedName = name;
        const h1 = document.querySelector('h1');
        if (h1) extractedName = h1.textContent.trim();

        // 2. Niveau et École
        const typeElement = document.querySelector('.ecole');
        const typeText = typeElement ? typeElement.textContent : '';
        // Format attendu: "niveau 4 - abjuration" ou "niveau 0 - enchantement"

        let level = 0;
        let school = '';
        let ritual = false;

        const levelMatch = typeText.match(/niveau (\d+)/i);
        if (levelMatch) {
            level = parseInt(levelMatch[1]);
        }

        if (typeText.includes('(rituel)') || typeText.toLowerCase().includes('rituel')) ritual = true;

        // Détection de l'école
        for (const [fr, en] of Object.entries(SCHOOL_MAP)) {
            if (typeText.toLowerCase().includes(fr.toLowerCase())) {
                school = en;
                break;
            }
        }

        // 3. Propriétés (Temps, Portée, Composantes, Durée)
        let castingTime = '';
        let range = '';
        let components = '';
        let duration = '';
        let classes = [];

        const tDiv = document.querySelector('.t');
        if (tDiv) castingTime = tDiv.textContent.replace("Temps d'incantation :", "").trim();

        const rDiv = document.querySelector('.r');
        if (rDiv) range = rDiv.textContent.replace("Portée :", "").trim();

        const cDiv = document.querySelector('.c');
        if (cDiv) components = cDiv.textContent.replace("Composantes :", "").trim();

        const dDiv = document.querySelector('.d');
        if (dDiv) duration = dDiv.textContent.replace("Durée :", "").trim();

        // Extraction des classes
        const classDivs = document.querySelectorAll('.classe');
        classDivs.forEach(div => {
            classes.push(div.textContent.trim());
        });

        // 4. Description
        const descriptionBlock = document.querySelector('.description');
        let description = '';
        if (descriptionBlock) {
            // On prend le HTML pour garder le formatage (li, p, strong) mais on nettoie un peu
            description = descriptionBlock.innerHTML.trim();
        }

        return {
            name: extractedName,
            url,
            level,
            school,
            ritual,
            castingTime,
            range,
            components,
            duration,
            classes,
            description,
            source: 'AideDD'
        };

    } catch (error) {
        console.error(`Erreur détail ${name}:`, error);
        return null;
    }
}

// Exécution
scrapeAideDDSpells();
