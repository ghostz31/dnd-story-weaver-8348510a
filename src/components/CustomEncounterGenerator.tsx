import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from '../hooks/use-toast';
import { Plus, Trash2, Save, Search, AlertCircle, Check, FileText, Skull } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { useAuth } from '../auth/AuthContext';
import { getParties, canCreateEncounter, saveEncounter, getEncounters, deleteEncounter, subscribeToEncounters } from '../lib/firebaseApi';
import { Party, Monster, Encounter } from '../lib/types';
import { useMonsters } from '../hooks/useMonsters';

// Difficultés d'une rencontre
const ENCOUNTER_DIFFICULTIES = ['easy', 'medium', 'hard', 'deadly'] as const;

// Fonction utilitaire pour générer des slugs AideDD corrects
const getAideDDMonsterSlug = (name: string): string => {
  // Convertir le nom en slug
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/ /g, '-')              // Remplacer les espaces par des tirets
    .replace(/[^a-z0-9-]/g, '');     // Supprimer les caractères non alphanumériques
};

const CustomEncounterGenerator: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [canCreate, setCanCreate] = useState(true);

  // Hook de récupérations des monstres (remplace les mocks)
  const { monsters: allMonsters, loading: loadingMonsters } = useMonsters();

  // État pour le formulaire de création de rencontre
  const [encounterName, setEncounterName] = useState('');
  const [monsterList, setMonsterList] = useState<Monster[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Monster[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Charger les groupes
        const fetchedParties = await getParties();
        setParties(fetchedParties);

        if (fetchedParties.length > 0) {
          setSelectedPartyId(fetchedParties[0].id);
        }

        // Vérifier si l'utilisateur peut créer une nouvelle rencontre
        const canCreateNew = await canCreateEncounter();
        setCanCreate(canCreateNew);

        // Utiliser l'abonnement aux rencontres pour obtenir les mises à jour en temps réel
        // Les données chargées initialement et également lors des modifications
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger vos données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // S'abonner aux changements dans les rencontres
    const unsubscribe = subscribeToEncounters((fetchedEncounters) => {
      setEncounters(fetchedEncounters);
    });

    // Nettoyer l'abonnement lors du démontage du composant
    return () => unsubscribe();
  }, [isAuthenticated]);

  // Rechercher des monstres
  const searchMonsters = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Filtrage simple côté client sur la liste complète chargée par le hook
    const results = allMonsters.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 20); // Limiter à 20 résultats pour la perf

    setSearchResults(results);
    setIsSearching(false);
  };

  // Ajouter un monstre à la rencontre
  const addMonster = (monster: Monster) => {
    setMonsterList([...monsterList, { ...monster, id: uuidv4() }]);
    setSelectedMonster(null);
  };

  // Supprimer un monstre de la rencontre
  const removeMonster = (monsterId: string) => {
    setMonsterList(monsterList.filter(m => m.id !== monsterId));
  };

  // Sauvegarder la rencontre
  const handleSaveEncounter = async () => {
    if (!selectedPartyId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un groupe d'aventuriers",
        variant: "destructive"
      });
      return;
    }

    if (!encounterName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez donner un nom à votre rencontre",
        variant: "destructive"
      });
      return;
    }

    if (monsterList.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un monstre à la rencontre",
        variant: "destructive"
      });
      return;
    }

    try {
      // Vérifier si l'utilisateur peut créer une nouvelle rencontre
      if (!(await canCreateEncounter())) {
        toast({
          title: "Limite atteinte",
          description: "Vous avez atteint la limite de rencontres pour votre plan actuel",
          variant: "destructive"
        });
        return;
      }

      const selectedParty = parties.find(p => p.id === selectedPartyId);
      if (!selectedParty) return;

      // Calculer le niveau moyen du groupe
      const averageLevel = selectedParty.players.length > 0
        ? selectedParty.players.reduce((sum, p) => sum + p.level, 0) / selectedParty.players.length
        : 0;

      // Déterminer la difficulté (simplifiée pour l'exemple)
      const difficulty = monsterList.length > 3 ? 'deadly' : monsterList.length > 2 ? 'hard' : monsterList.length > 1 ? 'medium' : 'easy';

      const newEncounter: Omit<Encounter, 'id' | 'createdAt' | 'updatedAt'> = {
        name: encounterName,
        monsters: monsterList,
        difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'deadly',
        partyId: selectedPartyId,
        partyLevel: averageLevel
      };

      const savedEncounter = await saveEncounter(newEncounter);

      if (savedEncounter) {
        setEncounters([savedEncounter, ...encounters]);
        setEncounterName('');
        setMonsterList([]);

        // Mettre à jour l'état de capacité de création
        setCanCreate(await canCreateEncounter());

        toast({
          title: "Succès",
          description: "La rencontre a été sauvegardée avec succès",
          variant: "default"
        });
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la rencontre:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la rencontre",
        variant: "destructive"
      });
    }
  };

  // Supprimer une rencontre
  const handleDeleteEncounter = async (encounterId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette rencontre?')) {
      return;
    }

    try {
      const success = await deleteEncounter(encounterId);

      if (success) {
        setEncounters(encounters.filter(e => e.id !== encounterId));

        // Mettre à jour l'état de capacité de création
        setCanCreate(await canCreateEncounter());

        toast({
          title: "Succès",
          description: "La rencontre a été supprimée",
          variant: "default"
        });
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la rencontre:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la rencontre",
        variant: "destructive"
      });
    }
  };

  // Formater le facteur de défi (CR)
  const formatCR = (cr: number): string => {
    if (cr < 1) {
      // Pour les CR fractionnaires (1/8, 1/4, 1/2)
      if (cr === 0.125) return '1/8';
      if (cr === 0.25) return '1/4';
      if (cr === 0.5) return '1/2';
      return cr.toString();
    }
    return cr.toString();
  };

  // Si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Skull className="mr-2 h-6 w-6" />
            Générateur de rencontres
          </CardTitle>
          <CardDescription>
            Connectez-vous pour créer des rencontres personnalisées
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Skull className="h-16 w-16 text-gray-300 mb-4" />
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
    <Tabs defaultValue="generator" className="w-full">
      {/* UsageStats removed */}
      <TabsList className="w-full justify-start mb-2">
        {/* ... tabs triggers ... */}
        <TabsTrigger value="generator" className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Créer une rencontre
        </TabsTrigger>
        <TabsTrigger value="saved" className="flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          Rencontres sauvegardées
          <Badge variant="secondary" className="ml-2">{encounters.length}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="generator">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Skull className="mr-2 h-6 w-6" />
              Créer une rencontre personnalisée
            </CardTitle>
            <CardDescription>
              Créez une rencontre avec les monstres de votre choix
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
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="encounterName">Nom de la rencontre</Label>
                    <Input
                      id="encounterName"
                      placeholder="Embuscade de gobelins"
                      value={encounterName}
                      onChange={(e) => setEncounterName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="party">Groupe d'aventuriers</Label>
                    <Select
                      value={selectedPartyId}
                      onValueChange={setSelectedPartyId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un groupe" />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Aucun groupe disponible
                          </SelectItem>
                        ) : (
                          parties.map(party => (
                            <SelectItem key={party.id} value={party.id}>
                              {party.name} ({party.players.length} joueurs)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="text-base font-medium mb-3">Rechercher des monstres</h3>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Nom du monstre"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={searchMonsters}
                      disabled={isSearching || !searchQuery.trim()}
                    >
                      {isSearching ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Rechercher
                    </Button>
                  </div>

                  {searchResults.length > 0 && (
                    <ScrollArea className="h-48 border rounded-md">
                      <div className="p-2">
                        {searchResults.map(monster => (
                          <div
                            key={monster.id}
                            className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer"
                            onClick={() => setSelectedMonster(monster)}
                          >
                            <div>
                              <div className="font-medium">
                                <a
                                  href={`https://www.aidedd.org/dnd/monstres.php?vf=${getAideDDMonsterSlug(monster.name)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {monster.name}
                                </a>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                FD {formatCR(monster.challengeRating)} • {monster.size} {monster.type}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                addMonster(monster);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-medium mb-3">Monstres de la rencontre</h3>
                  {monsterList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
                      <Skull className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-gray-500 mb-2">Aucun monstre dans cette rencontre</p>
                      <p className="text-gray-400 text-sm mb-4">
                        Recherchez et ajoutez des monstres pour créer votre rencontre
                      </p>
                    </div>
                  ) : (
                    <Table className="border rounded-md">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Taille</TableHead>
                          <TableHead>FD</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monsterList.map(monster => (
                          <TableRow key={monster.id}>
                            <TableCell className="font-medium">
                              <a
                                href={`https://www.aidedd.org/dnd/monstres.php?vf=${getAideDDMonsterSlug(monster.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {monster.name}
                              </a>
                            </TableCell>
                            <TableCell>{monster.type}</TableCell>
                            <TableCell>{monster.size}</TableCell>
                            <TableCell>{formatCR(monster.challengeRating)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => removeMonster(monster.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveEncounter}
                    disabled={!canCreate || monsterList.length === 0 || !encounterName.trim() || !selectedPartyId}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder la rencontre
                  </Button>
                </div>

                {!canCreate && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      Vous avez atteint votre limite de rencontres.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="saved">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-6 w-6" />
              Rencontres sauvegardées
            </CardTitle>
            <CardDescription>
              Gérez vos rencontres personnalisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : encounters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">
                  Vous n'avez pas encore de rencontres sauvegardées
                </p>
                <Button
                  variant="default"
                  onClick={() => {
                    const generatorTab = document.querySelector('[data-value="generator"]') as HTMLElement;
                    if (generatorTab) generatorTab.click();
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer votre première rencontre
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {encounters.map(encounter => (
                  <Card key={encounter.id} className="overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${encounter.difficulty === 'deadly' ? 'bg-red-500' :
                      encounter.difficulty === 'hard' ? 'bg-orange-500' :
                        encounter.difficulty === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                      }`} />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-base">{encounter.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant={
                              encounter.difficulty === 'deadly' ? 'destructive' :
                                encounter.difficulty === 'hard' ? 'default' :
                                  encounter.difficulty === 'medium' ? 'secondary' :
                                    'outline'
                            }>
                              {encounter.difficulty === 'deadly' ? 'Mortelle' :
                                encounter.difficulty === 'hard' ? 'Difficile' :
                                  encounter.difficulty === 'medium' ? 'Moyenne' :
                                    'Facile'}
                            </Badge>
                            <span>{encounter.monsters.length} monstre(s)</span>
                            <span>•</span>
                            <span>
                              {parties.find(p => p.id === encounter.partyId)?.name || 'Groupe inconnu'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteEncounter(encounter.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {encounter.monsters.map(monster => (
                          <Badge key={monster.id} variant="outline" className="text-xs">
                            <a
                              href={`https://www.aidedd.org/dnd/monstres.php?vf=${getAideDDMonsterSlug(monster.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {monster.name}
                            </a> (FD {formatCR(monster.challengeRating)})
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

  );
};

export default CustomEncounterGenerator; 