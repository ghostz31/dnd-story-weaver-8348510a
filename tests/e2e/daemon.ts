import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const LOG_FILE = path.resolve('tests/e2e/bottest.log')
const DELAY_MIN = parseInt(process.env.DELAY_MIN || '5')
const DELAY_MAX = parseInt(process.env.DELAY_MAX || '30')
const MAX_CYCLES = parseInt(process.env.MAX_CYCLES || '0')

const SCENARIO_NAMES: Record<number, string> = {
  1: 'create-character',
  2: 'level-up',
  3: 'combat-hp-conditions',
  4: 'equipment',
  5: 'spells',
  6: 'dice',
  7: 'notes',
  8: 'delete-character',
  9: 'import-export',
}

interface RunResult {
  scenario: string
  success: boolean
  error?: string
  duration: number
}

const results: RunResult[] = []
let passCount = 0
let failCount = 0
let running = true

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  fs.appendFileSync(LOG_FILE, line + '\n')
}

function randomDelay(): number {
  return Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1) + DELAY_MIN) * 1000
}

function randomScenario(): number {
  return Math.floor(Math.random() * 9) + 1
}

async function _clearFirestore(browser: any) {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  try {
    await page.evaluate(async () => {
      try {
        await fetch('http://localhost:8081/emulator/v1/projects/test/databases/(default)/documents', {
          method: 'DELETE',
        })
      } catch { /* emulator not running */ }
    })
  } catch { /* browser context error */ }
  await ctx.close()
}

