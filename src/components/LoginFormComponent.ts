import type { Locator, Page } from '@playwright/test';
import { fillSecret } from '../utils/secureInput';

export class LoginFormComponent {
  readonly name = 'Login form';
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    const form = "//form[@action='/login']";
    this.heading = page.locator(`xpath=${form}/parent::*/h2`);
    this.emailInput = page.locator(`xpath=${form}//input[@data-qa='login-email']`);
    this.passwordInput = page.locator(`xpath=${form}//input[@data-qa='login-password']`);
    this.loginButton = page.locator(`xpath=${form}//button[@data-qa='login-button']`);
    this.errorMessage = page.locator(`xpath=${form}//p`);
  }

  async fill(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await fillSecret(this.passwordInput, password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }
}
