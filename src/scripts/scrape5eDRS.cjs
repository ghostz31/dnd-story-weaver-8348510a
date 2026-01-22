/**
 * Scraper for 5e-drs.fr - French SRD Database
 * Saves to separate files for duplicate comparison before integration
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://5e-drs.fr';
const OUTPUT_DIR = path.join(__dirname, '..', '..', '.tmp', '5e-drs-scrape');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to fetch a page
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// Parse magic items from the 5e-drs list page
async function scrapeMagicItems() {
    console.log('🔮 Scraping Magic Items from 5e-drs.fr...');

    try {
        const html = await fetchPage(`${BASE_URL}/liste-objets-magiques/`);

        // Updated regex for correct URL pattern: /liste-objets-magiques/item-name/
        const itemRegex = /\[([^\]]+)\]\(https:\/\/5e-drs\.fr\/liste-objets-magiques\/([^/]+)\/\)/g;
        const items = [];
        let match;

        while ((match = itemRegex.exec(html)) !== null) {
            const name = match[1].trim();
            if (name && !name.includes('Liste') && !name.includes('Créer') && !name.includes('Mes objets')) {
                items.push({
                    url: `${BASE_URL}/liste-objets-magiques/${match[2]}/`,
                    name: name,
                    slug: match[2],
                    source: '5e-drs'
                });
            }
        }

        console.log(`Found ${items.length} magic items`);

        // Save the list
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'magic-items-5edrs-list.json'),
            JSON.stringify(items, null, 2)
        );

        console.log('✅ Magic items list saved to .tmp/5e-drs-scrape/magic-items-5edrs-list.json');
        return items;

    } catch (error) {
        console.error('Error scraping magic items:', error);
        return [];
    }
}

// Parse spells from the 5e-drs grimoire page
async function scrapeSpells() {
    console.log('📜 Scraping Spells from 5e-drs.fr...');

    try {
        const html = await fetchPage(`${BASE_URL}/grimoire/`);

        // Updated regex for grimoire
        const spellRegex = /\[([^\]]+)\]\(https:\/\/5e-drs\.fr\/grimoire\/([^/]+)\/\)/g;
        const spells = [];
        let match;

        while ((match = spellRegex.exec(html)) !== null) {
            const name = match[1].trim();
            if (name && name.length > 1 && !name.includes('Grimoire') && !name.includes('GitHub')) {
                spells.push({
                    url: `${BASE_URL}/grimoire/${match[2]}/`,
                    name: name,
                    slug: match[2],
                    source: '5e-drs'
                });
            }
        }

        console.log(`Found ${spells.length} spells`);

        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'spells-5edrs-list.json'),
            JSON.stringify(spells, null, 2)
        );

        console.log('✅ Spells list saved to .tmp/5e-drs-scrape/spells-5edrs-list.json');
        return spells;

    } catch (error) {
        console.error('Error scraping spells:', error);
        return [];
    }
}

// Parse monsters from the 5e-drs bestiary
async function scrapeMonsters() {
    console.log('👹 Scraping Monsters from 5e-drs.fr...');

    try {
        const html = await fetchPage(`${BASE_URL}/bestiaire/`);

        // Updated regex for bestiaire
        const monsterRegex = /\[([^\]]+)\]\(https:\/\/5e-drs\.fr\/bestiaire\/([^/]+)\/\)/g;
        const monsters = [];
        let match;

        while ((match = monsterRegex.exec(html)) !== null) {
            const name = match[1].trim();
            // Skip navigation items
            if (name.length > 1 && !name.includes('Bestiaire') && !name.includes('GitHub') && !name.includes('5e DRS')) {
                monsters.push({
                    url: `${BASE_URL}/bestiaire/${match[2]}/`,
                    name: name,
                    slug: match[2],
                    source: '5e-drs'
                });
            }
        }

        console.log(`Found ${monsters.length} monsters`);

        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'monsters-5edrs-list.json'),
            JSON.stringify(monsters, null, 2)
        );

        console.log('✅ Monsters list saved to .tmp/5e-drs-scrape/monsters-5edrs-list.json');
        return monsters;

    } catch (error) {
        console.error('Error scraping monsters:', error);
        return [];
    }
}

// Main execution
async function main() {
    console.log('='.repeat(50));
    console.log('5e-DRS.fr Scraper - Separate Files for Comparison');
    console.log('='.repeat(50));
    console.log(`Output directory: ${OUTPUT_DIR}\n`);

    const magicItems = await scrapeMagicItems();
    console.log('');

    const spells = await scrapeSpells();
    console.log('');

    const monsters = await scrapeMonsters();
    console.log('');

    // Summary
    console.log('='.repeat(50));
    console.log('SCRAPING COMPLETE');
    console.log('='.repeat(50));
    console.log(`Magic Items: ${magicItems.length}`);
    console.log(`Spells: ${spells.length}`);
    console.log(`Monsters: ${monsters.length}`);
    console.log('\nFiles saved to .tmp/5e-drs-scrape/');
    console.log('Run the comparison script next to check for duplicates.');
}

main().catch(console.error);
