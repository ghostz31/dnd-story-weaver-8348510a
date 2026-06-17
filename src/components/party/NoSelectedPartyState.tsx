import React from 'react';
import { Users } from 'lucide-react';

const NoSelectedPartyState: React.FC = () => {
  return (
    <div className="flex justify-center py-8 text-center">
      <div className="max-w-md">
        <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">Sélectionnez un groupe pour le modifier</p>
      </div>
    </div>
  );
};

export default NoSelectedPartyState;
