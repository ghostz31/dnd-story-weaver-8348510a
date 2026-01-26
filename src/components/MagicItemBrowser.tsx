import React, { useState, useEffect, useMemo } from 'react';
import { useMagicItems } from '../hooks/useMagicItems';
import { MagicItem } from '../lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Gem, Filter, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import FilterPanel from '@/components/ui/FilterPanel';
import { Label } from '@/components/ui/label';
import { useFavorites } from '../hooks/useFavorites';

interface Props {
    onSelectItem?: (item: MagicItem) => void;
    className?: string;
}

const MagicItemBrowser: React.FC<Props> = ({ onSelectItem, className = '' }) => {
    const { items, loading, error } = useMagicItems();
    const { favorites, toggleFavorite, isFavorite } = useFavorites();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRarity, setSelectedRarity] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedAttunement, setSelectedAttunement] = useState<string>('all');
    const [selectedSource, setSelectedSource] = useState<string>('all');
    const [selectedItem, setSelectedItem] = useState<MagicItem | null>(null);
    const [quickFilterType, setQuickFilterType] = useState<string | null>(null);
    const [quickFilterRarity, setQuickFilterRarity] = useState<string | null>(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Extraction des valeurs uniques pour les filtres
    const uniqueRarities = useMemo(() => {
        return Array.from(new Set(items.map(i => i.rarity))).sort();
    }, [items]);

    const uniqueTypes = useMemo(() => {
        const types = new Set<string>();
        items.forEach(i => {
            // Keep main category only (e.g. "Arme" instead of "Arme (épée)")
            if (i.type) {
                const baseType = i.type.split('(')[0].trim();
                types.add(baseType);
            }
        });
        return Array.from(types).sort();
    }, [items]);

    const uniqueSources = useMemo(() => {
        const sources = new Set<string>();
        items.forEach(i => {
            if (i.source) sources.add(i.source);
        });
        return Array.from(sources).sort();
    }, [items]);

    // Filtrage
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Filtre Favoris
            if (showFavoritesOnly && !isFavorite(item.id, 'item')) {
                return false;
            }

            // Recherche textuelle
            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Quick Filter Type
            if (quickFilterType) {
                const itemType = item.type.toLowerCase();
                const filterType = quickFilterType.toLowerCase();
                if (!itemType.startsWith(filterType)) {
                    return false;
                }
            }

            // Quick Filter Rarity
            if (quickFilterRarity && item.rarity !== quickFilterRarity) {
                return false;
            }

            // Filtre Rareté
            if (selectedRarity !== 'all' && item.rarity !== selectedRarity) {
                return false;
            }

            // Filtre Type
            if (selectedType !== 'all') {
                // Loose match for subtypes
                const itemType = item.type.toLowerCase();
                const filterType = selectedType.toLowerCase();
                if (!itemType.includes(filterType)) {
                    return false;
                }
            }

            // Filtre Harmonisation
            if (selectedAttunement !== 'all') {
                const needsAttunement = selectedAttunement === 'yes';
                // Treat undefined as false
                const itemAttunement = !!item.attunement;
                if (itemAttunement !== needsAttunement) return false;
            }

            // Filtre Source
            if (selectedSource !== 'all' && item.source !== selectedSource) {
                return false;
            }

            return true;
        });
    }, [items, searchQuery, selectedRarity, selectedType, selectedAttunement, selectedSource, quickFilterType, quickFilterRarity, showFavoritesOnly, favorites]); // Added favorites dependency

    const getRarityColor = (rarity: string) => {
        switch (rarity.toLowerCase()) {
            case 'commun': return 'bg-gray-200 text-gray-800';
            case 'peu commun': return 'bg-green-100 text-green-800 border-green-200';
            case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'très rare': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'légendaire': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (selectedRarity !== 'all') count++;
        if (selectedType !== 'all') count++;
        if (selectedAttunement !== 'all') count++;
        if (selectedSource !== 'all') count++;
        if (quickFilterType) count++;
        if (quickFilterRarity) count++;
        if (showFavoritesOnly) count++;
        return count;
    }, [selectedRarity, selectedType, selectedAttunement, selectedSource, quickFilterType, quickFilterRarity, showFavoritesOnly]);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedRarity('all');
        setSelectedType('all');
        setSelectedAttunement('all');
        setSelectedSource('all');
        setQuickFilterType(null);
        setQuickFilterRarity(null);
        setShowFavoritesOnly(false);
    };

    return (
        <div className={`w-full h-full flex flex-col gap-3 ${className}`}>
            {/* Barre de recherche et filtres */}
            <div className="flex flex-col gap-3">
                <div className="parchment-panel p-2 md:p-3 rounded-xl flex gap-2 items-center">
                    <div className="flex gap-2 relative flex-1">
                        <Search className="absolute left-3 top-3 md:top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un objet..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white/50 h-11 md:h-10 text-base"
                        />
                        {(searchQuery) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-1 top-1.5 md:top-1 h-8 w-8 text-muted-foreground hover:text-foreground touch-target"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Toggle Favoris */}
                    <Button
                        variant={showFavoritesOnly ? "default" : "outline"}
                        size="icon"
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`h-11 w-11 md:h-10 md:w-10 flex-shrink-0 ${showFavoritesOnly ? 'bg-yellow-400 hover:bg-yellow-500 text-white border-yellow-500' : 'bg-white/50 text-gray-400'}`}
                        title={showFavoritesOnly ? "Voir tous les objets" : "Voir mes favoris"}
                    >
                        <Star className={`h-5 w-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                    </Button>
                </div>

                {/* Quick Filters */}
                <div className="parchment-panel p-2 md:p-3 rounded-xl space-y-3">
                    {/* Item Type Quick Filters - Horizontal scroll on mobile */}
                    <div className="space-y-2">
                        <Label className="text-xs font-cinzel font-bold text-muted-foreground">Type</Label>
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mb-1">
                            {[
                                { label: 'Armes', value: 'Arme' },
                                { label: 'Armures', value: 'Armure' },
                                { label: 'Potions', value: 'Potion' },
                                { label: 'Parchemins', value: 'Parchemin' },
                                { label: 'Anneaux', value: 'Anneau' },
                                { label: 'Baguettes', value: 'Baguette' },
                                { label: 'Bâtons', value: 'Bâton' },
                                { label: 'Sceptres', value: 'Sceptre' },
                                { label: 'Merveilleux', value: 'Objet merveilleux' },
                            ].map(({ label, value }) => (
                                <Badge
                                    key={value}
                                    variant={quickFilterType === value ? 'default' : 'outline'}
                                    className={`cursor-pointer transition-all whitespace-nowrap flex-shrink-0 touch-target active:scale-95 ${quickFilterType === value
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'bg-white/50 hover:bg-primary/10'
                                        }`}
                                    onClick={() => setQuickFilterType(quickFilterType === value ? null : value)}
                                >
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Rarity Quick Filters - Horizontal scroll on mobile */}
                    <div className="space-y-2">
                        <Label className="text-xs font-cinzel font-bold text-muted-foreground">Rareté</Label>
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mb-1">
                            {[
                                { label: 'Commun', value: 'commun', color: 'bg-gray-200 text-gray-800' },
                                { label: 'Peu commun', value: 'peu commun', color: 'bg-green-100 text-green-800' },
                                { label: 'Rare', value: 'rare', color: 'bg-blue-100 text-blue-800' },
                                { label: 'Très rare', value: 'très rare', color: 'bg-purple-100 text-purple-800' },
                                { label: 'Légendaire', value: 'légendaire', color: 'bg-orange-100 text-orange-800' },
                            ].map(({ label, value, color }) => (
                                <Badge
                                    key={value}
                                    variant="outline"
                                    className={`cursor-pointer transition-all whitespace-nowrap flex-shrink-0 touch-target active:scale-95 ${quickFilterRarity === value
                                        ? `${color} shadow-md ring-2 ring-offset-1 ring-current`
                                        : `${color} opacity-60`
                                        }`}
                                    onClick={() => setQuickFilterRarity(quickFilterRarity === value ? null : value)}
                                >
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <FilterPanel
                    activeFiltersCount={activeFiltersCount}
                    onReset={resetFilters}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-cinzel font-bold text-muted-foreground">Rareté</Label>
                            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                                <SelectTrigger className="bg-white/50">
                                    <SelectValue placeholder="Toutes raretés" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes raretés</SelectItem>
                                    {uniqueRarities.map(r => (
                                        <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-cinzel font-bold text-muted-foreground">Type</Label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="bg-white/50">
                                    <SelectValue placeholder="Tous types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous types</SelectItem>
                                    {uniqueTypes.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-cinzel font-bold text-muted-foreground">Harmonisation</Label>
                            <Select value={selectedAttunement} onValueChange={setSelectedAttunement}>
                                <SelectTrigger className="bg-white/50">
                                    <SelectValue placeholder="Indifférent" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Indifférent</SelectItem>
                                    <SelectItem value="yes">Requise</SelectItem>
                                    <SelectItem value="no">Non requise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {uniqueSources.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs font-cinzel font-bold text-muted-foreground">Source</Label>
                                <Select value={selectedSource} onValueChange={setSelectedSource}>
                                    <SelectTrigger className="bg-white/50">
                                        <SelectValue placeholder="Toutes sources" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes sources</SelectItem>
                                        {uniqueSources.map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </FilterPanel>
            </div>

            {/* Liste */}
            <div className="flex-1 min-h-0 parchment-panel rounded-xl overflow-hidden flex flex-col">
                <div className="p-3 border-b border-border/20 bg-primary/5 font-cinzel font-bold text-sm text-muted-foreground flex justify-between items-center">
                    <span>Résultats ({filteredItems.length})</span>
                    {loading && <span className="text-xs font-sans font-normal animate-pulse">Chargement...</span>}
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map(item => {
                            const isFav = isFavorite(item.id, 'item');
                            return (
                                <Card
                                    key={item.id}
                                    className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.01] bg-white/60 border-border/30 hover:border-primary/30 group relative"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-base font-bold text-primary font-cinzel flex-1 leading-tight">{item.name}</CardTitle>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <Badge variant="outline" className={`text-[10px] whitespace-nowrap ${getRarityColor(item.rarity)}`}>
                                                    {item.rarity}
                                                </Badge>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className={`h-6 w-6 rounded-full ${isFav ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400 opacity-50 hover:opacity-100'} transition-all`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(item.id, item.name, 'item');
                                                    }}
                                                    title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                                                >
                                                    <Star className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardDescription className="text-xs font-serif mt-1">
                                            {item.type} {item.attunement && (
                                                item.attunementDetails
                                                    ? `• ${item.attunementDetails}`
                                                    : "• Harmonisation requise"
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                        <p className="text-sm text-foreground/80 line-clamp-2 font-serif">{item.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {!loading && filteredItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Gem className="h-12 w-12 mb-4 opacity-50" />
                            <p>{showFavoritesOnly ? "Aucun objet favori." : "Aucun objet magique trouvé."}</p>
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Modal Détail - Fullscreen on mobile */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <Card
                        className="parchment-panel w-full md:max-w-3xl h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom md:fade-in md:zoom-in-95 duration-200 border-none cursor-default md:rounded-xl rounded-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CardHeader className="bg-primary/5 border-b border-border/20 p-4">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-xl md:text-2xl font-cinzel text-primary truncate">{selectedItem.name}</CardTitle>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(selectedItem.id, selectedItem.name, 'item');
                                            }}
                                            className={`h-8 w-8 rounded-full ${isFavorite(selectedItem.id, 'item') ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-400'}`}
                                            title={isFavorite(selectedItem.id, 'item') ? "Retirer des favoris" : "Ajouter aux favoris"}
                                        >
                                            <Star className={`h-5 w-5 ${isFavorite(selectedItem.id, 'item') ? 'fill-current' : ''}`} />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        <Badge variant="outline" className={getRarityColor(selectedItem.rarity)}>
                                            {selectedItem.rarity}
                                        </Badge>
                                        <Badge variant="secondary" className='bg-background/50 text-xs'>{selectedItem.type}</Badge>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)} className="hover:bg-destructive/10 hover:text-destructive touch-target flex-shrink-0">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-white/40">
                            <div className="space-y-4">
                                {selectedItem.attunement && (
                                    <div className="text-sm font-medium text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        {selectedItem.attunementDetails
                                            ? `Harmonisation : ${selectedItem.attunementDetails}`
                                            : "Nécessite une harmonisation"
                                        }
                                    </div>
                                )}

                                <div className="prose prose-sm max-w-none text-foreground font-serif leading-relaxed">
                                    <p>{selectedItem.description}</p>
                                </div>

                                {selectedItem.source && (
                                    <div className="text-xs text-muted-foreground pt-4 border-t border-border/20 italic">
                                        Source: {selectedItem.source}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-border/20 bg-parchment-light flex justify-end gap-2" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
                            {onSelectItem ? (
                                <Button onClick={() => {
                                    onSelectItem(selectedItem);
                                    setSelectedItem(null);
                                }} className="font-cinzel touch-target">Ajouter</Button>
                            ) : (
                                <Button variant="outline" onClick={() => setSelectedItem(null)} className="touch-target">Fermer</Button>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MagicItemBrowser;
