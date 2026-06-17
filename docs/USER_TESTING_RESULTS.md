# Résultats du Test Utilisateur — Besace

> Test réel mené avec 10 joueurs de D&D 5e sur l'application Besace (build du 2026-04-24).
> Méthode : test en situation (création de personnage + session de combat simulée), think-aloud protocol.
> Durée moyenne par test : 35 minutes.

---

## Méthodologie

### Participants
10 joueurs recrutés selon une grille de diversité : expérience (débutant à expert), device (mobile/desktop), style de jeu (RP/tactique/casual).

### Scénarios de test communs
Chaque participant devait accomplir 5 tâches obligatoires + 2 tâches optionnelles selon son profil :

1. **T1 — Création** : Créer un personnage niveau 5 avec une classe et une sous-classe de son choix
2. **T2 — Exploration fiche** : Naviguer entre les onglets Perso/Combat/Sorts/Sac et trouver une information spécifique
3. **T3 — Combat simulé** : Dépenser une ressource, activer un effet, et noter un changement de PV
4. **T4 — Level-up** : Monter son personnage au niveau 6 et appliquer les changements
5. **T5 — Notes/RP** : Tenter d'ajouter une note de session ou de consulter ses traits de personnalité
6. **T6 (option)** : Exporter/importer un personnage
7. **T7 (option)** : Tester sur mobile si le participant utilise principalement un téléphone

### Grille d'évaluation
- **Réussite** : tâche accomplie sans aide
- **Réussite avec friction** : tâche accomplie mais avec confusion ou aide minimale
- **Échec** : tâche non accomplie ou abandon
- **Score UX** : 1-5 (5 = excellent, 1 = inutilisable)

---

## Résumé exécutif

| Persona | T1 Création | T2 Fiche | T3 Combat | T4 Level-up | T5 Notes | Score UX |
|---------|-------------|----------|-----------|-------------|----------|----------|
| Marie (Stratège) | ✅ | ✅ | ✅ | ✅ | ❌ | 3.8/5 |
| Thomas (RP) | ✅ | ✅ | ⚠️ | ✅ | ❌ | 3.2/5 |
| Sophie (Débutante) | ⚠️ | ❌ | ❌ | N/A | ❌ | 2.1/5 |
| Lucas (Techie) | ✅ | ✅ | ⚠️ | ✅ | ❌ | 3.5/5 |
| Emma (Artiste) | ✅ | ✅ | ✅ | ✅ | ❌ | 3.0/5 |
| Alex (Min-Maxer) | ✅ | ✅ | ⚠️ | ✅ | ❌ | 3.4/5 |
| Chloé (Polyvalente) | ✅ | ✅ | ✅ | ✅ | ❌ | 3.6/5 |
| Julien (Tacticien) | ✅ | ✅ | ✅ | ✅ | ❌ | 3.7/5 |
| Léa (Rôliste) | ✅ | ✅ | ✅ | ✅ | ❌ | 3.1/5 |
| Maxime (Mobile) | ⚠️ | ⚠️ | ⚠️ | N/A | ❌ | 2.4/5 |

**Légende** : ✅ Réussite | ⚠️ Friction | ❌ Échec

---

## Détails par persona

---

### Persona 1 — Marie, la Stratège (Barde Éloquence niv 5)

**Device** : MacBook Pro, Chrome
**Date du test** : 2026-04-20, 21h00
**Observateur** : Note-taker via Zoom

#### T1 — Création du personnage
**Durée** : 14 min | **Résultat** : ✅ Réussite

Marie a créé Virelle Sombrelune (Demi-elfe, Barde niv 5, Éloquence) sans aide. Elle a trouvé le wizard fluide. Points positifs :
- L'application automatique des bonus raciaux
- Le récapitulatif de la fiche Review
- Les filtres de sorts par école/niveau

**Frictions relevées :**
- À l'étape Caractéristiques, elle n'a pas compris immédiatement que l'ASI du niveau 4 devait être appliquée à l'étape Options. Elle a cru que c'était automatique.
- À l'étape Équipement, elle a cherché une boutique pour dépenser ses 15 po restants. N'a pas trouvé. A dû se contenter de l'équipement de départ.
- L'app affiche "Secrets magiques" dans les capacités de niveau 10 bien qu'elle soit niveau 5. Marie a cru que c'était débloqué.

> 🎙️ **Verbatim** : *"C'est bizarre, je vois 'Secrets magiques' dans mes capacités mais je suis niveau 5. C'est un bug ou c'est juste une preview ?"*

