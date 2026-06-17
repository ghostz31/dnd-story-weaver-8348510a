/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { Users, UserPlus, Trash2, Edit, Plus, Sword, AlertCircle, Save, Check, Loader2 } from 'lucide-react';
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
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Party, Player } from '../lib/types';

import { useAuth } from '../auth/AuthContext';
import { extractCharacterFromBeyond } from '../lib/dndBeyondUtils';

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
  const [isImporting, setIsImporting] = useState(false);

  // État pour la validation Besace
  const [besaceCheckStatus, setBesaceCheckStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [besaceCheckError, setBesaceCheckError] = useState<string | null>(null);

  const checkBesaceCode = async (code: string) => {
    if (!code) return;
    setBesaceCheckStatus('checking');
    setBesaceCheckError(null);
    try {
      const docRef = doc(db, 'shared_characters', code);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().active !== false) {
        setBesaceCheckStatus('valid');
        const data = docSnap.data();
        
        // Mettre à jour le formulaire avec les données de base de Besace
        setNewPlayer(prev => ({
          ...prev,
          besaceShareCode: code,
          syncSource: 'besace',
          name: data.characterName || prev.name || '',
          race: data.race || prev.race || '',
          characterClass: data.className || prev.characterClass,
          level: data.level || prev.level,
          ac: data.ac || prev.ac,
          maxHp: data.maxHp || prev.maxHp,
          currentHp: data.currentHp || prev.currentHp,
          avatarUrl: data.avatarUrl || prev.avatarUrl,
        }));
        
        toast({
          title: "Code Besace valide !",
          description: `Connecté pour ${data.characterName || 'le personnage'}.`,
          variant: "default"
        });
      } else {
        setBesaceCheckStatus('invalid');
        setBesaceCheckError("Code introuvable ou personnage inactif.");
      }
    } catch (e: any) {
      console.error('Erreur getDoc Besace:', e);
      setBesaceCheckStatus('invalid');
      setBesaceCheckError(`Erreur technique: ${e.message || "Vérification impossible."}`);
    }
  };

  // Fonction de fallback pour extraire les données depuis le HTML de la page
  const tryHtmlScraping = async (url: string) => {
    const proxyServices = [
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    ];

    for (const proxyUrl of proxyServices) {
      try {
        console.log('Tentative de scraping HTML depuis:', proxyUrl);

        const response = await fetch(proxyUrl);
        if (!response.ok) continue;

        const html = await response.text();

        // Chercher les données JSON dans le HTML (D&D Beyond stocke souvent les données dans des scripts)
        const jsonMatch = html.match(/window\.characterData\s*=\s*({.*?});/s) ||
          html.match(/data-character\s*=\s*"([^"]*)"/) ||
          html.match(/"character":\s*({.*?})/s);

        if (jsonMatch) {
          let jsonStr = jsonMatch[1];
          if (jsonMatch[0].includes('data-character')) {
            jsonStr = jsonMatch[1].replace(/&quot;/g, '"');
          }

          const characterData = JSON.parse(jsonStr);
          console.log('Données extraites du HTML:', characterData);
          return characterData;
        }

        // Fallback: extraire des informations basiques depuis le HTML
        const nameMatch = html.match(/<h1[^>]*class="[^"]*character-name[^"]*"[^>]*>([^<]+)</i) ||
          html.match(/<title>([^-]+)\s*-\s*D&D Beyond</i);

        if (nameMatch) {
          return {
            data: {
              name: nameMatch[1].trim(),
              // Données par défaut quand on ne peut extraire que le nom
              classes: [{ level: 1, definition: { name: 'Fighter' } }],
              race: { fullName: '' },
              armorClass: 10,
              baseHitPoints: 10
            }
          };
        }

      } catch (error) {
        console.warn(`Échec du scraping avec ${proxyUrl}:`, error);
        continue;
      }
    }

    throw new Error('Impossible d\'extraire les données depuis le HTML');
  };

  // Fonction pour extraire les données depuis D&D Beyond
  const importFromDndBeyond = async (url: string) => {
    try {
      setIsImporting(true);

      // Vérifier que l'URL est valide
      if (!url.includes('dndbeyond.com/characters/')) {
        throw new Error('URL D&D Beyond invalide. Utilisez une URL du type: https://www.dndbeyond.com/characters/[ID]');
      }

      // Extraire l'ID du personnage depuis l'URL
      const characterIdMatch = url.match(/\/characters\/(\d+)/);
      if (!characterIdMatch) {
        throw new Error('Impossible d\'extraire l\'ID du personnage depuis l\'URL');
      }

      const characterId = characterIdMatch[1];
      console.log('ID du personnage D&D Beyond:', characterId);

      // Utiliser le proxy local configuré dans Vite
      const apiUrl = `/api/dndbeyond/character/v5/character/${characterId}`;

      console.log('Tentative de récupération depuis le proxy local:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText} - Vérifiez que le personnage est PUBLIC sur D&D Beyond.`);
      }

      const characterData = await response.json();
      console.log('Données récupérées avec succès');

      // Utiliser l'utilitaire centralisé pour extraire les données
      const extracted = extractCharacterFromBeyond(characterData, characterId);

      console.log('Stats extraites:', extracted);

      // Mettre à jour le formulaire avec les données extraites
      setNewPlayer(prev => ({
        ...prev,
        name: extracted.name,
        level: extracted.level,
        characterClass: extracted.characterClass,
        race: extracted.race,
        ac: extracted.ac,
        maxHp: extracted.maxHp,
        currentHp: extracted.currentHp,
        str: extracted.str,
        dex: extracted.dex,
        con: extracted.con,
        int: extracted.int,
        wis: extracted.wis,
        cha: extracted.cha,
        speed: extracted.speed,
        initiative: extracted.initiative,
        dndBeyondId: characterId,
        syncSource: 'beyond' as const,
        proficiencies: extracted.proficiencies,
        subclass: extracted.subclass,
      }));

      toast({
        title: "Import réussi !",
        description: `Importé: ${extracted.name} (Niv ${extracted.level} ${extracted.characterClass}) - STR:${extracted.str} DEX:${extracted.dex}`,
        variant: "default"
      });

      // Effacer l'URL après l'import
      setDndBeyondUrl('');

    } catch (error) {
      console.error('Erreur lors de l\'import D&D Beyond:', error);
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Impossible d'importer les données. Vérifiez l'URL.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

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
          <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-center text-muted-foreground mb-4">
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
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mb-2">
                {parties.map(party => (
                  <Button
                    key={party.id}
                    variant={selectedParty?.id === party.id ? "default" : "outline"}
                    className="flex items-center whitespace-nowrap flex-shrink-0 touch-target"
                    onClick={() => setSelectedParty(party)}
                  >
                    <Users className="mr-1.5 h-4 w-4" />
                    <span className="max-w-[120px] truncate">{party.name}</span>
                    <span className="ml-1.5 text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">
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
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-semibold flex items-center truncate">
                        {selectedParty.name}
                        <span className="ml-2 text-xs md:text-sm font-normal text-muted-foreground">
                          (Niv. moy: {calculateAverageLevel(selectedParty)})
                        </span>
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openEditPartyDialog}
                        className="touch-target"
                      >
                        <Edit className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Renommer</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive/80 hover:text-destructive/90 touch-target"
                        onClick={() => handleDeleteParty(selectedParty.id)}
                      >
                        <Trash2 className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardHeader className="p-3 md:p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Personnages</CardTitle>

                        <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="touch-target"
                              onClick={() => {
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
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Ajouter
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-full max-w-3xl h-full md:h-auto md:max-h-[90vh] flex flex-col rounded-none md:rounded-lg">
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
                            <div className="space-y-4 py-4 overflow-y-auto">
                              <p className="text-sm text-muted-foreground mb-4">
                                Remplissez les informations de base, ou importez depuis D&D Beyond.
                                Les caractéristiques et maîtrises peuvent être ajoutées dans les onglets dédiés.
                              </p>

                              <Tabs defaultValue="general" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="general">Général</TabsTrigger>
                                  <TabsTrigger value="stats">Caractéristiques</TabsTrigger>
                                  <TabsTrigger value="proficiencies">Maîtrises</TabsTrigger>
                                </TabsList>

                                <TabsContent value="general" className="space-y-4 pt-4">
                                  <div className="space-y-4">
                                    <Label className="text-base font-semibold">Source du personnage</Label>
                                    <div className="flex gap-2">
                                      <Button 
                                        type="button"
                                        variant={newPlayer.syncSource === 'beyond' ? 'default' : 'outline'} 
                                        className={newPlayer.syncSource === 'beyond' ? 'bg-red-600 hover:bg-red-700 border-red-600' : 'border-border'}
                                        onClick={() => setNewPlayer({...newPlayer, syncSource: 'beyond'})}
                                      >
                                        D&D Beyond
                                      </Button>
                                      <Button 
                                        type="button"
                                        variant={newPlayer.syncSource === 'besace' ? 'default' : 'outline'}
                                        className={newPlayer.syncSource === 'besace' ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600' : 'border-border'}
                                        onClick={() => setNewPlayer({...newPlayer, syncSource: 'besace'})}
                                      >
                                        Besace
                                      </Button>
                                      <Button 
                                        type="button"
                                        variant={newPlayer.syncSource === 'none' ? 'default' : 'outline'}
                                        className={newPlayer.syncSource === 'none' ? 'bg-slate-700 hover:bg-slate-800' : 'border-border'}
                                        onClick={() => setNewPlayer({...newPlayer, syncSource: 'none'})}
                                      >
                                        Manuel
                                      </Button>
                                    </div>

                                    {newPlayer.syncSource === 'beyond' && (
                                      <div className="space-y-2 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                        <Label htmlFor="dndBeyondUrl" className="text-destructive font-semibold">
                                          URL ou ID du personnage Beyond
                                        </Label>
                                        <div className="flex gap-2">
                                          <Input
                                            id="dndBeyondUrl"
                                            placeholder="ex: https://www.dndbeyond.com/characters/..."
                                            value={dndBeyondUrl}
                                            onChange={(e) => setDndBeyondUrl(e.target.value)}
                                            className="flex-1 border-destructive/20 focus-visible:ring-red-500"
                                          />
                                          <Button
                                            type="button"
                                            onClick={() => importFromDndBeyond(dndBeyondUrl)}
                                            disabled={!dndBeyondUrl || isImporting}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                          >
                                            {isImporting ? (
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                              isEditingPlayer && newPlayer.dndBeyondId ? 'Rafraîchir' : 'Importer'
                                            )}
                                          </Button>
                                        </div>
                                        <p className="text-xs text-destructive/80">
                                          Synchronisation en direct des PV et de la CA pendant le combat.
                                        </p>
                                      </div>
                                    )}

                                    {newPlayer.syncSource === 'besace' && (
                                      <div className="space-y-2 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                        <Label htmlFor="besaceShareCode" className="text-indigo-800 dark:text-indigo-300 font-semibold">
                                          Code de partage Besace
                                        </Label>
                                        <div className="flex gap-2">
                                          <div className="relative flex-1">
                                            <Input
                                              id="besaceShareCode"
                                              placeholder="Entrez le code à 6 caractères"
                                              value={newPlayer.besaceShareCode || ''}
                                              onChange={(e) => {
                                                setNewPlayer({...newPlayer, besaceShareCode: e.target.value.toUpperCase()});
                                                setBesaceCheckStatus('idle');
                                              }}
                                              maxLength={6}
                                              className={`font-mono uppercase pr-10 transition-colors ${
                                                besaceCheckStatus === 'valid'
                                                  ? 'border-green-500 focus-visible:ring-green-500 bg-green-500/10 dark:bg-green-950/30'
                                                  : besaceCheckStatus === 'invalid'
                                                    ? 'border-red-500 focus-visible:ring-red-500 bg-destructive/10 dark:bg-red-950/30'
                                                    : besaceCheckStatus === 'checking'
                                                      ? 'border-indigo-300 focus-visible:ring-indigo-500'
                                                      : 'border-indigo-200 focus-visible:ring-indigo-500'
                                              }`}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                              {besaceCheckStatus === 'checking' && (
                                                <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                                              )}
                                              {besaceCheckStatus === 'valid' && (
                                                <Check className="h-4 w-4 text-green-600" />
                                              )}
                                              {besaceCheckStatus === 'invalid' && (
                                                <AlertCircle className="h-4 w-4 text-destructive/80" />
                                              )}
                                            </div>
                                          </div>
                                          <Button
                                            type="button"
                                            onClick={() => checkBesaceCode(newPlayer.besaceShareCode || '')}
                                            disabled={!newPlayer.besaceShareCode || newPlayer.besaceShareCode.length < 5 || besaceCheckStatus === 'checking'}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                          >
                                            {besaceCheckStatus === 'checking' ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              'Connecter'
                                            )}
                                          </Button>
                                        </div>
                                        {besaceCheckStatus === 'valid' && (
                                          <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center">
                                            <Check className="h-3 w-3 mr-1.5" />
                                            Connecté avec succès. Synchronisation en temps réel.
                                          </p>
                                        )}
                                        {besaceCheckStatus === 'invalid' && (
                                          <p className="text-xs text-destructive dark:text-red-400 font-medium flex items-center">
                                            <AlertCircle className="h-3 w-3 mr-1.5" />
                                            {besaceCheckError || "Code invalide"}
                                          </p>
                                        )}
                                        {besaceCheckStatus === 'idle' && (
                                          <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">
                                            Synchronisation en direct des PV, CA, Conditions avec l'app joueur Besace.
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="playerName">Nom du personnage</Label>
                                    <Input
                                      id="playerName"
                                      placeholder="Bruenor Battlehammer"
                                      value={newPlayer.name}
                                      onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="playerRace">Race</Label>
                                    <Input
                                      id="playerRace"
                                      placeholder="Nain des montagnes"
                                      value={newPlayer.race || ''}
                                      onChange={(e) => setNewPlayer({ ...newPlayer, race: e.target.value })}
                                    />
                                  </div>

<div className="space-y-2">
                                    <Label htmlFor="dndBeyondId">ID D&D Beyond (Optionnel)</Label>
                                    <div className="text-xs text-muted-foreground mb-1">
                                        ID du personnage pour la synchronisation (ex: 123456)
                                    </div>
                                    <Input
                                      id="dndBeyondId"
                                      placeholder="ex: 123456"
                                      value={newPlayer.dndBeyondId || ''}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setNewPlayer({ ...newPlayer, dndBeyondId: val });
                                      }}
                                      disabled={newPlayer.syncSource === 'besace'}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Source de synchronisation</Label>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant={newPlayer.syncSource === 'beyond' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setNewPlayer({ ...newPlayer, syncSource: 'beyond', besaceShareCode: '' })}
                                      >
                                        D&D Beyond
                                      </Button>
                                      <Button
                                        type="button"
                                        variant={newPlayer.syncSource === 'besace' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setNewPlayer({ ...newPlayer, syncSource: 'besace', dndBeyondId: '' })}
                                      >
                                        Besace
                                      </Button>
                                      <Button
                                        type="button"
                                        variant={(!newPlayer.syncSource || newPlayer.syncSource === 'none') ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setNewPlayer({ ...newPlayer, syncSource: 'none', dndBeyondId: '', besaceShareCode: '' })}
                                      >
                                        Aucune
                                      </Button>
                                    </div>
                                  </div>

                                  {newPlayer.syncSource === 'besace' && (
                                    <div className="space-y-2">
                                      <Label htmlFor="besaceShareCode">Code de partage Besace</Label>
                                      <div className="text-xs text-muted-foreground mb-1">
                                        Le joueur obtient ce code dans son application Besace (bouton Partager)
                                      </div>
                                      <Input
                                        id="besaceShareCode"
                                        placeholder="ex: ABC123"
                                        value={newPlayer.besaceShareCode || ''}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                                          setNewPlayer({ ...newPlayer, besaceShareCode: val });
                                        }}
                                        maxLength={6}
                                        className="font-mono text-center text-lg tracking-widest"
                                      />
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="playerClass">Classe</Label>
                                      <Select
                                        value={newPlayer.characterClass}
                                        onValueChange={(value) => setNewPlayer({ ...newPlayer, characterClass: value })}
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
                                        onValueChange={(value) => setNewPlayer({ ...newPlayer, level: parseInt(value) })}
                                      >
                                        <SelectTrigger id="playerLevel">
                                          <SelectValue placeholder="Niveau" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                                            <SelectItem key={level} value={level.toString()}>
                                              {level}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="playerAC">Classe d'Armure (CA)</Label>
                                      <Input
                                        id="playerAC"
                                        type="number"
                                        min="0"
                                        placeholder="10"
                                        value={newPlayer.ac || 10}
                                        onChange={(e) => setNewPlayer({ ...newPlayer, ac: parseInt(e.target.value) || 10 })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="playerMaxHP">PV Maximum</Label>
                                      <Input
                                        id="playerMaxHP"
                                        type="number"
                                        min="1"
                                        placeholder="10"
                                        value={newPlayer.maxHp || 10}
                                        onChange={(e) => {
                                          const maxHp = parseInt(e.target.value) || 10;
                                          // Ajuster le PV actuel si nécessaire
                                          const currentHp = newPlayer.currentHp && newPlayer.currentHp > maxHp
                                            ? maxHp
                                            : newPlayer.currentHp || maxHp;
                                          setNewPlayer({ ...newPlayer, maxHp, currentHp });
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="playerCurrentHP">PV Actuels</Label>
                                      <Input
                                        id="playerCurrentHP"
                                        type="number"
                                        min="0"
                                        max={newPlayer.maxHp || 10}
                                        placeholder="10"
                                        value={newPlayer.currentHp || 10}
                                        onChange={(e) => {
                                          const currentHp = parseInt(e.target.value) || 0;
                                          // S'assurer que le PV actuel ne dépasse pas le maximum
                                          const validCurrentHp = Math.min(currentHp, newPlayer.maxHp || 10);
                                          setNewPlayer({ ...newPlayer, currentHp: validCurrentHp });
                                        }}
                                      />
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="stats" className="space-y-4 pt-4">
                                  <div className="grid grid-cols-3 gap-4">
                                    {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((stat) => (
                                      <div key={stat} className="space-y-1">
                                        <Label htmlFor={`stat-${stat}`} className="uppercase text-xs font-bold text-muted-foreground">
                                          {stat}
                                        </Label>
                                        <Input
                                          id={`stat-${stat}`}
                                          type="number"
                                          min="1"
                                          max="30"
                                          value={(newPlayer as any)[stat] || 10}
                                          onChange={(e) => setNewPlayer({ ...newPlayer, [stat]: parseInt(e.target.value) || 10 })}
                                          className="text-center"
                                        />
                                        <div className="text-[10px] text-center text-muted-foreground">
                                          {Math.floor(((newPlayer as any)[stat] || 10) - 10) / 2 >= 0 ? '+' : ''}
                                          {Math.floor(((newPlayer as any)[stat] || 10) - 10) / 2}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </TabsContent>

                                <TabsContent value="proficiencies" className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="playerProficiencies">Maîtrises & Aptitudes</Label>
                                    <Textarea
                                      id="playerProficiencies"
                                      value={newPlayer.proficiencies || ''}
                                      onChange={(e) => setNewPlayer({ ...newPlayer, proficiencies: e.target.value })}
                                      placeholder="Armures légères, épées courtes, outils de voleur, Elfique...&#10;Dons : Tireur d'élite..."
                                      className="min-h-[200px]"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Listez ici les maîtrises d'armes, d'armures, d'outils, les langues connues et les dons importants.
                                    </p>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>


                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
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
                          <UserPlus className="h-10 w-10 text-muted-foreground/50 mb-2" />
                          <p className="text-muted-foreground mb-2">Aucun personnage dans ce groupe</p>
                          <p className="text-muted-foreground/70 text-sm mb-4">
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
                                characterClass: 'Guerrier',
                                race: '',
                                ac: 10,
                                maxHp: 10,
                                currentHp: 10
                              });
                              setIsPlayerDialogOpen(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Ajouter un personnage
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                          {selectedParty.players.map(player => (
                            <div
                              key={player.id}
                              className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all group"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                                    {player.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">{player.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {player.race || 'Race inconnue'} • {player.characterClass}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => openEditPlayerDialog(player)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive/80 hover:text-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemovePlayer(player.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary" className="text-xs">
                                  Niv. {player.level}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  CA {player.ac || '?'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  PV {player.currentHp !== undefined && player.maxHp !== undefined
                                    ? `${player.currentHp}/${player.maxHp}`
                                    : '?'}
                                </Badge>
                              </div>

                              <div className="flex gap-1.5">
                                {player.dndBeyondId && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive border border-destructive/20 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                                    Beyond
                                  </span>
                                )}
                                {player.besaceShareCode && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                                    Besace
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : parties.length > 0 ? (
                <div className="flex justify-center py-8 text-center">
                  <div className="max-w-md">
                    <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Sélectionnez un groupe pour le modifier</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">Vous n'avez pas encore de groupe d'aventuriers</p>
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
    </div >
  );
};

export default PartyEditor; 