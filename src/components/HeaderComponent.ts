import type { Locator, Page } from '@playwright/test';

export class HeaderComponent {
  readonly name = 'Header';
  readonly loggedInAs: Locator;
  readonly loggedInUserName: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;

  constructor(page: Page) {
    const nav = "//ul[contains(@class,'navbar-nav')]";
    this.loggedInAs = page.locator(`xpath=${nav}//a[contains(normalize-space(.),'Logged in as')]`);
    this.loggedInUserName = page.locator(`xpath=${nav}//a[contains(normalize-space(.),'Logged in as')]/b`);
    this.logoutLink = page.locator(`xpath=${nav}//a[@href='/logout']`);
    this.deleteAccountLink = page.locator(`xpath=${nav}//a[@href='/delete_account']`);
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async deleteAccount(): Promise<void> {
    await this.deleteAccountLink.click();
  }
}
