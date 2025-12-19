import React from 'react';
import { Party, EncounterMonster } from '../../lib/types';

interface StatSummaryProps {
    totalXP: number;
    adjustedXP: number;
    xpPerPlayer: number;
    difficulty: string;
    difficultyColor: string;
    selectedMonsters: EncounterMonster[];
    selectedParty: Party | null;
}

const StatSummary: React.FC<StatSummaryProps> = ({
    totalXP,
    adjustedXP,
    xpPerPlayer,
    difficulty,
    difficultyColor,
    selectedMonsters,
    selectedParty
}) => {
    if (!selectedParty || selectedMonsters.length === 0) {
        return null;
    }

    const monsterCount = selectedMonsters.reduce((sum, { quantity }) => sum + quantity, 0);
    const multiplier = totalXP > 0 ? (adjustedXP / totalXP).toFixed(1) : '1.0';

    return (
        <div className="glass-card border border-primary/20 bg-primary/5 p-4 rounded-xl mb-6">
            <h3 className="text-lg font-medium font-cinzel mb-2">Résumé de la rencontre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p>XP total: <span className="font-medium">{totalXP}</span></p>
                    <p>XP ajusté: <span className="font-medium">{adjustedXP}</span></p>
                    <p>XP par joueur: <span className="font-medium">{xpPerPlayer}</span></p>
                </div>
                <div>
                    <p>
                        Difficulté: {difficulty && (
                            <span className={`font-medium ${difficultyColor}`}>
                                {difficulty === 'trivial' ? 'Trivial' :
                                    difficulty === 'easy' ? 'Facile' :
                                        difficulty === 'medium' ? 'Moyen' :
                                            difficulty === 'hard' ? 'Difficile' : 'Mortel'}
                            </span>
                        )}
                    </p>
                    <p>Nombre de monstres: <span className="font-medium">
                        {monsterCount}
                    </span></p>
                    <p>Multiplicateur: <span className="font-medium">
                        {multiplier}
                    </span></p>
                </div>
            </div>

            {/* Statistiques des joueurs */}
            {selectedParty.players.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-md font-medium mb-2">Personnages</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-2 py-1 text-left">Nom</th>
                                    <th className="px-2 py-1 text-left">Classe</th>
                                    <th className="px-2 py-1 text-left">Niveau</th>
                                    <th className="px-2 py-1 text-left">CA</th>
                                    <th className="px-2 py-1 text-left">PV</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedParty.players.map(player => (
                                    <tr key={player.id}>
                                        <td className="px-2 py-1">{player.name}</td>
                                        <td className="px-2 py-1">{player.characterClass}</td>
                                        <td className="px-2 py-1">{player.level}</td>
                                        <td className="px-2 py-1">{player.ac || '-'}</td>
                                        <td className="px-2 py-1">
                                            {player.currentHp !== undefined && player.maxHp !== undefined
                                                ? `${player.currentHp}/${player.maxHp}`
                                                : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatSummary;
