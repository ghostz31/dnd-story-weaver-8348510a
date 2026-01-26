import React, { useState } from 'react';
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Sword, Shield, Heart, Plus, Minus, Pencil, Scroll, Zap, Droplets, Eye, EyeOff, Smile, Users, Link, Snowflake, Clock, Ghost, Anchor, ArrowDown, Brain, Footprints, ShieldX, Save, RotateCcw, ChevronLeft, ChevronRight, Dice4, User, Calendar, Trash2, Share2, Folder, FolderPlus, FolderOpen, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import FloatingGrimoireBubble from './FloatingGrimoireBubble';
import SpellBrowser from './SpellBrowser';
import { useAuth } from '../auth/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { subscribeToFolders, createFolder, moveEncounterToFolder } from '../lib/firebaseApi';
import { shareEncounter, getShareUrl } from '../lib/sharingApi';
import { EncounterFolder } from '../lib/types';
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

  // Sharing & Folders State
  const [folders, setFolders] = useState<EncounterFolder[]>([]);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);

  // Subscribe to folders
  React.useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = subscribeToFolders((foldersData) => {
        setFolders(foldersData);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Handlers for Sharing & Folders
  const handleShare = async () => {
    if (!encounter.id || encounter.id === 'temp' || !params.encounterId) {
      toast({ title: "Impossible", description: "Sauvegardez la rencontre avant de la partager.", variant: "destructive" });
      return;
    }

    try {
      setSharingId(encounter.id);
      const shareCode = await shareEncounter(encounter.id);
      const shareUrl = getShareUrl(shareCode);
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Lien copié !",
        description: `Code: ${shareCode}. Lien dans le presse-papiers.`
      });
    } catch (error) {
      console.error('Partage erreur:', error);
      toast({ title: "Erreur", description: "Échec du partage.", variant: "destructive" });
    } finally {
      setSharingId(null);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      setIsCreatingFolder(true);
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setCreateFolderDialogOpen(false);
      toast({ title: "Succès", description: `Dossier "${newFolderName}" créé.` });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de créer le dossier.", variant: "destructive" });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleMoveToFolder = async (folderId: string | null) => {
    if (!encounter.id || encounter.id === 'temp') return;
    try {
      await moveEncounterToFolder(encounter.id, folderId);
      setEncounter(prev => ({ ...prev, folderId: folderId || undefined }));
      toast({ title: "Déplacé", description: folderId ? "Rencontre déplacée." : "Rencontre retirée du dossier." });
    } catch (error) {
      toast({ title: "Erreur", description: "Échec du déplacement.", variant: "destructive" });
    }
  };

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
      currentHp: typeof editingParticipant.currentHp === 'string' ? parseInt(editingParticipant.currentHp as string) || 0 : editingParticipant.currentHp,
      maxHp: typeof editingParticipant.maxHp === 'string' && /^\d+$/.test(editingParticipant.maxHp as string) ? parseInt(editingParticipant.maxHp as string) : editingParticipant.maxHp
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
      {/* Header - Responsive */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
        <div className="min-w-0">
          <h1 className="text-lg md:text-2xl font-bold truncate">
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

        {/* Action buttons - horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mb-1">
          <Button
            variant="outline"
            size="sm"
            onClick={actions.rollInitiativeForAll}
            className="touch-target whitespace-nowrap flex-shrink-0"
          >
            <Dice4 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Lancer l'</span>initiative
          </Button>

          {encounter.participants.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={actions.previousTurn}
                disabled={encounter.participants.length === 0}
                className="touch-target whitespace-nowrap flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Précédent</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={actions.nextTurn}
                disabled={encounter.participants.length === 0}
                className="touch-target whitespace-nowrap flex-shrink-0"
              >
                <span className="hidden sm:inline mr-1">Suivant</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {isAuthenticated && params.encounterId && (
            <Button
              variant="outline"
              size="sm"
              onClick={actions.saveCurrentEncounterState}
              disabled={isSaving}
              className="touch-target whitespace-nowrap flex-shrink-0"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">{isSaving ? "Sauvegarde..." : "Sauvegarder"}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={actions.resetEncounter}
            className="touch-target whitespace-nowrap flex-shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Réinitialiser</span>
          </Button>

          {isAuthenticated && encounter.id && encounter.id !== 'temp' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                disabled={!!sharingId}
                className="touch-target whitespace-nowrap flex-shrink-0"
                title="Partager"
              >
                <Share2 className={`h-4 w-4 ${sharingId ? 'animate-pulse' : ''}`} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="touch-target whitespace-nowrap flex-shrink-0" title="Classer">
                    <Folder className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCreateFolderDialogOpen(true)}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Nouveau dossier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleMoveToFolder(null)}>
                    <Folder className="h-4 w-4 mr-2" />
                    Sans dossier
                  </DropdownMenuItem>
                  {folders.map(folder => (
                    <DropdownMenuItem key={folder.id} onClick={() => handleMoveToFolder(folder.id)}>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      {folder.name}
                      {encounter.folderId === folder.id && <Check className="h-3 w-3 ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Dialog creation dossier */}
      <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
            <DialogDescription>Créez un dossier pour organiser vos rencontres.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-folder-name">Nom</Label>
            <Input
              id="new-folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Ex: Campagne finale"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreateFolder} disabled={isCreatingFolder || !newFolderName.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Résumé du tour actuel - Responsive */}
      {encounter.participants.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 md:p-3 mb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-blue-800 dark:text-blue-200 truncate">
                Tour de {sortedParticipants[encounter.currentTurn]?.name || "?"}
              </h2>
              <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                {sortedParticipants[encounter.currentTurn]?.isPC ? "PJ" : "Monstre"} •
                Init: {sortedParticipants[encounter.currentTurn]?.initiative || "?"} •
                CA: {sortedParticipants[encounter.currentTurn]?.ac || "?"} •
                PV: {sortedParticipants[encounter.currentTurn]?.currentHp || 0}/{extractNumericHP(sortedParticipants[encounter.currentTurn]?.maxHp) || 0}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <div className="text-xs font-semibold text-blue-800 dark:text-blue-200 hidden sm:block">Actions disponibles</div>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                <Badge variant={sortedParticipants[encounter.currentTurn]?.hasUsedAction ? "outline" : "default"} className="text-xs">
                  Action
                </Badge>
                <Badge variant={sortedParticipants[encounter.currentTurn]?.hasUsedBonusAction ? "outline" : "secondary"} className="text-xs">
                  Bonus
                </Badge>
                <Badge variant={sortedParticipants[encounter.currentTurn]?.hasUsedReaction ? "outline" : "destructive"} className="text-xs">
                  Réaction
                </Badge>
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-xs">
                  Mvt: {sortedParticipants[encounter.currentTurn]?.remainingMovement || 0}
                </Badge>
              </div>
            </div>
          </div>

          {sortedParticipants[encounter.currentTurn]?.conditions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="text-sm font-semibold text-blue-800">Conditions:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                <TooltipProvider>
                  {sortedParticipants[encounter.currentTurn]?.conditions.map(condition => {
                    const conditionName = typeof condition === 'string' ? condition : condition.name;
                    const conditionInfo = getConditionInfo(conditionName);
                    const IconComponent = conditionInfo.icon;
                    return (
                      <Tooltip key={typeof condition === 'string' ? condition : condition.id}>
                        <TooltipTrigger>
                          <Badge variant="outline" className={`flex items-center gap-1 cursor-help ${conditionInfo.color}`}>
                            <IconComponent className="h-3 w-3" />
                            {conditionName}
                            {typeof condition !== 'string' && condition.duration > 0 && (
                              <span className="ml-1 text-[10px] bg-blue-200 px-1 rounded">{condition.duration}</span>
                            )}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-md bg-stone-900 border-stone-800 text-stone-50 p-3 shadow-xl">
                          <p className="font-bold mb-1">{conditionName}</p>
                          <div className="text-xs whitespace-pre-wrap">{conditionInfo.description}</div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid - Stacked on mobile */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 mb-2">
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

        {/* Sidebar - Full width on mobile, shown below table */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 lg:h-[calc(100vh-140px)] flex flex-col gap-3">
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

          {/* Combat Log - Collapsible on mobile */}
          <div className="lg:h-1/3 lg:min-h-[200px] hidden lg:block">
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

      {/* Boutons flottants pour la sauvegarde - avec safe area */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <Button
          size="icon"
          className="rounded-full h-14 w-14 shadow-lg touch-target"
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
          className="rounded-full h-14 w-14 shadow-lg touch-target bg-background"
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