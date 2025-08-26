// Système de tracking des erreurs simplifié
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
}

export interface ErrorContext {
  component?: string;
  action?: string;
  props?: Record<string, any>;
  state?: Record<string, any>;
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private maxErrors = 100;
  private context: ErrorContext = {};
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeGlobalHandlers();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private initializeGlobalHandlers() {
    // Global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.reportJSError(event.error || new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      // Unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        this.reportJSError(new Error('Unhandled Promise Rejection'), {
          reason: String(event.reason)
        });
      });
    }
  }

  setContext(context: Partial<ErrorContext>) {
    this.context = { ...this.context, ...context };
  }

  clearContext() {
    this.context = {};
  }

  private createErrorReport(error: Error, additionalContext: Record<string, any> = {}): ErrorReport {
    const report: ErrorReport = {
      id: 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      sessionId: this.sessionId,
      context: {
        ...this.context,
        ...additionalContext
      }
    };

    return report;
  }

  private storeError(report: ErrorReport) {
    this.errors.unshift(report);
    
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    console.error('Error tracked:', report);
  }

  reportJSError(error: Error, context: Record<string, any> = {}): ErrorReport {
    const report = this.createErrorReport(error, context);
    this.storeError(report);
    return report;
  }

  reportReactError(error: Error, errorInfo: { componentStack?: string }): ErrorReport {
    const report = this.createErrorReport(error, {
      componentStack: errorInfo.componentStack || ''
    });
    this.storeError(report);
    return report;
  }

  reportApiError(error: Error, url: string, method: string = 'GET', status?: number): ErrorReport {
    const report = this.createErrorReport(error, {
      url,
      method,
      status
    });
    this.storeError(report);
    return report;
  }

  reportUserActionError(error: Error, action: string, element?: HTMLElement): ErrorReport {
    const report = this.createErrorReport(error, {
      action,
      element: element ? element.tagName : undefined
    });
    this.storeError(report);
    return report;
  }

  getErrorSummary() {
    const now = Date.now();
    const last24h = this.errors.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000);
    const lastHour = this.errors.filter(e => now - e.timestamp < 60 * 60 * 1000);
    
    return {
      total: this.errors.length,
      last24h: last24h.length,
      lastHour: lastHour.length,
      recentErrors: this.errors.slice(0, 10)
    };
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();

// Hook pour React
export const useErrorTracker = () => {
  const reportError = (error: Error, context?: ErrorContext) => {
    return errorTracker.reportJSError(error, context);
  };

  const reportApiError = (error: Error, url: string, method?: string, status?: number) => {
    return errorTracker.reportApiError(error, url, method, status);
  };

  const reportUserActionError = (error: Error, action: string, element?: HTMLElement) => {
    return errorTracker.reportUserActionError(error, action, element);
  };

  return {
    reportError,
    reportApiError,
    reportUserActionError,
    setContext: errorTracker.setContext.bind(errorTracker),
    getSummary: () => errorTracker.getErrorSummary()
  };
};

// Simple error boundary replacement (fonction utilitaire)
export const createSimpleErrorBoundary = () => {
  return class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'SimpleErrorBoundary';
    }
  };
};

// Fonction pour remplacer TrackedErrorBoundary temporairement
export const TrackedErrorBoundary = ({ children }: any) => {
  return children;
}; 