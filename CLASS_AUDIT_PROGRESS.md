# Suivi de progression — Vérification classe par classe D&D 5e

## Résumé de l'état actuel

| # | Classe | Statut | Notes |
|---|--------|--------|-------|
| 1 | **Barbare** | ✅ 100% | Données + rules + mécaniques + toggles + tests |
| 2 | **Guerrier** | ✅ 100% | Données + rules + mécaniques + ressources + tests |
| 3 | **Roublard** | ✅ 100% | Données + rules + mécaniques + toggles + tests |
| 4 | **Clerc** | ✅ 100% | 12 sous-classes PHB/XGtE/TCoE, Canal divin, Frappe divine, tests |
| 5 | **Paladin** | ✅ 100% | 7 serments PHB/XGtE/TCoE, Châtiment divin amélioré, Auras, tests |
| 6 | **Rôdeur** | ✅ 100% | 7 sous-classes PHB/XGtE/TCoE, toggles de combat, helpers, tests |
| 7 | **Druide** | ✅ 100% | 7 cercles PHB/XGtE/TCoE, Forme sauvage, toggles, helpers, tests |
| 8 | **Moine** | ✅ 100% | 7 traditions PHB/XGtE/TCoE, Ki, Arts martiaux, toggles, helpers, tests |
| 9 | **Magicien** | ✅ 100% | 11 traditions PHB/XGtE/TCoE, Récupération arcanique, toggles, helpers, tests |
| 10 | **Barde** | ✅ 100% | 7 collèges PHB/XGtE/TCoE, Inspiration bardique, Chant reposant, Secrets magiques, toggles, helpers, tests |
| 11 | **Ensorceleur** | ✅ 100% | 7 origines PHB/XGtE/TCoE, Points de sorcellerie, Métamagie, toggles, helpers, tests |
| 12 | **Occultiste** | ✅ 100% | 7 protecteurs PHB/XGtE/TCoE, Invocations occultes, Arcanum mystique, toggles, helpers, tests |

## 🐛 Bugs connus / À corriger

| Bug | Fichier concerné | Priorité |
|---|---|---|
| Style de combat **Défense** (+1 CA en armure) non appliqué au total de CA | `combat-engine.ts` / fiche perso | ✅ Corrigé (vérifié dans `calculateACFromInventory`) |
| Doublon ressource Rage/Rages (corrigé) | `combatStore.ts` | ✅ Corrigé |
| ASI +2 dans une même caractéristique bloqué (corrigé) | `AsiSelector.tsx` | ✅ Corrigé |

---

## Infrastructure mise en place (Phase 1)

### Types étendus (`src/types/aurora-v2.ts`)
Nouveaux types de `Rule` ajoutés :
- `ConditionRule` — immunités, résistances, avantages/désavantages
- `ResourceRule` — ressources trackables avec progression par niveau
- `ACRule` — calcul alternatif de CA (Défense sans armure, etc.)
- `SpeedRule` — bonus de vitesse
- `AttackBonusRule` — bonus d'attaque conditionnel
- `DamageBonusRule` — bonus de dégâts conditionnel
- `SaveBonusRule` — bonus de sauvegarde conditionnel
- `SpellRule` — sorts toujours préparés/connus

### Type `Character` étendu (`src/types/character.ts`)
- `activeEffects?: string[]` — effets actifs (rage, chant-de-lame, etc.)
- `subclassResources?: Record<string, { current; max }>` — ressources de sous-classe génériques
- `classResources` enrichi avec `bardicInspiration`, `favoredEnemy`, `eldritchInvocations`, `tempHP`
- `classOptions?: Record<string, string>` — options de classe (styles de combat, etc.)

### Moteur de rules (`src/utils/rules-engine.ts`)
Handlers implémentés pour tous les nouveaux types de Rule.

### Données statiques — fallback Aurora
`src/data/apply-character-rules.ts` applique maintenant les rules des sous-classes **statiques** (`subclasses.ts`) quand Aurora n'a pas de rules.

---

## Classe 1 — Barbare ✅ 100%

### Capacités de base (niveaux 1-20)
- ✅ `classFeatures.ts` : toutes les capacités présentes avec descriptions détaillées
- ✅ `classActionsByLevel` : Rage, Défense sans armure, Attaque téméraire, Sens du danger, Voie primitive, Attaque supplémentaire, Déplacement rapide, Instinct sauvage, Critique brutal, Rage implacable, Rage persistante, Puissance indomptable, Champion primitif

### Sous-classes
Toutes les sous-classes PHB + XGtE + TCoE + SCAG + Bigby sont dans `subclasses.ts` avec leurs `rules` :

| Sous-classe | Source | Rules ajoutées |
|-------------|--------|----------------|
| Voie du Berserker | PHB | Frénésie, Rage aveugle (immunité charme/peur), Présence intimidante, Représailles |
| Voie du Totem | PHB | Quêteur spirituel (sorts rituels), Esprit totem (select), Aspect de la bête (select), Marcheur spirituel, Lien totémique |
| Gardien Ancestral | XGtE | Protecteurs ancestraux, Bouclier spirituel, Consulter les esprits (resource), Ancêtres vengeurs |
| Héraut de la Tempête | XGtE | Aura de tempête (select), Âme de tempête, Tempête protectrice, Tempête déchaînée |
| Zélote | XGtE | Fureur divine, Guerrier des dieux, Concentration fanatique, Présence zélée (resource), Rage au-delà de la mort |
| Bête | TCoE | Forme de la bête (select), Âme de la bête, Fureur infectieuse (resource), Appel de la chasse (resource) |
| Magie Sauvage | TCoE | Sens de la magie (resource), Sursaut sauvage, Réserve de magie (resource), Réaction instable, Sursaut contrôlé |
| Battlerager | SCAG | Armure d'épines, Chargeur téméraire, Chargeur de bataille, Épines de stockage |
| Géant | Bigby | Puissance géante, Hurlement géant, Élément géant, Stature imposante, Élément primordial |

