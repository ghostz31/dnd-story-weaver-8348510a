import React, { useState, useEffect } from 'react';
import { getParties, createEncounter, getEncounters, updateEncounter, deleteEncounter } from '../lib/api';
import { Monster, Party, Encounter, EncounterMonster, environments } from '../lib/types';
import MonsterBrowser from './MonsterBrowser';
import { FaPlus, FaMinus, FaTrash, FaSave, FaEdit } from 'react-icons/fa';

const EncounterBuilder: React.FC = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);
  const [selectedMonsters, setSelectedMonsters] = useState<EncounterMonster[]>([]);
  const [encounterName, setEncounterName] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showMonsterBrowser, setShowMonsterBrowser] = useState(false);

  // Charger les données au démarrage
  useEffect(() => {
    const loadData = () => {
      const loadedParties = getParties();
      const loadedEncounters = getEncounters();
      setParties(loadedParties);
      setEncounters(loadedEncounters);
    };
    
    loadData();
  }, []);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedParty(null);
    setSelectedEncounter(null);
    setSelectedMonsters([]);
    setEncounterName('');
    setSelectedEnvironment('');
    setIsEditing(false);
  };

  // Sélectionner une rencontre existante
  const handleSelectEncounter = (encounter: Encounter) => {
    setSelectedEncounter(encounter);
    setSelectedParty(encounter.party);
    setSelectedMonsters([...encounter.monsters]);
    setEncounterName(encounter.name);
    setSelectedEnvironment(encounter.environment || '');
    setIsEditing(true);
  };

  // Ajouter un monstre à la rencontre
  const handleAddMonster = (monster: Monster) => {
    // Vérifier si le monstre est déjà dans la liste
    const existingIndex = selectedMonsters.findIndex(m => m.monster.id === monster.id);
    
    if (existingIndex >= 0) {
      // Incrémenter la quantité
      const updatedMonsters = [...selectedMonsters];
      updatedMonsters[existingIndex] = {
        ...updatedMonsters[existingIndex],
        quantity: updatedMonsters[existingIndex].quantity + 1
      };
      setSelectedMonsters(updatedMonsters);
    } else {
      // Ajouter un nouveau monstre
      setSelectedMonsters([...selectedMonsters, { monster, quantity: 1 }]);
    }
    
    setShowMonsterBrowser(false);
  };

  // Mettre à jour la quantité d'un monstre
  const handleUpdateMonsterQuantity = (monsterId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Supprimer le monstre si la quantité est 0 ou moins
      setSelectedMonsters(selectedMonsters.filter(m => m.monster.id !== monsterId));
    } else {
      // Mettre à jour la quantité
      setSelectedMonsters(
        selectedMonsters.map(m =>
          m.monster.id === monsterId ? { ...m, quantity: newQuantity } : m
        )
      );
    }
  };

  // Supprimer un monstre de la rencontre
  const handleRemoveMonster = (monsterId: string) => {
    setSelectedMonsters(selectedMonsters.filter(m => m.monster.id !== monsterId));
  };

  // Sauvegarder la rencontre
  const handleSaveEncounter = () => {
    if (!selectedParty || !encounterName.trim() || selectedMonsters.length === 0) {
      alert("Veuillez remplir tous les champs obligatoires (nom, groupe et au moins un monstre).");
      return;
    }

    if (isEditing && selectedEncounter) {
      // Mettre à jour une rencontre existante
      const updatedEncounter = updateEncounter(selectedEncounter.id, {
        name: encounterName,
        party: selectedParty,
        monsters: selectedMonsters,
        environment: selectedEnvironment || undefined
      });

      if (updatedEncounter) {
        setEncounters(encounters.map(e => e.id === updatedEncounter.id ? updatedEncounter : e));
        setSelectedEncounter(updatedEncounter);
      }
    } else {
      // Créer une nouvelle rencontre
      const newEncounter = createEncounter(
        encounterName,
        selectedParty,
        selectedMonsters,
        selectedEnvironment || undefined
      );

      setEncounters([...encounters, newEncounter]);
      setSelectedEncounter(newEncounter);
      setIsEditing(true);
    }
  };

  // Supprimer une rencontre
  const handleDeleteEncounter = (encounterId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette rencontre ?")) {
      const success = deleteEncounter(encounterId);
      if (success) {
        setEncounters(encounters.filter(e => e.id !== encounterId));
        if (selectedEncounter && selectedEncounter.id === encounterId) {
          resetForm();
        }
      }
    }
  };

  // Nouvelle rencontre
  const handleNewEncounter = () => {
    resetForm();
  };

  // Calculer le total d'XP et l'XP ajusté
  const calculateTotalXP = () => {
    const totalXP = selectedMonsters.reduce(
      (sum, { monster, quantity }) => sum + monster.xp * quantity,
      0
    );
    
    // Calculer le nombre total de monstres
    const monsterCount = selectedMonsters.reduce(
      (sum, { quantity }) => sum + quantity,
      0
    );
    
    // Déterminer le multiplicateur
    let multiplier = 1;
    if (selectedParty) {
      const playerCount = selectedParty.players.length;
      
      if (monsterCount === 1) {
        multiplier = 1;
      } else if (monsterCount === 2) {
        multiplier = 1.5;
      } else if (monsterCount >= 3 && monsterCount <= 6) {
        multiplier = 2;
      } else if (monsterCount >= 7 && monsterCount <= 10) {
        multiplier = 2.5;
      } else if (monsterCount >= 11 && monsterCount <= 14) {
        multiplier = 3;
      } else if (monsterCount >= 15) {
        multiplier = 4;
      }
    }
    
    const adjustedXP = Math.floor(totalXP * multiplier);
    
    return { totalXP, adjustedXP };
  };

  // Déterminer la difficulté de la rencontre
  const getDifficulty = () => {
    if (!selectedParty || selectedMonsters.length === 0) {
      return null;
    }
    
    const { adjustedXP } = calculateTotalXP();
    
    // Calculer les seuils de difficulté pour le groupe
    const thresholds = {
      easy: 0,
      medium: 0,
      hard: 0,
      deadly: 0
    };
    
    // Seuils de difficulté par niveau (DMG)
    const xpThresholds: Record<number, Record<string, number>> = {
      1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
      2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
      3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
      4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
      5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
      6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
      7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
      8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
      9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
      10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
      11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
      12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
      13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
      14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
      15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
      16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
      17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
      18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
      19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
      20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
    };
    
    // Additionner les seuils pour chaque joueur
    selectedParty.players.forEach(player => {
      const level = Math.min(player.level, 20);
      thresholds.easy += xpThresholds[level].easy;
      thresholds.medium += xpThresholds[level].medium;
      thresholds.hard += xpThresholds[level].hard;
      thresholds.deadly += xpThresholds[level].deadly;
    });
    
    // Déterminer la difficulté
    if (adjustedXP >= thresholds.deadly) {
      return { level: 'deadly', color: 'text-red-600' };
    } else if (adjustedXP >= thresholds.hard) {
      return { level: 'hard', color: 'text-orange-500' };
    } else if (adjustedXP >= thresholds.medium) {
      return { level: 'medium', color: 'text-yellow-500' };
    } else if (adjustedXP >= thresholds.easy) {
      return { level: 'easy', color: 'text-green-500' };
    } else {
      return { level: 'trivial', color: 'text-gray-500' };
    }
  };

  // Calculer l'XP par joueur
  const getXPPerPlayer = () => {
    if (!selectedParty || selectedParty.players.length === 0) return 0;
    
    const { totalXP } = calculateTotalXP();
    return Math.floor(totalXP / selectedParty.players.length);
  };

  const difficulty = getDifficulty();
  const { totalXP, adjustedXP } = calculateTotalXP();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Liste des rencontres */}
      <div className="md:col-span-1 bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Rencontres</h2>
          <button
            onClick={handleNewEncounter}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Nouvelle
          </button>
        </div>
        
        {encounters.length === 0 ? (
          <p className="text-gray-500">Aucune rencontre créée. Créez votre première rencontre !</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {encounters.map(encounter => (
              <li
                key={encounter.id}
                className={`py-2 px-2 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${
                  selectedEncounter?.id === encounter.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelectEncounter(encounter)}
              >
                <div>
                  <span className="font-medium">{encounter.name}</span>
                  <div className="text-sm text-gray-500">
                    Groupe: {encounter.party.name} • 
                    Difficulté: <span className={encounter.difficulty === 'deadly' ? 'text-red-600' : 
                                       encounter.difficulty === 'hard' ? 'text-orange-500' :
                                       encounter.difficulty === 'medium' ? 'text-yellow-500' : 'text-green-500'}>
                      {encounter.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEncounter(encounter.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Formulaire de création/édition */}
      <div className="md:col-span-2 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {isEditing ? "Modifier la rencontre" : "Créer une rencontre"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la rencontre</label>
            <input
              type="text"
              value={encounterName}
              onChange={e => setEncounterName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Embuscade gobeline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Groupe de joueurs</label>
            <select
              value={selectedParty?.id || ''}
              onChange={e => {
                const party = parties.find(p => p.id === e.target.value);
                setSelectedParty(party || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un groupe</option>
              {parties.map(party => (
                <option key={party.id} value={party.id}>
                  {party.name} ({party.players.length} joueurs, niv. {
                    party.players.length > 0
                      ? Math.round(party.players.reduce((sum, p) => sum + p.level, 0) / party.players.length)
                      : '?'
                  })
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Environnement (optionnel)</label>
          <select
            value={selectedEnvironment}
            onChange={e => setSelectedEnvironment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Aucun environnement spécifique</option>
            {environments.filter(env => env.value !== 'all').map(env => (
              <option key={env.value} value={env.value}>
                {env.label}
              </option>
            ))}
          </select>
        </div>

        {/* Monstres sélectionnés */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Monstres</h3>
            <button
              onClick={() => setShowMonsterBrowser(true)}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <FaPlus className="mr-1" /> Ajouter
            </button>
          </div>

          {selectedMonsters.length === 0 ? (
            <p className="text-gray-500">Aucun monstre ajouté. Cliquez sur "Ajouter" pour sélectionner des monstres.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedMonsters.map(({ monster, quantity }) => (
                  <tr key={monster.id}>
                    <td className="px-3 py-2 whitespace-nowrap">{monster.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{monster.cr}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{monster.xp}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleUpdateMonsterQuantity(monster.id, quantity - 1)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FaMinus />
                        </button>
                        <span className="mx-2">{quantity}</span>
                        <button
                          onClick={() => handleUpdateMonsterQuantity(monster.id, quantity + 1)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={() => handleRemoveMonster(monster.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Résumé de la rencontre */}
        {selectedParty && selectedMonsters.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="text-lg font-medium mb-2">Résumé de la rencontre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>XP total: <span className="font-medium">{totalXP}</span></p>
                <p>XP ajusté: <span className="font-medium">{adjustedXP}</span></p>
                <p>XP par joueur: <span className="font-medium">{getXPPerPlayer()}</span></p>
              </div>
              <div>
                <p>
                  Difficulté: {difficulty && (
                    <span className={`font-medium ${difficulty.color}`}>
                      {difficulty.level.charAt(0).toUpperCase() + difficulty.level.slice(1)}
                    </span>
                  )}
                </p>
                <p>Nombre de monstres: <span className="font-medium">
                  {selectedMonsters.reduce((sum, { quantity }) => sum + quantity, 0)}
                </span></p>
                <p>Multiplicateur: <span className="font-medium">
                  {selectedMonsters.length > 0 ? (adjustedXP / totalXP).toFixed(1) : '1.0'}
                </span></p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSaveEncounter}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            disabled={!selectedParty || !encounterName.trim() || selectedMonsters.length === 0}
          >
            {isEditing ? <FaEdit className="mr-1" /> : <FaSave className="mr-1" />}
            {isEditing ? "Mettre à jour" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Modal pour sélectionner des monstres */}
      {showMonsterBrowser && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowMonsterBrowser(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Sélectionner un monstre</h2>
                  <button
                    onClick={() => setShowMonsterBrowser(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <MonsterBrowser onSelectMonster={handleAddMonster} isSelectable={true} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncounterBuilder; 