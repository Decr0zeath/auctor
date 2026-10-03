import { postFor } from '@/catalog/posts';
import type { SurfaceId } from '@/catalog/surfaces';
import facebook from '@/sites/facebook';
import { afterEach, describe, expect, it } from 'vitest';
import { createReplacements } from './replacement';

describe('the Facebook feed panel', () => {
  let replacements: ReturnType<typeof createReplacements> | undefined;
  afterEach(() => replacements?.remove());

  it('leaves the way back to the feed as the only thing to click', () => {
    // The feed's section, cut down to its structure on the live site on 2026-10-03.
    document.body.innerHTML = `
      <div role="main"><div>
        <h3>Feed posts</h3><div aria-hidden="true"></div><div></div>
      </div></div>`;
    const asked: SurfaceId[] = [];
    replacements = createReplacements((id) => asked.push(id));
    const replacement = facebook.surfaces['facebook.feed']!.replacement!;
    replacements.set([{ surface: 'facebook.feed', replacement }]);

    const root = document.querySelector('auctor-panel')!.shadowRoot!;
    const clickable = [...root.querySelectorAll<HTMLElement>('a, button, input, [role="button"]')];
    expect(clickable.map((element) => element.textContent)).toEqual([
      postFor(new Date()).giveIn.label,
    ]);
    expect(clickable[0]!.title).toBe('Show the feed anyway');

    clickable[0]!.click();
    expect(asked).toEqual(['facebook.feed']);
  });
});