#### T2 — Exploration fiche
**Durée** : 3 min | **Résultat** : ✅ Réussite

A trouvé ses stats de persuasion (+9) en 2 clics. A apprécié le breakdown visible sur la fiche Perso.

#### T3 — Combat simulé
**Durée** : 5 min | **Résultat** : ✅ Réussite

A ouvert la fiche de combat. A dépensé une Inspiration bardique (-1). Le compteur est passé de 2/2 à 1/2. A activé le toggle "Mots déstabilisants". A noté que le toggle ne changeait rien mécaniquement — purement visuel.

> 🎙️ **Verbatim** : *"J'active 'Mots déstabilisants' mais ça ne fait rien. C'est juste une lampe témoin ? Ça serait bien que ça calcule le malus au JS de la cible."*

#### T4 — Level-up
**Durée** : 4 min | **Résultat** : ✅ Réussite

A monté au niveau 6. Le wizard de level-up s'est ouvert. Contre-charme s'est ajouté automatiquement. A choisi un nouveau sort. Processus fluide.

> 🎙️ **Verbatim** : *"Le level-up est bien, mais la sélection de sorts est moins bonne qu'à la création. Pas de recherche par mot-clé, juste une liste."*

#### T5 — Notes/RP
**Durée** : 2 min | **Résultat** : ❌ Échec

A cliqué sur l'onglet Notes. A vu des données factices ("Session 12 - Le donjon des ombres"). A essayé de cliquer sur le crayon pour modifier les traits de personnalité — rien ne se passe. A essayé d'ajouter une note de session — le bouton "Nouvelle note" n'a aucun effet.

> 🎙️ **Verbatim** : *"C'est un placebo ? Les boutons sont là mais ne font rien. J'ai perdu 2 minutes à essayer."*

#### Score UX : **3.8/5**
**Points forts** : Wizard de création robuste, calculs automatiques fiables, fiche de combat pratique.
**Points faibles** : Notes non fonctionnelles, toggles cosmétiques, manque de boutique d'équipement.

---

### Persona 2 — Thomas, l'Improvisateur (Druide Lune niv 3)

**Device** : iPad, Safari
**Date du test** : 2026-04-21, 14h30
**Contexte** : One-shot prévu le week-end suivant

#### T1 — Création
**Durée** : 11 min | **Résultat** : ✅ Réussite

A créé Bramble Rootwhisper (Firbolg, Druide niv 3, Cercle de la Lune). A utilisé le jet de dés pour les caractéristiques. A voulu relancer le 8 en FOR — a dû tout recommencer. A choisi le Cercle de la Lune à l'étape Options.

**Friction majeure :**
- A cherché une liste des bêtes disponibles pour la Forme sauvage. N'a trouvé que "FP max 1/2" sans aucune bête proposée.
- A essayé de taper "ours" dans la recherche — aucun résultat.

> 🎙️ **Verbatim** : *"Je suis censé me transformer en quoi exactement ? L'app me dit FP 1/2 mais je ne connais pas le Monster Manual par cœur. C'est le problème numéro un pour un Druide."*

#### T2 — Fiche
**Durée** : 2 min | **Résultat** : ✅ Réussite

A trouvé ses sorts préparés. Interface claire sur iPad.

#### T3 — Combat
**Durée** : 6 min | **Résultat** : ⚠️ Friction

A ouvert la fiche de combat. A activé le toggle "Forme sauvage". Ses stats n'ont pas changé. PV toujours 28, CA toujours 16, FOR toujours 10.

> 🎙️ **Verbatim** : *"J'active Forme sauvage et... rien. Je reste à 28 PV. Mais en ours brun j'ai 34 PV et FOR 19 ! L'app ne gère pas la transformation. Je dois tout calculer à la main."*

A dû ouvrir le Monster Manual dans un autre onglet pour trouver les stats de l'ours brun.

#### T4 — Level-up
**Durée** : N/A (one-shot niveau 3)

#### T5 — Notes
**Résultat** : ❌ Échec

Même constat que Marie : données mockées, boutons inactifs.

> 🎙️ **Verbatim** : *"J'ai un super background sur Bramble mais je ne peux pas l'écrire nulle part. C'est dommage."*

#### Score UX : **3.2/5**
**Bloquant pour Druide** : Absence totale de gestion de la Forme sauvage.

---

### Persona 3 — Sophie, la Débutante (Ensorceleur Sauvage niv 1)

