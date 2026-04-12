---
name: dnd-research
description: Specialized D&D 5th Edition rules research and data extraction for the Besace character sheet app. Use when asked to find D&D rules, spell data, class features, racial traits, equipment stats, monster data, or any SRD/PHB information. Searches French sources first (AideDD, 5e-drs), falls back to English SRD and translates. Outputs structured TypeScript data ready for Besace integration.
---

# D&D 5e Research Skill

Recherche et extraction d'informations précises sur les règles de Donjons & Dragons 5e édition pour alimenter l'application Besace.

## Workflow

1. Identify the information type needed (spell, class feature, race, equipment, rule, etc.)
2. Search French sources first, then fallback to English
3. Extract structured data
4. Format as TypeScript for Besace integration
5. Cross-reference with official SRD for accuracy

## Source Priority

Search sources in this order, always preferring French:

### Tier 1 — French Official/Community (prefer these)
| Source | URL | Content |
|--------|-----|---------|
| AideDD | `https://www.aidedd.org/` | Complete 5e SRD in French — spells, monsters, classes, races, equipment |
| 5e-drs | `https://www.5e-drs.fr/` | French SRD mirror with good structure |

### Tier 2 — English Official SRD (translate to French)
| Source | URL | Content |
|--------|-----|---------|
| 5e SRD API | `https://www.dnd5eapi.co/api/` | REST API for SRD data (JSON) |
| 5eSRD.com | `https://5thsrd.org/` | Full SRD text |
| D&D Beyond (free) | `https://www.dndbeyond.com/` | Official Wizards content |

### Page Structure Guide
When scraping AideDD:
- Spells: `https://www.aidedd.org/dnd/sorts.php?vo=SPELL_NAME_EN`
- Monsters: `https://www.aidedd.org/dnd/monstres.php?vo=MONSTER_NAME_EN`
- Classes: `https://www.aidedd.org/regles/classes/CLASS_NAME_FR/`
- Races: `https://www.aidedd.org/regles/races/RACE_NAME_FR/`
- Equipment: `https://www.aidedd.org/regles/equipement/`

When using 5e API:
- Spells: `https://www.dnd5eapi.co/api/spells/SPELL-INDEX`
- Classes: `https://www.dnd5eapi.co/api/classes/CLASS-INDEX`
- Races: `https://www.dnd5eapi.co/api/races/RACE-INDEX`
- Equipment: `https://www.dnd5eapi.co/api/equipment/EQUIPMENT-INDEX`

## Reference Files

- [references/sources.md](references/sources.md) — **Complete verified source library** with URLs, extraction patterns, reliability ratings, licensing, and research workflow
- [references/data-schemas.md](references/data-schemas.md) — TypeScript interfaces used in Besace
- [references/existing-data.md](references/existing-data.md) — What data already exists in the codebase + gaps to fill

## Translation Rules

When translating from English:
- Use official French D&D terminology (PHB FR translations)
- Spell names → official French names from AideDD
- Ability scores: STR=Force, DEX=Dextérité, CON=Constitution, INT=Intelligence, WIS=Sagesse, CHA=Charisme
- Damage types: fire=feu, cold=froid, lightning=foudre, thunder=tonnerre, acid=acide, poison=poison, psychic=psychique, radiant=radiant, necrotic=nécrotique, force=force, bludgeoning=contondant, piercing=perforant, slashing=tranchant
- Conditions: blinded=aveuglé, charmed=charmé, deafened=assourdi, frightened=effrayé, grappled=agrippé, incapacitated=neutralisé, invisible=invisible, paralyzed=paralysé, petrified=pétrifié, poisoned=empoisonné, prone=à terre, restrained=entravé, stunned=étourdi, unconscious=inconscient
- Schools of magic: abjuration=Abjuration, conjuration=Invocation, divination=Divination, enchantment=Enchantement, evocation=Évocation, illusion=Illusion, necromancy=Nécromancie, transmutation=Transmutation

## Output Format

Always output as TypeScript matching Besace's existing data structures.

**Example — Adding a spell:**

```typescript
// In src/data/spells.ts
{
  name: 'Boule de feu',
  nameEn: 'Fireball',
  level: 3,
  school: 'Évocation',
  castingTime: '1 action',
  range: '45 mètres',
  components: 'V, S, M (une petite boule de guano de chauve-souris et du soufre)',
  duration: 'Instantanée',
  description: 'Un point de lumière brillante jaillit...',
  higherLevels: 'Lorsque vous lancez ce sort avec un emplacement de sort de niveau 4 ou supérieur...',
  classes: ['Ensorceleur', 'Magicien'],
}
```

**Example — Adding equipment:**

```typescript
// In src/data/equipment.ts
{
  name: 'Épée longue',
  nameEn: 'Longsword',
  type: 'weapon' as const,
  subtype: 'martial-melee',
  damage: '1d8',
  damageType: 'tranchant',
  properties: ['Polyvalente (1d10)'],
  weight: 1.5,
  cost: { amount: 15, unit: 'po' },
}
```

## Validation Checklist

Before outputting any data, verify:
- [ ] French name matches AideDD/official translation
- [ ] Numerical values match SRD (HP, AC, damage dice, etc.)
- [ ] TypeScript type matches Besace's existing interfaces
- [ ] No placeholder text — all fields populated with actual data
- [ ] Cross-referenced between at least 2 sources when possible
