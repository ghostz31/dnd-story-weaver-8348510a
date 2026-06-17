/**
 * Moteur de Rules - Applique les rules Aurora aux personnages
 * 
 * Version fonctionnelle qui applique réellement les rules aux personnages
 */

import type { 
  Rule, 
  GrantRule, 
  SelectRule, 
  StatRule, 
  SetRule,
  ConditionRule,
  ResourceRule,
  ACRule,
  SpeedRule,
  AttackBonusRule,
  DamageBonusRule,
  SaveBonusRule,
  SpellRule
} from '../types/aurora-v2'
import type { Character, AbilityScores } from '../types/character'
import { normalizeClassId } from './feature-helpers'

// ============================================================================
// TYPES POUR LE MOTEUR
// ============================================================================

export interface RuleContext {
  character: Character
  level?: number
  source: string // 'race', 'class', 'feat', 'item'
  sourceId: string
}

export interface RuleResult {
  success: boolean
  changes: RuleChange[]
  errors: string[]
}

export interface RuleChange {
  type: 'add' | 'remove' | 'set' | 'modify'
  path: string
  value: unknown
  description: string
}

// ============================================================================
// MOTEUR DE RULES PRINCIPAL
// ============================================================================

/**
 * Applique une liste de rules à un personnage
 */
export function applyRules(
  rules: Rule[],
  context: RuleContext
): RuleResult {
  const result: RuleResult = {
    success: true,
    changes: [],
    errors: [],
  }

  for (const rule of rules) {
    try {
      const changes = applySingleRule(rule, context)
      result.changes.push(...changes)
    } catch (error) {
      result.errors.push(`Erreur lors de l'application de la rule ${rule.type}: ${error}`)
    }
  }

  return result
}

/**
 * Applique une rule unique
 */
function applySingleRule(rule: Rule, context: RuleContext): RuleChange[] {
  switch (rule.type) {
    case 'grant':
      return applyGrantRule(rule as GrantRule, context)
    case 'select':
      return applySelectRule(rule as SelectRule, context)
    case 'stat':
      return applyStatRule(rule as StatRule, context)
    case 'set':
      return applySetRule(rule as SetRule, context)
    case 'condition':
      return applyConditionRule(rule as ConditionRule, context)
    case 'resource':
      return applyResourceRule(rule as ResourceRule, context)
    case 'ac':
      return applyACRule(rule as ACRule, context)
    case 'speed':
      return applySpeedRule(rule as SpeedRule, context)
    case 'attack_bonus':
      return applyAttackBonusRule(rule as AttackBonusRule, context)
    case 'damage_bonus':
      return applyDamageBonusRule(rule as DamageBonusRule, context)
    case 'save_bonus':
      return applySaveBonusRule(rule as SaveBonusRule, context)
    case 'spell':
      return applySpellRule(rule as SpellRule, context)
    default:
      return [{
        type: 'add',
        path: 'features',
        value: rule,
        description: `Rule ${(rule as any).type} non implémentée depuis ${context.source}`
      }]
  }
}

// ============================================================================
// APPLICATION DES RULES SPÉCIFIQUES
// ============================================================================

