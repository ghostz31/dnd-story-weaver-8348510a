import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Player } from '@/lib/types';
import PlayerCard from './PlayerCard';

interface PlayersListProps {
  players: Player[];
  onAddClick: () => void;
  onEditPlayer: (player: Player) => void;
  onRemovePlayer: (playerId: string) => void;
}

const PlayersList: React.FC<PlayersListProps> = ({
  players,
  onAddClick,
  onEditPlayer,
  onRemovePlayer,
}) => {
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
        <UserPlus className="h-10 w-10 text-muted-foreground/50 mb-2" />
        <p className="text-muted-foreground mb-2">Aucun personnage dans ce groupe</p>
        <p className="text-muted-foreground/70 text-sm mb-4">
          Ajoutez des personnages pour pouvoir créer des rencontres équilibrées
        </p>
        <Button
          size="sm"
          onClick={onAddClick}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Ajouter un personnage
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
      {players.map(player => (
        <PlayerCard
          key={player.id}
          player={player}
          onEdit={onEditPlayer}
          onRemove={onRemovePlayer}
        />
      ))}
    </div>
  );
};

export default PlayersList;
