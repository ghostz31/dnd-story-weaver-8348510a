# 🎲 Trame - Générateur de Rencontres D&D

> **Interface intuitive pour maîtres de jeu avec optimisation mobile complète**

Trame est un générateur de rencontres Dungeons & Dragons 5e moderne, conçu pour offrir une expérience fluide sur tous les appareils, avec une attention particulière pour les interfaces mobiles et tactiles.

## ✨ Fonctionnalités Principales

### 🎯 **Génération de Rencontres**
- Création automatique de rencontres équilibrées
- Base de données complète de monstres D&D 5e
- Calcul automatique de la difficulté (CR)
- Intégration avec AideDD pour les détails des créatures

### ⚔️ **Tracker de Combat Avancé**
- **3 modes d'affichage** : Grille, Liste, Compact
- Gestion complète de l'initiative
- Suivi des points de vie avec barres visuelles
- **Système de conditions** avec interface tactile
- Actions rapides : soins/dégâts en un clic
- Génération automatique de trésors

### 📱 **Optimisation Mobile Native**
- **Interface mobile-first** avec header sticky
- **Menu hamburger** pour actions rapides
- **Interactions tactiles** avec feedback visuel
- **Modales plein écran** en mode portrait
- **Safe area** et gestion des encoches
- **Mode liste recommandé** sur mobile

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone https://github.com/ghostz31/Trame.git
cd Trame

# Installer les dépendances
npm install

# Démarrer en développement
npm run dev
```

### Build Production
```bash
npm run build
npm run preview
```

## 🎨 Interface & UX

### **Desktop**
- Interface complète avec tous les contrôles
- Affichage en grille optimisé pour grands écrans
- Modales avec dimensionnement adaptatif

### **Mobile & Tablette**
- Header compact avec contrôles essentiels
- Menu hamburger pour actions avancées
- Mode liste par défaut (plus lisible)
- Boutons tactiles 44px minimum
- Animations fluides et légères

### **Interactions Tactiles**
- Feedback visuel `active:scale-95`
- Zones de touch optimisées
- Scroll horizontal pour tableaux compacts
- Gestion native des gestes

## 🛠️ Architecture Technique

### **Frontend**
- **React 18** + TypeScript
- **Vite** pour le build ultra-rapide
- **Tailwind CSS** pour le design system
- **Lucide React** pour les icônes
- **Radix UI** pour les composants accessibles

### **Hooks Personnalisés**
- `useMobile()` - Détection responsive avancée
- `useScreenSize()` - Breakpoints adaptatifs
- `useEncounterState()` - Gestion d'état centralisée

### **Responsive Design**
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px  
- **Desktop** : > 1024px

## 🎯 Systèmes de Combat

### **Système Principal (Recommandé)**
- Interface redesignée mobile-first
- Gestion complète PV, CA, initiative
- Système de conditions avancé
- Génération de trésor automatique
- **Route** : `/encounter-tracker`

### **Système Unifié**
- Architecture refactorisée avec `useReducer`
- Service layer pour logique métier
- Système de cache intelligent
- Tests unitaires complets
- **Route** : `/encounter-tracker-unified`

## 📊 Fonctionnalités Avancées

### **Gestion des Conditions**
- **17 conditions D&D 5e** avec icônes colorées
- Interface tactile optimisée
- Recherche en temps réel
- Gestion visuelle intuitive

### **Génération de Trésors**
- Calcul automatique selon CR et niveau
- Intégration objets magiques AideDD
- Trésors individuels et de réserve
- Export et sauvegarde

### **Synchronisation AideDD**
- Enrichissement automatique des créatures
- Détails complets (actions, traits, sorts)
- Images et statistiques officielles
- Cache intelligent pour performances

## 🔧 Configuration

### **Variables d'Environnement**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### **Firebase (Optionnel)**
- Sauvegarde cloud des rencontres
- Synchronisation multi-appareils
- Historique des sessions

## 🎮 Utilisation

### **Créer une Rencontre**
1. Sélectionnez un groupe de joueurs
2. Choisissez la difficulté souhaitée
3. Générez automatiquement ou ajoutez manuellement
4. Lancez le tracker de combat

### **Tracker de Combat**
1. **Initiative** : Lancez automatiquement ou saisissez
2. **Tour par tour** : Boutons Précédent/Suivant
3. **Gestion PV** : Clic sur ❤️ ou boutons +/-
4. **Conditions** : Interface tactile dédiée
5. **Détails** : Popup AideDD intégré

### **Mobile**
1. **Menu hamburger** (☰) pour actions rapides
2. **Mode liste** recommandé pour lisibilité
3. **Interactions tactiles** naturelles
4. **Plein écran** pour modales importantes

## 🚀 Performance & Optimisations

### **Mobile**
- **25% d'économie d'écran** avec interface compacte
- **100% boutons optimisés** pour interactions tactiles
- **Animations légères** pour fluidité
- **Images optimisées** selon taille d'écran

### **Général**
- **Lazy loading** des composants
- **Cache intelligent** des données monstres
- **Service Workers** pour offline
- **Bundle splitting** automatique

## 🤝 Contribution

### **Développement**
```bash
# Fork le repository
git fork https://github.com/ghostz31/Trame.git

# Créer une branche feature
git checkout -b feature/ma-fonctionnalite

# Développer et tester
npm run dev
npm run test

# Commit et push
git commit -m "✨ Nouvelle fonctionnalité"
git push origin feature/ma-fonctionnalite
```

### **Standards**
- **TypeScript** obligatoire
- **Tests unitaires** pour nouvelles fonctionnalités  
- **Mobile-first** dans le design
- **Accessibilité** WCAG 2.1 AA

## 📝 Changelog

### **v2.0.0** - Optimisation Mobile Complète
- 🚀 Interface mobile native avec header sticky
- 📱 Hook `useMobile()` avec détection avancée
- 🎨 Modales plein écran en mode portrait
- ✨ Interactions tactiles avec feedback visuel
- 🔧 Architecture responsive refactorisée

### **v1.5.0** - Système Unifié
- 🏗️ Architecture `useReducer` centralisée
- 🎯 Service layer pour logique métier
- ⚡ Performances optimisées
- 🧪 Tests unitaires complets

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **AideDD** pour la base de données monstres
- **D&D 5e SRD** pour les règles officielles
- **Communauté D&D** pour les retours et suggestions

---

**Développé avec ❤️ pour la communauté D&D**

[![Mobile First](https://img.shields.io/badge/Mobile-First-blue.svg)](https://github.com/ghostz31/Trame)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://github.com/ghostz31/Trame)
[![D&D 5e](https://img.shields.io/badge/D%26D-5e-red.svg)](https://github.com/ghostz31/Trame)
