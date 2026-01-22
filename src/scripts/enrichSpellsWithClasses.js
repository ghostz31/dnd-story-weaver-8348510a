// Script pour enrichir les sorts existants avec les classes depuis AideDD
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const SPELLS_FILE = path.join(process.cwd(), 'public', 'data', 'spells-complete.json');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data', 'spells-complete-enriched.json');

async function enrichSpellsWithClasses() {
    console.log('Chargement des sorts existants...');
    const spells = JSON.parse(fs.readFileSync(SPELLS_FILE, 'utf-8'));
    console.log(`${spells.length} sorts chargés`);

    const enrichedSpells = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < spells.length; i++) {
        const spell = spells[i];
        console.log(`[${i + 1}/${spells.length}] ${spell.name}...`);

        try {
            if (spell.url) {
                const classes = await fetchClassesFromUrl(spell.url);
                spell.classes = classes;
                if (classes.length > 0) {
                    console.log(`  ✓ Classes: ${classes.join(', ')}`);
                    successCount++;
                } else {
                    console.log(`  ⚠ Aucune classe trouvée`);
                }
            } else {
                console.log(`  ⚠ Pas d'URL`);
            }
        } catch (error) {
            console.error(`  ✗ Erreur: ${error.message}`);
            errorCount++;
        }

        enrichedSpells.push(spell);

        // Sauvegarde intermédiaire tous les 50 sorts
        if ((i + 1) % 50 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enrichedSpells, null, 2));
            console.log(`\n📁 Sauvegarde intermédiaire: ${i + 1} sorts\n`);
        }

        // Pause pour ne pas surcharger le serveur
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Sauvegarde finale
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enrichedSpells, null, 2));
    console.log(`\n✅ Terminé !`);
    console.log(`   ${successCount} sorts enrichis avec classes`);
    console.log(`   ${errorCount} erreurs`);
    console.log(`   Fichier sauvegardé: ${OUTPUT_FILE}`);
}

async function fetchClassesFromUrl(url) {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const classes = [];

    // Sélecteur pour les classes (éléments avec class="classe")
    const classDivs = document.querySelectorAll('.classe');
    classDivs.forEach(div => {
        const className = div.textContent.trim();
        if (className) {
            classes.push(className);
        }
    });

    // Aussi vérifier .tcoe pour les classes de Tasha's Cauldron
    const tcoeDivs = document.querySelectorAll('.tcoe');
    tcoeDivs.forEach(div => {
        const className = div.textContent.trim();
        if (className && !classes.includes(className)) {
            classes.push(className);
        }
    });

    return classes;
}

// Exécution
enrichSpellsWithClasses();