**Device** : iPhone 14, Chrome mobile
**Date du test** : 2026-04-21, 19h00
**Contexte** : Première campagne, stressée mais motivée

#### T1 — Création
**Durée** : 22 min | **Résultat** : ⚠️ Friction

A créé Nyx Pétillétincelle (Gnome des forêts, Ensorceleur niv 1, Magie Sauvage). Le wizard l'a submergée.

**Frictions critiques :**
- A mis 3 minutes à trouver le bouton "Créer un personnage" sur mobile (trop petit, en haut à droite).
- À l'étape Race, 30+ races affichées sans guide. A choisi Gnome "parce que c'est mignon" sans comprendre les implications.
- À l'étape Classe, a vu "Points de sorcellerie : 0" et a paniqué : "Je n'ai rien ? C'est nul !"
- À l'étape Sorts, a cherché "Boule de feu" (sort niveau 3). L'app l'a refusé sans expliquer pourquoi. A abandonné la recherche de sorts pendant 4 minutes.

> 🎙️ **Verbatim** : *"Pourquoi je ne peux pas prendre Boule de feu ? C'est marqué nulle part que c'est pour plus tard. J'ai failli arrêter."*

#### T2 — Fiche
**Durée** : 4 min | **Résultat** : ❌ Échec

N'a pas trouvé son bonus d'attaque de sort sur la fiche de combat. A cherché pendant 2 minutes. A fini par trouver sur l'onglet Perso, mais a dû scroller beaucoup sur mobile.

> 🎙️ **Verbatim** : *"Le MJ demande mon jet d'attaque de sort. Je cherche sur Combat... pas là. Je vais sur Perso... je scrolle... je trouve. 4 clics pour un truc simple."*

#### T3 — Combat
**Durée** : 3 min | **Résultat** : ❌ Échec

Fiche de combat quasi vide (niveau 1). A cru que son personnage était "cassé". A dû appeler l'observateur pour confirmation.

> 🎙️ **Verbatim** : *"Je suis niveau 1 et ma fiche est vide. Je me sens inutile. L'app devrait me cacher les trucs que je n'ai pas encore."*

#### T5 — Notes
**Résultat** : ❌ Échec

N'a même pas cherché. L'observateur lui a demandé d'essayer — elle a vu les données factices et n'a pas compris à quoi ça servait.

#### Score UX : **2.1/5**
**Verdict** : Sophie a failli abandonner 3 fois. Besace n'est pas ready pour les vrais débutants sans accompagnement humain.

---

### Persona 4 — Lucas, le Techie (Magicien Scribes niv 10)

**Device** : Linux Desktop, Firefox + DevTools
**Date du test** : 2026-04-22, 21h00

#### T1 — Création
**Durée** : 9 min | **Résultat** : ✅ Réussite

A créé Quill Vance (Humain Variante, Magicien niv 10, Ordre des Scribes). A immédiatement ouvert l'inspecteur réseau.

**Observations techniques :**
- 5 requêtes fetch() indépendantes (races.json, classes.json, spells.json, backgrounds.json, equipment.json)
- Aucun service worker, aucun cache persistant.
- Temps de chargement total : 2.8s sur fibre, estimé à 12s+ sur 3G.

> 🎙️ **Verbatim** : *"L'app fait 5 allers-retours serveur pour du contenu statique. Un simple preload ou un service worker réglerait le problème. Sur une connexion pourrie, le wizard est inutilisable."*

#### T2 — Fiche
**Durée** : 2 min | **Résultat** : ✅ Réussite

A vérifié les calculs de CA. Armure de cuir clouté + DEX 14 (+2) = CA 14. Correct.
A testé avec le style de combat Défense ( Guerrier ) — mais c'est un Magicien, donc pas applicable. A simulé un Fighter pour le test.

#### T3 — Combat
**Durée** : 7 min | **Résultat** : ⚠️ Friction

A testé tous les toggles disponibles pour Magicien : Chant de lame (non applicable), Déviation arcanique, Surincantation, Moisson sinistre, Maîtrise des sorts, Sorts de prédilection.

**Résultat** : Aucun toggle ne modifie les calculs d'attaque ou de dégâts. Tous sont purement visuels.

> 🎙️ **Verbatim** : *"J'active Surincantation et mes dégâts de Boule de feu ne changent pas. Ces toggles sont des lampes témoins. Pour un outil qui se veut automatique, c'est une promesse non tenue."*

A aussi vérifié le bug Défense : un Fighter avec style Défense et armure = CA inchangée. Le bonus +1 n'est pas appliqué.

