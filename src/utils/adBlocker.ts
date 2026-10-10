import type { Page } from '@playwright/test';

const AD_HOST_PATTERN =
  /(googlesyndication|doubleclick|googleadservices|adservice\.google|fundingchoicesmessages|googletagservices|google-analytics|googletagmanager)\./i;

export async function blockThirdPartyAds(page: Page): Promise<void> {
  await page.route(AD_HOST_PATTERN, (route) => route.abort());
}
