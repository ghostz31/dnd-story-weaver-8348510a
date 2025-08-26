# Systèmes de Combat Disponibles

## 🎯 Système Principal (Expérimental)

**Routes:** `/encounter-tracker`, `/encounter-tracker-test`  
**Composant:** `EncounterTrackerTest.tsx`

### Fonctionnalités :
- ✅ Interface redesignée avec affichage grille/liste/compact
- ✅ Gestion complète des PV, CA, initiative
- ✅ Système de conditions avancé
- ✅ Popup AideDD intégré pour les détails des créatures
- ✅ Synchronisation automatique des stats depuis AideDD
- ✅ Génération de trésor automatique
- ✅ Intégration des objets magiques AideDD
- ✅ Numérotation automatique des créatures identiques
- ✅ Interface optimisée pour les MJ

### Accès :
- Depuis la page d'accueil : "Combat (Système Expérimental)"
- Depuis EncounterBuilder : "Lancer la rencontre"

---

## 🔬 Système Unifié (Nouvelle Architecture)

**Route:** `/encounter-tracker-unified`  
**Composant:** `UnifiedEncounterTracker.tsx`

### Fonctionnalités :
- ✅ Architecture refactorisée avec `useReducer`
- ✅ Service layer pour la logique métier (`EncounterService`)
- ✅ Gestion d'état centralisée (`useEncounterState`)
- ✅ Système de cache intelligent (`EncounterCache`)
- ✅ Optimisations de performance
- ✅ Tests unitaires

### Accès :
- Depuis EncounterBuilder : "Combat (Système Unifié)"

---

## 📚 Système Original (Référence)

**Route:** `/encounter-tracker-original`  
**Composant:** `EncounterTracker.tsx`

### Fonctionnalités :
- ✅ Version originale stable
- ✅ Fonctionnalités de base
- ✅ Gestion PV et initiative
- ✅ Interface classique

### Accès :
- Route directe uniquement

---

## 🚀 Recommandations

### Pour l'utilisation quotidienne :
**Utilisez le Système Principal (Expérimental)** - Interface la plus avancée et fonctionnelle

### Pour tester les nouvelles architectures :
**Utilisez le Système Unifié** - Architecture moderne avec performances optimisées

### Pour la stabilité maximale :
**Utilisez le Système Original** - Version éprouvée et stable

---

## 📊 Comparaison des Fonctionnalités

| Fonctionnalité | Expérimental | Unifié | Original |
|----------------|--------------|---------|----------|
| Interface moderne | ✅ | ✅ | ❌ |
| AideDD intégré | ✅ | ✅ | ❌ |
| Génération trésor | ✅ | ✅ | ❌ |
| Architecture moderne | ❌ | ✅ | ❌ |
| Tests unitaires | ❌ | ✅ | ❌ |
| Performances optimisées | ❌ | ✅ | ❌ |
| Stabilité éprouvée | ✅ | ❌ | ✅ | 