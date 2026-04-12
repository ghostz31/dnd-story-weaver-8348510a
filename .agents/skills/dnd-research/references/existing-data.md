# Existing Besace Data

Summary of what D&D data already exists in the codebase. Check before adding duplicates.

## Races (`src/data/races.ts`)
Currently implemented races (search for exact list):
- Humain, Elfe, Nain, Halfelin, Gnome, Demi-Elfe, Demi-Orc, Tieffelin, Drakéide
- Some have subraces (e.g. Elfe → Haut-Elfe, Elfe des bois, Elfe noir)

## Classes (`src/data/classes.ts`)
All 12 PHB classes are defined with:
- `hitDie`, `primaryAbility`, `savingThrows`, `skillChoices`, `numSkillChoices`
- `armorProficiencies`, `weaponProficiencies`, `startingEquipment`
- `spellcasting` (for casters)

Classes: Barbare, Barde, Clerc, Druide, Ensorceleur, Guerrier, Magicien, Moine, Occultiste, Paladin, Rôdeur, Roublard

## Subclasses (`src/data/subclasses.ts`)
Some subclasses implemented — check file for coverage gaps.

## Class Features (`src/data/classFeatures.ts`)
Level-based features per class — check file for completeness per level.

## Spells (`src/data/spells.ts`)
Limited set of spells. **This is a major gap** — expanding the spell database is high-priority.
Fields: `name`, `level`, `school`, `castingTime`, `range`, `components`, `duration`, `classes`, `description`, `source`, `ritual`

## Equipment (`src/data/equipment.ts`)
Equipment packs and starting equipment options. Check existing items before adding.

## Backgrounds (`src/data/backgrounds.ts`)
Background options with personality traits, ideals, bonds, flaws.

## Weapons (`src/types/combat.ts`)
`baseWeapons` array has all PHB simple and martial weapons with French names, damage dice, damage types, ranges, and properties.

## Key Gaps to Fill
1. **Spells** — Very incomplete, needs hundreds more entries
2. **Class features** — May have gaps at higher levels
3. **Subclasses** — Incomplete coverage
4. **Magic items** — Not yet implemented
5. **Feats** — Not yet implemented
6. **Conditions** — Only labels exist, no detailed descriptions
7. **Monsters** — Not implemented (low priority for character sheet app)
