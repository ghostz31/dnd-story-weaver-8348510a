import React, { useState } from 'react';
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Heart, Plus, Minus, Pencil, Scroll, Zap, Droplets, Eye, EyeOff, Smile, Users, Link, Snowflake, Clock, Ghost, Anchor, ArrowDown, Brain, Footprints, ShieldX, Save, RotateCcw, ChevronLeft, ChevronRight, Dice4, User, Calendar, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import FloatingGrimoireBubble from './FloatingGrimoireBubble';
import SpellBrowser from './SpellBrowser';
import { useAuth } from '../auth/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TrackerTable from './encounter/TrackerTable';
import TurnControls from './encounter/TurnControls';
import CombatLog from './encounter/CombatLog';
import { HpEditor, InitiativeEditor, NotesEditor } from './encounter/StatEditors';
import { useEncounterManager } from '../hooks/useEncounterManager';
import { getConditionInfo, extractNumericHP, calculateXPFromCR } from '@/lib/EncounterUtils';
import { EncounterParticipant, EncounterMonster, EncounterCondition } from '../lib/types';
import ActiveCombatantDisplay from './ActiveCombatantDisplay';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../hooks/use-toast';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import EncounterDifficultyGauge from './EncounterDifficultyGauge';



const EncounterTracker: React.FC = () => {
  const {
    encounter,
    setEncounter,
    sortedParticipants,
    isLoadingEncounter,
    isSaving,
    quickInitiativeMode,
    setQuickInitiativeMode,
    selectedParticipantId,
    setSelectedParticipantId,
    currentMonsterDetails,
    selectedCreatureUrl,
    showCreatureFrame,
    setShowCreatureFrame,
    actions
  } = useEncounterManager();

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const navigate = useNavigate();

  // Local UI State for Dialogs
  const [hpEditorOpen, setHpEditorOpen] = useState(false);
  const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<EncounterParticipant | null>(null);
  const [grimoireOpen, setGrimoireOpen] = useState(false);
  const [newPC, setNewPC] = useState<{
    name: string;
    initiative: number;
    ac: number;
    hp: number;
  }>({
    name: '',
    initiative: 10,
    ac: 10,
    hp: 10
  });
  const [addPlayerDialogOpen, setAddPlayerDialogOpen] = useState(false);

  // Local UI State for TrackerTable
  const [hpModifierValue, setHpModifierValue] = useState(0);
  const [showHpModifier, setShowHpModifier] = useState<string | null>(null);

  // Handlers for Editors
  const openHpEditor = (participant: EncounterParticipant) => {
    setEditingParticipant(participant);
    setHpEditorOpen(true);
  };

  const saveHpChanges = () => {
    if (!editingParticipant) return;
    actions.updateParticipant(editingParticipant.id, {
      currentHp: editingParticipant.currentHp,
      maxHp: editingParticipant.maxHp
    });
    setHpEditorOpen(false);
    setEditingParticipant(null);
  };

  const openInitiativeEditor = (participant: EncounterParticipant) => {
    setEditingParticipant(participant);
    setInitiativeDialogOpen(true);
  };

  const saveInitiativeChanges = () => {
    if (!editingParticipant) return;
    actions.updateParticipant(editingParticipant.id, {
      initiative: editingParticipant.initiative,
      initiativeModifier: editingParticipant.initiativeModifier
    });
    setInitiativeDialogOpen(false);
    setEditingParticipant(null);
  };

  const openNotesEditor = (participant: EncounterParticipant) => {
    setEditingParticipant(participant);
    setNotesDialogOpen(true);
  };

  const saveNotesChanges = () => {
    if (!editingParticipant) return;
    actions.updateParticipant(editingParticipant.id, {
      notes: editingParticipant.notes
    });
    setNotesDialogOpen(false);
    setEditingParticipant(null);
  };

  const toggleCondition = (participantId: string, conditionName: string) => {
    const p = encounter.participants.find(part => part.id === participantId);
    if (!p) return;

    const exists = p.conditions.some(c => (typeof c === 'string' ? c : c.name) === conditionName);

    let newConditions: EncounterCondition[];

    if (exists) {
      newConditions = p.conditions.filter(c => (typeof c === 'string' ? c : c.name) !== conditionName) as EncounterCondition[];
    } else {
      const newCondition: EncounterCondition = {
        id: uuidv4(),
        name: conditionName,
        duration: -1
      };
      // Handle migration if mixed
      const currentConditions = p.conditions.map(c => typeof c === 'string' ? { id: uuidv4(), name: c, duration: -1 } : c);
      newConditions = [...currentConditions, newCondition];
    }

    actions.updateParticipant(participantId, { conditions: newConditions });
  };

  const handleAddPlayer = () => {
    if (newPC.name) {
      actions.addPlayerCharacter(newPC);
      setNewPC({ name: '', initiative: 10, ac: 10, hp: 10 });
      setAddPlayerDialogOpen(false);
      toast({ title: "Ajouté", description: `${newPC.name} a rejoint le combat.` });
    }
  };

  const handleLinkDndBeyond = (id: string, url: string) => {
    const match = url.match(/characters\/(\d+)/);
    const dndBeyondId = match ? match[1] : null;
    if (dndBeyondId) {
      actions.updateParticipant(id, { dndBeyondId });
      toast({ title: "Lié", description: "Personnage lié à D&D Beyond." });
    }
  };

  const handleUpdateActiveParticipant = (updates: Partial<EncounterParticipant>) => {
    const active = sortedParticipants[encounter.currentTurn];
    if (active) {
      actions.updateParticipant(active.id, updates);
    }
  };

  return (
    <div className="w-full px-2 mx-auto py-2">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold">
            {encounter.name}
            {encounter.participants.length > 0 && (
              <Badge className="ml-2 bg-blue-600">
                Tour {encounter.round}, Initiative {encounter.currentTurn + 1}/{sortedParticipants.length}
              </Badge>
            )}
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-500">
              {encounter.participants.filter(p => p.isPC).length} personnages, {encounter.participants.filter(p => !p.isPC).length} monstres
            </p>
            {/* Jauge de difficulté */}
            <EncounterDifficultyGauge
              party={{
                id: encounter.party?.id || 'temp',
                name: encounter.party?.name || 'Party',
                players: encounter.participants.filter(p => p.isPC).map(p => ({
                  id: p.id,
                  name: p.name,
                  level: p.level || 1,
                  characterClass: 'Unknown'
                })),
                createdAt: '',
                updatedAt: ''
              }}
              monsters={encounter.participants.filter(p => !p.isPC).map(p => ({
                monster: {
                  ...p,
                  type: p.type || 'Inconnu',
                  size: p.size || 'M',
                  source: 'Custom',
                  cr: typeof p.cr === 'number' ? p.cr : 0,
                  xp: (typeof p.cr === 'number' || typeof p.cr === 'string')
                    ? calculateXPFromCR(p.cr)
                    : (p.xp || 0),
                  speed: {},
                  legendaryActions: undefined
                },
                quantity: 1
              }))}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={actions.rollInitiativeForAll}
          >
            <Dice4 className="h-4 w-4 mr-1" />
            Lancer l'initiative
          </Button>

          {encounter.participants.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={actions.previousTurn}
                disabled={encounter.participants.length === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Tour précédent
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={actions.nextTurn}
                disabled={encounter.participants.length === 0}
              >
                <ChevronRight className="h-4 w-4 mr-1" />
                Tour suivant
              </Button>
            </>
          )}

          {isAuthenticated && params.encounterId && (
            <Button
              variant="outline"
              size="sm"
              onClick={actions.saveCurrentEncounterState}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={actions.resetEncounter}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Résumé du tour actuel */}
      {encounter.participants.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-blue-800">
                Tour de {sortedParticipants[encounter.currentTurn]?.name || "?"}
              </h2>
              <p className="text-sm text-blue-700">
                {sortedParticipants[encounter.currentTurn]?.isPC ? "Personnage joueur" : "Monstre"} •
                Initiative: {sortedParticipants[encounter.currentTurn]?.initiative || "?"} •
                CA: {sortedParticipants[encounter.currentTurn]?.ac || "?"} •
                PV: {sortedParticipants[encounter.currentTurn]?.currentHp || 0}/{extractNumericHP(sortedParticipants[encounter.currentTurn]?.maxHp) || 0}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-sm font-semibold text-blue-800">Actions disponibles</div>
              <div className="flex gap-2 mt-1">
                <Badge variant={sortedParticipants[encounter.currentTurn]?.hasUsedAction ? "outline" : "default"}>
                  Action
                </Badge>
                <Badge variant={sortedParticipants[encounter.currentTurn]?.hasUsedBonusAction ? "outline" : "secondary"}>
                  Bonus
                </Badge>
                <Badge variant={sortedParticipants[encounter.currentTurn]?.hasUsedReaction ? "outline" : "destructive"}>
                  Réaction
                </Badge>
                <Badge variant="outline" className="bg-blue-100">
                  Mouvement: {sortedParticipants[encounter.currentTurn]?.remainingMovement || 0}
                </Badge>
              </div>
            </div>
          </div>

          {sortedParticipants[encounter.currentTurn]?.conditions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="text-sm font-semibold text-blue-800">Conditions:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {sortedParticipants[encounter.currentTurn]?.conditions.map(condition => {
                  const conditionName = typeof condition === 'string' ? condition : condition.name;
                  const conditionInfo = getConditionInfo(conditionName);
                  const IconComponent = conditionInfo.icon;
                  return (
                    <Badge key={typeof condition === 'string' ? condition : condition.id} variant="outline" className={`flex items-center gap-1 ${conditionInfo.color}`}>
                      <IconComponent className="h-3 w-3" />
                      {conditionName}
                      {typeof condition !== 'string' && condition.duration > 0 && (
                        <span className="ml-1 text-[10px] bg-blue-200 px-1 rounded">{condition.duration}</span>
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-2">
        <div className="lg:col-span-8">
          <Card className="parchment-card shadow-lg border-primary/10 border-0">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Participants</span>
                <TurnControls
                  quickInitiativeMode={quickInitiativeMode}
                  onToggleQuickInitiative={() => setQuickInitiativeMode(!quickInitiativeMode)}
                  onRollInitiative={actions.rollInitiativeForAll}
                  onPreviousTurn={actions.previousTurn}
                  onNextTurn={actions.nextTurn}
                  hasParticipants={encounter.participants.length > 0}
                />
              </CardTitle>
              <CardDescription>
                Gérez les personnages et les monstres dans cette rencontre
              </CardDescription>
            </CardHeader>

            <CardContent>
              {sortedParticipants.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Aucun participant dans cette rencontre. Ajoutez des personnages ou des monstres pour commencer.
                </div>
              ) : (
                <TrackerTable
                  participants={sortedParticipants}
                  currentTurnParticipantId={sortedParticipants[encounter.currentTurn]?.id}
                  selectedParticipantId={selectedParticipantId}
                  quickInitiativeMode={quickInitiativeMode}
                  hpModifierValue={hpModifierValue}
                  showHpModifier={showHpModifier}
                  onSelect={setSelectedParticipantId}
                  onUpdateHp={actions.updateHp}
                  onMove={actions.moveParticipant}
                  onInitiativeChange={(id, val) => {
                    actions.updateParticipant(id, { initiative: val });
                  }}
                  onOpenInitiativeEditor={openInitiativeEditor}
                  onSetHpModifier={setHpModifierValue}
                  onToggleHpModifier={setShowHpModifier}
                  onToggleCondition={toggleCondition}
                  onOpenNotes={openNotesEditor}
                  onRemove={actions.removeParticipant}
                  onOpenCreatureFrame={actions.openCreatureFrame}
                  onSetTempHp={(id, val) => actions.updateParticipant(id, { tempHp: val })}
                />
              )}

              <div className="mt-4 flex justify-between">
                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <User className="h-4 w-4 mr-1" />
                        Ajouter un personnage
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un personnage</DialogTitle>
                        <DialogDescription>
                          Ajoutez un nouveau personnage joueur à la rencontre
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="pc-name" className="text-right">
                            Nom
                          </Label>
                          <Input
                            id="pc-name"
                            value={newPC.name}
                            onChange={(e) => setNewPC(prev => ({ ...prev, name: e.target.value }))}
                            className="col-span-3"
                            placeholder="Nom du personnage"
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="pc-initiative" className="text-right">
                            Initiative
                          </Label>
                          <Input
                            id="pc-initiative"
                            type="number"
                            value={newPC.initiative}
                            onChange={(e) => setNewPC(prev => ({ ...prev, initiative: parseInt(e.target.value) || 10 }))}
                            className="col-span-3"
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="pc-ac" className="text-right">
                            CA
                          </Label>
                          <Input
                            id="pc-ac"
                            type="number"
                            value={newPC.ac}
                            onChange={(e) => setNewPC(prev => ({ ...prev, ac: parseInt(e.target.value) || 15 }))}
                            className="col-span-3"
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="pc-hp" className="text-right">
                            Points de vie
                          </Label>
                          <Input
                            id="pc-hp"
                            type="number"
                            value={newPC.hp}
                            onChange={(e) => setNewPC(prev => ({ ...prev, hp: parseInt(e.target.value) || 30 }))}
                            className="col-span-3"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button onClick={handleAddPlayer}>Ajouter</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div>
                  {/* Boutons de navigation toujours visibles */}
                  {encounter.participants.length > 0 && (
                    <>
                      <Button
                        onClick={actions.previousTurn}
                        className="mr-2"
                        variant="outline"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Tour précédent
                      </Button>
                      <Button
                        onClick={actions.nextTurn}
                        className="mr-2"
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Tour suivant
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={actions.resetEncounter}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 sticky top-24 h-[calc(100vh-140px)] flex flex-col gap-2">
          {/* Vue du combattant actif (Monstre Iframe ou Joueur Stats) */}
          <div className="flex-1 min-h-0">
            {sortedParticipants.length > 0 ? (
              <ActiveCombatantDisplay
                participant={
                  // Utiliser le participant sélectionné, ou par défaut celui dont c'est le tour
                  selectedParticipantId
                    ? sortedParticipants.find(p => p.id === selectedParticipantId) || sortedParticipants[encounter.currentTurn]
                    : sortedParticipants[encounter.currentTurn]
                }
                className="h-full"
                onLinkDndBeyond={handleLinkDndBeyond}
                onUpdate={handleUpdateActiveParticipant}
              />
            ) : (
              <Card className="h-full flex items-center justify-center p-6 text-center text-gray-500">
                <div>
                  <p>Commencez la rencontre pour voir les détails du combattant actif.</p>
                </div>
              </Card>
            )}
          </div>

          {/* Combat Log */}
          <div className="h-1/3 min-h-[200px]">
            <CombatLog logs={encounter.combatLog || []} />
          </div>
        </div>
      </div>

      {/* Dialogue d'édition des PV */}
      {editingParticipant && (
        <HpEditor
          open={hpEditorOpen}
          onOpenChange={setHpEditorOpen}
          data={{
            id: editingParticipant.id,
            name: editingParticipant.name,
            currentHp: editingParticipant.currentHp,
            maxHp: editingParticipant.maxHp
          }}
          onDataChange={(data) => setEditingParticipant(prev => prev ? ({ ...prev, currentHp: data.currentHp, maxHp: data.maxHp }) : null)}
          onSave={saveHpChanges}
        />
      )}

      {/* Dialogue d'édition de l'initiative */}
      {editingParticipant && (
        <InitiativeEditor
          open={initiativeDialogOpen}
          onOpenChange={setInitiativeDialogOpen}
          data={{
            id: editingParticipant.id,
            name: editingParticipant.name,
            initiative: editingParticipant.initiative,
            modifier: editingParticipant.initiativeModifier || 0
          }}
          onDataChange={(data) => setEditingParticipant(prev => prev ? ({ ...prev, initiative: data.initiative, initiativeModifier: data.modifier }) : null)}
          onSave={saveInitiativeChanges}
        />
      )}

      {/* Dialogue d'édition des notes */}
      {editingParticipant && (
        <NotesEditor
          open={notesDialogOpen}
          onOpenChange={setNotesDialogOpen}
          data={{
            id: editingParticipant.id,
            name: editingParticipant.name,
            notes: editingParticipant.notes
          }}
          onDataChange={(data) => setEditingParticipant(prev => prev ? ({ ...prev, notes: data.notes }) : null)}
          onSave={saveNotesChanges}
        />
      )}

      {/* Boutons flottants pour la sauvegarde */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <Button
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={actions.saveCurrentEncounterState}
          disabled={isSaving}
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <Save className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={() => window.history.back()}
        >
          <Calendar className="h-6 w-6" />
        </Button>
      </div>


      {/* Sheet du Grimoire */}
      <Sheet open={grimoireOpen} onOpenChange={setGrimoireOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Scroll className="h-5 w-5" /> Grimoire
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-80px)]">
            <SpellBrowser className="h-full" />
          </div>
        </SheetContent>
      </Sheet>

      {/* Bulle flottante du Grimoire */}
      <FloatingGrimoireBubble onOpen={() => setGrimoireOpen(true)} />
    </div >
  );
};

export default EncounterTracker; 