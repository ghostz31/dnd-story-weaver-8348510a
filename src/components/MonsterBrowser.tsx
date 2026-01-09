import React, { useState, useEffect, useMemo } from 'react';
import { Monster, monsterCategories, monsterTypes, monsterSizes } from '../lib/types';
import { FaSync, FaSearch, FaPlus, FaInfoCircle, FaPen, FaCopy, FaTrash } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { getAideDDMonsterSlug, getMonsterImageUrl } from '../lib/monsterUtils';
import { useMonsters } from '../hooks/useMonsters';
import FilterPanel from '@/components/ui/FilterPanel';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { StatBlock } from './StatBlock';
import { MonsterEditor } from './MonsterEditor';
import { generateUniqueId } from '../lib/monsterUtils';
import { getMonsterFromAideDD } from '../lib/api';

interface MonsterBrowserProps {
  onSelectMonster?: (monster: Monster) => void;
  isSelectable?: boolean;
}

const MonsterBrowser: React.FC<MonsterBrowserProps> = ({ onSelectMonster, isSelectable = false }) => {
  const { monsters, loading, refresh, saveCustomMonster, deleteCustomMonster } = useMonsters() as any;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const [filteredMonsters, setFilteredMonsters] = useState<Monster[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Filtres
  const [crMin, setCrMin] = useState<number | undefined>(undefined);
  const [crMax, setCrMax] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedAlignment, setSelectedAlignment] = useState('all');

  const [isCustom, setIsCustom] = useState(false);

  const alignments = [
    { value: 'all', label: 'Tous' },
    { value: 'loyal bon', label: 'Loyal Bon' },
    { value: 'neutre bon', label: 'Neutre Bon' },
    { value: 'chaotique bon', label: 'Chaotique Bon' },
    { value: 'loyal neutre', label: 'Loyal Neutre' },
    { value: 'neutre', label: 'Neutre' },
    { value: 'chaotique neutre', label: 'Chaotique Neutre' },
    { value: 'loyal mauvais', label: 'Loyal Mauvais' },
    { value: 'neutre mauvais', label: 'Neutre Mauvais' },
    { value: 'chaotique mauvais', label: 'Chaotique Mauvais' },
    { value: 'non aligné', label: 'Non aligné' },
  ];

  const parseCR = (cr: string | number | undefined): number => {
    if (cr === undefined || cr === null || cr === '') return -1;
    if (typeof cr === 'number') return cr;

    const cleanCr = cr.toString().replace(' (', '').split(' ')[0];

    if (cleanCr.includes('/')) {
      const [num, den] = cleanCr.split('/');
      return parseInt(num) / parseInt(den);
    }

    const parsed = parseFloat(cleanCr);
    return isNaN(parsed) ? 0 : parsed;
  };

  const applyFiltersToMonsters = (monstersToFilter: Monster[]): Monster[] => {
    return monstersToFilter.filter(monster => {
      // Filtre par nom
      if (searchQuery && !monster.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filtre par CR
      if (crMin !== undefined || crMax !== undefined) {
        const monsterCR = parseCR(monster.cr);
        if (crMin !== undefined && monsterCR < crMin) return false;
        if (crMax !== undefined && monsterCR > crMax) return false;
      }

      // Filtre par type
      if (selectedType !== 'all') {
        if (!monster.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
      }

      // Filtre par taille
      if (selectedSize !== 'all' && monster.size !== selectedSize) return false;

      // Filtre par catégorie
      if (selectedCategory !== 'all') {
        const typeLower = monster.type.toLowerCase();
        if (selectedCategory === 'monstre' && !typeLower.includes('human') && !typeLower.includes('monstrosity')) return false;
        if (selectedCategory === 'animal' && !typeLower.includes('bête') && !typeLower.includes('beast')) return false;
        if (selectedCategory === 'pnj' && !typeLower.includes('humanoïde') && !typeLower.includes('humanoid')) return false;
      }

      // Filtre par alignement
      if (selectedAlignment !== 'all') {
        if (!monster.alignment) return false;
        if (!monster.alignment.toLowerCase().includes(selectedAlignment)) return false;
      }



      // Filtre Custom
      if (isCustom && !monster.custom) return false;

      return true;
    });
  };

  useEffect(() => {
    const filtered = applyFiltersToMonsters(monsters);
    // Trier: custom d'abord, puis par nom alphabétique
    const sorted = filtered.sort((a, b) => {
      // Custom monsters first
      if (a.custom && !b.custom) return -1;
      if (!a.custom && b.custom) return 1;
      // Then alphabetically by name
      return a.name.localeCompare(b.name);
    });
    setFilteredMonsters(sorted);
    setVisibleCount(50);
  }, [searchQuery, crMin, crMax, selectedType, selectedSize, selectedCategory, selectedAlignment, isCustom, monsters]);

  const handleRefreshMonsters = async () => {
    await refresh();
    toast({
      title: "Rafraîchissement",
      description: "Liste des monstres mise à jour",
    });
  };

  const fetchMonsterDetails = async (monster: Monster) => {
    // Si c'est un monstre custom, on l'a déjà en local avec toutes les infos
    if (monster.custom) {
      setSelectedMonster(monster);
      setIsEditing(false);
      setIsCreating(false);
      return;
    }

    setIsDetailLoading(true);
    try {
      const fullMonster = await getMonsterFromAideDD(monster.name);
      setSelectedMonster(fullMonster);
    } catch (error) {
      console.error("Erreur chargement détails:", error);
      setSelectedMonster(monster); // Fallback to summary
      toast({
        title: "Attention",
        description: "Certains détails n'ont pas pu être chargés.",
        variant: "destructive"
      });
    } finally {
      setIsDetailLoading(false);
      setIsEditing(false);
      setIsCreating(false);
    }
  };

  const handleSelectMonster = async (monster: Monster) => {
    if (isSelectable && onSelectMonster) {
      let monsterToAdd = monster;
      // If monster seems incomplete (missing stats or actions), try to fetch details
      if (!monster.custom && (!monster.savingThrows || !monster.actions || monster.actions.length === 0)) {
        try {
          // Use toast to inform user of background loading if it might take a moment
          // toast({ description: "Récupération des détails...", duration: 1000 }); 
          // Logic: Check if we can get better data
          const detailed = await getMonsterFromAideDD(monster.name);
          if (detailed) {
            monsterToAdd = detailed;
          }
        } catch (e) {
          console.error("Error auto-fetching details on select", e);
        }
      }
      onSelectMonster(monsterToAdd);
    } else {
      fetchMonsterDetails(monster);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCrMin(undefined);
    setCrMax(undefined);
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedAlignment('all');

    setIsCustom(false);
    refresh();
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== 'all') count++;
    if (selectedSize !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    if (selectedAlignment !== 'all') count++;
    if (crMin !== undefined || crMax !== undefined) count++;
    if (isCustom) count++;
    return count;
  }, [selectedType, selectedSize, selectedCategory, selectedAlignment, crMin, crMax, isCustom]);

  // Editor Handlers
  const handleCreateMonster = () => {
    setSelectedMonster(null);
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleEditMonster = async (monster: Monster) => {
    if (!monster.custom) {
      // If editing a standard monster via duplicate (though this function is usually for custom edit), make sure we have details
      fetchMonsterDetails(monster).then(() => {
        setIsEditing(true);
        setIsCreating(false);
      });
    } else {
      setSelectedMonster(monster);
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const handleDuplicateMonster = async (monster: Monster) => {
    // Ensure we have full details before duplicating
    let monsterToDuplicate = monster;
    if (!monster.custom && (!monster.actions || monster.actions.length === 0)) {
      try {
        const full = await getMonsterFromAideDD(monster.name);
        if (full) monsterToDuplicate = full;
      } catch (e) { console.error(e); }
    }

    // Basic deep copy and ID reset
    const copy = JSON.parse(JSON.stringify(monsterToDuplicate));
    copy.id = generateUniqueId();
    copy.name = `${monster.name} (Copie)`;
    copy.originalName = monster.name;
    copy.source = 'Custom';
    copy.custom = true;

    setSelectedMonster(copy);
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleSaveMonster = (data: any) => {
    try {
      const monsterToSave = {
        ...data,
        id: (isCreating || !selectedMonster?.id) ? generateUniqueId() : selectedMonster.id,
        custom: true,
        source: 'Custom'
      };
      saveCustomMonster(monsterToSave);
      setIsEditing(false);
      setIsCreating(false);
      setSelectedMonster(monsterToSave);
      toast({
        title: "Succès",
        description: "La créature a été sauvegardée.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteMonster = (monster: Monster) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${monster.name} ?`)) {
      deleteCustomMonster(monster.id);
      if (selectedMonster?.id === monster.id) setSelectedMonster(null);
      toast({
        title: "Supprimé",
        description: "La créature a été supprimée.",
      });
    }
  };


  return (
    <div className="w-full">
      {/* Barre de recherche et header */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="parchment-panel p-3 rounded-xl flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un monstre..."
              className="pl-10 pr-4 py-2 border border-border/50 bg-white/50 rounded-md w-full focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground/70 text-foreground"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button
            onClick={handleCreateMonster}
            className="bg-primary hover:bg-primary/90 text-white font-cinzel whitespace-nowrap"
          >
            <FaPlus className="mr-2" /> Créer
          </Button>
          <Button
            onClick={async () => {
              try {
                const recoveryFn = (useMonsters() as any).recoverLostMonsters;
                const count = await recoveryFn();
                if (count > 0) {
                  toast({
                    title: "Récupération terminée",
                    description: `${count} monstres ont été restaurés (Cloud & Local).`,
                  });
                  refresh();
                } else {
                  toast({
                    title: "Aucun monstre trouvé",
                    description: "Aucun monstre perdu n'a été trouvé.",
                  });
                }
              } catch (e) {
                console.error(e);
                toast({
                  title: "Erreur",
                  description: "Erreur lors de la récupération.",
                  variant: "destructive"
                });
              }
            }}
            variant="outline"
            className="whitespace-nowrap bg-white/50"
            title="Tenter de récupérer les monstres perdus depuis les rencontres"
          >
            Récupérer
          </Button>
          <Button
            onClick={handleRefreshMonsters}
            disabled={loading}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            title="Actualiser la liste"
          >
            <FaSync className={`${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <FilterPanel
          activeFiltersCount={activeFiltersCount}
          onReset={resetFilters}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-cinzel font-bold text-muted-foreground">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-white/50 h-9">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  {monsterTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-cinzel font-bold text-muted-foreground">Taille</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="bg-white/50 h-9">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  {monsterSizes.map(size => (
                    <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-cinzel font-bold text-muted-foreground">FP (Challenge)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="bg-white/50 h-9"
                  min="0" max="30" step="0.125"
                  value={crMin ?? ''}
                  onChange={(e) => setCrMin(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  className="bg-white/50 h-9"
                  min="0" max="30" step="0.125"
                  value={crMax ?? ''}
                  onChange={(e) => setCrMax(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-cinzel font-bold text-muted-foreground">Catégorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white/50 h-9">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  {monsterCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-cinzel font-bold text-muted-foreground">Alignement (Experimental)</Label>
              <Select value={selectedAlignment} onValueChange={setSelectedAlignment}>
                <SelectTrigger className="bg-white/50 h-9">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  {alignments.map(align => (
                    <SelectItem key={align.value} value={align.value}>{align.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end pb-2">

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom-filter"
                  checked={isCustom}
                  onCheckedChange={(checked) => setIsCustom(checked === true)}
                />
                <Label htmlFor="custom-filter" className="cursor-pointer font-bold text-blue-700">Mes Créations</Label>
              </div>
            </div>
          </div>
        </FilterPanel>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {isSelectable && filteredMonsters.length > 0 && (
            <div className="mb-4">
              <Button
                onClick={() => {
                  if (onSelectMonster) {
                    const firstMonster = filteredMonsters[0];
                    onSelectMonster(firstMonster);
                    toast({
                      title: "Monstres ajoutés",
                      description: `${filteredMonsters.length} monstres ont été ajoutés à la rencontre.`,
                      variant: "default"
                    });
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-cinzel"
              >
                <FaPlus className="mr-2" /> Ajouter tous les monstres filtrés ({filteredMonsters.length})
              </Button>
            </div>
          )}

          <div className="overflow-y-auto pb-4 custom-scrollbar">
            {filteredMonsters.length > 0 ? (
              <div className="parchment-card rounded-xl overflow-hidden shadow-lg border border-border">
                <table className="min-w-full divide-y divide-border/20">
                  <thead className="bg-primary/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold font-cinzel text-muted-foreground uppercase tracking-wider">Nom</th>
                      <th className="px-4 py-3 text-left text-xs font-bold font-cinzel text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-bold font-cinzel text-muted-foreground uppercase tracking-wider">Taille</th>
                      <th className="px-4 py-3 text-left text-xs font-bold font-cinzel text-muted-foreground uppercase tracking-wider">FP</th>
                      <th className="px-4 py-3 text-left text-xs font-bold font-cinzel text-muted-foreground uppercase tracking-wider">XP</th>
                      <th className="px-4 py-3 text-center text-xs font-bold font-cinzel text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 bg-transparent text-foreground">
                    {filteredMonsters.slice(0, visibleCount).map((monster) => (
                      <tr key={monster.id} className="hover:bg-primary/5 transition-colors cursor-pointer group" onClick={() => handleSelectMonster(monster)}>
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-[36px] w-[36px] bg-secondary/10 rounded-lg overflow-hidden border border-border/30 relative">
                              <img
                                src={getMonsterImageUrl(monster)}
                                alt={monster.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.classList.add('flex', 'items-center', 'justify-center', 'bg-secondary/20');
                                  target.parentElement!.innerHTML = '<span class="text-xs text-secondary-foreground font-bold">' + monster.name.charAt(0).toUpperCase() + '</span>';
                                }}
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                {monster.name}
                                {monster.custom && <Badge variant="outline" className="text-[10px] h-4 px-1 border-primary/40 text-primary">Custom</Badge>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-sm text-muted-foreground">{monster.type || "Inconnu"}</span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-sm text-muted-foreground">{monster.size || "M"}</span>
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant="outline" className="font-mono bg-white/40 border-border/50">
                            {monster.cr}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-sm text-muted-foreground">{monster.xp}</span>
                        </td>
                        <td className="px-4 py-2 text-sm text-right space-x-2">
                          {isSelectable && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectMonster(monster);
                              }}
                              className="h-7 px-2"
                            >
                              <FaPlus className="mr-1" size={10} /> Ajouter
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchMonsterDetails(monster);
                            }}
                            className="h-7 px-2 hover:bg-white/40"
                          >
                            <FaInfoCircle className="mr-1" size={12} /> Détails
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredMonsters.length > visibleCount && (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <Button
                            variant="ghost"
                            onClick={() => setVisibleCount(prev => prev + 50)}
                            className="w-full text-muted-foreground hover:text-primary"
                          >
                            Charger plus... ({filteredMonsters.length - visibleCount} restants)
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="parchment-card p-8 text-center rounded-xl border border-dashed border-border/50 text-muted-foreground">
                <p>Aucun monstre trouvé. La crypte est vide...</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal / Overlay for Details or Editor */}
      {(selectedMonster || isEditing) && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={() => {
            setSelectedMonster(null);
            setIsEditing(false);
            setIsCreating(false);
          }}
        >
          <div
            className="parchment-panel w-full max-w-4xl h-[90vh] flex flex-col rounded-xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border/20 bg-primary/5">
              <h2 className="text-xl font-cinzel font-bold px-2">
                {isEditing
                  ? (isCreating ? "Création de monstre" : `Modification de ${selectedMonster?.name}`)
                  : selectedMonster?.name
                }
              </h2>
              <div className="flex items-center gap-2">
                {!isEditing && selectedMonster && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateMonster(selectedMonster)}
                      title="Dupliquer et modifier"
                    >
                      <FaCopy className="mr-2" /> Dupliquer
                    </Button>
                    {selectedMonster.custom && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMonster(selectedMonster)}
                          title="Modifier"
                        >
                          <FaPen className="mr-2" /> Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMonster(selectedMonster)}
                          title="Supprimer"
                        >
                          <FaTrash className="mr-2" /> Supprimer
                        </Button>
                      </>
                    )}
                    <a
                      href={`https://www.aidedd.org/dnd/monstres.php?vf=${getAideDDMonsterSlug(selectedMonster.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary/80 hover:underline mr-4 ml-4"
                    >
                      Voir sur AideDD
                    </a>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedMonster(null);
                    setIsEditing(false);
                    setIsCreating(false);
                  }}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white/50 p-4 custom-scrollbar">
              {isDetailLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="font-cinzel text-lg text-muted-foreground">Consultation des archives...</p>
                </div>
              ) : isEditing ? (
                <MonsterEditor
                  initialData={selectedMonster || {}}
                  onSave={handleSaveMonster}
                  onCancel={() => {
                    setIsEditing(false);
                    if (isCreating) setSelectedMonster(null);
                  }}
                />
              ) : (
                selectedMonster && (
                  <div className="flex flex-col gap-4">
                    <StatBlock monster={selectedMonster} />
                    {isSelectable && (
                      <div className="flex justify-center mt-4 pb-4">
                        <Button
                          onClick={() => {
                            onSelectMonster && onSelectMonster(selectedMonster);
                            setSelectedMonster(null);
                          }}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-cinzel gap-2 text-lg px-8 py-6"
                        >
                          <FaPlus /> Ajouter à la rencontre
                        </Button>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MonsterBrowser;