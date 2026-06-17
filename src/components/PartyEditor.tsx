import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, AlertCircle } from 'lucide-react';
import {
  getParties,
  createParty,
  updateParty,
  deleteParty,
  addPlayerToParty,
  updatePlayer,
  removePlayerFromParty,
  canCreateParty,
  subscribeToParties
} from '@/lib/firebaseApi';
import { Party, Player } from '@/lib/types';

import { useAuth } from '@/auth/AuthContext';
import { toast } from '@/hooks/use-toast';
import { calculateAverageLevel } from './party/utils';
import UnauthenticatedCard from './party/UnauthenticatedCard';
import PartySelector from './party/PartySelector';
import PartyActions from './party/PartyActions';
import PlayerDialog from './party/PlayerDialog';
import PlayersList from './party/PlayersList';
import NoSelectedPartyState from './party/NoSelectedPartyState';
import NoPartiesState from './party/NoPartiesState';

const PartyEditor: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [canCreate, setCanCreate] = useState(true);

  // État pour le dialogue de création/édition de groupe
  const [isPartyDialogOpen, setIsPartyDialogOpen] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [isEditingParty, setIsEditingParty] = useState(false);

  // État pour le dialogue de création/édition de joueur
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({
    name: '',
    level: 1,
    characterClass: 'Guerrier',
    race: '',
    ac: 10,
    maxHp: 10,
    currentHp: 10,
    dndBeyondId: '',
    besaceShareCode: '',
    syncSource: 'none' as const,
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    proficiencies: ''
  });
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  // État pour l'import D&D Beyond
  const [dndBeyondUrl, setDndBeyondUrl] = useState('');

  // Chargement initial des données
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadParties = async () => {
      try {
        setIsLoading(true);

        // Vérifier si l'utilisateur peut créer un nouveau groupe
        const canCreateNewParty = await canCreateParty();
        setCanCreate(canCreateNewParty);

        // Utiliser l'abonnement aux parties au lieu de getParties
        const unsubscribe = subscribeToParties(
          (fetchedParties) => {
            setParties(fetchedParties);
            setIsLoading(false);

            // Sélectionner le premier groupe par défaut s'il y en a
            if (fetchedParties.length > 0 && !selectedParty) {
              setSelectedParty(fetchedParties[0]);
            }
          },
          (err) => {
            console.error('Erreur de souscription aux parties:', err);
            setError('Erreur de connexion à la base de données');
            setIsLoading(false);
          }
        );

        // Nettoyer l'abonnement quand le composant est démonté
        return () => unsubscribe();
      } catch (err) {
        console.error('Erreur lors du chargement des groupes:', err);
        setError('Impossible de charger vos groupes d\'aventuriers');
        setIsLoading(false);
      }
    };

    loadParties();
  }, [isAuthenticated]);

  // Gestion de la création d'un groupe
  const handleCreateParty = async () => {
    if (!newPartyName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du groupe ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }

    try {
      const newParty = await createParty(newPartyName);
      if (newParty) {
        setParties([...parties, newParty]);
        setSelectedParty(newParty);
        toast({
          title: "Succès",
          description: `Le groupe "${newPartyName}" a été créé`
        });

        // Mettre à jour l'état de capacité de création
        setCanCreate(await canCreateParty());
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer le groupe",
        variant: "destructive"
      });
    } finally {
      setNewPartyName('');
      setIsPartyDialogOpen(false);
    }
  };

  // Gestion de la mise à jour d'un groupe
  const handleUpdateParty = async () => {
    if (!selectedParty || !newPartyName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du groupe ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedParty = await updateParty(selectedParty.id, { name: newPartyName });
      if (updatedParty) {
        setParties(parties.map(party =>
          party.id === updatedParty.id ? updatedParty : party
        ));
        setSelectedParty(updatedParty);
        toast({
          title: "Succès",
          description: `Le groupe a été renommé en "${newPartyName}"`
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le groupe",
        variant: "destructive"
      });
    } finally {
      setNewPartyName('');
      setIsEditingParty(false);
      setIsPartyDialogOpen(false);
    }
  };

  // Gestion de la suppression d'un groupe
  const handleDeleteParty = async (partyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      return;
    }

    try {
      const success = await deleteParty(partyId);
      if (success) {
        const updatedParties = parties.filter(party => party.id !== partyId);
        setParties(updatedParties);

        // Si le groupe supprimé était sélectionné, sélectionner le premier groupe restant
        if (selectedParty && selectedParty.id === partyId) {
          setSelectedParty(updatedParties.length > 0 ? updatedParties[0] : null);
        }

        // Mettre à jour l'état de capacité de création
        setCanCreate(await canCreateParty());

        toast({
          title: "Succès",
          description: "Le groupe a été supprimé"
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le groupe",
        variant: "destructive"
      });
    }
  };

  // Gestion de l'ajout d'un joueur
  const handleAddPlayer = async () => {
    if (!selectedParty) return;

    if (!newPlayer.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du personnage ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }

    try {
      const addedPlayer = await addPlayerToParty(selectedParty.id, newPlayer);
      if (addedPlayer) {
        // Mettre à jour le groupe sélectionné avec le nouveau joueur
        const updatedParty = {
          ...selectedParty,
          players: [...selectedParty.players, addedPlayer]
        };

        setSelectedParty(updatedParty);
        setParties(parties.map(party =>
          party.id === updatedParty.id ? updatedParty : party
        ));

        toast({
          title: "Succès",
          description: `${newPlayer.name} a été ajouté au groupe`
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le personnage",
        variant: "destructive"
      });
    } finally {
      setNewPlayer({
        name: '',
        level: 1,
        characterClass: 'Guerrier',
        race: '',
        ac: 10,
        maxHp: 10,
        currentHp: 10,
        dndBeyondId: '',
        besaceShareCode: '',
        syncSource: 'none' as const,
        str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
        proficiencies: '',
      });
      setIsPlayerDialogOpen(false);
    }
  };

  // Gestion de la mise à jour d'un joueur
  const handleUpdatePlayer = async () => {
    if (!selectedParty || !editingPlayerId) return;

    if (!newPlayer.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du personnage ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedPlayer = await updatePlayer(selectedParty.id, editingPlayerId, newPlayer);
      if (updatedPlayer) {
        // Mettre à jour le groupe sélectionné avec le joueur modifié
        const updatedPlayers = selectedParty.players.map(player =>
          player.id === editingPlayerId ? updatedPlayer : player
        );

        const updatedParty = {
          ...selectedParty,
          players: updatedPlayers
        };

        setSelectedParty(updatedParty);
        setParties(parties.map(party =>
          party.id === updatedParty.id ? updatedParty : party
        ));

        toast({
          title: "Succès",
          description: `${updatedPlayer.name} a été mis à jour`
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le personnage",
        variant: "destructive"
      });
    } finally {
      setNewPlayer({
        name: '',
        level: 1,
        characterClass: 'Guerrier',
        race: '',
        ac: 10,
        maxHp: 10,
        currentHp: 10,
        dndBeyondId: '',
        besaceShareCode: '',
        syncSource: 'none' as const,
        str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
        proficiencies: '',
      });
      setIsEditingPlayer(false);
      setEditingPlayerId(null);
      setIsPlayerDialogOpen(false);
    }
  };

  // Gestion de la suppression d'un joueur
  const handleRemovePlayer = async (playerId: string) => {
    if (!selectedParty) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage ?')) {
      return;
    }

    try {
      const success = await removePlayerFromParty(selectedParty.id, playerId);
      if (success) {
        // Mettre à jour le groupe sélectionné sans le joueur supprimé
        const updatedParty = {
          ...selectedParty,
          players: selectedParty.players.filter(player => player.id !== playerId)
        };

        setSelectedParty(updatedParty);
        setParties(parties.map(party =>
          party.id === updatedParty.id ? updatedParty : party
        ));

        toast({
          title: "Succès",
          description: "Le personnage a été supprimé du groupe"
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le personnage",
        variant: "destructive"
      });
    }
  };

  // Ouvrir le dialogue d'édition de joueur
  const openEditPlayerDialog = (player: Player) => {
    setNewPlayer({
      name: player.name,
      level: player.level,
      characterClass: player.characterClass,
      race: player.race,
      ac: player.ac,
      maxHp: player.maxHp,
      currentHp: player.currentHp,
      dndBeyondId: player.dndBeyondId || '',
      str: player.str || 10,
      dex: player.dex || 10,
      con: player.con || 10,
      int: player.int || 10,
      wis: player.wis || 10,
      cha: player.cha || 10,
      proficiencies: player.proficiencies || '',
      besaceShareCode: player.besaceShareCode || '',
      syncSource: player.syncSource || (player.dndBeyondId ? 'beyond' : player.besaceShareCode ? 'besace' : 'none'),
      speed: player.speed,
      initiative: player.initiative,
      avatarUrl: player.avatarUrl,
      subclass: player.subclass,
      background: player.background,
    });
    setEditingPlayerId(player.id);
    setIsEditingPlayer(true);
    setIsPlayerDialogOpen(true);
    // Pré-remplir l'URL Beyond pour faciliter le re-import
    if (player.dndBeyondId) {
      setDndBeyondUrl(`https://www.dndbeyond.com/characters/${player.dndBeyondId}`);
    }
  };

  // Ouvrir le dialogue d'édition de groupe
  const openEditPartyDialog = () => {
    if (selectedParty) {
      setNewPartyName(selectedParty.name);
      setIsEditingParty(true);
      setIsPartyDialogOpen(true);
    }
  };

  // Si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <UnauthenticatedCard />;
  }

  return (
    <div className="space-y-4 md:space-y-6">


      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center text-lg md:text-xl">
            <Users className="mr-2 h-5 w-5 md:h-6 md:w-6" />
            Groupes d'aventuriers
          </CardTitle>
          <CardDescription className="text-sm">
            Gérez vos groupes de personnages joueurs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <PartySelector
                parties={parties}
                selectedParty={selectedParty}
                onSelectParty={setSelectedParty}
                isPartyDialogOpen={isPartyDialogOpen}
                onPartyDialogOpenChange={setIsPartyDialogOpen}
                newPartyName={newPartyName}
                onNewPartyNameChange={setNewPartyName}
                isEditingParty={isEditingParty}
                canCreate={canCreate}
                onNewPartyClick={() => {
                  if (canCreate) {
                    setIsEditingParty(false);
                    setNewPartyName('');
                    setIsPartyDialogOpen(true);
                  } else {
                    toast({
                      title: "Limite atteinte",
                      description: "Vous avez atteint la limite de groupes pour votre plan actuel",
                      variant: "destructive"
                    });
                  }
                }}
                onPartyDialogSubmit={isEditingParty ? handleUpdateParty : handleCreateParty}
                onPartyDialogCancel={() => {
                  setIsPartyDialogOpen(false);
                  setNewPartyName('');
                  setIsEditingParty(false);
                }}
              />

              {selectedParty ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-semibold flex items-center truncate">
                        {selectedParty.name}
                        <span className="ml-2 text-xs md:text-sm font-normal text-muted-foreground">
                          (Niv. moy: {calculateAverageLevel(selectedParty)})
                        </span>
                      </h3>
                    </div>
                    <PartyActions
                      onRename={openEditPartyDialog}
                      onDelete={() => handleDeleteParty(selectedParty.id)}
                    />
                  </div>

                  <Card>
                    <CardHeader className="p-3 md:p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Personnages</CardTitle>

                        <PlayerDialog
                          isOpen={isPlayerDialogOpen}
                          onOpenChange={setIsPlayerDialogOpen}
                          isEditingPlayer={isEditingPlayer}
                          onTriggerClick={() => {
                            setIsEditingPlayer(false);
                            setEditingPlayerId(null);
                            setNewPlayer({
                              name: '',
                              level: 1,
                              characterClass: 'Guerrier',
                              race: '',
                              ac: 10,
                              maxHp: 10,
                              currentHp: 10
                            });
                          }}
                          newPlayer={newPlayer}
                          setNewPlayer={setNewPlayer}
                          dndBeyondUrl={dndBeyondUrl}
                          onDndBeyondUrlChange={setDndBeyondUrl}
                          onSubmit={isEditingPlayer ? handleUpdatePlayer : handleAddPlayer}
                          onCancel={() => {
                            setIsPlayerDialogOpen(false);
                            setNewPlayer({
                              name: '',
                              level: 1,
                              characterClass: 'Guerrier',
                              race: '',
                              ac: 10,
                              maxHp: 10,
                              currentHp: 10
                            });
                            setIsEditingPlayer(false);
                            setEditingPlayerId(null);
                            setDndBeyondUrl('');
                          }}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <PlayersList
                        players={selectedParty.players}
                        onAddClick={() => {
                          setIsEditingPlayer(false);
                          setEditingPlayerId(null);
                          setNewPlayer({
                            name: '',
                            level: 1,
                            characterClass: 'Guerrier',
                            race: '',
                            ac: 10,
                            maxHp: 10,
                            currentHp: 10
                          });
                          setIsPlayerDialogOpen(true);
                        }}
                        onEditPlayer={openEditPlayerDialog}
                        onRemovePlayer={handleRemovePlayer}
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : parties.length > 0 ? (
                <NoSelectedPartyState />
              ) : (
                <NoPartiesState
                  canCreate={canCreate}
                  onCreateClick={() => {
                    if (canCreate) {
                      setIsEditingParty(false);
                      setNewPartyName('');
                      setIsPartyDialogOpen(true);
                    } else {
                      toast({
                        title: "Limite atteinte",
                        description: "Vous avez atteint la limite de groupes pour votre plan actuel",
                        variant: "destructive"
                      });
                    }
                  }}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div >
  );
};

export default PartyEditor;