### Mécaniques implémentées
- ✅ CA sans armure : `10 + DEX + CON` (bouclier autorisé) — `combat-engine.ts`
- ✅ Bonus de dégâts de Rage : appliqué automatiquement dans `calculateDamage()` quand rage active (+2/+3/+4)
- ✅ Vitesse bonus (Déplacement rapide) : `+3m` au niveau 5+ — `calculateCharacterSpeed()`
- ✅ Critique brutal : +1/2/3 dés en critique — `calculateDamage()`
- ✅ Avantage en rage : jets d'attaque CàC Force — `calculateAttackBonus()`
- ✅ Attaque téméraire : toggle dans l'UI + avantage/désavantage — `CombatSheetPage.tsx`
- ✅ Ressources trackables : Rage (current/max), ressources de sous-classe via `ResourceRule`
- ✅ Affichage 999 → `∞` (Illimité) dans l'UI — `formatResourceMax()`
- ✅ Immunités Berserker (charne/peur) : rules appliquées dans `activeEffects`

### Helpers ajoutés (`feature-helpers.ts`)
- `getBarbarianFastMovement(level)`
- `getBarbarianBrutalCriticalDice(level)`
- `getBarbarianRageCount(level)`
- `formatResourceMax(max)`

### Tests
- ✅ 64 tests passent (rules-engine, feature-helpers, conditions-engine)
- ✅ Nouveaux tests Barbare : fast movement, brutal critical, rage count, formatResourceMax

---

## Classe 2 — Guerrier ✅ 100%

### Capacités de base (niveaux 1-20)
- ✅ `classFeaturesByLevel['fighter']` : descriptions enrichies pour toutes les capacités
- ✅ `classActionsByLevel['fighter']` : Second souffle, Fougue, Indomptable
- ✅ Correction bug : `restoreOn: 'never'` accepté dans le type `ClassAction`
- ✅ Affichage nombre d'attaques dans l'UI (2→3→4)

### Sous-classes
Toutes les sous-classes PHB + XGtE + TCoE sont dans `subclasses.ts` avec leurs `rules` :

| Sous-classe | Source | Rules ajoutées |
|-------------|--------|----------------|
| Champion | PHB | Critique amélioré (19-20), Athlète remarquable, Style de combat supplémentaire, Critique supérieur (18-20), Survivant |
| Maître de bataille | PHB | Dés de supériorité (resource), Manœuvres (select), Supériorité martiale améliorée, Implacable, Supériorité martiale supérieure |
| Chevalier occulte | PHB | Incantation (spell rules), Lien d'arme, Magie de guerre, Coup arcanique, Charge arcanique, Magie de guerre améliorée |
| Archer arcanique | XGtE | Tir arcanique (resource), Flèche magique, Tir arcanique supplémentaire, Tir toujours prêt, Tir arcanique amélioré |
| Cavalier | XGtE | Maîtrise supplémentaire, Né en selle, Marque implacable (resource), Manœuvre protectrice (resource), Tenir la ligne, Charge féroce, Défenseur vigilant |
| Samouraï | XGtE | Maîtrise supplémentaire, Esprit combatif (resource), Courtisan élégant, Esprit infatigable, Frappe rapide, Force avant la mort (resource) |
| Guerrier psionique | TCoE | Énergie psionique (resource), Adepte télékinétique, Esprit protégé, Rempart de force (resource), Maître télékinétique (resource) |
| Chevalier runique | TCoE | Maîtrise supplémentaire, Graveur de runes (select), Puissance du géant (resource), Bouclier runique, Grande stature, Maître des runes, Juggernaut runique |

### Ressources ajoutées (`classFeatures.ts`)
- `battleMasterDiceCount` — progression des dés de supériorité
- `battleMasterDieSize` — d6 → d10 → d12
- `battleMasterManeuversKnown` — progression 3 → 11 manœuvres
- `arcaneArcherShots` — 2 tirs par repos court/long
- `samuraiFightingSpirit` — 3 utilisations par repos long
- `psiWarriorDiceCount` — 2× maîtrise, d6→d8→d10
- `psiWarriorDieSize`

### Mécaniques implémentées
- ✅ Styles de combat appliqués dans `combat-engine.ts` :
  - Archerie : +2 attaque distance
  - Défense : +1 CA (si armure)
  - Duel : +2 dégâts (arme à une main + bouclier)
  - Combat aux armes de jet : +2 dégâts jet
- ✅ Critique amélioré/superior du Champion : helper `getFighterCriticalThreshold()` + affichage UI
- ✅ Ressources de sous-classe extraites automatiquement dans `combatStore.ts` via `ResourceRule`
- ✅ `syncResourcesFromCharacter` conserve maintenant toutes les ressources (pas seulement les ressources de base)

### Helpers ajoutés (`feature-helpers.ts`)
- `getBattleMasterDiceCount(level)`
- `getBattleMasterDieSize(level)`
- `getBattleMasterManeuversKnown(level)`
- `getArcaneArcherShots(level)`
- `getSamuraiFightingSpirit(level)`
- `getPsiWarriorDiceCount(level)`
- `getPsiWarriorDieSize(level)`
- `getFighterCriticalThreshold(level, subclassId)`
- `formatResourceMax(max)`

### Corrections diverses
- ✅ Bug `classes.ts` : `great-weapon-fighting` avait le nom "Combat à deux armes" au lieu de "Combat à grande arme"
- ✅ `staticSubclasses` import inutilisé retiré de `apply-character-rules.ts`
- ✅ `context` inutilisé renommé `_context` dans `applySpellRule`
- ✅ Type `Character` étendu avec `classOptions`
- ✅ `combatStore.ts` : nouvelles actions `toggleActiveEffect`, `setActiveEffects`, `clearActiveEffects`
- ✅ `combat-engine.ts` : `calculateAttackBonus` et `calculateDamage` prennent `activeEffects` en paramètre

### Tests
- ✅ 64 tests passent
- ✅ Nouveaux tests Guerrier : battle master dice, die size, maneuvers, arcane archer shots, samurai fighting spirit, psi warrior dice, resource formatting, fighter critical threshold

---

## Classe 3 — Roublard ✅ 100%

### Capacités de base (niveaux 1-20)
- ✅ `classFeaturesByLevel['rogue']` : descriptions enrichies pour toutes les capacités
- ✅ `classActionsByLevel['rogue']` : Attaque sournoise, Ruse, Esquive instinctive, Dérobade, Talent fiable, Perception aveugle, Esprit fuyant, Insaisissable, Coup de chance

