import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sword, Clock, Save, Trash, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Monster {
  name: string;
  originalName?: string;
  cr: number;
  xp: number;
  type: string;
  subtype?: string;
  size: string;
  ac: number;
  hp: number;
  speed: string[];
  alignment: string;
  legendary: boolean;
  source: string;
  environment: string[];
}

interface EncounterMonster {
  monster: Monster;
  quantity: number;
}

interface SavedEncounter {
  id: string;
  name: string;
  date: string;
  monsters: EncounterMonster[];
  totalXP: number;
  adjustedXP: number;
  difficulty: string;
  environment?: string;
}

const EncounterHistory: React.FC = () => {
  const [savedEncounters, setSavedEncounters] = useState<SavedEncounter[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedEncounters();
  }, []);

  const loadSavedEncounters = () => {
    try {
      const savedData = localStorage.getItem('dnd_saved_encounters');
      if (savedData) {
        const encounters = JSON.parse(savedData) as SavedEncounter[];
        setSavedEncounters(encounters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rencontres sauvegardées:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des rencontres.",
        variant: "destructive"
      });
    }
  };

  const deleteEncounter = (id: string) => {
    try {
      const updatedEncounters = savedEncounters.filter(encounter => encounter.id !== id);
      localStorage.setItem('dnd_saved_encounters', JSON.stringify(updatedEncounters));
      setSavedEncounters(updatedEncounters);
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
    }
  };

  const deleteAllEncounters = () => {
    try {
      localStorage.removeItem('dnd_saved_encounters');
      setSavedEncounters([]);
      toast({
        title: "Historique effacé",
        description: "Toutes les rencontres ont été supprimées de l'historique."
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'historique:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effacer l'historique des rencontres.",
        variant: "destructive"
      });
    }
  };

  const loadEncounterToTracker = (encounter: SavedEncounter) => {
    // Encoder les données de la rencontre pour les passer au tracker
    const encodedData = encodeURIComponent(JSON.stringify(encounter));
    navigate(`/encounter-tracker?encounter=${encodedData}`);
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile':
        return <Badge className="bg-green-500">Facile</Badge>;
      case 'Moyen':
        return <Badge className="bg-yellow-500">Moyen</Badge>;
      case 'Difficile':
        return <Badge className="bg-orange-500">Difficile</Badge>;
      case 'Mortel':
        return <Badge className="bg-red-500">Mortel</Badge>;
      default:
        return <Badge>{difficulty}</Badge>;
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Historique des Rencontres
          </CardTitle>
          {savedEncounters.length > 0 && (
            <Button variant="outline" size="sm" onClick={deleteAllEncounters}>
              <Trash className="w-4 h-4 mr-1" /> Effacer tout
            </Button>
          )}
        </div>
        <CardDescription>
          {savedEncounters.length} rencontre(s) sauvegardée(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {savedEncounters.length === 0 ? (
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
                    encounter.difficulty === 'Facile' ? 'bg-green-500' : 
                    encounter.difficulty === 'Moyen' ? 'bg-yellow-500' : 
                    encounter.difficulty === 'Difficile' ? 'bg-orange-500' : 
                    'bg-red-500'
                  }`} />
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-lg">{encounter.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {formatDate(encounter.date)}
                          {getDifficultyBadge(encounter.difficulty)}
                          <span>{encounter.totalXP} XP</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => loadEncounterToTracker(encounter)}
                          className="h-8"
                        >
                          <Play className="w-4 h-4 mr-1" /> Lancer
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteEncounter(encounter.id)}
                          className="h-8 text-red-500 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm mt-3">
                      <div className="font-medium mb-1">Créatures :</div>
                      <div className="flex flex-wrap gap-1">
                        {encounter.monsters.map((monster, idx) => (
                          <Badge key={idx} variant="outline" className="flex items-center">
                            <Sword className="w-3 h-3 mr-1" /> 
                            {monster.quantity > 1 ? `${monster.quantity}× ` : ''}{monster.monster.name}
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