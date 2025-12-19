import { useState, useEffect } from 'react';
import { MagicItem } from '../lib/types';
import { MAGIC_ITEMS } from '../lib/magicItemsData';

export const useMagicItems = () => {
    const [items, setItems] = useState<MagicItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = async () => {
        setLoading(true);
        try {
            // Simulation d'un délai réseau pour le réalisme
            await new Promise(resolve => setTimeout(resolve, 300));
            setItems(MAGIC_ITEMS);
        } catch (err: any) {
            console.error("Erreur chargement objets magiques:", err);
            setError("Impossible de charger les objets magiques");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    return { items, loading, error, refresh: loadItems };
};
