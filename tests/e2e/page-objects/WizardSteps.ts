import { Page } from '@playwright/test'

export class WizardSteps {
  constructor(public page: Page) {}

  async goto() {
    await this.page.goto('/create')
    await this.page.waitForLoadState('networkidle')
  }

  async nextStep() {
    await this.page.getByRole('button', { name: /suivant|continuer/i }).click()
    await this.page.waitForTimeout(300)
  }

  async prevStep() {
    await this.page.getByRole('button', { name: /précédent|retour/i }).click()
    await this.page.waitForTimeout(300)
  }

  // Step 1: Name
  async fillName(name: string) {
    const input = this.page.getByPlaceholder(/ex: thordak|nom.*personnage/i)
    if (await input.isVisible()) {
      await input.fill(name)
    } else {
      const allInputs = this.page.locator('input')
      if (await allInputs.first().isVisible()) {
        await allInputs.first().fill(name)
      }
    }
  }

  async clickNameSuggestion(index: number = 0) {
    const buttons = this.page.locator('button').filter({ hasText: /Aldric|Elara|Theron|Lyra|Grom|Seraphina|Thordak|Mordreth|Sylva|Borin|Nyx|Kael|Vex/ })
    const count = await buttons.count()
    if (count > 0) {
      await buttons.nth(Math.min(index, count - 1)).click()
    }
  }

  // Step 2: Race
  async selectRace(raceName: string) {
    await this.page.waitForSelector('button', { timeout: 10000 })
    await this.page.locator('button').filter({ hasText: new RegExp(raceName, 'i') }).first().click()
    await this.page.waitForTimeout(300)
  }

  // Step 3: Class
  async setLevel(level: number) {
    const buttons = this.page.locator('button')
    // Try + button to increase level
    const plusBtn = buttons.filter({ hasText: '+' })
    for (let i = 1; i < level; i++) {
      if (await plusBtn.isVisible()) await plusBtn.click()
      await this.page.waitForTimeout(100)
    }
  }

  async selectClass(className: string) {
    await this.page.waitForSelector('button', { timeout: 10000 })
    await this.page.locator('button').filter({ hasText: new RegExp(className, 'i') }).first().click()
    await this.page.waitForTimeout(300)
  }

  // Step 4: Abilities
  async selectStandardArray() {
    await this.page.getByRole('button', { name: /standard|répartition/i }).click()
    await this.page.waitForTimeout(200)
  }

  async rollDice() {
    const btn = this.page.getByRole('button', { name: /lancer|roll/i })
    if (await btn.isVisible()) {
      await btn.click()
      await this.page.waitForTimeout(500)
    }
  }

  async assignScore(ability: string, score: number) {
    const select = this.page.locator(`select[aria-label*="${ability}"]`)
    if (await select.isVisible()) {
      await select.selectOption(String(score))
    }
  }

  // Step 5: Proficiencies
  async selectSkill(skillName: string) {
    await this.page.getByRole('button').filter({ hasText: skillName }).click()
    await this.page.waitForTimeout(200)
  }

  async selectAllClassSkills() {
    const skillButtons = this.page.locator('button').filter({ hasText: /Athlétisme|Acrobaties|Discrétion|Escamotage|Arcanes|Histoire|Investigation|Nature|Religion|Dressage|Médecine|Perception|Perspicacité|Survie|Intimidation|Persuasion|Représentation|Tromperie/i })
    const count = await skillButtons.count()
    for (let i = 0; i < Math.min(count, 4); i++) {
      await skillButtons.nth(i).click()
      await this.page.waitForTimeout(100)
    }
  }

  // Step 6: Options
  async skipOptions() {
    // Some classes have no options at this level
    const nextBtn = this.page.getByRole('button', { name: /suivant|continuer/i })
    if (await nextBtn.isVisible({ timeout: 2000 })) {
      // Check if we can proceed (no mandatory options)
      const canProceed = !(await nextBtn.isDisabled())
      if (canProceed) return
    }
  }

  // Step 7: Spells
  async skipSpells() {
    const nextBtn = this.page.getByRole('button', { name: /suivant|continuer/i })
    if (await nextBtn.isVisible({ timeout: 2000 })) {
      if (!(await nextBtn.isDisabled())) return
    }
  }

  async selectSpell(spellName: string) {
    const btn = this.page.locator('button').filter({ hasText: spellName })
    if (await btn.isVisible({ timeout: 2000 })) {
      await btn.click()
    }
  }

  // Step 8: Background
  async selectBackground(name: string) {
    await this.page.locator('button').filter({ hasText: name }).first().click()
    await this.page.waitForTimeout(200)
  }

  // Step 9: Equipment
  async skipEquipment() {
    const nextBtn = this.page.getByRole('button', { name: /suivant|continuer/i })
    if (await nextBtn.isVisible({ timeout: 2000 })) {
      return
    }
  }

  // Step 10: Review
  async confirmCreate() {
    await this.page.getByRole('button', { name: /créer le personnage|créer/i }).click()
    await this.page.waitForURL(/\/character\//, { timeout: 15000 })
  }

  // Complete wizard flow
  async createFullCharacter(name: string, race: string, className: string, level: number = 1) {
    await this.goto()

    // Step 1: Name
    await this.fillName(name)
    await this.nextStep()

    // Step 2: Race
    await this.selectRace(race)
    await this.nextStep()

    // Step 3: Class
    await this.setLevel(level)
    await this.selectClass(className)
    await this.nextStep()

    // Step 4: Abilities
    await this.selectStandardArray()
    await this.nextStep()

    // Step 5: Proficiencies
    await this.selectAllClassSkills()
    await this.nextStep()

    // Step 6: Options
    await this.skipOptions()
    await this.nextStep()

    // Step 7: Spells
    await this.skipSpells()
    await this.nextStep()

    // Step 8: Background
    await this.selectBackground('Acolyte')
    await this.nextStep()

    // Step 9: Equipment
    await this.skipEquipment()
    await this.nextStep()

    // Step 10: Review
    await this.confirmCreate()
  }
}
