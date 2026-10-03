import { defineConfig } from '@playwright/test';

// End-to-end tests run the built extension (`pnpm build`) against the live sites, so they
// catch site redesigns. They need a network connection and aren't part of CI.
export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: [['list']],
  use: { trace: 'retain-on-failure' },
});
