/**
 * Compare scraped 5e-drs.fr data with existing AideDD data
 * Identifies duplicates before integration
 */

const fs = require('fs');
const path = require('path');

const SCRAPE_DIR = path.join(__dirname, '..', '..', '.tmp', '5e-drs-scrape');
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');

// Normalize name for comparison (lowercase, remove accents, trim)
function normalizeName(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // Remove accents
        .replace(/[^a-z0-9]/g, '')        // Remove special chars
        .trim();
}

// Load JSON file safely
function loadJSON(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    } catch (e) {
        console.error(`Error loading ${filePath}:`, e.message);
    }
    return [];
}

// Compare two datasets
function compareSets(newData, existingData, labelNew, labelExisting) {
    const existingNames = new Set(existingData.map(item => normalizeName(item.name)));

    const duplicates = [];
    const unique = [];

    for (const item of newData) {
        const normalized = normalizeName(item.name);
        if (existingNames.has(normalized)) {
            duplicates.push(item);
        } else {
            unique.push(item);
        }
    }

    return { duplicates, unique };
}

async function main() {
    console.log('='.repeat(60));
    console.log('DUPLICATE COMPARISON: 5e-DRS vs AideDD');
    console.log('='.repeat(60));
    console.log('');

    // Load existing data
    const existingMonsters = loadJSON(path.join(PUBLIC_DIR, 'monsters.json'));
    const existingSpells = loadJSON(path.join(PUBLIC_DIR, 'spells.json'));
    const existingItems = loadJSON(path.join(PUBLIC_DIR, 'magic-items.json'));

    console.log('📊 Existing Data (AideDD):');
    console.log(`   Monsters: ${existingMonsters.length}`);
    console.log(`   Spells: ${existingSpells.length}`);
    console.log(`   Magic Items: ${existingItems.length}`);
    console.log('');

    // Load scraped data
    const scrapedMonsters = loadJSON(path.join(SCRAPE_DIR, 'monsters-5edrs-list.json'));
    const scrapedSpells = loadJSON(path.join(SCRAPE_DIR, 'spells-5edrs-list.json'));
    const scrapedItems = loadJSON(path.join(SCRAPE_DIR, 'magic-items-5edrs-list.json'));

    console.log('📊 Scraped Data (5e-DRS):');
    console.log(`   Monsters: ${scrapedMonsters.length}`);
    console.log(`   Spells: ${scrapedSpells.length}`);
    console.log(`   Magic Items: ${scrapedItems.length}`);
    console.log('');

    // Compare monsters
    console.log('🔍 MONSTERS COMPARISON:');
    const monsterResult = compareSets(scrapedMonsters, existingMonsters, '5e-DRS', 'AideDD');
    console.log(`   Duplicates: ${monsterResult.duplicates.length}`);
    console.log(`   Unique (new): ${monsterResult.unique.length}`);

    // Compare spells
    console.log('🔍 SPELLS COMPARISON:');
    const spellResult = compareSets(scrapedSpells, existingSpells, '5e-DRS', 'AideDD');
    console.log(`   Duplicates: ${spellResult.duplicates.length}`);
    console.log(`   Unique (new): ${spellResult.unique.length}`);

    // Compare items
    console.log('🔍 MAGIC ITEMS COMPARISON:');
    const itemResult = compareSets(scrapedItems, existingItems, '5e-DRS', 'AideDD');
    console.log(`   Duplicates: ${itemResult.duplicates.length}`);
    console.log(`   Unique (new): ${itemResult.unique.length}`);

    console.log('');
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    const totalDuplicates = monsterResult.duplicates.length + spellResult.duplicates.length + itemResult.duplicates.length;
    const totalUnique = monsterResult.unique.length + spellResult.unique.length + itemResult.unique.length;

    console.log(`Total Duplicates (already in AideDD): ${totalDuplicates}`);
    console.log(`Total Unique (can be added): ${totalUnique}`);

    // Save comparison results
    const results = {
        timestamp: new Date().toISOString(),
        monsters: {
            duplicates: monsterResult.duplicates,
            unique: monsterResult.unique
        },
        spells: {
            duplicates: spellResult.duplicates,
            unique: spellResult.unique
        },
        magicItems: {
            duplicates: itemResult.duplicates,
            unique: itemResult.unique
        }
    };

    fs.writeFileSync(
        path.join(SCRAPE_DIR, 'comparison-results.json'),
        JSON.stringify(results, null, 2)
    );

    console.log('');
    console.log('📁 Detailed results saved to: .tmp/5e-drs-scrape/comparison-results.json');

    // Show some unique items as examples
    if (monsterResult.unique.length > 0) {
        console.log('');
        console.log('📋 Sample UNIQUE monsters (first 10):');
        monsterResult.unique.slice(0, 10).forEach(m => console.log(`   - ${m.name}`));
    }

    if (spellResult.unique.length > 0) {
        console.log('');
        console.log('📋 Sample UNIQUE spells (first 10):');
        spellResult.unique.slice(0, 10).forEach(s => console.log(`   - ${s.name}`));
    }

    if (itemResult.unique.length > 0) {
        console.log('');
        console.log('📋 Sample UNIQUE magic items (first 10):');
        itemResult.unique.slice(0, 10).forEach(i => console.log(`   - ${i.name}`));
    }
}

main().catch(console.error);
