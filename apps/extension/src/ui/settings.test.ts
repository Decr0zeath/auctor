import { surface, surfacesOf } from '@/catalog/surfaces';
import type { SiteId } from '@/catalog/surfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { mountSettings } from './settings';

async function mount(full = false) {
  const root = document.createElement('main');
  document.body.replaceChildren(root);
  await mountSettings(root, { full });
  return root;
}

const buttonIn = (parent: Element, name: string) =>
  [...parent.querySelectorAll('button')].find((button) => button.textContent?.startsWith(name))!;

const tab = (root: HTMLElement, name: string) => buttonIn(root.querySelector('.tabs')!, name);
const group = (root: HTMLElement, label: string) =>
  root.querySelector(`[role="group"][aria-label="${label}"]`)!;

const rowNames = (root: HTMLElement) =>
  [...root.querySelectorAll('.panel .name')].map((name) => name.textContent);
const labelsOf = (site: SiteId) => surfacesOf(site).map((id) => surface(id).label);

beforeEach(() => {
  fakeBrowser.reset();
  localStorage.clear();
});

describe('settings screen', () => {
  it('opens on the first site, with one row per surface', async () => {
    const root = await mount();
    expect(tab(root, 'YouTube').getAttribute('aria-selected')).toBe('true');
    expect(rowNames(root)).toEqual(labelsOf('youtube'));
  });

  it('switches sites, and reopens on the last one', async () => {
    let root = await mount();
    tab(root, 'Facebook').click();
    expect(rowNames(root)).toEqual(labelsOf('facebook'));

    root = await mount();
    expect(tab(root, 'Facebook').getAttribute('aria-selected')).toBe('true');
  });

  it('moves between tabs with the arrow keys', async () => {
    const root = await mount();
    root
      .querySelector('[role="tablist"]')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(tab(root, 'General').getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tab(root, 'General'));
  });

  it('shows a loosening change as waiting, on its row and its tab', async () => {
    const root = await mount();
    buttonIn(group(root, 'Shorts'), 'Off').click();

    await vi.waitFor(() =>
      expect(root.querySelector('.pending')?.textContent).toMatch(/^Turns Off on/),
    );
    expect(buttonIn(group(root, 'Shorts'), 'Remove').getAttribute('aria-pressed')).toBe('true');
    expect(buttonIn(group(root, 'Shorts'), 'Off').classList.contains('queued')).toBe(true);
    expect(tab(root, 'YouTube').querySelector('.dot')).not.toBeNull();
    expect(tab(root, 'Facebook').querySelector('.dot')).toBeNull();
  });

  it('keeps the pause and backup under General', async () => {
    const popup = await mount();
    tab(popup, 'General').click();
    expect(popup.querySelector('select#waitSeconds')).not.toBeNull();
    expect(popup.querySelector('.link')?.textContent).toBe('Export or import settings');

    const options = await mount(true);
    expect(options.querySelector('.buttons')?.textContent).toContain('Export settings');
  });
});
