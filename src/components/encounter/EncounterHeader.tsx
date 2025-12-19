import React from 'react';
import { Party, environments } from '../../lib/types';

interface EncounterHeaderProps {
    isEditing: boolean;
    encounterName: string;
    setEncounterName: (name: string) => void;
    selectedParty: Party | null;
    setSelectedParty: (party: Party | null) => void;
    parties: Party[];
    selectedEnvironment: string;
    setSelectedEnvironment: (env: string) => void;
}

const EncounterHeader: React.FC<EncounterHeaderProps> = ({
    isEditing,
    encounterName,
    setEncounterName,
    selectedParty,
    setSelectedParty,
    parties,
    selectedEnvironment,
    setSelectedEnvironment
}) => {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
                {isEditing ? "Modifier la rencontre" : "Créer une rencontre"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-bold font-cinzel text-foreground mb-1">Nom de la rencontre</label>
                    <input
                        type="text"
                        value={encounterName}
                        onChange={e => setEncounterName(e.target.value)}
                        className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-glass-border/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                        placeholder="Ex: Embuscade gobeline"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold font-cinzel text-foreground mb-1">Groupe de joueurs</label>
                    <select
                        value={selectedParty?.id || ''}
                        onChange={e => {
                            const party = parties.find(p => p.id === e.target.value);
                            setSelectedParty(party || null);
                        }}
                        className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-glass-border/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
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
                <label className="block text-sm font-bold font-cinzel text-foreground mb-1">Environnement (optionnel)</label>
                <select
                    value={selectedEnvironment}
                    onChange={e => setSelectedEnvironment(e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-glass-border/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                >
                    <option value="">Aucun environnement spécifique</option>
                    {environments.filter(env => env.value !== 'all').map(env => (
                        <option key={env.value} value={env.value}>
                            {env.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default EncounterHeader;
