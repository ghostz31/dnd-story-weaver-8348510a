import React, { useState, useEffect, useMemo } from 'react';
import { Spell } from '@/lib/types';
import SpellCard from './SpellCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FilterPanel from '@/components/ui/FilterPanel';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SpellBrowserProps {
    onSelectSpell?: (spell: Spell) => void;
    className?: string;
}

const SpellBrowser: React.FC<SpellBrowserProps> = ({ onSelectSpell, className = '' }) => {
    const [spells, setSpells] = useState<Spell[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [selectedLevel, setSelectedLevel] = useState<string>('all');
    const [selectedSchool, setSelectedSchool] = useState<string>('all');
    const [isRitual, setIsRitual] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

    // Charger les sorts
    useEffect(() => {
        const loadSpells = async () => {
            try {
                const response = await fetch('/data/spells-complete.json');
                if (response.ok) {
                    const data = await response.json();
                    setSpells(data);
                } else {
                    console.error("Impossible de charger les sorts");
                }
            } catch (error) {
                console.error("Erreur chargement sorts:", error);
            } finally {
                setLoading(false);
            }
        };
        loadSpells();
    }, []);

    // Filtrage
    const filteredSpells = useMemo(() => {
        return spells.filter(spell => {
            // Recherche textuelle
            if (searchQuery && !spell.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Filtre Classe
            if (selectedClass !== 'all' && (!spell.classes || !spell.classes.includes(selectedClass))) {
                return false;
            }

            // Filtre Niveau
            if (selectedLevel !== 'all') {
                const levelNum = parseInt(selectedLevel);
                if (spell.level !== levelNum) return false;
            }

            // Filtre École
            if (selectedSchool !== 'all' && spell.school.toLowerCase() !== selectedSchool.toLowerCase()) {
                return false;
            }

            // Filtre Rituel
            if (isRitual && !spell.ritual) {
                return false;
            }

            return true;
        });
    }, [spells, searchQuery, selectedClass, selectedLevel, selectedSchool, isRitual]);

    const uniqueClasses = useMemo(() => {
        const classes = new Set<string>();
        spells.forEach(s => s.classes?.forEach(c => {
            if (c && c.trim()) classes.add(c);
        }));
        return Array.from(classes).sort();
    }, [spells]);

    const uniqueSchools = useMemo(() => {
        const schools = new Set<string>();
        spells.forEach(s => {
            if (s.school && s.school.trim()) schools.add(s.school);
        });
        return Array.from(schools).sort();
    }, [spells]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (selectedClass !== 'all') count++;
        if (selectedLevel !== 'all') count++;
        if (selectedSchool !== 'all') count++;
        if (isRitual) count++;
        return count;
    }, [selectedClass, selectedLevel, selectedSchool, isRitual]);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedClass('all');
        setSelectedLevel('all');
        setSelectedSchool('all');
        setIsRitual(false);
    };

    return (
        <div className={`p-4 h-full flex flex-col ${className}`}>
            {/* Barre de recherche et filtres */}
            <div className="flex flex-col gap-4 mb-4">
                <div className="parchment-panel p-3 rounded-xl flex gap-2 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un sort..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white/50"
                        />
                    </div>
                </div>

                <FilterPanel
                    activeFiltersCount={activeFiltersCount}
                    onReset={resetFilters}
                    defaultOpen={true}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-cinzel font-bold text-muted-foreground">Classe</Label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="bg-white/50">
                                    <SelectValue placeholder="Toutes classes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes classes</SelectItem>
                                    {uniqueClasses.map(cls => (
                                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-cinzel font-bold text-muted-foreground">Niveau</Label>
                            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                <SelectTrigger className="bg-white/50">
                                    <SelectValue placeholder="Tous niveaux" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous niveaux</SelectItem>
                                    <SelectItem value="0">Tour de magie</SelectItem>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                                        <SelectItem key={lvl} value={lvl.toString()}>Niveau {lvl}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-cinzel font-bold text-muted-foreground">École</Label>
                            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                                <SelectTrigger className="bg-white/50">
                                    <SelectValue placeholder="Toutes écoles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes écoles</SelectItem>
                                    {uniqueSchools.map(sch => (
                                        <SelectItem key={sch} value={sch}>{sch}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end pb-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="ritual-filter"
                                    checked={isRitual}
                                    onCheckedChange={(checked) => setIsRitual(checked === true)}
                                />
                                <Label htmlFor="ritual-filter" className="cursor-pointer">Rituel uniquement</Label>
                            </div>
                        </div>
                    </div>
                </FilterPanel>
            </div>

            {/* Liste des sorts */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Chargement du grimoire...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-2 pb-4">
                            {filteredSpells.map(spell => (
                                <div
                                    key={spell.name}
                                    className="parchment-card flex items-center justify-between p-3 cursor-pointer hover:border-primary/50 transition-colors"
                                    onClick={() => {
                                        setSelectedSpell(spell);
                                        onSelectSpell && onSelectSpell(spell);
                                    }}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <div className="font-medium text-foreground flex items-center gap-2 font-cinzel">
                                            {spell.name}
                                            {spell.ritual && <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-secondary/20 text-secondary-foreground border-secondary/30">R</Badge>}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {spell.level === 0 ? 'Tour de magie' : `Niveau ${spell.level}`} • {spell.school}
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono text-muted-foreground/70 bg-muted/50 px-2 py-1 rounded">
                                        {spell.components}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredSpells.length === 0 && (
                            <div className="col-span-full text-center text-muted-foreground py-10 italic">
                                Aucun sort ne correspond à l'incantation recherchée.
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Détail */}
            {
                selectedSpell && !onSelectSpell && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedSpell(null)}>
                        <div className="w-full max-w-2xl max-h-[90vh] h-[600px]" onClick={e => e.stopPropagation()}>
                            <SpellCard spell={selectedSpell} />
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default SpellBrowser;
