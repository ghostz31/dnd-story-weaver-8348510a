import { useState, useEffect, useCallback } from 'react';

type ItemCategory = 'monster' | 'spell' | 'item' | 'encounter';

interface RecentItem {
    id: string;
    name: string;
    category: ItemCategory;
    timestamp: number;
}

const STORAGE_KEY = 'trame_recent_items';
const MAX_ITEMS_PER_CATEGORY = 10;

export const useRecentItems = () => {
    const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setRecentItems(JSON.parse(stored));
            } catch {
                setRecentItems([]);
            }
        }
    }, []);

    const addRecentItem = useCallback((id: string, name: string, category: ItemCategory) => {
        setRecentItems(prev => {
            // Remove existing item if present
            const filtered = prev.filter(item => !(item.id === id && item.category === category));

            // Add new item at the start
            const newItem: RecentItem = { id, name, category, timestamp: Date.now() };
            const updated = [newItem, ...filtered];

            // Limit per category
            const categories: ItemCategory[] = ['monster', 'spell', 'item', 'encounter'];
            const limited: RecentItem[] = [];

            categories.forEach(cat => {
                const catItems = updated.filter(i => i.category === cat).slice(0, MAX_ITEMS_PER_CATEGORY);
                limited.push(...catItems);
            });

            // Sort by timestamp
            limited.sort((a, b) => b.timestamp - a.timestamp);

            // Persist
            localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));

            return limited;
        });
    }, []);

    const getRecentByCategory = useCallback((category: ItemCategory) => {
        return recentItems.filter(item => item.category === category);
    }, [recentItems]);

    const clearRecent = useCallback(() => {
        setRecentItems([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        recentItems,
        addRecentItem,
        getRecentByCategory,
        clearRecent
    };
};

export default useRecentItems;
