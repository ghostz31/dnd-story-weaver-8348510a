import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaMinus, FaTrash, FaSave, FaEdit, FaDragon } from 'react-icons/fa';
import { Save, Play, PenTool, X } from "lucide-react";
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
import { getUserStats } from '../lib/firebaseApi';
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
  }, [isAuthenticated]);

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Liste des rencontres */}
      <div className="md:col-span-1 parchment-panel rounded-xl p-4 h-fit sticky top-24">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Rencontres</h2>
          <div className="flex items-center gap-2">
            {isAuthenticated && userStats && userStats.maxEncounters < 1000 && (
              <span className="text-sm text-gray-600">
                {userStats.encounters}/{userStats.maxEncounters}
              </span>
            )}
            <button
              onClick={resetForm}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Nouvelle
            </button>
          </div>
        </div>

        {encounters.length === 0 ? (
          <div>
            <p className="text-gray-500">Aucune rencontre créée. Créez votre première rencontre !</p>
            <p className="text-xs text-red-500 mt-2">Debug: encounters.length = {encounters.length}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {encounters.map(encounter => (
              <li
                key={encounter.id}
                className={`py-2 px-2 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${selectedEncounter?.id === encounter.id ? 'bg-blue-50' : ''
                  }`}
                onClick={() => handleSelectEncounter(encounter as LocalEncounter)}
              >
                <div>
                  <span className="font-medium">{encounter.name}</span>
                  <div className="text-sm text-gray-500">
                    Difficulté: <span className={
                      encounter.difficulty === 'deadly' ? 'text-red-600' :
                        encounter.difficulty === 'hard' ? 'text-orange-500' :
                          encounter.difficulty === 'medium' ? 'text-yellow-500' :
                            'text-green-500'
                    }>
                      {encounter.difficulty === 'easy' ? 'Facile' :
                        encounter.difficulty === 'medium' ? 'Moyen' :
                          encounter.difficulty === 'hard' ? 'Difficile' :
                            encounter.difficulty === 'deadly' ? 'Mortel' : encounter.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    console.log(`[EncounterBuilder] Clic sur suppression pour rencontre ID: ${encounter.id}`);

                    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette rencontre ?");
                    console.log(`[EncounterBuilder] Confirmation: ${confirmed}`);

                    if (!confirmed) {
                      console.log("[EncounterBuilder] Suppression annulée par l'utilisateur");
                      return;
                    }

                    try {
                      console.log(`[EncounterBuilder] Début suppression de la rencontre ID: ${encounter.id}`);
                      const success = await deleteEncounter(encounter.id);

                      console.log(`[EncounterBuilder] Suppression terminée, succès: ${success}`);

                      if (success) {
                        // Si la rencontre supprimée était sélectionnée, réinitialiser le formulaire
                        if (selectedEncounter?.id === encounter.id) {
                          console.log("[EncounterBuilder] Rencontre supprimée était sélectionnée, réinitialisation du formulaire");
                          resetForm();
                        }

                        toast({
                          title: "Succès",
                          description: "Rencontre supprimée avec succès."
                        });
                      }
                    } catch (err) {
                      console.error("[EncounterBuilder] Erreur lors de la suppression:", err);
                      toast({
                        title: "Erreur",
                        description: "Impossible de supprimer la rencontre.",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="text-red-500 hover:text-red-700 relative z-10 pointer-events-auto"
                  type="button"
                  aria-label="Supprimer la rencontre"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Formulaire de création/édition */}
      {/* Formulaire de création/édition */}
      <div className="md:col-span-2 parchment-panel rounded-xl p-6">

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
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSaveEncounter}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            disabled={isSaving}
          >
            <FaSave className="mr-2" />
            {isEditing ? "Mettre à jour" : "Enregistrer"}
          </button>

          {/* Bouton pour lancer la rencontre */}
          <button
            onClick={launchEncounter}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
            disabled={!selectedMonsters.length || isSaving}
          >
            <FaDragon className="mr-2" />
            Lancer la rencontre
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

      {/* Modal du navigateur de monstres */}
      {showMonsterBrowser && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMonsterBrowser(false)}></div>
            <div className="relative parchment-card rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
              <div className="p-4 border-b border-glass-border/20 flex justify-between items-center bg-primary/5">
                <h2 className="text-xl font-bold font-cinzel">Sélectionner un monstre</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMonsterBrowser(false)}
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
      )}

      {/* Modal d'initiative */}
      <InitiativeModal
        open={showInitiativeModal}
        onOpenChange={setShowInitiativeModal}
        participants={preparedParticipants}
        onConfirm={handleStartEncounterWithInitiative}
      />
    </div>
  );
};

export default EncounterBuilder; 