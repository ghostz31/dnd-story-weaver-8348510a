import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

const UnauthenticatedCard: React.FC = () => {
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
};

export default UnauthenticatedCard;
