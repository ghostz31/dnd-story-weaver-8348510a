import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Save } from 'lucide-react';
import { Player } from '@/lib/types';
import PlayerForm from './PlayerForm';

interface PlayerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditingPlayer: boolean;
  onTriggerClick: () => void;
  newPlayer: Omit<Player, 'id'>;
  setNewPlayer: React.Dispatch<React.SetStateAction<Omit<Player, 'id'>>>;
  dndBeyondUrl: string;
  onDndBeyondUrlChange: (url: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const PlayerDialog: React.FC<PlayerDialogProps> = ({
  isOpen,
  onOpenChange,
  isEditingPlayer,
  onTriggerClick,
  newPlayer,
  setNewPlayer,
  dndBeyondUrl,
  onDndBeyondUrlChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="touch-target"
          onClick={onTriggerClick}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-3xl h-full md:h-auto md:max-h-[90vh] flex flex-col rounded-none md:rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditingPlayer ? "Modifier le personnage" : "Ajouter un personnage"}
          </DialogTitle>
          <DialogDescription>
            {isEditingPlayer
              ? "Modifiez les détails de ce personnage"
              : "Ajoutez un nouveau personnage à votre groupe"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-4">
            Remplissez les informations de base, ou importez depuis D&D Beyond.
            Les caractéristiques et maîtrises peuvent être ajoutées dans les onglets dédiés.
          </p>

          <PlayerForm
            newPlayer={newPlayer}
            setNewPlayer={setNewPlayer}
            isEditingPlayer={isEditingPlayer}
            dndBeyondUrl={dndBeyondUrl}
            onDndBeyondUrlChange={onDndBeyondUrlChange}
          />
        </div>


        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button
            onClick={onSubmit}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditingPlayer ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerDialog;