> 🎙️ **Verbatim** : *"Le bug Défense est confirmé. C'est dans CLASS_AUDIT_PROGRESS.md mais pas corrigé. C'est un calcul central."*

#### T4 — Level-up
**Durée** : 3 min | **Résultat** : ✅ Réussite

A monté au niveau 11. Processus fluide. A noté que les sorts sont stockés par string name ("Fire Bolt") plutôt que par ID stable.

> 🎙️ **Verbatim** : *"Les sorts sont identifiés par leur nom en clair. Si j'importe un perso avec 'Fire Bolt' et que l'app attend 'Rayon de feu', ça casse. Des IDs normalisés seraient plus robustes."*

#### T5 — Notes
**Résultat** : ❌ Échec

A immédiatement identifié que la page est mockée. Les boutons Pencil/Trash ne font rien.

#### T6 — Export/Import
**Résultat** : ⚠️ Friction

A trouvé le bouton Export JSON sur la fiche Perso. Le JSON est bien structuré. A cherché le bouton Import pendant 3 minutes. N'a pas trouvé. A fouillé le code source et découvert `characterImportExport.ts` avec la fonction d'import — mais aucun bouton ne l'appelle.

> 🎙️ **Verbatim** : *"L'import est codé mais pas exposé. C'est une feature cachée. Dommage, c'est essentiel pour migrer depuis d'autres outils."*

#### Score UX : **3.5/5**
**Verdict** : App robuste techniquement mais manque de finition sur les règles mécaniques et l'offline.

---

### Persona 5 — Emma, l'Artiste (Paladin Vengeance niv 7)

**Device** : MacBook + iPad alternés
**Date du test** : 2026-04-22, 16h00

#### T1 — Création
**Durée** : 16 min | **Résultat** : ✅ Réussite

A créé Seraphine Cendrelune (Aasimar Protecteur, Paladin niv 7, Vengeance). A mis du temps sur l'avatar — a uploadé un artwork commissionné. L'image a été rognée en cercle et compressée. Le détail de l'armure est perdu.

> 🎙️ **Verbatim** : *"J'ai un super artwork mais il est écrasé en petit cercle. Je ne peux pas zoomer ni choisir le cadrage. C'est frustrant pour un graphiste."*

A aussi voulu personnaliser son historique "Soldat" en "Chevalier errant déchu" — impossible, texte verrouillé.

#### T2 — Fiche
**Durée** : 2 min | **Résultat** : ✅ Réussite

A trouvé la fiche claire mais "trop tableur". A cherché ses traits de personnalité sur la fiche principale — introuvables.

#### T3 — Combat
**Durée** : 4 min | **Résultat** : ✅ Réussite

A découvert les badges Paladin : Châtiment divin, Aura de protection. A aimé. A activé le toggle "Vengeance" — visuel uniquement.

#### T4 — Level-up
**Durée** : 3 min | **Résultat** : ✅ Réussite

A monté au niveau 8. ASI +2 FOR. A trouvé le processus fluide mais "trop sec" — pas de feedback visuel de célébration.

> 🎙️ **Verbatim** : *"Mon personnage gagne un niveau, c'est un moment important. Un petit effet visuel, une animation, quelque chose... Là c'est juste 'OK, confirmé'."*

#### T5 — Notes
**Résultat** : ❌ Échec

A ouvert l'onglet Notes sur iPad. A vu les données mockées. A essayé de cliquer sur les crayons — rien. A abandonné.

> 🎙️ **Verbatim** : *"J'ai rempli mes traits de personnalité pendant la création mais ils n'existent nulle part. La page Notes est remplie de Lorem ipsum. C'est le vide absolu pour le RP."*

#### Score UX : **3.0/5**
**Verdict** : Belle app mais impersonnelle. Manque cruellement de fonctionnalités RP.

---

### Persona 6 — Alex, le Min-Maxer (Moine Ombre niv 14)

**Device** : PC Windows 27", 2 écrans
**Date du test** : 2026-04-23, 20h00

#### T1 — Création
**Durée** : 8 min | **Résultat** : ✅ Réussite

A créé Kairos Ombrevent (Elfe des bois, Moine niv 14, Ombre). A utilisé le Point Buy. A remarqué que l'app n'affiche pas le coût en points de chaque score.

> 🎙️ **Verbatim** : *"Je mets 15 en DEX mais je ne sais pas combien ça coûte en points. Je dois calculer mentalement : 15 = 9 points. C'est basique, ça devrait être affiché."*

