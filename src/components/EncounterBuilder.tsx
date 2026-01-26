import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaMinus, FaTrash, FaSave, FaEdit, FaDragon, FaFolder, FaShareAlt } from 'react-icons/fa';
import { Save, Play, PenTool, X, Share2, Folder, FolderPlus, FolderOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getUserStats, subscribeToFolders, createFolder, moveEncounterToFolder } from '../lib/firebaseApi';
import { shareEncounter, getShareUrl } from '../lib/sharingApi';
import { EncounterFolder } from '../lib/types';
import { getMonsterFromAideDD } from '../lib/api';
import { Monster, Party, Encounter, EncounterMonster, environments, UserStats } from '../lib/types';
import { useEncounterLogic } from '../hooks/useEncounterLogic';
import { useEncounterRepository } from '../hooks/useEncounterRepository';
import { LocalEncounter, normalizeEncounterForEditing, calculateXPFromCR } from '../lib/EncounterUtils';
import MonsterBrowser from './MonsterBrowser';
import EncounterHeader from './encounter/EncounterHeader';
import ParticipantList from './encounter/ParticipantList';
import StatSummary from './encounter/StatSummary';
import InitiativeModal, { InitiativeParticipant } from './encounter/InitiativeModal';

const EncounterBuilder: React.FC = () => {
  console.log("[EncounterBuilder] Rendering...");

  // Data Repository Hook
  const {
    parties,
    encounters,
    loading: isLoadingData,
    saveEncounter,
    deleteEncounter
  } = useEncounterRepository();

  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<LocalEncounter | null>(null);
  const [selectedMonsters, setSelectedMonsters] = useState<EncounterMonster[]>([]);
  const [encounterName, setEncounterName] = useState<string>("");
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showMonsterBrowser, setShowMonsterBrowser] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Folders & Sharing State
  const [folders, setFolders] = useState<EncounterFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null); // For filtering the list
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [localEncounters, setLocalEncounters] = useState<LocalEncounter[]>([]);

  // Sync local encounters with repository data
  useEffect(() => {
    setLocalEncounters(encounters);
  }, [encounters]);

  // Logic Hook
  const { totalXP, adjustedXP, difficulty, xpPerPlayer, difficultyColor } = useEncounterLogic(selectedMonsters, selectedParty);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);

  // Charger les statistiques utilisateur
  const loadUserStats = async () => {
    if (isAuthenticated) {
      try {
        const stats = await getUserStats();
        console.log("Statistiques utilisateur chargées:", stats);
        setUserStats(stats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      }
    }
  };

  useEffect(() => {
    loadUserStats();

    // Subscribe to Folders
    if (isAuthenticated) {
      const unsubscribe = subscribeToFolders((foldersData) => {
        setFolders(foldersData);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Folder & Sharing Handlers
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

  const handleShare = async (e: React.MouseEvent, encounterId: string) => {
    e.stopPropagation();
    try {
      setSharingId(encounterId);
      const shareCode = await shareEncounter(encounterId);
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

  const handleMoveToFolder = async (encounterId: string, folderId: string | null) => {
    // Optimistic Update
    setLocalEncounters(prev => prev.map(e =>
      e.id === encounterId ? { ...e, folderId: folderId || undefined } : e
    ));

    try {
      await moveEncounterToFolder(encounterId, folderId);
      toast({ title: "Déplacé", description: folderId ? "Rencontre déplacée." : "Rencontre retirée du dossier." });
    } catch (error) {
      // Revert on error
      toast({ title: "Erreur", description: "Échec du déplacement.", variant: "destructive" });
      setLocalEncounters(encounters); // Reset to source of truth
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, encounterId: string) => {
    e.dataTransfer.setData('encounterId', encounterId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    const encounterId = e.dataTransfer.getData('encounterId');
    if (encounterId) {
      handleMoveToFolder(encounterId, folderId);
    }
  };

  // Filter encounters based on selected folder
  const filteredEncounters = selectedFolderId === null
    ? localEncounters
    : selectedFolderId === 'none'
      ? localEncounters.filter(e => !e.folderId)
      : localEncounters.filter(e => e.folderId === selectedFolderId);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedParty(null);
    setSelectedEncounter(null);
    setSelectedMonsters([]);
    setEncounterName('');
    setSelectedEnvironment('');
    setIsEditing(false);
  };

  // Sélectionner une rencontre existante
  const handleSelectEncounter = (encounter: LocalEncounter) => {
    console.log("Rencontre sélectionnée:", encounter);

    const {
      party,
      name,
      monsters,
      environment,
      isValid,
      error
    } = normalizeEncounterForEditing(encounter, parties);

    if (!isValid) {
      toast({
        title: "Erreur",
        description: error || "Erreur lors du chargement de la rencontre",
        variant: "destructive"
      });
      // On continue quand même avec ce qu'on a récupéré (souvent une structure vide safe)
    }

    setSelectedEncounter(encounter);
    setSelectedParty(party);
    setSelectedMonsters(monsters);
    setEncounterName(name);
    setSelectedEnvironment(environment);
    setIsEditing(true);
  };

  // Ajouter un monstre à la rencontre
  const handleAddMonster = async (monster: Monster) => {
    console.log("Ajout du monstre à la rencontre (brut):", monster);
    let monsterToAdd = { ...monster };

    // Enrichment Failsafe: Ensure we have actions/traits
    // Even if MonsterBrowser tries to fetch, we double check here to guarantee data in state
    if (!monsterToAdd.custom && (!monsterToAdd.actions || monsterToAdd.actions.length === 0)) {
      console.log(`[EncounterBuilder] Monster ${monsterToAdd.name} missing actions, attempting enrichment...`);
      try {
        const detailed = await getMonsterFromAideDD(monsterToAdd.name);
        if (detailed) {
          console.log(`[EncounterBuilder] Enriched ${monsterToAdd.name} with ${detailed.actions?.length} actions`);
          // Merge detailed data but preserve any specific overrides we might have had (though usually none for fresh add)
          monsterToAdd = { ...monsterToAdd, ...detailed };
        }
      } catch (err) {
        console.error("[EncounterBuilder] Failed to enrich monster:", err);
      }
    }

    // Vérifier que monster.xp existe, sinon calculer à partir du CR
    if (!monsterToAdd.xp && monsterToAdd.cr !== undefined) {
      const xpValue = calculateXPFromCR(parseFloat(monsterToAdd.cr.toString()));
      console.log(`XP calculé à partir du CR ${monsterToAdd.cr}: ${xpValue}`);
      monsterToAdd.xp = xpValue;
    }

    // Si nous n'avons pas de valeur XP, attribuer une valeur par défaut basée sur le CR ou 10
    if (!monsterToAdd.xp) {
      console.log("Pas de valeur XP ou CR disponible, utilisation de la valeur par défaut (10)");
      monsterToAdd.xp = 10;
    }

    // Chercher si ce monstre est déjà dans la liste
    const existingMonsterIndex = selectedMonsters.findIndex(m => m.monster.id === monsterToAdd.id);

    if (existingMonsterIndex !== -1) {
      // Si le monstre existe déjà, augmenter sa quantité
      const updatedMonsters = [...selectedMonsters];
      updatedMonsters[existingMonsterIndex].quantity += 1;
      setSelectedMonsters(updatedMonsters);
    } else {
      // Sinon, ajouter le monstre à la liste en conservant toutes ses propriétés
      setSelectedMonsters([
        ...selectedMonsters,
        {
          monster: {
            ...monsterToAdd, // Conserver toutes les propriétés du monstre original
            // S'assurer que les propriétés essentielles sont présentes
            id: monsterToAdd.id || `monster-${Date.now()}`,
            name: monsterToAdd.name,
            xp: monsterToAdd.xp,
            type: monsterToAdd.type || "Inconnu",
            size: monsterToAdd.size || "M",
            // Valeurs par défaut pour les propriétés de combat si elles n'existent pas
            hp: monsterToAdd.hp || 10,
            ac: monsterToAdd.ac || 10,
            speed: monsterToAdd.speed || { walk: 30 },
            alignment: monsterToAdd.alignment || "neutre",
            legendary: monsterToAdd.legendary || false,
            environment: Array.isArray(monsterToAdd.environment) ? monsterToAdd.environment : []
          },
          quantity: 1
        }
      ]);
    }

    // Fermer le navigateur de monstres après l'ajout
    setShowMonsterBrowser(false);
  };






  const [showInitiativeModal, setShowInitiativeModal] = useState(false);
  const [preparedParticipants, setPreparedParticipants] = useState<InitiativeParticipant[]>([]);

  // ... (previous logic)



  // ... 

  // Fonction pour lancer la rencontre (Modifiée)
  const launchEncounter = async () => {
    try {
      console.log("Lancement de la rencontre (Step 1: Modal)...");

      // Vérifications de base
      if (!selectedParty) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un groupe de joueurs.",
          variant: "destructive"
        });
        return;
      }

      if (!encounterName) {
        toast({
          title: "Erreur",
          description: "Veuillez donner un nom à votre rencontre.",
          variant: "destructive"
        });
        return;
      }

      if (selectedMonsters.length === 0) {
        toast({
          title: "Erreur",
          description: "Veuillez ajouter au moins un monstre à la rencontre.",
          variant: "destructive"
        });
        return;
      }

      // 1. Prepare participants for the modal
      const players: InitiativeParticipant[] = (selectedParty.players || []).map(player => ({
        id: `pc-${player.id}`,
        name: player.name,
        isPC: true,
        initiative: 0, // Will be rolled/set in modal
        dex: player.dex || 10,
        ac: player.ac,
        hp: player.maxHp,
        image: undefined
      }));

      const monsters: InitiativeParticipant[] = selectedMonsters.flatMap(({ monster, quantity }) =>
        Array.from({ length: quantity }, (_, index) => ({
          id: `monster-${monster.id}-${index}`,
          name: `${monster.name} ${quantity > 1 ? index + 1 : ''}`,
          isPC: false,
          initiative: 0,
          dex: monster.dex || 10,
          ac: monster.ac,
          hp: monster.hp,
          image: monster.image
        }))
      );

      setPreparedParticipants([...players, ...monsters]);
      setShowInitiativeModal(true);

    } catch (error) {
      console.error("Erreur lors de la préparation de la rencontre:", error);
    }
  };

  const handleStartEncounterWithInitiative = async (participantsWithInit: InitiativeParticipant[]) => {
    console.log("[EncounterBuilder] handleStartEncounterWithInitiative called");
    setShowInitiativeModal(false);

    try {
      // Logic to save/setup encounter similar to original launchEncounter but with fixed initiatives

      // 1. Save/Get Encounter context (Draft/New)
      let encounterToUse = selectedEncounter;
      if (!encounterToUse) {
        // ... create draft logic (same as before) ...
        const difficultyString = (difficulty === 'trivial' ? 'easy' : difficulty) as 'easy' | 'medium' | 'hard' | 'deadly';
        const encounterData = {
          name: encounterName,
          monsters: selectedMonsters,
          difficulty: difficultyString,
          totalXP: totalXP,
          adjustedXP: adjustedXP,
          environment: selectedEnvironment !== 'all' ? selectedEnvironment : '',
          status: 'draft' as const,
          partyId: selectedParty?.id || '',
          party: selectedParty
        };

        const saved = await saveEncounter(encounterData);
        if (saved) {
          encounterToUse = { ...saved, party: selectedParty! } as LocalEncounter;
        } else {
          throw new Error("Erreur de sauvegarde automatique");
        }
      }

      if (!encounterToUse) throw new Error("Impossible de préparer la rencontre");

      // 2. Build complete data
      // We construct the "Active Participants" list by merging original data + initiative results

      const activeParticipants = [
        // Players
        ...(selectedParty!.players || []).map(player => {
          const initData = participantsWithInit.find(p => p.id === `pc-${player.id}`);
          return {
            id: `pc-${player.id}`,
            name: player.name,
            initiative: initData?.initiative || 0, // USES CONFIRMED INIT
            ac: player.ac || 10,
            currentHp: player.currentHp || player.maxHp || 10,
            maxHp: player.maxHp || 10,
            isPC: true,
            conditions: [],
            notes: `${player.characterClass || ''} niveau ${player.level || 1}`,
            dndBeyondId: player.dndBeyondId,
            // Extended stats
            str: player.str,
            dex: player.dex,
            con: player.con,
            int: player.int,
            wis: player.wis,
            cha: player.cha,
            speed: player.speed,
            race: player.race,
            class: player.characterClass,
            level: player.level,
            proficiencies: player.proficiencies
          };
        }),
        // Monsters
        ...selectedMonsters.flatMap(({ monster, quantity }) =>
          Array.from({ length: quantity }, (_, index) => {
            const id = `monster-${monster.id}-${index}`;
            const initData = participantsWithInit.find(p => p.id === id);
            const displayName = `${monster.name} ${quantity > 1 ? index + 1 : ''}`;

            return {
              ...monster,
              id: id,
              name: displayName,
              originalName: monster.originalName,
              initiative: initData?.initiative || 0, // USES CONFIRMED INIT
              ac: monster.ac || 10,
              currentHp: monster.hp || 10,
              maxHp: monster.hp || 10,
              isPC: false,
              conditions: [],
              notes: "",
              type: monster.type,
              size: monster.size,
              image: monster.image
            };
          })
        )
      ];

      const completeEncounterData = {
        id: encounterToUse.id,
        name: encounterToUse.name,
        monsters: selectedMonsters.map(m => ({ ...m, monster: { ...m.monster, id: m.monster.id } })), // simplify
        environment: encounterToUse.environment,
        difficulty: encounterToUse.difficulty,
        party: selectedParty,
        players: selectedParty!.players,
        participants: activeParticipants,
        round: 1,
        currentTurn: 0,
        isActive: false
      };

      sessionStorage.setItem('current_encounter', JSON.stringify(completeEncounterData));
      navigate('/encounter-tracker?source=session');

      toast({
        title: "Rencontre lancée",
        description: "Initiatives définies. Place au combat !",
        variant: "default"
      });

    } catch (err) {
      console.error("Erreur post-modal:", err);
      toast({ title: "Erreur", description: "Problème lors du lancement", variant: "destructive" });
    }
  };

  // Sauvegarder la rencontre
  const handleSaveEncounter = async () => {
    if (!encounterName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à cette rencontre",
        variant: "destructive"
      });
      return;
    }

    if (!selectedParty) {
      toast({
        title: "Groupe requis",
        description: "Veuillez sélectionner un groupe de joueurs",
        variant: "destructive"
      });
      return;
    }

    if (selectedMonsters.length === 0) {
      toast({
        title: "Monstres requis",
        description: "Veuillez ajouter au moins un monstre à la rencontre",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);

      const difficultyString = (difficulty === 'trivial' ? 'easy' : difficulty) as 'easy' | 'medium' | 'hard' | 'deadly';

      // Préparer les données de la rencontre
      const encounterData = {
        name: encounterName,
        monsters: selectedMonsters.map(m => ({
          monster: m.monster,
          quantity: m.quantity
        })),
        difficulty: difficultyString,
        totalXP: totalXP,
        adjustedXP: adjustedXP,
        environment: selectedEnvironment !== 'all' ? selectedEnvironment : '',
        status: 'draft' as const,
        partyId: selectedParty?.id || '',
        party: selectedParty
      };

      let savedEncounter = null;

      // Sauvegarde unifiée via le repository
      savedEncounter = await saveEncounter({
        ...encounterData,
        id: selectedEncounter?.id,
        createdAt: selectedEncounter?.createdAt
      });

      // S'assurer que l'objet retourné a la party pour la navigation (si mode local)
      if (savedEncounter && !savedEncounter.party && selectedParty) {
        savedEncounter.party = selectedParty;
      }

      if (!savedEncounter) {
        throw new Error("Échec de la sauvegarde.");
      }

      // Mettre à jour la sélection
      setSelectedEncounter(savedEncounter as LocalEncounter);

      console.log("Rencontre sauvegardée localement:", savedEncounter);


      // Fermer le dialogue
      setSaveDialogOpen(false);

      toast({
        title: "Rencontre sauvegardée",
        description: `"${encounterName}" a été enregistré avec succès.`,
        variant: "default"
      });

      return savedEncounter;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la rencontre:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la rencontre: " + (error instanceof Error ? error.message : "Erreur inconnue"),
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
      {/* Liste des rencontres - Collapsible on mobile */}
      <div className="lg:col-span-1 parchment-panel rounded-xl p-3 md:p-4 lg:h-fit lg:sticky lg:top-24">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-cinzel text-gray-800">Rencontres</h2>
            {isAuthenticated && userStats && (
              <Badge variant="outline" className="text-xs bg-white/50">
                {userStats.encounters}/{userStats.maxEncounters}
              </Badge>
            )}
          </div>

          <Button
            onClick={resetForm}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            size="sm"
          >
            <FaPlus className="mr-2 h-3.5 w-3.5" /> Nouvelle
          </Button>
        </div>



        {/* Folder Tabs - Cleaner Look */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 hide-scrollbar">
          <Button
            variant={selectedFolderId === null ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedFolderId(null)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)}
            className={`h-8 text-xs rounded-full px-4 ${selectedFolderId === null ? 'bg-gray-200 text-gray-800 font-medium' : 'text-gray-500'}`}
          >
            Tous
          </Button>
          <Button
            variant={selectedFolderId === 'none' ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedFolderId('none')}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)} // 'none' technically means no folderId, so null acts same or we use specific handler logic
            className={`h-8 text-xs rounded-full px-4 ${selectedFolderId === 'none' ? 'bg-gray-200 text-gray-800 font-medium' : 'text-gray-500'}`}
          >
            Sans dossier
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1 flex-shrink-0" />
          {folders.map(folder => (
            <Button
              key={folder.id}
              variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedFolderId(folder.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, folder.id)}
              className={`h-8 text-xs rounded-full px-4 whitespace-nowrap transition-colors`}
              style={{
                backgroundColor: selectedFolderId === folder.id ? (folder.color || '#e5e7eb') : undefined,
                color: selectedFolderId === folder.id ? '#1f2937' : '#6b7280',
                fontWeight: selectedFolderId === folder.id ? 500 : 400
              }}
            >
              {folder.name}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCreateFolderDialogOpen(true)}
            className="h-8 w-8 rounded-full border-dashed border-gray-400 text-gray-500 hover:text-primary hover:border-primary flex-shrink-0 ml-auto"
            title="Nouveau dossier"
          >
            <FaPlus className="h-3 w-3" />
          </Button>
        </div>

        {filteredEncounters.length === 0 ? (
          <div className="text-center py-12 bg-white/40 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Aucune rencontre trouvée.</p>
          </div>
        ) : (
          <ul className="space-y-3 pb-20 lg:pb-0">
            {filteredEncounters.map(encounter => (
              <li
                key={encounter.id}
                draggable
                onDragStart={(e) => handleDragStart(e, encounter.id)}
                className={`
                group relative bg-white border rounded-lg p-3 cursor-pointer transition-all duration-200
                hover:shadow-md hover:border-blue-300 active:cursor-grabbing
                ${selectedEncounter?.id === encounter.id ? 'ring-2 ring-blue-500 border-transparent shadow-sm' : 'border-stone-200'}
              `}
                onClick={() => handleSelectEncounter(encounter as LocalEncounter)}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold text-sm truncate ${selectedEncounter?.id === encounter.id ? 'text-blue-700' : 'text-gray-900'}`}>
                      {encounter.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge variant="secondary" className={`text-[10px] h-5 px-1.5 font-normal ${encounter.difficulty === 'deadly' ? 'bg-red-100 text-red-700' :
                        encounter.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                          encounter.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                        {encounter.difficulty === 'easy' ? 'Facile' :
                          encounter.difficulty === 'medium' ? 'Moyen' :
                            encounter.difficulty === 'hard' ? 'Difficile' :
                              encounter.difficulty === 'deadly' ? 'Mortel' : 'Trivial'}
                      </Badge>

                      {encounter.folderId && folders.find(f => f.id === encounter.folderId) && (
                        <div className="flex items-center text-[10px] text-gray-500 bg-gray-100 rounded-sm px-1.5 h-5">
                          <FolderOpen className="h-3 w-3 mr-1 opacity-70" />
                          {folders.find(f => f.id === encounter.folderId)?.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions overlay - always visible on mobile/active, hover on desktop */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      onClick={(e) => handleShare(e, encounter.id)}
                      title="Partager"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Folder className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveToFolder(encounter.id, null); }}>
                          <Folder className="h-4 w-4 mr-2" /> Sans dossier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {folders.map(folder => (
                          <DropdownMenuItem key={folder.id} onClick={(e) => { e.stopPropagation(); handleMoveToFolder(encounter.id, folder.id); }}>
                            <FolderOpen className="h-4 w-4 mr-2" /> {folder.name}
                            {encounter.folderId === folder.id && <Check className="h-3 w-3 ml-auto opacity-70" />}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setCreateFolderDialogOpen(true); }}>
                          <FolderPlus className="h-4 w-4 mr-2" /> Nouveau dossier
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (window.confirm("Supprimer cette rencontre ?")) {
                          try {
                            const success = await deleteEncounter(encounter.id);
                            if (success) {
                              if (selectedEncounter?.id === encounter.id) resetForm();
                              toast({ title: "Supprimée", description: "Rencontre supprimée." });
                            }
                          } catch (err) {
                            toast({ title: "Erreur", description: "Échec suppression.", variant: "destructive" });
                          }
                        }
                      }}
                      className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 translation-opacity"
                      title="Supprimer"
                    >
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}


        {/* Dialog creation dossier */}
        <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau dossier</DialogTitle>
              <DialogDescription>Créez un dossier pour organiser vos rencontres.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="builder-new-folder-name">Nom</Label>
              <Input
                id="builder-new-folder-name"
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


      </div>

      {/* Formulaire de création/édition */}
      <div className="lg:col-span-2 parchment-panel rounded-xl p-4 md:p-6">

        <EncounterHeader
          isEditing={isEditing}
          encounterName={encounterName}
          setEncounterName={setEncounterName}
          selectedParty={selectedParty}
          setSelectedParty={setSelectedParty}
          parties={parties}
          selectedEnvironment={selectedEnvironment}
          setSelectedEnvironment={setSelectedEnvironment}
        />

        <ParticipantList
          selectedMonsters={selectedMonsters}
          setSelectedMonsters={setSelectedMonsters}
          onAddMonster={() => setShowMonsterBrowser(true)}
        />

        <StatSummary
          totalXP={totalXP}
          adjustedXP={adjustedXP}
          xpPerPlayer={xpPerPlayer}
          difficulty={difficulty || ''}
          difficultyColor={difficultyColor}
          selectedMonsters={selectedMonsters}
          selectedParty={selectedParty}
        />

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={handleSaveEncounter}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center touch-target"
            disabled={isSaving}
          >
            <FaSave className="mr-2" />
            {isEditing ? "Mettre à jour" : "Enregistrer"}
          </button>

          {/* Bouton pour lancer la rencontre */}
          <button
            onClick={launchEncounter}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center touch-target"
            disabled={!selectedMonsters.length || isSaving}
          >
            <FaDragon className="mr-2" />
            <span className="hidden sm:inline">Lancer la </span>rencontre
          </button>
        </div>

        {/* Dialogue de sauvegarde */}
        <div className="flex flex-col gap-4 md:flex-row mt-4">
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full"
                disabled={!selectedMonsters.length || isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Options de sauvegarde
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Sauvegarder la rencontre</DialogTitle>
                <DialogDescription>
                  Donnez un nom à cette rencontre pour la retrouver facilement.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="encounterName" className="text-right">
                    Nom
                  </Label>
                  <Input
                    id="encounterName"
                    value={encounterName}
                    onChange={(e) => setEncounterName(e.target.value)}
                    className="col-span-3"
                    placeholder="Embuscade gobeline, Combat final, etc."
                  />
                </div>
                {selectedParty ? (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Groupe</Label>
                    <div className="col-span-3">
                      <Badge variant="secondary">{selectedParty.name}</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-4 text-amber-500 text-sm">
                      Aucun groupe d'aventuriers sélectionné. La rencontre sera sauvegardée sans groupe associé.
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Difficulté</Label>
                  <div className="col-span-3">
                    <Badge className={
                      difficulty === 'easy' ? 'bg-green-500' :
                        difficulty === 'medium' ? 'bg-yellow-500' :
                          difficulty === 'hard' ? 'bg-orange-500' :
                            difficulty === 'deadly' ? 'bg-red-500' :
                              'bg-gray-500'
                    }>
                      {difficulty === 'easy' ? 'Facile' :
                        difficulty === 'medium' ? 'Moyen' :
                          difficulty === 'hard' ? 'Difficile' :
                            difficulty === 'deadly' ? 'Mortel' :
                              'Trivial'}
                    </Badge>
                    <span className="ml-2 text-muted-foreground text-sm">{adjustedXP} XP ajustés</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleSaveEncounter}
                  disabled={isSaving || !encounterName.trim()}
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Sauvegarde...
                    </>
                  ) : (
                    'Sauvegarder'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Modal du navigateur de monstres - Fullscreen on mobile */}
      {
        showMonsterBrowser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end md:items-center justify-center min-h-screen md:p-4">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMonsterBrowser(false)}></div>
              <div className="relative parchment-card md:rounded-xl w-full md:max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom md:fade-in md:zoom-in-95 duration-200">
                <div className="p-3 md:p-4 border-b border-glass-border/20 flex justify-between items-center bg-primary/5 sticky top-0 z-10">
                  <h2 className="text-lg md:text-xl font-bold font-cinzel">Sélectionner un monstre</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMonsterBrowser(false)}
                    className="touch-target h-11 w-11"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <MonsterBrowser
                  onSelectMonster={handleAddMonster}
                  isSelectable={true}
                />
              </div>
            </div>
          </div>
        )
      }

      {/* Modal d'initiative */}
      <InitiativeModal
        open={showInitiativeModal}
        onOpenChange={setShowInitiativeModal}
        participants={preparedParticipants}
        onConfirm={handleStartEncounterWithInitiative}
      />
    </div >
  );
};

export default EncounterBuilder; 