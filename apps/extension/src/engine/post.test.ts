import { PAINTINGS, postFor } from '@/catalog/posts';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderPost } from './post';

const publicDir = resolve(import.meta.dirname, '../../public');

describe('the post', () => {
  it('ships an image for every painting, and no others', () => {
    const files = readdirSync(resolve(publicDir, 'posts')).toSorted();
    expect(files).toEqual(PAINTINGS.map((painting) => `${painting.id}.webp`).toSorted());
  });

  it('ships its fonts', () => {
    expect(readdirSync(resolve(publicDir, 'fonts'))).toEqual(
      expect.arrayContaining(['cinzel.woff2', 'cormorant-garamond.woff2']),
    );
  });

  it('shows the quote over its painting', () => {
    const date = new Date(2026, 9, 3);
    const { quote, painting } = postFor(date);
    const post = renderPost(postFor(date));
    renderPost(postFor(date));

    expect(post.querySelector('blockquote p')?.textContent).toBe(quote.text);
    expect(post.querySelector('cite')?.textContent).toBe(quote.by);
    expect(post.querySelector('img')?.getAttribute('src')).toMatch(
      new RegExp(`/posts/${painting.id}\\.webp$`),
    );
    expect(post.querySelector('figcaption')?.textContent).toContain(painting.title);
    // The fonts are declared on the page once, however many posts are drawn.
    expect(document.querySelectorAll('style[data-auctor="fonts"]')).toHaveLength(1);
  });
});
