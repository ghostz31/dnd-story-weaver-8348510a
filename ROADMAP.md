# Roadmap Produit — Besace

> Roadmap de développement basée sur les résultats du test utilisateur avec 10 personas (2026-04-24).
> Document vivant : à mettre à jour après chaque sprint.

---

## Vision

**Objectif Q2 2026** : Rendre Besace utilisable en session de jeu réelle pour 80% des profils de joueurs D&D 5e.

**Métriques cibles** :
- Score UX moyen ≥ 4.0/5 (actuellement 3.1/5)
- Taux d'abandon création < 10% (actuellement estimé à 25% pour débutants)
- Temps moyen création personnage < 12 min (actuellement 14 min)
- 0 bloquants critiques en production

---

## Contexte

Les tests avec 10 personas ont révélé **3 bloquants critiques** touchant 100% des utilisateurs :

1. **Page Notes entièrement mockée** — aucune persistance, boutons inactifs
2. **Absence de lancer de dés intégré** — l'app reste une calculatrice sans le cœur du jeu
3. **Forme sauvage sans effet mécanique** — les Druides doivent tout calculer à la main

**Score UX moyen actuel** : 3.1/5 (échelle : Sophie 2.1 → Julien 3.7)

---

## Phases de développement

### Phase 1 — Fondations (Sprint 1-2, 4 semaines)
> Objectif : Corriger les 3 bloquants critiques + 3 bugs majeurs

