import { useState, useEffect } from 'react';
import { loadMonstersIndex, getMonsters } from '../lib/api';
import { subscribeToMonsters } from '../lib/firebaseApi';
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

    const loadLocalMonsters = async () => {
        if (monsters.length > 0) return;
        setLoading(true);
        try {
            console.log("Chargement des monstres depuis l'index...");
            const monstersIndex = await loadMonstersIndex();

            if (monstersIndex && monstersIndex.length > 0) {
                const formattedMonsters = monstersIndex.map((monster: any) => ({
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
                setMonsters(formattedMonsters);
                localStorage.setItem('dnd_monsters', JSON.stringify(formattedMonsters));
            } else {
                console.warn("Index vide, fallback JSON complet...");
                const response = await fetch('/data/aidedd-monsters-all.json');
                if (response.ok) {
                    const data = await response.json();
                    const formatted = data.map((m: any) => ({
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
                    setMonsters(formatted);
                    localStorage.setItem('dnd_monsters', JSON.stringify(formatted));
                } else {
                    throw new Error("Impossible de charger les données");
                }
            }
        } catch (err: any) {
            console.error("Erreur hook useMonsters:", err);
            setError(err.message);
            // Fallback ultime
            setMonsters(getMonsters());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            loadLocalMonsters();
        } else {
            // Logique Firestore (simplifiée)
            const unsubscribe = subscribeToMonsters((fetched) => {
                if (fetched && fetched.length > 0) {
                    setMonsters(fetched);
                    setLoading(false);
                } else {
                    loadLocalMonsters();
                }
            });
            return () => unsubscribe();
        }
    }, [isAuthenticated]);

    return { monsters, loading, error, refresh: loadLocalMonsters };
};
