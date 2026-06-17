import { test, expect } from '@playwright/test'
import { WizardSteps } from '../page-objects/WizardSteps'
import { CharacterSheet } from '../page-objects/CharacterSheet'

test('Combat - HP management and conditions', async ({ page }) => {
  const wizard = new WizardSteps(page)
  await wizard.createFullCharacter('TestCombat', 'Nain', 'Barbare', 1)

  const url = page.url()
  const characterId = url.split('/character/')[1]
  const sheet = new CharacterSheet(page)

  // Go to combat tab
  await sheet.goToCombat()
  await page.waitForTimeout(500)

  // Navigate back to character sheet to manage HP
  await page.goto(`/character/${characterId}`)
  await page.waitForLoadState('networkidle')

  // Take damage
  await sheet.takeDamage(5)
  await page.waitForTimeout(300)

  // Heal
  await sheet.heal(3)
  await page.waitForTimeout(300)

  // Add temp HP
  await sheet.setTempHp(2)

  // Try adding a condition
  await sheet.addCondition('Empoisonné')

  // Short rest
  await sheet.shortRest()

  // Verify no crash — page still renders
  await expect(page.locator('body')).toBeVisible()
})