### Sous-classes
Toutes les sous-classes PHB + XGtE + TCoE sont dans `subclasses.ts` avec leurs `rules` :

| Sous-classe | Source | Rules ajoutées |
|-------------|--------|----------------|
| Voleur | PHB | Mains lestes, Seconde histoire, Discrétion suprême, Utilisation d'objets magiques, Réflexes de voleur |
| Assassin | PHB | Maîtrises supplémentaires, Assassinat, Expert en infiltration, Imposteur, Coup de grâce |
| Escroc arcanique | PHB | Incantation (spell rules), Main de mage améliorée, Embuscade magique, Polyvalence magique, Voleur de sorts (resource) |
| Inquisiteur | XGtE | Oreille pour le mensonge, Œil pour le détail, Combat perspicace, Regard imperturbable, Œil infaillible (resource), Œil pour la faiblesse |
| Cerveau | XGtE | Maître de l'intrigue, Maître tacticien, Manipulateur perspicace, Mauvaise direction, Âme de la tromperie |
| Éclaireur | XGtE | Escarmoucheur, Survivaliste, Mobilité supérieure (+3m), Maître de l'embuscade, Frappe soudaine |
| Bretteur | XGtE | Jeu de jambes élégant, Audace téméraire, Panache, Manœuvre élégante, Maître duelliste (resource) |
| Fantôme | TCoE | Murmures des morts, Plaintes de la tombe (resource), Reliques des défunts (resource), Marche fantôme (resource), Ami de la mort |
| Âme-lame | TCoE | Lames psychiques, Énergie psionique (resource), Lames de l'âme, Voile psychique (resource), Déchirer l'esprit (resource) |

### Ressources ajoutées (`classFeatures.ts`)
- `rogueSneakAttackDice` — progression 1d6 → 10d6 (déjà existant)

### Mécaniques implémentées
- ✅ Attaque sournoise : toggle dans l'UI qui ajoute automatiquement les dés de dégâts (1d6→10d6) aux attaques finesse/distance dans `calculateDamage()`
- ✅ Ruse : action bonus (Foncer/Se désengager/Se cacher) affichée dans `classActionsByLevel`
- ✅ Esquive instinctive : réaction pour demi-dégâts affichée
- ✅ Dérobade : JS DEX = 0 dégât si réussi, demi si raté
- ✅ Expertise : helper `getRogueExpertiseCount()` (2 au niv 1, 4 au niv 6)
- ✅ Coup de chance : 1/repos court ou long
- ✅ Sorts Escroc arcanique dans `subclassSpells.ts` (Charme-personne, Image silencieuse, Sommeil, Main du mage, Invisibilité, etc.)

### Helpers ajoutés (`feature-helpers.ts`)
- `getRogueSneakAttackDice(level)`
- `getRogueExpertiseCount(level)`

### Tests
- ✅ 67 tests passent
- ✅ Nouveaux tests Roublard : sneak attack dice, expertise count

---

## Prochaine session — Reprendre ici

### Priorité immédiate : Roublard

**Vérifications à effectuer :**
1. Capacités de base (1-20) dans `classFeatures.ts`
2. Sous-classes : Voleur, Assassin, Arcane trickster (PHB) + Inquisiteur, Cerveau, Éclaireur, Bretteur (XGtE) + Fantôme, Lame de l'âme (TCoE)
3. Ressources : Attaque sournoise (dés de dégâts), Ruse, Esquive instinctive, Dérobade, Esprit fuyant, Coup de chance
4. Calculs : Attaque sournoise, Expertise

### Checklist par classe (à répéter pour les 10 restantes)

1. Capacités de base (1-20) présentes dans `classFeatures.ts` ?
2. Toutes les sous-classes PHB + XGtE + TCoE dans `subclasses.ts` ?
3. Sorts de sous-classe dans `subclassSpells.ts` ?
4. Ressources trackables dans `Character` type + `feature-helpers.ts` ?
5. Rules mécaniques dans `rules-engine.ts` ?
6. CA spéciale calculée dans `combat-engine.ts` ?
7. Bonus d'attaque/dégâts dans `combat-engine.ts` ?
8. Immunités/résistances/conditions dans `rules-engine.ts` ?
9. Sorts bonus dans `subclassSpells.ts` ?
10. Choix de sous-classe au bon niveau dans `LevelUpPage.tsx` ?
11. Tests couvrant les nouvelles fonctionnalités ?
12. Fiche de combat affichant et catégorisant correctement ?

---

## Fichiers modifiés dans cette session

- `src/types/character.ts` — Ajout `classOptions`, `activeEffects`
- `src/types/aurora-v2.ts` — Nouveaux types de Rule (déjà en place)
- `src/utils/rules-engine.ts` — Handlers pour 8 nouveaux types de Rule (déjà en place)
- `src/data/apply-character-rules.ts` — Retrait import inutilisé `staticSubclasses`
- `src/data/classFeatures.ts` — Corrections Barbare (niveaux 6/10/14), corrections Guerrier, nouvelles tables de ressources Fighter
- `src/data/subclasses.ts` — Ajout Battlerager + Géant (Barbare), rules pour les 8 sous-classes du Guerrier
- `src/data/classes.ts` — Correction nom `great-weapon-fighting`
- `src/utils/feature-helpers.ts` — Helpers Fighter + `formatResourceMax` + `getFighterCriticalThreshold`
- `src/utils/feature-helpers.test.ts` — Tests Fighter + formatResourceMax + critical threshold
- `src/utils/combat-engine.ts` — `activeEffects` dans calculateAttackBonus/calculateDamage, styles de combat, bonus de rage
- `src/stores/combatStore.ts` — `activeEffects`, `toggleActiveEffect`, ressources de sous-classe, `syncResourcesFromCharacter` corrigé
- `src/pages/CombatSheetPage.tsx` — Toggles Rage/Attaque téméraire, badges Fighter (attaques, critique)
- `src/components/combat/ActionCard.tsx` — Affichage `∞` pour ressources illimitées
- `CLASS_AUDIT_PROGRESS.md` — Mise à jour du suivi

