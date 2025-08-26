// Système de tracking des erreurs
export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  context: {
    component?: string;
    action?: string;
    props?: Record<string, any>;
    state?: Record<string, any>;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'network' | 'render' | 'user-action' | 'api';
  tags?: Record<string, string>;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  props?: Record<string, any>;
  state?: Record<string, any>;
  userId?: string;
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private sessionId: string;
  private context: ErrorContext = {};
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  // ====== Initialisation ======
  private initialize() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Capturer les erreurs JavaScript globales
    window.addEventListener('error', this.handleGlobalError.bind(this));
    
    // Capturer les promesses rejetées
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

    // Capturer les erreurs de ressources
    window.addEventListener('error', this.handleResourceError.bind(this), true);

    this.isInitialized = true;
  }

  // ====== Handlers d'Erreurs ======
  private handleGlobalError(event: ErrorEvent) {
    this.reportError({
      message: event.message,
      stack: event.error?.stack,
      severity: 'high',
      category: 'javascript',
      context: {
        ...this.context,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const error = event.reason;
    this.reportError({
      message: error?.message || 'Unhandled Promise Rejection',
      stack: error?.stack,
      severity: 'high',
      category: 'javascript',
      context: {
        ...this.context,
        reason: String(event.reason)
      }
    });
  }

  private handleResourceError(event: Event) {
    const target = event.target as HTMLElement;
    if (target && target !== window) {
      this.reportError({
        message: `Failed to load resource: ${(target as any).src || (target as any).href}`,
        severity: 'medium',
        category: 'network',
        context: {
          ...this.context,
          resourceType: target.tagName,
          resourceUrl: (target as any).src || (target as any).href
        }
      });
    }
  }

  // ====== Reporting des Erreurs ======
  reportError(error: Partial<ErrorReport>) {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      severity: error.severity || 'medium',
      category: error.category || 'javascript',
      context: { ...this.context, ...error.context },
      tags: error.tags
    };

    this.errors.push(errorReport);

    // Limiter le nombre d'erreurs en mémoire
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-50);
    }

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('🐛 Error Report:', errorReport);
    }

    // Envoyer à un service externe en production
    this.sendToExternalService(errorReport);

    return errorReport;
  }

  // Erreurs React avec Error Boundary
  reportReactError(error: Error, errorInfo: { componentStack: string }, context?: ErrorContext) {
    return this.reportError({
      message: error.message,
      stack: error.stack,
      severity: 'high',
      category: 'render',
      context: {
        ...this.context,
        ...context,
        componentStack: errorInfo.componentStack
      },
      tags: { source: 'react-error-boundary' }
    });
  }

  // Erreurs d'API
  reportApiError(
    url: string, 
    method: string, 
    status: number, 
    response?: any, 
    context?: ErrorContext
  ) {
    return this.reportError({
      message: `API Error: ${method} ${url} returned ${status}`,
      severity: status >= 500 ? 'high' : 'medium',
      category: 'api',
      context: {
        ...this.context,
        ...context,
        url,
        method,
        status,
        response: typeof response === 'object' ? JSON.stringify(response) : response
      },
      tags: { 
        source: 'api',
        status: String(status),
        method
      }
    });
  }

  // Erreurs d'action utilisateur
  reportUserActionError(action: string, component: string, error: Error, context?: ErrorContext) {
    return this.reportError({
      message: `User action error: ${action} in ${component}`,
      stack: error.stack,
      severity: 'medium',
      category: 'user-action',
      context: {
        ...this.context,
        ...context,
        action,
        component
      },
      tags: {
        source: 'user-action',
        action,
        component
      }
    });
  }

  // ====== Gestion du Contexte ======
  setContext(context: Partial<ErrorContext>) {
    this.context = { ...this.context, ...context };
  }

  clearContext() {
    this.context = {};
  }

  setUserId(userId: string) {
    this.context.userId = userId;
  }

  // ====== Analyse et Rapports ======
  getErrors(category?: ErrorReport['category'], timeRange?: number): ErrorReport[] {
    let filtered = this.errors;

    if (category) {
      filtered = filtered.filter(e => e.category === category);
    }

    if (timeRange) {
      const cutoff = Date.now() - timeRange;
      filtered = filtered.filter(e => e.timestamp > cutoff);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  getErrorSummary(timeRange?: number): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    topErrors: Array<{ message: string; count: number }>;
    errorRate: number;
  } {
    const errors = this.getErrors(undefined, timeRange);
    const total = errors.length;

    // Grouper par catégorie
    const byCategory = errors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Grouper par sévérité
    const bySeverity = errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top des erreurs
    const errorCounts = errors.reduce((acc, error) => {
      acc[error.message] = (acc[error.message] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    // Taux d'erreur (erreurs par minute)
    const timeRangeMinutes = (timeRange || 60000) / 60000;
    const errorRate = total / timeRangeMinutes;

    return {
      total,
      byCategory,
      bySeverity,
      topErrors,
      errorRate
    };
  }

  // ====== Intégration Externe ======
  private sendToExternalService(error: ErrorReport) {
    if (process.env.NODE_ENV === 'production') {
      // Exemple d'intégration avec Sentry
      // Sentry.captureException(new Error(error.message), {
      //   tags: error.tags,
      //   contexts: { error: error.context },
      //   level: this.mapSeverityToSentryLevel(error.severity)
      // });

      // Exemple d'intégration avec un service personnalisé
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // }).catch(() => {
      //   // Fallback si l'envoi échoue
      //   console.error('Failed to send error report');
      // });
    }
  }

  private mapSeverityToSentryLevel(severity: ErrorReport['severity']): string {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'fatal';
      default: return 'error';
    }
  }

  // ====== Utilitaires ======
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Nettoyer les listeners
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleGlobalError);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
      window.removeEventListener('error', this.handleResourceError, true);
    }
    this.errors = [];
    this.isInitialized = false;
  }
}

