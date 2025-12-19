import React, { useState, useEffect, useMemo } from 'react';
import { useMagicItems } from '../hooks/useMagicItems';
import { MagicItem } from '../lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Gem, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
    onSelectItem?: (item: MagicItem) => void;
    className?: string;
}

const MagicItemBrowser: React.FC<Props> = ({ onSelectItem, className = '' }) => {
    const { items, loading, error } = useMagicItems();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRarity, setSelectedRarity] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedAttunement, setSelectedAttunement] = useState<string>('all');
    const [selectedItem, setSelectedItem] = useState<MagicItem | null>(null);

    // Extraction des valeurs uniques pour les filtres
    const uniqueRarities = useMemo(() => {
        return Array.from(new Set(items.map(i => i.rarity))).sort();
    }, [items]);

    const uniqueTypes = useMemo(() => {
        return Array.from(new Set(items.map(i => i.type))).sort();
    }, [items]);

    // Filtrage
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Recherche textuelle
            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Filtre Rareté
            if (selectedRarity !== 'all' && item.rarity !== selectedRarity) {
                return false;
            }

            // Filtre Type
            if (selectedType !== 'all' && item.type !== selectedType) {
                return false;
            }

            // Filtre Harmonisation
            if (selectedAttunement !== 'all') {
                const needsAttunement = selectedAttunement === 'yes';
                if (item.attunement !== needsAttunement) return false;
            }

            return true;
        });
    }, [items, searchQuery, selectedRarity, selectedType, selectedAttunement]);

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

    return (
        <div className={`w-full h-full flex flex-col gap-4 ${className}`}>
            {/* Barre de recherche et filtres */}
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-4">
                <div className="flex gap-2 relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un objet magique..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white/50"
                    />
                    {(searchQuery || selectedRarity !== 'all' || selectedType !== 'all' || selectedAttunement !== 'all') && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedRarity('all');
                                setSelectedType('all');
                                setSelectedAttunement('all');
                            }}
                            title="Réinitialiser les filtres"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                        <SelectTrigger className="w-[140px] bg-white/50">
                            <SelectValue placeholder="Rareté" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes raretés</SelectItem>
                            {uniqueRarities.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[140px] bg-white/50">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous types</SelectItem>
                            {uniqueTypes.map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedAttunement} onValueChange={setSelectedAttunement}>
                        <SelectTrigger className="w-[140px] bg-white/50">
                            <SelectValue placeholder="Harmonisation" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Indifférent</SelectItem>
                            <SelectItem value="yes">Requise</SelectItem>
                            <SelectItem value="no">Non requise</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Liste */}
            <div className="flex-1 min-h-0 glass-panel rounded-xl overflow-hidden flex flex-col">
                <div className="p-3 border-b border-glass-border/20 bg-primary/5 font-cinzel font-bold text-sm text-muted-foreground flex justify-between items-center">
                    <span>Résultats ({filteredItems.length})</span>
                    {loading && <span className="text-xs font-sans font-normal animate-pulse">Chargement...</span>}
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <Card
                                key={item.id}
                                className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.01] bg-white/60 border-glass-border/30"
                                onClick={() => setSelectedItem(item)}
                            >
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-base font-bold text-primary">{item.name}</CardTitle>
                                        <Badge variant="outline" className={`text-[10px] whitespace-nowrap ${getRarityColor(item.rarity)}`}>
                                            {item.rarity}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs">
                                        {item.type} {item.attunement && "• Harmonisation requise"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {!loading && filteredItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Gem className="h-12 w-12 mb-4 opacity-50" />
                            <p>Aucun objet magique trouvé.</p>
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Modal Détail */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <CardHeader className="bg-primary/5 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-cinzel text-primary">{selectedItem.name}</CardTitle>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="outline" className={getRarityColor(selectedItem.rarity)}>
                                            {selectedItem.rarity}
                                        </Badge>
                                        <Badge variant="secondary">{selectedItem.type}</Badge>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-4">
                                {selectedItem.attunement && (
                                    <div className="text-sm font-medium text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Nécessite une harmonisation
                                    </div>
                                )}

                                <div className="prose prose-sm max-w-none text-gray-700">
                                    <p>{selectedItem.description}</p>
                                </div>

                                {selectedItem.source && (
                                    <div className="text-xs text-muted-foreground pt-4 border-t">
                                        Source: {selectedItem.source}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                            {onSelectItem ? (
                                <Button onClick={() => {
                                    onSelectItem(selectedItem);
                                    setSelectedItem(null);
                                }}>Ajouter</Button>
                            ) : (
                                <Button variant="outline" onClick={() => setSelectedItem(null)}>Fermer</Button>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MagicItemBrowser;
