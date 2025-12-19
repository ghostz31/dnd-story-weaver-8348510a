import React from 'react';
import { EncounterMonster } from '../../lib/types';
import { Button } from "@/components/ui/button";
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

interface ParticipantListProps {
    selectedMonsters: EncounterMonster[];
    setSelectedMonsters: (monsters: EncounterMonster[]) => void;
    onAddMonster: () => void;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
    selectedMonsters,
    setSelectedMonsters,
    onAddMonster
}) => {
    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium font-cinzel">Monstres</h3>
                <Button
                    onClick={onAddMonster}
                    size="sm"
                    className="flex items-center"
                >
                    <FaPlus className="mr-1" /> Ajouter
                </Button>
            </div>

            {selectedMonsters.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-glass-border/30 rounded-xl bg-glass/10 backdrop-blur-sm">
                    <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        <FaPlus className="w-6 h-6 text-primary/60" />
                    </div>
                    <p className="text-lg font-medium text-foreground/80 mb-1">La scène est vide</p>
                    <p className="text-sm text-muted-foreground">Ajoutez des monstres pour commencer l'engrenage du combat.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-glass-border/30 bg-glass/20 backdrop-blur-md shadow-sm">
                    <table className="min-w-full divide-y divide-glass-border/20">
                        <thead className="bg-primary/5">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-bold font-cinzel text-primary/80 uppercase tracking-wider">Nom</th>
                                <th className="px-5 py-4 text-left text-xs font-bold font-cinzel text-primary/80 uppercase tracking-wider">FP</th>
                                <th className="px-5 py-4 text-left text-xs font-bold font-cinzel text-primary/80 uppercase tracking-wider">XP</th>
                                <th className="px-5 py-4 text-left text-xs font-bold font-cinzel text-primary/80 uppercase tracking-wider">Quantité</th>
                                <th className="px-5 py-4 text-left text-xs font-bold font-cinzel text-primary/80 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border/10 bg-transparent">
                            {selectedMonsters.map(({ monster, quantity }) => (
                                <tr key={monster.id} className="hover:bg-primary/5 transition-colors duration-200">
                                    <td className="px-5 py-4 whitespace-nowrap font-medium text-foreground">{monster.name}</td>
                                    <td className="px-5 py-4 whitespace-nowrap text-muted-foreground font-cinzel text-sm">{monster.cr}</td>
                                    <td className="px-5 py-4 whitespace-nowrap text-muted-foreground text-sm">{monster.xp}</td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 bg-glass/30 rounded-md p-1 w-fit border border-glass-border/20">
                                            <button
                                                onClick={() => {
                                                    if (quantity > 1) {
                                                        setSelectedMonsters(
                                                            selectedMonsters.map(m =>
                                                                m.monster.id === monster.id ? { ...m, quantity: m.quantity - 1 } : m
                                                            )
                                                        );
                                                    } else {
                                                        setSelectedMonsters(selectedMonsters.filter(m => m.monster.id !== monster.id));
                                                    }
                                                }}
                                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/50 text-foreground/70 transition-colors"
                                            >
                                                <FaMinus className="w-3 h-3" />
                                            </button>
                                            <span className="w-6 text-center font-medium tabular-nums">{quantity}</span>
                                            <button
                                                onClick={() => {
                                                    setSelectedMonsters(
                                                        selectedMonsters.map(m =>
                                                            m.monster.id === monster.id ? { ...m, quantity: m.quantity + 1 } : m
                                                        )
                                                    );
                                                }}
                                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/50 text-foreground/70 transition-colors"
                                            >
                                                <FaPlus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => {
                                                setSelectedMonsters(selectedMonsters.filter(m => m.monster.id !== monster.id));
                                            }}
                                            className="text-muted-foreground hover:text-destructive transition-colors p-2 hover:bg-destructive/10 rounded-full"
                                            title="Supprimer"
                                        >
                                            <FaTrash className="w-4 h-4" />
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

export default ParticipantList;
