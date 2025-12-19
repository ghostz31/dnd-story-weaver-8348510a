import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Calculator, Calendar, CreditCard, Settings, Smile, User, PenTool, Book, Scroll, Gem, History } from 'lucide-react';
import { useMonsters } from '@/hooks/useMonsters';
import { useMagicItems } from '@/hooks/useMagicItems';

export function GlobalCommandPalette() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { monsters } = useMonsters();
    const { items } = useMagicItems();

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

    // Limit results for performance
    const topMonsters = monsters.slice(0, 10);
    const topItems = items.slice(0, 5);

    return (
        <>
            {/* Trigger Button only for mobile or hint ? Often hidden or in header. 
           We rely on keyboard mainly, but could export a button trigger later. */}

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Tapez une commande ou cherchez..." />
                <CommandList>
                    <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

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

                    <CommandGroup heading="Monstres (Accès Rapide)">
                        {/* Note: In a real 'Improv Engine', we would filter *all* monsters via the CommandInput value. 
                Shadcn Command does client-side filtering automatically on the children text.
                We need to render enough children, or map the `monsters` list dynamically.
                Rendering 2000 items here might be heavy. 
                For V1, let's render a subset or rely on the fact that `cmdk` is optimized?
                Actually `cmdk` is fast, but 2000 React nodes is heavy.
                Better pattern: Only render if user types? 
                For now, let's list top 20 and assume user goes to browser for deep search?
                OR render the top 50 matches based on search query?
                Shadcn's Command component doesn't easily expose the current search value for manual filtering 
                without controlling the state. 
                Let's stick to simple Navigation for V1 and maybe top 5 recent?
                Actually, let's map the first 20 just to show it works.
             */}
                        {monsters.slice(0, 20).map(m => (
                            <CommandItem key={m.id} onSelect={() => runCommand(() => navigate(`/monsters?search=${m.name}`))}>
                                <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{m.name}</span>
                                <span className="ml-2 text-xs text-muted-foreground">CR {m.cr}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandGroup heading="Objets Magiques">
                        {items.slice(0, 10).map(i => (
                            <CommandItem key={i.id} onSelect={() => runCommand(() => navigate(`/items?search=${i.name}`))}>
                                <Gem className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{i.name}</span>
                                <span className="ml-2 text-xs text-muted-foreground">{i.rarity}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>

                </CommandList>
            </CommandDialog>
        </>
    );
}
