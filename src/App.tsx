import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import SharedEncounterPage from './pages/SharedEncounterPage';
import SharedMonsterPage from './pages/SharedMonsterPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { PrivacyPage, TermsPage, CookiesPage, NewsPage } from './pages/LegalPages';
import { useAuth } from './auth/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { GlobalCommandPalette } from './components/GlobalCommandPalette';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/theme-provider';
import './App.css';

const MonsterBrowser = lazy(() => import('./components/MonsterBrowser'));
const SpellBrowser = lazy(() => import('./components/SpellBrowser'));
const MagicItemBrowser = lazy(() => import('./components/MagicItemBrowser'));
const EncounterBuilder = lazy(() => import('./components/EncounterBuilder'));
const CustomEncounterGenerator = lazy(() => import('./components/CustomEncounterGenerator'));
const EncounterTracker = lazy(() => import('./components/EncounterTracker'));
const EncounterHistory = lazy(() => import('./components/EncounterHistory'));
const PartyEditor = lazy(() => import('./components/PartyEditor'));
const UserProfile = lazy(() => import('./components/auth/UserProfile'));

const PageLoader = () => (
  <div className="container mx-auto px-4 py-8 space-y-4">
    <div className="h-8 w-64 bg-muted/40 rounded animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-48 w-full bg-muted/30 rounded-xl animate-pulse" />
      ))}
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
        <Header />
        <GlobalCommandPalette />

        <main className="flex-grow w-full mx-auto py-4 px-2 md:py-6 md:px-4">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
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

                {/* Routes protégées */}
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

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>

        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
