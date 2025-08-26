import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { ExternalLink, Maximize2, Minimize2, RotateCcw, X } from 'lucide-react';

interface MagicItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemUrl: string;
  itemType: string;
  itemRarity: string;
  itemDescription?: string;
}

export const MagicItemModal: React.FC<MagicItemModalProps> = ({
  isOpen,
  onClose,
  itemName,
  itemUrl,
  itemType,
  itemRarity,
  itemDescription
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleReload = () => {
    setIsLoading(true);
    setHasError(false);
    // Force iframe reload by updating src
    const iframe = document.querySelector('#magic-item-iframe') as HTMLIFrameElement;
    if (iframe) {
      const currentSrc = iframe.src;
      iframe.src = '';
      setTimeout(() => {
        iframe.src = currentSrc;
      }, 100);
    }
  };

  const openInNewTab = () => {
    window.open(itemUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const getRarityColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      'common': 'text-gray-600',
      'uncommon': 'text-green-600',
      'rare': 'text-blue-600',
      'very_rare': 'text-purple-600',
      'legendary': 'text-orange-600',
      'artifact': 'text-red-600'
    };
    return colors[rarity] || 'text-gray-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`bg-transparent border-0 shadow-none p-0 ${
          isMaximized 
            ? 'max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh]' 
            : 'max-w-6xl max-h-[90vh] w-[92vw] h-[90vh]'
        } flex flex-col`}
      >
        {/* Header compact */}
        <div className="bg-white border border-gray-200 rounded-t-lg px-3 py-2 flex items-center justify-between shrink-0">
          <DialogHeader className="flex-1 min-w-0">
            <DialogTitle className="text-sm font-semibold text-gray-900 truncate">
              ✨ {itemName}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600 truncate">
              <span className={`font-medium ${getRarityColor(itemRarity)}`}>
                {itemRarity}
              </span>
              {' • '}
              <span className="text-gray-500">{itemType}</span>
              {itemDescription && (
                <>
                  {' • '}
                  <span className="text-gray-700">{itemDescription}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {/* Actions compactes */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReload}
              className="h-7 w-7 p-0"
              title="Recharger"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMaximize}
              className="h-7 w-7 p-0"
              title={isMaximized ? "Réduire" : "Agrandir"}
            >
              {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openInNewTab}
              className="h-7 w-7 p-0"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
              title="Fermer"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Contenu iframe */}
        <div className="flex-1 bg-transparent border border-t-0 border-gray-200 rounded-b-lg overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">Chargement de l'objet magique...</p>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
              <div className="text-center">
                <p className="text-red-600 mb-2">❌ Erreur de chargement</p>
                <p className="text-sm text-gray-600 mb-3">
                  Impossible de charger les détails de l'objet
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleReload} size="sm">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Réessayer
                  </Button>
                  <Button onClick={openInNewTab} variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ouvrir directement
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="w-full h-full bg-transparent">
            <iframe
              id="magic-item-iframe"
              src={itemUrl}
              className="w-full h-full bg-transparent border-0"
              style={{
                transform: isMaximized ? 'scale(0.9)' : 'scale(0.8)',
                transformOrigin: 'top left',
                width: isMaximized ? '111%' : '125%',
                height: isMaximized ? '111%' : '125%'
              }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={`Détails de ${itemName}`}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook pour gérer l'état du modal
export const useMagicItemModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemData, setItemData] = useState<{
    name: string;
    url: string;
    type: string;
    rarity: string;
    description?: string;
  } | null>(null);

  const openModal = (data: {
    name: string;
    url: string;
    type: string;
    rarity: string;
    description?: string;
  }) => {
    setItemData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setItemData(null), 300); // Délai pour l'animation
  };

  return {
    isOpen,
    itemData,
    openModal,
    closeModal
  };
}; 