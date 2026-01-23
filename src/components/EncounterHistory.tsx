import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sword, Clock, Trash, Play, Users, Shield, RefreshCw, FolderPlus, Folder, FolderOpen, MoreHorizontal, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getEncounters, subscribeToEncounters, deleteEncounter, subscribeToFolders, createFolder, deleteFolder, moveEncounterToFolder } from '../lib/firebaseApi';
import { shareEncounter, getShareUrl } from '../lib/sharingApi';
import { useAuth } from '../auth/AuthContext';
import { Encounter, EncounterMonster, Party, EncounterFolder } from '../lib/types';

// Fonction utilitaire pour générer des slugs AideDD corrects
const getAideDDMonsterSlug = (name: string): string => {
  // Convertir le nom en slug
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/ /g, '-')              // Remplacer les espaces par des tirets
    .replace(/[^a-z0-9-]/g, '');     // Supprimer les caractères non alphanumériques
};

const EncounterHistory: React.FC = () => {
  const [savedEncounters, setSavedEncounters] = useState<Encounter[]>([]);
  const [folders, setFolders] = useState<EncounterFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedEncounters();

      // Abonnement aux dossiers
      const unsubscribeFolders = subscribeToFolders((foldersData) => {
        setFolders(foldersData);
      });

      return () => {
        unsubscribeFolders();
      };
    } else {
      setLoading(false);
      setSavedEncounters([]);
      setFolders([]);
    }
  }, [isAuthenticated]);

  const loadSavedEncounters = async () => {
    try {
      setLoading(true);

      // Abonnement aux mises à jour des rencontres
      const unsubscribe = subscribeToEncounters((encounters) => {
        setSavedEncounters(encounters);
        setLoading(false);
      });

      // Nettoyer l'abonnement lors du démontage
      return () => unsubscribe();
    } catch (error) {
      console.error('Erreur lors du chargement des rencontres sauvegardées:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des rencontres.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // Créer un nouveau dossier
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      setIsCreatingFolder(true);
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      toast({
        title: "Dossier créé",
        description: `Le dossier "${newFolderName}" a été créé.`
      });
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le dossier.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Supprimer un dossier
  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
      toast({
        title: "Dossier supprimé",
        description: "Le dossier a été supprimé. Les rencontres ont été déplacées vers 'Sans dossier'."
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du dossier:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le dossier.",
        variant: "destructive"
      });
    }
  };

  // Déplacer une rencontre vers un dossier
  const handleMoveToFolder = async (encounterId: string, folderId: string | null) => {
    try {
      await moveEncounterToFolder(encounterId, folderId);
      toast({
        title: "Rencontre déplacée",
        description: folderId ? "La rencontre a été déplacée dans le dossier." : "La rencontre a été retirée du dossier."
      });
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de déplacer la rencontre.",
        variant: "destructive"
      });
    }
  };

  // Partager une rencontre
  const handleShare = async (encounterId: string) => {
    try {
      setSharingId(encounterId);
      const shareCode = await shareEncounter(encounterId);
      const shareUrl = getShareUrl(shareCode);

      // Copier le lien dans le presse-papiers
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Lien copié !",
        description: `Code de partage : ${shareCode}. Le lien a été copié dans le presse-papiers.`
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      toast({
        title: "Erreur",
        description: "Impossible de partager la rencontre.",
        variant: "destructive"
      });
    } finally {
      setSharingId(null);
    }
  };

  // Filtrer les rencontres par dossier
  const filteredEncounters = selectedFolderId === null
    ? savedEncounters
    : selectedFolderId === 'none'
      ? savedEncounters.filter(e => !e.folderId)
      : savedEncounters.filter(e => e.folderId === selectedFolderId);

  const handleDeleteEncounter = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteEncounter(id);
      toast({
        title: "Rencontre supprimée",
        description: "La rencontre a été supprimée de l'historique."
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la rencontre:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la rencontre.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const loadEncounterToTracker = (encounter: Encounter) => {
    try {
      console.log("Chargement de la rencontre vers le tracker:", encounter.id);

      // Naviguer directement vers le tracker avec l'ID de la rencontre
      // Le tracker se chargera de récupérer les données depuis Firebase
      console.log("Navigation vers /encounter-tracker/" + encounter.id);
      window.location.href = `/encounter-tracker/${encounter.id}`;
    } catch (error) {
      console.error('Erreur lors du chargement de la rencontre:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la rencontre.",
        variant: "destructive"
      });
    }
  };

  const getDifficultyBadge = (difficulty: 'easy' | 'medium' | 'hard' | 'deadly') => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-500">Facile</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Moyen</Badge>;
      case 'hard':
        return <Badge className="bg-orange-500">Difficile</Badge>;
      case 'deadly':
        return <Badge className="bg-red-500">Mortel</Badge>;
      default:
        return <Badge>{difficulty}</Badge>;
    }
  };

  const getStatusBadge = (status?: 'draft' | 'active' | 'completed') => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-blue-500">En cours</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-700">Terminée</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getPartyInfo = (party?: Party) => {
    if (!party) return null;

    return (
      <div className="flex items-center gap-1 text-sm">
        <Users className="w-3 h-3" />
        <span>{party.name}</span>
        <span className="text-xs text-muted-foreground">
          ({party.players.length} joueurs, niv. moyen {calculateAverageLevel(party)})
        </span>
      </div>
    );
  };

  const calculateAverageLevel = (party: Party) => {
    if (!party.players.length) return 0;
    const totalLevel = party.players.reduce((sum, player) => sum + player.level, 0);
    return Math.round(totalLevel / party.players.length);
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Historique des Rencontres
          </CardTitle>
          <CardDescription>
            Connectez-vous pour voir votre historique de rencontres
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center p-6">
          <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette fonctionnalité</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Se connecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Chroniques de Campagne
          </CardTitle>
          <div className="flex gap-2">
            {/* Bouton Nouveau Dossier */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="w-4 h-4 mr-1" />
                  Dossier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau dossier</DialogTitle>
                  <DialogDescription>
                    Créez un dossier pour organiser vos rencontres.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="folderName">Nom du dossier</Label>
                    <Input
                      id="folderName"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Ex: Campagne du Dragon"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder();
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateFolder} disabled={isCreatingFolder || !newFolderName.trim()}>
                    {isCreatingFolder ? 'Création...' : 'Créer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={loadSavedEncounters}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Tabs de dossiers */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={selectedFolderId === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFolderId(null)}
            className="h-8"
          >
            <Folder className="w-3 h-3 mr-1" />
            Tous ({savedEncounters.length})
          </Button>
          <Button
            variant={selectedFolderId === 'none' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFolderId('none')}
            className="h-8"
          >
            <Folder className="w-3 h-3 mr-1" />
            Sans dossier ({savedEncounters.filter(e => !e.folderId).length})
          </Button>
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center">
              <Button
                variant={selectedFolderId === folder.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFolderId(folder.id)}
                className="h-8 rounded-r-none"
              >
                <FolderOpen className="w-3 h-3 mr-1" />
                {folder.name} ({savedEncounters.filter(e => e.folderId === folder.id).length})
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-1 rounded-l-none border-l-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => handleDeleteFolder(folder.id)}
                  >
                    <Trash className="w-3 h-3 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        <CardDescription className="mt-2">
          {loading ? 'Chargement...' : `${filteredEncounters.length} rencontre(s) affichée(s)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mt-3" />
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEncounters.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            <p>Aucune rencontre dans ce dossier</p>
            <p className="text-sm">Les rencontres que vous sauvegardez apparaîtront ici</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredEncounters.map((encounter) => (
                <Card key={encounter.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${encounter.difficulty === 'easy' ? 'bg-green-500' :
                    encounter.difficulty === 'medium' ? 'bg-yellow-500' :
                      encounter.difficulty === 'hard' ? 'bg-orange-500' :
                        'bg-red-500'
                    }`} />

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-lg flex items-center gap-2">
                          {encounter.name}
                          {getStatusBadge(encounter.status)}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {formatDate(encounter.updatedAt)}
                          {getDifficultyBadge(encounter.difficulty)}
                          <span>{encounter.totalXP} XP</span>
                        </div>
                        {getPartyInfo(encounter.party)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => loadEncounterToTracker(encounter)}
                          className="h-8"
                        >
                          <Play className="w-4 h-4 mr-1" /> Lancer
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-red-500 hover:text-red-700"
                              disabled={deletingId === encounter.id}
                            >
                              <Trash className={`w-4 h-4 ${deletingId === encounter.id ? 'animate-spin' : ''}`} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cette rencontre ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. La rencontre sera définitivement supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEncounter(encounter.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* Bouton partage */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => handleShare(encounter.id)}
                          disabled={sharingId === encounter.id}
                          title="Partager cette rencontre"
                        >
                          <Share2 className={`w-4 h-4 ${sharingId === encounter.id ? 'animate-pulse' : ''}`} />
                        </Button>

                        {/* Menu déplacer vers dossier */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <Folder className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleMoveToFolder(encounter.id, null)}>
                              <Folder className="w-3 h-3 mr-2" />
                              Sans dossier
                            </DropdownMenuItem>
                            {folders.length > 0 && <DropdownMenuSeparator />}
                            {folders.map((folder) => (
                              <DropdownMenuItem
                                key={folder.id}
                                onClick={() => handleMoveToFolder(encounter.id, folder.id)}
                              >
                                <FolderOpen className="w-3 h-3 mr-2" />
                                {folder.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="text-sm mt-3">
                      <div className="font-medium mb-1">Créatures :</div>
                      <div className="flex flex-wrap gap-1">
                        {(encounter.monsters as EncounterMonster[]).map((monsterEntry, idx) => (
                          <Badge key={idx} variant="outline" className="flex items-center">
                            <Sword className="w-3 h-3 mr-1" />
                            {monsterEntry.quantity > 1 ? `${monsterEntry.quantity}× ` : ''}
                            <a
                              href={`https://www.aidedd.org/dnd/monstres.php?vf=${getAideDDMonsterSlug(monsterEntry.monster.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {monsterEntry.monster.name}
                            </a>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default EncounterHistory; 