// Instance globale
export const errorTracker = new ErrorTracker();

// Hook React pour le tracking d'erreurs
import { useEffect, useCallback } from 'react';

export const useErrorTracker = (componentName?: string) => {
  useEffect(() => {
    if (componentName) {
      errorTracker.setContext({ component: componentName });
    }

    return () => {
      if (componentName) {
        errorTracker.clearContext();
      }
    };
  }, [componentName]);

  const reportError = useCallback((error: Error, context?: ErrorContext) => {
    return errorTracker.reportError({
      message: error.message,
      stack: error.stack,
      severity: 'medium',
      category: 'javascript',
      context: { ...context, component: componentName }
    });
  }, [componentName]);

  const reportApiError = useCallback((
    url: string, 
    method: string, 
    status: number, 
    response?: any
  ) => {
    return errorTracker.reportApiError(url, method, status, response, {
      component: componentName
    });
  }, [componentName]);

  const reportUserActionError = useCallback((action: string, error: Error) => {
    return errorTracker.reportUserActionError(
      action, 
      componentName || 'unknown', 
      error
    );
  }, [componentName]);

  return {
    reportError,
    reportApiError,
    reportUserActionError,
    setContext: errorTracker.setContext.bind(errorTracker),
    getSummary: () => errorTracker.getErrorSummary()
  };
};

// Error Boundary amélioré avec tracking
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

interface TrackedErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: any;
}

export class TrackedErrorBoundary extends React.Component<TrackedErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorReport = errorTracker.reportReactError(error, errorInfo);
    this.setState({ errorId: errorReport.id });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} errorId={this.state.errorId} />;
      }

      return (
        <div className="error-boundary p-4 border border-red-300 bg-red-50 rounded">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600 mt-2">
            An error occurred in this component. Error ID: {this.state.errorId}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined, errorId: undefined })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 