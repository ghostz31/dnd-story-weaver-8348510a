import { Page } from '@playwright/test'

export class LevelUpPage {
  constructor(public page: Page) {}

  async goto(characterId: string) {
    await this.page.goto(`/level-up/${characterId}`)
    await this.page.waitForLoadState('networkidle')
  }

  async gotoFromCharacter(characterId: string) {
    await this.page.goto(`/character/${characterId}`)
    await this.page.waitForLoadState('networkidle')
    // Click level up button on character sheet
    const levelUpBtn = this.page.getByRole('button', { name: /monter de niveau|level up|niveau/i })
    if (await levelUpBtn.isVisible()) {
      await levelUpBtn.click()
    } else {
      await this.page.goto(`/level-up/${characterId}`)
    }
    await this.page.waitForLoadState('networkidle')
  }

  async nextStep() {
    await this.page.getByRole('button', { name: /suivant|continuer/i }).click()
    await this.page.waitForTimeout(300)
  }

  // HP Step
  async selectAverageHp() {
    const btn = this.page.getByRole('button', { name: /moyenne|average/i })
    if (await btn.isVisible()) await btn.click()
  }

  async rollHp() {
    const btn = this.page.getByRole('button', { name: /lancer|roll/i })
    if (await btn.isVisible()) await btn.click()
    await this.page.waitForTimeout(1000)
  }

  // Fighting Style
  async selectFightingStyle(style: string) {
    const btn = this.page.getByRole('button').filter({ hasText: style })
    if (await btn.isVisible({ timeout: 2000 })) await btn.click()
  }

  // Subclass
  async selectSubclass(name: string) {
    const btn = this.page.getByRole('button').filter({ hasText: name })
    if (await btn.isVisible({ timeout: 2000 })) await btn.click()
  }

  // ASI
  async applyStatsBoost(ability: string, points: number = 2) {
    const plusBtn = this.page.locator(`button[aria-label*="+${ability}"]`).or(
      this.page.locator('button').filter({ hasText: '+' }).first()
    )
    for (let i = 0; i < points; i++) {
      if (await plusBtn.isVisible()) await plusBtn.click()
      await this.page.waitForTimeout(100)
    }
  }

  // Spells
  async skipSpells() {
    const nextBtn = this.page.getByRole('button', { name: /suivant|continuer/i })
    if (await nextBtn.isVisible({ timeout: 2000 })) return
  }

  // Confirm
  async confirmLevelUp() {
    await this.page.getByRole('button', { name: /confirmer|appliquer|valider/i }).click()
    await this.page.waitForURL(/\/character\//, { timeout: 10000 })
  }

  // Full level-up flow
  async levelUp(characterId: string) {
    await this.gotoFromCharacter(characterId)

    // Intro
    await this.nextStep()

    // HP
    await this.selectAverageHp()
    await this.nextStep()

    // Fighting Style (skip if not visible)
    await this.nextStep()

    // Subclass (skip if not visible)
    await this.nextStep()

    // ASI (skip if not visible)
    await this.nextStep()

    // Spells (skip if not visible)
    await this.skipSpells()
    await this.nextStep()

    // Confirm
    await this.confirmLevelUp()
  }
}
