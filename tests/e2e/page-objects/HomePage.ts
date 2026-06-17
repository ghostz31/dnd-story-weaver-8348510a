import { Page } from '@playwright/test'

export class HomePage {
  constructor(public page: Page) {}

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  get createButton() {
    return this.page.getByRole('link', { name: /créer|nouveau/i })
  }

  get characterCards() {
    return this.page.locator('[data-testid="character-card"]')
  }

  async openCharacter(name: string) {
    await this.page.getByRole('link', { name }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async deleteCharacter(name: string) {
    const card = this.page.locator(`[data-testid="character-card"]:has-text("${name}")`)
    await card.getByRole('button', { name: /supprimer/i }).click()
    await this.page.getByRole('button', { name: /confirmer|oui/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async duplicateCharacter(name: string) {
    const card = this.page.locator(`[data-testid="character-card"]:has-text("${name}")`)
    await card.getByRole('button', { name: /dupliquer|duplicate/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async importCharacter(json: object) {
    const fileChooserPromise = this.page.waitForEvent('filechooser')
    await this.page.getByRole('button', { name: /importer/i }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'character.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(json)),
    })
    await this.page.waitForLoadState('networkidle')
  }

  async getCharacterCount(): Promise<number> {
    return await this.characterCards.count()
  }
}
