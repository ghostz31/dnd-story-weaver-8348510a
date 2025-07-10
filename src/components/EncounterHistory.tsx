import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sword, Clock, Trash, Play, Users, Shield, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getEncounters, subscribeToEncounters, deleteEncounter } from '../lib/firebaseApi';
import { useAuth } from '../auth/AuthContext';
import { Encounter, EncounterMonster, Party } from '../lib/types';

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
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedEncounters();
    } else {
      setLoading(false);
      setSavedEncounters([]);
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
            Historique des Rencontres
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadSavedEncounters}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          {loading ? 'Chargement...' : `${savedEncounters.length} rencontre(s) sauvegardée(s)`}
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
        ) : savedEncounters.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            <p>Aucune rencontre sauvegardée</p>
            <p className="text-sm">Les rencontres que vous sauvegardez apparaîtront ici</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {savedEncounters.map((encounter) => (
                <Card key={encounter.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    encounter.difficulty === 'easy' ? 'bg-green-500' : 
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