import React from 'react';
import { EncounterCondition } from '@/lib/types';
import { CONDITIONS, getConditionInfo } from '@/lib/EncounterUtils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShieldX as ConditionsIcon } from 'lucide-react';

interface ConditionPickerProps {
  conditions: EncounterCondition[];
  onToggle: (conditionName: string) => void;
  /** Affiche un trigger compact (icône seule) - utile sur mobile */
  compact?: boolean;
  /** Classe complémentaire appliquée au wrapper */
  className?: string;
}

/**
 * Composant réutilisable pour gérer les conditions d'un combattant.
 * - Grille des conditions disponibles (ajout/retrait)
 * - Affiche les conditions actives en pastilles rondes 24px avec compteur overlay
 */
const ConditionPicker: React.FC<ConditionPickerProps> = ({
  conditions,
  onToggle,
  compact = false,
  className = '',
}) => {
  const isConditionActive = (name: string) =>
    conditions.some((c) => (typeof c === 'string' ? c : c.name) === name);

  return (
    <div className={`flex flex-col gap-1 min-w-[180px] ${className}`} onClick={(e) => e.stopPropagation()}>
      {/* Conditions actives : pastilles rondes 24px avec compteur overlay */}
      {conditions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <TooltipProvider>
            {conditions.map((condition) => {
              const conditionName = typeof condition === 'string' ? condition : condition.name;
              const conditionInfo = getConditionInfo(conditionName);
              const Icon = conditionInfo.icon;
              const duration = typeof condition === 'string' ? -1 : condition.duration;
              return (
                <Tooltip key={typeof condition === 'string' ? condition : condition.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onToggle(conditionName)}
                      className={`relative h-6 w-6 rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-75 ${conditionInfo.color} border bg-background/80`}
                      aria-label={`${conditionName}${duration > 0 ? ` (${duration} tours restants)` : ''} - cliquer pour retirer`}
                      aria-pressed={true}
                    >
                      <Icon className="h-3 w-3" />
                      {duration > 0 && (
                        <span className="absolute -bottom-1 -right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center leading-none border border-background">
                          {duration}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-md bg-stone-900 border-stone-800 text-stone-50 p-3 shadow-xl z-50">
                    <p className="font-bold mb-1">{conditionName}</p>
                    <div className="text-xs whitespace-pre-wrap">{conditionInfo.description}</div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      )}

      {/* Popover grid pour ajouter/supprimer conditions */}
      <Popover>
        <PopoverTrigger asChild>
          {compact ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 relative"
              aria-label="Gérer les conditions"
            >
              <ConditionsIcon className="h-3 w-3" />
              {conditions.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full" />
              )}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
              + Conditions
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="text-xs font-bold mb-2 text-muted-foreground">Gérer les conditions</div>
          <div className="grid grid-cols-2 gap-1">
            {CONDITIONS.map((conditionName) => {
              const isActive = isConditionActive(conditionName);
              const info = getConditionInfo(conditionName);
              const Icon = info.icon;
              return (
                <button
                  key={conditionName}
                  onClick={() => onToggle(conditionName)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                  aria-pressed={isActive}
                >
                  <Icon className="h-3 w-3" />
                  {conditionName}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ConditionPicker;
