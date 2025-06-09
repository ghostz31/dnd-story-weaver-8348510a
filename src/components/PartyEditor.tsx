import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { Users, UserPlus, Trash2, Edit, Plus, Sword, AlertCircle, Save } from 'lucide-react';
import { 
  getParties, 
  createParty, 
  updateParty, 
  deleteParty, 
  addPlayerToParty, 
  updatePlayer, 
  removePlayerFromParty,
  canCreateParty
} from '../lib/firebaseApi';
import { Party, Player } from '../lib/types';
import UsageStats from './UsageStats';
import { useAuth } from '../auth/AuthContext';

// Classes de personnages D&D
const CHARACTER_CLASSES = [
  'Barbare', 'Barde', 'Clerc', 'Druide', 'Ensorceleur', 'Guerrier', 
  'Magicien', 'Moine', 'Occultiste', 'Paladin', 'Rôdeur', 'Roublard'
];

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
    characterClass: 'Guerrier'
  });
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  // Chargement initial des données
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadParties = async () => {
      try {
        setIsLoading(true);
        const fetchedParties = await getParties();
        setParties(fetchedParties);
        
        // Vérifier si l'utilisateur peut créer un nouveau groupe
        const canCreateNewParty = await canCreateParty();
        setCanCreate(canCreateNewParty);
        
        // Sélectionner le premier groupe par défaut s'il y en a
        if (fetchedParties.length > 0 && !selectedParty) {
          setSelectedParty(fetchedParties[0]);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des groupes:', err);
        setError('Impossible de charger vos groupes d\'aventuriers');
      } finally {
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe?')) {
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
        characterClass: 'Guerrier'
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
        characterClass: 'Guerrier'
      });
      setIsEditingPlayer(false);
      setEditingPlayerId(null);
      setIsPlayerDialogOpen(false);
    }
  };

  // Gestion de la suppression d'un joueur
  const handleRemovePlayer = async (playerId: string) => {
    if (!selectedParty) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage?')) {
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
      characterClass: player.characterClass
    });
    setEditingPlayerId(player.id);
    setIsEditingPlayer(true);
    setIsPlayerDialogOpen(true);
  };

  // Ouvrir le dialogue d'édition de groupe
  const openEditPartyDialog = () => {
    if (selectedParty) {
      setNewPartyName(selectedParty.name);
      setIsEditingParty(true);
      setIsPartyDialogOpen(true);
    }
  };

  // Calculer le niveau moyen du groupe
  const calculateAverageLevel = (party: Party) => {
    if (party.players.length === 0) return 0;
    const sum = party.players.reduce((acc, player) => acc + player.level, 0);
    return Math.round((sum / party.players.length) * 10) / 10;
  };

  // Si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-6 w-6" />
            Groupes d'aventuriers
          </CardTitle>
          <CardDescription>
            Connectez-vous pour gérer vos groupes d'aventuriers
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Users className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-center text-gray-500 mb-4">
            Vous devez être connecté pour accéder à cette fonctionnalité
          </p>
          <Button variant="default" asChild>
            <a href="/auth">Se connecter</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <UsageStats />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-6 w-6" />
            Groupes d'aventuriers
          </CardTitle>
          <CardDescription>
            Gérez vos groupes de personnages joueurs
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <div className="flex flex-wrap gap-2 mb-4">
                {parties.map(party => (
                  <Button
                    key={party.id}
                    variant={selectedParty?.id === party.id ? "default" : "outline"}
                    className="flex items-center"
                    onClick={() => setSelectedParty(party)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {party.name}
                    <span className="ml-2 text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {party.players.length}
                    </span>
                  </Button>
                ))}
                
                <Dialog open={isPartyDialogOpen} onOpenChange={setIsPartyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-dashed" 
                      disabled={!canCreate}
                      onClick={() => {
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
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau groupe
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {isEditingParty ? "Modifier le groupe" : "Créer un nouveau groupe"}
                      </DialogTitle>
                      <DialogDescription>
                        {isEditingParty 
                          ? "Modifiez le nom de votre groupe d'aventuriers" 
                          : "Donnez un nom à votre nouveau groupe d'aventuriers"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="partyName">Nom du groupe</Label>
                        <Input
                          id="partyName"
                          placeholder="Les Aventuriers de la Côte des Épées"
                          value={newPartyName}
                          onChange={(e) => setNewPartyName(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsPartyDialogOpen(false);
                          setNewPartyName('');
                          setIsEditingParty(false);
                        }}
                      >
                        Annuler
                      </Button>
                      <Button 
                        onClick={isEditingParty ? handleUpdateParty : handleCreateParty}
                      >
                        {isEditingParty ? "Enregistrer" : "Créer"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {selectedParty ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center">
                        {selectedParty.name}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          (Niveau moyen: {calculateAverageLevel(selectedParty)})
                        </span>
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={openEditPartyDialog}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Renommer
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteParty(selectedParty.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                  
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Personnages</CardTitle>
                        
                        <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setIsEditingPlayer(false);
                                setEditingPlayerId(null);
                                setNewPlayer({
                                  name: '',
                                  level: 1,
                                  characterClass: 'Guerrier'
                                });
                              }}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Ajouter
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {isEditingPlayer ? "Modifier le personnage" : "Ajouter un personnage"}
                              </DialogTitle>
                              <DialogDescription>
                                {isEditingPlayer 
                                  ? "Modifiez les détails de ce personnage" 
                                  : "Ajoutez un nouveau personnage à votre groupe"}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="playerName">Nom du personnage</Label>
                                <Input
                                  id="playerName"
                                  placeholder="Bruenor Battlehammer"
                                  value={newPlayer.name}
                                  onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="playerClass">Classe</Label>
                                  <Select
                                    value={newPlayer.characterClass}
                                    onValueChange={(value) => setNewPlayer({...newPlayer, characterClass: value})}
                                  >
                                    <SelectTrigger id="playerClass">
                                      <SelectValue placeholder="Choisir une classe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CHARACTER_CLASSES.map(characterClass => (
                                        <SelectItem key={characterClass} value={characterClass}>
                                          {characterClass}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="playerLevel">Niveau</Label>
                                  <Select
                                    value={newPlayer.level.toString()}
                                    onValueChange={(value) => setNewPlayer({...newPlayer, level: parseInt(value)})}
                                  >
                                    <SelectTrigger id="playerLevel">
                                      <SelectValue placeholder="Niveau" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({length: 20}, (_, i) => i + 1).map(level => (
                                        <SelectItem key={level} value={level.toString()}>
                                          {level}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setIsPlayerDialogOpen(false);
                                  setNewPlayer({
                                    name: '',
                                    level: 1,
                                    characterClass: 'Guerrier'
                                  });
                                  setIsEditingPlayer(false);
                                  setEditingPlayerId(null);
                                }}
                              >
                                Annuler
                              </Button>
                              <Button 
                                onClick={isEditingPlayer ? handleUpdatePlayer : handleAddPlayer}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                {isEditingPlayer ? "Enregistrer" : "Ajouter"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {selectedParty.players.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                          <UserPlus className="h-10 w-10 text-gray-300 mb-2" />
                          <p className="text-gray-500 mb-2">Aucun personnage dans ce groupe</p>
                          <p className="text-gray-400 text-sm mb-4">
                            Ajoutez des personnages pour pouvoir créer des rencontres équilibrées
                          </p>
                          <Button
                            size="sm"
                            onClick={() => {
                              setIsEditingPlayer(false);
                              setEditingPlayerId(null);
                              setNewPlayer({
                                name: '',
                                level: 1,
                                characterClass: 'Guerrier'
                              });
                              setIsPlayerDialogOpen(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Ajouter un personnage
                          </Button>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nom</TableHead>
                              <TableHead>Classe</TableHead>
                              <TableHead>Niveau</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedParty.players.map(player => (
                              <TableRow key={player.id}>
                                <TableCell className="font-medium">{player.name}</TableCell>
                                <TableCell>{player.characterClass}</TableCell>
                                <TableCell>{player.level}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => openEditPlayerDialog(player)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => handleRemovePlayer(player.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : parties.length > 0 ? (
                <div className="flex justify-center py-8 text-center">
                  <div className="max-w-md">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Sélectionnez un groupe pour le modifier</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Users className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Vous n'avez pas encore de groupe d'aventuriers</p>
                  <Button 
                    variant="default"
                    onClick={() => {
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
                    disabled={!canCreate}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer votre premier groupe
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PartyEditor; 