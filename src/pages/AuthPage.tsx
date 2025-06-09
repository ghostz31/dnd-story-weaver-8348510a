import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { useAuth } from '@/auth/AuthContext';
import { PenTool } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'reset-password';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Rediriger vers la page d'accueil si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <PenTool className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2 font-cinzel">Trame</h1>
        <p className="text-gray-600 max-w-md">
          {mode === 'login' && "Connectez-vous pour accéder à toutes les fonctionnalités de gestion de vos aventures."}
          {mode === 'register' && "Créez un compte pour sauvegarder vos rencontres et groupes d'aventuriers."}
          {mode === 'reset-password' && "Récupérez l'accès à votre compte en réinitialisant votre mot de passe."}
        </p>
      </div>
      
      <div className="w-full max-w-md">
        {mode === 'login' && (
          <LoginForm 
            onRegisterClick={() => setMode('register')}
            onForgotPasswordClick={() => setMode('reset-password')}
          />
        )}
        
        {mode === 'register' && (
          <RegisterForm 
            onLoginClick={() => setMode('login')}
          />
        )}
        
        {mode === 'reset-password' && (
          <ResetPasswordForm 
            onBackToLoginClick={() => setMode('login')}
          />
        )}
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2023 Trame. Tous droits réservés.</p>
        <p className="mt-1">Donjons & Dragons est une marque déposée de Wizards of the Coast LLC.</p>
      </div>
    </div>
  );
};

export default AuthPage; 