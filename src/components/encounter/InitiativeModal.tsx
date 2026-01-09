import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dices, Shield, Skull, User as UserIcon } from "lucide-react";
import { calculateModifier } from '../../lib/EncounterUtils';

export interface InitiativeParticipant {
    id: string;
    name: string;
    isPC: boolean;
    initiative: number;
    dex: number;
    ac?: number;
    hp?: number;
    image?: string;
}

interface InitiativeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    participants: InitiativeParticipant[];
    onConfirm: (participants: InitiativeParticipant[]) => void;
}

const InitiativeModal: React.FC<InitiativeModalProps> = ({
    open,
    onOpenChange,
    participants: initialParticipants,
    onConfirm
}) => {
    const [localParticipants, setLocalParticipants] = useState<InitiativeParticipant[]>([]);

    useEffect(() => {
        if (open) {
            // Initialize with provided participants
            // If initiative is already set (e.g. not 0), keep it. 
            // Otherwise set to 0 to indicate it needs rolling/input, or keep what was passed if logic requires.
            setLocalParticipants(initialParticipants.map(p => ({
                ...p,
                initiative: p.initiative || 0
            })));
        }
    }, [open, initialParticipants]);

    const handleInitiativeChange = (id: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setLocalParticipants(prev => prev.map(p =>
            p.id === id ? { ...p, initiative: numValue } : p
        ));
    };

    const rollInitiative = (id: string) => {
        setLocalParticipants(prev => prev.map(p => {
            if (p.id === id) {
                const roll = Math.floor(Math.random() * 20) + 1;
                const mod = calculateModifier(p.dex);
                return { ...p, initiative: roll + mod };
            }
            return p;
        }));
    };

    const rollAll = () => {
        setLocalParticipants(prev => prev.map(p => {
            const roll = Math.floor(Math.random() * 20) + 1;
            const mod = calculateModifier(p.dex);
            return { ...p, initiative: roll + mod };
        }));
    };

    const rollNPCs = () => {
        setLocalParticipants(prev => prev.map(p => {
            if (!p.isPC) {
                const roll = Math.floor(Math.random() * 20) + 1;
                const mod = calculateModifier(p.dex);
                return { ...p, initiative: roll + mod };
            }
            return p;
        }));
    }

    const handleConfirm = () => {
        console.log("[InitiativeModal] Combat button clicked, calling onConfirm with:", localParticipants);
        onConfirm(localParticipants);
    };

    const players = localParticipants.filter(p => p.isPC);
    const monsters = localParticipants.filter(p => !p.isPC);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-cinzel">
                        <Dices className="h-6 w-6" />
                        Initiative
                    </DialogTitle>
                    <DialogDescription>
                        Définissez l'ordre du tour avant de commencer le combat.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                    <Button onClick={rollAll} variant="outline" size="sm" className="flex-1">
                        <Dices className="mr-2 h-4 w-4" /> Tout lancer
                    </Button>
                    <Button onClick={rollNPCs} variant="outline" size="sm" className="flex-1">
                        <Skull className="mr-2 h-4 w-4" /> Lancer Monstres
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* JOUEURS */}
                    {players.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold flex items-center text-blue-700 border-b pb-1">
                                <UserIcon className="mr-2 h-4 w-4" /> Aventuriers
                            </h3>
                            {players.map(p => (
                                <div key={p.id} className="grid grid-cols-12 gap-2 items-center bg-blue-50/50 p-2 rounded-md">
                                    <div className="col-span-6 font-medium truncate" title={p.name}>{p.name}</div>
                                    <div className="col-span-2 text-xs text-center text-muted-foreground">
                                        Dex: {p.dex} ({calculateModifier(p.dex) >= 0 ? '+' : ''}{calculateModifier(p.dex)})
                                    </div>
                                    <div className="col-span-4 flex gap-1">
                                        <Input
                                            type="number"
                                            value={p.initiative}
                                            onChange={(e) => handleInitiativeChange(p.id, e.target.value)}
                                            className="h-8 text-center font-bold"
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => rollInitiative(p.id)} title="Lancer pour ce joueur">
                                            <Dices className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* MONSTRES */}
                    {monsters.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold flex items-center text-red-700 border-b pb-1">
                                <Skull className="mr-2 h-4 w-4" /> Adversaires
                            </h3>
                            {monsters.map(p => (
                                <div key={p.id} className="grid grid-cols-12 gap-2 items-center bg-red-50/50 p-2 rounded-md">
                                    <div className="col-span-6 font-medium truncate flex items-center gap-2">
                                        {p.image && <img src={p.image} className="w-6 h-6 rounded-full object-cover" />}
                                        <span title={p.name}>{p.name}</span>
                                    </div>
                                    <div className="col-span-2 text-xs text-center text-muted-foreground">
                                        Dex: {p.dex} ({calculateModifier(p.dex) >= 0 ? '+' : ''}{calculateModifier(p.dex)})
                                    </div>
                                    <div className="col-span-4 flex gap-1">
                                        <Input
                                            type="number"
                                            value={p.initiative}
                                            onChange={(e) => handleInitiativeChange(p.id, e.target.value)}
                                            className="h-8 text-center font-bold"
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => rollInitiative(p.id)} title="Lancer pour ce monstre">
                                            <Dices className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white">
                        Combat !
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InitiativeModal;