function applyGrantRule(rule: GrantRule, context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []
  const { targetType, targetId } = rule

  switch (targetType) {
    case 'proficiency':
      if (targetId.startsWith('ID_SKILL_')) {
        const skillId = targetId.replace('ID_SKILL_', '').toLowerCase()
        if (!context.character.skillProficiencies.includes(skillId)) {
          context.character.skillProficiencies.push(skillId)
          changes.push({
            type: 'add',
            path: 'skillProficiencies',
            value: skillId,
            description: `Maîtrise de la compétence ${skillId}`
          })
        }
      } else if (targetId.startsWith('ID_WEAPON_')) {
        const weaponId = targetId.replace('ID_WEAPON_', '').toLowerCase()
        // Les armes sont gérées différemment
        changes.push({
          type: 'add',
          path: 'weaponProficiencies',
          value: weaponId,
          description: `Maîtrise de l'arme ${weaponId}`
        })
      } else if (targetId.startsWith('ID_ARMOR_')) {
        const armorId = targetId.replace('ID_ARMOR_', '').toLowerCase()
        changes.push({
          type: 'add',
          path: 'armorProficiencies',
          value: armorId,
          description: `Maîtrise de l'armure ${armorId}`
        })
      } else if (targetId.startsWith('ID_SAVE_')) {
        const saveId = targetId.replace('ID_SAVE_', '').toLowerCase()
        if (!context.character.savingThrowProficiencies.includes(saveId)) {
          context.character.savingThrowProficiencies.push(saveId)
          changes.push({
            type: 'add',
            path: 'savingThrowProficiencies',
            value: saveId,
            description: `Maîtrise du jet de sauvegarde ${saveId}`
          })
        }
      }
      break

    case 'language':
      if (!context.character.languages.includes(targetId)) {
        context.character.languages.push(targetId)
        changes.push({
          type: 'add',
          path: 'languages',
          value: targetId,
          description: `Langue: ${targetId}`
        })
      }
      break

    case 'trait':
      // Les traits sont gérés dans race.traits ou classFeatures
      changes.push({
        type: 'add',
        path: 'traits',
        value: targetId,
        description: `Trait racial: ${targetId}`
      })
      break

    case 'spell':
      // TODO: Implémenter l'ajout de sorts en convertissant l'ID en objet Spell
      // Pour l'instant, on enregistre juste le changement sans modifier le personnage
      changes.push({
        type: 'add',
        path: 'spellcasting.knownSpells',
        value: targetId,
        description: `Sort connu: ${targetId} (à convertir en objet Spell)`
      })
      break

    case 'feature':
      changes.push({
        type: 'add',
        path: 'features',
        value: targetId,
        description: `Capacité: ${targetId}`
      })
      break

    case 'item':
      changes.push({
        type: 'add',
        path: 'equipment',
        value: targetId,
        description: `Équipement: ${targetId}`
      })
      break
  }

  return changes
}

function applySelectRule(rule: SelectRule, context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []
  
  // Pour les rules de sélection, on enregistre simplement la disponibilité
  // Le choix réel sera fait par l'utilisateur
  changes.push({
    type: 'add',
    path: 'selections',
    value: {
      name: rule.name,
      targetType: rule.targetType,
      count: rule.count,
      options: rule.options,
      source: context.source,
      sourceId: context.sourceId
    },
    description: `Sélection: ${rule.name} (${rule.count} choix parmi ${Array.isArray(rule.options) ? rule.options.length : 'any'})`
  })

  return changes
}

function applyStatRule(rule: StatRule, context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []
  const { stat, value, bonus, max: statMax } = rule

  if (stat in context.character.abilityScores) {
    const currentValue = context.character.abilityScores[stat as keyof AbilityScores] || 10
    const newValue = typeof value === 'number' 
      ? value 
      : evaluateExpression(value, context)
    
    // Applique le bonus plutôt que de remplacer
    const finalValue = currentValue + newValue
    
    // Limite à 20 par défaut, ou à la valeur max spécifiée (ex: 24 pour Champion primitif)
    const cap = statMax ?? 20
    context.character.abilityScores[stat as keyof AbilityScores] = Math.min(finalValue, cap)
    
    changes.push({
      type: 'modify',
      path: `abilityScores.${stat}`,
      value: newValue,
      description: `${stat.toUpperCase()} ${bonus ? `[${bonus}]` : ''}: ${currentValue} → ${Math.min(finalValue, cap)}`
    })
  } else if (stat === 'speed') {
    const currentSpeed = context.character.speed || 0
    const newSpeed = typeof value === 'number' ? value : evaluateExpression(value, context)
    context.character.speed = currentSpeed + newSpeed
    
    changes.push({
      type: 'modify',
      path: 'speed',
      value: newSpeed,
      description: `Vitesse ${bonus ? `[${bonus}]` : ''}: ${currentSpeed}m → ${currentSpeed + newSpeed}m`
    })
  } else if (stat === 'hp') {
    // Bonus aux PV (comme Ténacité naine)
    const currentMaxHP = context.character.hp.max
    const bonusHP = typeof value === 'number' ? value : evaluateExpression(value, context)
    context.character.hp.max += bonusHP
    context.character.hp.current += bonusHP
    
    changes.push({
      type: 'modify',
      path: 'hp.max',
      value: bonusHP,
      description: `PV max ${bonus ? `[${bonus}]` : ''}: ${currentMaxHP} → ${currentMaxHP + bonusHP}`
    })
  } else if (stat === 'ac') {
    // Bonus à la CA (comme Défense sans armure)
    const currentAC = context.character.ac
    const bonusAC = typeof value === 'number' ? value : evaluateExpression(value, context)
    context.character.ac = currentAC + bonusAC
    
    changes.push({
      type: 'modify',
      path: 'ac',
      value: bonusAC,
      description: `CA ${bonus ? `[${bonus}]` : ''}: ${currentAC} → ${currentAC + bonusAC}`
    })
  }

  return changes
}