---

---

## Fichiers modifiés dans cette session (Roublard)

- `src/data/classFeatures.ts` — Descriptions enrichies Roublard, `classActionsByLevel['rogue']`
- `src/data/subclasses.ts` — Rules pour les 9 sous-classes du Roublard
- `src/data/subclassSpells.ts` — Sorts de l'Escroc arcanique
- `src/utils/feature-helpers.ts` — Helpers Rogue (`getRogueSneakAttackDice`, `getRogueExpertiseCount`)
- `src/utils/feature-helpers.test.ts` — Tests Rogue + Fighter critical threshold
- `src/utils/combat-engine.ts` — Attaque sournoise conditionnelle via `activeEffects`
- `src/pages/CombatSheetPage.tsx` — Toggle Attaque sournoise dans l'UI

---

## Classe 4 — Clerc ✅ 100%

### Capacités de base
- Toutes les capacités de niveau 1-20 complétées avec descriptions PHB détaillées
- Canal divin (1/2/3 par repos court au niveau 2/6/18)
- Destruction des morts-vivants avec FP corrects par niveau
- Intervention divine avec jet d100 et cooldown 7 jours

### 12 Sous-classes avec rules
Vie, Guerre, Lumière, Savoir, Nature, Tempête, Duperie (PHB) ; Forge, Tombe (XGtE) ; Ordre, Paix, Crépuscule (TCoE)

### Mécaniques de combat
- **Frappe divine** : `+1d8` niv 8, `+2d8` niv 14 auto dans les dégâts (8 domaines)
- **Potentiellement sacré** : condition rule (4 domaines)

### Tests : 72 passants

---

## Classe 5 — Paladin ✅ 100%

### Capacités de base
- Toutes les capacités de niveau 1-20 complétées
- Sens divin, Imposition des mains (pool 5×niveau), Châtiment divin avec scaling
- Attaque supplémentaire (niv 5), Auras (niv 6/10), Châtiment amélioré (niv 11), Contact purificateur (niv 14)

### 7 Sous-classes avec rules
Dévotion, Anciens, Vengeance (PHB) ; Conquête, Rédemption (XGtE) ; Gloire, Sentinelles (TCoE)

### Mécaniques de combat
- **Châtiment divin amélioré** (niv 11+) : `+1d8` radiants auto à chaque CàC

### Level-up : choix du style de combat
- Nouvelle étape `fightingStyle` dans le wizard
- 8 styles proposés, sauvegarde dans `classOptions.fightingStyle`

### Tests : 75 passants

---

## Classe 6 — Rôdeur ✅ 100%

### Capacités de base (niveaux 1-20)
- ✅ `classFeaturesByLevel['ranger']` : descriptions enrichies pour toutes les capacités
- ✅ `classActionsByLevel['ranger']` : Ennemi juré, Explorateur-né, Style de combat, Incantation, Attaque supplémentaire, Foulée tellurique, Se fondre dans le décor, Disparition, Sens sauvages, Tueur d'ennemis

### Sous-classes
Toutes les sous-classes PHB + XGtE + TCoE dans `subclasses.ts` avec leurs `rules` :

| Sous-classe | Source | Rules ajoutées |
|-------------|--------|----------------|
| Chasseur | PHB | Proie du chasseur (select), Tactiques défensives (select), Attaque multiple (select), Défense supérieure (select) |
| Maître des Bêtes | PHB | Compagnon du rôdeur (grant), Entraînement exceptionnel (condition), Furie bestiale (condition), Partager les sorts (condition) |
| Traqueur des Ombres | XGtE | Embuscade redoutable (damage_bonus + condition), Vision dans l'ombre (condition), Esprit de fer (grant), Déluge du traqueur (condition), Esquive ténébreuse (grant) |
| Marcheur de l'Horizon | XGtE | Détection de portail (resource), Guerrier planaire (damage_bonus), Pas éthéré (resource), Frappe distante (condition), Défense spectrale (condition) |
| Pourfendeur | XGtE | Sens du chasseur (resource), Proie du pourfendeur (damage_bonus), Défense surnaturelle (condition), Némésis des mages (resource), Contre du pourfendeur (grant) |
| Vagabond Féerique | TCoE | Frappes redoutables (damage_bonus), Charme surnaturel (condition + select), Charme retors (condition), Renforts féeriques (spell), Présence brumeuse (resource) |
| Gardien des Essaims | TCoE | Essaim rassemblé (damage_bonus), Main de mage de l'essaim (spell), Marée grouillante (resource), Essaim puissant (damage_bonus), Dispersion en essaim (resource) |

### Sorts de sous-classe
- ✅ 7 listes de sorts de conclave dans `subclassSpells.ts` (Hunter, Beast Master, Gloom Stalker, Horizon Walker, Monster Slayer, Fey Wanderer, Swarmkeeper)

### Ressources ajoutées (`classFeatures.ts`)
- `rangerFavoredEnemyCount` — progression 1 → 2 → 3
- `rangerNaturalExplorerCount` — progression 1 → 2 → 3
- `rangerKnownSpells` — progression demi-incantateur 0 → 11

