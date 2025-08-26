import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  BookOpen, 
  Maximize2, 
  Minimize2,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateAideDDUrl } from '@/lib/aideddUrlMapper';
import { getCachedCreatureStats, formatCreatureStats, CreatureStats } from '@/lib/aideddParser';

interface CreatureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatureName: string;
  creatureType?: string;
  cr?: string | number;
}

export const CreatureDetailModal: React.FC<CreatureDetailModalProps> = ({
  isOpen,
  onClose,
  creatureName,
  creatureType,
  cr
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [creatureStats, setCreatureStats] = useState<CreatureStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const aideddUrl = generateAideDDUrl(creatureName);

  // Réinitialiser l'état quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      setIsMaximized(false);
      setIframeKey(prev => prev + 1); // Force le rechargement de l'iframe
      setCreatureStats(null);
      loadCreatureStats();
    }
  }, [isOpen, creatureName]);

  // Charger les statistiques de la créature
  const loadCreatureStats = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await getCachedCreatureStats(creatureName, aideddUrl);
      setCreatureStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Gérer le chargement de l'iframe
  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Recharger l'iframe
  const reloadIframe = () => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey(prev => prev + 1);
  };

  // Ouvrir dans un nouvel onglet
  const openInNewTab = () => {
    window.open(aideddUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          'transition-all duration-300 flex flex-col p-4',
          isMaximized 
            ? 'max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh]' 
            : 'max-w-6xl max-h-[90vh] w-[92vw] h-[90vh]'
        )}
      >
        <DialogHeader className="pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  {creatureName}
                </DialogTitle>
                <DialogDescription className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-1 text-xs">
                    <span>AideDD</span>
                    {creatureType && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {creatureType}
                      </Badge>
                    )}
                    {cr && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        CR {cr}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Affichage des statistiques récupérées */}
                  {isLoadingStats && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Chargement des stats...</span>
                    </div>
                  )}
                  
                  {creatureStats && !isLoadingStats && (
                    <div className="text-xs text-gray-700 font-medium">
                      {formatCreatureStats(creatureStats)}
                    </div>
                  )}
                </DialogDescription>
              </div>
            </div>
            
            {/* Contrôles */}
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={reloadIframe}
                className="h-8 w-8 p-0"
                title="Recharger"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsMaximized(!isMaximized)}
                className="h-8 w-8 p-0"
                title={isMaximized ? "Réduire" : "Agrandir"}
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={openInNewTab}
                className="h-8 w-8 p-0"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Contenu de l'iframe */}
        <div className="flex-1 relative bg-transparent rounded-lg border overflow-hidden min-h-0">
          {/* État de chargement */}
          {isLoading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  Chargement des détails de {creatureName}...
                </p>
              </div>
            </div>
          )}

          {/* État d'erreur */}
          {hasError && !isLoading && (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
              <div className="max-w-md text-center p-6">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Impossible de charger les détails
                </h3>
                <p className="text-gray-600 mb-4">
                  La page AideDD pour "{creatureName}" n'a pas pu être chargée. 
                  Cela peut être dû à un nom de créature non reconnu ou à un problème de connexion.
                </p>
                
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>URL tentée :</strong> {aideddUrl}
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col space-y-2">
                  <Button onClick={reloadIframe} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                  <Button onClick={openInNewTab} variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir dans un nouvel onglet
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Iframe avec CSS optimisé */}
          <iframe
            key={iframeKey}
            src={aideddUrl}
            className="w-full h-full border-0 bg-transparent"
            title={`Détails de ${creatureName}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="lazy"
            style={{
              transform: isMaximized ? 'scale(0.9)' : 'scale(0.8)',
              transformOrigin: 'top left',
              width: isMaximized ? '111%' : '125%',
              height: isMaximized ? '111%' : '125%',
              backgroundColor: 'transparent'
            }}
          />
        </div>

        {/* Footer compact avec informations */}
        <div className="border-t pt-2 pb-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-3 w-3" />
              <span>AideDD.org</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Échap pour fermer</span>
              <Button size="sm" variant="outline" onClick={onClose} className="h-6 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook pour utiliser la modal de détails de créature
export const useCreatureDetailModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCreature, setCurrentCreature] = useState<{
    name: string;
    type?: string;
    cr?: string | number;
  } | null>(null);

  const openModal = (creatureName: string, creatureType?: string, cr?: string | number) => {
    setCurrentCreature({ name: creatureName, type: creatureType, cr });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Petit délai avant de nettoyer pour permettre l'animation de fermeture
    setTimeout(() => setCurrentCreature(null), 300);
  };

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const CreatureModal = () => (
    currentCreature ? (
      <CreatureDetailModal
        isOpen={isOpen}
        onClose={closeModal}
        creatureName={currentCreature.name}
        creatureType={currentCreature.type}
        cr={currentCreature.cr}
      />
    ) : null
  );

  return {
    openModal,
    closeModal,
    isOpen,
    CreatureModal
  };
}; 