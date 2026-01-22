const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SCRAPE_DIR = path.join(__dirname, '..', '..', '.tmp', '5e-drs-scrape');
const UNIQUE_FILE = path.join(SCRAPE_DIR, 'unique-monsters.json');
const OUTPUT_FILE = path.join(SCRAPE_DIR, 'unique-monsters-details.json');

// Helper to normalize name to slug
function toSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function fetchMonster(name) {
    const slug = toSlug(name);
    const url = `https://2014.5e-drs.fr/bestiaire/${slug}/`;

    try {
        // console.log(`Fetching ${name} (${url})...`);
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                // Try alternate slug? e.g. remove commas?
                // For now just error
                return { error: `404 Not Found` };
            }
            throw new Error(`Status ${response.status}`);
        }
        const html = await response.text();
        return parseMonster(html, name, url);
    } catch (e) {
        return { error: e.message };
    }
}

function parseMonster(html, name, url) {
    const $ = cheerio.load(html);

    const monster = {
        name: name,
        originalName: name, // 5e-drs is French source
        source: '5e-DRS',
        sourceUrl: url,
        traits: [],
        actions: [],
        legendaryActions: []
    };

    // Subtitle: "Aberration de taille M, Loyal Mauvais"
    const subtitle = $('h1').next('p.subtitle').text().trim() ||
        $('.theme-default-content > p:nth-of-type(1) strong').text().trim() ||
        $('.theme-default-content > p:nth-of-type(1)').text().trim();

    if (subtitle) {
        // Parse "Type de taille Size, Alignment"
        // Example: "Aberration de taille M, Loyal Mauvais"
        const parts = subtitle.split(',');
        if (parts.length > 0) {
            const typeSize = parts[0].trim();
            monster.alignment = parts.slice(1).join(',').trim();

            // Extract size if present "de taille X"
            const sizeMatch = typeSize.match(/de taille\s+([A-Z]+|Très\s+[A-Z]+)/i);
            if (sizeMatch) {
                monster.size = sizeMatch[1].replace('Très ', 'T'); // TG -> Très Grand
                monster.type = typeSize.replace(sizeMatch[0], '').trim();
            } else {
                monster.type = typeSize;
                monster.size = 'M'; // Default
            }
        }
    }

    // Stats block parsing
    // Usually <p> lines
    // "Classe d'armure 15 (armure naturelle)"
    // "Points de vie 104 (16d8+32)"
    // "Vitesse 9 m"

    $('.theme-default-content > p').each((i, el) => {
        const text = $(el).text().trim();

        if (text.startsWith("Classe d'armure")) {
            monster.ac = text.replace("Classe d'armure", '').trim();
        }
        else if (text.startsWith("Points de vie")) {
            monster.hp = text.replace("Points de vie", '').trim();
        }
        else if (text.startsWith("Vitesse")) {
            monster.speed = text.replace("Vitesse", '').trim();
        }
        else if (text.startsWith("Jets de sauvegarde")) {
            monster.savingThrows = text.replace("Jets de sauvegarde", '').trim();
        }
        else if (text.startsWith("Compétences")) {
            monster.skills = text.replace("Compétences", '').trim();
        }
        else if (text.startsWith("Sens")) {
            monster.senses = text.replace("Sens", '').trim();
        }
        else if (text.startsWith("Langues")) {
            monster.languages = text.replace("Langues", '').trim();
        }
        else if (text.startsWith("Dangerosité")) {
            // "7 (2900 XP)" or "7 (PX : 2900)"
            const crText = text.replace("Dangerosité", '').trim();
            const crMatch = crText.match(/^([\d/]+)/);
            if (crMatch) {
                monster.cr = eval(crMatch[1]); // handle 1/2 etc safely? risky eval?
                // safer parse fraction
                if (crMatch[1].includes('/')) {
                    const [n, d] = crMatch[1].split('/');
                    monster.cr = parseInt(n) / parseInt(d);
                } else {
                    monster.cr = parseFloat(crMatch[1]);
                }
            }

            const xpMatch = crText.match(/\(?PX\s*[:]\s*([\d\s]+)\)?/i) || crText.match(/\(([\d\s]+)\s*XP\)/i);
            if (xpMatch) {
                monster.xp = parseInt(xpMatch[1].replace(/\s/g, ''));
            }
        }
    });

    // Attributes Table
    // For Dex Con Int Sag Cha
    // 16 (+3) ...
    const table = $('table').first();
    if (table.length) {
        const headers = table.find('th').map((i, el) => $(el).text().trim()).get();
        const values = table.find('td').map((i, el) => $(el).text().trim()).get();

        headers.forEach((h, i) => {
            const val = values[i];
            const num = parseInt(val.split('(')[0].trim());

            if (h.includes('For')) monster.str = num;
            if (h.includes('Dex')) monster.dex = num;
            if (h.includes('Con')) monster.con = num;
            if (h.includes('Int')) monster.int = num;
            if (h.includes('Sag')) monster.wis = num;
            if (h.includes('Cha')) monster.cha = num;
        });
    }

    // Traits, Actions, etc.
    // They are usually separated by H2 or H3
    // Structure:
    // H2 Capacités
    // P (Trait Name. Description)
    // H2 Actions
    // P (Action Name. Description)

    let currentSection = 'traits'; // Start with traits until we see 'Actions' header

    $('.theme-default-content').children().each((i, el) => {
        const tagName = el.tagName.toLowerCase();
        const $el = $(el);
        const text = $el.text().trim();

        if (tagName === 'h2' || tagName === 'h3') {
            if (text.includes('Actions') && !text.includes('légendaires')) currentSection = 'actions';
            else if (text.includes('légendaires')) currentSection = 'legendary';
            else if (text.includes('Capacités')) currentSection = 'traits';
            return;
        }

        // Parse paragraphs as entries if they look like "Name. Description"
        // Most traits/actions start with "<b>Name.</b> Description" or "Name. Description"
        if (tagName === 'p' && text.length > 5) { // minimal length
            // Check if it's a stat line (starts with known keyword)
            if (text.startsWith("Classe d'armure") || text.startsWith("Points de vie") ||
                text.startsWith("Vitesse") || text.startsWith("For ") ||
                text.startsWith("Jets de") || text.startsWith("Compétences") ||
                text.startsWith("Sens") || text.startsWith("Langues") ||
                text.startsWith("Dangerosité") || text.startsWith("Environnements") ||
                text.startsWith("Vulnérabilité") || text.startsWith("Résistance") ||
                text.startsWith("Immunité")) {
                return;
            }

            // Must contain a bold part OR end with a dot early?
            // 5e-DRS usually puts usage in bold or italics.
            // Let's look for the first bold element or just first sentence.

            // Assume the first bold tag is the name
            /*
            let title = $el.find('strong').first().text().trim();
            if (!title) title = $el.find('b').first().text().trim();
            */
            // Better: split by first dot? "Name. Description"

            let name = '';
            let desc = text;

            const firstDot = text.indexOf('.');
            if (firstDot > 1 && firstDot < 50) { // arbitrary limit for name length
                name = text.substring(0, firstDot).trim();
                desc = text.substring(firstDot + 1).trim();
            } else {
                // If no clear split, maybe it's just description or continuation
                if (currentSection === 'traits' && monster.traits.length > 0) {
                    // Attach to previous?
                    // For now, treat as new trait with empty name or generic?
                    // Skip if it doesn't look like a trait
                }
            }

            if (name) {
                const item = { name: name, text: desc };
                if (currentSection === 'actions') monster.actions.push(item);
                else if (currentSection === 'legendary') monster.legendaryActions.push(item);
                else if (currentSection === 'traits') monster.traits.push(item);
            }
        }
    });

    return monster;
}

async function main() {
    const uniqueNames = JSON.parse(fs.readFileSync(UNIQUE_FILE, 'utf-8'));
    console.log(`Loaded ${uniqueNames.length} unique monsters to scrape.`);

    const results = [];
    const errors = [];

    // Run for ALL unique monsters
    const batch = uniqueNames;

    console.log(`Starting full scrape of ${batch.length} monsters...`);

    for (const name of batch) {
        const data = await fetchMonster(name);
        if (data.error) {
            console.error(`❌ Error scraping ${name}: ${data.error}`);
            errors.push({ name, error: data.error });
        } else {
            console.log(`✅ Scraped ${name} (CR ${data.cr})`);
            results.push(data);
        }
        // Be nice
        await new Promise(r => setTimeout(r, 200));
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`Saved ${results.length} details to ${OUTPUT_FILE}`);
}

main().catch(console.error);
