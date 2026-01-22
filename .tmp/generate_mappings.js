
const fs = require('fs');
const path = require('path');

// Paths
const MONSTER_INDEX_PATH = 'c:/Users/Le Zincj/Documents/Trame/public/data/aidedd-complete/monsters-index.json';
const IMAGES_DIR = 'c:/Users/Le Zincj/Documents/Trame/public/data/aidedd-complete/images';
const OUTPUT_FILE = 'c:/Users/Le Zincj/Documents/Trame/new_monster_mappings_content.ts';

function normalizeName(name) {
    return name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '');        // Trim hyphens
}

try {
    // 1. Load Monster Index
    const monsters = JSON.parse(fs.readFileSync(MONSTER_INDEX_PATH, 'utf8'));

    // 2. List Images
    const availableImages = fs.readdirSync(IMAGES_DIR);
    const imageMap = new Set(availableImages.filter(img => img.endsWith('.jpg')).map(img => img.replace('.jpg', '')));

    const newMappings = {};

    console.log(`Processing ${monsters.length} monsters...`);

    monsters.forEach(monster => {
        const name = monster.name;
        const normalized = normalizeName(name);

        // Strategy 1: Exact normalized match
        if (imageMap.has(normalized)) {
            newMappings[name] = normalized;
            return;
        }

        // Strategy 2: Handle "Comae" cases like "Bandit, capitaine" -> "bandit-capitaine"
        // (normalizeName already handles commas by replacing with hyphens, but let's be sure order is preserved)
        // Actually normalized "Bandit, capitaine" becomes "bandit-capitaine" correctly.

        // Strategy 3: Try generic name if specific fails? No, specific should match specific file.
        // e.g. "Dragon rouge, adulte" -> "dragon-rouge-adulte"

        // Manual edge case checks if needed?
        // e.g. "Demi-dragon rouge, vétéran" -> "demi-dragon-rouge-veteran" matches normalized.
    });

    // Generate content
    let tsContent = "export const MANUAL_IMAGE_SLUGS: Record<string, string> = {\n";

    Object.keys(newMappings).sort().forEach((key, index, array) => {
        const firstChar = key.charAt(0).toUpperCase();
        // Add comment for section if changed (simplified logic)
        if (index === 0 || array[index - 1].charAt(0).toUpperCase() !== firstChar) {
            tsContent += `    // ${firstChar}\n`;
        }

        const slug = newMappings[key];
        const safeKey = key.replace(/'/g, "\\'");
        tsContent += `    '${safeKey}': '${slug}',\n`;
    });

    tsContent += "};\n";

    fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
    console.log(`Generated mappings for ${Object.keys(newMappings).length} monsters in ${OUTPUT_FILE}`);

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
