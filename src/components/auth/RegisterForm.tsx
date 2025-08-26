import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { validateRegister } from '../../lib/schemas';

interface RegisterFormProps {
  onLoginClick?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onLoginClick }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Validation avec Zod
    const validationResult = validateRegister({ 
      email, 
      password, 
      confirmPassword, 
      displayName 
    });
    
    if (!validationResult.success) {
      const errors: { [key: string]: string } = {};
      validationResult.errors?.forEach((error) => {
        if (error.path && error.path.length > 0) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      await signup(email, password, displayName);
    } catch (err: any) {
      setError(getErrorMessage(err.code) || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour traduire les codes d'erreur Firebase
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/weak-password':
        return 'Le mot de passe est trop faible';
      case 'auth/network-request-failed':
        return 'Erreur de connexion réseau';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard';
      default:
        return 'Une erreur est survenue lors de l\'inscription';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Inscription</CardTitle>
        <CardDescription className="text-center">
          Créez votre compte pour commencer à utiliser l'application
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Nom d'affichage</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Votre nom"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
              className={fieldErrors.displayName ? "border-red-500 focus:border-red-500" : ""}
            />
            {fieldErrors.displayName && (
              <p className="text-sm text-red-600">{fieldErrors.displayName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={fieldErrors.email ? "border-red-500 focus:border-red-500" : ""}
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={fieldErrors.password ? "border-red-500 focus:border-red-500" : ""}
            />
            {fieldErrors.password && (
              <p className="text-sm text-red-600">{fieldErrors.password}</p>
            )}
            <p className="text-xs text-gray-600">
              Au moins 8 caractères avec une minuscule, une majuscule et un chiffre
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className={fieldErrors.confirmPassword ? "border-red-500 focus:border-red-500" : ""}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscription...
              </>
            ) : (
              'Créer mon compte'
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Déjà un compte ? </span>
            <button
              type="button"
              onClick={onLoginClick}
              className="text-blue-600 hover:text-blue-500 hover:underline font-medium"
              disabled={isLoading}
            >
              Se connecter
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm; 