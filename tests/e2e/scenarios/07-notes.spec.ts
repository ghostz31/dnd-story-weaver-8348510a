import { test, expect } from '@playwright/test'
import { WizardSteps } from '../page-objects/WizardSteps'
import { CharacterSheet } from '../page-objects/CharacterSheet'

test('Notes - create a session note', async ({ page }) => {
  const wizard = new WizardSteps(page)
  await wizard.createFullCharacter('TestNotes', 'Gnome', 'Magicien', 1)

  const sheet = new CharacterSheet(page)

  // Add a note
  await sheet.addNote('Session 1', 'Le groupe a vaincu le dragon.')

  // Verify page loaded without crash
  await expect(page.locator('body')).toBeVisible()
})
