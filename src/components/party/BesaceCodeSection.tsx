import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface BesaceCodeSectionProps {
  besaceShareCode: string;
  onBesaceShareCodeChange: (code: string) => void;
  onCodeValid: (data: any, code: string) => void;
}

const BesaceCodeSection: React.FC<BesaceCodeSectionProps> = ({
  besaceShareCode,
  onBesaceShareCodeChange,
  onCodeValid,
}) => {
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
        onCodeValid(data, code);

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

  return (
    <div className="space-y-2 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
      <Label htmlFor="besaceShareCode" className="text-indigo-800 dark:text-indigo-300 font-semibold">
        Code de partage Besace
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="besaceShareCode"
            placeholder="Entrez le code à 6 caractères"
            value={besaceShareCode}
            onChange={(e) => {
              onBesaceShareCodeChange(e.target.value.toUpperCase());
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
          onClick={() => checkBesaceCode(besaceShareCode)}
          disabled={!besaceShareCode || besaceShareCode.length < 5 || besaceCheckStatus === 'checking'}
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
  );
};

export default BesaceCodeSection;
