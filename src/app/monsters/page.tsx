"use client";

import React, { useState, useEffect } from 'react';
import { Monster } from '@/lib/types';
import { loadMonstersIndex } from '@/lib/api';
import { Search, Filter, ChevronDown, ChevronUp, RefreshCw, X } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Options de filtres basées sur AideDD
const monsterCategories = [
  { value: 'all', label: 'Toutes' },
  { value: 'Monstres', label: 'Monstres' },
  { value: 'Animaux', label: 'Animaux' },
  { value: 'PNJ', label: 'PNJ' }
];

const monsterTypes = [
  { value: 'all', label: 'Tous' },
  { value: 'Humanoïde', label: 'Humanoïde' },
  { value: 'Aberration', label: 'Aberration' },
  { value: 'Artificiel', label: 'Artificiel' },
  { value: 'Bête', label: 'Bête' },
  { value: 'Céleste', label: 'Céleste' },
  { value: 'Dragon', label: 'Dragon' },
  { value: 'Élémentaire', label: 'Élémentaire' },
  { value: 'Fée', label: 'Fée' },
  { value: 'Fiélon', label: 'Fiélon' },
  { value: 'Géant', label: 'Géant' },
  { value: 'Monstruosité', label: 'Monstruosité' },
  { value: 'Mort-vivant', label: 'Mort-vivant' },
  { value: 'Plante', label: 'Plante' },
  { value: 'Vase', label: 'Vase' }
];

const monsterSizes = [
  { value: 'all', label: 'Toutes' },
  { value: 'TP', label: 'TP' },
  { value: 'P', label: 'P' },
  { value: 'M', label: 'M' },
  { value: 'G', label: 'G' },
  { value: 'TG', label: 'TG' },
  { value: 'Gig', label: 'Gig' }
];

// Valeurs de FP disponibles
const crValues = [
  { value: 'all', label: 'Tous' },
  { value: '0', label: '0' },
  { value: '1/8', label: '1/8' },
  { value: '1/4', label: '1/4' },
  { value: '1/2', label: '1/2' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: '10', label: '10' },
  { value: '11', label: '11' },
  { value: '12', label: '12' },
  { value: '13', label: '13' },
  { value: '14', label: '14' },
  { value: '15', label: '15' },
  { value: '16', label: '16' },
  { value: '17', label: '17' },
  { value: '18', label: '18' },
  { value: '19', label: '19' },
  { value: '20', label: '20' },
  { value: '21', label: '21' },
  { value: '22', label: '22' },
  { value: '23', label: '23' },
  { value: '24', label: '24' },
  { value: '25', label: '25' },
  { value: '26', label: '26' },
  { value: '27', label: '27' },
  { value: '28', label: '28' },
  { value: '29', label: '29' },
  { value: '30', label: '30' }
];

// Fonction pour générer l'URL AideDD à partir du nom de monstre
const getAideDDUrl = (monsterName: string): string => {
  const slug = monsterName.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/ /g, '-')              // Remplacer les espaces par des tirets
    .replace(/[^a-z0-9-]/g, '');     // Supprimer les caractères non alphanumériques

  return `https://www.aidedd.org/dnd/monstres.php?vf=${slug}`;
};

// Fonction pour calculer l'XP à partir du CR
const calculateXPFromCR = (cr: number | string): number => {
  const crNum = typeof cr === 'string' ? parseFloat(cr) : cr;
  const xpTable: Record<number, number> = {
    0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
    1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
    6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
    11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
    16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000,
    21: 33000, 22: 41000, 23: 50000, 24: 62000, 25: 75000,
    26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000
  };
  return xpTable[crNum] || 0;
};

