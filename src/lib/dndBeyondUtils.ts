/**
 * Utilitaires pour extraire et calculer des stats depuis les données brutes D&D Beyond
 */

// Types partiels pour la structure D&D Beyond
/* eslint-disable @typescript-eslint/no-explicit-any */

import { calculateModifier } from './EncounterUtils';

/**
 * Calcule la CA (Armor Class) d'un personnage D&D Beyond
 * Prend en compte : Armure équipée, Bouclier, Défense sans armure (Barbare/Moine)
 */
export const calculateDndBeyondAC = (character: any, statsPromises: { dex: number, con: number, wis: number }): number => {
    // 1. Vérifier les overrides manuels (ex: CA forcée sur la fiche)
    const overrideAC = character.overrideStats?.find((s: any) => s.id === 2 || s.name === 'Armor Class');
    if (overrideAC && overrideAC.value) {
        return overrideAC.value;
    }

    const dexMod = calculateModifier(statsPromises.dex);
    const conMod = calculateModifier(statsPromises.con);
    const wisMod = calculateModifier(statsPromises.wis);

    // 2. Analyser l'inventaire pour l'armure et le bouclier équipés
    const inventory = character.inventory || [];
    const equippedItems = inventory.filter((item: any) => item.equipped);

    // Trouver l'armure équipée (corps)
    const armor = equippedItems.find((item: any) =>
        item.definition?.filterType === 'Armor' &&
        item.definition?.armorTypeId !== 4 // 4 est généralement Shield
    );

    // Trouver le bouclier équipé
    const shield = equippedItems.find((item: any) =>
        item.definition?.filterType === 'Armor' &&
        item.definition?.armorTypeId === 4 // Shield
    );

    let ac = 10 + dexMod; // Base : Peau nue

    // --- Logique d'Armure ---
    if (armor) {
        const baseAC = armor.definition.armorClass;
        const armorType = armor.definition.armorTypeId; // 1: Light, 2: Medium, 3: Heavy

        if (armorType === 1) {
            // Armure légère : Base + Dex total
            ac = baseAC + dexMod;
        } else if (armorType === 2) {
            // Armure intermédiaire : Base + Dex (max 2)
            // TODO: Gérer don "Maître des armures intermédiaires" si possible (complexe)
            ac = baseAC + Math.min(dexMod, 2);
        } else if (armorType === 3) {
            // Armure lourde : Base uniquement
            ac = baseAC;
        }
    } else {
        // --- Logique Défense sans armure (Unarmored Defense) ---
        // Vérifier les classes (Barbare, Moine)
        // Barbare: 10 + Dex + Con
        const isBarbarian = character.classes?.some((c: any) => c.definition?.name === 'Barbarian');
        // Moine: 10 + Dex + Wis (si pas de bouclier !!)
        const isMonk = character.classes?.some((c: any) => c.definition?.name === 'Monk');
        // Draconic Sorcerer (Sorcellerie Draconique): 13 + Dex (si pas d'armure)
        // C'est souvent géré via un modifier 'set-base-armor-class' ou 'bonus', plus dur à détecter brutalement.
        // On se concentre sur Barbare/Moine qui sont les plus fréquents.

        if (isBarbarian) {
            // Barbare: Con en plus (marche avec bouclier)
            ac = Math.max(ac, 10 + dexMod + conMod);
        }

        if (isMonk && !shield) {
            // Moine: Wis en plus (ne marche PAS avec bouclier)
            ac = Math.max(ac, 10 + dexMod + wisMod);
        }

        // Draconic Resilience (exemple de gestion via modifiers si on voulait pousser)
        // On check globalement les modifiers 'set-base-armor-class'
    }

    // --- Bonus Bouclier ---
    if (shield) {
        const shieldBonus = shield.definition?.armorClass || 2;
        ac += shieldBonus;
    }

    // --- Autres Bonus (Objets magiques de protection, Fighting Style Defense, etc.) ---
    // Ces bonus sont souvent dans character.modifiers.class / .race / .item / .feat
    // Type d'intérêt: "bonus" -> "armor-class"

    let miscBonus = 0;
    const processModifiers = (modifiers: any[]) => {
        if (!modifiers) return;
        modifiers.forEach((mod: any) => {
            if (mod.type === 'bonus' && (mod.subType === 'armor-class' || mod.subType === 'ac')) {
                // Vérifier les restrictions (ex: "while wearing armor") est difficile sans parser le friendlySubtypeName ou restrictions
                // On applique naïvement pour l'instant
                miscBonus += mod.value || 0;
            }
            // Items comme Anneau de protection: type='bonus', subType='armor-class'
        });
    };

    ['class', 'race', 'feat', 'item', 'background'].forEach(key => {
        if (character.modifiers && character.modifiers[key]) {
            processModifiers(character.modifiers[key]);
        }
    });

    ac += miscBonus;

    return ac;
};

// Correspondance entre les classes D&D Beyond (anglais) et françaises
export const CLASS_MAPPING: Record<string, string> = {
    'Artificer': 'Artificier',
    'Barbarian': 'Barbare',
    'Bard': 'Barde',
    'Cleric': 'Clerc',
    'Druid': 'Druide',
    'Fighter': 'Guerrier',
    'Monk': 'Moine',
    'Paladin': 'Paladin',
    'Ranger': 'Rôdeur',
    'Rogue': 'Roublard',
    'Sorcerer': 'Ensorceleur',
    'Warlock': 'Occultiste',
    'Wizard': 'Magicien'
};

/**
 * Données extraites d'un personnage D&D Beyond
 */