| ID | Ticket | Effort | Priorité | Personas |
|----|--------|--------|----------|----------|
| [BES-001](#bes-001) | Page Notes fonctionnelle | M | 🔴 Critique | Tous |
| [BES-002](#bes-002) | Lancer de dés intégré | L | 🔴 Critique | Maxime, Sophie, Julien |
| [BES-003](#bes-003) | Toggles actifs avec effets mécaniques | L | 🔴 Critique | Marie, Lucas, Alex, Chloé |
| [BES-004](#bes-004) | Bug CA Défense | S | 🟠 Haute | Lucas |
| [BES-005](#bes-005) | Forme sauvage mécanique | L | 🟠 Haute | Thomas |
| [BES-006](#bes-006) | Cache offline Aurora | M | 🟠 Haute | Lucas |

**Métriques de sortie Phase 1** :
- Score UX moyen cible : 3.8/5
- 0 bloquant critique restant
- Tests unitaires couvrant les nouveaux calculs de combat

---

### Phase 2 — UX Mobile & Parcours (Sprint 3-4, 4 semaines)
> Objectif : Réduire le taux d'abandon des débutants et améliorer l'expérience mobile

| ID | Ticket | Effort | Priorité | Personas |
|----|--------|--------|----------|----------|
| [BES-007](#bes-007) | Mode Débutant + Tutoriel | L | 🔴 Critique | Sophie |
| [BES-008](#bes-008) | JS et bonus de sort sur fiche combat | M | 🟠 Haute | Sophie, Maxime |
| [BES-009](#bes-009) | Boutons Repos court/long visibles | S | 🟡 Moyenne | Alex, Julien |
| [BES-010](#bes-010) | Point Buy avec coûts affichés | S | 🟡 Moyenne | Alex |
| [BES-011](#bes-011) | Contraste mode sombre WCAG AA | S | 🟡 Moyenne | Maxime |
| [BES-012](#bes-012) | Info-bulles sorts verrouillés | S | 🟢 Basse | Sophie |

**Métriques de sortie Phase 2** :
- Score UX moyen cible : 4.0/5
- Taux d'abandon création < 15%
- 100% des textes passent WCAG AA en mode sombre

---

### Phase 3 — Personnalisation & Collection (Sprint 5-6, 4 semaines)
> Objectif : Répondre aux besoins des rôlistes et des joueurs multi-personnages

| ID | Ticket | Effort | Priorité | Personas |
|----|--------|--------|----------|----------|
| [BES-013](#bes-013) | Boutique d'équipement | M | 🟠 Haute | Marie |
| [BES-014](#bes-014) | Bouton Import JSON | S | 🟠 Haute | Lucas |
| [BES-015](#bes-015) | Archivage de personnages | M | 🟡 Moyenne | Chloé |
| [BES-016](#bes-016) | Mode comparaison | M | 🟡 Moyenne | Chloé |
| [BES-017](#bes-017) | Champs RP éditables | M | 🟡 Moyenne | Emma, Léa |
| [BES-018](#bes-018) | Objets inventaire personnalisables | S | 🟢 Basse | Léa |

**Métriques de sortie Phase 3** :
- Score UX moyen cible : 4.2/5
- Limite de personnages configurable (10+ avec archivage)

---

### Phase 4 — Polish & Fonctionnalités avancées (Sprint 7+, 4+ semaines)
> Objectif : Différenciation et delight

| ID | Ticket | Effort | Priorité | Personas |
|----|--------|--------|----------|----------|
| [BES-019](#bes-019) | Sync Trame actif | L | 🟡 Moyenne | Chloé |
| [BES-020](#bes-020) | Journal de combat | M | 🟢 Basse | Julien |
| [BES-021](#bes-021) | Duplication de personnage | S | 🟢 Basse | Alex |
| [BES-022](#bes-022) | Listes de sorts personnalisées | S | 🟢 Basse | Chloé |
| [BES-023](#bes-023) | Thèmes de couleur | M | 🟢 Basse | Emma |
| [BES-024](#bes-024) | Animations level-up | S | 🟢 Basse | Emma |

**Métriques de sortie Phase 4** :
- Score UX moyen cible : 4.5/5
- NPS utilisateur > 50

---

## Tickets détaillés

### BES-001 — Page Notes fonctionnelle

**Type** : Bug / Feature | **Effort** : M (3-5 jours)

**Description** :
La page `NotesPage.tsx` affiche actuellement des données mockées (`mockNotes`). Les boutons Pencil, Trash et "Nouvelle note" sont inactifs. Les traits de personnalité, idéaux, liens et défauts saisis pendant la création ne sont pas persistés ni affichés.

**Critères d'acceptation** :
- [ ] Les champs Traits, Idéaux, Liens, Défauts sont éditables et persistés dans Firestore (`characters/{id}/personality`)
- [ ] Le bouton "Nouvelle note de session" ouvre un formulaire (titre, date, contenu, tags)
- [ ] Les notes de session sont listées, éditables et supprimables
- [ ] Les tags sont cliquables pour filtrer
- [ ] Les données existantes (mockées) sont remplacées par les données réelles du personnage

**Fichiers concernés** :
- `src/pages/NotesPage.tsx`
- `src/types/character.ts` (ajouter `personality` et `sessionNotes`)
- `src/contexts/CharacterContext.tsx` (persistance Firestore)

**Personas** : Tous (10/10 ont échoué sur cette tâche)

---

### BES-002 — Lancer de dés intégré

**Type** : Feature | **Effort** : L (5-8 jours)

**Description** :
L'application affiche les dégâts (ex: "1d8+4") mais ne permet pas de lancer les dés. Les joueurs doivent utiliser une app externe ou des dés physiques, ce qui casse le flow en session.

**Critères d'acceptation** :
- [ ] Bouton 🎲 sur chaque attaque, sort, compétence et sauvegarde
- [ ] Animation visuelle du lancer (rotation du dé)
- [ ] Résultat affiché avec breakdown : `[8] + 4 = 12`
- [ ] Historique des lancers conservé pendant la session (scrollable)
- [ ] Support des avantages/désavantages (2d20 drop lowest/highest)
- [ ] Fonctionne offline

**Fichiers concernés** :
- `src/pages/CombatSheetPage.tsx` (boutons sur les actions)
- `src/components/combat/ActionCard.tsx` (intégration)
- `src/utils/dice-roller.ts` (nouveau module)
- `src/stores/combatStore.ts` (historique des lancers)

**Personas** : Maxime (bloquant), Sophie, Julien

**Dépendances** : BES-003 (toggles mécaniques) pour les calculs de bonus

---

### BES-003 — Toggles actifs avec effets mécaniques

**Type** : Feature / Bug | **Effort** : L (5-8 jours)

**Description** :
Les toggles de la fiche de combat (Rage, Forme sauvage, Embuscade redoutable, etc.) sont purement visuels. Ils ne modifient aucun calcul d'attaque, de dégâts ou de CA.

**Critères d'acceptation** :
- [ ] Rage active : +2/+3/+4 dégâts CàC, avantage JS FOR, résistance B/P/S
- [ ] Embuscade redoutable : +1d8 dégâts au premier tour
- [ ] Guerrier planaire : +1d8/+2d8 dégâts force
- [ ] Forme sauvage : remplacement des stats (voir BES-005)
- [ ] Surincantation : dégâts max pour sorts Évocation niveau ≤5
- [ ] Les modifications sont visibles en temps réel sur les actions concernées

**Fichiers concernés** :
- `src/utils/combat-engine.ts` (`calculateDamage`, `calculateAttackBonus`, `calculateACFromInventory`)
- `src/pages/CombatSheetPage.tsx` (passer `activeEffects` aux calculs)
- `src/utils/combat-engine.test.ts` (tests des nouveaux calculs)

**Personas** : Marie, Lucas, Alex, Chloé (6/10 ont noté ce problème)

**Dépendances** : Doit être implémenté avant BES-002 pour que les lancers de dés intègrent les bonus actifs.

---

### BES-004 — Bug CA Défense

**Type** : Bug | **Effort** : S (1-2 jours)

**Description** :
Le style de combat "Défense" (+1 CA si armure portée) n'est pas appliqué dans `calculateACFromInventory`. Le calcul de CA ignore cette règle.

**Critères d'acceptation** :
- [ ] Fighter avec style Défense et armure = CA +1
- [ ] Vérification que le personnage porte une armure (pas de bonus si sans armure)
- [ ] Test unitaire ajouté

**Fichiers concernés** :
- `src/utils/combat-engine.ts` (`calculateACFromInventory`)
- `src/utils/combat-engine.test.ts`

**Personas** : Lucas (bug confirmé via inspecteur)

---

### BES-005 — Forme sauvage mécanique

**Type** : Feature | **Effort** : L (5-8 jours)

**Description** :
Lorsque le toggle "Forme sauvage" est activé, les stats du personnage (PV, CA, FOR, DEX, CON, attaques) doivent être remplacées par celles de la bête choisie. Actuellement, rien ne change.

**Critères d'acceptation** :
- [ ] Base de données des bêtes SRD (50+ bêtes) avec : nom, FP, PV, CA, FOR, DEX, CON, attaques
- [ ] Sélecteur de bête au toggle "Forme sauvage" (filtré par FP max et vol/nage selon niveau)
- [ ] Remplacement des stats du personnage dans l'UI
- [ ] Conservation de SAG, INT, CHA, bonus de maîtrise
- [ ] Désactivation du toggle = retour aux stats normaux
- [ ] Support du Cercle de la Lune (FP max augmenté)

**Fichiers concernés** :
- `src/pages/CombatSheetPage.tsx` (sélecteur de bête, toggle)
- `src/data/beasts.ts` (nouveau fichier)
- `src/utils/combat-engine.ts` (calculs conditionnels)
- `src/utils/feature-helpers.ts` (`getDruidWildShapeMaxCR`, etc.)

**Personas** : Thomas (bloquant pour Druides)

---

### BES-006 — Cache offline Aurora

**Type** : Tech | **Effort** : M (3-5 jours)

**Description** :
Les fichiers Aurora JSON (races.json, classes.json, spells.json, etc.) sont fetchés à chaque étape du wizard sans cache. Sur connexion lente ou offline, le wizard est inutilisable.

**Critères d'acceptation** :
- [ ] Service worker ou bundling des JSON Aurora dans le build
- [ ] Cache persistant (localStorage / IndexedDB)
- [ ] Fallback offline : si fetch échoue, utiliser les données en cache
- [ ] Invalidation du cache quand les fichiers sont mis à jour
- [ ] Temps de chargement wizard < 3s même sur 3G

**Fichiers concernés** :
- `src/data/aurora-loader.ts`
- `vite.config.ts` (bundling)
- `public/data/aurora/` (fichiers JSON)

**Personas** : Lucas (observation technique)

---

### BES-007 — Mode Débutant + Tutoriel

**Type** : Feature | **Effort** : L (5-8 jours)

**Description** :
Sophie (débutante) a été submergée par le wizard (10 étapes), a paniqué face aux Points de sorcellerie à 0, et a abandonné la recherche de sorts. Besace n'est pas accessible aux nouveaux joueurs sans accompagnement.

**Critères d'acceptation** :
- [ ] Wizard simplifié "Mode Débutant" (5 étapes max : Nom/Race/Classe/Stats/Résumé)
- [ ] Overlay tutoriel interactif à la première connexion (tooltips sur CA, JS, attaque, sorts)
- [ ] Badges "Recommandé" sur les races/classes faciles
- [ ] Masquage des fonctionnalités non disponibles au niveau actuel (ex: Points de sorcellerie cachés au niv 1)
- [ ] Info-bulle sur les sorts verrouillés : "Disponible au niveau X"
- [ ] Conseils d'équipement contextuels

**Fichiers concernés** :
- `src/pages/CreateCharacterPage.tsx` (mode débutant)
- `src/pages/wizard/*` (tutoriel overlay)
- `src/components/TutorialOverlay.tsx` (nouveau)

**Personas** : Sophie (bloquant)

---

### BES-008 — JS et bonus de sort sur fiche combat

**Type** : Feature | **Effort** : M (3-5 jours)

**Description** :
Le bonus d'attaque de sort et les jets de sauvegarde ne sont pas visibles sur la fiche de combat. Les joueurs doivent naviguer vers l'onglet Perso en plein combat.

**Critères d'acceptation** :
- [ ] Section "Sorts" sur la fiche de combat : DC, bonus d'attaque, emplacements restants
- [ ] Section "Sauvegardes" sur la fiche de combat : JS principaux avec bonus
- [ ] Bouton de lancer rapide pour chaque JS
- [ ] Optimisé pour mobile (pas de scroll excessif)

**Fichiers concernés** :
- `src/pages/CombatSheetPage.tsx`
- `src/components/combat/SavesPanel.tsx` (nouveau)
- `src/components/combat/SpellCombatPanel.tsx` (nouveau)

**Personas** : Sophie, Maxime

---

### BES-009 — Boutons Repos court/long visibles

**Type** : UX | **Effort** : S (1-2 jours)

**Description** :
Les boutons Repos court et Repos long sont cachés dans un menu (icône + en haut). Les joueurs les cherchent en permanence sur la fiche de combat.

**Critères d'acceptation** :
- [ ] Boutons "Repos court" et "Repos long" visibles en permanence sur la fiche de combat
- [ ] Confirmation avant restauration (modal)
- [ ] Restauration correcte des ressources selon le type de repos
- [ ] Short rest : Ki, Inspirations, dés de supériorité, emplacements de pacte
- [ ] Long rest : Tout + points de vie

**Fichiers concernés** :
- `src/pages/CombatSheetPage.tsx` (positionnement des boutons)
- `src/stores/combatStore.ts` (logique de restauration)

**Personas** : Alex, Julien

---

### BES-010 — Point Buy avec coûts affichés

**Type** : UX | **Effort** : S (1-2 jours)

**Description** :
Le Point Buy n'affiche pas le coût en points de chaque score (8=0, 9=1, ..., 15=9). Les joueurs doivent calculer mentalement.

**Critères d'acceptation** :
- [ ] Affichage du coût en points sous chaque score (ex: "15 — 9 pts")
- [ ] Affichage du total restant ("12/27 points utilisés")
- [ ] Validation en temps réel (empêcher de dépasser 27 points)
- [ ] Coloration en rouge si le score dépasse le budget

**Fichiers concernés** :
- `src/pages/wizard/AbilitiesStep.tsx`

**Personas** : Alex

---

### BES-011 — Contraste mode sombre WCAG AA

**Type** : Bug / UX | **Effort** : S (1-2 jours)

**Description** :
En mode sombre, certains textes gris sur fond sombre ont un contraste insuffisant (< 4.5:1). Illisible dans un environnement faiblement éclairé (café, soirée).

**Critères d'acceptation** :
- [ ] Audit complet des couleurs en mode sombre
- [ ] Tous les textes passent WCAG AA (contraste ≥ 4.5:1)
- [ ] Textes secondaires ≥ 3:1 (WCAG AA large text)
- [ ] Vérification automatique via test (axe-core ou playwright)

**Fichiers concernés** :
- `src/index.css` (variables CSS dark mode)
- `tailwind.config.js` (couleurs)
- `src/components/ui/*` (composants concernés)

**Personas** : Maxime

---

### BES-012 — Info-bulles sorts verrouillés

**Type** : UX | **Effort** : S (1-2 jours)

**Description** :
Quand un joueur cherche un sort au-delà de son niveau (ex: Boule de feu au niveau 1), l'app le refuse sans expliquer pourquoi.

**Critères d'acceptation** :
- [ ] Survol/long-press sur un sort verrouillé affiche : "Niveau requis : X"
- [ ] Indication du niveau actuel vs niveau requis
- [ ] Message gentil : "Disponible au niveau 5 !"

**Fichiers concernés** :
- `src/pages/wizard/SpellsStep.tsx`
- `src/pages/SpellsPage.tsx`

**Personas** : Sophie

---

### BES-013 — Boutique d'équipement

**Type** : Feature | **Effort** : M (3-5 jours)

**Description** :
L'équipement de départ est fixe. Les joueurs ne peuvent pas dépenser leur or de départ (15 po) ni acheter d'équipements supplémentaires.

**Critères d'acceptation** :
- [ ] Catalogue d'équipements SRD (armes, armures, boucliers, objets d'aventure)
- [ ] Recherche et filtres par catégorie/prix
- [ ] Gestion de la monnaie (po, pa, pc)
- [ ] Ajout/suppression d'objets dans l'inventaire
- [ ] Recalcul automatique du poids et de l'encombrement

**Fichiers concernés** :
- `src/pages/InventoryPage.tsx`
- `src/data/equipment.ts` (enrichir)
- `src/components/EquipmentShop.tsx` (nouveau)

**Personas** : Marie

---

### BES-014 — Bouton Import JSON

**Type** : Feature | **Effort** : S (1-2 jours)

**Description** :
Le code d'import JSON existe (`characterImportExport.ts`) mais aucun bouton ne l'expose dans l'UI.

**Critères d'acceptation** :
- [ ] Bouton "Importer un personnage" sur la page d'accueil
- [ ] Input file acceptant .json
- [ ] Validation du schéma JSON
- [ ] Message d'erreur clair si le format est invalide
- [ ] Import dans Firestore après validation

**Fichiers concernés** :
- `src/pages/HomePage.tsx`
- `src/utils/characterImportExport.ts` (exposer la fonction)

**Personas** : Lucas

---

### BES-015 — Archivage de personnages

**Type** : Feature | **Effort** : M (3-5 jours)

**Description** :
La limite de 5 personnages est bloquante pour les joueurs qui aiment tester des builds. Pas d'option d'archivage.

**Critères d'acceptation** :
- [ ] Bouton "Archiver" sur chaque carte personnage
- [ ] Section "Personnages archivés" sur la page d'accueil
- [ ] Bouton "Désarchiver"
- [ ] Limite augmentée à 10 personnages actifs (archivés illimités)
- [ ] Filtre rapide : Actifs / Archivés / Tous

**Fichiers concernés** :
- `src/pages/HomePage.tsx`
- `src/types/character.ts` (ajouter `archived?: boolean`)
- Firestore rules (index sur `archived`)

**Personas** : Chloé

---

### BES-016 — Mode comparaison

**Type** : Feature | **Effort** : M (3-5 jours)

**Description** :
Les joueurs ne peuvent pas comparer deux personnages côte à côte. Doivent naviguer entre les fiches et retenir les chiffres.

**Critères d'acceptation** :
- [ ] Bouton "Comparer" sur la page d'accueil (sélection de 2 personnages)
- [ ] Vue côte à côte avec les stats clés
- [ ] Différences surlignées (vert = supérieur, rouge = inférieur)
- [ ] Comparaison : stats, CA, PV, bonus d'attaque, sorts, ressources

**Fichiers concernés** :
- `src/pages/HomePage.tsx` (sélection)
- `src/pages/ComparePage.tsx` (nouveau)

**Personas** : Chloé

---

### BES-017 — Champs RP éditables

**Type** : Feature | **Effort** : M (3-5 jours)

**Description** :
Les joueurs ne peuvent pas personnaliser les descriptions de leurs capacités, historique, ou traits de personnalité.

**Critères d'acceptation** :
- [ ] Champs texte éditables pour : traits, idéaux, liens, défauts
- [ ] Personnalisation du nom de l'historique (ex: "Chevalier errant déchu" au lieu de "Soldat")
- [ ] Persistance dans Firestore
- [ ] Affichage sur la fiche principale (onglet Perso)

**Fichiers concernés** :
- `src/pages/NotesPage.tsx`
- `src/pages/CharacterPage.tsx`
- `src/types/character.ts`

**Personas** : Emma, Léa

---

### BES-018 — Objets inventaire personnalisables

**Type** : Feature | **Effort** : S (1-2 jours)

**Description** :
Les objets d'inventaire n'ont pas de champ description. Impossible d'ajouter du flavour RP.

**Critères d'acceptation** :
- [ ] Champ "Description" sur chaque objet d'inventaire
- [ ] Possibilité de renommer un objet
- [ ] Affichage de la description en infobulle

**Fichiers concernés** :
- `src/pages/InventoryPage.tsx`
- `src/types/inventory.ts`

**Personas** : Léa

---

### BES-019 — Sync Trame actif

**Type** : Feature | **Effort** : L (5-8 jours)

**Description** :
Le bouton "Sync Trame" sur la page d'accueil est grisé/inactif. La fonctionnalité de partage en temps réel n'est pas implémentée.

**Critères d'acceptation** :
- [ ] Génération d'un code de partage (6 caractères)
- [ ] Connexion WebSocket pour synchronisation temps réel
- [ ] Partage de la fiche avec le MJ et les joueurs
- [ ] Mise à jour live des PV, ressources, conditions
- [ ] Permissions : lecture seule ou édition

**Fichiers concernés** :
- `src/pages/HomePage.tsx` (activer le bouton)
- `src/utils/combatSync.ts` (existant mais inactif)
- Backend WebSocket (à créer)

**Personas** : Chloé

---

### BES-020 — Journal de combat

**Type** : Feature | **Effort** : M (3-5 jours)

**Description** :
Aucun historique des actions pendant une session. Les joueurs oublient ce qu'ils ont fait.

**Critères d'acceptation** :
- [ ] Log automatique : "Tour 3 — Attaque épée : 12 dégâts — Gobelin tué"
- [ ] Dépenses de ressources loguées
- [ ] Changements de PV logués
- [ ] Export du journal en texte/markdown
- [ ] Reset à la fin de la session

**Fichiers concernés** :
- `src/stores/combatStore.ts` (log des actions)
- `src/components/combat/CombatLog.tsx` (nouveau)

**Personas** : Julien

---

### BES-021 — Duplication de personnage

**Type** : Feature | **Effort** : S (1-2 jours)

**Description** :
Impossible de cloner un personnage pour tester des variantes de build.

**Critères d'acceptation** :
- [ ] Bouton "Dupliquer" sur chaque carte personnage
- [ ] Le clone a un nom suffixé "(copie)"
- [ ] Toutes les données copiées (stats, équipement, sorts)
- [ ] Nouvel ID Firestore

**Fichiers concernés** :
- `src/pages/HomePage.tsx`
- `src/contexts/CharacterContext.tsx`

**Personas** : Alex

---

### BES-022 — Listes de sorts personnalisées

**Type** : Feature | **Effort** : S (1-2 jours)

**Description** :
Les sorts sont listés par niveau. Pas possible de créer des groupes personnalisés.

**Critères d'acceptation** :
- [ ] Création de listes personnalisées : "Sorts de combat", "Utilitaires", "RP"
- [ ] Drag & drop des sorts entre les listes
- [ ] Persistance dans Firestore

**Fichiers concernés** :
- `src/pages/SpellsPage.tsx`

**Personas** : Chloé

---

### BES-023 — Thèmes de couleur

**Type** : Feature | **Effort** : M (3-5 jours)

**Description** :
Le mode sombre est unique. Pas de personnalisation des couleurs d'accentuation.

**Critères d'acceptation** :
- [ ] Sélecteur de couleur d'accentuation (8 presets)
- [ ] Thème "Classique" (clair)
- [ ] Persistance du choix utilisateur
- [ ] Application dynamique sans rechargement

**Fichiers concernés** :
- `src/hooks/useDarkMode.ts`
- `src/index.css` (variables CSS)
- `src/components/ThemePicker.tsx` (nouveau)

**Personas** : Emma

---

### BES-024 — Animations level-up

**Type** : Feature | **Effort** : S (1-2 jours)

**Description** :
Le level-up est confirmé sèchement sans feedback visuel.

**Critères d'acceptation** :
- [ ] Animation de célébration au confirm du level-up (confetti CSS ou particules)
- [ ] Son optionnel (désactivé par défaut)
- [ ] Récapitulatif des gains : nouvelles capacités, sorts, ASI

**Fichiers concernés** :
- `src/pages/LevelUpPage.tsx`
- `src/components/LevelUpCelebration.tsx` (nouveau)

**Personas** : Emma

---

## Dépendances entre tickets

```
BES-001 (Notes) ─────┐
                     ├──→ Phase 1 livrée
BES-003 (Toggles) ───┼──→ BES-002 (Dés)
                     │
BES-004 (CA) ────────┤
BES-005 (Forme) ─────┤
BES-006 (Cache) ─────┘

BES-007 (Débutant) ──┐
BES-008 (JS Combat) ─┼──→ Phase 2 livrée
BES-009 (Repos) ─────┤
BES-010 (Point Buy) ─┤
BES-011 (Contraste) ─┤
BES-012 (Tooltips) ──┘

BES-013 (Boutique) ──┐
BES-014 (Import) ────┼──→ Phase 3 livrée
BES-015 (Archive) ───┤
BES-016 (Compare) ───┤
BES-017 (RP) ────────┤
BES-018 (Objets) ────┘

BES-019 (Sync) ──────┐
BES-020 (Journal) ───┼──→ Phase 4+
BES-021 (Clone) ─────┤
BES-022 (Listes) ────┤
BES-023 (Thèmes) ────┤
BES-024 (Anim) ──────┘
```

---

## Métriques de suivi

### KPIs produit (hebdomadaires)

| Métrique | Cible Actuelle | Cible Phase 1 | Cible Phase 2 | Cible Phase 4 |
|----------|---------------|---------------|---------------|---------------|
| Score UX moyen | 3.1 | 3.8 | 4.0 | 4.5 |
| Taux d'abandon création | ~25% | <20% | <10% | <5% |
| Temps moyen création | 14 min | 12 min | 10 min | 8 min |
| NPS utilisateur | N/A | N/A | >30 | >50 |
| Bugs critiques ouverts | 3 | 0 | 0 | 0 |

### Suivi par persona

| Persona | Score Actuel | Cible Phase 2 | Cible Phase 4 |
|---------|-------------|---------------|---------------|
| Sophie (Débutante) | 2.1 | 3.5 | 4.0 |
| Maxime (Mobile) | 2.4 | 3.5 | 4.0 |
| Thomas (RP) | 3.2 | 3.8 | 4.2 |
| Emma (Artiste) | 3.0 | 3.8 | 4.3 |
| Léa (Rôliste) | 3.1 | 3.9 | 4.3 |
| Lucas (Techie) | 3.5 | 3.9 | 4.3 |
| Alex (Min-Maxer) | 3.4 | 3.9 | 4.4 |
| Marie (Stratège) | 3.8 | 4.1 | 4.5 |
| Chloé (Polyvalente) | 3.6 | 4.0 | 4.5 |
| Julien (Tacticien) | 3.7 | 4.1 | 4.6 |

---

## Ressources nécessaires

### Équipe suggérée

| Rôle | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------|---------|---------|---------|---------|
| Développeur Frontend (React/TS) | 1 FTE | 1 FTE | 1 FTE | 0.5 FTE |
| Développeur Backend (Firebase) | 0.5 FTE | 0.5 FTE | 0.5 FTE | 0.5 FTE |
| UX Designer | 0.5 FTE | 1 FTE | 0.5 FTE | 0.25 FTE |
| QA / Testeur | 0.25 FTE | 0.5 FTE | 0.5 FTE | 0.25 FTE |

### Total effort estimé

- **Phase 1** : 24 jours-homme (4 semaines × 1.5 FTE)
- **Phase 2** : 20 jours-homme (4 semaines × 1.25 FTE)
- **Phase 3** : 18 jours-homme (4 semaines × 1.125 FTE)
- **Phase 4+** : 16 jours-homme+ (4+ semaines × 1 FTE)

**Total** : ~78 jours-homme (environ 5 mois avec 1 développeur full-time)

---

## Prochaines actions immédiates

1. **Cette semaine** :
   - [ ] Review de la roadmap avec l'équipe
   - [ ] Estimation précise des tickets BES-001 à BES-006
   - [ ] Création des branches Git pour Phase 1

2. **Sprint 1 (semaine 1-2)** :
   - [ ] Implémenter BES-001 (Notes fonctionnelles)
   - [ ] Implémenter BES-004 (Bug CA Défense)
   - [ ] Commencer BES-003 (Toggles mécaniques)

3. **Sprint 2 (semaine 3-4)** :
   - [ ] Finaliser BES-003 (Toggles mécaniques)
   - [ ] Implémenter BES-002 (Lancer de dés)
   - [ ] Implémenter BES-005 (Forme sauvage)
   - [ ] Implémenter BES-006 (Cache offline)

---

*Roadmap v1.0 — Générée le 2026-04-24*
*Basée sur les résultats du test utilisateur avec 10 personas*
*Document vivant : mettre à jour après chaque sprint review*
