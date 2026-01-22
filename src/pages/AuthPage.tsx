import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/auth/AuthContext';
import { PenTool } from 'lucide-react';

const AuthPage: React.FC = () => {
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
          Connectez-vous pour accéder à toutes les fonctionnalités de gestion de vos aventures.
        </p>
      </div>

      <div className="w-full max-w-md">
        <LoginForm />
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2023 Trame. Tous droits réservés.</p>
        <p className="mt-1">Donjons & Dragons est une marque déposée de Wizards of the Coast LLC.</p>
      </div>
    </div>
  );
};

export default AuthPage; 