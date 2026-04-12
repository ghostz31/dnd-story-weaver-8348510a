# Sources D&D 5e — Répertoire Vérifié

Base de sites fiables pour la recherche d'informations sur l'univers de Donjons & Dragons 5e édition.
Tous les sites ont été vérifiés accessibles le 16/02/2026.

---

## 🇫🇷 Sources Françaises (Prioritaires)

### 1. AideDD — aidedd.org ⭐ Source primaire

**Fiabilité** : ★★★★★ — Référence n°1 de la communauté FR, contenu autorisé par Wizards of the Coast.

| Contenu | URL Pattern | Notes |
|---------|-------------|-------|
| **Sorts (par nom FR)** | `https://www.aidedd.org/dnd/sorts.php?vf=NOM-FRANCAIS` | Slug minuscule avec tirets |
| **Sorts (par nom EN)** | `https://www.aidedd.org/dnd/sorts.php?vo=NOM_ANGLAIS` | Nom anglais, espaces = rien |
| **Filtre sorts** | `https://www.aidedd.org/dnd-filters/sorts.php` | Filtrable par classe, niveau, école |
| **Monstres** | `https://www.aidedd.org/dnd/monstres.php?vo=MONSTER_NAME` | Nom anglais |
| **Filtre monstres** | `https://www.aidedd.org/dnd-filters/monstres.php` | Filtrable par FP, type, taille |
| **Objets magiques** | `https://www.aidedd.org/dnd/om.php?vo=ITEM_NAME` | Nom anglais |
| **Filtre obj. magiques** | `https://www.aidedd.org/dnd-filters/objets-magiques.php` | Filtrable par rareté, type |
| **Classes** | `https://www.aidedd.org/regles/classes/NOM_FR/` | ex: `guerrier`, `magicien` |
| **Races** | `https://www.aidedd.org/regles/races/NOM_FR/` | ex: `elfe`, `nain` |
| **Équipement** | `https://www.aidedd.org/regles/equipement/` | Armes, armures, outils |
| **Dons** | `https://www.aidedd.org/regles/dons/` | Liste complète des dons |
| **Historiques** | `https://www.aidedd.org/regles/historiques/` | Backgrounds |
| **Constructeur** | `https://www.aidedd.org/dnd-builder/` | Constructeur de perso en ligne |

