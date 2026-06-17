import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e/scenarios',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 1,
  reporter: [['list'], ['json', { outputFile: 'tests/e2e/results.json' }]],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
