# 📊 Système de Monitoring et Performance

## Vue d'ensemble

Le système de monitoring de D&D Story Weaver surveille automatiquement les performances, les erreurs et la qualité de l'expérience utilisateur en temps réel.

## 🎯 Fonctionnalités

### **1. Monitoring des Performances**
- ✅ **Core Web Vitals** : FCP, LCP, FID, CLS
- ✅ **Métriques Custom** : Temps de rendu, API calls, interactions utilisateur
- ✅ **Budgets de Performance** : Alertes automatiques si dépassement
- ✅ **Monitoring Mémoire** : Usage heap JavaScript, DOM nodes
- ✅ **Bundle Analysis** : Taille des ressources, lazy loading

### **2. Tracking des Erreurs**
- ✅ **Erreurs JavaScript** : Capture automatique avec stack trace
- ✅ **Erreurs React** : Error boundaries avec contexte
- ✅ **Erreurs API** : Codes de statut, timeouts, réponses
- ✅ **Erreurs Ressources** : Images, CSS, JS non chargés
- ✅ **Contexte Utilisateur** : Session, composant, action

### **3. Dashboard Admin**
- ✅ **Vue Temps Réel** : Métriques actualisées toutes les 30s
- ✅ **Graphiques Interactifs** : Recharts avec données historiques
- ✅ **Alertes Visuelles** : Statut global, recommandations
- ✅ **Export de Données** : JSON pour analyse externe

## 🚀 Utilisation

### **Accès au Dashboard**

```bash
# Démarrer l'application
npm run dev

# Accéder au dashboard admin
http://localhost:8080/admin/metrics
```

### **Monitoring Automatique**

Le monitoring s'active automatiquement au chargement de l'application :

```typescript
// Dans vos composants
import { usePerformanceMonitor, useErrorTracker } from '@/utils/...';

const MyComponent = () => {
  const { measureRender, recordUserInteraction } = usePerformanceMonitor();
  const { reportError } = useErrorTracker('MyComponent');
  
  useEffect(() => {
    const timer = measureRender('component-mount');
    // ... logique du composant
    timer.end();
  }, []);
};
```

### **Mesures Personnalisées**

```typescript
// Mesurer une fonction
const result = performanceMonitor.measureFunction('data-processing', () => {
  return processData(data);
});

// Mesurer une API call
const apiData = await performanceMonitor.measureAsync('fetch-monsters', async () => {
  return fetch('/api/monsters').then(r => r.json());
});

// Enregistrer une interaction utilisateur
performanceMonitor.recordMetric({
  name: 'button-click',
  value: performance.now(),
  category: 'user-interaction',
  tags: { component: 'EncounterBuilder', action: 'create' }
});
```

## 📈 Métriques Surveillées

### **Performance**

| Métrique | Budget | Warning | Description |
|----------|--------|---------|-------------|
| **FCP** | 1800ms | 1500ms | First Contentful Paint |
| **LCP** | 2500ms | 2000ms | Largest Contentful Paint |
| **FID** | 100ms | 50ms | First Input Delay |
| **CLS** | 0.1 | 0.05 | Cumulative Layout Shift |
| **TTFB** | 800ms | 600ms | Time to First Byte |
| **Bundle Size** | 500KB | 400KB | Taille JavaScript totale |
| **Memory Usage** | 50MB | 30MB | Mémoire JavaScript utilisée |

### **Erreurs**

| Catégorie | Description | Sévérité |
|-----------|-------------|----------|
| **javascript** | Erreurs JS globales | High |
| **network** | Ressources non chargées | Medium |
| **render** | Erreurs React/DOM | High |
| **user-action** | Erreurs interactions | Medium |
| **api** | Erreurs serveur/API | High/Medium |

## 🔧 Configuration

### **Budgets de Performance**

Modifiez `performance-budget.json` :

```json
{
  "performance": {
    "FCP": {
      "budget": 1800,
      "warning": 1500,
      "description": "First Contentful Paint"
    }
  },
  "alerts": {
    "console": { "enabled": true },
    "webhook": { "enabled": false, "url": "..." }
  }
}
```

### **Lighthouse CI**

