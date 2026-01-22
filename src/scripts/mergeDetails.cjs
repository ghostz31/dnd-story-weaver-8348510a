const fs = require('fs');
const path = require('path');

const SCRAPE_DIR = path.join(__dirname, '..', '..', '.tmp', '5e-drs-scrape');
const INPUT_FILE = path.join(SCRAPE_DIR, 'unique-monsters-details.json');
const TARGET_FILE = path.join(__dirname, '..', '..', 'public', 'data', 'aidedd-monsters-all.json');

// Helper to generate IDs
function getNextId(monsters) {
    let maxId = 0;
    for (const m of monsters) {
        const id = parseInt(m.id);
        if (!isNaN(id) && id > maxId) {
            maxId = id;
        }
    }
    return maxId + 1;
}

function main() {
    console.log('Merging scraped monsters...');

    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Input file not found: ${INPUT_FILE}`);
        return;
    }

    const newMonsters = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
    const currentMonsters = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf-8'));

    console.log(`Current count: ${currentMonsters.length}`);
    console.log(`New monsters to add: ${newMonsters.length}`);

    let nextId = getNextId(currentMonsters);
    let added = 0;

    // Normalize existing names for duplicate check (just in case)
    const existingNames = new Set(currentMonsters.map(m => m.name.toLowerCase()));

    for (const m of newMonsters) {
        if (existingNames.has(m.name.toLowerCase())) {
            console.log(`Skipping duplicate: ${m.name}`);
            continue;
        }

        // Format to match AideDD schema exactly
        const newEntry = {
            id: String(nextId++),
            name: m.name,
            originalName: m.originalName || m.name,
            cr: m.cr || 0,
            xp: m.xp || 0,
            type: m.type || 'Inconnu',
            subtype: '', // 5e-drs mixed this in type often?
            size: m.size || 'M',
            alignment: m.alignment || 'non-aligné',
            ac: m.ac || "10",
            hp: m.hp || "10",
            speed: m.speed || "9 m",
            str: m.str || 10,
            dex: m.dex || 10,
            con: m.con || 10,
            int: m.int || 10,
            wis: m.wis || 10,
            cha: m.cha || 10,
            skills: m.skills || "",
            senses: m.senses || "",
            languages: m.languages || "",
            environment: [],
            source: '5e-DRS',
            sourceUrl: m.sourceUrl,
            legendary: (m.legendaryActions && m.legendaryActions.length > 0) || false,
            traits: m.traits || [],
            actions: m.actions || [],
            legendaryActions: m.legendaryActions || [],
            image: null
        };

        currentMonsters.push(newEntry);
        added++;
    }

    // Sort alphabetically
    currentMonsters.sort((a, b) => a.name.localeCompare(b.name));

    // Save
    fs.writeFileSync(TARGET_FILE, JSON.stringify(currentMonsters, null, 2));
    console.log(`✅ Merged ${added} new monsters.`);
    console.log(`Total monsters now: ${currentMonsters.length}`);
}

main();