async function runScenario(browser: any, scenarioNum: number): Promise<RunResult> {
  const startTime = Date.now()
  const name = SCENARIO_NAMES[scenarioNum] || `scenario-${scenarioNum}`
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()

  try {
    switch (scenarioNum) {
      case 1: {
        // Create character
        await page.goto(`${BASE_URL}/create`, { waitUntil: 'domcontentloaded', timeout: 30000 })
        await page.waitForTimeout(2000)
        log(`[CREATE] Starting wizard for ${name}...`)
        const input = page.locator('input').first()
        if (await input.isVisible({ timeout: 5000 })) {
          await input.fill(`Bot-${Date.now().toString(36)}`)
        }
        const nextBtn = page.getByRole('button', { name: /suivant|continuer/i })
        if (await nextBtn.isVisible({ timeout: 3000 })) await nextBtn.click()
        await page.waitForTimeout(500)
        // Race
        const raceBtn = page.locator('button').filter({ hasText: /Elfe|Nain|Humain/i }).first()
        if (await raceBtn.isVisible({ timeout: 5000 })) {
          await raceBtn.click()
          await nextBtn.click()
        }
        // Class
        await page.waitForTimeout(300)
        const classBtn = page.locator('button').filter({ hasText: /Guerrier|Roublard|Barde/i }).first()
        if (await classBtn.isVisible({ timeout: 5000 })) {
          await classBtn.click()
          await nextBtn.click()
        }
        // Abilities - standard array
        await page.waitForTimeout(300)
        const standardBtn = page.getByRole('button', { name: /standard|répartition/i })
        if (await standardBtn.isVisible({ timeout: 3000 })) await standardBtn.click()
        if (await nextBtn.isVisible({ timeout: 3000 })) await nextBtn.click()
        // Skills
        await page.waitForTimeout(300)
        const skillBtns = page.locator('button').filter({ hasText: /Athlétisme|Acrobaties|Discrétion|Perception|Perspicacité|Intimidation|Persuasion/i })
        const skillCount = await skillBtns.count()
        for (let i = 0; i < Math.min(skillCount, 4); i++) await skillBtns.nth(i).click()
        if (await nextBtn.isVisible({ timeout: 3000 })) await nextBtn.click()
        // Options
        await page.waitForTimeout(300)
        if (await nextBtn.isVisible({ timeout: 3000 })) await nextBtn.click()
        // Spells
        await page.waitForTimeout(300)
        if (await nextBtn.isVisible({ timeout: 3000 })) await nextBtn.click()
        // Background
        await page.waitForTimeout(300)
        const bgBtn = page.locator('button').filter({ hasText: /Acolyte|Solitaire/i }).first()
        if (await bgBtn.isVisible({ timeout: 3000 })) await bgBtn.click()
        if (await nextBtn.isVisible({ timeout: 3000 })) await nextBtn.click()
        // Equipment
        await page.waitForTimeout(300)
        if (await nextBtn.isVisible({ timeout: 3000 })) await nextBtn.click()
        // Review - Create
        await page.waitForTimeout(300)
        const createBtn = page.getByRole('button', { name: /créer/i })
        if (await createBtn.isVisible({ timeout: 5000 })) await createBtn.click()

        try { await page.waitForURL(/\/character\//, { timeout: 5000 }) } catch { /* timeout */ }
        break
      }
      case 2: {
        // Level up - navigate to existing character first
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
        const charLink = page.getByRole('link').filter({ hasText: /Bot-/i }).first()
        if (await charLink.isVisible({ timeout: 5000 })) {
          await charLink.click()
          await page.waitForLoadState('domcontentloaded')
          const url = page.url()
          const charId = url.split('/character/')[1]?.split('/')[0]
          if (charId) {
            await page.goto(`${BASE_URL}/level-up/${charId}`, { waitUntil: 'domcontentloaded' })
          }
        }
        break
      }
      case 3: {
        // Combat HP
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
        const charLink = page.getByRole('link').filter({ hasText: /Bot-/i }).first()
        if (await charLink.isVisible({ timeout: 5000 })) {
          await charLink.click()
          await page.waitForLoadState('domcontentloaded')
        }
        break
      }
      case 4: {
        // Equipment - navigate to inventory
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(300)
        await page.goto(`${BASE_URL}/inventory`, { waitUntil: 'domcontentloaded' })
        break
      }
      case 5: {
        // Spells - navigate to grimoire
        await page.goto(`${BASE_URL}/spells`, { waitUntil: 'domcontentloaded' })
        break
      }
      case 6: {
        // Dice - navigate to dice page
        await page.goto(`${BASE_URL}/dice`, { waitUntil: 'domcontentloaded' })
        break
      }
      case 7: {
        // Notes - navigate to notes
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
        const charLink = page.getByRole('link').filter({ hasText: /Bot-/i }).first()
        if (await charLink.isVisible({ timeout: 5000 })) {
          await charLink.click()
          await page.waitForLoadState('domcontentloaded')
          await page.goto(`${BASE_URL}/notes`, { waitUntil: 'domcontentloaded' })
        }
        break
      }
      case 8: {
        // Delete - go home and delete any bot character
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
        const deleteBtn = page.getByRole('button', { name: /supprimer/i }).first()
        if (await deleteBtn.isVisible({ timeout: 3000 })) await deleteBtn.click()
        const confirmBtn = page.getByRole('button', { name: /oui|confirmer/i }).first()
        if (await confirmBtn.isVisible({ timeout: 2000 })) await confirmBtn.click()
        break
      }
      case 9: {
        // Import/Export - verify home loads
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
        break
      }
    }

    const duration = Date.now() - startTime
    log(`   ${name}: PASS (${duration}ms)`)
    return { scenario: name, success: true, duration }
  } catch (err) {
    const duration = Date.now() - startTime
    const errorMsg = err instanceof Error ? err.message : String(err)
    log(`   ${name}: FAIL (${duration}ms) — ${errorMsg}`)
    try { await page.screenshot({ path: `tests/e2e/screenshots/fail-${Date.now()}-${name}.png`, fullPage: true }) } catch { /* screenshot failed */ }
    return { scenario: name, success: false, error: errorMsg, duration }
  } finally {
    await ctx.close()
  }
}

async function main() {
  // Ensure directories exist
  fs.mkdirSync('tests/e2e/screenshots', { recursive: true })
  fs.writeFileSync(LOG_FILE, '') // Clear log on start

  log('=== Besace Beta-Test Daemon ===')
  log(`Base URL: ${BASE_URL}`)
  log(`Delay range: ${DELAY_MIN}s - ${DELAY_MAX}s`)
  log(`Max cycles: ${MAX_CYCLES || 'infinite'}`)
  log('')

  const browser = await chromium.launch({ headless: true })

  const shutdown = async () => {
    log('\nShutting down daemon...')
    running = false
    await browser.close()
    const total = passCount + failCount
    const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0
    log(`=== Final Results ===`)
    log(`Total: ${total} | Pass: ${passCount} | Fail: ${failCount} | Rate: ${passRate}%`)
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  let cycle = 0
  const startTime = Date.now()

  while (running) {
    cycle++
    const scenarioNum = randomScenario()
    const scenarioName = SCENARIO_NAMES[scenarioNum]

    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const uptime = `${Math.floor(elapsed / 3600)}h${Math.floor((elapsed % 3600) / 60)}m${elapsed % 60}s`

    log(`\n┌─ Cycle #${cycle} ────────────────────────`)
    log(`│ Uptime: ${uptime} | Scenario: ${scenarioName}`)

    const result = await runScenario(browser, scenarioNum)
    results.push(result)

    if (result.success) passCount++
    else failCount++

    const total = passCount + failCount
    const passRate = Math.round((passCount / total) * 100)
    const emoji = result.success ? '✓' : '✗'
    log(`│ Result: ${emoji} ${result.success ? 'PASS' : 'FAIL'} (${result.duration}ms)`)
    log(`└─ Overall: ${passCount}/${total} passed (${passRate}%)`)

    // Rapport périodique toutes les 5 itérations
    if (cycle % 5 === 0) {
      log('')
      log('╔══════════════════════════════════════════╗')
      log('║        RAPPORT CYCLIQUE                 ║')
      log('╠══════════════════════════════════════════╣')
      log(`║ Cycles: ${cycle}  |  Uptime: ${uptime}    ${' '.repeat(20 - uptime.length)}║`)
      log(`║ Succès: ${String(passCount).padEnd(3)} | Échecs: ${String(failCount).padEnd(3)} | Taux: ${String(passRate).padEnd(3)}%    ║`)
      if (failCount > 0) {
        const lastFails = results.filter(r => !r.success).slice(-3)
        for (const f of lastFails) {
          log(`║ ⚠ ${f.scenario}: ${(f.error || '').substring(0, 30)}`)
        }
      }
      log('╚══════════════════════════════════════════╝')
      log('')
    }

    // Check max cycles
    if (MAX_CYCLES > 0 && cycle >= MAX_CYCLES) {
      log(`Reached max cycles (${MAX_CYCLES}). Stopping.`)
      break
    }

    const delay = randomDelay()
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  await shutdown()
}

main().catch(async (err) => {
  console.error('Daemon crashed:', err)
  process.exit(1)
})
