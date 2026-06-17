import { test, expect } from '@playwright/test'
import { WizardSteps } from '../page-objects/WizardSteps'
import { CharacterSheet } from '../page-objects/CharacterSheet'

test('Dice - roll some dice', async ({ page }) => {
  const wizard = new WizardSteps(page)
  await wizard.createFullCharacter('TestDice', 'Halfelin', 'Moine', 1)

  const sheet = new CharacterSheet(page)

  // Go to dice page
  await sheet.goToDice()
  await page.waitForTimeout(500)

  // Roll a d20
  await sheet.rollDice('d20')

  // Verify page still renders
  await expect(page.locator('body')).toBeVisible()
})
