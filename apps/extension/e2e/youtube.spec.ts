import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const YOUTUBE = 'https://www.youtube.com';
/** The default wait before Continue unlocks, plus some slack. */
const WAIT = 20_000;

/** Finds a Short in search results. Its shelf is hidden, but the links are still in the page. */
async function findShortId(page: Page): Promise<string> {
  await page.goto(`${YOUTUBE}/results?search_query=minecraft+shorts`);
  const link = page.locator('a[href^="/shorts/"]').first();
  await expect(link).toBeAttached();
  const href = await link.getAttribute('href');
  return href!.split('/')[2]!.split('?')[0]!;
}

/** A channel's own Shorts tab, which stays: opening one of its Shorts is a choice. */
const CHANNEL_SHORTS = `${YOUTUBE}/@YouTube/shorts`;

/** Opens a Short in the page, the way you'd choose to now that the menu has no Shorts tab. */
async function openShortFromChannel(page: Page) {
  await page.goto(CHANNEL_SHORTS);
  await page.locator('a[href^="/shorts/"]').first().click();
}

/** Turns on removal for the home feed. Tightening applies right away. */
async function removeHomeFeed(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  const remove = page
    .getByRole('group', { name: 'Home feed' })
    .getByRole('button', { name: 'Remove' });
  await remove.click();
  await expect(remove).toHaveAttribute('aria-pressed', 'true');
}

test('leaves the home feed alone by default', async ({ page }) => {
  await page.goto(`${YOUTUBE}/`);
  const grid = page.locator('ytd-browse[page-subtype="home"] ytd-rich-grid-renderer');
  await expect(grid).toBeAttached();
  await expect(grid).not.toHaveCSS('display', 'none');
  await expect(page.locator('auctor-panel')).toHaveCount(0);
});

test('replaces the home feed with shortcuts when set to Remove', async ({ page, extensionId }) => {
  await removeHomeFeed(page, extensionId);
  await page.goto(`${YOUTUBE}/`);
  const panel = page.locator('auctor-panel');
  await expect(panel.getByText('Auctor removed the YouTube home feed.')).toBeVisible();
  await expect(panel.getByRole('link', { name: 'Subscriptions' })).toBeVisible();
  await expect(panel.getByRole('searchbox')).toBeVisible();
  await expect(page.locator('ytd-browse[page-subtype="home"] ytd-rich-grid-renderer')).toBeHidden();
});

test('shows a removed home feed only after the prompt', async ({ page, extensionId }) => {
  await removeHomeFeed(page, extensionId);
  await page.goto(`${YOUTUBE}/`);
  const panel = page.locator('auctor-panel');
  const gate = page.locator('auctor-gate');
  const grid = page.locator('ytd-browse[page-subtype="home"] ytd-rich-grid-renderer');

  await panel.getByRole('button', { name: 'Show recommendations anyway' }).click();
  await expect(gate.getByRole('heading')).toHaveText('Why are you opening the YouTube home feed?');
  await gate.getByRole('button', { name: 'Go back' }).click();
  await expect(gate).toHaveCount(0);
  await expect(panel).toBeVisible();
  await expect(page).toHaveURL(`${YOUTUBE}/`);

  await panel.getByRole('button', { name: 'Show recommendations anyway' }).click();
  await gate.getByRole('button', { name: 'Continue for 5 min' }).click({ timeout: WAIT });
  await expect(gate).toHaveCount(0);
  await expect(panel).toHaveCount(0);
  // Signed out, the grid can be empty, so check it's no longer hidden rather than visible.
  await expect(grid).not.toHaveCSS('display', 'none');
});

test('hides Shorts shelves in search results', async ({ page }) => {
  await page.goto(`${YOUTUBE}/results?search_query=minecraft+shorts`);
  await expect(page.locator('ytd-video-renderer').first()).toBeVisible();
  const shelves = page.locator('grid-shelf-view-model:has(ytm-shorts-lockup-view-model)');
  await expect(shelves.first()).toBeAttached();
  for (const shelf of await shelves.all()) await expect(shelf).toBeHidden();
});