Configuration dans `lighthouserc.json` :

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:8080/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.8}]
      }
    }
  }
}
```

## 📊 Dashboard

### **Sections Disponibles**

#### **1. Vue d'Ensemble**
- **Cartes de Résumé** : Erreurs totales, budgets dépassés, statut global
- **Alertes** : Recommandations d'optimisation automatiques
- **Sélecteur de Période** : 1h, 24h, 7d

#### **2. Onglet Performance**
- **Graphique Budgets** : Métriques vs budgets définis
- **Liste des Métriques** : Statut détaillé par métrique
- **Indicateurs Visuels** : ✅ Bon, ⚠️ Warning, ❌ Dépassé

#### **3. Onglet Erreurs**
- **Répartition par Catégorie** : Graphique en secteurs
- **Répartition par Sévérité** : Graphique en barres
- **Top 5 Erreurs** : Les plus fréquentes avec compteurs

#### **4. Onglet Détails**
- **Métriques Système** : Détails avec barres de progression
- **Actions Rapides** : Capture métriques, nettoyage mémoire, export

### **Actions Disponibles**

```typescript
// Capturer métriques système
performanceMonitor.recordMemoryUsage();
performanceMonitor.recordBundleSize();

// Nettoyer mémoire (si disponible)
if ('gc' in window) window.gc();

// Exporter données
const data = {
  performance: performanceMonitor.getPerformanceReport(),
  errors: errorTracker.getErrorSummary()
};
```

## 🔍 Lighthouse CI

### **Installation**

```bash
# Installer Lighthouse CI
npm install --save-dev @lhci/cli

# Ou utiliser npx
npx @lhci/cli --help
```

### **Commandes Disponibles**

```bash
# Audit complet automatique
npm run lighthouse

# Collecter uniquement
npm run lighthouse:collect

# Vérifier les assertions
npm run lighthouse:assert

# Uploader les résultats
npm run lighthouse:upload
```

### **Intégration CI/CD**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lighthouse
```

## 🚨 Alertes et Notifications

### **Types d'Alertes**

#### **Performance**
- ⚠️ **Warning** : Métrique approche du budget
- ❌ **Error** : Budget dépassé
- 🔥 **Critical** : Performance très dégradée

#### **Erreurs**
- 📊 **Rate** : Taux d'erreur élevé (>5/min)
- 🐛 **New** : Nouvelle erreur détectée
- 🔄 **Recurring** : Erreur récurrente

### **Configuration des Alertes**

```typescript
// Console (développement)
if (process.env.NODE_ENV === 'development') {
  console.warn('Performance budget exceeded:', metric);
}

// Service externe (production)
if (process.env.NODE_ENV === 'production') {
  // Sentry, DataDog, Slack webhook, etc.
  analytics.track('performance-alert', { metric, budget });
}
```

## 📈 Analyse et Optimisation

### **Recommandations Automatiques**

Le système génère automatiquement des recommandations :

```typescript
const report = performanceMonitor.getPerformanceReport();
console.log(report.recommendations);
// [
//   "Optimize FCP: 2100ms > 1800ms",
//   "Monitor bundle-size: approaching budget limit",
//   "Consider lazy loading for heavy components"
// ]
```

### **Métriques d'Optimisation**

#### **Bundle Size**
- **Code Splitting** : Lazy loading des routes
- **Tree Shaking** : Suppression du code non utilisé
- **Compression** : Gzip/Brotli

#### **Runtime Performance**
- **Memoization** : `useMemo`, `useCallback`
- **Virtualization** : Listes longues
- **Debouncing** : Interactions fréquentes

#### **Network**
- **Resource Hints** : `preload`, `prefetch`
- **CDN** : Ressources statiques
- **Caching** : Headers appropriés

## 🔧 Dépannage

### **Dashboard ne s'affiche pas**

1. **Vérifier l'authentification** : Route protégée
2. **Vérifier les imports** : Recharts installé
3. **Console errors** : Ouvrir DevTools

### **Métriques manquantes**

1. **Performance Observer** : Navigateur compatible
2. **Permissions** : Métriques système
3. **Timing** : Attendre le chargement initial

### **Lighthouse CI échoue**

1. **Serveur démarré** : `npm run dev` actif
2. **Port correct** : 8080 disponible
3. **Budgets réalistes** : Ajuster les seuils

### **Erreurs non capturées**

1. **Error Boundaries** : Vérifier la hiérarchie
2. **Async Errors** : Utiliser `.catch()`
3. **Event Listeners** : Ajouter error handling

## 📚 Ressources

### **Documentation**
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

### **Outils Complémentaires**
- **Chrome DevTools** : Performance tab
- **React DevTools** : Profiler
- **Webpack Bundle Analyzer** : Bundle analysis

### **Services Externes**
- **Sentry** : Error tracking
- **DataDog** : Performance monitoring
- **New Relic** : APM complet

---

**🎯 Objectif :** Maintenir une expérience utilisateur optimale avec un monitoring proactif et des optimisations basées sur des données réelles. 