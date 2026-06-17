import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

interface NoPartiesStateProps {
  canCreate: boolean;
  onCreateClick: () => void;
}

const NoPartiesState: React.FC<NoPartiesStateProps> = ({ canCreate, onCreateClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground mb-4">Vous n'avez pas encore de groupe d'aventuriers</p>
      <Button
        variant="default"
        onClick={onCreateClick}
        disabled={!canCreate}
      >
        <Plus className="mr-2 h-4 w-4" />
        Créer votre premier groupe
      </Button>
    </div>
  );
};

export default NoPartiesState;
