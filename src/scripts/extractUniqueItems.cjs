/**
 * Full Duplicate Comparison and Merge Script
 * Extracts unique items from 5e-DRS that are not in AideDD
 */

const fs = require('fs');
const path = require('path');

const SCRAPE_DIR = path.join(__dirname, '..', '..', '.tmp', '5e-drs-scrape');
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public', 'data');

// Normalize name for comparison
function normalizeName(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // Remove accents
        .replace(/[^a-z0-9]/g, '')        // Remove special chars
        .trim();
}

// Load JSON safely
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

// Extract unique items
function findUniqueItems(newItems, existingItems) {
    const existingNames = new Set(
        existingItems.map(item => normalizeName(item.name || ''))
    );

    const duplicates = [];
    const unique = [];

    for (const item of newItems) {
        const normalized = normalizeName(item.name || '');
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
    console.log('FULL DUPLICATE COMPARISON & UNIQUE EXTRACTION');
    console.log('='.repeat(60));
    console.log('');

    // Load existing AideDD data
    const aideddMonsters = loadJSON(path.join(PUBLIC_DIR, 'aidedd-monsters-all.json'));

    console.log('📊 Existing AideDD Data:');
    console.log(`   Monsters: ${aideddMonsters.length}`);
    console.log('');

    // For 5e-DRS, we need to extract from browser scrape
    // The browser subagent extracted the full list - we need to save it properly

    // Create a comprehensive comparison
    const results = {
        timestamp: new Date().toISOString(),
        aideddCounts: {
            monsters: aideddMonsters.length
        },
        comparison: {
            monsters: { duplicates: 0, unique: 0, uniqueList: [] }
        }
    };

    // Sample 5e-DRS monsters for demonstration (full list would come from browser extraction)
    const sampleDrsMonsters = [
        { name: "Aboleth", url: "https://2014.5e-drs.fr/bestiaire/aboleth/" },
        { name: "Acolyte", url: "https://2014.5e-drs.fr/bestiaire/acolyte/" },
        { name: "Âme-en-peine", url: "https://2014.5e-drs.fr/bestiaire/ame-en-peine/" },
        { name: "Dragon rouge ancien", url: "https://2014.5e-drs.fr/bestiaire/dragon-rouge-ancien/" },
        { name: "Ours", url: "https://2014.5e-drs.fr/bestiaire/ours/" },
        { name: "Lich", url: "https://2014.5e-drs.fr/bestiaire/lich/" },
        { name: "Tarasque", url: "https://2014.5e-drs.fr/bestiaire/tarasque/" }
    ];

    const monsterComparison = findUniqueItems(sampleDrsMonsters, aideddMonsters);
    results.comparison.monsters = {
        duplicates: monsterComparison.duplicates.length,
        unique: monsterComparison.unique.length,
        uniqueList: monsterComparison.unique
    };

    console.log('🔍 MONSTER COMPARISON (sample):');
    console.log(`   Duplicates: ${monsterComparison.duplicates.length}`);
    console.log(`   Unique: ${monsterComparison.unique.length}`);

    if (monsterComparison.unique.length > 0) {
        console.log('   Unique monsters:');
        monsterComparison.unique.forEach(m => console.log(`     - ${m.name}`));
    }

    // Save results
    fs.writeFileSync(
        path.join(SCRAPE_DIR, 'full-comparison-results.json'),
        JSON.stringify(results, null, 2)
    );

    console.log('');
    console.log('📁 Results saved to: .tmp/5e-drs-scrape/full-comparison-results.json');
    console.log('');
    console.log('Note: For full comparison, the browser-extracted data needs to be saved first.');
}

main().catch(console.error);
