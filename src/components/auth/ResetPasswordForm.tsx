import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../auth/AuthContext';
import { Loader2, CheckCircle } from 'lucide-react';

interface ResetPasswordFormProps {
  onBackToLoginClick?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToLoginClick }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(getErrorMessage(err.code) || 'Une erreur est survenue lors de la réinitialisation du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour traduire les codes d'erreur Firebase
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cette adresse email';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Réinitialisation du mot de passe</CardTitle>
        <CardDescription>
          Entrez votre email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <Alert>
            <AlertDescription className="text-center">
              Un email de réinitialisation a été envoyé à {email}. Veuillez vérifier votre boîte de réception.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Envoi en cours...
                </>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </Button>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        {onBackToLoginClick && (
          <Button 
            variant="link" 
            onClick={onBackToLoginClick}
            disabled={isLoading}
          >
            Retour à la connexion
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResetPasswordForm; 