export default function MonstersPage() {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [filteredMonsters, setFilteredMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(false);

  // États des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [minCR, setMinCR] = useState('all');
  const [maxCR, setMaxCR] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // État de l'iframe
  const [selectedMonsterUrl, setSelectedMonsterUrl] = useState<string | null>(null);
  const [selectedMonsterName, setSelectedMonsterName] = useState<string>('');

  // Charger les monstres au démarrage
  useEffect(() => {
    loadMonsters();
  }, []);

  const loadMonsters = async () => {
    setLoading(true);
    try {
      console.log("Chargement des monstres depuis l'index...");

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
        toast({
          title: "Succès",
          description: `${formattedMonsters.length} monstres chargés avec succès`,
          variant: "default"
        });
      } else {
        throw new Error("Aucun monstre trouvé dans l'index");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des monstres:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les monstres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  useEffect(() => {
    let filtered = monsters;

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(monster =>
        monster.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(monster => {
        if (selectedCategory === 'Animaux') {
          return monster.type === 'Bête';
        } else if (selectedCategory === 'PNJ') {
          return monster.type === 'Humanoïde';
        } else if (selectedCategory === 'Monstres') {
          return monster.type !== 'Bête' && monster.type !== 'Humanoïde';
        }
        return true;
      });
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(monster => monster.type === selectedType);
    }

    // Filtre par taille
    if (selectedSize !== 'all') {
      filtered = filtered.filter(monster => monster.size === selectedSize);
    }

    // Filtre par CR min
    if (minCR !== 'all') {
      const minCRValue = minCR === '1/8' ? 0.125 : minCR === '1/4' ? 0.25 : minCR === '1/2' ? 0.5 : parseFloat(minCR);
      filtered = filtered.filter(monster => monster.cr >= minCRValue);
    }

    // Filtre par CR max
    if (maxCR !== 'all') {
      const maxCRValue = maxCR === '1/8' ? 0.125 : maxCR === '1/4' ? 0.25 : maxCR === '1/2' ? 0.5 : parseFloat(maxCR);
      filtered = filtered.filter(monster => monster.cr <= maxCRValue);
    }

    setFilteredMonsters(filtered);
  }, [monsters, searchQuery, selectedCategory, selectedType, selectedSize, minCR, maxCR]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedSize('all');
    setMinCR('all');
    setMaxCR('all');
  };

  const handleMonsterClick = (monster: Monster) => {
    const url = getAideDDUrl(monster.name);
    setSelectedMonsterUrl(url);
    setSelectedMonsterName(monster.name);
  };

  const closeIframe = () => {
    setSelectedMonsterUrl(null);
    setSelectedMonsterName('');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Bibliothèque de Monstres</h1>

      {/* Barre de recherche et contrôles */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <div className="relative w-full sm:w-1/2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un monstre..."
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            <Filter className="text-gray-700" />
            {showFilters ? "Masquer" : "Filtres"}
            {showFilters ? <ChevronUp className="text-gray-700" /> : <ChevronDown className="text-gray-700" />}
          </button>

          <button
            onClick={loadMonsters}
            className={`flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            <RefreshCw className={`${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {monsterCategories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {monsterTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {monsterSizes.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FP Min</label>
              <select
                value={minCR}
                onChange={(e) => setMinCR(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {crValues.map(cr => (
                  <option key={cr.value} value={cr.value}>{cr.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FP Max</label>
              <select
                value={maxCR}
                onChange={(e) => setMaxCR(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {crValues.map(cr => (
                  <option key={cr.value} value={cr.value}>{cr.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 w-full"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout principal avec liste et iframe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des monstres */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              Monstres ({filteredMonsters.length})
            </h2>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              </div>
            ) : filteredMonsters.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMonsters.map((monster) => (
                    <tr
                      key={monster.id}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleMonsterClick(monster)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full overflow-hidden">
                            {monster.image ? (
                              <img
                                src={`/data/aidedd-complete/images/${monster.image}`}
                                alt={monster.name}
                                className="h-8 w-8 object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = '/images/placeholders/dnd-logo.svg';
                                }}
                              />
                            ) : (
                              <div className="h-8 w-8 flex items-center justify-center text-gray-500">
                                <ImageIcon size={16} />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{monster.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{monster.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{monster.size}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{monster.cr}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun monstre trouvé. Essayez de modifier vos critères de recherche.
              </div>
            )}
          </div>
        </div>

        {/* Iframe pour les détails */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-2 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {selectedMonsterName ? `Détails - ${selectedMonsterName}` : 'Détails du monstre'}
            </h2>
            {selectedMonsterUrl && (
              <button
                onClick={closeIframe}
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Fermer"
              >
                <X />
              </button>
            )}
          </div>

          <div style={{ height: 'calc(100vh - 200px)', padding: '15px' }}>
            {selectedMonsterUrl ? (
              <iframe
                src={selectedMonsterUrl}
                className="w-full h-full border-0 rounded"
                title={`Détails de ${selectedMonsterName}`}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Cliquez sur un monstre pour voir ses détails</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}