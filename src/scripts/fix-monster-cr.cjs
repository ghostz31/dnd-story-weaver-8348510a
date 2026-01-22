const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.join(__dirname, '../../public/data/aidedd-complete/monsters.json');
const TARGET_PATH = path.join(__dirname, '../../public/data/aidedd-monsters-all.json');
const INDEX_PATH = path.join(__dirname, '../../public/data/aidedd-complete/monsters-index.json');

function parseCR(crStr) {
    if (!crStr) return 0;
    const cleanStr = String(crStr).trim();
    if (cleanStr.includes('/')) {
        const [num, den] = cleanStr.split('/');
        return parseFloat(num) / parseFloat(den);
    }
    return parseFloat(cleanStr);
}

function calculateXPFromCR(cr) {
    const crStr = cr.toString();
    const xpTable = {
        '0': 10, '0.125': 25, '0.25': 50, '0.5': 100,
        '1': 200, '2': 450, '3': 700, '4': 1100,
        '5': 1800, '6': 2300, '7': 2900, '8': 3900,
        '9': 5000, '10': 5900, '11': 7200, '12': 8400,
        '13': 10000, '14': 11500, '15': 13000, '16': 15000,
        '17': 18000, '18': 20000, '19': 22000, '20': 25000,
        '21': 33000, '22': 41000, '23': 50000, '24': 62000,
        '25': 75000, '26': 90000, '27': 105000, '28': 120000,
        '29': 135000, '30': 155000
    };
    return xpTable[crStr] || 0;
}

try {
    console.log('Loading source data form:', SOURCE_PATH);
    const sourceData = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
    console.log(`Loaded ${sourceData.length} source monsters.`);

    console.log('Loading target data from:', TARGET_PATH);
    const targetData = JSON.parse(fs.readFileSync(TARGET_PATH, 'utf8'));
    console.log(`Loaded ${targetData.length} target monsters.`);

    // Create a map of source monsters by name for quick lookup
    const sourceMap = new Map();
    sourceData.forEach(m => {
        sourceMap.set(m.name.toLowerCase(), m);
    });

    let updatedCount = 0;
    let missingCount = 0;

    targetData.forEach(targetMonster => {
        const sourceMonster = sourceMap.get(targetMonster.name.toLowerCase());

        if (sourceMonster && sourceMonster.fullHtml) {
            // Extract CR from fullHtml
            const crMatch = sourceMonster.fullHtml.match(/<strong>Puissance<\/strong>\s*([^(]+)\s*\(/);

            if (crMatch && crMatch[1]) {
                const crString = crMatch[1].trim();
                const crValue = parseCR(crString);

                targetMonster.cr = crValue;
                targetMonster.xp = calculateXPFromCR(crValue);

                // Also update speed if it looks like "30 ft." string or similar, but let's stick to CR for now
                // Actually, let's just make sure we are not overwriting good data with bad data
                // content checks? No, target was 0.

                updatedCount++;
            } else {
                // Try to see if sourceMonster already has a CR field that is valid
                if (sourceMonster.cr && sourceMonster.cr !== "0" && sourceMonster.cr !== 0) {
                    const crValue = parseCR(sourceMonster.cr);
                    targetMonster.cr = crValue;
                    targetMonster.xp = calculateXPFromCR(crValue);
                    updatedCount++;
                }
            }
        } else {
            // console.log(`Source not found for: ${targetMonster.name}`);
            missingCount++;
        }
    });

    console.log(`Updated ${updatedCount} monsters.`);
    console.log(`Missing source for ${missingCount} monsters.`);

    fs.writeFileSync(TARGET_PATH, JSON.stringify(targetData, null, 2));
    console.log('Target file updated successfully.');

    // --- Patch Index File ---
    if (fs.existsSync(INDEX_PATH)) {
        console.log('Loading index data from:', INDEX_PATH);
        const indexData = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
        let indexUpdatedCount = 0;

        indexData.forEach(indexMonster => {
            const sourceMonster = sourceMap.get(indexMonster.name.toLowerCase());
            if (sourceMonster && sourceMonster.fullHtml) {
                const crMatch = sourceMonster.fullHtml.match(/<strong>Puissance<\/strong>\s*([^(]+)\s*\(/);
                if (crMatch && crMatch[1]) {
                    const crString = crMatch[1].trim();
                    const crValue = parseCR(crString);
                    indexMonster.cr = crValue;
                    // Index usually doesn't have XP, but if it does, update it
                    if (indexMonster.xp !== undefined) indexMonster.xp = calculateXPFromCR(crValue);
                    indexUpdatedCount++;
                } else if (sourceMonster.cr && sourceMonster.cr !== "0" && sourceMonster.cr !== 0) {
                    // Fallback to existing valid CR in source
                    indexMonster.cr = parseCR(sourceMonster.cr);
                    if (indexMonster.xp !== undefined) indexMonster.xp = calculateXPFromCR(indexMonster.cr);
                    indexUpdatedCount++;
                }
            }
        });
        console.log(`Updated ${indexUpdatedCount} monsters in index.`);
        fs.writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2));
        console.log('Index file updated successfully.');
    } else {
        console.log('Index file not found, skipping.');
    }

} catch (err) {
    console.error('Error:', err);
}
