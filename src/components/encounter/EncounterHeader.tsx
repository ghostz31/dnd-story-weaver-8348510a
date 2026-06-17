import React from 'react';
import { Party, environments } from '../../lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
                <div className="space-y-1.5">
                    <Label htmlFor="encounter-name" className="text-sm font-bold font-cinzel">Nom de la rencontre</Label>
                    <Input
                        id="encounter-name"
                        type="text"
                        value={encounterName}
                        onChange={e => setEncounterName(e.target.value)}
                        placeholder="Ex: Embuscade gobeline"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-bold font-cinzel">Groupe de joueurs</Label>
                    <Select
                        value={selectedParty?.id || ''}
                        onValueChange={value => {
                            const party = parties.find(p => p.id === value);
                            setSelectedParty(party || null);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un groupe" />
                        </SelectTrigger>
                        <SelectContent>
                            {parties.map(party => (
                                <SelectItem key={party.id} value={party.id}>
                                    {party.name} ({party.players.length} joueurs, niv. {
                                        party.players.length > 0
                                            ? Math.round(party.players.reduce((sum, p) => sum + p.level, 0) / party.players.length)
                                            : '?'
                                    })
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-bold font-cinzel">Environnement (optionnel)</Label>
                <Select
                    value={selectedEnvironment}
                    onValueChange={value => setSelectedEnvironment(value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Aucun environnement spécifique" />
                    </SelectTrigger>
                    <SelectContent>
                        {environments.filter(env => env.value !== 'all').map(env => (
                            <SelectItem key={env.value} value={env.value}>
                                {env.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default EncounterHeader;
