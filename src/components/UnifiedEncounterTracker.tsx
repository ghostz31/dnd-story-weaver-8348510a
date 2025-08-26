import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { useEncounterState } from '@/hooks/useEncounterState';
import { EncounterService } from '@/services/EncounterService';
import { useToast } from '@/components/ui/use-toast';
import { TestBanner } from '@/components/ui/test-banner';
import { CreatureDetailModal, useCreatureDetailModal } from '@/components/ui/creature-detail-modal';
import { ConditionSelector } from '@/components/ui/condition-selector';
import { TreasureModal } from '@/components/ui/treasure-modal';
import { MagicItemModal, useMagicItemModal } from '@/components/ui/magic-item-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useScreenSize } from '@/components/ui/responsive-layout';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Grid3X3, 
  List, 
  Minimize2,
  Heart,
  Shield,
  Dice4,
  Book,
  Coins,
  Settings,
  RefreshCw,
  Crown,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedEncounterTrackerProps {
  isTestVersion?: boolean;
}

const UnifiedEncounterTracker: React.FC<UnifiedEncounterTrackerProps> = ({ 
  isTestVersion = false 
}) => {
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Hook centralisé pour la gestion d'état
  const { state, actions, selectors } = useEncounterState();
  
  // Hooks pour les modals
  const creatureDetailModal = useCreatureDetailModal();
  const magicItemModal = useMagicItemModal();
  
  // Charger les données depuis sessionStorage ou URL
  useEffect(() => {
    const loadEncounterData = () => {
      const searchParams = new URLSearchParams(location.search);
      const source = searchParams.get('source');
      
      if (source === 'session') {
        const savedData = sessionStorage.getItem('currentEncounter');
        if (savedData) {
          try {
            const encounterData = JSON.parse(savedData);
            actions.loadEncounter({
              name: encounterData.name || 'Rencontre',
              participants: encounterData.participants || [],
              currentTurn: 0,
              round: 1
            });
          } catch (error) {
            console.error('Erreur lors du chargement de la rencontre:', error);
            toast({
              title: "Erreur de chargement",
              description: "Impossible de charger les données de la rencontre.",
              variant: "destructive"
            });
          }
        }
      }
    };
    
    loadEncounterData();
  }, [location.search, actions, toast]);
  
  // Fonctions d'action
  const handleNextTurn = () => {
    actions.nextTurn();
    
    // Réinitialiser les actions du participant actuel
    const currentParticipant = selectors.currentParticipant;
    if (currentParticipant) {
      const resetParticipant = EncounterService.resetParticipantActions(currentParticipant);
      actions.updateParticipant(currentParticipant.id, resetParticipant);
    }
  };
  
  const handlePreviousTurn = () => {
    actions.previousTurn();
  };
  
  const handleRollInitiativeForAll = () => {
    state.encounter.participants.forEach(participant => {
      const newInitiative = EncounterService.rollInitiative(participant);
      actions.updateParticipant(participant.id, { initiative: newInitiative });
    });
    
    toast({
      title: "Initiative lancée",
      description: "L'initiative a été relancée pour tous les participants.",
    });
  };
  
  const handleOpenHpEditor = (participant: any) => {
    actions.openHpEditor({
      id: participant.id,
      name: participant.name,
      currentHp: participant.currentHp,
      maxHp: participant.maxHp
    });
  };
  
  const handleSaveHpChanges = (newHp: number) => {
    if (state.modals.hpEditor.participant.id) {
      actions.updateParticipant(state.modals.hpEditor.participant.id, { 
        currentHp: Math.max(0, Math.min(state.modals.hpEditor.participant.maxHp, newHp))
      });
      actions.closeHpEditor();
      
      toast({
        title: "Points de vie mis à jour",
        description: `Les PV ont été modifiés avec succès.`,
      });
    }
  };
  
  const handleOpenMaxHpEditor = () => {
    const participants = state.encounter.participants.map(p => ({
      id: p.id,
      name: p.name,
      currentMaxHp: p.maxHp,
      newMaxHp: p.maxHp,
      isPC: p.isPC
    }));
    actions.openMaxHpEditor(participants);
  };
  
  const handleSaveMaxHpChanges = (updates: Array<{id: string; newMaxHp: number}>) => {
    updates.forEach(({ id, newMaxHp }) => {
      actions.updateParticipant(id, { maxHp: newMaxHp });
    });
    actions.closeMaxHpEditor();
    
    toast({
      title: "PV maximum mis à jour",
      description: "Les PV maximum ont été modifiés avec succès.",
    });
  };
  
  const handleOpenInitiativeEditor = () => {
    const initiatives = state.encounter.participants.map(p => ({
      id: p.id,
      name: p.name,
      initiative: p.initiative,
      modifier: EncounterService.calculateInitiativeModifier(p.dex || 10)
    }));
    actions.openInitiativeEditor(initiatives);
  };
  
  const handleSaveInitiativeChanges = (updates: Array<{id: string; initiative: number}>) => {
    updates.forEach(({ id, initiative }) => {
      actions.updateParticipant(id, { initiative });
    });
    actions.closeInitiativeEditor();
    
    toast({
      title: "Initiative mise à jour",
      description: "L'initiative a été modifiée avec succès.",
    });
  };
  
  const handleToggleCondition = (participantId: string, condition: string) => {
    actions.toggleCondition(participantId, condition);
  };
  
  const handleViewCreatureDetails = (participant: any) => {
    if (participant.originalName || participant.name) {
      creatureDetailModal.openModal(participant.originalName || participant.name);
    }
  };
  
  const handleOpenTreasureModal = () => {
    const monsters = state.encounter.participants
      .filter(p => !p.isPC)
      .map(p => ({
        name: p.name,
        cr: typeof p.cr === 'number' ? p.cr : parseFloat(p.cr || '0.25')
      }));
    
    const players = state.encounter.participants.filter(p => p.isPC);
    const avgLevel = players.length > 0 ? 
      Math.round(players.reduce((sum, p) => sum + (p.level || 1), 0) / players.length) : 5;
    
    actions.openTreasureModal(monsters, avgLevel);
  };
  
  // Rendu des participants selon la vue
  const renderParticipants = () => {
    const sortedParticipants = EncounterService.sortParticipantsByInitiative(state.encounter.participants);
    const currentParticipant = selectors.currentParticipant;
    
    if (state.ui.currentView === 'grid') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sortedParticipants.map((participant, index) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              isActive={currentParticipant?.id === participant.id}
              onEditHp={() => handleOpenHpEditor(participant)}
              onToggleCondition={(condition) => handleToggleCondition(participant.id, condition)}
              onViewDetails={() => handleViewCreatureDetails(participant)}
              onOpenConditionSelector={() => actions.openConditionSelector(participant.id)}
            />
          ))}
        </div>
      );
    }
    
    if (state.ui.currentView === 'compact') {
      return (
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 w-[50px]">Tour</th>
                    <th className="text-left p-2">Nom</th>
                    <th className="text-center p-2">Init</th>
                    <th className="text-center p-2">CA</th>
                    <th className="text-center p-2">PV</th>
                    <th className="text-center p-2">État</th>
                    <th className="text-center p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedParticipants.map((participant, index) => {
                    const hpPercentage = (participant.currentHp / participant.maxHp) * 100;
                    const isAlive = participant.currentHp > 0;
                    const isBloodied = hpPercentage <= 50 && hpPercentage > 0;
                    const isActive = currentParticipant?.id === participant.id;
                    
                    return (
                      <tr 
                        key={participant.id}
                        className={`border-b hover:bg-gray-50 ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''} ${!isAlive ? 'opacity-50' : ''}`}
                      >
                        <td className="p-2 text-center">
                          {isActive && <Crown className="h-4 w-4 text-yellow-500 mx-auto" />}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${participant.isPC ? 'bg-blue-500' : 'bg-red-500'}`}>
                              {participant.isPC ? 'P' : 'M'}
                            </div>
                            <div>
                              <div className="font-medium">{participant.name}</div>
                              {participant.isPC ? (
                                <Badge variant="outline" className="text-xs">PJ</Badge>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  {participant.cr && (
                                    <Badge variant="outline" className="text-xs">CR {participant.cr}</Badge>
                                  )}
                                  {participant.type && (
                                    <span className="text-xs text-gray-500">{participant.type}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-center font-mono">{participant.initiative}</td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>{participant.ac}</span>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span className="font-mono">{participant.currentHp}/{participant.maxHp}</span>
                            </div>
                            <div className="w-12 bg-gray-200 rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full transition-all ${!isAlive ? 'bg-gray-400' : hpPercentage <= 25 ? 'bg-red-500' : hpPercentage <= 50 ? 'bg-orange-500' : hpPercentage <= 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.max(0, hpPercentage)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {participant.conditions && participant.conditions.map((condition, idx) => (
                              <Badge 
                                key={idx}
                                variant="outline" 
                                className="text-xs cursor-pointer"
                                onClick={() => handleToggleCondition(participant.id, condition)}
                              >
                                {condition}
                              </Badge>
                            ))}
                            {!isAlive && <Badge variant="destructive" className="text-xs">Mort</Badge>}
                            {isBloodied && isAlive && <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Ensanglanté</Badge>}
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0"
                              onClick={() => handleOpenHpEditor(participant)}
                            >
                              <Heart className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0"
                              onClick={() => actions.openConditionSelector(participant.id)}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                            {!participant.isPC && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0"
                                onClick={() => handleViewCreatureDetails(participant)}
                              >
                                <Book className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {sortedParticipants.map((participant, index) => (
          <ParticipantRow
            key={participant.id}
            participant={participant}
            isActive={currentParticipant?.id === participant.id}
            onEditHp={() => handleOpenHpEditor(participant)}
            onToggleCondition={(condition) => handleToggleCondition(participant.id, condition)}
            onViewDetails={() => handleViewCreatureDetails(participant)}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className={cn("min-h-screen bg-gray-100", isMobile && "pb-safe")}>
      {/* Header mobile sticky */}
      {isMobile && (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {state.encounter.name}
              </h1>
              <Badge variant="outline" className="text-xs">
                Tour {state.encounter.round}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {state.encounter.participants.length > 0 && (
                <div className="flex space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => actions.previousTurn()}
                    className="h-8 w-8 p-0"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => actions.nextTurn()}
                    className="h-8 w-8 p-0"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Ouvrir menu mobile */}}
                className="h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Interface desktop */}
      {!isMobile && (
        <>
          {/* Bannière de test */}
          {isTestVersion && (
            <TestBanner
              title="Tracker de Rencontre - Version Test"
              description="Interface redesignée avec gestion d'état optimisée"
              features={[
                "État centralisé avec useReducer",
                "Service layer pour la logique métier",
                "Composant unifié et réutilisable",
                "Performance optimisée"
              ]}
            />
          )}
          
          {/* En-tête avec contrôles */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Dice4 className="h-5 w-5" />
                  {state.encounter.name}
                  <Badge variant="outline">
                    Tour {state.encounter.round}
                  </Badge>
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  {/* Contrôles de vue */}
                  <div className="flex border rounded-md">
                    <Button
                      variant={state.ui.currentView === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => actions.setView('grid')}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={state.ui.currentView === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => actions.setView('list')}
                      className="rounded-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={state.ui.currentView === 'compact' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => actions.setView('compact')}
                      className="rounded-l-none"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Actions rapides */}
                  <Button variant="outline" size="sm" onClick={handleRollInitiativeForAll}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Initiative
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleOpenMaxHpEditor}>
                    <Heart className="h-4 w-4 mr-1" />
                    PV Max
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleOpenTreasureModal}>
                    <Coins className="h-4 w-4 mr-1" />
                    Trésor
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </>
      )}
      
      {/* Contenu principal responsive */}
      <div className={cn(
        "mx-auto",
        isMobile ? "px-4 py-2" : "container px-4 py-6"
      )}>
        <div className={cn(
          isMobile ? "space-y-4" : "space-y-6"
        )}>
          {/* Participants */}
          <Card>
            <CardContent className={cn(
              isMobile ? "p-3" : "pt-0"
            )}>
              {renderParticipants()}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modals */}
      <HpEditorModal
        isOpen={state.modals.hpEditor.isOpen}
        participant={state.modals.hpEditor.participant}
        onClose={actions.closeHpEditor}
        onSave={handleSaveHpChanges}
      />
      
      <MaxHpEditorModal
        isOpen={state.modals.maxHpEditor.isOpen}
        participants={state.modals.maxHpEditor.participants}
        onClose={actions.closeMaxHpEditor}
        onSave={handleSaveMaxHpChanges}
      />
      
      <InitiativeEditorModal
        isOpen={state.modals.initiativeEditor.isOpen}
        initiatives={state.modals.initiativeEditor.initiatives}
        onClose={actions.closeInitiativeEditor}
        onSave={handleSaveInitiativeChanges}
      />
      
      <ConditionSelector
        isOpen={state.modals.conditionSelector.isOpen}
        onClose={actions.closeConditionSelector}
        participantName={state.encounter.participants.find(p => p.id === state.modals.conditionSelector.participantId)?.name || ''}
        currentConditions={state.encounter.participants.find(p => p.id === state.modals.conditionSelector.participantId)?.conditions || []}
        onToggleCondition={(condition) => 
          state.modals.conditionSelector.participantId && 
          handleToggleCondition(state.modals.conditionSelector.participantId, condition)
        }
      />
      
      <TreasureModal
        isOpen={state.modals.treasure.isOpen}
        onClose={actions.closeTreasureModal}
        monsters={state.modals.treasure.monsters}
        partyLevel={state.modals.treasure.partyLevel}
      />
      
      <creatureDetailModal.CreatureModal />
    </div>
  );
};

// Composants auxiliaires (à implémenter)
const ParticipantCard: React.FC<any> = ({ participant, isActive, onEditHp, onToggleCondition, onViewDetails, onOpenConditionSelector }) => {
  const healthPercentage = (participant.currentHp / participant.maxHp) * 100;
  const isAlive = participant.currentHp > 0;
  const isBloodied = healthPercentage <= 50 && healthPercentage > 0;
  
  const getHealthStatus = () => {
    if (!isAlive) return 'dead';
    if (healthPercentage <= 25) return 'critical';
    if (healthPercentage <= 50) return 'injured';
    return 'healthy';
  };
  
  const healthStatus = getHealthStatus();
  
  const getHpColor = () => {
    if (!isAlive) return 'bg-gray-400';
    if (healthPercentage <= 25) return 'bg-red-500';
    if (healthPercentage <= 50) return 'bg-orange-500';
    if (healthPercentage <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${!isAlive ? 'opacity-60 grayscale' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isActive && (
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${participant.isPC ? 'bg-blue-500' : 'bg-red-500'}`}>
              {participant.isPC ? 'P' : 'M'}
            </div>
            <div>
                             <h3 className="font-semibold text-sm flex items-center gap-1">
                 {participant.name}
                 {isActive && <Crown className="h-3 w-3 text-yellow-500" />}
               </h3>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                {participant.isPC ? (
                  <Badge variant="outline" className="text-xs">PJ</Badge>
                ) : (
                  <>
                    {participant.cr && (
                      <Badge variant="outline" className="text-xs">CR {participant.cr}</Badge>
                    )}
                    {participant.type && (
                      <span className="text-gray-500 truncate">{participant.type}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Badge de statut */}
          {!isAlive && <Badge variant="destructive" className="text-xs">Mort</Badge>}
          {isBloodied && isAlive && <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Ensanglanté</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Barre de vie */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>PV</span>
            <span>{participant.currentHp}/{participant.maxHp}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getHpColor()}`}
              style={{ width: `${Math.max(0, healthPercentage)}%` }}
            />
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>CA {participant.ac}</span>
          </div>
          <div className="flex items-center gap-1">
            <Dice4 className="h-3 w-3" />
            <span>Init {participant.initiative}</span>
          </div>
        </div>
        
        {/* Conditions */}
        {participant.conditions && participant.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {participant.conditions.slice(0, 3).map((condition: string, index: number) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs cursor-pointer"
                onClick={() => onToggleCondition(condition)}
              >
                {condition}
              </Badge>
            ))}
            {participant.conditions.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{participant.conditions.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Notes */}
        {participant.notes && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            {participant.notes}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button size="sm" variant="outline" onClick={onEditHp}>
            <Heart className="h-3 w-3 mr-1" />
            PV
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenConditionSelector}>
            <Settings className="h-3 w-3 mr-1" />
            État
          </Button>
          {!participant.isPC && (
            <Button size="sm" variant="outline" onClick={onViewDetails}>
              <Book className="h-3 w-3 mr-1" />
              Détails
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ParticipantRow: React.FC<any> = ({ participant, isActive, onEditHp, onToggleCondition, onViewDetails }) => {
  const healthPercentage = (participant.currentHp / participant.maxHp) * 100;
  const isAlive = participant.currentHp > 0;
  const isBloodied = healthPercentage <= 50 && healthPercentage > 0;
  
  const getHpColor = () => {
    if (!isAlive) return 'bg-gray-400';
    if (healthPercentage <= 25) return 'bg-red-500';
    if (healthPercentage <= 50) return 'bg-orange-500';
    if (healthPercentage <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <Card className={`p-4 transition-all duration-300 hover:shadow-lg ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${!isAlive ? 'opacity-60 grayscale' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isActive && (
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${participant.isPC ? 'bg-blue-500' : 'bg-red-500'}`}>
              {participant.isPC ? 'P' : 'M'}
            </div>
          </div>
          <div className="flex flex-col">
                         <h3 className="font-semibold flex items-center gap-2">
               {participant.name}
               {isActive && <Crown className="h-4 w-4 text-yellow-500" />}
             </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              {participant.isPC ? (
                <Badge variant="outline" className="text-xs">PJ</Badge>
              ) : (
                <>
                  {participant.cr && (
                    <Badge variant="outline" className="text-xs">CR {participant.cr}</Badge>
                  )}
                  {participant.type && (
                    <span className="text-gray-500">{participant.type}</span>
                  )}
                </>
              )}
            </div>
            {/* Conditions et badges de statut */}
            <div className="flex items-center gap-1 mt-1">
              {participant.conditions && participant.conditions.length > 0 && (
                <div className="flex gap-1">
                  {participant.conditions.map((condition, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="text-xs cursor-pointer"
                      onClick={() => onToggleCondition(condition)}
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              )}
              {!isAlive && <Badge variant="destructive" className="text-xs">Mort</Badge>}
              {isBloodied && isAlive && <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Ensanglanté</Badge>}
            </div>
            {/* Notes */}
            {participant.notes && (
              <div className="text-xs text-gray-500 bg-gray-50 p-1 rounded mt-1 max-w-md">
                {participant.notes}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Dice4 className="h-4 w-4" />
              <span>{participant.initiative}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>{participant.ac}</span>
            </div>
          </div>
          
          {/* Barre de vie */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="font-mono text-sm">{participant.currentHp}/{participant.maxHp}</span>
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getHpColor()}`}
                style={{ width: `${Math.max(0, healthPercentage)}%` }}
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={onEditHp} className="h-8">
              <Heart className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => {}} className="h-8">
              <Settings className="h-3 w-3" />
            </Button>
            {!participant.isPC && (
              <Button size="sm" variant="outline" onClick={onViewDetails} className="h-8">
                <Book className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Modals simplifiés (à compléter)
const HpEditorModal: React.FC<any> = ({ isOpen, participant, onClose, onSave }) => {
  const [newHp, setNewHp] = React.useState(participant.currentHp);
  
  React.useEffect(() => {
    setNewHp(participant.currentHp);
  }, [participant.currentHp]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier les PV - {participant.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="hp">Points de vie</Label>
            <Input
              id="hp"
              type="number"
              value={newHp}
              onChange={(e) => setNewHp(parseInt(e.target.value) || 0)}
              max={participant.maxHp}
              min={0}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={() => onSave(newHp)}>Sauvegarder</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MaxHpEditorModal: React.FC<any> = ({ isOpen, participants, onClose, onSave }) => {
  // À implémenter
  return <div>MaxHp Modal - À implémenter</div>;
};

const InitiativeEditorModal: React.FC<any> = ({ isOpen, initiatives, onClose, onSave }) => {
  // À implémenter
  return <div>Initiative Modal - À implémenter</div>;
};

export default UnifiedEncounterTracker; 