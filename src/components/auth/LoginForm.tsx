import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../auth/AuthContext';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onRegisterClick, 
  onForgotPasswordClick 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (err: any) {
      setError(getErrorMessage(err.code) || 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour traduire les codes d'erreur Firebase
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé';
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cette adresse email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/too-many-requests':
        return 'Trop de tentatives de connexion. Veuillez réessayer plus tard';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Connectez-vous à votre compte D&D Story Weaver
        </CardDescription>
      </CardHeader>
      
      <CardContent>
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
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Mot de passe</Label>
              {onForgotPasswordClick && (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs" 
                  onClick={onForgotPasswordClick}
                  type="button"
                  disabled={isLoading}
                >
                  Mot de passe oublié?
                </Button>
              )}
            </div>
            <Input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        {onRegisterClick && (
          <Button 
            variant="link" 
            onClick={onRegisterClick}
            disabled={isLoading}
          >
            Pas encore de compte? S'inscrire
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default LoginForm; 