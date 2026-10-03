import { POST_MINUTES, postFor } from '@/catalog/posts';
import type { SurfaceId } from '@/catalog/surfaces';
import facebook from '@/sites/facebook';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createReplacements } from './replacement';
import type { ShownReplacement } from './replacement';

const feed: ShownReplacement[] = [
  { surface: 'facebook.feed', replacement: facebook.surfaces['facebook.feed']!.replacement! },
];
const NOW = new Date(Date.UTC(2026, 9, 3, 14, 10));

describe('the Facebook feed panel', () => {
  let replacements: ReturnType<typeof createReplacements> | undefined;
  beforeEach(() => {
    // The feed's section, cut down to its structure on the live site on 2026-10-03.
    document.body.innerHTML = `
      <div role="main"><div>
        <h3>Feed posts</h3><div aria-hidden="true"></div><div></div>
      </div></div>`;
  });
  afterEach(() => replacements?.remove());

  const panel = () => document.querySelector('auctor-panel')!.shadowRoot!;

  it('leaves the way back to the feed as the only thing to click', () => {
    const asked: SurfaceId[] = [];
    replacements = createReplacements((id) => asked.push(id));
    replacements.set(feed, NOW);

    const clickable = [
      ...panel().querySelectorAll<HTMLElement>('a, button, input, [role="button"]'),
    ];
    expect(clickable.map((element) => element.textContent)).toEqual([postFor(NOW).giveIn.label]);
    expect(clickable[0]!.title).toBe('Show the feed anyway');

    clickable[0]!.click();
    expect(asked).toEqual(['facebook.feed']);
  });

  it('turns to the next post when it is up', () => {
    replacements = createReplacements(() => {});
    const quote = () => panel().querySelector('blockquote p')!.textContent;

    replacements.set(feed, NOW);
    expect(quote()).toBe(postFor(NOW).quote.text);

    replacements.set(feed, new Date(NOW.getTime() + 60_000));
    expect(quote()).toBe(postFor(NOW).quote.text);

    const next = new Date(NOW.getTime() + POST_MINUTES * 60_000);
    replacements.set(feed, next);
    expect(quote()).toBe(postFor(next).quote.text);
    expect(document.querySelectorAll('auctor-panel')).toHaveLength(1);
  });
});
