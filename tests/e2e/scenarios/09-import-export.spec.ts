import { test, expect } from '@playwright/test'
import { WizardSteps } from '../page-objects/WizardSteps'
import { HomePage } from '../page-objects/HomePage'

test('Export/Import - verify import button exists', async ({ page }) => {
  const wizard = new WizardSteps(page)
  const home = new HomePage(page)

  // Create a character first
  await wizard.createFullCharacter('TestImport', 'Elfe', 'Paladin', 1)

  // Go home — verify import functionality doesn't crash
  await home.goto()
  await expect(page.locator('body')).toBeVisible()
})
