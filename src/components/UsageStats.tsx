import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { AlertCircle, BarChart, Info } from 'lucide-react';
import { getUserStats } from '../lib/firebaseApi';
import { UserStats as UserStatsType } from '../lib/types';

const UsageStats: React.FC = () => {
  const [stats, setStats] = useState<UserStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const userStats = await getUserStats();
        setStats(userStats);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Impossible de charger vos statistiques d\'utilisation');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, []);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Chargement des statistiques...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!stats) {
    return null;
  }
  
  const isNearPartyLimit = stats.parties >= stats.maxParties * 0.7;
  const isNearEncounterLimit = stats.encounters >= stats.maxEncounters * 0.7;
  const isPremium = stats.maxParties === Number.POSITIVE_INFINITY;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <BarChart className="h-4 w-4 mr-2" />
          Utilisation de votre compte
        </CardTitle>
        <CardDescription>
          {isPremium 
            ? 'Vous bénéficiez d\'un abonnement Premium sans limites'
            : 'Plan Gratuit - Passez au plan Premium pour des fonctionnalités illimitées'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Groupes d'aventuriers</span>
              <span className="text-sm font-medium">
                {isPremium 
                  ? `${stats.parties} créés`
                  : `${stats.parties} / ${stats.maxParties}`}
              </span>
            </div>
            {!isPremium && (
              <Progress 
                value={(stats.parties / stats.maxParties) * 100} 
                className={isNearPartyLimit ? "bg-orange-100" : ""}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Rencontres</span>
              <span className="text-sm font-medium">
                {isPremium 
                  ? `${stats.encounters} créées`
                  : `${stats.encounters} / ${stats.maxEncounters}`}
              </span>
            </div>
            {!isPremium && (
              <Progress 
                value={(stats.encounters / stats.maxEncounters) * 100}
                className={isNearEncounterLimit ? "bg-orange-100" : ""}
              />
            )}
          </div>
          
          {!isPremium && (isNearPartyLimit || isNearEncounterLimit) && (
            <Alert>
              <Info className="h-4 w-4 mr-2" />
              <AlertDescription>
                Vous approchez de votre limite d'utilisation. Passez au plan Premium pour un accès illimité.
              </AlertDescription>
            </Alert>
          )}
          
          {!isPremium && (
            <Button variant="outline" className="w-full" asChild>
              <a href="/subscription">Passer au plan Premium</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageStats; 