import { useState, useEffect } from 'react';
import { loadMonstersIndex, getMonsters } from '../lib/api';
import { subscribeToMonsters, getEncounters, saveCustomMonsterCloud, deleteCustomMonsterCloud, subscribeToCustomMonsters, getCustomMonsters } from '../lib/firebaseApi';
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

            // Cloud Sync
            if (isAuthenticated) {
                try {
                    const cloudMonsters = await getCustomMonsters();
                    let hasChanges = false;

                    cloudMonsters.forEach(cloudM => {
                        const idx = custom.findIndex(c => c.id === cloudM.id);
                        // Si le monstre cloud n'existe pas ou est différent (simple check ID ici pour l'ajout)
                        if (idx === -1) {
                            custom.push(cloudM);
                            hasChanges = true;
                        } else {
                            // On pourrait comparer les dates de màj, mais pour l'instant on écrase avec le Cloud (source de vérité)
                            // Sauf s'il est "plus récent" en local ? Non, restons simple : Cloud gagne.
                            if (JSON.stringify(custom[idx]) !== JSON.stringify(cloudM)) {
                                custom[idx] = cloudM;
                                hasChanges = true;
                            }
                        }
                    });

                    if (hasChanges) {
                        localStorage.setItem('custom_monsters', JSON.stringify(custom));
                    }
                } catch (e) {
                    console.error("Erreur sync cloud monstres:", e);
                }
            }

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

    const saveCustomMonster = async (monster: Monster) => {
        const storedCustom = localStorage.getItem('custom_monsters');
        let custom: Monster[] = storedCustom ? JSON.parse(storedCustom) : [];

        const existingIndex = custom.findIndex(m => m.id === monster.id);
        const monsterToSave = { ...monster, id: monster.id || generateUniqueId(), custom: true, source: 'Custom' };

        if (existingIndex >= 0) {
            // Update existing
            custom[existingIndex] = monsterToSave;
        } else {
            // Add new
            // Note: Cloud limit is 20 for free plan but local we keep 10-20. 
            // We'll let Firestore enforce cloud limits if any.
            custom.push(monsterToSave);
        }

        // Save Local
        localStorage.setItem('custom_monsters', JSON.stringify(custom));
        setCustomMonsters(custom);

        // Save Cloud
        if (isAuthenticated) {
            try {
                await saveCustomMonsterCloud(monsterToSave);
            } catch (e) {
                console.error("Erreur sauvegarde cloud:", e);
                // On ne bloque pas si le cloud échoue, on a le local
            }
        }

        loadLocalMonsters(); // Reload to merge lists
    };

    const deleteCustomMonster = async (monsterId: string) => {
        const storedCustom = localStorage.getItem('custom_monsters');
        if (!storedCustom) return;

        let custom: Monster[] = JSON.parse(storedCustom);
        custom = custom.filter(m => m.id !== monsterId);

        localStorage.setItem('custom_monsters', JSON.stringify(custom));
        setCustomMonsters(custom);

        if (isAuthenticated) {
            try {
                await deleteCustomMonsterCloud(monsterId);
            } catch (e) {
                console.error("Erreur suppression cloud:", e);
            }
        }

        loadLocalMonsters();
    };

    useEffect(() => {
        loadLocalMonsters();

        let unsubscribe: (() => void) | undefined;

        if (isAuthenticated) {
            unsubscribe = subscribeToCustomMonsters((cloudMonsters) => {
                const storedCustom = localStorage.getItem('custom_monsters');
                let custom: Monster[] = storedCustom ? JSON.parse(storedCustom) : [];
                let hasChanges = false;

                cloudMonsters.forEach(cloudM => {
                    const idx = custom.findIndex(c => c.id === cloudM.id);
                    if (idx === -1) {
                        custom.push(cloudM);
                        hasChanges = true;
                    } else if (JSON.stringify(custom[idx]) !== JSON.stringify(cloudM)) {
                        custom[idx] = cloudM;
                        hasChanges = true;
                    }
                });

                if (hasChanges) {
                    localStorage.setItem('custom_monsters', JSON.stringify(custom));
                    // Recharger pour mettre à jour l'état complet (monstres + custom)
                    loadLocalMonsters();
                }
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [isAuthenticated]);

    const recoverLostMonsters = async (): Promise<number> => {
        console.log('[recoverLostMonsters] Starting recovery process...');
        let recoveryCount = 0;
        const storedCustom = localStorage.getItem('custom_monsters');
        let custom: Monster[] = storedCustom ? JSON.parse(storedCustom) : [];
        const initialCount = custom.length;

        const encsToScan: any[] = [];

        // 1. Scan Local Storage 'dnd_encounters'
        const storedEncounters = localStorage.getItem('dnd_encounters');
        if (storedEncounters) {
            try {
                const localEncs = JSON.parse(storedEncounters);
                if (Array.isArray(localEncs)) {
                    console.log(`[recoverLostMonsters] Found ${localEncs.length} encounters in localStorage`);
                    encsToScan.push(...localEncs);
                }
            } catch (e) {
                console.error("[recoverLostMonsters] Error parsing local encounters:", e);
            }
        }

        // 2. Scan Cloud if authenticated
        if (isAuthenticated) {
            try {
                console.log('[recoverLostMonsters] Fetching encounters from Firebase...');
                const cloudEncounters = await getEncounters();
                console.log(`[recoverLostMonsters] Found ${cloudEncounters.length} encounters in Firebase`);
                encsToScan.push(...cloudEncounters);
            } catch (e) {
                console.error("[recoverLostMonsters] Error fetching cloud encounters:", e);
            }
        }

        // 3. Scan all encounters for custom monsters
        console.log(`[recoverLostMonsters] Scanning ${encsToScan.length} total encounters...`);

        encsToScan.forEach((encounter, index) => {
            if (!encounter.monsters || !Array.isArray(encounter.monsters)) {
                return;
            }

            encounter.monsters.forEach((em: any) => {
                const monster = em.monster;
                if (!monster) return;

                // Check if this is a custom monster
                if (monster.custom || monster.source === 'Custom') {
                    // Check if this monster already exists in custom list
                    const exists = custom.find(c => c.id === monster.id || c.name === monster.name);

                    if (!exists) {
                        console.log(`[recoverLostMonsters] Recovered custom monster: ${monster.name} from encounter ${index}`);
                        custom.push({
                            ...monster,
                            custom: true,
                            source: 'Custom'
                        });
                        recoveryCount++;
                    }
                }
            });
        });

        // 4. Save recovered monsters if any were found
        if (recoveryCount > 0) {
            localStorage.setItem('custom_monsters', JSON.stringify(custom));
            console.log(`[recoverLostMonsters] Recovery complete: ${recoveryCount} monsters recovered (${initialCount} -> ${custom.length})`);

            // Reload monsters to update the UI
            loadLocalMonsters();
        } else {
            console.log('[recoverLostMonsters] No lost monsters found');
        }

        return recoveryCount;
    };


    return { monsters, loading, error, refresh: loadLocalMonsters, saveCustomMonster, deleteCustomMonster, recoverLostMonsters };
};
