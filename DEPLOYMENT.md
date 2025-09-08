# 🚀 Guide de Déploiement - Trame D&D Story Weaver

> Instructions complètes pour déployer l'application en production

## 📋 Prérequis

### **Environnements Requis**
- **Node.js**: 18.0+ LTS
- **Package Manager**: npm 8+ ou yarn 1.22+
- **Base de données NoSQL**: Firebase Firestore
- **Authentification**: Firebase Auth
- **Hébergement**: Vercel/Netlify, ou serveur Node.js

### **Comptes et Services**
- **Firebase Project** avec Firestore activé
- **Repository Git** (GitHub/GitLab)
- **CI/CD Platform** (Vercel, Netlify, GitHub Actions)

---

## 🎯 Options de Déploiement

### **Option 1: Vercel (Recommandé)**

**Vérifications pré-déploiement:**
```bash
# Variables d'environnement dans .env.local
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

**Configuration Vercel:**
1. **Connect Repository** sur vercel.com
2. **Root Directory**: `./` (racine)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Add Environment Variables** dans Project Settings
6. **Deploy**

**Optimisations Vercel:**
```json
// vercel.json
{
  "functions": {
    "src/server.ts": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### **Option 2: Netlify**

**Site Configuration:**
1. **Connect Repository** sur netlify.com
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18
3. **Environment Variables** dans Site Settings

**Configuration Rewrites:**
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Option 3: Serveur Node.js Personnalisé**

**Configuration Express Server:**
```typescript
// src/server.ts
import express from 'express';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const port = process.env.PORT || 3000;

nextApp.prepare().then(() => {
  const app = express();

  // API routes
  app.use('/api', apiRoutes);

  // Handle Next.js requests
  app.all('*', (req, res) => handle(req, res));

  const server = createServer(app);

  server.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
```

**Process Management (PM2):**
```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'trame-app',
    script: 'dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    max_memory_restart: '1G'
  }]
};
```

---

## 🔧 Configuration Firebase

### **1. Créer un Projet Firebase**

1. **Aller sur** [Firebase Console](https://console.firebase.google.com)
2. **Créer un nouveau projet** "trame-dnd-app"
3. **Activer Firestore** dans Database
4. **Activer Authentication** avec Email/Password
5. **Générer une clé API**

### **2. Configuration Firestore Security Rules**

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Encounters - Utilisateur propriétaire uniquement
    match /users/{userId}/encounters/{encounterId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Parties - Utilisateur propriétaire uniquement
    match /users/{userId}/parties/{partyId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Profil utilisateur
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Données publiques monstres (lecture seule)
    match /monsters/{monsterId} {
      allow read: if true;
      allow write: if false;
    }

    // Métriques admin (role-based)
    match /metrics/{metricId} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### **3. Configuration Firebase Auth**

```javascript
// src/firebase/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 🔐 Variables d'Environnement

### **Production Environment**

```bash
# .env.production
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBxXxXxXxXxXxXxXxXxXxXxXxXxXxXx
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project-id
VITE_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123def456

# App Configuration
VITE_ENVIRONMENT=production
VITE_DEBUG=false
VITE_API_BASE_URL=https://my-api.com
VITE_APP_VERSION=1.0.0

# Analytics & Monitoring
VITE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### **Development Environment**

```bash
# .env.development
VITE_FIREBASE_API_KEY=dev_key_here
VITE_FIREBASE_PROJECT_ID=trame-dev
VITE_ENVIRONMENT=development
VITE_DEBUG=true
```

### **Staging Environment**

```bash
# .env.staging
VITE_FIREBASE_PROJECT_ID=trame-staging
VITE_ENVIRONMENT=staging
VITE_DEBUG=false
```

---

## 📊 Monitoring & Analytics

### **1. Configuration Lighthouse**

Créer le fichier `lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": ["http://localhost:4173"]
    },
    "assert": {
      "assertions": {
        "categories:accessibility": "error",
        "categories:performance": "warn",
        "categories:pwa": "off",
        "categories:seo": "error"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### **2. Performance Budget**

```json
// performance-budget.json
{
  "budgets": [
    {
      "path": "/",
      "resourceSizes": [
        {
          "resourceType": "total",
          "budget": 500
        },
        {
          "resourceType": "javascript",
          "budget": 300
        }
      ]
    }
  ]
}
```

### **3. Error Tracking (Sentry)**

```typescript
// src/utils/errorTracker.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'my-project.com']
    }),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

---

## 🚦 Scripts CI/CD

### **GitHub Actions Configuration**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type checking
        run: npm run type-check

      - name: Run tests
        run: npm run test:ci

      - name: Run Lighthouse audit
        run: npm run lighthouse

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  deploy:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 🔍 Tests & Qualité

### **Jest Configuration Complète**

```javascript
// jest.config.js
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__generated__/**'
  ],
  coveragePathIgnorePatterns: [
    'node_modules',
    'src/test',
    'src/**/*.stories.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss)$': '<rootDir>/src/test/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/test/__mocks__/fileMock.js'
  }
};

module.exports = config;
```

---

## 🌐 Configuration PWA (Optionnel)

### **Service Worker Setup**

```typescript
// src/serviceWorker.ts
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Afficher notification de mise à jour
  },
  onOfflineReady() {
    // Application prête pour offline
  }
});
```

### **Manifest Configuration**

```json
// public/manifest.json
{
  "name": "Trame - Générateur de Rencontres D&D",
  "short_name": "Trame",
  "description": "Générateur de rencontres Dungeons & Dragons",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1f2937",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🚨 Rollback & Recovery

### **Stratégie de Rollback**

**Vercel Rollback:**
```bash
# Lister les déploiements
vercel ls

# Rollback vers version précédente
vercel rollback [deployment-id]
```

**Netlify Rollback:**
```bash
# Via interface ou
netlify deploy --dir=./dist --prod=false --rollback
```

### **Points de Récupération**

**Backup Strategy:**
```javascript
// Script de sauvegarde des données utilisateurs
const backupUserData = async (userId) => {
  const userEncounters = await getAllUserEncounters(userId);
  const backupData = {
    encounters: userEncounters,
    timestamp: new Date().toISOString(),
    userId: userId
  };

  // Sauvegarde dans Firebase Storage
  await uploadBackup(`${userId}_${timestamp}.json`, backupData);

  return backupData;
};
```

---

## 🔍 Optimisations Production

### **Bundle Optimization**

**Vite Build Settings:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          utils: ['date-fns', 'lodash-es']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app']
  }
});
```

### **CDN & Caching**

**Cache Headers for Static Assets:**
```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

location ~* \.(html)$ {
    expires 5m;
    add_header Cache-Control "public, must-revalidate, proxy-revalidate";
}
```

---

## 📈 Métriques & KPI

### **Monitoring Dashboard**

**Métriques Clés:**
- **Performance**:
  - Core Web Vitals (FCP, LCP, CLS, FID, TTFB)
  - Lighthouse Score (Performance/Accessibility/SEO)
  - Bundle Size et Loading Time

- **Business**:
  - Nombre d'utilisateurs actifs (DAU/WAU/MAU)
  - Nombre de rencontres créées
  - Temps passé en session

- **Technical**:
  - Taux d'erreurs JavaScript
  - Latence API Firebase
  - Utilisation cache

### **Alertes**

```typescript
// Configuration monitoring alerts
const monitoringConfig = {
  alerts: {
    performance: {
      'core_web_vitals_fcp': { threshold: 2500, operator: '>' },
      'core_web_vitals_lcp': { threshold: 4000, operator: '>' },
      'core_web_vitals_cls': { threshold: 0.1, operator: '>' }
    },
    error: {
      'javascript_error_rate': { threshold: 0.05, operator: '>' },
      'api_error_rate': { threshold: 0.1, operator: '>' }
    },
    business: {
      'user_engagement_drop': { threshold: 20, operator: '>', unit: 'percent' }
    }
  }
};
```

---

Cette configuration assure un déploiement robuste et scalable de Trame en production, avec monitoring complet et stratégies de récupération d'urgence.
