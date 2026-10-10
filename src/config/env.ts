import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

function readString(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes'].includes(value);
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive number, received "${raw}"`);
  }
  return parsed;
}

function readBrowser(): BrowserName {
  const value = readString('BROWSER', 'chromium');
  if (value !== 'chromium' && value !== 'firefox' && value !== 'webkit') {
    throw new Error(`BROWSER must be chromium, firefox or webkit, received "${value}"`);
  }
  return value;
}

const baseUrl = readString('BASE_URL', 'https://automationexercise.com').replace(/\/+$/, '');

export const env = Object.freeze({
  testEnv: readString('TEST_ENV', 'qa'),
  baseUrl,
  apiBaseUrl: readString('API_BASE_URL', `${baseUrl}/api`).replace(/\/+$/, ''),
  browser: readBrowser(),
  headless: readBoolean('HEADLESS', false),
  workers: readNumber('WORKERS', 1),
  testTimeout: readNumber('TEST_TIMEOUT_MS', 90_000),
  expectTimeout: readNumber('EXPECT_TIMEOUT_MS', 10_000),
  actionTimeout: readNumber('ACTION_TIMEOUT_MS', 15_000),
  navigationTimeout: readNumber('NAVIGATION_TIMEOUT_MS', 30_000),
  logLevel: readString('LOG_LEVEL', 'info'),
  stepScreenshots: readBoolean('STEP_SCREENSHOTS', true),
  blockAds: readBoolean('BLOCK_ADS', true),
  isCi: readBoolean('CI', false),
});
