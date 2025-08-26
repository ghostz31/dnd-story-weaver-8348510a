// Système de monitoring des performances
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'navigation' | 'render' | 'api' | 'user-interaction' | 'memory';
  tags?: Record<string, string>;
}

export interface PerformanceBudget {
  metric: string;
  budget: number;
  warning: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private budgets: PerformanceBudget[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
    this.setupDefaultBudgets();
  }

  // ====== Configuration des Budgets ======
  private setupDefaultBudgets() {
    this.budgets = [
      { metric: 'FCP', budget: 1800, warning: 1500 }, // First Contentful Paint
      { metric: 'LCP', budget: 2500, warning: 2000 }, // Largest Contentful Paint
      { metric: 'FID', budget: 100, warning: 50 },    // First Input Delay
      { metric: 'CLS', budget: 0.1, warning: 0.05 },  // Cumulative Layout Shift
      { metric: 'TTFB', budget: 800, warning: 600 },  // Time to First Byte
      { metric: 'bundle-size', budget: 500, warning: 400 }, // KB
      { metric: 'memory-usage', budget: 50, warning: 30 }   // MB
    ];
  }

  // ====== Observers des Métriques ======
  private initializeObservers() {
    if (typeof window === 'undefined') return;

    try {
      // Observer pour les Core Web Vitals
      const vitalsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const value = (entry as any).value || entry.duration || 0;
          this.recordMetric({
            name: entry.name,
            value,
            timestamp: Date.now(),
            category: 'navigation',
            tags: { 
              entryType: entry.entryType,
              source: 'web-vitals'
            }
          });
        }
      });

      vitalsObserver.observe({ entryTypes: ['navigation', 'paint', 'layout-shift'] });
      this.observers.push(vitalsObserver);

      // Observer pour les ressources
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming;
          this.recordMetric({
            name: `resource-${this.getResourceType(resourceEntry.name)}`,
            value: resourceEntry.duration,
            timestamp: Date.now(),
            category: 'navigation',
            tags: {
              url: resourceEntry.name,
              type: this.getResourceType(resourceEntry.name)
            }
          });
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  // ====== Enregistrement des Métriques ======
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    this.checkBudget(metric);
    
    // Limiter le nombre de métriques en mémoire
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metric:', metric);
    }
  }

  // ====== Métriques Personnalisées ======
  startTimer(name: string, category: PerformanceMetric['category'] = 'user-interaction') {
    const startTime = performance.now();
    
    return {
      end: (tags?: Record<string, string>) => {
        const duration = performance.now() - startTime;
        this.recordMetric({
          name,
          value: duration,
          timestamp: Date.now(),
          category,
          tags
        });
        return duration;
      }
    };
  }

  // Mesurer une fonction
  measureFunction<T>(
    name: string, 
    fn: () => T, 
    category: PerformanceMetric['category'] = 'render'
  ): T {
    const timer = this.startTimer(name, category);
    try {
      const result = fn();
      timer.end({ status: 'success' });
      return result;
    } catch (error) {
      timer.end({ status: 'error', error: String(error) });
      throw error;
    }
  }

  // Mesurer une fonction async
  async measureAsync<T>(
    name: string, 
    fn: () => Promise<T>, 
    category: PerformanceMetric['category'] = 'api'
  ): Promise<T> {
    const timer = this.startTimer(name, category);
    try {
      const result = await fn();
      timer.end({ status: 'success' });
      return result;
    } catch (error) {
      timer.end({ status: 'error', error: String(error) });
      throw error;
    }
  }

  // ====== Métriques Système ======
  recordMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric({
        name: 'memory-usage',
        value: memory.usedJSHeapSize / (1024 * 1024), // MB
        timestamp: Date.now(),
        category: 'memory',
        tags: {
          total: String(memory.totalJSHeapSize / (1024 * 1024)),
          limit: String(memory.jsHeapSizeLimit / (1024 * 1024))
        }
      });
    }
  }

  recordBundleSize() {
    // Estimation basée sur les ressources chargées
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsSize = resources
      .filter(r => r.name.includes('.js'))
      .reduce((total, r) => total + (r.transferSize || 0), 0);

    this.recordMetric({
      name: 'bundle-size',
      value: jsSize / 1024, // KB
      timestamp: Date.now(),
      category: 'navigation',
      tags: { type: 'javascript' }
    });
  }

  // ====== Vérification des Budgets ======
  private checkBudget(metric: PerformanceMetric) {
    const budget = this.budgets.find(b => b.metric === metric.name);
    if (!budget) return;

    if (metric.value > budget.budget) {
      console.warn(`⚠️ Performance budget exceeded for ${metric.name}:`, {
        value: metric.value,
        budget: budget.budget,
        overage: metric.value - budget.budget
      });
      
      // Envoyer une alerte (en production, cela pourrait être envoyé à un service externe)
      this.sendAlert('budget-exceeded', metric, budget);
      
    } else if (metric.value > budget.warning) {
      console.warn(`⚡ Performance warning for ${metric.name}:`, {
        value: metric.value,
        warning: budget.warning
      });
    }
  }

  private sendAlert(type: string, metric: PerformanceMetric, budget?: PerformanceBudget) {
    // En production, cela pourrait envoyer à Sentry, DataDog, etc.
    if (process.env.NODE_ENV === 'production') {
      // Exemple d'intégration avec un service externe
      // analytics.track('performance-alert', { type, metric, budget });
    }
  }

  // ====== Analyse et Rapports ======
  getMetrics(category?: PerformanceMetric['category'], timeRange?: number): PerformanceMetric[] {
    let filtered = this.metrics;

    if (category) {
      filtered = filtered.filter(m => m.category === category);
    }

    if (timeRange) {
      const cutoff = Date.now() - timeRange;
      filtered = filtered.filter(m => m.timestamp > cutoff);
    }

    return filtered;
  }

  getAverageMetric(name: string, timeRange?: number): number {
    const metrics = this.getMetrics(undefined, timeRange).filter(m => m.name === name);
    if (metrics.length === 0) return 0;
    
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  getPerformanceReport(): {
    summary: Record<string, { avg: number; count: number; budget?: PerformanceBudget }>;
    budgetStatus: Array<{ metric: string; status: 'good' | 'warning' | 'exceeded'; value: number }>;
    recommendations: string[];
  } {
    const summary: Record<string, { avg: number; count: number; budget?: PerformanceBudget }> = {};
    const recommendations: string[] = [];

    // Calculer les moyennes
    const uniqueMetrics = [...new Set(this.metrics.map(m => m.name))];
    uniqueMetrics.forEach(name => {
      const metrics = this.metrics.filter(m => m.name === name);
      const budget = this.budgets.find(b => b.metric === name);
      
      summary[name] = {
        avg: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length,
        count: metrics.length,
        budget
      };
    });

    // Vérifier les budgets
    const budgetStatus = this.budgets.map(budget => {
      const avg = summary[budget.metric]?.avg || 0;
      let status: 'good' | 'warning' | 'exceeded' = 'good';
      
      if (avg > budget.budget) {
        status = 'exceeded';
        recommendations.push(`Optimize ${budget.metric}: ${avg.toFixed(2)} > ${budget.budget}`);
      } else if (avg > budget.warning) {
        status = 'warning';
        recommendations.push(`Monitor ${budget.metric}: approaching budget limit`);
      }

      return { metric: budget.metric, status, value: avg };
    });

    return { summary, budgetStatus, recommendations };
  }

  // ====== Utilitaires ======
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image';
    if (url.includes('.json')) return 'json';
    return 'other';
  }

  // Nettoyer les observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Instance globale
export const performanceMonitor = new PerformanceMonitor();

// Hook React pour utiliser le monitoring
import { useEffect, useCallback } from 'react';

export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Enregistrer les métriques système périodiquement
    const interval = setInterval(() => {
      performanceMonitor.recordMemoryUsage();
    }, 10000); // Toutes les 10 secondes

    return () => clearInterval(interval);
  }, []);

  const measureRender = useCallback((componentName: string) => {
    return performanceMonitor.startTimer(`render-${componentName}`, 'render');
  }, []);

  const measureApi = useCallback(async <T>(name: string, apiCall: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsync(`api-${name}`, apiCall, 'api');
  }, []);

  const recordUserInteraction = useCallback((action: string, component?: string) => {
    performanceMonitor.recordMetric({
      name: `user-${action}`,
      value: performance.now(),
      timestamp: Date.now(),
      category: 'user-interaction',
      tags: { component }
    });
  }, []);

  return {
    measureRender,
    measureApi,
    recordUserInteraction,
    getReport: () => performanceMonitor.getPerformanceReport()
  };
};

// Décorateur pour mesurer les méthodes de classe
export function measurePerformance(category: PerformanceMetric['category'] = 'render') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const className = this.constructor.name;
      const methodName = `${className}.${propertyName}`;
      
      if (method.constructor.name === 'AsyncFunction') {
        return performanceMonitor.measureAsync(methodName, () => method.apply(this, args), category);
      } else {
        return performanceMonitor.measureFunction(methodName, () => method.apply(this, args), category);
      }
    };

    return descriptor;
  };
} 