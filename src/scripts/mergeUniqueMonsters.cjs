/**
 * Merge Unique Items Script
 * 
 * This script compares monster names between 5e-DRS scraped data and AideDD
 * and identifies unique monsters to add.
 * 
 * USAGE: Place "monsters-5edrs-full.json" in the same directory as this script,
 * then run: node mergeUniqueMonsters.cjs
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public', 'data');
const SCRAPE_DIR = path.join(__dirname, '..', '..', '.tmp', '5e-drs-scrape');

// Normalize name for comparison (remove accents, special chars, lowercase)
function normalizeName(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

// Check if file exists
function fileExists(fp) {
    try {
        return fs.existsSync(fp);
    } catch {
        return false;
    }
}

// Load JSON
function loadJSON(fp) {
    try {
        return JSON.parse(fs.readFileSync(fp, 'utf-8'));
    } catch (e) {
        console.error(`Error loading ${fp}:`, e.message);
        return [];
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('MERGE UNIQUE MONSTERS FROM 5e-DRS TO AideDD');
    console.log('='.repeat(60));
    console.log('');

    // Load AideDD monsters
    const aideddPath = path.join(PUBLIC_DIR, 'aidedd-monsters-all.json');
    if (!fileExists(aideddPath)) {
        console.error('❌ AideDD monsters file not found:', aideddPath);
        return;
    }
    const aideddMonsters = loadJSON(aideddPath);
    console.log(`✅ Loaded ${aideddMonsters.length} AideDD monsters`);

    // Check multiple possible locations for 5e-DRS file
    const possiblePaths = [
        path.join(SCRAPE_DIR, 'monsters-5edrs-full.json'),
        path.join(__dirname, 'monsters-5edrs-full.json'),
        'C:\\Users\\Le Zincj\\Downloads\\monsters-5edrs-full.json',
        path.join(process.cwd(), 'monsters-5edrs-full.json')
    ];

    let drsPath = null;
    for (const p of possiblePaths) {
        if (fileExists(p)) {
            drsPath = p;
            break;
        }
    }

    if (!drsPath) {
        console.error('');
        console.error('❌ 5e-DRS monsters file not found!');
        console.error('   Please download the file from the browser and place it in one of:');
        possiblePaths.forEach(p => console.error(`   - ${p}`));
        console.error('');
        console.error('To download: Open 5e-drs.fr/bestiaire, set "Lignes par page" to "Tous",');
        console.error('then run this in browser console:');
        console.error(`
(function() {
  const monsters = Array.from(document.querySelectorAll('a.subtitle-2')).map(a => ({ 
    name: a.innerText.trim(), 
    url: a.href, 
    source: '5e-drs' 
  }));
  const blob = new Blob([JSON.stringify(monsters, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'monsters-5edrs-full.json';
  a.click();
})()
        `);
        return;
    }

    const drsMonsters = loadJSON(drsPath);
    console.log(`✅ Loaded ${drsMonsters.length} 5e-DRS monsters from ${drsPath}`);
    console.log('');

    // Build set of normalized AideDD names
    const aideddNames = new Set(aideddMonsters.map(m => normalizeName(m.name)));

    // Find unique monsters
    const duplicates = [];
    const unique = [];

    for (const monster of drsMonsters) {
        const normalized = normalizeName(monster.name);
        if (aideddNames.has(normalized)) {
            duplicates.push(monster);
        } else {
            unique.push(monster);
        }
    }

    console.log('📊 COMPARISON RESULTS:');
    console.log(`   Duplicates (already in AideDD): ${duplicates.length}`);
    console.log(`   Unique (can be added): ${unique.length}`);
    console.log('');

    if (unique.length > 0) {
        console.log('📋 UNIQUE MONSTERS (first 20):');
        unique.slice(0, 20).forEach(m => console.log(`   - ${m.name}`));
        if (unique.length > 20) {
            console.log(`   ... and ${unique.length - 20} more`);
        }
        console.log('');

        // Save unique monsters to file
        const outputPath = path.join(SCRAPE_DIR, 'unique-monsters-to-add.json');
        fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2));
        console.log(`✅ Unique monsters saved to: ${outputPath}`);

        // Create merged list
        const merged = [...aideddMonsters];
        let addedCount = 0;

        for (const monster of unique) {
            // Add basic structure for new monsters
            merged.push({
                id: String(merged.length),
                name: monster.name,
                originalName: monster.name,
                cr: 0,
                xp: 0,
                type: 'Unknown',
                subtype: '',
                size: 'M',
                alignment: 'unknown',
                ac: '10',
                hp: '1 (1d4)',
                speed: '9 m',
                str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
                skills: '',
                senses: '',
                languages: '',
                environment: [],
                source: '5e-DRS (needs details)',
                sourceUrl: monster.url,
                legendary: false,
                traits: [],
                actions: [],
                legendaryActions: [],
                image: null
            });
            addedCount++;
        }

        const mergedPath = path.join(SCRAPE_DIR, 'aidedd-monsters-merged.json');
        fs.writeFileSync(mergedPath, JSON.stringify(merged, null, 2));
        console.log(`✅ Merged list saved to: ${mergedPath}`);
        console.log(`   Total monsters: ${merged.length} (${aideddMonsters.length} original + ${addedCount} new)`);
    } else {
        console.log('ℹ️  No unique monsters found - all 5e-DRS monsters are already in AideDD');
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('DONE');
    console.log('='.repeat(60));
}

main().catch(console.error);
