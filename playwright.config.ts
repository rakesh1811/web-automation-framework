import os from 'os';
import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';
import { paths } from './src/config/paths';

const browserDevice = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
}[env.browser];

export default defineConfig({
  testDir: './tests',
  outputDir: paths.testResults,
  timeout: env.testTimeout,
  expect: { timeout: env.expectTimeout },
  fullyParallel: true,
  workers: env.workers,
  forbidOnly: env.isCi,
  retries: 2,
  reporter: [
    ['list'],
    ['html', { outputFolder: paths.playwrightReport, open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: paths.allureResults,
        suiteTitle: true,
        environmentInfo: {
          Environment: env.testEnv,
          'Base URL': env.baseUrl,
          Browser: env.browser,
          Headless: String(env.headless),
          Workers: String(env.workers),
          Retries: '2',
          'Node.js': process.version,
          OS: `${os.type()} ${os.release()}`,
        },
      },
    ],
  ],
  use: {
    baseURL: env.baseUrl,
    headless: env.headless,
    actionTimeout: env.actionTimeout,
    navigationTimeout: env.navigationTimeout,
    screenshot: { mode: 'only-on-failure', fullPage: true },
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: env.browser, use: { ...browserDevice } }],
});