export interface DndBeyondCharacterData {
    name: string;
    race: string;
    characterClass: string;
    subclass?: string;
    level: number;
    ac: number;
    maxHp: number;
    currentHp: number;
    tempHp: number;
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
    speed: string[];
    initiative: number;
    proficiencies: string;
    dndBeyondId: string;
}

/**
 * Extraire la valeur d'une caractéristique depuis les données brutes Beyond.
 * Gère les overrides, stats de base, et bonus.
 */
export const getStatValue = (stats: any[], bonusStats: any[], overrideStats: any[], index: number): number => {
    if (overrideStats?.[index]?.value) {
        return overrideStats[index].value;
    }
    const base = stats?.[index]?.value || 10;
    const bonus = bonusStats?.[index]?.value || 0;
    return base + bonus;
};

/**
 * Extraction centralisée d'un personnage D&D Beyond depuis les données brutes de l'API.
 * Utilisé par PartyEditor (import initial) et useDnDBeyondLive (sync live).
 */
export const extractCharacterFromBeyond = (rawData: any, characterId: string): DndBeyondCharacterData => {
    const character = rawData.data || rawData;

    // 1. Nom
    const name = character.name || 'Personnage';

    // 2. Race
    const race = character.race?.fullName || character.race?.baseName || '';

    // 3. Classe, sous-classe et niveau
    let characterClass = 'Guerrier';
    let subclass: string | undefined;
    let level = 1;

    if (character.classes && character.classes.length > 0) {
        const primaryClass = character.classes[0];
        const englishClassName = primaryClass.definition?.name || 'Fighter';
        characterClass = CLASS_MAPPING[englishClassName] || englishClassName;
        subclass = primaryClass.subclassDefinition?.name;
        level = primaryClass.level || 1;

        for (let i = 1; i < character.classes.length; i++) {
            level += character.classes[i].level || 0;
        }
    }

    // 4. Caractéristiques
    const stats = character.stats || [];
    const bonusStats = character.bonusStats || [];
    const overrideStats = character.overrideStats || [];

    const str = getStatValue(stats, bonusStats, overrideStats, 0);
    const dex = getStatValue(stats, bonusStats, overrideStats, 1);
    const con = getStatValue(stats, bonusStats, overrideStats, 2);
    const int = getStatValue(stats, bonusStats, overrideStats, 3);
    const wis = getStatValue(stats, bonusStats, overrideStats, 4);
    const cha = getStatValue(stats, bonusStats, overrideStats, 5);

    // 5. PV
    const conMod = calculateModifier(con);
    let maxHp = 10;
    let currentHp = 10;

    if (character.overrideHitPoints) {
        maxHp = character.overrideHitPoints;
    } else if (character.baseHitPoints) {
        maxHp = (character.baseHitPoints || 10) + (character.bonusHitPoints || 0) + (conMod * level);
    } else if (character.hitPoints) {
        maxHp = character.hitPoints;
    }

    const removed = character.removedHitPoints || 0;
    currentHp = maxHp - removed;
    if (currentHp < 0) currentHp = 0;

    const tempHp = character.temporaryHitPoints || 0;

    // 6. CA
    const ac = calculateDndBeyondAC(character, { dex, con, wis });

    // 7. Vitesse
    const speedList: string[] = [];
    if (character.race?.weightSpeeds?.normal?.walk) {
        speedList.push(`${character.race.weightSpeeds.normal.walk} ft`);
    }

    // 8. Initiative
    const dexMod = calculateModifier(dex);
    let initiative = dexMod;

    const modKeys = ['race', 'class', 'feat', 'item', 'background'];
    modKeys.forEach(key => {
        if (character.modifiers?.[key]) {
            character.modifiers[key].forEach((mod: any) => {
                if (mod.subType === 'initiative') initiative += mod.value;
            });
        }
    });

    // 9. Maîtrises
    const proficienciesList: { type: string; name: string }[] = [];
    const languagesList: string[] = [];

    const processModifiers = (modifiers: any[]) => {
        if (!modifiers) return;
        modifiers.forEach((mod: any) => {
            if (mod.type === 'proficiency') {
                proficienciesList.push({ type: mod.subType, name: mod.friendlySubtypeName });
            } else if (mod.type === 'language') {
                languagesList.push(mod.friendlySubtypeName);
            }
        });
    };

    modKeys.forEach(key => {
        if (character.modifiers?.[key]) {
            processModifiers(character.modifiers[key]);
        }
    });

    const armorProfs = proficienciesList.filter(p => p.type.includes('armor')).map(p => p.name).join(', ');
    const weaponProfs = proficienciesList.filter(p => p.type.includes('weapon')).map(p => p.name).join(', ');
    const toolProfs = proficienciesList.filter(p => p.type.includes('tool') || p.type.includes('kit') || p.type.includes('supplies')).map(p => p.name).join(', ');

    let proficienciesText = '';
    if (armorProfs) proficienciesText += `**Armures:** ${armorProfs}\n`;
    if (weaponProfs) proficienciesText += `**Armes:** ${weaponProfs}\n`;
    if (toolProfs) proficienciesText += `**Outils:** ${toolProfs}\n`;
    if (languagesList.length > 0) proficienciesText += `**Langues:** ${languagesList.join(', ')}\n`;

    return {
        name,
        race,
        characterClass,
        subclass,
        level,
        ac,
        maxHp,
        currentHp,
        tempHp,
        str, dex, con, int, wis, cha,
        speed: speedList,
        initiative,
        proficiencies: proficienciesText,
        dndBeyondId: characterId,
    };
};
