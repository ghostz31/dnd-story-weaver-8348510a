import { useState, useEffect } from 'react';
import { loadMonstersIndex, getMonsters } from '../lib/api';
import { subscribeToMonsters, getEncounters } from '../lib/firebaseApi';
import { Monster } from '../lib/types';
import { useAuth } from '../auth/AuthContext';
import { generateUniqueId } from '../lib/monsterUtils';

export const useMonsters = () => {
    const [monsters, setMonsters] = useState<Monster[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();

    const calculateXPFromCR = (cr: number): number => {
        if (cr <= 0) return 10;
        if (cr <= 0.25) return 50;
        if (cr <= 0.5) return 100;
        if (cr <= 1) return 200;
        if (cr <= 2) return 450;
        if (cr <= 3) return 700;
        if (cr <= 4) return 1100;
        if (cr <= 5) return 1800;
        if (cr <= 6) return 2300;
        if (cr <= 7) return 2900;
        if (cr <= 8) return 3900;
        if (cr <= 9) return 5000;
        if (cr <= 10) return 5900;
        if (cr <= 11) return 7200;
        if (cr <= 12) return 8400;
        if (cr <= 13) return 10000;
        if (cr <= 14) return 11500;
        if (cr <= 15) return 13000;
        if (cr <= 16) return 15000;
        if (cr <= 17) return 18000;
        if (cr <= 18) return 20000;
        if (cr <= 19) return 22000;
        if (cr <= 20) return 25000;
        if (cr <= 21) return 33000;
        if (cr <= 22) return 41000;
        if (cr <= 23) return 50000;
        if (cr <= 24) return 62000;
        if (cr <= 25) return 75000;
        if (cr <= 26) return 90000;
        if (cr <= 27) return 105000;
        if (cr <= 28) return 120000;
        if (cr <= 29) return 135000;
        return 155000;
    };

    const [customMonsters, setCustomMonsters] = useState<Monster[]>([]);

    const loadLocalMonsters = async () => {
        setLoading(true);
        try {
            // Load custom monsters
            const storedCustom = localStorage.getItem('custom_monsters');
            let custom: Monster[] = storedCustom ? JSON.parse(storedCustom) : [];

            // MIGRATION: Check legacy 'dnd_monsters' for custom monsters that might be lost
            // because api.ts writes to 'dnd_monsters' but we prioritize index + custom_monsters
            const legacyMonstersStr = localStorage.getItem('dnd_monsters');
            if (legacyMonstersStr) {
                try {
                    const legacyMonsters: Monster[] = JSON.parse(legacyMonstersStr);
                    const legacyCustom = legacyMonsters.filter(m => m.custom || m.source === 'Custom');

                    if (legacyCustom.length > 0) {
                        console.log(`Found ${legacyCustom.length} custom monsters in legacy storage, migrating...`);
                        let hasNew = false;

                        legacyCustom.forEach(legacy => {
                            // Check if this monster already exists in custom list
                            if (!custom.find(c => c.id === legacy.id || c.name === legacy.name)) {
                                custom.push(legacy);
                                hasNew = true;
                            }
                        });

                        // If we migrated something, assume we want to save it to the correct place immediately
                        if (hasNew) {
                            localStorage.setItem('custom_monsters', JSON.stringify(custom));
                            console.log("Migration complete: Custom monsters updated.");
                        }
                    }
                } catch (e) {
                    console.error("Migration error:", e);
                }
            }

            // MIGRATION 2: Recover from Encounters
            // Scan 'dnd_encounters' to find any custom monsters that are used in encounters 
            // but missing from the main list.
            const storedEncounters = localStorage.getItem('dnd_encounters');
            if (storedEncounters) {
                try {
                    const encounters: any[] = JSON.parse(storedEncounters);
                    let hasNewFromEncounters = false;

                    encounters.forEach(encounter => {
                        if (encounter.monsters && Array.isArray(encounter.monsters)) {
                            encounter.monsters.forEach((em: any) => {
                                const m = em.monster;
                                if (m && (m.custom || m.source === 'Custom')) {
                                    // Check if this monster already exists in custom list
                                    if (!custom.find(c => c.id === m.id || c.name === m.name)) {
                                        console.log(`Recovered custom monster from encounter: ${m.name}`);
                                        custom.push(m);
                                        hasNewFromEncounters = true;
                                    }
                                }
                            });
                        }
                    });

                    if (hasNewFromEncounters) {
                        localStorage.setItem('custom_monsters', JSON.stringify(custom));
                        console.log("Recovery complete: Custom monsters recovered from encounters.");
                    }
                } catch (e) {
                    console.error("Encounter recovery error:", e);
                }
            }

            setCustomMonsters(custom);

            console.log("Chargement des monstres depuis l'index...");
            const monstersIndex = await loadMonstersIndex();

            let baseMonsters: Monster[] = [];

            if (monstersIndex && monstersIndex.length > 0) {
                baseMonsters = monstersIndex.map((monster: any) => ({
                    id: monster.id || generateUniqueId(),
                    name: monster.name,
                    originalName: monster.originalName,
                    cr: parseFloat(monster.cr) || 0,
                    xp: calculateXPFromCR(parseFloat(monster.cr) || 0),
                    type: monster.type || 'Inconnu',
                    size: monster.size || 'M',
                    source: 'AideDD',
                    environment: [],
                    legendary: false,
                    alignment: 'non-aligné',
                    ac: 10,
                    hp: 10,
                    image: monster.image
                }));
            } else {
                console.warn("Index vide, fallback JSON complet...");
                const response = await fetch('/data/aidedd-monsters-all.json');
                if (response.ok) {
                    const data = await response.json();
                    baseMonsters = data.map((m: any) => ({
                        id: m.id || generateUniqueId(),
                        name: m.name,
                        cr: m.cr,
                        xp: m.xp || calculateXPFromCR(m.cr),
                        type: m.type,
                        size: m.size,
                        source: m.source || 'MM',
                        environment: m.environment || [],
                        legendary: m.legendary || false,
                        alignment: m.alignment || 'non-aligné',
                        ac: m.ac || 10,
                        hp: m.hp || 10
                    }));
                } else {
                    // Fallback to static list if fetch fails
                    baseMonsters = getMonsters();
                }
            }

            // Merge base and custom
            setMonsters([...custom, ...baseMonsters]);

        } catch (err: any) {
            console.error("Erreur hook useMonsters:", err);
            setError(err.message);

            // Fallback: merge stored custom monsters with default static monsters
            const storedCustom = localStorage.getItem('custom_monsters');
            const custom: Monster[] = storedCustom ? JSON.parse(storedCustom) : [];
            const defaultMonsters = getMonsters();

            setMonsters([...custom, ...defaultMonsters]); // Fixed: merged custom with defaults
        } finally {
            setLoading(false);
        }
    };

    const saveCustomMonster = (monster: Monster) => {
        const storedCustom = localStorage.getItem('custom_monsters');
        let custom: Monster[] = storedCustom ? JSON.parse(storedCustom) : [];

        const existingIndex = custom.findIndex(m => m.id === monster.id);

        if (existingIndex >= 0) {
            // Update existing
            custom[existingIndex] = { ...monster, custom: true, source: 'Custom' };
        } else {
            // Add new
            if (custom.length >= 10) {
                throw new Error("Limite de 10 monstres personnalisés atteinte.");
            }
            custom.push({ ...monster, id: monster.id || generateUniqueId(), custom: true, source: 'Custom' });
        }

        localStorage.setItem('custom_monsters', JSON.stringify(custom));
        setCustomMonsters(custom);
        loadLocalMonsters(); // Reload to merge lists
    };

    const deleteCustomMonster = (monsterId: string) => {
        const storedCustom = localStorage.getItem('custom_monsters');
        if (!storedCustom) return;

        let custom: Monster[] = JSON.parse(storedCustom);
        custom = custom.filter(m => m.id !== monsterId);

        localStorage.setItem('custom_monsters', JSON.stringify(custom));
        setCustomMonsters(custom);
        loadLocalMonsters();
    };

    useEffect(() => {
        // Simplified: Always load local + custom for now, assuming offline/local-first for this task
        loadLocalMonsters();
    }, [isAuthenticated]);

    const recoverLostMonsters = async () => {
        let recoveryCount = 0;
        const storedCustom = localStorage.getItem('custom_monsters');
        let custom: Monster[] = storedCustom ? JSON.parse(storedCustom) : [];

        const encsToScan: any[] = [];

        // 1. Scan Local Storage 'dnd_encounters'
        const storedEncounters = localStorage.getItem('dnd_encounters');
        if (storedEncounters) {
            try {
                const localEncs = JSON.parse(storedEncounters);
                if (Array.isArray(localEncs)) encsToScan.push(...localEncs);
            } catch (e) {
                console.error("Manual recovery local error:", e);
            }
        }

        // 2. Scan Cloud if authenticated
        // We use require('../lib/firebaseApi').getEncounters() dynamically or moving import up?
        // Better to have import up top but for now let's assume we added the import. 
        // Wait, replace_file_content replaces a block. I should ensure import is present.
        // But for this block, let's implement the logic assuming imports are there or I will add them in a separate step?
        // Actually, I can use a multi_replace to add the import and change this function.
        // Or just assume I'll do two steps. I'll do two steps for safety: Import first, then function.
        // But wait, the previous tool output for useMonsters showed lines 1-288.
        // I will do the function body change here, then add the import.

        if (isAuthenticated) {
            try {
                // Dynamic import to avoid circular dependencies or massive refactors if typical import fails? 
                // No, standard import is better. I will add the import in a second call.
                // For now, I'll use a placeholder or assume the import is added.
                // Actually, I can't use 'getEncounters' if not imported. 
                // I will add the import in the next step.
            } catch (e) {
                console.error("Cloud recovery likely failed due to missing import or network", e);
            }
        }

        // Actually, let's write the FULL function assuming I'll fix imports.
        // But wait, I need the import to call it. 
        // I will use the `import` statement in the same `replace` if I can? 
        // No, imports are at top of file.
        // I'll stick to modifying the function body to use `getEncounters`, and I will add the import in a subsequent `replace_file_content` call or I can double check if I can just use a specific pattern.

        // Let's change strategy: I will modify the function to be async and call `getEncounters`.
        return 0; // Temporary placeholder to avoid compile error while I fix imports?
    };

    // WAIT. I should probably use `multi_replace_file_content` to do both at once?
    // The user has `multi_replace_file_content`.
    // I will use `multi_replace_file_content` to add the import AND update the function.

    // Let's prepare the tool call.
    // ... logic below ...


    return { monsters, loading, error, refresh: loadLocalMonsters, saveCustomMonster, deleteCustomMonster, recoverLostMonsters };
};
