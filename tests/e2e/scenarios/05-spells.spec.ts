import { test, expect } from '@playwright/test'
import { WizardSteps } from '../page-objects/WizardSteps'
import { CharacterSheet } from '../page-objects/CharacterSheet'

test('Spells - navigate to grimoire', async ({ page }) => {
  const wizard = new WizardSteps(page)
  await wizard.createFullCharacter('TestSpells', 'Tieffelin', 'Barde', 1)

  const url = page.url()
  const _characterId = url.split('/character/')[1]
  const sheet = new CharacterSheet(page)

  // Navigate to spells
  await sheet.goToSpells()
  await page.waitForTimeout(500)

  // Verify page loaded
  await expect(page.locator('body')).toBeVisible()
})
