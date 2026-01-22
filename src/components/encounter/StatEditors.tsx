import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- Types ---
interface HpData {
    id: string;
    name: string;
    currentHp: number;
    maxHp: number;
    tempHp?: number;
}

interface InitiativeData {
    id: string;
    name: string;
    initiative: number;
    modifier: number;
}

interface NotesData {
    id: string;
    name: string;
    notes: string;
}

// --- Components ---

export const HpEditor: React.FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: HpData;
    onDataChange: (data: HpData) => void;
    onSave: () => void;
}> = ({ open, onOpenChange, data, onDataChange, onSave }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier les points de vie</DialogTitle>
                    <DialogDescription>
                        Ajustez les points de vie actuels et maximum de {data.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="currentHp" className="text-right">
                            PV actuels
                        </Label>
                        <Input
                            id="currentHp"
                            type="number"
                            value={data.currentHp}
                            onChange={(e) => onDataChange({ ...data, currentHp: parseInt(e.target.value, 10) || 0 })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maxHp" className="text-right">
                            PV maximum
                        </Label>
                        <Input
                            id="maxHp"
                            type="number"
                            value={data.maxHp}
                            onChange={(e) => onDataChange({ ...data, maxHp: parseInt(e.target.value, 10) || 0 })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tempHp" className="text-right">
                            PV Temporaires
                        </Label>
                        <Input
                            id="tempHp"
                            type="number"
                            value={data.tempHp || 0}
                            onChange={(e) => onDataChange({ ...data, tempHp: parseInt(e.target.value, 10) || 0 })}
                            className="col-span-3 border-blue-200"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onSave}>Sauvegarder</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const InitiativeEditor: React.FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: InitiativeData;
    onDataChange: (data: InitiativeData) => void;
    onSave: () => void;
}> = ({ open, onOpenChange, data, onDataChange, onSave }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier l'initiative</DialogTitle>
                    <DialogDescription>
                        Modifiez l'initiative de {data.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="initiative" className="text-right">
                            Initiative
                        </Label>
                        <Input
                            id="initiative"
                            type="number"
                            value={data.initiative}
                            onChange={(e) => onDataChange({
                                ...data,
                                initiative: parseInt(e.target.value) || 0
                            })}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="modifier" className="text-right">
                            Modificateur
                        </Label>
                        <Input
                            id="modifier"
                            type="number"
                            value={data.modifier}
                            onChange={(e) => onDataChange({
                                ...data,
                                modifier: parseInt(e.target.value) || 0
                            })}
                            className="col-span-3"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={onSave}>
                        Sauvegarder
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const NotesEditor: React.FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: NotesData;
    onDataChange: (data: NotesData) => void;
    onSave: () => void;
}> = ({ open, onOpenChange, data, onDataChange, onSave }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier les notes</DialogTitle>
                    <DialogDescription>
                        Modifiez les notes de {data.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                            Notes
                        </Label>
                        <textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => onDataChange({
                                ...data,
                                notes: e.target.value
                            })}
                            className="col-span-3 min-h-[100px] p-2 border rounded-md"
                            placeholder="Ajoutez des notes sur ce participant..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={onSave}>
                        Sauvegarder
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
