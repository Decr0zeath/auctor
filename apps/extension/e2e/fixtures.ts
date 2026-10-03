import { test as base, chromium } from '@playwright/test';
import type { BrowserContext } from '@playwright/test';
import path from 'node:path';

const extensionPath = path.resolve(import.meta.dirname, '../.output/chrome-mv3');

export const test = base.extend<{ context: BrowserContext; extensionId: string }>({
  // eslint-disable-next-line no-empty-pattern -- Playwright fixtures must destructure their dependencies.
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      // The full Chromium build supports extensions in headless mode.
      channel: 'chromium',
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
      viewport: { width: 1400, height: 900 },
      locale: 'en-US',
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // The extension has no service worker to read its ID from, so ask the extensions page.
    const page = await context.newPage();
    await page.goto('chrome://extensions');
    const id = await page.locator('extensions-item').first().getAttribute('id');
    await page.close();
    if (!id) throw new Error('The extension did not load. Run `pnpm build` first.');
    await use(id);
  },
});

export const expect = test.expect;