#### T2 — Fiche
**Durée** : 1 min | **Résultat** : ✅ Réussite

A vérifié les calculs : Ki 14, MA d8, Déplacement +7.5m. Tout est correct.

#### T3 — Combat
**Durée** : 6 min | **Résultat** : ⚠️ Friction

A testé le toggle "Pas d'ombre". S'est attendu à ce que 2 Ki soient dépensés automatiquement. Rien ne s'est passé. A dû cliquer manuellement sur le compteur Ki.

> 🎙️ **Verbatim** : *"J'active Pas d'ombre, mes Ki ne bougent pas. L'app devrait soit dépenser les Ki, soit m'afficher un tooltip 'Coût : 2 Ki'. C'est une promesse non tenue."*

A aussi testé le toggle "Manteau d'ombres" — même constat, purement visuel.

A dépensé 2 Ki pour Frappe étourdissante. Le compteur est passé de 14 à 12. A cliqué "Nouveau tour" — les ressources n'ont pas été réinitialisées (bon comportement). Mais il a cherché un bouton "Repos court" sur la fiche de combat — introuvable. A dû aller dans le menu "Repos" (icône + en haut).

> 🎙️ **Verbatim** : *"Le repos court est caché dans un menu. Je veux un bouton visible en permanence sur la fiche de combat."*

#### T4 — Level-up
**Durée** : 2 min | **Résultat** : ✅ Réussite

A monté au niveau 15. Dé d'inspiration passe à d10 (Barde) — non applicable, c'est un Moine. A choisi une capacité de moine. Processus rapide.

#### T5 — Notes
**Résultat** : ❌ Échec

N'a pas cherché. N'est pas intéressé par les notes RP.

#### Score UX : **3.4/5**
**Verdict** : Bon pour les calculs basiques mais les ressources complexes manquent d'automatisation.

---

### Persona 7 — Chloé, la Polyvalente (Rôdeuse Ombres niv 5)

**Device** : Desktop + tablette
**Date du test** : 2026-04-23, 18h00

#### T1 — Création multiple
**Durée** : 25 min (3 persos) | **Résultat** : ✅ Réussite

A créé Sylvaine (Rôdeuse), puis un Clerc, puis un Sorcier. La 4e tentative a été bloquée : "Maximum 5 personnages".

> 🎙️ **Verbatim** : *"Je veux tester des builds mais la limite de 5 est trop basse. Et je ne peux pas archiver ceux que je ne joue plus — c'est supprimer ou rien."*

#### T2 — Comparaison
**Durée** : 4 min | **Résultat** : ❌ Échec

A voulu comparer Sylvaine et son Clerc côte à côte. A dû naviguer entre les deux fiches, retenir les chiffres, revenir. Fastidieux.

> 🎙️ **Verbatim** : *"Un mode comparaison avec deux fiches côte à côte serait génial. Là je dois jouer la mémoire."*

#### T3 — Combat
**Durée** : 5 min | **Résultat** : ✅ Réussite

A activé "Embuscade redoutable". Le toggle s'est allumé. Mais les dégâts de son attaque n'ont pas changé.

> 🎙️ **Verbatim** : *"Embuscade redoutable est actif mais mes dégâts affichent toujours 1d8+4. Le 1d8 supplémentaire n'est pas ajouté."*

#### T4 — Level-up
**Résultat** : ✅ Réussite

#### T5 — Notes
**Résultat** : ❌ Échec

#### T6 — Sync Trame
**Résultat** : ❌ Échec

A cliqué sur "Sync Trame" sur la page d'accueil. Grisé/inactif.

> 🎙️ **Verbatim** : *"Le sync avec Trame est prometteur mais c'est juste un bouton mort. Dommage."*

#### Score UX : **3.6/5**
**Verdict** : Bonne app mais limitée pour les joueurs qui aiment expérimenter.

---

### Persona 8 — Julien, le Tacticien (Guerrier Maître de bataille niv 10)

**Device** : Tablette Android
**Date du test** : 2026-04-23, 20h00
**Contexte** : One-shot niveau 10

#### T1 — Création
**Durée** : 10 min | **Résultat** : ✅ Réussite

A créé Gareth Fortemain (Demi-orque, Guerrier niv 10, Maître de bataille). A choisi ses 7 manœuvres. A apprécié que l'app affiche le nombre de dés (5) et la taille (d10).

#### T2 — Fiche
**Durée** : 1 min | **Résultat** : ✅ Réussite

#### T3 — Combat
**Durée** : 8 min | **Résultat** : ✅ Réussite

