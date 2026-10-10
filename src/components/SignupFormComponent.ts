import type { Locator, Page } from '@playwright/test';

export class SignupFormComponent {
  readonly name = 'Signup form';
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly signupButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    const form = "//form[@action='/signup']";
    this.heading = page.locator(`xpath=${form}/parent::*/h2`);
    this.nameInput = page.locator(`xpath=${form}//input[@data-qa='signup-name']`);
    this.emailInput = page.locator(`xpath=${form}//input[@data-qa='signup-email']`);
    this.signupButton = page.locator(`xpath=${form}//button[@data-qa='signup-button']`);
    this.errorMessage = page.locator(`xpath=${form}//p`);
  }

  async fill(name: string, email: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
  }

  async submit(): Promise<void> {
    await this.signupButton.click();
  }
}
