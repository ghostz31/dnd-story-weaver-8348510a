import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Keyboard, 
  Command, 
  Sword, 
  Users, 
  Book, 
  Zap, 
  Heart,
  Dice6,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Save,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: 'navigation' | 'combat' | 'general' | 'editing';
  icon?: React.ReactNode;
}

const shortcuts: KeyboardShortcut[] = [
  // Navigation
  {
    keys: ['Ctrl', 'M'],
    description: 'Ouvrir le navigateur de monstres',
    category: 'navigation',
    icon: <Book className="h-4 w-4" />
  },
  {
    keys: ['Ctrl', 'E'],
    description: 'Créer une nouvelle rencontre',
    category: 'navigation',
    icon: <Sword className="h-4 w-4" />
  },
  {
    keys: ['Ctrl', 'P'],
    description: 'Gérer les groupes',
    category: 'navigation',
    icon: <Users className="h-4 w-4" />
  },
  {
    keys: ['Ctrl', '?'],
    description: 'Afficher cette aide',
    category: 'navigation',
    icon: <Keyboard className="h-4 w-4" />
  },

  // Combat
  {
    keys: ['Space'],
    description: 'Tour suivant',
    category: 'combat',
    icon: <SkipForward className="h-4 w-4" />
  },
  {
    keys: ['Shift', 'Space'],
    description: 'Tour précédent',
    category: 'combat',
    icon: <RotateCcw className="h-4 w-4" />
  },
  {
    keys: ['H'],
    description: 'Modifier les PV',
    category: 'combat',
    icon: <Heart className="h-4 w-4" />
  },
  {
    keys: ['D'],
    description: 'Lancer les dés d\'initiative',
    category: 'combat',
    icon: <Dice6 className="h-4 w-4" />
  },
  {
    keys: ['I'],
    description: 'Modifier l\'initiative',
    category: 'combat',
    icon: <ArrowUp className="h-4 w-4" />
  },

  // Édition
  {
    keys: ['+'],
    description: 'Ajouter une créature',
    category: 'editing',
    icon: <Plus className="h-4 w-4" />
  },
  {
    keys: ['-'],
    description: 'Supprimer la créature sélectionnée',
    category: 'editing',
    icon: <Minus className="h-4 w-4" />
  },
  {
    keys: ['Ctrl', 'S'],
    description: 'Sauvegarder',
    category: 'editing',
    icon: <Save className="h-4 w-4" />
  },

  // Général
  {
    keys: ['Escape'],
    description: 'Fermer les dialogues',
    category: 'general',
    icon: <X className="h-4 w-4" />
  },
  {
    keys: ['Ctrl', 'Enter'],
    description: 'Lancer le combat',
    category: 'general',
    icon: <Play className="h-4 w-4" />
  },
];

const categoryConfig = {
  navigation: {
    title: 'Navigation',
    description: 'Naviguer entre les pages',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800'
  },
  combat: {
    title: 'Combat',
    description: 'Contrôles pendant les combats',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800'
  },
  editing: {
    title: 'Édition',
    description: 'Modifier les rencontres',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800'
  },
  general: {
    title: 'Général',
    description: 'Raccourcis généraux',
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800'
  }
};

const KeyBadge: React.FC<{ keyName: string }> = ({ keyName }) => {
  const isSpecialKey = ['Ctrl', 'Shift', 'Alt', 'Enter', 'Space', 'Escape'].includes(keyName);
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-mono text-xs px-2 py-1 bg-white border-2',
        isSpecialKey ? 'border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'
      )}
    >
      {keyName === 'Space' ? '␣' : keyName}
    </Badge>
  );
};

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const filteredShortcuts = selectedCategory 
    ? { [selectedCategory]: groupedShortcuts[selectedCategory] }
    : groupedShortcuts;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Keyboard className="h-6 w-6 text-blue-600" />
            <span>Raccourcis clavier</span>
          </DialogTitle>
          <DialogDescription>
            Utilisez ces raccourcis pour naviguer plus rapidement dans l'application
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-4 h-full">
          {/* Sidebar des catégories */}
          <div className="w-48 flex-shrink-0">
            <div className="space-y-2">
              <Button
                variant={selectedCategory === null ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(null)}
              >
                <Command className="h-4 w-4 mr-2" />
                Tous
              </Button>
              
              {Object.entries(categoryConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(key)}
                >
                  <div className={cn('w-3 h-3 rounded-full mr-2', config.bgColor, config.borderColor, 'border')} />
                  {config.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              {Object.entries(filteredShortcuts).map(([category, categoryShortcuts]) => {
                const config = categoryConfig[category as keyof typeof categoryConfig];
                
                return (
                  <Card key={category} className={cn('border-l-4', config.borderColor)}>
                    <CardHeader className={cn('pb-3', config.bgColor)}>
                      <CardTitle className={cn('text-lg flex items-center space-x-2', config.textColor)}>
                        <div className={cn('w-2 h-2 rounded-full', `bg-${config.color}-500`)} />
                        <span>{config.title}</span>
                      </CardTitle>
                      <CardDescription className={config.textColor}>
                        {config.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {categoryShortcuts.map((shortcut, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-3">
                              {shortcut.icon && (
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                  {shortcut.icon}
                                </div>
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {shortcut.description}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              {shortcut.keys.map((key, keyIndex) => (
                                <React.Fragment key={keyIndex}>
                                  {keyIndex > 0 && (
                                    <span className="text-gray-400 text-xs">+</span>
                                  )}
                                  <KeyBadge keyName={key} />
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer avec conseils */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="h-4 w-4" />
              <span>Astuce: Maintenez <KeyBadge keyName="Ctrl" /> + <KeyBadge keyName="?" /> pour ouvrir cette aide</span>
            </div>
            
            <Button onClick={onClose} variant="outline">
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook pour gérer l'affichage de l'aide
export const useKeyboardHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl + ? pour ouvrir l'aide
      if (event.ctrlKey && (event.key === '?' || event.key === '/')) {
        event.preventDefault();
        setIsOpen(true);
      }
      
      // Escape pour fermer
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    KeyboardHelp: () => (
      <KeyboardShortcutsHelp isOpen={isOpen} onClose={() => setIsOpen(false)} />
    )
  };
}; 