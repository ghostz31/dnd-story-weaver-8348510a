import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Player } from '@/lib/types';

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  onRemove: (playerId: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onEdit, onRemove }) => {
  return (
    <div
      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
            {player.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{player.name}</div>
            <div className="text-xs text-muted-foreground">
              {player.race || 'Race inconnue'} • {player.characterClass}
            </div>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onEdit(player)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive/80 hover:text-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(player.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="secondary" className="text-xs">
          Niv. {player.level}
        </Badge>
        <Badge variant="outline" className="text-xs">
          CA {player.ac || '?'}
        </Badge>
        <Badge variant="outline" className="text-xs">
          PV {player.currentHp !== undefined && player.maxHp !== undefined
            ? `${player.currentHp}/${player.maxHp}`
            : '?'}
        </Badge>
      </div>

      <div className="flex gap-1.5">
        {player.dndBeyondId && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive border border-destructive/20 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
            Beyond
          </span>
        )}
        {player.besaceShareCode && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
            Besace
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
