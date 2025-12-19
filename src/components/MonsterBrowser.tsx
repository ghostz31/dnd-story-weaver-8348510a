import React, { useState, useEffect } from 'react';
import { getMonsters, searchMonsters, fetchMonstersFromAPI, fetchMonsterFromAideDD, adaptAideDDData, loadMonstersIndex } from '../lib/api';
import { subscribeToMonsters, initializeTestMonsters } from '../lib/firebaseApi';
import { Monster, environments, monsterCategories, monsterTypes, monsterSizes } from '../lib/types';
import { FaSync, FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaPlus, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../hooks/use-toast';
import { enrichMonster, mergeAideDDData } from '@/lib/monsterEnricher';
import { MonsterCard } from './MonsterCard';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Image as ImageIcon, X } from 'lucide-react';
import { getAideDDMonsterSlug, getMonsterImageUrl, generateUniqueId } from '../lib/monsterUtils';

interface MonsterBrowserProps {
  onSelectMonster?: (monster: Monster) => void;
  isSelectable?: boolean;
}

// Fonction utilitaire pour générer des identifiants uniques
const MonsterBrowser: React.FC<MonsterBrowserProps> = ({ onSelectMonster, isSelectable = false }) => {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [enrichedMonster, setEnrichedMonster] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentMonsterName, setCurrentMonsterName] = useState<string | null>(null);
  const [filteredMonsters, setFilteredMonsters] = useState<Monster[]>([]);

  // Filtres
  const [crMin, setCrMin] = useState<number | undefined>(undefined);
  const [crMax, setCrMax] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');

  const { isAuthenticated } = useAuth();

  // Charger les monstres au démarrage
  useEffect(() => {
    if (!isAuthenticated) {
      // Si l'utilisateur n'est pas authentifié, utiliser les données locales
      const loadMonsters = async () => {
        // Éviter de charger si les monstres sont déjà chargés
        if (monsters.length > 0) {
          console.log("Les monstres sont déjà chargés, chargement ignoré");
          return;
        }

        setLoading(true);
        try {
          console.log("Chargement des monstres depuis l'index des fichiers individuels...");

          // Charger l'index des monstres individuels
          const monstersIndex = await loadMonstersIndex();

          if (monstersIndex && monstersIndex.length > 0) {
            console.log(`${monstersIndex.length} monstres chargés depuis l'index`);

            // Transformer l'index au format Monster pour l'application
            const formattedMonsters = monstersIndex.map((monster: any) => ({
              id: monster.id,
              name: monster.name,
              originalName: monster.originalName,
              cr: parseFloat(monster.cr) || 0,
              xp: calculateXPFromCR(parseFloat(monster.cr) || 0),
              type: monster.type || 'Inconnu',
              size: monster.size || 'M',
              source: 'AideDD',
              environment: [],
              legendary: false,
              alignment: 'non-aligné',
              ac: 10,
              hp: 10,
              image: monster.image
            }));

            setMonsters(formattedMonsters);
          } else {
            console.warn("Index des monstres vide, essai de chargement depuis le JSON complet");

            // Fallback au JSON complet
            const response = await fetch('/data/aidedd-monsters-all.json');
            if (response.ok) {
              const monstersData = await response.json();
              // Transformer les données au format attendu par l'application
              const monsters = monstersData.map((monster: any) => ({
                id: monster.id || generateUniqueId(),
                name: monster.name,
                cr: monster.cr,
                xp: monster.xp || calculateXPFromCR(monster.cr),
                type: monster.type,
                size: monster.size,
                source: monster.source || 'MM',
                environment: monster.environment || [],
                legendary: monster.legendary || false,
                alignment: monster.alignment || 'non-aligné',
                ac: monster.ac || 10,
                hp: monster.hp || 10
              }));

              setMonsters(monsters);
              // Sauvegarder dans localStorage pour accélérer les prochains chargements
              localStorage.setItem('dnd_monsters', JSON.stringify(monsters));
            } else {
              throw new Error("Impossible de charger le fichier JSON");
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement des monstres:", error);

          // Dernier recours: utiliser les monstres stockés en localStorage
          const localMonsters = getMonsters();
          setMonsters(localMonsters);
        } finally {
          setLoading(false);
        }
      };

      loadMonsters();
    } else {
      // Si l'utilisateur est authentifié, utiliser Firestore avec des mises à jour en temps réel
      if (monsters.length > 0) {
        console.log("Les monstres sont déjà chargés, chargement Firestore ignoré");
        return;
      }

      setLoading(true);

      try {
        const unsubscribe = subscribeToMonsters(async (fetchedMonsters) => {
          setLoading(false);

          // Si nous avons réussi à récupérer des monstres depuis Firestore
          if (fetchedMonsters && fetchedMonsters.length > 0) {
            setMonsters(fetchedMonsters);
          } else {
            // Solution de secours: essayer d'abord l'index des fichiers individuels
            console.log("Aucun monstre trouvé dans Firestore, essai avec l'index des fichiers individuels");

            try {
              const monstersIndex = await loadMonstersIndex();

              if (monstersIndex && monstersIndex.length > 0) {
                console.log(`${monstersIndex.length} monstres chargés depuis l'index`);

                // Transformer l'index au format Monster pour l'application
                const formattedMonsters = monstersIndex.map((monster: any) => ({
                  id: monster.id,
                  name: monster.name,
                  originalName: monster.originalName,
                  cr: parseFloat(monster.cr) || 0,
                  xp: calculateXPFromCR(parseFloat(monster.cr) || 0),
                  type: monster.type || 'Inconnu',
                  size: monster.size || 'M',
                  source: 'AideDD',
                  environment: [],
                  legendary: false,
                  alignment: 'non-aligné',
                  ac: 10,
                  hp: 10,
                  image: monster.image
                }));

                setMonsters(formattedMonsters);
                // Sauvegarder dans localStorage pour accélérer les prochains chargements
                localStorage.setItem('dnd_monsters', JSON.stringify(formattedMonsters));
              } else {
                // Si l'index est vide, essayer avec le JSON complet
                console.warn("Index des monstres vide, essai avec le JSON complet");

                // Essayer de charger depuis le fichier JSON complet
                const response = await fetch('/data/aidedd-monsters-all.json');
                if (response.ok) {
                  const monstersData = await response.json();
                  // Transformer les données au format attendu
                  const monsters = monstersData.map((monster: any) => ({
                    id: monster.id || generateUniqueId(),
                    name: monster.name,
                    cr: monster.cr,
                    xp: monster.xp || calculateXPFromCR(monster.cr),
                    type: monster.type,
                    size: monster.size,
                    source: monster.source || 'MM',
                    environment: monster.environment || [],
                    legendary: monster.legendary || false,
                    alignment: monster.alignment || 'non-aligné',
                    ac: monster.ac || 10,
                    hp: monster.hp || 10
                  }));

                  setMonsters(monsters);
                  // Sauvegarder dans localStorage pour accélérer les prochains chargements
                  localStorage.setItem('dnd_monsters', JSON.stringify(monsters));
                } else {
                  throw new Error("Impossible de charger les monstres depuis le JSON");
                }
              }
            } catch (error) {
              console.error("Erreur lors du chargement des monstres:", error);
              // Dernier recours: utiliser les monstres stockés en localStorage
              const localMonsters = getMonsters();
              setMonsters(localMonsters);
            }
          }
        });

        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error("Erreur lors de l'abonnement aux monstres Firestore:", error);
        setLoading(false);

        // En cas d'erreur avec Firestore, utiliser les données locales
        const localMonsters = getMonsters();
        setMonsters(localMonsters);
      }
    }
  }, [isAuthenticated]);

  // Fonction pour calculer l'XP à partir du CR
  const calculateXPFromCR = (cr: number): number => {
    if (cr <= 0) return 10;
    if (cr <= 0.25) return 50;
    if (cr <= 0.5) return 100;
    if (cr <= 1) return 200;
    if (cr <= 2) return 450;
    if (cr <= 3) return 700;
    if (cr <= 4) return 1100;
    if (cr <= 5) return 1800;
    if (cr <= 6) return 2300;
    if (cr <= 7) return 2900;
    if (cr <= 8) return 3900;
    if (cr <= 9) return 5000;
    if (cr <= 10) return 5900;
    if (cr <= 11) return 7200;
    if (cr <= 12) return 8400;
    if (cr <= 13) return 10000;
    if (cr <= 14) return 11500;
    if (cr <= 15) return 13000;
    if (cr <= 16) return 15000;
    if (cr <= 17) return 18000;
    if (cr <= 18) return 20000;
    if (cr <= 19) return 22000;
    if (cr <= 20) return 25000;
    if (cr <= 21) return 33000;
    if (cr <= 22) return 41000;
    if (cr <= 23) return 50000;
    if (cr <= 24) return 62000;
    if (cr <= 25) return 75000;
    if (cr <= 26) return 90000;
    if (cr <= 27) return 105000;
    if (cr <= 28) return 120000;
    if (cr <= 29) return 135000;
    return 155000;
  };

  // Fonction pour appliquer les filtres à un tableau de monstres
  const applyFiltersToMonsters = (monstersToFilter: Monster[]): Monster[] => {
    return monstersToFilter.filter(monster => {
      // Filtre par nom (recherche)
      if (searchQuery && !monster.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filtre par CR
      if (crMin !== undefined && monster.cr < crMin) {
        return false;
      }

      if (crMax !== undefined && monster.cr > crMax) {
        return false;
      }

      // Filtre par type
      if (selectedType !== 'all' && monster.type !== selectedType) {
        return false;
      }

      // Filtre par taille
      if (selectedSize !== 'all' && monster.size !== selectedSize) {
        return false;
      }

      // Filtre par environnement
      if (selectedEnvironment !== 'all' &&
        (!monster.environment || !monster.environment.includes(selectedEnvironment))) {
        return false;
      }

      // Filtre par catégorie (à adapter selon votre modèle de données)
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'monstre' && monster.type !== 'humanoid' && monster.type !== 'monstrosity') {
          return false;
        } else if (selectedCategory === 'animal' && monster.type !== 'beast') {
          return false;
        } else if (selectedCategory === 'pnj' && monster.type !== 'humanoid') {
          return false;
        }
      }

      return true;
    });
  };

  // Filtrer les monstres en fonction des critères
  useEffect(() => {
    const filteredMonsters = applyFiltersToMonsters(monsters);
    setFilteredMonsters(filteredMonsters);
  }, [searchQuery, crMin, crMax, selectedType, selectedSize, selectedCategory, selectedEnvironment, monsters]);

  // Rafraîchir les monstres depuis l'API
  const handleRefreshMonsters = async () => {
    setLoading(true);

    try {
      // Charger l'index des monstres individuels
      const monstersIndex = await loadMonstersIndex();

      if (monstersIndex && monstersIndex.length > 0) {
        console.log(`${monstersIndex.length} monstres chargés depuis l'index`);

        // Transformer l'index au format Monster pour l'application
        const formattedMonsters = monstersIndex.map((monster: any) => ({
          id: monster.id,
          name: monster.name,
          originalName: monster.originalName,
          cr: parseFloat(monster.cr) || 0,
          xp: calculateXPFromCR(parseFloat(monster.cr) || 0),
          type: monster.type || 'Inconnu',
          size: monster.size || 'M',
          source: 'AideDD',
          environment: [],
          legendary: false,
          alignment: 'non-aligné',
          ac: 10,
          hp: 10,
          image: monster.image
        }));

        setMonsters(formattedMonsters);
        localStorage.setItem('dnd_monsters', JSON.stringify(formattedMonsters));

        toast({
          title: "Succès",
          description: `${formattedMonsters.length} monstres chargés avec succès`,
          variant: "default"
        });
      } else {
        // Fallback au JSON complet
        const response = await fetch('/data/aidedd-monsters-all.json');
        if (response.ok) {
          const monstersData = await response.json();
          // Transformer les données au format attendu par l'application
          const monsters = monstersData.map((monster: any) => ({
            id: monster.id || generateUniqueId(),
            name: monster.name,
            cr: monster.cr,
            xp: monster.xp || calculateXPFromCR(monster.cr),
            type: monster.type,
            size: monster.size,
            source: monster.source || 'MM',
            environment: monster.environment || [],
            legendary: monster.legendary || false,
            alignment: monster.alignment || 'non-aligné',
            ac: monster.ac || 10,
            hp: monster.hp || 10
          }));

          setMonsters(monsters);
          localStorage.setItem('dnd_monsters', JSON.stringify(monsters));

          toast({
            title: "Succès",
            description: `${monsters.length} monstres chargés depuis le JSON`,
            variant: "default"
          });
        } else {
          throw new Error("Impossible de charger le fichier JSON");
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'actualisation des monstres:", error);
      toast({
        title: "Erreur",
        description: "Impossible de recharger les monstres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle fonction pour récupérer les détails d'un monstre (version iframe)
  const fetchMonsterDetails = (monster: Monster) => {
    setSelectedMonster(monster);
  };

  // Remplacer la fonction handleSelectMonster existante
  const handleSelectMonster = (monster: Monster) => {
    if (isSelectable && onSelectMonster) {
      onSelectMonster(monster);
    } else {
      fetchMonsterDetails(monster);
    }
  };

  // Ajouter une fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setCrMin(undefined);
    setCrMax(undefined);
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedEnvironment('all');

    // Recharger la liste complète des monstres
    setLoading(true);

    if (isAuthenticated) {
      // Si l'utilisateur est authentifié, réabonner à tous les monstres sans filtre
      subscribeToMonsters((allMonsters) => {
        setMonsters(allMonsters);
        setLoading(false);
      });
    } else {
      // Sinon utiliser les données locales
      try {
        const allMonsters = getMonsters();
        setMonsters(allMonsters);
      } catch (error) {
        console.error("Erreur lors du rechargement des monstres:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Obtenir les valeurs de CR uniques pour les filtres
  const crValues = [...new Set(getMonsters().map(monster => monster.cr))].sort((a, b) => a - b);

  return (
    <div className="w-full">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 glass-panel p-3 rounded-xl">
        <div className="relative w-full sm:w-1/2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un monstre..."
            className="pl-10 pr-4 py-2 border-glass-border/30 bg-white/50 backdrop-blur-sm rounded-md w-full focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground/70 text-foreground"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border-glass-border/30 hover:bg-primary/10"
          >
            <FaFilter className="text-muted-foreground" />
            {showFilters ? "Masquer" : "Filtres"}
            {showFilters ? <FaChevronUp className="text-muted-foreground size-3" /> : <FaChevronDown className="text-muted-foreground size-3" />}
          </Button>

          <Button
            onClick={handleRefreshMonsters}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FaSync className={`${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="mb-4 p-4 glass-card rounded-xl border border-glass-border/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-cinzel font-bold text-foreground mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-glass-border/30 bg-white/50 backdrop-blur-sm rounded-md focus:ring-primary/50"
              >
                {monsterTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-cinzel font-bold text-foreground mb-1">Taille</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full p-2 border border-glass-border/30 bg-white/50 backdrop-blur-sm rounded-md focus:ring-primary/50"
              >
                {monsterSizes.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-cinzel font-bold text-foreground mb-1">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-glass-border/30 bg-white/50 backdrop-blur-sm rounded-md focus:ring-primary/50"
              >
                {monsterCategories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-cinzel font-bold text-foreground mb-1">Environnement</label>
              <select
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e.target.value)}
                className="w-full p-2 border border-glass-border/30 bg-white/50 backdrop-blur-sm rounded-md focus:ring-primary/50"
              >
                {environments.map(env => (
                  <option key={env.value} value={env.value}>{env.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-cinzel font-bold text-foreground mb-1">FP Min</label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.125"
                value={crMin !== undefined ? crMin : ''}
                onChange={(e) => setCrMin(e.target.value !== '' ? parseFloat(e.target.value) : undefined)}
                className="w-full p-2 border border-glass-border/30 bg-white/50 backdrop-blur-sm rounded-md focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-cinzel font-bold text-foreground mb-1">FP Max</label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.125"
                value={crMax !== undefined ? crMax : ''}
                onChange={(e) => setCrMax(e.target.value !== '' ? parseFloat(e.target.value) : undefined)}
                className="w-full p-2 border border-glass-border/30 bg-white/50 backdrop-blur-sm rounded-md focus:ring-primary/50"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={resetFilters}
                className="w-full bg-white/50 hover:bg-white/80"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          {/* Ajout du bouton pour ajouter tous les monstres filtrés */}
          {isSelectable && filteredMonsters.length > 0 && (
            <div className="mb-4">
              <Button
                onClick={() => {
                  if (onSelectMonster) {
                    // Ajouter le premier monstre pour déclencher l'événement
                    // L'interface utilisateur montrera ensuite que l'ajout a été effectué
                    const firstMonster = filteredMonsters[0];
                    onSelectMonster(firstMonster);
                    toast({
                      title: "Monstres ajoutés",
                      description: `${filteredMonsters.length} monstres ont été ajoutés à la rencontre.`,
                      variant: "default"
                    });
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Ajouter tous les monstres filtrés ({filteredMonsters.length})
              </Button>
            </div>
          )}

          {/* Affichage en mode liste au lieu de grille */}
          <div className="overflow-y-auto pb-4 custom-scrollbar">
            {filteredMonsters.length > 0 ? (
              <div className="glass-card rounded-xl overflow-hidden shadow-lg border border-glass-border/20">
                <table className="min-w-full divide-y divide-glass-border/20">
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
                  <tbody className="divide-y divide-glass-border/20 bg-transparent">
                    {filteredMonsters.map((monster) => (
                      <tr key={monster.id} className="hover:bg-primary/5 transition-colors cursor-pointer group" onClick={() => handleSelectMonster(monster)}>
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-[36px] w-[36px] bg-gray-200 rounded-lg overflow-hidden border border-glass-border/30 relative">
                              <img
                                src={getMonsterImageUrl(monster)}
                                alt={monster.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.classList.add('flex', 'items-center', 'justify-center', 'bg-secondary');
                                  target.parentElement!.innerHTML = '<span class="text-xs text-secondary-foreground font-bold">' + monster.name.charAt(0).toUpperCase() + '</span>';
                                }}
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{monster.name}</div>
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
                          <Badge variant="outline" className="font-mono bg-white/20">
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
                                onSelectMonster && onSelectMonster(monster);
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
                            className="h-7 px-2 hover:bg-white/20"
                          >
                            <FaInfoCircle className="mr-1" size={12} /> Détails
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="glass-card p-8 text-center rounded-xl border border-dashed border-glass-border/30 text-muted-foreground">
                <p>Aucun monstre trouvé. Essayez de modifier vos critères de recherche.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de détails du monstre */}
      {selectedMonster && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-4xl h-[85vh] flex flex-col rounded-xl overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center p-4 border-b border-glass-border/20 bg-primary/5">
              <h2 className="text-xl font-cinzel font-bold px-2">{selectedMonster.name}</h2>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.aidedd.org/dnd/monstres.php?vf=${getAideDDMonsterSlug(selectedMonster.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary/80 hover:underline mr-4"
                >
                  Ouvrir dans un nouvel onglet
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedMonster(null)}
                  className="hover:bg-red-500/10 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-white/90 overflow-hidden">
              <iframe
                src={`https://www.aidedd.org/dnd/monstres.php?vf=${getAideDDMonsterSlug(selectedMonster.name)}`}
                className="w-full h-full border-none"
                title={`Détails de ${selectedMonster.name}`}
              />
            </div>
            <div className="p-4 border-t border-glass-border/20 bg-white/40 backdrop-blur flex justify-end gap-2">
              {isSelectable && (
                <Button
                  onClick={() => {
                    onSelectMonster && onSelectMonster(selectedMonster);
                    setSelectedMonster(null);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Ajouter à la rencontre
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectedMonster(null)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonsterBrowser;