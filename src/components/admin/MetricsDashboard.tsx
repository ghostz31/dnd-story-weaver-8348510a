import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';

import { performanceMonitor } from '@/utils/performanceMonitor';
import { errorTracker } from '@/utils/errorTracker';

interface MetricsDashboardProps {
  className?: string;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ className }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('1h');

  // Données de performance
  const performanceReport = useMemo(() => {
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }[timeRange];

    return performanceMonitor.getPerformanceReport();
  }, [timeRange, refreshKey]);

  // Données d'erreur
  const errorSummary = useMemo(() => {
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }[timeRange];

    return errorTracker.getErrorSummary(timeRangeMs);
  }, [timeRange, refreshKey]);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Couleurs pour les graphiques
  const colors = {
    good: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  };

  // Données pour les graphiques
  const budgetData = performanceReport.budgetStatus.map(item => ({
    metric: item.metric,
    value: item.value,
    status: item.status,
    color: colors[item.status === 'good' ? 'good' : item.status === 'warning' ? 'warning' : 'error']
  }));

  const errorCategoryData = Object.entries(errorSummary.byCategory).map(([category, count]) => ({
    name: category,
    value: count,
    color: colors.error
  }));

  const errorSeverityData = Object.entries(errorSummary.bySeverity).map(([severity, count]) => ({
    name: severity,
    value: count,
    color: severity === 'critical' ? colors.error : 
           severity === 'high' ? '#fb923c' :
           severity === 'medium' ? colors.warning : colors.info
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
          <p className="text-muted-foreground">
            Monitoring des performances et erreurs en temps réel
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sélecteur de période */}
          <div className="flex border rounded-md">
            {(['1h', '24h', '7d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none first:rounded-l-md last:rounded-r-md"
              >
                {range}
              </Button>
            ))}
          </div>
          
          {/* Bouton de rafraîchissement */}
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs Totales</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorSummary.total}</div>
            <p className="text-xs text-muted-foreground">
              {errorSummary.errorRate.toFixed(1)} erreurs/min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budgets Dépassés</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {performanceReport.budgetStatus.filter(b => b.status === 'exceeded').length}
            </div>
            <p className="text-xs text-muted-foreground">
              sur {performanceReport.budgetStatus.length} métriques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performances</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {performanceReport.budgetStatus.filter(b => b.status === 'good').length}
            </div>
            <p className="text-xs text-muted-foreground">
              métriques dans les budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut Global</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {errorSummary.total === 0 && performanceReport.budgetStatus.every(b => b.status === 'good') ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Excellent</span>
                </>
              ) : errorSummary.total > 10 || performanceReport.budgetStatus.some(b => b.status === 'exceeded') ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Critique</span>
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-600">Attention</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes de recommandations */}
      {performanceReport.recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Recommandations :</strong>
            <ul className="mt-2 list-disc list-inside">
              {performanceReport.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-sm">{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Onglets des détails */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Erreurs</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>

        {/* Onglet Performance */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Graphique des budgets de performance */}
            <Card>
              <CardHeader>
                <CardTitle>Budgets de Performance</CardTitle>
                <CardDescription>
                  Métriques par rapport aux budgets définis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Liste des métriques */}
            <Card>
              <CardHeader>
                <CardTitle>État des Métriques</CardTitle>
                <CardDescription>
                  Détail par métrique de performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {performanceReport.budgetStatus.map((metric) => (
                  <div key={metric.metric} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          metric.status === 'good' ? 'default' :
                          metric.status === 'warning' ? 'secondary' : 'destructive'
                        }
                      >
                        {metric.metric}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {metric.value.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {metric.status === 'good' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {metric.status === 'warning' && <Clock className="h-4 w-4 text-yellow-600" />}
                      {metric.status === 'exceeded' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Erreurs */}
        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Répartition par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle>Erreurs par Catégorie</CardTitle>
                <CardDescription>
                  Répartition des erreurs par type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={errorCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {errorCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition par sévérité */}
            <Card>
              <CardHeader>
                <CardTitle>Erreurs par Sévérité</CardTitle>
                <CardDescription>
                  Gravité des erreurs rencontrées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={errorSeverityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top des erreurs */}
          {errorSummary.topErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Erreurs les Plus Fréquentes</CardTitle>
                <CardDescription>
                  Top 5 des erreurs les plus rencontrées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errorSummary.topErrors.slice(0, 5).map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{error.message}</p>
                      </div>
                      <Badge variant="outline">{error.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Détails */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Métriques système */}
            <Card>
              <CardHeader>
                <CardTitle>Métriques Système</CardTitle>
                <CardDescription>
                  Informations détaillées sur les performances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(performanceReport.summary).map(([name, data]) => (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{name}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.avg.toFixed(2)}ms (×{data.count})
                      </span>
                    </div>
                    {data.budget && (
                      <div className="space-y-1">
                        <Progress 
                          value={(data.avg / data.budget.budget) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0</span>
                          <span>{data.budget.budget}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
                <CardDescription>
                  Outils de diagnostic et maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    performanceMonitor.recordMemoryUsage();
                    performanceMonitor.recordBundleSize();
                    handleRefresh();
                  }}
                >
                  <Cpu className="h-4 w-4 mr-2" />
                  Capturer Métriques Système
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    // Déclencher un garbage collection si disponible
                    if ('gc' in window) {
                      (window as any).gc();
                    }
                    handleRefresh();
                  }}
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  Nettoyer Mémoire
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    // Exporter les données de monitoring
                    const data = {
                      performance: performanceReport,
                      errors: errorSummary,
                      timestamp: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: 'application/json'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `metrics-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Exporter Données
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsDashboard; 