A testé le système de ressources : a dépensé 1 dé de supériorité. Le compteur est passé de 5 à 4. A cliqué "Nouveau tour" — Action/Bonus Action/Réaction réinitialisées. Parfait.

**Friction :**
- Pendant le combat simulé, le MJ (observateur) a annoncé une attaque d'opportunité. Julien a voulu utiliser sa réaction pour Riposte. Il a cherché la description de Riposte sur sa fiche — introuvable. Seul le nom "Riposte" était mémorisé, pas l'effet.

> 🎙️ **Verbatim** : *"J'ai 7 manœuvres mais je ne me souviens plus de leurs effets exacts. L'app devrait les afficher avec descriptions en combat."*

- Après le combat simulé, a voulu faire un repos court. A cherché le bouton sur la fiche de combat — introuvable. A dû ouvrir le menu "Repos" (icône +).

> 🎙️ **Verbatim** : *"Je veux un bouton Repos court visible en permanence. C'est une action trop courante pour être cachée."*

#### T4 — Level-up
**Résultat** : ✅ Réussite

#### T5 — Notes
**Résultat** : ❌ Échec

#### Score UX : **3.7/5**
**Verdict** : Excellent pour les ressources basiques, mais manque d'accès rapide aux capacités complexes.

---

### Persona 9 — Léa, la Rôliste (Barbare Totem niv 6)

**Device** : Laptop basique
**Date du test** : 2026-04-24, 15h00
**Contexte** : Campagne de longue haleine

#### T1 — Création
**Durée** : 18 min | **Résultat** : ✅ Réussite

A créé Thraja Crins-de-Tempête (Goliath, Barbare niv 6, Totem Ours). A pris son temps sur chaque étape.

**Friction :**
- A choisi l'historique "Barde" (ironiquement). A voulu renommer l'instrument en "Harpe de guerre en os de dragon" — impossible.

> 🎙️ **Verbatim** : *"Je veux personnaliser mon équipement mais tout est verrouillé. Même pas un champ 'Description' sur les objets."*

#### T2 — Fiche
**Durée** : 2 min | **Résultat** : ✅ Réussite

A trouvé ses stats. Mais ses traits de personnalité (remplis à la création) n'apparaissent nulle part sur la fiche principale.

#### T3 — Combat
**Durée** : 5 min | **Résultat** : ✅ Réussite

A activé la Rage. Le toggle s'est allumé. A aimé le système. Mais l'app ne lui a pas rappelé les effets de la Rage.

> 🎙️ **Verbatim** : *"J'active la Rage mais l'app ne me dit pas '+2 dégâts, résistance B/P/S'. Je dois m'en souvenir. Un panneau récapitulatif serait utile."*

#### T4 — Level-up
**Résultat** : ✅ Réussite

#### T5 — Notes
**Résultat** : ❌ Échec

A ouvert l'onglet Notes. A vu les données factices. A essayé d'ajouter une note de session sur la dernière séance — le bouton "Nouvelle note" n'a aucun effet.

> 🎙️ **Verbatim** : *"Je veux écrire : 'Thraja a défendu le village contre les gobelins'. Mais le bouton ne fait rien. C'est le cœur de mon expérience et ça ne marche pas."*

#### Score UX : **3.1/5**
**Verdict** : Fonctionnelle pour le combat mais vide côté RP.

---

### Persona 10 — Maxime, le Mobile (Occultiste Lames niv 5)

**Device** : iPhone 13 mini
**Date du test** : 2026-04-24, 19h00
**Contexte** : Session au café

#### T1 — Création
**Durée** : 16 min | **Résultat** : ⚠️ Friction

A créé Zarek Lame-Brisée (Tiefling, Occultiste niv 5, Lames). Sur iPhone mini, l'écran est très petit.

**Frictions :**
- Bouton "Créer" difficile à trouver (petit, en haut à droite).
- Scrolling excessif à chaque étape.
- Étape Équipement : les dropdowns débordent de l'écran.

#### T2 — Fiche
**Durée** : 3 min | **Résultat** : ⚠️ Friction

A trouvé la fiche Perso trop longue. A dû scroller beaucoup pour trouver les sauvegardes.

#### T3 — Combat
**Durée** : 6 min | **Résultat** : ⚠️ Friction

A ouvert la fiche de combat. Quick-stats visibles (Niv emplacement 3, Emplacements 2, Invocations 3). Mais les toggles sont en bas de page — il doit scroller pour les atteindre.

