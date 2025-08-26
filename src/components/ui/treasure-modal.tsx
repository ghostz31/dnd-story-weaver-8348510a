import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Coins, 
  Gem, 
  Crown, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Download,
  Eye,
  EyeOff,
  Star,
  MapPin,
  Scroll,
  Gift,
  Users,
  Skull,
  Heart,
  ExternalLink
} from 'lucide-react';
import { MagicItemModal, useMagicItemModal } from './magic-item-modal';
import { 
  TreasureResult, 
  CoinReward, 
  ArtObject, 
  Gemstone, 
  MagicItemReward,
  SpecialReward,
  generateEncounterTreasure 
} from '@/lib/treasureSystem';
import { useToast } from '@/hooks/use-toast';

interface TreasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  monsters: Array<{name: string, cr: number}>;
  partyLevel: number;
  encounterName?: string;
}

interface TreasureDisplayProps {
  treasure: TreasureResult;
  title: string;
  subtitle?: string;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

const TreasureModal: React.FC<TreasureModalProps> = ({
  isOpen,
  onClose,
  monsters,
  partyLevel,
  encounterName = "Rencontre"
}) => {
  const [treasureData, setTreasureData] = useState<{
    individualTreasures: Array<{monster: string, treasure: TreasureResult}>;
    hoardTreasure: TreasureResult | null;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const magicItemModal = useMagicItemModal();

  // Fonction pour ouvrir les détails d'un objet magique
  const openMagicItemDetails = (item: any) => {
    if (item.url) {
      magicItemModal.openModal({
        name: item.name,
        url: item.url,
        type: item.type || 'Objet merveilleux',
        rarity: item.rarity || 'uncommon',
        description: item.description
      });
    }
  };

  const generateTreasure = async () => {
    setIsGenerating(true);
    try {
      // Simuler un petit délai pour l'effet
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = generateEncounterTreasure(monsters, partyLevel);
      setTreasureData(result);
      
      toast({
        title: "Trésor généré !",
        description: "Le butin de la rencontre a été calculé selon les tables du DMG.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le trésor.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDetails = (key: string) => {
    setShowDetails(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le texte a été copié dans le presse-papiers.",
    });
  };

  const formatTreasureForExport = () => {
    if (!treasureData) return "";
    
    let text = `=== TRÉSOR DE ${encounterName.toUpperCase()} ===\n\n`;
    
    // Trésors individuels
    if (treasureData.individualTreasures.length > 0) {
      text += "🗡️ TRÉSORS INDIVIDUELS :\n";
      treasureData.individualTreasures.forEach(({ monster, treasure }) => {
        if (treasure.totalValue > 0) {
          text += `• ${monster} : ${treasure.description}\n`;
        }
      });
      text += "\n";
    }
    
    // Trésor de réserve
    if (treasureData.hoardTreasure) {
      text += "💰 TRÉSOR DE RÉSERVE :\n";
      const hoard = treasureData.hoardTreasure;
      
      // Pièces
      if (hoard.coins.copper || hoard.coins.silver || hoard.coins.electrum || hoard.coins.gold || hoard.coins.platinum) {
        text += "Pièces : ";
        const coinParts = [];
        if (hoard.coins.platinum > 0) coinParts.push(`${hoard.coins.platinum} pp`);
        if (hoard.coins.gold > 0) coinParts.push(`${hoard.coins.gold} po`);
        if (hoard.coins.electrum > 0) coinParts.push(`${hoard.coins.electrum} pe`);
        if (hoard.coins.silver > 0) coinParts.push(`${hoard.coins.silver} pa`);
        if (hoard.coins.copper > 0) coinParts.push(`${hoard.coins.copper} pc`);
        text += coinParts.join(', ') + "\n";
      }
      
      // Gemmes
      if (hoard.gemstones.length > 0) {
        text += "Gemmes :\n";
        hoard.gemstones.forEach(gem => {
          text += `  - ${gem.name} (${gem.value} po) : ${gem.description}\n`;
        });
      }
      
      // Objets d'art
      if (hoard.artObjects.length > 0) {
        text += "Objets d'art :\n";
        hoard.artObjects.forEach(art => {
          text += `  - ${art.name} (${art.value} po)\n`;
        });
      }
      
             // Objets magiques
       if (hoard.magicItems.length > 0) {
         text += "Objets magiques :\n";
         hoard.magicItems.forEach(item => {
           text += `  - ${item.name} (${item.rarity}) : ${item.description}\n`;
         });
       }
       
       // Récompenses spéciales
       if (hoard.specialRewards.length > 0) {
         text += "Récompenses spéciales :\n";
         hoard.specialRewards.forEach(reward => {
           text += `  - ${reward.name} (${reward.type}) : ${reward.description}\n`;
           if (reward.requirements) {
             text += `    Requis: ${reward.requirements}\n`;
           }
           if (reward.value && reward.value > 0) {
             text += `    Valeur: ${reward.value} po\n`;
           }
         });
       }
       
       text += `\nValeur totale estimée : ${Math.round(hoard.totalValue)} po\n`;
     }
     
     // Récompenses spéciales individuelles
     const allSpecialRewards = treasureData.individualTreasures
       .flatMap(({treasure}) => treasure.specialRewards)
       .filter(reward => reward);
     
     if (allSpecialRewards.length > 0) {
       text += "\n🎁 RÉCOMPENSES SPÉCIALES INDIVIDUELLES :\n";
       allSpecialRewards.forEach(reward => {
         text += `• ${reward.name} : ${reward.description}\n`;
       });
     }
     
     return text;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-[98vw] h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Coins className="h-5 w-5 text-yellow-500" />
            Génération de Trésor - {encounterName}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Basé sur les tables du DMG • Niveau du groupe : {partyLevel} • Monstres : {monsters.length}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Boutons d'action - compacts */}
          <div className="flex gap-2 flex-wrap mb-3 flex-shrink-0">
            <Button 
              onClick={generateTreasure} 
              disabled={isGenerating}
              className="flex items-center gap-1 h-8 px-3 text-sm"
              size="sm"
            >
              <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Génération...' : 'Générer le Trésor'}
            </Button>
            
            {treasureData && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(formatTreasureForExport())}
                  className="flex items-center gap-1 h-8 px-3 text-sm"
                >
                  <Copy className="h-3 w-3" />
                  Copier
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([formatTreasureForExport()], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `tresor-${encounterName.toLowerCase().replace(/\s+/g, '-')}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1 h-8 px-3 text-sm"
                >
                  <Download className="h-3 w-3" />
                  Télécharger
                </Button>
              </>
            )}
          </div>

          {/* Résultats - Layout optimisé sans scroll */}
          {treasureData && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-3">
                {/* Colonne 1: Trésors individuels */}
                {treasureData.individualTreasures.length > 0 && (
                  <div className="min-h-0 overflow-y-auto">
                    <Card className="h-fit">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-blue-500" />
                          Trésors Individuels
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {treasureData.individualTreasures.map(({ monster, treasure }, index) => (
                          <CompactTreasureDisplay
                            key={index}
                            treasure={treasure}
                            title={monster}
                            subtitle={`CR ${monsters.find(m => m.name === monster)?.cr || '?'}`}
                            onOpenMagicItem={openMagicItemDetails}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Colonne 2: Trésor de réserve */}
                {treasureData.hoardTreasure && (
                  <div className="min-h-0 overflow-y-auto">
                    <Card className="h-fit">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          Trésor de Réserve
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CompactTreasureDisplay
                          treasure={treasureData.hoardTreasure}
                          title="Trésor Principal"
                          subtitle={`Valeur totale : ${Math.round(treasureData.hoardTreasure.totalValue)} po`}
                          onOpenMagicItem={openMagicItemDetails}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Colonne 3: Résumé et détails */}
                <div className="min-h-0 overflow-y-auto space-y-3">
                  {/* Résumé total */}
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-yellow-800 text-sm">Résumé</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-xs">
                        {/* Valeur totale */}
                        <div className="text-center p-2 bg-yellow-100 rounded">
                          <div className="font-bold text-yellow-800 text-sm">
                            {Math.round(treasureData.individualTreasures.reduce((sum, {treasure}) => 
                              sum + treasure.totalValue, 0) + (treasureData.hoardTreasure?.totalValue || 0)
                            )} po
                          </div>
                          <div className="text-yellow-700">Valeur totale</div>
                        </div>
                        
                        {/* Compteurs détaillés */}
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-pink-700">
                              {treasureData.individualTreasures.reduce((sum, {treasure}) => 
                                sum + treasure.magicItems.length, 0) + (treasureData.hoardTreasure?.magicItems.length || 0)}
                            </div>
                            <div className="text-pink-600">✨ Magiques</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-blue-700">
                              {(treasureData.hoardTreasure?.gemstones.length || 0)}
                            </div>
                            <div className="text-blue-600">💎 Gemmes</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-700">
                              {(treasureData.hoardTreasure?.artObjects.length || 0)}
                            </div>
                            <div className="text-purple-600">👑 Art</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-orange-700">
                              {treasureData.individualTreasures.reduce((sum, {treasure}) => 
                                sum + treasure.specialRewards.length, 0) + (treasureData.hoardTreasure?.specialRewards.length || 0)}
                            </div>
                            <div className="text-orange-600">🎁 Spéciaux</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Détails des objets spéciaux */}
                  {treasureData.hoardTreasure && (
                    <QuickDetailsPanel treasure={treasureData.hoardTreasure} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Message initial */}
          {!treasureData && !isGenerating && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Coins className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Prêt à générer le trésor</h3>
                <p className="text-gray-600 mb-4">
                  Cliquez sur "Générer le Trésor" pour calculer automatiquement le butin 
                  selon les tables du DMG en fonction du CR des monstres et du niveau du groupe.
                </p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>• Trésors individuels</span>
                  <span>• Trésor de réserve</span>
                  <span>• Objets magiques</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
      
      {/* Modal pour les détails des objets magiques */}
      {magicItemModal.itemData && (
        <MagicItemModal
          isOpen={magicItemModal.isOpen}
          onClose={magicItemModal.closeModal}
          itemName={magicItemModal.itemData.name}
          itemUrl={magicItemModal.itemData.url}
          itemType={magicItemModal.itemData.type}
          itemRarity={magicItemModal.itemData.rarity}
          itemDescription={magicItemModal.itemData.description}
        />
      )}
    </Dialog>
  );
};

// Composant pour afficher un trésor
const TreasureDisplay: React.FC<TreasureDisplayProps> = ({
  treasure,
  title,
  subtitle,
  showDetails = false,
  onToggleDetails
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'very_rare': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      case 'artifact': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGemTypeColor = (type: string) => {
    switch (type) {
      case 'ornamental': return 'bg-amber-100 text-amber-800';
      case 'semi-precious': return 'bg-emerald-100 text-emerald-800';
      case 'precious': return 'bg-blue-100 text-blue-800';
      case 'rare': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (treasure.totalValue === 0 && treasure.magicItems.length === 0) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="font-medium text-gray-700">{title}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
        <Badge variant="secondary">Aucun trésor</Badge>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{title}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
          <div className="text-sm font-medium text-green-600">
            {treasure.description}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {treasure.totalValue > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              {Math.round(treasure.totalValue)} po
            </Badge>
          )}
          
          {onToggleDetails && (treasure.gemstones.length > 0 || treasure.artObjects.length > 0 || treasure.magicItems.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDetails}
              className="flex items-center gap-1"
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDetails ? 'Masquer' : 'Détails'}
            </Button>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="space-y-4 pt-2 border-t">
          {/* Pièces détaillées */}
          {(treasure.coins.copper || treasure.coins.silver || treasure.coins.electrum || treasure.coins.gold || treasure.coins.platinum) && (
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                Pièces
              </h4>
              <div className="flex gap-2 flex-wrap">
                {treasure.coins.platinum > 0 && <Badge variant="outline">🪙 {treasure.coins.platinum} pp</Badge>}
                {treasure.coins.gold > 0 && <Badge variant="outline">🪙 {treasure.coins.gold} po</Badge>}
                {treasure.coins.electrum > 0 && <Badge variant="outline">🪙 {treasure.coins.electrum} pe</Badge>}
                {treasure.coins.silver > 0 && <Badge variant="outline">🪙 {treasure.coins.silver} pa</Badge>}
                {treasure.coins.copper > 0 && <Badge variant="outline">🪙 {treasure.coins.copper} pc</Badge>}
              </div>
            </div>
          )}

          {/* Gemmes */}
          {treasure.gemstones.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Gem className="h-4 w-4 text-blue-600" />
                Gemmes ({treasure.gemstones.length})
              </h4>
              <div className="space-y-2">
                {treasure.gemstones.map((gem, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{gem.name}</div>
                      <div className="text-xs text-gray-600">{gem.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getGemTypeColor(gem.type)} variant="secondary">
                        {gem.type}
                      </Badge>
                      <Badge variant="outline">{gem.value} po</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objets d'art */}
          {treasure.artObjects.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Crown className="h-4 w-4 text-purple-600" />
                Objets d'art ({treasure.artObjects.length})
              </h4>
              <div className="space-y-2">
                {treasure.artObjects.map((art, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="font-medium text-sm">{art.name}</div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRarityColor(art.rarity)} variant="secondary">
                        {art.rarity}
                      </Badge>
                      <Badge variant="outline">{art.value} po</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objets magiques */}
          {treasure.magicItems.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Objets magiques ({treasure.magicItems.length})
              </h4>
              <div className="space-y-2">
                {treasure.magicItems.map((item, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded border border-purple-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRarityColor(item.rarity)} variant="secondary">
                          {item.rarity}
                        </Badge>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Composant compact pour afficher un trésor sans détails
const CompactTreasureDisplay: React.FC<{
  treasure: TreasureResult;
  title: string;
  subtitle?: string;
  onOpenMagicItem?: (item: any) => void;
}> = ({ treasure, title, subtitle, onOpenMagicItem }) => {
  const hasAnyTreasure = treasure.totalValue > 0 || 
                        treasure.magicItems.length > 0 || 
                        treasure.gemstones.length > 0 || 
                        treasure.artObjects.length > 0 || 
                        treasure.specialRewards.length > 0;
                        
  if (!hasAnyTreasure) {
    return (
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
        <div>
          <div className="font-medium text-gray-700">{title}</div>
          {subtitle && <div className="text-gray-500">{subtitle}</div>}
        </div>
        <Badge variant="secondary" className="text-xs">Aucun trésor trouvé</Badge>
      </div>
    );
  }

  return (
    <div className="p-2 border rounded text-xs space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{title}</div>
          {subtitle && <div className="text-gray-500">{subtitle}</div>}
        </div>
        {treasure.totalValue > 0 && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
            {Math.round(treasure.totalValue)} po
          </Badge>
        )}
      </div>
      
      {/* Affichage détaillé de tous les objets */}
      <div className="space-y-1">
        {/* Pièces */}
        {(treasure.coins.copper || treasure.coins.silver || treasure.coins.electrum || treasure.coins.gold || treasure.coins.platinum) && (
          <div className="text-xs">
            <span className="text-green-600 font-medium">💰 Pièces : </span>
            <span className="text-gray-700">{treasure.description}</span>
          </div>
        )}
        
                 {/* Objets magiques */}
         {treasure.magicItems.length > 0 && (
           <div className="text-xs">
             <span className="text-pink-600 font-medium">✨ Objets magiques :</span>
             <div className="ml-4 space-y-1">
               {treasure.magicItems.map((item, index) => (
                 <div key={index} className="flex items-center gap-1">
                   <span className="text-gray-700">• {item.name}</span>
                   <Badge variant="outline" className="text-xs bg-pink-50">{item.rarity}</Badge>
                   {item.url && onOpenMagicItem && (
                     <button
                       onClick={() => onOpenMagicItem(item)}
                       className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                       title="Voir les détails"
                     >
                       <ExternalLink className="h-3 w-3" />
                     </button>
                   )}
                 </div>
               ))}
             </div>
           </div>
         )}
        
        {/* Gemmes */}
        {treasure.gemstones.length > 0 && (
          <div className="text-xs">
            <span className="text-blue-600 font-medium">💎 Gemmes :</span>
            <div className="ml-4">
              {treasure.gemstones.map((gem, index) => (
                <div key={index} className="text-gray-700">
                  • {gem.name} ({gem.value} po)
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Objets d'art */}
        {treasure.artObjects.length > 0 && (
          <div className="text-xs">
            <span className="text-purple-600 font-medium">👑 Objets d'art :</span>
            <div className="ml-4">
              {treasure.artObjects.map((art, index) => (
                <div key={index} className="text-gray-700">
                  • {art.name} ({art.value} po)
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Récompenses spéciales */}
        {treasure.specialRewards.length > 0 && (
          <div className="text-xs">
            <span className="text-orange-600 font-medium">🎁 Récompenses spéciales :</span>
            <div className="ml-4">
              {treasure.specialRewards.map((reward, index) => (
                <div key={index} className="text-gray-700">
                  • {reward.name} ({reward.type})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Panneau de détails rapides pour les objets spéciaux
const QuickDetailsPanel: React.FC<{ treasure: TreasureResult }> = ({ treasure }) => {
  return (
    <div className="space-y-2">
      {/* Gemmes */}
      {treasure.gemstones.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs flex items-center gap-1">
              <Gem className="h-3 w-3 text-blue-600" />
              Gemmes ({treasure.gemstones.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {treasure.gemstones.slice(0, 3).map((gem, index) => (
              <div key={index} className="text-xs">
                <span className="font-medium">{gem.name}</span>
                <span className="text-gray-600 ml-1">({gem.value} po)</span>
              </div>
            ))}
            {treasure.gemstones.length > 3 && (
              <div className="text-xs text-gray-500">
                +{treasure.gemstones.length - 3} autres...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Objets d'art */}
      {treasure.artObjects.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs flex items-center gap-1">
              <Crown className="h-3 w-3 text-purple-600" />
              Objets d'art ({treasure.artObjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {treasure.artObjects.slice(0, 2).map((art, index) => (
              <div key={index} className="text-xs">
                <div className="font-medium truncate">{art.name}</div>
                <span className="text-gray-600">({art.value} po)</span>
              </div>
            ))}
            {treasure.artObjects.length > 2 && (
              <div className="text-xs text-gray-500">
                +{treasure.artObjects.length - 2} autres...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Objets magiques */}
      {treasure.magicItems.length > 0 && (
        <Card className="bg-pink-50 border-pink-200">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-pink-600" />
              Objets magiques ({treasure.magicItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {treasure.magicItems.map((item, index) => (
              <div key={index} className="text-xs">
                <div className="font-medium">{item.name}</div>
                <div className="text-gray-600 truncate">{item.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Récompenses spéciales */}
      {treasure.specialRewards.length > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs flex items-center gap-1">
              <Gift className="h-3 w-3 text-orange-600" />
              Récompenses spéciales ({treasure.specialRewards.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {treasure.specialRewards.map((reward, index) => (
              <div key={index} className="text-xs border-l-2 border-orange-300 pl-2">
                <div className="flex items-center gap-1 mb-1">
                  <div className="font-medium">{reward.name}</div>
                                     <Badge variant="outline" className="text-xs bg-gray-100">
                     {reward.rarity}
                   </Badge>
                  {getSpecialRewardIcon(reward.type)}
                </div>
                <div className="text-gray-600 mb-1">{reward.description}</div>
                {reward.requirements && (
                  <div className="text-xs text-orange-700 italic">
                    Requis: {reward.requirements}
                  </div>
                )}
                {reward.value !== undefined && reward.value > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    Valeur: {reward.value} po
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Fonction pour obtenir l'icône selon le type de récompense spéciale
const getSpecialRewardIcon = (type: SpecialReward['type']) => {
  switch (type) {
    case 'information': return <Scroll className="h-3 w-3 text-blue-600" />;
    case 'service': return <Star className="h-3 w-3 text-green-600" />;
    case 'territory': return <MapPin className="h-3 w-3 text-purple-600" />;
    case 'social': return <Users className="h-3 w-3 text-indigo-600" />;
    case 'cursed': return <Skull className="h-3 w-3 text-red-600" />;
    case 'unique': return <Crown className="h-3 w-3 text-yellow-600" />;
    case 'recipe': return <Sparkles className="h-3 w-3 text-pink-600" />;
    case 'map': return <MapPin className="h-3 w-3 text-teal-600" />;
    case 'deed': return <Scroll className="h-3 w-3 text-amber-600" />;
    case 'favor': return <Heart className="h-3 w-3 text-rose-600" />;
    default: return <Gift className="h-3 w-3 text-gray-600" />;
  }
};

export { TreasureModal, TreasureDisplay, CompactTreasureDisplay, QuickDetailsPanel };
export default TreasureModal; 