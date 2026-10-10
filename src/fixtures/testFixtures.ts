import { test as base, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { HeaderComponent } from '../components/HeaderComponent';
import { env } from '../config/env';
import { StepRunner } from '../core/stepRunner';
import { AccountInformationPage } from '../pages/AccountInformationPage';
import { AccountStatusPage } from '../pages/AccountStatusPage';
import { AuthPage } from '../pages/AuthPage';
import { AccountApiService } from '../services/accountApiService';
import type { TestCaseMeta, UserAccount } from '../types';
import { blockThirdPartyAds } from '../utils/adBlocker';
import { buildUser } from '../utils/dataFactory';
import { findTestCase } from '../../test-data/test-cases';

interface Fixtures {
  testCase: TestCaseMeta;
  steps: StepRunner;
  authPage: AuthPage;
  accountInfoPage: AccountInformationPage;
  accountStatusPage: AccountStatusPage;
  header: HeaderComponent;
  accountApi: AccountApiService;
  registeredUser: UserAccount;
  newUser: UserAccount;
}

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    if (env.blockAds) await blockThirdPartyAds(page);
    await use(page);
  },

  testCase: [
    async ({ browserName }, use, testInfo) => {
      const meta = findTestCase(testInfo.title);
      if (!meta) throw new Error(`Test "${testInfo.title}" must start with an ID listed in test-data/test-cases.ts`);

      await allure.displayName(`${meta.id} - ${meta.title}`);
      await allure.epic('AutomationExercise');
      await allure.feature(meta.module);
      await allure.story(`${meta.type} - ${meta.title}`);
      await allure.parentSuite('AutomationExercise');
      await allure.suite(`Browser: ${browserName.charAt(0).toUpperCase()}${browserName.slice(1)}`);
      await allure.subSuite(meta.module);
      await allure.severity(meta.severity);
      await allure.tags(...meta.tags.map((tag) => tag.replace('@', '')));
      await allure.label('testCaseId', meta.id);
      await allure.description(
        [
          `**Test case:** ${meta.id} - ${meta.title}`,
          `**Business objective:** ${meta.objective}`,
          `**Precondition:** ${meta.precondition}`,
          `**Expected result:** ${meta.expected}`,
        ].join('\n\n'),
      );
      await allure.parameter('Browser', browserName, { excluded: true });
      await allure.parameter('Environment', env.testEnv, { excluded: true });
      await allure.parameter('Attempt', `${testInfo.retry + 1} of ${testInfo.project.retries + 1}`, { excluded: true });
      await use(meta);
    },
    { auto: true },
  ],

  steps: async ({ page, testCase }, use, testInfo) => {
    const runner = new StepRunner(page, testInfo, testCase.id);
    runner.log('info', `Test started: ${testInfo.title} (attempt ${testInfo.retry + 1})`);
    await use(runner);
    await runner.finalize();
  },

  authPage: async ({ page }, use) => use(new AuthPage(page)),
  accountInfoPage: async ({ page }, use) => use(new AccountInformationPage(page)),
  accountStatusPage: async ({ page }, use) => use(new AccountStatusPage(page)),
  header: async ({ page }, use) => use(new HeaderComponent(page)),
  accountApi: async ({ request }, use) => use(new AccountApiService(request)),

  registeredUser: async ({ accountApi, steps }, use) => {
    const user = buildUser();
    await steps.housekeeping(`Precondition: create test user via API (${user.email})`, () =>
      accountApi.createAccount(user),
    );
    await use(user);
    await removeAccount(steps, accountApi, user);
  },

  newUser: async ({ accountApi, steps }, use) => {
    const user = buildUser();
    steps.log('info', `Generated unregistered test user ${user.email}`);
    await use(user);
    await removeAccount(steps, accountApi, user);
  },
});

async function removeAccount(steps: StepRunner, api: AccountApiService, user: UserAccount): Promise<void> {
  try {
    await steps.housekeeping(`Cleanup: delete test user via API (${user.email})`, async () => {
      const deleted = await api.deleteAccount(user.email, user.password);
      steps.log('info', deleted ? `Deleted ${user.email}` : `No account left to delete for ${user.email}`);
    });
  } catch (error) {
    steps.log('warn', `Cleanup failed for ${user.email}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export { expect };
