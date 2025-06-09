import React, { useState, useEffect } from 'react';
import { getMonsters, searchMonsters, fetchMonstersFromAPI } from '../lib/api';
import { Monster, environments, monsterCategories, monsterTypes, monsterSizes } from '../lib/types';
import { FaSync, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  
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
      } catch (error) {
        console.error("Erreur lors du chargement des monstres:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMonsters();
  }, []);

  // Gérer la recherche et les filtres
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      try {
        const filteredMonsters = searchMonsters(searchQuery, {
          crMin,
          crMax,
          type: selectedType !== 'all' ? selectedType : undefined,
          size: selectedSize !== 'all' ? selectedSize : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          environment: selectedEnvironment !== 'all' ? selectedEnvironment : undefined
        });
        
        setMonsters(filteredMonsters);
      } catch (error) {
        console.error("Erreur lors du filtrage des monstres:", error);
      } finally {
        setLoading(false);
      }
    };
    
    applyFilters();
  }, [searchQuery, crMin, crMax, selectedType, selectedSize, selectedCategory, selectedEnvironment]);

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
    try {
      const allMonsters = getMonsters();
      setMonsters(allMonsters);
    } catch (error) {
      console.error("Erreur lors du rechargement des monstres:", error);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Filtres avancés</h3>
            <button
              onClick={resetFilters}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                {monsterCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
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
                {monsterTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
              <select
                value={selectedSize}
                onChange={e => setSelectedSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                {monsterSizes.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FP Min</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">FP Max</label>
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
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-2"></div>
          <p className="text-gray-500">Chargement du bestiaire...</p>
        </div>
      ) : monsters.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="mb-2">Aucun monstre ne correspond à vos critères.</p>
          <button
            onClick={resetFilters}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
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
                    <a 
                      href={`https://www.aidedd.org/dnd/monstres.php?vf=${encodeURIComponent(monster.name.toLowerCase())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {monster.name}
                    </a>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{monster.type}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{monster.size}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{monster.xp}</td>
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