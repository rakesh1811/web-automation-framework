import type { Locator } from '@playwright/test';

export async function fillSecret(field: Locator, value: string): Promise<void> {
  await field.evaluate((element, secret) => {
    const input = element as HTMLInputElement;
    input.focus();
    input.value = secret;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}
