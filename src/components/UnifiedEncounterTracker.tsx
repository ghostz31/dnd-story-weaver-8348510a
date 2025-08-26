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
  RefreshCw
} from 'lucide-react';

interface UnifiedEncounterTrackerProps {
  isTestVersion?: boolean;
}

const UnifiedEncounterTracker: React.FC<UnifiedEncounterTrackerProps> = ({ 
  isTestVersion = false 
}) => {
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
    <div className="container mx-auto px-4 py-6 space-y-6">
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
        
        <CardContent className="pt-0">
          {/* Contrôles de combat */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="outline" onClick={handlePreviousTurn}>
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              {selectors.currentParticipant && (
                <div>
                  <div className="font-semibold">{selectors.currentParticipant.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Initiative: {selectors.currentParticipant.initiative}
                  </div>
                </div>
              )}
            </div>
            
            <Button onClick={handleNextTurn}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Statistiques */}
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold">{selectors.encounterStats.totalParticipants}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="font-semibold">{selectors.encounterStats.playersCount}</div>
              <div className="text-muted-foreground">Joueurs</div>
            </div>
            <div>
              <div className="font-semibold">{selectors.encounterStats.monstersCount}</div>
              <div className="text-muted-foreground">Monstres</div>
            </div>
            <div>
              <div className="font-semibold">{selectors.encounterStats.aliveParticipants}</div>
              <div className="text-muted-foreground">Conscients</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Liste des participants */}
      <Card>
        <CardContent className="p-4">
          {state.encounter.participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dice4 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun participant dans cette rencontre</p>
            </div>
          ) : (
            renderParticipants()
          )}
        </CardContent>
      </Card>
      
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
  const healthPercentage = EncounterService.getHealthPercentage(participant);
  const healthStatus = EncounterService.getHealthStatus(participant);
  const canAct = EncounterService.canParticipantAct(participant);
  
  return (
    <Card className={`${isActive ? 'ring-2 ring-blue-500' : ''} ${!canAct ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm truncate">{participant.name}</CardTitle>
          <Badge variant={participant.isPC ? 'default' : 'secondary'} className="text-xs">
            {participant.isPC ? 'PJ' : `CR ${participant.cr || '?'}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Barre de vie */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>PV</span>
            <span>{participant.currentHp}/{participant.maxHp}</span>
          </div>
          <Progress 
            value={healthPercentage} 
            className={`h-2 ${
              healthStatus === 'critical' ? 'bg-red-100' : 
              healthStatus === 'injured' ? 'bg-yellow-100' : 'bg-green-100'
            }`}
          />
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
              <Badge key={index} variant="outline" className="text-xs">
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
        
        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button size="sm" variant="ghost" onClick={onEditHp} className="h-6 px-2">
            <Heart className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onOpenConditionSelector} className="h-6 px-2">
            <Settings className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onViewDetails} className="h-6 px-2">
            <Book className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ParticipantRow: React.FC<any> = ({ participant, isActive, onEditHp, onToggleCondition, onViewDetails }) => {
  const healthPercentage = (participant.currentHp / participant.maxHp) * 100;
  
  return (
    <Card className={`p-4 ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h3 className="font-semibold">{participant.name}</h3>
            {participant.conditions && participant.conditions.length > 0 && (
              <div className="flex gap-1 mt-1">
                {participant.conditions.map((condition, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Barre de vie */}
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium">
                {participant.currentHp}/{participant.maxHp}
              </span>
              <Progress value={healthPercentage} className="w-20 h-2" />
            </div>
          </div>
          
          {/* CA */}
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span className="text-sm">{participant.ac}</span>
          </div>
          
          {/* Initiative */}
          <div className="flex items-center gap-1">
            <Dice4 className="h-4 w-4" />
            <span className="text-sm">{participant.initiative}</span>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEditHp}>
              <Heart className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onToggleCondition('')}>
              <Settings className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onViewDetails}>
              <Book className="h-3 w-3" />
            </Button>
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