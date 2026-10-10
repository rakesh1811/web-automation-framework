import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccountStatusPage extends BasePage {
  readonly accountCreatedHeading: Locator;
  readonly accountDeletedHeading: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page, '/account_created', 'Account status page');
    this.accountCreatedHeading = page.locator("xpath=//h2[@data-qa='account-created']");
    this.accountDeletedHeading = page.locator("xpath=//h2[@data-qa='account-deleted']");
    this.continueButton = page.locator("xpath=//a[@data-qa='continue-button']");
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }
}