function applySetRule(rule: SetRule, context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []
  
  // Conversion via unknown pour éviter l'erreur de type
  const charRecord = context.character as unknown as Record<string, unknown>
  setNestedValue(charRecord, rule.property, rule.value)
  
  changes.push({
    type: 'set',
    path: rule.property,
    value: rule.value,
    description: `${rule.property} = ${rule.value}`
  })

  return changes
}

function applyConditionRule(rule: ConditionRule, context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []
  const char = context.character

  // Stocker les conditions/effets dans activeEffects
  if (!char.activeEffects) char.activeEffects = []
  if (!char.activeEffects.includes(rule.condition)) {
    char.activeEffects.push(rule.condition)
  }

  changes.push({
    type: 'add',
    path: 'activeEffects',
    value: rule.condition,
    description: `Condition: ${rule.condition}`
  })

  return changes
}

function applyResourceRule(rule: ResourceRule, context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []
  const char = context.character
  const level = context.level || char.level || 1
  const max = rule.progression[Math.min(level, 20) - 1] || 0

  if (!char.subclassResources) char.subclassResources = {}
  char.subclassResources[rule.id] = {
    current: max,
    max
  }

  changes.push({
    type: 'add',
    path: `subclassResources.${rule.id}`,
    value: { current: max, max },
    description: `Ressource ${rule.name}: ${max} utilisations (recovery: ${rule.recovery})`
  })

  return changes
}

function applyACRule(rule: ACRule, context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []
  const char = context.character
  const dexMod = getAbilityModifier(char.abilityScores.dex)
  const conMod = getAbilityModifier(char.abilityScores.con)
  const wisMod = getAbilityModifier(char.abilityScores.wis)

  let newAC = 10
  const formula = rule.formula.toLowerCase()

  if (formula.includes('base')) {
    newAC = char.ac || 10
  } else {
    newAC = 10
  }

  if (formula.includes('dex')) newAC += dexMod
  if (formula.includes('con')) newAC += conMod
  if (formula.includes('wis')) newAC += wisMod

  const bonusMatch = formula.match(/\+\s*(\d+)/)
  if (bonusMatch) newAC += parseInt(bonusMatch[1], 10)

  // Ne remplacer que si meilleur que l'actuel (pour ne pas écraser l'armure)
  if (newAC > (char.ac || 10)) {
    char.ac = newAC
    changes.push({
      type: 'modify',
      path: 'ac',
      value: newAC,
      description: `CA ${rule.condition ? `[${rule.condition}]` : ''}: ${newAC}`
    })
  }

  return changes
}

function applySpeedRule(rule: SpeedRule, context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []
  const char = context.character
  const bonus = typeof rule.value === 'number' ? rule.value : evaluateExpression(rule.value, context)

  char.speed += bonus
  changes.push({
    type: 'modify',
    path: 'speed',
    value: bonus,
    description: `Vitesse ${rule.condition ? `[${rule.condition}]` : ''}: +${bonus}m`
  })

  return changes
}

