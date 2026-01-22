import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import SubscriptionPage from './pages/SubscriptionPage';
import MonsterBrowser from './components/MonsterBrowser';
import EncounterBuilder from './components/EncounterBuilder';
import CustomEncounterGenerator from './components/CustomEncounterGenerator';
import EncounterTracker from './components/EncounterTracker';
import EncounterHistory from './components/EncounterHistory';
import PartyEditor from './components/PartyEditor';
import SpellBrowser from './components/SpellBrowser';
import MagicItemBrowser from './components/MagicItemBrowser';
import UserProfile from './components/auth/UserProfile';
import Header from './components/layout/Header';
import { useAuth } from './auth/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { GlobalCommandPalette } from './components/GlobalCommandPalette';
import { Toaster } from './components/ui/toaster';
import './App.css';

// Composant de protection des routes authentifiées
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log(`[ProtectedRoute] Path: ${location.pathname}, Auth: ${isAuthenticated}, Loading: ${isLoading}`);

  if (isLoading) {
    // Affichage d'un chargement pendant la vérification de l'authentification
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirection vers la page de connexion avec l'URL actuelle en "from"
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      <Header />
      <GlobalCommandPalette />

      <main className="w-full mx-auto py-6">
        <ErrorBoundary>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/monsters" element={<MonsterBrowser />} />
            <Route path="/grimoire" element={<SpellBrowser />} />
            <Route path="/items" element={<MagicItemBrowser />} />
            <Route path="/encounter-tracker" element={<EncounterTracker />} />
            <Route path="/encounter-tracker/:encounterId" element={<EncounterTracker />} />

            {/* Routes protégées (utilisateur connecté) */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />

            <Route path="/subscription" element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            } />

            <Route path="/parties" element={
              <ProtectedRoute>
                <PartyEditor />
              </ProtectedRoute>
            } />

            <Route path="/encounters" element={
              <ProtectedRoute>
                <EncounterBuilder />
              </ProtectedRoute>
            } />

            <Route path="/custom" element={
              <ProtectedRoute>
                <CustomEncounterGenerator />
              </ProtectedRoute>
            } />

            <Route path="/history" element={
              <ProtectedRoute>
                <EncounterHistory />
              </ProtectedRoute>
            } />

            {/* Redirection vers la page d'accueil si la route n'existe pas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <footer className="border-t border-border bg-card/50 text-muted-foreground p-6 mt-12">
        <div className="container mx-auto text-center">
          <p>Outil pour maîtres de jeu</p>
          {!isAuthenticated && (
            <p className="text-sm mt-2">
              <a href="/auth" className="text-blue-300 hover:underline">Connectez-vous</a> pour sauvegarder vos rencontres et groupes
            </p>
          )}
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

export default App;
