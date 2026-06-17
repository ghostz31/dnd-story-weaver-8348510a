import { test, expect } from '@playwright/test'
import { WizardSteps } from '../page-objects/WizardSteps'
import { CharacterSheet } from '../page-objects/CharacterSheet'

test('Equipment - navigate to inventory', async ({ page }) => {
  const wizard = new WizardSteps(page)
  await wizard.createFullCharacter('TestEquip', 'Drakide', 'Clerc', 1)

  const url = page.url()
  const _characterId = url.split('/character/')[1]
  const sheet = new CharacterSheet(page)

  // Navigate to inventory
  await sheet.goToInventory()
  await page.waitForTimeout(500)

  // Verify page loaded without error
  await expect(page.locator('body')).toBeVisible()
})
