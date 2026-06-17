import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface PartyActionsProps {
  onRename: () => void;
  onDelete: () => void;
}

const PartyActions: React.FC<PartyActionsProps> = ({ onRename, onDelete }) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRename}
        className="touch-target"
      >
        <Edit className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Renommer</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive/80 hover:text-destructive/90 touch-target"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Supprimer</span>
      </Button>
    </div>
  );
};

export default PartyActions;
