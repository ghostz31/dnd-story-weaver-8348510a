/**
 * Utilitaires pour extraire et calculer des stats depuis les données brutes D&D Beyond
 */

// Types partiels pour la structure D&D Beyond
/* eslint-disable @typescript-eslint/no-explicit-any */

// Calcul du modificateur depuis le score
export const calculateMod = (score: number) => Math.floor((score - 10) / 2);

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

    const dexMod = calculateMod(statsPromises.dex);
    const conMod = calculateMod(statsPromises.con);
    const wisMod = calculateMod(statsPromises.wis);

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
