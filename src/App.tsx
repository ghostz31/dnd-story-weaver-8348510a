import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { SectionLoader } from './components/ui/loading-spinner';
import Header from './components/layout/Header';
import ErrorBoundary from './components/ErrorBoundary';
import { useDnDShortcuts } from './hooks/useKeyboardShortcuts';
import { useKeyboardHelp } from './components/ui/keyboard-shortcuts-help';
import { KeyboardShortcutsHelp } from './components/ui/keyboard-shortcuts-help';

// Monitoring et Performance
import { performanceMonitor, usePerformanceMonitor } from './utils/performanceMonitor';
import { errorTracker, useErrorTracker, TrackedErrorBoundary } from './utils/errorTracker';

// Lazy loading des composants lourds
const Index = lazy(() => import('./pages/Index'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const MonsterBrowser = lazy(() => import('./components/MonsterBrowser'));
const EncounterBuilder = lazy(() => import('./components/EncounterBuilder'));
const CustomEncounterGenerator = lazy(() => import('./components/CustomEncounterGenerator'));
const EncounterTracker = lazy(() => import('./components/EncounterTracker'));
const EncounterTrackerTest = lazy(() => import('./components/EncounterTrackerTest'));

const EncounterHistory = lazy(() => import('./components/EncounterHistory'));
const PartyEditor = lazy(() => import('./components/PartyEditor'));
const UserProfile = lazy(() => import('./components/auth/UserProfile'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const MetricsDashboard = lazy(() => import('./components/admin/MetricsDashboard'));

// Composant pour les routes protégées
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <SectionLoader text="Vérification de l'authentification..." />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Composant principal avec monitoring
const AppContent: React.FC = () => {
  const { isOpen: isHelpOpen, open: openHelp, close: closeHelp } = useKeyboardHelp();
  
  // Initialiser les systèmes de monitoring
  const { measureRender, measureApi, recordUserInteraction } = usePerformanceMonitor();
  const { reportError } = useErrorTracker('App');

  // Initialiser les raccourcis clavier
  useDnDShortcuts({
    openMonsterBrowser: () => window.location.href = '/monsters',
    openEncounterBuilder: () => window.location.href = '/encounters',
    openPartyEditor: () => window.location.href = '/parties',
    showHelp: openHelp
  });

  // Initialiser le monitoring au démarrage
  useEffect(() => {
    const timer = measureRender('app-initialization');
    
    try {
      // Enregistrer les métriques initiales
      performanceMonitor.recordBundleSize();
      performanceMonitor.recordMemoryUsage();
      
      // Configuration du contexte utilisateur pour les erreurs
      const { isAuthenticated } = useAuth();
      if (isAuthenticated) {
        errorTracker.setUserId('authenticated-user');
      }
      
      timer.end({ status: 'success' });
    } catch (error) {
      timer.end({ status: 'error' });
      reportError(error as Error);
    }
  }, [measureRender, reportError]);

  return (
    <TrackedErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Header />
        
        <main className="container mx-auto px-1 py-1">
          <Suspense fallback={<SectionLoader text="Chargement du composant..." />}>
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/monsters" element={<MonsterBrowser />} />
              <Route path="/encounter-tracker" element={<EncounterTrackerTest />} />
              <Route path="/encounter-tracker/:encounterId" element={<EncounterTrackerTest />} />
              <Route path="/encounter-tracker-test" element={<EncounterTrackerTest />} />
  
              <Route path="/encounter-tracker-original" element={<EncounterTracker />} />
              
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
              
              <Route path="/encounters" element={
                <ProtectedRoute>
                  <EncounterBuilder />
                </ProtectedRoute>
              } />
              
              <Route path="/custom-encounter" element={
                <ProtectedRoute>
                  <CustomEncounterGenerator />
                </ProtectedRoute>
              } />
              
              <Route path="/history" element={
                <ProtectedRoute>
                  <EncounterHistory />
                </ProtectedRoute>
              } />
              
              <Route path="/parties" element={
                <ProtectedRoute>
                  <PartyEditor />
                </ProtectedRoute>
              } />

              {/* Dashboard admin (pour le monitoring) */}
              <Route path="/admin/metrics" element={
                <ProtectedRoute>
                  <MetricsDashboard />
                </ProtectedRoute>
              } />
              
              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        
        {/* Modal d'aide aux raccourcis clavier */}
        <KeyboardShortcutsHelp isOpen={isHelpOpen} onClose={closeHelp} />
      </div>
    </TrackedErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
