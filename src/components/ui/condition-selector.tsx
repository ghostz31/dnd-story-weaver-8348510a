import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';
import { 
  Zap, 
  Droplets, 
  Eye, 
  EyeOff, 
  Smile, 
  Link, 
  Snowflake, 
  Clock, 
  Ghost, 
  Anchor, 
  ArrowDown, 
  Brain, 
  Footprints, 
  ShieldX, 
  Square,
  Search,
  X
} from 'lucide-react';

// Définition des conditions avec icônes et couleurs
const CONDITIONS = {
  'empoisonné': { icon: Droplets, color: 'text-green-600 border-green-600 bg-green-50' },
  'aveuglé': { icon: EyeOff, color: 'text-gray-600 border-gray-600 bg-gray-50' },
  'charmé': { icon: Smile, color: 'text-pink-600 border-pink-600 bg-pink-50' },
  'assourdi': { icon: Square, color: 'text-orange-600 border-orange-600 bg-orange-50' },
  'effrayé': { icon: Ghost, color: 'text-purple-600 border-purple-600 bg-purple-50' },
  'agrippé': { icon: Link, color: 'text-yellow-600 border-yellow-600 bg-yellow-50' },
  'incapacité': { icon: ShieldX, color: 'text-red-600 border-red-600 bg-red-50' },
  'invisible': { icon: Eye, color: 'text-blue-600 border-blue-600 bg-blue-50' },
  'paralysé': { icon: Anchor, color: 'text-indigo-600 border-indigo-600 bg-indigo-50' },
  'pétrifié': { icon: Square, color: 'text-gray-700 border-gray-700 bg-gray-100' },
  'à terre': { icon: ArrowDown, color: 'text-brown-600 border-brown-600 bg-brown-50' },
  'entravé': { icon: Footprints, color: 'text-red-700 border-red-700 bg-red-100' },
  'étourdi': { icon: Brain, color: 'text-yellow-700 border-yellow-700 bg-yellow-100' },
  'inconscient': { icon: Clock, color: 'text-gray-800 border-gray-800 bg-gray-200' },
  'épuisement': { icon: ArrowDown, color: 'text-orange-700 border-orange-700 bg-orange-100' },
  'gelé': { icon: Snowflake, color: 'text-blue-400 border-blue-400 bg-blue-50' },
  'électrifié': { icon: Zap, color: 'text-yellow-400 border-yellow-400 bg-yellow-50' },
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
  const mobile = useMobile();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrer les conditions selon le terme de recherche
  const filteredConditions = useMemo(() => {
    if (!searchTerm) return CONDITIONS;
    
    const filtered: Record<string, { icon: any; color: string }> = {};
    Object.entries(CONDITIONS).forEach(([condition, info]) => {
      if (condition.toLowerCase().includes(searchTerm.toLowerCase())) {
        filtered[condition] = info;
      }
    });
    return filtered;
  }, [searchTerm]);
  
  const conditionEntries = Object.entries(filteredConditions);
  
  const clearSearch = () => setSearchTerm('');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-h-[90vh] overflow-hidden flex flex-col",
        mobile.shouldUseFullScreen() 
          ? "w-full h-full max-w-none max-h-none rounded-none m-0" 
          : "max-w-4xl"
      )}>
        <DialogHeader className={cn(
          "flex-shrink-0",
          mobile.isMobile && "px-4 py-3"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className={mobile.classes.text.lg}>
                Gérer les conditions
              </DialogTitle>
              <DialogDescription className={mobile.classes.text.sm}>
                {participantName} - {currentConditions.length} condition(s) active(s)
              </DialogDescription>
            </div>
            {mobile.isMobile && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className={cn(
          "flex-1 overflow-y-auto",
          mobile.classes.padding
        )}>
          {/* Barre de recherche */}
          <div className="relative mb-4">
            <div className="relative">
              <Search className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
                mobile.classes.icon.sm
              )} />
              <Input
                placeholder="Rechercher une condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "pl-10 pr-10",
                  mobile.classes.button.md
                )}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Conditions actives */}
          {currentConditions.length > 0 && (
            <div className="mb-6">
              <h3 className={cn(
                "font-medium text-gray-900 mb-3",
                mobile.classes.text.base
              )}>
                Conditions actives
              </h3>
              <div className={cn(
                "flex flex-wrap gap-2",
                mobile.isMobile && "gap-1"
              )}>
                {currentConditions.map((condition, index) => {
                  const conditionInfo = CONDITIONS[condition as keyof typeof CONDITIONS] || 
                    { icon: Square, color: 'text-gray-500 border-gray-500 bg-gray-50' };
                  const ConditionIcon = conditionInfo.icon;
                  
                  return (
                    <Badge
                      key={index}
                      variant="outline"
                      className={cn(
                        'cursor-pointer flex items-center border-2 transition-all',
                        conditionInfo.color,
                        mobile.getTouchFeedback(),
                        mobile.isMobile ? "text-xs py-2 px-3" : "text-sm py-2 px-3"
                      )}
                      onClick={() => onToggleCondition(condition)}
                    >
                      <ConditionIcon className={cn(
                        "mr-2 flex-shrink-0",
                        mobile.classes.icon.sm
                      )} />
                      <span className="capitalize">{condition}</span>
                      <X className={cn(
                        "ml-2 flex-shrink-0",
                        mobile.classes.icon.sm
                      )} />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grille des conditions disponibles */}
          <div>
            <h3 className={cn(
              "font-medium text-gray-900 mb-3",
              mobile.classes.text.base
            )}>
              Conditions disponibles
            </h3>
            
            {conditionEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className={cn("mx-auto mb-2 opacity-50", mobile.classes.icon.lg)} />
                <p className={mobile.classes.text.sm}>
                  Aucune condition trouvée pour "{searchTerm}"
                </p>
              </div>
            ) : (
              <div className={cn(
                "grid gap-3",
                mobile.classes.grid.auto,
                mobile.isMobile ? "grid-cols-2" : "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
              )}>
                {conditionEntries.map(([condition, info]) => {
                  const ConditionIcon = info.icon;
                  const isActive = currentConditions.includes(condition);
                  
                  return (
                    <Button
                      key={condition}
                      variant="outline"
                      className={cn(
                        'flex flex-col items-center justify-center text-center transition-all duration-200',
                        mobile.isMobile ? "h-16 p-2" : "h-20 p-3",
                        mobile.getTouchFeedback(),
                        isActive 
                          ? cn('border-2 shadow-lg', info.color)
                          : 'hover:shadow-md hover:border-gray-300'
                      )}
                      onClick={() => onToggleCondition(condition)}
                    >
                      <div className={cn(
                        'rounded-full flex items-center justify-center mb-1',
                        mobile.isMobile ? "w-6 h-6" : "w-8 h-8",
                        isActive 
                          ? 'bg-white shadow-sm' 
                          : 'bg-gray-100'
                      )}>
                        <ConditionIcon className={cn(
                          mobile.classes.icon.sm,
                          isActive 
                            ? info.color.split(' ')[0] // Récupère juste la couleur du texte
                            : 'text-gray-600'
                        )} />
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1">
                        <h4 className={cn(
                          'font-medium capitalize leading-tight',
                          mobile.classes.text.sm,
                          isActive ? 'text-gray-900' : 'text-gray-700'
                        )}>
                          {mobile.isMobile ? condition.slice(0, 8) : condition}
                        </h4>
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
            )}
          </div>
        </div>

        {/* Footer mobile */}
        {mobile.isMobile && (
          <div className="flex-shrink-0 border-t bg-gray-50 px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {currentConditions.length} condition(s) active(s)
              </div>
              <Button onClick={onClose} className="h-8 px-4">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 