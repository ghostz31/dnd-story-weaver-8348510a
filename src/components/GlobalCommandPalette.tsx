import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { PenTool, Book, Scroll, Gem, History, Star, Clock, Sparkles } from 'lucide-react';
import { useMonsters } from '@/hooks/useMonsters';
import { useMagicItems } from '@/hooks/useMagicItems';
import { useRecentItems } from '@/hooks/useRecentItems';
import { useFavorites } from '@/hooks/useFavorites';
import { formatCR } from '@/lib/EncounterUtils';

export function GlobalCommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const { monsters } = useMonsters();
    const { items } = useMagicItems();
    const { recentItems, addRecentItem } = useRecentItems();
    const { isFavorite } = useFavorites();

    // Load spells
    const [spells, setSpells] = useState<any[]>([]);
    useEffect(() => {
        fetch('/data/spells-complete.json')
            .then(r => r.json())
            .then(setSpells)
            .catch(() => setSpells([]));
    }, []);

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    // Filtered results based on search
    const filteredMonsters = useMemo(() => {
        if (!search) return monsters.slice(0, 10);
        return monsters.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).slice(0, 15);
    }, [monsters, search]);

    const filteredSpells = useMemo(() => {
        if (!search) return spells.slice(0, 5);
        return spells.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10);
    }, [spells, search]);

    const filteredItems = useMemo(() => {
        if (!search) return items.slice(0, 5);
        return items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10);
    }, [items, search]);

    const recentMonsters = recentItems.filter(r => r.category === 'monster').slice(0, 5);
    const recentSpells = recentItems.filter(r => r.category === 'spell').slice(0, 5);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Rechercher monstres, sorts, objets..."
                value={search}
                onValueChange={setSearch}
            />
            <CommandList>
                <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

                {/* Recent Items Section */}
                {!search && (recentMonsters.length > 0 || recentSpells.length > 0) && (
                    <>
                        <CommandGroup heading="Récents">
                            {recentMonsters.map(r => (
                                <CommandItem
                                    key={`recent-${r.id}`}
                                    onSelect={() => runCommand(() => {
                                        navigate(`/monsters?search=${r.name}`);
                                    })}
                                >
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{r.name}</span>
                                    <span className="ml-auto text-xs text-muted-foreground">Monstre</span>
                                </CommandItem>
                            ))}
                            {recentSpells.map(r => (
                                <CommandItem
                                    key={`recent-${r.id}`}
                                    onSelect={() => runCommand(() => navigate(`/grimoire?search=${r.name}`))}
                                >
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{r.name}</span>
                                    <span className="ml-auto text-xs text-muted-foreground">Sort</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
                        <PenTool className="mr-2 h-4 w-4" />
                        <span>Accueil</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/encounters'))}>
                        <PenTool className="mr-2 h-4 w-4" />
                        <span>Rencontres</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/monsters'))}>
                        <Book className="mr-2 h-4 w-4" />
                        <span>Bestiaire</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/grimoire'))}>
                        <Scroll className="mr-2 h-4 w-4" />
                        <span>Grimoire</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/items'))}>
                        <Gem className="mr-2 h-4 w-4" />
                        <span>Objets Magiques</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/history'))}>
                        <History className="mr-2 h-4 w-4" />
                        <span>Historique</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Monstres">
                    {filteredMonsters.map(m => (
                        <CommandItem
                            key={m.id}
                            onSelect={() => runCommand(() => {
                                addRecentItem(m.id, m.name, 'monster');
                                navigate(`/monsters?search=${m.name}`);
                            })}
                        >
                            <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{m.name}</span>
                            {isFavorite(m.id, 'monster') && <Star className="ml-2 h-3 w-3 text-yellow-500 fill-yellow-500" />}
                            <span className="ml-auto text-xs text-muted-foreground">FP {formatCR(m.cr)}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandGroup heading="Sorts">
                    {filteredSpells.map(s => (
                        <CommandItem
                            key={s.id || s.name}
                            onSelect={() => runCommand(() => {
                                addRecentItem(s.id || s.name, s.name, 'spell');
                                navigate(`/grimoire?search=${s.name}`);
                            })}
                        >
                            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                            <span>{s.name}</span>
                            {isFavorite(s.id || s.name, 'spell') && <Star className="ml-2 h-3 w-3 text-yellow-500 fill-yellow-500" />}
                            <span className="ml-auto text-xs text-muted-foreground">Niv. {s.level}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandGroup heading="Objets Magiques">
                    {filteredItems.map(i => (
                        <CommandItem
                            key={i.id}
                            onSelect={() => runCommand(() => {
                                addRecentItem(i.id, i.name, 'item');
                                navigate(`/items?search=${i.name}`);
                            })}
                        >
                            <Gem className="mr-2 h-4 w-4 text-emerald-500" />
                            <span>{i.name}</span>
                            {isFavorite(i.id, 'item') && <Star className="ml-2 h-3 w-3 text-yellow-500 fill-yellow-500" />}
                            <span className="ml-auto text-xs text-muted-foreground">{i.rarity}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

            </CommandList>
        </CommandDialog>
    );
}
