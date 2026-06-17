import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus } from 'lucide-react';
import { Party } from '@/lib/types';

interface PartySelectorProps {
  parties: Party[];
  selectedParty: Party | null;
  onSelectParty: (party: Party) => void;
  isPartyDialogOpen: boolean;
  onPartyDialogOpenChange: (open: boolean) => void;
  newPartyName: string;
  onNewPartyNameChange: (name: string) => void;
  isEditingParty: boolean;
  canCreate: boolean;
  onNewPartyClick: () => void;
  onPartyDialogSubmit: () => void;
  onPartyDialogCancel: () => void;
}

const PartySelector: React.FC<PartySelectorProps> = ({
  parties,
  selectedParty,
  onSelectParty,
  isPartyDialogOpen,
  onPartyDialogOpenChange,
  newPartyName,
  onNewPartyNameChange,
  isEditingParty,
  canCreate,
  onNewPartyClick,
  onPartyDialogSubmit,
  onPartyDialogCancel,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mb-2">
      {parties.map(party => (
        <Button
          key={party.id}
          variant={selectedParty?.id === party.id ? "default" : "outline"}
          className="flex items-center whitespace-nowrap flex-shrink-0 touch-target"
          onClick={() => onSelectParty(party)}
        >
          <Users className="mr-1.5 h-4 w-4" />
          <span className="max-w-[120px] truncate">{party.name}</span>
          <span className="ml-1.5 text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">
            {party.players.length}
          </span>
        </Button>
      ))}

      <Dialog open={isPartyDialogOpen} onOpenChange={onPartyDialogOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="border-dashed"
            disabled={!canCreate}
            onClick={onNewPartyClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau groupe
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingParty ? "Modifier le groupe" : "Créer un nouveau groupe"}
            </DialogTitle>
            <DialogDescription>
              {isEditingParty
                ? "Modifiez le nom de votre groupe d'aventuriers"
                : "Donnez un nom à votre nouveau groupe d'aventuriers"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partyName">Nom du groupe</Label>
              <Input
                id="partyName"
                placeholder="Les Aventuriers de la Côte des Épées"
                value={newPartyName}
                onChange={(e) => onNewPartyNameChange(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onPartyDialogCancel}
            >
              Annuler
            </Button>
            <Button
              onClick={onPartyDialogSubmit}
            >
              {isEditingParty ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartySelector;
