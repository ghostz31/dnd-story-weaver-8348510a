import { test, expect } from '@playwright/test'
import { WizardSteps } from '../page-objects/WizardSteps'
import { HomePage } from '../page-objects/HomePage'

test('Create character - full wizard flow', async ({ page }) => {
  const wizard = new WizardSteps(page)
  const home = new HomePage(page)

  await wizard.createFullCharacter('TestAelric', 'Elfe', 'Roublard', 1)

  // Verify we landed on character sheet
  await expect(page).toHaveURL(/\/character\//)

  // Go back home and verify the character appears
  await home.goto()
  await expect(page.locator('text=TestAelric')).toBeVisible({ timeout: 5000 })
})
