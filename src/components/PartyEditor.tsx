import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  canCreateParty,
  subscribeToParties
} from '../lib/firebaseApi';
import { Party, Player } from '../lib/types';
import UsageStats from './UsageStats';
import { useAuth } from '../auth/AuthContext';

// Classes de personnages D&D
const CHARACTER_CLASSES = [
  'Barbare', 'Barde', 'Clerc', 'Druide', 'Ensorceleur', 'Guerrier',
  'Magicien', 'Moine', 'Occultiste', 'Paladin', 'Rôdeur', 'Roublard'
];

// Correspondance entre les classes D&D Beyond (anglais) et françaises
const CLASS_MAPPING: Record<string, string> = {
  'Artificer': 'Artificier',
  'Barbarian': 'Barbare',
  'Bard': 'Barde',
  'Cleric': 'Clerc',
  'Druid': 'Druide',
  'Fighter': 'Guerrier',
  'Monk': 'Moine',
  'Paladin': 'Paladin',
  'Ranger': 'Rôdeur',
  'Rogue': 'Roublard',
  'Sorcerer': 'Ensorceleur',
  'Warlock': 'Occultiste',
  'Wizard': 'Magicien'
};

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

      // Extraire les informations pertinentes
      const character = characterData.data || characterData;

      if (!character) {
        throw new Error('Données du personnage non trouvées dans la réponse');
      }

      // 1. Extraire le nom
      const name = character.name || 'Personnage';

      // 2. Extraire la race
      const race = character.race?.fullName || character.race?.baseName || '';

      // 3. Extraire la classe et le niveau
      let characterClass = 'Guerrier';
      let level = 1;

      if (character.classes && character.classes.length > 0) {
        const primaryClass = character.classes[0];
        const englishClassName = primaryClass.definition?.name || 'Fighter';
        characterClass = CLASS_MAPPING[englishClassName] || englishClassName;
        level = primaryClass.level || 1;

        // Ajouter les niveaux des autres classes si multiclassage
        for (let i = 1; i < character.classes.length; i++) {
          level += character.classes[i].level || 0;
        }
      }

      // 4. Extraire les caractéristiques (Base + Bonus + Modificateurs)
      const stats = character.stats || [];
      const bonusStats = character.bonusStats || [];
      const overrideStats = character.overrideStats || [];

      // Ordre D&D Beyond: STR(0), DEX(1), CON(2), INT(3), WIS(4), CHA(5)
      const getStatValue = (index: number) => {
        // Vérifier si une valeur de surcharge existe
        if (overrideStats[index] && overrideStats[index].value) {
          return overrideStats[index].value;
        }

        // Sinon: Base + Bonus
        const base = (stats[index]?.value || 10);
        const bonus = (bonusStats[index]?.value || 0);
        return base + bonus;
      };

      const str = getStatValue(0);
      const dex = getStatValue(1);
      const con = getStatValue(2);
      const int = getStatValue(3);
      const wis = getStatValue(4);
      const cha = getStatValue(5);

      // 5. Extraire les PV
      let maxHp = 10;
      let currentHp = 10;

      if (character.baseHitPoints) {
        // Calcul un peu plus complexe pour les PV réels (Base + CON mod * Level + autres bonus)
        // Pour simplifier, on prend ce qui est fourni ou une estimation
        const conMod = Math.floor((con - 10) / 2);
        maxHp = (character.baseHitPoints || 10) + (character.bonusHitPoints || 0) + (conMod * level);

        // Vérifier si une surcharge de PV existe
        if (character.overrideHitPoints) {
          maxHp = character.overrideHitPoints;
        }

        currentHp = maxHp - (character.removedHitPoints || 0);
      }
      // Fallback sur d'autres champs si le calcul standard échoue
      else if (character.hitPoints) {
        maxHp = character.hitPoints;
        currentHp = character.currentHitPoints || maxHp;
      }

      // 6. Extraire la CA
      // D&D Beyond fournit souvent la CA calculée dans des champs différents selon l'équipement
      // On essaie de trouver le meilleur candidat
      let ac = 10;

      // Logique simplifiée : chercher la meilleure CA disponible
      // Idéalement, il faudrait recalculer à partir de l'équipement, mais c'est complexe
      // On cherche souvent une propriété "armorClass" explicite si disponible
      if (character.overrideStats && character.overrideStats[0]?.name === "Armor Class") {
        ac = character.overrideStats[0].value;
      } else {
        // Estimation basique: 10 + Dex Mod
        const dexMod = Math.floor((dex - 10) / 2);
        ac = 10 + dexMod;
      }

      // 7. Extraire la vitesse
      const speedList: string[] = [];
      if (character.race?.weightSpeeds?.normal?.walk) {
        speedList.push(`${character.race.weightSpeeds.normal.walk} ft`);
      }

      // 8. Extraire l'initiative
      const dexMod = Math.floor((dex - 10) / 2);
      let initiative = dexMod;

      if (character.modifiers?.race) {
        character.modifiers.race.forEach((mod: any) => {
          if (mod.subType === "initiative") initiative += mod.value;
        });
      }
      if (character.modifiers?.class) {
        character.modifiers.class.forEach((mod: any) => {
          if (mod.subType === "initiative") initiative += mod.value;
        });
      }
      if (character.modifiers?.feat) {
        character.modifiers.feat.forEach((mod: any) => {
          if (mod.subType === "initiative") initiative += mod.value;
        });
      }

      // 9. Extraire les Maîtrises (Armures, Armes, Outils, Langues)
      const proficienciesList: { type: string, name: string }[] = [];
      const languagesList: string[] = [];

      const processModifiers = (modifiers: any[]) => {
        if (!modifiers) return;
        modifiers.forEach((mod: any) => {
          if (mod.type === "proficiency") {
            proficienciesList.push({ type: mod.subType, name: mod.friendlySubtypeName });
          } else if (mod.type === "language") {
            languagesList.push(mod.friendlySubtypeName);
          }
        });
      };

      // Parcourir toutes les sources de modification
      const modKeys = ['race', 'class', 'background', 'feat', 'item'];
      modKeys.forEach(key => {
        if (character.modifiers && character.modifiers[key]) {
          processModifiers(character.modifiers[key]);
        }
      });

      // Organiser les maîtrises
      const armorProfs = proficienciesList.filter(p => p.type.includes('armor')).map(p => p.name).join(', ');
      const weaponProfs = proficienciesList.filter(p => p.type.includes('weapon')).map(p => p.name).join(', ');
      const toolProfs = proficienciesList.filter(p => p.type.includes('tool') || p.type.includes('kit') || p.type.includes('supplies')).map(p => p.name).join(', ');

      let proficienciesText = "";
      if (armorProfs) proficienciesText += `**Armures:** ${armorProfs}\n`;
      if (weaponProfs) proficienciesText += `**Armes:** ${weaponProfs}\n`;
      if (toolProfs) proficienciesText += `**Outils:** ${toolProfs}\n`;
      if (languagesList.length > 0) proficienciesText += `**Langues:** ${languagesList.join(', ')}\n`;

      console.log('Stats extraites:', { str, dex, con, int, wis, cha, ac, maxHp, proficiencies: proficienciesText });

      // Mettre à jour le formulaire avec les données extraites
      setNewPlayer({
        name: name,
        level: level,
        characterClass: characterClass,
        race: race,
        ac: ac,
        maxHp: maxHp,
        currentHp: currentHp,
        // Nouveaux champs
        str: str,
        dex: dex,
        con: con,
        int: int,
        wis: wis,
        cha: cha,
        speed: speedList,
        initiative: initiative,
        dndBeyondId: characterId,
        proficiencies: proficienciesText
      });

      toast({
        title: "Import réussi !",
        description: `Importé: ${name} (Niv ${level} ${characterClass}) - STR:${str} DEX:${dex}`,
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
        characterClass: 'Guerrier',
        ac: 10,
        maxHp: 10,
        currentHp: 10
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
        ac: 10,
        maxHp: 10,
        currentHp: 10
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
      characterClass: player.characterClass,
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
      proficiencies: player.proficiencies || ''
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
                                  {/* Section D&D Beyond Import */}
                                  {!isEditingPlayer && (
                                    <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                      <Label htmlFor="dndBeyondUrl" className="text-blue-800 font-semibold">
                                        Import depuis D&D Beyond (optionnel)
                                      </Label>
                                      <div className="flex gap-2">
                                        <Input
                                          id="dndBeyondUrl"
                                          placeholder="https://www.dndbeyond.com/characters/92791713"
                                          value={dndBeyondUrl}
                                          onChange={(e) => setDndBeyondUrl(e.target.value)}
                                          className="flex-1"
                                        />
                                        <Button
                                          type="button"
                                          onClick={() => importFromDndBeyond(dndBeyondUrl)}
                                          disabled={!dndBeyondUrl || isImporting}
                                          className="bg-blue-600 hover:bg-blue-700"
                                        >
                                          {isImporting ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                          ) : (
                                            'Importer'
                                          )}
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => {
                                            if (dndBeyondUrl) {
                                              window.open(dndBeyondUrl, '_blank');
                                              toast({
                                                title: "Page ouverte",
                                                description: "Copiez manuellement les informations depuis D&D Beyond dans les champs ci-dessous.",
                                                variant: "default"
                                              });
                                            }
                                          }}
                                          disabled={!dndBeyondUrl}
                                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                        >
                                          Ouvrir
                                        </Button>
                                      </div>
                                      <p className="text-xs text-blue-600">
                                        Collez l'URL de votre personnage D&D Beyond pour remplir automatiquement les champs
                                      </p>
                                    </div>
                                  )}

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
                                        // Garder uniquement les chiffres
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setNewPlayer({ ...newPlayer, dndBeyondId: val });
                                      }}
                                    />
                                  </div>
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
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nom</TableHead>
                              <TableHead>Race</TableHead>
                              <TableHead>Classe</TableHead>
                              <TableHead>Niveau</TableHead>
                              <TableHead>CA</TableHead>
                              <TableHead>PV</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedParty.players.map(player => (
                              <TableRow key={player.id}>
                                <TableCell className="font-medium">
                                  {player.name}
                                  {player.dndBeyondId && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800 border border-red-200">
                                      Sync
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>{player.race || '-'}</TableCell>
                                <TableCell>{player.characterClass}</TableCell>
                                <TableCell>{player.level}</TableCell>
                                <TableCell>{player.ac || '-'}</TableCell>
                                <TableCell>
                                  {player.currentHp !== undefined && player.maxHp !== undefined
                                    ? `${player.currentHp}/${player.maxHp}`
                                    : '-'}
                                </TableCell>
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
    </div >
  );
};

export default PartyEditor; 