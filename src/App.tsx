import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';

import MonsterBrowser from './components/MonsterBrowser';
import EncounterBuilder from './components/EncounterBuilder';
import CustomEncounterGenerator from './components/CustomEncounterGenerator';
import EncounterTracker from './components/EncounterTracker';
import EncounterHistory from './components/EncounterHistory';
import PartyEditor from './components/PartyEditor';
import SpellBrowser from './components/SpellBrowser';
import MagicItemBrowser from './components/MagicItemBrowser';
import SharedEncounterPage from './pages/SharedEncounterPage';
import SharedMonsterPage from './pages/SharedMonsterPage';
import UserProfile from './components/auth/UserProfile';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { PrivacyPage, TermsPage, CookiesPage, NewsPage } from './pages/LegalPages';
import { useAuth } from './auth/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { GlobalCommandPalette } from './components/GlobalCommandPalette';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/theme-provider';
import './App.css';

// Composant de protection des routes authentifiées
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log(`[ProtectedRoute] Path: ${location.pathname}, Auth: ${isAuthenticated}, Loading: ${isLoading}`);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex flex-col min-h-screen bg-background text-foreground font-inter">
        <Header />
        <GlobalCommandPalette />

        <main className="flex-grow w-full mx-auto py-4 px-2 md:py-6 md:px-4">
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
              <Route path="/shared/:shareCode" element={<SharedEncounterPage />} />
              <Route path="/shared/monster/:shareCode" element={<SharedMonsterPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/news" element={<NewsPage />} />

              {/* Routes protégées (utilisateur connecté) */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
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

        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
