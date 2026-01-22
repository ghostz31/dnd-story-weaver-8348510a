import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';

type FavoriteCategory = 'monster' | 'spell' | 'item';

interface FavoriteItem {
    id: string;
    name: string;
    category: FavoriteCategory;
}

const LOCAL_STORAGE_KEY = 'trame_favorites';

export const useFavorites = () => {
    const { isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

    // Load favorites on mount
    useEffect(() => {
        // For now, always use localStorage (Firestore sync can be added later)
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            try {
                setFavorites(JSON.parse(stored));
            } catch {
                setFavorites([]);
            }
        }
    }, [isAuthenticated]);

    const saveFavorites = useCallback((items: FavoriteItem[]) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
        setFavorites(items);
    }, []);

    const toggleFavorite = useCallback((id: string, name: string, category: FavoriteCategory) => {
        setFavorites(prev => {
            const exists = prev.some(f => f.id === id && f.category === category);
            let updated: FavoriteItem[];

            if (exists) {
                updated = prev.filter(f => !(f.id === id && f.category === category));
            } else {
                updated = [...prev, { id, name, category }];
            }

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const isFavorite = useCallback((id: string, category: FavoriteCategory) => {
        return favorites.some(f => f.id === id && f.category === category);
    }, [favorites]);

    const getFavoritesByCategory = useCallback((category: FavoriteCategory) => {
        return favorites.filter(f => f.category === category);
    }, [favorites]);

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        getFavoritesByCategory
    };
};

export default useFavorites;