test('opens a shared Short as a normal video', async ({ page }) => {
  const id = await findShortId(page);
  await page.goto(`${YOUTUBE}/shorts/${id}`);
  await expect(page).toHaveURL(`${YOUTUBE}/watch?v=${id}`);
});

test('hides the Shorts tab in the menu and the mini menu', async ({ page }) => {
  await page.goto(`${YOUTUBE}/`);
  const entry = page.locator('ytd-guide-entry-renderer:has(> a#endpoint[title="Shorts"])');
  await expect(entry).toBeAttached();
  await expect(entry).toBeHidden();
  await expect(page.locator('ytd-guide-entry-renderer a#endpoint[title="Home"]')).toBeVisible();

  // Narrower windows swap the menu for the mini menu.
  await page.setViewportSize({ width: 1000, height: 900 });
  const mini = page.locator('ytd-mini-guide-entry-renderer:has(> a[href^="/shorts"])');
  await expect(mini).toBeAttached();
  await expect(mini).toBeHidden();
  await expect(page.locator('ytd-mini-guide-entry-renderer a[title="Home"]')).toBeVisible();
});

test('asks before opening a Short, and Go back returns', async ({ page }) => {
  await openShortFromChannel(page);

  const gate = page.locator('auctor-gate');
  await expect(gate.getByRole('heading')).toHaveText('Why are you opening YouTube Shorts?');
  await expect(gate.getByRole('button', { name: 'Continue in 15…' })).toBeDisabled();
  await expect(gate.getByRole('button', { name: 'Go back' })).toBeFocused();

  await gate.getByRole('button', { name: 'Go back' }).click();
  await expect(gate).toHaveCount(0);
  await expect(page).toHaveURL(CHANNEL_SHORTS);
});

test('opens a Short after the wait', async ({ page }) => {
  await openShortFromChannel(page);

  const gate = page.locator('auctor-gate');
  const proceed = gate.getByRole('button', { name: 'Continue for 5 min' });
  await expect(proceed).toBeEnabled({ timeout: WAIT });
  await proceed.click();
  await expect(gate).toHaveCount(0);
  await expect(page).toHaveURL(/\/shorts\//);
  await expect(page.locator('ytd-shorts')).toBeVisible();
});

test('hides Up next on video pages', async ({ page }) => {
  await page.goto(`${YOUTUBE}/results?search_query=minecraft`);
  const href = await page
    .locator('ytd-video-renderer a#thumbnail[href^="/watch"]')
    .first()
    .getAttribute('href');
  await page.goto(`${YOUTUBE}${href}`);
  await expect(page.locator('ytd-watch-flexy')).toBeAttached();
  for (const related of await page.locator('ytd-watch-flexy #related').all()) {
    await expect(related).toBeHidden();
  }
});

test('settings delay loosening and apply tightening right away', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/options.html`);

  const shorts = page.getByRole('group', { name: 'Shorts' });
  const shortsRemove = shorts.getByRole('button', { name: 'Remove' });
  await expect(shortsRemove).toHaveAttribute('aria-pressed', 'true');
  await shorts.getByRole('button', { name: 'Off' }).click();
  await expect(page.getByText(/Turns Off on/)).toBeVisible();
  await expect(shortsRemove).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText(/Turns Off on/)).toHaveCount(0);

  await page.getByRole('tab', { name: 'General' }).click();
  const wait = page.getByLabel('Wait before Continue');
  await expect(wait).toHaveValue('15');
  await wait.selectOption('30');
  await expect(wait).toHaveValue('30');
  await expect(page.getByText(/Changes to/)).toHaveCount(0);

  await wait.selectOption('3');
  await expect(page.getByText(/Changes to 3 seconds on/)).toBeVisible();
  await expect(wait).toHaveValue('30');
});
