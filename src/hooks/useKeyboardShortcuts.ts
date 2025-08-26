import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorer les raccourcis si on est dans un champ de saisie
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!event.ctrlKey === !!shortcut.ctrlKey;
      const altMatches = !!event.altKey === !!shortcut.altKey;
      const shiftMatches = !!event.shiftKey === !!shortcut.shiftKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Hook spécialisé pour l'application D&D
export const useDnDShortcuts = (actions: {
  openMonsterBrowser?: () => void;
  openEncounterBuilder?: () => void;
  openPartyEditor?: () => void;
  toggleSearch?: () => void;
  createNew?: () => void;
  save?: () => void;
  showHelp?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: 'm',
      ctrlKey: true,
      action: actions.openMonsterBrowser || (() => {}),
      description: 'Ouvrir le navigateur de monstres'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: actions.openEncounterBuilder || (() => {}),
      description: 'Ouvrir le constructeur de rencontres'
    },
    {
      key: 'p',
      ctrlKey: true,
      action: actions.openPartyEditor || (() => {}),
      description: 'Ouvrir l\'éditeur de groupe'
    },
    // Actions
    {
      key: 'f',
      ctrlKey: true,
      action: actions.toggleSearch || (() => {}),
      description: 'Activer/désactiver la recherche'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: actions.createNew || (() => {}),
      description: 'Créer un nouvel élément'
    },
    {
      key: 's',
      ctrlKey: true,
      action: actions.save || (() => {}),
      description: 'Sauvegarder'
    },
    // Aide
    {
      key: '?',
      action: actions.showHelp || (() => {}),
      description: 'Afficher l\'aide'
    },
    {
      key: 'F1',
      action: actions.showHelp || (() => {}),
      description: 'Afficher l\'aide',
      preventDefault: true
    }
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
};

 