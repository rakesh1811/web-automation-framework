import type { Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(
    protected readonly page: Page,
    readonly path: string,
    readonly name: string,
  ) {}

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  currentPath(): string {
    return new URL(this.page.url()).pathname;
  }
}