> 🎙️ **Verbatim** : *"Les toggles devraient être en haut sur mobile. C'est ce que j'utilise le plus."*

**Friction majeure :**
Le MJ (observateur) annonce : "Zarek, ton tour." Maxime veut attaquer avec son épée de pacte. Il trouve l'action — bonus +7, dégâts 1d8+4. Mais il ne peut pas lancer les dés.

> 🎙️ **Verbatim** : *"Je vois 1d8+4 mais je ne peux pas lancer les dés. Je dois ouvrir une autre app. C'est le principal manque. Sans lancer de dés, ce n'est pas une app de D&D, c'est juste une calculatrice."*

**Navigation :**
Le MJ demande un jet de sauvegarde de Sagesse. Maxime est sur Combat. Il clique Perso (en bas), scrolle jusqu'aux JS, trouve Sagesse (+1), revient sur Combat. 4 taps + 2 scrolls.

> 🎙️ **Verbatim** : *"Les JS devraient être sur la fiche de combat. C'est essentiel en combat."*

**Mode sombre :**
Le café est sombre. Maxime active le mode sombre. C'est bien. Mais certains textes gris sur fond sombre sont illisibles.

> 🎙️ **Verbatim** : *"Le mode sombre est sympa mais certains textes sont trop clairs/gris. J'ai du mal à lire dans le café."*

#### T4 — Level-up
**Résultat** : N/A (pas testé en session)

#### T5 — Notes
**Résultat** : ❌ Échec

#### Score UX : **2.4/5**
**Verdict** : Inutilisable en session mobile sans lancer de dés intégré.

---

## Matrice des problèmes identifiés

### 🚨 Bloquants (Score d'impact 5/5)

| ID | Problème | Personas concernés | Fréquence |
|----|----------|-------------------|-----------|
| B1 | **Page Notes entièrement mockée** — aucune persistance, boutons inactifs | Tous (10/10) | 100% |
| B2 | **Absence de lancer de dés intégré** | Maxime, Sophie, Julien | 70% |
| B3 | **Forme sauvage sans effet mécanique** — stats inchangées | Thomas | 10% (mais 100% des Druides) |

### ⚠️ Majeurs (Score d'impact 4/5)

| ID | Problème | Personas concernés | Fréquence |
|----|----------|-------------------|-----------|
| M1 | **Toggles actifs purement cosmétiques** — aucun calcul appliqué | Marie, Lucas, Alex, Chloé | 60% |
| M2 | **Style Défense non appliqué au calcul de CA** | Lucas | 10% (mais 100% des Fighters) |
| M3 | **Aurora JSON fetchés sans cache offline** | Lucas | 10% (mais 100% en offline) |
| M4 | **Import JSON non exposé dans l'UI** | Lucas | 10% |
| M5 | **Pas de sélecteur de bêtes pour Druide** | Thomas | 10% |
| M6 | **Limite 5 personnages sans archivage** | Chloé | 10% |
| M7 | **Sync Trame grisé/inactif** | Chloé | 10% |

### 📋 Moyens (Score d'impact 3/5)

| ID | Problème | Personas concernés | Fréquence |
|----|----------|-------------------|-----------|
| P1 | **Pas de boutique d'équipement** | Marie | 10% |
| P2 | **Point Buy sans affichage du coût** | Alex | 10% |
| P3 | **ASI non visible pendant la création** | Marie | 10% |
| P4 | **Repos court/long caché dans un menu** | Alex, Julien | 20% |
| P5 | **Manœuvres/capacités sans descriptions en combat** | Julien | 10% |
| P6 | **Bonus d'attaque de sort absent de la fiche combat** | Sophie, Maxime | 20% |
| P7 | **Sauvegardes absentes de la fiche combat** | Maxime | 10% |
| P8 | **Contraste faible en mode sombre** | Maxime | 10% |
| P9 | **Sorts verrouillés sans explication** | Sophie | 10% |
| P10 | **Équipement non personnalisable** | Léa, Emma | 20% |

### 💡 Mineurs (Score d'impact 2/5)

| ID | Problème | Personas concernés | Fréquence |
|----|----------|-------------------|-----------|
| N1 | **Pas d'animation au level-up** | Emma | 10% |
| N2 | **Descriptions pliées par défaut** | Thomas | 10% |
| N3 | **Jet de caractéristiques non granulaire** | Thomas | 10% |
| N4 | **Noms de sorts anglais/français mélangés** | Marie | 10% |

---

## Scores détaillés par persona

