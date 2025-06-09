import React, { useState, useEffect } from 'react';
import { getMonsters, searchMonsters, fetchMonstersFromAPI, addMonsterToFavorites, removeMonsterFromFavorites, isMonsterFavorite } from '../lib/api';
import { Monster, environments } from '../lib/types';
import { FaHeart, FaRegHeart, FaSync, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface MonsterBrowserProps {
  onSelectMonster?: (monster: Monster) => void;
  isSelectable?: boolean;
}

const MonsterBrowser: React.FC<MonsterBrowserProps> = ({ onSelectMonster, isSelectable = false }) => {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filtres
  const [crMin, setCrMin] = useState<number | undefined>(undefined);
  const [crMax, setCrMax] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Charger les monstres au démarrage
  useEffect(() => {
    const loadMonsters = async () => {
      setLoading(true);
      try {
        let monsters = getMonsters();
        
        // Si aucun monstre n'est stocké, tenter de récupérer depuis l'API
        if (monsters.length === 0) {
          monsters = await fetchMonstersFromAPI();
        }
        
        setMonsters(monsters);
        // Charger les favoris
        loadFavorites();
      } catch (error) {
        console.error("Erreur lors du chargement des monstres:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMonsters();
  }, []);

  // Charger les favoris
  const loadFavorites = () => {
    const favoriteIds = JSON.parse(localStorage.getItem('dnd_favorite_monsters') || '[]');
    setFavorites(favoriteIds);
  };

  // Gérer la recherche et les filtres
  useEffect(() => {
    const filterMonsters = () => {
      const filteredMonsters = searchMonsters(searchQuery, {
        crMin,
        crMax,
        type: selectedType,
        environment: selectedEnvironment
      });
      
      // Filtrer par favoris si nécessaire
      if (showOnlyFavorites) {
        return filteredMonsters.filter(monster => favorites.includes(monster.id));
      }
      
      return filteredMonsters;
    };
    
    const result = filterMonsters();
    setMonsters(result);
  }, [searchQuery, crMin, crMax, selectedType, selectedEnvironment, showOnlyFavorites, favorites]);

  // Rafraîchir les monstres depuis l'API
  const handleRefreshMonsters = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser les monstres depuis l'API? Cela remplacera les monstres personnalisés.")) {
      setLoading(true);
      try {
        const monsters = await fetchMonstersFromAPI();
        setMonsters(monsters);
      } catch (error) {
        console.error("Erreur lors de la récupération des monstres:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Sélectionner un monstre
  const handleSelectMonster = (monster: Monster) => {
    setSelectedMonster(monster);
    if (onSelectMonster) {
      onSelectMonster(monster);
    }
  };

  // Ajouter/retirer des favoris
  const toggleFavorite = (monsterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFavorite = favorites.includes(monsterId);
    
    if (isFavorite) {
      removeMonsterFromFavorites(monsterId);
      setFavorites(favorites.filter(id => id !== monsterId));
    } else {
      addMonsterToFavorites(monsterId);
      setFavorites([...favorites, monsterId]);
    }
  };

  // Récupérer tous les types de monstres uniques
  const monsterTypes = [...new Set(getMonsters().map(monster => monster.type))].sort();

  // Obtenir les valeurs de CR uniques pour les filtres
  const crValues = [...new Set(getMonsters().map(monster => monster.cr))].sort((a, b) => a - b);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center mr-2"
          >
            <FaFilter className="mr-1" />
            Filtres {showFilters ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
          </button>
          
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un monstre..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleRefreshMonsters}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center ml-2"
          disabled={loading}
        >
          <FaSync className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Filtres avancés (collapsible) */}
      {showFilters && (
        <div className="mb-4 border border-gray-200 rounded-md p-3 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indice de danger min</label>
              <select
                value={crMin === undefined ? '' : crMin.toString()}
                onChange={e => setCrMin(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                <option value="">Tous</option>
                {crValues.map(cr => (
                  <option key={`min-${cr}`} value={cr}>
                    {cr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indice de danger max</label>
              <select
                value={crMax === undefined ? '' : crMax.toString()}
                onChange={e => setCrMax(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                <option value="">Tous</option>
                {crValues.map(cr => (
                  <option key={`max-${cr}`} value={cr}>
                    {cr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                <option value="">Tous</option>
                {monsterTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Environnement</label>
              <select
                value={selectedEnvironment}
                onChange={e => setSelectedEnvironment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                {environments.map(env => (
                  <option key={env.value} value={env.value}>
                    {env.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Option favoris */}
          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id="favorites-only"
              checked={showOnlyFavorites}
              onChange={e => setShowOnlyFavorites(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="favorites-only" className="ml-2 text-sm text-gray-700">
              Afficher uniquement les favoris
            </label>
          </div>
        </div>
      )}

      {/* Liste des monstres */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : monsters.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Aucun monstre ne correspond à vos critères.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monsters.map(monster => (
                <tr 
                  key={monster.id} 
                  className={`hover:bg-gray-50 ${isSelectable ? 'cursor-pointer' : ''} ${selectedMonster?.id === monster.id ? 'bg-blue-50' : ''}`}
                  onClick={isSelectable ? () => handleSelectMonster(monster) : undefined}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    {monster.legendary && (
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-1 bg-amber-100 text-amber-800 rounded-full">
                        ★
                      </span>
                    )}
                    {monster.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{monster.cr}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{monster.type}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{monster.size}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{monster.xp}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      onClick={(e) => toggleFavorite(monster.id, e)}
                      className={`text-lg ${favorites.includes(monster.id) ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      {favorites.includes(monster.id) ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonsterBrowser; 