**Extraction** : Le contenu HTML est bien structuré. Les sorts ont des champs clairement délimités (niveau, école, temps d'incantation, portée, composantes, durée, description).

---

### 2. 5e DRS (2014) — 2014.5e-drs.fr ⭐

**Fiabilité** : ★★★★★ — SRD officiel traduit sous licence Creative Commons CC-BY-4.0.

| Contenu | URL | Notes |
|---------|-----|-------|
| **Création de perso** | `https://2014.5e-drs.fr/creation-du-personnage/` | Guide étape par étape |
| **Races** | `https://2014.5e-drs.fr/races/` | Toutes les races SRD |
| **Classes** | `https://2014.5e-drs.fr/classes/` | Toutes les classes SRD |
| **Personnalité & historique** | `https://2014.5e-drs.fr/personnalite-et-historique/` | Backgrounds complets |
| **Équipement** | `https://2014.5e-drs.fr/equipement-d-aventurier/` | Listes d'équipement |
| **Options de perso** | `https://2014.5e-drs.fr/options-de-personnalisation/` | Multiclassage, dons |
| **Utiliser les carac.** | `https://2014.5e-drs.fr/utiliser-les-caracteristiques/` | Règles de compétences |
| **Combat** | `https://2014.5e-drs.fr/combattre/` | Règles de combat |
| **Lancer des sorts** | `https://2014.5e-drs.fr/lancer-des-sorts/` | Règles de magie |
| **Grimoire (sorts)** | `https://2014.5e-drs.fr/grimoire/` | Tous les sorts SRD |
| **Trésors** | `https://2014.5e-drs.fr/les-tresors/` | Objets magiques |
| **Santé** | `https://2014.5e-drs.fr/gerer-la-sante-du-personnage/` | Repos, conditions, mort |

**Avantages** : Contenu intégralement en français, bien structuré en HTML sémantique, licence CC-BY-4.0.

---

### 3. 5e DRS (2024) — 5e-drs.fr

**Fiabilité** : ★★★★☆ — Version 2024 des règles révisées, en cours de complétion.

| Contenu | URL |
|---------|-----|
| **Règles 2024** | `https://www.5e-drs.fr/regles/` |

**Notes** : Version en cours de publication. Pour les données actuelles de Besace (basé sur 5e 2014), préférer `2014.5e-drs.fr`.

---

### 4. Donjon Libéré — donjonlibere.fr

**Fiabilité** : ★★★★☆ — Mise en page soignée du SRD 5.1 officiel, licence CC.

Utile comme source de vérification croisée, contenu identique au SRD officiel mais avec une meilleure lisibilité.

---

### 5. Aventure SRD JDR — aventure-srd-jdr.fr

**Fiabilité** : ★★★★☆ — Traduction française communautaire du SRD, gratuite.

Bonne alternative si AideDD ou 5e-drs sont indisponibles.

---

## 🇬🇧 Sources Anglaises (Secondaires — toujours traduire)

### 6. D&D 5e API — dnd5eapi.co ⭐ Source de données structurées

**Fiabilité** : ★★★★★ — API REST open-source basée sur le SRD. Données en JSON, parfait pour l'extraction automatique.

| Endpoint | URL | Données |
|----------|-----|---------|
| **Tous les sorts** | `https://www.dnd5eapi.co/api/2014/spells` | Liste d'index |
| **Sort spécifique** | `https://www.dnd5eapi.co/api/2014/spells/{index}` | Détail complet (JSON) |
| **Toutes les classes** | `https://www.dnd5eapi.co/api/2014/classes` | Liste |
| **Classe spécifique** | `https://www.dnd5eapi.co/api/2014/classes/{index}` | Détail |
| **Niveaux de classe** | `https://www.dnd5eapi.co/api/2014/classes/{index}/levels` | Features par niveau |
| **Toutes les races** | `https://www.dnd5eapi.co/api/2014/races` | Liste |
| **Race spécifique** | `https://www.dnd5eapi.co/api/2014/races/{index}` | Détail |
| **Équipement** | `https://www.dnd5eapi.co/api/2014/equipment` | Liste |
| **Objet spécifique** | `https://www.dnd5eapi.co/api/2014/equipment/{index}` | Détail |
| **Objets magiques** | `https://www.dnd5eapi.co/api/2014/magic-items` | Liste |
| **Monstres** | `https://www.dnd5eapi.co/api/2014/monsters` | Liste |
| **Conditions** | `https://www.dnd5eapi.co/api/2014/conditions` | Liste |
| **Dons** | `https://www.dnd5eapi.co/api/2014/feats` | Liste |
| **Traits** | `https://www.dnd5eapi.co/api/2014/traits` | Traits raciaux |
| **Features** | `https://www.dnd5eapi.co/api/2014/features` | Class features |
| **Sous-classes** | `https://www.dnd5eapi.co/api/2014/subclasses` | Liste |
| **Écoles de magie** | `https://www.dnd5eapi.co/api/2014/magic-schools` | Liste |

**Format de réponse** (exemple sort) :
```json
{
  "index": "fireball",
  "name": "Fireball",
  "level": 3,
  "school": { "name": "Evocation" },
  "casting_time": "1 action",
  "range": "150 feet",
  "components": ["V", "S", "M"],
  "material": "A tiny ball of bat guano and sulfur.",
  "duration": "Instantaneous",
  "concentration": false,
  "ritual": false,
  "desc": ["A bright streak flashes..."],
  "higher_level": ["When you cast this spell using a spell slot of 4th level or higher..."],
  "classes": [{ "name": "Sorcerer" }, { "name": "Wizard" }],
  "damage": { "damage_type": { "name": "Fire" }, "damage_at_slot_level": { "3": "8d6", ... } }
}
```

**Pas d'authentification requise**. Rate limiting possible.

---

### 7. Open5e — open5e.com

**Fiabilité** : ★★★★☆ — API open-source incluant SRD + contenus OGL supplémentaires.

| Endpoint | URL |
|----------|-----|
| **API Sorts** | `https://api.open5e.com/v1/spells/` |
| **API Monstres** | `https://api.open5e.com/v1/monsters/` |
| **API Classes** | `https://api.open5e.com/v1/classes/` |
| **Documentation** | `https://open5e.com/` |

**Avantage** : Inclut du contenu OGL au-delà du SRD (Tome of Beasts, etc.). Utile pour vérification croisée.

---

### 8. 5th SRD — 5thsrd.org

**Fiabilité** : ★★★★☆ — SRD 5.1 complet en texte, bien organisé.

| Contenu | URL |
|---------|-----|
| **Sorts** | `https://5thsrd.org/spellcasting/spell_lists/` |
| **Classes** | `https://5thsrd.org/character/classes/` |
| **Races** | `https://5thsrd.org/character/races/` |
| **Équipement** | `https://5thsrd.org/adventuring/equipment/` |
| **Combat** | `https://5thsrd.org/combat/` |

---

### 9. D&D Beyond — dndbeyond.com

**Fiabilité** : ★★★★★ — Source officielle Wizards of the Coast.

| Contenu | URL |
|---------|-----|
| **SRD gratuit** | `https://www.dndbeyond.com/sources/dnd/free-rules` |
| **Sorts** | `https://www.dndbeyond.com/spells` |
| **Classes** | `https://www.dndbeyond.com/classes` |
| **Monstres** | `https://www.dndbeyond.com/monsters` |
| **Objets magiques** | `https://www.dndbeyond.com/magic-items` |

**⚠️ Limitation** : Beaucoup de contenu est payant (au-delà du SRD). Utiliser principalement pour vérification de la terminologie officielle.

---

## 📋 Stratégie de Recherche

### Workflow pour ajouter des données à Besace

```
1. Identifier le type de donnée (sort, classe, race, équipement, etc.)
   │
2. Chercher sur AideDD (FR) → nom français officiel + description
   │ Si introuvable ↓
3. Chercher sur 5e-drs.fr (FR) → texte SRD français
   │ Si introuvable ↓
4. Chercher sur dnd5eapi.co (EN) → données structurées JSON
   │ Puis traduire avec la table de traduction dans SKILL.md
   │
5. Vérification croisée sur au minimum 2 sources
   │
6. Formater en TypeScript selon les schémas dans data-schemas.md
```

### Priorité d'extraction par type

| Type de donnée | Source primaire | Source secondaire | Format |
|----------------|----------------|-------------------|--------|
| Sorts | AideDD (FR) | dnd5eapi.co (JSON) | `Spell` interface |
| Classes | AideDD (FR) | 2014.5e-drs.fr | `CharacterClass` interface |
| Races | AideDD (FR) | 2014.5e-drs.fr | `Race` interface |
| Équipement | AideDD (FR) | dnd5eapi.co | `InventoryItem` interface |
| Objets magiques | AideDD (FR) | dnd5eapi.co | `InventoryItem` (magical) |
| Capacités de classe | 2014.5e-drs.fr | dnd5eapi.co/features | String descriptions |
| Monstres | AideDD (FR) | dnd5eapi.co | (pas encore de type Besace) |
| Dons | AideDD (FR) | dnd5eapi.co/feats | (pas encore de type Besace) |
| Conditions | 2014.5e-drs.fr | dnd5eapi.co/conditions | (pas encore de type Besace) |

## ⚖️ Licences

| Source | Licence | Usage commercial |
|--------|---------|-----------------|
| SRD 5.1 / 5.2.1 | CC-BY-4.0 | ✅ Oui avec attribution |
| AideDD | Autorisé par WotC (consultation) | ⚠️ Usage personnel/référence |
| 5e-drs.fr | CC-BY-4.0 | ✅ Oui avec attribution |
| dnd5eapi.co | MIT (code) + SRD CC-BY-4.0 (data) | ✅ Oui |
| Open5e | OGL / CC | ✅ Selon la source |
| D&D Beyond | Propriétaire WotC | ❌ Référence seulement |

> **Pour Besace** : S'appuyer sur les données SRD (CC-BY-4.0) via AideDD, 5e-drs et dnd5eapi.co. Ajouter l'attribution "Based on the D&D 5e SRD by Wizards of the Coast, licensed under CC-BY-4.0" dans l'application.
