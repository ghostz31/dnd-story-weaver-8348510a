import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sword, 
  Shield, 
  Users, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  Eye,
  Play,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Monster, EncounterMonster } from '@/lib/types';

// Composant pour afficher la difficulté avec style amélioré
export const DifficultyIndicator: React.FC<{
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  xp: number;
  adjustedXp: number;
}> = ({ difficulty, xp, adjustedXp }) => {
  const difficultyConfig = {
    easy: {
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      label: 'Facile'
    },
    medium: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: TrendingUp,
      label: 'Moyen'
    },
    hard: {
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: AlertTriangle,
      label: 'Difficile'
    },
    deadly: {
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: Sword,
      label: 'Mortel'
    }
  };

  const config = difficultyConfig[difficulty];
  const Icon = config.icon;

  return (
    <Card className={cn('border-2', config.borderColor, config.bgColor)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon className={cn('h-5 w-5', config.textColor)} />
            <span className={cn('font-semibold', config.textColor)}>
              {config.label}
            </span>
          </div>
          <Badge 
            variant="secondary" 
            className={cn(config.bgColor, config.textColor, 'border', config.borderColor)}
          >
            {xp} XP
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>XP de base:</span>
            <span className="font-medium">{xp}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>XP ajusté:</span>
            <span className="font-medium">{adjustedXp}</span>
          </div>
        </div>
        
        <div className="mt-3">
          <Progress 
            value={Math.min((adjustedXp / 10000) * 100, 100)} 
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Composant pour afficher un monstre sélectionné avec animations
export const SelectedMonsterCard: React.FC<{
  encounterMonster: EncounterMonster;
  onQuantityChange: (monsterId: string, newQuantity: number) => void;
  onRemove: (monsterId: string) => void;
  onViewDetails: (monster: Monster) => void;
}> = ({ encounterMonster, onQuantityChange, onRemove, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { monster, quantity } = encounterMonster;

  const getCRColor = (cr: string | number) => {
    const crValue = typeof cr === 'string' ? parseFloat(cr) || 0 : cr;
    if (crValue <= 1) return 'text-green-600 bg-green-100';
    if (crValue <= 5) return 'text-yellow-600 bg-yellow-100';
    if (crValue <= 10) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-300 hover:shadow-lg',
        isHovered && 'scale-[1.02] shadow-lg'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Sword className="h-6 w-6 text-gray-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">{monster.name}</h3>
                <Badge className={cn('text-xs', getCRColor(monster.cr || 0))}>
                  CR {monster.cr || '?'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>CA {monster.ac || '?'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-red-500">❤</span>
                  <span>{monster.hp || '?'} PV</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {/* Contrôles de quantité */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onQuantityChange(monster.id, Math.max(1, quantity - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="px-2 text-sm font-medium min-w-[2ch] text-center">
                {quantity}
              </span>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onQuantityChange(monster.id, quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Boutons d'action */}
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onViewDetails(monster)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onRemove(monster.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Informations supplémentaires en hover */}
        {isHovered && (
          <div className="mt-3 pt-3 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Type:</span> {monster.type || 'Inconnu'}
              </div>
              <div>
                <span className="font-medium">Taille:</span> {monster.size || 'Inconnue'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Composant pour les statistiques du groupe
export const PartyStatsCard: React.FC<{
  partyName: string;
  playerCount: number;
  averageLevel: number;
  totalXpThresholds: {
    easy: number;
    medium: number;
    hard: number;
    deadly: number;
  };
}> = ({ partyName, playerCount, averageLevel, totalXpThresholds }) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-900 flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{partyName}</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {playerCount} joueur{playerCount > 1 ? 's' : ''}
          </Badge>
        </div>
        <CardDescription className="text-blue-700">
          Niveau moyen: {averageLevel}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Facile:</span>
              <span className="font-medium text-green-800">{totalXpThresholds.easy} XP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-700">Moyen:</span>
              <span className="font-medium text-yellow-800">{totalXpThresholds.medium} XP</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-orange-700">Difficile:</span>
              <span className="font-medium text-orange-800">{totalXpThresholds.hard} XP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-700">Mortel:</span>
              <span className="font-medium text-red-800">{totalXpThresholds.deadly} XP</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant pour les actions rapides
export const QuickActions: React.FC<{
  onAddMonster: () => void;
  onLaunchEncounter: () => void;
  onSaveEncounter: () => void;
  onRandomEncounter: () => void;
  hasMonsters: boolean;
  hasParty: boolean;
}> = ({ 
  onAddMonster, 
  onLaunchEncounter, 
  onSaveEncounter, 
  onRandomEncounter,
  hasMonsters,
  hasParty 
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={onAddMonster}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un monstre
      </Button>
      
      <Button
        variant="outline"
        onClick={onRandomEncounter}
        className="border-purple-200 text-purple-700 hover:bg-purple-50"
      >
        <Zap className="h-4 w-4 mr-2" />
        Rencontre aléatoire
      </Button>
      
      <Button
        variant="outline"
        onClick={onSaveEncounter}
        disabled={!hasMonsters}
        className="border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
      >
        <Settings className="h-4 w-4 mr-2" />
        Sauvegarder
      </Button>
      
      <Button
        onClick={onLaunchEncounter}
        disabled={!hasMonsters || !hasParty}
        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Play className="h-4 w-4 mr-2" />
        Lancer le combat
      </Button>
    </div>
  );
};

// Composant pour l'état vide
export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon: React.ReactNode;
}> = ({ title, description, actionLabel, onAction, icon }) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
        {actionLabel}
      </Button>
    </div>
  );
}; 