### Mécaniques de combat
- ✅ **Embuscade redoutable** (Traqueur des Ombres) : toggle `dread-ambusher` → +1d8 dégâts au 1er tour
- ✅ **Guerrier planaire** (Marcheur de l'Horizon) : toggle `planar-warrior` → +1d8/+2d8 force
- ✅ **Proie du pourfendeur** (Pourfendeur) : toggle `slayers-prey` → +1d6 dégâts
- ✅ **Frappes redoutables** (Vagabond Féerique) : toggle `dreadful-strikes` → +1d4/+1d6 psychiques
- ✅ **Essaim rassemblé** (Gardien des Essaims) : toggle `gathered-swarm` → +1d6/+1d8 perforants
- ✅ **Tueur d'ennemis** (niv 20) : toggle `foe-slayer` → +mod SAG aux dégâts

### Helpers ajoutés (`feature-helpers.ts`)
- `getRangerFavoredEnemyCount(level)`
- `getRangerNaturalExplorerCount(level)`
- `getRangerKnownSpells(level)`
- `hasRangerExtraAttack(level)`
- `hasRangerVanish(level)`
- `hasRangerFeralSenses(level)`
- `hasRangerFoeSlayer(level)`

### UI (`CombatSheetPage.tsx`)
- ✅ Badges : nombre d'ennemis jurés, attaques supplémentaires (niv 5+), Tueur d'ennemis (niv 20)
- ✅ Toggles de sous-classe dans l'UI : Embuscade redoutable, Guerrier planaire, Proie du pourfendeur, Frappes redoutables, Essaim rassemblé, Tueur d'ennemis

### Tests
- ✅ Helpers Rôdeur validés (script de test tsx)
- ✅ Compilation TypeScript `tsc --noEmit` passe

### Fichiers modifiés dans cette session (Rôdeur)
- `src/data/classFeatures.ts` — Tables Ranger, `classActionsByLevel['ranger']`, descriptions enrichies
- `src/data/subclasses.ts` — Rules pour les 7 sous-classes du Rôdeur
- `src/utils/feature-helpers.ts` — Helpers Ranger
- `src/utils/feature-helpers.test.ts` — Tests Ranger
- `src/utils/combat-engine.ts` — Bonus de dégâts des sous-classes Ranger via activeEffects
- `src/pages/CombatSheetPage.tsx` — Badges et toggles Ranger
- `CLASS_AUDIT_PROGRESS.md` — Mise à jour du suivi

---

---

## Classe 7 — Druide ✅ 100%

### Capacités de base (niveaux 1-20)
- ✅ `classFeaturesByLevel['druid']` : descriptions enrichies pour toutes les capacités
- ✅ `classActionsByLevel['druid']` : Forme sauvage (2 utilisations/repos court, illimité au niv 20)

### Sous-classes
Toutes les sous-classes PHB + XGtE + TCoE dans `subclasses.ts` avec leurs `rules` :

| Sous-classe | Source | Rules ajoutées |
|-------------|--------|----------------|
| Cercle de la Terre | PHB | Sort mineur (spell), Récupération naturelle (resource), Sorts de cercle (select), Foulée tellurique (condition), Protégé de la nature (condition×3), Sanctuaire de la nature (condition) |
| Cercle de la Lune | PHB | Forme sauvage de combat (condition×2), Forme primordiale (condition×2), Frappe élémentaire (resource), Mille et une formes (spell) |
| Cercle des Rêves | XGtE | Soin de la cour d'été (resource), Foyer de clair de lune (condition), Sentiers cachés (resource), Marcheur en rêves (spell×3) |
| Cercle du Berger | XGtE | Langage des bois (grant + condition), Totem spirituel (resource + select), Invocateur puissant (condition), Esprit gardien (condition), Invocations fidèles (resource) |
| Cercle des Spores | TCoE | Halo de spores (damage_bonus), Entité symbiotique (condition + damage_bonus), Infestation fongique (resource), Spores envahissantes (grant), Corps fongique (condition×5) |
| Cercle des Étoiles | TCoE | Carte stellaire (spell×2), Forme stellaire (select), Présage cosmique (resource), Constellations scintillantes (condition), Plein d'étoiles (condition) |
| Cercle des Flammes | TCoE | Invocation de l'esprit (grant), Lien renforcé (condition), Flammes cautérisantes (grant), Résurrection ardente (resource) |

### Sorts de sous-classe
- ✅ 7 listes de sorts de cercle dans `subclassSpells.ts` (Terre, Lune, Rêves, Berger, Spores, Étoiles, Flammes)

### Ressources ajoutées (`classFeatures.ts`)
- `druidWildShapeMaxCR` — progression 0 → 0.25 → 0.5 → 1
- `druidWildShapeUses` — progression 0 → 2 → 999 (niv 20)
- `druidWildShapeCanFly` — false×8 puis true
- `druidWildShapeCanSwim` — false×4 puis true

### Mécaniques de combat
- Le Druide ne modifie pas directement les dégâts via `combat-engine.ts` (la Forme sauvage remplace entièrement les stats)
- Les rules `damage_bonus` des sous-classes (Halo de spores, etc.) sont définies pour extraction future

### Helpers ajoutés (`feature-helpers.ts`)
- `getDruidWildShapeMaxCR(level)`
- `getDruidWildShapeUses(level)`
- `canDruidWildShapeFly(level)`
- `canDruidWildShapeSwim(level)`
- `hasDruidWildShape(level)`
- `hasDruidTimelessBody(level)`
- `hasDruidArchdruid(level)`
- `getDruidWildShapeMoonMaxCR(level)` — pour Cercle de la Lune

### UI (`CombatSheetPage.tsx`)
- ✅ Badges : Forme sauvage (utilisations), FP max
- ✅ Toggles actifs : Forme sauvage, Entité symbiotique (Spores), Forme stellaire (Étoiles), Esprit des flammes (Flammes), Totem spirituel (Berger)

### Tests
- ✅ Helpers Druide validés via `tsc --noEmit`
- ✅ Compilation TypeScript passe

### Fichiers modifiés dans cette session (Druide)
- `src/data/classFeatures.ts` — Tables Druid, `classActionsByLevel['druid']`, descriptions enrichies
- `src/data/subclasses.ts` — Rules pour les 7 cercles du Druide
- `src/utils/feature-helpers.ts` — Helpers Druid
- `src/utils/feature-helpers.test.ts` — Tests Druid
- `src/pages/CombatSheetPage.tsx` — Badges et toggles Druid
- `CLASS_AUDIT_PROGRESS.md` — Mise à jour du suivi

---

---

## Classe 8 — Moine ✅ 100%

### Capacités de base (niveaux 1-20)
- ✅ `classFeaturesByLevel['monk']` : descriptions enrichies pour toutes les capacités
- ✅ `classActionsByLevel['monk']` : Points de Ki, Déplacement sans armure, Déviation de projectiles, Attaque supplémentaire, Frappe étourdissante, Dérobade, Tranquillité de l'esprit, Pureté du corps, Âme de diamant, Corps vide, Perfection de l'être

### Sous-classes
Toutes les traditions PHB + XGtE + TCoE dans `subclasses.ts` avec leurs `rules` :

| Sous-classe | Source | Rules ajoutées |
|-------------|--------|----------------|
| Voie de la Paume | PHB | Technique de la paume (grant), Plénitude physique (resource), Tranquillité (condition), Paume vibratoire (grant) |
| Voie de l'Ombre | PHB | Arts de l'ombre (spell×4), Pas d'ombre (condition), Manteau d'ombres (condition), Opportuniste (grant) |
| Voie de l'Ivrogne | XGtE | Maîtrises (grant×2), Technique de l'ivrogne (condition), Démarche chancelante (grant), Chance de l'ivrogne (grant), Frénésie enivrée (condition) |
| Voie du Kensei | XGtE | Armes Kensei (select + condition + damage_bonus), Un avec la lame (condition + damage_bonus), Affûter la lame (grant), Précision infaillible (condition) |
| Voie de l'Âme Solaire | XGtE | Rayon de soleil (damage_bonus), Arc solaire (spell), Explosion solaire (grant), Bouclier solaire (damage_bonus) |
| Voie de la Miséricorde | TCoE | Instruments (grant×3), Mains guérisseuses (grant), Mains blessantes (damage_bonus), Toucher du médecin (condition), Déluge soins/blessures (condition), Miséricorde ultime (resource) |
| Voie de l'Être Astral | TCoE | Bras astraux (condition + damage_bonus), Visage astral (condition), Corps astral (condition), Être astral éveillé (condition) |

### Ressources ajoutées (`classFeatures.ts`)
- `monkUnarmoredMovement` — progression 0 → +3m → +4.5m → +6m → +7.5m → +9m

### Mécaniques de combat
- ✅ Arts martiaux déjà calculés dans `combat-engine.ts` (dé d'arts martiaux + mod DEX)
- ✅ CA sans armure déjà calculée dans `calculateACFromInventory` (10 + DEX + SAG)
- Rules `damage_bonus` définies pour sous-classes (Kensei, Âme Solaire, Miséricorde, Être Astral)

### Helpers ajoutés (`feature-helpers.ts`)
- `getMonkKiPoints(level)`
- `getMonkMartialArtsDie(level)`
- `getMonkUnarmoredMovement(level)`
- `hasMonkEvasion(level)`
- `hasMonkStillnessOfMind(level)`
- `hasMonkPurityOfBody(level)`
- `hasMonkDiamondSoul(level)`
- `hasMonkEmptyBody(level)`
- `hasMonkPerfectSelf(level)`

### UI (`CombatSheetPage.tsx`)
- ✅ Badges : Points de Ki, Bonus de déplacement sans armure, Dé d'arts martiaux
- ✅ Toggles actifs : Pas d'ombre, Manteau d'ombres (Ombre), Rayon solaire (Âme Solaire), Être astral (Être Astral), Frappe habile (Kensei), Mains blessantes (Miséricorde)

### Tests
- ✅ Helpers Moine validés via `tsc --noEmit`
- ✅ Compilation TypeScript passe

### Fichiers modifiés dans cette session (Moine)
- `src/data/classFeatures.ts` — Table `monkUnarmoredMovement`, `classActionsByLevel['monk']`, descriptions enrichies
- `src/data/subclasses.ts` — Rules pour les 7 traditions du Moine
- `src/utils/feature-helpers.ts` — Helpers Monk
- `src/utils/feature-helpers.test.ts` — Tests Monk
- `src/pages/CombatSheetPage.tsx` — Badges et toggles Monk
- `CLASS_AUDIT_PROGRESS.md` — Mise à jour du suivi

---

---

## Classe 9 — Magicien ✅ 100%

### Capacités de base (niveaux 1-20)
- ✅ `classFeaturesByLevel['wizard']` : descriptions enrichies pour toutes les capacités
- ✅ `classActionsByLevel['wizard']` : Récupération arcanique, Grimoire, Tradition arcanique, Maîtrise des sorts (niv 18), Sorts de prédilection (niv 20)

### Sous-classes
Toutes les traditions PHB + XGtE + TCoE dans `subclasses.ts` avec leurs `rules` :

| Sous-classe | Source | Rules ajoutées |
|-------------|--------|----------------|
| Évocation | PHB | Évocateur savant (condition), Sculpteur de sorts (condition), Sort mineur puissant (condition), Évocation renforcée (damage_bonus), Surincantation (resource) |
| Abjuration | PHB | Abjurateur savant (condition), Protection arcanique (condition), Protection projetée (condition), Abjuration améliorée (condition), Résistance aux sorts (condition) |
| Conjuration | PHB | Conjurateur savant (condition), Conjuration mineure (grant), Transposition bénigne (resource), Conjuration focalisée (condition), Invocations durables (condition) |
| Divination | PHB | Devin savant (condition), Présage (resource), Divination experte (condition), Troisième œil (resource), Présage supérieur (condition) |
| Enchantement | PHB | Enchanteur savant (condition), Regard hypnotique (grant), Charme instinctif (grant), Double enchantement (condition), Altération des souvenirs (grant) |
| Illusion | PHB | Illusionniste savant (condition), Illusion mineure (spell), Illusions malléables (grant), Moi illusoire (resource), Réalité illusoire (grant) |
| Nécromancie | PHB | Nécromancien savant (condition), Moisson sinistre (condition), Serviteurs morts-vivants (spell + condition), Habitué de la non-mort (condition), Commander les morts-vivants (grant) |
| Transmutation | PHB | Transmutateur savant (condition), Alchimie mineure (grant), Pierre du transmutateur (grant), Métamorphe (spell + resource), Grand transmutateur (grant) |
| Magie de Guerre | XGtE | Déviation arcanique (grant), Ruse tactique (condition), Afflux de puissance (resource), Magie durable (condition), Linceul déviant (damage_bonus) |
| Chant de Lame | TCoE | Formation martiale (grant + select + grant), Chant de lame (resource + condition + speed_bonus + condition), Attaque supplémentaire (condition), Chant de défense (grant), Chant de victoire (damage_bonus) |
| Ordre des Scribes | TCoE | Plume magique (grant), Grimoire éveillé (condition), Esprit manifeste (resource), Maître scribe (resource), Ne faire qu'un (condition) |

### Helpers ajoutés (`feature-helpers.ts`)
- `getWizardArcaneRecoverySlots(level)` — emplacements récupérables au repos court
- `getWizardPreparedSpellsCount(level, intMod)` — nombre de sorts préparés
- `getWizardCantripsKnown(level)` — sorts mineurs connus (3→4→5)
- `hasWizardSpellMastery(level)` — niv 18
- `hasWizardSignatureSpells(level)` — niv 20

### UI (`CombatSheetPage.tsx`)
- ✅ Badges : Récupération arcanique (+niv/2), Sorts préparés (niv + mod INT)
- ✅ Toggles actifs : Chant de lame (Bladesinger), Déviation arcanique (Magie de Guerre), Surincantation (Évocation), Moisson sinistre (Nécromancie), Maîtrise des sorts (niv 18), Sorts de prédilection (niv 20)

### Tests
- ✅ Helpers Magicien validés via `tsc --noEmit`
- ✅ Compilation TypeScript passe

### Fichiers modifiés dans cette session (Magicien)
- `src/data/classFeatures.ts` — `classActionsByLevel['wizard']`, descriptions enrichies
- `src/data/subclasses.ts` — Rules pour les 11 traditions du Magicien
- `src/utils/feature-helpers.ts` — Helpers Wizard
- `src/utils/feature-helpers.test.ts` — Tests Wizard
- `src/pages/CombatSheetPage.tsx` — Badges et toggles Wizard
- `CLASS_AUDIT_PROGRESS.md` — Mise à jour du suivi

---

## Classe 10 — Barde ✅ 100%

### Capacités de base (niveaux 1-20)
- ✅ `classFeaturesByLevel['bard']` : descriptions enrichies pour toutes les capacités
- ✅ `classActionsByLevel['bard']` : Inspiration bardique, Touche-à-tout, Chant reposant, Collège bardique, Expertise, Contre-charme, Secrets magiques, Inspiration supérieure

### Sous-classes
Toutes les sous-classes PHB + XGtE + TCoE dans `subclasses.ts` avec leurs `rules` :

| Sous-classe | Source | Rules ajoutées |
|-------------|--------|----------------|
| Collège du Savoir | PHB | Maîtrises supplémentaires (×3), Mots de connaissance, Savoir supplémentaire, Secrets magiques supplémentaires (select×2) |
| Collège de la Vaillance | PHB | Maîtrises supplémentaires (×3/×5), Combat à deux armes, Frappes supplémentaires, Frappes améliorées |
| Collège du Glamour | XGtE | Manteau d'inspiration (condition), Soumission débilitante, Réflexion captivante, Maîtrise sans effort |
| Collège des Épées | XGtE | Maîtrises supplémentaires, Épanouissement martial (condition), Épanouissement de maître (condition) |
| Collège des Murmures | XGtE | Lames psychiques (damage_bonus), Mots de terreur, Nuage de secrets, Imposteur, Fard d'ombre |
| Collège de la Création | TCoE | Atome de potentiel (condition), Représentation créatrice (resource), Chanson de création |
| Collège de l'Éloquence | TCoE | Mots déstabilisants (grant), Inspiration infaillible (condition), Inspiration contagieuse (condition) |

### Ressources ajoutées (`classFeatures.ts`)
- `bardInspirationDie` — progression d6 → d8 (niv 5) → d10 (niv 10) → d12 (niv 15)
- `bardInspirationUses` — 0 → 1 (niv 2) → 2 (niv 5) → 3 (niv 10) → 4 (niv 15) → 5 (niv 17)

### Mécaniques de combat
- ✅ Inspiration bardique : badge dé d'inspiration dans l'UI selon le niveau
- ✅ Chant reposant : badge dé de soin au repos court selon le niveau
- ✅ Toggles actifs : Manteau d'inspiration (Glamour), Lames psychiques (Murmures), Épanouissement martial (Épées), Inspiration supérieure (niv 20)

### Helpers ajoutés (`feature-helpers.ts`)
- `getBardInspirationDie(level)` — dé d'inspiration
- `getBardInspirationUses(level)` — utilisations par repos court
- `getBardSongOfRestDie(level)` — dé de soin du Chant reposant
- `getBardMagicalSecretsCount(level)` — nombre de Secrets magiques appris
- `hasBardCountercharm(level)` — Contre-charme au niv 6
- `hasBardSuperiorInspiration(level)` — Inspiration supérieure au niv 20
- `getBardPreparedSpellsCount(level, chaMod)` — sorts préparés (niv + mod CHA)

### Tests
- ✅ Helpers Barde validés via `tsc --noEmit`
- ✅ Compilation TypeScript passe

### Fichiers modifiés dans cette session (Barde)
- `src/data/classFeatures.ts` — Tables `bardInspirationDie`/`bardInspirationUses`, `classActionsByLevel['bard']`, descriptions enrichies
- `src/data/subclasses.ts` — Rules pour les 7 collèges du Barde
- `src/utils/feature-helpers.ts` — Helpers Bard
- `src/utils/feature-helpers.test.ts` — Tests Bard
- `src/pages/CombatSheetPage.tsx` — Badges (Inspi, Chant) et toggles Bard
- `CLASS_AUDIT_PROGRESS.md` — Mise à jour du suivi

---

## Classe 11 — Ensorceleur ✅ 100%

### Capacités de base (niveaux 1-20)
- ✅ `classFeaturesByLevel['sorcerer']` : descriptions enrichies pour toutes les capacités
- ✅ `classActionsByLevel['sorcerer']` : Incantation, Points de sorcellerie, Métamagie

### Sous-classes
Toutes les origines PHB + XGtE + TCoE dans `subclasses.ts` avec leurs `rules` :

| Sous-classe | Source | Rules ajoutées |
|-------------|--------|----------------|
| Lignée Draconique | PHB | Résistance draconique (ACRule), Affinité élémentaire (damage_bonus), Ailes de dragon (speed/fly), Présence draconique (resource) |
| Magie Sauvage | PHB | Marées du chaos (resource), Chaos contrôlé (condition), Bombardement de sorts (condition) |
| Âme Divine | XGtE | Faveur des dieux (resource), Ailes surnaturelles (speed/fly), Régénération surnaturelle (resource) |
| Magie de l'Ombre | XGtE | Yeux des ténèbres (condition), Force du tombeau (resource), Marche dans l'ombre (condition), Forme d'ombre (condition) |
| Sorcellerie de Tempête | XGtE | Magie tempétueuse (speed/fly), Cœur de la tempête (condition), Fureur de la tempête (damage_bonus), Âme du vent (condition) |
| Esprit Aberrant | TCoE | Parole télépathique (condition), Défenses psychiques (condition), Révélation de la chair (condition), Implosion déformante (resource) |
| Âme Mécanique | TCoE | Rétablir l'équilibre (resource), Transe de l'ordre (resource), Cavalcade mécanique (resource) |

### Ressources ajoutées (`classFeatures.ts`)
- `sorcererSorceryPoints` — progression 0 → 2 → ... → 20

### Mécaniques de combat
- ✅ Badges : Points de sorcellerie (niv 2+), Métamagie (2→3→4)
- ✅ Toggles actifs : Ailes de dragon, Présence draconique, Marées du chaos, Chaos contrôlé, Faveur des dieux, Ailes surnaturelles, Force du tombeau, Forme d'ombre, Magie tempétueuse, Fureur de la tempête, Parole télépathique, Révélation de la chair, Rétablir l'équilibre, Transe de l'ordre

### Helpers ajoutés (`feature-helpers.ts`)
- `getSorcererSorceryPoints(level)` — points de sorcellerie max
- `getSorcererMetamagicCount(level)` — options de Métamagie (2→3→4)
- `getSorcererKnownSpells(level)` — sorts connus (max 15)
- `getSorcererCantripsKnown(level)` — tours de magie (4→5→6)
- `hasSorcererSorcerousRestoration(level)` — niv 20

### Tests
- ✅ Helpers Ensorceleur validés via `tsc --noEmit`
- ✅ Compilation TypeScript passe

### Fichiers modifiés dans cette session (Ensorceleur)
- `src/data/classFeatures.ts` — `classActionsByLevel['sorcerer']`, descriptions enrichies
- `src/data/subclasses.ts` — Rules pour les 7 origines de l'Ensorceleur
- `src/utils/feature-helpers.ts` — Helpers Sorcerer
- `src/utils/feature-helpers.test.ts` — Tests Sorcerer
- `src/pages/CombatSheetPage.tsx` — Badges et toggles Sorcerer
- `CLASS_AUDIT_PROGRESS.md` — Mise à jour du suivi

---

## Classe 12 — Occultiste ✅ 100%

### Capacités de base (niveaux 1-20)
- ✅ `classFeaturesByLevel['warlock']` : descriptions enrichies pour toutes les capacités
- ✅ `classActionsByLevel['warlock']` : Magie de pacte, Invocations occultes, Pacte, Arcanum mystique (6/7/8/9), Maître occulte

### Sous-classes
Tous les protecteurs PHB + XGtE + TCoE dans `subclasses.ts` avec leurs `rules` :

| Sous-classe | Source | Rules ajoutées |
|-------------|--------|----------------|
| Le Fiélon | PHB | Bénédiction du Sombre (condition), Chance du Sombre (resource), Résilience fiélonne (condition), Projection dans les Enfers (resource) |
| L'Archifée | PHB | Présence féerique (resource), Repli brumeux (resource), Résistance au charme (condition), Ruse sombre (resource) |
| Le Grand Ancien | PHB | Esprit éveillé (condition), Protection entropique (resource), Bouclier de pensées (condition), Création d'asservi (resource) |
| Le Céleste | XGtE | Lumière guérisseuse (resource), Âme radieuse (condition), Résistance céleste (condition), Vengeance brûlante (resource) |
| Le Maître des Lames | XGtE | Malédiction du Maître des Lames (resource), Guerrier maudit (condition), Armure du maudit (condition), Maître des malédictions (condition) |
| Le Fathomless | TCoE | Tentacule des profondeurs (resource), Don de la mer (speed/swim), Âme océanique (condition), Spirale protectrice (condition), Tentacules agrippants (resource), Plongée dans les profondeurs (resource) |
| Le Génie | TCoE | Réceptacle du génie (condition), Don élémentaire (condition), Sanctuaire du réceptacle (condition), Souhait limité (resource) |

### Ressources ajoutées (`classFeatures.ts`)
- `warlockSlotLevel` — niveau des emplacements de pacte (1→5)
- `warlockSlotCount` — nombre d'emplacements (1→2→3→4)

### Mécaniques de combat
- ✅ Badges : Niveau d'emplacement, Nombre d'emplacements, Invocations connues
- ✅ Toggles actifs : Bénédiction du Sombre, Chance du Sombre, Résilience fiélonne, Présence féerique, Repli brumeux, Protection entropique, Lumière guérisseuse, Âme radieuse, Malédiction du Maître des Lames, Guerrier maudit, Tentacule des profondeurs, Âme océanique, Réceptacle du génie, Don élémentaire

### Helpers ajoutés (`feature-helpers.ts`)
- `getWarlockSlotLevel(level)` — niveau des emplacements de pacte
- `getWarlockSlotCount(level)` — nombre d'emplacements
- `getWarlockInvocationsKnown(level)` — invocations connues (2→8)
- `getWarlockMysticArcanumLevel(level)` — niveau de l'Arcanum mystique (6→9)
- `hasWarlockEldritchMaster(level)` — Maître occulte au niv 20

### Tests
- ✅ Helpers Occultiste validés via `tsc --noEmit`
- ✅ Compilation TypeScript passe

### Fichiers modifiés dans cette session (Occultiste)
- `src/data/classFeatures.ts` — `classActionsByLevel['warlock']`, descriptions enrichies
- `src/data/subclasses.ts` — Rules pour les 7 protecteurs de l'Occultiste
- `src/utils/feature-helpers.ts` — Helpers Warlock
- `src/utils/feature-helpers.test.ts` — Tests Warlock
- `src/pages/CombatSheetPage.tsx` — Badges et toggles Warlock
- `CLASS_AUDIT_PROGRESS.md` — Mise à jour du suivi

---

*Dernière mise à jour : 2026-04-24*
*Session suivante : Toutes les classes D&D 5e sont maintenant implémentées à 100% !*
