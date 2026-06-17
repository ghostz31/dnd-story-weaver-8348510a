# Analyse et Plan d'Amélioration - Besace

## 1. État Actuel des Fonctionnalités

### ✅ existant
| Catégorie | Fonctionnalités |
|-----------|-----------------|
| **Création de personnage** | Wizard complet (nom, race, classe, caractéristiques, compétences, options, sorts, background, équipement, revue) |
| **Level Up** | HP, choix de sous-classe, ASI/Feats, choix de sorts |
| **Feuille de personnage** | Stats, compétences, CA,initiative, vitesse, jets de sauvegarde |
| **Combat** | Gestion des attaques, jets de dégâts, PV, CA,tracker d'initiative |
| **Inventaire** | Gestion d'équipement, devises, poids |
| **Grimoire** | Sorts, préparation, cantrips, slots, utilisation |
| **Notes** | Notes libres |
| **Données** | 12 classes, ~20 races, 80+ feats, 500+ sorts, sous-classes, backgrounds |

### ⚠️ Manquant ou incomplet

| Priorité | Fonctionnalité | Détail |
|----------|-----------------|--------|
| **Haute** | **Feuille de personnage** -jets d'attaque détaillés | Pas de liste d'armes avec bonus d'attaque et dégâts |
| **Haute** | **Feuille de personnage** -actions Bonus/Réaction | Pas de tracking des actions disponibles |
| **Haute** | **Sorts** - Métamagie (Ensorceleur) | Pas de gestion des options de métamagie |
| **Haute** | **Sorts** - Domaines/Schools (Clerc, etc.) | Pas de sorts de domaine affichés séparément |
| **Haute** | **Level Up** -Chooser des talents de classe | Ex: Sneak Attack du Roublard, Rage du Barbare |
| **Moyenne** | **Combat** - Conditions/Status | Pas de tracking des états (étourdi, empoisonné, etc.) |
| **Moyenne** - | **Inventaire** - Objets magiques | Pas de gestion spécifique (attunement, charges) |
| **Moyenne** | **Personnage** - Points de vie temporaires | Pas de gestion claire vs PV max |
| **Moyenne** | **Traces de compétences** | Pas de suivi des utilisations (channel divinity, etc.) |
| **Basse** | **Export/Import** | Pas de export JSON/CSV |
| **Basse** | **Companion/Familier** | Pas de gestion des PNJ suivants |

---

## 2. Comparaison avec D&D Beyond / Foundry VTT

### D&D Beyond
- ✅ Personnage complet avec tous les jets d'attaque
- ✅ Actions (action, action bonus, réaction)
- ✅ Trackers de conditions visuels
- ✅ Capacités de classe avec tracking (rages, sorcery points, etc.)
- ✅ Objets magiques avec attunement
- ✅ Feuille de suite aveccalculs automatiques
- ✅ Export PDF complet
- ✅ Partage de personnages

### Foundry VTT
- ✅ Système complet de personnages avec sheet Actor
- ✅ Combat automatique avec token HP
- ✅ Bibliothèques de sorts advanced avec filter/search
- ✅ Modules pour tout扩展re
- ✅ Système de compendium riche
- ✅ API pour extensions

---

## 3. Plan d'Implémentation

### Phase 1: Fondations (Priorité Haute)
1. **Ajouter les attaques/jets de personnages**
   - Créer liste d'armes avec stats détaillées
   - Afficher bonus d'attaque et dégâts sur la feuille
   - Track attaques multiples (monk, rogue sneak attack)

2. **Actions Bonus/Réaction**
   - Ajouter champ pour action bonus disponible
   - Ajouter champ pour réaction
   - Afficher sur la feuille de personnage

### Phase 2: Système de Combat
3. **Conditions/Status**
   - Créer liste des conditions D&D 5e (étourdi, charmé, empoisonné, etc.)
   - Ajouter tracker visuel sur la page combat
   - Timer pour conditions temporaires (1 minute, 10 minutes)

4. **Points de vie temporaires**
   - Séparer PV temporaires dans l'affichage
   - Option pour restaurer dans le contexte

### Phase 3: Capacités de Classe
5. **Capacités spécialies par classe**
   - Rage du Barbare (nombre de uses)
   - Channel Divinity du Clerc
   - Ki du Moine
   - Sorcery Points de l'Ensorceleur
   - Sneak Attack du Roublard
   -点数 de Rage du Barbare

6. **Métamagie de l'Ensorceleur**
   - Ajouter selection de métamagies
   - Track des uses disponibles

7. **Sorts de Domaine/École**
   - Afficher sorts de domaine Clerc séparément
   - Ajouter sous-catégorie dans SpellsPage

### Phase 4: Inventaire Avancé
8. **Objets magiques**
   - Ajouter type d'objet "magique"
   - Gestion de l'attunement (max 3)
   - Charges magiques (optionnel)
   - Description détaillé pour objets

### Phase 5: Qualité de Vie
9. **Export/Import**
   - Export JSON du personnage
   - Import depuis JSON
   - Export PDF simple (à terme)

10. **Amélioration de l'UI**
    - Responsive design améliore
    - Animations pour transitions
    - Mode sombre optimise

---

## 4. Roadmap Suggestion

```
Phase 1 (1-2 semaines):
├── 4.1 Ajout attaques/armements
├── 4.2 Actions Bonus/Réaction
└── 4.3 Test utilisteur

Phase 2 (1 semaine):
├── 5.1 Liste conditions
├── 5.2 Tracker combat
└── 5.3 PV temporaires

Phase 3 (1-2 semaines):
├── 6.1 Capacités classes (barbare, moine, rogue)
├── 6.2 Métamagies sorcier
└── 6.3 Sorts domaine clerc

Phase 4 (1 semaine):
├── 7.1 Objets magiques
├── 7.2 Attunement
└── 7.3 Charges

Phase 5 (optionnel):
├── 8.1 Export JSON
├── 8.2 UI/UX
└── 8.3 Tests exhaustifs
```