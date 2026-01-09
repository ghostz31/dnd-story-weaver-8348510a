import { useState, useEffect } from 'react';
import { MagicItem } from '../lib/types';

export const useMagicItems = () => {
    const [items, setItems] = useState<MagicItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = async () => {
        setLoading(true);
        try {
            const response = await fetch('/data/aidedd-complete/magic-items.json');
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            } else {
                // Fallback attempt to temp file if complete file isn't ready involved
                const tempResponse = await fetch('/data/aidedd-complete/magic_items_temp.json');
                if (tempResponse.ok) {
                    const tempData = await tempResponse.json();
                    setItems(tempData);
                } else {
                    throw new Error("Impossible de charger les objets magiques");
                }
            }
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
