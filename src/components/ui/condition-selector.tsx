import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  Zap, 
  Smile, 
  Ghost, 
  Brain, 
  EyeOff, 
  Anchor, 
  Footprints, 
  Skull, 
  ShieldX, 
  Snowflake,
  Square,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Conditions disponibles avec leurs couleurs et icônes
const CONDITIONS = {
  'empoisonné': { 
    icon: Droplets, 
    color: 'text-green-600 bg-green-100 border-green-300 hover:bg-green-200'
  },
  'paralysé': { 
    icon: Zap, 
    color: 'text-yellow-600 bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
  },
  'charmé': { 
    icon: Smile, 
    color: 'text-pink-600 bg-pink-100 border-pink-300 hover:bg-pink-200'
  },
  'effrayé': { 
    icon: Ghost, 
    color: 'text-purple-600 bg-purple-100 border-purple-300 hover:bg-purple-200'
  },
  'étourdi': { 
    icon: Brain, 
    color: 'text-orange-600 bg-orange-100 border-orange-300 hover:bg-orange-200'
  },
  'aveuglé': { 
    icon: EyeOff, 
    color: 'text-gray-600 bg-gray-100 border-gray-300 hover:bg-gray-200'
  },
  'assourdi': { 
    icon: EyeOff, 
    color: 'text-gray-600 bg-gray-100 border-gray-300 hover:bg-gray-200'
  },
  'entravé': { 
    icon: Anchor, 
    color: 'text-brown-600 bg-amber-100 border-amber-300 hover:bg-amber-200'
  },
  'ralenti': { 
    icon: Footprints, 
    color: 'text-blue-600 bg-blue-100 border-blue-300 hover:bg-blue-200'
  },
  'inconscient': { 
    icon: Skull, 
    color: 'text-red-600 bg-red-100 border-red-300 hover:bg-red-200'
  },
  'pétrifié': { 
    icon: ShieldX, 
    color: 'text-stone-600 bg-stone-100 border-stone-300 hover:bg-stone-200'
  },
  'gelé': { 
    icon: Snowflake, 
    color: 'text-cyan-600 bg-cyan-100 border-cyan-300 hover:bg-cyan-200'
  }
};

interface ConditionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
  currentConditions: string[];
  onToggleCondition: (condition: string) => void;
}

export const ConditionSelector: React.FC<ConditionSelectorProps> = ({
  isOpen,
  onClose,
  participantName,
  currentConditions,
  onToggleCondition
}) => {
  const conditionEntries = Object.entries(CONDITIONS);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-auto max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Square className="h-5 w-5 text-purple-600" />
            <span>Conditions - {participantName}</span>
          </DialogTitle>
          <DialogDescription>
            Cliquez sur une condition pour l'ajouter ou la retirer. Toutes les conditions D&D 5e disponibles.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Conditions actuelles */}
          {currentConditions.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Conditions actives :</h3>
              <div className="flex flex-wrap gap-2">
                {currentConditions.map((condition, index) => {
                  const conditionInfo = CONDITIONS[condition as keyof typeof CONDITIONS];
                  const ConditionIcon = conditionInfo?.icon || Square;
                  
                  return (
                    <Badge 
                      key={index}
                      className={cn(
                        'flex items-center cursor-pointer border-2',
                        conditionInfo?.color || 'text-gray-600 bg-gray-100 border-gray-300'
                      )}
                      onClick={() => onToggleCondition(condition)}
                    >
                      <ConditionIcon className="h-3 w-3 mr-1" />
                      <span>{condition}</span>
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grille des conditions disponibles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {conditionEntries.map(([condition, info]) => {
              const ConditionIcon = info.icon;
              const isActive = currentConditions.includes(condition);
              
              return (
                                <Button
                  key={condition}
                  variant="outline"
                  className={cn(
                    'h-20 p-3 flex flex-col items-center justify-center text-center transition-all duration-200',
                    isActive 
                      ? cn('border-2 shadow-lg', info.color)
                      : 'hover:shadow-md hover:border-gray-300'
                  )}
                  onClick={() => onToggleCondition(condition)}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center mb-2',
                    isActive 
                      ? 'bg-white shadow-sm' 
                      : 'bg-gray-100'
                  )}>
                    <ConditionIcon className={cn(
                      'h-4 w-4',
                      isActive 
                        ? info.color.split(' ')[0] // Récupère juste la couleur du texte
                        : 'text-gray-600'
                    )} />
                  </div>
                  
                  <div className="flex flex-col items-center space-y-1">
                    <h3 className={cn(
                      'font-medium capitalize text-sm leading-tight',
                      isActive ? 'text-gray-900' : 'text-gray-700'
                    )}>
                      {condition}
                    </h3>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 px-2 py-0">
                        Actif
                      </Badge>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {currentConditions.length} condition{currentConditions.length !== 1 ? 's' : ''} active{currentConditions.length !== 1 ? 's' : ''}
            </div>
            <Button onClick={onClose} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 