function applyAttackBonusRule(rule: AttackBonusRule, context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []
  const bonus = typeof rule.value === 'number' ? rule.value : evaluateExpression(rule.value, context)

  changes.push({
    type: 'modify',
    path: 'attackBonus',
    value: bonus,
    description: `Bonus d'attaque ${rule.condition ? `[${rule.condition}]` : ''}: +${bonus}`
  })

  return changes
}

function applyDamageBonusRule(rule: DamageBonusRule, context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []
  const bonus = typeof rule.value === 'number' ? rule.value : evaluateExpression(rule.value, context)

  changes.push({
    type: 'modify',
    path: 'damageBonus',
    value: bonus,
    description: `Bonus de dégâts ${rule.condition ? `[${rule.condition}]` : ''}: +${bonus}${rule.damageType ? ` (${rule.damageType})` : ''}`
  })

  return changes
}

function applySaveBonusRule(rule: SaveBonusRule, context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []
  const bonus = typeof rule.value === 'number' ? rule.value : evaluateExpression(rule.value, context)

  changes.push({
    type: 'modify',
    path: `saveBonus.${rule.save}`,
    value: bonus,
    description: `Bonus de sauvegarde ${rule.save.toUpperCase()} ${rule.condition ? `[${rule.condition}]` : ''}: +${bonus}`
  })

  return changes
}

function applySpellRule(rule: SpellRule, _context: RuleContext): RuleChange[] {
  const changes: RuleChange[] = []

  changes.push({
    type: 'add',
    path: 'spellcasting.bonusSpells',
    value: rule.spellId,
    description: `Sort${rule.alwaysPrepared ? ' toujours préparé' : rule.alwaysKnown ? ' toujours connu' : ''}: ${rule.spellId}`
  })

  return changes
}

// ============================================================================
// HELPERS D'ÉVALUATION
// ============================================================================

/**
 * Évaluateur mathématique sécurisé — sans eval() ni new Function().
 * Supporte: nombres, +, -, *, /, parenthèses, Math.floor(), Math.ceil()
 */
function safeMathEval(expr: string): number {
  const tokens = tokenize(expr)
  let pos = 0

  function tokenize(s: string): string[] {
    const result: string[] = []
    let i = 0
    while (i < s.length) {
      if (/\s/.test(s[i])) { i++; continue }
      if (s.startsWith('Math.floor', i)) { result.push('floor'); i += 10; continue }
      if (s.startsWith('Math.ceil', i)) { result.push('ceil'); i += 9; continue }
      if (/[\d.]/.test(s[i])) {
        let num = ''
        while (i < s.length && /[\d.]/.test(s[i])) { num += s[i]; i++ }
        result.push(num)
        continue
      }
      if ('+-*/()'.includes(s[i])) { result.push(s[i]); i++; continue }
      i++
    }
    return result
  }

  function peek(): string | undefined { return tokens[pos] }
  function consume(): string { return tokens[pos++] }
  function expect(expected: string): void {
    if (peek() !== expected) throw new Error(`Expected ${expected}, got ${peek()}`)
    consume()
  }

  function parseExpression(): number {
    let val = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const op = consume()
      const right = parseTerm()
      val = op === '+' ? val + right : val - right
    }
    return val
  }

  function parseTerm(): number {
    let val = parseFactor()
    while (peek() === '*' || peek() === '/') {
      const op = consume()
      const right = parseFactor()
      if (op === '/' && right === 0) throw new Error('Division by zero')
      val = op === '*' ? val * right : val / right
    }
    return val
  }

  function parseFactor(): number {
    if (peek() === '(') {
      consume()
      const val = parseExpression()
      expect(')')
      return val
    }
    if (peek() === 'floor' || peek() === 'ceil') {
      const fn = consume()
      expect('(')
      const val = parseExpression()
      expect(')')
      return fn === 'floor' ? Math.floor(val) : Math.ceil(val)
    }
    if (peek() === '-') {
      consume()
      return -parseFactor()
    }
    const num = consume()
    if (num === undefined || isNaN(Number(num))) throw new Error(`Unexpected token: ${num}`)
    return Number(num)
  }

  const result = parseExpression()
  if (pos !== tokens.length) throw new Error(`Unexpected tokens after expression end`)
  return result
}

