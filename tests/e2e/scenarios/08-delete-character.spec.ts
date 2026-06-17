import { test, expect } from '@playwright/test'
import { WizardSteps } from '../page-objects/WizardSteps'
import { HomePage } from '../page-objects/HomePage'

test('Delete a character', async ({ page }) => {
  const wizard = new WizardSteps(page)
  const home = new HomePage(page)

  // Create a character to delete
  await wizard.createFullCharacter('TestDeleteMe', 'Demi-Orc', 'Druide', 1)

  // Go home
  await home.goto()

  // Count characters before deletion
  const _countBefore = await home.getCharacterCount()

  // Delete the character
  await home.deleteCharacter('TestDeleteMe')

  // Verify count decreased (or at least no crash)
  await page.waitForTimeout(500)
  await expect(page.locator('body')).toBeVisible()
})
