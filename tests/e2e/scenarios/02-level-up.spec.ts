import { test, expect } from '@playwright/test'
import { WizardSteps } from '../page-objects/WizardSteps'
import { LevelUpPage } from '../page-objects/LevelUpPage'

test('Level up a character from 1 to 2', async ({ page }) => {
  const wizard = new WizardSteps(page)

  // Create a fresh character for this test
  await wizard.createFullCharacter('TestLevelUp', 'Humain', 'Guerrier', 1)

  // Extract character ID from URL
  const url = page.url()
  const characterId = url.split('/character/')[1]

  // Level up
  const levelUp = new LevelUpPage(page)
  await levelUp.levelUp(characterId)

  // Verify we're back on character sheet
  await expect(page).toHaveURL(/\/character\//)
})
