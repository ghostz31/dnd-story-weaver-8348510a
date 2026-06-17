import { Page } from '@playwright/test'

export class CharacterSheet {
  constructor(public page: Page) {}

  async goto(characterId: string) {
    await this.page.goto(`/character/${characterId}`)
    await this.page.waitForLoadState('networkidle')
  }

  // HP Management
  async setCurrentHp(hp: number) {
    const input = this.page.getByLabel(/pv actuels|current hp/i).or(
      this.page.locator('input[type="number"]').first()
    )
    if (await input.isVisible()) {
      await input.fill(String(hp))
      await input.press('Enter')
    }
  }

  async setTempHp(hp: number) {
    const input = this.page.getByLabel(/pv temporaires|temp hp/i)
    if (await input.isVisible()) {
      await input.fill(String(hp))
      await input.press('Enter')
    }
  }

  async takeDamage(amount: number) {
    const btn = this.page.getByRole('button', { name: /dégâts|damage|subir/i })
    if (await btn.isVisible()) {
      await btn.click()
      await this.page.waitForTimeout(200)
      await this.page.locator('input').fill(String(amount))
      await this.page.getByRole('button', { name: /confirmer|ok/i }).click()
    }
  }

  async heal(amount: number) {
    const btn = this.page.getByRole('button', { name: /soin|heal/i })
    if (await btn.isVisible()) {
      await btn.click()
      await this.page.waitForTimeout(200)
      await this.page.locator('input').fill(String(amount))
      await this.page.getByRole('button', { name: /confirmer|ok/i }).click()
    }
  }

  // Conditions
  async addCondition(condition: string) {
    await this.page.getByRole('button', { name: /condition|état/i }).click()
    await this.page.waitForTimeout(200)
    const btn = this.page.getByRole('button').filter({ hasText: condition })
    if (await btn.isVisible()) await btn.click()
  }

  async removeCondition(condition: string) {
    const conditionChip = this.page.locator(`[data-condition="${condition}"]`)
    if (await conditionChip.isVisible()) {
      await conditionChip.getByRole('button').click()
    }
  }

  // Death Saves
  async markDeathSave(isSuccess: boolean) {
    const btn = this.page.getByRole('button', { name: isSuccess ? /succès|success/i : /échec|fail/i })
    if (await btn.isVisible()) await btn.click()
  }

  // Short/Long Rest
  async shortRest() {
    await this.page.getByRole('button', { name: /repos court|short rest/i }).click()
    await this.page.waitForTimeout(500)
  }

  async longRest() {
    await this.page.getByRole('button', { name: /repos long|long rest/i }).click()
    await this.page.waitForTimeout(500)
  }

  // Navigation tabs
  async goToCombat() {
    await this.page.getByRole('tab', { name: /combat/i }).or(
      this.page.getByRole('link', { name: /combat/i })
    ).click()
    await this.page.waitForLoadState('networkidle')
  }

  async goToInventory() {
    await this.page.getByRole('tab', { name: /inventaire|équipement/i }).or(
      this.page.getByRole('link', { name: /inventaire/i })
    ).click()
    await this.page.waitForLoadState('networkidle')
  }

  async goToSpells() {
    await this.page.getByRole('tab', { name: /grimoire|sorts/i }).or(
      this.page.getByRole('link', { name: /sorts|grimoire/i })
    ).click()
    await this.page.waitForLoadState('networkidle')
  }

  async goToNotes() {
    await this.page.getByRole('tab', { name: /notes/i }).or(
      this.page.getByRole('link', { name: /notes/i })
    ).click()
    await this.page.waitForLoadState('networkidle')
  }

  async goToDice() {
    await this.page.getByRole('tab', { name: /dés|dice/i }).or(
      this.page.getByRole('link', { name: /dés|dice/i })
    ).click()
    await this.page.waitForLoadState('networkidle')
  }

  // Equipment
  async equipItem(itemName: string) {
    const item = this.page.locator(`[data-testid="inventory-item"]:has-text("${itemName}")`)
    if (await item.isVisible()) {
      await item.click()
    }
  }

  async unequipItem(itemName: string) {
    const item = this.page.locator(`[data-testid="equipped-item"]:has-text("${itemName}")`)
    if (await item.isVisible()) {
      await item.click()
    }
  }

  // Dice
  async rollDice(die: string = 'd20') {
    await this.goToDice()
    const btn = this.page.getByRole('button').filter({ hasText: die })
    if (await btn.isVisible()) await btn.click()
    await this.page.waitForTimeout(500)
  }

  // Notes
  async addNote(title: string, content: string) {
    await this.goToNotes()
    const addBtn = this.page.getByRole('button', { name: /ajouter|nouvelle note/i })
    if (await addBtn.isVisible()) await addBtn.click()
    await this.page.locator('input[name="title"]').fill(title)
    await this.page.locator('textarea').fill(content)
    await this.page.getByRole('button', { name: /sauvegarder|save/i }).click()
    await this.page.waitForTimeout(500)
  }
}