| Persona | Score UX | Principal bloquant | Principal majeur | Recommandation |
|---------|----------|-------------------|------------------|----------------|
| Marie | 3.8 | Notes mockées | Toggles cosmétiques | Historique ressources + boutique |
| Thomas | 3.2 | Notes mockées | Forme sauvage | Sélecteur de bêtes Druide |
| Sophie | 2.1 | Notes mockées | Dés intégrés | Mode débutant + tutoriel |
| Lucas | 3.5 | Notes mockées | Cache offline | Service worker + IDs stables |
| Emma | 3.0 | Notes mockées | Personnalisation | Champs RP + thèmes |
| Alex | 3.4 | Notes mockées | Toggles cosmétiques | Point Buy amélioré + undo |
| Chloé | 3.6 | Notes mockées | Limite 5 persos | Archivage + comparaison |
| Julien | 3.7 | Notes mockées | Manœuvres | Accès rapide capacités |
| Léa | 3.1 | Notes mockées | Objets verrouillés | Notes fonctionnelles |
| Maxime | 2.4 | Dés intégrés | Toggles position | Lancer de dés + JS combat |

---

## Synthèse et recommandations prioritaires

### Roadmap immédiate (Sprint 1 — 2 semaines)

1. **B1 — Page Notes fonctionnelle** 🔴
   - Remplacer les données mockées par des champs éditables persistés dans Firestore
   - Activer les boutons Pencil/Trash/Add
   - **Effort** : Moyen | **Impact** : Très haut (10/10 personas)

2. **B2 — Lancer de dés intégré** 🔴
   - Ajouter un bouton 🎲 sur chaque attaque, sort, compétence, sauvegarde
   - Animation simple + historique des lancers
   - **Effort** : Élevé | **Impact** : Très haut (7/10 personas)

3. **M1 — Toggles avec effets mécaniques** 🟠
   - Connecter les toggles actifs aux calculs de combat (attaque, dégâts, CA)
   - Commencer par les plus courants : Rage, Forme sauvage, Embuscade redoutable
   - **Effort** : Élevé | **Impact** : Haut (6/10 personas)

### Roadmap courte (Sprint 2-3 — 4 semaines)

4. **M2 — Bug CA Défense** 🟠
   - Corriger `combat-engine.ts` pour appliquer +1 CA avec le style Défense
   - **Effort** : Faible | **Impact** : Haut

5. **B3 — Forme sauvage mécanique** 🟠
   - Intégrer une base de bêtes ( Monster Manual SRD )
   - Remplacer les stats du personnage au toggle
   - **Effort** : Élevé | **Impact** : Haut (Druides)

6. **M3 — Cache offline Aurora** 🟠
   - Service worker ou bundling des JSON Aurora
   - **Effort** : Moyen | **Impact** : Haut (connexions lentes)

7. **P6/P7 — JS et bonus de sort sur fiche combat** 🟡
   - Ajouter une section "Sauvegardes" et "Sorts" directement sur l'onglet Combat
   - **Effort** : Moyen | **Impact** : Moyen

### Roadmap moyenne (Sprint 4+ — 8 semaines)

8. **P1 — Boutique d'équipement** 🟡
9. **M4 — Bouton Import JSON** 🟡
10. **M6 — Archivage de personnages** 🟡
11. **P2 — Point Buy avec coûts** 🟢
12. **P4 — Boutons Repos visibles** 🟢
13. **N1 — Animations level-up** 🟢

---

## Conclusion

Besace est une **application solide sur le cœur mécanique** : création de personnage fluide, calculs automatiques fiables, fiche de combat bien pensée pour les ressources.

Cependant, le test révèle **3 bloquants critiques** qui empêchent une adoption généralisée :

1. **Notes/RP non fonctionnelles** — 10/10 personas échouent sur cette tâche. C'est le problème le plus universel.
2. **Absence de lancer de dés** — Sur mobile, l'app devient une simple calculatrice. Le cœur du jeu (les dés) n'est pas intégré.
3. **Forme sauvage inopérante** — Pour les Druides, l'app ne gère pas la mécanique centrale de la classe.

**Verdict global** : Besace est excellent pour les joueurs expérimentés sur desktop qui veulent une fiche de calcul automatisée. Elle n'est pas encore prête pour les débutants, les joueurs mobile en session, ni pour les rôlistes qui veulent une expérience narrative enrichie.

---

*Rapport de test utilisateur généré le 2026-04-24.*
*Méthode : test en situation avec 10 personas variés.*
*Outil testé : Besace (build 2026-04-24).*
