import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { Users, UserPlus, Trash2, Edit, Plus, AlertCircle, Save } from 'lucide-react';
import PlayerImportModal from './PlayerImportModal';
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
} from '../lib/firebaseApi';
import { Party, Player } from '../lib/types';
import UsageStats from './UsageStats';
import { useAuth } from '../auth/AuthContext';

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
  
  // État pour la modal d'import de joueur
  const [isPlayerImportModalOpen, setIsPlayerImportModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Charger les données au démarrage
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        try {
          // S'abonner aux changements de groupes
          const unsubscribe = subscribeToParties((fetchedParties) => {
            setParties(fetchedParties);
            setIsLoading(false);
          });
          
          // Vérifier les limites
          const canCreateNew = await canCreateParty();
          setCanCreate(canCreateNew);
          
          return unsubscribe;
        } catch (err) {
          console.error('Erreur lors du chargement des données:', err);
          setError('Impossible de charger les données');
          setIsLoading(false);
        }
      } else {
                 // Mode local
         try {
           const localParties = await getParties();
           setParties(localParties);
           setIsLoading(false);
         } catch (err) {
          console.error('Erreur lors du chargement des données locales:', err);
          setError('Impossible de charger les données');
          setIsLoading(false);
        }
      }
    };

              loadData();
  }, [isAuthenticated]);

  // Gestion de la création d'un groupe
  const handleCreateParty = async () => {
    if (!newPartyName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom au groupe",
        variant: "destructive"
      });
      return;
    }

    try {
             const newParty = await createParty(newPartyName.trim());
      if (newParty) {
        setParties([newParty, ...parties]);
        setSelectedParty(newParty);
        
        toast({
          title: "Groupe créé",
          description: `Le groupe "${newPartyName}" a été créé avec succès`
        });
        
        setNewPartyName('');
        setIsPartyDialogOpen(false);
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le groupe",
        variant: "destructive"
      });
    }
  };

  // Gestion de la modification d'un groupe
  const handleUpdateParty = async () => {
    if (!selectedParty || !newPartyName.trim()) return;

    try {
      const updatedParty = await updateParty(selectedParty.id, { name: newPartyName.trim() });
      if (updatedParty) {
        setParties(parties.map(party => 
          party.id === selectedParty.id ? updatedParty : party
        ));
        setSelectedParty(updatedParty);
        
        toast({
          title: "Groupe modifié",
          description: `Le groupe a été renommé en "${newPartyName}"`
        });
        
        setNewPartyName('');
        setIsEditingParty(false);
        setIsPartyDialogOpen(false);
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le groupe",
        variant: "destructive"
      });
    }
  };

  // Gestion de la suppression d'un groupe
  const handleDeleteParty = async (partyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe et tous ses personnages ?')) {
      return;
    }

    try {
      const success = await deleteParty(partyId);
      if (success) {
        setParties(parties.filter(party => party.id !== partyId));
        
        if (selectedParty?.id === partyId) {
          setSelectedParty(null);
        }
        
        toast({
          title: "Groupe supprimé",
          description: "Le groupe a été supprimé avec succès"
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

  // Gestion de l'ajout/modification d'un joueur via la modal
  const handlePlayerImport = async (player: Player) => {
    if (!selectedParty) return;

    try {
      let updatedParty;
      
      if (editingPlayer) {
        // Modification d'un joueur existant
        const updatedPlayer = await updatePlayer(selectedParty.id, player.id, player);
        if (updatedPlayer) {
          updatedParty = {
            ...selectedParty,
            players: selectedParty.players.map(p => 
              p.id === player.id ? updatedPlayer : p
            )
          };
          
          toast({
            title: "Succès",
            description: `${player.name} a été modifié`
          });
        }
      } else {
        // Ajout d'un nouveau joueur
        const addedPlayer = await addPlayerToParty(selectedParty.id, player);
        if (addedPlayer) {
          updatedParty = {
            ...selectedParty,
            players: [...selectedParty.players, addedPlayer]
          };
          
          toast({
            title: "Succès",
            description: `${player.name} a été ajouté au groupe`
          });
        }
      }
      
      if (updatedParty) {
        setSelectedParty(updatedParty);
        setParties(parties.map(party => 
          party.id === updatedParty.id ? updatedParty : party
        ));
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: editingPlayer ? "Impossible de modifier le personnage" : "Impossible d'ajouter le personnage",
        variant: "destructive"
      });
    }
  };

  // Ouvrir la modal d'ajout de joueur
  const handleAddPlayerClick = () => {
    setEditingPlayer(null);
    setIsPlayerImportModalOpen(true);
  };
  
  // Ouvrir la modal d'édition de joueur
  const handleEditPlayerClick = (player: Player) => {
    setEditingPlayer(player);
    setIsPlayerImportModalOpen(true);
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

  // Ouvrir le dialogue d'édition de groupe
  const openEditPartyDialog = () => {
    if (selectedParty) {
      setNewPartyName(selectedParty.name);
      setIsEditingParty(true);
      setIsPartyDialogOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des groupes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques d'utilisation */}
      {isAuthenticated && <UsageStats />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des groupes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Mes Groupes
              </CardTitle>
              
              <Dialog open={isPartyDialogOpen} onOpenChange={setIsPartyDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm"
                    disabled={!canCreate}
                    onClick={() => {
                      setIsEditingParty(false);
                      setNewPartyName('');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nouveau
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isEditingParty ? "Modifier le groupe" : "Créer un nouveau groupe"}
                    </DialogTitle>
                    <DialogDescription>
                      {isEditingParty 
                        ? "Modifiez le nom de ce groupe d'aventuriers" 
                        : "Créez un nouveau groupe d'aventuriers pour organiser vos personnages"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="partyName">Nom du groupe</Label>
                    <Input
                      id="partyName"
                      placeholder="Les Héros de Waterdeep"
                      value={newPartyName}
                      onChange={(e) => setNewPartyName(e.target.value)}
                      className="mt-2"
                    />
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
                    <Button onClick={isEditingParty ? handleUpdateParty : handleCreateParty}>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditingParty ? "Enregistrer" : "Créer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {parties.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm">Aucun groupe créé</p>
                <p className="text-xs mt-1">Créez votre premier groupe d'aventuriers !</p>
              </div>
            ) : (
              <div className="divide-y">
                {parties.map(party => (
                  <div
                    key={party.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedParty?.id === party.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedParty(party)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{party.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {party.players.length} personnage{party.players.length !== 1 ? 's' : ''}
                        </p>
                        {party.players.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Niv. moyen: {Math.round(party.players.reduce((sum, p) => sum + p.level, 0) / party.players.length)}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditPartyDialog();
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteParty(party.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Détails du groupe sélectionné */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base">
                  {selectedParty ? selectedParty.name : "Sélectionnez un groupe"}
                </CardTitle>
                {selectedParty && (
                  <CardDescription>
                    {selectedParty.players.length} personnage{selectedParty.players.length !== 1 ? 's' : ''}
                  </CardDescription>
                )}
              </div>
              
              {selectedParty && (
                <Button 
                  size="sm"
                  onClick={handleAddPlayerClick}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedParty ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium mb-2">Aucun groupe sélectionné</p>
                <p className="text-sm">Sélectionnez un groupe dans la liste pour voir ses personnages</p>
              </div>
            ) : selectedParty.players.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <UserPlus className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium mb-2">Aucun personnage</p>
                <p className="text-sm mb-4">Ce groupe n'a pas encore de personnages</p>
                <Button onClick={handleAddPlayerClick}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter le premier personnage
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Personnage</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Race</TableHead>
                    <TableHead>CA</TableHead>
                    <TableHead>PV</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedParty.players.map(player => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>{player.characterClass}</TableCell>
                      <TableCell>{player.level}</TableCell>
                      <TableCell>{player.race || '-'}</TableCell>
                      <TableCell>{player.ac || '-'}</TableCell>
                      <TableCell>
                        {player.currentHp !== undefined && player.maxHp !== undefined 
                          ? `${player.currentHp}/${player.maxHp}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditPlayerClick(player)}
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
      
      {/* Modal d'import de personnage */}
      <PlayerImportModal
        isOpen={isPlayerImportModalOpen}
        onClose={() => {
          setIsPlayerImportModalOpen(false);
          setEditingPlayer(null);
        }}
        onImport={handlePlayerImport}
        editingPlayer={editingPlayer || undefined}
      />
    </div>
  );
};

export default PartyEditor; 