/**
 * Évalue une expression avec variables
 */
export function evaluateExpression(
  expression: string,
  context: RuleContext
): number {
  // Remplace les variables
  let evalExpression = expression
    .replace(/\$\(level\)/g, String(context.level || context.character.level || 1))
    .replace(/\$\(proficiency\)/g, String(getProficiencyBonus(context.character.level || 1)))
    .replace(/\$\(str:modifier\)/g, String(getAbilityModifier(context.character.abilityScores.str)))
    .replace(/\$\(dex:modifier\)/g, String(getAbilityModifier(context.character.abilityScores.dex)))
    .replace(/\$\(con:modifier\)/g, String(getAbilityModifier(context.character.abilityScores.con)))
    .replace(/\$\(int:modifier\)/g, String(getAbilityModifier(context.character.abilityScores.int)))
    .replace(/\$\(wis:modifier\)/g, String(getAbilityModifier(context.character.abilityScores.wis)))
    .replace(/\$\(cha:modifier\)/g, String(getAbilityModifier(context.character.abilityScores.cha)))
  
  // Fonctions mathématiques simples
  evalExpression = evalExpression
    .replace(/floor\(/g, 'Math.floor(')
    .replace(/ceil\(/g, 'Math.ceil(')
  
  try {
    // Évaluation sécurisée via parser mathématique maison
    if (/^[\d\s+\-*/().Math.floorceil]+$/.test(evalExpression)) {
      return safeMathEval(evalExpression)
    }
    return 0
  } catch {
    return 0
  }
}

/**
 * Calcule le bonus de maîtrise basé sur le niveau
 */
export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2
}

/**
 * Extrait la valeur d'une propriété imbriquée
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  
  return current
}

/**
 * Définit une valeur dans une propriété imbriquée
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const parts = path.split('.')
  let current: Record<string, unknown> = obj
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {}
    }
    current = current[part] as Record<string, unknown>
  }
  
  current[parts[parts.length - 1]] = value
}

// ============================================================================
// HELPERS DE CONVERSION
// ============================================================================

/**
 * Convertit les modificateurs d'abilité en bonus
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/**
 * Calcule le score d'initiative
 */
export function calculateInitiative(character: Character): number {
  const dexMod = getAbilityModifier(character.abilityScores.dex)
  const initiative = dexMod

  const classId = normalizeClassId(character.class?.id)
  const level = character.level

  // Instinct sauvage du Barbare (niveau 7+) : avantage = on ne modifie pas le score mais on note l'effet
  // Pour le calcul brut, on ajoute +5 (équivalent de l'avantage en moyenne)
  if (classId === 'barbarian' && level >= 7) {
    // L'avantage est noté comme un effet actif, pas un bonus numérique fixe
    if (!character.activeEffects) character.activeEffects = []
    if (!character.activeEffects.includes('advantage-initiative')) {
      character.activeEffects.push('advantage-initiative')
    }
  }

  return initiative
}

/**
 * Calcule la CA totale
 */
export function calculateAC(character: Character): number {
  // TODO: Implémenter le calcul complet avec armures, boucliers, etc.
  // Pour l'instant, retourne la CA de base
  return character.ac || 10
}

/**
 * Applique les rules d'une race à un personnage
 */
export function applyRaceRules(character: Character, raceId: string, rules: Rule[]): RuleResult {
  return applyRules(rules, {
    character,
    source: 'race',
    sourceId: raceId
  })
}

/**
 * Applique les rules d'une classe à un personnage
 */
export function applyClassRules(character: Character, classId: string, level: number, rules: Rule[]): RuleResult {
  return applyRules(rules, {
    character,
    level,
    source: 'class',
    sourceId: classId
  })
}

/**
 * Applique les rules d'un don à un personnage
 */
export function applyFeatRules(character: Character, featId: string, rules: Rule[]): RuleResult {
  return applyRules(rules, {
    character,
    source: 'feat',
    sourceId: featId
  })
}
